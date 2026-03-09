'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import {
  type AssistantMessage,
  type ContentBlock,
  getMockResponse,
  newMessageId,
  nowISO,
} from './mock-assistant-data'
import { track } from '@/lib/analytics/client'

// ---------------------------------------------------------------------------
// AssistantContext — global state for the TIGI AI assistant (Aria).
//
// Provided in (platform)/layout.tsx so any page can open the panel, send
// messages, or read the active conversation.
//
// Integration:
//   sendMessage() calls POST /api/assistant/chat with the full conversation
//   history. Falls back to getMockResponse() if the API is unreachable or
//   returns an error (e.g. AI_PROVIDER=mock in dev).
//
// M6 upgrade:
//   - Switch to streaming (Vercel AI SDK useChat) for faster perceived latency
//   - Append blocks as chunks arrive instead of waiting for full response
//   - Persist conversation history to DB (session-scoped, not page-scoped)
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

// ---------------------------------------------------------------------------
// Build history payload for the API (last 10 messages, text-only)
// ---------------------------------------------------------------------------

function messagesToHistory(messages: AssistantMessage[]): { role: 'user' | 'assistant'; text: string }[] {
  return messages.slice(-10).map((m) => ({
    role: m.role,
    text: m.content.find((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')?.text ?? '',
  }))
}

export function AssistantProvider({ children }: AssistantProviderProps) {
  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState<AssistantMessage[]>([])
  const [isTyping,  setIsTyping]  = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const open    = useCallback(() => { setIsOpen(true); track({ name: 'assistant.opened' }) }, [])
  const close   = useCallback(() => setIsOpen(false),         [])
  const toggle  = useCallback(() => setIsOpen((o) => { if (!o) track({ name: 'assistant.opened' }); return !o }), [])
  const clearMessages = useCallback(() => setMessages([]),    [])

  const sendMessage = useCallback((text: string) => {
    // 1. Append user message immediately
    const userMsg: AssistantMessage = {
      id:        newMessageId(),
      role:      'user',
      content:   [{ type: 'text', text }] satisfies ContentBlock[],
      timestamp: nowISO(),
    }

    setMessages((prev) => {
      const updated = [...prev, userMsg]

      // Cancel any in-flight request
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      const signal = abortRef.current.signal

      setIsTyping(true)

      // Build history snapshot (includes the new user message)
      const history = messagesToHistory(updated)

      void (async () => {
        let blocks: ContentBlock[] | null = null

        try {
          const res = await fetch('/api/assistant/chat', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: history }),
            signal,
          })

          if (res.ok) {
            const json = await res.json() as { success: boolean; blocks?: ContentBlock[] }
            if (json.success && Array.isArray(json.blocks) && json.blocks.length > 0) {
              blocks = json.blocks
            }
          }
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.warn('[assistant] API call failed, using enhanced mock:', err)
          }
        }

        if (signal.aborted) return

        // Graceful fallback: enhanced mock when API unavailable or AI_PROVIDER=mock
        if (!blocks) {
          await new Promise<void>((r) => setTimeout(r, 700))
          if (signal.aborted) return
          blocks = getMockResponse(text)
        }

        const ariaMsg: AssistantMessage = {
          id:        newMessageId(),
          role:      'assistant',
          content:   blocks,
          timestamp: nowISO(),
        }
        setMessages((prev) => [...prev, ariaMsg])
        setIsTyping(false)
      })()

      return updated
    })
  }, [])

  return (
    <AssistantContext.Provider
      value={{ isOpen, open, close, toggle, messages, isTyping, sendMessage, clearMessages }}
    >
      {children}
    </AssistantContext.Provider>
  )
}
