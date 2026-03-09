'use client'

import { Sparkles, Calendar, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANS, type PlanId } from '@/lib/billing/billing-types'

interface CurrentPlanCardProps {
  tier: PlanId
  endsAt: Date | null
  isMockMode: boolean
  onManage: () => void
  isLoading: boolean
  manageMessage: string | null
}

export function CurrentPlanCard({
  tier,
  endsAt,
  isMockMode,
  onManage,
  isLoading,
  manageMessage,
}: CurrentPlanCardProps) {
  const plan = PLANS[tier]
  const isFree = tier === 'free'

  const tierColor = {
    free:       'text-[#6B6B80]',
    pro:        'text-[#C9A84C]',
    pro_plus:   'text-[#818CF8]',
    enterprise: 'text-[#22C55E]',
  }[tier]

  const tierBg = {
    free:       'bg-[#2A2A3A]/30 border-[#2A2A3A]',
    pro:        'bg-[#C9A84C]/5 border-[#C9A84C]/20',
    pro_plus:   'bg-[#818CF8]/5 border-[#818CF8]/20',
    enterprise: 'bg-[#22C55E]/5 border-[#22C55E]/20',
  }[tier]

  return (
    <div className={cn('rounded-2xl border p-5', tierBg)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border',
            tier === 'free'
              ? 'border-[#2A2A3A] bg-[#1A1A24]'
              : 'border-[#C9A84C]/20 bg-[#C9A84C]/10',
          )}>
            <Sparkles className={cn('h-5 w-5', tierColor)} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#4A4A5E]">
              Current plan
            </p>
            <p className={cn('mt-0.5 text-lg font-bold', tierColor)}>
              {plan.name}
            </p>
          </div>
        </div>

        {!isFree && (
          <button
            onClick={onManage}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] bg-[#1A1A24] px-3 py-1.5 text-xs font-medium text-[#A0A0B2] transition-colors hover:border-[#C9A84C]/30 hover:text-[#F5F5F7] disabled:opacity-50"
          >
            <Settings2 className="h-3 w-3" />
            Manage
          </button>
        )}
      </div>

      {/* Renewal info */}
      {!isFree && endsAt && (
        <div className="mt-4 flex items-center gap-2 text-xs text-[#6B6B80]">
          <Calendar className="h-3.5 w-3.5" />
          Renews {endsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      )}

      {/* Demo mode notice */}
      {isMockMode && !isFree && (
        <p className="mt-3 text-[11px] text-[#4A4A5E]">
          Demo mode — payments are simulated. Connect Stripe to enable real billing.
        </p>
      )}

      {/* Free plan prompt */}
      {isFree && (
        <p className="mt-3 text-xs text-[#6B6B80]">
          Upgrade to Pro to unlock deep AI valuations, unlimited watchlists, and recommendation signals.
        </p>
      )}

      {/* Manage portal message */}
      {manageMessage && (
        <p className="mt-3 rounded-lg border border-[#2A2A3A] bg-[#0A0A0F] px-3 py-2 text-xs text-[#A0A0B2]">
          {manageMessage}
        </p>
      )}
    </div>
  )
}
