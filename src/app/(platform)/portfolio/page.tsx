import type { Metadata } from 'next'
import { BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { requireAuth } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Track your real estate investments and portfolio performance.',
}

// ---------------------------------------------------------------------------
// Portfolio Page — /portfolio
// M4: Full implementation after wallet and token integration.
// ---------------------------------------------------------------------------

export default async function PortfolioPage() {
  await requireAuth('/portfolio')
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Portfolio"
        description="Your holdings, performance, and investment history."
      />

      {/* Placeholder — full implementation in M4 */}
      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A24] text-[#6B6B80]">
          <BarChart3 className="h-7 w-7" />
        </div>
        <h3 className="text-h3 mb-2">Portfolio Coming in M5</h3>
        <p className="max-w-sm text-sm text-[#6B6B80]">
          Holdings grid, total portfolio value, ROI tracking, yield history,
          and trend charts. Available after Solana wallet integration in Milestone 5.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#0A0A0F] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          <span className="text-xs text-[#A0A0B2]">Milestone 5</span>
        </div>
      </div>
    </div>
  )
}
