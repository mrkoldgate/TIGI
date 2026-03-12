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

      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A24] text-[#6B6B80]">
          <TrendingUp className="h-7 w-7" />
        </div>
        <h3 className="text-h3 mb-2">Insights Coming in M5</h3>
        <p className="max-w-sm text-sm text-[#6B6B80]">
          Market price trends, regional yield comparisons, tokenization activity,
          and AI-powered investment signals. Launching in Milestone 5.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#0A0A0F] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          <span className="text-xs text-[#A0A0B2]">Milestone 5</span>
        </div>
      </div>
    </div>
  )
}
