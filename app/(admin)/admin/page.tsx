import Link from 'next/link'
import {
  IconUsers,
  IconBook,
  IconBrain,
  IconSwords,
  IconUpload,
  IconCalendarEvent,
  IconTable,
  IconChevronRight,
} from '@tabler/icons-react'
import StatCard from '@/components/student/StatCard'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const QUICK_LINKS = [
  { href: '/admin/upload', icon: IconUpload, label: 'Upload content', desc: 'Add a lecture and generate AI materials' },
  { href: '/admin/content', icon: IconTable, label: 'Manage content', desc: 'Publish, regenerate, or remove lectures' },
  { href: '/admin/exams', icon: IconCalendarEvent, label: 'Schedule exams', desc: 'Set exam dates and priority topics' },
  { href: '/admin/users', icon: IconUsers, label: 'Manage users', desc: 'Roles and subscription status' },
]

export default async function AdminOverviewPage() {
  const admin = createAdminClient()

  const [{ count: users }, { count: content }, { count: attempts }, { count: challenges }, { count: activeSubs }] =
    await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('content').select('id', { count: 'exact', head: true }),
      admin.from('quiz_attempts').select('id', { count: 'exact', head: true }),
      admin.from('challenges').select('id', { count: 'exact', head: true }),
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    ])

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin overview</h1>
      <p className="mt-1 text-sm text-text-secondary">Everything happening across PT Study.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Students" value={users ?? 0} icon={<IconUsers size={22} />} color="sky" />
        <StatCard label="Active subscriptions" value={activeSubs ?? 0} icon={<IconUsers size={22} />} color="emerald" />
        <StatCard label="Lectures" value={content ?? 0} icon={<IconBook size={22} />} color="violet" />
        <StatCard label="Quiz attempts" value={attempts ?? 0} icon={<IconBrain size={22} />} color="amber" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Challenges played" value={challenges ?? 0} icon={<IconSwords size={22} />} color="pink" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="glass-card flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-violet/10 text-accent-violet">
              <Icon size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{label}</p>
              <p className="text-xs text-text-tertiary">{desc}</p>
            </div>
            <IconChevronRight size={18} className="text-text-tertiary" />
          </Link>
        ))}
      </div>
    </div>
  )
}
