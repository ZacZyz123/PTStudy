import UserTable from '@/components/admin/UserTable'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage roles and subscription status for every account.
      </p>
      <div className="mt-6">
        <UserTable users={(data as Profile[]) ?? []} adminId={user.id} />
      </div>
    </div>
  )
}
