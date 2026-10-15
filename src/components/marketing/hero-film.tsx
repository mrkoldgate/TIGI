'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'

// ---------------------------------------------------------------------------
// HeroFilm — the homepage header: TIGI's 16-second header film, neon light
// on torn paper. A neon land grid traces across a dark paper ground and paper
// homes and apartment blocks rise (the land); two deeds land on one plot, a
// light scan exposes the forgery and the VERIFIED stamp slams (Verify); a
// block tears into share tiles (Shares); the legacy folder and key are passed
// to the next home (Legacy); everything spirals into the glass "T" lockup.
// It autoplays muted and holds on the lockup; the tagline and CTAs fade in
// beneath the logo as it lands. Sound and replay controls sit bottom-right.
//
// Only the film is shown — no still image or poster. If a browser holds back
// autoplay, the film starts on the visitor's first scroll, tap or key press,
// and the tagline appears with a "Play the film" button in the meantime.
// Phones get the 720p file; wide screens the 1080p file (H.264 mp4, with a
// VP9 webm fallback). On portrait screens the 16:9 film is contained so the
// logo is never cropped.
// ---------------------------------------------------------------------------

/** Film files: /media/tigi-film-{size}.mp4 (H.264) and .webm (VP9). */
const filmPath = (size: '1080' | '720', ext: 'mp4' | 'webm') => `/media/tigi-film-${size}.${ext}?v=4`

/** Second at which the lockup has formed and the tagline may appear. */
const LOCKUP_AT = 14.6

type Mode = 'loading' | 'playing' | 'ended' | 'held'

export function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [size, setSize] = useState<'1080' | '720' | null>(null)
  const [mode, setMode] = useState<Mode>('loading')
  const [landed, setLanded] = useState(false)
  const [muted, setMuted] = useState(true)

  // Pick the file for the screen.
  useEffect(() => {
    setSize(window.innerWidth < 900 ? '720' : '1080')
  }, [])

  // Autoplay, retrying on the first interaction if the browser holds it back.
  useEffect(() => {
    const v = videoRef.current
    if (!v || !size) return
    v.muted = true
    v.defaultMuted = true
    v.load()

    const tryPlay = () => {
      if (!v.paused || v.ended) return
      void v.play().catch(() => undefined)
    }
    tryPlay()

    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
    const onFirst = () => {
      tryPlay()
      events.forEach((e) => window.removeEventListener(e, onFirst))
    }
    events.forEach((e) => window.addEventListener(e, onFirst, { passive: true }))

    // If the film has loaded but still hasn't started after 3 seconds, show
    // the tagline with a play button so the header is never empty.
    const t = window.setInterval(() => {
      if (!v.paused || v.currentTime > 0) return window.clearInterval(t)
      if (v.readyState >= 3) {
        window.clearInterval(t)
        setMode('held')
        setLanded(true)
      }
    }, 3000)

    return () => {
      window.clearInterval(t)
      events.forEach((e) => window.removeEventListener(e, onFirst))
    }
  }, [size])

  const onTime = () => {
    const v = videoRef.current
    if (v && !landed && v.currentTime >= LOCKUP_AT) setLanded(true)
  }

  const play = (withSound = false) => {
    const v = videoRef.current
    if (!v) return
    setLanded(false)
    v.currentTime = 0
    v.muted = withSound ? false : muted
    if (withSound) setMuted(false)
    void v.play().catch(() => undefined)
  }

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted && (v.ended || mode === 'ended')) play(true)
  }

  const fit = 'object-cover [@media(max-aspect-ratio:4/3)]:object-contain'

  return (
    <section
      aria-label="TIGI brand film"
      className="relative isolate -mt-[72px] flex h-[100svh] min-h-[600px] flex-col overflow-hidden bg-[#050507]"
    >
      {/* Film */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlay={() => {
          const v = videoRef.current
          if (v && v.paused && !v.ended) void v.play().catch(() => undefined)
        }}
        onPlaying={() => setMode('playing')}
        onTimeUpdate={onTime}
        onEnded={() => {
          setLanded(true)
          setMode('ended')
        }}
        aria-label="A neon land grid on torn paper fills with homes and apartment blocks; a forged deed is exposed and the true one verified, a block becomes share tiles, a legacy is passed on, then everything swirls into the TIGI logo"
        className={`absolute inset-0 -z-10 h-full w-full ${fit}`}
      >
        {size && <source src={filmPath(size, 'mp4')} type="video/mp4" />}
        {size && <source src={filmPath(size, 'webm')} type="video/webm" />}
      </video>

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
          {mode === 'held' ? (
            <button type="button" onClick={() => play(false)} className="btn-glass">
              <Play className="h-4 w-4" /> Play the film
            </button>
          ) : (
            <Link href="/verify" className="btn-glass no-underline">
              How Verify works
            </Link>
          )}
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
            <button
              type="button"
              onClick={toggleSound}
              className="btn-glass !h-10 !w-10 !p-0"
              aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
              aria-pressed={!muted}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            {mode === 'ended' && (
              <button type="button" onClick={() => play(!muted)} className="btn-glass !h-10 !w-10 !p-0" aria-label="Replay the film">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
