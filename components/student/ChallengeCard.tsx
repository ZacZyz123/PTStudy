'use client'

import { motion } from 'framer-motion'
import { IconSwords, IconTrophy, IconClock } from '@tabler/icons-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { ChallengeWithRelations } from '@/types/database'

interface ChallengeCardProps {
  challenge: ChallengeWithRelations
  userId: string
  index?: number
  onAccept?: (id: string) => void
  onDecline?: (id: string) => void
  onPlay?: (id: string) => void
}

export default function ChallengeCard({
  challenge,
  userId,
  index = 0,
  onAccept,
  onDecline,
  onPlay,
}: ChallengeCardProps) {
  const isChallenger = challenge.challenger_id === userId
  const opponent = isChallenger ? challenge.challenged : challenge.challenger
  const myScore = isChallenger ? challenge.challenger_score : challenge.challenged_score
  const theirScore = isChallenger ? challenge.challenged_score : challenge.challenger_score

  const incoming = !isChallenger && challenge.status === 'pending'
  const completed = challenge.status === 'completed'
  const won = completed && challenge.winner_id === userId
  const tied = completed && challenge.winner_id === null
  const needsMyPlay =
    !completed &&
    challenge.status !== 'declined' &&
    ((isChallenger && challenge.status !== 'pending' && myScore === null) ||
      (isChallenger && challenge.status === 'pending' && myScore === null) ||
      (!isChallenger && challenge.status === 'accepted' && myScore === null) ||
      (challenge.status === 'in_progress' && myScore === null))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card glass-card-static flex flex-wrap items-center gap-3 p-4"
    >
      <Avatar name={opponent?.full_name ?? '?'} color={opponent?.avatar_color} size={42} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {isChallenger ? 'You challenged ' : ''}
          {opponent?.full_name ?? 'Unknown'}
          {!isChallenger ? ' challenged you' : ''}
        </p>
        <p className="truncate text-xs text-text-tertiary">{challenge.content?.title}</p>
      </div>

      {completed ? (
        <div className="flex items-center gap-2">
          <span className="mono text-sm font-bold">
            {myScore ?? 0} – {theirScore ?? 0}
          </span>
          {tied ? (
            <Badge variant="amber">Tie</Badge>
          ) : won ? (
            <Badge variant="emerald">
              <IconTrophy size={11} /> Won +100 XP
            </Badge>
          ) : (
            <Badge variant="red">Lost +25 XP</Badge>
          )}
        </div>
      ) : challenge.status === 'declined' ? (
        <Badge variant="red">Declined</Badge>
      ) : incoming ? (
        <div className="flex gap-2">
          <Button size="sm" variant="success" onClick={() => onAccept?.(challenge.id)}>
            Accept
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDecline?.(challenge.id)}>
            Decline
          </Button>
        </div>
      ) : needsMyPlay ? (
        <Button size="sm" onClick={() => onPlay?.(challenge.id)}>
          <IconSwords size={15} /> Play now
        </Button>
      ) : (
        <Badge variant="sky">
          <IconClock size={11} /> Waiting for opponent
        </Badge>
      )}
    </motion.div>
  )
}
