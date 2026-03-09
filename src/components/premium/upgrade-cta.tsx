'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics/client'

// ---------------------------------------------------------------------------
// UpgradeCta — tasteful Pro upgrade prompt.
//
// compact: inline banner (single row, minimal visual weight)
// full:    feature-list card with CTA button
// ---------------------------------------------------------------------------

const PRO_FEATURES = [
  'Deep AI valuation analysis',
  'Value driver breakdowns',
  'Comparable sales data',
  'Advanced recommendation signals',
  'Priority market insights',
]

interface UpgradeCtaProps {
  className?: string
  compact?: boolean
}

export function UpgradeCta({ className, compact = false }: UpgradeCtaProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 px-4 py-3',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-[#C9A84C]" />
          <p className="text-xs text-[#A0A0B2]">
            Unlock advanced AI features with{' '}
            <span className="font-semibold text-[#C9A84C]">Pro</span>
          </p>
        </div>
        <Link
          href="/settings/billing"
          onClick={() => track({ name: 'upgrade.cta.clicked', properties: { location: 'compact_banner' } })}
          className="flex flex-shrink-0 items-center gap-1 text-[11px] font-semibold text-[#C9A84C] hover:opacity-80"
        >
          Upgrade <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-[#C9A84C]/20 bg-[#0D0D14]', className)}>
      <div className="border-b border-[#C9A84C]/15 bg-[#C9A84C]/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-semibold text-[#F5F5F7]">Upgrade to TIGI Pro</h3>
        </div>
        <p className="mt-1 text-[11px] text-[#6B6B80]">
          Unlock advanced AI analysis, deeper insights, and priority signals.
        </p>
      </div>
      <div className="space-y-2 p-5">
        {PRO_FEATURES.map((feat) => (
          <div key={feat} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#4ADE80]" />
            <span className="text-xs text-[#A0A0B2]">{feat}</span>
          </div>
        ))}
        <div className="pt-3">
          <Link
            href="/settings/billing"
            onClick={() => track({ name: 'upgrade.cta.clicked', properties: { location: 'full_card' } })}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C9A84C] py-2 text-sm font-semibold text-[#0A0A0F] transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade for $29/mo
          </Link>
          <p className="mt-2 text-center text-[10px] text-[#3A3A4A]">
            Cancel anytime · No contracts
          </p>
        </div>
      </div>
    </div>
  )
}
