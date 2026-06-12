import ExamForm from '@/components/admin/ExamForm'
import { createAdminClient } from '@/lib/supabase/server'
import type { Exam } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminExamsPage() {
  const admin = createAdminClient()
  const { data } = await admin.from('exams').select('*').order('exam_date')

  return (
    <div>
      <h1 className="text-2xl font-bold">Exams</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Scheduled exams show a countdown banner on every student&apos;s dashboard.
      </p>
      <div className="mt-6">
        <ExamForm exams={(data as Exam[]) ?? []} />
      </div>
    </div>
  )
}
