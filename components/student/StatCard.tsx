'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  icon: React.ReactNode
  color?: 'sky' | 'violet' | 'emerald' | 'amber' | 'pink'
}

const colorClasses = {
  sky: 'text-accent-sky bg-accent-sky/10',
  violet: 'text-accent-violet bg-accent-violet/10',
  emerald: 'text-accent-emerald bg-accent-emerald/10',
  amber: 'text-accent-amber bg-accent-amber/10',
  pink: 'text-accent-pink bg-accent-pink/10',
}

const accentBar = {
  sky: 'from-accent-sky/0 via-accent-sky to-accent-sky/0',
  violet: 'from-accent-violet/0 via-accent-violet to-accent-violet/0',
  emerald: 'from-accent-emerald/0 via-accent-emerald to-accent-emerald/0',
  amber: 'from-accent-amber/0 via-accent-amber to-accent-amber/0',
  pink: 'from-accent-pink/0 via-accent-pink to-accent-pink/0',
}

/** Stat card — the number counts up from 0 when it first scrolls into view. */
export default function StatCard({ label, value, suffix = '', icon, color = 'sky' }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1200
    const start = performance.now()
    let frame: number

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(value * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value])

  return (
    <div ref={ref}>
      <GlassCard className="animate-pulse-glow overflow-hidden p-5" tilt>
        {/* top accent gradient line */}
        <span
          aria-hidden
          className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r ${accentBar[color]}`}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClasses[color]}`}>
            {icon}
          </span>
          <div className="min-w-0">
            <p className="mono text-2xl font-bold leading-tight">
              {display.toLocaleString()}
              {suffix}
            </p>
            <p className="truncate text-xs text-text-secondary">{label}</p>
          </div>
        </motion.div>
      </GlassCard>
    </div>
  )
}
