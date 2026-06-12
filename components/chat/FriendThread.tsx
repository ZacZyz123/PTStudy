'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IconArrowLeft, IconSwords } from '@tabler/icons-react'
import Avatar from '@/components/ui/Avatar'
import MessageBubble, { TypingIndicator } from './MessageBubble'
import ChatInput from './ChatInput'
import OnlineIndicator from './OnlineIndicator'
import { createClient } from '@/lib/supabase/client'
import type { DirectMessage, Profile } from '@/types/database'

const ONLINE_WINDOW_MS = 2 * 60 * 1000

interface FriendThreadProps {
  userId: string
  friend: Profile
  onBack?: () => void
}

/**
 * Real-time DM thread — used inside the desktop right panel and the
 * full-page mobile messages view.
 */
export default function FriendThread({ userId, friend, onBack }: FriendThreadProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [friendTyping, setFriendTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSent = useRef(0)

  const online = Date.now() - new Date(friend.last_seen).getTime() < ONLINE_WINDOW_MS

  const markRead = useCallback(async () => {
    const supabase = createClient()
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('sender_id', friend.id)
      .eq('receiver_id', userId)
      .eq('is_read', false)
  }, [friend.id, userId])

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    const load = async () => {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${userId})`
        )
        .order('created_at', { ascending: true })
        .limit(100)
      if (!cancelled) setMessages((data as DirectMessage[]) ?? [])
      void markRead()
    }
    void load()

    const channel = supabase
      .channel(`dm-${userId}-${friend.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const msg = payload.new as DirectMessage
          const inThread =
            (msg.sender_id === userId && msg.receiver_id === friend.id) ||
            (msg.sender_id === friend.id && msg.receiver_id === userId)
          if (!inThread) return
          setMessages((current) =>
            current.some((m) => m.id === msg.id) ? current : [...current, msg]
          )
          if (msg.sender_id === friend.id) {
            setFriendTyping(false)
            void markRead()
          }
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.from !== friend.id) return
        setFriendTyping(true)
        if (typingTimeout.current) clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => setFriendTyping(false), 2500)
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId, friend.id, markRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, friendTyping])

  const handleSend = async (text: string) => {
    const supabase = createClient()
    const optimistic: DirectMessage = {
      id: `optimistic-${Date.now()}`,
      sender_id: userId,
      receiver_id: friend.id,
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages((current) => [...current, optimistic])

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({ sender_id: userId, receiver_id: friend.id, message: text })
      .select()
      .single()

    if (error) {
      setMessages((current) => current.filter((m) => m.id !== optimistic.id))
    } else if (data) {
      setMessages((current) =>
        current.map((m) => (m.id === optimistic.id ? (data as DirectMessage) : m))
      )
    }
  }

  const handleTyping = () => {
    const now = Date.now()
    if (now - lastTypingSent.current < 1500) return
    lastTypingSent.current = now
    const supabase = createClient()
    void supabase.channel(`dm-${friend.id}-${userId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { from: userId },
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-glass px-4 py-3.5">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            aria-label="Back"
          >
            <IconArrowLeft size={18} />
          </button>
        )}
        <Avatar name={friend.full_name} color={friend.avatar_color} size={36} online={online} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{friend.full_name}</p>
          <OnlineIndicator online={online} />
        </div>
        <Link
          href={`/challenge?friend=${friend.id}`}
          className="flex items-center gap-1.5 rounded-full bg-accent-violet/15 px-3 py-1.5 text-xs font-semibold text-accent-violet transition-colors hover:bg-accent-violet/25"
        >
          <IconSwords size={14} />
          Challenge
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-text-tertiary">
            No messages yet — say hi to {friend.full_name?.split(' ')[0]}! 👋
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m.message}
            mine={m.sender_id === userId}
            timestamp={m.created_at}
          />
        ))}
        {friendTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-glass p-3">
        <ChatInput onSend={handleSend} onTyping={handleTyping} />
      </div>
    </div>
  )
}
