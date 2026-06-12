'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconRefresh, IconTrash, IconEye, IconEyeOff, IconAlertTriangle } from '@tabler/icons-react'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/database'

export default function ContentTable({ contents: initial }: { contents: Content[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [contents, setContents] = useState(initial)
  const [regenerating, setRegenerating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Content | null>(null)

  const togglePublish = async (content: Content) => {
    const supabase = createClient()
    const next = !content.is_published
    setContents((c) => c.map((x) => (x.id === content.id ? { ...x, is_published: next } : x)))
    const { error } = await supabase.from('content').update({ is_published: next }).eq('id', content.id)
    if (error) {
      setContents((c) => c.map((x) => (x.id === content.id ? { ...x, is_published: !next } : x)))
      toast('Failed to update', 'error')
    } else {
      toast(next ? 'Published!' : 'Unpublished', 'success')
    }
  }

  const togglePriority = async (content: Content) => {
    const supabase = createClient()
    const next = !content.is_exam_priority
    setContents((c) => c.map((x) => (x.id === content.id ? { ...x, is_exam_priority: next } : x)))
    await supabase.from('content').update({ is_exam_priority: next }).eq('id', content.id)
  }

  const regenerate = async (content: Content) => {
    setRegenerating(content.id)
    try {
      const res = await fetch(`/api/generate/${content.id}`, { method: 'POST' })
      if (!res.ok) throw new Error('Generation failed')
      toast('Regenerated guide, flashcards, and quiz!', 'success')
    } catch {
      toast('Regeneration failed', 'error')
    } finally {
      setRegenerating(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    const supabase = createClient()
    const { error } = await supabase.from('content').delete().eq('id', deleting.id)
    if (error) {
      toast('Delete failed', 'error')
    } else {
      setContents((c) => c.filter((x) => x.id !== deleting.id))
      toast('Content deleted', 'success')
      router.refresh()
    }
    setDeleting(null)
  }

  return (
    <div className="space-y-2">
      {contents.length === 0 && (
        <p className="py-8 text-center text-sm text-text-tertiary">
          No content yet — upload your first lecture!
        </p>
      )}
      {contents.map((content, i) => (
        <motion.div
          key={content.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass-card glass-card-static flex flex-wrap items-center gap-3 p-4"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{content.title}</p>
            <p className="text-xs text-text-tertiary">
              {content.class_name} · {content.topic}
            </p>
          </div>

          <button onClick={() => togglePriority(content)} title="Toggle exam priority">
            <Badge variant={content.is_exam_priority ? 'amber' : 'sky'}>
              <IconAlertTriangle size={11} />
              {content.is_exam_priority ? 'Priority' : 'Normal'}
            </Badge>
          </button>

          <button
            onClick={() => togglePublish(content)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              content.is_published
                ? 'bg-accent-emerald/15 text-accent-emerald'
                : 'bg-white/5 text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {content.is_published ? <IconEye size={14} /> : <IconEyeOff size={14} />}
            {content.is_published ? 'Published' : 'Draft'}
          </button>

          <button
            onClick={() => regenerate(content)}
            disabled={regenerating === content.id}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-violet/10 text-accent-violet transition-colors hover:bg-accent-violet/20 disabled:opacity-50"
            title="Regenerate AI materials"
          >
            <IconRefresh size={15} className={regenerating === content.id ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setDeleting(content)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-red/10 text-accent-red transition-colors hover:bg-accent-red/20"
            title="Delete"
          >
            <IconTrash size={15} />
          </button>
        </motion.div>
      ))}

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete content?">
        <p className="text-sm text-text-secondary">
          This permanently removes <span className="font-semibold text-text-primary">{deleting?.title}</span>{' '}
          along with its study guide, flashcards, and quiz. Students lose access immediately.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirmDelete}>
            <IconTrash size={15} /> Delete forever
          </Button>
        </div>
      </Modal>
    </div>
  )
}
