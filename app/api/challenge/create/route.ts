import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/** Creates a pending challenge against a friend on a piece of content. */
export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { challengedId?: string; contentId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (!body.challengedId || !body.contentId) {
    return NextResponse.json({ error: 'challengedId and contentId required' }, { status: 400 })
  }
  if (body.challengedId === user.id) {
    return NextResponse.json({ error: "You can't challenge yourself" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Must be friends
  const { data: friendship } = await admin
    .from('friendships')
    .select('id')
    .eq('status', 'accepted')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${body.challengedId}),and(requester_id.eq.${body.challengedId},addressee_id.eq.${user.id})`
    )
    .limit(1)

  if (!friendship || friendship.length === 0) {
    return NextResponse.json({ error: 'You can only challenge friends' }, { status: 403 })
  }

  // Content must exist, be published, and have quiz questions
  const { count } = await admin
    .from('quiz_questions')
    .select('id', { count: 'exact', head: true })
    .eq('content_id', body.contentId)

  if (!count) {
    return NextResponse.json({ error: 'That topic has no quiz yet' }, { status: 404 })
  }

  const { data: challenge, error } = await admin
    .from('challenges')
    .insert({
      challenger_id: user.id,
      challenged_id: body.challengedId,
      content_id: body.contentId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Challenge create failed:', error)
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
  }

  return NextResponse.json({ challenge })
}
