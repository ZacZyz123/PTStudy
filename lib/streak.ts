import { createAdminClient } from '@/lib/supabase/server'
import { XP_REWARDS } from '@/lib/xp'
import type { Profile } from '@/types/database'

/**
 * Daily login bookkeeping: bumps streak, awards daily login XP and
 * streak bonuses. Runs at most once per day per user. Returns the
 * fresh profile and what was awarded (for Flex celebrations).
 */
export async function recordDailyActivity(
  userId: string
): Promise<{ profile: Profile | null; awarded: number; streak: number; streakBonus: boolean }> {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single<Profile>()

  if (!profile) return { profile: null, awarded: 0, streak: 0, streakBonus: false }

  const today = new Date().toISOString().slice(0, 10)
  if (profile.last_active_date === today) {
    return { profile, awarded: 0, streak: profile.streak_days, streakBonus: false }
  }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const newStreak = profile.last_active_date === yesterday ? profile.streak_days + 1 : 1

  let awarded = XP_REWARDS.DAILY_LOGIN
  let streakBonus = false
  if (newStreak === 3) {
    awarded += XP_REWARDS.STREAK_3_DAY
    streakBonus = true
  } else if (newStreak === 7) {
    awarded += XP_REWARDS.STREAK_7_DAY
    streakBonus = true
  }

  const { data: updated } = await admin
    .from('profiles')
    .update({
      xp: profile.xp + awarded,
      streak_days: newStreak,
      last_active_date: today,
    })
    .eq('id', userId)
    .select()
    .single<Profile>()

  return { profile: updated ?? profile, awarded, streak: newStreak, streakBonus }
}
