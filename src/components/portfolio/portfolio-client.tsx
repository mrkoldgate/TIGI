'use client'

// ---------------------------------------------------------------------------
// PortfolioClient — Investor holdings dashboard (TIGI Hyper-Glass v4 Elite).
//
// Glassflow centerpieces: massive h-48 w-48 diffused backlights behind thick
// h-24 w-24 frosted glass icon shells with 15px drop-shadow glow.
// Dimension nested layering: deep base containers → elevated inner panels.
// Paragon edge-lit hover grids on every interactive surface.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  ArrowRight,
  Coins,
  PieChart,
  Activity,
  Clock,
  Zap,
  Shield,
  DollarSign,
  Target,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import type { HoldingDTO, PortfolioSummary } from '@/lib/portfolio/mock-portfolio'

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

// ── Sparkline SVG ──────────────────────────────────────────────────────────

function Sparkline({ positive, id, className }: { positive: boolean; id: string; className?: string }) {
  const points = positive
    ? '0,28 8,24 16,26 24,18 32,20 40,14 48,16 56,8 64,10 72,4'
    : '0,4 8,8 16,6 24,14 32,12 40,18 48,16 56,24 64,22 72,28'
  const color = positive ? '#34D399' : '#F87171'

  return (
    <svg viewBox="0 0 72 32" fill="none" className={cn('h-8 w-20', className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <polygon
        points={`${points} 72,32 0,32`}
        fill={`url(#${id})`}
      />
    </svg>
  )
}

// ── Glassflow Centerpiece Icon ─────────────────────────────────────────────
// Three layers: massive diffused backlight → secondary halo ring → thick
// frosted glass shell with the icon emitting a colorful drop-shadow.

function GlassflowIcon({
  icon: Icon,
  glowColor,
  iconColor,
  size = 'hero',
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  glowColor: string
  iconColor: string
  size?: 'sm' | 'md' | 'hero' | 'xl'
}) {
  const sizes = {
    sm:   { shell: 'h-11 w-11 rounded-xl',  icon: 'h-4.5 w-4.5', glow: 'h-20 w-20 blur-[35px]',  halo: 'h-14 w-14 blur-[15px]' },
    md:   { shell: 'h-16 w-16 rounded-2xl',  icon: 'h-6 w-6',     glow: 'h-32 w-32 blur-[50px]',  halo: 'h-22 w-22 blur-[20px]' },
    hero: { shell: 'h-24 w-24 rounded-3xl',  icon: 'h-10 w-10',   glow: 'h-48 w-48 blur-[80px]',  halo: 'h-32 w-32 blur-[30px]' },
    xl:   { shell: 'h-28 w-28 rounded-[1.5rem]', icon: 'h-12 w-12', glow: 'h-56 w-56 blur-[100px]', halo: 'h-36 w-36 blur-[40px]' },
  }
  const s = sizes[size]

  return (
    <div className="relative flex items-center justify-center">
      {/* Layer 1: Massive diffused backlight — the 3D light source */}
      <div className={cn(
        'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80',
        glowColor,
        s.glow,
      )} />
      {/* Layer 2: Secondary halo ring — tighter glow for depth */}
      <div className={cn(
        'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40',
        glowColor,
        s.halo,
      )} />
      {/* Layer 3: Thick frosted glass shell */}
      <div className={cn(
        'relative z-10 flex items-center justify-center border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-md',
        s.shell,
      )}>
        <Icon className={cn(s.icon, iconColor, 'drop-shadow-[0_0_15px_currentColor]')} />
      </div>
    </div>
  )
}

// ── Hero Summary Cards (Glassflow style) ───────────────────────────────────
// Each metric is a tall, centered card with a massive icon centerpiece.
// The icon emits a colorful glow that lights the entire card surface.

function MetricCard({
  m,
  idx,
  positive,
}: {
  m: any
  idx: number
  positive: boolean
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 p-8 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/[0.1] hover:bg-[#050505]/95 hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)]"
    >
      {/* Noise texture overlay */}
      <div className="noise absolute inset-0 pointer-events-none" />

      {/* Dynamic Mouse Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 180px at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.07), transparent 80%)`,
        }}
      />

      {/* Paragon edge light — colored per card */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/0 to-transparent transition-all duration-500 group-hover:via-white/20" />

      {/* Glassflow centerpiece */}
      <div className="relative flex flex-col items-center justify-center pt-2 pb-6">
        <GlassflowIcon
          icon={m.icon}
          glowColor={m.glowColor}
          iconColor={m.iconColor}
          size="hero"
        />
      </div>

      {/* Metric text — centered below the icon */}
      <div className="relative text-center">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-white/25 uppercase">{m.label}</p>
        <p className={cn(
          'mt-2 text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r',
          m.gradient,
        )}>
          {m.value}
        </p>
        <p className="mt-1.5 text-[10px] text-white/20">{m.sub}</p>

        {m.sparkline && (
          <div className="mt-3 flex justify-center">
            <Sparkline
              positive={positive}
              id={`hero-spark-${idx}`}
              className="opacity-50 group-hover:opacity-80 transition-opacity duration-400"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function HeroMetrics({ summary }: { summary: PortfolioSummary }) {
  const positive = summary.totalGainLoss >= 0

  const metrics = [
    {
      label: 'Portfolio Value',
      value: fmt(summary.totalValue),
      sub: 'Current market value',
      icon: DollarSign,
      glowColor: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      gradient: 'from-blue-400 via-blue-300 to-indigo-500',
    },
    {
      label: 'Total Invested',
      value: fmt(summary.totalInvested),
      sub: 'Capital deployed',
      icon: Target,
      glowColor: 'bg-slate-400/15',
      iconColor: 'text-zinc-300',
      gradient: 'from-white via-zinc-200 to-zinc-500',
    },
    {
      label: 'Total Return',
      value: `${positive ? '+' : ''}${fmt(summary.totalGainLoss)}`,
      sub: fmtPct(summary.totalGainLossPct, true) + ' all time',
      icon: positive ? TrendingUp : TrendingDown,
      glowColor: positive ? 'bg-emerald-500/20' : 'bg-red-500/20',
      iconColor: positive ? 'text-emerald-400' : 'text-red-400',
      gradient: positive ? 'from-emerald-400 via-emerald-300 to-green-500' : 'from-red-400 via-red-300 to-rose-500',
      sparkline: true,
    },
    {
      label: 'Portfolio Yield',
      value: fmtPct(summary.weightedYieldApr),
      sub: 'Weighted avg APR',
      icon: Activity,
      glowColor: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      gradient: 'from-purple-400 via-violet-300 to-fuchsia-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {metrics.map((m, idx) => (
        <MetricCard key={m.label} m={m} idx={idx} positive={positive} />
      ))}
    </div>
  )
}

// ── Holding Card (Dimension nested glass) ──────────────────────────────────

function HoldingCard({ holding }: { holding: HoldingDTO }) {
  const currentValue  = holding.tokensOwned * holding.currentPricePerToken
  const investedValue = holding.tokensOwned * holding.purchasePricePerToken
  const gainLoss      = currentValue - investedValue
  const gainLossPct   = (gainLoss / investedValue) * 100
  const ownershipPct  = (holding.tokensOwned / holding.totalTokens) * 100
  const positive      = gainLoss >= 0

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/[0.1]">
      {/* Noise texture overlay */}
      <div className="noise absolute inset-0 pointer-events-none" />
      {/* Edge light */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/0 to-transparent transition-all duration-500 group-hover:via-white/20" />

      {/* Ambient wash */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/[0.06] blur-[80px]" />

      {/* Header image strip */}
      <div className="relative h-36 overflow-hidden">
        <PlaceholderImage
          slot={holding.imageSlot}
          alt={holding.propertyTitle}
          className="h-full w-full object-cover opacity-35 transition-all duration-700 group-hover:opacity-55 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />

        {/* Type badge */}
        <span className="absolute right-4 top-4 rounded-full border border-white/[0.06] bg-[#0A0A0F]/70 px-2.5 py-1 text-[9px] font-medium tracking-[0.1em] text-white/35 uppercase backdrop-blur-sm">
          {holding.propertyType.replace('_', ' ')}
        </span>

        {/* Ownership badge */}
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-blue-400/15 bg-[#0A0A0F]/70 px-3 py-1.5 text-[10px] font-semibold text-blue-400 backdrop-blur-sm shadow-[0_0_16px_rgba(96,165,250,0.1)]">
          <Coins className="h-3 w-3 drop-shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
          {ownershipPct.toFixed(2)}% owned
        </span>
      </div>

      <div className="relative p-7">
        {/* Title + location */}
        <div className="relative mb-5">
          <Link
            href={`/marketplace/${holding.propertyId}`}
            className="line-clamp-1 text-sm font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500 transition-all duration-300 hover:to-white"
          >
            {holding.propertyTitle}
          </Link>
          <p className="mt-0.5 text-[11px] tracking-wide text-white/20">
            {holding.propertyCity}, {holding.propertyState}
          </p>
        </div>

        {/* Token panel — elevated inner layer */}
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Inner edge light */}
          <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.14em] text-white/20 uppercase">Tokens held</span>
            <span className="text-[10px] text-white/15 tabular-nums">of {holding.totalTokens.toLocaleString()}</span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-white tabular-nums">
              {holding.tokensOwned.toLocaleString()}
            </span>
            <span className="text-[11px] text-white/25 tabular-nums">
              @ ${holding.currentPricePerToken}/token
            </span>
          </div>
          {/* Progress bar with glow */}
          <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-700"
              style={{ width: `${Math.min(ownershipPct * 20, 100)}%` }}
            />
          </div>
        </div>

        {/* P&L — 3 metric cells in elevated inner grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Value', value: fmt(currentValue), color: 'text-white', glow: 'via-white/[0.04]' },
            {
              label: 'Return',
              value: fmtPct(gainLossPct, true),
              color: positive ? 'text-emerald-400' : 'text-red-400',
              glow: positive ? 'via-emerald-500/[0.06]' : 'via-red-500/[0.06]',
              icon: positive ? TrendingUp : TrendingDown,
            },
            { label: 'Yield', value: fmtPct(holding.yieldApr), color: 'text-purple-400', glow: 'via-purple-500/[0.06]' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="group/cell relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.01] px-3 py-3 text-center transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.02]"
            >
              {/* Cell edge light */}
              <div className={cn(
                'pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/cell:opacity-100',
                metric.glow,
              )} />
              <p className="text-[9px] font-semibold tracking-[0.14em] text-white/15 uppercase">{metric.label}</p>
              <div className={cn('mt-1.5 flex items-center justify-center gap-1', metric.color)}>
                {metric.icon && <metric.icon className="h-3 w-3 flex-shrink-0" />}
                <span className="text-sm font-bold tabular-nums">{metric.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyHoldings() {
  return (
    <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[2rem] border border-dashed border-white/[0.05] bg-[#050505]/80 py-28 text-center backdrop-blur-3xl">
      {/* Atmospheric wash */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/[0.06] blur-[80px]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-purple-500/[0.04] blur-[60px]" aria-hidden />

      <GlassflowIcon
        icon={Coins}
        glowColor="bg-indigo-500/15"
        iconColor="text-white/40"
        size="hero"
      />
      <div>
        <p className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
          No token holdings yet
        </p>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-white/20">
          Browse tokenized listings and make your first fractional investment.
        </p>
      </div>
      <Link
        href="/marketplace?tokenized=true"
        className="group inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-6 py-3 text-xs font-medium text-white/45 backdrop-blur-xl transition-all duration-400 hover:border-blue-500/20 hover:text-white hover:shadow-[0_0_24px_rgba(59,130,246,0.1)]"
      >
        Browse tokenized assets
        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

// ── Performance Chart (Dimension deep container) ───────────────────────────

function PerformanceChart({ totalValue }: { totalValue: number }) {
  const [activePeriod, setActivePeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('6M')
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number
    y: number
    value: number
    date: string
    index: number
  } | null>(null)

  // Scale data relative to current total portfolio value
  const periodData = {
    '1M': {
      points: [0.91, 0.94, 0.93, 0.96, 0.98, 1.0],
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'Current'],
      dates: ['June Week 1', 'June Week 2', 'June Week 3', 'June Week 4', 'July Week 1', 'Today'],
    },
    '3M': {
      points: [0.78, 0.82, 0.8, 0.85, 0.88, 0.91, 0.95, 0.93, 1.0],
      labels: ['Apr 1', 'Apr 15', 'May 1', 'May 15', 'Jun 1', 'Jun 15', 'Jul 1', 'Today'],
      dates: ['Apr 1', 'Apr 15', 'May 1', 'May 15', 'Jun 1', 'Jun 15', 'Jul 1', 'Today'],
    },
    '6M': {
      points: [0.65, 0.62, 0.72, 0.78, 0.86, 1.0],
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      dates: ['Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026'],
    },
    '1Y': {
      points: [0.45, 0.58, 0.42, 0.68, 0.52, 0.76, 0.65, 0.85, 0.72, 0.9, 0.81, 1.0],
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      dates: ['Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026'],
    },
  }

  const currentData = periodData[activePeriod]
  const dataPoints = currentData.points.map(pct => Math.round(totalValue * pct))
  const maxVal = Math.max(...dataPoints, 1)
  const labels = currentData.labels

  const w = 340
  const h = 130
  const step = w / (dataPoints.length - 1)
  const pts = dataPoints.map((v, i) => ({
    x: i * step,
    y: h - (v / maxVal) * h * 0.78 - 15,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 backdrop-blur-3xl shadow-2xl">
      {/* Noise texture overlay */}
      <div className="noise absolute inset-0 pointer-events-none" />
      {/* Ambient wash */}
      <div className="pointer-events-none absolute -left-36 -top-36 h-[420px] w-[420px] rounded-full bg-indigo-500/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute -right-28 -bottom-28 h-80 w-80 rounded-full bg-purple-500/[0.05] blur-[100px]" />

      <div className="relative p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <GlassflowIcon
              icon={BarChart3}
              glowColor="bg-indigo-500/20"
              iconColor="text-indigo-400"
              size="md"
            />
            <div>
              <h3 className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
                Performance History
              </h3>
              <p className="mt-0.5 text-xs tracking-wide text-white/20">Portfolio value over time (Beta Live)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => {
                  setActivePeriod(period)
                  setHoveredPoint(null)
                }}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 text-[10px] font-semibold tracking-wide uppercase transition-all duration-300',
                  activePeriod === period
                    ? 'border border-blue-500/20 bg-blue-500/[0.08] text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(59,130,246,0.15)]'
                    : 'text-white/20 hover:text-white/40 hover:bg-white/[0.02]',
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Elevated inner chart panel */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#030303]/90 p-6 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none z-20 flex flex-col items-center gap-1 rounded-xl border border-white/[0.08] bg-black/95 px-3 py-2 text-center backdrop-blur-xl shadow-xl transition-all duration-200"
              style={{
                left: `${Math.min(Math.max((hoveredPoint.x / w) * 100, 10), 90)}%`,
                top: `${hoveredPoint.y - 50}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <span className="text-[9px] font-semibold text-white/45 uppercase tracking-wider">{hoveredPoint.date}</span>
              <span className="text-xs font-bold text-white">${hoveredPoint.value.toLocaleString()}</span>
            </div>
          )}

          <svg 
            viewBox={`0 0 ${w} ${h}`} 
            className="w-full overflow-visible" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="perfAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="perfLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((frac) => (
              <line key={frac} x1="0" y1={h * frac} x2={w} y2={h * frac} stroke="rgba(255,255,255,0.025)" strokeDasharray="4 4" />
            ))}
            <path d={areaPath} fill="url(#perfAreaGrad)" className="transition-all duration-500" />
            <path d={linePath} fill="none" stroke="url(#perfLineGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500" />
            
            {pts.map((p, i) => {
              const isPointHovered = hoveredPoint?.index === i
              return (
                <g key={i} className="cursor-pointer">
                  {/* Invisible larger hover circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill="transparent"
                    onMouseEnter={() => {
                      setHoveredPoint({
                        x: p.x,
                        y: p.y,
                        value: dataPoints[i],
                        date: currentData.dates[i],
                        index: i
                      })
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Visual point */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isPointHovered ? "5.5" : "2.5"}
                    fill={isPointHovered ? "#FFFFFF" : "#818CF8"}
                    stroke={isPointHovered ? "#818CF8" : "none"}
                    strokeWidth={2}
                    className="transition-all duration-200"
                    opacity={isPointHovered ? "1.0" : "0.5"}
                    style={isPointHovered ? { filter: 'drop-shadow(0 0 8px #818CF8)' } : undefined}
                  />
                </g>
              )
            })}
          </svg>

          <div className="mt-4 flex justify-between px-0.5 border-t border-white/[0.03] pt-3">
            {labels.map((m, i) => (
              <span key={i} className="text-[8px] font-semibold tracking-wider text-white/20 uppercase">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Allocation (Dimension deep container + donut centerpiece) ──────────────

function AllocationCard({ holdings }: { holdings: HoldingDTO[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const total = holdings.reduce((s, h) => s + h.tokensOwned * h.currentPricePerToken, 0)
  const allocations = holdings.map((h) => {
    const value = h.tokensOwned * h.currentPricePerToken
    return {
      label: h.propertyTitle,
      type: h.propertyType,
      pct: total > 0 ? (value / total) * 100 : 0,
      value,
    }
  })

  const typeColors: Record<string, { bar: string; text: string; hex: string }> = {
    RESIDENTIAL:  { bar: 'from-blue-500 to-blue-400',     text: 'text-blue-400',    hex: '#60A5FA' },
    COMMERCIAL:   { bar: 'from-purple-500 to-purple-400', text: 'text-purple-400',  hex: '#A78BFA' },
    INDUSTRIAL:   { bar: 'from-amber-500 to-amber-400',   text: 'text-amber-400',   hex: '#FBBF24' },
    LAND:         { bar: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', hex: '#34D399' },
    MIXED_USE:    { bar: 'from-rose-500 to-rose-400',     text: 'text-rose-400',    hex: '#FB7185' },
  }

  // SVG donut chart data
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 p-8 backdrop-blur-3xl shadow-2xl">
      {/* Noise texture overlay */}
      <div className="noise absolute inset-0 pointer-events-none" />
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-500/[0.07] blur-[80px]" />

      <div className="relative">
        <div className="mb-7 flex items-center gap-5">
          <GlassflowIcon
            icon={PieChart}
            glowColor="bg-purple-500/20"
            iconColor="text-purple-400"
            size="md"
          />
          <div>
            <h3 className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
              Allocation
            </h3>
            <p className="text-[10px] tracking-wide text-white/20">By property type</p>
          </div>
        </div>

        {/* Donut chart centerpiece — inner elevated panel */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#030303]/90 p-6 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Donut backlight */}
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-purple-500/[0.08] blur-[40px]" />

              <svg viewBox="0 0 100 100" className="relative z-10 h-28 w-28">
                {allocations.map((a, i) => {
                  const colors = typeColors[a.type] || typeColors.RESIDENTIAL
                  const dashLength = (a.pct / 100) * circumference
                  const dashGap = circumference - dashLength
                  const currentOffset = offset
                  offset += dashLength

                  const isSegmentHovered = hoveredIndex === i

                  return (
                    <circle
                      key={i}
                      cx="50" cy="50" r={radius}
                      fill="none"
                      stroke={colors.hex}
                      strokeWidth={isSegmentHovered ? "11" : "8"}
                      strokeDasharray={`${dashLength} ${dashGap}`}
                      strokeDashoffset={-currentOffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer"
                      opacity={hoveredIndex === null || isSegmentHovered ? "0.9" : "0.35"}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{ filter: `drop-shadow(0 0 6px ${colors.hex}${isSegmentHovered ? '99' : '33'})` }}
                    />
                  )
                })}
                {/* Center text */}
                <text x="50" y="47" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" opacity="0.8">
                  {fmt(total)}
                </text>
                <text x="50" y="58" textAnchor="middle" fill="white" fontSize="6" fontWeight="500" opacity="0.3">
                  TOTAL
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Breakdown list */}
        <div className="space-y-2.5">
          {allocations.map((a, i) => {
            const colors = typeColors[a.type] || typeColors.RESIDENTIAL
            const isRowHovered = hoveredIndex === i
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "group/row relative overflow-hidden rounded-xl border px-4 py-3 transition-all duration-300",
                  isRowHovered
                    ? "border-white/15 bg-white/[0.04] translate-x-1"
                    : "border-white/[0.04] bg-white/[0.01] hover:border-white/[0.1] hover:bg-white/[0.02]"
                )}
              >
                {/* Row edge light */}
                <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/0 to-transparent transition-all duration-300 group-hover/row:via-white/10" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors.hex, boxShadow: `0 0 8px ${colors.hex}66` }}
                    />
                    <span className="truncate text-xs text-white/40 group-hover/row:text-white/70 transition-colors duration-300">{a.label}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs font-medium text-white/60 tabular-nums">{fmt(a.value)}</span>
                    <span className={cn('text-[10px] font-bold tabular-nums', colors.text)}>{a.pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Wallet Teaser (Glassflow CTA) ─────────────────────────────────────────

function WalletTeaser() {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#050505]/80 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/[0.08]">
      {/* Noise texture overlay */}
      <div className="noise absolute inset-0 pointer-events-none" />
      {/* Edge light */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/0 to-transparent transition-all duration-500 group-hover:via-blue-500/25" />

      {/* Ambient wash */}
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-500/[0.04] blur-[80px]" />

      <div className="relative flex items-center gap-8 p-8">
        <div className="flex-shrink-0">
          <GlassflowIcon
            icon={Wallet}
            glowColor="bg-blue-500/20"
            iconColor="text-blue-400"
            size="hero"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
            Connect Your Wallet
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/20">
            Link a Solana wallet to verify on-chain holdings, unlock live pricing, and sync yield distributions.
          </p>
        </div>
        <Link
          href="/settings/wallet"
          className="flex-shrink-0 inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-7 py-3.5 text-sm font-medium text-white/45 backdrop-blur-xl transition-all duration-400 hover:border-blue-500/20 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]"
        >
          <Wallet className="h-4 w-4" />
          Connect
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Feature pills */}
      <div className="relative border-t border-white/[0.03] px-8 py-5">
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Shield, label: 'Secure verification', accent: 'text-emerald-400/50' },
            { icon: Zap, label: 'Live pricing', accent: 'text-amber-400/50' },
            { icon: Activity, label: 'Auto-sync yields', accent: 'text-purple-400/50' },
            { icon: Clock, label: 'Transaction history', accent: 'text-blue-400/50' },
          ].map((feat) => (
            <span
              key={feat.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.04] bg-white/[0.01] px-4 py-1.5 text-[10px] text-white/20 transition-all duration-300 hover:border-white/[0.08] hover:text-white/35"
            >
              <feat.icon className={cn('h-3 w-3', feat.accent)} />
              {feat.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({
  title,
  sub,
  icon: Icon,
  iconColor,
  cta,
  ctaHref,
}: {
  title: string
  sub?: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconColor?: string
  cta?: string
  ctaHref?: string
}) {
  return (
    <div className="mb-7 flex items-end justify-between">
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className="relative">
            <div className={cn('pointer-events-none absolute -inset-2 rounded-full blur-lg opacity-40', iconColor === 'text-blue-400' ? 'bg-blue-500/20' : iconColor === 'text-indigo-400' ? 'bg-indigo-500/20' : 'bg-white/10')} />
            <div className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm',
              iconColor ?? 'text-white/40',
            )}>
              <Icon className="h-4 w-4 drop-shadow-[0_0_6px_currentColor]" />
            </div>
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
            {title}
          </h2>
          {sub && <p className="mt-0.5 text-[11px] tracking-wide text-white/20">{sub}</p>}
        </div>
      </div>
      {cta && ctaHref && (
        <Link
          href={ctaHref}
          className="group flex items-center gap-1.5 text-[11px] text-white/20 transition-colors duration-300 hover:text-white/55"
        >
          {cta}
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

// ── Main Export ─────────────────────────────────────────────────────────────

interface PortfolioClientProps {
  holdings: HoldingDTO[]
  summary:  PortfolioSummary
}

export function PortfolioClient({ holdings, summary }: PortfolioClientProps) {
  return (
    <div className="space-y-12 pt-8">
      {/* Beta live database banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/10 bg-blue-500/[0.02]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
        <div className="flex items-center gap-3 px-5 py-3.5">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
          <p className="text-xs text-white/35">
            <span className="font-semibold text-blue-400">Database Sync Active</span>
            {' '}&mdash; Your fractional holdings are synced with the local database. Connect your wallet to sign on-chain transactions.
          </p>
          <Link
            href="/settings/wallet"
            className="ml-auto flex-shrink-0 text-[11px] font-semibold text-blue-400 transition-colors duration-200 hover:text-blue-300"
          >
            Connect Wallet &rarr;
          </Link>
        </div>
      </div>

      {/* ── Hero summary metrics ── */}
      <section aria-label="Portfolio summary">
        <SectionHeader
          title="Portfolio Overview"
          sub="Aggregate value across all token holdings"
          icon={Layers}
          iconColor="text-blue-400"
        />
        <HeroMetrics summary={summary} />
      </section>

      {/* ── Holdings + Allocation ── */}
      <section aria-label="Token holdings">
        <SectionHeader
          title={`Holdings \u00B7 ${summary.holdingsCount}`}
          sub="Tokenized assets you own fractional shares of"
          icon={Coins}
          iconColor="text-indigo-400"
          cta="Browse marketplace"
          ctaHref="/marketplace"
        />
        {holdings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
              {holdings.map((h) => (
                <HoldingCard key={h.id} holding={h} />
              ))}
            </div>
            <AllocationCard holdings={holdings} />
          </div>
        ) : (
          <EmptyHoldings />
        )}
      </section>

      {/* ── Performance chart ── */}
      <section aria-label="Performance history">
        <PerformanceChart totalValue={summary.totalValue} />
      </section>

      {/* ── Wallet connect ── */}
      <section aria-label="Wallet connection">
        <WalletTeaser />
      </section>
    </div>
  )
}
