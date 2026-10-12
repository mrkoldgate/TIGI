import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { PortfolioClient } from '@/components/portfolio/portfolio-client'
import { computePortfolioSummary, type HoldingDTO } from '@/lib/portfolio/mock-portfolio'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Portfolio — TIGI',
  description: 'Your fractional token holdings, portfolio performance, and investment history.',
}

// ---------------------------------------------------------------------------
// Portfolio Page — /portfolio (TIGI Hyper-Glass v4)
//
// Live DB integration fetching token holdings for the authenticated user,
// computed dynamically.
// ---------------------------------------------------------------------------

export default async function PortfolioPage() {
  const user = await requireAuth('/portfolio')

  // Fetch live token holdings from the database for the current logged-in user
  const dbHoldings = await prisma.tokenHolding.findMany({
    where: { userId: user.id },
    include: {
      token: {
        include: {
          property: true,
        },
      },
    },
  })

  // Map database holdings to HoldingDTO format expected by components
  const holdings: HoldingDTO[] = dbHoldings.map((h) => {
    const propertyType = h.token.property.type
    
    let imageSlot = 'residential-1'
    if (propertyType === 'COMMERCIAL') imageSlot = 'commercial-1'
    else if (propertyType === 'INDUSTRIAL') imageSlot = 'industrial-1'
    else if (propertyType === 'LAND') imageSlot = 'land-1'
    else if (propertyType === 'MIXED_USE') imageSlot = 'mixed-1'

    let yieldApr = 5.4
    if (propertyType === 'RESIDENTIAL') yieldApr = 4.8
    else if (propertyType === 'COMMERCIAL') yieldApr = 6.2
    else if (propertyType === 'INDUSTRIAL') yieldApr = 7.1

    const qty = h.quantity
    const pricePerFraction = Number(h.token.pricePerFraction)
    const costBasis = Number(h.costBasis)

    return {
      id: h.id,
      propertyId: h.token.property.id,
      propertyTitle: h.token.property.title,
      propertyType: propertyType,
      propertyCity: h.token.property.city,
      propertyState: h.token.property.state,
      imageSlot,
      tokensOwned: qty,
      totalTokens: h.token.totalSupply,
      purchasePricePerToken: costBasis / qty,
      currentPricePerToken: pricePerFraction,
      purchasedAt: h.acquiredAt.toISOString(),
      yieldApr,
    }
  })

  const summary = computePortfolioSummary(holdings)

  return <PortfolioClient holdings={holdings} summary={summary} />
}
