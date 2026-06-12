import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { awardBadge } from '@/lib/badges'
import type { Profile } from '@/types/database'

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profiles } = await admin
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('xp', { ascending: false })
    .limit(50)

  const leaders = (profiles as Profile[]) ?? []

  // #1 earns "Top of Class" (idempotent)
  if (leaders[0] && leaders[0].xp > 0) {
    await awardBadge(leaders[0].id, 'Top of Class')
  }

  return NextResponse.json({ leaders })
}
