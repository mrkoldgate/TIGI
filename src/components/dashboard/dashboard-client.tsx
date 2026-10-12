'use client'

import Link from 'next/link'
import {
  Heart,
  Eye,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Wallet,
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
import { getRecommendations, DEMO_USER_PREFERENCES } from '@/lib/recommendations/recommendation-service'
import { RecommendationRail } from '@/components/recommendations/recommendation-rail'
import { SubmittedInquiryFeed } from '@/components/inquiries/submitted-inquiry-feed'
import { PremiumGate } from '@/components/premium/premium-gate'
import { UpgradeCta } from '@/components/premium/upgrade-cta'
import { SubscriptionBadge } from '@/components/premium/subscription-badge'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from './stat-card'
import { SectionHeader } from './section-header'
import { InsightCard } from './insight-card'
import { ActivityFeed } from './activity-feed'
import { MiniListingRow } from './mini-listing-row'
import { ValuationAlerts } from './valuation-alerts'

// ---------------------------------------------------------------------------
// DashboardClient — Buyer / Investor personal dashboard (Hyper-Glass v3).
//
// Glassflow 3D icon centerpieces for stat cards.
// Dimension nested glass layering for all section containers.
// Paragon ultra-thin borders with edge-lit hover on every interactive surface.
//
// Layout preserved:
//   1. PageHeader + Welcome bar
//   2. Stats row (4 Glassflow hero cards)
//   3. Two-column body (2/3 + 1/3)
// ---------------------------------------------------------------------------

interface DashboardClientProps {
  allListings: MockListing[]
  user: DashboardUser
  stats: DashboardStats
  isPro?: boolean
  subscriptionTier?: string
}

export function DashboardClient({ allListings, user, stats: serverStats, isPro = false, subscriptionTier = 'free' }: DashboardClientProps) {
  const { savedIds, savedCount } = useSavedListings()

  const recommendationResult = getRecommendations(
    allListings,
    { kind: 'DASHBOARD', prefs: { ...DEMO_USER_PREFERENCES, savedListingIds: [...savedIds] } },
    4,
  )
  const recommended = recommendationResult.items

  const watchlist = allListings
    .filter((l) => savedIds.has(l.id))
    .slice(0, 4)

  const watchlistDisplay =
    watchlist.length > 0
      ? watchlist
      : allListings.filter((l) => l.isTokenized).slice(0, 3)
  const watchlistIsEmpty = watchlist.length === 0

  const stats = { ...serverStats, savedCount }
  const greeting = getGreeting(user.firstName)

  return (
    <div className="relative pt-8 pb-8 space-y-10">
      {/* ── Dashboard Header ── */}
      <PageHeader
        title="Dashboard"
        eyebrow="Portfolio Overview"
        description="Here's what's happening with your investments today."
        actions={
          <div className="flex items-center gap-2">
            <KycBadge status={user.kycStatus} />
            <SubscriptionBadge tier={subscriptionTier} />
          </div>
        }
      />

      {/* ── Welcome & Quick Actions ── */}
      <WelcomeBar
        userName={user.name}
        role={user.role}
        subscriptionTier={subscriptionTier}
        greeting={greeting}
        kycStatus={user.kycStatus}
      />

      {/* ── Stats row — Glassflow 3D centerpieces ── */}
      <section aria-label="Summary statistics">
        <div className="stagger-children grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatCard
            label="Saved Assets"
            value={stats.savedCount}
            hint="Properties on your watchlist"
            icon={Heart}
            accent="rose"
            href="/saved"
          />
          <StatCard
            label="Active Interests"
            value={stats.activeInterestsCount}
            hint="Properties you're evaluating"
            icon={Eye}
            accent="blue"
          />
          <StatCard
            label="Investments"
            value={stats.investmentCount}
            hint="Token holdings across assets"
            icon={TrendingUp}
            accent="green"
            href="/portfolio"
          />
          <StatCard
            label="Portfolio Value"
            value="—"
            hint="Connect wallet to unlock"
            icon={BarChart3}
            accent="gold"
            lockedUntil="M4 · Wallet"
          />
        </div>
      </section>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-3">

        {/* ── LEFT column (2/3) ── */}
        <div className="space-y-10 lg:col-span-2">

          {/* AI Insights */}
          <section aria-label="AI insights">
            <SectionHeader
              title="AI Insights"
              description="Personalized signals based on your activity and market data."
              viewAllHref="/insights"
              viewAllLabel="All insights"
              milestone="M6"
            />
            <div className="mt-5">
              <PremiumGate
                isPro={isPro}
                feature="advanced AI insights"
                minHeight={220}
              >
                <div className="space-y-3">
                  {MOCK_INSIGHTS.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </PremiumGate>
              {!isPro && (
                <UpgradeCta compact className="mt-3" />
              )}
            </div>
          </section>

          {/* Recommended Listings */}
          <section aria-label="Recommended listings">
            <SectionHeader
              title="Recommended for You"
              description="Personalised by your activity, preferences, and AI signals."
              viewAllHref="/marketplace"
              viewAllLabel="Browse all"
            />
            <div className="mt-5">
              <RecommendationRail
                items={recommended}
                viewAllHref="/marketplace"
                viewAllLabel="View all listings"
              />
            </div>
          </section>

          {/* Watchlist / Favorites Preview */}
          <section aria-label="Watchlist preview">
            <SectionHeader
              title={watchlistIsEmpty ? 'Watchlist' : `Watchlist \u00B7 ${savedCount}`}
              description={
                watchlistIsEmpty
                  ? 'Save listings to build your watchlist.'
                  : 'Your saved properties at a glance.'
              }
              viewAllHref="/saved"
              viewAllLabel="View all saved"
            />
            <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 backdrop-blur-3xl shadow-2xl">
              <div className="noise absolute inset-0 pointer-events-none" />
              {/* Edge light */}
              <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              {/* Ambient wash */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/[0.05] blur-[60px]" aria-hidden="true" />

              {watchlistIsEmpty ? (
                <div className="px-3 py-2">
                  <p className="px-3 py-2 text-[11px] text-white/20">
                    You haven&apos;t saved anything yet. Here are some to get you started:
                  </p>
                  <div className="divide-y divide-white/[0.03]">
                    {watchlistDisplay.map((listing, i) => (
                      <div key={listing.id} className="px-3 py-1.5">
                        <MiniListingRow listing={listing} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {watchlistDisplay.map((listing, i) => (
                    <div key={listing.id} className="px-3 py-1.5">
                      <MiniListingRow listing={listing} index={i} />
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-white/[0.03] p-4">
                <Link
                  href="/saved"
                  className="group flex items-center justify-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.02] py-2.5 text-xs font-medium text-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-400 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white/70"
                >
                  {watchlistIsEmpty ? 'Browse marketplace' : 'View full watchlist'}
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* My Inquiries */}
          <section aria-label="My inquiries">
            <SectionHeader
              title="My Inquiries"
              description="Questions and interest you've sent to listing owners."
            />
            <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 p-5 backdrop-blur-3xl shadow-2xl">
              <div className="noise absolute inset-0 pointer-events-none" />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <SubmittedInquiryFeed />
            </div>
          </section>
        </div>

        {/* ── RIGHT column (1/3) ── */}
        <div className="space-y-10">

          {/* Recent Activity */}
          <section aria-label="Recent activity">
            <SectionHeader
              title="Recent Activity"
              description="Your latest interactions across the platform."
            />
            <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 p-5 backdrop-blur-3xl shadow-2xl">
              <div className="noise absolute inset-0 pointer-events-none" />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/[0.05] blur-[60px]" />
              <div className="relative">
                <ActivityFeed items={MOCK_ACTIVITY} />
              </div>
            </div>
          </section>

          {/* Valuation Alerts */}
          <section aria-label="Valuation alerts">
            <SectionHeader
              title="Valuation Alerts"
              description="AI-detected price and valuation changes."
              milestone="M6"
            />
            <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 p-5 backdrop-blur-3xl shadow-2xl">
              <div className="noise absolute inset-0 pointer-events-none" />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <div className="pointer-events-none absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-emerald-500/[0.04] blur-[50px]" />
              <div className="relative">
                <ValuationAlerts alerts={MOCK_VALUATION_ALERTS} />
              </div>
            </div>
          </section>

          {/* Portfolio Teaser */}
          <PortfolioTeaser />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// WelcomeBar — Dimension deep container with cyan accent
// ---------------------------------------------------------------------------

interface WelcomeBarProps {
  greeting: string
  userName: string
  role: string
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED'
  subscriptionTier?: string
}

function WelcomeBar({ greeting, userName, role, kycStatus, subscriptionTier = 'free' }: WelcomeBarProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 p-7 backdrop-blur-3xl shadow-2xl sm:p-8">
      <div className="noise absolute inset-0 pointer-events-none" />
      {/* Edge light — cyan accent */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      {/* Ambient wash */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/[0.05] blur-[80px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-indigo-500/[0.04] blur-[60px]" aria-hidden="true" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: greeting */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-white/20 uppercase">{greeting}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
            {userName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10px] text-white/25">
              {role}
            </span>
            <KycBadge status={kycStatus} />
            <SubscriptionBadge tier={subscriptionTier} />
          </div>
        </div>

        {/* Right: quick actions */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5">
          <Link
            href="/marketplace"
            className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-xs font-medium text-white/50 backdrop-blur-xl transition-all duration-400 hover:border-cyan-400/20 hover:bg-cyan-400/[0.04] hover:text-white hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            Browse marketplace
          </Link>
          <Link
            href="/settings/wallet"
            className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-xs font-medium text-white/30 backdrop-blur-xl transition-all duration-400 hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-white/60"
          >
            <Wallet className="h-3.5 w-3.5" />
            Connect wallet
          </Link>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KYC Badge — Paragon ultra-thin badges
// ---------------------------------------------------------------------------

function KycBadge({ status }: { status: WelcomeBarProps['kycStatus'] }) {
  if (status === 'VERIFIED') {
    return (
      <span className="flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
        <ShieldCheck className="h-3 w-3 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
        KYC Verified
      </span>
    )
  }
  if (status === 'PENDING') {
    return (
      <span className="flex items-center gap-1 rounded-full border border-amber-400/15 bg-amber-400/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-amber-400">
        KYC Pending
      </span>
    )
  }
  return (
    <Link
      href="/settings"
      className="flex items-center gap-1 rounded-full border border-red-400/15 bg-red-400/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-red-400 transition-opacity hover:opacity-80"
    >
      Complete KYC →
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Portfolio Teaser — Glassflow icon centerpiece CTA
// ---------------------------------------------------------------------------

function PortfolioTeaser() {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 p-7 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/[0.08]">
      <div className="noise absolute inset-0 pointer-events-none" />
      {/* Edge light */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/0 to-transparent transition-all duration-500 group-hover:via-cyan-400/20" />
      {/* Ambient wash */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/[0.06] blur-[60px]" />

      {/* Glassflow icon centerpiece */}
      <div className="relative mb-5 flex justify-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-cyan-500/[0.15] blur-[50px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-cyan-500/[0.08] blur-[20px]" />
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-md">
          <BarChart3 className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
        </div>
      </div>

      <div className="relative text-center">
        <h3 className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
          Your Portfolio
        </h3>
        <p className="mt-1.5 text-[11px] text-white/20">Holdings &amp; performance</p>
        <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-white/20">
          View your token holdings, track P&amp;L, and monitor yield performance
          across all fractional investments.
        </p>
      </div>

      <Link
        href="/portfolio"
        className="group/btn mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] py-3 text-xs font-medium text-white/40 transition-all duration-400 hover:border-cyan-400/20 hover:bg-white/[0.04] hover:text-white/70 hover:shadow-[0_0_20px_rgba(34,211,238,0.06)]"
      >
        <BarChart3 className="h-3.5 w-3.5" />
        View portfolio
        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(firstName: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${firstName}`
  if (hour < 18) return `Good afternoon, ${firstName}`
  return `Good evening, ${firstName}`
}
