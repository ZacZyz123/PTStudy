'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Flex from '@/components/mascot/Flex'
import ChatInput from '@/components/chat/ChatInput'
import { TypingIndicator } from '@/components/chat/MessageBubble'
import type { ChatMessage } from '@/types/database'

interface AIChatProps {
  contentId: string
  topic: string
  initialMessages: ChatMessage[]
}

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  message: string
}

export default function AIChat({ contentId, topic, initialMessages }: AIChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>(
    initialMessages.map((m) => ({ id: m.id, role: m.role, message: m.message }))
  )
  const [streaming, setStreaming] = useState(false)
  const [waitingFirstToken, setWaitingFirstToken] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, waitingFirstToken])

  const handleSend = async (text: string) => {
    if (streaming) return
    setStreaming(true)
    setWaitingFirstToken(true)

    const userMsg: DisplayMessage = { id: `u-${Date.now()}`, role: 'user', message: text }
    const assistantId = `a-${Date.now()}`
    setMessages((m) => [...m, userMsg])

    try {
      const res = await fetch(`/api/chat/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Chat request failed')
      }

      setMessages((m) => [...m, { id: assistantId, role: 'assistant', message: '' }])
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setWaitingFirstToken(false)
        const chunk = decoder.decode(value, { stream: true })
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, message: msg.message + chunk } : msg))
        )
      }
    } catch {
      setMessages((m) => [
        ...m.filter((msg) => msg.id !== assistantId),
        {
          id: assistantId,
          role: 'assistant',
          message: 'Oof, something went wrong on my end. Try that again? 💪',
        },
      ])
    } finally {
      setStreaming(false)
      setWaitingFirstToken(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[420px] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-8 text-center">
            <Flex mood="waving" size={110} speechBubble={`Ask me anything about ${topic}!`} />
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent-sky px-4 py-2.5 text-sm text-bg-base">
                {m.message}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5"
            >
              <div className="mt-1 shrink-0">
                <Flex mood={streaming && m.message ? 'focused' : 'happy'} size={36} animate={false} />
              </div>
              <div className="glass-card glass-card-static max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 !shadow-none">
                <div className="prose-pt text-sm [&_p]:mb-2 [&_p:last-child]:mb-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.message}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )
        )}

        {waitingFirstToken && (
          <div className="flex items-start gap-2.5">
            <div className="mt-1 shrink-0">
              <Flex mood="thinking" size={36} animate={false} />
            </div>
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-4">
        <ChatInput
          onSend={handleSend}
          disabled={streaming}
          placeholder={`Ask Flex about ${topic}...`}
        />
      </div>
    </div>
  )
}
