'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconLayoutDashboard,
  IconBook,
  IconSwords,
  IconTrophy,
  IconUsers,
  IconUser,
  IconLogout,
  IconShieldCog,
  IconBolt,
} from '@tabler/icons-react'
import Flex from '@/components/mascot/Flex'
import { useFlexContext } from '@/components/mascot/FlexContext'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { href: '/guides', label: 'Study Guides', icon: IconBook },
  { href: '/challenge', label: 'Challenge', icon: IconSwords },
  { href: '/leaderboard', label: 'Leaderboard', icon: IconTrophy },
  { href: '/friends', label: 'Friends', icon: IconUsers },
  { href: '/profile', label: 'Profile', icon: IconUser },
]

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setMood, setSpeech } = useFlexContext()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleLogoutHover = () => {
    setMood('sad')
    setSpeech("Please don't go... 😢", 2500)
    setTimeout(() => setMood('idle'), 2500)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-r border-glass bg-bg-panel lg:flex">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-sky/15 shadow-glow-sky">
          <IconBolt size={20} className="text-accent-sky" />
        </span>
        <span className="text-lg font-bold tracking-tight">
          PT <span className="text-accent-sky">Study</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                ${active ? 'text-accent-sky' : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary'}`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-accent-sky/10 shadow-[inset_0_0_20px_rgba(56,189,248,0.08)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon size={19} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </Link>
          )
        })}

        {profile.role === 'admin' && (
          <Link
            href="/admin"
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
              ${pathname.startsWith('/admin') ? 'text-accent-violet' : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary'}`}
          >
            <IconShieldCog size={19} />
            Admin
          </Link>
        )}
      </nav>

      {/* Flex peeking in sidebar */}
      <div className="flex justify-center pb-2">
        <Flex mood="idle" size={64} />
      </div>

      {/* User */}
      <div className="border-t border-glass p-4">
        <div className="flex items-center gap-3">
          <Avatar name={profile.full_name} color={profile.avatar_color} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile.full_name ?? 'Student'}</p>
            <p className="mono text-xs text-accent-sky">{profile.xp.toLocaleString()} XP</p>
          </div>
          <button
            onClick={handleLogout}
            onMouseEnter={handleLogoutHover}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-accent-red/10 hover:text-accent-red"
            aria-label="Log out"
          >
            <IconLogout size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
