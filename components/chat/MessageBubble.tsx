'use client'

import { motion } from 'framer-motion'

interface MessageBubbleProps {
  message: string
  mine: boolean
  timestamp?: string
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function MessageBubble({ message, mine, timestamp }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[80%] break-words rounded-2xl px-4 py-2.5 text-sm ${
          mine
            ? 'rounded-br-md bg-accent-sky text-bg-base'
            : 'glass-card glass-card-static rounded-bl-md !shadow-none'
        }`}
      >
        {message}
      </div>
      {timestamp && <span className="mt-1 px-1 text-[10px] text-text-tertiary">{relativeTime(timestamp)}</span>}
    </motion.div>
  )
}

export function TypingIndicator() {
  return (
    <div className="glass-card glass-card-static inline-flex w-fit items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3 !shadow-none">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-text-secondary"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}
