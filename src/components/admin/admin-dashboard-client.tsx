'use client'

import {
  Users,
  Building2,
  ClipboardList,
  Flag,
  ArrowLeftRight,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'
import {
  ADMIN_PLATFORM_STATS,
  MOCK_REVIEW_QUEUE,
  MOCK_FLAGGED_ITEMS,
  MOCK_RECENT_USERS,
  MOCK_DEFERRED_COUNTS,
} from '@/lib/admin/mock-admin-data'
import type { KycQueueStats } from '@/lib/compliance/kyc-query'
import type { InquirySummary } from '@/lib/admin/inquiry-admin-query'

import { AdminStatCard } from './admin-stat-card'
import { ReviewQueue } from './review-queue'
import { FlaggedItems } from './flagged-items'
import { UserSummary } from './user-summary'
import { DeferredQueues } from './deferred-queues'

// ---------------------------------------------------------------------------
// AdminDashboardClient — Admin command center overview.
//
// Layout:
//   1. Command bar — title + last-refreshed timestamp + system status
//   2. KPI row (6 tiles) — Users | Listings | Reviews | Flags | Trans | Revenue
//   3. Priority grid (lg: 3/5 + 2/5):
//      Left (3/5):  Pending Review Queue (full table)
//      Right (2/5): Flagged Items (moderation list)
//   4. Lower grid (lg: 1/2 + 1/2):
//      Left (1/2):  User Activity (KPIs + recent registrations)
//      Right (1/2): Deferred Queues (Inheritance / Compliance / Support)
//
// Data: all from lib/admin/mock-admin-data.ts in MVP.
// DB integration: replace mock constants with prisma aggregates per section.
// ---------------------------------------------------------------------------

// Inline AdminSectionHeader (admin-specific, not shared with platform)
function AdminSectionHeader({
  title,
  count,
  href,
  urgentCount,
}: {
  title: string
  count?: number
  href?: string
  urgentCount?: number
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6B6B80]">
          {title}
        </h2>
        {count !== undefined && (
          <span className="rounded bg-[#1A1A24] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#A0A0B2]">
            {count}
          </span>
        )}
        {urgentCount !== undefined && urgentCount > 0 && (
          <span className="flex items-center gap-1 rounded bg-[#EF4444]/15 px-1.5 py-0.5 text-[11px] font-semibold text-[#EF4444]">
            <AlertTriangle className="h-3 w-3" />
            {urgentCount} critical
          </span>
        )}
      </div>
      {href && (
        <a
          href={href}
          className="text-xs text-[#6B6B80] transition-colors hover:text-[#C9A84C]"
        >
          View all →
        </a>
      )}
    </div>
  )
}

interface AdminDashboardClientProps {
  /** Live count of Property.status = UNDER_REVIEW (from DB). */
  pendingReviewCount?: number
  /** Live KYC queue stats (from DB). */
  kycStats?: KycQueueStats
  /** Live inquiry aggregate counts (from DB). */
  inquirySummary?: InquirySummary
}

export function AdminDashboardClient({ pendingReviewCount, kycStats, inquirySummary }: AdminDashboardClientProps = {}) {
  const stats = ADMIN_PLATFORM_STATS
  const criticalFlags   = MOCK_FLAGGED_ITEMS.filter((f) => f.severity === 'CRITICAL').length
  const criticalReviews = MOCK_REVIEW_QUEUE.filter((r) => r.urgency === 'CRITICAL').length

  // Use live count when available; fall back to mock
  const liveReviewCount  = pendingReviewCount ?? stats.pendingReviewListings
  const kycPending       = (kycStats?.pending ?? 0) + (kycStats?.submitted ?? 0)
  const liveInquiries    = inquirySummary?.total    ?? stats.totalInquiries
  const liveNewInquiries = inquirySummary?.newCount ?? stats.newInquiries

  return (
    <div className="space-y-8">

      {/* ── Command bar ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
            Administration
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">
            Command Center
          </h1>
          <p className="mt-1 text-sm text-[#6B6B80]">
            Platform overview and moderation controls.
          </p>
        </div>

        {/* System status */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-[#1F1F2E] bg-[#111118] px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#4ADE80]" />
            <span className="text-xs text-[#6B6B80]">All systems operational</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#4A4A5E]">
            <RefreshCw className="h-3 w-3" />
            {pendingReviewCount !== undefined ? 'Live · KYC, Reviews & Inquiries' : 'Mock data'}
          </div>
        </div>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <section aria-label="Platform KPIs">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <AdminStatCard
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            hint={`${stats.verifiedUsers} verified`}
            icon={Users}
            urgency="normal"
            delta={{ value: stats.newUsersLast7d, label: 'this week' }}
            href="/admin/users"
          />
          <AdminStatCard
            label="Active Listings"
            value={stats.activeListings}
            hint={`${stats.pausedListings} paused`}
            icon={Building2}
            urgency="normal"
            href="/admin/listings"
          />
          <AdminStatCard
            label="Pending Review"
            value={liveReviewCount}
            hint="Listings awaiting review"
            icon={ClipboardList}
            urgency={liveReviewCount > 5 ? 'warn' : 'normal'}
            delta={
              criticalReviews > 0
                ? { value: criticalReviews, label: 'critical', urgent: true }
                : undefined
            }
            href="/admin/reviews"
          />
          <AdminStatCard
            label="KYC Queue"
            value={kycPending}
            hint={kycStats ? `${kycStats.verified} verified` : 'Pending + submitted'}
            icon={ShieldCheck}
            urgency={kycPending > 10 ? 'warn' : 'normal'}
            href="/admin/compliance"
          />
          <AdminStatCard
            label="Flagged Items"
            value={stats.openFlags}
            hint="Unresolved flags"
            icon={Flag}
            urgency={criticalFlags > 0 ? 'critical' : stats.openFlags > 0 ? 'warn' : 'normal'}
            delta={
              criticalFlags > 0
                ? { value: criticalFlags, label: 'critical', urgent: true }
                : undefined
            }
            href="/admin/flagged"
          />
          <AdminStatCard
            label="Inquiries"
            value={liveInquiries}
            hint={liveNewInquiries > 0 ? `${liveNewInquiries} unread` : 'All time'}
            icon={MessageSquare}
            urgency={liveNewInquiries > 20 ? 'warn' : 'normal'}
            delta={
              liveNewInquiries > 0
                ? { value: liveNewInquiries, label: 'unread' }
                : undefined
            }
          />
          <AdminStatCard
            label="Platform Revenue"
            value="—"
            hint="Fee income"
            icon={DollarSign}
            urgency="normal"
            lockedUntil="M12"
          />
        </div>
      </section>

      {/* ── Priority section: Review Queue + Flagged Items ───────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Left 3/5: Review Queue */}
        <section aria-label="Pending review queue" className="lg:col-span-3">
          <AdminSectionHeader
            title="Pending Reviews"
            count={liveReviewCount}
            href="/admin/reviews"
            urgentCount={criticalReviews}
          />
          <ReviewQueue items={MOCK_REVIEW_QUEUE} />
        </section>

        {/* Right 2/5: Flagged Items */}
        <section aria-label="Flagged items" className="lg:col-span-2">
          <AdminSectionHeader
            title="Flagged"
            count={MOCK_FLAGGED_ITEMS.length}
            href="/admin/flagged"
            urgentCount={criticalFlags}
          />
          <FlaggedItems items={MOCK_FLAGGED_ITEMS} />
        </section>
      </div>

      {/* ── Lower section: User Activity + Deferred Queues ──────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Left: User Activity */}
        <section aria-label="User activity">
          <AdminSectionHeader
            title="Users"
            count={stats.totalUsers}
            href="/admin/users"
          />
          <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
            <UserSummary stats={stats} recentUsers={MOCK_RECENT_USERS} />
          </div>
        </section>

        {/* Right: Deferred Queues */}
        <section aria-label="Deferred queues">
          <AdminSectionHeader
            title="Queues"
          />
          <DeferredQueues counts={MOCK_DEFERRED_COUNTS} />
        </section>
      </div>
    </div>
  )
}
