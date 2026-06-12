'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { IconRefresh } from '@tabler/icons-react'
import Flex from '@/components/mascot/Flex'
import Button from '@/components/ui/Button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <Flex mood="sad" size={130} speechBubble="Oof, something broke..." />
        <h1 className="mt-5 text-xl font-bold">Something went wrong</h1>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          Flex tripped over a wire. Try again — if it keeps happening, refresh the page.
        </p>
        <Button onClick={reset} className="mt-5">
          <IconRefresh size={18} />
          Try again
        </Button>
      </motion.div>
    </main>
  )
}
