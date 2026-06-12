import { notFound, redirect } from 'next/navigation'
import MobileThread from '@/components/student/MobileThread'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function MessageThreadPage({ params }: { params: { friendId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Must be an accepted friend
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id')
    .eq('status', 'accepted')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${params.friendId}),and(requester_id.eq.${params.friendId},addressee_id.eq.${user.id})`
    )
    .limit(1)

  if (!friendship || friendship.length === 0) redirect('/friends')

  const { data: friend } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.friendId)
    .single<Profile>()

  if (!friend) notFound()

  return <MobileThread userId={user.id} friend={friend} />
}
