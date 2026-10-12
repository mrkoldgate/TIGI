import Link from 'next/link'
import { FluidBackgroundWrapper } from '@/components/shared/fluid-background-wrapper'
import {
  ArrowRight,
  Compass,
  TrendingUp,
  Map,
  Landmark,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
  Shield,
  Zap,
  Building2,
  LineChart,
  Hexagon,
} from 'lucide-react'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { Magnetic, TextReveal, MouseTiltCard, MotionReveal, ClipReveal } from '@/components/ui/interactions'
import { PLATFORM_STATS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// TIGI Homepage — Hyper-Glass v4 Elite
//
// Hero: Centric Lume — massive 3D icon centered, back-lit by radial indigo
// flare spanning the entire viewport height. Glass monolith centerpiece.
//
// Sections: Dimension Structural Trays — rounded-[2.5rem] outer trays with
// Paragon inner cards floating inside. #050505 card backgrounds, 1px sharp
// borders, top-edge gradient lighting on everything.
//
// v4 Elite evolution:
//   • Pure black #000000 / charcoal #050505 — NO gray backgrounds
//   • Noise texture overlay on all glass surfaces
//   • Metallic gradient headings (from-white via-white to-zinc-500)
//   • Glassflow 3D centerpieces on feature cards (3-layer glow stack)
//   • gap-12 structural gridding for atmospheric breathing room
//   • shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] on all buttons/chips
//   • Technical text: text-[12px] font-medium tracking-wide uppercase text-zinc-600
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="relative" style={{ zIndex: 1 }}>
      <FluidBackgroundWrapper />
      <HeroSection />
      <MarqueeSection />
      <FeaturedPropertiesSection />
      <PlatformAreasSection />
      <AiAndInvestSection />
      <LandLegacySection />
      <CtaBannerSection />
    </div>
  )
}

// =============================================================================
// 1. HERO — Centric Lume: massive 3D icon centered, radial indigo flare
// =============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden flex flex-col items-center justify-center" style={{ zIndex: 2 }}>
      {/* ── Centric Lume radial flare — viewport-spanning indigo source ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 45%, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.07) 30%, transparent 60%),' +
            'radial-gradient(ellipse 40% 40% at 50% 45%, rgba(139,92,246,0.12) 0%, transparent 45%),' +
            'radial-gradient(ellipse 90% 50% at 50% 100%, rgba(0,0,0,0.98) 0%, transparent 50%),' +
            'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.9) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Structural grid — extremely subtle */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.008]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[100%] 2xl:max-w-none px-6 lg:px-12 2xl:px-24">
        <div className="mx-auto max-w-[1536px] flex flex-col items-center text-center">

          {/* ── Centric Lume 3D icon monolith — Glassflow 3-layer spec ── */}
          <MotionReveal direction="scale" className="mb-14">
            <div className="relative p-12 flex items-center justify-center">
              {/* Layer 1: Massive diffused backlight */}
              <div className="pointer-events-none absolute inset-0 bg-indigo-500/10 blur-[120px] animate-float-slow" aria-hidden="true" />
              {/* Layer 2: Secondary core glow */}
              <div className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/20 blur-[60px] animate-float" aria-hidden="true" />
              {/* Layer 3: Tertiary violet bloom */}
              <div className="pointer-events-none absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[40px]" aria-hidden="true" />

              {/* Glass monolith shell */}
              <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[inset_0_2px_30px_rgba(99,102,241,0.1),inset_0_-2px_20px_rgba(0,0,0,0.4),0_24px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(99,102,241,0.1)] sm:h-44 sm:w-44 sm:rounded-[3rem]">
                {/* Top-edge accent — Paragon 1px */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] rounded-t-[2.5rem] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent sm:rounded-t-[3rem]" aria-hidden="true" />
                {/* Noise texture */}
                <div className="noise absolute inset-0 rounded-[2.5rem] sm:rounded-[3rem] pointer-events-none" aria-hidden="true" />
                {/* Inner inset glow */}
                <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_50px_rgba(99,102,241,0.08)] sm:rounded-[3rem]" aria-hidden="true" />

                <Hexagon
                  className="relative h-16 w-16 text-indigo-400 sm:h-20 sm:w-20"
                  strokeWidth={1.2}
                  style={{ filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.7)) drop-shadow(0 0 50px rgba(99,102,241,0.3))' }}
                />
              </div>
            </div>
          </MotionReveal>

          {/* Eyebrow chip — #050505 structural pill */}
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.04] bg-[#050505] px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_12px_rgba(0,0,0,0.5)]">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.7)] animate-pulse-glow" aria-hidden="true" />
            <span className="text-[12px] font-medium tracking-wide uppercase text-zinc-600">
              Tokenized Real Estate · Powered by Solana
            </span>
          </div>

          {/* Headline — metallic gradient */}
          <div className="mb-8">
            <TextReveal
              text="Own The"
              by="word"
              className="text-[clamp(2.75rem,6.5vw+1rem,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500"
              style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', WebkitBackgroundClip: 'text' }}
            />
            <TextReveal
              text="Future"
              by="char"
              delay={0.3}
              className="text-[clamp(2.75rem,6.5vw+1rem,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-gold-gradient"
              style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
            />
            <TextReveal
              text="of Real Estate"
              by="word"
              delay={0.7}
              className="text-[clamp(2.75rem,6.5vw+1rem,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500"
              style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', WebkitBackgroundClip: 'text' }}
            />
          </div>

          {/* Subtext */}
          <p
            className="animate-slide-up mb-14 max-w-lg text-[1.0625rem] leading-relaxed text-zinc-500"
            style={{ animationDelay: '180ms' }}
          >
            Fractional ownership from $100. AI valuations on every
            listing. Digital estate planning. One platform.
          </p>

          {/* CTAs */}
          <div
            className="animate-slide-up flex flex-col gap-4 sm:flex-row items-center"
            style={{ animationDelay: '280ms' }}
          >
            <Magnetic strength={0.3}>
              <Link href="/marketplace" className="btn-gold gold-glow inline-flex items-center gap-3 no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.3}>
              <Link href="/auth/register" className="btn-glass inline-flex items-center gap-3 no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                Start Investing Free
                <ArrowUpRight className="h-4 w-4 opacity-50" />
              </Link>
            </Magnetic>
          </div>

          {/* Trust badges — #050505 structural pills */}
          <div
            className="animate-slide-up mt-14 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '380ms' }}
          >
            {[
              { icon: Shield, label: 'SEC-registered offerings', color: 'text-emerald-400', glowShadow: 'rgba(52,211,153,0.4)' },
              { icon: Zap, label: 'Solana settlement', color: 'text-blue-400', glowShadow: 'rgba(96,165,250,0.4)' },
              { icon: Sparkles, label: 'AI-estimated values', color: 'text-violet-400', glowShadow: 'rgba(167,139,250,0.4)' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="group relative flex items-center gap-2.5 overflow-hidden rounded-full border border-white/[0.04] bg-[#050505] px-4 py-2 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/[0.15]"
              >
                {/* Top-edge light */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                <badge.icon className={`relative h-3.5 w-3.5 ${badge.color}`} style={{ filter: `drop-shadow(0 0 6px ${badge.glowShadow})` }} />
                <span className="relative text-[12px] font-medium tracking-wide uppercase text-zinc-600 group-hover:text-zinc-400 transition-colors">{badge.label}</span>
              </div>
            ))}
          </div>

          {/* ── Stats row — Dimension Outer Tray ── */}
          <MotionReveal direction="up" delay={0.5} className="mt-28 w-full max-w-4xl">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-[#050505]/50 backdrop-blur-3xl p-8 shadow-[inset_0_2px_60px_rgba(99,102,241,0.03),inset_0_-2px_40px_rgba(0,0,0,0.3),0_4px_40px_rgba(0,0,0,0.5)]">
              {/* Noise */}
              <div className="noise absolute inset-0 rounded-[2.5rem] pointer-events-none" aria-hidden="true" />
              {/* Top-edge accent */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" aria-hidden="true" />
              {/* Corner glows */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/[0.06] blur-[60px] animate-float-slow" aria-hidden="true" />
              <div className="pointer-events-none absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-violet-500/[0.04] blur-[50px] animate-float" aria-hidden="true" />

              <div className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
                {PLATFORM_STATS.map((stat, i) => {
                  const glows = ['bg-indigo-500/[0.08]', 'bg-violet-500/[0.08]', 'bg-emerald-500/[0.08]', 'bg-blue-500/[0.08]']
                  return (
                    <MotionReveal key={stat.label} direction="up" delay={0.55 + i * 0.07}>
                      <div className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-[#050505]/80 p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
                        {/* Top-edge light */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-all duration-500 group-hover:via-white/[0.15]" />
                        <div className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full ${glows[i]} blur-2xl opacity-40 transition-opacity group-hover:opacity-80`} />
                        <div
                          className="relative mb-1.5"
                          style={{
                            fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                            fontWeight: 800,
                            letterSpacing: '-0.05em',
                            background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          {stat.value}
                        </div>
                        <div className="relative text-[12px] font-medium tracking-wide uppercase text-zinc-600">{stat.label}</div>
                      </div>
                    </MotionReveal>
                  )
                })}
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 2. MARQUEE — #050505 structural strip
// =============================================================================

const TICKER_ITEMS = [
  { text: '1,200+ Properties', icon: '◈' },
  { text: '$100 Minimum Investment', icon: '◈' },
  { text: 'AI Valuations on Every Listing', icon: '◈' },
  { text: '8.2% Average Annual Yield', icon: '◈' },
  { text: 'Solana-Powered Settlement', icon: '◈' },
  { text: 'Fractional Ownership', icon: '◈' },
  { text: 'Digital Estate Planning', icon: '◈' },
  { text: 'No Wallet Required', icon: '◈' },
]

function MarqueeSection() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="relative z-10 border-y border-white/[0.04] bg-[#050505]/60 backdrop-blur-3xl py-5">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
      <div className="overflow-hidden">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {doubled.map((item, i) => (
            <div key={i} className="inline-flex items-center gap-4 px-10">
              <span className="text-indigo-500/30 text-[10px]">{item.icon}</span>
              <span className="text-[12px] font-medium tracking-wide uppercase text-zinc-700">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// 3. FEATURED PROPERTIES — Dimension Outer Tray + Paragon Inner Cards
// =============================================================================

function FeaturedPropertiesSection() {
  return (
    <section className="relative z-10 px-6 py-36 lg:px-8 overflow-hidden">
      {/* Atmospheric depth field */}
      <div className="pointer-events-none absolute -left-56 top-20 h-[640px] w-[640px] rounded-full bg-indigo-500/[0.04] blur-[200px] animate-float-slow" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-[520px] w-[520px] rounded-full bg-violet-500/[0.03] blur-[160px] animate-float" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-white/[0.003] blur-[240px]" aria-hidden="true" />

      <div className="mx-auto w-full max-w-none 2xl:px-16">
        <div className="mb-20 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <MotionReveal direction="fade">
              <span className="section-num absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen" style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }} aria-hidden="true">01</span>
            </MotionReveal>
            <MotionReveal direction="up" delay={0.05}>
              <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-600 relative z-10 mx-auto my-3 text-center">Featured Listings</p>
            </MotionReveal>
            <ClipReveal delay={0.14} className="relative z-10">
              <h2 className="text-display font-extrabold tracking-[-0.05em] mx-auto max-w-2xl text-center bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">Properties Available Now</h2>
            </ClipReveal>
          </div>
          <MotionReveal direction="up" delay={0.28}>
            <Link
              href="/marketplace"
              className="group mt-6 hidden items-center justify-center gap-2 text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300 sm:flex"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </MotionReveal>
        </div>

        {/* ── Dimension Outer Tray ── */}
        <div className="group/container relative overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-[#050505]/50 backdrop-blur-3xl p-8 shadow-[inset_0_2px_60px_rgba(99,102,241,0.025),inset_0_-2px_40px_rgba(0,0,0,0.3),0_4px_40px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/[0.08] sm:p-10">
          {/* Noise */}
          <div className="noise absolute inset-0 rounded-[2.5rem] pointer-events-none" aria-hidden="true" />
          {/* Top-edge accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent transition-all duration-500 group-hover/container:via-indigo-400/30" aria-hidden="true" />
          {/* Corner glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/[0.05] blur-[70px] animate-float-slow" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-violet-500/[0.04] blur-[60px] animate-float" aria-hidden="true" />

          {/* Paragon inner cards — gap-12 */}
          <div className="relative grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROPERTIES.map((property, i) => (
              <MotionReveal key={property.id} direction="up" delay={i * 0.1}>
                <FeaturedPropertyCard property={property} />
              </MotionReveal>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center sm:hidden">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400">
            View all properties <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 4. PLATFORM AREAS — Dimension Outer Tray + Glassflow 3D Centerpieces
// =============================================================================

interface PlatformArea {
  key: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  href: string
  glowColor: string
  ctaLabel: string
  image?: string
  iconAccent: string
}

function PlatformAreasSection() {
  return (
    <section className="relative z-10 px-6 py-36 lg:px-8 overflow-hidden">
      <div className="pointer-events-none absolute left-1/3 top-0 h-[520px] w-[520px] rounded-full bg-indigo-500/[0.035] blur-[180px] animate-float-slow" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-28 top-[600px] h-[400px] w-[400px] rounded-full bg-violet-500/[0.025] blur-[140px] animate-float" aria-hidden="true" />

      <div className="mx-auto w-full max-w-none 2xl:px-16">
        <div className="mb-20 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <MotionReveal direction="fade">
              <span className="section-num absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen" style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }} aria-hidden="true">02</span>
            </MotionReveal>
            <MotionReveal direction="up" delay={0.05}>
              <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-600 relative z-10 mx-auto my-3 text-center">One Platform</p>
            </MotionReveal>
            <ClipReveal delay={0.14} className="relative z-10">
              <h2 className="text-display font-extrabold tracking-[-0.05em] mx-auto max-w-3xl text-center bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">Every dimension of real estate</h2>
            </ClipReveal>
          </div>
          <MotionReveal direction="up" delay={0.28}>
            <p className="mt-5 mx-auto max-w-xl text-center text-[1.125rem] text-zinc-500">
              From fractional investing to land development, estate planning, and AI market intelligence.
            </p>
          </MotionReveal>
        </div>

        {/* ── Dimension Outer Tray ── */}
        <div className="group/container relative overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-[#050505]/50 backdrop-blur-3xl p-8 shadow-[inset_0_2px_60px_rgba(255,255,255,0.01),inset_0_-2px_40px_rgba(0,0,0,0.3),0_4px_40px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/[0.08] sm:p-10">
          <div className="noise absolute inset-0 rounded-[2.5rem] pointer-events-none" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-all duration-500 group-hover/container:via-white/[0.15]" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/[0.04] blur-[60px] animate-float-slow" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-violet-500/[0.03] blur-[50px] animate-float" aria-hidden="true" />

          {/* Paragon inner cards — gap-12 */}
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_AREAS.map((area, i) => (
              <MotionReveal key={area.key} direction="up" delay={i * 0.09}>
                <PlatformAreaCard area={area} />
              </MotionReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PlatformAreaCard({ area }: { area: PlatformArea }) {
  return (
    <Link href={area.href} className="group block" style={{ borderRadius: '24px' }}>
      <MouseTiltCard
        maxTilt={6}
        spotlightColor={area.glowColor}
        className="overflow-hidden"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-[#050505]/80 p-8 transition-all duration-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_24px_rgba(0,0,0,0.4)] hover:border-white/20 hover:bg-[#0A0A0F]">
          {/* Paragon top-edge lighting */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-all duration-500 group-hover:via-white/30" />

          {/* Photographic background */}
          {area.image && (
            <div className="absolute inset-0 opacity-[0.04] mix-blend-luminosity transition-opacity duration-500 group-hover:opacity-[0.1]">
              <img src={area.image} alt="" className="h-full w-full object-cover filter grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
            </div>
          )}

          <div className="relative">
            {/* Glassflow 3D icon — 3-layer spec */}
            <div className="relative mb-8">
              {/* Layer 1: Diffused backlight */}
              <div className="pointer-events-none absolute -inset-4 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(circle, ${area.glowColor}, transparent 70%)` }} />
              {/* Layer 2: Core glow */}
              <div className="pointer-events-none absolute -inset-2 rounded-xl blur-[12px] opacity-0 transition-opacity duration-500 group-hover:opacity-60" style={{ background: area.glowColor }} />
              {/* Layer 3: Glass icon shell */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.4)]">
                <area.icon className={`h-5 w-5 ${area.iconAccent}`} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
              </div>
            </div>
            <h3 className="font-heading text-lg font-extrabold tracking-[-0.03em] mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">{area.title}</h3>
            <p className="text-sm leading-relaxed text-zinc-600">{area.description}</p>
            <div className="mt-8 flex items-center gap-2 text-[12px] font-medium tracking-wide uppercase text-zinc-700 transition-colors duration-300 group-hover:text-indigo-400">
              {area.ctaLabel}
              <ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </div>
        </div>
      </MouseTiltCard>
    </Link>
  )
}

// =============================================================================
// 5. AI INSIGHTS + HOW IT WORKS — Dimension Outer Trays
// =============================================================================

function AiAndInvestSection() {
  return (
    <section className="relative z-10 px-6 py-36 lg:px-8 overflow-hidden">
      <div className="pointer-events-none absolute -right-48 top-40 h-[580px] w-[580px] rounded-full bg-violet-500/[0.04] blur-[200px] animate-float-slow" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 bottom-60 h-[460px] w-[460px] rounded-full bg-indigo-500/[0.03] blur-[160px] animate-float" aria-hidden="true" />

      <div className="mx-auto w-full max-w-none 2xl:px-16">
        <div className="mb-24 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <MotionReveal direction="fade">
              <span className="section-num absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen" style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }} aria-hidden="true">03</span>
            </MotionReveal>
            <MotionReveal direction="up" delay={0.05}>
              <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-600 relative z-10 mx-auto my-3 text-center">AI Insights</p>
            </MotionReveal>
            <ClipReveal delay={0.14} className="relative z-10">
              <h2 className="text-display font-extrabold tracking-[-0.05em] mx-auto max-w-3xl text-center bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
                Intelligence in <span className="text-gold-gradient">every decision</span>
              </h2>
            </ClipReveal>
          </div>
        </div>

        <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
          {/* Left — AI mock in Outer Tray */}
          <MotionReveal direction="left">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-[#050505]/50 backdrop-blur-3xl p-8 shadow-[inset_0_2px_60px_rgba(139,92,246,0.025),inset_0_-2px_40px_rgba(0,0,0,0.3),0_4px_40px_rgba(0,0,0,0.5)]">
              <div className="noise absolute inset-0 rounded-[2.5rem] pointer-events-none" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" aria-hidden="true" />
              <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-violet-500/[0.06] blur-[60px] animate-float-slow" aria-hidden="true" />

              <div className="relative">
                {/* Property preview — inner card */}
                <div className="mb-5 overflow-hidden rounded-2xl border border-white/[0.04] bg-[#050505]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="relative h-48">
                    <PlaceholderImage slot="residential-1" alt="Property valuation preview" priority className="absolute inset-0 h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                      <div>
                        <p className="text-sm font-extrabold tracking-[-0.02em] bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">Sunset Heights Condos</p>
                        <p className="text-xs text-zinc-600">Miami, FL · Residential</p>
                      </div>
                      <span className="rounded-full border border-white/[0.04] bg-[#050505] px-3 py-1 text-xs text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">34% sold</span>
                    </div>
                  </div>
                </div>
                <MockAiValuationCard />
              </div>
            </div>
          </MotionReveal>

          {/* Right — copy */}
          <MotionReveal direction="right" className="order-2 lg:pl-10">
            <div className="relative">
              <p className="mb-10 text-lg leading-relaxed text-zinc-500">
                Every property on TIGI comes with an AI-estimated value, confidence
                score, and comparable sales analysis — updated continuously.
              </p>

              <ul className="mb-12 space-y-5">
                {AI_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-indigo-500/15 bg-indigo-500/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.5))' }} />
                    </div>
                    <span className="text-sm text-zinc-500">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/insights" className="btn-gold gold-glow inline-flex items-center gap-2 no-underline text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  Explore Insights
                </Link>
                <Link href="/pricing" className="text-sm font-semibold text-zinc-600 transition-colors hover:text-white">
                  View AI plans &rarr;
                </Link>
              </div>
            </div>
          </MotionReveal>
        </div>

        {/* How it works — Dimension Outer Tray */}
        <div className="mt-36 pt-24 border-t border-white/[0.04]">
          <div className="mb-20 text-center">
            <MotionReveal direction="up">
              <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-600 mb-5">How It Works</p>
            </MotionReveal>
            <ClipReveal delay={0.1}>
              <h2 className="text-display font-extrabold tracking-[-0.05em] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">Invest from $100</h2>
            </ClipReveal>
            <MotionReveal direction="up" delay={0.22}>
              <p className="mx-auto mt-6 max-w-lg text-zinc-500">
                No wallets. No complexity. Find a property you believe in and invest.
              </p>
            </MotionReveal>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-[#050505]/50 backdrop-blur-3xl p-10 shadow-[inset_0_2px_60px_rgba(99,102,241,0.025),inset_0_-2px_40px_rgba(0,0,0,0.3),0_4px_40px_rgba(0,0,0,0.5)] sm:p-12">
            <div className="noise absolute inset-0 rounded-[2.5rem] pointer-events-none" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" aria-hidden="true" />

            <div className="relative grid gap-12 sm:grid-cols-3">
              {HOW_IT_WORKS.map((step, i) => (
                <MotionReveal key={step.title} direction="up" delay={i * 0.15}>
                  <div className="group relative flex flex-col items-center text-center">
                    {/* Connecting line */}
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div
                        className="absolute top-12 left-[calc(50%+48px)] hidden h-px w-full sm:block"
                        style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.2), transparent)' }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Step number — Glassflow 3D icon shell */}
                    <div className="relative mb-8">
                      {/* Backlight */}
                      <div
                        className="pointer-events-none absolute -inset-4 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: 'radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
                        aria-hidden="true"
                      />
                      {/* Glass shell */}
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/[0.04] bg-[#050505]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:border-white/[0.1]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-all duration-500 group-hover:via-white/[0.15]" />
                        <span
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            letterSpacing: '-0.05em',
                            background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.04] bg-[#050505] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <step.icon className="h-4 w-4 text-zinc-600" />
                    </div>

                    <h3 className="font-heading text-lg font-extrabold tracking-[-0.03em] mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-600">{step.description}</p>
                  </div>
                </MotionReveal>
              ))}
            </div>
          </div>

          <MotionReveal direction="up" delay={0.45} className="mt-16 text-center">
            <Link href="/auth/register" className="btn-glass inline-flex items-center gap-2 no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              Get started — it&apos;s free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 6. LAND & LEGACY — Dimension Outer Tray + Paragon Showcase Cards
// =============================================================================

function LandLegacySection() {
  return (
    <section className="relative z-10 px-6 py-36 lg:px-8 overflow-hidden">
      <div className="pointer-events-none absolute -left-44 top-32 h-[520px] w-[520px] rounded-full bg-emerald-500/[0.035] blur-[180px] animate-float-slow" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-36 bottom-40 h-[440px] w-[440px] rounded-full bg-amber-500/[0.025] blur-[160px] animate-float" aria-hidden="true" />

      <div className="mx-auto w-full max-w-none 2xl:px-16">
        <div className="mb-20 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <MotionReveal direction="fade">
              <span className="section-num absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen" style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }} aria-hidden="true">04</span>
            </MotionReveal>
            <MotionReveal direction="up" delay={0.05}>
              <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-600 relative z-10 mx-auto my-3 text-center">What Makes TIGI Different</p>
            </MotionReveal>
            <ClipReveal delay={0.14} className="relative z-10">
              <h2 className="text-display font-extrabold tracking-[-0.05em] mx-auto max-w-2xl text-center bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">Beyond buying and selling</h2>
            </ClipReveal>
          </div>
          <MotionReveal direction="up" delay={0.28}>
            <p className="mt-5 mx-auto max-w-xl text-center text-zinc-500">
              TIGI extends into dimensions of real estate that no other platform touches.
            </p>
          </MotionReveal>
        </div>

        {/* ── Dimension Outer Tray ── */}
        <div className="group/container relative overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-[#050505]/50 backdrop-blur-3xl p-8 shadow-[inset_0_2px_60px_rgba(52,211,153,0.015),inset_0_-2px_40px_rgba(0,0,0,0.3),0_4px_40px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/[0.08] sm:p-10">
          <div className="noise absolute inset-0 rounded-[2.5rem] pointer-events-none" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/15 to-transparent transition-all duration-500 group-hover/container:via-emerald-400/25" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-emerald-500/[0.05] blur-[60px] animate-float-slow" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-amber-500/[0.04] blur-[50px] animate-float" aria-hidden="true" />

          {/* Showcase cards — gap-8 */}
          <div className="relative grid gap-8 lg:grid-cols-2">
            <MotionReveal direction="left" delay={0.05}>
              <FeatureShowcaseCard
                imageSlot="land-1"
                imageAlt="Land and development assets"
                eyebrow="Land & Development"
                heading="Lease land. Earn from the ground up."
                body="Access agricultural plots, commercial development sites, and raw land parcels. Generate ongoing yield through long-term lease agreements."
                href="/land"
                ctaLabel="Explore land assets"
                icon={Map}
                accentColor="emerald"
              />
            </MotionReveal>

            <MotionReveal direction="right" delay={0.15}>
              <FeatureShowcaseCard
                imageSlot="residential-4"
                imageAlt="Legacy and estate planning"
                eyebrow="Legacy Planning"
                heading="Your assets. Your legacy."
                body="Designate beneficiaries for your token holdings with conditional transfer rules — time-based, inactivity-based, or manual."
                href="/legacy"
                ctaLabel="Set up your estate plan"
                icon={Landmark}
                accentColor="amber"
              />
            </MotionReveal>
          </div>
        </div>

        <p className="mt-10 text-center text-[12px] font-medium tracking-wide uppercase text-zinc-700">
          Digital estate planning is advisory. Consult a qualified legal professional for complex estates.
        </p>
      </div>
    </section>
  )
}

type ShowcaseImageSlot = 'residential-1' | 'residential-2' | 'residential-3' | 'residential-4' | 'commercial-1' | 'commercial-2' | 'land-1' | 'land-2' | 'hero-1' | 'hero-2'

interface FeatureShowcaseCardProps {
  imageSlot: ShowcaseImageSlot
  imageAlt: string
  eyebrow: string
  heading: string
  body: string
  href: string
  ctaLabel: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  accentColor?: 'emerald' | 'amber' | 'indigo'
}

function FeatureShowcaseCard({
  imageSlot, imageAlt, eyebrow, heading, body, href, ctaLabel, icon: Icon, accentColor = 'indigo',
}: FeatureShowcaseCardProps) {
  const propertyType = imageSlot.startsWith('land') ? 'land' : imageSlot.startsWith('commercial') ? 'commercial' : 'residential'
  const accentMap = {
    emerald: { text: 'text-emerald-400', via: 'via-emerald-400/15', hover: 'group-hover:text-emerald-400', glow: 'rgba(52,211,153,0.4)' },
    amber: { text: 'text-amber-400', via: 'via-amber-400/15', hover: 'group-hover:text-amber-400', glow: 'rgba(245,158,11,0.4)' },
    indigo: { text: 'text-indigo-400', via: 'via-indigo-400/15', hover: 'group-hover:text-indigo-400', glow: 'rgba(99,102,241,0.4)' },
  }
  const accent = accentMap[accentColor]

  return (
    <Link href={href} className="group block">
      <article className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-[#050505]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-400 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_16px_64px_rgba(0,0,0,0.6),0_0_48px_rgba(99,102,241,0.04)]">
        {/* Top-edge lighting */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${accent.via} to-transparent transition-all duration-500 group-hover:via-white/30`} />

        <div className="relative h-64 overflow-hidden lg:h-72">
          <PlaceholderImage
            slot={imageSlot}
            propertyType={propertyType}
            alt={imageAlt}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/[0.04] bg-[#050505] px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Icon className={`h-3.5 w-3.5 ${accent.text}`} style={{ filter: `drop-shadow(0 0 6px ${accent.glow})` }} />
            <span className="text-[12px] font-medium tracking-wide uppercase text-zinc-600">{eyebrow}</span>
          </div>
        </div>

        <div className="p-8">
          {/* Corner glow on hover */}
          <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-indigo-500/[0.06] blur-[40px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <h3 className="relative mb-3 font-heading text-xl font-extrabold tracking-[-0.03em] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">{heading}</h3>
          <p className="relative mb-7 text-sm leading-relaxed text-zinc-600">{body}</p>
          <div className={`relative flex items-center gap-2 text-sm font-semibold text-zinc-600 transition-colors ${accent.hover}`}>
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  )
}

// =============================================================================
// 7. FINAL CTA — Centric Lume structural banner
// =============================================================================

function CtaBannerSection() {
  return (
    <section className="relative z-10 px-6 py-36 lg:px-8">
      <div className="mx-auto w-full max-w-none lg:px-6 2xl:px-16">
        <MotionReveal direction="scale">
          <div
            className="relative overflow-hidden rounded-[2.5rem] border border-indigo-500/[0.08] bg-[#050505]/50 backdrop-blur-3xl px-10 py-28 text-center lg:px-28 shadow-[inset_0_2px_60px_rgba(99,102,241,0.04),inset_0_-2px_40px_rgba(0,0,0,0.3),0_4px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Noise */}
            <div className="noise absolute inset-0 rounded-[2.5rem] pointer-events-none" aria-hidden="true" />

            {/* Centric Lume radial — localized flare */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.14) 0%, transparent 50%),' +
                  'radial-gradient(ellipse at 50% 60%, rgba(139,92,246,0.08) 0%, transparent 40%),' +
                  'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.03) 0%, transparent 35%)',
              }}
              aria-hidden="true"
            />

            {/* Top/bottom accent lines */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-[1px] w-96 -translate-x-1/2"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute left-1/2 bottom-0 h-[1px] w-64 -translate-x-1/2"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
              }}
              aria-hidden="true"
            />

            {/* Corner atmospheric orbs */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/[0.06] blur-[100px] animate-float-slow" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-violet-500/[0.04] blur-[80px] animate-float" aria-hidden="true" />

            <div className="relative">
              <MotionReveal direction="fade">
                <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-600 mb-6">Start Today</p>
              </MotionReveal>
              <ClipReveal delay={0.08} className="mb-6">
                <h2 className="text-display font-extrabold tracking-[-0.05em] mx-auto max-w-2xl bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
                  Ready to own your
                  <br />
                  <span className="text-gold-gradient">first fraction?</span>
                </h2>
              </ClipReveal>
              <p className="mx-auto mb-14 max-w-md text-zinc-500">
                Join thousands of investors building real estate portfolios with
                TIGI — starting from $100, with AI intelligence at every step.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/auth/register" className="btn-gold gold-glow inline-flex items-center gap-3 no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/marketplace" className="btn-glass inline-flex items-center gap-3 no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  Browse listings
                </Link>
              </div>

              <p className="mt-10 text-[12px] font-medium tracking-wide uppercase text-zinc-700">
                No credit card required. Investments carry risk. See offering documents.
              </p>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}

// =============================================================================
// AI VALUATION CARD MOCK — v4 Paragon inner card
// =============================================================================

function MockAiValuationCard() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-[#050505]/80 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.3),0_24px_64px_rgba(0,0,0,0.6)]">
        {/* Top-edge light */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/15 to-transparent" />
        {/* Corner glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/[0.06] blur-[50px]" />

        <div className="relative mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="pointer-events-none absolute -inset-2 rounded-full bg-violet-500/[0.1] blur-md" />
                <Sparkles className="relative h-4 w-4 text-violet-400" style={{ filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.6))' }} />
              </div>
              <span className="text-sm font-semibold text-violet-400 drop-shadow-[0_0_6px_rgba(167,139,250,0.4)]">AI Estimate</span>
            </div>
            <span className="text-[10px] text-zinc-700">Not a licensed appraisal</span>
          </div>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              background: 'linear-gradient(135deg, #fff, #fff, #71717a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            $485,000
          </div>
          <div className="mt-1 text-sm text-zinc-600">Estimated market value</div>
        </div>

        <div className="relative mb-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-zinc-600">Confidence</span>
            <span className="font-semibold text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]">High (0.82)</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]"
              style={{ width: '82%', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
              role="progressbar"
              aria-valuenow={82}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <p className="relative mb-5 text-xs text-zinc-700">
          Based on 3 comparable sales within 0.5 miles · Updated 2 hours ago
        </p>

        <div className="relative space-y-2.5">
          {['Comparable properties (3)', 'Positive factors (4)', 'Risk factors (2)'].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-[#050505] px-4 py-3 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/[0.1] hover:bg-[#0A0A0F]">
              <span className="text-xs text-zinc-500">{item}</span>
              <ChevronRight className="h-3 w-3 text-zinc-700" />
            </div>
          ))}
        </div>

        <div className="relative mt-5 rounded-xl border border-indigo-500/[0.08] bg-indigo-500/[0.03] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(99,102,241,0.05)]">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="h-3 w-3 flex-shrink-0 text-violet-400" style={{ filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.5))' }} />
            <span className="text-zinc-500">Full report: value range + comparables</span>
            <Link href="/pricing" className="ml-auto flex-shrink-0 font-semibold text-indigo-400 hover:text-indigo-300 drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]">
              TIGI Pro &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// FEATURED PROPERTY CARD — v4 Paragon inner card (floating in tray)
// =============================================================================

interface FeaturedProperty {
  id: string
  title: string
  location: string
  type: string
  pricePerFraction: number
  soldPercent: number
  annualYield: string
  imageSlot: 'residential-1' | 'commercial-1' | 'land-1'
}

function FeaturedPropertyCard({ property }: { property: FeaturedProperty }) {
  return (
    <Link href={`/marketplace/${property.id}`} className="block">
      <MouseTiltCard maxTilt={5} spotlightColor="rgba(99,102,241,0.08)" className="overflow-hidden">
        <article className="group relative overflow-hidden rounded-3xl border border-white/[0.04] bg-[#050505]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-400 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_16px_64px_rgba(0,0,0,0.6),0_0_48px_rgba(99,102,241,0.05)]">
          {/* Top-edge light */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-all duration-500 group-hover:via-white/30 z-10" />

          <div className="relative h-56 overflow-hidden">
            <PlaceholderImage
              slot={property.imageSlot}
              propertyType={
                property.imageSlot.startsWith('residential') ? 'residential'
                  : property.imageSlot.startsWith('commercial') ? 'commercial'
                    : 'land'
              }
              alt={property.title}
              className="h-full w-full transition-transform duration-700 group-hover:scale-[1.08]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

            <span className="absolute left-3.5 top-3.5 rounded-full border border-white/[0.04] bg-[#050505] px-3 py-1.5 text-[12px] font-medium tracking-wide uppercase text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              {property.type}
            </span>

            <span className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-[#050505] px-3 py-1.5 text-[11px] font-semibold text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_12px_rgba(52,211,153,0.2)]">
              <TrendingUp className="h-3 w-3" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.5))' }} />
              {property.annualYield}
            </span>
          </div>

          <div className="p-7">
            {/* Corner glow on hover */}
            <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-indigo-500/[0.06] blur-[40px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <h3
              className="relative mb-2 truncate font-heading font-extrabold tracking-[-0.03em] bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500 transition-colors"
              style={{ fontSize: '1.0625rem' }}
            >
              {property.title}
            </h3>
            <p className="relative mb-6 text-sm text-zinc-600">{property.location}</p>

            <div className="relative flex items-center justify-between text-sm">
              <div>
                <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-700">Per fraction</p>
                <p className="font-extrabold tracking-[-0.03em] tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400">
                  ${property.pricePerFraction.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-700">Funded</p>
                <p className="font-semibold tabular-nums text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]">{property.soldPercent}%</p>
              </div>
            </div>

            <div className="relative mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-all"
                style={{
                  width: `${property.soldPercent}%`,
                  background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                }}
                role="progressbar"
                aria-valuenow={property.soldPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </article>
      </MouseTiltCard>
    </Link>
  )
}

// =============================================================================
// STATIC DATA
// =============================================================================

const FEATURED_PROPERTIES: FeaturedProperty[] = [
  {
    id: 'prop-001',
    title: 'Sunset Heights Condos',
    location: 'Miami, FL',
    type: 'Residential',
    pricePerFraction: 485,
    soldPercent: 34,
    annualYield: '8.2%',
    imageSlot: 'residential-1',
  },
  {
    id: 'prop-002',
    title: 'Harbor Commerce Center',
    location: 'Austin, TX',
    type: 'Commercial',
    pricePerFraction: 1200,
    soldPercent: 61,
    annualYield: '11.4%',
    imageSlot: 'commercial-1',
  },
  {
    id: 'prop-003',
    title: 'Pacific Rim Land Parcel',
    location: 'Scottsdale, AZ',
    type: 'Land',
    pricePerFraction: 250,
    soldPercent: 12,
    annualYield: '6.8%',
    imageSlot: 'land-1',
  },
]

const PLATFORM_AREAS: PlatformArea[] = [
  {
    key: 'explore',
    icon: Building2,
    title: 'Explore',
    description: 'Browse tokenized properties across residential, commercial, and industrial asset classes — with AI valuations on every listing.',
    href: '/marketplace',
    ctaLabel: 'Browse Properties',
    glowColor: 'rgba(99, 102, 241, 0.10)',
    iconAccent: 'text-indigo-400',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop'
  },
  {
    key: 'invest',
    icon: LineChart,
    title: 'Invest',
    description: 'Purchase fractional ownership from $100. Build a diversified portfolio across cities, property types, and risk profiles.',
    href: '/auth/register',
    ctaLabel: 'Start Investing',
    glowColor: 'rgba(139, 92, 246, 0.10)',
    iconAccent: 'text-violet-400',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop'
  },
  {
    key: 'land',
    icon: Map,
    title: 'Land',
    description: 'Lease agricultural plots, development sites, and commercial land. Earn from the ground up while developers build the future.',
    href: '/land',
    ctaLabel: 'Explore Land',
    glowColor: 'rgba(52, 211, 153, 0.10)',
    iconAccent: 'text-emerald-400',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032&auto=format&fit=crop'
  },
  {
    key: 'legacy',
    icon: Landmark,
    title: 'Legacy',
    description: 'Designate beneficiaries for your holdings with conditional transfer rules. Digital estate planning for modern owners.',
    href: '/legacy',
    ctaLabel: 'Plan Your Estate',
    glowColor: 'rgba(245, 158, 11, 0.10)',
    iconAccent: 'text-amber-400',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070&auto=format&fit=crop'
  },
]

const AI_FEATURES = [
  'AI-estimated market value on every property listing',
  'Confidence scores with Low / Medium / High clarity',
  'Comparable sales analysis within 0.5 miles',
  'Market trend indicators — 90-day direction',
  'Full deep-analysis reports for TIGI Pro subscribers',
]

const HOW_IT_WORKS = [
  {
    icon: Compass,
    title: 'Discover',
    description: 'Browse hundreds of tokenized properties, filtered by type, price, location, and projected yield — all AI-valued.',
  },
  {
    icon: BarChart3,
    title: 'Invest',
    description: 'Choose your amount. From $100. Confirm in one step. Your TIGI account handles settlement — no wallets required.',
  },
  {
    icon: TrendingUp,
    title: 'Grow',
    description: 'Track your portfolio performance in real time. Diversify across property types and geographies as your capital grows.',
  },
]
