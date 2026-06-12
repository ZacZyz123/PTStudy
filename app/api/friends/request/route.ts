import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Friendship } from '@/types/database'

/** Sends a friend request (or returns the existing relationship). */
export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { addresseeId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (!body.addresseeId || body.addresseeId === user.id) {
    return NextResponse.json({ error: 'Invalid addressee' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('friendships')
    .select('*')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${body.addresseeId}),and(requester_id.eq.${body.addresseeId},addressee_id.eq.${user.id})`
    )
    .limit(1)

  const current = (existing as Friendship[])?.[0]
  if (current) {
    if (current.status === 'blocked') {
      return NextResponse.json({ error: 'Cannot send request' }, { status: 403 })
    }
    return NextResponse.json({ friendship: current, existing: true })
  }

  const { data: friendship, error } = await admin
    .from('friendships')
    .insert({ requester_id: user.id, addressee_id: body.addresseeId, status: 'pending' })
    .select()
    .single()

  if (error) {
    console.error('Friend request failed:', error)
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 })
  }

  return NextResponse.json({ friendship })
}
