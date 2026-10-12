'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// ParallaxImage — a photo that drifts inside its frame as the page scrolls.
// The image is rendered taller than the frame (by `strength` px on each side)
// so the movement never reveals an edge. Falls back to a static image when the
// visitor prefers reduced motion.
// ---------------------------------------------------------------------------

export function ParallaxImage({
  src,
  alt,
  className,
  sizes = '100vw',
  priority = false,
  strength = 60,
  zoom = true,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  strength?: number
  zoom?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], zoom ? [1.08, 1.02, 1.08] : [1, 1, 1])

  return (
    <div ref={ref} className={cn('plate group', className)}>
      <motion.div
        className="absolute inset-x-0"
        style={reduce ? { top: 0, bottom: 0 } : { top: -strength, bottom: -strength, y, scale }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="zoom-img object-cover" />
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HeroParallax — full-bleed hero photograph that sinks and slowly scales as
// you scroll, while the foreground copy lifts and fades.
// ---------------------------------------------------------------------------

export function HeroParallax({
  src,
  alt,
  children,
}: {
  src: string
  alt: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 220])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.18])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  return (
    <section ref={ref} className="relative isolate -mt-[72px] flex min-h-[100svh] flex-col overflow-hidden">
      <motion.div className="absolute inset-0 -z-10" style={reduce ? undefined : { y: imgY, scale: imgScale }}>
        <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
      </motion.div>
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0,0.55) 0%, rgba(0, 0, 0,0.08) 28%, rgba(0, 0, 0,0.25) 55%, rgba(0, 0, 0,0.92) 88%, #000000 100%)',
        }}
        aria-hidden="true"
      />
      <motion.div className="flex flex-1 flex-col" style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}>
        {children}
      </motion.div>
    </section>
  )
}
