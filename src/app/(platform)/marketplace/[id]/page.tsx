import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MOCK_LISTINGS } from '@/lib/marketplace/mock-data'
import { PropertyDetailClient } from '@/components/marketplace/property-detail-client'
import { LandDetailClient } from '@/components/marketplace/land-detail-client'
import { getValuation, marketplaceListingToInput } from '@/lib/valuation/valuation-service'

// ---------------------------------------------------------------------------
// /marketplace/[id] — Unified property & land detail route.
//
// Routes to the appropriate client component based on propertyType:
//   LAND     → LandDetailClient
//   all else → PropertyDetailClient
//
// DB integration path: replace MOCK_LISTINGS.find() with:
//   const listing = await prisma.listing.findUnique({ where: { id }, include: { ... } })
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = MOCK_LISTINGS.find((l) => l.id === id)
  if (!listing) return { title: 'Not Found' }

  const suffix = listing.propertyType === 'LAND' ? 'Land — TIGI' : 'TIGI Marketplace'
  return {
    title: `${listing.title} — ${suffix}`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
    },
  }
}

export async function generateStaticParams() {
  return MOCK_LISTINGS.map((l) => ({ id: l.id }))
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = MOCK_LISTINGS.find((l) => l.id === id)

  if (!listing) notFound()

  const valuation = await getValuation(listing.id, marketplaceListingToInput(listing))

  if (listing.propertyType === 'LAND') {
    return <LandDetailClient listing={listing} allListings={MOCK_LISTINGS} valuation={valuation} />
  }

  return <PropertyDetailClient listing={listing} allListings={MOCK_LISTINGS} valuation={valuation} />
}
