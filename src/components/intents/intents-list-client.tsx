'use client'

// ---------------------------------------------------------------------------
// IntentsListClient — Stateful intent list (TIGI Hyper-Glass v4 Elite).
//
// Paragon structural grid: deep black containers with ultra-thin borders and
// Glassflow icon centerpieces. Dimension nested layering for section headers.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftRight, ArrowRight, Clock, CheckCircle2, Zap } from 'lucide-react'
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
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[22px] border border-dashed border-white/[0.05] bg-[#050505]/80 py-28 text-center backdrop-blur-3xl">
        {/* Noise texture overlay */}
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* Atmospheric wash */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/[0.06] blur-[80px]" aria-hidden />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-purple-500/[0.04] blur-[60px]" aria-hidden />

        {/* Glassflow centerpiece */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-indigo-500/[0.15] blur-[80px]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-indigo-500/[0.1] blur-[30px]" />
          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-md">
            <ArrowLeftRight className="h-10 w-10 text-white/60 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          </div>
        </div>

        <h3 className="text-lg font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
          No intents yet
        </h3>
        <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-white/50">
          Browse the marketplace and use the Buy, Invest, or Express Interest buttons to create
          your first transaction intent.
        </p>
        <Link
          href="/marketplace"
          className="group mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-6 py-3 text-xs font-medium text-white/65 backdrop-blur-xl transition-all duration-400 hover:border-violet-500/20 hover:text-white hover:shadow-[0_0_24px_rgba(139,92,246,0.1)]"
        >
          Browse marketplace
          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="relative space-y-10">
      {/* Noise texture overlay */}
      <div className="noise absolute inset-0 pointer-events-none" />
      {active.length > 0 && (
        <section>
          {/* Section header — active */}
          <div className="mb-5 flex items-center gap-3.5">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-2 rounded-full bg-emerald-500/[0.15] blur-lg" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] text-emerald-400 backdrop-blur-sm">
                <Zap className="h-4 w-4 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
                Active
              </h2>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 tabular-nums shadow-[0_0_8px_rgba(52,211,153,0.15)]">
                {active.length}
              </span>
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-transparent" />
          </div>
          <div className="space-y-3">
            {active.map((intent) => (
              <IntentCard key={intent.id} intent={intent} onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}

      {terminal.length > 0 && (
        <section>
          {/* Section header — history */}
          <div className="mb-5 flex items-center gap-3.5">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-2 rounded-full bg-white/[0.04] blur-lg" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] text-zinc-500 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-400 to-zinc-600">
                History
              </h2>
              <span className="rounded-full border border-white/[0.05] bg-white/[0.02] px-2.5 py-0.5 text-[10px] font-medium text-white/55 tabular-nums">
                {terminal.length}
              </span>
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/[0.03] to-transparent" />
          </div>
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
