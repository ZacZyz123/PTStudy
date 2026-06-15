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
      <div className="relative h-3 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-accent-sky to-accent-violet shadow-[0_0_16px_rgba(56,189,248,0.5)]"
        >
          {/* animated shine sweeping across the fill */}
          <motion.span
            aria-hidden
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            animate={{ x: ['-120%', '320%'] }}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.4 }}
          />
        </motion.div>
      </div>
    </div>
  )
}
