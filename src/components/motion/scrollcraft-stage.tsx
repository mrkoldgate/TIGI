'use client'

import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// ScrollCraftStage — mounts the vendored scrollcraft engine (src/vendor/
// scrollcraft) on this element. Children are ordinary server-rendered markup
// carrying data-sc-* attributes (act, stage, cue, kinetic, count, reveal,
// pan, parallax, in); the engine drives them from one scroll value on one rAF
// loop and publishes each act's progress as --sc-p. The engine is loaded on
// the client only, re-laid out when the content changes height (images,
// fonts, accordions) and destroyed on route change.
// ---------------------------------------------------------------------------

type ScApi = { destroy: () => void; layout: () => void }
type ScGlobal = { mount: (root: Element, opts?: object) => ScApi }

export function ScrollCraftStage({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let api: ScApi | null = null
    let ro: ResizeObserver | null = null
    let raf = 0
    let dead = false

    import('@/vendor/scrollcraft/scrollcraft.js').then(() => {
      const sc = (window as unknown as { ScrollCraft?: ScGlobal }).ScrollCraft
      if (dead || !ref.current || !sc) return
      api = sc.mount(ref.current)
      // Act positions are measured once; re-measure when anything above or
      // inside the page changes height (late images, fonts, open FAQ items).
      ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => api?.layout())
      })
      ro.observe(ref.current)
    })

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      ro?.disconnect()
      api?.destroy()
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
