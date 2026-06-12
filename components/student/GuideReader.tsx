'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface GuideReaderProps {
  guideText: string
  contentId: string
}

/**
 * Renders the markdown study guide with scroll-triggered fade-in sections
 * and awards the one-time "read a guide" XP.
 */
export default function GuideReader({ guideText, contentId }: GuideReaderProps) {
  useEffect(() => {
    void fetch('/api/xp/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read_guide', contentId }),
    })
  }, [contentId])

  // Split on h2 headings so each section animates in independently
  const sections = guideText.split(/\n(?=## )/g)

  return (
    <article className="prose-pt">
      {sections.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{section}</ReactMarkdown>
        </motion.div>
      ))}
    </article>
  )
}
