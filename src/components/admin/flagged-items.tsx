import Link from 'next/link'
import { User, Building2, ArrowLeftRight, ChevronRight } from 'lucide-react'
import {
  type FlaggedItem,
  type FlaggedItemType,
  type FlagSeverity,
  formatAdminRelative,
} from '@/lib/admin/mock-admin-data'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// FlaggedItems — Content moderation queue for the admin dashboard.
//
// Severity system:
//   CRITICAL → red — immediate action required (fraud, legal risk)
//   HIGH     → amber — review within 24h (valuation fraud, payment anomaly)
//   MEDIUM   → yellow — review within 72h (reported inaccuracies)
//
// Full moderation workflow (suspend user, delist listing, escalate) lives
// at /admin/flagged — this component shows the overview queue only.
// ---------------------------------------------------------------------------

const SEVERITY_CONFIG: Record<
  FlagSeverity,
  { bg: string; border: string; dot: string; text: string; badge: string }
> = {
  CRITICAL: {
    bg:     'bg-[#EF4444]/5',
    border: 'border-l-2 border-l-[#EF4444] border-[#EF4444]/20',
    dot:    'bg-[#EF4444]',
    text:   'text-[#EF4444]',
    badge:  'bg-[#EF4444]/15 text-[#EF4444]',
  },
  HIGH: {
    bg:     '',
    border: 'border-l-2 border-l-[#F59E0B] border-[#2A2A3A]',
    dot:    'bg-[#F59E0B]',
    text:   'text-[#F59E0B]',
    badge:  'bg-[#F59E0B]/10 text-[#F59E0B]',
  },
  MEDIUM: {
    bg:     '',
    border: 'border-l-2 border-l-[#EAB308] border-[#2A2A3A]',
    dot:    'bg-[#EAB308]',
    text:   'text-[#EAB308]',
    badge:  'bg-[#EAB308]/10 text-[#EAB308]',
  },
}

const TYPE_CONFIG: Record<FlaggedItemType, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; color: string }> = {
  USER:        { icon: User,            label: 'User',        color: 'text-[#818CF8]' },
  LISTING:     { icon: Building2,       label: 'Listing',     color: 'text-[#C9A84C]' },
  TRANSACTION: { icon: ArrowLeftRight,  label: 'Transaction', color: 'text-[#A0A0B2]' },
}

const SOURCE_LABEL: Record<string, string> = {
  AI:     'AI',
  SYSTEM: 'System',
}

function formatSource(flaggedBy: string): string {
  return SOURCE_LABEL[flaggedBy] ?? 'User report'
}

interface FlaggedItemsProps {
  items: FlaggedItem[]
}

export function FlaggedItems({ items }: FlaggedItemsProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-[#6B6B80]">
        No flagged items. All clear.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const sev = SEVERITY_CONFIG[item.severity]
        const typeInfo = TYPE_CONFIG[item.type]
        const TypeIcon = typeInfo.icon

        return (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border bg-[#111118] p-3.5 transition-colors hover:bg-[#141420]',
              sev.border,
              sev.bg
            )}
          >
            {/* Severity dot + type icon */}
            <div className="mt-0.5 flex flex-shrink-0 flex-col items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', sev.dot)} />
              <TypeIcon className={cn('h-3.5 w-3.5', typeInfo.color)} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Header row */}
              <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    sev.badge
                  )}
                >
                  {item.severity}
                </span>
                <span className="rounded border border-[#2A2A3A] bg-[#0A0A0F] px-1.5 py-0.5 text-[10px] text-[#6B6B80]">
                  {typeInfo.label}
                </span>
                <span className="rounded border border-[#2A2A3A] bg-[#0A0A0F] px-1.5 py-0.5 text-[10px] text-[#6B6B80]">
                  {formatSource(item.flaggedBy)}
                </span>
              </div>

              {/* Subject */}
              <p className="mt-1.5 truncate text-xs font-medium text-[#F5F5F7]">
                {item.subjectLabel}
              </p>

              {/* Reason */}
              <p className="mt-0.5 text-xs leading-relaxed text-[#6B6B80]">
                {item.reason}
              </p>

              {/* Footer */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#4A4A5E]">
                  {formatAdminRelative(item.flaggedAt)}
                </span>
                <Link
                  href={item.reviewHref}
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium transition-colors',
                    item.severity === 'CRITICAL'
                      ? 'text-[#EF4444] hover:opacity-70'
                      : 'text-[#A0A0B2] hover:text-[#C9A84C]'
                  )}
                >
                  Investigate
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
