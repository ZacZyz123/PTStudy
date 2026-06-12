'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMessageCircle } from '@tabler/icons-react'
import Avatar from '@/components/ui/Avatar'
import FriendThread from '@/components/chat/FriendThread'
import { createClient } from '@/lib/supabase/client'
import type { DirectMessage, Friendship, Profile } from '@/types/database'

const ONLINE_WINDOW_MS = 2 * 60 * 1000

export interface FriendEntry {
  profile: Profile
  online: boolean
  unread: number
  lastMessage: string | null
}

export default function RightPanel({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<FriendEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [activeFriend, setActiveFriend] = useState<Profile | null>(null)

  const loadFriends = useCallback(async () => {
    const supabase = createClient()

    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

    const friendIds = ((friendships as Friendship[]) ?? []).map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    )

    if (friendIds.length === 0) {
      setFriends([])
      setLoaded(true)
      return
    }

    const [{ data: profiles }, { data: messages }] = await Promise.all([
      supabase.from('profiles').select('*').in('id', friendIds),
      supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    const now = Date.now()
    const entries: FriendEntry[] = ((profiles as Profile[]) ?? []).map((p) => {
      const thread = ((messages as DirectMessage[]) ?? []).filter(
        (m) => m.sender_id === p.id || m.receiver_id === p.id
      )
      return {
        profile: p,
        online: now - new Date(p.last_seen).getTime() < ONLINE_WINDOW_MS,
        unread: thread.filter((m) => m.sender_id === p.id && !m.is_read).length,
        lastMessage: thread[0]?.message ?? null,
      }
    })

    entries.sort((a, b) => Number(b.online) - Number(a.online) || b.unread - a.unread)
    setFriends(entries)
    setLoaded(true)
  }, [userId])

  useEffect(() => {
    loadFriends()

    const supabase = createClient()
    const channel = supabase
      .channel('right-panel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${userId}` },
        () => loadFriends()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => loadFriends()
      )
      .subscribe()

    const interval = setInterval(loadFriends, 60_000)
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [userId, loadFriends])

  const onlineFriends = friends.filter((f) => f.online)

  return (
    <aside className="fixed inset-y-0 right-0 z-30 hidden w-[300px] flex-col overflow-hidden border-l border-glass bg-bg-panel xl:flex">
      <AnimatePresence mode="wait">
        {activeFriend ? (
          <motion.div
            key="thread"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="flex h-full flex-col"
          >
            <FriendThread
              userId={userId}
              friend={activeFriend}
              onBack={() => {
                setActiveFriend(null)
                loadFriends()
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-full flex-col"
          >
            {/* Online now */}
            <div className="border-b border-glass px-5 py-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Online now
              </h3>
              {onlineFriends.length === 0 ? (
                <p className="text-sm text-text-tertiary">
                  {loaded ? 'Nobody online right now' : 'Loading...'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {onlineFriends.map((f) => (
                    <button
                      key={f.profile.id}
                      onClick={() => setActiveFriend(f.profile)}
                      className="flex flex-col items-center gap-1"
                      title={f.profile.full_name ?? ''}
                    >
                      <Avatar
                        name={f.profile.full_name}
                        color={f.profile.avatar_color}
                        size={42}
                        online
                      />
                      <span className="max-w-[56px] truncate text-[10px] text-text-secondary">
                        {f.profile.full_name?.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message threads */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Messages
              </h3>
              {friends.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-2 py-8 text-center">
                  <IconMessageCircle size={28} className="text-text-tertiary" />
                  <p className="text-sm text-text-tertiary">
                    {loaded ? 'Add friends to start chatting!' : 'Loading...'}
                  </p>
                </div>
              ) : (
                friends.map((f, i) => (
                  <motion.button
                    key={f.profile.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveFriend(f.profile)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <Avatar
                      name={f.profile.full_name}
                      color={f.profile.avatar_color}
                      size={38}
                      online={f.online}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{f.profile.full_name}</p>
                      <p className="truncate text-xs text-text-tertiary">
                        {f.lastMessage ?? 'Say hi! 👋'}
                      </p>
                    </div>
                    {f.unread > 0 && (
                      <span className="flex h-5 min-w-[20px] animate-pulse-dot items-center justify-center rounded-full bg-accent-sky px-1.5 text-[10px] font-bold text-bg-base">
                        {f.unread}
                      </span>
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}
