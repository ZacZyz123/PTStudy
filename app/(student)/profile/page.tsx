import {
  IconFlame,
  IconBolt,
  IconBrain,
  IconSwords,
  IconMedal,
} from '@tabler/icons-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/student/StatCard'
import XPBar from '@/components/student/XPBar'
import BadgeGrid from '@/components/student/BadgeGrid'
import BillingButton from '@/components/student/BillingButton'
import { createClient } from '@/lib/supabase/server'
import { levelFromXp, levelTitle } from '@/lib/xp'
import type { BadgeRow, Profile, UserBadge } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: allBadges }, { data: myBadges }, { count: quizCount }, { count: winCount }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single<Profile>(),
      supabase.from('badges').select('*').order('name'),
      supabase.from('user_badges').select('*').eq('user_id', user.id),
      supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase
        .from('challenges')
        .select('id', { count: 'exact', head: true })
        .eq('winner_id', user.id)
        .eq('status', 'completed'),
    ])

  if (!profile) return null
  const { level } = levelFromXp(profile.xp)
  const earnedIds = new Set(((myBadges as UserBadge[]) ?? []).map((b) => b.badge_id))

  const subActive = profile.subscription_status === 'active'

  return (
    <div>
      {/* Header card */}
      <div className="glass-card glass-card-static flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <Avatar name={profile.full_name} color={profile.avatar_color} size={84} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          <p className="text-sm text-text-secondary">{profile.email}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge variant="sky">Lvl {level} — {levelTitle(level)}</Badge>
            <Badge variant={subActive ? 'emerald' : 'red'}>
              {subActive ? 'Subscription active' : `Subscription ${profile.subscription_status}`}
            </Badge>
            {profile.streak_days >= 3 && (
              <Badge variant="amber">
                <IconFlame size={11} /> {profile.streak_days}-day streak
              </Badge>
            )}
          </div>
        </div>
        <BillingButton />
      </div>

      {/* XP */}
      <div className="glass-card glass-card-static mt-4 p-5">
        <XPBar xp={profile.xp} />
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total XP" value={profile.xp} icon={<IconBolt size={22} />} color="sky" />
        <StatCard label="Day streak" value={profile.streak_days} icon={<IconFlame size={22} />} color="amber" />
        <StatCard label="Quizzes taken" value={quizCount ?? 0} icon={<IconBrain size={22} />} color="violet" />
        <StatCard label="Challenge wins" value={winCount ?? 0} icon={<IconSwords size={22} />} color="emerald" />
      </div>

      {/* Badges */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <IconMedal size={20} className="text-accent-pink" />
          <h2 className="text-lg font-bold">
            Badges{' '}
            <span className="mono text-sm text-text-tertiary">
              ({earnedIds.size}/{(allBadges as BadgeRow[])?.length ?? 0})
            </span>
          </h2>
        </div>
        <BadgeGrid allBadges={(allBadges as BadgeRow[]) ?? []} earnedIds={earnedIds} />
      </section>
    </div>
  )
}
