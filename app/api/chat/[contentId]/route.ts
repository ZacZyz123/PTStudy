import { NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { getAnthropic, CLAUDE_MODEL, chatSystemPrompt } from '@/lib/anthropic'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { ChatMessage, Content } from '@/types/database'

export const maxDuration = 120

/** Streams a Flex (Claude) reply as plain text chunks and persists the turn. */
export async function POST(request: Request, { params }: { params: { contentId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const userMessage = body.message?.trim()
  if (!userMessage) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: content } = await admin
    .from('content')
    .select('*')
    .eq('id', params.contentId)
    .single<Content>()

  if (!content?.raw_text || !content.is_published) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  // Last 20 turns of history for continuity
  const { data: historyRows } = await admin
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .eq('content_id', params.contentId)
    .order('created_at', { ascending: false })
    .limit(20)

  const history = (((historyRows as ChatMessage[]) ?? []).reverse()).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.message,
  }))

  await admin.from('chat_messages').insert({
    user_id: user.id,
    content_id: params.contentId,
    role: 'user',
    message: userMessage,
  })

  const messages: Anthropic.MessageParam[] = [...history, { role: 'user', content: userMessage }]

  const claudeStream = getAnthropic().messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: chatSystemPrompt(content.topic, content.raw_text.slice(0, 100_000)),
    messages,
  })

  const encoder = new TextEncoder()
  let fullText = ''

  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      claudeStream.on('text', (delta) => {
        fullText += delta
        controller.enqueue(encoder.encode(delta))
      })
      claudeStream.on('error', (err) => {
        console.error('Chat stream error:', err)
        controller.error(err)
      })
      claudeStream.on('end', async () => {
        try {
          await admin.from('chat_messages').insert({
            user_id: user.id,
            content_id: params.contentId,
            role: 'assistant',
            message: fullText,
          })
        } catch (err) {
          console.error('Failed to persist assistant message:', err)
        }
        controller.close()
      })
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
