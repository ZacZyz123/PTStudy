'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconBrandGoogle } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'
import Flex from '@/components/mascot/Flex'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const startCheckout = async () => {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data: { url?: string; error?: string } = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Could not start checkout. Please try again from the paywall page.')
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Straight into Stripe checkout for the $25/month subscription
    await startCheckout()
  }

  const handleGoogleSignup = async () => {
    setError(null)
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (oauthError) setError(oauthError.message)
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <Flex mood="excited" size={120} speechBubble="Welcome! I'm Flex, your study buddy!" />
        </div>

        <GlassCard className="p-8" tilt={false} hover={false}>
          <h1 className="mb-1 text-center text-2xl font-bold">Create your account</h1>
          <p className="mb-6 text-center text-sm text-text-secondary">
            $25/month — everything you need to crush PT school
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="Full name"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Alex Carter"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@mayo.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-accent-red/10 px-4 py-2 text-sm text-accent-red"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" loading={loading} className="mt-2 w-full">
              Sign up &amp; subscribe
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-text-tertiary">OR</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <Button type="button" variant="ghost" className="w-full" onClick={handleGoogleSignup}>
            <IconBrandGoogle size={18} />
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-accent-sky hover:underline">
              Log in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </main>
  )
}
