import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { getPlatformAnalytics } from '@/lib/admin/analytics-query'
import { AnalyticsClient } from '@/components/admin/analytics-client'

export const metadata: Metadata = {
  title: 'Analytics — Admin',
  description: 'Platform-wide analytics: users, listings, intents, and conversion.',
}

// ---------------------------------------------------------------------------
// /admin/analytics — Platform analytics dashboard
//
// Async server component: fetches all four aggregates in parallel via
// getPlatformAnalytics(), then passes the snapshot to AnalyticsClient.
//
// All data is live from Prisma — no mock fallbacks. The page revalidates
// on every request (default dynamic rendering). Add revalidate = 60 once
// caching is appropriate.
//
// Auth: requireAdmin redirects non-ADMIN / non-COMPLIANCE_OFFICER sessions.
// ---------------------------------------------------------------------------

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  const data = await getPlatformAnalytics()

  return (
    <div className="animate-fade-in">
      <AnalyticsClient data={data} />
    </div>
  )
}
