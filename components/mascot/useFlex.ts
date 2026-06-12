'use client'

import { useFlexContext } from './FlexContext'
import type { FlexMood } from './Flex'

/**
 * Convenience hook for triggering Flex reactions from anywhere in the app.
 */
export function useFlex() {
  const { mood, speech, setMood, setSpeech, triggerCelebration } = useFlexContext()

  const react = (newMood: FlexMood, text?: string, durationMs = 3000) => {
    setMood(newMood)
    if (text) setSpeech(text, durationMs)
    if (newMood !== 'idle') {
      setTimeout(() => setMood('idle'), durationMs)
    }
  }

  return { mood, speech, setMood, setSpeech, react, triggerCelebration }
}
