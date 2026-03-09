'use client'

// ---------------------------------------------------------------------------
// InquiryModal — slide-over panel for submitting a listing inquiry.
//
// Props:
//   propertyId    — listing to inquire about
//   propertyTitle — shown in the modal header
//   listingType   — 'BUY' | 'LEASE' | 'BOTH' — determines which options to show
//   isTokenized   — shows INTERESTED_INVESTING option when true
//   onClose       — called when the user dismisses the modal
//
// Two phases:
//   1. Form phase   — inquiry type radio cards + message textarea + submit
//   2. Success phase — confirmation card; user can close or go back
//
// Submits to POST /api/inquiries. Surfaces validation errors inline.
// Does NOT use a portal — rendered inline in the detail page, slides over
// the right action panel using an overlay pattern for mobile.
// ---------------------------------------------------------------------------

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, MessageSquare, CheckCircle2, Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type InquiryType,
  INQUIRY_TYPE_LABELS,
} from '@/lib/inquiries/inquiry-types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InquiryModalProps {
  propertyId:    string
  propertyTitle: string
  listingType:   'BUY' | 'LEASE' | 'BOTH' | string
  isTokenized:   boolean
  onClose:       () => void
}

// ---------------------------------------------------------------------------
// Inquiry type option config
// ---------------------------------------------------------------------------

interface InquiryOption {
  type:        InquiryType
  label:       string
  description: string
  accent:      string
}

function buildOptions(listingType: string, isTokenized: boolean): InquiryOption[] {
  const options: InquiryOption[] = [
    {
      type:        'GENERAL',
      label:       'General Question',
      description: 'Ask about the property, neighbourhood, or next steps.',
      accent:      'border-[#2A2A3A] hover:border-[#3A3A4A]',
    },
  ]

  const lt = listingType.toUpperCase()
  if (lt === 'BUY' || lt === 'BOTH') {
    options.push({
      type:        'INTERESTED_BUYING',
      label:       'Interested in Buying',
      description: 'Express serious purchase interest and request a walkthrough.',
      accent:      'border-[#C9A84C]/20 hover:border-[#C9A84C]/40',
    })
  }
  if (isTokenized) {
    options.push({
      type:        'INTERESTED_INVESTING',
      label:       'Interested in Investing',
      description: 'Ask about fractional ownership, returns, and token structure.',
      accent:      'border-[#4ADE80]/20 hover:border-[#4ADE80]/40',
    })
  }
  if (lt === 'LEASE' || lt === 'BOTH') {
    options.push({
      type:        'INTERESTED_LEASING',
      label:       'Interested in Leasing',
      description: 'Inquire about lease terms, availability, and site visits.',
      accent:      'border-[#818CF8]/20 hover:border-[#818CF8]/40',
    })
  }

  return options
}

// ---------------------------------------------------------------------------
// TypeCard
// ---------------------------------------------------------------------------

function TypeCard({
  option,
  selected,
  onSelect,
}: {
  option:   InquiryOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border p-3 text-left transition-all active:scale-[0.99]',
        selected
          ? 'border-[#C9A84C]/50 bg-[#C9A84C]/8 ring-1 ring-[#C9A84C]/20'
          : cn('bg-[#0D0D14]', option.accent),
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Radio indicator */}
        <span
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected
              ? 'border-[#C9A84C] bg-[#C9A84C]/20'
              : 'border-[#3A3A4A] bg-[#1A1A24]',
          )}
        >
          {selected && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
          )}
        </span>

        <div className="min-w-0">
          <p className={cn('text-sm font-medium', selected ? 'text-[#F5F5F7]' : 'text-[#A0A0B2]')}>
            {option.label}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[#6B6B80]">
            {option.description}
          </p>
        </div>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// SuccessCard
// ---------------------------------------------------------------------------

function SuccessCard({
  inquiryType,
  onClose,
}: {
  inquiryType: InquiryType
  onClose:     () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A84C]/15 ring-1 ring-[#C9A84C]/25">
        <CheckCircle2 className="h-7 w-7 text-[#C9A84C]" />
      </div>

      <div className="space-y-1">
        <p className="font-heading text-base font-semibold text-[#F5F5F7]">Inquiry sent</p>
        <p className="text-sm text-[#6B6B80]">
          {INQUIRY_TYPE_LABELS[inquiryType]} inquiry delivered to the listing owner.
          You'll be notified when they respond.
        </p>
      </div>

      <div className="w-full rounded-xl border border-[#2A2A3A] bg-[#111118] p-3 text-left">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#4A4A60]">What happens next</p>
        <ul className="mt-2 space-y-1.5">
          {[
            'The owner receives your message in their TIGI inbox.',
            'Most owners respond within 48 hours.',
            "You'll see their reply in your dashboard under My Inquiries.",
          ].map((step) => (
            <li key={step} className="flex items-start gap-2 text-[11px] text-[#6B6B80]">
              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[#3A3A4A]" />
              {step}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-[#1A1A24] py-2.5 text-sm font-medium text-[#A0A0B2] ring-1 ring-[#2A2A3A] transition hover:bg-[#222230] hover:text-[#F5F5F7]"
      >
        Close
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function InquiryModal({
  propertyId,
  propertyTitle,
  listingType,
  isTokenized,
  onClose,
}: InquiryModalProps) {
  const options       = buildOptions(listingType, isTokenized)
  const [selected, setSelected]   = useState<InquiryType>(options[0].type)
  const [message,  setMessage]    = useState('')
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState<string | null>(null)
  const [success,  setSuccess]    = useState(false)
  const textareaRef               = useRef<HTMLTextAreaElement>(null)

  // Focus textarea on mount (after a brief delay for the animation)
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (message.trim().length < 10) {
      setError('Please write at least 10 characters.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/inquiries', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          propertyId,
          inquiryType: selected,
          message:     message.trim(),
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(json.error ?? 'Failed to send inquiry.')
      }

      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [propertyId, selected, message])

  const charCount    = message.length
  const charMax      = 2000
  const charNearMax  = charCount > 1800

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#0A0A0F]/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-2xl border border-[#2A2A3A] bg-[#0F0F18] shadow-2xl sm:inset-auto sm:right-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1E1E2A] p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A84C]/15">
              <MessageSquare className="h-4 w-4 text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F5F5F7]">Make an Inquiry</p>
              <p className="max-w-[200px] truncate text-[11px] text-[#6B6B80]">{propertyTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B6B80] transition hover:bg-[#1A1A24] hover:text-[#A0A0B2]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto p-4">
          {success ? (
            <SuccessCard inquiryType={selected} onClose={onClose} />
          ) : (
            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#4A4A60]">
                  What's your inquiry about?
                </p>
                <div className="space-y-2">
                  {options.map((opt) => (
                    <TypeCard
                      key={opt.type}
                      option={opt}
                      selected={selected === opt.type}
                      onSelect={() => setSelected(opt.type)}
                    />
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#4A4A60]">
                  Your message
                </label>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value.slice(0, charMax))
                    setError(null)
                  }}
                  rows={4}
                  placeholder="Share what you'd like to know, your timeline, or any specific requirements…"
                  className="w-full resize-none rounded-xl border border-[#2A2A3A] bg-[#111118] px-3.5 py-3 text-sm text-[#F5F5F7] placeholder-[#3A3A4A] outline-none transition focus:border-[#C9A84C]/40 focus:ring-1 focus:ring-[#C9A84C]/20"
                />
                <div className="mt-1 flex items-center justify-between">
                  {error ? (
                    <p className="text-xs text-rose-400">{error}</p>
                  ) : (
                    <span />
                  )}
                  <p className={cn('ml-auto text-[11px]', charNearMax ? 'text-rose-400' : 'text-[#3A3A4A]')}>
                    {charCount}/{charMax}
                  </p>
                </div>
              </div>

              {/* Trust note */}
              <p className="text-[11px] leading-relaxed text-[#3A3A4A]">
                Your message is sent directly to the listing owner and logged securely on TIGI.
                We do not share your contact details without your consent.
              </p>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || message.trim().length < 10}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]',
                  loading || message.trim().length < 10
                    ? 'cursor-not-allowed bg-[#1A1A24] text-[#3A3A4A]'
                    : 'bg-[#C9A84C] text-[#0A0A0F] hover:bg-[#D4AF5C] shadow-[0_0_20px_rgba(201,168,76,0.15)]',
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send Inquiry'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
