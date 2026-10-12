'use client'

import Link from 'next/link'
import { Check, X, Sparkles, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Plan, type PlanId, formatPlanPrice } from '@/lib/billing/billing-types'

interface PlanCardProps {
  plan: Plan
  currentPlanId: PlanId
  annual: boolean
  onUpgrade: (planId: PlanId) => void
  isLoading: boolean
}

export function PlanCard({ plan, currentPlanId, annual, onUpgrade, isLoading }: PlanCardProps) {
  const isCurrent = plan.id === currentPlanId
  const isEnterprise = plan.id === 'enterprise'
  const priceDisplay = formatPlanPrice(plan, annual)

  // Determine CTA state
  const ctaLabel = (() => {
    if (isCurrent) return 'Current plan'
    if (isEnterprise) return 'Contact sales'
    if (plan.id === 'free') return 'Downgrade to Free'
    return `Upgrade to ${plan.name}`
  })()

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-all',
        plan.highlighted && !isCurrent
          ? 'border-indigo-500/40 bg-white/[0.04] shadow-[0_0_40px_rgba(99,102,241,0.08)]'
          : 'border-white/[0.08] bg-white/[0.03]',
        isCurrent && 'border-white/[0.08] ring-1 ring-[#4ADE80]/30',
      )}
    >
      {/* Badge */}
      {plan.badge && !isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-0.5 text-[11px] font-semibold text-[#0A0A0F]">
            <Sparkles className="h-2.5 w-2.5" />
            {plan.badge}
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#4ADE80]/30 bg-[#4ADE80]/10 px-3 py-0.5 text-[11px] font-semibold text-[#4ADE80]">
            Active plan
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h3 className="font-heading text-base font-semibold text-[#F5F5F7]">{plan.name}</h3>
        <p className="mt-0.5 text-xs text-[#8E8E9C]">{plan.tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        {isEnterprise ? (
          <p className="text-2xl font-bold text-[#F5F5F7]">Custom</p>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold tabular-nums text-[#F5F5F7]">
              {priceDisplay}
            </span>
          </div>
        )}
        {annual && plan.annualSavingsPercent && !isEnterprise && (
          <p className="mt-1 text-[11px] text-[#4ADE80]">
            Save {plan.annualSavingsPercent}% vs monthly
          </p>
        )}
        {annual && plan.priceAnnual && plan.id !== 'free' && !isEnterprise && (
          <p className="mt-0.5 text-[11px] text-[#8E8E9C]">
            billed ${plan.priceAnnual}/yr
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="mb-6">
        {isEnterprise ? (
          <a
            href="mailto:enterprise@tigi.com"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-sm font-semibold text-[#A0A0B2] transition-colors hover:border-indigo-500/40 hover:text-indigo-400"
          >
            <Building2 className="h-4 w-4" />
            Contact sales
          </a>
        ) : isCurrent ? (
          <div className="flex w-full items-center justify-center rounded-xl border border-[#4ADE80]/20 bg-[#4ADE80]/5 py-2.5 text-sm font-semibold text-[#4ADE80]">
            Current plan
          </div>
        ) : (
          <button
            onClick={() => onUpgrade(plan.id)}
            disabled={isLoading}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
              plan.highlighted
                ? 'bg-indigo-500 text-[#0A0A0F] hover:opacity-90 disabled:opacity-50'
                : 'border border-white/[0.08] bg-white/[0.04] text-[#A0A0B2] hover:border-indigo-500/40 hover:text-[#F5F5F7] disabled:opacity-50',
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              <>
                {plan.highlighted && <Sparkles className="h-3.5 w-3.5" />}
                {ctaLabel}
              </>
            )}
          </button>
        )}
      </div>

      {/* Feature list */}
      <ul className="space-y-2.5">
        {plan.features.map((feat) => (
          <li key={feat.label} className="flex items-start gap-2.5">
            {feat.included ? (
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#4ADE80]" />
            ) : (
              <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#6E6E7E]" />
            )}
            <span
              className={cn(
                'text-xs leading-relaxed',
                feat.included ? 'text-[#A0A0B2]' : 'text-[#7A7A8A]',
              )}
            >
              {feat.label}
              {feat.note && (
                <span className="ml-1 text-[10px] text-[#7A7A8A]">({feat.note})</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
