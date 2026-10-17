'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { MouseTiltCard } from '@/components/ui/interactions'
import { photoUrl } from '@/lib/photography'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// OrderTicket — the homepage's sample "buy shares" ticket. The amount chips
// are live: picking one updates the amount, the number of shares and the
// estimated rent, which all count to their new values. It leads with the
// yearly yield and yearly rent (not monthly pocket change) and shows rent over
// a five-year hold, simple sum, no reinvestment and no price growth. Sample
// figures match the Westlands Residences row in the market table ($100 a
// share, 8.4% estimated yield). Illustration only — not a live offering.
// ---------------------------------------------------------------------------

const PRICE_PER_SHARE = 100
const EST_YIELD = 0.084
const AMOUNTS = [100, 500, 1000, 2500, 5000, 10000]
const HOLD_YEARS = 5

const usd = (n: number, digits = 0) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

/** Tweens a number toward `target` whenever it changes. */
function useTween(target: number, duration = 650) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    if (reduce) {
      from.current = target
      setValue(target)
      return
    }
    const start = from.current
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = start + (target - start) * eased
      from.current = v
      setValue(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduce])

  return value
}

export function OrderTicket() {
  const [amount, setAmount] = useState(2500)
  const shares = amount / PRICE_PER_SHARE
  const rentYear = amount * EST_YIELD

  const tAmount = useTween(amount)
  const tShares = useTween(shares)
  const tRentYear = useTween(rentYear)

  const shareCount = Math.round(tShares)
  const rows: Array<[string, string]> = [
    ['You receive', `${shareCount.toLocaleString('en-US')} ${shareCount === 1 ? 'share' : 'shares'}`],
    ['Fees', 'Shown in the offering'],
    ['Payment held by', 'Licensed escrow'],
    ['Recorded on', 'Share register'],
  ]

  return (
    <MouseTiltCard maxTilt={6} spotlightColor="rgba(139, 92, 246, 0.10)" className="rounded-xl">
      <div className="glass-glossy edge-lit rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="plate h-14 w-14 flex-shrink-0 rounded-md">
            <Image src={photoUrl('nairobiSkyline', 200, 70)} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div>
            <p className="text-[15px] font-medium text-[#F5F5F7]">Westlands Residences</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8E8E9C]">
              Nairobi · Sample · {usd(PRICE_PER_SHARE)} / share
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-black px-5 py-5">
          <p className="text-label">Amount</p>
          <p
            className="mt-2 font-display text-[40px] font-[480] leading-none tracking-[0.01em] tabular-nums text-[#F5F5F7]"
            style={{ fontStretch: '112%' }}
            aria-live="polite"
          >
            {usd(Math.round(tAmount))}
          </p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose an amount">
            {AMOUNTS.map((a) => {
              const on = a === amount
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  aria-pressed={on}
                  className={cn(
                    'rounded-full px-3 py-1.5 font-mono text-xs transition-all duration-300',
                    on
                      ? 'bg-[#F5F5F7] text-black shadow-[0_0_18px_rgba(196,181,253,0.55)]'
                      : 'bg-[#14141B] text-[#C3C3CC] hover:bg-[#1f1b33] hover:text-white hover:shadow-[0_0_14px_rgba(139,92,246,0.45)]',
                  )}
                >
                  {usd(a)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Returns: yield and yearly rent first, then the five-year hold */}
        <div className="mt-4 grid grid-cols-2 gap-1.5">
          <div className="rounded-lg bg-black/60 px-5 py-4">
            <p className="text-label">Est. rent yield</p>
            <p className="mt-2 font-display text-[30px] font-[480] leading-none tabular-nums text-[#C4B5FD]" style={{ fontStretch: '112%' }}>
              {(EST_YIELD * 100).toFixed(1)}%
            </p>
            <p className="mt-1.5 text-[12px] text-[#8E8E9C]">a year, before fees</p>
          </div>
          <div className="rounded-lg bg-black/60 px-5 py-4">
            <p className="text-label">Est. rent a year</p>
            <p className="mt-2 font-display text-[30px] font-[480] leading-none tabular-nums text-[#F5F5F7]" style={{ fontStretch: '112%' }} aria-live="polite">
              {usd(tRentYear)}
            </p>
            <p className="mt-1.5 text-[12px] text-[#8E8E9C]">paid out to you</p>
          </div>
        </div>
        <p className="mt-3 flex items-baseline justify-between gap-4 rounded-lg border border-white/[0.06] px-5 py-3 text-sm">
          <span className="text-[#C3C3CC]">Est. rent over a {HOLD_YEARS}-year hold</span>
          <span className="tabular-nums text-[17px] font-medium text-[#F5F5F7]">{usd(tRentYear * HOLD_YEARS)}</span>
        </p>

        <dl className="mt-5 space-y-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-[#8E8E9C]">{k}</dt>
              <dd className="tabular-nums text-[#F5F5F7]">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="btn-primary mt-6 w-full">Review order</div>
        <p className="mt-3 text-center text-[11px] text-[#8E8E9C]">
          Sample figures: an {(EST_YIELD * 100).toFixed(1)}% yearly rent yield before fees, and the {HOLD_YEARS}-year figure is rent only,
          not reinvested. Not a forecast. Rent can fall and property values can go down.
        </p>
      </div>
    </MouseTiltCard>
  )
}
