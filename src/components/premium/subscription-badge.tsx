import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// SubscriptionBadge — tier pill for welcome bars and profile contexts.
// Renders nothing for 'free' tier by default (avoids upsell clutter).
// ---------------------------------------------------------------------------

interface SubscriptionBadgeProps {
  tier: string
  className?: string
  /** Show badge even for free tier */
  showFree?: boolean
}

const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  pro:        { label: 'Pro',        className: 'border-[#6366F1]/40 bg-[#6366F1]/10 text-[#6366F1]' },
  pro_plus:   { label: 'Pro+',       className: 'border-[#818CF8]/40 bg-[#818CF8]/10 text-[#818CF8]' },
  enterprise: { label: 'Enterprise', className: 'border-[#4ADE80]/40 bg-[#4ADE80]/10 text-[#4ADE80]' },
  free:       { label: 'Free',       className: 'border-white/[0.08] bg-transparent text-[#8E8E9C]' },
}

export function SubscriptionBadge({ tier, className, showFree = false }: SubscriptionBadgeProps) {
  if (tier === 'free' && !showFree) return null
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.free

  // Free tier badge links to billing to encourage upgrade
  if (tier === 'free' && showFree) {
    return (
      <Link
        href="/settings/billing"
        className={cn(
          'inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80',
          config.className,
          className,
        )}
      >
        {config.label}
      </Link>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
