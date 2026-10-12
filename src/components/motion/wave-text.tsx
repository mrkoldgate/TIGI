'use client'

import { Fragment, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Wave headlines — after the Refero Styles hero: each character fades in from
// deep indigo, rides a colour wave (indigo → violet → orchid → lilac) and
// settles on white, sweeping left to right. The rotating variant dissolves the
// outgoing phrase left-to-right while the next one waves in behind it.
// ---------------------------------------------------------------------------

/** Split text into word-wrapped spans of characters with a stagger index. */
export function WaveChars({ text, start = 0, step = 32 }: { text: string; start?: number; step?: number }) {
  let i = start
  const words = text.split(' ')
  return (
    <>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span className="wave-word">
            {Array.from(w).map((ch, ci) => {
              const delay = i++ * step
              return (
                <span key={ci} className="ch" style={{ ['--d' as string]: `${delay}ms` }}>
                  {ch}
                </span>
              )
            })}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}

/**
 * Rotating hero headline. Renders a real <h1> whose accessible name is the
 * first phrase; the animated layers are aria-hidden.
 */
export function WaveHeadline({
  phrases,
  className,
  interval = 4800,
}: {
  phrases: string[]
  className?: string
  interval?: number
}) {
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (phrases.length < 2) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      setIndex((cur) => {
        setPrev(cur)
        return (cur + 1) % phrases.length
      })
      setCycle((c) => c + 1)
    }, interval)
    return () => window.clearInterval(id)
  }, [phrases.length, interval])

  return (
    <h1 className={cn('wave-stack', className)}>
      <span className="sr-only">{phrases[0]}</span>
      {prev !== null && (
        <span key={`out-${cycle}`} className="wave-layer wave-out" aria-hidden="true">
          <WaveChars text={phrases[prev]} step={26} />
        </span>
      )}
      <span key={`in-${cycle}`} className="wave-layer wave-in" aria-hidden="true">
        <WaveChars text={phrases[index]} start={prev !== null ? 6 : 4} step={34} />
      </span>
    </h1>
  )
}
