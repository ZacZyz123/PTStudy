import { notFound, redirect } from 'next/navigation'
import ChallengeArena from '@/components/student/ChallengeArena'
import { createClient } from '@/lib/supabase/server'
import type { ChallengeWithRelations, QuizQuestion } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function ChallengeArenaPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: challenge } = await supabase
    .from('challenges')
    .select(
      '*, challenger:profiles!challenges_challenger_id_fkey(*), challenged:profiles!challenges_challenged_id_fkey(*), content:content(*)'
    )
    .eq('id', params.id)
    .single<ChallengeWithRelations>()

  if (!challenge) notFound()
  if (challenge.challenger_id !== user.id && challenge.challenged_id !== user.id) {
    redirect('/challenge')
  }
  if (challenge.status === 'declined' || challenge.status === 'expired') {
    redirect('/challenge')
  }

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('content_id', challenge.content_id)
    .order('created_at')

  const questionList = (questions as QuizQuestion[]) ?? []
  if (questionList.length === 0) redirect('/challenge')

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold">
        ⚔️ {challenge.content?.title}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        20 seconds per question — no pressure 😉
      </p>
      <div className="mt-6">
        <ChallengeArena challenge={challenge} questions={questionList} userId={user.id} />
      </div>
    </div>
  )
}
