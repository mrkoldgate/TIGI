'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Sparkles, Send, Trash2, X } from 'lucide-react'
import { useAssistant } from '@/lib/assistant/assistant-context'
import { type AssistantMessage, type ContentBlock, ARIA_SUGGESTIONS } from '@/lib/assistant/mock-assistant-data'
import { cn, formatCurrency } from '@/lib/utils'

// ---------------------------------------------------------------------------
// AssistantPanel — slide-over drawer version. Mounted in AppShell, always in
//   the DOM; slides in/out via transform based on AssistantContext.isOpen.
//
// AssistantPageView — full-page version. Rendered at /assistant route.
//   Same sub-components, no fixed positioning or backdrop.
//
// Shared sub-components (not exported):
//   ContentBlockRenderer, MessageBubble, AriaMark, TypingIndicator,
//   EmptyState, InputBar, useConversation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ContentBlockRenderer
// ---------------------------------------------------------------------------

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {

    case 'text':
      return (
        <p className="text-sm leading-relaxed text-[#C8C8D8]">{block.text}</p>
      )

    case 'step_list':
      return (
        <div className="space-y-2">
          {block.title && (
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8E8E9C]">
              {block.title}
            </p>
          )}
          <ol className="space-y-2.5">
            {block.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[10px] font-bold text-indigo-400">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-[#C8C8D8]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )

    case 'listing_ref':
      return (
        <Link
          href={block.href}
          className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-3 transition-colors hover:border-white/[0.10]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#F5F5F7]">{block.title}</p>
            <p className="text-xs text-[#8E8E9C]">{block.location}</p>
            {block.price !== null && (
              <p className="mt-0.5 text-xs font-semibold text-indigo-400">
                {formatCurrency(block.price, { compact: true })}
              </p>
            )}
          </div>
          {block.isTokenized && (
            <span className="mt-0.5 flex-shrink-0 rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400">
              Tokenized
            </span>
          )}
        </Link>
      )

    case 'callout': {
      const CALLOUT_STYLES = {
        info:      { wrap: 'border-[#818CF8]/20 bg-[#818CF8]/10 text-[#818CF8]', dot: 'bg-[#818CF8]' },
        warn:      { wrap: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]', dot: 'bg-[#F59E0B]' },
        milestone: { wrap: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400', dot: 'bg-indigo-500' },
      } as const
      const s = CALLOUT_STYLES[block.variant]
      return (
        <div className={cn('flex items-start gap-2.5 rounded-lg border px-3 py-2.5', s.wrap)}>
          <span className={cn('mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full', s.dot)} />
          <p className="text-xs leading-relaxed">{block.text}</p>
        </div>
      )
    }

    case 'action_link':
      return (
        <Link
          href={block.href}
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 underline-offset-2 transition-opacity hover:opacity-80"
        >
          {block.label}
        </Link>
      )

    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// AriaMark — small avatar used on all assistant messages
// ---------------------------------------------------------------------------

function AriaMark() {
  return (
    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[10px] font-bold text-indigo-400">
      A
    </div>
  )
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: AssistantMessage }) {
  if (message.role === 'user') {
    const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-indigo-500/15 backdrop-blur-xl px-4 py-2.5 text-sm leading-relaxed text-[#F5F5F7]">
          {text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2.5">
      <AriaMark />
      <div className="max-w-[90%] space-y-3">
        {message.content.map((block, i) => (
          <ContentBlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TypingIndicator — animated dots while Aria is composing a response
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <AriaMark />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white/[0.04] backdrop-blur-xl px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8E8E9C]"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EmptyState — greeting message + suggestion chips
// ---------------------------------------------------------------------------

function EmptyState({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-5">
      {/* Opening message */}
      <div className="flex items-start gap-2.5">
        <AriaMark />
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/[0.04] backdrop-blur-xl px-4 py-3">
          <p className="text-sm leading-relaxed text-[#C8C8D8]">
            Hi, I&apos;m Aria — your TIGI advisor. I can help you understand listings, explain how investments and tokens work, or guide you through any part of the platform.
          </p>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#7A7A8A]">
          Try asking
        </p>
        <div className="flex flex-col gap-1.5">
          {ARIA_SUGGESTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSuggestion(s.text)}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl px-4 py-2.5 text-left text-sm text-[#A0A0B2] transition-all hover:border-white/[0.08] hover:text-[#F5F5F7]"
            >
              {s.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// InputBar — controlled input + send button, shared by panel and page view
// ---------------------------------------------------------------------------

interface InputBarProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
  showDisclaimer?: boolean
  className?: string
}

function InputBar({ value, onChange, onSend, disabled, showDisclaimer = true, className }: InputBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className={cn('flex-shrink-0', className)}>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] px-3 py-2 transition-colors focus-within:border-white/[0.10]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Aria anything..."
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-[#F5F5F7] placeholder:text-[#7A7A8A] focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 transition-all hover:enabled:bg-indigo-500/30 disabled:opacity-30"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
      {showDisclaimer && (
        <p className="mt-2 text-center text-[10px] text-[#6E6E7E]">
          Aria provides general guidance · Not financial or legal advice
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// useConversation — shared conversation interaction logic
// ---------------------------------------------------------------------------

function useConversation() {
  const { messages, isTyping, sendMessage, clearMessages } = useAssistant()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')
    sendMessage(text)
  }

  return { messages, isTyping, clearMessages, input, setInput, handleSend, sendMessage, endRef }
}

// ---------------------------------------------------------------------------
// MessageList — renders messages or empty state
// ---------------------------------------------------------------------------

function MessageList({
  messages,
  isTyping,
  endRef,
  onSuggestion,
}: {
  messages: AssistantMessage[]
  isTyping: boolean
  endRef: React.RefObject<HTMLDivElement | null>
  onSuggestion: (text: string) => void
}) {
  if (messages.length === 0) {
    return <EmptyState onSuggestion={onSuggestion} />
  }

  return (
    <div className="flex flex-col gap-5">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={endRef} className="h-2" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// PanelHeader — shared header chrome for both panel and page view
// ---------------------------------------------------------------------------

function PanelHeader({
  onClose,
  onClear,
  hasMessages,
  variant,
}: {
  onClose?: () => void
  onClear: () => void
  hasMessages: boolean
  variant: 'panel' | 'page'
}) {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center gap-3 border-b border-white/[0.06]',
        variant === 'panel' ? 'h-14 px-4' : 'px-1 py-5'
      )}
    >
      {/* Branding */}
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-indigo-500/10',
          variant === 'panel' ? 'h-7 w-7 rounded-lg' : 'h-9 w-9'
        )}
      >
        <Sparkles className={cn('text-indigo-400', variant === 'panel' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      </div>
      <div className="flex-1">
        <p
          className={cn(
            'font-semibold text-[#F5F5F7]',
            variant === 'panel' ? 'text-sm' : 'font-heading text-lg'
          )}
        >
          Aria
        </p>
        <p className="text-[10px] text-[#7A7A8A]">
          {variant === 'panel'
            ? 'TIGI Advisor'
            : 'Your TIGI advisor — ask about listings, investments, or platform features'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {hasMessages && (
          <button
            onClick={onClear}
            title="Clear conversation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7A7A8A] transition-colors hover:bg-white/[0.04] hover:text-[#8E8E9C]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Aria"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8E8E9C] transition-colors hover:bg-white/[0.04] hover:text-[#A0A0B2]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AssistantPanel — slide-over drawer, mounted in AppShell
// ---------------------------------------------------------------------------

export function AssistantPanel() {
  const { isOpen, close } = useAssistant()
  const { messages, isTyping, clearMessages, input, setInput, handleSend, sendMessage, endRef } =
    useConversation()

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Aria — TIGI Advisor"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-white/[0.06] bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-transform duration-300 sm:w-[400px]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <PanelHeader
          variant="panel"
          onClose={close}
          onClear={clearMessages}
          hasMessages={messages.length > 0}
        />

        {/* Scrollable message area */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-5">
          <MessageList
            messages={messages}
            isTyping={isTyping}
            endRef={endRef}
            onSuggestion={(text) => sendMessage(text)}
          />
        </div>

        {/* Input */}
        <InputBar
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={isTyping}
          className="border-t border-white/[0.06] px-4 pb-4 pt-3"
        />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// AssistantPageView — full-page version, rendered at /assistant route
// ---------------------------------------------------------------------------

export function AssistantPageView() {
  const { messages, isTyping, clearMessages, input, setInput, handleSend, sendMessage, endRef } =
    useConversation()

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col py-6">
      <PanelHeader
        variant="page"
        onClear={clearMessages}
        hasMessages={messages.length > 0}
      />

      {/* Scrollable message area */}
      <div className="flex flex-1 flex-col overflow-y-auto px-1 py-6">
        <MessageList
          messages={messages}
          isTyping={isTyping}
          endRef={endRef}
          onSuggestion={(text) => sendMessage(text)}
        />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/[0.06] px-1 pt-3 pb-6">
        <InputBar
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={isTyping}
        />
      </div>
    </div>
  )
}
