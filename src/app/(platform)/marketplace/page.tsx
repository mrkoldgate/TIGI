import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { MarketplaceClient } from '@/components/marketplace/marketplace-client'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse tokenized real estate properties and invest fractionally.',
}

// ---------------------------------------------------------------------------
// Marketplace — /marketplace
//
// Server Component shell. MarketplaceClient handles all filtering client-side.
// DB integration path: fetch listings via Prisma here, pass as props instead
// of importing mock data directly in the client component.
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  return (
    <div className="animate-fade-in pt-6 pb-16">
      <PageHeader
        title="Marketplace"
        description="Browse and invest in tokenized real estate, globally."
      />

      <div className="mt-6">
        <MarketplaceClient />
      </div>
    </div>
  )
}
