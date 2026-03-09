'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { PLANS, type PlanId } from '@/lib/billing/billing-types'
import { PlanCard } from './plan-card'
import { CurrentPlanCard } from './current-plan-card'
import { track } from '@/lib/analytics/client'

interface BillingClientProps {
  currentTier: PlanId
  endsAt: Date | null
  isMockMode: boolean
}

// ---------------------------------------------------------------------------
// BillingClient — /settings/billing interactive layer.
//
// Handles:
//   - Annual/monthly billing toggle
//   - Upgrade checkout flow (POST /api/billing/checkout)
//   - Manage portal (POST /api/billing/manage)
//   - Session refresh after mock upgrade (useSession().update())
// ---------------------------------------------------------------------------

export function BillingClient({ currentTier, endsAt, isMockMode }: BillingClientProps) {
  const { update: updateSession } = useSession()
  const router = useRouter()

  const [annual, setAnnual] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [manageLoading, setManageLoading] = useState(false)
  const [manageMessage, setManageMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Displayed plans: Free, Pro, Pro+, Enterprise — always all four
  const displayPlans: PlanId[] = ['free', 'pro', 'pro_plus', 'enterprise']

  async function handleUpgrade(planId: PlanId) {
    setLoadingPlan(planId)
    setSuccessMessage(null)
    setErrorMessage(null)

    track({ name: 'upgrade.cta.clicked', properties: { location: `billing_page_${planId}` } })

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, annual }),
      })

      const data = await res.json() as {
        url?: string
        success?: boolean
        message?: string
        error?: string
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? data.message ?? 'Something went wrong. Please try again.')
        return
      }

      // Stripe: redirect to hosted checkout
      if (data.url) {
        router.push(data.url)
        return
      }

      // Mock / enterprise contact
      if (data.message) {
        setSuccessMessage(data.message)
      }

      // Mock success: refresh JWT so isPro updates immediately
      if (data.success) {
        await updateSession()
        setSuccessMessage(`You're now on ${PLANS[planId].name}. Premium features are now unlocked.`)
        // Soft-refresh so server components re-render with new tier
        router.refresh()
      }
    } catch (err) {
      console.error('[billing] checkout error:', err)
      setErrorMessage('Network error. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  async function handleManage() {
    setManageLoading(true)
    setManageMessage(null)

    try {
      const res = await fetch('/api/billing/manage', { method: 'POST' })
      const data = await res.json() as { url?: string; message?: string }

      if (data.url) {
        router.push(data.url)
      } else {
        setManageMessage(data.message ?? 'Manage portal unavailable.')
      }
    } catch {
      setManageMessage('Could not open billing portal.')
    } finally {
      setManageLoading(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* Current plan */}
      <CurrentPlanCard
        tier={currentTier}
        endsAt={endsAt}
        isMockMode={isMockMode}
        onManage={handleManage}
        isLoading={manageLoading}
        manageMessage={manageMessage}
      />

      {/* Success / error feedback */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-[#4ADE80]/20 bg-[#4ADE80]/5 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4ADE80]" />
          <p className="text-sm text-[#A0A0B2]">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#EF4444]" />
          <p className="text-sm text-[#A0A0B2]">{errorMessage}</p>
        </div>
      )}

      {/* Billing toggle */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#4A4A5E]">
            Plans
          </h2>
          <BillingToggle annual={annual} onToggle={setAnnual} />
        </div>

        {/* Plan grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {displayPlans.map((planId) => (
            <PlanCard
              key={planId}
              plan={PLANS[planId]}
              currentPlanId={currentTier}
              annual={annual}
              onUpgrade={handleUpgrade}
              isLoading={loadingPlan === planId}
            />
          ))}
        </div>
      </div>

      {/* Feature comparison footnote */}
      <div className="rounded-xl border border-[#1F1F2E] bg-[#0D0D14] px-5 py-4">
        <p className="text-xs text-[#4A4A5E]">
          All plans include access to the TIGI marketplace, property detail pages, and basic AI
          valuation estimates. Premium features unlock deeper intelligence and are billed monthly or
          annually. Cancel anytime. No long-term contracts.
        </p>
      </div>

      {/* Demo mode notice */}
      {isMockMode && (
        <div className="flex items-start gap-3 rounded-xl border border-[#2A2A3A] bg-[#0A0A0F] px-4 py-3">
          <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#F59E0B]" />
          <p className="text-xs text-[#6B6B80]">
            <span className="font-medium text-[#9999AA]">Demo mode.</span>{' '}
            Billing is simulated — no payment is required. Upgrading will instantly change your plan.
            Set <code className="rounded bg-[#1A1A24] px-1 font-mono text-[10px]">BILLING_PROVIDER=stripe</code> to
            enable real billing.
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// BillingToggle — monthly / annual switch
// ---------------------------------------------------------------------------

function BillingToggle({
  annual,
  onToggle,
}: {
  annual: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onToggle(false)}
        className={`text-xs font-medium transition-colors ${
          !annual ? 'text-[#F5F5F7]' : 'text-[#6B6B80] hover:text-[#A0A0B2]'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onToggle(!annual)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          annual ? 'bg-[#C9A84C]' : 'bg-[#2A2A3A]'
        }`}
        aria-label="Toggle annual billing"
        role="switch"
        aria-checked={annual}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            annual ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          annual ? 'text-[#F5F5F7]' : 'text-[#6B6B80] hover:text-[#A0A0B2]'
        }`}
      >
        Annual
        <span className="rounded-full bg-[#4ADE80]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#4ADE80]">
          Save 20%
        </span>
      </button>
    </div>
  )
}
