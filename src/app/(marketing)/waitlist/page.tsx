import type { Metadata } from 'next'
import { Wrap } from '@/components/marketing/page-intro'
import { WaveChars } from '@/components/motion/wave-text'
import { WaitlistForm } from '@/components/marketing/waitlist-form'
import { CityMarquee, PhotoBackdrop } from '@/components/marketing/cinematic'
import { WAITLIST_INTEREST_IDS, type WaitlistInterest } from '@/lib/waitlist/waitlist-options'

export const metadata: Metadata = {
  title: 'Join the waitlist',
  description: 'Tell us where you want to buy and what you need. TIGI opens each market to the waitlist first.',
}

// ---------------------------------------------------------------------------
// /waitlist — qualified waitlist. ?interest=verify|shares|legacy|list|investor
// preselects a chip; ?src= records the campaign.
// ---------------------------------------------------------------------------

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string; src?: string }>
}) {
  const { interest, src } = await searchParams
  const initial = WAITLIST_INTEREST_IDS.includes(interest as WaitlistInterest) ? (interest as WaitlistInterest) : undefined

  return (
    <div className="pb-24 md:pb-32">
      <PhotoBackdrop photo="dakarCity">
      <Wrap className="pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
          <div>
            <p data-reveal="fade" className="text-label flex items-center gap-2 border-t border-white/[0.09] pt-5">
              <span className="live-dot" aria-hidden="true" /> Waitlist open
            </p>
            <h1 data-reveal="wave" className="text-hero mt-8 max-w-[12ch]">
              <WaveChars text="Save your place." />
            </h1>
            <p data-reveal="up" data-reveal-delay="150" className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-[#C3C3CC]">
              Tell us where you want to buy and what you need. We open each market to the waitlist first, starting with
              Verify in Nigeria, Senegal and Mali.
            </p>
            <ul data-reveal="up" data-reveal-delay="250" className="mt-10 space-y-3 text-[15px] text-[#D4D4DE]">
              {['First access in your market', 'Launch pricing on title checks', 'No offering is made by joining'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal="up" data-reveal-delay="100" className="rounded-[24px] shadow-[0_40px_140px_-40px_rgba(110,91,243,0.75)]">
            <WaitlistForm initialInterest={initial} source={src ? `waitlist:${src}` : 'waitlist'} />
          </div>
        </div>
      </Wrap>
      </PhotoBackdrop>
      <CityMarquee items={['Lagos', 'Dakar', 'Abuja', 'Bamako', 'Port Harcourt', 'Thiès', 'Ibadan', 'Ségou']} />
    </div>
  )
}
