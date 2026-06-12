'use client'

import { motion } from 'framer-motion'
import { IconCrown, IconFlame } from '@tabler/icons-react'
import Avatar from '@/components/ui/Avatar'
import { levelFromXp, levelTitle } from '@/lib/xp'
import type { Profile } from '@/types/database'

interface LeaderboardRowProps {
  profile: Profile
  rank: number
  isMe: boolean
  index: number
}

const RANK_STYLES: Record<number, { ring: string; label: string }> = {
  1: { ring: 'border-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.25)]', label: 'text-amber-400' },
  2: { ring: 'border-slate-300/40 shadow-[0_0_18px_rgba(203,213,225,0.15)]', label: 'text-slate-300' },
  3: { ring: 'border-orange-600/40 shadow-[0_0_18px_rgba(194,120,3,0.18)]', label: 'text-orange-500' },
}

/** A leaderboard row that staggers in from the right. */
export default function LeaderboardRow({ profile, rank, isMe, index }: LeaderboardRowProps) {
  const { level } = levelFromXp(profile.xp)
  const podium = RANK_STYLES[rank]

  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 26 }}
      className={`glass-card glass-card-static flex items-center gap-3 border p-3.5
        ${podium ? podium.ring : ''}
        ${isMe ? '!border-accent-sky/50 !bg-accent-sky/[0.06]' : ''}`}
    >
      <span className={`mono w-8 shrink-0 text-center text-lg font-bold ${podium?.label ?? 'text-text-tertiary'}`}>
        {rank === 1 ? <IconCrown size={22} className="mx-auto" /> : rank}
      </span>
      <Avatar name={profile.full_name} color={profile.avatar_color} size={42} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {profile.full_name}
          {isMe && <span className="ml-1.5 text-xs font-normal text-accent-sky">(you)</span>}
        </p>
        <p className="text-xs text-text-tertiary">
          Lvl {level} · {levelTitle(level)}
        </p>
      </div>
      {profile.streak_days >= 3 && (
        <span className="flex items-center gap-0.5 text-xs font-semibold text-accent-amber">
          <IconFlame size={14} />
          {profile.streak_days}
        </span>
      )}
      <span className="mono text-sm font-bold text-accent-sky">{profile.xp.toLocaleString()} XP</span>
    </motion.div>
  )
}
