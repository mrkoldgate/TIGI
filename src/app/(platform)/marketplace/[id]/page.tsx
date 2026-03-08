import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getListingById, getActiveListings } from '@/lib/listings/listing-query'
import { PropertyDetailClient } from '@/components/marketplace/property-detail-client'
import { LandDetailClient } from '@/components/marketplace/land-detail-client'
import { getValuation, marketplaceListingToInput } from '@/lib/valuation/valuation-service'
import { getTerraListing } from '@/lib/terra/terra-query'

// ---------------------------------------------------------------------------
// /marketplace/[id] — Unified property & land detail route.
//
// Data is fetched from the database via listing-query.ts.
// Both getListingById and getActiveListings are wrapped in React cache() so
// parallel calls within generateMetadata + page component deduplicate to a
// single Prisma query each.
//
// Falls back to MOCK_LISTINGS if the DB is unavailable (dev without Postgres).
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await getListingById(id)
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

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params

  // Both queries are React-cached — parallel calls are deduplicated.
  const [listing, allListings] = await Promise.all([
    getListingById(id),
    getActiveListings(),
  ])

  if (!listing) notFound()

  const valuation = await getValuation(listing.id, marketplaceListingToInput(listing))

  if (listing.propertyType === 'LAND') {
    // Enrich with Terra structured data (lease terms + dev opportunity)
    const terraListing = await getTerraListing(listing.id)
    return (
      <LandDetailClient
        listing={listing}
        allListings={allListings}
        valuation={valuation}
        leaseTerms={terraListing?.leaseTerms ?? null}
        devOpportunity={terraListing?.devOpportunity ?? null}
        leaseRateMonthly={terraListing?.leaseRateMonthly ?? null}
      />
    )
  }

  return <PropertyDetailClient listing={listing} allListings={allListings} valuation={valuation} />
}
