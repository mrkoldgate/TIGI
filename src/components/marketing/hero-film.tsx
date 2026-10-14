'use client'

import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Volume2, VolumeX } from 'lucide-react'

// ---------------------------------------------------------------------------
// HeroFilm — the homepage header. TIGI's 10-second brand film (land →
// buildings → apartments → vortex → glass "T" lockup) plays behind the
// header copy and holds on the final lockup.
//
// Layout: on large screens the film fills the right of the header and fades
// into black on its left, so the lockup lands to the right of the headline;
// on smaller screens it sits as a 16:9 band under the nav with the copy below.
// The copy itself (wave headline, text, CTAs, facts) is passed as children.
//
// Playback: muted autoplay; if the browser holds it back, the film starts on
// the visitor's first scroll, tap or key press. No still image is shown.
// ---------------------------------------------------------------------------

/** Film files: /media/tigi-film-{size}.mp4 (H.264) and .webm (VP9). */
const filmPath = (size: '1080' | '720', ext: 'mp4' | 'webm') => `/media/tigi-film-${size}.${ext}`

export function HeroFilm({ children }: { children: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [size, setSize] = useState<'1080' | '720' | null>(null)
  const [ended, setEnded] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    setSize(window.innerWidth < 900 ? '720' : '1080')
  }, [])

  // Autoplay, with a first-interaction fallback for browsers that hold it back.
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
    return () => events.forEach((e) => window.removeEventListener(e, onFirst))
  }, [size])

  const replay = (withSound: boolean) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.muted = !withSound
    setMuted(!withSound)
    setEnded(false)
    void v.play().catch(() => undefined)
  }

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    if (v.ended) return replay(true)
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <section
      aria-label="TIGI"
      className="relative isolate -mt-[72px] flex min-h-[100svh] flex-col overflow-hidden bg-[#050507]"
    >
      {/* Film: right-hand stage on large screens, 16:9 band on small ones */}
      <div className="relative mt-[72px] aspect-video w-full lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:aspect-auto lg:w-[78%]">
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
          onEnded={() => setEnded(true)}
          aria-label="Land parcels, homes and apartment blocks drawn in violet light swirl into the TIGI logo"
          className="absolute inset-0 h-full w-full object-cover lg:object-[35%_50%] lg:[mask-image:linear-gradient(to_right,transparent_0%,black_26%)]"
        >
          {size && <source src={filmPath(size, 'mp4')} type="video/mp4" />}
          {size && <source src={filmPath(size, 'webm')} type="video/webm" />}
        </video>
        {/* Fade the film into the page at the bottom */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(5,5,7,0) 70%, rgba(5,5,7,0.7) 92%, #050507 100%)' }}
          aria-hidden="true"
        />

        {/* Film controls */}
        <div className="absolute right-4 top-4 z-10 flex gap-2 lg:bottom-auto lg:right-8 lg:top-[96px]">
          <button
            type="button"
            onClick={toggleSound}
            className="btn-glass !h-10 !w-10 !p-0"
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            aria-pressed={!muted}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          {ended && (
            <button type="button" onClick={() => replay(!muted)} className="btn-glass !h-10 !w-10 !p-0" aria-label="Replay the film">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Left-side legibility wash on large screens */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: 'linear-gradient(90deg, #050507 0%, rgba(5,5,7,0.85) 22%, rgba(5,5,7,0) 48%), linear-gradient(180deg, rgba(5,5,7,0.5) 0%, rgba(5,5,7,0) 16%)' }}
        aria-hidden="true"
      />

      {/* Header copy */}
      <div className="relative z-[1] flex flex-1 flex-col">{children}</div>
    </section>
  )
}
