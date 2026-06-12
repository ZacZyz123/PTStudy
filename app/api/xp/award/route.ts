import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { XP_REWARDS } from '@/lib/xp'

/**
 * Awards XP for actions that originate client-side but must be validated
 * server-side. Currently: reading a study guide (once per guide).
 */
export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { action?: string; contentId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (body.action !== 'read_guide' || !body.contentId) {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Unique constraint makes this idempotent — a duplicate read awards nothing
  const { error: insertError } = await admin
    .from('guide_reads')
    .insert({ user_id: user.id, content_id: body.contentId })

  if (insertError) {
    return NextResponse.json({ awarded: 0 })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('xp')
    .eq('id', user.id)
    .single<{ xp: number }>()

  if (profile) {
    await admin
      .from('profiles')
      .update({ xp: profile.xp + XP_REWARDS.READ_GUIDE })
      .eq('id', user.id)
  }

  return NextResponse.json({ awarded: XP_REWARDS.READ_GUIDE })
}
