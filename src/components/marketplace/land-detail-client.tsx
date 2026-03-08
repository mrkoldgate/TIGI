'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSavedListings } from '@/lib/saved/saved-context'
import {
  ArrowLeft,
  MapPin,
  Zap,
  Heart,
  Share2,
  TrendingUp,
  Users,
  ChevronRight,
  FileText,
  Eye,
  Clock,
  Check,
  Phone,
  LayoutGrid,
  Layers,
  Compass,
  TreePine,
  Ruler,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { MarketplaceLandCard, inferLandUse, inferDevOpportunity } from '@/components/marketplace/land-card'
import { type LandUseType } from '@/components/land/land-card'
import { ValuationPanel } from '@/components/valuation/valuation-panel'
import { getMockValuation } from '@/lib/valuation/mock-valuations'
import {
  type MockListing,
  formatPrice,
  tokenSoldPercent,
} from '@/lib/marketplace/mock-data'

// ---------------------------------------------------------------------------
// Land use config — labels, descriptions, color tokens
// ---------------------------------------------------------------------------

const LAND_USE_CONFIG: Record<
  LandUseType,
  { label: string; description: string; badgeClass: string; dotClass: string; accentColor: string }
> = {
  AGRICULTURAL: {
    label: 'Agricultural',
    description: 'Designated for farming, ranching, and agricultural production. May include water rights, crop cultivation, and livestock operations.',
    badgeClass: 'bg-[#166534]/20 text-[#4ADE80] ring-[#22C55E]/25',
    dotClass: 'bg-[#4ADE80]',
    accentColor: '#4ADE80',
  },
  RESIDENTIAL_DEV: {
    label: 'Residential Dev.',
    description: 'Zoned for residential development. Suitable for single-family homes, multi-family projects, or planned unit developments pending entitlements.',
    badgeClass: 'bg-[#1D4ED8]/15 text-[#93C5FD] ring-[#3B82F6]/25',
    dotClass: 'bg-[#93C5FD]',
    accentColor: '#93C5FD',
  },
  COMMERCIAL_DEV: {
    label: 'Commercial Dev.',
    description: 'Approved for commercial and mixed-use development. Suitable for retail, office, hospitality, or mixed-use projects.',
    badgeClass: 'bg-[#C9A84C]/15 text-[#C9A84C] ring-[#C9A84C]/25',
    dotClass: 'bg-[#C9A84C]',
    accentColor: '#C9A84C',
  },
  INDUSTRIAL: {
    label: 'Industrial',
    description: 'Zoned for industrial operations including manufacturing, warehousing, distribution, and heavy-use facilities.',
    badgeClass: 'bg-[#92400E]/20 text-[#FCD34D] ring-[#F59E0B]/25',
    dotClass: 'bg-[#FCD34D]',
    accentColor: '#FCD34D',
  },
  MIXED_USE: {
    label: 'Mixed Use',
    description: 'Flexible zoning permitting residential, commercial, and retail development within the same parcel or project.',
    badgeClass: 'bg-[#4C1D95]/20 text-[#C4B5FD] ring-[#7C3AED]/25',
    dotClass: 'bg-[#C4B5FD]',
    accentColor: '#C4B5FD',
  },
  RECREATIONAL: {
    label: 'Recreational',
    description: 'Designated for recreational activities, vacation rental development, outdoor hospitality, and tourism-related uses.',
    badgeClass: 'bg-[#065F46]/20 text-[#6EE7B7] ring-[#10B981]/25',
    dotClass: 'bg-[#6EE7B7]',
    accentColor: '#6EE7B7',
  },
  WATERFRONT: {
    label: 'Waterfront',
    description: 'Parcel with direct water access or frontage. Subject to coastal, riparian, or waterway regulations.',
    badgeClass: 'bg-[#0C4A6E]/20 text-[#7DD3FC] ring-[#0EA5E9]/25',
    dotClass: 'bg-[#7DD3FC]',
    accentColor: '#7DD3FC',
  },
  RURAL: {
    label: 'Rural',
    description: 'Large-acreage rural land suitable for grazing, hunting leases, timber production, or conservation easements.',
    badgeClass: 'bg-[#1E293B]/80 text-[#94A3B8] ring-[#334155]/60',
    dotClass: 'bg-[#94A3B8]',
    accentColor: '#94A3B8',
  },
}

// ---------------------------------------------------------------------------
// Infrastructure & permitted use inference (mock-only heuristics)
// ---------------------------------------------------------------------------

interface InfraItem { label: string; available: boolean }

function inferInfrastructure(features: string[]): InfraItem[] {
  const lower = features.map((f) => f.toLowerCase()).join(' ')
  const check = (kw: string) => lower.includes(kw)
  return [
    { label: 'Utilities on site',     available: check('utilities at site') },
    { label: 'Utilities at road',     available: check('utilities at road') || check('at road') },
    { label: 'Road / site access',    available: check('road access') || check('graded') || check('transit adjacent') },
    { label: 'Water rights',          available: check('water rights') || check('irrigation') },
    { label: 'Site graded & cleared', available: check('graded') || check('shovel-ready') || check('graded & ready') },
    { label: 'Entitlements filed',    available: check('permits') || check('shovel-ready') || check('zoning') },
  ].filter((i) => i.available || i.label === 'Road / site access') // always show access
}

function inferPermittedUses(features: string[], landUse: LandUseType): string[] {
  const lower = features.map((f) => f.toLowerCase()).join(' ')
  const uses: string[] = []

  const USE_MAP: [string, string][] = [
    ['agricultural',  'Agricultural production'],
    ['vineyard',      'Viticulture & winery operations'],
    ['irrigation',    'Irrigated farming'],
    ['water rights',  'Water extraction & irrigation rights'],
    ['cattle',        'Livestock grazing'],
    ['grazing',       'Livestock grazing'],
    ['hunting',       'Hunting & wildlife management'],
    ['mixed-use',     'Mixed residential & commercial development'],
    ['buildable',     'Residential or commercial construction'],
    ['septic',        'On-site septic development'],
    ['vacation rental','Short-term / vacation rental'],
    ['industrial',    'Industrial operations & manufacturing'],
    ['rail spur',     'Rail-served industrial logistics'],
    ['transit',       'Transit-oriented development'],
    ['ocean frontage','Waterfront residential or hospitality'],
    ['waterfront',    'Waterfront development'],
    ['conservation',  'Conservation easement'],
  ]

  for (const [kw, use] of USE_MAP) {
    if (lower.includes(kw) && !uses.includes(use)) uses.push(use)
  }

  // Fallback by land use type
  if (uses.length === 0) {
    const fallbacks: Record<LandUseType, string[]> = {
      AGRICULTURAL:    ['General farming & agricultural use'],
      RESIDENTIAL_DEV: ['Residential development (subject to entitlement)'],
      COMMERCIAL_DEV:  ['Commercial development (subject to entitlement)'],
      INDUSTRIAL:      ['Industrial & logistics operations'],
      MIXED_USE:       ['Mixed-use residential & commercial'],
      RECREATIONAL:    ['Recreational & outdoor activities'],
      WATERFRONT:      ['Waterfront development & recreation'],
      RURAL:           ['Grazing, hunting & rural activities'],
    }
    return fallbacks[landUse] ?? []
  }
  return [...new Set(uses)]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAcres(acres: number): string {
  if (acres >= 1000) return `${(acres / 1000).toFixed(1)}K`
  if (acres >= 100)  return `${Math.round(acres)}`
  if (acres % 1 === 0) return `${acres}`
  return `${acres.toFixed(1)}`
}

function formatPricePerAcre(price: number, acres: number): string {
  if (acres <= 0) return '—'
  const ppa = price / acres
  return formatPrice(Math.round(ppa))
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}


// ---------------------------------------------------------------------------
// Gallery — panoramic hero + thumbnail strip
// ---------------------------------------------------------------------------

const LAND_SLOTS = ['land-1', 'land-2', 'land-3']

function getLandGallerySlots(listing: MockListing): string[] {
  const rest = LAND_SLOTS.filter((s) => s !== listing.imageSlot)
  return [listing.imageSlot, ...rest]
}

function LandGallery({ listing }: { listing: MockListing }) {
  const slots = getLandGallerySlots(listing)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className="space-y-2 overflow-hidden rounded-2xl">
      {/* Panoramic hero — full width */}
      <div className="relative overflow-hidden rounded-2xl">
        <PlaceholderImage
          slot={slots[0]}
          propertyType="land"
          alt={listing.title}
          className="aspect-[21/9] w-full transition-transform duration-700 md:aspect-[3/1]"
          priority
        />
        {/* Bottom gradient blends into the page */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/60 via-[#0A0A0F]/10 to-transparent" />

        {/* Photo count badge */}
        {slots.length > 1 && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-[#0D110D]/85 px-3 py-1.5 text-xs font-medium text-[#E8F0E8] backdrop-blur-sm ring-1 ring-[#1E2D1E] transition hover:bg-[#0D110D]"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {slots.length} photos
          </button>
        )}
      </div>

      {/* Thumbnail strip — desktop only */}
      {slots.length > 1 && (
        <div className="hidden grid-cols-3 gap-2 md:grid">
          {slots.slice(1, 4).map((slot, i) => (
            <div
              key={slot}
              className="relative overflow-hidden rounded-xl"
            >
              <PlaceholderImage
                slot={slot}
                propertyType="land"
                alt={`${listing.title} — view ${i + 2}`}
                className="aspect-[16/7] w-full cursor-pointer transition-transform duration-500 hover:scale-[1.03]"
              />
              {/* Last thumb: "view all" overlay when there are more */}
              {i === 1 && slots.length > 3 && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]/60"
                >
                  <span className="text-sm font-medium text-[#E8F0E8]">+{slots.length - 3} more</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox placeholder */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]/95 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <p className="text-[#5A7060]">Gallery lightbox coming soon.</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Land header — title, badges, and acreage data hero
// ---------------------------------------------------------------------------

function LandUseBadge({ landUse, large }: { landUse: LandUseType; large?: boolean }) {
  const config = LAND_USE_CONFIG[landUse]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md font-medium ring-1 ring-inset',
      large ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]',
      config.badgeClass,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}

function AcreageHeroBlock({ listing, landUse }: { listing: MockListing; landUse: LandUseType }) {
  const acres = listing.lotAcres ?? 0
  const config = LAND_USE_CONFIG[landUse]

  const stats = [
    { value: formatAcres(acres), unit: 'ACRES', accent: true },
    { value: formatPrice(listing.price), unit: 'LIST PRICE', accent: false },
    ...(acres > 0 ? [{ value: formatPricePerAcre(listing.price, acres), unit: 'PER ACRE', accent: false }] : []),
  ]

  return (
    <div className="flex divide-x divide-[#1E2D1E] overflow-hidden rounded-xl border border-[#1E2D1E] bg-[#0D110D]">
      {stats.map(({ value, unit, accent }) => (
        <div key={unit} className="flex flex-1 flex-col items-center justify-center px-4 py-4">
          <span
            className="font-heading text-2xl font-bold tabular-nums"
            style={{ color: accent ? config.accentColor : '#F5F5F7' }}
          >
            {value}
          </span>
          <span className="mt-0.5 text-[9px] uppercase tracking-widest text-[#4A6A4A]">{unit}</span>
        </div>
      ))}
    </div>
  )
}

function LandHeader({
  listing,
  landUse,
  isDevOpportunity,
  isSaved,
  onSave,
}: {
  listing: MockListing
  landUse: LandUseType
  isDevOpportunity: boolean
  isSaved: boolean
  onSave: () => void
}) {
  const listed = daysAgo(listing.createdAt)

  return (
    <div className="space-y-4">
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-2">
        <LandUseBadge landUse={landUse} large />
        {isDevOpportunity && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#166534]/25 px-3 py-1 text-xs font-semibold text-[#4ADE80] ring-1 ring-inset ring-[#22C55E]/30">
            <Layers className="h-3 w-3" />
            Dev. Opportunity
          </span>
        )}
        {listing.isTokenized && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#C9A84C]/15 px-3 py-1 text-xs font-medium text-[#C9A84C] ring-1 ring-inset ring-[#C9A84C]/25">
            <Zap className="h-3 w-3" />
            Tokenized
          </span>
        )}
        {listing.listingType !== 'BUY' && (
          <span className="inline-flex items-center rounded-md bg-[#3B82F6]/15 px-3 py-1 text-xs font-medium text-[#60A5FA] ring-1 ring-inset ring-[#3B82F6]/25">
            {listing.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
          </span>
        )}
      </div>

      {/* Title + save/share */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold leading-snug text-[#E8F0E8] sm:text-3xl">
          {listing.title}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={isSaved ? 'Remove from saved' : 'Save parcel'}
            onClick={onSave}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1E2D1E] bg-[#0D110D] transition-all hover:border-[#4ADE80]/30 hover:bg-[#111D11]"
          >
            <Heart className={cn('h-4 w-4 transition-colors', isSaved ? 'fill-rose-400 text-rose-400' : 'text-[#5A7060]')} />
          </button>
          <button
            type="button"
            aria-label="Share"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1E2D1E] bg-[#0D110D] transition-all hover:border-[#4ADE80]/30 hover:bg-[#111D11]"
          >
            <Share2 className="h-4 w-4 text-[#5A7060]" />
          </button>
        </div>
      </div>

      {/* Location + meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#5A7060]">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3A5A3A]" />
          {listing.city}, {listing.state}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#3A5A3A]" />
          Listed {listed === 0 ? 'today' : `${listed}d ago`}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-[#3A5A3A]" />
          {listing.viewCount.toLocaleString()} views
        </span>
      </div>

      {/* Acreage hero block */}
      <AcreageHeroBlock listing={listing} landUse={landUse} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function BreadcrumbNav({ listing }: { listing: MockListing }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#5A7060]">
      <Link
        href="/marketplace"
        className="flex items-center gap-1 transition-colors hover:text-[#8A9E8A]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Marketplace
      </Link>
      <ChevronRight className="h-3 w-3" />
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/marketplace?category=LAND'
          }
        }}
        className="transition-colors hover:text-[#8A9E8A]"
      >
        Land & Development
      </button>
      <ChevronRight className="h-3 w-3" />
      <span className="text-[#8A9E8A]">{listing.city}, {listing.state}</span>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Tab content
// ---------------------------------------------------------------------------

type LandTab = 'overview' | 'zoning' | 'documents' | 'similar'

const LAND_DOCUMENTS = [
  { name: 'Parcel Deed & Title',        type: 'Legal',      status: 'available'     },
  { name: 'Survey & Boundary Report',   type: 'Survey',     status: 'available'     },
  { name: 'Zoning Classification',      type: 'Regulatory', status: 'available'     },
  { name: 'Soil Assessment Report',     type: 'Assessment', status: 'available'     },
  { name: 'Environmental Phase I',      type: 'Assessment', status: 'pending'       },
  { name: 'Topographic Survey',         type: 'Survey',     status: 'pending'       },
  { name: 'Water Rights Documentation', type: 'Legal',      status: 'not_available' },
  { name: 'Mineral Rights Record',      type: 'Legal',      status: 'not_available' },
] as const

function FeatureChip({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#1E2D1E] bg-[#0D110D] px-3 py-2.5 text-sm">
      <Check className="h-3.5 w-3.5 shrink-0 text-[#4ADE80]" />
      <span className="text-[#8A9E8A]">{label}</span>
    </div>
  )
}

function OverviewTab({ listing }: { listing: MockListing }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-heading text-base font-semibold text-[#E8F0E8]">About this parcel</h2>
        <p className="text-sm leading-relaxed text-[#8A9E8A]">{listing.description}</p>
      </section>

      {listing.features.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold text-[#E8F0E8]">Key attributes</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {listing.features.map((f) => <FeatureChip key={f} label={f} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-heading text-base font-semibold text-[#E8F0E8]">Location context</h2>
        <div className="flex items-start gap-3 rounded-xl border border-[#1E2D1E] bg-[#0D110D] p-4">
          <Compass className="mt-0.5 h-4 w-4 shrink-0 text-[#4ADE80]" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-[#E8F0E8]">{listing.city}, {listing.state}</p>
            <p className="text-[#5A7060]">
              Proximity data, drive-time analysis, and regional market context will be available when mapping services are integrated.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ZoningTab({
  listing,
  landUse,
  isDevOpportunity,
}: {
  listing: MockListing
  landUse: LandUseType
  isDevOpportunity: boolean
}) {
  const config = LAND_USE_CONFIG[landUse]
  const permittedUses = inferPermittedUses(listing.features, landUse)
  const infrastructure = inferInfrastructure(listing.features)

  return (
    <div className="space-y-8">
      {/* Land use type card */}
      <section>
        <h2 className="mb-3 font-heading text-base font-semibold text-[#E8F0E8]">Land Use Classification</h2>
        <div className="rounded-xl border border-[#1E2D1E] bg-[#0D110D] p-4">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl ring-1"
              style={{ backgroundColor: `${config.accentColor}18`, ringColor: `${config.accentColor}30` }}
            >
              <TreePine className="h-4 w-4" style={{ color: config.accentColor }} />
            </span>
            <div>
              <p className="font-heading text-sm font-semibold text-[#E8F0E8]">{config.label}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#4A6A4A]">Primary classification</p>
            </div>
            <span className="ml-auto">
              <LandUseBadge landUse={landUse} />
            </span>
          </div>
          <p className="text-sm text-[#8A9E8A]">{config.description}</p>
        </div>
      </section>

      {/* Permitted uses */}
      {permittedUses.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold text-[#E8F0E8]">Permitted Uses</h2>
          <div className="space-y-2">
            {permittedUses.map((use) => (
              <div key={use} className="flex items-center gap-2.5 rounded-lg border border-[#1E2D1E] bg-[#0D110D] px-3 py-2.5">
                <Check className="h-3.5 w-3.5 shrink-0 text-[#4ADE80]" />
                <span className="text-sm text-[#8A9E8A]">{use}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Infrastructure */}
      <section>
        <h2 className="mb-3 font-heading text-base font-semibold text-[#E8F0E8]">Infrastructure & Site Readiness</h2>
        <div className="divide-y divide-[#1A2B1A] overflow-hidden rounded-xl border border-[#1E2D1E]">
          {infrastructure.map(({ label, available }) => (
            <div key={label} className="flex items-center justify-between bg-[#0D110D] px-4 py-3">
              <span className="text-sm text-[#8A9E8A]">{label}</span>
              <span className={cn(
                'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset',
                available
                  ? 'bg-[#22C55E]/10 text-[#4ADE80] ring-[#22C55E]/20'
                  : 'bg-[#1A2B1A] text-[#4A6A4A] ring-[#1E2D1E]',
              )}>
                {available ? <Check className="h-2.5 w-2.5" /> : null}
                {available ? 'Confirmed' : 'Not confirmed'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Development opportunity */}
      {isDevOpportunity && (
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold text-[#E8F0E8]">Development Opportunity</h2>
          <div className="rounded-xl border border-[#22C55E]/20 bg-[#0D110D] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#4ADE80]" />
              <span className="text-sm font-semibold text-[#4ADE80]">Active Development Signals</span>
            </div>
            <p className="mb-3 text-sm text-[#8A9E8A]">
              This parcel exhibits one or more attributes that indicate development readiness or active entitlement. Buyers should conduct independent due diligence on permitting status and timelines.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#5A7060]">
              {[
                'Verify zoning with local authority',
                'Confirm utility connection costs',
                'Review grading & survey reports',
                'Engage land use attorney',
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-1.5">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[#4ADE80]" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regulatory notice */}
      <div className="rounded-xl border border-[#1E2D1E] bg-[#0D110D] px-4 py-3">
        <p className="text-[11px] leading-relaxed text-[#4A6A4A]">
          Zoning classifications and permitted uses shown are inferred from listing attributes and are not a substitute for official municipal records. Always verify with the relevant local planning authority before making acquisition or development decisions.
        </p>
      </div>
    </div>
  )
}

function DocumentsTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#5A7060]">
        Documents are assembled by TIGI as part of the land due diligence package. Full access is granted after completing buyer verification or submitting a letter of intent.
      </p>
      <div className="divide-y divide-[#1A2B1A] overflow-hidden rounded-xl border border-[#1E2D1E]">
        {LAND_DOCUMENTS.map((doc) => (
          <div key={doc.name} className="flex items-center justify-between gap-4 bg-[#0D110D] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111D11]">
                <FileText className="h-4 w-4 text-[#4A6A4A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#E8F0E8]">{doc.name}</p>
                <p className="text-[11px] text-[#4A6A4A]">{doc.type}</p>
              </div>
            </div>
            <span className={cn(
              'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset',
              doc.status === 'available'     && 'bg-[#22C55E]/10 text-[#4ADE80] ring-[#22C55E]/20',
              doc.status === 'pending'       && 'bg-[#F59E0B]/10 text-[#FCD34D] ring-[#F59E0B]/20',
              doc.status === 'not_available' && 'bg-[#1A2B1A] text-[#4A6A4A] ring-[#1E2D1E]',
            )}>
              {doc.status === 'available'     ? 'Available'     : null}
              {doc.status === 'pending'       ? 'Pending'       : null}
              {doc.status === 'not_available' ? 'Not available' : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SimilarTab({
  listing,
  allListings,
  landUse,
}: {
  listing: MockListing
  allListings: MockListing[]
  landUse: LandUseType
}) {
  // Same land use first, then any land parcel by price proximity
  const sameLandUse = allListings.filter((l) =>
    l.id !== listing.id &&
    l.propertyType === 'LAND' &&
    l.status === 'ACTIVE' &&
    inferLandUse(l.features) === landUse,
  )
  const otherLand = allListings.filter((l) =>
    l.id !== listing.id &&
    l.propertyType === 'LAND' &&
    l.status === 'ACTIVE' &&
    inferLandUse(l.features) !== landUse,
  ).sort((a, b) => Math.abs(a.price - listing.price) - Math.abs(b.price - listing.price))

  const similar = [...sameLandUse, ...otherLand].slice(0, 3)

  if (similar.length === 0) {
    return <p className="py-8 text-center text-sm text-[#5A7060]">No similar land parcels available right now.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {similar.map((l, i) => (
        <MarketplaceLandCard key={l.id} listing={l} index={i} />
      ))}
    </div>
  )
}

function LandDetailTabs({
  listing,
  allListings,
  landUse,
  isDevOpportunity,
}: {
  listing: MockListing
  allListings: MockListing[]
  landUse: LandUseType
  isDevOpportunity: boolean
}) {
  const [activeTab, setActiveTab] = useState<LandTab>('overview')

  const tabs: { key: LandTab; label: string }[] = [
    { key: 'overview', label: 'Overview'      },
    { key: 'zoning',   label: 'Zoning & Use'  },
    { key: 'documents', label: 'Documents'    },
    { key: 'similar',   label: 'Similar'      },
  ]

  return (
    <div>
      <div className="flex overflow-x-auto border-b border-[#1E2D1E] scrollbar-none">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              'relative shrink-0 px-5 py-3 text-sm font-medium transition-colors duration-150',
              activeTab === key ? 'text-[#4ADE80]' : 'text-[#5A7060] hover:text-[#8A9E8A]',
            )}
          >
            {label}
            {activeTab === key && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-[#4ADE80]" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'overview'  && <OverviewTab listing={listing} />}
        {activeTab === 'zoning'    && <ZoningTab listing={listing} landUse={landUse} isDevOpportunity={isDevOpportunity} />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'similar'   && <SimilarTab listing={listing} allListings={allListings} landUse={landUse} />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Action panel — sticky right column
// ---------------------------------------------------------------------------

function LandMetricsGrid({ listing, landUse }: { listing: MockListing; landUse: LandUseType }) {
  const config = LAND_USE_CONFIG[landUse]
  const acres = listing.lotAcres ?? 0

  const items = [
    ...(acres > 0 ? [{
      icon: <Ruler className="h-3.5 w-3.5" />,
      label: 'Acres',
      value: formatAcres(acres),
    }] : []),
    ...(acres > 0 ? [{
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      label: 'Per acre',
      value: formatPricePerAcre(listing.price, acres),
    }] : []),
    {
      icon: <TreePine className="h-3.5 w-3.5" />,
      label: 'Land use',
      value: config.label,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ icon, label, value }) => (
        <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-[#1E2D1E] bg-[#0D110D] py-3 text-center">
          <span className="text-[#3A5A3A]">{icon}</span>
          <span className="font-heading text-sm font-semibold text-[#E8F0E8] leading-tight">{value}</span>
          <span className="text-[9px] uppercase tracking-wider text-[#4A6A4A]">{label}</span>
        </div>
      ))}
    </div>
  )
}

function DevOpportunityPanel({ listing, isDevOpportunity }: { listing: MockListing; isDevOpportunity: boolean }) {
  if (!isDevOpportunity) return null

  const signals = listing.features.filter((f) => {
    const lower = f.toLowerCase()
    return (
      lower.includes('zoning') ||
      lower.includes('graded') ||
      lower.includes('shovel') ||
      lower.includes('buildable') ||
      lower.includes('permits') ||
      lower.includes('utilities') ||
      lower.includes('transit') ||
      lower.includes('rail spur')
    )
  })

  return (
    <div className="rounded-xl border border-[#22C55E]/25 bg-[#0D110D] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Layers className="h-3.5 w-3.5 text-[#4ADE80]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4ADE80]">
          Development Opportunity
        </span>
      </div>
      {signals.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {signals.map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs text-[#8A9E8A]">
              <Check className="h-3 w-3 shrink-0 text-[#4ADE80]" />
              {s}
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] leading-relaxed text-[#4A6A4A]">
        Development signals identified from listing attributes. Verify entitlement status with local planning authority.
      </p>
    </div>
  )
}

function InvestmentPanel({ listing }: { listing: MockListing }) {
  if (!listing.isTokenized || !listing.tokenTotalSupply || !listing.tokenPricePerFraction) return null

  const soldPct = tokenSoldPercent(listing)
  const available = listing.tokenAvailableSupply ?? 0

  return (
    <div className="rounded-xl border border-[#C9A84C]/20 bg-[#0D110D] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-[#C9A84C]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A84C]">
          Fractional Ownership
        </span>
      </div>
      <div className="mb-4">
        <p className="text-[10px] text-[#4A6A4A]">Entry from</p>
        <p className="font-heading text-2xl font-bold text-[#C9A84C]">
          ${listing.tokenPricePerFraction.toLocaleString()}
          <span className="text-sm font-normal text-[#5A7060]">/fraction</span>
        </p>
      </div>
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-[#5A7060]">{soldPct}% subscribed</span>
          <span className="text-[#5A7060]">{available.toLocaleString()} available</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#1A2B1A]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#166534] to-[#4ADE80] transition-all duration-700"
            style={{ width: `${soldPct}%` }}
          />
        </div>
      </div>
      {listing.tokenInvestorCount != null && (
        <div className="mb-4 flex items-center gap-1.5 text-xs text-[#5A7060]">
          <Users className="h-3.5 w-3.5" />
          <span>
            <span className="font-medium text-[#8A9E8A]">{listing.tokenInvestorCount}</span> investors have participated
          </span>
        </div>
      )}
      <button
        type="button"
        className="w-full rounded-xl bg-[#C9A84C]/15 py-2.5 text-sm font-medium text-[#C9A84C] ring-1 ring-inset ring-[#C9A84C]/25 transition-all hover:bg-[#C9A84C]/25 active:scale-[0.98]"
      >
        <Zap className="mr-1.5 inline h-3.5 w-3.5" />
        Invest from ${listing.tokenPricePerFraction.toLocaleString()}
      </button>
      <p className="mt-2.5 text-[10px] leading-relaxed text-[#4A6A4A]">
        Fractional tokens represent proportional economic interest. Not a securities offering. See disclosures.
      </p>
    </div>
  )
}

function LandActionPanel({
  listing,
  landUse,
  isDevOpportunity,
  isSaved,
  onSave,
}: {
  listing: MockListing
  landUse: LandUseType
  isDevOpportunity: boolean
  isSaved: boolean
  onSave: () => void
}) {
  const primaryLabel =
    listing.listingType === 'BUY'   ? 'Acquire Land'       :
    listing.listingType === 'LEASE' ? 'Lease Parcel'        :
    'Acquire or Lease'

  const acres = listing.lotAcres ?? 0

  return (
    <div className="space-y-4">
      {/* Price card */}
      <div className="rounded-2xl border border-[#1E2D1E] bg-[#0D110D] p-5">
        <p className="text-[10px] uppercase tracking-widest text-[#4A6A4A]">List Price</p>
        <p className="mt-1 font-heading text-3xl font-bold text-[#E8F0E8]">
          {formatPrice(listing.price)}
        </p>
        {acres > 0 && (
          <p className="mt-0.5 text-sm text-[#5A7060]">
            {formatPricePerAcre(listing.price, acres)}
            <span className="text-xs"> per acre</span>
          </p>
        )}
        {listing.isTokenized && listing.tokenPricePerFraction && (
          <p className="mt-0.5 text-sm text-[#C9A84C]">
            from ${listing.tokenPricePerFraction.toLocaleString()}
            <span className="text-xs text-[#5A7060]">/fraction</span>
          </p>
        )}

        {/* Primary CTA */}
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-[#C9A84C] py-3 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B55A] active:scale-[0.98]"
        >
          {primaryLabel}
        </button>

        {/* Site visit */}
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#1E2D1E] py-2.5 text-sm font-medium text-[#8A9E8A] transition-all hover:border-[#2A3A2A] hover:text-[#E8F0E8] active:scale-[0.98]"
        >
          <Phone className="h-4 w-4" />
          Schedule Site Visit
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          className={cn(
            'mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all active:scale-[0.98]',
            isSaved
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
              : 'border-[#1E2D1E] text-[#5A7060] hover:border-[#2A3A2A] hover:text-[#E8F0E8]',
          )}
        >
          <Heart className={cn('h-4 w-4', isSaved && 'fill-rose-400')} />
          {isSaved ? 'Saved' : 'Save parcel'}
        </button>
      </div>

      {/* Land metrics grid */}
      <LandMetricsGrid listing={listing} landUse={landUse} />

      {/* Dev opportunity */}
      <DevOpportunityPanel listing={listing} isDevOpportunity={isDevOpportunity} />

      {/* Fractional investment */}
      <InvestmentPanel listing={listing} />

      {/* AI valuation */}
      {listing.aiEstimatedValue && (
        <ValuationPanel
          listPrice={listing.price}
          estimatedValue={listing.aiEstimatedValue}
          confidence={listing.aiConfidence ?? 'LOW'}
          valuation={getMockValuation(listing.id)}
          assetType="land"
          lotAcres={listing.lotAcres ?? undefined}
        />
      )}

      {/* Trust signals */}
      <div className="rounded-xl border border-[#1E2D1E] bg-[#0D110D] p-4">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#4A6A4A]">
          TIGI Verified
        </p>
        <ul className="space-y-1.5">
          {[
            'Identity-verified seller',
            'Blockchain ownership record',
            'Parcel boundary confirmation',
            'Escrow-backed transactions',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-[#5A7060]">
              <Check className="h-3 w-3 shrink-0 text-[#C9A84C]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function LandDetailClient({
  listing,
  allListings,
}: {
  listing: MockListing
  allListings: MockListing[]
}) {
  const { isSaved, toggleSave } = useSavedListings()
  const saved = isSaved(listing.id)
  const onSave = () => toggleSave(listing.id)

  const landUse = inferLandUse(listing.features)
  const isDevOpportunity = inferDevOpportunity(listing.features)

  return (
    <div className="animate-fade-in space-y-6 pt-6 pb-16">
      {/* Breadcrumb */}
      <BreadcrumbNav listing={listing} />

      {/* Gallery */}
      <LandGallery listing={listing} />

      {/* Header — title, badges, acreage hero */}
      <LandHeader
        listing={listing}
        landUse={landUse}
        isDevOpportunity={isDevOpportunity}
        isSaved={saved}
        onSave={onSave}
      />

      {/* Divider */}
      <div className="border-t border-[#1A2B1A]" />

      {/* 2-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <LandDetailTabs
            listing={listing}
            allListings={allListings}
            landUse={landUse}
            isDevOpportunity={isDevOpportunity}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-6">
            <LandActionPanel
              listing={listing}
              landUse={landUse}
              isDevOpportunity={isDevOpportunity}
              isSaved={saved}
              onSave={onSave}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
