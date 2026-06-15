'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconCheck, IconRotateClockwise, IconRefresh, IconBolt } from '@tabler/icons-react'
import FlashCard from './FlashCard'
import Flex from '@/components/mascot/Flex'
import Button from '@/components/ui/Button'
import { XP_REWARDS } from '@/lib/xp'
import type { Flashcard } from '@/types/database'

interface FlashcardDeckProps {
  cards: Flashcard[]
  contentId: string
}

export default function FlashcardDeck({ cards: initialCards, contentId }: FlashcardDeckProps) {
  const [queue, setQueue] = useState<Flashcard[]>(initialCards)
  const [knownCount, setKnownCount] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [direction, setDirection] = useState(1)
  const [awardedXp, setAwardedXp] = useState<number | null>(null)
  const awardRequested = useRef(false)

  const total = initialCards.length
  const current = queue[0]
  const done = !current

  // Award flashcard XP once when the whole deck is first completed.
  useEffect(() => {
    if (!done || total === 0 || awardRequested.current) return
    awardRequested.current = true
    fetch('/api/xp/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'flashcard_deck', contentId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAwardedXp(d ? (d.awarded ?? 0) : 0))
      .catch(() => setAwardedXp(0))
  }, [done, total, contentId])

  const advance = (known: boolean) => {
    setDirection(known ? 1 : -1)
    setFlipped(false)
    setQueue((q) => {
      const [head, ...rest] = q
      // "Review again" sends the card to the back of the queue
      return known ? rest : [...rest, head]
    })
    if (known) setKnownCount((c) => c + 1)
  }

  const restart = () => {
    setQueue(initialCards)
    setKnownCount(0)
    setFlipped(false)
  }

  const progress = total > 0 ? knownCount / total : 0

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="flex flex-col items-center gap-5 py-10 text-center"
      >
        <Flex mood="celebrating" size={140} />
        <h2 className="text-2xl font-bold text-accent-emerald">
          All {total} cards mastered!
        </h2>
        {awardedXp !== null &&
          (awardedXp > 0 ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-amber/15 px-4 py-1.5 text-sm font-bold text-accent-amber shadow-glow-amber"
            >
              <IconBolt size={16} />+{awardedXp} XP earned
            </motion.span>
          ) : (
            <span className="text-sm text-text-secondary">
              Already earned today — great review! (+{XP_REWARDS.FLASHCARD_DECK} XP daily)
            </span>
          ))}
        <Button onClick={restart}>
          <IconRefresh size={18} />
          Run it back
        </Button>
      </motion.div>
    )
  }

  return (
    <div>
      {/* Progress tracker */}
      <div className="mb-5">
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-text-secondary">
            {knownCount} of {total} known
          </span>
          <span className="mono text-accent-sky">{queue.length} left</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-sky to-accent-emerald shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${current.id}-${queue.length}`}
          initial={{ opacity: 0, x: 60 * direction, rotate: 2 * direction }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: -60 * direction, rotate: -2 * direction }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <FlashCard
            front={current.front}
            back={current.back}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
          />
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex justify-center gap-3">
        <Button variant="ghost" onClick={() => advance(false)}>
          <IconRotateClockwise size={18} />
          Review again
        </Button>
        <Button variant="success" onClick={() => advance(true)}>
          <IconCheck size={18} />
          Got it!
        </Button>
      </div>
    </div>
  )
}
