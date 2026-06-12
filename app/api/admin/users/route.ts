import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function requireAdmin(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()
  return profile?.role === 'admin' ? user.id : null
}

/** PATCH: update another user's role or subscription status (admin only). */
export async function PATCH(request: Request) {
  const adminId = await requireAdmin()
  if (!adminId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  let body: { userId?: string; role?: string; subscription_status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (!body.userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }
  if (body.userId === adminId && body.role === 'student') {
    return NextResponse.json({ error: "You can't demote yourself" }, { status: 400 })
  }

  const updates: Record<string, string> = {}
  if (body.role === 'admin' || body.role === 'student') updates.role = body.role
  if (body.subscription_status && ['active', 'inactive', 'past_due'].includes(body.subscription_status)) {
    updates.subscription_status = body.subscription_status
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .update(updates)
    .eq('id', body.userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
  return NextResponse.json({ profile })
}
