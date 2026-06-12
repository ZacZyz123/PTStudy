'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconBook, IconCards, IconBrain, IconMessageChatbot, IconAlertTriangle } from '@tabler/icons-react'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import type { Content } from '@/types/database'

interface GuideCardProps {
  content: Content
  index?: number
}

const ACTIONS = [
  { href: (id: string) => `/guides/${id}`, icon: IconBook, label: 'Guide' },
  { href: (id: string) => `/flashcards/${id}`, icon: IconCards, label: 'Cards' },
  { href: (id: string) => `/quiz/${id}`, icon: IconBrain, label: 'Quiz' },
  { href: (id: string) => `/chat/${id}`, icon: IconMessageChatbot, label: 'Ask Flex' },
]

export default function GuideCard({ content, index = 0 }: GuideCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <GlassCard className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
              {content.class_name}
            </p>
            <Link href={`/guides/${content.id}`} className="hover:text-accent-sky">
              <h3 className="mt-0.5 font-bold leading-snug">{content.title}</h3>
            </Link>
          </div>
          {content.is_exam_priority && (
            <Badge variant="amber" className="shrink-0">
              <IconAlertTriangle size={11} />
              Exam
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-text-secondary">{content.topic}</p>

        <div className="mt-auto flex gap-1.5 pt-4">
          {ACTIONS.map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href(content.id)}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-white/[0.03] py-2 text-[10px] font-medium text-text-secondary transition-colors hover:bg-accent-sky/10 hover:text-accent-sky"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}
