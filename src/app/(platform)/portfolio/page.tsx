import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { PageHeader } from '@/components/shared/page-header'
import { PortfolioClient } from '@/components/portfolio/portfolio-client'
import { MOCK_HOLDINGS, computePortfolioSummary } from '@/lib/portfolio/mock-portfolio'

export const metadata: Metadata = {
  title: 'Portfolio — TIGI',
  description: 'Your fractional token holdings, portfolio performance, and investment history.',
}

// ---------------------------------------------------------------------------
// Portfolio Page — /portfolio
//
// M5: First real portfolio implementation with mock token holdings.
//     Holdings show P&L, token count, ownership %, and yield APR.
//     Wallet connect section sets up the M6 on-chain sync path.
//
// M6: Replace MOCK_HOLDINGS with real TokenHolding DB query + Solana wallet.
// ---------------------------------------------------------------------------

export default async function PortfolioPage() {
  await requireAuth('/portfolio')

  // M5: mock holdings until DB + wallet integration (M6)
  const holdings = MOCK_HOLDINGS
  const summary  = computePortfolioSummary(holdings)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Portfolio"
        description="Your holdings, performance, and investment history."
      />
      <PortfolioClient holdings={holdings} summary={summary} />
    </div>
  )
}
