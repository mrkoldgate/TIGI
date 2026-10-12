'use client'

import Link from 'next/link'
import {
  Heart,
  Eye,
  Layers,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Wallet,
  Store,
} from 'lucide-react'
import { useSavedListings } from '@/lib/saved/saved-context'
import { type MockListing } from '@/lib/marketplace/mock-data'
import {
  type DashboardUser,
  type DashboardStats,
  MOCK_INSIGHTS,
  MOCK_ACTIVITY,
  MOCK_VALUATION_ALERTS,
} from '@/lib/dashboard/mock-dashboard'
import type { DashboardAllocation } from '@/lib/dashboard/dashboard-query'
import { getRecommendations, DEMO_USER_PREFERENCES } from '@/lib/recommendations/recommendation-service'
import { RecommendationRail } from '@/components/recommendations/recommendation-rail'
import { SubmittedInquiryFeed } from '@/components/inquiries/submitted-inquiry-feed'
import { PremiumGate } from '@/components/premium/premium-gate'
import { UpgradeCta } from '@/components/premium/upgrade-cta'
import { SubscriptionBadge } from '@/components/premium/subscription-badge'
import { PageHeader, SectionTitle } from '@/components/shared/page-header'
import { InsightCard } from './insight-card'
import { ActivityFeed } from './activity-feed'
import { MiniListingRow } from './mini-listing-row'
import { ValuationAlerts } from './valuation-alerts'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// DashboardClient — v5
//
// Mercury-style home: a greeting, then one glass tray that answers "what do I
// own and what is it worth" (value, gain vs cost, allocation by property),
// with the four counts beside it. Below: picks, watchlist, signals,
// inquiries on the left; activity, valuation alerts and plan on the right.
// ---------------------------------------------------------------------------

interface DashboardClientProps {
  allListings: MockListing[]
  user: DashboardUser
  stats: DashboardStats
  allocation?: DashboardAllocation[]
  isPro?: boolean
  subscriptionTier?: string
}

const ALLOCATION_COLORS = ['#A78BFA', '#6366F1', '#C084FC', '#22D3EE', '#818CF8', '#7C3AED']

const usd = (n: number, digits = 0) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits, minimumFractionDigits: digits })

export function DashboardClient({
  allListings,
  user,
  stats: serverStats,
  allocation = [],
  isPro = false,
  subscriptionTier = 'free',
}: DashboardClientProps) {
  const { savedIds, savedCount } = useSavedListings()

  const recommended = getRecommendations(
    allListings,
    { kind: 'DASHBOARD', prefs: { ...DEMO_USER_PREFERENCES, savedListingIds: [...savedIds] } },
    4,
  ).items

  const watchlist = allListings.filter((l) => savedIds.has(l.id)).slice(0, 5)
  const watchlistIsEmpty = watchlist.length === 0
  const watchlistDisplay = watchlistIsEmpty ? allListings.filter((l) => l.isTokenized).slice(0, 3) : watchlist

  const stats = { ...serverStats, savedCount }

  return (
    <div className="space-y-14">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${user.firstName}`}
        description="Your holdings, watchlist and market signals in one place."
        actions={
          <>
            <Link href="/settings/wallet" className="btn-glass !px-5 !py-2.5 text-sm no-underline">
              <Wallet className="h-4 w-4" />
              Connect wallet
            </Link>
            <Link href="/marketplace" className="btn-primary !px-5 !py-2.5 text-sm no-underline">
              <Store className="h-4 w-4" />
              Browse marketplace
            </Link>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <KycBadge status={user.kycStatus} />
            <SubscriptionBadge tier={subscriptionTier} showFree />
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#A0A0B2]">
              {user.role.toLowerCase()}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#7A7A8A]">
              Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        }
      />

      {/* ── Overview tray ── */}
      <section aria-label="Overview" className="tray" data-reveal="up">
        <div className="grid gap-1.5 lg:grid-cols-[1.35fr_1fr]">
          <PortfolioCell value={stats.portfolioValue} invested={stats.totalInvested} allocation={allocation} />

          <div className="grid grid-cols-2 gap-1.5">
            <CountCell icon={Heart} label="Saved" value={stats.savedCount} hint="On your watchlist" href="/saved" />
            <CountCell icon={Eye} label="Active interests" value={stats.activeInterestsCount} hint="Offers & inquiries open" href="/transactions" />
            <CountCell icon={Layers} label="Holdings" value={stats.investmentCount} hint="Properties you own shares in" href="/portfolio" />
            <IdentityCell status={user.kycStatus} />
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-3">
        <div className="space-y-14 lg:col-span-2">
          <section aria-label="Recommended listings" data-reveal="up">
            <SectionTitle
              index="01"
              title="Picked for you"
              description="Ranked by what you save, view and invest in."
              action={<ViewAll href="/marketplace" label="Browse all" />}
            />
            <RecommendationRail items={recommended} viewAllHref="/marketplace" viewAllLabel="View all listings" />
          </section>

          <section aria-label="Watchlist" data-reveal="up">
            <SectionTitle
              index="02"
              title={watchlistIsEmpty ? 'Watchlist' : `Watchlist · ${savedCount}`}
              description={watchlistIsEmpty ? 'Nothing saved yet. A few tokenized listings to start with:' : 'Your saved properties at a glance.'}
              action={<ViewAll href="/saved" label="All saved" />}
            />
            <div className="panel overflow-hidden p-2">
              <div className="divide-y divide-white/[0.05]">
                {watchlistDisplay.map((listing, i) => (
                  <div key={listing.id} className="px-1 py-1">
                    <MiniListingRow listing={listing} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-label="AI signals" data-reveal="up">
            <SectionTitle
              index="03"
              title="Signals"
              description="Price moves and new matches on the properties you follow."
              action={<ViewAll href="/insights" label="All insights" />}
            />
            <PremiumGate isPro={isPro} feature="advanced AI insights" minHeight={220}>
              <div className="space-y-3">
                {MOCK_INSIGHTS.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </PremiumGate>
            {!isPro && <UpgradeCta compact className="mt-3" />}
          </section>

          <section aria-label="My inquiries" data-reveal="up">
            <SectionTitle index="04" title="Your inquiries" description="Questions and interest you've sent to owners." />
            <div className="panel p-5">
              <SubmittedInquiryFeed />
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <section aria-label="Recent activity" data-reveal="up">
            <SectionTitle title="Recent activity" />
            <div className="panel p-5">
              <ActivityFeed items={MOCK_ACTIVITY} />
            </div>
          </section>

          <section aria-label="Valuation alerts" data-reveal="up">
            <SectionTitle title="Valuation alerts" description="AI-detected changes. Sample data." />
            <div className="panel p-5">
              <ValuationAlerts alerts={MOCK_VALUATION_ALERTS} />
            </div>
          </section>

          <section aria-label="Portfolio" data-reveal="up">
            <Link href="/portfolio" className="panel panel-hover group block overflow-hidden p-6 no-underline">
              <p className="text-label">Portfolio</p>
              <p className="section-title mt-3">Holdings, yield and history</p>
              <p className="mt-2 text-sm leading-relaxed text-[#A0A0B2]">
                Track your shares, gain against cost and rental yield across every property.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-violet-200 transition-colors group-hover:text-white">
                Open portfolio
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Overview cells
// ---------------------------------------------------------------------------

function PortfolioCell({
  value,
  invested,
  allocation,
}: {
  value: number | null
  invested: number | null
  allocation: DashboardAllocation[]
}) {
  if (value === null || allocation.length === 0) {
    return (
      <div className="cell flex flex-col justify-between p-7">
        <div>
          <p className="text-label">Portfolio value</p>
          <p className="figure mt-4 text-[44px] leading-none text-[#F5F5F7]/40">$0</p>
          <p className="mt-3 max-w-sm text-sm text-[#A0A0B2]">
            You don&apos;t own any shares yet. Start from $100 on any tokenized property.
          </p>
        </div>
        <Link href="/marketplace" className="btn-primary mt-6 self-start !px-5 !py-2.5 text-sm no-underline">
          Find a property
        </Link>
      </div>
    )
  }

  const gain = invested !== null ? value - invested : 0
  const gainPct = invested ? (gain / invested) * 100 : 0
  const up = gain >= 0
  const total = allocation.reduce((s, a) => s + a.value, 0) || 1

  return (
    <div className="cell p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label">Portfolio value</p>
          <p className="figure mt-4 text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] leading-none">{usd(value, 2)}</p>
          <p className="mt-3 flex items-center gap-2 font-mono text-[13px] tabular-nums">
            <span className={up ? 'text-[#34D399]' : 'text-[#F87171]'}>
              {up ? '+' : '−'}{usd(Math.abs(gain), 2)} ({up ? '+' : '−'}{Math.abs(gainPct).toFixed(2)}%)
            </span>
            <span className="text-[#7A7A8A]">vs. cost</span>
          </p>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E8E9C]">
          Sample prices
        </span>
      </div>

      {/* Allocation bar */}
      <div className="mt-8">
        <p className="text-label mb-3">Allocation</p>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.04]" role="img" aria-label="Allocation by property">
          {allocation.map((a, i) => (
            <span
              key={a.propertyId}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(a.value / total) * 100}%`,
                background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
                boxShadow: `0 0 14px ${ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]}66`,
                marginRight: i < allocation.length - 1 ? 2 : 0,
              }}
            />
          ))}
        </div>
        <ul className="mt-4 space-y-2.5">
          {allocation.slice(0, 4).map((a, i) => (
            <li key={a.propertyId} className="flex items-center gap-3 text-[13.5px]">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }} />
              <Link href={`/marketplace/${a.propertyId}`} className="min-w-0 flex-1 truncate text-[#C3C3CC] no-underline hover:text-white">
                {a.title} <span className="text-[#7A7A8A]">· {a.city}</span>
              </Link>
              <span className="font-mono tabular-nums text-[#F5F5F7]">{usd(a.value)}</span>
              <span className="w-12 text-right font-mono text-[12px] tabular-nums text-[#8E8E9C]">
                {((a.value / total) * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CountCell({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value: number | string
  hint: string
  href?: string
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-500/[0.08] text-violet-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Icon className="h-4 w-4" />
        </span>
        {href && <ArrowUpRight className="h-4 w-4 text-[#6E6E7E] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-200" />}
      </div>
      <p className="figure mt-6 text-[34px] leading-none">{value}</p>
      <p className="mt-2 text-[13px] font-medium text-[#F5F5F7]">{label}</p>
      <p className="mt-0.5 text-[12px] text-[#8E8E9C]">{hint}</p>
    </>
  )
  return href ? (
    <Link href={href} className="cell group block p-5 no-underline">{body}</Link>
  ) : (
    <div className="cell group p-5">{body}</div>
  )
}

function IdentityCell({ status }: { status: DashboardUser['kycStatus'] }) {
  const verified = status === 'VERIFIED'
  const pending = status === 'PENDING'
  return (
    <Link href="/settings/kyc" className="cell group block p-5 no-underline">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
            verified ? 'border-emerald-300/25 bg-emerald-400/[0.08] text-emerald-300' : pending ? 'border-amber-300/25 bg-amber-400/[0.08] text-amber-300' : 'border-violet-300/20 bg-violet-500/[0.08] text-violet-200',
          )}
        >
          <ShieldCheck className="h-4 w-4" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-[#6E6E7E] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-200" />
      </div>
      <p className={cn('mt-6 font-display text-[22px] font-[520] leading-none tracking-[-0.02em]', verified ? 'text-emerald-300' : pending ? 'text-amber-300' : 'text-[#F5F5F7]')} style={{ fontStretch: '106%' }}>
        {verified ? 'Verified' : pending ? 'In review' : 'Not started'}
      </p>
      <p className="mt-2 text-[13px] font-medium text-[#F5F5F7]">Identity check</p>
      <p className="mt-0.5 text-[12px] text-[#8E8E9C]">{verified ? 'You can invest' : 'Needed before investing'}</p>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-[#A0A0B2] no-underline transition-colors hover:text-violet-200">
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
    </Link>
  )
}

function KycBadge({ status }: { status: DashboardUser['kycStatus'] }) {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1 text-[11.5px] font-medium text-emerald-300">
        <ShieldCheck className="h-3.5 w-3.5" />
        Identity verified
      </span>
    )
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1 text-[11.5px] font-medium text-amber-300">
        Identity check in review
      </span>
    )
  }
  return (
    <Link
      href="/settings/kyc"
      className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/25 bg-violet-500/[0.08] px-3 py-1 text-[11.5px] font-medium text-violet-200 no-underline transition-colors hover:text-white"
    >
      Verify your identity →
    </Link>
  )
}
