'use client'

import { motion } from 'framer-motion'

interface FlashCardProps {
  front: string
  back: string
  flipped: boolean
  onFlip: () => void
}

/**
 * True CSS 3D flip card — rotates 180° on the Y axis with a spring bounce.
 * Front glows sky blue, back glows violet.
 */
export default function FlashCard({ front, back, flipped, onFlip }: FlashCardProps) {
  return (
    <div className="flip-perspective h-72 w-full cursor-pointer select-none sm:h-80" onClick={onFlip}>
      <motion.div
        className="flip-preserve-3d relative h-full w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        {/* Front */}
        <div
          className="flip-backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-[24px] border border-accent-sky/30 bg-bg-card p-8 text-center"
          style={{ boxShadow: '0 0 40px rgba(56,189,248,0.15), 0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <span className="absolute left-5 top-4 text-[10px] font-bold uppercase tracking-widest text-accent-sky">
            Question
          </span>
          <p className="text-lg font-semibold leading-relaxed sm:text-xl">{front}</p>
          <span className="absolute bottom-4 text-xs text-text-tertiary">Tap to flip</span>
        </div>

        {/* Back */}
        <div
          className="flip-backface-hidden flip-rotate-180 absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-[24px] border border-accent-violet/30 bg-bg-card p-8 text-center"
          style={{ boxShadow: '0 0 40px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <span className="absolute left-5 top-4 text-[10px] font-bold uppercase tracking-widest text-accent-violet">
            Answer
          </span>
          <p className="text-base leading-relaxed text-text-primary sm:text-lg">{back}</p>
        </div>
      </motion.div>
    </div>
  )
}
