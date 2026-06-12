'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconSwords } from '@tabler/icons-react'
import ChallengeCard from './ChallengeCard'
import EmptyState from './EmptyState'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type {
  Challenge,
  ChallengeWithRelations,
  Content,
  Friendship,
  Profile,
} from '@/types/database'

export default function ChallengeHub({ userId }: { userId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [friends, setFriends] = useState<Profile[]>([])
  const [contents, setContents] = useState<Content[]>([])
  const [challenges, setChallenges] = useState<ChallengeWithRelations[]>([])
  const [selectedFriend, setSelectedFriend] = useState<string | null>(searchParams.get('friend'))
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()

    const [{ data: friendships }, { data: contentRows }, { data: challengeRows }] =
      await Promise.all([
        supabase
          .from('friendships')
          .select('*')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
        supabase
          .from('content')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('challenges')
          .select('*, challenger:profiles!challenges_challenger_id_fkey(*), challenged:profiles!challenges_challenged_id_fkey(*), content:content(*)')
          .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(25),
      ])

    const friendIds = ((friendships as Friendship[]) ?? []).map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    )
    if (friendIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', friendIds)
      setFriends((profiles as Profile[]) ?? [])
    } else {
      setFriends([])
    }

    setContents((contentRows as Content[]) ?? [])
    setChallenges((challengeRows as unknown as ChallengeWithRelations[]) ?? [])
    setLoaded(true)
  }, [userId])

  useEffect(() => {
    void load()
    const supabase = createClient()
    const channel = supabase
      .channel('challenge-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, (payload) => {
        const row = payload.new as Challenge
        if (row && (row.challenger_id === userId || row.challenged_id === userId)) void load()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, load])

  const handleCreate = async () => {
    if (!selectedFriend || !selectedContent) return
    setCreating(true)
    try {
      const res = await fetch('/api/challenge/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengedId: selectedFriend, contentId: selectedContent }),
      })
      const data: { challenge?: Challenge; error?: string } = await res.json()
      if (!res.ok || !data.challenge) throw new Error(data.error ?? 'Failed to create challenge')
      toast('Challenge sent! Play your side now 🔥', 'success')
      router.push(`/challenge/${data.challenge.id}`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create challenge', 'error')
      setCreating(false)
    }
  }

  const handleAccept = async (id: string) => {
    const supabase = createClient()
    await supabase.from('challenges').update({ status: 'accepted' }).eq('id', id)
    router.push(`/challenge/${id}`)
  }

  const handleDecline = async (id: string) => {
    const supabase = createClient()
    await supabase.from('challenges').update({ status: 'declined' }).eq('id', id)
    void load()
  }

  const incoming = challenges.filter((c) => c.status === 'pending' && c.challenged_id === userId)
  const active = challenges.filter(
    (c) =>
      (c.status === 'pending' && c.challenger_id === userId) ||
      c.status === 'accepted' ||
      c.status === 'in_progress'
  )
  const past = challenges.filter((c) => c.status === 'completed' || c.status === 'declined')

  return (
    <div>
      {/* New challenge */}
      <GlassCard className="p-6" tilt={false} hover={false}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <IconSwords size={20} className="text-accent-violet" />
          Start a challenge
        </h2>

        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Pick an opponent
        </p>
        {friends.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            {loaded ? 'Add some friends first to start challenging!' : 'Loading friends...'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {friends.map((f) => (
              <motion.button
                key={f.id}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedFriend(f.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
                  selectedFriend === f.id ? 'bg-accent-violet/20 shadow-glow-violet' : 'hover:bg-white/[0.04]'
                }`}
              >
                <Avatar name={f.full_name} color={f.avatar_color} size={44} />
                <span className="max-w-[64px] truncate text-[11px] text-text-secondary">
                  {f.full_name?.split(' ')[0]}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Pick a topic
        </p>
        <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto">
          {contents.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedContent(c.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedContent === c.id
                  ? 'border-accent-violet bg-accent-violet/20 text-accent-violet shadow-glow-violet'
                  : 'border-glass text-text-secondary hover:border-accent-violet/40'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        <Button
          className="mt-6 w-full"
          variant="secondary"
          disabled={!selectedFriend || !selectedContent}
          loading={creating}
          onClick={handleCreate}
        >
          <IconSwords size={18} />
          Send challenge
        </Button>
      </GlassCard>

      {/* Incoming */}
      {incoming.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-accent-amber">Incoming challenges</h2>
          <div className="space-y-3">
            {incoming.map((c, i) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                userId={userId}
                index={i}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active */}
      {active.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">In progress</h2>
          <div className="space-y-3">
            {active.map((c, i) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                userId={userId}
                index={i}
                onPlay={(id) => router.push(`/challenge/${id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* History */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">History</h2>
        {past.length === 0 ? (
          <EmptyState message="No battles yet — challenge a friend and earn 100 XP!" />
        ) : (
          <div className="space-y-3">
            {past.map((c, i) => (
              <ChallengeCard key={c.id} challenge={c} userId={userId} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
