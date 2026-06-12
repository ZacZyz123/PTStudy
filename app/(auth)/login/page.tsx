'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconBrandGoogle } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'
import Flex from '@/components/mascot/Flex'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(searchParams.get('next') ?? '/dashboard')
    router.refresh()
  }

  const handleGoogleLogin = async () => {
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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="mb-6 flex justify-center">
        <Flex mood="waving" size={120} speechBubble="Hey! Ready to become a great PT?" />
      </div>

      <GlassCard className="p-8" tilt={false} hover={false}>
        <h1 className="mb-1 text-center text-2xl font-bold">Welcome back</h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Log in to continue your PT journey
        </p>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
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
            autoComplete="current-password"
            placeholder="••••••••"
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
            Log in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-text-tertiary">OR</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <Button type="button" variant="ghost" className="w-full" onClick={handleGoogleLogin}>
          <IconBrandGoogle size={18} />
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-text-secondary">
          New here?{' '}
          <Link href="/signup" className="font-semibold text-accent-sky hover:underline">
            Create an account
          </Link>
        </p>
      </GlassCard>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
}
