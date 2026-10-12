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
// Dashboard — /dashboard (TIGI Hyper-Glass v3)
//
// Atmospheric orb field + DashboardClient with Glassflow centerpieces,
// Dimension nested layering, and Paragon edge-lit structural grids.
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const sessionUser = await requireAuth('/dashboard')

  const [dashboardData, allListings] = await Promise.all([
    getDashboardData({ ...sessionUser, email: sessionUser.email || '' }),
    getActiveListings(),
  ])

  return (
    <div className="animate-fade-in relative">
      {/* ── Atmospheric orbs — quad depth field ── */}
      <div
        className="pointer-events-none absolute -left-48 -top-16 h-[580px] w-[580px] rounded-full bg-indigo-500/[0.06] blur-[160px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-36 top-[300px] h-[460px] w-[460px] rounded-full bg-purple-500/[0.05] blur-[140px] animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/4 top-[800px] h-[380px] w-[380px] rounded-full bg-cyan-500/[0.04] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/5 top-[1300px] h-[320px] w-[320px] rounded-full bg-emerald-500/[0.03] blur-[100px]"
        aria-hidden="true"
      />

      <DashboardClient
        allListings={allListings}
        user={dashboardData.user}
        stats={dashboardData.stats}
        isPro={canAccessAdvancedInsights(sessionUser)}
        subscriptionTier={sessionUser.subscriptionTier ?? 'free'}
      />
    </div>
  )
}
