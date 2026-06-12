import { Suspense } from 'react'
import { IconSwords } from '@tabler/icons-react'
import ChallengeHub from '@/components/student/ChallengeHub'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ChallengePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div>
      <div className="flex items-center gap-2">
        <IconSwords size={24} className="text-accent-violet" />
        <h1 className="text-2xl font-bold">Challenge mode</h1>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        Go head-to-head with a classmate — winner takes 100 XP.
      </p>
      <div className="mt-6">
        <Suspense>
          <ChallengeHub userId={user.id} />
        </Suspense>
      </div>
    </div>
  )
}
