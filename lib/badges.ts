import { createAdminClient } from '@/lib/supabase/server'
import type { BadgeRow } from '@/types/database'

/**
 * Awards a badge by name if the user doesn't already have it.
 * Returns the badge when newly earned (for Flex celebrations).
 */
export async function awardBadge(userId: string, badgeName: string): Promise<BadgeRow | null> {
  const admin = createAdminClient()

  const { data: badge } = await admin
    .from('badges')
    .select('*')
    .eq('name', badgeName)
    .single<BadgeRow>()
  if (!badge) return null

  const { error } = await admin.from('user_badges').insert({ user_id: userId, badge_id: badge.id })
  // Unique constraint → error means already earned
  return error ? null : badge
}

/** Checks XP / stat-based badges after any XP change. Returns newly earned badges. */
export async function checkProgressBadges(userId: string): Promise<BadgeRow[]> {
  const admin = createAdminClient()
  const earned: BadgeRow[] = []

  const [{ data: profile }, { count: quizCount }, { count: winCount }, { count: friendCount }] =
    await Promise.all([
      admin.from('profiles').select('xp, streak_days').eq('id', userId).single<{ xp: number; streak_days: number }>(),
      admin.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      admin
        .from('challenges')
        .select('id', { count: 'exact', head: true })
        .eq('winner_id', userId)
        .eq('status', 'completed'),
      admin
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    ])

  const checks: Array<[boolean, string]> = [
    [(quizCount ?? 0) >= 1, 'First Quiz'],
    [(profile?.xp ?? 0) >= 1000, 'Knowledge Beast'],
    [(profile?.streak_days ?? 0) >= 3, 'Quiz Streak'],
    [(profile?.streak_days ?? 0) >= 7, '7-Day Grind'],
    [(winCount ?? 0) >= 5, 'Challenge Champion'],
    [(friendCount ?? 0) >= 5, 'Social Butterfly'],
  ]

  for (const [condition, name] of checks) {
    if (condition) {
      const badge = await awardBadge(userId, name)
      if (badge) earned.push(badge)
    }
  }
  return earned
}
