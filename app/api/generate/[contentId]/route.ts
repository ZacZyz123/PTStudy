import { NextResponse } from 'next/server'
import {
  CLAUDE_MODEL,
  completeWithRetry,
  isOverloadError,
  studyGuidePrompt,
  flashcardsPrompt,
  quizPrompt,
  parseJsonArray,
} from '@/lib/anthropic'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Content } from '@/types/database'

export const maxDuration = 300

interface FlashcardJson {
  front: string
  back: string
}

interface QuizJson {
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation: string
}

async function requireAdmin(): Promise<boolean> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()
  return profile?.role === 'admin'
}

function complete(prompt: string): Promise<string> {
  return completeWithRetry({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
  })
}

/**
 * Generates study guide + flashcards + quiz for a content item.
 * Body: { kinds?: ('guide' | 'flashcards' | 'quiz')[] } — defaults to all.
 */
export async function POST(request: Request, { params }: { params: { contentId: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: content } = await admin
    .from('content')
    .select('*')
    .eq('id', params.contentId)
    .single<Content>()

  if (!content?.raw_text) {
    return NextResponse.json({ error: 'Content not found or has no text' }, { status: 404 })
  }

  let kinds: string[] = ['guide', 'flashcards', 'quiz']
  try {
    const body: { kinds?: string[] } = await request.json()
    if (Array.isArray(body.kinds) && body.kinds.length > 0) kinds = body.kinds
  } catch {
    // no body — generate everything
  }

  const rawText = content.raw_text.slice(0, 150_000)
  const results: Record<string, string> = {}

  try {
    if (kinds.includes('guide')) {
      const guideText = await complete(studyGuidePrompt(rawText))
      await admin.from('study_guides').delete().eq('content_id', content.id)
      const { error } = await admin
        .from('study_guides')
        .insert({ content_id: content.id, guide_text: guideText })
      results.guide = error ? `error: ${error.message}` : 'ok'
    }

    if (kinds.includes('flashcards')) {
      const cardsText = await complete(flashcardsPrompt(rawText))
      const cards = parseJsonArray<FlashcardJson>(cardsText)
        .filter((c) => c.front && c.back)
        .map((c) => ({ content_id: content.id, front: String(c.front), back: String(c.back) }))
      await admin.from('flashcards').delete().eq('content_id', content.id)
      const { error } = await admin.from('flashcards').insert(cards)
      results.flashcards = error ? `error: ${error.message}` : `ok (${cards.length})`
    }

    if (kinds.includes('quiz')) {
      const quizText = await complete(quizPrompt(rawText))
      const questions = parseJsonArray<QuizJson>(quizText)
        .filter((q) => q.question && q.correct_answer)
        .map((q) => ({
          content_id: content.id,
          question: String(q.question),
          option_a: String(q.option_a),
          option_b: String(q.option_b),
          option_c: String(q.option_c),
          option_d: String(q.option_d),
          correct_answer: String(q.correct_answer).trim().toUpperCase().slice(0, 1),
          explanation: q.explanation ? String(q.explanation) : null,
        }))
      await admin.from('quiz_questions').delete().eq('content_id', content.id)
      const { error } = await admin.from('quiz_questions').insert(questions)
      results.quiz = error ? `error: ${error.message}` : `ok (${questions.length})`
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Generation error:', err)
    if (isOverloadError(err)) {
      return NextResponse.json(
        { error: 'Flex is overloaded right now — please try again in a moment.', results },
        { status: 503 }
      )
    }
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message, results }, { status: 500 })
  }
}
