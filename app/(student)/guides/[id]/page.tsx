import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconArrowLeft, IconCards, IconBrain, IconMessageChatbot } from '@tabler/icons-react'
import GuideReader from '@/components/student/GuideReader'
import EmptyState from '@/components/student/EmptyState'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/server'
import type { Content, StudyGuide } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function GuideDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: content }, { data: guides }] = await Promise.all([
    supabase.from('content').select('*').eq('id', params.id).single<Content>(),
    supabase
      .from('study_guides')
      .select('*')
      .eq('content_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  if (!content) notFound()
  const guide = (guides as StudyGuide[])?.[0]

  return (
    <div>
      <Link
        href="/guides"
        className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent-sky"
      >
        <IconArrowLeft size={16} />
        All guides
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>{content.class_name}</Badge>
        <Badge variant="violet">{content.topic}</Badge>
        {content.is_exam_priority && <Badge variant="amber">Exam priority</Badge>}
      </div>
      <h1 className="mt-2 text-3xl font-bold">{content.title}</h1>

      {/* Quick actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/flashcards/${content.id}`}
          className="ripple flex items-center gap-1.5 rounded-full bg-accent-sky/10 px-4 py-2 text-sm font-semibold text-accent-sky transition-all hover:bg-accent-sky/20 hover:shadow-glow-sky"
        >
          <IconCards size={16} /> Flashcards
        </Link>
        <Link
          href={`/quiz/${content.id}`}
          className="ripple flex items-center gap-1.5 rounded-full bg-accent-violet/10 px-4 py-2 text-sm font-semibold text-accent-violet transition-all hover:bg-accent-violet/20 hover:shadow-glow-violet"
        >
          <IconBrain size={16} /> Take the quiz
        </Link>
        <Link
          href={`/chat/${content.id}`}
          className="ripple flex items-center gap-1.5 rounded-full bg-accent-emerald/10 px-4 py-2 text-sm font-semibold text-accent-emerald transition-all hover:bg-accent-emerald/20 hover:shadow-glow-emerald"
        >
          <IconMessageChatbot size={16} /> Ask Flex
        </Link>
      </div>

      <div className="mt-8">
        {guide?.guide_text ? (
          <GuideReader guideText={guide.guide_text} contentId={content.id} />
        ) : (
          <EmptyState message="This guide hasn't been generated yet — check back soon!" />
        )}
      </div>
    </div>
  )
}
