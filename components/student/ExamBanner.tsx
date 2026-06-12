'use client'

import { motion } from 'framer-motion'
import { IconCalendarTime } from '@tabler/icons-react'
import type { Exam } from '@/types/database'

export default function ExamBanner({ exam }: { exam: Exam }) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(`${exam.exam_date}T00:00:00`).getTime() - Date.now()) / 86_400_000)
  )
  const urgent = daysLeft <= 3

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card glass-card-static flex items-center gap-4 p-5 ${
        urgent ? '!border-accent-red/40' : '!border-accent-amber/30'
      }`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          urgent ? 'bg-accent-red/15 text-accent-red shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-accent-amber/15 text-accent-amber shadow-glow-amber'
        }`}
      >
        <IconCalendarTime size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{exam.title}</p>
        <p className="text-sm text-text-secondary">
          {new Date(`${exam.exam_date}T00:00:00`).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
          {exam.topic_tags && exam.topic_tags.length > 0 && ` — ${exam.topic_tags.join(', ')}`}
        </p>
      </div>
      <div className="text-right">
        <p className={`mono text-2xl font-bold ${urgent ? 'text-accent-red' : 'text-accent-amber'}`}>
          {daysLeft}
        </p>
        <p className="text-xs text-text-tertiary">{daysLeft === 1 ? 'day left' : 'days left'}</p>
      </div>
    </motion.div>
  )
}
