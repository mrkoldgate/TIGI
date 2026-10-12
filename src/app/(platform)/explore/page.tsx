import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Compass,
  TrendingUp,
  Building2,
  Map,
  Sparkles,
  ArrowRight,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Landmark,
  Gem,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { requireAuth } from '@/lib/auth/session'
import { getActiveListings, computeMarketplaceStats } from '@/lib/listings/listing-query'

export const metadata: Metadata = {
  title: 'Explore — TIGI',
  description: 'Discover tokenized real estate opportunities across the globe.',
}

// ---------------------------------------------------------------------------
// Explore — /explore
//
// Premium discovery hub. Bento-box layout showcasing featured properties,
// market categories, trending regions, and platform stats. Serves as the
// visual entry point into the TIGI marketplace ecosystem.
// ---------------------------------------------------------------------------

export default async function ExplorePage() {
  await requireAuth('/explore')
  const listings = await getActiveListings()
  const stats = computeMarketplaceStats(listings)

  const featuredListings = listings.filter((l) => l.status === 'ACTIVE').slice(0, 3)
  const totalValue = listings.reduce((sum, l) => sum + l.price, 0)

  return (
    <div className="animate-fade-in relative pt-8 pb-16">
      {/* ── TIGI v4 Elite Atmospheric Orbs ── */}
      <div
        className="pointer-events-none absolute -left-48 top-12 h-[650px] w-[650px] rounded-full bg-purple-500/[0.06] blur-[200px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 top-[350px] h-[550px] w-[550px] rounded-full bg-indigo-500/[0.05] blur-[160px] animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/3 top-[800px] h-[450px] w-[450px] rounded-full bg-emerald-500/[0.04] blur-[140px] animate-float-slow"
        aria-hidden="true"
      />

      {/* ── Page Header ── */}
      <PageHeader
        title="Explore"
        description="Discover tokenized real estate opportunities across the globe."
        eyebrow="Discovery"
        actions={
          <Link
            href="/marketplace"
            className="group relative z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/25 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_24px_rgba(99,102,241,0.12)]"
          >
            <div className="noise absolute inset-0 pointer-events-none" />
            <Compass className="h-4 w-4 text-[#A0A0B2] group-hover:text-white transition-colors" />
            Browse All
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        }
      />

      {/* ── Stats Ribbon (v4 Elite) ── */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: 'Active Listings',
            value: stats.totalActive.toLocaleString(),
            icon: Building2,
            glow: 'bg-indigo-500/[0.12]',
            iconColor: 'text-indigo-400',
          },
          {
            label: 'Total Value',
            value: `$${(totalValue / 1_000_000).toFixed(1)}M`,
            icon: BarChart3,
            glow: 'bg-purple-500/[0.12]',
            iconColor: 'text-purple-400',
          },
          {
            label: 'Tokenized',
            value: stats.tokenizedCount.toLocaleString(),
            icon: Gem,
            glow: 'bg-emerald-500/[0.12]',
            iconColor: 'text-emerald-400',
          },
          {
            label: 'Avg. Price',
            value: stats.totalActive > 0 ? `$${(stats.totalValue / stats.totalActive / 1_000).toFixed(0)}K` : '$0K',
            icon: TrendingUp,
            glow: 'bg-amber-500/[0.12]',
            iconColor: 'text-amber-400',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.04] bg-[#050505]/80 p-5 backdrop-blur-3xl shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15"
          >
            {/* Noise texture overlay */}
            <div className="noise absolute inset-0 pointer-events-none" />
            {/* Top edge light */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/20 transition-all duration-500" />
            
            <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full ${stat.glow} blur-2xl transition-opacity duration-300 group-hover:opacity-150`} />
            <div className="relative z-10 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] ${stat.iconColor} shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">{stat.label}</p>
                <p className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-zinc-500 tabular-nums">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bento Grid — Main Content ── */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* ── Featured Property — spans 2 cols ── */}
        {featuredListings[0] && (
          <Link
            href={`/marketplace/${featuredListings[0].id}`}
            className="group relative col-span-1 overflow-hidden rounded-[22px] border border-white/[0.04] bg-[#050505]/80 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.06)] md:col-span-2"
          >
            {/* Noise texture overlay */}
            <div className="noise absolute inset-0 pointer-events-none" />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] via-transparent to-violet-500/[0.02]" />
            {/* Top edge light */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/25 to-transparent group-hover:via-purple-500/40 transition-all duration-500" />

            <div className="relative z-10 p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/[0.08] px-3 py-1">
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">Featured</span>
              </div>
              <h2 className="text-h2 mb-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500 tracking-tight">
                {featuredListings[0].title}
              </h2>
              <p className="mb-4 max-w-xl text-sm leading-relaxed text-zinc-500">
                {featuredListings[0].description.slice(0, 160)}...
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-white tabular-nums">
                  ${featuredListings[0].price.toLocaleString()}
                </span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  {featuredListings[0].city}, {featuredListings[0].state}
                </span>
                {featuredListings[0].isTokenized && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-xs text-emerald-400">
                    <Zap className="h-3 w-3" /> Tokenized
                  </span>
                )}
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors duration-300 group-hover:text-white">
                View Property
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        )}

        {/* ── Quick Categories — tall single col card ── */}
        <div className="relative overflow-hidden rounded-[22px] border border-white/[0.04] bg-[#050505]/80 p-7 backdrop-blur-3xl shadow-2xl">
          {/* Noise texture overlay */}
          <div className="noise absolute inset-0 pointer-events-none" />
          {/* Top edge light */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/[0.05] blur-[50px]" />
          
          <h3 className="relative z-10 mb-5 text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
            Categories
          </h3>
          <div className="relative z-10 space-y-3">
            {[
              { label: 'Properties', icon: Building2, href: '/marketplace?category=PROPERTIES', desc: 'Residential & commercial', color: 'text-indigo-400', glow: 'group-hover:border-indigo-500/25' },
              { label: 'Land', icon: Map, href: '/marketplace?category=LAND', desc: 'Parcels & development', color: 'text-emerald-400', glow: 'group-hover:border-emerald-500/25' },
              { label: 'Tokenized', icon: Zap, href: '/marketplace?tokenized=true', desc: 'On-chain assets', color: 'text-purple-400', glow: 'group-hover:border-purple-500/25' },
              { label: 'Legacy', icon: Landmark, href: '/inheritance', desc: 'Estate planning', color: 'text-amber-400', glow: 'group-hover:border-amber-500/25' },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.03]"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] ${cat.color} shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`}>
                  <cat.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/90">{cat.label}</p>
                  <p className="text-xs text-white/60">{cat.desc}</p>
                </div>
                <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white/50" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Listings — 2 small cards ── */}
        {featuredListings.slice(1, 3).map((listing, i) => (
          <Link
            key={listing.id}
            href={`/marketplace/${listing.id}`}
            className="group relative overflow-hidden rounded-[22px] border border-white/[0.04] bg-[#050505]/80 p-6 backdrop-blur-3xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_20px_48px_rgba(0,0,0,0.7)]"
          >
            {/* Noise texture overlay */}
            <div className="noise absolute inset-0 pointer-events-none" />
            {/* Top edge light */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500" />
            
            <div
              className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-[40px] ${
                i === 0 ? 'bg-indigo-500/[0.06]' : 'bg-emerald-500/[0.06]'
              }`}
            />
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-xs text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  {listing.propertyType === 'LAND' ? 'Land' : 'Property'}
                </span>
                {listing.isTokenized && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400/70">
                    <Zap className="h-3 w-3" /> Tokenized
                  </span>
                )}
              </div>
              <h4 className="mb-1 text-base font-semibold tracking-tight text-white/90 line-clamp-1">{listing.title}</h4>
              <p className="mb-3 text-xs text-white/60">{listing.city}, {listing.state}</p>
              <p className="text-lg font-bold tracking-tight text-white tabular-nums">
                ${listing.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}

        {/* ── Why TIGI — Full width info card ── */}
        <div className="relative col-span-1 overflow-hidden rounded-[22px] border border-white/[0.04] bg-[#050505]/50 backdrop-blur-3xl shadow-2xl md:col-span-2 lg:col-span-3">
          {/* Noise texture overlay */}
          <div className="noise absolute inset-0 pointer-events-none" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/[0.04] blur-[80px]" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-purple-500/[0.03] blur-[60px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-8 sm:grid-cols-3">
            {[
              {
                icon: Globe,
                title: 'Global Access',
                desc: 'Invest in real estate across borders with fractional tokenized ownership.',
                color: 'text-indigo-400',
                glow: 'bg-indigo-500/[0.08]',
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                desc: 'Solana-powered transactions with full regulatory compliance built in.',
                color: 'text-purple-400',
                glow: 'bg-purple-500/[0.08]',
              },
              {
                icon: Zap,
                title: 'Instant Settlement',
                desc: 'On-chain tokenization means near-instant settlement and transparent ownership.',
                color: 'text-emerald-400',
                glow: 'bg-emerald-500/[0.08]',
              },
            ].map((feature) => (
              <div key={feature.title} className="flex flex-col items-start gap-4">
                <div className="relative">
                  <div className={`pointer-events-none absolute -inset-2 rounded-full ${feature.glow} blur-xl`} />
                  <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-[#0A0A0F] ${feature.color} shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-white/90">{feature.title}</h4>
                  <p className="text-sm leading-relaxed text-zinc-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
