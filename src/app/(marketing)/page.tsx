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
} from 'lucide-react'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { PLATFORM_STATS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// TIGI Homepage — /
// Sections:
//   1. Hero
//   2. Featured Properties (Marketplace)
//   3. Platform Areas (Invest · Land · Legacy · Insights)
//   4. AI Insights + Investing split
//   5. Land & Legacy showcase
//   6. Final CTA
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="animate-fade-in">
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
// 1. HERO
// =============================================================================

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden px-6 pb-24 pt-24 lg:px-8 lg:pb-32 lg:pt-36"
      style={{
        background: 'linear-gradient(160deg, #0A0A0F 0%, #10101A 55%, #14121E 100%)',
      }}
    >
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, #C9A84C 79px, #C9A84C 80px),
            repeating-linear-gradient(90deg, transparent, transparent 79px, #C9A84C 79px, #C9A84C 80px)`,
        }}
        aria-hidden="true"
      />

      {/* Radial glow behind headline */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Eyebrow */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#111118] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-widest text-[#A0A0B2]">
            Tokenized Real Estate
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-display mb-6 leading-[1.08]">
          Own the World&apos;s Most{' '}
          <br className="hidden sm:block" />
          <span className="text-gold-gradient">Valuable Asset Class</span>
          <br className="hidden sm:block" />
          — One Fraction at a Time.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#A0A0B2]">
          TIGI is the unified platform for fractional real estate investment, land
          leasing, and digital estate planning — with AI intelligence embedded in
          every decision.
        </p>

        {/* CTA group */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/marketplace"
            className="gold-glow inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-8 py-3.5 text-base font-semibold text-[#0A0A0F] transition-all duration-200 hover:bg-[#B8932F] active:scale-[0.98]"
          >
            Explore Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A3A] bg-transparent px-8 py-3.5 text-base font-semibold text-[#F5F5F7] transition-all duration-200 hover:border-[#C9A84C] hover:bg-[#111118] active:scale-[0.98]"
          >
            Start Investing Free
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 border-t border-[#1F1F2E] pt-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-2xl font-bold tabular-nums text-[#C9A84C]">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-[#6B6B80]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 2. FEATURED PROPERTIES — Marketplace preview
// =============================================================================

function FeaturedPropertiesSection() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-label mb-2">Featured Listings</p>
            <h2 className="text-h2">Properties Available Now</h2>
          </div>
          <Link
            href="/marketplace"
            className="hidden items-center gap-1.5 text-sm text-[#C9A84C] transition-colors hover:text-[#E8D590] sm:flex"
          >
            View all properties
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="stagger-children grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PROPERTIES.map((property) => (
            <FeaturedPropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm text-[#C9A84C] hover:text-[#E8D590]"
          >
            View all properties <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 3. PLATFORM AREAS — What you can do on TIGI
// =============================================================================

function PlatformAreasSection() {
  return (
    <section className="border-y border-[#1F1F2E] px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-14 text-center">
          <p className="text-label mb-3">One Platform</p>
          <h2 className="text-h2 mx-auto max-w-2xl">
            Every dimension of real estate, in one place
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#A0A0B2]">
            From fractional investing to land development, estate planning, and AI
            market intelligence — TIGI covers the full lifecycle.
          </p>
        </div>

        <div className="stagger-children grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_AREAS.map((area) => (
            <PlatformAreaCard key={area.key} area={area} />
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
  gradient: string
  ctaLabel: string
}

function PlatformAreaCard({ area }: { area: PlatformArea }) {
  return (
    <Link href={area.href} className="group block">
      <article
        className="relative h-full overflow-hidden rounded-xl border border-[#2A2A3A] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#C9A84C]/40 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{ background: area.gradient }}
      >
        {/* Subtle dot-pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#C9A84C 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
          aria-hidden="true"
        />

        <div className="relative p-6">
          {/* Icon */}
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[#2A2A3A] bg-[#0A0A0F]/60">
            <area.icon className="h-5 w-5 text-[#C9A84C]" />
          </div>

          {/* Text */}
          <h3 className="text-h4 mb-2 font-semibold">{area.title}</h3>
          <p className="text-sm leading-relaxed text-[#A0A0B2]">{area.description}</p>

          {/* CTA */}
          <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-[#6B6B80] transition-colors group-hover:text-[#C9A84C]">
            {area.ctaLabel}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </article>
    </Link>
  )
}

// =============================================================================
// 4. AI INSIGHTS + HOW INVESTING WORKS — 2-column split
// =============================================================================

function AiAndInvestSection() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left — AI valuation mock */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              {/* Property card context */}
              <div className="mb-4 overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118]">
                <div className="relative h-40">
                  <PlaceholderImage
                    slot="residential-1"
                    alt="Property valuation preview"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111118]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#F5F5F7]">Sunset Heights Condos</p>
                      <p className="text-xs text-[#A0A0B2]">Miami, FL · Residential</p>
                    </div>
                    <span className="rounded-md bg-[#0A0A0F]/80 px-2 py-0.5 text-xs text-[#A0A0B2] backdrop-blur-sm">
                      34% sold
                    </span>
                  </div>
                </div>
              </div>

              {/* AI valuation panel */}
              <MockAiValuationCard />
            </div>
          </div>

          {/* Right — Copy */}
          <div className="order-1 lg:order-2">
            <p className="text-label mb-3">AI Insights</p>
            <h2 className="text-h2 mb-5">
              Intelligence embedded in every decision
            </h2>
            <p className="mb-6 text-[#A0A0B2]">
              Every property on TIGI comes with an AI-estimated value, confidence
              score, and comparable sales analysis — so you never invest without
              context.
            </p>

            <ul className="mb-8 space-y-3">
              {AI_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C9A84C]" />
                  <span className="text-sm text-[#A0A0B2]">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4">
              <Link
                href="/insights"
                className="gold-glow inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-6 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#B8932F] active:scale-[0.98]"
              >
                Explore Insights
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-[#A0A0B2] transition-colors hover:text-[#F5F5F7]"
              >
                View AI plans →
              </Link>
            </div>
          </div>
        </div>

        {/* How investing works — below the 2-col */}
        <div className="mt-24 border-t border-[#1F1F2E] pt-24">
          <div className="mb-14 text-center">
            <p className="text-label mb-3">How It Works</p>
            <h2 className="text-h2">Invest in real estate from $100</h2>
            <p className="mx-auto mt-4 max-w-xl text-[#A0A0B2]">
              No wallets. No complexity. Just find a property you believe in and
              invest — your account handles the rest.
            </p>
          </div>

          <div className="stagger-children grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {/* Step connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    className="absolute left-[calc(50%+40px)] right-0 top-6 hidden h-px bg-gradient-to-r from-[#2A2A3A] to-transparent sm:block"
                    aria-hidden="true"
                  />
                )}

                {/* Step number */}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#2A2A3A] bg-[#111118]">
                  <span className="font-heading text-sm font-bold text-[#C9A84C]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Icon */}
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center">
                  <step.icon className="h-5 w-5 text-[#A0A0B2]" />
                </div>

                <h3 className="text-h4 mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#A0A0B2]">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A3A] px-6 py-2.5 text-sm font-semibold text-[#F5F5F7] transition-colors hover:border-[#C9A84C] hover:bg-[#111118]"
            >
              Get started — it&apos;s free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// 5. LAND & LEGACY — Feature showcase
// =============================================================================

function LandLegacySection() {
  return (
    <section className="border-t border-[#1F1F2E] px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-14 text-center">
          <p className="text-label mb-3">What Makes TIGI Different</p>
          <h2 className="text-h2">Beyond buying and selling</h2>
          <p className="mx-auto mt-4 max-w-xl text-[#A0A0B2]">
            TIGI extends into dimensions of real estate that no other platform
            touches — land development yield and digital estate planning.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Land card */}
          <FeatureShowcaseCard
            imageSlot="land-1"
            imageAlt="Land and development assets"
            eyebrow="Land & Development"
            heading="Lease land. Earn from the ground up."
            body="Access agricultural plots, commercial development sites, and raw land parcels. Generate ongoing yield through long-term lease agreements with builders, developers, and agricultural operators."
            href="/land"
            ctaLabel="Explore land assets"
            icon={Map}
          />

          {/* Legacy card */}
          <FeatureShowcaseCard
            imageSlot="residential-4"
            imageAlt="Legacy and estate planning"
            eyebrow="Legacy Planning"
            heading="Your assets. Your legacy."
            body="Designate beneficiaries for your token holdings with conditional transfer rules — time-based, inactivity-based, or manual. Digital estate planning that works the way property ownership should."
            href="/legacy"
            ctaLabel="Set up your estate plan"
            icon={Landmark}
          />
        </div>

        {/* Advisory notice */}
        <p className="mt-6 text-center text-xs text-[#6B6B80]">
          Digital estate planning is advisory. We recommend consulting a qualified
          legal professional for complex estate matters.
        </p>
      </div>
    </section>
  )
}

// Valid subset of PlaceholderImage's slot type — mirrors PLACEHOLDER_PHOTOS keys
type ShowcaseImageSlot =
  | 'residential-1'
  | 'residential-2'
  | 'residential-3'
  | 'residential-4'
  | 'commercial-1'
  | 'commercial-2'
  | 'land-1'
  | 'land-2'
  | 'hero-1'
  | 'hero-2'

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
  imageSlot,
  imageAlt,
  eyebrow,
  heading,
  body,
  href,
  ctaLabel,
  icon: Icon,
}: FeatureShowcaseCardProps) {
  const propertyType = imageSlot.startsWith('land')
    ? 'land'
    : imageSlot.startsWith('commercial')
      ? 'commercial'
      : 'residential'

  return (
    <Link href={href} className="group block">
      <article className="overflow-hidden rounded-2xl border border-[#2A2A3A] bg-[#111118] transition-all duration-200 group-hover:border-[#C9A84C]/30 group-hover:shadow-[0_12px_48px_rgba(0,0,0,0.5)]">
        {/* Image */}
        <div className="relative h-56 overflow-hidden lg:h-64">
          <PlaceholderImage
            slot={imageSlot}
            propertyType={propertyType}
            alt={imageAlt}
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-[#111118]/20 to-transparent" />

          {/* Eyebrow on image */}
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#0A0A0F]/80 px-3 py-1 backdrop-blur-sm">
            <Icon className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span className="text-xs font-medium text-[#A0A0B2]">{eyebrow}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-h3 mb-3">{heading}</h3>
          <p className="mb-5 text-sm leading-relaxed text-[#A0A0B2]">{body}</p>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#C9A84C] transition-colors group-hover:text-[#E8D590]">
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </article>
    </Link>
  )
}

// =============================================================================
// 6. FINAL CTA BANNER
// =============================================================================

function CtaBannerSection() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative overflow-hidden rounded-2xl border border-[#2A2A3A] bg-[#111118] px-8 py-16 text-center lg:px-16">
          {/* Gold top line */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-px w-64 -translate-x-1/2 opacity-60"
            style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }}
            aria-hidden="true"
          />

          {/* Background glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative">
            <p className="text-label mb-4">Start Today</p>
            <h2 className="text-h2 mx-auto mb-4 max-w-2xl">
              Ready to own your first fraction?
            </h2>
            <p className="mx-auto mb-10 max-w-md text-[#A0A0B2]">
              Join thousands of investors building real estate portfolios with
              TIGI — starting from $100, with AI intelligence at every step.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="gold-glow inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-8 py-3.5 text-base font-semibold text-[#0A0A0F] transition-all hover:bg-[#B8932F] active:scale-[0.98]"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A3A] px-8 py-3.5 text-base font-semibold text-[#F5F5F7] transition-all hover:border-[#C9A84C] hover:bg-[#1A1A24] active:scale-[0.98]"
              >
                Browse listings
              </Link>
            </div>

            <p className="mt-6 text-xs text-[#6B6B80]">
              No credit card required. Investments carry risk. See offering documents.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// MOCK UI COMPONENTS — built in JSX, show what the platform looks like
// =============================================================================

function MockAiValuationCard() {
  return (
    <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C9A84C]" />
          <span className="text-sm font-medium text-[#C9A84C]">AI Estimate</span>
        </div>
        <span className="text-[11px] text-[#6B6B80]">Not a licensed appraisal</span>
      </div>

      {/* Value */}
      <div className="mb-4">
        <div className="font-heading text-3xl font-bold text-[#F5F5F7]">$485,000</div>
        <div className="mt-0.5 text-sm text-[#A0A0B2]">Estimated market value</div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-[#6B6B80]">Confidence</span>
          <span className="font-medium text-[#C9A84C]">High (0.82)</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#22222E]">
          <div
            className="h-full rounded-full bg-[#C9A84C]"
            style={{ width: '82%' }}
            role="progressbar"
            aria-valuenow={82}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Basis */}
      <p className="mb-4 text-xs text-[#6B6B80]">
        Based on 3 comparable sales within 0.5 miles · Updated 2 hours ago
      </p>

      {/* Expandable rows */}
      <div className="space-y-1.5">
        {[
          'Comparable properties (3)',
          'Positive factors (4)',
          'Risk factors (2)',
        ].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-lg bg-[#1A1A24] px-3 py-2"
          >
            <span className="text-xs text-[#A0A0B2]">{item}</span>
            <ChevronRight className="h-3 w-3 text-[#6B6B80]" />
          </div>
        ))}
      </div>

      {/* Pro upsell */}
      <div className="mt-4 rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-3 w-3 flex-shrink-0 text-[#C9A84C]" />
          <span className="text-[#A0A0B2]">Full report: value range + comparables</span>
          <Link
            href="/pricing"
            className="ml-auto flex-shrink-0 font-medium text-[#C9A84C] hover:text-[#E8D590]"
          >
            TIGI Pro →
          </Link>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// FEATURED PROPERTY CARD — inline component for landing page
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
      <article className="group overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118] transition-all duration-200 hover:-translate-y-1 hover:border-[#C9A84C]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <PlaceholderImage
            slot={property.imageSlot}
            propertyType={
              property.imageSlot.startsWith('residential')
                ? 'residential'
                : property.imageSlot.startsWith('commercial')
                  ? 'commercial'
                  : 'land'
            }
            alt={property.title}
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/50 via-transparent to-transparent" />

          {/* Type badge */}
          <span className="absolute left-3 top-3 rounded-md bg-[#0A0A0F]/80 px-2 py-1 text-xs font-medium uppercase tracking-wider text-[#A0A0B2] backdrop-blur-sm">
            {property.type}
          </span>

          {/* Yield badge */}
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-[#0A0A0F]/80 px-2 py-1 text-xs font-medium text-[#22C55E] backdrop-blur-sm">
            <TrendingUp className="h-3 w-3" />
            {property.annualYield} yield
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-h4 mb-1 truncate transition-colors group-hover:text-[#C9A84C]">
            {property.title}
          </h3>
          <p className="mb-4 text-sm text-[#6B6B80]">{property.location}</p>

          {/* Metrics row */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-[#6B6B80]">Per fraction</p>
              <p className="font-semibold tabular-nums text-[#F5F5F7]">
                ${property.pricePerFraction.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6B6B80]">Sold</p>
              <p className="font-semibold tabular-nums text-[#C9A84C]">
                {property.soldPercent}%
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#22222E]">
            <div
              className="h-full rounded-full bg-[#C9A84C] transition-all"
              style={{ width: `${property.soldPercent}%` }}
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
// STATIC DATA — replaced by DB seed data from M3 onwards
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
    description:
      'Browse tokenized properties across residential, commercial, and industrial asset classes — with AI valuations on every listing.',
    href: '/marketplace',
    ctaLabel: 'Browse properties',
    gradient: 'linear-gradient(145deg, #0F1A24 0%, #0A0F18 100%)',
  },
  {
    key: 'invest',
    icon: TrendingUp,
    title: 'Invest',
    description:
      'Purchase fractional ownership from $100. Build a diversified portfolio across cities, property types, and risk profiles.',
    href: '/invest',
    ctaLabel: 'Start investing',
    gradient: 'linear-gradient(145deg, #14101E 0%, #1A1228 100%)',
  },
  {
    key: 'land',
    icon: Map,
    title: 'Land',
    description:
      'Lease agricultural plots, development sites, and commercial land. Earn from the ground up while developers build the future.',
    href: '/land',
    ctaLabel: 'Explore land',
    gradient: 'linear-gradient(145deg, #0C1810 0%, #101A0E 100%)',
  },
  {
    key: 'legacy',
    icon: Landmark,
    title: 'Legacy',
    description:
      'Designate beneficiaries for your holdings with conditional transfer rules. Digital estate planning, built for modern asset ownership.',
    href: '/legacy',
    ctaLabel: 'Plan your estate',
    gradient: 'linear-gradient(145deg, #1A0F0A 0%, #201510 100%)',
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
    description:
      'Browse hundreds of tokenized properties, filtered by type, price, location, and projected yield — all AI-valued.',
  },
  {
    icon: BarChart3,
    title: 'Invest',
    description:
      'Choose your amount. From $100. Confirm in one step. Your TIGI account handles settlement — no wallets required.',
  },
  {
    icon: TrendingUp,
    title: 'Grow',
    description:
      'Track your portfolio performance in real time. Diversify across property types and geographies as your capital grows.',
  },
]
