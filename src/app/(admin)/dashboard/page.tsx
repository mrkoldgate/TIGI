import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { getPendingReviewCount } from '@/lib/admin/listing-review-query'
import { getKycQueueStats } from '@/lib/compliance/kyc-query'
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client'

export const metadata: Metadata = {
  title: 'Command Center — Admin',
  description: 'TIGI platform administration and oversight.',
}

// ---------------------------------------------------------------------------
// /admin/dashboard — Admin command center
//
// Async server component: fetches live counts for the two KPI tiles that
// have real DB data. The rest uses mock data pending later milestones.
//
// Live data:
//   pendingReviewCount — Property.status = UNDER_REVIEW
//   kycStats           — KycVerification grouped counts
// ---------------------------------------------------------------------------

export default async function AdminDashboardPage() {
  await requireAdmin()

  const [pendingReviewCount, kycStats] = await Promise.all([
    getPendingReviewCount(),
    getKycQueueStats(),
  ])

  return (
    <AdminDashboardClient
      pendingReviewCount={pendingReviewCount}
      kycStats={kycStats}
    />
  )
}
