import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getActiveListings } from '@/lib/listings/listing-query'
import { getDashboardData } from '@/lib/dashboard/dashboard-query'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { canAccessAdvancedInsights } from '@/lib/premium/feature-gate'

export const metadata: Metadata = {
  title: 'Dashboard — TIGI',
  description: 'Your personal real estate investment dashboard.',
}

// ---------------------------------------------------------------------------
// Dashboard — /dashboard
//
// Async server component. Fetches user context + live listing catalogue in
// parallel, then passes everything to DashboardClient.
//
// requireAuth() redirects to /auth/login if the session has expired —
// belt-and-suspenders on top of the middleware guard.
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const sessionUser = await requireAuth('/dashboard')

  const [dashboardData, allListings] = await Promise.all([
    getDashboardData(sessionUser),
    getActiveListings(),
  ])

  return (
    <DashboardClient
      allListings={allListings}
      user={dashboardData.user}
      stats={dashboardData.stats}
      isPro={canAccessAdvancedInsights(sessionUser)}
      subscriptionTier={sessionUser.subscriptionTier ?? 'free'}
    />
  )
}
