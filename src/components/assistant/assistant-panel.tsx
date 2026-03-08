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
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B80]">
              {block.title}
            </p>
          )}
          <ol className="space-y-2.5">
            {block.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15 text-[10px] font-bold text-[#C9A84C]">
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
          className="flex items-start gap-3 rounded-xl border border-[#2A2A3A] bg-[#0D0D14] p-3 transition-colors hover:border-[#3A3A4A]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#F5F5F7]">{block.title}</p>
            <p className="text-xs text-[#6B6B80]">{block.location}</p>
            {block.price !== null && (
              <p className="mt-0.5 text-xs font-semibold text-[#C9A84C]">
                {formatCurrency(block.price, { compact: true })}
              </p>
            )}
          </div>
          {block.isTokenized && (
            <span className="mt-0.5 flex-shrink-0 rounded border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#C9A84C]">
              Tokenized
            </span>
          )}
        </Link>
      )

    case 'callout': {
      const CALLOUT_STYLES = {
        info:      { wrap: 'border-[#818CF8]/20 bg-[#818CF8]/10 text-[#818CF8]', dot: 'bg-[#818CF8]' },
        warn:      { wrap: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]', dot: 'bg-[#F59E0B]' },
        milestone: { wrap: 'border-[#C9A84C]/20 bg-[#C9A84C]/10 text-[#C9A84C]', dot: 'bg-[#C9A84C]' },
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
          className="inline-flex items-center gap-1 text-sm font-medium text-[#C9A84C] underline-offset-2 transition-opacity hover:opacity-80"
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
    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15 text-[10px] font-bold text-[#C9A84C]">
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
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#C9A84C]/15 px-4 py-2.5 text-sm leading-relaxed text-[#F5F5F7]">
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
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-[#1A1A24] px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B6B80]"
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
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-[#1A1A24] px-4 py-3">
          <p className="text-sm leading-relaxed text-[#C8C8D8]">
            Hi, I&apos;m Aria — your TIGI advisor. I can help you understand listings, explain how investments and tokens work, or guide you through any part of the platform.
          </p>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#4A4A5E]">
          Try asking
        </p>
        <div className="flex flex-col gap-1.5">
          {ARIA_SUGGESTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSuggestion(s.text)}
              className="w-full rounded-xl border border-[#1F1F2E] bg-[#0D0D14] px-4 py-2.5 text-left text-sm text-[#A0A0B2] transition-all hover:border-[#2A2A3A] hover:text-[#F5F5F7]"
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
      <div className="flex items-center gap-2 rounded-xl border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 transition-colors focus-within:border-[#3A3A4A]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Aria anything..."
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-[#F5F5F7] placeholder:text-[#4A4A5E] focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] transition-all hover:enabled:bg-[#C9A84C]/30 disabled:opacity-30"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
      {showDisclaimer && (
        <p className="mt-2 text-center text-[10px] text-[#3A3A4A]">
          Aria uses mock responses · Real AI integration in M2
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
        'flex flex-shrink-0 items-center gap-3 border-b border-[#1F1F2E]',
        variant === 'panel' ? 'h-14 px-4' : 'px-1 py-5'
      )}
    >
      {/* Branding */}
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-[#C9A84C]/10',
          variant === 'panel' ? 'h-7 w-7 rounded-lg' : 'h-9 w-9'
        )}
      >
        <Sparkles className={cn('text-[#C9A84C]', variant === 'panel' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
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
        <p className="text-[10px] text-[#4A4A5E]">
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4A4A5E] transition-colors hover:bg-[#1A1A24] hover:text-[#6B6B80]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Aria"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B6B80] transition-colors hover:bg-[#1A1A24] hover:text-[#A0A0B2]"
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
          'fixed inset-0 z-40 bg-[#0A0A0F]/50 backdrop-blur-[2px] transition-opacity duration-300',
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
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#1F1F2E] bg-[#111118] shadow-2xl shadow-black/60 transition-transform duration-300 sm:w-[400px]',
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
          className="border-t border-[#1F1F2E] px-4 pb-4 pt-3"
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
      <div className="flex-shrink-0 border-t border-[#1F1F2E] px-1 pt-3 pb-6">
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
