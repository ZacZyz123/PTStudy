import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { XP_REWARDS } from '@/lib/xp'
import { awardBadge, checkProgressBadges } from '@/lib/badges'
import type { QuizQuestion } from '@/types/database'

interface SubmitBody {
  contentId?: string
  answers?: Record<string, string>
}

/** Grades a quiz server-side, records the attempt, and awards XP + badges. */
export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: SubmitBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (!body.contentId || !body.answers) {
    return NextResponse.json({ error: 'contentId and answers required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: questions } = await admin
    .from('quiz_questions')
    .select('*')
    .eq('content_id', body.contentId)

  const questionList = (questions as QuizQuestion[]) ?? []
  if (questionList.length === 0) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const total = questionList.length
  const score = questionList.filter(
    (q) => body.answers![q.id]?.toUpperCase() === q.correct_answer.toUpperCase()
  ).length
  const perfect = score === total

  let xpEarned = score * XP_REWARDS.CORRECT_ANSWER + XP_REWARDS.QUIZ_COMPLETE
  if (perfect) xpEarned += XP_REWARDS.PERFECT_SCORE

  await admin.from('quiz_attempts').insert({
    user_id: user.id,
    content_id: body.contentId,
    score,
    total_questions: total,
    xp_earned: xpEarned,
  })

  const { data: profile } = await admin
    .from('profiles')
    .select('xp')
    .eq('id', user.id)
    .single<{ xp: number }>()
  if (profile) {
    await admin.from('profiles').update({ xp: profile.xp + xpEarned }).eq('id', user.id)
  }

  const newBadges = await checkProgressBadges(user.id)
  if (perfect) {
    const perfectBadge = await awardBadge(user.id, 'Perfect Score')
    if (perfectBadge) newBadges.push(perfectBadge)
  }

  return NextResponse.json({
    score,
    total,
    xpEarned,
    perfect,
    newBadges: newBadges.map((b) => b.name),
  })
}
