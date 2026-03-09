'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  ArrowRight,
  Coins,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import type { HoldingDTO, PortfolioSummary } from '@/lib/portfolio/mock-portfolio'

// ---------------------------------------------------------------------------
// PortfolioClient — Investor holdings dashboard.
//
// Shows a summary bar, holdings grid with per-position P&L, performance
// history placeholder, and wallet connect prompt.
//
// Data: MOCK_HOLDINGS until Solana wallet integration (M6).
// ---------------------------------------------------------------------------

// ── Formatters ─────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

function fmtPct(n: number, signed = false): string {
  const prefix = signed && n > 0 ? '+' : ''
  return `${prefix}${n.toFixed(2)}%`
}

// ── Summary bar ─────────────────────────────────────────────────────────────

function SummaryBar({ summary }: { summary: PortfolioSummary }) {
  const positive = summary.totalGainLoss >= 0
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryCard
        label="Portfolio Value"
        value={fmt(summary.totalValue)}
        sub="Current market value"
        accent="gold"
      />
      <SummaryCard
        label="Total Invested"
        value={fmt(summary.totalInvested)}
        sub="Capital deployed"
        accent="neutral"
      />
      <SummaryCard
        label="Total Return"
        value={`${positive ? '+' : ''}${fmt(summary.totalGainLoss)}`}
        sub={fmtPct(summary.totalGainLossPct, true) + ' all time'}
        accent={positive ? 'green' : 'red'}
      />
      <SummaryCard
        label="Portfolio Yield"
        value={fmtPct(summary.weightedYieldApr)}
        sub="Weighted avg APR"
        accent="blue"
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent: 'gold' | 'green' | 'red' | 'blue' | 'neutral'
}) {
  const colors: Record<string, string> = {
    gold:    'text-[#C9A84C]',
    green:   'text-[#4ADE80]',
    red:     'text-[#F87171]',
    blue:    'text-[#818CF8]',
    neutral: 'text-[#F5F5F7]',
  }
  return (
    <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
      <p className="text-[11px] text-[#6B6B80]">{label}</p>
      <p className={cn('mt-1 font-heading text-xl font-bold', colors[accent])}>{value}</p>
      <p className="mt-0.5 text-[10px] text-[#3A3A4A]">{sub}</p>
    </div>
  )
}

// ── Holding card ─────────────────────────────────────────────────────────────

function HoldingCard({ holding }: { holding: HoldingDTO }) {
  const currentValue  = holding.tokensOwned * holding.currentPricePerToken
  const investedValue = holding.tokensOwned * holding.purchasePricePerToken
  const gainLoss      = currentValue - investedValue
  const gainLossPct   = (gainLoss / investedValue) * 100
  const ownershipPct  = (holding.tokensOwned / holding.totalTokens) * 100
  const positive      = gainLoss >= 0

  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118] transition-colors hover:border-[#3A3A4A]">
      {/* Header image strip */}
      <div className="relative h-24 overflow-hidden bg-[#1A1A24]">
        <PlaceholderImage
          slot={holding.imageSlot}
          alt={holding.propertyTitle}
          className="h-full w-full object-cover opacity-60"
        />
        {/* Type badge */}
        <span className="absolute right-2 top-2 rounded border border-[#2A2A3A] bg-[#0A0A0F]/80 px-1.5 py-0.5 text-[9px] font-medium text-[#6B6B80] backdrop-blur-sm">
          {holding.propertyType.replace('_', ' ')}
        </span>
        {/* Ownership badge */}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded border border-[#C9A84C]/30 bg-[#0A0A0F]/80 px-1.5 py-0.5 text-[9px] font-medium text-[#C9A84C] backdrop-blur-sm">
          <Coins className="h-2.5 w-2.5" />
          {ownershipPct.toFixed(2)}% owned
        </span>
      </div>

      <div className="p-4">
        {/* Title + location */}
        <div className="mb-3">
          <Link
            href={`/marketplace/${holding.propertyId}`}
            className="line-clamp-1 text-sm font-semibold text-[#F5F5F7] transition-colors hover:text-[#C9A84C]"
          >
            {holding.propertyTitle}
          </Link>
          <p className="mt-0.5 text-[11px] text-[#6B6B80]">
            {holding.propertyCity}, {holding.propertyState}
          </p>
        </div>

        {/* Token quantity bar */}
        <div className="mb-3 rounded-lg bg-[#1A1A24] px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#6B6B80]">Tokens held</span>
            <span className="text-[10px] text-[#3A3A4A]">of {holding.totalTokens.toLocaleString()} total</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-bold text-[#F5F5F7]">
              {holding.tokensOwned.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#6B6B80]">
              @ ${holding.currentPricePerToken}/token
            </span>
          </div>
          {/* Ownership progress bar */}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#2A2A3A]">
            <div
              className="h-full rounded-full bg-[#C9A84C]"
              style={{ width: `${Math.min(ownershipPct * 20, 100)}%` }}
            />
          </div>
        </div>

        {/* P&L row */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] text-[#6B6B80]">Value</p>
            <p className="text-xs font-semibold text-[#F5F5F7]">{fmt(currentValue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#6B6B80]">Return</p>
            <div className={cn('flex items-center gap-0.5', positive ? 'text-[#4ADE80]' : 'text-[#F87171]')}>
              {positive
                ? <TrendingUp className="h-3 w-3 flex-shrink-0" />
                : <TrendingDown className="h-3 w-3 flex-shrink-0" />
              }
              <span className="text-xs font-semibold">{fmtPct(gainLossPct, true)}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[#6B6B80]">Yield APR</p>
            <p className="text-xs font-semibold text-[#818CF8]">{fmtPct(holding.yieldApr)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyHoldings() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A24] text-[#3A3A4A]">
        <Coins className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-[#6B6B80]">No token holdings yet.</p>
        <p className="mt-0.5 text-xs text-[#3A3A4A]">
          Browse tokenized listings and make your first fractional investment.
        </p>
      </div>
      <Link
        href="/marketplace?tokenized=true"
        className="flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] bg-[#1A1A24] px-3 py-1.5 text-xs font-medium text-[#A0A0B2] transition-colors hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"
      >
        Browse tokenized assets <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

// ── Wallet teaser ─────────────────────────────────────────────────────────────

function WalletTeaser() {
  return (
    <div className="rounded-xl border border-dashed border-[#2A2A3A] p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A24] text-[#6B6B80]">
        <Wallet className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#F5F5F7]">Connect Your Wallet</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-xs text-[#6B6B80]">
        Connect a Solana wallet to verify your on-chain holdings, unlock live
        pricing, and sync yield distributions automatically.
      </p>
      <Link
        href="/settings/wallet"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] bg-[#1A1A24] px-4 py-2 text-xs font-medium text-[#A0A0B2] transition-colors hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"
      >
        <Wallet className="h-3.5 w-3.5" />
        Connect wallet
      </Link>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  sub,
  cta,
  ctaHref,
}: {
  title: string
  sub?: string
  cta?: string
  ctaHref?: string
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-sm font-semibold text-[#F5F5F7]">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-[#6B6B80]">{sub}</p>}
      </div>
      {cta && ctaHref && (
        <Link
          href={ctaHref}
          className="flex items-center gap-1 text-[11px] text-[#6B6B80] transition-colors hover:text-[#C9A84C]"
        >
          {cta} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface PortfolioClientProps {
  holdings: HoldingDTO[]
  summary:  PortfolioSummary
}

export function PortfolioClient({ holdings, summary }: PortfolioClientProps) {
  return (
    <div className="animate-fade-in space-y-8 pb-16 pt-6">
      {/* Preview mode banner */}
      <div className="flex items-center gap-2 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-4 py-2.5">
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#F59E0B]" />
        <p className="text-xs text-[#A0A0B2]">
          <span className="font-medium text-[#F59E0B]">Preview mode</span>
          {' '}— Holdings shown below use placeholder data.
          Connect your wallet to sync your real on-chain positions.
        </p>
        <Link
          href="/settings/wallet"
          className="ml-auto flex-shrink-0 text-[11px] text-[#6B6B80] transition-colors hover:text-[#C9A84C]"
        >
          Connect →
        </Link>
      </div>

      {/* Summary stats */}
      <section aria-label="Portfolio summary">
        <SectionHeader
          title="Portfolio Overview"
          sub="Aggregate value across all token holdings."
        />
        <SummaryBar summary={summary} />
      </section>

      {/* Holdings grid */}
      <section aria-label="Token holdings">
        <SectionHeader
          title={`Holdings · ${summary.holdingsCount}`}
          sub="Tokenized assets you own fractional shares of."
          cta="Browse marketplace"
          ctaHref="/marketplace"
        />
        {holdings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {holdings.map((h) => (
              <HoldingCard key={h.id} holding={h} />
            ))}
          </div>
        ) : (
          <EmptyHoldings />
        )}
      </section>

      {/* Performance chart placeholder */}
      <section aria-label="Performance history">
        <SectionHeader
          title="Performance History"
          sub="Value over time across all holdings."
        />
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A24] text-[#3A3A4A]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <p className="text-sm text-[#6B6B80]">Performance charts coming in M6.</p>
          <p className="max-w-xs text-xs text-[#3A3A4A]">
            Historical portfolio value, yield distributions, and ROI trends.
          </p>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#0A0A0F] px-3 py-1 text-[11px] text-[#6B6B80]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#818CF8]" />
            Milestone 6
          </div>
        </div>
      </section>

      {/* Wallet connect */}
      <section aria-label="Wallet connection">
        <SectionHeader
          title="On-Chain Sync"
          sub="Verify and sync your real Solana positions."
        />
        <WalletTeaser />
      </section>
    </div>
  )
}
