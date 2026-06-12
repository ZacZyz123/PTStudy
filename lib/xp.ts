export const XP_REWARDS = {
  CORRECT_ANSWER: 10,
  QUIZ_COMPLETE: 20,
  PERFECT_SCORE: 50,
  CHALLENGE_WIN: 100,
  CHALLENGE_LOSS: 25,
  DAILY_LOGIN: 10,
  READ_GUIDE: 5,
  FRIEND_ACCEPTED: 15,
  STREAK_3_DAY: 30,
  STREAK_7_DAY: 75,
} as const

/** Level thresholds: level N requires N*150 XP beyond the previous level. */
export function levelFromXp(xp: number): { level: number; current: number; needed: number; progress: number } {
  let level = 1
  let remaining = xp
  let needed = 150
  while (remaining >= needed) {
    remaining -= needed
    level += 1
    needed = level * 150
  }
  return { level, current: remaining, needed, progress: Math.min(remaining / needed, 1) }
}

export function levelTitle(level: number): string {
  if (level >= 20) return 'PT Legend'
  if (level >= 15) return 'Movement Master'
  if (level >= 10) return 'Clinical Ace'
  if (level >= 6) return 'Anatomy Adept'
  if (level >= 3) return 'Study Grinder'
  return 'Fresh DPT'
}
