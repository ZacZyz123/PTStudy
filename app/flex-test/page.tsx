'use client'

import Flex, { type FlexMood } from '@/components/mascot/Flex'
import GlassCard from '@/components/ui/GlassCard'

const MOODS: FlexMood[] = [
  'idle',
  'happy',
  'excited',
  'thinking',
  'sad',
  'celebrating',
  'focused',
  'surprised',
  'waving',
  'sleeping',
]

/** Dev page to verify every Flex mood renders and animates correctly. */
export default function FlexTestPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-8 text-3xl font-bold">Flex — All 10 Moods</h1>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {MOODS.map((mood) => (
          <GlassCard key={mood} className="flex flex-col items-center gap-3 p-6" tilt={false} hover={false}>
            <Flex mood={mood} size={110} speechBubble={mood === 'waving' ? 'Hey! 👋' : undefined} />
            <span className="mono text-sm text-accent-sky">{mood}</span>
          </GlassCard>
        ))}
      </div>
    </main>
  )
}
