import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) redirect('/login')

  // Presence heartbeat — mark the user as seen on every server render
  await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id)

  return <AppShell profile={profile}>{children}</AppShell>
}
