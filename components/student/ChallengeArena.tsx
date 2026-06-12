'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { IconSwords, IconArrowLeft } from '@tabler/icons-react'
import QuizQuestion from './QuizQuestion'
import CountdownRing from './CountdownRing'
import Flex from '@/components/mascot/Flex'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import { createClient } from '@/lib/supabase/client'
import type {
  Challenge,
  ChallengeWithRelations,
  CorrectAnswer,
  QuizQuestion as QuizQuestionRow,
} from '@/types/database'

const SECONDS_PER_QUESTION = 20

interface ChallengeArenaProps {
  challenge: ChallengeWithRelations
  questions: QuizQuestionRow[]
  userId: string
}

type Phase = 'quiz' | 'waiting' | 'results'

export default function ChallengeArena({ challenge: initial, questions, userId }: ChallengeArenaProps) {
  const isChallenger = initial.challenger_id === userId
  const opponent = isChallenger ? initial.challenged : initial.challenger
  const me = isChallenger ? initial.challenger : initial.challenged

  const myInitialScore = isChallenger ? initial.challenger_score : initial.challenged_score
  const alreadyPlayed = myInitialScore !== null

  const [phase, setPhase] = useState<Phase>(
    initial.status === 'completed' ? 'results' : alreadyPlayed ? 'waiting' : 'quiz'
  )
  const [challenge, setChallenge] = useState<ChallengeWithRelations>(initial)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<CorrectAnswer | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION)
  const [opponentProgress, setOpponentProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const answersRef = useRef<Record<string, string>>({})
  const indexRef = useRef(0)
  const selectedRef = useRef<CorrectAnswer | null>(null)

  /* ---------- realtime: opponent progress + completion ---------- */
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`challenge-${initial.id}`)
      .on('broadcast', { event: 'progress' }, (payload) => {
        if (payload.payload?.userId !== userId) {
          setOpponentProgress(Number(payload.payload?.answered ?? 0))
        }
      })
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'challenges', filter: `id=eq.${initial.id}` },
        (payload) => {
          const row = payload.new as Challenge
          setChallenge((c) => ({ ...c, ...row }))
          if (row.status === 'completed') setPhase('results')
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [initial.id, userId])

  const broadcastProgress = useCallback(
    (answered: number) => {
      const supabase = createClient()
      void supabase.channel(`challenge-${initial.id}`).send({
        type: 'broadcast',
        event: 'progress',
        payload: { userId, answered },
      })
    },
    [initial.id, userId]
  )

  /* ---------- submit ---------- */
  const submit = useCallback(async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/challenge/${initial.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersRef.current }),
      })
      const data: {
        finished?: boolean
        winnerId?: string | null
        challengerScore?: number
        challengedScore?: number
        score?: number
      } = await res.json()

      if (data.finished) {
        setChallenge((c) => ({
          ...c,
          status: 'completed',
          winner_id: data.winnerId ?? null,
          challenger_score: data.challengerScore ?? c.challenger_score,
          challenged_score: data.challengedScore ?? c.challenged_score,
        }))
        setPhase('results')
      } else {
        setChallenge((c) => ({
          ...c,
          status: 'in_progress',
          ...(isChallenger
            ? { challenger_score: data.score ?? 0 }
            : { challenged_score: data.score ?? 0 }),
        }))
        setPhase('waiting')
      }
    } finally {
      setSubmitting(false)
    }
  }, [initial.id, isChallenger])

  /* ---------- advance ---------- */
  const advance = useCallback(() => {
    const nextIndex = indexRef.current + 1
    broadcastProgress(nextIndex)
    if (nextIndex >= questions.length) {
      void submit()
      return
    }
    indexRef.current = nextIndex
    setIndex(nextIndex)
    setSelected(null)
    selectedRef.current = null
    setSecondsLeft(SECONDS_PER_QUESTION)
  }, [questions.length, broadcastProgress, submit])

  /* ---------- timer ---------- */
  useEffect(() => {
    if (phase !== 'quiz') return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Time's up: lock the (possibly missing) answer and move on
          setTimeout(advance, 0)
          return SECONDS_PER_QUESTION
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, index, advance])

  const handleSelect = (option: CorrectAnswer) => {
    if (selectedRef.current) return
    selectedRef.current = option
    setSelected(option)
    answersRef.current[questions[index].id] = option
    // Brief beat to show the bloom/shake, then advance
    setTimeout(advance, 1300)
  }

  /* ---------- views ---------- */
  if (phase === 'results') {
    const myScore = (isChallenger ? challenge.challenger_score : challenge.challenged_score) ?? 0
    const theirScore = (isChallenger ? challenge.challenged_score : challenge.challenger_score) ?? 0
    const won = challenge.winner_id === userId
    const tied = challenge.winner_id === null

    return (
      <div className="text-center">
        <div className="flex justify-center">
          <Flex
            mood={won ? 'celebrating' : tied ? 'surprised' : 'sad'}
            size={130}
            speechBubble={won ? "W! You're built different 🔥" : tied ? 'A tie?! Run it back!' : 'GGs — run it back!'}
          />
        </div>

        {/* Split-screen score */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass-card glass-card-static flex flex-col items-center gap-2 p-6 ${
              won ? '!border-accent-emerald/50 shadow-glow-emerald' : ''
            }`}
          >
            <Avatar name={me?.full_name ?? 'You'} color={me?.avatar_color} size={52} />
            <p className="text-sm font-semibold">You</p>
            <p className={`mono text-4xl font-bold ${won ? 'text-accent-emerald' : 'text-text-primary'}`}>
              {myScore}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass-card glass-card-static flex flex-col items-center gap-2 p-6 ${
              !won && !tied ? '!border-accent-emerald/50 shadow-glow-emerald' : ''
            }`}
          >
            <Avatar name={opponent?.full_name ?? '?'} color={opponent?.avatar_color} size={52} />
            <p className="text-sm font-semibold">{opponent?.full_name?.split(' ')[0]}</p>
            <p className={`mono text-4xl font-bold ${!won && !tied ? 'text-accent-emerald' : 'text-text-primary'}`}>
              {theirScore}
            </p>
          </motion.div>
        </div>

        <p className="mt-5 text-sm text-text-secondary">
          {won ? '+100 XP for the win!' : tied ? '+25 XP each — dead even.' : '+25 XP for the effort.'}
        </p>

        <Link href="/challenge" className="mt-6 inline-block">
          <Button>
            <IconSwords size={18} /> Back to challenges
          </Button>
        </Link>
      </div>
    )
  }

  if (phase === 'waiting') {
    return (
      <div className="text-center">
        <div className="flex justify-center">
          <Flex mood="thinking" size={130} speechBubble="Waiting for your opponent..." />
        </div>
        <GlassCard className="mt-6 p-6" tilt={false} hover={false}>
          <p className="font-semibold">Your answers are in! 🔒</p>
          <p className="mt-1 text-sm text-text-secondary">
            We&apos;ll show the results the moment {opponent?.full_name?.split(' ')[0] ?? 'your opponent'}{' '}
            finishes. You can leave this page — the result lands in your challenge history.
          </p>
        </GlassCard>
        <Link href="/challenge" className="mt-6 inline-block">
          <Button variant="ghost">
            <IconArrowLeft size={16} /> Back to challenge hub
          </Button>
        </Link>
      </div>
    )
  }

  /* quiz phase */
  const question = questions[index]
  return (
    <div>
      {/* HUD: timer + opponent progress */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <CountdownRing secondsLeft={secondsLeft} totalSeconds={SECONDS_PER_QUESTION} />
        <div className="flex-1">
          <p className="mono text-xs text-text-secondary">
            Question {index + 1}/{questions.length}
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full bg-accent-sky"
              animate={{ width: `${(index / questions.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={opponent?.full_name ?? '?'} color={opponent?.avatar_color} size={20} />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full bg-accent-violet"
                animate={{ width: `${(opponentProgress / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="mono text-[10px] text-text-tertiary">
              {opponentProgress}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22 }}
          className="glass-card glass-card-static p-6"
        >
          <QuizQuestion question={question} selected={selected} onSelect={handleSelect} />
        </motion.div>
      </AnimatePresence>

      {submitting && (
        <p className="mt-4 text-center text-sm text-text-secondary">Locking in your answers...</p>
      )}
    </div>
  )
}
