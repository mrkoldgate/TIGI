import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getLegacyPlanForUser } from '@/lib/legacy/legacy-query'
import { LegacyHubClient } from '@/components/legacy/legacy-hub-client'

export const metadata: Metadata = {
  title: 'Legacy — TIGI',
  description: 'Set up your estate preferences and beneficiary instructions.',
}

// ---------------------------------------------------------------------------
// /inheritance — Legacy Planning module
//
// Server component: fetches the user's LegacyPlan (including beneficiaries)
// and passes it to LegacyHubClient which handles the multi-step wizard.
//
// TIGI Hyper-Glass v4 Elite: Pure black (#000000) base, massive atmospheric
// depth field (purple/gold), Paragon structural containers.
//
// If no plan exists yet, LegacyHubClient renders the intro/start view.
// ---------------------------------------------------------------------------

export default async function InheritancePage() {
  const user = await requireAuth('/inheritance')
  const plan = await getLegacyPlanForUser(user.id)

  return (
    <div className="animate-fade-in relative mx-auto max-w-2xl pt-8 pb-16">
      {/* ── TIGI v4 Elite atmospheric depth field — massive slow-drifting orbs ── */}
      <div
        className="pointer-events-none absolute -left-60 -top-32 h-[720px] w-[720px] rounded-full bg-purple-500/[0.07] blur-[200px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-48 top-[280px] h-[600px] w-[600px] rounded-full bg-amber-500/[0.05] blur-[180px] animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-[700px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.05] blur-[160px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/4 top-[1200px] h-[400px] w-[400px] rounded-full bg-yellow-500/[0.03] blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[500px] h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.005] blur-[240px]"
        aria-hidden="true"
      />

      <LegacyHubClient initialPlan={plan} />
    </div>
  )
}
