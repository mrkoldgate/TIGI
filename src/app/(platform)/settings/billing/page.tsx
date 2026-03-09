import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { BillingClient } from '@/components/billing/billing-client'
import type { PlanId } from '@/lib/billing/billing-types'

export const metadata: Metadata = {
  title: 'Plan & Billing — TIGI',
  description: 'Manage your TIGI subscription and billing.',
}

// ---------------------------------------------------------------------------
// /settings/billing — Subscription management page.
//
// Server component: fetches current subscription state from DB (not session JWT
// which may be stale). Passes live data to BillingClient for interaction.
//
// After a mock upgrade, BillingClient calls useSession().update() which
// triggers the jwt callback with trigger='update', re-fetching from DB.
// ---------------------------------------------------------------------------

export default async function BillingPage() {
  const sessionUser = await requireAuth('/settings/billing')

  // Always fetch billing state from DB — JWT may be stale after upgrade
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      subscriptionTier: true,
      subscriptionEndsAt: true,
    },
  })

  const currentTier = (user?.subscriptionTier ?? 'free') as PlanId
  const endsAt = user?.subscriptionEndsAt ?? null
  const isMockMode = (process.env.BILLING_PROVIDER ?? 'mock') === 'mock'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Plan & Billing"
        description="Choose the plan that fits your investment strategy."
      />

      <div className="mt-8 max-w-5xl">
        <BillingClient
          currentTier={currentTier}
          endsAt={endsAt}
          isMockMode={isMockMode}
        />
      </div>
    </div>
  )
}
