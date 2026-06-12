import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconArrowLeft, IconSparkles } from '@tabler/icons-react'
import AIChat from '@/components/student/AIChat'
import { createClient } from '@/lib/supabase/server'
import type { ChatMessage, Content } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function ChatPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: content }, { data: history }] = await Promise.all([
    supabase.from('content').select('*').eq('id', params.id).single<Content>(),
    supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_id', params.id)
      .order('created_at')
      .limit(50),
  ])

  if (!content) notFound()

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/guides/${content.id}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent-sky"
      >
        <IconArrowLeft size={16} />
        {content.title}
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <IconSparkles size={22} className="text-accent-violet" />
        <h1 className="text-2xl font-bold">Chat with Flex</h1>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        Your AI tutor for {content.topic} — powered by Claude.
      </p>

      <div className="mt-5">
        <AIChat
          contentId={content.id}
          topic={content.topic}
          initialMessages={(history as ChatMessage[]) ?? []}
        />
      </div>
    </div>
  )
}
