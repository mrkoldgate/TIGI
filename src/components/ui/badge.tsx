import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Badge — Status and category labels.
// Color = information only. Never decorative (design-principles.md §11.4).
// ---------------------------------------------------------------------------

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        // Default — subtle gray
        default: 'bg-[#1A1A24] text-[#A0A0B2] ring-[#2A2A3A]',
        // Gold — for verified, premium, active states
        gold: 'bg-[#C9A84C]/10 text-[#C9A84C] ring-[#C9A84C]/30',
        // Success — approved, completed, positive
        success: 'bg-[#22C55E]/10 text-[#22C55E] ring-[#22C55E]/30',
        // Warning — pending, under review, approaching limit
        warning: 'bg-[#F59E0B]/10 text-[#F59E0B] ring-[#F59E0B]/30',
        // Error — failed, rejected, error states
        error: 'bg-[#EF4444]/10 text-[#EF4444] ring-[#EF4444]/30',
        // Info — informational, links
        info: 'bg-[#3B82F6]/10 text-[#3B82F6] ring-[#3B82F6]/30',
        // Outline — subtle bordered
        outline: 'bg-transparent text-[#6B6B80] ring-[#2A2A3A]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-[#22C55E]',
            variant === 'warning' && 'bg-[#F59E0B]',
            variant === 'error' && 'bg-[#EF4444]',
            variant === 'info' && 'bg-[#3B82F6]',
            variant === 'gold' && 'bg-[#C9A84C]',
            (!variant || variant === 'default' || variant === 'outline') && 'bg-[#6B6B80]'
          )}
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }

// ---------------------------------------------------------------------------
// StatusBadge — convenience wrapper for property/transaction statuses
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  ACTIVE: { variant: 'success' as const, label: 'Active', dot: true },
  DRAFT: { variant: 'outline' as const, label: 'Draft', dot: false },
  UNDER_REVIEW: { variant: 'warning' as const, label: 'Under Review', dot: true },
  SOLD: { variant: 'info' as const, label: 'Sold', dot: false },
  LEASED: { variant: 'info' as const, label: 'Leased', dot: false },
  DELISTED: { variant: 'default' as const, label: 'Delisted', dot: false },
  COMPLETED: { variant: 'success' as const, label: 'Completed', dot: false },
  PENDING: { variant: 'warning' as const, label: 'Pending', dot: true },
  FAILED: { variant: 'error' as const, label: 'Failed', dot: false },
  CANCELLED: { variant: 'default' as const, label: 'Cancelled', dot: false },
  VERIFIED: { variant: 'gold' as const, label: 'Verified', dot: false },
  FLAGGED: { variant: 'error' as const, label: 'Flagged', dot: true },
} as const

type StatusKey = keyof typeof STATUS_CONFIG

interface StatusBadgeProps {
  status: StatusKey
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant={config.variant} dot={config.dot} className={className}>
      {config.label}
    </Badge>
  )
}
