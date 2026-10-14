'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { WaveChars } from '@/components/motion/wave-text'
import { MouseTiltCard } from '@/components/ui/interactions'
import { NeonSkyline } from '@/components/shared/neon-skyline'
import { photoUrl, PHOTOS, type PhotoKey } from '@/lib/photography'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Cinematic building blocks for TIGI's public pages — the homepage's motion
// language (wave titles, parallax photography, tilt + glow, scroll-driven
// light) packaged for the inner pages so none of them reads as a plain list.
//
//   PageHero      full-bleed parallax photo hero with neon skyline
//   StepStory     sticky scroll-story: photo + glowing numeral on one side,
//                 steps lighting up along a neon rail on the other
//   ReportCard    tilt glass "title report" whose checks tick on in sequence
//   GlowTile      tilt card with cursor spotlight and edge glow
//   CountUp       a number that counts up when it scrolls into view
//   ParallaxBand  full-bleed parallax photograph with a statement over it
//   CtaBand       closing call to action on a parallax photo
//   CityMarquee   slow ribbon of city names in outline and solid type
//
// Everything respects prefers-reduced-motion.
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0')

/** Night photos keep more of their own light; daytime photos are pushed darker. */
const NIGHT: PhotoKey[] = ['lagosNight', 'nigeriaNight', 'josDusk']
const grade = (p: PhotoKey) => (NIGHT.includes(p) ? 'night-grade night-grade--lit' : 'night-grade')

// ── PageHero ────────────────────────────────────────────────────────────────

export function PageHero({
  eyebrow,
  title,
  lede,
  photo,
  live = false,
  children,
  position = '50% 50%',
}: {
  eyebrow: string
  title: string
  lede?: React.ReactNode
  photo: PhotoKey
  live?: boolean
  children?: React.ReactNode
  position?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={ref}
      className="relative isolate -mt-[72px] flex min-h-[92svh] flex-col justify-end overflow-hidden pb-20 pt-[150px] md:pb-28"
    >
      <motion.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y: imgY, scale: imgScale }}>
        <Image
          src={photoUrl(photo, 2400, 80)}
          alt={PHOTOS[photo].alt}
          fill
          priority
          sizes="100vw"
          className={`${grade(photo)} object-cover`}
          style={{ objectPosition: position }}
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#22184f] opacity-45 mix-blend-multiply" aria-hidden="true" />
      {/* Night grade: legibility on the left, violet light top-right, black into the page */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 85% 10%, rgba(110,91,243,0.38) 0%, rgba(110,91,243,0) 55%),' +
            'linear-gradient(90deg, rgba(5,5,7,0.94) 0%, rgba(5,5,7,0.72) 36%, rgba(5,5,7,0.18) 72%, rgba(5,5,7,0.05) 100%),' +
            'linear-gradient(180deg, rgba(5,5,7,0.7) 0%, rgba(5,5,7,0) 22%, rgba(5,5,7,0.15) 62%, #050507 100%)',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10" aria-hidden="true">
        <NeonSkyline glowId="page-hero-glow" className="h-[30vh] min-h-[180px] w-full opacity-75" />
      </div>

      <motion.div
        className="mx-auto w-full max-w-[1200px] px-5 sm:px-8"
        style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <p data-reveal="fade" className="text-label flex items-center gap-2.5 !text-[#D4D4DE]">
          {live && <span className="live-dot" aria-hidden="true" />}
          {eyebrow}
        </p>
        <h1 data-reveal="wave" className="text-hero mt-7 max-w-[15ch]">
          <WaveChars text={title} />
        </h1>
        {lede && (
          <div data-reveal="up" data-reveal-delay="200" className="mt-7 max-w-[54ch] text-[18px] leading-relaxed text-[#D4D4DE]">
            {lede}
          </div>
        )}
        {children && (
          <div data-reveal="up" data-reveal-delay="320" className="mt-9">
            {children}
          </div>
        )}
        <p className="text-caption mt-10 !text-[#8E8E9C]">Photo · {PHOTOS[photo].credit}</p>
      </motion.div>

      <a
        href="#content"
        aria-label="Scroll to content"
        className="text-label absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 !text-[#A0A0B2] no-underline transition-colors hover:!text-white md:flex"
      >
        Scroll <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
      </a>
    </section>
  )
}

// ── StepStory ───────────────────────────────────────────────────────────────

export type Story = { t: string; d: string; photo: PhotoKey; meta?: string }

export function StepStory({ steps }: { steps: Story[] }) {
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 62%', 'end 62%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 })

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.idx))
        })
      },
      { rootMargin: '-42% 0px -52% 0px' },
    )
    items.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const current = steps[active]

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
      {/* Sticky stage */}
      <div className="hidden lg:block">
        <div className="sticky top-[110px]">
          <div className="plate relative aspect-[4/5] overflow-hidden rounded-[22px] ring-1 ring-white/[0.08] shadow-[0_40px_120px_-40px_rgba(110,91,243,0.55)]">
            {steps.map((s, i) => (
              <Image
                key={s.t}
                src={photoUrl(s.photo, 1400, 78)}
                alt={i === active ? PHOTOS[s.photo].alt : ''}
                fill
                sizes="45vw"
                className={cn(
                  'object-cover transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                  i === active ? 'scale-100 opacity-100' : 'scale-[1.1] opacity-0',
                )}
              />
            ))}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(5,5,7,0.55) 0%, rgba(5,5,7,0) 30%, rgba(5,5,7,0.2) 55%, rgba(5,5,7,0.94) 100%), radial-gradient(ellipse at 20% 100%, rgba(110,91,243,0.35), transparent 60%)',
              }}
              aria-hidden="true"
            />
            {/* Progress segments */}
            <div className="absolute inset-x-7 top-7 flex gap-1.5" aria-hidden="true">
              {steps.map((s, i) => (
                <span key={s.t} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
                  <span
                    className={cn(
                      'block h-full origin-left rounded-full bg-gradient-to-r from-violet-300 to-fuchsia-300 shadow-[0_0_10px_rgba(196,181,253,0.9)] transition-transform duration-700',
                      i <= active ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </span>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-200">
                Step {pad(active + 1)} of {pad(steps.length)}
              </p>
              <p key={`n${active}`} className="story-numeral mt-1">
                {pad(active + 1)}
              </p>
              <p key={`t${active}`} className="story-title text-h2 !text-[28px]">
                {current.t}
              </p>
              <p className="text-caption mt-3 !text-[#A0A0B2]">Photo · {PHOTOS[current.photo].credit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps along the light rail */}
      <ol ref={listRef} className="relative pl-14 sm:pl-16">
        <span className="absolute bottom-6 left-[19px] top-6 w-px bg-white/10 sm:left-[23px]" aria-hidden="true" />
        <motion.span
          className="absolute bottom-6 left-[19px] top-6 w-[2px] origin-top -translate-x-[0.5px] rounded-full bg-gradient-to-b from-violet-200 via-violet-400 to-fuchsia-400 shadow-[0_0_14px_rgba(167,139,250,0.95)] sm:left-[23px]"
          style={{ scaleY: reduce ? 1 : fill }}
          aria-hidden="true"
        />
        {steps.map((s, i) => {
          const on = i === active
          const passed = i <= active
          return (
            <li
              key={s.t}
              ref={(el) => {
                items.current[i] = el
              }}
              data-idx={i}
              className="relative flex flex-col justify-center py-9 lg:min-h-[58vh] lg:py-14"
            >
              <div className="relative">
                <span
                  className={cn(
                    'absolute -left-14 top-0 grid h-10 w-10 place-items-center rounded-full border font-mono text-[12px] transition-all duration-500 sm:-left-16 sm:h-12 sm:w-12',
                    passed
                      ? 'border-violet-300/70 bg-[#1a1433] text-violet-100 shadow-[0_0_0_6px_rgba(110,91,243,0.12),0_0_28px_rgba(139,92,246,0.75)]'
                      : 'border-white/15 bg-[#0b0b10] text-[#8E8E9C]',
                  )}
                  aria-hidden="true"
                >
                  {pad(i + 1)}
                </span>
                <div className="plate relative mb-6 aspect-[16/10] overflow-hidden rounded-xl lg:hidden">
                  <Image src={photoUrl(s.photo, 1000, 75)} alt={PHOTOS[s.photo].alt} fill sizes="100vw" className="object-cover" />
                </div>
                <h3
                  className={cn(
                    'font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] font-[500] leading-[1.12] transition-colors duration-500',
                    on ? 'text-white' : 'text-white/40',
                  )}
                  style={{ fontStretch: '110%' }}
                >
                  {s.t}
                </h3>
                <p
                  className={cn(
                    'mt-4 max-w-[46ch] text-[17px] leading-relaxed transition-colors duration-500',
                    on ? 'text-[#D4D4DE]' : 'text-[#70707E]',
                  )}
                >
                  {s.d}
                </p>
                {s.meta && (
                  <p className={cn('text-label mt-6 transition-colors duration-500', on ? '!text-violet-200' : '')}>{s.meta}</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ── ReportCard ──────────────────────────────────────────────────────────────

export function ReportCard({
  kicker,
  title,
  place,
  rows,
  resultLabel = 'Clear',
  footer,
}: {
  kicker: string
  title: string
  place: string
  rows: Array<[string, string]>
  resultLabel?: string
  footer?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const reduce = useReducedMotion()
  const [done, setDone] = useState(false)
  const step = 260

  useEffect(() => {
    if (!inView) return
    if (reduce) return setDone(true)
    const t = window.setTimeout(() => setDone(true), rows.length * step + 500)
    return () => window.clearTimeout(t)
  }, [inView, reduce, rows.length])

  const shown = inView || reduce

  return (
    <div ref={ref}>
      <MouseTiltCard maxTilt={7} spotlightColor="rgba(139, 92, 246, 0.16)" className="rounded-2xl">
        <div className="report-card glass-glossy edge-lit relative overflow-hidden rounded-2xl p-7">
          {shown && !done && <span className="report-scan" aria-hidden="true" />}
          <div className="flex items-center justify-between gap-4">
            <span className="text-label">{kicker}</span>
            <span className={cn('pill !py-1 !text-[11px] transition-colors duration-500', done ? 'text-emerald-200' : 'text-violet-200')}>
              <span
                className={cn('h-1.5 w-1.5 rounded-full', done ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]' : 'animate-pulse bg-violet-300')}
                aria-hidden="true"
              />
              {done ? resultLabel : 'Checking…'}
            </span>
          </div>
          <p className="mt-6 text-[19px] font-medium text-[#F5F5F7]">{title}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#8E8E9C]">{place}</p>

          <ul className="mt-7 space-y-0">
            {rows.map(([k, v], i) => (
              <li
                key={k}
                className="report-row flex items-center justify-between gap-4 border-b border-white/[0.06] py-3.5 text-sm last:border-0"
                style={{ ['--i' as string]: i, ['--step' as string]: `${step}ms` }}
                data-on={shown ? '' : undefined}
              >
                <span className="flex items-center gap-3 text-[#B4B4C0]">
                  <svg viewBox="0 0 20 20" className="report-tick h-5 w-5 flex-shrink-0" aria-hidden="true">
                    <circle cx="10" cy="10" r="9" />
                    <path d="M6 10.4l2.6 2.6L14.2 7.4" pathLength={1} />
                  </svg>
                  {k}
                </span>
                <span className="report-value text-right text-[#F5F5F7]">{v}</span>
              </li>
            ))}
          </ul>
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </MouseTiltCard>
    </div>
  )
}

// ── GlowTile ────────────────────────────────────────────────────────────────

export function GlowTile({
  children,
  className,
  innerClassName,
  tilt = 6,
}: {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  tilt?: number
}) {
  return (
    <MouseTiltCard maxTilt={tilt} spotlightColor="rgba(139, 92, 246, 0.15)" className={cn('h-full rounded-[20px]', className)}>
      <div className={cn('glow-tile h-full rounded-[20px] p-7', innerClassName)} data-glow>
        {children}
      </div>
    </MouseTiltCard>
  )
}

// ── CountUp ─────────────────────────────────────────────────────────────────

export function CountUp({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1600,
  className,
}: {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) return setVal(to)
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 4)
      setVal(to * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce, to, duration])

  const text = val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  )
}

// ── ParallaxBand ────────────────────────────────────────────────────────────

export function ParallaxBand({
  photo,
  kicker,
  statement,
  children,
  position = '50% 50%',
}: {
  photo: PhotoKey
  kicker?: string
  statement: string
  children?: React.ReactNode
  position?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-14%', '14%'])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.18, 1.08, 1.18])

  return (
    <section ref={ref} className="relative isolate flex min-h-[78vh] items-end overflow-hidden py-20 md:py-28">
      <motion.div className="absolute inset-x-0 -inset-y-[16%] -z-20" style={reduce ? undefined : { y, scale }}>
        <Image src={photoUrl(photo, 2400, 78)} alt={PHOTOS[photo].alt} fill sizes="100vw" className={`${grade(photo)} object-cover`} style={{ objectPosition: position }} />
      </motion.div>
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, #050507 0%, rgba(5,5,7,0.25) 22%, rgba(5,5,7,0.25) 55%, #050507 100%),' +
            'linear-gradient(90deg, rgba(5,5,7,0.85) 0%, rgba(5,5,7,0.2) 60%),' +
            'radial-gradient(ellipse at 10% 90%, rgba(110,91,243,0.4), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        {kicker && (
          <p data-reveal="fade" className="text-label !text-violet-200">
            {kicker}
          </p>
        )}
        <p data-reveal="wave" className="text-hero mt-6 max-w-[18ch] !text-[clamp(2.2rem,1.4rem+3.4vw,4.4rem)]">
          <WaveChars text={statement} step={22} />
        </p>
        {children && (
          <div data-reveal="up" data-reveal-delay="200" className="mt-7">
            {children}
          </div>
        )}
        <p className="text-caption mt-10 !text-[#8E8E9C]">Photo · {PHOTOS[photo].credit}</p>
      </div>
    </section>
  )
}

// ── CtaBand ─────────────────────────────────────────────────────────────────

export function CtaBand({
  photo,
  title,
  body,
  children,
  position = '50% 50%',
}: {
  photo: PhotoKey
  title: string
  body?: React.ReactNode
  children?: React.ReactNode
  position?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
      <div
        ref={ref}
        data-reveal="scale"
        className="cta-band relative isolate overflow-hidden rounded-[28px] px-7 py-16 ring-1 ring-white/[0.08] sm:px-14 sm:py-20"
      >
        <motion.div className="absolute inset-x-0 -inset-y-[14%] -z-20" style={reduce ? undefined : { y }}>
          <Image src={photoUrl(photo, 2000, 76)} alt="" fill sizes="(min-width: 1200px) 1200px, 100vw" className={`${grade(photo)} object-cover`} style={{ objectPosition: position }} />
        </motion.div>
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(90deg, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.78) 45%, rgba(5,5,7,0.25) 100%),' +
              'radial-gradient(ellipse at 100% 0%, rgba(110,91,243,0.5), transparent 55%)',
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 opacity-80" aria-hidden="true">
          <NeonSkyline glowId="cta-band-glow" className="h-[150px] w-full" />
        </div>
        <h2 data-reveal="wave" className="text-display max-w-[20ch]">
          <WaveChars text={title} step={24} />
        </h2>
        {body && <div className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-[#D4D4DE]">{body}</div>}
        {children && <div className="mt-9 flex flex-wrap gap-3">{children}</div>}
      </div>
    </div>
  )
}

// ── CityMarquee ─────────────────────────────────────────────────────────────

export function CityMarquee({ items }: { items: string[] }) {
  const row = [...items, ...items]
  return (
    <div
      className="relative overflow-hidden border-y border-white/[0.07] py-7 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]"
      aria-hidden="true"
    >
      <div className="animate-marquee flex w-max items-center gap-10 [animation-duration:55s]">
        {row.map((c, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className={cn('city-word', i % 2 === 1 && 'city-word--outline')}>{c}</span>
            <span className="h-2 w-2 rotate-45 bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,1)]" />
          </span>
        ))}
      </div>
    </div>
  )
}

// ── CompareBars ─────────────────────────────────────────────────────────────

export function CompareBars({
  rows,
  max,
}: {
  rows: Array<{ label: string; tigi: number; market: number; marketLabel: string; unit?: string }>
  max: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reduce = useReducedMotion()
  const on = inView || reduce
  return (
    <div ref={ref} className="space-y-8">
      {rows.map((r, i) => (
        <div key={r.label}>
          <p className="text-[15px] font-medium text-[#F5F5F7]">{r.label}</p>
          <div className="mt-3 space-y-2.5">
            {[
              { who: 'TIGI', v: r.tigi, hot: true },
              { who: r.marketLabel, v: r.market, hot: false },
            ].map((b, j) => (
              <div key={b.who} className="grid grid-cols-[110px_1fr_56px] items-center gap-3">
                <span className={cn('text-[13px]', b.hot ? 'text-violet-100' : 'text-[#8E8E9C]')}>{b.who}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className={cn(
                      'block h-full origin-left rounded-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                      b.hot
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-300 shadow-[0_0_16px_rgba(167,139,250,0.9)]'
                        : 'bg-white/25',
                    )}
                    style={{
                      width: `${(b.v / max) * 100}%`,
                      transform: on ? 'scaleX(1)' : 'scaleX(0)',
                      transitionDelay: `${i * 180 + j * 90}ms`,
                    }}
                  />
                </span>
                <span className={cn('text-right font-mono text-[13px] tabular-nums', b.hot ? 'text-white' : 'text-[#A0A0B2]')}>
                  {b.v}
                  {r.unit ?? '%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── PhotoBackdrop ───────────────────────────────────────────────────────────

export function PhotoBackdrop({
  photo,
  children,
  position = '50% 50%',
}: {
  photo: PhotoKey
  children: React.ReactNode
  position?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 160])
  return (
    <section ref={ref} className="relative isolate -mt-[72px] overflow-hidden pt-[72px]">
      <motion.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y }}>
        <Image src={photoUrl(photo, 2400, 78)} alt="" fill priority sizes="100vw" className={`${grade(photo)} object-cover`} style={{ objectPosition: position }} />
      </motion.div>
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 90% 0%, rgba(110,91,243,0.4), transparent 50%),' +
            'linear-gradient(90deg, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.82) 45%, rgba(5,5,7,0.55) 100%),' +
            'linear-gradient(180deg, rgba(5,5,7,0.5) 0%, rgba(5,5,7,0.2) 40%, #050507 100%)',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10" aria-hidden="true">
        <NeonSkyline glowId="backdrop-glow" className="h-[26vh] min-h-[160px] w-full opacity-70" />
      </div>
      {children}
      <p className="text-caption mx-auto w-full max-w-[1200px] px-5 pb-6 !text-[#8E8E9C] sm:px-8">Photo · {PHOTOS[photo].credit}</p>
    </section>
  )
}
