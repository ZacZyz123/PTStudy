import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconArrowLeft } from '@tabler/icons-react'
import FlashcardDeck from '@/components/student/FlashcardDeck'
import EmptyState from '@/components/student/EmptyState'
import { createClient } from '@/lib/supabase/server'
import type { Content, Flashcard } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function FlashcardsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: content }, { data: cards }] = await Promise.all([
    supabase.from('content').select('*').eq('id', params.id).single<Content>(),
    supabase.from('flashcards').select('*').eq('content_id', params.id).order('created_at'),
  ])

  if (!content) notFound()
  const flashcards = (cards as Flashcard[]) ?? []

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/guides/${content.id}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent-sky"
      >
        <IconArrowLeft size={16} />
        {content.title}
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Flashcards</h1>
      <p className="mt-1 text-sm text-text-secondary">{content.topic}</p>

      <div className="mt-6">
        {flashcards.length === 0 ? (
          <EmptyState message="No flashcards for this lecture yet — Flex is napping." />
        ) : (
          <FlashcardDeck cards={flashcards} />
        )}
      </div>
    </div>
  )
}
