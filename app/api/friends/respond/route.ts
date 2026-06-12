import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { XP_REWARDS } from '@/lib/xp'
import { checkProgressBadges } from '@/lib/badges'
import type { Friendship } from '@/types/database'

/** Accept or decline an incoming friend request. */
export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { friendshipId?: string; accept?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (!body.friendshipId || typeof body.accept !== 'boolean') {
    return NextResponse.json({ error: 'friendshipId and accept required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: friendship } = await admin
    .from('friendships')
    .select('*')
    .eq('id', body.friendshipId)
    .single<Friendship>()

  if (!friendship || friendship.addressee_id !== user.id || friendship.status !== 'pending') {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const { data: updated, error } = await admin
    .from('friendships')
    .update({ status: body.accept ? 'accepted' : 'declined', updated_at: new Date().toISOString() })
    .eq('id', body.friendshipId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to respond' }, { status: 500 })
  }

  if (body.accept) {
    // Requester earns XP for the accepted request
    const { data: requester } = await admin
      .from('profiles')
      .select('xp')
      .eq('id', friendship.requester_id)
      .single<{ xp: number }>()
    if (requester) {
      await admin
        .from('profiles')
        .update({ xp: requester.xp + XP_REWARDS.FRIEND_ACCEPTED })
        .eq('id', friendship.requester_id)
    }
    await Promise.all([checkProgressBadges(user.id), checkProgressBadges(friendship.requester_id)])
  }

  return NextResponse.json({ friendship: updated })
}
