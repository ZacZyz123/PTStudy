import { IconMessageCircle } from '@tabler/icons-react'
import MessagesInbox from '@/components/student/MessagesInbox'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div>
      <div className="flex items-center gap-2">
        <IconMessageCircle size={24} className="text-accent-sky" />
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>
      <p className="mt-1 text-sm text-text-secondary">Your conversations with study buddies.</p>
      <div className="mt-6">
        <MessagesInbox userId={user.id} />
      </div>
    </div>
  )
}
