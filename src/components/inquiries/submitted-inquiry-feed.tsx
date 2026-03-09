'use client'

// ---------------------------------------------------------------------------
// SubmittedInquiryFeed — buyer/investor view of their sent inquiries.
//
// Fetches from GET /api/inquiries?role=sender on mount.
// Shows: property name, inquiry type badge, status, preview, timestamp.
//
// Used in the buyer/investor dashboard "My Inquiries" section.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type InquiryDTO,
  type InquiryType,
  type InquiryStatus,
  INQUIRY_TYPE_SHORT,
  INQUIRY_STATUS_LABELS,
} from '@/lib/inquiries/inquiry-types'

// ---------------------------------------------------------------------------
// Display config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<InquiryStatus, { dot: string; text: string }> = {
  NEW:     { dot: 'bg-[#C9A84C]',  text: 'text-[#C9A84C]'  },
  READ:    { dot: 'bg-[#6B6B80]',  text: 'text-[#6B6B80]'  },
  REPLIED: { dot: 'bg-[#4ADE80]',  text: 'text-[#4ADE80]'  },
}

const TYPE_STYLE: Record<InquiryType, string> = {
  GENERAL:              'border-[#2A2A3A] text-[#6B6B80]',
  INTERESTED_BUYING:    'border-[#C9A84C]/30 text-[#C9A84C]',
  INTERESTED_INVESTING: 'border-[#4ADE80]/30 text-[#4ADE80]',
  INTERESTED_LEASING:   'border-[#818CF8]/30 text-[#818CF8]',
}

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffH  = Math.floor(diffMs / 3_600_000)
  const diffD  = Math.floor(diffH  / 24)
  if (diffH < 1)   return 'Just now'
  if (diffH < 24)  return `${diffH}h ago`
  if (diffD === 1) return 'Yesterday'
  if (diffD < 30)  return `${diffD}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Single inquiry row
// ---------------------------------------------------------------------------

function InquiryRow({ inquiry }: { inquiry: InquiryDTO }) {
  const { dot, text } = STATUS_CONFIG[inquiry.status]
  const isReplied      = inquiry.status === 'REPLIED'

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-colors',
        isReplied
          ? 'border-[#4ADE80]/20 bg-[#4ADE80]/5'
          : 'border-[#2A2A3A] bg-[#111118] hover:border-[#3A3A4A]',
      )}
    >
      {/* Top row: property + time */}
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/marketplace/${inquiry.propertyId}`}
          className="flex min-w-0 items-center gap-1.5 text-[11px] text-[#6B6B80] hover:text-[#C9A84C]"
        >
          <span className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            inquiry.propertyType === 'LAND' ? 'bg-[#4ADE80]' : 'bg-[#C9A84C]',
          )} />
          <span className="truncate font-medium text-[#A0A0B2]">{inquiry.propertyTitle}</span>
          <span className="text-[#4A4A60]">{inquiry.propertyCity}, {inquiry.propertyState}</span>
          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-40" />
        </Link>
        <span className="shrink-0 text-[11px] text-[#4A4A60]">{formatTimeAgo(inquiry.createdAt)}</span>
      </div>

      {/* Type badge + status pill */}
      <div className="mt-2 flex items-center gap-2">
        <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', TYPE_STYLE[inquiry.inquiryType])}>
          {INQUIRY_TYPE_SHORT[inquiry.inquiryType]}
        </span>
        <span className="flex items-center gap-1 text-[11px]">
          <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
          <span className={text}>{INQUIRY_STATUS_LABELS[inquiry.status]}</span>
        </span>
      </div>

      {/* Message preview */}
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#6B6B80]">
        {inquiry.message}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A24] text-[#3A3A4A]">
        <MessageSquare className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-[#6B6B80]">No inquiries yet.</p>
        <p className="mt-0.5 text-xs text-[#3A3A4A]">
          Use the{' '}
          <span className="text-[#6B6B80]">Ask a Question</span>
          {' '}button on any listing to get started.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export — fetches and renders
// ---------------------------------------------------------------------------

interface SubmittedInquiryFeedProps {
  className?: string
  /** Optional: pre-fetched inquiries (server-side). If omitted, fetches client-side. */
  initialInquiries?: InquiryDTO[]
}

export function SubmittedInquiryFeed({ className, initialInquiries }: SubmittedInquiryFeedProps) {
  const [inquiries, setInquiries] = useState<InquiryDTO[]>(initialInquiries ?? [])
  const [loading,   setLoading]   = useState(!initialInquiries)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (initialInquiries) return  // Already have data

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/inquiries?role=sender')
        if (!res.ok) throw new Error('Failed to load inquiries')
        const json = await res.json() as { inquiries: InquiryDTO[] }
        if (!cancelled) setInquiries(json.inquiries)
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [initialInquiries])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-[#3A3A4A]" />
      </div>
    )
  }

  if (error) {
    return (
      <p className={cn('py-4 text-center text-xs text-[#6B6B80]', className)}>
        Could not load inquiries.
      </p>
    )
  }

  if (inquiries.length === 0) {
    return <EmptyState />
  }

  return (
    <div className={cn('space-y-2', className)}>
      {inquiries.slice(0, 5).map((inq) => (
        <InquiryRow key={inq.id} inquiry={inq} />
      ))}
      {inquiries.length > 5 && (
        <p className="pt-1 text-center text-[11px] text-[#4A4A60]">
          +{inquiries.length - 5} more in your full history
        </p>
      )}
    </div>
  )
}
