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
  pro:        { label: 'Pro',        className: 'border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C]' },
  pro_plus:   { label: 'Pro+',       className: 'border-[#818CF8]/40 bg-[#818CF8]/10 text-[#818CF8]' },
  enterprise: { label: 'Enterprise', className: 'border-[#4ADE80]/40 bg-[#4ADE80]/10 text-[#4ADE80]' },
  free:       { label: 'Free',       className: 'border-[#2A2A3A] bg-transparent text-[#6B6B80]' },
}

export function SubscriptionBadge({ tier, className, showFree = false }: SubscriptionBadgeProps) {
  if (tier === 'free' && !showFree) return null
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.free
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
