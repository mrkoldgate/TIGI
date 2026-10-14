import Image from 'next/image'
import { WaveChars } from '@/components/motion/wave-text'
import { photoUrl, PHOTOS, type PhotoKey } from '@/lib/photography'

// ---------------------------------------------------------------------------
// Shared pieces for the public sub-pages (/verify, /fees, /risks, /about,
// /waitlist, /pricing): the same Wrap width as the homepage and an intro with
// a mono eyebrow, a wave title and an optional photo plate.
// ---------------------------------------------------------------------------

export function Wrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</div>
}

export function PageIntro({
  eyebrow,
  title,
  lede,
  photo,
  children,
}: {
  eyebrow: string
  title: string
  lede?: React.ReactNode
  photo?: PhotoKey
  children?: React.ReactNode
}) {
  return (
    <Wrap className="pt-16 md:pt-24">
      <div className={photo ? 'grid items-end gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16' : ''}>
        <div>
          <p data-reveal="fade" className="text-label flex items-center gap-3 border-t border-white/[0.09] pt-5">
            {eyebrow}
          </p>
          <h1 data-reveal="wave" className="text-display mt-8 max-w-[18ch]">
            <WaveChars text={title} />
          </h1>
          {lede && (
            <div data-reveal="up" data-reveal-delay="150" className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-[#C3C3CC]">
              {lede}
            </div>
          )}
          {children}
        </div>
        {photo && (
          <figure data-reveal="scale">
            <div className="plate relative aspect-[4/3] rounded-xl">
              <Image src={photoUrl(photo, 1400, 78)} alt={PHOTOS[photo].alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="text-caption mt-3">Photo · {PHOTOS[photo].credit}</figcaption>
          </figure>
        )}
      </div>
    </Wrap>
  )
}

export function SectionHead({ num, label, title }: { num?: string; label: string; title: string }) {
  return (
    <header>
      <div data-reveal="fade" className="mb-6 flex items-center gap-4 border-t border-white/[0.09] pt-5">
        {num && <span className="section-num">{num}</span>}
        <span className="text-label">{label}</span>
      </div>
      <h2 data-reveal="wave" className="text-h2 max-w-[24ch]">
        <WaveChars text={title} />
      </h2>
    </header>
  )
}
