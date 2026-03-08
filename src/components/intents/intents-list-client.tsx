'use client'

// ---------------------------------------------------------------------------
// IntentsListClient — Stateful intent list for the /transactions page.
//
// Receives initial intents from server component. Removes cancelled intents
// from the active section (moves to archived/cancelled section below).
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { IntentCard } from './intent-card'
import type { UserIntent } from '@/lib/intents/intent-query'

const ACTIVE_STATUSES   = ['PENDING', 'REVIEWING', 'APPROVED', 'READY_TO_SIGN']
const TERMINAL_STATUSES = ['EXECUTED', 'CANCELLED', 'EXPIRED']

interface IntentsListClientProps {
  initialIntents: UserIntent[]
}

export function IntentsListClient({ initialIntents }: IntentsListClientProps) {
  const [intents, setIntents] = useState<UserIntent[]>(initialIntents)

  const handleCancel = (id: string) => {
    setIntents((prev) =>
      prev.map((i) => i.id === id ? { ...i, status: 'CANCELLED' } : i),
    )
  }

  const active   = intents.filter((i) => ACTIVE_STATUSES.includes(i.status))
  const terminal = intents.filter((i) => TERMINAL_STATUSES.includes(i.status))

  if (intents.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A24] text-[#6B6B80]">
          <ArrowLeftRight className="h-7 w-7" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-[#F5F5F7]">No intents yet</h3>
        <p className="mt-2 max-w-sm text-sm text-[#6B6B80]">
          Browse the marketplace and use the Buy, Invest, or Express Interest buttons to create
          your first transaction intent.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#6B6B80]">
            Active — {active.length}
          </h2>
          <div className="space-y-3">
            {active.map((intent) => (
              <IntentCard key={intent.id} intent={intent} onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}

      {terminal.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#4A4A60]">
            History — {terminal.length}
          </h2>
          <div className="space-y-3">
            {terminal.map((intent) => (
              <IntentCard key={intent.id} intent={intent} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
