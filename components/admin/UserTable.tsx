'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import type { Profile } from '@/types/database'

export default function UserTable({ users: initial, adminId }: { users: Profile[]; adminId: string }) {
  const { toast } = useToast()
  const [users, setUsers] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)

  const update = async (userId: string, patch: { role?: string; subscription_status?: string }) => {
    setBusy(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...patch }),
      })
      const data: { profile?: Profile; error?: string } = await res.json()
      if (!res.ok || !data.profile) throw new Error(data.error ?? 'Update failed')
      setUsers((u) => u.map((x) => (x.id === userId ? data.profile! : x)))
      toast('User updated', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      {users.map((user, i) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.03, 0.5) }}
          className="glass-card glass-card-static flex flex-wrap items-center gap-3 p-4"
        >
          <Avatar name={user.full_name} color={user.avatar_color} size={40} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 truncate text-sm font-semibold">
              {user.full_name}
              {user.role === 'admin' && <Badge variant="violet">Admin</Badge>}
            </p>
            <p className="truncate text-xs text-text-tertiary">{user.email}</p>
          </div>

          <span className="mono text-xs text-accent-sky">{user.xp.toLocaleString()} XP</span>

          <select
            value={user.subscription_status}
            disabled={busy === user.id}
            onChange={(e) => update(user.id, { subscription_status: e.target.value })}
            className="glass-input rounded-lg px-2 py-1.5 text-xs"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="past_due">past_due</option>
          </select>

          <select
            value={user.role}
            disabled={busy === user.id || user.id === adminId}
            onChange={(e) => update(user.id, { role: e.target.value })}
            className="glass-input rounded-lg px-2 py-1.5 text-xs"
          >
            <option value="student">student</option>
            <option value="admin">admin</option>
          </select>
        </motion.div>
      ))}
    </div>
  )
}
