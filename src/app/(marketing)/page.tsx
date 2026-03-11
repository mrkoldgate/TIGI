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
} from 'lucide-react'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { Magnetic, TextReveal, MouseTiltCard, MotionReveal, ClipReveal } from '@/components/ui/interactions'
import { HeroParallaxCol } from '@/components/shared/hero-parallax-col'
import { PLATFORM_STATS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// TIGI Homepage — v3 Premium Tech / Web3 Design
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
// 1. HERO — Full-screen cinematic, Two-column
// =============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden flex items-center" style={{ zIndex: 2 }}>
      {/* Soft radial gradient overlay on top of Three.js canvas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 15% 15%, rgba(59,130,246,0.07) 0%, transparent 55%),' +
            'radial-gradient(ellipse 60% 50% at 85% 85%, rgba(139,92,246,0.06) 0%, transparent 55%),' +
            'linear-gradient(180deg, rgba(2,4,9,0.2) 0%, rgba(2,4,9,0.7) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.016]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[100%] 2xl:max-w-none px-6 lg:px-12 2xl:px-24">
        <div className="mx-auto grid max-w-[1536px] items-center gap-12 lg:gap-20 lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_550px]">

          {/* ── Left — copy ── */}
          <div className="py-24 lg:py-36">
            {/* Eyebrow chip */}
            <div className="animate-fade-in mb-8 inline-flex items-center gap-2.5 rounded-full glass px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-pulse-glow" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                Tokenized Real Estate · Powered by Solana
              </span>
            </div>

            {/* Headline */}
            <div className="mb-8">
              <TextReveal
                text="Own The"
                by="word"
                className="text-[clamp(2.75rem,6.5vw+1rem,7.5rem)] font-[800] leading-[0.95] tracking-[-0.05em] text-[#F8FAFC]"
                style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
              />
              <TextReveal
                text="Future"
                by="char"
                delay={0.3}
                className="text-[clamp(2.75rem,6.5vw+1rem,7.5rem)] font-[800] leading-[0.95] tracking-[-0.05em] text-gold-gradient"
                style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
              />
              <TextReveal
                text="of Real Estate"
                by="word"
                delay={0.7}
                className="text-[clamp(2.75rem,6.5vw+1rem,7.5rem)] font-[800] leading-[0.95] tracking-[-0.05em] text-[#F8FAFC]"
                style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
              />
            </div>

            {/* Subtext */}
            <p
              className="animate-slide-up mb-12 max-w-md text-[1.0625rem] leading-relaxed text-[#64748B]"
              style={{ animationDelay: '180ms' }}
            >
              Fractional ownership from $100. AI valuations on every
              listing. Digital estate planning. One platform.
            </p>

            {/* CTAs */}
            <div
              className="animate-slide-up flex flex-col gap-3 sm:flex-row items-center"
              style={{ animationDelay: '280ms' }}
            >
              <Magnetic strength={0.3}>
                <Link href="/marketplace" className="btn-gold gold-glow inline-flex items-center gap-3 no-underline">
                  Explore Properties
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link href="/auth/register" className="btn-glass inline-flex items-center gap-3 no-underline">
                  Start Investing Free
                  <ArrowUpRight className="h-4 w-4 opacity-50" />
                </Link>
              </Magnetic>
            </div>

            {/* Trust badges */}
            <div
              className="animate-slide-up mt-12 flex flex-wrap items-center gap-6"
              style={{ animationDelay: '380ms' }}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-[#34D399]" />
                <span className="text-xs text-[#475569]">SEC-registered offerings</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#60A5FA]" />
                <span className="text-xs text-[#475569]">Solana settlement</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
                <span className="text-xs text-[#475569]">AI-estimated values</span>
              </div>
            </div>
          </div>

          {/* ── Right — floating product panel with scroll parallax ── */}
          <HeroParallaxCol className="flex w-full justify-center py-12 lg:justify-end lg:py-36">
            <MouseTiltCard
              className="w-full max-w-[520px]"
              maxTilt={8}
              spotlightColor="rgba(59,130,246,0.10)"
            >
              {/* Floating orbit badge — fills vertical dead space above */}
              <div
                className="absolute -top-8 -left-6 z-20 flex items-center gap-2 glass-heavy rounded-full px-3.5 py-2 pointer-events-none"
                style={{ boxShadow: '0 4px 24px rgba(16,185,129,0.15)' }}
                aria-hidden="true"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse-glow" />
                <span className="text-[11px] font-semibold text-[#34D399]">+8.2% yield</span>
              </div>

              {/* Floating orbit badge — bottom-left dead space */}
              <div
                className="absolute -bottom-6 -left-8 z-20 flex items-center gap-2.5 glass-heavy rounded-2xl px-3.5 py-2.5 pointer-events-none"
                style={{ boxShadow: '0 4px 24px rgba(139,92,246,0.15)' }}
                aria-hidden="true"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
                  <BarChart3 className="h-3.5 w-3.5 text-[#A78BFA]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B]">AI Confidence</p>
                  <p className="text-xs font-bold text-[#F8FAFC]">High · 0.82</p>
                </div>
              </div>

              <HeroProductPanel />
            </MouseTiltCard>
          </HeroParallaxCol>
        </div>

        {/* Stats row */}
        <MotionReveal direction="up" delay={0.5} className="pb-16 border-t border-white/[0.05] pt-12">
          <div className="flex flex-wrap justify-center gap-10 sm:gap-16 md:gap-24">
            {PLATFORM_STATS.map((stat, i) => (
              <MotionReveal key={stat.label} direction="up" delay={0.55 + i * 0.07} className="text-center">
                <div
                  className="mb-1"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                    fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #60A5FA, #A78BFA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-medium tracking-wide text-[#475569]">{stat.label}</div>
              </MotionReveal>
            ))}
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}

// Floating product panel — macOS glossy glass UI mockup
function HeroProductPanel() {
  return (
    <div className="relative flex flex-col gap-3 select-none">
      {/* Property card */}
      <div className="glass-glossy overflow-hidden" style={{ borderRadius: '20px' }}>
        <div className="relative h-44 overflow-hidden" style={{ borderRadius: '20px 20px 0 0' }}>
          <PlaceholderImage slot="residential-1" alt="Featured property" priority className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020409]/90 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC]">Sunset Heights Condos</p>
              <p className="text-xs text-[#64748B]">Miami, FL · Residential</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[11px] font-semibold text-[#34D399]">
              <TrendingUp className="h-3 w-3" />
              8.2%
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-[#475569]">Per fraction</p>
              <p className="font-semibold text-[#F8FAFC]">$485</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#475569]">Funded</p>
              <p className="font-semibold text-[#60A5FA]">34%</p>
            </div>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full"
              style={{ width: '34%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }}
              role="progressbar"
              aria-valuenow={34}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* AI estimate */}
      <div className="glass-glossy px-5 py-4" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
            <span className="text-xs font-semibold text-[#A78BFA]">AI Estimate</span>
          </div>
          <span className="text-[10px] text-[#475569]">Not a licensed appraisal</span>
        </div>
        <div
          className="mb-1"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#F8FAFC',
          }}
        >
          $485,000
        </div>
        <div className="flex items-center gap-2 text-xs text-[#475569] mb-3">
          <span className="text-[#34D399] font-semibold">High confidence · 0.82</span>
          <span>·</span>
          <span>3 comparables</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
          <div
            className="h-full rounded-full"
            style={{ width: '82%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }}
          />
        </div>
      </div>

      {/* Live badge */}
      <div
        className="absolute -top-4 -right-4 flex items-center gap-2 glass-heavy rounded-full px-3.5 py-2"
        style={{ boxShadow: '0 8px 32px rgba(59,130,246,0.18)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse-glow" />
        <span className="text-xs font-semibold text-[#F8FAFC]">Live listings</span>
      </div>
    </div>
  )
}

// =============================================================================
// 2. MARQUEE — scrolling trust strip
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
    <div className="ticker-strip relative z-10 py-4 bg-[#020409]/80 backdrop-blur-xl">
      <div className="overflow-hidden">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {doubled.map((item, i) => (
            <div key={i} className="inline-flex items-center gap-4 px-8">
              <span className="text-[#3B82F6] text-[10px]">{item.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334155]">
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
// 3. FEATURED PROPERTIES
// =============================================================================

function FeaturedPropertiesSection() {
  return (
    <section className="relative z-10 px-6 py-32 lg:px-8 overflow-hidden">
      <div className="mx-auto w-full max-w-none 2xl:px-16">
        <div className="mb-16 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <MotionReveal direction="fade">
              <span className="section-num absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-screen" style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }} aria-hidden="true">01</span>
            </MotionReveal>
            <MotionReveal direction="up" delay={0.05}>
              <p className="text-label relative z-10 mx-auto my-3 text-center">Featured Listings</p>
            </MotionReveal>
            <ClipReveal delay={0.14} className="relative z-10">
              <h2 className="text-display mx-auto max-w-2xl text-center">Properties Available Now</h2>
            </ClipReveal>
          </div>
          <MotionReveal direction="up" delay={0.28}>
            <Link
              href="/marketplace"
              className="mt-6 hidden items-center justify-center gap-2 text-sm font-semibold text-[#60A5FA] transition-colors hover:text-[#93C5FD] sm:flex"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </MotionReveal>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PROPERTIES.map((property, i) => (
            <MotionReveal key={property.id} direction="up" delay={i * 0.1}>
              <FeaturedPropertyCard property={property} />
            </MotionReveal>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-[#60A5FA]">
            View all properties <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 4. PLATFORM AREAS
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
}

function PlatformAreasSection() {
  return (
    <section className="relative z-10 px-6 py-32 lg:px-8 overflow-hidden">
      <div className="mx-auto w-full max-w-none 2xl:px-16">
        <div className="mb-16 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <MotionReveal direction="fade">
              <span className="section-num absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-screen" style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }} aria-hidden="true">02</span>
            </MotionReveal>
            <MotionReveal direction="up" delay={0.05}>
              <p className="text-label relative z-10 mx-auto my-3 text-center">One Platform</p>
            </MotionReveal>
            <ClipReveal delay={0.14} className="relative z-10">
              <h2 className="text-display mx-auto max-w-3xl text-center">Every dimension of real estate</h2>
            </ClipReveal>
          </div>
          <MotionReveal direction="up" delay={0.28}>
            <p className="mt-5 mx-auto max-w-xl text-center text-[1.125rem] text-[#64748B]">
              From fractional investing to land development, estate planning, and AI market intelligence.
            </p>
          </MotionReveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_AREAS.map((area, i) => (
            <MotionReveal key={area.key} direction="up" delay={i * 0.09}>
              <PlatformAreaCard area={area} />
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlatformAreaCard({ area }: { area: PlatformArea }) {
  return (
    <Link href={area.href} className="group block" style={{ borderRadius: '20px' }}>
      <MouseTiltCard
        maxTilt={6}
        spotlightColor={area.glowColor}
        className="glass-card overflow-hidden"
      >
        <div className="relative p-7 hover:border-white/20">
          {/* Photographic Background */}
          {area.image && (
            <div className="absolute inset-0 opacity-[0.12] mix-blend-luminosity transition-opacity duration-500 group-hover:opacity-[0.25]">
              <img src={area.image} alt="" className="h-full w-full object-cover filter grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020409] via-[#020409]/80 to-transparent" />
            </div>
          )}

          <div className="relative">
            <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl glass-heavy">
              <area.icon className="h-[1.125rem] w-[1.125rem] text-[#60A5FA]" />
            </div>
            <h3 className="text-h4 mb-3 text-[#F8FAFC]">{area.title}</h3>
            <p className="text-sm leading-relaxed text-[#64748B]">{area.description}</p>
            <div className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#334155] transition-colors duration-300 group-hover:text-[#60A5FA]">
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
// 5. AI INSIGHTS + HOW IT WORKS
// =============================================================================

function AiAndInvestSection() {
  return (
    <section className="relative z-10 px-6 py-32 lg:px-8 overflow-hidden">
      <div className="mx-auto w-full max-w-none 2xl:px-16">
        {/* Centered Section Header */}
        <div className="mb-20 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <MotionReveal direction="fade">
              <span className="section-num absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-screen" style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }} aria-hidden="true">03</span>
            </MotionReveal>
            <MotionReveal direction="up" delay={0.05}>
              <p className="text-label relative z-10 mx-auto my-3 text-center">AI Insights</p>
            </MotionReveal>
            <ClipReveal delay={0.14} className="relative z-10">
              <h2 className="text-display mx-auto max-w-3xl text-center">
                Intelligence in <span className="text-gold-gradient">every decision</span>
              </h2>
            </ClipReveal>
          </div>
        </div>

        <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
          {/* Left — AI mock */}
          <MotionReveal direction="left">
            <div className="relative">
              <div className="mb-4 overflow-hidden rounded-2xl glass-card">
                <div className="relative h-48">
                  <PlaceholderImage slot="residential-1" alt="Property valuation preview" priority className="absolute inset-0 h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020409]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">Sunset Heights Condos</p>
                      <p className="text-xs text-[#64748B]">Miami, FL · Residential</p>
                    </div>
                    <span className="rounded-full glass px-2.5 py-1 text-xs text-[#94A3B8]">34% sold</span>
                  </div>
                </div>
              </div>
              <MockAiValuationCard />
            </div>
          </MotionReveal>

          {/* Right — copy info */}
          <MotionReveal direction="right" className="order-2 lg:pl-10">
            <div className="relative">
              <p className="mb-8 text-lg leading-relaxed text-[#64748B]">
                Every property on TIGI comes with an AI-estimated value, confidence
                score, and comparable sales analysis — updated continuously.
              </p>

              <ul className="mb-10 space-y-4">
                {AI_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                    <span className="text-sm text-[#64748B]">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/insights" className="btn-gold gold-glow inline-flex items-center gap-2 no-underline text-sm">
                  Explore Insights
                </Link>
                <Link href="/pricing" className="text-sm font-semibold text-[#64748B] transition-colors hover:text-[#F8FAFC]">
                  View AI plans →
                </Link>
              </div>
            </div>
          </MotionReveal>
        </div>

        {/* How it works */}
        <div className="mt-32 pt-20 border-t border-white/[0.05]">
          <div className="mb-16 text-center">
            <MotionReveal direction="up">
              <p className="text-label mb-4">How It Works</p>
            </MotionReveal>
            <ClipReveal delay={0.1}>
              <h2 className="text-display">Invest from $100</h2>
            </ClipReveal>
            <MotionReveal direction="up" delay={0.22}>
              <p className="mx-auto mt-5 max-w-lg text-[#64748B]">
                No wallets. No complexity. Find a property you believe in and invest.
              </p>
            </MotionReveal>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <MotionReveal key={step.title} direction="up" delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center group">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="absolute top-8 left-[calc(50%+32px)] hidden h-px w-full sm:block"
                      style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.25), transparent)' }}
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative mb-5 flex h-16 w-16 items-center justify-center shrink-0 rounded-2xl glass-heavy">
                    <div
                      className="absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.3) 0%, transparent 80%)' }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '1.375rem',
                        fontWeight: 800,
                        letterSpacing: '-0.04em',
                        background: 'linear-gradient(135deg, #60A5FA, #A78BFA)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        position: 'relative',
                        zIndex: 10
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="mb-4 flex h-8 w-8 items-center justify-center">
                    <step.icon className="h-4 w-4 text-[#334155]" />
                  </div>

                  <h3 className="text-h4 mb-3">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">{step.description}</p>
                </div>
              </MotionReveal>
            ))}
          </div>

          <MotionReveal direction="up" delay={0.45} className="mt-14 text-center">
            <Link href="/auth/register" className="btn-glass inline-flex items-center gap-2 no-underline">
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
// 6. LAND & LEGACY
// =============================================================================

function LandLegacySection() {
  return (
    <section className="relative z-10 px-6 py-32 lg:px-8 overflow-hidden">
      <div className="mx-auto w-full max-w-none 2xl:px-16">
        <div className="mb-16 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <MotionReveal direction="fade">
              <span className="section-num absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-screen" style={{ fontSize: 'clamp(5rem, 15vw, 12rem)' }} aria-hidden="true">04</span>
            </MotionReveal>
            <MotionReveal direction="up" delay={0.05}>
              <p className="text-label relative z-10 mx-auto my-3 text-center">What Makes TIGI Different</p>
            </MotionReveal>
            <ClipReveal delay={0.14} className="relative z-10">
              <h2 className="text-display mx-auto max-w-2xl text-center">Beyond buying and selling</h2>
            </ClipReveal>
          </div>
          <MotionReveal direction="up" delay={0.28}>
            <p className="mt-5 mx-auto max-w-xl text-center text-[#64748B]">
              TIGI extends into dimensions of real estate that no other platform touches.
            </p>
          </MotionReveal>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
            />
          </MotionReveal>
        </div>

        <p className="mt-8 text-center text-xs text-[#334155]">
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
}

function FeatureShowcaseCard({
  imageSlot, imageAlt, eyebrow, heading, body, href, ctaLabel, icon: Icon,
}: FeatureShowcaseCardProps) {
  const propertyType = imageSlot.startsWith('land') ? 'land' : imageSlot.startsWith('commercial') ? 'commercial' : 'residential'

  return (
    <Link href={href} className="group block gradient-border">
      <article className="glass-card overflow-hidden">
        <div className="relative h-64 overflow-hidden lg:h-72">
          <PlaceholderImage
            slot={imageSlot}
            propertyType={propertyType}
            alt={imageAlt}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020409] via-[#020409]/20 to-transparent" />

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full glass px-3.5 py-1.5">
            <Icon className="h-3.5 w-3.5 text-[#60A5FA]" />
            <span className="text-xs font-semibold text-[#94A3B8]">{eyebrow}</span>
          </div>
        </div>

        <div className="p-7">
          <h3 className="text-h3 mb-3">{heading}</h3>
          <p className="mb-6 text-sm leading-relaxed text-[#64748B]">{body}</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#60A5FA] transition-colors group-hover:text-[#93C5FD]">
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  )
}

// =============================================================================
// 7. FINAL CTA
// =============================================================================

function CtaBannerSection() {
  return (
    <section className="relative z-10 px-6 py-32 lg:px-8">
      <div className="mx-auto w-full max-w-none lg:px-6 2xl:px-16">
        <MotionReveal direction="scale">
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-24 text-center lg:px-24 glass-glossy"
            style={{ border: '1px solid rgba(59,130,246,0.15)' }}
          >
            {/* Gradient mesh */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 25% 35%, rgba(59,130,246,0.10) 0%, transparent 50%),' +
                  'radial-gradient(ellipse at 75% 65%, rgba(139,92,246,0.08) 0%, transparent 50%),' +
                  'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 40%)',
              }}
              aria-hidden="true"
            />

            {/* Animated top/bottom lines */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-px w-96 -translate-x-1/2 animate-pulse-glow"
              style={{ background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)' }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute left-1/2 bottom-0 h-px w-64 -translate-x-1/2 animate-pulse-glow"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)',
                animationDelay: '2s',
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <MotionReveal direction="fade">
                <p className="text-label mb-5">Start Today</p>
              </MotionReveal>
              <ClipReveal delay={0.08} className="mb-5">
                <h2 className="text-display mx-auto max-w-2xl">
                  Ready to own your
                  <br />
                  <span className="text-gold-gradient">first fraction?</span>
                </h2>
              </ClipReveal>
              <p className="mx-auto mb-12 max-w-md text-[#64748B]">
                Join thousands of investors building real estate portfolios with
                TIGI — starting from $100, with AI intelligence at every step.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/auth/register" className="btn-gold gold-glow inline-flex items-center gap-3 no-underline">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/marketplace" className="btn-glass inline-flex items-center gap-3 no-underline">
                  Browse listings
                </Link>
              </div>

              <p className="mt-8 text-xs text-[#334155]">
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
// AI VALUATION CARD MOCK
// =============================================================================

function MockAiValuationCard() {
  return (
    <div className="relative">
      <div className="glass-glossy p-6" style={{ borderRadius: '20px' }}>
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#A78BFA]" />
              <span className="text-sm font-semibold text-[#A78BFA]">AI Estimate</span>
            </div>
            <span className="text-[10px] text-[#475569]">Not a licensed appraisal</span>
          </div>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#F8FAFC',
            }}
          >
            $485,000
          </div>
          <div className="mt-1 text-sm text-[#64748B]">Estimated market value</div>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[#475569]">Confidence</span>
            <span className="font-semibold text-[#60A5FA]">High (0.82)</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full"
              style={{ width: '82%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }}
              role="progressbar"
              aria-valuenow={82}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <p className="mb-5 text-xs text-[#475569]">
          Based on 3 comparable sales within 0.5 miles · Updated 2 hours ago
        </p>

        <div className="space-y-2">
          {['Comparable properties (3)', 'Positive factors (4)', 'Risk factors (2)'].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-xl glass px-4 py-2.5">
              <span className="text-xs text-[#94A3B8]">{item}</span>
              <ChevronRight className="h-3 w-3 text-[#475569]" />
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl glass px-4 py-3" style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="h-3 w-3 flex-shrink-0 text-[#A78BFA]" />
            <span className="text-[#64748B]">Full report: value range + comparables</span>
            <Link href="/pricing" className="ml-auto flex-shrink-0 font-semibold text-[#60A5FA] hover:text-[#93C5FD]">
              TIGI Pro →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// FEATURED PROPERTY CARD
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
    <Link href={`/marketplace/${property.id}`} className="gradient-border block">
      <MouseTiltCard maxTilt={5} spotlightColor="rgba(167,139,250,0.12)" className="overflow-hidden">
        <article className="group glass-card overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(167,139,250,0.4)] hover:border-white/20">
          <div className="relative h-56 overflow-hidden">
            <PlaceholderImage
              slot={property.imageSlot}
              propertyType={
                property.imageSlot.startsWith('residential') ? 'residential'
                  : property.imageSlot.startsWith('commercial') ? 'commercial'
                    : 'land'
              }
              alt={property.title}
              className="h-full w-full transition-transform duration-700 group-hover:scale-[1.15]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020409]/70 via-transparent to-transparent group-hover:opacity-75 transition-opacity duration-500" />

            <span className="absolute left-3.5 top-3.5 rounded-full glass px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
              {property.type}
            </span>

            <span className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[11px] font-semibold text-[#34D399]">
              <TrendingUp className="h-3 w-3" />
              {property.annualYield}
            </span>
          </div>

          <div className="p-5">
            <h3
              className="mb-1 truncate transition-colors group-hover:text-[#60A5FA]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '1.0625rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
              }}
            >
              {property.title}
            </h3>
            <p className="mb-5 text-sm text-[#475569]">{property.location}</p>

            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-xs text-[#475569]">Per fraction</p>
                <p className="font-semibold tabular-nums text-[#F8FAFC]">
                  ${property.pricePerFraction.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#475569]">Funded</p>
                <p className="font-semibold tabular-nums text-[#60A5FA]">{property.soldPercent}%</p>
              </div>
            </div>

            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${property.soldPercent}%`,
                  background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
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
    glowColor: 'rgba(59, 130, 246, 0.15)',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop'
  },
  {
    key: 'invest',
    icon: LineChart,
    title: 'Invest',
    description: 'Purchase fractional ownership from $100. Build a diversified portfolio across cities, property types, and risk profiles.',
    href: '/auth/register',
    ctaLabel: 'Start Investing',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop'
  },
  {
    key: 'land',
    icon: Map,
    title: 'Land',
    description: 'Lease agricultural plots, development sites, and commercial land. Earn from the ground up while developers build the future.',
    href: '/land',
    ctaLabel: 'Explore Land',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032&auto=format&fit=crop'
  },
  {
    key: 'legacy',
    icon: Landmark,
    title: 'Legacy',
    description: 'Designate beneficiaries for your holdings with conditional transfer rules. Digital estate planning for modern owners.',
    href: '/legacy',
    ctaLabel: 'Plan Your Estate',
    glowColor: 'rgba(245, 158, 11, 0.15)',
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
