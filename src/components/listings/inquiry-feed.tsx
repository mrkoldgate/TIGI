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
  NEW:     { label: 'New',     dot: 'bg-[#C9A84C]',  text: 'text-[#C9A84C]'  },
  READ:    { label: 'Read',    dot: 'bg-[#8E8E9C]',  text: 'text-[#8E8E9C]'  },
  REPLIED: { label: 'Replied', dot: 'bg-[#4ADE80]',  text: 'text-[#4ADE80]'  },
}

const INTENT_LABEL: Record<InquiryIntent, string> = {
  BUY:    'Buy',
  LEASE:  'Lease',
  INVEST: 'Invest',
  INFO:   'Info',
}

const INTENT_STYLE: Record<InquiryIntent, string> = {
  BUY:    'border-[#C9A84C]/30 text-[#C9A84C]',
  LEASE:  'border-[#818CF8]/30 text-[#818CF8]',
  INVEST: 'border-[#4ADE80]/30 text-[#4ADE80]',
  INFO:   'border-[#33333F] text-[#8E8E9C]',
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
            ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
            : 'bg-[#272735] text-[#8E8E9C]'
        )}
      >
        {initials}
      </div>
      {isNew && (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#171721] bg-[#C9A84C]" />
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#272735] text-[#3A3A4A]">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-[#8E8E9C]">No inquiries yet.</p>
          <p className="mt-0.5 text-xs text-[#3A3A4A]">Once your listings go live, messages will appear here.</p>
        </div>
      </div>
    )
  }

  const newCount = inquiries.filter((i) => i.status === 'NEW').length

  return (
    <div className={cn('space-y-1', className)}>
      {newCount > 0 && (
        <p className="mb-3 text-xs text-[#8E8E9C]">
          <span className="font-semibold text-[#C9A84C]">{newCount} unread</span>
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
              'flex items-start gap-3 rounded-lg border p-3 transition-colors',
              isNew
                ? 'border-[#C9A84C]/20 bg-[#C9A84C]/5 hover:border-[#C9A84C]/35'
                : 'border-[#33333F] bg-[#1E1E2A] hover:border-[#3A3A4A]'
            )}
          >
            <SenderAvatar initials={inquiry.fromInitials} isNew={isNew} />

            {/* Body */}
            <div className="min-w-0 flex-1">
              {/* Top row: name + intent badge + time */}
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-semibold', isNew ? 'text-[#EDEDF3]' : 'text-[#C3C3CC]')}>
                  {inquiry.fromName}
                </span>
                <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', INTENT_STYLE[inquiry.intent])}>
                  {INTENT_LABEL[inquiry.intent]}
                </span>
                <span className="ml-auto flex-shrink-0 text-[11px] text-[#8E8E9C]">
                  {formatTimeAgo(inquiry.timestamp)}
                </span>
              </div>

              {/* Asset */}
              <Link
                href={`/marketplace/${inquiry.assetId}`}
                className="mt-0.5 flex items-center gap-1 text-[11px] text-[#8E8E9C] hover:text-[#C9A84C]"
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 flex-shrink-0 rounded-full',
                    inquiry.assetType === 'LAND' ? 'bg-[#4ADE80]' : 'bg-[#C9A84C]'
                  )}
                />
                <span className="truncate">{inquiry.assetTitle}</span>
                <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 opacity-50" />
              </Link>

              {/* Message preview */}
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8E8E9C]">
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
      <p className="pt-2 text-center text-[11px] text-[#3A3A4A]">
        Reply threading and read receipts in{' '}
        <span className="text-[#8E8E9C]">Milestone 6</span>
      </p>
    </div>
  )
}
