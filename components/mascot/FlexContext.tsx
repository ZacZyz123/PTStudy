'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { FlexMood } from './Flex'

interface FlexContextType {
  mood: FlexMood
  speech: string | null
  setMood: (mood: FlexMood) => void
  setSpeech: (text: string, durationMs?: number) => void
  triggerCelebration: () => void
}

const CELEBRATION_LINES = [
  "LET'S GOOO! 🔥",
  "You're built different 💪",
  'Absolutely crushing it! 🏆',
  'Flex is SO proud of you!',
  'PT legend in the making! ⚡',
]

const FlexContext = createContext<FlexContextType | null>(null)

export function FlexProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMoodState] = useState<FlexMood>('idle')
  const [speech, setSpeechState] = useState<string | null>(null)
  const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setMood = useCallback((m: FlexMood) => {
    if (moodTimer.current) clearTimeout(moodTimer.current)
    setMoodState(m)
  }, [])

  const setSpeech = useCallback((text: string, durationMs = 3000) => {
    if (speechTimer.current) clearTimeout(speechTimer.current)
    setSpeechState(text)
    speechTimer.current = setTimeout(() => setSpeechState(null), durationMs)
  }, [])

  const triggerCelebration = useCallback(() => {
    if (moodTimer.current) clearTimeout(moodTimer.current)
    if (speechTimer.current) clearTimeout(speechTimer.current)
    setMoodState('excited')
    setSpeechState(CELEBRATION_LINES[Math.floor(Math.random() * CELEBRATION_LINES.length)])
    moodTimer.current = setTimeout(() => setMoodState('idle'), 4000)
    speechTimer.current = setTimeout(() => setSpeechState(null), 4000)
  }, [])

  return (
    <FlexContext.Provider value={{ mood, speech, setMood, setSpeech, triggerCelebration }}>
      {children}
    </FlexContext.Provider>
  )
}

export function useFlexContext(): FlexContextType {
  const ctx = useContext(FlexContext)
  if (!ctx) throw new Error('useFlexContext must be used within FlexProvider')
  return ctx
}
