'use client'

// ---------------------------------------------------------------------------
// AnalyticsClient — Internal platform analytics dashboard.
//
// Layout:
//   1. KPI row — Users / Listings / Intents / Inquiries + deltas
//   2. User health — KYC funnel bar, subscription tier breakdown
//   3. Intent pipeline — conversion funnel + volume by type
//   4. Listing pipeline — status distribution + type breakdown
//   5. Conversion funnel — Users → KYC verified → Intent → Executed
//   6. Premium conversion — placeholder (real data in M10+ when Stripe active)
//
// All charts are pure CSS bar / progress elements — no chart library needed.
// Future path: drop in Recharts / Tremor without changing data shape.
// ---------------------------------------------------------------------------

import { RefreshCw, TrendingUp, Users, Building2, ArrowLeftRight, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlatformAnalytics } from '@/lib/admin/analytics-query'

// ── Props ──────────────────────────────────────────────────────────────────

interface AnalyticsClientProps {
  data: PlatformAnalytics
}

// ── Root ───────────────────────────────────────────────────────────────────

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const { users, listings, intents, inquiries, generatedAt } = data

  const snapshotTime = new Date(generatedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
            Administration
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">
            Platform Analytics
          </h1>
          <p className="mt-1 text-sm text-[#6B6B80]">
            Live aggregates from the production database.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#1F1F2E] bg-[#111118] px-3 py-1.5 text-[11px] text-[#4A4A5E]">
          <RefreshCw className="h-3 w-3" />
          Snapshot at {snapshotTime}
        </div>
      </div>

      {/* ── Top KPI tiles ───────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiTile
            label="Total Users"
            value={users.totalUsers}
            sub={`+${users.newLast7d} this week`}
            icon={Users}
            accent="#C9A84C"
          />
          <KpiTile
            label="Total Listings"
            value={listings.totalListings}
            sub={`${listings.activeListing} active`}
            icon={Building2}
            accent="#818CF8"
          />
          <KpiTile
            label="Total Intents"
            value={intents.totalIntents}
            sub={`+${intents.newLast7d} this week`}
            icon={ArrowLeftRight}
            accent="#4ADE80"
          />
          <KpiTile
            label="Inquiries"
            value={inquiries.total}
            sub={`${inquiries.unread} unread`}
            icon={MessageSquare}
            accent="#F59E0B"
          />
        </div>
      </section>

      {/* ── Users + Subscription ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* KYC Health */}
        <AnalyticsCard title="Identity Verification (KYC)">
          <div className="space-y-3">
            <KycFunnelRow
              label="Verified"
              count={users.kycVerified}
              total={users.totalUsers}
              color="#4ADE80"
            />
            <KycFunnelRow
              label="Pending / In review"
              count={users.kycPending}
              total={users.totalUsers}
              color="#F59E0B"
            />
            <KycFunnelRow
              label="Not submitted"
              count={users.kycNone}
              total={users.totalUsers}
              color="#3A3A4E"
            />
            <KycFunnelRow
              label="Rejected"
              count={users.kycRejected}
              total={users.totalUsers}
              color="#EF4444"
            />
          </div>
          <div className="mt-4 border-t border-[#1E1E2A] pt-3">
            <p className="text-xs text-[#6B6B80]">
              Verification rate:{' '}
              <span className="font-semibold text-[#4ADE80]">
                {users.totalUsers > 0
                  ? Math.round((users.kycVerified / users.totalUsers) * 100)
                  : 0}%
              </span>
            </p>
          </div>
        </AnalyticsCard>

        {/* Subscription tiers */}
        <AnalyticsCard title="Subscription Tiers">
          <div className="space-y-3">
            <TierRow label="Free"        count={users.tierFree}       total={users.totalUsers} color="#3A3A4E" />
            <TierRow label="Pro"         count={users.tierPro}        total={users.totalUsers} color="#C9A84C" />
            <TierRow label="Pro+"        count={users.tierProPlus}    total={users.totalUsers} color="#818CF8" />
            <TierRow label="Enterprise"  count={users.tierEnterprise} total={users.totalUsers} color="#22C55E" />
          </div>
          <div className="mt-4 border-t border-[#1E1E2A] pt-3">
            <p className="text-xs text-[#6B6B80]">
              Paid conversion:{' '}
              <span className="font-semibold text-[#C9A84C]">
                {users.totalUsers > 0
                  ? Math.round(
                      ((users.tierPro + users.tierProPlus + users.tierEnterprise) /
                        users.totalUsers) *
                        100,
                    )
                  : 0}%
              </span>
              <span className="ml-1 text-[#4A4A5E]">· Full data in M10+ (Stripe)</span>
            </p>
          </div>
        </AnalyticsCard>
      </div>

      {/* ── Intent pipeline ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Intent types */}
        <AnalyticsCard title="Intent Volume by Type">
          <div className="space-y-3">
            <BarRow
              label="Express Interest"
              count={intents.byType.EXPRESS_INTEREST}
              total={intents.totalIntents}
              color="#6B6B80"
            />
            <BarRow
              label="Prepare Purchase"
              count={intents.byType.PREPARE_PURCHASE}
              total={intents.totalIntents}
              color="#C9A84C"
            />
            <BarRow
              label="Prepare Invest"
              count={intents.byType.PREPARE_INVEST}
              total={intents.totalIntents}
              color="#4ADE80"
            />
            <BarRow
              label="Prepare Lease"
              count={intents.byType.PREPARE_LEASE}
              total={intents.totalIntents}
              color="#818CF8"
            />
          </div>
          <div className="mt-4 border-t border-[#1E1E2A] pt-3">
            <p className="text-xs text-[#6B6B80]">
              +{intents.newLast30d} intents in last 30 days
            </p>
          </div>
        </AnalyticsCard>

        {/* Intent conversion funnel */}
        <AnalyticsCard title="Intent Conversion Funnel">
          <div className="space-y-4">
            <FunnelStep
              label="Created"
              count={intents.funnel.created}
              pct={100}
              color="#6B6B80"
              step={1}
            />
            <FunnelStep
              label="In Review / Approved"
              count={intents.funnel.reviewing}
              pct={
                intents.funnel.created > 0
                  ? Math.round((intents.funnel.reviewing / intents.funnel.created) * 100)
                  : 0
              }
              color="#C9A84C"
              step={2}
            />
            <FunnelStep
              label="Executed On-Chain"
              count={intents.funnel.executed}
              pct={
                intents.funnel.created > 0
                  ? Math.round((intents.funnel.executed / intents.funnel.created) * 100)
                  : 0
              }
              color="#4ADE80"
              step={3}
            />
          </div>
          <div className="mt-4 border-t border-[#1E1E2A] pt-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-[#4ADE80]" />
            <p className="text-xs text-[#6B6B80]">
              Full Solana execution tracking active in M8+
            </p>
          </div>
        </AnalyticsCard>
      </div>

      {/* ── Listing pipeline ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Listing status */}
        <AnalyticsCard title="Listing Pipeline">
          <div className="space-y-3">
            <BarRow label="Active"       count={listings.activeListing} total={listings.totalListings} color="#4ADE80" />
            <BarRow label="Under Review" count={listings.underReview}   total={listings.totalListings} color="#F59E0B" />
            <BarRow label="Draft"        count={listings.draftListings} total={listings.totalListings} color="#3A3A4E" />
            <BarRow label="Sold"         count={listings.sold}          total={listings.totalListings} color="#C9A84C" />
            <BarRow label="Delisted"     count={listings.delisted}      total={listings.totalListings} color="#6B6B80" />
          </div>
          <div className="mt-4 border-t border-[#1E1E2A] pt-3">
            <p className="text-xs text-[#6B6B80]">
              {listings.tokenizedCount} tokenized listings ({listings.totalListings > 0
                ? Math.round((listings.tokenizedCount / listings.totalListings) * 100)
                : 0}% of total)
            </p>
          </div>
        </AnalyticsCard>

        {/* Listing type */}
        <AnalyticsCard title="Listing Type Breakdown">
          <div className="space-y-3">
            <BarRow label="Residential" count={listings.byType.RESIDENTIAL} total={listings.totalListings} color="#C9A84C" />
            <BarRow label="Commercial"  count={listings.byType.COMMERCIAL}  total={listings.totalListings} color="#818CF8" />
            <BarRow label="Land"        count={listings.byType.LAND}        total={listings.totalListings} color="#4ADE80" />
            <BarRow label="Industrial"  count={listings.byType.INDUSTRIAL}  total={listings.totalListings} color="#F59E0B" />
            <BarRow label="Mixed-Use"   count={listings.byType.MIXED_USE}   total={listings.totalListings} color="#6B6B80" />
          </div>
        </AnalyticsCard>
      </div>

      {/* ── Platform conversion funnel ──────────────────────────────────── */}
      <AnalyticsCard title="Platform Acquisition Funnel">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FunnelBlock
            step="01"
            label="Registered Users"
            value={users.totalUsers}
            pct={100}
            color="#6B6B80"
          />
          <FunnelBlock
            step="02"
            label="KYC Verified"
            value={users.kycVerified}
            pct={
              users.totalUsers > 0
                ? Math.round((users.kycVerified / users.totalUsers) * 100)
                : 0
            }
            color="#F59E0B"
          />
          <FunnelBlock
            step="03"
            label="Intent Created"
            value={intents.totalIntents}
            pct={
              users.totalUsers > 0
                ? Math.round((intents.totalIntents / users.totalUsers) * 100)
                : 0
            }
            color="#C9A84C"
          />
          <FunnelBlock
            step="04"
            label="Executed"
            value={intents.funnel.executed}
            pct={
              users.totalUsers > 0
                ? Math.round((intents.funnel.executed / users.totalUsers) * 100)
                : 0
            }
            color="#4ADE80"
            locked={intents.funnel.executed === 0 ? 'M8+' : undefined}
          />
        </div>
      </AnalyticsCard>

      {/* ── Inquiry summary ─────────────────────────────────────────────── */}
      <AnalyticsCard title="Inquiry Activity">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InquiryTile label="Total"     value={inquiries.total}    color="#6B6B80" />
          <InquiryTile label="Unread"    value={inquiries.unread}   color="#F59E0B" />
          <InquiryTile label="Replied"   value={inquiries.replied}  color="#4ADE80" />
          <InquiryTile label="Last 7d"   value={inquiries.newLast7d} color="#C9A84C" />
        </div>
        {inquiries.total > 0 && (
          <div className="mt-4 border-t border-[#1E1E2A] pt-3">
            <p className="text-xs text-[#6B6B80]">
              Reply rate:{' '}
              <span className="font-semibold text-[#4ADE80]">
                {Math.round((inquiries.replied / inquiries.total) * 100)}%
              </span>
            </p>
          </div>
        )}
      </AnalyticsCard>

      {/* ── Revenue placeholder ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-dashed border-[#2A2A3A] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A3A] bg-[#111118]">
            <TrendingUp className="h-4 w-4 text-[#4A4A5E]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B6B80]">Revenue & Premium Conversion</p>
            <p className="text-xs text-[#4A4A5E]">
              Full revenue analytics — Stripe fee income, subscription MRR, platform fee
              per executed intent — available in M10+ when Stripe billing is activated.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function AnalyticsCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#1E1E2A] bg-[#111118] p-5">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
        {title}
      </p>
      {children}
    </div>
  )
}

function KpiTile({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  sub: string
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="rounded-xl border border-[#1E1E2A] bg-[#111118] p-4">
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}18` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-[#F5F5F7]">
        {value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-xs font-medium text-[#6B6B80]">{label}</p>
      <p className="mt-1 text-[10px] text-[#4A4A5E]">{sub}</p>
    </div>
  )
}

function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs text-[#A0A0B2]">{label}</span>
        <span className="text-xs tabular-nums text-[#6B6B80]">{count.toLocaleString()} ({pct}%)</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#1A1A24]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// Alias used for KYC and tier bars (same shape)
const KycFunnelRow = BarRow
const TierRow = BarRow

function FunnelStep({
  label,
  count,
  pct,
  color,
  step,
}: {
  label: string
  count: number
  pct: number
  color: string
  step: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#0A0A0F]"
        style={{ backgroundColor: color }}
      >
        {step}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-xs text-[#A0A0B2]">{label}</span>
          <span className="text-xs tabular-nums text-[#6B6B80]">{count.toLocaleString()} · {pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#1A1A24]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}

function FunnelBlock({
  step,
  label,
  value,
  pct,
  color,
  locked,
}: {
  step: string
  label: string
  value: number
  pct: number
  color: string
  locked?: string
}) {
  return (
    <div className={cn('rounded-xl border border-[#1E1E2A] bg-[#0D0D14] p-4', locked && 'opacity-60')}>
      <p className="text-[10px] font-semibold" style={{ color }}>{step}</p>
      <p className="mt-2 text-xl font-bold tabular-nums text-[#F5F5F7]">
        {locked ? locked : value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-[11px] text-[#6B6B80]">{label}</p>
      {!locked && (
        <div className="mt-2 h-1 w-full rounded-full bg-[#1A1A24]">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
          />
        </div>
      )}
      {!locked && (
        <p className="mt-1 text-[10px] tabular-nums" style={{ color }}>{pct}% of users</p>
      )}
    </div>
  )
}

function InquiryTile({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-xl border border-[#1E1E2A] bg-[#0D0D14] px-4 py-3">
      <p className="text-xl font-bold tabular-nums" style={{ color }}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-[#6B6B80]">{label}</p>
    </div>
  )
}
