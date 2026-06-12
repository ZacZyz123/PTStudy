'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import RightPanel from './RightPanel'
import FlexCorner from '@/components/mascot/FlexCorner'
import { FlexProvider } from '@/components/mascot/FlexContext'
import { ToastProvider } from '@/components/ui/Toast'
import type { Profile } from '@/types/database'

interface AppShellProps {
  profile: Profile
  children: React.ReactNode
}

/**
 * Three-column app shell: fixed sidebar (220px), scrollable main column,
 * fixed right panel (300px, ≥xl). Mobile gets a bottom tab bar instead.
 * Route changes slide in from the right and fade out to the left.
 */
export default function AppShell({ profile, children }: AppShellProps) {
  const pathname = usePathname()

  return (
    <FlexProvider>
      <ToastProvider>
        <div className="min-h-screen">
          <Sidebar profile={profile} />

          <main className="min-h-screen pb-24 lg:ml-[220px] lg:pb-8 xl:mr-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          <RightPanel userId={profile.id} />
          <MobileNav />
          <FlexCorner />
        </div>
      </ToastProvider>
    </FlexProvider>
  )
}
