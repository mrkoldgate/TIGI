// ---------------------------------------------------------------------------
// GET /api/valuation/[id]
//
// Returns an AI-enriched valuation for a marketplace listing.
//
// Access:
//   - Authentication required
//   - Rule-based valuation returned for all tiers
//   - AI-enriched narrative (summary field) returned for Pro+ when AI_PROVIDER=anthropic
//
// Use cases:
//   - Client components that need valuation data post-hydration
//   - Future: cache-busted refresh of a stale valuation
//
// Response:
//   { success: true, data: AiValuation, enriched: boolean }
//   { success: false, error: { code, message } }
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getListingById } from '@/lib/listings/listing-query'
import { getEnrichedValuation, marketplaceListingToInput } from '@/lib/valuation/valuation-service'
import type { AIContext } from '@/lib/ai/ai-types'
import { logger } from '@/lib/logger'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 },
    )
  }

  const { id } = await params

  const listing = await getListingById(id)
  if (!listing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
      { status: 404 },
    )
  }

  const context: AIContext = {
    userId:           session.user.id,
    subscriptionTier: (session.user as { subscriptionTier?: string }).subscriptionTier ?? 'free',
    role:             (session.user as { role?: string }).role ?? 'INVESTOR',
  }

  try {
    const input     = marketplaceListingToInput(listing)
    const valuation = await getEnrichedValuation(id, input, context)

    // Tell the client whether the summary was AI-generated or rule-based
    const enriched =
      process.env.AI_PROVIDER === 'anthropic' &&
      (context.subscriptionTier === 'pro' ||
       context.subscriptionTier === 'pro_plus' ||
       context.subscriptionTier === 'enterprise')

    return NextResponse.json({ success: true, data: valuation, enriched })
  } catch (err) {
    logger.error('[GET /api/valuation/[id]]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to compute valuation' } },
      { status: 500 },
    )
  }
}
