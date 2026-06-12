'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconCheck, IconLogout } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import Flex from '@/components/mascot/Flex'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

const PERKS = [
  'AI study guides for every lecture',
  '3D flashcards & adaptive quizzes',
  'Real-time head-to-head challenges',
  'Flex, your personal AI tutor',
  'Leaderboard, XP & badges',
]

export default function PaywallPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data: { url?: string; error?: string } = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-6 flex justify-center">
          <Flex mood="sad" size={130} speechBubble="Your subscription isn't active... 😢" />
        </div>

        <GlassCard className="p-8" tilt={false} hover={false}>
          <h1 className="text-2xl font-bold">Subscription required</h1>
          <p className="mt-2 text-sm text-text-secondary">
            PT Study is <span className="font-semibold text-accent-sky">$25/month</span>. Reactivate
            to get back to studying.
          </p>

          <ul className="mt-6 space-y-3 text-left">
            {PERKS.map((perk, i) => (
              <motion.li
                key={perk}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-text-secondary"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-emerald/15 text-accent-emerald">
                  <IconCheck size={14} />
                </span>
                {perk}
              </motion.li>
            ))}
          </ul>

          {error && <p className="mt-4 text-sm text-accent-red">{error}</p>}

          <Button onClick={handleSubscribe} loading={loading} className="mt-8 w-full">
            Subscribe — $25/month
          </Button>

          <button
            onClick={handleLogout}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-text-tertiary transition-colors hover:text-text-secondary"
          >
            <IconLogout size={16} />
            Log out
          </button>
        </GlassCard>
      </motion.div>
    </main>
  )
}
