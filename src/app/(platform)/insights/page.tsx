import type { Metadata } from 'next'
import { TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { requireAuth } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Insights — TIGI',
  description: 'Market trends, price analytics, and investment intelligence for tokenized real estate.',
}

// ---------------------------------------------------------------------------
// Insights Page — /insights
// M5: Market analytics, price trends, yield comparisons, heat maps.
// ---------------------------------------------------------------------------

export default async function InsightsPage() {
  await requireAuth('/insights')

  return (
    <div className="animate-fade-in pt-8 pb-16">
      <PageHeader
        title="Insights"
        description="Market trends, price analytics, and investment intelligence."
      />

      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#33333F] bg-[#1E1E2A] py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#272735] text-[#8E8E9C]">
          <TrendingUp className="h-7 w-7" />
        </div>
        <h3 className="text-h3 mb-2">Insights Coming in M5</h3>
        <p className="max-w-sm text-sm text-[#8E8E9C]">
          Market price trends, regional yield comparisons, tokenization activity,
          and AI-powered investment signals. Launching in Milestone 5.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#33333F] bg-[#171721] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          <span className="text-xs text-[#C3C3CC]">Milestone 5</span>
        </div>
      </div>
    </div>
  )
}
