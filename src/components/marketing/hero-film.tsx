'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, RotateCcw, Volume2, VolumeX } from 'lucide-react'

// ---------------------------------------------------------------------------
// HeroFilm — the homepage header: TIGI's 10-second brand film (land →
// buildings → apartments → vortex → glass "T" lockup). Plays once, muted,
// and holds on the final lockup; the tagline and CTAs fade in beneath the
// logo as it lands. Sound and replay controls sit bottom-right.
//
// Fallbacks: reduced motion, or a browser that blocks autoplay, shows the
// final lockup frame as a still. Phones get the 720p file; wide screens the
// 1080p file. On portrait screens the 16:9 film is contained (letterboxed on
// black, which blends into the film's own background) so the logo is never
// cropped.
// ---------------------------------------------------------------------------

const FILM_1080 = '/media/tigi-film-1080.mp4'
const FILM_720 = '/media/tigi-film-720.mp4'
const POSTER_FIRST = '/media/tigi-film-first.jpg'
const POSTER_LAST = '/media/tigi-film-last.jpg'

/** Second at which the lockup has formed and the tagline may appear. */
const LOCKUP_AT = 8.4

export function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [still, setStill] = useState(false)
  const [landed, setLanded] = useState(false)
  const [ended, setEnded] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStill(true)
      setLanded(true)
      setEnded(true)
      return
    }
    setSrc(window.innerWidth < 900 ? FILM_720 : FILM_1080)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !src) return
    v.muted = true
    const p = v.play()
    if (p) {
      p.catch(() => {
        // Autoplay refused (e.g. low-power mode): show the finished lockup.
        setStill(true)
        setLanded(true)
        setEnded(true)
      })
    }
  }, [src])

  const onTime = () => {
    const v = videoRef.current
    if (v && !landed && v.currentTime >= LOCKUP_AT) setLanded(true)
  }

  const replay = () => {
    const v = videoRef.current
    if (!v) return
    setLanded(false)
    setEnded(false)
    v.currentTime = 0
    void v.play().catch(() => undefined)
  }

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted && v.ended) replay()
  }

  return (
    <section
      aria-label="TIGI brand film"
      className="relative isolate -mt-[72px] flex h-[100svh] min-h-[600px] flex-col overflow-hidden bg-[#050507]"
    >
      {/* Film */}
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={POSTER_LAST}
          alt="The TIGI logo: a violet glass tile with a white T, beside the word TIGI"
          className="absolute inset-0 -z-10 h-full w-full object-cover [@media(max-aspect-ratio:4/3)]:object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          src={src ?? undefined}
          poster={POSTER_FIRST}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={onTime}
          onEnded={() => {
            setLanded(true)
            setEnded(true)
          }}
          aria-label="Land parcels, homes and apartment blocks drawn in violet light swirl into the TIGI logo"
          className="absolute inset-0 -z-10 h-full w-full object-cover [@media(max-aspect-ratio:4/3)]:object-contain"
        />
      )}

      {/* Legibility scrims: top for the nav, bottom into the page */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,5,7,0.55) 0%, rgba(5,5,7,0) 18%, rgba(5,5,7,0) 72%, rgba(5,5,7,0.85) 94%, #050507 100%)',
        }}
        aria-hidden="true"
      />

      {/* Tagline + CTAs — fade in under the logo once it has formed */}
      <div
        className={`absolute inset-x-0 top-[69%] flex flex-col items-center px-5 text-center transition-all duration-1000 ease-out [@media(max-aspect-ratio:4/3)]:top-[64%] ${
          landed ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        <p
          className="font-display text-[clamp(1.15rem,0.9rem+1vw,1.75rem)] font-[480] tracking-[-0.01em] text-[#E4E4EC]"
          style={{ fontStretch: '108%' }}
        >
          Property in Africa you can trust.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/waitlist" className="btn-primary no-underline">
            Join the waitlist <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/verify" className="btn-glass no-underline">
            How Verify works
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-auto">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 pb-6 sm:px-8">
          <span className="text-label hidden !text-[#A0A0B2] sm:inline">Property in Africa · Verify · Shares · Legacy</span>
          <a
            href="#intro"
            className="text-label flex items-center gap-1.5 !text-[#A0A0B2] no-underline transition-colors hover:!text-white sm:absolute sm:left-1/2 sm:-translate-x-1/2"
          >
            Scroll <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
          </a>
          <div className="flex items-center gap-2">
            {!still && (
              <button
                type="button"
                onClick={toggleSound}
                className="btn-glass !h-10 !w-10 !p-0"
                aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
                aria-pressed={!muted}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
            {!still && ended && (
              <button type="button" onClick={replay} className="btn-glass !h-10 !w-10 !p-0" aria-label="Replay the film">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
