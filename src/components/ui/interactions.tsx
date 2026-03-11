'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================================
// MAGNETIC WRAPPER
// Adds a spring-physics magnetic pull effect on hover
// ============================================================================
export function Magnetic({ children, strength = 0.2, className }: { children: React.ReactNode, strength?: number, className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return
        const { clientX, clientY } = e
        const { height, width, left, top } = ref.current.getBoundingClientRect()
        const middleX = clientX - (left + width / 2)
        const middleY = clientY - (top + height / 2)
        setPosition({ x: middleX * strength, y: middleY * strength })
    }

    const reset = () => setPosition({ x: 0, y: 0 })

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
            className={cn('inline-block', className)}
        >
            {children}
        </motion.div>
    )
}

// ============================================================================
// SCROLL PARALLAX WRAPPER
// Applies a vertical parallax effect connected to scroll position
// ============================================================================
export function ScrollParallax({ children, offset = 50, className }: { children: React.ReactNode, offset?: number, className?: string }) {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [-offset, offset])

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    )
}

// ============================================================================
// SPOTLIGHT CARD
// A glass card that casts a glowing orb tracking the user's mouse
// ============================================================================
export function SpotlightCard({ children, className, spotlightColor = 'rgba(255, 255, 255, 0.06)' }: { children: React.ReactNode, className?: string, spotlightColor?: string }) {
    const divRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || isFocused) return
        const div = divRef.current
        const rect = div.getBoundingClientRect()
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleFocus = () => { setIsFocused(true); setOpacity(1) }
    const handleBlur = () => { setIsFocused(false); setOpacity(0) }
    const handleMouseEnter = () => setOpacity(1)
    const handleMouseLeave = () => setOpacity(0)

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'group relative overflow-hidden rounded-3xl border border-white/10 bg-[#020409]/40',
                className
            )}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
                aria-hidden="true"
            />
            {children}
        </div>
    )
}

// ============================================================================
// TEXT REVEAL
// Staggered word/character entrance animation for hero headings
// ============================================================================
export function TextReveal({ text, className, style, delay = 0, by = 'word' }: { text: string, className?: string, style?: React.CSSProperties, delay?: number, by?: 'word' | 'char' }) {
    const items = by === 'word' ? text.split(' ') : text.split('')

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: by === 'char' ? 0.03 : 0.12, delayChildren: delay }
        },
    }

    const child = {
        visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 12, stiffness: 200 } },
        hidden: { opacity: 0, y: 40 },
    }

    return (
        <motion.div
            className={cn('flex flex-wrap', className)}
            style={style}
            variants={container}
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
        >
            {items.map((item, index) => (
                <motion.span
                    variants={child}
                    key={index}
                    className="inline-block"
                >
                    {item}
                    {by === 'word' && index < items.length - 1 && '\u00A0'}
                </motion.span>
            ))}
        </motion.div>
    )
}

// ============================================================================
// MOUSE TILT CARD
// Spring-physics 3D card tilt that tracks mouse cursor. Renders a radial
// spotlight that moves with the mouse. Use for hero panels and feature cards.
//
// Props:
//   maxTilt       — max rotation in degrees (default 10)
//   spotlightColor — CSS color for the spotlight (default blue)
//   perspective   — CSS perspective value in px (default 1200)
// ============================================================================
export function MouseTiltCard({
    children,
    className,
    spotlightColor = 'rgba(59,130,246,0.12)',
    maxTilt = 10,
    perspective = 1200,
}: {
    children: React.ReactNode
    className?: string
    spotlightColor?: string
    maxTilt?: number
    perspective?: number
}) {
    const ref = useRef<HTMLDivElement>(null)

    const rawX = useMotionValue(0)
    const rawY = useMotionValue(0)

    const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
        stiffness: 180, damping: 22, mass: 0.5,
    })
    const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
        stiffness: 180, damping: 22, mass: 0.5,
    })

    const [spot, setSpot] = useState({ x: 0, y: 0, visible: false })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const nx = (e.clientX - rect.left) / rect.width - 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5
        rawX.set(nx)
        rawY.set(ny)
        setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true })
    }

    const handleMouseLeave = () => {
        rawX.set(0)
        rawY.set(0)
        setSpot(s => ({ ...s, visible: false }))
    }

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective }}
            className={cn('relative', className)}
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                className="relative"
            >
                {/* Radial spotlight that tracks cursor */}
                <div
                    className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-400"
                    style={{
                        opacity: spot.visible ? 1 : 0,
                        background: `radial-gradient(480px circle at ${spot.x}px ${spot.y}px, ${spotlightColor}, transparent 65%)`,
                    }}
                    aria-hidden="true"
                />
                {children}
            </motion.div>
        </div>
    )
}

// ============================================================================
// NAV PROGRESS BAR
// A thin gradient line pinned to the bottom of the navbar, growing from left
// to right as the user scrolls the page. Uses spring smoothing so it trails
// the scroll position with satisfying inertia.
// ============================================================================
export function NavProgressBar({ className }: { className?: string }) {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

    return (
        <motion.div
            style={{ scaleX, originX: 0 }}
            className={cn(
                'absolute bottom-0 left-0 right-0 h-[1.5px]',
                className
            )}
            aria-hidden="true"
        >
            <div
                className="h-full w-full"
                style={{
                    background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #10B981 100%)',
                    boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                }}
            />
        </motion.div>
    )
}

// ============================================================================
// CLIP REVEAL
// The signature Webflow-award move: text lifts from behind an overflow:hidden
// mask so it appears to emerge from the page surface rather than just fading.
// Wrap individual lines or display headings — NOT large blocks.
//
// The parent sets overflow:hidden. The child slides from y:110% → y:0% with
// spring physics. pb-[0.12em] prevents descender clipping on g/y/p glyphs.
// ============================================================================
export function ClipReveal({
    children,
    className,
    delay = 0,
    once = true,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
    once?: boolean
}) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once, margin: '-6% 0px' })

    return (
        <div ref={ref} className={cn('overflow-hidden pb-[0.12em]', className)}>
            <motion.div
                initial={{ y: '110%' }}
                animate={isInView ? { y: '0%' } : { y: '110%' }}
                transition={{
                    type: 'spring',
                    stiffness: 52,
                    damping: 16,
                    mass: 0.9,
                    delay,
                }}
            >
                {children}
            </motion.div>
        </div>
    )
}

// ============================================================================
// MOTION REVEAL
// Framer-motion scroll reveal with spring physics. Drop-in replacement for
// <ScrollReveal> when you need more satisfying spring entry animations.
//
// Variants: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
// ============================================================================
export function MotionReveal({
    children,
    className,
    direction = 'up',
    delay = 0,
    distance = 52,
    once = true,
}: {
    children: React.ReactNode
    className?: string
    direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
    delay?: number
    distance?: number
    once?: boolean
}) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once, margin: '-8% 0px' })

    type VariantMap = Record<string, { y?: number; x?: number; scale?: number; opacity: number }>

    const initial: VariantMap = {
        up:    { y: distance,  opacity: 0 },
        down:  { y: -distance, opacity: 0 },
        left:  { x: distance,  opacity: 0 },
        right: { x: -distance, opacity: 0 },
        scale: { scale: 0.88,  opacity: 0 },
        fade:  { opacity: 0 },
    }

    const visible: VariantMap = {
        up:    { y: 0,     opacity: 1 },
        down:  { y: 0,     opacity: 1 },
        left:  { x: 0,     opacity: 1 },
        right: { x: 0,     opacity: 1 },
        scale: { scale: 1, opacity: 1 },
        fade:  { opacity: 1 },
    }

    return (
        <motion.div
            ref={ref}
            initial={initial[direction]}
            animate={isInView ? visible[direction] : initial[direction]}
            transition={{
                type: 'spring',
                stiffness: 72,
                damping: 18,
                mass: 0.8,
                delay,
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
