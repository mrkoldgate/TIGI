'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Wallet, Store, ShieldCheck, Zap, Activity, Receipt } from 'lucide-react'
import type { HoldingDTO, PortfolioSummary } from '@/lib/portfolio/mock-portfolio'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { PageHeader, SectionTitle } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PortfolioClient — v5
//
// Robinhood / Wealthsimple discipline: one big number, gain against cost in
// green or red, then the holdings as a data table (Coinbase "Assets").
// Every figure here is computed from the user's holdings; nothing invented.
// Prices are sample prices on devnet and say so.
// ---------------------------------------------------------------------------

interface PortfolioClientProps {
  holdings: HoldingDTO[]
  summary: PortfolioSummary
}

const usd = (n: number, digits = 0) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits, minimumFractionDigits: digits })

const tone = (n: number) => (Math.abs(n) < 0.005 ? 'text-[#A0A0B2]' : n > 0 ? 'text-[#34D399]' : 'text-[#F87171]')

const pct = (n: number, signed = false) => `${signed && n > 0 ? '+' : ''}${n.toFixed(2)}%`

const TYPE_LABEL: Record<HoldingDTO['propertyType'], string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  INDUSTRIAL: 'Industrial',
  LAND: 'Land',
  MIXED_USE: 'Mixed use',
}

const TYPE_COLOR: Record<HoldingDTO['propertyType'], string> = {
  RESIDENTIAL: '#A78BFA',
  COMMERCIAL: '#6366F1',
  INDUSTRIAL: '#C084FC',
  LAND: '#34D399',
  MIXED_USE: '#22D3EE',
}

const IMAGE_TYPE: Record<HoldingDTO['propertyType'], 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed'> = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
  LAND: 'land',
  MIXED_USE: 'mixed',
}

export function PortfolioClient({ holdings, summary }: PortfolioClientProps) {
  const up = summary.totalGainLoss >= 0
  const annualIncome = summary.totalValue * (summary.weightedYieldApr / 100)

  return (
    <div className="space-y-14">
      <PageHeader
        eyebrow="Portfolio"
        title="Your holdings"
        description="Shares you own across properties, what they're worth now, and what they earn."
        actions={
          <>
            <Link href="/settings/wallet" className="btn-glass !px-5 !py-2.5 text-sm no-underline">
              <Wallet className="h-4 w-4" />
              Connect wallet
            </Link>
            <Link href="/marketplace" className="btn-primary !px-5 !py-2.5 text-sm no-underline">
              <Store className="h-4 w-4" />
              Invest more
            </Link>
          </>
        }
      />

      {/* ── Summary tray ── */}
      <section aria-label="Portfolio summary" className="tray" data-reveal="up">
        <div className="grid gap-1.5 lg:grid-cols-[1.25fr_1fr]">
          <div className="cell p-7 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-label">Total value</p>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8E8E9C]">
                Sample prices · devnet
              </span>
            </div>
            <p className="figure mt-4 text-[clamp(2.5rem,1.8rem+2.6vw,3.75rem)] leading-none">{usd(summary.totalValue, 2)}</p>
            <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[13.5px] tabular-nums">
              <span className={tone(summary.totalGainLoss)}>
                {up ? '+' : '−'}{usd(Math.abs(summary.totalGainLoss), 2)} ({pct(summary.totalGainLossPct, true)})
              </span>
              <span className="text-[#7A7A8A]">since purchase</span>
            </p>

            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/[0.06] pt-6 sm:grid-cols-4">
              <Stat label="Invested" value={usd(summary.totalInvested)} />
              <Stat label="Holdings" value={String(summary.holdingsCount)} />
              <Stat label="Est. yield" value={`${summary.weightedYieldApr.toFixed(1)}%`} hint="Weighted, yearly" />
              <Stat label="Est. income" value={usd(annualIncome)} hint="Per year" />
            </dl>
          </div>

          <AllocationCell holdings={holdings} total={summary.totalValue} />
        </div>
      </section>

      {/* ── Holdings table ── */}
      <section aria-label="Holdings" data-reveal="up">
        <SectionTitle
          index="01"
          title={`Holdings · ${summary.holdingsCount}`}
          description="Price is the current price per share. Gain is measured against what you paid."
          action={
            <Link href="/transactions" className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-[#A0A0B2] no-underline hover:text-violet-200">
              Transactions <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />
        {holdings.length > 0 ? <HoldingsTable holdings={holdings} total={summary.totalValue} /> : <EmptyHoldings />}
      </section>

      {/* ── Wallet + statements ── */}
      <section aria-label="Wallet and statements" className="grid gap-5 lg:grid-cols-[1.4fr_1fr]" data-reveal="up">
        <div className="panel overflow-hidden p-7">
          <p className="text-label flex items-center gap-2"><span className="live-dot" aria-hidden="true" /> Solana devnet</p>
          <h3 className="section-title mt-4">Connect a wallet to settle on-chain</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#A0A0B2]">
            Your holdings are recorded in TIGI today. Linking a Solana wallet lets you verify shares on-chain and receive
            rental distributions there.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { icon: ShieldCheck, label: 'You keep custody' },
              { icon: Zap, label: 'Live share prices' },
              { icon: Activity, label: 'Yield paid on-chain' },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#C3C3CC]">
                <f.icon className="h-3.5 w-3.5 text-violet-300" />
                {f.label}
              </span>
            ))}
          </div>
          <Link href="/settings/wallet" className="btn-primary mt-6 !px-5 !py-2.5 text-sm no-underline">
            <Wallet className="h-4 w-4" /> Connect wallet
          </Link>
        </div>

        <Link href="/transactions" className="panel panel-hover group block p-7 no-underline">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-500/[0.08] text-violet-200">
            <Receipt className="h-[18px] w-[18px]" />
          </span>
          <h3 className="section-title mt-6">Statements & history</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#A0A0B2]">Every purchase, sale and payout, with dates and amounts.</p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-violet-200 group-hover:text-white">
            View transactions <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-label !text-[10px]">{label}</dt>
      <dd className="figure mt-2 text-[22px] leading-none">{value}</dd>
      {hint && <dd className="mt-1 text-[11.5px] text-[#7A7A8A]">{hint}</dd>}
    </div>
  )
}

function AllocationCell({ holdings, total }: { holdings: HoldingDTO[]; total: number }) {
  // Group by property type
  const byType = new Map<HoldingDTO['propertyType'], number>()
  holdings.forEach((h) => byType.set(h.propertyType, (byType.get(h.propertyType) ?? 0) + h.tokensOwned * h.currentPricePerToken))
  const rows = [...byType.entries()].sort((a, b) => b[1] - a[1])
  const safeTotal = total || 1

  return (
    <div className="cell flex flex-col p-7 sm:p-8">
      <p className="text-label">Allocation by type</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-[#8E8E9C]">Your mix of homes, land and commercial property will show here.</p>
      ) : (
        <>
          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-white/[0.04]" role="img" aria-label="Allocation by property type">
            {rows.map(([type, v], i) => (
              <span
                key={type}
                style={{
                  width: `${(v / safeTotal) * 100}%`,
                  background: TYPE_COLOR[type],
                  boxShadow: `0 0 16px ${TYPE_COLOR[type]}66`,
                  marginRight: i < rows.length - 1 ? 2 : 0,
                }}
              />
            ))}
          </div>
          <ul className="mt-6 space-y-4">
            {rows.map(([type, v]) => (
              <li key={type} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLOR[type] }} />
                <span className="flex-1 text-[14px] text-[#C3C3CC]">{TYPE_LABEL[type]}</span>
                <span className="font-mono text-[13px] tabular-nums text-[#F5F5F7]">{usd(v)}</span>
                <span className="w-14 text-right font-mono text-[12.5px] tabular-nums text-[#8E8E9C]">{((v / safeTotal) * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-auto pt-6 text-[12px] leading-relaxed text-[#7A7A8A]">
        Spreading across property types and cities lowers the impact of any one market.
      </p>
    </div>
  )
}

function HoldingsTable({ holdings, total }: { holdings: HoldingDTO[]; total: number }) {
  const cols = 'md:grid-cols-[minmax(0,2.4fr)_1fr_1fr_1fr_1.1fr_0.8fr_auto]'
  return (
    <div className="tray">
      <div className="cell overflow-hidden !p-0">
        <div className={cn('hidden items-center gap-6 border-b border-white/[0.06] px-6 py-3.5 md:grid', cols)}>
          {['Property', 'Shares', 'Price', 'Value', 'Gain', 'Yield', ''].map((h, i) => (
            <span key={i} className={cn('text-label !text-[10px]', i > 0 && i < 6 && 'text-right')}>{h}</span>
          ))}
        </div>
        <ul>
          {holdings.map((h) => {
            const value = h.tokensOwned * h.currentPricePerToken
            const cost = h.tokensOwned * h.purchasePricePerToken
            const gain = value - cost
            const gainPct = cost > 0 ? (gain / cost) * 100 : 0
            const up = gain >= 0
            const share = h.totalTokens > 0 ? (h.tokensOwned / h.totalTokens) * 100 : 0
            return (
              <li key={h.id} className="border-b border-white/[0.05] last:border-b-0">
                <Link
                  href={`/marketplace/${h.propertyId}`}
                  className={cn('data-row group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 no-underline md:gap-6 md:px-6', cols)}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="plate h-14 w-20 flex-shrink-0 rounded-lg">
                      <PlaceholderImage
                        slot={h.imageSlot as Parameters<typeof PlaceholderImage>[0]['slot']}
                        propertyType={IMAGE_TYPE[h.propertyType]}
                        alt={h.propertyTitle}
                        className="zoom-img h-full w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-[#F5F5F7] transition-colors group-hover:text-violet-100">{h.propertyTitle}</p>
                      <p className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-[#8E8E9C]">
                        {TYPE_LABEL[h.propertyType]} · {h.propertyCity}, {h.propertyState}
                      </p>
                    </div>
                  </div>

                  {/* Mobile summary */}
                  <div className="text-right md:hidden">
                    <p className="font-mono text-sm tabular-nums text-[#F5F5F7]">{usd(value)}</p>
                    <p className={cn('font-mono text-xs tabular-nums', tone(gain))}>{pct(gainPct, true)}</p>
                  </div>

                  <div className="hidden text-right md:block">
                    <p className="font-mono text-sm tabular-nums text-[#F5F5F7]">{h.tokensOwned.toLocaleString()}</p>
                    <p className="font-mono text-[11px] tabular-nums text-[#7A7A8A]">{share < 0.1 ? '<0.1' : share.toFixed(1)}% of property</p>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="font-mono text-sm tabular-nums text-[#F5F5F7]">{usd(h.currentPricePerToken, 2)}</p>
                    <p className="font-mono text-[11px] tabular-nums text-[#7A7A8A]">paid {usd(h.purchasePricePerToken, 2)}</p>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="font-mono text-sm tabular-nums text-[#F5F5F7]">{usd(value)}</p>
                    <p className="font-mono text-[11px] tabular-nums text-[#7A7A8A]">{total ? ((value / total) * 100).toFixed(0) : 0}% of you</p>
                  </div>
                  <div className={cn('hidden text-right font-mono text-sm tabular-nums md:block', tone(gain))}>
                    <p>{up ? '+' : '−'}{usd(Math.abs(gain))}</p>
                    <p className="text-[11px]">{pct(gainPct, true)}</p>
                  </div>
                  <span className="hidden text-right font-mono text-sm tabular-nums text-[#C3C3CC] md:block">{h.yieldApr.toFixed(1)}%</span>
                  <ArrowUpRight className="hidden h-4 w-4 text-[#6E6E7E] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-200 md:block" />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function EmptyHoldings() {
  return (
    <div className="panel flex flex-col items-center px-6 py-16 text-center">
      <p className="text-label">No holdings yet</p>
      <h3 className="section-title mt-4">Own your first share from $100</h3>
      <p className="mt-2 max-w-md text-sm text-[#A0A0B2]">
        Pick a tokenized home, apartment block or parcel of land, choose how many shares, and confirm.
      </p>
      <Link href="/marketplace" className="btn-primary mt-7 !px-6 !py-3 text-sm no-underline">
        Browse the marketplace
      </Link>
    </div>
  )
}
