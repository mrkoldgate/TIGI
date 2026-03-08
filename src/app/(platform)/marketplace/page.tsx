import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse and invest in tokenized real estate properties.',
}

// ---------------------------------------------------------------------------
// Marketplace Page — /marketplace
// M3: Full implementation. This is the scaffold/shell.
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Marketplace"
        description="Browse tokenized properties and invest fractionally."
      />

      {/* Placeholder — full implementation in M3 */}
      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A24] text-[#6B6B80]">
          <Building2 className="h-7 w-7" />
        </div>
        <h3 className="text-h3 mb-2">Marketplace Coming in M3</h3>
        <p className="max-w-sm text-sm text-[#6B6B80]">
          Property browse, search, filters, and 20+ seeded listings with AI-generated
          images. Foundation is wired — content arrives in Milestone 3.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#0A0A0F] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          <span className="text-xs text-[#A0A0B2]">Milestone 3</span>
        </div>
      </div>
    </div>
  )
}
