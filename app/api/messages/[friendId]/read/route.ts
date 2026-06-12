import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Marks all messages from this friend as read (read receipts). */
export async function POST(_request: Request, { params }: { params: { friendId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { error } = await supabase
    .from('direct_messages')
    .update({ is_read: true })
    .eq('sender_id', params.friendId)
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  if (error) {
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
