import Link from 'next/link'
import { MessageSquare, ExternalLink } from 'lucide-react'
import { type OwnerInquiry, type InquiryStatus, type InquiryIntent } from '@/lib/listings/owner-mock-data'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// InquiryFeed — Recent buyer/tenant/investor message previews for the owner.
//
// Source: real DB inquiries via getOwnerInquiries() (wired in M5).
// Full inbox / message thread UI planned for M6 (reply threading, read receipts).
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<InquiryStatus, { label: string; dot: string; text: string }> = {
  NEW:     { label: 'New',     dot: 'bg-amber-400',   text: 'text-amber-400'   },
  READ:    { label: 'Read',    dot: 'bg-zinc-500',    text: 'text-zinc-500'    },
  REPLIED: { label: 'Replied', dot: 'bg-emerald-400', text: 'text-emerald-400' },
}

const INTENT_LABEL: Record<InquiryIntent, string> = {
  BUY:    'Buy',
  LEASE:  'Lease',
  INVEST: 'Invest',
  INFO:   'Info',
}

const INTENT_STYLE: Record<InquiryIntent, string> = {
  BUY:    'border-amber-400/30 text-amber-400',
  LEASE:  'border-indigo-400/30 text-indigo-400',
  INVEST: 'border-emerald-400/30 text-emerald-400',
  INFO:   'border-white/[0.08] text-zinc-500',
}

function formatTimeAgo(isoString: string): string {
  const now = new Date()
  const then = new Date(isoString)
  const diffMs = now.getTime() - then.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffD = Math.floor(diffH / 24)

  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  if (diffD === 1) return 'Yesterday'
  return `${diffD}d ago`
}

// Two-letter initials avatar (owner domain; not using InitialsAvatar since
// inquiry senders don't have TIGI accounts yet — we can't rely on their profile)
function SenderAvatar({ initials, isNew }: { initials: string; isNew: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
          isNew
            ? 'bg-amber-400/20 text-amber-400'
            : 'bg-white/[0.04] text-zinc-500'
        )}
      >
        {initials}
      </div>
      {isNew && (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-amber-400" />
      )}
    </div>
  )
}

interface InquiryFeedProps {
  inquiries: OwnerInquiry[]
  className?: string
}

export function InquiryFeed({ inquiries, className }: InquiryFeedProps) {
  if (inquiries.length === 0) {
    return (
      <div className={cn('flex flex-col items-center gap-3 py-10 text-center', className)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-700">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-zinc-500">No inquiries yet.</p>
          <p className="mt-0.5 text-xs text-zinc-700">Once your listings go live, messages will appear here.</p>
        </div>
      </div>
    )
  }

  const newCount = inquiries.filter((i) => i.status === 'NEW').length

  return (
    <div className={cn('space-y-1', className)}>
      {newCount > 0 && (
        <p className="mb-3 text-xs text-zinc-500">
          <span className="font-semibold text-amber-400">{newCount} unread</span>
          {' '}· {inquiries.length} total
        </p>
      )}

      {inquiries.map((inquiry) => {
        const { dot, text } = STATUS_CONFIG[inquiry.status]
        const isNew = inquiry.status === 'NEW'

        return (
          <div
            key={inquiry.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200',
              isNew
                ? 'border-amber-400/20 bg-amber-400/5 hover:border-amber-400/35'
                : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.10]'
            )}
          >
            <SenderAvatar initials={inquiry.fromInitials} isNew={isNew} />

            {/* Body */}
            <div className="min-w-0 flex-1">
              {/* Top row: name + intent badge + time */}
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-semibold', isNew ? 'text-white' : 'text-zinc-400')}>
                  {inquiry.fromName}
                </span>
                <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', INTENT_STYLE[inquiry.intent])}>
                  {INTENT_LABEL[inquiry.intent]}
                </span>
                <span className="ml-auto flex-shrink-0 text-[11px] text-zinc-500">
                  {formatTimeAgo(inquiry.timestamp)}
                </span>
              </div>

              {/* Asset */}
              <Link
                href={`/marketplace/${inquiry.assetId}`}
                className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500 hover:text-amber-400"
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 flex-shrink-0 rounded-full',
                    inquiry.assetType === 'LAND' ? 'bg-emerald-400' : 'bg-amber-400'
                  )}
                />
                <span className="truncate">{inquiry.assetTitle}</span>
                <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 opacity-50" />
              </Link>

              {/* Message preview */}
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                {inquiry.messagePreview}
              </p>

              {/* Status pill */}
              <div className="mt-1.5 flex items-center gap-1">
                <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dot)} />
                <span className={cn('text-[11px]', text)}>{STATUS_CONFIG[inquiry.status].label}</span>
              </div>
            </div>
          </div>
        )
      })}

      {/* Full inbox CTA — M6 */}
      <p className="pt-2 text-center text-[11px] text-zinc-700">
        Reply threading and read receipts in{' '}
        <span className="text-zinc-500">Milestone 6</span>
      </p>
    </div>
  )
}
