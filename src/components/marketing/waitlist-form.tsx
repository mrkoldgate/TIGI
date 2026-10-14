'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import {
  WAITLIST_AMOUNTS,
  WAITLIST_HOMES,
  WAITLIST_INTERESTS,
  WAITLIST_MARKETS,
  type WaitlistInterest,
} from '@/lib/waitlist/waitlist-options'

// ---------------------------------------------------------------------------
// WaitlistForm — qualified sign-up: where you live, where you want to buy,
// what you need and roughly how much. Posts to /api/waitlist.
// ---------------------------------------------------------------------------

type Status = 'idle' | 'sending' | 'done' | 'error'

export function WaitlistForm({ initialInterest, source }: { initialInterest?: WaitlistInterest; source?: string }) {
  const [interests, setInterests] = useState<WaitlistInterest[]>(initialInterest ? [initialInterest] : ['verify'])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const toggle = (id: WaitlistInterest) =>
    setInterests((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (interests.length === 0) {
      setError('Choose at least one thing you’re interested in.')
      setStatus('error')
      return
    }
    const fd = new FormData(e.currentTarget)
    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fd.get('email'),
          name: fd.get('name'),
          livesIn: fd.get('livesIn'),
          market: fd.get('market'),
          amountRange: fd.get('amountRange') || undefined,
          message: fd.get('message'),
          company: fd.get('company'),
          interests,
          source,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.')
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="panel p-8 text-center" role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/15 ring-1 ring-violet-400/40">
          <Check className="h-5 w-5 text-violet-200" />
        </span>
        <h2 className="text-h3 mt-5">You’re on the list.</h2>
        <p className="mx-auto mt-3 max-w-[40ch] text-[15px] leading-relaxed text-[#C3C3CC]">
          We open each market to the waitlist first and will email you when TIGI is ready where you want to buy.
        </p>
        <Link href="/verify" className="btn-glass mt-7 no-underline">How Verify works</Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="panel space-y-6 p-6 sm:p-8" noValidate={false}>
      <fieldset>
        <legend className="text-label mb-3">I’m interested in</legend>
        <div className="flex flex-wrap gap-2">
          {WAITLIST_INTERESTS.map((i) => {
            const on = interests.includes(i.id)
            return (
              <button
                key={i.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(i.id)}
                className="pill text-left"
              >
                {on && <Check className="h-3.5 w-3.5" />}
                {i.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-label mb-2 block">Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="field" />
        </label>
        <label className="block">
          <span className="text-label mb-2 block">Name <span className="normal-case tracking-normal text-[#6E6E7E]">(optional)</span></span>
          <input name="name" type="text" autoComplete="name" className="field" />
        </label>
        <label className="block">
          <span className="text-label mb-2 block">I live in</span>
          <select name="livesIn" required defaultValue="" className="field appearance-none [&>option]:bg-[#0B0B10]">
            <option value="" disabled>Choose a country</option>
            {WAITLIST_HOMES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-label mb-2 block">I want to buy in</span>
          <select name="market" required defaultValue="" className="field appearance-none [&>option]:bg-[#0B0B10]">
            <option value="" disabled>Choose a country</option>
            {WAITLIST_MARKETS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-label mb-2 block">Rough amount <span className="normal-case tracking-normal text-[#6E6E7E]">(optional)</span></span>
          <select name="amountRange" defaultValue="" className="field appearance-none [&>option]:bg-[#0B0B10]">
            <option value="">Prefer not to say</option>
            {WAITLIST_AMOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-label mb-2 block">Anything we should know? <span className="normal-case tracking-normal text-[#6E6E7E]">(optional)</span></span>
          <textarea name="message" rows={3} maxLength={1000} placeholder="e.g. Buying a plot in Abuja next spring" className="field resize-none" />
        </label>
        {/* Honeypot */}
        <label className="hidden" aria-hidden="true">
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === 'error' && error && (
        <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[44ch] text-xs leading-relaxed text-[#8E8E9C]">
          We use your details only to contact you about TIGI and to plan which markets open first. No offering is made
          by joining.
        </p>
        <button type="submit" disabled={status === 'sending'} className="btn-primary flex-shrink-0 disabled:opacity-60">
          {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Join the waitlist
          {status !== 'sending' && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  )
}
