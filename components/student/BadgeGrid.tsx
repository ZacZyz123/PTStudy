'use client'

import { motion } from 'framer-motion'
import {
  IconBrain,
  IconFlame,
  IconTrophy,
  IconCrown,
  IconBolt,
  IconCalendarCheck,
  IconUsers,
  IconStar,
  IconMedal,
  type Icon as TablerIcon,
} from '@tabler/icons-react'
import type { BadgeRow } from '@/types/database'

const ICONS: Record<string, TablerIcon> = {
  'ti-brain': IconBrain,
  'ti-flame': IconFlame,
  'ti-trophy': IconTrophy,
  'ti-crown': IconCrown,
  'ti-bolt': IconBolt,
  'ti-calendar-check': IconCalendarCheck,
  'ti-users': IconUsers,
  'ti-star': IconStar,
}

interface BadgeGridProps {
  allBadges: BadgeRow[]
  earnedIds: Set<string>
}

/** Badge grid — earned badges glow and spin in; locked ones sit dimmed. */
export default function BadgeGrid({ allBadges, earnedIds }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {allBadges.map((badge, i) => {
        const earned = earnedIds.has(badge.id)
        const Icon = ICONS[badge.icon ?? ''] ?? IconMedal
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8, rotate: earned ? -360 : 0 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 18 }}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all
              ${
                earned
                  ? 'border-accent-pink/40 bg-accent-pink/[0.07] shadow-[0_0_24px_rgba(236,72,153,0.15)]'
                  : 'border-glass bg-white/[0.02] opacity-40 grayscale'
              }`}
            title={badge.description ?? badge.name}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                earned ? 'bg-accent-pink/15 text-accent-pink' : 'bg-white/5 text-text-tertiary'
              }`}
            >
              <Icon size={24} />
            </span>
            <p className="text-xs font-bold leading-tight">{badge.name}</p>
            <p className="text-[10px] leading-snug text-text-tertiary">{badge.description}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
