import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { XP_REWARDS } from '@/lib/xp'

/**
 * Awards XP for actions that originate client-side but must be validated
 * server-side. Each action is idempotent via a unique constraint on its
 * tracking table, so XP is granted at most once per (user, content[, day]):
 *   - read_guide      → 5 XP, once per guide (guide_reads)
 *   - flashcard_deck  → 15 XP, once per deck per day (flashcard_sessions)
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

  const { action, contentId } = body
  if (!contentId || (action !== 'read_guide' && action !== 'flashcard_deck')) {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  }

  const admin = createAdminClient()
  const reward = action === 'read_guide' ? XP_REWARDS.READ_GUIDE : XP_REWARDS.FLASHCARD_DECK

  // The unique constraint on each tracking table makes this idempotent —
  // a duplicate insert fails and awards nothing.
  const { error: insertError } =
    action === 'read_guide'
      ? await admin.from('guide_reads').insert({ user_id: user.id, content_id: contentId })
      : await admin.from('flashcard_sessions').insert({ user_id: user.id, content_id: contentId })

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
      .update({ xp: profile.xp + reward })
      .eq('id', user.id)
  }

  return NextResponse.json({ awarded: reward })
}
