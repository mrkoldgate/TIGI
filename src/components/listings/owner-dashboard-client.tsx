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
  Plus,
} from 'lucide-react'
import { type SellerListing, getSellerStats, formatPrice } from '@/lib/listings/seller-mock-data'
import {
  type OwnerUser,
  type OwnerInquiry,
  MOCK_OWNER_INQUIRIES,
  MOCK_OWNER_PERFORMANCE,
  OWNER_QUICK_ACTIONS,
} from '@/lib/listings/owner-mock-data'
import type { InquiryDTO } from '@/lib/inquiries/inquiry-types'

import { PageHeader } from '@/components/shared/page-header'
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
// Color language: property = indigo (#6366F1), land = green (#4ADE80), both = neutral.
// ---------------------------------------------------------------------------

interface OwnerDashboardClientProps {
  listings:   SellerListing[]
  ownerUser:  OwnerUser
  /** Real inquiries from DB — falls back to mock when not provided */
  inquiries?: InquiryDTO[]
}

// ---------------------------------------------------------------------------
// Adapter: InquiryDTO (from service) → OwnerInquiry (existing InquiryFeed shape)
// ---------------------------------------------------------------------------
function toOwnerInquiry(dto: InquiryDTO): OwnerInquiry {
  const intentMap: Record<string, OwnerInquiry['intent']> = {
    GENERAL:              'INFO',
    INTERESTED_BUYING:    'BUY',
    INTERESTED_INVESTING: 'INVEST',
    INTERESTED_LEASING:   'LEASE',
  }
  return {
    id:             dto.id,
    assetId:        dto.propertyId,
    assetTitle:     dto.propertyTitle,
    assetType:      dto.propertyType === 'LAND' ? 'LAND' : 'PROPERTY',
    fromName:       dto.fromUserName ?? 'Anonymous',
    fromInitials:   dto.fromInitials,
    intent:         intentMap[dto.inquiryType] ?? 'INFO',
    messagePreview: dto.message.slice(0, 120),
    timestamp:      dto.createdAt,
    status:         dto.status as OwnerInquiry['status'],
  }
}

export function OwnerDashboardClient({ listings, ownerUser, inquiries }: OwnerDashboardClientProps) {
  const stats = useMemo(() => getSellerStats(listings), [listings])
  // Prefer real DB inquiries; fall back to mock for dev without DB
  const displayInquiries = useMemo(
    () => inquiries ? inquiries.map(toOwnerInquiry) : MOCK_OWNER_INQUIRIES,
    [inquiries],
  )
  const newInquiryCount = displayInquiries.filter((i) => i.status === 'NEW').length
  const greeting = getGreeting(ownerUser.firstName)

  return (
    <div className="animate-fade-in pt-8 pb-16 space-y-8">

      {/* ── Welcome bar ─────────────────────────────────────────────────── */}
      <OwnerWelcomeBar
        greeting={greeting}
        user={ownerUser}
        portfolioValue={stats.totalPortfolioValue}
        newInquiryCount={newInquiryCount}
      />

      {/* ── Bento Grid: Stats + Quick Actions ────────────────────────────
          Desktop: 5-col stats row above a 4-col quick actions row
          This creates the classic Bento "tiled dashboard" feel.
      ──────────────────────────────────────────────────────────────────── */}
      <section aria-label="Summary statistics">
        <div className="stagger-children grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <section aria-label="Quick actions">
        <QuickActionsStrip />
      </section>

      {/* ── Bento Body: Inquiries (2/3) + Performance (1/3) ──────────────
          The two panels sit in glass containers, creating a tiled Bento feel.
      ──────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left 2/3: Recent Inquiries — glass container */}
        <section aria-label="Recent inquiries" className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6">
            <div className="noise absolute inset-0 pointer-events-none" />
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-amber-400/[0.03] blur-[50px]" aria-hidden="true" />
            <div className="relative">
              <SectionHeader
                title={newInquiryCount > 0 ? `Inquiries · ${newInquiryCount} new` : 'Inquiries'}
                description="Messages from potential buyers, tenants, and investors."
                milestone="Soon · Full inbox"
              />
              <div className="mt-4">
                <InquiryFeed inquiries={displayInquiries} />
              </div>
            </div>
          </div>
        </section>

        {/* Right 1/3: Performance — glass container */}
        <section aria-label="Performance overview">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6">
            <div className="noise absolute inset-0 pointer-events-none" />
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-400/[0.04] blur-[40px]" aria-hidden="true" />
            <div className="relative">
              <SectionHeader
                title="Performance"
                description="Engagement across your portfolio."
                milestone="Soon · Advanced"
              />
              <div className="mt-4">
                <PerformancePanel stats={MOCK_OWNER_PERFORMANCE} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── My Listings (full width) — glass container ──────────────────── */}
      <section aria-label="My listings">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6">
          <div className="noise absolute inset-0 pointer-events-none" />
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-amber-400/[0.03] blur-[60px]" aria-hidden="true" />
          <div className="relative">
            <SectionHeader
              title="My Listings"
              description="Manage, publish, and track all your properties and land parcels."
              viewAllHref="/listings/new"
              viewAllLabel="+ New listing"
            />
            <div className="mt-4">
              <SellerListingsClient listings={listings} embeddedMode />
            </div>
          </div>
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
  user: OwnerUser
  portfolioValue: number
  newInquiryCount: number
}

function OwnerWelcomeBar({ greeting, user, portfolioValue, newInquiryCount }: OwnerWelcomeBarProps) {
  return (
    <PageHeader
      eyebrow="My properties"
      title={user.name}
      description={`${greeting}. Your listings, inquiries and what they are worth.`}
      actions={
        <>
          <Link href="/listings/new?type=land" className="btn-glass !px-5 !py-2.5 text-sm no-underline">
            <Map className="h-4 w-4" />
            List land
          </Link>
          <Link href="/listings/new?type=property" className="btn-primary !px-5 !py-2.5 text-sm no-underline">
            <Plus className="h-4 w-4" />
            List a property
          </Link>
        </>
      }
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#A0A0B2]">{user.role}</span>
          <KycBadge status={user.kycStatus} />
          {portfolioValue > 0 && (
            <span className="rounded-full border border-violet-300/25 bg-violet-500/[0.08] px-3 py-1 text-[11.5px] text-violet-200">
              Listed value · {formatPrice(portfolioValue)}
            </span>
          )}
          {newInquiryCount > 0 && (
            <span className="rounded-full bg-violet-500 px-3 py-1 text-[11.5px] font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.6)]">
              {newInquiryCount} new {newInquiryCount === 1 ? 'inquiry' : 'inquiries'}
            </span>
          )}
        </div>
      }
    />
  )
}

// ---------------------------------------------------------------------------
// KYC badge (mirrors buyer dashboard)
// ---------------------------------------------------------------------------

function KycBadge({ status }: { status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' }) {
  if (status === 'VERIFIED') {
    return (
      <span className="flex items-center gap-1 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-400 shadow-[inset_0_0_6px_rgba(52,211,153,0.15)]">
        <ShieldCheck className="h-3 w-3" />
        KYC Verified
      </span>
    )
  }
  if (status === 'PENDING') {
    return (
      <span className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-500">
        KYC Pending
      </span>
    )
  }
  return (
    <Link
      href="/settings"
      className="flex items-center gap-1 rounded border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[11px] text-red-400 hover:opacity-80"
    >
      Complete KYC →
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Quick Actions strip — 4 action cards in a horizontal scroll row
// ---------------------------------------------------------------------------

function QuickActionsStrip() {
  const ACCENT: Record<string, { border: string; bg: string; text: string; icon: string; glow: string }> = {
    primary: {
      border: 'border-amber-400/20 hover:border-amber-400/40',
      bg:     'bg-amber-400/[0.04]',
      text:   'text-amber-400',
      icon:   'text-amber-400',
      glow:   'bg-amber-400/[0.06]',
    },
    land: {
      border: 'border-emerald-400/20 hover:border-emerald-400/40',
      bg:     'bg-emerald-400/[0.04]',
      text:   'text-emerald-400',
      icon:   'text-emerald-400',
      glow:   'bg-emerald-400/[0.06]',
    },
    default: {
      border: 'border-white/[0.08] hover:border-white/15',
      bg:     'bg-white/[0.04] backdrop-blur-2xl',
      text:   'text-zinc-400',
      icon:   'text-zinc-500',
      glow:   'bg-white/[0.03]',
    },
  }

  const ACTION_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    'qa-new-property': Building2,
    'qa-new-land':     Map,
    'qa-tokenize':     Coins,
    'qa-marketplace':  Compass,
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {OWNER_QUICK_ACTIONS.map((action, i) => {
        const style = ACCENT[action.variant]
        const Icon = ACTION_ICONS[action.id] ?? ArrowRight
        const isLocked = Boolean(action.milestone)

        const inner = (
          <div
            className={cn(
              'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-6 transition-all duration-300 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
              style.border,
              style.bg,
              isLocked ? 'opacity-60' : 'cursor-pointer hover:-translate-y-1'
            )}
          >
            {/* Ambient glow */}
            <div className={cn('pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-[30px] opacity-50 transition-opacity duration-500 group-hover:opacity-80', style.glow)} aria-hidden="true" />

            {/* Top row: icon + milestone badge */}
            <div className="relative flex items-center justify-between">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]', style.bg)}>
                <Icon className={cn('h-4.5 w-4.5', style.icon)} style={{ filter: 'drop-shadow(0 0 6px currentColor)' }} />
              </div>
              {action.milestone && (
                <span className="flex items-center gap-1 rounded border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-1.5 py-0.5 text-[10px] text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {action.milestone}
                </span>
              )}
            </div>

            {/* Label */}
            <div className="relative">
              <p className={cn('text-sm font-semibold tracking-tight', style.text)}>{action.label}</p>
              <p className="mt-0.5 text-xs text-zinc-500 leading-snug">{action.description}</p>
            </div>
          </div>
        )

        if (isLocked) {
          return <div key={action.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>{inner}</div>
        }

        return (
          <Link key={action.id} href={action.href} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
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
