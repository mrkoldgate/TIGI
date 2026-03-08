'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import {
  type AssistantMessage,
  type ContentBlock,
  getMockResponse,
  newMessageId,
  nowISO,
} from './mock-assistant-data'

// ---------------------------------------------------------------------------
// AssistantContext — global state for the TIGI AI assistant (Aria).
//
// Provided in (platform)/layout.tsx so any page can open the panel, send
// messages, or read the active conversation.
//
// Integration path (M2):
//   sendMessage() — replace the setTimeout mock with:
//     fetch('/api/assistant/chat', { method: 'POST', body: JSON.stringify({ message }) })
//     then stream ContentBlock[] chunks via the Vercel AI SDK useChat hook,
//     appending blocks to the message as they arrive (isTyping stays true
//     until the stream closes).
// ---------------------------------------------------------------------------

interface AssistantContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  messages: AssistantMessage[]
  isTyping: boolean
  sendMessage: (text: string) => void
  clearMessages: () => void
}

const AssistantContext = createContext<AssistantContextValue | null>(null)

export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant must be used inside <AssistantProvider>')
  return ctx
}

interface AssistantProviderProps {
  children: React.ReactNode
}

export function AssistantProvider({ children }: AssistantProviderProps) {
  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState<AssistantMessage[]>([])
  const [isTyping,  setIsTyping]  = useState(false)

  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open    = useCallback(() => setIsOpen(true),          [])
  const close   = useCallback(() => setIsOpen(false),         [])
  const toggle  = useCallback(() => setIsOpen((o) => !o),     [])
  const clearMessages = useCallback(() => setMessages([]),    [])

  const sendMessage = useCallback((text: string) => {
    // 1. Append user message immediately
    const userMsg: AssistantMessage = {
      id: newMessageId(),
      role: 'user',
      content: [{ type: 'text', text }] satisfies ContentBlock[],
      timestamp: nowISO(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    // 2. Cancel any pending response (defensive)
    if (pendingTimer.current) clearTimeout(pendingTimer.current)

    // 3. Simulate LLM latency (900ms).
    //    M2: replace with streaming fetch → append blocks as they arrive.
    pendingTimer.current = setTimeout(() => {
      const blocks = getMockResponse(text)
      const ariaMsg: AssistantMessage = {
        id: newMessageId(),
        role: 'assistant',
        content: blocks,
        timestamp: nowISO(),
      }
      setMessages((prev) => [...prev, ariaMsg])
      setIsTyping(false)
    }, 900)
  }, [])

  return (
    <AssistantContext.Provider
      value={{ isOpen, open, close, toggle, messages, isTyping, sendMessage, clearMessages }}
    >
      {children}
    </AssistantContext.Provider>
  )
}
