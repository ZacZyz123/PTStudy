'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconCloudUpload,
  IconFile,
  IconX,
  IconSparkles,
  IconCheck,
} from '@tabler/icons-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import type { Content } from '@/types/database'

type Stage = 'idle' | 'uploading' | 'generating-guide' | 'generating-flashcards' | 'generating-quiz' | 'done'

const STAGE_LABELS: Record<Stage, string> = {
  idle: '',
  uploading: 'Uploading & extracting text...',
  'generating-guide': 'Flex is writing the study guide...',
  'generating-flashcards': 'Generating flashcards...',
  'generating-quiz': 'Building the quiz...',
  done: 'All done! 🎉',
}

const STAGE_PROGRESS: Record<Stage, number> = {
  idle: 0,
  uploading: 15,
  'generating-guide': 40,
  'generating-flashcards': 65,
  'generating-quiz': 85,
  done: 100,
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [title, setTitle] = useState('')
  const [className, setClassName] = useState('')
  const [topic, setTopic] = useState('')
  const [examPriority, setExamPriority] = useState(false)
  const [stage, setStage] = useState<Stage>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const busy = stage !== 'idle' && stage !== 'done'

  const handleFile = (selected: File | null) => {
    if (!selected) return
    setFile(selected)
    if (!title) setTitle(selected.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || busy) return

    setStage('uploading')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('class_name', className)
      formData.append('topic', topic)
      formData.append('is_exam_priority', String(examPriority))

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData: { content?: Content; error?: string } = await uploadRes.json()
      if (!uploadRes.ok || !uploadData.content) {
        throw new Error(uploadData.error ?? 'Upload failed')
      }

      const contentId = uploadData.content.id
      for (const [kind, nextStage] of [
        ['guide', 'generating-guide'],
        ['flashcards', 'generating-flashcards'],
        ['quiz', 'generating-quiz'],
      ] as const) {
        setStage(nextStage)
        // Retry this step a few times if Flex (Claude) is overloaded (503),
        // so a transient spike doesn't discard the whole upload.
        let lastError = `Failed generating ${kind}`
        let ok = false
        for (let attempt = 1; attempt <= 4; attempt++) {
          const genRes = await fetch(`/api/generate/${contentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kinds: [kind] }),
          })
          if (genRes.ok) {
            ok = true
            break
          }
          const genData: { error?: string } = await genRes.json().catch(() => ({}))
          lastError = genData.error ?? lastError
          if (genRes.status === 503 && attempt < 4) {
            toast('Flex is busy right now — retrying…', 'info')
            await new Promise((r) => setTimeout(r, attempt * 3000))
            continue
          }
          break
        }
        if (!ok) throw new Error(lastError)
      }

      setStage('done')
      toast('Content uploaded and AI materials generated!', 'success')
    } catch (err) {
      setStage('idle')
      toast(err instanceof Error ? err.message : 'Something went wrong', 'error')
    }
  }

  const reset = () => {
    setFile(null)
    setTitle('')
    setClassName('')
    setTopic('')
    setExamPriority(false)
    setStage('idle')
  }

  return (
    <GlassCard className="p-6" tilt={false} hover={false}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files[0] ?? null)
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-300
            ${dragging ? 'border-accent-sky bg-accent-sky/10 shadow-glow-sky' : 'border-white/15 hover:border-accent-sky/50'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc,.pptx,.txt,.md"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <IconFile size={28} className="text-accent-sky" />
                <div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-text-tertiary">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="rounded-full p-1 text-text-tertiary hover:text-accent-red"
                  aria-label="Remove file"
                >
                  <IconX size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <IconCloudUpload size={36} className="text-accent-sky" />
                <p className="text-sm font-semibold">Drop a lecture file here or click to browse</p>
                <p className="text-xs text-text-tertiary">PDF, DOCX, PPTX, TXT — up to 50MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Shoulder Complex Anatomy" />
          <Input label="Class" value={className} onChange={(e) => setClassName(e.target.value)} required placeholder="Gross Anatomy" />
          <Input label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="Upper Extremity" />
          <label className="flex cursor-pointer items-center gap-3 self-end pb-3">
            <input
              type="checkbox"
              checked={examPriority}
              onChange={(e) => setExamPriority(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            <span className="text-sm text-text-secondary">Exam priority topic</span>
          </label>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {stage !== 'idle' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="mb-2 flex items-center gap-2 text-sm">
                {stage === 'done' ? (
                  <IconCheck size={16} className="text-accent-emerald" />
                ) : (
                  <IconSparkles size={16} className="animate-pulse text-accent-violet" />
                )}
                <span className={stage === 'done' ? 'text-accent-emerald' : 'text-text-secondary'}>
                  {STAGE_LABELS[stage]}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-sky to-accent-violet shadow-glow-sky"
                  animate={{ width: `${STAGE_PROGRESS[stage]}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 'done' ? (
          <Button type="button" variant="success" onClick={reset}>
            Upload another lecture
          </Button>
        ) : (
          <Button type="submit" loading={busy} disabled={!file}>
            <IconSparkles size={18} />
            Upload &amp; generate with AI
          </Button>
        )}
      </form>
    </GlassCard>
  )
}
