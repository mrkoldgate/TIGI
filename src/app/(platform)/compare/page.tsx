import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getListingById } from '@/lib/listings/listing-query'
import { CompareClient } from '@/components/compare/compare-client'

// ---------------------------------------------------------------------------
// /compare?ids=res-001,com-001[,mix-001]
//
// Reads up to 3 listing IDs from the search param, fetches each in parallel,
// and hands the results to the CompareClient for side-by-side rendering.
//
// Invalid / not-found IDs are silently filtered so the page degrades
// gracefully if a listing was removed since the user added it to the tray.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Compare Properties — TIGI',
  description: 'Side-by-side property comparison on the TIGI marketplace.',
}

interface PageProps {
  searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage({ searchParams }: PageProps) {
  await requireAuth()

  const { ids } = await searchParams

  // Parse + deduplicate + cap at 3
  const rawIds = (ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)

  const uniqueIds = [...new Set(rawIds)]

  // Fetch all in parallel; filter any nulls (not found / DB unavailable)
  const results = await Promise.all(uniqueIds.map((id) => getListingById(id)))
  const listings = results.filter(Boolean) as NonNullable<(typeof results)[number]>[]

  return <CompareClient listings={listings} />
}
