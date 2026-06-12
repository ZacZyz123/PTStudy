'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconHome } from '@tabler/icons-react'
import Flex from '@/components/mascot/Flex'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="flex flex-col items-center"
      >
        <Flex mood="surprised" size={150} speechBubble="Whoa, how'd you end up here?!" />
        <h1 className="mono mt-6 text-6xl font-bold text-accent-sky">404</h1>
        <p className="mt-2 text-text-secondary">This page doesn&apos;t exist — but your dashboard does.</p>
        <Link href="/dashboard" className="mt-6">
          <Button>
            <IconHome size={18} />
            Take me home
          </Button>
        </Link>
      </motion.div>
    </main>
  )
}
