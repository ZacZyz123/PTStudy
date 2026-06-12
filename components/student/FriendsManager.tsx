'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconSearch,
  IconUserPlus,
  IconCheck,
  IconX,
  IconSwords,
  IconMessageCircle,
  IconClock,
} from '@tabler/icons-react'
import EmptyState from './EmptyState'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { useFlex } from '@/components/mascot/useFlex'
import { createClient } from '@/lib/supabase/client'
import { levelFromXp } from '@/lib/xp'
import type { Friendship, Profile } from '@/types/database'

const ONLINE_WINDOW_MS = 2 * 60 * 1000

interface FriendsState {
  accepted: Friendship[]
  incoming: Friendship[]
  outgoing: Friendship[]
  profiles: Profile[]
}

export default function FriendsManager({ userId }: { userId: string }) {
  const { toast } = useToast()
  const { react } = useFlex()
  const [state, setState] = useState<FriendsState>({
    accepted: [],
    incoming: [],
    outgoing: [],
    profiles: [],
  })
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/friends')
    if (res.ok) {
      setState((await res.json()) as FriendsState)
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    void load()
    const supabase = createClient()
    const channel = supabase
      .channel('friends-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  /* ---------- search ---------- */
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const timeout = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${trimmed}%`)
        .neq('id', userId)
        .limit(8)
      setResults((data as Profile[]) ?? [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, userId])

  const profileById = (id: string) => state.profiles.find((p) => p.id === id)
  const relationshipWith = (id: string): Friendship | undefined =>
    [...state.accepted, ...state.incoming, ...state.outgoing].find(
      (f) => f.requester_id === id || f.addressee_id === id
    )

  const sendRequest = async (addresseeId: string) => {
    const res = await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresseeId }),
    })
    if (res.ok) {
      toast('Friend request sent!', 'success')
      void load()
    } else {
      const data: { error?: string } = await res.json()
      toast(data.error ?? 'Could not send request', 'error')
    }
  }

  const respond = async (friendshipId: string, accept: boolean) => {
    const res = await fetch('/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendshipId, accept }),
    })
    if (res.ok && accept) {
      react('happy', 'New study buddy! 🤝')
    }
    void load()
  }

  const friendProfiles = state.accepted
    .map((f) => profileById(f.requester_id === userId ? f.addressee_id : f.requester_id))
    .filter((p): p is Profile => Boolean(p))
    .sort((a, b) => {
      const aOnline = Date.now() - new Date(a.last_seen).getTime() < ONLINE_WINDOW_MS
      const bOnline = Date.now() - new Date(b.last_seen).getTime() < ONLINE_WINDOW_MS
      return Number(bOnline) - Number(aOnline)
    })

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search classmates by name..."
          className="glass-input w-full py-3.5 pl-11 pr-4"
        />
      </div>

      {/* Search results */}
      <AnimatePresence>
        {(results.length > 0 || (query.trim().length >= 2 && !searching)) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 space-y-2"
          >
            {results.length === 0 ? (
              <p className="px-2 py-3 text-sm text-text-tertiary">No classmates found for &ldquo;{query}&rdquo;</p>
            ) : (
              results.map((p, i) => {
                const rel = relationshipWith(p.id)
                const { level } = levelFromXp(p.xp)
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card glass-card-static flex items-center gap-3 p-3.5"
                  >
                    <Avatar name={p.full_name} color={p.avatar_color} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.full_name}</p>
                      <Badge variant="sky" className="mt-0.5">Lvl {level}</Badge>
                    </div>
                    {rel?.status === 'accepted' ? (
                      <Badge variant="emerald"><IconCheck size={11} /> Friends</Badge>
                    ) : rel?.status === 'pending' ? (
                      <Badge variant="amber"><IconClock size={11} /> Pending</Badge>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => sendRequest(p.id)}
                        className="flex items-center gap-1.5 rounded-full bg-accent-sky px-4 py-2 text-xs font-bold text-bg-base shadow-[0_0_16px_rgba(56,189,248,0.4)]"
                      >
                        <IconUserPlus size={14} /> Add friend
                      </motion.button>
                    )}
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending requests */}
      {state.incoming.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-accent-amber">Friend requests</h2>
          <div className="space-y-2">
            {state.incoming.map((f, i) => {
              const p = profileById(f.requester_id)
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card glass-card-static flex items-center gap-3 p-3.5"
                >
                  <Avatar name={p?.full_name ?? '?'} color={p?.avatar_color} size={40} />
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold">{p?.full_name}</p>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => respond(f.id, true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-emerald text-bg-base shadow-glow-emerald"
                    aria-label="Accept"
                  >
                    <IconCheck size={16} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => respond(f.id, false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-red/20 text-accent-red"
                    aria-label="Decline"
                  >
                    <IconX size={16} />
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* Friends list */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">
          Your friends{' '}
          <span className="mono text-sm text-text-tertiary">({friendProfiles.length})</span>
        </h2>
        {friendProfiles.length === 0 ? (
          <EmptyState
            message={loaded ? 'No friends yet — search for your classmates above!' : 'Loading...'}
          />
        ) : (
          <div className="space-y-2">
            {friendProfiles.map((p, i) => {
              const online = Date.now() - new Date(p.last_seen).getTime() < ONLINE_WINDOW_MS
              const { level } = levelFromXp(p.xp)
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card glass-card-static flex items-center gap-3 p-3.5"
                >
                  <Avatar name={p.full_name} color={p.avatar_color} size={42} online={online} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.full_name}</p>
                    <p className="text-xs text-text-tertiary">
                      Lvl {level} · {p.xp.toLocaleString()} XP {online && '· online'}
                    </p>
                  </div>
                  <Link
                    href={`/messages/${p.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-sky/10 text-accent-sky transition-colors hover:bg-accent-sky/20"
                    aria-label="Message"
                  >
                    <IconMessageCircle size={16} />
                  </Link>
                  <Link
                    href={`/challenge?friend=${p.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-violet/10 text-accent-violet transition-colors hover:bg-accent-violet/20"
                    aria-label="Challenge"
                  >
                    <IconSwords size={16} />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
