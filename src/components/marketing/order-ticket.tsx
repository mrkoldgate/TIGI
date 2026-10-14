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
// estimated rent, which all count to their new values. Sample figures match
// the Westlands Residences row in the market table ($100 a share, 8.4%
// estimated yield). Illustration only — not a live offering.
// ---------------------------------------------------------------------------

const PRICE_PER_SHARE = 100
const EST_YIELD = 0.084
const AMOUNTS = [100, 500, 1000, 2500]

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
  const [amount, setAmount] = useState(500)
  const shares = amount / PRICE_PER_SHARE
  const rentYear = amount * EST_YIELD

  const tAmount = useTween(amount)
  const tShares = useTween(shares)
  const tRentYear = useTween(rentYear)

  const shareCount = Math.round(tShares)
  const rows: Array<[string, string]> = [
    ['You receive', `${shareCount} ${shareCount === 1 ? 'share' : 'shares'}`],
    ['Est. rent a year', usd(tRentYear, 2)],
    ['Est. rent a month', usd(tRentYear / 12, 2)],
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
          Rent estimate uses an {(EST_YIELD * 100).toFixed(1)}% sample yield, before fees. Not a forecast.
        </p>
      </div>
    </MouseTiltCard>
  )
}
