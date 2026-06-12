import { IconTrophy } from '@tabler/icons-react'
import LeaderboardClient from '@/components/student/LeaderboardClient'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div>
      <div className="flex items-center gap-2">
        <IconTrophy size={24} className="text-accent-amber" />
        <h1 className="text-2xl font-bold">Leaderboard</h1>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        Top of the class earns the crown 👑 — XP resets never, grind forever.
      </p>
      <div className="mt-6">
        <LeaderboardClient userId={user.id} />
      </div>
    </div>
  )
}
