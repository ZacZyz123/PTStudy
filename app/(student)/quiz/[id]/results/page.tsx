'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconRefresh, IconBook, IconBolt, IconMedal } from '@tabler/icons-react'
import Flex from '@/components/mascot/Flex'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const COLORS = ['#38BDF8', '#7C3AED', '#10B981', '#F59E0B', '#EC4899']

function ResultsContent() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get('score') ?? '0', 10)
  const total = Math.max(parseInt(searchParams.get('total') ?? '1', 10), 1)
  const xp = parseInt(searchParams.get('xp') ?? '0', 10)
  const badges = (searchParams.get('badges') ?? '').split('|').filter(Boolean)

  const pct = Math.round((score / total) * 100)
  const perfect = score === total
  const good = pct >= 70

  const [displayXp, setDisplayXp] = useState(0)
  useEffect(() => {
    const duration = 1100
    const start = performance.now()
    let frame: number
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setDisplayXp(Math.round(xp * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [xp])

  return (
    <main className="relative mx-auto max-w-xl overflow-hidden text-center">
      {/* Confetti for perfect scores */}
      {perfect &&
        Array.from({ length: 40 }).map((_, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute h-2.5 w-2 rounded-sm"
            style={{ left: `${(i * 53) % 100}%`, top: -16, backgroundColor: COLORS[i % COLORS.length] }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: 600, rotate: 480, opacity: [1, 1, 0.4] }}
            transition={{ duration: 3.5, delay: (i % 10) * 0.25, repeat: Infinity, ease: 'linear' }}
          />
        ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <div className="flex justify-center pt-4">
          <Flex
            mood={perfect ? 'celebrating' : good ? 'happy' : 'sad'}
            size={140}
            speechBubble={
              perfect
                ? "PERFECT SCORE! You're insane! 🏆"
                : good
                  ? 'Nice work! Keep grinding 💪'
                  : "Tough one — let's review and run it back!"
            }
          />
        </div>

        <GlassCard className="mt-6 p-8" tilt={false} hover={false}>
          <p className="text-sm uppercase tracking-widest text-text-tertiary">Your score</p>
          <p
            className={`mono mt-2 text-6xl font-bold ${
              perfect ? 'text-accent-emerald' : good ? 'text-accent-sky' : 'text-accent-amber'
            }`}
          >
            {score}/{total}
          </p>
          <p className="mt-1 text-text-secondary">{pct}% correct</p>

          <div className="mt-6 flex items-center justify-center gap-2 text-accent-sky">
            <IconBolt size={20} />
            <span className="mono text-2xl font-bold">+{displayXp} XP</span>
          </div>

          {badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-2"
            >
              <IconMedal size={18} className="text-accent-pink" />
              {badges.map((name) => (
                <span key={name} className="animate-spin-once">
                  <Badge variant="pink">{name}</Badge>
                </span>
              ))}
            </motion.div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/quiz/${params.id}`}>
              <Button variant="ghost" className="w-full sm:w-auto">
                <IconRefresh size={18} /> Retake quiz
              </Button>
            </Link>
            <Link href={`/guides/${params.id}`}>
              <Button className="w-full sm:w-auto">
                <IconBook size={18} /> Review the guide
              </Button>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </main>
  )
}

export default function QuizResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  )
}
