'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import FriendThread from '@/components/chat/FriendThread'
import type { Profile } from '@/types/database'

/** Full-screen chat thread for mobile, sliding in from the right. */
export default function MobileThread({ userId, friend }: { userId: string; friend: Profile }) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="glass-card glass-card-static flex h-[calc(100vh-180px)] min-h-[420px] flex-col overflow-hidden !p-0"
    >
      <FriendThread userId={userId} friend={friend} onBack={() => router.push('/messages')} />
    </motion.div>
  )
}
