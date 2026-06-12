'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Flex from '@/components/mascot/Flex'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  color: string
  rotate: number
}

const COLORS = ['#38BDF8', '#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#EF4444']

export default function PaymentSuccessPage() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    setConfetti(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2.5,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      }))
    )
  }, [])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* falling confetti */}
      {confetti.map((piece) => (
        <motion.span
          key={piece.id}
          className="pointer-events-none absolute top-[-20px] h-3 w-2 rounded-sm"
          style={{ left: `${piece.x}%`, backgroundColor: piece.color }}
          initial={{ y: -30, rotate: piece.rotate, opacity: 1 }}
          animate={{ y: '110vh', rotate: piece.rotate + 540, opacity: [1, 1, 0.6] }}
          transition={{ duration: 4.5, delay: piece.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-6 flex justify-center">
          <Flex mood="celebrating" size={140} speechBubble="You're in! LET'S GOOO! 🎉" />
        </div>

        <GlassCard className="p-8" tilt={false} hover={false}>
          <h1 className="text-3xl font-bold text-accent-emerald">Payment successful!</h1>
          <p className="mt-3 text-text-secondary">
            Welcome to PT Study. Your subscription is active — time to start crushing PT school.
          </p>
          <Link href="/dashboard" className="mt-8 block">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </GlassCard>
      </motion.div>
    </main>
  )
}
