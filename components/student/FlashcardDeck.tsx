'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconCheck, IconRotateClockwise, IconRefresh } from '@tabler/icons-react'
import FlashCard from './FlashCard'
import Flex from '@/components/mascot/Flex'
import Button from '@/components/ui/Button'
import type { Flashcard } from '@/types/database'

interface FlashcardDeckProps {
  cards: Flashcard[]
}

export default function FlashcardDeck({ cards: initialCards }: FlashcardDeckProps) {
  const [queue, setQueue] = useState<Flashcard[]>(initialCards)
  const [knownCount, setKnownCount] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [direction, setDirection] = useState(1)

  const total = initialCards.length
  const current = queue[0]
  const done = !current

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
        <Flex mood="celebrating" size={140} speechBubble="Deck complete! You're a machine! 🎉" />
        <h2 className="text-2xl font-bold text-accent-emerald">
          All {total} cards mastered!
        </h2>
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
