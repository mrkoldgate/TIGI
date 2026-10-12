import type { Metadata } from 'next'
import Link from 'next/link'
import {
  TrendingUp,
  BarChart3,
  LineChart,
  MapPin,
  Sparkles,
  Activity,
  ArrowRight,
  Zap,
  Globe,
  Brain,
  Target,
  Layers,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { requireAuth } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Insights — TIGI',
  description: 'Market trends, price analytics, and investment intelligence for tokenized real estate.',
}

// ---------------------------------------------------------------------------
// Insights Page — /insights
// M5: Market analytics, price trends, yield comparisons, heat maps.
//
// TIGI Glass: Bento layout with AI data visualization previews in
// atmospheric glass containers. Each card shows a rich chart/visual
// behind a frosted "coming soon" overlay.
// ---------------------------------------------------------------------------

export default async function InsightsPage() {
  await requireAuth('/insights')

  return (
    <div className="animate-fade-in relative pt-8 pb-16">
      {/* ── Ambient atmospheric orbs ── */}
      <div
        className="pointer-events-none absolute -left-36 top-12 h-[480px] w-[480px] rounded-full bg-indigo-500/[0.07] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-28 top-[400px] h-[400px] w-[400px] rounded-full bg-violet-500/[0.05] blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/4 top-[900px] h-[320px] w-[320px] rounded-full bg-blue-500/[0.04] blur-[100px]"
        aria-hidden="true"
      />

      <PageHeader
        title="Insights"
        description="Market trends, price analytics, and investment intelligence."
        eyebrow="Intelligence"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-3.5 py-1.5 text-xs backdrop-blur-xl">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span className="font-medium text-indigo-400">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)] animate-pulse" />
              <span className="text-zinc-500">Milestone 5</span>
            </div>
          </div>
        }
      />

      {/* ── Quick stats preview ── */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Avg. Yield', value: '7.4%', change: '+0.3%', icon: TrendingUp, glow: 'bg-emerald-500/[0.12]', iconColor: 'text-emerald-400', changeColor: 'text-emerald-400' },
          { label: 'Market Index', value: '1,247', change: '+12.8', icon: Activity, glow: 'bg-blue-500/[0.12]', iconColor: 'text-blue-400', changeColor: 'text-blue-400' },
          { label: 'Tokenized Vol.', value: '$48.2M', change: '+18%', icon: Zap, glow: 'bg-purple-500/[0.12]', iconColor: 'text-purple-400', changeColor: 'text-purple-400' },
          { label: 'AI Signals', value: '24', change: '6 new', icon: Brain, glow: 'bg-amber-500/[0.12]', iconColor: 'text-amber-400', changeColor: 'text-amber-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]"
          >
            <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${stat.glow} blur-[30px] opacity-60 transition-opacity duration-500 group-hover:opacity-90`} />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${stat.iconColor}`}>
                  <stat.icon className="h-4 w-4" style={{ filter: 'drop-shadow(0 0 6px currentColor)' }} />
                </div>
                <span className={`rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold ${stat.changeColor}`}>{stat.change}</span>
              </div>
              <p className="text-[11px] font-medium tracking-wide text-zinc-600 uppercase">{stat.label}</p>
              <p className="mt-0.5 text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500 tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bento Grid — Data Visualizations ── */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {/* ── Market Trend Chart — spans 2 cols ── */}
        <ChartCard
          title="Market Price Trends"
          subtitle="90-day rolling average across asset classes"
          icon={LineChart}
          iconColor="text-blue-400"
          glowColor="bg-blue-500/[0.06]"
          accentColor="via-blue-500/30"
          colSpan="md:col-span-2"
        >
          <TrendChartVisual />
        </ChartCard>

        {/* ── AI Confidence Distribution ── */}
        <ChartCard
          title="AI Confidence"
          subtitle="Valuation accuracy scores"
          icon={Brain}
          iconColor="text-violet-400"
          glowColor="bg-violet-500/[0.06]"
          accentColor="via-violet-500/30"
        >
          <ConfidenceVisual />
        </ChartCard>

        {/* ── Regional Yield Comparison ── */}
        <ChartCard
          title="Regional Yields"
          subtitle="Annual yield by metro area"
          icon={MapPin}
          iconColor="text-emerald-400"
          glowColor="bg-emerald-500/[0.06]"
          accentColor="via-emerald-500/30"
        >
          <YieldBarsVisual />
        </ChartCard>

        {/* ── Tokenization Activity ── */}
        <ChartCard
          title="Tokenization Activity"
          subtitle="Monthly on-chain volume"
          icon={Zap}
          iconColor="text-purple-400"
          glowColor="bg-purple-500/[0.06]"
          accentColor="via-purple-500/30"
        >
          <ActivityDotsVisual />
        </ChartCard>

        {/* ── Asset Allocation Heat Map ── */}
        <ChartCard
          title="Asset Allocation"
          subtitle="Portfolio distribution insights"
          icon={Layers}
          iconColor="text-amber-400"
          glowColor="bg-amber-500/[0.06]"
          accentColor="via-amber-500/30"
        >
          <HeatGridVisual />
        </ChartCard>

        {/* ── AI Investment Signals — full width ── */}
        <div className="relative col-span-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:col-span-2 lg:col-span-3">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/[0.06] blur-[60px]" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-violet-500/[0.04] blur-[50px]" />

          <div className="relative p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="pointer-events-none absolute -inset-2 rounded-full bg-indigo-500/[0.12] blur-xl" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-indigo-400">
                    <Sparkles className="h-4.5 w-4.5" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">AI Investment Signals</h3>
                  <p className="text-xs text-zinc-500">Machine learning-driven opportunity detection</p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-2 text-xs font-medium text-indigo-400 transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-500/[0.1]"
              >
                Unlock with Pro
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Signal preview rows */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { signal: 'Undervalued Asset', region: 'Miami, FL', confidence: 'High', type: 'BUY', color: 'text-emerald-400', borderColor: 'border-emerald-500/15', bgColor: 'bg-emerald-500/[0.04]' },
                { signal: 'Yield Spike Detected', region: 'Austin, TX', confidence: 'Medium', type: 'WATCH', color: 'text-blue-400', borderColor: 'border-blue-500/15', bgColor: 'bg-blue-500/[0.04]' },
                { signal: 'Price Correction Risk', region: 'Phoenix, AZ', confidence: 'High', type: 'CAUTION', color: 'text-amber-400', borderColor: 'border-amber-500/15', bgColor: 'bg-amber-500/[0.04]' },
              ].map((item) => (
                <div
                  key={item.signal}
                  className={`rounded-xl border ${item.borderColor} ${item.bgColor} p-4 transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded-md border ${item.borderColor} px-2 py-0.5 text-[9px] font-bold tracking-wider ${item.color}`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] text-zinc-600">{item.confidence}</span>
                  </div>
                  <p className="text-xs font-semibold text-white">{item.signal}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
                    <Globe className="h-2.5 w-2.5" />
                    {item.region}
                  </p>
                </div>
              ))}
            </div>

            {/* Blurred overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/30 backdrop-blur-[3px]">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <div className="pointer-events-none absolute -inset-3 rounded-full bg-indigo-500/[0.12] blur-xl" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-zinc-500">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <h4 className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400">
                  AI Signals launching in M5
                </h4>
                <p className="max-w-sm text-xs text-zinc-500">
                  Automated opportunity detection, risk alerts, and portfolio optimization recommendations.
                </p>
                <Link
                  href="/pricing"
                  className="group mt-1 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-zinc-400 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/25 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                >
                  View Pro plans
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Chart Card Shell ─────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  glowColor,
  accentColor,
  colSpan,
  children,
}: {
  title: string
  subtitle: string
  icon: typeof TrendingUp
  iconColor: string
  glowColor: string
  accentColor: string
  colSpan?: string
  children: React.ReactNode
}) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${colSpan ?? ''}`}>
      {/* Top accent */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${accentColor} to-transparent`} />
      {/* Corner glow */}
      <div className={`pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full ${glowColor} blur-[50px]`} />

      <div className="relative p-7">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${iconColor}`}>
            <Icon className="h-4 w-4" style={{ filter: 'drop-shadow(0 0 6px currentColor)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
            <p className="text-[10px] text-zinc-600">{subtitle}</p>
          </div>
        </div>

        {/* Chart content */}
        <div className="relative">
          {children}
        </div>

        {/* Coming soon overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/35 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className={`pointer-events-none absolute -inset-2 rounded-full ${glowColor} blur-xl`} />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-zinc-500">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs font-medium text-zinc-500">Coming in M5</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Chart Visuals (decorative SVGs for the preview) ──────────────────────────

function TrendChartVisual() {
  const lines = [
    { points: '0,80 30,72 60,75 90,55 120,60 150,42 180,48 210,30 240,35 270,22 300,18', color: '#3B82F6', label: 'Residential' },
    { points: '0,90 30,85 60,82 90,78 120,70 150,65 180,60 210,55 240,50 270,48 300,42', color: '#8B5CF6', label: 'Commercial' },
    { points: '0,70 30,75 60,68 90,72 120,65 150,68 180,58 210,62 240,55 270,50 300,45', color: '#10B981', label: 'Land' },
  ]

  return (
    <div>
      <svg viewBox="0 0 300 100" fill="none" className="h-32 w-full">
        {/* Grid lines */}
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
        ))}
        {lines.map((line) => (
          <g key={line.color}>
            <defs>
              <linearGradient id={`grad-${line.color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`${line.points} 300,100 0,100`}
              fill={`url(#grad-${line.color.slice(1)})`}
            />
            <polyline
              points={line.points}
              stroke={line.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        ))}
      </svg>
      <div className="mt-3 flex items-center gap-5">
        {lines.map((line) => (
          <div key={line.label} className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: line.color }} />
            <span className="text-[10px] text-zinc-500">{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfidenceVisual() {
  const segments = [
    { label: 'High', pct: 62, color: 'from-emerald-500 to-emerald-400' },
    { label: 'Medium', pct: 28, color: 'from-blue-500 to-blue-400' },
    { label: 'Low', pct: 10, color: 'from-amber-500 to-amber-400' },
  ]

  return (
    <div className="space-y-4">
      {/* Donut chart approximation */}
      <div className="flex items-center justify-center">
        <div className="relative h-28 w-28">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${62} ${100 - 62}`} strokeDashoffset="0" strokeLinecap="round" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${28} ${100 - 28}`} strokeDashoffset={`-${62}`} strokeLinecap="round" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray={`${10} ${100 - 10}`} strokeDashoffset={`-${62 + 28}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold tracking-tight text-white">82%</span>
            <span className="text-[9px] text-zinc-600">avg score</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${seg.color}`} />
              <span className="text-[10px] text-zinc-500">{seg.label}</span>
            </div>
            <span className="text-[10px] font-medium text-zinc-400 tabular-nums">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function YieldBarsVisual() {
  const regions = [
    { name: 'Miami', yield: 8.2, max: 12 },
    { name: 'Austin', yield: 11.4, max: 12 },
    { name: 'Phoenix', yield: 6.8, max: 12 },
    { name: 'Denver', yield: 7.1, max: 12 },
    { name: 'Seattle', yield: 5.9, max: 12 },
  ]

  return (
    <div className="space-y-3">
      {regions.map((r) => (
        <div key={r.name} className="flex items-center gap-3">
          <span className="w-12 text-right text-[10px] text-zinc-500 flex-shrink-0">{r.name}</span>
          <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/40"
              style={{ width: `${(r.yield / r.max) * 100}%` }}
            />
          </div>
          <span className="w-10 text-[10px] font-medium text-emerald-400 tabular-nums flex-shrink-0">{r.yield}%</span>
        </div>
      ))}
    </div>
  )
}

function ActivityDotsVisual() {
  // Heatmap-like dot grid representing monthly activity
  const weeks = [
    [2, 3, 1, 4, 2, 3, 5],
    [1, 4, 3, 2, 5, 4, 3],
    [3, 2, 5, 4, 3, 1, 4],
    [4, 5, 3, 1, 4, 5, 2],
    [2, 3, 4, 5, 2, 3, 4],
  ]
  const intensities = ['bg-purple-500/[0.08]', 'bg-purple-500/[0.15]', 'bg-purple-500/[0.25]', 'bg-purple-500/[0.40]', 'bg-purple-500/[0.60]']

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((val, di) => (
              <div
                key={di}
                className={`h-3 w-3 rounded-sm ${intensities[val - 1]} transition-colors duration-200`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[9px] text-zinc-600">Less</span>
        {intensities.map((cls, i) => (
          <div key={i} className={`h-2 w-2 rounded-sm ${cls}`} />
        ))}
        <span className="text-[9px] text-zinc-600">More</span>
      </div>
    </div>
  )
}

function HeatGridVisual() {
  const grid = [
    { label: 'Residential', values: [65, 72, 58, 80] },
    { label: 'Commercial', values: [45, 55, 70, 60] },
    { label: 'Land', values: [30, 40, 50, 35] },
    { label: 'Industrial', values: [20, 35, 45, 55] },
  ]
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4']

  function cellColor(val: number): string {
    if (val >= 70) return 'bg-amber-500/[0.40]'
    if (val >= 50) return 'bg-amber-500/[0.25]'
    if (val >= 35) return 'bg-amber-500/[0.15]'
    return 'bg-amber-500/[0.06]'
  }

  return (
    <div>
      {/* Column headers */}
      <div className="mb-2 flex">
        <div className="w-16" />
        {quarters.map((q) => (
          <div key={q} className="flex-1 text-center text-[9px] text-zinc-600">{q}</div>
        ))}
      </div>
      <div className="space-y-1.5">
        {grid.map((row) => (
          <div key={row.label} className="flex items-center gap-1.5">
            <span className="w-16 text-right text-[9px] text-zinc-500 flex-shrink-0 truncate">{row.label}</span>
            {row.values.map((val, i) => (
              <div
                key={i}
                className={`flex-1 h-6 rounded-md ${cellColor(val)} flex items-center justify-center`}
              >
                <span className="text-[8px] font-medium text-zinc-500 tabular-nums">{val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
