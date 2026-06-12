'use client'

import { motion } from 'framer-motion'
import type { QuizQuestion as QuizQuestionRow, CorrectAnswer } from '@/types/database'

interface QuizQuestionProps {
  question: QuizQuestionRow
  selected: CorrectAnswer | null
  onSelect: (option: CorrectAnswer) => void
}

const OPTIONS: CorrectAnswer[] = ['A', 'B', 'C', 'D']

/**
 * One quiz question. After selection: the correct answer blooms green with
 * a pulse glow; a wrong pick shakes red.
 */
export default function QuizQuestion({ question, selected, onSelect }: QuizQuestionProps) {
  const optionText: Record<CorrectAnswer, string> = {
    A: question.option_a,
    B: question.option_b,
    C: question.option_c,
    D: question.option_d,
  }

  const answered = selected !== null

  return (
    <div>
      <h2 className="text-lg font-semibold leading-relaxed sm:text-xl">{question.question}</h2>

      <div className="mt-5 flex flex-col gap-3">
        {OPTIONS.map((option, i) => {
          const isCorrect = option === question.correct_answer
          const isSelected = option === selected

          let stateClasses = 'border-glass bg-white/[0.03] hover:border-accent-sky/50 hover:bg-accent-sky/5'
          let animateClass = ''
          if (answered) {
            if (isCorrect) {
              stateClasses = 'border-accent-emerald bg-accent-emerald/15 text-accent-emerald'
              animateClass = 'animate-pulse-glow'
            } else if (isSelected) {
              stateClasses = 'border-accent-red bg-accent-red/15 text-accent-red'
              animateClass = 'animate-shake'
            } else {
              stateClasses = 'border-glass bg-white/[0.02] opacity-50'
            }
          }

          return (
            <motion.button
              key={option}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              whileHover={answered ? undefined : { scale: 1.015 }}
              whileTap={answered ? undefined : { scale: 0.985 }}
              disabled={answered}
              onClick={() => onSelect(option)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-colors duration-300 sm:text-base ${stateClasses} ${animateClass}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  answered && isCorrect
                    ? 'bg-accent-emerald text-bg-base'
                    : answered && isSelected
                      ? 'bg-accent-red text-white'
                      : 'bg-white/10 text-text-secondary'
                }`}
              >
                {option}
              </span>
              {optionText[option]}
            </motion.button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card glass-card-static mt-5 p-4 text-sm text-text-secondary"
        >
          <span className="font-semibold text-accent-sky">Why: </span>
          {question.explanation}
        </motion.div>
      )}
    </div>
  )
}
