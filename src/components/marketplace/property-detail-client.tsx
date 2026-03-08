'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSavedListings } from '@/lib/saved/saved-context'
import {
  ArrowLeft,
  Bed,
  Bath,
  Ruler,
  Calendar,
  MapPin,
  Zap,
  Heart,
  Share2,
  Users,
  ChevronRight,
  FileText,
  Eye,
  Clock,
  Check,
  Phone,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { PropertyCard } from '@/components/marketplace/property-card'
import { MarketplaceLandCard } from '@/components/marketplace/land-card'
import { ValuationPanel } from '@/components/valuation/valuation-panel'
import { getMockValuation } from '@/lib/valuation/mock-valuations'
import {
  type MockListing,
  type PropertyType,
  type ImagePropertyType,
  formatPrice,
  tokenSoldPercent,
} from '@/lib/marketplace/mock-data'

// ---------------------------------------------------------------------------
// Gallery slot pools — derive additional images from property type
// ---------------------------------------------------------------------------

const GALLERY_POOLS: Record<ImagePropertyType, string[]> = {
  residential: ['residential-1', 'residential-2', 'residential-3', 'residential-4', 'residential-5'],
  commercial:  ['commercial-1', 'commercial-2', 'commercial-3', 'commercial-4'],
  land:        ['land-1', 'land-2', 'land-3'],
  industrial:  ['industrial-1', 'industrial-2'],
  mixed:       ['mixed-1', 'commercial-1', 'commercial-2'],
}

function getGallerySlots(listing: MockListing): string[] {
  const pool = GALLERY_POOLS[listing.imagePropertyType] ?? GALLERY_POOLS.residential
  const rest = pool.filter((s) => s !== listing.imageSlot)
  return [listing.imageSlot, ...rest].slice(0, 4)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL:  'Commercial',
  LAND:        'Land',
  INDUSTRIAL:  'Industrial',
  MIXED_USE:   'Mixed Use',
}

const TYPE_BADGE: Record<PropertyType, string> = {
  RESIDENTIAL: 'bg-[#1A1A24]/90 text-[#A0A0B2] ring-[#2A2A3A]',
  COMMERCIAL:  'bg-[#3B82F6]/15 text-[#60A5FA] ring-[#3B82F6]/25',
  LAND:        'bg-[#22C55E]/15 text-[#4ADE80] ring-[#22C55E]/25',
  INDUSTRIAL:  'bg-[#F59E0B]/15 text-[#FCD34D] ring-[#F59E0B]/25',
  MIXED_USE:   'bg-[#C9A84C]/15 text-[#C9A84C] ring-[#C9A84C]/25',
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

// ---------------------------------------------------------------------------
// Gallery mosaic
// ---------------------------------------------------------------------------

function GalleryMosaic({ listing }: { listing: MockListing }) {
  const slots = getGallerySlots(listing)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl">
      {/* Mobile: single hero */}
      <div className="relative md:hidden">
        <PlaceholderImage
          slot={slots[0]}
          propertyType={listing.imagePropertyType}
          alt={listing.title}
          className="aspect-[4/3] w-full"
          priority
        />
        {slots.length > 1 && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-[#0A0A0F]/80 px-3 py-1.5 text-xs font-medium text-[#F5F5F7] backdrop-blur-sm ring-1 ring-[#2A2A3A] transition hover:bg-[#0A0A0F]"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Show all {slots.length} photos
          </button>
        )}
      </div>

      {/* Desktop: 3-image mosaic */}
      <div className="hidden h-[460px] grid-cols-3 gap-2 md:grid">
        {/* Hero — spans full height */}
        <div className="relative col-span-2 row-span-2 overflow-hidden rounded-l-2xl">
          <PlaceholderImage
            slot={slots[0]}
            propertyType={listing.imagePropertyType}
            alt={listing.title}
            className="h-full w-full"
            priority
          />
        </div>

        {/* Image 2 — top right */}
        {slots[1] && (
          <div className="relative row-start-1 h-[226px] overflow-hidden rounded-tr-2xl">
            <PlaceholderImage
              slot={slots[1]}
              propertyType={listing.imagePropertyType}
              alt={`${listing.title} — view 2`}
              className="h-full w-full"
            />
          </div>
        )}

        {/* Image 3 — bottom right, with photo count overlay */}
        {slots[2] && (
          <div className="relative row-start-2 h-[226px] overflow-hidden rounded-br-2xl">
            <PlaceholderImage
              slot={slots[2]}
              propertyType={listing.imagePropertyType}
              alt={`${listing.title} — view 3`}
              className="h-full w-full"
            />
            {slots.length > 3 && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]/55">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#0A0A0F]/70 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm ring-1 ring-[#2A2A3A] transition hover:bg-[#0A0A0F]/90"
                >
                  <LayoutGrid className="h-4 w-4" />
                  +{slots.length - 3} photos
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox placeholder — wired in a future iteration */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]/95 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <p className="text-[#6B6B80]">Gallery lightbox coming soon.</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function BreadcrumbNav({ listing }: { listing: MockListing }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#6B6B80]">
      <Link href="/marketplace" className="flex items-center gap-1 transition-colors hover:text-[#A0A0B2]">
        <ArrowLeft className="h-3.5 w-3.5" />
        Marketplace
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span>{PROPERTY_TYPE_LABELS[listing.propertyType]}</span>
      <ChevronRight className="h-3 w-3" />
      <span className="text-[#A0A0B2]">{listing.city}, {listing.state}</span>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Listing header — title, badges, meta strip
// ---------------------------------------------------------------------------

function ListingHeader({
  listing,
  isSaved,
  onSave,
}: {
  listing: MockListing
  isSaved: boolean
  onSave: () => void
}) {
  const listed = daysAgo(listing.createdAt)

  return (
    <div className="space-y-3">
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset', TYPE_BADGE[listing.propertyType])}>
          {PROPERTY_TYPE_LABELS[listing.propertyType]}
        </span>
        {listing.isTokenized && (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A84C]/15 px-2 py-0.5 text-[10px] font-medium text-[#C9A84C] ring-1 ring-inset ring-[#C9A84C]/25">
            <Zap className="h-2.5 w-2.5" />
            Tokenized
          </span>
        )}
        {listing.listingType !== 'BUY' && (
          <span className="inline-flex items-center rounded-md bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-medium text-[#60A5FA] ring-1 ring-inset ring-[#3B82F6]/25">
            {listing.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
          </span>
        )}
      </div>

      {/* Title + actions */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold leading-snug text-[#F5F5F7] sm:text-3xl">
          {listing.title}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
            onClick={onSave}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A3A] bg-[#111118] transition-all hover:border-[#C9A84C]/40 hover:bg-[#1A1A24]"
          >
            <Heart className={cn('h-4 w-4 transition-colors', isSaved ? 'fill-rose-400 text-rose-400' : 'text-[#6B6B80]')} />
          </button>
          <button
            type="button"
            aria-label="Share"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A3A] bg-[#111118] transition-all hover:border-[#C9A84C]/40 hover:bg-[#1A1A24]"
          >
            <Share2 className="h-4 w-4 text-[#6B6B80]" />
          </button>
        </div>
      </div>

      {/* Location + meta strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#6B6B80]">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#4A4A60]" />
          {listing.city}, {listing.state}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#4A4A60]" />
          Listed {listed === 0 ? 'today' : `${listed}d ago`}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-[#4A4A60]" />
          {formatNumber(listing.viewCount)} views
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Detail tabs
// ---------------------------------------------------------------------------

type DetailTab = 'overview' | 'details' | 'documents' | 'similar'

const MOCK_DOCUMENTS = [
  { name: 'Deed Record', type: 'Legal', status: 'available' },
  { name: 'Property Inspection Report', type: 'Inspection', status: 'available' },
  { name: 'Title Insurance Policy', type: 'Legal', status: 'available' },
  { name: 'Disclosure Statement', type: 'Disclosure', status: 'available' },
  { name: 'Survey Report', type: 'Survey', status: 'pending' },
  { name: 'HOA Documents', type: 'HOA', status: 'pending' },
  { name: 'Environmental Assessment', type: 'Regulatory', status: 'not_available' },
] as const

function SpecRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-[#6B6B80]">{label}</span>
      <span className="font-medium text-[#F5F5F7]">{value}</span>
    </div>
  )
}

function TabContent({
  tab,
  listing,
  allListings,
}: {
  tab: DetailTab
  listing: MockListing
  allListings: MockListing[]
}) {
  if (tab === 'overview') {
    return (
      <div className="space-y-8">
        {/* Description */}
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold text-[#F5F5F7]">About this property</h2>
          <p className="text-sm leading-relaxed text-[#A0A0B2]">{listing.description}</p>
        </section>

        {/* Highlights */}
        {listing.features.length > 0 && (
          <section>
            <h2 className="mb-3 font-heading text-base font-semibold text-[#F5F5F7]">Highlights</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {listing.features.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2.5 text-sm"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#C9A84C]" />
                  <span className="text-[#A0A0B2]">{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Location context */}
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold text-[#F5F5F7]">Location</h2>
          <div className="flex items-start gap-3 rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[#F5F5F7]">{listing.city}, {listing.state}</p>
              <p className="text-[#6B6B80]">
                Neighborhood context, walkability scores, and proximity data will be available when location services are integrated.
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (tab === 'details') {
    const isLand = listing.propertyType === 'LAND'
    return (
      <div className="space-y-6">
        {/* Property details */}
        <section>
          <h2 className="mb-1 font-heading text-base font-semibold text-[#F5F5F7]">Property Details</h2>
          <div className="divide-y divide-[#1E1E2A] rounded-xl border border-[#2A2A3A] bg-[#111118] px-4">
            <SpecRow label="Property type" value={PROPERTY_TYPE_LABELS[listing.propertyType]} />
            <SpecRow label="Listing type" value={listing.listingType === 'BOTH' ? 'Buy or Lease' : listing.listingType === 'BUY' ? 'For Sale' : 'For Lease'} />
            <SpecRow label="Status" value="Active" />
            <SpecRow label="Listed" value={new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
          </div>
        </section>

        {/* Size & structure */}
        <section>
          <h2 className="mb-1 font-heading text-base font-semibold text-[#F5F5F7]">Size & Structure</h2>
          <div className="divide-y divide-[#1E1E2A] rounded-xl border border-[#2A2A3A] bg-[#111118] px-4">
            {isLand ? (
              <SpecRow label="Lot size" value={listing.lotAcres ? `${listing.lotAcres.toLocaleString()} acres` : undefined} />
            ) : (
              <>
                <SpecRow label="Total area" value={listing.sqft ? `${formatNumber(listing.sqft)} sqft` : undefined} />
                <SpecRow label="Bedrooms" value={listing.bedrooms ?? undefined} />
                <SpecRow label="Bathrooms" value={listing.bathrooms ?? undefined} />
                <SpecRow label="Lot size" value={listing.lotAcres ? `${listing.lotAcres} acres` : undefined} />
                <SpecRow label="Year built" value={listing.yearBuilt ?? undefined} />
              </>
            )}
          </div>
        </section>

        {/* Financial */}
        <section>
          <h2 className="mb-1 font-heading text-base font-semibold text-[#F5F5F7]">Financial</h2>
          <div className="divide-y divide-[#1E1E2A] rounded-xl border border-[#2A2A3A] bg-[#111118] px-4">
            <SpecRow label="List price" value={`$${listing.price.toLocaleString()}`} />
            {listing.sqft && !isLand && (
              <SpecRow label="Price per sqft" value={`$${Math.round(listing.price / listing.sqft).toLocaleString()}`} />
            )}
            {listing.lotAcres && (
              <SpecRow label="Price per acre" value={`$${Math.round(listing.price / listing.lotAcres).toLocaleString()}`} />
            )}
            {listing.aiEstimatedValue && (
              <SpecRow label="AI estimated value" value={`$${listing.aiEstimatedValue.toLocaleString()}`} />
            )}
            {listing.isTokenized && listing.tokenPricePerFraction && (
              <SpecRow label="Price per fraction" value={`$${listing.tokenPricePerFraction.toLocaleString()}`} />
            )}
          </div>
        </section>
      </div>
    )
  }

  if (tab === 'documents') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#6B6B80]">
          Documents are verified by TIGI and made available as part of the due diligence package. Full access unlocked after signing an NDA or submitting an offer.
        </p>
        <div className="divide-y divide-[#1E1E2A] overflow-hidden rounded-xl border border-[#2A2A3A]">
          {MOCK_DOCUMENTS.map((doc) => (
            <div
              key={doc.name}
              className="flex items-center justify-between gap-4 bg-[#111118] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1A1A24]">
                  <FileText className="h-4 w-4 text-[#6B6B80]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F5F5F7]">{doc.name}</p>
                  <p className="text-[11px] text-[#4A4A60]">{doc.type}</p>
                </div>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset',
                  doc.status === 'available'     && 'bg-[#22C55E]/10 text-[#4ADE80] ring-[#22C55E]/20',
                  doc.status === 'pending'       && 'bg-[#F59E0B]/10 text-[#FCD34D] ring-[#F59E0B]/20',
                  doc.status === 'not_available' && 'bg-[#2A2A3A] text-[#6B6B80] ring-[#3A3A48]',
                )}
              >
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

  // Similar tab
  const similar = allListings
    .filter((l) => l.id !== listing.id && l.status === 'ACTIVE' && l.propertyType === listing.propertyType)
    .sort((a, b) => Math.abs(a.price - listing.price) - Math.abs(b.price - listing.price))
    .slice(0, 3)

  if (similar.length === 0) {
    return <p className="py-8 text-center text-sm text-[#6B6B80]">No similar listings available right now.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {similar.map((l, i) =>
        l.propertyType === 'LAND' ? (
          <MarketplaceLandCard key={l.id} listing={l} index={i} />
        ) : (
          <PropertyCard key={l.id} listing={l} index={i} />
        ),
      )}
    </div>
  )
}

function DetailTabs({
  listing,
  allListings,
}: {
  listing: MockListing
  allListings: MockListing[]
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'overview',  label: 'Overview'  },
    { key: 'details',   label: 'Details'   },
    { key: 'documents', label: 'Documents' },
    { key: 'similar',   label: 'Similar'   },
  ]

  return (
    <div>
      <div className="flex border-b border-[#2A2A3A]">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              'relative px-5 py-3 text-sm font-medium transition-colors duration-150',
              activeTab === key ? 'text-[#C9A84C]' : 'text-[#6B6B80] hover:text-[#A0A0B2]',
            )}
          >
            {label}
            {activeTab === key && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-[#C9A84C]" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <TabContent tab={activeTab} listing={listing} allListings={allListings} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Action panel — sticky right column
// ---------------------------------------------------------------------------

function QuickStats({ listing }: { listing: MockListing }) {
  const stats: { icon: React.ReactNode; label: string; value: string }[] = []
  const isLand = listing.propertyType === 'LAND'

  if (isLand) {
    if (listing.lotAcres) stats.push({ icon: <Ruler className="h-3.5 w-3.5" />, label: 'Acres', value: `${listing.lotAcres.toLocaleString()}` })
  } else {
    if (listing.sqft)      stats.push({ icon: <Ruler className="h-3.5 w-3.5" />, label: 'Sq ft', value: formatNumber(listing.sqft) })
    if (listing.bedrooms)  stats.push({ icon: <Bed className="h-3.5 w-3.5" />, label: 'Beds', value: String(listing.bedrooms) })
    if (listing.bathrooms) stats.push({ icon: <Bath className="h-3.5 w-3.5" />, label: 'Baths', value: String(listing.bathrooms) })
    if (listing.lotAcres)  stats.push({ icon: <Ruler className="h-3.5 w-3.5" />, label: 'Lot', value: `${listing.lotAcres} ac` })
  }
  if (listing.yearBuilt) stats.push({ icon: <Calendar className="h-3.5 w-3.5" />, label: 'Built', value: String(listing.yearBuilt) })

  if (stats.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.slice(0, 6).map(({ icon, label, value }) => (
        <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-[#2A2A3A] bg-[#0D0D14] py-3 text-center">
          <span className="text-[#4A4A60]">{icon}</span>
          <span className="font-heading text-sm font-semibold text-[#F5F5F7]">{value}</span>
          <span className="text-[9px] uppercase tracking-wider text-[#4A4A60]">{label}</span>
        </div>
      ))}
    </div>
  )
}

function InvestmentPanel({ listing }: { listing: MockListing }) {
  if (!listing.isTokenized || !listing.tokenTotalSupply || !listing.tokenPricePerFraction) return null

  const soldPct = tokenSoldPercent(listing)
  const available = listing.tokenAvailableSupply ?? 0

  return (
    <div className="rounded-xl border border-[#C9A84C]/20 bg-[#0D0D14] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-[#C9A84C]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A84C]">
          Fractional Ownership
        </span>
      </div>

      {/* Price per fraction */}
      <div className="mb-4">
        <p className="text-[10px] text-[#4A4A60]">Entry from</p>
        <p className="font-heading text-2xl font-bold text-[#C9A84C]">
          ${listing.tokenPricePerFraction.toLocaleString()}
          <span className="text-sm font-normal text-[#6B6B80]">/fraction</span>
        </p>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-[#6B6B80]">{soldPct}% subscribed</span>
          <span className="text-[#6B6B80]">{available.toLocaleString()} left</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#2A2A3A]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B8932F] to-[#C9A84C] transition-all duration-700"
            style={{ width: `${soldPct}%` }}
          />
        </div>
      </div>

      {/* Investor count */}
      <div className="mb-4 flex items-center gap-1.5 text-xs text-[#6B6B80]">
        <Users className="h-3.5 w-3.5" />
        <span>
          <span className="font-medium text-[#A0A0B2]">{listing.tokenInvestorCount}</span> investors have participated
        </span>
      </div>

      {/* Invest CTA */}
      <button
        type="button"
        className="w-full rounded-xl bg-[#C9A84C]/15 py-2.5 text-sm font-medium text-[#C9A84C] ring-1 ring-inset ring-[#C9A84C]/25 transition-all hover:bg-[#C9A84C]/25 active:scale-[0.98]"
      >
        <Zap className="mr-1.5 inline h-3.5 w-3.5" />
        Invest from ${listing.tokenPricePerFraction.toLocaleString()}
      </button>

      <p className="mt-2.5 text-[10px] leading-relaxed text-[#4A4A60]">
        Fractional tokens represent proportional economic interest. Returns distributed quarterly. Not a securities offering. See disclosures.
      </p>
    </div>
  )
}

function ActionPanel({
  listing,
  isSaved,
  onSave,
}: {
  listing: MockListing
  isSaved: boolean
  onSave: () => void
}) {
  const primaryLabel =
    listing.listingType === 'BUY'    ? 'Buy Property'     :
    listing.listingType === 'LEASE'  ? 'Schedule Tour'    :
    'Buy or Lease'

  return (
    <div className="space-y-4">
      {/* Price card */}
      <div className="rounded-2xl border border-[#2A2A3A] bg-[#111118] p-5">
        <p className="text-[10px] uppercase tracking-widest text-[#4A4A60]">List Price</p>
        <p className="mt-1 font-heading text-3xl font-bold text-white">
          {formatPrice(listing.price)}
        </p>
        {listing.isTokenized && listing.tokenPricePerFraction && (
          <p className="mt-1 text-sm text-[#C9A84C]">
            from ${listing.tokenPricePerFraction.toLocaleString()}
            <span className="text-xs text-[#6B6B80]">/fraction</span>
          </p>
        )}

        {/* Primary CTA */}
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-[#C9A84C] py-3 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B55A] active:scale-[0.98]"
        >
          {primaryLabel}
        </button>

        {/* Contact */}
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#2A2A3A] py-2.5 text-sm font-medium text-[#A0A0B2] transition-all hover:border-[#3A3A4A] hover:text-[#F5F5F7] active:scale-[0.98]"
        >
          <Phone className="h-4 w-4" />
          Contact Agent
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          className={cn(
            'mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all active:scale-[0.98]',
            isSaved
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
              : 'border-[#2A2A3A] text-[#6B6B80] hover:border-[#3A3A4A] hover:text-[#F5F5F7]',
          )}
        >
          <Heart className={cn('h-4 w-4', isSaved && 'fill-rose-400')} />
          {isSaved ? 'Saved' : 'Save property'}
        </button>
      </div>

      {/* Quick stats */}
      <QuickStats listing={listing} />

      {/* Investment panel */}
      <InvestmentPanel listing={listing} />

      {/* AI valuation */}
      {listing.aiEstimatedValue && (
        <ValuationPanel
          listPrice={listing.price}
          estimatedValue={listing.aiEstimatedValue}
          confidence={listing.aiConfidence ?? 'LOW'}
          valuation={getMockValuation(listing.id)}
          assetType="property"
        />
      )}

      {/* Trust signals */}
      <div className="rounded-xl border border-[#2A2A3A] bg-[#0D0D14] p-4">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#4A4A60]">
          TIGI Verified
        </p>
        <ul className="space-y-1.5">
          {[
            'Identity-verified seller',
            'Blockchain ownership record',
            'AI-assisted due diligence',
            'Escrow-backed transactions',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-[#6B6B80]">
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

export function PropertyDetailClient({
  listing,
  allListings,
}: {
  listing: MockListing
  allListings: MockListing[]
}) {
  const { isSaved, toggleSave } = useSavedListings()
  const saved = isSaved(listing.id)
  const onSave = () => toggleSave(listing.id)

  return (
    <div className="animate-fade-in space-y-6 pb-16">
      {/* Breadcrumb */}
      <BreadcrumbNav listing={listing} />

      {/* Gallery */}
      <GalleryMosaic listing={listing} />

      {/* Title (full-width, above the 2-col split) */}
      <ListingHeader listing={listing} isSaved={saved} onSave={onSave} />

      {/* Divider */}
      <div className="border-t border-[#1E1E2A]" />

      {/* ── 2-column layout ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left — tabs (main content) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <DetailTabs listing={listing} allListings={allListings} />
        </div>

        {/* Right — sticky action panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-6">
            <ActionPanel listing={listing} isSaved={saved} onSave={onSave} />
          </div>
        </div>
      </div>
    </div>
  )
}
