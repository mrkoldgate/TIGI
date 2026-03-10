'use client'

import { useEffect, useRef, type ReactNode } from 'react'

// ---------------------------------------------------------------------------
// ScrollReveal — declarative wrapper for scroll-triggered animations.
//
// Usage:
//   <ScrollReveal animation="up" delay={200}>
//     <h2>This slides up when scrolled into view</h2>
//   </ScrollReveal>
// ---------------------------------------------------------------------------

interface ScrollRevealProps {
    children: ReactNode
    animation?: 'up' | 'left' | 'scale' | 'fade'
    delay?: number
    threshold?: number
    className?: string
}

const animationClass: Record<string, string> = {
    up: 'reveal-up',
    left: 'reveal-left',
    scale: 'reveal-scale',
    fade: 'reveal',
}

export function ScrollReveal({
    children,
    animation = 'up',
    delay = 0,
    threshold = 0.15,
    className = '',
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (delay > 0) {
                            el.style.transitionDelay = `${delay}ms`
                        }
                        el.classList.add('is-visible')
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold, rootMargin: '0px 0px -40px 0px' }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [delay, threshold])

    return (
        <div
            ref={ref}
            className={`${animationClass[animation]} ${className}`}
        >
            {children}
        </div>
    )
}
