'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IconArrowRight } from '@tabler/icons-react'
import QuizQuestion from './QuizQuestion'
import Flex, { type FlexMood } from '@/components/mascot/Flex'
import Button from '@/components/ui/Button'
import type { QuizQuestion as QuizQuestionRow, CorrectAnswer } from '@/types/database'

interface QuizRunnerProps {
  contentId: string
  questions: QuizQuestionRow[]
}

export default function QuizRunner({ contentId, questions }: QuizRunnerProps) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, CorrectAnswer>>({})
  const [selected, setSelected] = useState<CorrectAnswer | null>(null)
  const [flexState, setFlexState] = useState<{ mood: FlexMood; speech?: string }>({ mood: 'focused' })
  const [submitting, setSubmitting] = useState(false)

  const question = questions[index]
  const isLast = index === questions.length - 1

  const handleSelect = (option: CorrectAnswer) => {
    setSelected(option)
    setAnswers((a) => ({ ...a, [question.id]: option }))
    if (option === question.correct_answer) {
      setFlexState({ mood: 'happy', speech: 'Nailed it! 💪' })
    } else {
      setFlexState({ mood: 'sad', speech: 'So close! Review this one.' })
    }
  }

  const handleNext = async () => {
    if (isLast) {
      setSubmitting(true)
      const finalAnswers = { ...answers }
      try {
        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId, answers: finalAnswers }),
        })
        const data: { score: number; total: number; xpEarned: number; newBadges?: string[] } =
          await res.json()
        const badgeParam = data.newBadges?.length ? `&badges=${encodeURIComponent(data.newBadges.join('|'))}` : ''
        router.push(
          `/quiz/${contentId}/results?score=${data.score}&total=${data.total}&xp=${data.xpEarned}${badgeParam}`
        )
      } catch {
        setSubmitting(false)
      }
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setFlexState({ mood: 'focused' })
  }

  return (
    <div>
      {/* Progress + Flex */}
      <div className="mb-5 flex items-end justify-between">
        <div className="flex-1">
          <p className="mono mb-1.5 text-xs text-text-secondary">
            Question {index + 1} of {questions.length}
          </p>
          <div className="h-2 max-w-xs overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-sky to-accent-violet"
              animate={{ width: `${((index + (selected ? 1 : 0)) / questions.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
        <Flex mood={flexState.mood} size={72} speechBubble={flexState.speech} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="glass-card glass-card-static p-6"
        >
          <QuizQuestion question={question} selected={selected} onSelect={handleSelect} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex justify-end"
          >
            <Button onClick={handleNext} loading={submitting}>
              {isLast ? 'See results' : 'Next question'}
              <IconArrowRight size={18} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
