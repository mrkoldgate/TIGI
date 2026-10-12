import type { Metadata } from 'next'
import { getActiveListings } from '@/lib/listings/listing-query'
import { SavedListingsClient } from '@/components/saved/saved-listings-client'
import { requireAuth } from '@/lib/auth/session'

// ---------------------------------------------------------------------------
// /saved — Favorites / saved listings page.
//
// Passes the active listing catalogue to SavedListingsClient, which
// intersects it with the user's saved IDs from SavedListingsContext.
// The context is already seeded from DB in the platform layout — no
// redundant DB call needed here for the saved IDs themselves.
//
// TIGI Hyper-Glass v4 — "Deep Well" layout:
//   Pitch-black void background with extremely large, slow-drifting
//   rose/violet atmospheric orbs. Floating white-glass plates.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Saved — TIGI',
  description: 'Your saved properties and land parcels on the TIGI marketplace.',
}

export default async function SavedPage() {
  await requireAuth('/saved')
  const allListings = await getActiveListings()

  return (
    <div className="animate-fade-in relative pt-8 pb-16">
      {/* ── Deep Well atmospheric orbs — extremely large, slow drift ── */}
      {/* Primary rose bloom — top-left, massive */}
      <div
        className="pointer-events-none absolute -left-64 -top-32 h-[800px] w-[800px] rounded-full bg-rose-500/[0.06] blur-[200px] animate-float-slow"
        aria-hidden="true"
      />
      {/* Secondary violet bloom — mid-right, deep */}
      <div
        className="pointer-events-none absolute -right-48 top-[250px] h-[700px] w-[700px] rounded-full bg-violet-500/[0.05] blur-[180px] animate-float"
        aria-hidden="true"
      />
      {/* Tertiary rose undertone — bottom-left */}
      <div
        className="pointer-events-none absolute -left-32 top-[700px] h-[600px] w-[600px] rounded-full bg-rose-400/[0.035] blur-[160px] animate-float-slow"
        aria-hidden="true"
      />
      {/* Deep violet wash — far bottom */}
      <div
        className="pointer-events-none absolute right-1/5 top-[1100px] h-[550px] w-[550px] rounded-full bg-violet-400/[0.03] blur-[140px] animate-float"
        aria-hidden="true"
      />
      {/* Central void glow — barely perceptible unifier */}
      <div
        className="pointer-events-none absolute left-1/2 top-[500px] h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.004] blur-[250px]"
        aria-hidden="true"
      />

      <SavedListingsClient allListings={allListings} />
    </div>
  )
}
