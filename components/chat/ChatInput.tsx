'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconSend } from '@tabler/icons-react'

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>
  onTyping?: () => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, onTyping, disabled, placeholder = 'Message...' }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    setValue('')
    void onSend(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onTyping?.()
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="glass-input min-w-0 flex-1 px-4 py-2.5 text-sm"
      />
      <motion.button
        type="submit"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-sky text-bg-base shadow-[0_0_16px_rgba(56,189,248,0.4)] disabled:opacity-40"
        aria-label="Send"
      >
        <IconSend size={17} />
      </motion.button>
    </form>
  )
}
