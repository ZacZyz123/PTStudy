import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import mammoth from 'mammoth'
// Import the implementation directly — pdf-parse's index.js runs debug code
// when loaded outside its own test harness.
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const maxDuration = 60

async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  return profile?.role === 'admin' ? user : null
}

/** Pull visible text out of a .pptx (slides are XML inside a zip). */
async function extractPptxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer)
  const parser = new XMLParser({ ignoreAttributes: true })
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] ?? '0', 10)
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] ?? '0', 10)
      return numA - numB
    })

  const collectText = (node: unknown, out: string[]): void => {
    if (node == null) return
    if (typeof node === 'string' || typeof node === 'number') return
    if (Array.isArray(node)) {
      node.forEach((child) => collectText(child, out))
      return
    }
    if (typeof node === 'object') {
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (key === 'a:t') {
          if (Array.isArray(value)) {
            value.forEach((v) => out.push(String(v)))
          } else if (value != null) {
            out.push(String(value))
          }
        } else {
          collectText(value, out)
        }
      }
    }
  }

  const slideTexts: string[] = []
  for (const name of slideNames) {
    const xml = await zip.files[name].async('text')
    const parsed: unknown = parser.parse(xml)
    const texts: string[] = []
    collectText(parsed, texts)
    if (texts.length > 0) {
      slideTexts.push(`--- Slide ${slideNames.indexOf(name) + 1} ---\n${texts.join('\n')}`)
    }
  }
  return slideTexts.join('\n\n')
}

async function extractText(file: File, buffer: Buffer): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) {
    const result = await pdfParse(buffer)
    return result.text
  }
  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }
  if (name.endsWith('.pptx')) {
    return extractPptxText(buffer)
  }
  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return buffer.toString('utf-8')
  }
  throw new Error(`Unsupported file type: ${file.name}`)
}

export async function POST(request: Request) {
  const user = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = String(formData.get('title') ?? '').trim()
    const className = String(formData.get('class_name') ?? '').trim()
    const topic = String(formData.get('topic') ?? '').trim()
    const isExamPriority = formData.get('is_exam_priority') === 'true'

    if (!file || !title || !className || !topic) {
      return NextResponse.json(
        { error: 'file, title, class_name, and topic are required' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const rawText = (await extractText(file, buffer)).trim()
    if (!rawText) {
      return NextResponse.json(
        { error: 'Could not extract any text from this file' },
        { status: 422 }
      )
    }

    const admin = createAdminClient()

    // Store the original file
    const storagePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error: storageError } = await admin.storage
      .from('lecture-files')
      .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream' })

    if (storageError) {
      console.error('Storage upload failed:', storageError)
    }

    const { data: content, error: insertError } = await admin
      .from('content')
      .insert({
        title,
        class_name: className,
        topic,
        file_url: storageError ? null : storagePath,
        file_type: file.name.split('.').pop()?.toLowerCase() ?? null,
        raw_text: rawText,
        is_exam_priority: isExamPriority,
        is_published: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Content insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
    }

    return NextResponse.json({ content })
  } catch (err) {
    console.error('Upload error:', err)
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
