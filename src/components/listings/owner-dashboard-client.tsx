'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Building2,
  Map,
  Compass,
  Coins,
  ArrowRight,
} from 'lucide-react'
import { type SellerListing, getSellerStats, formatPrice } from '@/lib/listings/seller-mock-data'
import {
  MOCK_OWNER_USER,
  MOCK_OWNER_INQUIRIES,
  MOCK_OWNER_PERFORMANCE,
  OWNER_QUICK_ACTIONS,
} from '@/lib/listings/owner-mock-data'

import { cn } from '@/lib/utils'
import { StatCard } from '@/components/dashboard/stat-card'
import { SectionHeader } from '@/components/dashboard/section-header'
import { InquiryFeed } from './inquiry-feed'
import { PerformancePanel } from './performance-panel'
import { SellerListingsClient } from './seller-listings-client'

// ---------------------------------------------------------------------------
// OwnerDashboardClient — Property owner / land owner dashboard shell.
//
// Layout:
//   1. Welcome bar (greeting + KYC + role badge)
//   2. Quick Actions strip (New Property | New Land | Tokenize | Marketplace)
//   3. Stats row — 5 cards: Active | Pending | Drafts | Inquiries | Portfolio Value
//   4. Two-column body (lg: 2/3 + 1/3):
//      Left:  Recent Inquiries
//      Right: Performance Panel
//   5. Full-width: My Listings (SellerListingsClient in embedded mode)
//
// Data:
//   - listings prop from server (MOCK_SELLER_LISTINGS in MVP)
//   - MOCK_OWNER_USER / MOCK_OWNER_INQUIRIES / MOCK_OWNER_PERFORMANCE from owner-mock-data
//
// Visual consistency: reuses StatCard, SectionHeader from buyer dashboard.
// Color language: property = gold (#C9A84C), land = green (#4ADE80), both = neutral.
// ---------------------------------------------------------------------------

interface OwnerDashboardClientProps {
  listings: SellerListing[]
}

export function OwnerDashboardClient({ listings }: OwnerDashboardClientProps) {
  const stats = useMemo(() => getSellerStats(listings), [listings])
  const newInquiryCount = MOCK_OWNER_INQUIRIES.filter((i) => i.status === 'NEW').length
  const greeting = getGreeting(MOCK_OWNER_USER.firstName)

  return (
    <div className="animate-fade-in pt-6 pb-16 space-y-8">

      {/* ── Welcome bar ─────────────────────────────────────────────────── */}
      <OwnerWelcomeBar
        greeting={greeting}
        user={MOCK_OWNER_USER}
        portfolioValue={stats.totalPortfolioValue}
        newInquiryCount={newInquiryCount}
      />

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <section aria-label="Quick actions">
        <QuickActionsStrip />
      </section>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <section aria-label="Summary statistics">
        <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Active Listings"
            value={stats.active}
            hint="Live on marketplace"
            icon={CheckCircle2}
            accent="gold"
            href="/listings?status=active"
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            hint="Awaiting TIGI compliance"
            icon={Clock}
            accent="blue"
          />
          <StatCard
            label="Saved Drafts"
            value={stats.draft}
            hint="Ready to submit"
            icon={FileText}
            accent="rose"
            href="/listings?status=draft"
          />
          <StatCard
            label="Inquiries"
            value={stats.totalInquiries}
            hint={newInquiryCount > 0 ? `${newInquiryCount} unread` : 'All time'}
            icon={MessageSquare}
            accent="green"
          />
          <StatCard
            label="Portfolio Value"
            value={formatPrice(stats.totalPortfolioValue)}
            hint="Active listings, ask prices"
            icon={BarChart3}
            accent="gold"
          />
        </div>
      </section>

      {/* ── Two-column: Inquiries + Performance ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Left 2/3: Recent Inquiries */}
        <section aria-label="Recent inquiries" className="lg:col-span-2">
          <SectionHeader
            title={newInquiryCount > 0 ? `Inquiries · ${newInquiryCount} new` : 'Inquiries'}
            description="Messages from potential buyers, tenants, and investors."
            milestone="M3 · Full Inbox"
          />
          <div className="mt-4">
            <InquiryFeed inquiries={MOCK_OWNER_INQUIRIES} />
          </div>
        </section>

        {/* Right 1/3: Performance */}
        <section aria-label="Performance overview">
          <SectionHeader
            title="Performance"
            description="Engagement across your portfolio."
            milestone="M3 · Advanced"
          />
          <div className="mt-4 rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
            <PerformancePanel stats={MOCK_OWNER_PERFORMANCE} />
          </div>
        </section>
      </div>

      {/* ── My Listings (full width) ────────────────────────────────────── */}
      <section aria-label="My listings">
        <SectionHeader
          title="My Listings"
          description="Manage, publish, and track all your properties and land parcels."
          viewAllHref="/listings/new"
          viewAllLabel="+ New listing"
        />
        <div className="mt-4">
          <SellerListingsClient listings={listings} embeddedMode />
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Welcome bar — personalized header with portfolio callout
// ---------------------------------------------------------------------------

interface OwnerWelcomeBarProps {
  greeting: string
  user: typeof MOCK_OWNER_USER
  portfolioValue: number
  newInquiryCount: number
}

function OwnerWelcomeBar({ greeting, user, portfolioValue, newInquiryCount }: OwnerWelcomeBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Left */}
      <div>
        <p className="text-label text-[#6B6B80]">{greeting}</p>
        <h1 className="text-h1 mt-0.5">{user.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded border border-[#2A2A3A] bg-[#0A0A0F] px-2 py-0.5 text-[11px] text-[#A0A0B2]">
            {user.role}
          </span>
          <KycBadge status={user.kycStatus} />
          {portfolioValue > 0 && (
            <span className="rounded border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-2 py-0.5 text-[11px] text-[#C9A84C]">
              Portfolio · {formatPrice(portfolioValue)}
            </span>
          )}
          {newInquiryCount > 0 && (
            <span className="rounded-full bg-[#C9A84C] px-2 py-0.5 text-[11px] font-semibold text-[#0A0A0F]">
              {newInquiryCount} new {newInquiryCount === 1 ? 'inquiry' : 'inquiries'}
            </span>
          )}
        </div>
      </div>

      {/* Right: primary CTA */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        <Link
          href="/listings/new?type=property"
          className="flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#0A0A0F] transition-opacity hover:opacity-90"
        >
          <Building2 className="h-3.5 w-3.5" />
          New Property
        </Link>
        <Link
          href="/listings/new?type=land"
          className="flex items-center gap-1.5 rounded-lg border border-[#4ADE80]/40 bg-[#4ADE80]/10 px-4 py-2 text-sm font-semibold text-[#4ADE80] transition-colors hover:border-[#4ADE80]/60"
        >
          <Map className="h-3.5 w-3.5" />
          New Land
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KYC badge (mirrors buyer dashboard)
// ---------------------------------------------------------------------------

function KycBadge({ status }: { status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' }) {
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
// Quick Actions strip — 4 action cards in a horizontal scroll row
// ---------------------------------------------------------------------------

function QuickActionsStrip() {
  const ACCENT: Record<string, { border: string; bg: string; text: string; icon: string }> = {
    primary: {
      border: 'border-[#C9A84C]/30 hover:border-[#C9A84C]/60',
      bg:     'bg-[#C9A84C]/5',
      text:   'text-[#C9A84C]',
      icon:   'text-[#C9A84C]',
    },
    land: {
      border: 'border-[#4ADE80]/25 hover:border-[#4ADE80]/50',
      bg:     'bg-[#4ADE80]/5',
      text:   'text-[#4ADE80]',
      icon:   'text-[#4ADE80]',
    },
    default: {
      border: 'border-[#2A2A3A] hover:border-[#3A3A4A]',
      bg:     'bg-[#111118]',
      text:   'text-[#A0A0B2]',
      icon:   'text-[#6B6B80]',
    },
  }

  const ACTION_ICONS: Record<string, React.ElementType> = {
    'qa-new-property': Building2,
    'qa-new-land':     Map,
    'qa-tokenize':     Coins,
    'qa-marketplace':  Compass,
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {OWNER_QUICK_ACTIONS.map((action) => {
        const style = ACCENT[action.variant]
        const Icon = ACTION_ICONS[action.id] ?? ArrowRight
        const isLocked = Boolean(action.milestone)

        const inner = (
          <div
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-4 transition-all',
              style.border,
              style.bg,
              isLocked ? 'opacity-60' : 'cursor-pointer'
            )}
          >
            {/* Top row: icon + milestone badge */}
            <div className="flex items-center justify-between">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-black/20`}>
                <Icon className={`h-4 w-4 ${style.icon}`} />
              </div>
              {action.milestone && (
                <span className="flex items-center gap-1 rounded border border-[#2A2A3A] bg-[#0A0A0F] px-1.5 py-0.5 text-[10px] text-[#6B6B80]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                  {action.milestone}
                </span>
              )}
            </div>

            {/* Label */}
            <div>
              <p className={`text-sm font-semibold ${style.text}`}>{action.label}</p>
              <p className="mt-0.5 text-xs text-[#6B6B80] leading-snug">{action.description}</p>
            </div>
          </div>
        )

        if (isLocked) {
          return <div key={action.id}>{inner}</div>
        }

        return (
          <Link key={action.id} href={action.href}>
            {inner}
          </Link>
        )
      })}
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
