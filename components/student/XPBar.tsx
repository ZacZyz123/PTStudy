'use client'

import { motion } from 'framer-motion'
import { IconBolt } from '@tabler/icons-react'
import { levelFromXp, levelTitle } from '@/lib/xp'

/** Glowing XP bar that animates its fill from the left on mount. */
export default function XPBar({ xp }: { xp: number }) {
  const { level, current, needed, progress } = levelFromXp(xp)

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-semibold">
          <IconBolt size={16} className="text-accent-sky" />
          Level {level} — {levelTitle(level)}
        </span>
        <span className="mono text-xs text-text-secondary">
          {current.toLocaleString()} / {needed.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-accent-sky to-accent-violet shadow-[0_0_16px_rgba(56,189,248,0.5)]"
        />
      </div>
    </div>
  )
}
