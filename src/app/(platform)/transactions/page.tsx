import type { Metadata } from 'next'
import { ArrowLeftRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Track your transaction history and active workflows.',
}

// ---------------------------------------------------------------------------
// Transactions Page — /transactions
// M5: Full implementation after escrow smart contract.
// ---------------------------------------------------------------------------

export default function TransactionsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transactions"
        description="Your investment history, active offers, and escrow workflows."
      />

      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A24] text-[#6B6B80]">
          <ArrowLeftRight className="h-7 w-7" />
        </div>
        <h3 className="text-h3 mb-2">Transactions Coming in M5</h3>
        <p className="max-w-sm text-sm text-[#6B6B80]">
          Offer management, escrow step tracker, settlement workflow, and
          full transaction history. Available after smart contract integration.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#0A0A0F] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          <span className="text-xs text-[#A0A0B2]">Milestone 5</span>
        </div>
      </div>
    </div>
  )
}
