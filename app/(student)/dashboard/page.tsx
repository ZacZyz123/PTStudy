import Link from 'next/link'
import {
  IconBolt,
  IconBrain,
  IconFlame,
  IconTargetArrow,
  IconChevronRight,
  IconAlertTriangle,
  IconBook,
} from '@tabler/icons-react'
import ParticleBackground from '@/components/ui/ParticleBackground'
import StatCard from '@/components/student/StatCard'
import ExamBanner from '@/components/student/ExamBanner'
import XPBar from '@/components/student/XPBar'
import GuideCard from '@/components/student/GuideCard'
import { createClient } from '@/lib/supabase/server'
import { recordDailyActivity } from '@/lib/streak'
import type { Content, Exam, QuizAttempt } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Daily login XP + streak (no-op if already counted today)
  const { profile } = await recordDailyActivity(user.id)

  const today = new Date().toISOString().slice(0, 10)
  const [{ data: attempts }, { data: exams }, { data: priorityContent }, { data: recentContent }] =
    await Promise.all([
      supabase.from('quiz_attempts').select('*').eq('user_id', user.id),
      supabase.from('exams').select('*').gte('exam_date', today).order('exam_date').limit(1),
      supabase
        .from('content')
        .select('*')
        .eq('is_published', true)
        .eq('is_exam_priority', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4),
    ])

  const attemptList = (attempts as QuizAttempt[]) ?? []
  const quizzesTaken = attemptList.length
  const avgScore =
    quizzesTaken > 0
      ? Math.round(
          (attemptList.reduce((sum, a) => sum + (a.score ?? 0) / Math.max(a.total_questions ?? 1, 1), 0) /
            quizzesTaken) *
            100
        )
      : 0

  const nextExam = (exams as Exam[])?.[0]
  const priority = (priorityContent as Content[]) ?? []
  const recent = ((recentContent as Content[]) ?? []).filter(
    (c) => !priority.some((p) => p.id === c.id)
  )

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student'

  return (
    <div className="relative">
      <ParticleBackground />

      <h1 className="text-2xl font-bold sm:text-3xl">
        Welcome back, <span className="text-accent-sky">{firstName}</span> 👋
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {nextExam ? 'An exam is coming up — time to lock in.' : "Let's get some studying in today."}
      </p>

      {/* XP */}
      <div className="glass-card glass-card-static mt-6 p-5">
        <XPBar xp={profile?.xp ?? 0} />
      </div>

      {/* Exam banner */}
      {nextExam && (
        <div className="mt-4">
          <ExamBanner exam={nextExam} />
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total XP" value={profile?.xp ?? 0} icon={<IconBolt size={22} />} color="sky" />
        <StatCard label="Day Streak" value={profile?.streak_days ?? 0} icon={<IconFlame size={22} />} color="amber" />
        <StatCard label="Quizzes Taken" value={quizzesTaken} icon={<IconBrain size={22} />} color="violet" />
        <StatCard label="Avg Score" value={avgScore} suffix="%" icon={<IconTargetArrow size={22} />} color="emerald" />
      </div>

      {/* Priority topics */}
      {priority.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <IconAlertTriangle size={18} className="text-accent-amber" />
            <h2 className="text-lg font-bold">Exam priority topics</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {priority.map((content, i) => (
              <GuideCard key={content.id} content={content} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Recent content */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBook size={18} className="text-accent-sky" />
            <h2 className="text-lg font-bold">Recent lectures</h2>
          </div>
          <Link
            href="/guides"
            className="flex items-center gap-0.5 text-sm font-medium text-accent-sky hover:underline"
          >
            View all <IconChevronRight size={16} />
          </Link>
        </div>
        {recent.length === 0 && priority.length === 0 ? (
          <div className="glass-card glass-card-static p-8 text-center">
            <p className="text-text-secondary">No content yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recent.map((content, i) => (
              <GuideCard key={content.id} content={content} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
