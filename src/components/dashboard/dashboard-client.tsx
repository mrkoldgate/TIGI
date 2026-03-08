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
  MOCK_USER,
  MOCK_STATS,
  MOCK_INSIGHTS,
  MOCK_ACTIVITY,
  MOCK_VALUATION_ALERTS,
} from '@/lib/dashboard/mock-dashboard'
import { getRecommendations, DEMO_USER_PREFERENCES } from '@/lib/recommendations/recommendation-service'
import { RecommendationRail } from '@/components/recommendations/recommendation-rail'

import { StatCard } from './stat-card'
import { SectionHeader } from './section-header'
import { InsightCard } from './insight-card'
import { ActivityFeed } from './activity-feed'
import { MiniListingRow } from './mini-listing-row'
import { ValuationAlerts } from './valuation-alerts'

// ---------------------------------------------------------------------------
// DashboardClient — Buyer / Investor personal dashboard.
//
// Layout:
//   1. Welcome bar (greeting + KYC status + quick actions)
//   2. Stats row  (4 metric cards)
//   3. Two-column body (2/3 + 1/3 on desktop, stacked mobile):
//      Left:  AI Insights + Recommended Listings + Watchlist Preview
//      Right: Recent Activity + Valuation Alerts
//
// Data:
//   - savedCount comes from SavedListingsContext (live, client-side)
//   - all other data from mock-dashboard.ts (swap for API calls in M3+)
//   - allListings passed from the server page component
// ---------------------------------------------------------------------------

interface DashboardClientProps {
  allListings: MockListing[]
}

export function DashboardClient({ allListings }: DashboardClientProps) {
  const { savedIds, savedCount } = useSavedListings()

  // Recommended: scored by recommendation engine (saved-signal + tokenization + AI confidence)
  const recommendationResult = getRecommendations(
    allListings,
    { kind: 'DASHBOARD', prefs: { ...DEMO_USER_PREFERENCES, savedListingIds: [...savedIds] } },
    4,
  )
  const recommended = recommendationResult.items

  // Watchlist: live from saved context, show first 4
  const watchlist = allListings
    .filter((l) => savedIds.has(l.id))
    .slice(0, 4)

  // Supplement watchlist with fallbacks when user hasn't saved anything yet
  const watchlistDisplay =
    watchlist.length > 0
      ? watchlist
      : allListings.filter((l) => l.isTokenized).slice(0, 3)
  const watchlistIsEmpty = watchlist.length === 0

  const stats = {
    ...MOCK_STATS,
    savedCount, // live from context
  }

  const greeting = getGreeting(MOCK_USER.firstName)

  return (
    <div className="animate-fade-in pt-6 pb-16 space-y-8">

      {/* ── Welcome bar ─────────────────────────────────────────────────── */}
      <WelcomeBar
        greeting={greeting}
        userName={MOCK_USER.name}
        role={MOCK_USER.role}
        kycStatus={MOCK_USER.kycStatus}
      />

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <section aria-label="Summary statistics">
        <div className="stagger-children grid grid-cols-2 gap-3 lg:grid-cols-4">
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

      {/* ── Two-column body ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* ── LEFT column (2/3) ──────────────────────────────────────────── */}
        <div className="space-y-8 lg:col-span-2">

          {/* AI Insights */}
          <section aria-label="AI insights">
            <SectionHeader
              title="AI Insights"
              description="Personalized signals based on your activity and market data."
              viewAllHref="/insights"
              viewAllLabel="All insights"
              milestone="M6"
            />
            <div className="mt-4 space-y-3">
              {MOCK_INSIGHTS.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
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
            <div className="mt-4">
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
              title={watchlistIsEmpty ? 'Watchlist' : `Watchlist · ${savedCount}`}
              description={
                watchlistIsEmpty
                  ? 'Save listings to build your watchlist.'
                  : 'Your saved properties at a glance.'
              }
              viewAllHref="/saved"
              viewAllLabel="View all saved"
            />
            <div className="mt-4 overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118]">
              {watchlistIsEmpty ? (
                <div className="px-2 py-1">
                  {/* Show featured listings as inspiration when watchlist is empty */}
                  <p className="px-2 py-2 text-xs text-[#6B6B80]">
                    You haven't saved anything yet. Here are some to get you started:
                  </p>
                  <div className="divide-y divide-[#1F1F2E]">
                    {watchlistDisplay.map((listing, i) => (
                      <div key={listing.id} className="px-2 py-1">
                        <MiniListingRow listing={listing} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#1F1F2E]">
                  {watchlistDisplay.map((listing, i) => (
                    <div key={listing.id} className="px-2 py-1">
                      <MiniListingRow listing={listing} index={i} />
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-[#1F1F2E] px-4 py-3">
                <Link
                  href="/saved"
                  className="flex items-center gap-1.5 text-xs text-[#6B6B80] transition-colors hover:text-[#C9A84C]"
                >
                  {watchlistIsEmpty ? 'Browse marketplace' : 'View full watchlist'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* ── RIGHT column (1/3) ─────────────────────────────────────────── */}
        <div className="space-y-8">

          {/* Recent Activity */}
          <section aria-label="Recent activity">
            <SectionHeader
              title="Recent Activity"
              description="Your latest interactions across the platform."
            />
            <div className="mt-4">
              <ActivityFeed items={MOCK_ACTIVITY} />
            </div>
          </section>

          {/* Valuation Alerts */}
          <section aria-label="Valuation alerts">
            <SectionHeader
              title="Valuation Alerts"
              description="AI-detected price and valuation changes."
              milestone="M5"
            />
            <div className="mt-4">
              <ValuationAlerts alerts={MOCK_VALUATION_ALERTS} />
            </div>
          </section>

          {/* Portfolio unlock teaser */}
          <PortfolioTeaser />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Welcome bar — personalized greeting + KYC badge + quick action CTAs
// ---------------------------------------------------------------------------

interface WelcomeBarProps {
  greeting: string
  userName: string
  role: string
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED'
}

function WelcomeBar({ greeting, userName, role, kycStatus }: WelcomeBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Left: greeting */}
      <div>
        <p className="text-label text-[#6B6B80]">{greeting}</p>
        <h1 className="text-h1 mt-0.5">{userName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/* Role badge */}
          <span className="rounded border border-[#2A2A3A] bg-[#0A0A0F] px-2 py-0.5 text-[11px] text-[#A0A0B2]">
            {role}
          </span>
          {/* KYC status */}
          <KycBadge status={kycStatus} />
        </div>
      </div>

      {/* Right: quick actions */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        <Link
          href="/marketplace"
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] bg-[#1A1A24] px-3 py-1.5 text-xs font-medium text-[#A0A0B2] transition-colors hover:border-[#C9A84C]/40 hover:text-[#F5F5F7]"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
          Browse marketplace
        </Link>
        <Link
          href="/settings/wallet"
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] bg-[#1A1A24] px-3 py-1.5 text-xs font-medium text-[#A0A0B2] transition-colors hover:border-[#C9A84C]/40 hover:text-[#F5F5F7]"
        >
          <Wallet className="h-3.5 w-3.5 text-[#6B6B80]" />
          Connect wallet
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KYC badge — trust signal in the welcome bar
// ---------------------------------------------------------------------------

function KycBadge({ status }: { status: WelcomeBarProps['kycStatus'] }) {
  if (status === 'VERIFIED') {
    return (
      <span className="flex items-center gap-1 rounded border border-[#4ADE80]/30 bg-[#4ADE80]/10 px-2 py-0.5 text-[11px] text-[#4ADE80]">
        <ShieldCheck className="h-3 w-3" />
        KYC Verified
      </span>
    )
  }
  if (status === 'PENDING') {
    return (
      <span className="flex items-center gap-1 rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2 py-0.5 text-[11px] text-[#F59E0B]">
        KYC Pending
      </span>
    )
  }
  return (
    <Link
      href="/settings"
      className="flex items-center gap-1 rounded border border-[#F87171]/30 bg-[#F87171]/10 px-2 py-0.5 text-[11px] text-[#F87171] hover:opacity-80"
    >
      Complete KYC →
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Portfolio teaser — M4 unlock card in the sidebar column
// ---------------------------------------------------------------------------

function PortfolioTeaser() {
  return (
    <div className="rounded-xl border border-dashed border-[#2A2A3A] p-5 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A24] text-[#6B6B80]">
        <BarChart3 className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#F5F5F7]">Portfolio Analytics</h3>
      <p className="mt-1.5 text-xs text-[#6B6B80]">
        Total value, ROI, yield history, and performance charts arrive with wallet integration in Milestone 4.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-[#2A2A3A] bg-[#0A0A0F] px-3 py-1 text-[11px] text-[#6B6B80]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          Milestone 4
        </span>
        <Link
          href="/portfolio"
          className="text-[11px] text-[#6B6B80] underline-offset-2 hover:text-[#C9A84C] hover:underline"
        >
          Learn more
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EmptySection — consistent empty state placeholder
// ---------------------------------------------------------------------------

function EmptySection({
  message,
  hint,
  href,
  cta,
}: {
  message: string
  hint: string
  href: string
  cta: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-[#6B6B80]">{message}</p>
      <p className="text-xs text-[#3A3A4A]">{hint}</p>
      <Link
        href={href}
        className="text-xs font-medium text-[#C9A84C] hover:opacity-70"
      >
        {cta} →
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function getGreeting(firstName: string): string {
  // In real app use user's local time; fixed for SSR consistency in MVP
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${firstName}`
  if (hour < 18) return `Good afternoon, ${firstName}`
  return `Good evening, ${firstName}`
}
