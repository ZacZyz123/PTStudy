import { IconBook } from '@tabler/icons-react'
import GuideCard from '@/components/student/GuideCard'
import EmptyState from '@/components/student/EmptyState'
import { createClient } from '@/lib/supabase/server'
import type { Content } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function GuidesPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const contents = (data as Content[]) ?? []

  const byClass = new Map<string, Content[]>()
  for (const content of contents) {
    const list = byClass.get(content.class_name) ?? []
    list.push(content)
    byClass.set(content.class_name, list)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <IconBook size={24} className="text-accent-sky" />
        <h1 className="text-2xl font-bold">Study Guides</h1>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        Every lecture, turned into guides, flashcards, and quizzes by Flex.
      </p>

      {contents.length === 0 ? (
        <div className="mt-10">
          <EmptyState message="Nothing here yet... Flex is napping." />
        </div>
      ) : (
        Array.from(byClass.entries()).map(([className, items]) => (
          <section key={className} className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-text-secondary">{className}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((content, i) => (
                <GuideCard key={content.id} content={content} index={i} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
