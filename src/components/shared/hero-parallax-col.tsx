'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

// ---------------------------------------------------------------------------
// HeroParallaxCol
// Wraps the hero right column so it drifts upward as the page scrolls.
// Creates immediate cinematic depth — the floating panel "hangs back" while
// the page content flows beneath it.
//
// Uses a spring-smoothed scroll transform so the motion trails naturally
// rather than being a rigid 1:1 offset.
// ---------------------------------------------------------------------------
export function HeroParallaxCol({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const { scrollY } = useScroll()
    const rawY = useTransform(scrollY, [0, 900], [0, -80])
    const y = useSpring(rawY, { stiffness: 48, damping: 18, mass: 0.9 })

    return (
        <motion.div style={{ y }} className={className}>
            {children}
        </motion.div>
    )
}
