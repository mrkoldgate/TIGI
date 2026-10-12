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
// /transactions — Transaction intent history (TIGI Hyper-Glass v4 Elite)
//
// Paragon structural grid: deep black containers, ultra-thin borders, and
// Glassflow centerpieces. Pure black (#000000) base, massive slow-drifting orbs.
//
// Server component → IntentsListClient for optimistic cancel interactions.
// Full escrow / settlement workflow → M5 smart contract integration.
// ---------------------------------------------------------------------------

export default async function TransactionsPage() {
  const user    = await requireAuth('/transactions')
  const intents = await getIntentsForUser(user.id)

  const activeCount = intents.filter((i) =>
    ['PENDING', 'REVIEWING', 'APPROVED', 'READY_TO_SIGN'].includes(i.status),
  ).length

  const executedCount = intents.filter((i) => i.status === 'EXECUTED').length

  const totalVolume = intents.reduce((sum, i) => sum + (i.offerAmount ?? 0), 0)

  return (
    <div className="relative space-y-8">

      <PageHeader
        title="Transactions"
        description="Your active intents, offers, and investment interests."
        eyebrow="Activity"
        actions={
          <div className="flex items-center gap-2.5">
            {totalVolume > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-1.5 text-[10px] backdrop-blur-xl">
                <span className="tracking-wide text-white/50 uppercase">Vol</span>
                <span className="font-bold text-white/60 tabular-nums">
                  ${(totalVolume / 1_000).toFixed(0)}K
                </span>
              </div>
            )}
            {activeCount > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.04] px-3.5 py-1.5 text-[10px] font-semibold tracking-wide uppercase text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                {activeCount} active
              </div>
            )}
            {executedCount > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-cyan-500/15 bg-cyan-500/[0.04] px-3.5 py-1.5 text-[10px] font-medium text-cyan-400/70">
                {executedCount} on-chain
              </div>
            )}
          </div>
        }
      />

      <IntentsListClient initialIntents={intents} />

      {intents.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/8 bg-amber-500/[0.015]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          <div className="flex items-start gap-3 px-5 py-3.5">
            <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" />
            <p className="text-xs leading-relaxed text-white/55">
              <span className="font-semibold text-amber-400">Intent layer is live.</span>{' '}
              Full offer management, escrow tracking and settlement arrive with the on-chain contracts.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
