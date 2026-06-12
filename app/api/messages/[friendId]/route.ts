import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** GET: thread history with a friend. POST: send a message. */
export async function GET(_request: Request, { params }: { params: { friendId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${params.friendId}),and(sender_id.eq.${params.friendId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })
    .limit(100)

  return NextResponse.json({ messages: messages ?? [] })
}

export async function POST(request: Request, { params }: { params: { friendId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const text = body.message?.trim()
  if (!text) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  // RLS enforces that the pair are accepted friends
  const { data: message, error } = await supabase
    .from('direct_messages')
    .insert({ sender_id: user.id, receiver_id: params.friendId, message: text })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'You can only message friends' }, { status: 403 })
  }
  return NextResponse.json({ message })
}
