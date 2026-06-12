'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Flex from '@/components/mascot/Flex'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

export default function PaymentCancelPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRetry = async () => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data: { url?: string; error?: string } = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Could not restart checkout.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-6 flex justify-center">
          <Flex mood="sad" size={130} speechBubble="Aw... you were so close!" />
        </div>

        <GlassCard className="p-8" tilt={false} hover={false}>
          <h1 className="text-2xl font-bold">Checkout canceled</h1>
          <p className="mt-3 text-sm text-text-secondary">
            No worries — your account is saved. Subscribe whenever you&apos;re ready to start
            studying.
          </p>
          {error && <p className="mt-4 text-sm text-accent-red">{error}</p>}
          <Button onClick={handleRetry} loading={loading} className="mt-8 w-full">
            Try again — $25/month
          </Button>
        </GlassCard>
      </motion.div>
    </main>
  )
}
