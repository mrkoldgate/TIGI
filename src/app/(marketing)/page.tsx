import Link from 'next/link'
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
} from 'lucide-react'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { ScrollReveal } from '@/components/shared/scroll-reveal'
import { PLATFORM_STATS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// TIGI Homepage — Premium Glass Morphism Redesign
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedPropertiesSection />
      <PlatformAreasSection />
      <AiAndInvestSection />
      <LandLegacySection />
      <CtaBannerSection />
    </div>
  )
}

// =============================================================================
// 1. HERO — Cinematic, immersive opening
// =============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-[100vh] overflow-hidden flex items-center">
      {/* === Atmospheric Background === */}

      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(212,168,67,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(45,212,191,0.02) 0%, transparent 40%), #050508',
        }}
        aria-hidden="true"
      />

      {/* Floating orbs */}
      <div
        className="orb orb-amber animate-float"
        style={{ width: 500, height: 500, top: '-10%', left: '15%', opacity: 0.7 }}
        aria-hidden="true"
      />
      <div
        className="orb orb-violet animate-float-slow"
        style={{ width: 400, height: 400, bottom: '5%', right: '10%', opacity: 0.5 }}
        aria-hidden="true"
      />
      <div
        className="orb orb-teal animate-float"
        style={{ width: 300, height: 300, top: '40%', right: '30%', opacity: 0.4, animationDelay: '4s' }}
        aria-hidden="true"
      />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      {/* === Content === */}
      <div className="relative z-10 mx-auto max-w-[1320px] px-6 py-32 lg:px-8 lg:py-40 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow pill */}
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2.5 rounded-full glass px-5 py-2">
            <span className="h-2 w-2 rounded-full bg-[#D4A843] animate-pulse-glow" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9B9687]">
              Tokenized Real Estate
            </span>
          </div>

          {/* Massive headline */}
          <h1 className="text-hero mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Own The Future
            <br />
            <span className="text-gold-gradient">of Real Estate</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-slide-up mb-12 max-w-xl text-lg leading-relaxed text-[#9B9687]" style={{ animationDelay: '200ms' }}>
            Fractional ownership. AI intelligence. Digital estate planning.
            <br className="hidden sm:block" />
            The premium platform for modern property investors.
          </p>

          {/* CTA group — pill buttons */}
          <div className="animate-slide-up flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '300ms' }}>
            <Link href="/marketplace" className="btn-gold gold-glow inline-flex items-center gap-3 no-underline">
              Explore Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/register" className="btn-glass inline-flex items-center gap-3 no-underline">
              Start Investing Free
              <ArrowUpRight className="h-4 w-4 opacity-50" />
            </Link>
          </div>
        </div>

        {/* Stats row — oversized bold numbers */}
        <div className="animate-slide-up mt-24 pt-12 border-t border-white/[0.04]" style={{ animationDelay: '450ms' }}>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-4xl font-bold tracking-tight text-[#D4A843] lg:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-[#5E5A50]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 2. FEATURED PROPERTIES — Glass cards with immersive images
// =============================================================================

function FeaturedPropertiesSection() {
  return (
    <section className="relative px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <ScrollReveal>
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="text-label mb-3">Featured Listings</p>
              <h2 className="text-display">Properties Available Now</h2>
            </div>
            <Link
              href="/marketplace"
              className="hidden items-center gap-2 text-sm font-medium text-[#D4A843] transition-colors hover:text-[#F0D68A] sm:flex"
            >
              View all properties
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PROPERTIES.map((property, i) => (
            <ScrollReveal key={property.id} delay={i * 120}>
              <FeaturedPropertyCard property={property} />
            </ScrollReveal>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 text-center sm:hidden">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-[#D4A843]">
            View all properties <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 3. PLATFORM AREAS — Glass cards with ambient colored glow
// =============================================================================

function PlatformAreasSection() {
  return (
    <section className="relative px-6 py-28 lg:px-8 overflow-hidden">
      {/* Subtle background accent */}
      <div className="orb orb-amber animate-float-slow" style={{ width: 600, height: 600, top: '10%', left: '-15%', opacity: 0.3 }} aria-hidden="true" />

      <div className="relative mx-auto max-w-[1320px]">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <p className="text-label mb-4">One Platform</p>
            <h2 className="text-display mx-auto max-w-2xl">
              Every dimension of real estate
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[#9B9687]">
              From fractional investing to land development, estate planning, and AI market intelligence.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_AREAS.map((area, i) => (
            <ScrollReveal key={area.key} delay={i * 100}>
              <PlatformAreaCard area={area} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

interface PlatformArea {
  key: string
  icon: React.ElementType
  title: string
  description: string
  href: string
  glowColor: string
  ctaLabel: string
}

function PlatformAreaCard({ area }: { area: PlatformArea }) {
  return (
    <Link href={area.href} className="group block">
      <article className="glass-card relative h-full overflow-hidden p-6">
        {/* Ambient glow on hover */}
        <div
          className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${area.glowColor}, transparent 70%)` }}
          aria-hidden="true"
        />

        <div className="relative">
          {/* Icon */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl glass-heavy">
            <area.icon className="h-5 w-5 text-[#D4A843]" />
          </div>

          {/* Text */}
          <h3 className="font-heading text-xl font-semibold mb-3 text-[#F0EDE6]">{area.title}</h3>
          <p className="text-sm leading-relaxed text-[#9B9687]">{area.description}</p>

          {/* CTA */}
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#5E5A50] transition-colors duration-300 group-hover:text-[#D4A843]">
            {area.ctaLabel}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  )
}

// =============================================================================
// 4. AI INSIGHTS + HOW IT WORKS — Cinematic two-column
// =============================================================================

function AiAndInvestSection() {
  return (
    <section className="relative px-6 py-28 lg:px-8 overflow-hidden">
      <div className="orb orb-violet animate-float" style={{ width: 400, height: 400, top: '20%', right: '-5%', opacity: 0.4 }} aria-hidden="true" />

      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
          {/* Left — AI valuation mock */}
          <ScrollReveal animation="left" className="order-2 lg:order-1">
            <div className="relative">
              {/* Property image preview */}
              <div className="mb-5 overflow-hidden rounded-2xl glass-card">
                <div className="relative h-44">
                  <PlaceholderImage
                    slot="residential-1"
                    alt="Property valuation preview"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#F0EDE6]">Sunset Heights Condos</p>
                      <p className="text-xs text-[#9B9687]">Miami, FL · Residential</p>
                    </div>
                    <span className="rounded-full glass px-3 py-1 text-xs text-[#9B9687]">
                      34% sold
                    </span>
                  </div>
                </div>
              </div>

              {/* AI valuation panel */}
              <MockAiValuationCard />
            </div>
          </ScrollReveal>

          {/* Right — Copy */}
          <ScrollReveal className="order-1 lg:order-2">
            <p className="text-label mb-4">AI Insights</p>
            <h2 className="text-display mb-6">
              Intelligence in
              <br />
              <span className="text-gold-gradient">every decision</span>
            </h2>
            <p className="mb-8 text-lg text-[#9B9687]">
              Every property on TIGI comes with an AI-estimated value, confidence
              score, and comparable sales analysis.
            </p>

            <ul className="mb-10 space-y-4">
              {AI_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D4A843]" />
                  <span className="text-sm text-[#9B9687]">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/insights" className="btn-gold gold-glow inline-flex items-center gap-2 no-underline text-sm">
                Explore Insights
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-[#9B9687] transition-colors hover:text-[#F0EDE6]">
                View AI plans →
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* How it works — numbered steps */}
        <div className="mt-32 pt-20 border-t border-white/[0.04]">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <p className="text-label mb-4">How It Works</p>
              <h2 className="text-display">Invest from $100</h2>
              <p className="mx-auto mt-5 max-w-lg text-[#9B9687]">
                No wallets. No complexity. Find a property you believe in and invest.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 150}>
                <div className="relative text-center">
                  {/* Step number — big, bold */}
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl glass-heavy">
                    <span className="font-heading text-2xl font-bold text-[#D4A843]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center">
                    <step.icon className="h-5 w-5 text-[#9B9687]" />
                  </div>

                  <h3 className="font-heading text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#9B9687]">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-14 text-center">
            <Link href="/auth/register" className="btn-glass inline-flex items-center gap-2 no-underline">
              Get started — it&apos;s free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 5. LAND & LEGACY — Immersive full-width showcase
// =============================================================================

function LandLegacySection() {
  return (
    <section className="relative px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <p className="text-label mb-4">What Makes TIGI Different</p>
            <h2 className="text-display">Beyond buying and selling</h2>
            <p className="mx-auto mt-5 max-w-lg text-[#9B9687]">
              TIGI extends into dimensions of real estate that no other platform touches.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-2">
          <ScrollReveal delay={0}>
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
          </ScrollReveal>

          <ScrollReveal delay={150}>
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
          </ScrollReveal>
        </div>

        <p className="mt-8 text-center text-xs text-[#5E5A50]">
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
  icon: React.ElementType
}

function FeatureShowcaseCard({
  imageSlot, imageAlt, eyebrow, heading, body, href, ctaLabel, icon: Icon,
}: FeatureShowcaseCardProps) {
  const propertyType = imageSlot.startsWith('land') ? 'land' : imageSlot.startsWith('commercial') ? 'commercial' : 'residential'

  return (
    <Link href={href} className="group block">
      <article className="glass-card overflow-hidden">
        {/* Image */}
        <div className="relative h-64 overflow-hidden lg:h-72">
          <PlaceholderImage
            slot={imageSlot}
            propertyType={propertyType}
            alt={imageAlt}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/20 to-transparent" />

          {/* Eyebrow badge */}
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full glass px-3.5 py-1.5">
            <Icon className="h-3.5 w-3.5 text-[#D4A843]" />
            <span className="text-xs font-semibold text-[#9B9687]">{eyebrow}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-7">
          <h3 className="font-heading text-xl font-semibold mb-3">{heading}</h3>
          <p className="mb-6 text-sm leading-relaxed text-[#9B9687]">{body}</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#D4A843] transition-colors group-hover:text-[#F0D68A]">
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  )
}

// =============================================================================
// 6. FINAL CTA — Gradient mesh with animated glass border
// =============================================================================

function CtaBannerSection() {
  return (
    <section className="px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <ScrollReveal animation="scale">
          <div className="relative overflow-hidden rounded-3xl glass-heavy px-8 py-20 text-center lg:px-20">
            {/* Gradient mesh background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 30% 40%, rgba(212,168,67,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.06) 0%, transparent 50%)',
              }}
              aria-hidden="true"
            />

            {/* Animated gold top line */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-px w-80 -translate-x-1/2 animate-pulse-glow"
              style={{ background: 'linear-gradient(90deg, transparent, #D4A843, transparent)' }}
              aria-hidden="true"
            />

            <div className="relative">
              <p className="text-label mb-5">Start Today</p>
              <h2 className="text-display mx-auto mb-5 max-w-xl">
                Ready to own your
                <br />
                <span className="text-gold-gradient">first fraction?</span>
              </h2>
              <p className="mx-auto mb-12 max-w-md text-[#9B9687]">
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

              <p className="mt-8 text-xs text-[#5E5A50]">
                No credit card required. Investments carry risk. See offering documents.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// =============================================================================
// AI VALUATION CARD MOCK
// =============================================================================

function MockAiValuationCard() {
  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#D4A843]" />
          <span className="text-sm font-semibold text-[#D4A843]">AI Estimate</span>
        </div>
        <span className="text-[11px] text-[#5E5A50]">Not a licensed appraisal</span>
      </div>

      <div className="mb-5">
        <div className="font-heading text-4xl font-bold text-[#F0EDE6]">$485,000</div>
        <div className="mt-1 text-sm text-[#9B9687]">Estimated market value</div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-[#5E5A50]">Confidence</span>
          <span className="font-semibold text-[#D4A843]">High (0.82)</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
          <div
            className="h-full rounded-full"
            style={{ width: '82%', background: 'linear-gradient(90deg, #D4A843, #F0D68A)' }}
            role="progressbar"
            aria-valuenow={82}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <p className="mb-5 text-xs text-[#5E5A50]">
        Based on 3 comparable sales within 0.5 miles · Updated 2 hours ago
      </p>

      <div className="space-y-2">
        {['Comparable properties (3)', 'Positive factors (4)', 'Risk factors (2)'].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-xl glass px-4 py-2.5">
            <span className="text-xs text-[#9B9687]">{item}</span>
            <ChevronRight className="h-3 w-3 text-[#5E5A50]" />
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl glass px-4 py-3" style={{ borderColor: 'rgba(212,168,67,0.15)' }}>
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-3 w-3 flex-shrink-0 text-[#D4A843]" />
          <span className="text-[#9B9687]">Full report: value range + comparables</span>
          <Link href="/pricing" className="ml-auto flex-shrink-0 font-semibold text-[#D4A843] hover:text-[#F0D68A]">
            TIGI Pro →
          </Link>
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
    <Link href={`/marketplace/${property.id}`}>
      <article className="group glass-card overflow-hidden">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <PlaceholderImage
            slot={property.imageSlot}
            propertyType={
              property.imageSlot.startsWith('residential') ? 'residential'
                : property.imageSlot.startsWith('commercial') ? 'commercial'
                  : 'land'
            }
            alt={property.title}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/60 via-transparent to-transparent" />

          {/* Type badge */}
          <span className="absolute left-3.5 top-3.5 rounded-full glass px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#9B9687]">
            {property.type}
          </span>

          {/* Yield badge */}
          <span className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[11px] font-semibold text-[#34D399]">
            <TrendingUp className="h-3 w-3" />
            {property.annualYield} yield
          </span>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-heading text-lg font-semibold mb-1 truncate transition-colors group-hover:text-[#D4A843]">
            {property.title}
          </h3>
          <p className="mb-5 text-sm text-[#5E5A50]">{property.location}</p>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-[#5E5A50]">Per fraction</p>
              <p className="font-semibold tabular-nums text-[#F0EDE6]">
                ${property.pricePerFraction.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#5E5A50]">Sold</p>
              <p className="font-semibold tabular-nums text-[#D4A843]">
                {property.soldPercent}%
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${property.soldPercent}%`,
                background: 'linear-gradient(90deg, #D4A843, #F0D68A)',
              }}
              role="progressbar"
              aria-valuenow={property.soldPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </article>
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
    icon: Compass,
    title: 'Explore',
    description: 'Browse tokenized properties across residential, commercial, and industrial asset classes — with AI valuations on every listing.',
    href: '/marketplace',
    ctaLabel: 'Browse properties',
    glowColor: 'rgba(45, 212, 191, 0.15)',
  },
  {
    key: 'invest',
    icon: TrendingUp,
    title: 'Invest',
    description: 'Purchase fractional ownership from $100. Build a diversified portfolio across cities, property types, and risk profiles.',
    href: '/invest',
    ctaLabel: 'Start investing',
    glowColor: 'rgba(212, 168, 67, 0.15)',
  },
  {
    key: 'land',
    icon: Map,
    title: 'Land',
    description: 'Lease agricultural plots, development sites, and commercial land. Earn from the ground up while developers build the future.',
    href: '/land',
    ctaLabel: 'Explore land',
    glowColor: 'rgba(34, 197, 94, 0.12)',
  },
  {
    key: 'legacy',
    icon: Landmark,
    title: 'Legacy',
    description: 'Designate beneficiaries for your holdings with conditional transfer rules. Digital estate planning for modern owners.',
    href: '/legacy',
    ctaLabel: 'Plan your estate',
    glowColor: 'rgba(139, 92, 246, 0.15)',
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
