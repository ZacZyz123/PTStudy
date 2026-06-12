'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconCalendarPlus, IconTrash } from '@tabler/icons-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GlassCard from '@/components/ui/GlassCard'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { Exam } from '@/types/database'

export default function ExamForm({ exams: initial }: { exams: Exam[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [exams, setExams] = useState(initial)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('exams')
      .insert({
        title,
        exam_date: date,
        topic_tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      })
      .select()
      .single()

    setSaving(false)
    if (error || !data) {
      toast('Failed to schedule exam', 'error')
      return
    }
    setExams((x) => [...x, data as Exam].sort((a, b) => a.exam_date.localeCompare(b.exam_date)))
    setTitle('')
    setDate('')
    setTags('')
    toast('Exam scheduled!', 'success')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('exams').delete().eq('id', id)
    if (!error) {
      setExams((x) => x.filter((e) => e.id !== id))
      toast('Exam removed', 'success')
    }
  }

  return (
    <div>
      <GlassCard className="p-6" tilt={false} hover={false}>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Exam title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Gross Anatomy Midterm"
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div className="sm:col-span-2">
            <Input
              label="Topic tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Upper Extremity, Brachial Plexus, Shoulder"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}>
              <IconCalendarPlus size={18} /> Schedule exam
            </Button>
          </div>
        </form>
      </GlassCard>

      <div className="mt-6 space-y-2">
        {exams.map((exam, i) => {
          const past = exam.exam_date < new Date().toISOString().slice(0, 10)
          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card glass-card-static flex items-center gap-3 p-4 ${past ? 'opacity-50' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{exam.title}</p>
                <p className="text-xs text-text-tertiary">
                  {new Date(`${exam.exam_date}T00:00:00`).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {exam.topic_tags && exam.topic_tags.length > 0 && ` · ${exam.topic_tags.join(', ')}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(exam.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-red/10 text-accent-red hover:bg-accent-red/20"
                aria-label="Delete exam"
              >
                <IconTrash size={15} />
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
