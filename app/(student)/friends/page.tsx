import { IconUsers } from '@tabler/icons-react'
import FriendsManager from '@/components/student/FriendsManager'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function FriendsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div>
      <div className="flex items-center gap-2">
        <IconUsers size={24} className="text-accent-sky" />
        <h1 className="text-2xl font-bold">Friends</h1>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        Find classmates, build your squad, climb the leaderboard together.
      </p>
      <div className="mt-6">
        <FriendsManager userId={user.id} />
      </div>
    </div>
  )
}
