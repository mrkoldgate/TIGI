import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { PageHeader } from '@/components/shared/page-header'
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

  return (
    <div className="animate-fade-in relative pt-8 pb-20">
      {/* ── Atmospheric orbs — quad depth field ── */}
      <div
        className="pointer-events-none absolute -left-48 -top-12 h-[600px] w-[600px] rounded-full bg-indigo-500/[0.07] blur-[160px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-36 top-[280px] h-[480px] w-[480px] rounded-full bg-purple-500/[0.06] blur-[140px] animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/4 top-[750px] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/5 top-[1200px] h-[350px] w-[350px] rounded-full bg-emerald-500/[0.04] blur-[120px]"
        aria-hidden="true"
      />

      <PageHeader
        title="Portfolio"
        description="Your holdings, performance, and investment history."
        eyebrow="Invest"
        actions={
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-[10px] font-semibold tracking-wide uppercase text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
              {holdings.length} Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3 py-1.5 text-[10px] font-semibold tracking-wide uppercase text-violet-400">
              Beta Live
            </span>
          </div>
        }
      />
      <PortfolioClient holdings={holdings} summary={summary} />
    </div>
  )
}
