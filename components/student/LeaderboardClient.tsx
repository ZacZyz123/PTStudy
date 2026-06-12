'use client'

import { useEffect, useState } from 'react'
import LeaderboardRow from './LeaderboardRow'
import EmptyState from './EmptyState'
import { SkeletonRow } from '@/components/ui/Skeleton'
import type { Profile } from '@/types/database'

export default function LeaderboardClient({ userId }: { userId: string }) {
  const [leaders, setLeaders] = useState<Profile[] | null>(null)

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/leaderboard')
      if (res.ok) {
        const data: { leaders: Profile[] } = await res.json()
        setLeaders(data.leaders)
      } else {
        setLeaders([])
      }
    })()
  }, [])

  if (leaders === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card glass-card-static">
            <SkeletonRow />
          </div>
        ))}
      </div>
    )
  }

  if (leaders.length === 0) {
    return <EmptyState message="No rankings yet — take a quiz to get on the board!" />
  }

  const myRank = leaders.findIndex((p) => p.id === userId) + 1

  return (
    <div>
      {myRank > 0 && (
        <p className="mb-4 text-sm text-text-secondary">
          You&apos;re ranked <span className="mono font-bold text-accent-sky">#{myRank}</span> of{' '}
          {leaders.length}
        </p>
      )}
      <div className="space-y-2">
        {leaders.map((profile, i) => (
          <LeaderboardRow
            key={profile.id}
            profile={profile}
            rank={i + 1}
            isMe={profile.id === userId}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
