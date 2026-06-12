import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Friendship, Profile } from '@/types/database'

/** Returns the caller's friends (accepted) and pending requests. */
export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: friendships } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const all = (friendships as Friendship[]) ?? []
  const accepted = all.filter((f) => f.status === 'accepted')
  const incoming = all.filter((f) => f.status === 'pending' && f.addressee_id === user.id)
  const outgoing = all.filter((f) => f.status === 'pending' && f.requester_id === user.id)

  const ids = new Set<string>()
  for (const f of all) {
    ids.add(f.requester_id === user.id ? f.addressee_id : f.requester_id)
  }

  let profiles: Profile[] = []
  if (ids.size > 0) {
    const { data } = await supabase.from('profiles').select('*').in('id', Array.from(ids))
    profiles = (data as Profile[]) ?? []
  }

  return NextResponse.json({ accepted, incoming, outgoing, profiles })
}
