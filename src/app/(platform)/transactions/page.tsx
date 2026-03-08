import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getIntentsForUser } from '@/lib/intents/intent-query'
import { PageHeader } from '@/components/shared/page-header'
import { IntentsListClient } from '@/components/intents/intents-list-client'

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Track your active intents, offers, and investment interests.',
}

// ---------------------------------------------------------------------------
// /transactions — Transaction intent history
//
// Server component: fetches user intents from DB and hands off to
// IntentsListClient for optimistic cancel interactions.
//
// Full escrow / settlement workflow → Milestone 5 (smart contract integration).
// ---------------------------------------------------------------------------

export default async function TransactionsPage() {
  const user    = await requireAuth('/transactions')
  const intents = await getIntentsForUser(user.id)

  const activeCount = intents.filter((i) =>
    ['PENDING', 'REVIEWING', 'APPROVED'].includes(i.status),
  ).length

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Transactions"
          description="Your active intents, offers, and investment interests."
        />

        <div className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-[#2A2A3A] px-3 py-1.5 text-xs text-[#6B6B80]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          <span>{activeCount} active</span>
        </div>
      </div>

      <IntentsListClient initialIntents={intents} />

      {intents.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-4 py-3">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#F59E0B]" />
          <p className="text-xs text-[#6B6B80]">
            <span className="font-medium text-[#A0A0B2]">Intent layer is live.</span>{' '}
            Full offer management, escrow step tracker, and settlement workflow arrive in{' '}
            <span className="font-medium text-[#C9A84C]">M5</span> after smart contract integration.
          </p>
        </div>
      )}
    </div>
  )
}
