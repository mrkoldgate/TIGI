// ---------------------------------------------------------------------------
// Portfolio mock data — mirrors the future DB + wallet shape.
//
// Integration path (M6+):
//   TokenHolding model → toHoldingDTO() → portfolio page
//   Solana wallet connection → on-chain price verification
//   Yield distributions → prisma.yieldPayment aggregates
// ---------------------------------------------------------------------------

export interface HoldingDTO {
  id:            string
  propertyId:    string
  propertyTitle: string
  propertyType:  'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'LAND' | 'MIXED_USE'
  propertyCity:  string
  propertyState: string
  imageSlot:     string
  tokensOwned:   number
  totalTokens:   number
  /** Purchase price per token in USD */
  purchasePricePerToken: number
  /** Current market price per token in USD */
  currentPricePerToken: number
  purchasedAt:   string
  /** Annualized yield from rental income distributions (%) */
  yieldApr:      number
}

export interface PortfolioSummary {
  totalValue:       number
  totalInvested:    number
  totalGainLoss:    number
  totalGainLossPct: number
  weightedYieldApr: number
  holdingsCount:    number
}

// ── Mock holdings — 2 tokenized assets ────────────────────────────────────

export const MOCK_HOLDINGS: HoldingDTO[] = [
  {
    id:            'hold-001',
    propertyId:    'res-001',
    propertyTitle: 'Westside Craftsman Bungalow',
    propertyType:  'RESIDENTIAL',
    propertyCity:  'Los Angeles',
    propertyState: 'CA',
    imageSlot:     'residential-1',
    tokensOwned:   50,
    totalTokens:   1000,
    purchasePricePerToken: 425,
    currentPricePerToken:  448,
    purchasedAt:   '2025-12-10T10:00:00Z',
    yieldApr:      4.8,
  },
  {
    id:            'hold-002',
    propertyId:    'com-001',
    propertyTitle: 'Phoenix Business Park',
    propertyType:  'COMMERCIAL',
    propertyCity:  'Phoenix',
    propertyState: 'AZ',
    imageSlot:     'commercial-1',
    tokensOwned:   120,
    totalTokens:   5000,
    purchasePricePerToken: 210,
    currentPricePerToken:  218,
    purchasedAt:   '2026-01-15T10:00:00Z',
    yieldApr:      6.2,
  },
]

// ── Portfolio summary computation ─────────────────────────────────────────

export function computePortfolioSummary(holdings: HoldingDTO[]): PortfolioSummary {
  if (holdings.length === 0) {
    return {
      totalValue: 0, totalInvested: 0, totalGainLoss: 0,
      totalGainLossPct: 0, weightedYieldApr: 0, holdingsCount: 0,
    }
  }

  const totalValue    = holdings.reduce((s, h) => s + h.tokensOwned * h.currentPricePerToken, 0)
  const totalInvested = holdings.reduce((s, h) => s + h.tokensOwned * h.purchasePricePerToken, 0)
  const totalGainLoss = totalValue - totalInvested
  const totalGainLossPct = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  // Yield weighted by current position value
  const weightedYieldApr = holdings.reduce(
    (s, h) => s + h.yieldApr * (h.tokensOwned * h.currentPricePerToken),
    0,
  ) / totalValue

  return {
    totalValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPct,
    weightedYieldApr,
    holdingsCount: holdings.length,
  }
}
