'use client'

import { useEffect, useRef, type RefObject } from 'react'

/**
 * useScrollReveal — adds `.is-visible` to an element when it enters viewport.
 * Pair with CSS classes: .reveal-up, .reveal-left, .reveal-scale
 *
 * @param options.threshold  - 0–1, how much of the element must be visible (default 0.15)
 * @param options.rootMargin - margin around root (default '0px 0px -60px 0px')
 * @param options.once       - only trigger once? (default true)
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options?: {
        threshold?: number
        rootMargin?: string
        once?: boolean
    }
): RefObject<T | null> {
    const ref = useRef<T | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options ?? {}

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible')
                        if (once) observer.unobserve(entry.target)
                    }
                })
            },
            { threshold, rootMargin }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [options])

    return ref
}
