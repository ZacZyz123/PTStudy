import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { XP_REWARDS } from '@/lib/xp'
import { checkProgressBadges } from '@/lib/badges'
import type { Challenge, QuizQuestion } from '@/types/database'

interface SubmitBody {
  answers?: Record<string, string>
}

async function addXp(userId: string, amount: number) {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('xp')
    .eq('id', userId)
    .single<{ xp: number }>()
  if (profile) {
    await admin.from('profiles').update({ xp: profile.xp + amount }).eq('id', userId)
  }
}

/**
 * Submits one side's answers for a challenge. Grades server-side;
 * when both sides have submitted, decides the winner and awards XP.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
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
  if (!body.answers) {
    return NextResponse.json({ error: 'answers required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: challenge } = await admin
    .from('challenges')
    .select('*')
    .eq('id', params.id)
    .single<Challenge>()

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  const isChallenger = challenge.challenger_id === user.id
  const isChallenged = challenge.challenged_id === user.id
  if (!isChallenger && !isChallenged) {
    return NextResponse.json({ error: 'Not your challenge' }, { status: 403 })
  }
  if (challenge.status === 'completed' || challenge.status === 'declined') {
    return NextResponse.json({ error: 'Challenge already finished' }, { status: 409 })
  }

  const myExistingScore = isChallenger ? challenge.challenger_score : challenge.challenged_score
  if (myExistingScore !== null) {
    return NextResponse.json({ error: 'You already submitted' }, { status: 409 })
  }

  const { data: questions } = await admin
    .from('quiz_questions')
    .select('*')
    .eq('content_id', challenge.content_id)

  const questionList = (questions as QuizQuestion[]) ?? []
  const score = questionList.filter(
    (q) => body.answers![q.id]?.toUpperCase() === q.correct_answer.toUpperCase()
  ).length

  const scoreField = isChallenger ? 'challenger_score' : 'challenged_score'
  const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score

  if (otherScore === null) {
    // First submitter — record score, mark in progress
    await admin
      .from('challenges')
      .update({ [scoreField]: score, status: 'in_progress' })
      .eq('id', params.id)
    return NextResponse.json({ score, total: questionList.length, finished: false })
  }

  // Second submitter — decide the winner
  const challengerScore = isChallenger ? score : (challenge.challenger_score as number)
  const challengedScore = isChallenged ? score : (challenge.challenged_score as number)

  let winnerId: string | null = null
  if (challengerScore > challengedScore) winnerId = challenge.challenger_id
  else if (challengedScore > challengerScore) winnerId = challenge.challenged_id

  await admin
    .from('challenges')
    .update({ [scoreField]: score, status: 'completed', winner_id: winnerId })
    .eq('id', params.id)

  // XP: winner 100, loser 25; tie → both get the loss consolation
  if (winnerId) {
    const loserId = winnerId === challenge.challenger_id ? challenge.challenged_id : challenge.challenger_id
    await addXp(winnerId, XP_REWARDS.CHALLENGE_WIN)
    await addXp(loserId, XP_REWARDS.CHALLENGE_LOSS)
    await checkProgressBadges(winnerId)
  } else {
    await addXp(challenge.challenger_id, XP_REWARDS.CHALLENGE_LOSS)
    await addXp(challenge.challenged_id, XP_REWARDS.CHALLENGE_LOSS)
  }

  return NextResponse.json({
    score,
    total: questionList.length,
    finished: true,
    winnerId,
    challengerScore,
    challengedScore,
  })
}
