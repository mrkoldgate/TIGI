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
// If no plan exists yet, LegacyHubClient renders the intro/start view.
// ---------------------------------------------------------------------------

export default async function InheritancePage() {
  const user = await requireAuth('/inheritance')
  const plan = await getLegacyPlanForUser(user.id)

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <LegacyHubClient initialPlan={plan} />
    </div>
  )
}
