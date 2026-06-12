'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Flex from './Flex'
import { useFlexContext } from './FlexContext'

const MOTIVATION_LINES = [
  'You got this! 💪',
  'Future DPT right here!',
  'One more quiz? Just one?',
  'Strong muscles, stronger mind!',
  'Mayo Clinic legends study daily!',
  'Your patients will thank you later!',
  'Flex believes in you! 🔥',
]

/**
 * FlexCorner — Flex always floating in the bottom-right corner.
 * Idle float, waves on hover, motivational lines on click.
 */
export default function FlexCorner() {
  const { mood, speech, setSpeech } = useFlexContext()
  const [hovered, setHovered] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)

  const handleClick = () => {
    setSpeech(MOTIVATION_LINES[lineIndex % MOTIVATION_LINES.length], 3000)
    setLineIndex((i) => i + 1)
  }

  const displayMood = mood !== 'idle' ? mood : hovered ? 'waving' : 'idle'

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ scale: hovered ? 1.25 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
    >
      <div className="animate-float">
        <Flex mood={displayMood} size={80} speechBubble={speech ?? undefined} onClick={handleClick} />
      </div>
    </motion.div>
  )
}
