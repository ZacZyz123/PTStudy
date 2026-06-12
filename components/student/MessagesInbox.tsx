'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import EmptyState from './EmptyState'
import Avatar from '@/components/ui/Avatar'
import { relativeTime } from '@/components/chat/MessageBubble'
import { createClient } from '@/lib/supabase/client'
import type { DirectMessage, Friendship, Profile } from '@/types/database'

const ONLINE_WINDOW_MS = 2 * 60 * 1000

interface Thread {
  profile: Profile
  online: boolean
  unread: number
  lastMessage: DirectMessage | null
}

/** Full-page DM inbox (mobile-first; desktop users get the right panel too). */
export default function MessagesInbox({ userId }: { userId: string }) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
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
      setThreads([])
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
        .limit(300),
    ])

    const now = Date.now()
    const list: Thread[] = ((profiles as Profile[]) ?? []).map((p) => {
      const thread = ((messages as DirectMessage[]) ?? []).filter(
        (m) => m.sender_id === p.id || m.receiver_id === p.id
      )
      return {
        profile: p,
        online: now - new Date(p.last_seen).getTime() < ONLINE_WINDOW_MS,
        unread: thread.filter((m) => m.sender_id === p.id && !m.is_read).length,
        lastMessage: thread[0] ?? null,
      }
    })

    list.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
      const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0
      return b.unread - a.unread || bTime - aTime
    })
    setThreads(list)
    setLoaded(true)
  }, [userId])

  useEffect(() => {
    void load()
    const supabase = createClient()
    const channel = supabase
      .channel('messages-inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        () => load()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  if (loaded && threads.length === 0) {
    return <EmptyState message="No conversations yet — add friends to start chatting!" />
  }

  return (
    <div className="space-y-2">
      {threads.map((t, i) => (
        <motion.div
          key={t.profile.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={`/messages/${t.profile.id}`}
            className="glass-card glass-card-static flex items-center gap-3 p-4"
          >
            <Avatar name={t.profile.full_name} color={t.profile.avatar_color} size={46} online={t.online} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold">{t.profile.full_name}</p>
                {t.lastMessage && (
                  <span className="shrink-0 text-[10px] text-text-tertiary">
                    {relativeTime(t.lastMessage.created_at)}
                  </span>
                )}
              </div>
              <p className={`truncate text-xs ${t.unread > 0 ? 'font-semibold text-text-primary' : 'text-text-tertiary'}`}>
                {t.lastMessage
                  ? `${t.lastMessage.sender_id === userId ? 'You: ' : ''}${t.lastMessage.message}`
                  : 'Say hi! 👋'}
              </p>
            </div>
            {t.unread > 0 && (
              <span className="flex h-5 min-w-[20px] animate-pulse-dot items-center justify-center rounded-full bg-accent-sky px-1.5 text-[10px] font-bold text-bg-base">
                {t.unread}
              </span>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
