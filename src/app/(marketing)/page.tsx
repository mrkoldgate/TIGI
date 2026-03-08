import Link from 'next/link'
import { ArrowRight, Building2, TrendingUp, Shield, Zap } from 'lucide-react'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { PLATFORM_STATS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Landing Page — /
// Milestone 1: Foundation. Establishes brand, value prop, and primary CTA.
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient px-6 pb-24 pt-32 lg:px-8 lg:pb-32 lg:pt-40">
        {/* Subtle background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 79px,
              #C9A84C 79px,
              #C9A84C 80px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 79px,
              #C9A84C 79px,
              #C9A84C 80px
            )`,
          }}
        />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#111118] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
            <span className="text-xs font-medium uppercase tracking-widest text-[#A0A0B2]">
              Tokenized Real Estate
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-display mb-6">
            Own the World&apos;s Most{' '}
            <br className="hidden sm:block" />
            <span className="text-gold-gradient">Valuable Asset Class</span>
            <br className="hidden sm:block" />
            One Fraction at a Time.
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#A0A0B2]">
            TIGI makes real estate investment accessible to everyone. Browse tokenized
            properties, invest any amount, and build a diversified portfolio — powered
            by Solana and AI intelligence.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/marketplace"
              className="gold-glow inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-8 py-3.5 font-semibold text-[#0A0A0F] transition-all duration-200 hover:bg-[#B8932F] active:scale-[0.98]"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A3A] bg-transparent px-8 py-3.5 font-semibold text-[#F5F5F7] transition-all duration-200 hover:border-[#C9A84C] hover:bg-[#111118] active:scale-[0.98]"
            >
              Start Investing Free
            </Link>
          </div>

          {/* Platform stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-2xl font-700 tabular-nums text-[#C9A84C]">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-[#6B6B80]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Preview */}
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

          {/* Property card grid — 3 preview cards */}
          <div className="stagger-children grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROPERTIES.map((property) => (
              <FeaturedPropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="border-y border-[#1F1F2E] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-16 text-center">
            <p className="text-label mb-3">Why TIGI</p>
            <h2 className="text-h2">Real estate, reimagined.</h2>
          </div>

          <div className="stagger-children grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((prop) => (
              <div
                key={prop.title}
                className="card-base animate-slide-up rounded-xl border border-[#2A2A3A] bg-[#111118] p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A24] text-[#C9A84C]">
                  <prop.icon className="h-5 w-5" />
                </div>
                <h3 className="text-h4 mb-2">{prop.title}</h3>
                <p className="text-sm leading-relaxed text-[#A0A0B2]">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="relative overflow-hidden rounded-2xl border border-[#2A2A3A] bg-[#111118] p-12 text-center">
            {/* Gold accent glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-48 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

            <h2 className="text-h2 mb-4">
              Ready to own your first fraction?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-[#A0A0B2]">
              Join thousands of investors building real estate portfolios starting
              from $100.
            </p>
            <Link
              href="/auth/register"
              className="gold-glow inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-8 py-3.5 font-semibold text-[#0A0A0F] transition-all duration-200 hover:bg-[#B8932F] active:scale-[0.98]"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-4 text-xs text-[#6B6B80]">
              No credit card required. Investments carry risk. See offering documents.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Featured Property Card (inline — landing page only)
// ---------------------------------------------------------------------------

interface FeaturedProperty {
  id: string
  title: string
  location: string
  type: string
  pricePerFraction: number
  totalFractions: number
  soldPercent: number
  imageSlot: 'residential-1' | 'commercial-1' | 'land-1'
}

function FeaturedPropertyCard({ property }: { property: FeaturedProperty }) {
  return (
    <Link href={`/marketplace/${property.id}`}>
      <article className="card-interactive card-base animate-slide-up group overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118]">
        {/* Image */}
        <div className="relative -mx-4 -mt-4 mb-4 h-48 overflow-hidden">
          <PlaceholderImage
            slot={property.imageSlot}
            alt={property.title}
            className="h-full w-full"
          />
          {/* Type badge */}
          <span className="absolute left-3 top-3 rounded-md bg-[#0A0A0F]/80 px-2 py-1 text-xs font-medium uppercase tracking-wider text-[#A0A0B2] backdrop-blur-sm">
            {property.type}
          </span>
        </div>

        {/* Info */}
        <div>
          <h3 className="text-h4 mb-1 truncate group-hover:text-[#C9A84C] transition-colors">
            {property.title}
          </h3>
          <p className="mb-4 text-sm text-[#6B6B80]">{property.location}</p>

          {/* Fraction info */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-[#6B6B80]">Per fraction</p>
              <p className="font-semibold tabular-nums text-[#F5F5F7]">
                ${property.pricePerFraction.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#6B6B80]">Sold</p>
              <p className="font-semibold tabular-nums text-[#C9A84C]">
                {property.soldPercent}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#22222E]">
            <div
              className="h-full rounded-full bg-[#C9A84C] transition-all"
              style={{ width: `${property.soldPercent}%` }}
            />
          </div>
        </div>
      </article>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Static data — will be replaced by DB seed data in M3
// ---------------------------------------------------------------------------

const FEATURED_PROPERTIES: FeaturedProperty[] = [
  {
    id: 'prop-001',
    title: 'Sunset Heights Condos',
    location: 'Miami, FL',
    type: 'Residential',
    pricePerFraction: 485,
    totalFractions: 1000,
    soldPercent: 34,
    imageSlot: 'residential-1',
  },
  {
    id: 'prop-002',
    title: 'Harbor Commerce Center',
    location: 'Austin, TX',
    type: 'Commercial',
    pricePerFraction: 1200,
    totalFractions: 500,
    soldPercent: 61,
    imageSlot: 'commercial-1',
  },
  {
    id: 'prop-003',
    title: 'Pacific Rim Land Parcel',
    location: 'Scottsdale, AZ',
    type: 'Land',
    pricePerFraction: 250,
    totalFractions: 2000,
    soldPercent: 12,
    imageSlot: 'land-1',
  },
]

const VALUE_PROPS = [
  {
    icon: Building2,
    title: 'Fractional Ownership',
    description:
      'Invest in premium properties from $100. Own a slice of assets that were previously out of reach.',
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description:
      'Transactions settle in seconds, not months. Powered by Solana for near-instant confirmation.',
  },
  {
    icon: TrendingUp,
    title: 'AI Intelligence',
    description:
      'Every property is AI-valued with confidence scores, market comps, and risk analysis built in.',
  },
  {
    icon: Shield,
    title: 'Compliance First',
    description:
      'KYC verification, audit trails, and regulatory scaffolding built into every transaction from day one.',
  },
]
