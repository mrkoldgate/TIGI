import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MOCK_LISTINGS } from '@/lib/marketplace/mock-data'
import { PropertyDetailClient } from '@/components/marketplace/property-detail-client'

// ---------------------------------------------------------------------------
// /marketplace/[id] — Property detail page.
//
// Server Component shell. Resolves listing from mock data and passes to the
// interactive client component.
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

  return {
    title: `${listing.title} — TIGI Marketplace`,
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

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = MOCK_LISTINGS.find((l) => l.id === id)

  if (!listing) notFound()

  // Pass all listings for "similar" section — server avoids re-importing in client
  return <PropertyDetailClient listing={listing} allListings={MOCK_LISTINGS} />
}
