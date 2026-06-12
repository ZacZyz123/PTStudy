import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconArrowLeft } from '@tabler/icons-react'
import QuizRunner from '@/components/student/QuizRunner'
import EmptyState from '@/components/student/EmptyState'
import { createClient } from '@/lib/supabase/server'
import type { Content, QuizQuestion } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function QuizPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: content }, { data: questions }] = await Promise.all([
    supabase.from('content').select('*').eq('id', params.id).single<Content>(),
    supabase.from('quiz_questions').select('*').eq('content_id', params.id).order('created_at'),
  ])

  if (!content) notFound()
  const questionList = (questions as QuizQuestion[]) ?? []

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/guides/${content.id}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent-sky"
      >
        <IconArrowLeft size={16} />
        {content.title}
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Quiz time</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {content.topic} — 10 XP per correct answer, bonus for finishing!
      </p>

      <div className="mt-6">
        {questionList.length === 0 ? (
          <EmptyState message="No quiz for this lecture yet — Flex is napping." />
        ) : (
          <QuizRunner contentId={content.id} questions={questionList} />
        )}
      </div>
    </div>
  )
}
