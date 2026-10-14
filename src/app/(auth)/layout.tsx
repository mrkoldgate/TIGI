import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/shared/logo'
import { photoUrl, PHOTOS } from '@/lib/photography'
import { NeonSkyline } from '@/components/shared/neon-skyline'

// ---------------------------------------------------------------------------
// Auth layout — v5
// Split screen: a full-height photograph with the brand line on the left
// (Mercury / Wealthsimple sign-in), the form on black glass on the right.
// On small screens the photo becomes a short band above the form.
// ---------------------------------------------------------------------------

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen bg-black lg:grid-cols-[1.05fr_1fr]">
      {/* Photo side */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src={photoUrl('kigaliHomes', 1600, 80)}
          alt={PHOTOS.kigaliHomes.alt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.9) 100%),' +
              'linear-gradient(90deg, rgba(0,0,0,0) 70%, rgba(0,0,0,0.85) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo />
          <div className="max-w-md">
            <p className="text-label mb-4 flex items-center gap-2 !text-cyan-100/90">
              <span className="live-dot" aria-hidden="true" />
              Private beta
            </p>
            <p
              className="font-display text-[clamp(2rem,1.2rem+2vw,3rem)] font-[520] leading-[1.04] tracking-[-0.035em] text-[#F5F5F7]"
              style={{ fontStretch: '110%' }}
            >
              Own property in Africa, safely.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#C3C3CC]">
              Titles checked at the registry. Money held in escrow until the deed moves. Heirs on record.
            </p>
            <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/50">
              Photo · {PHOTOS.kigaliHomes.credit}
            </p>
          </div>
        </div>
      </aside>

      {/* Form side */}
      <main className="relative flex flex-col items-center justify-center px-5 py-12 sm:px-8">
        {/* Violet light behind the form */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 50% at 50% 30%, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.05) 45%, transparent 75%)' }}
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 [mask-image:linear-gradient(to_top,black_50%,transparent)]" aria-hidden="true">
          <NeonSkyline className="h-[26vh] min-h-[160px] w-full opacity-45" />
        </div>

        <div className="relative mb-10 lg:hidden">
          <Logo />
        </div>

        <div className="relative w-full max-w-[440px]">{children}</div>

        <p className="relative mt-10 text-center text-xs text-[#7A7A8A]">
          © {new Date().getFullYear()} TIGI · Private beta on Solana devnet ·{' '}
          <Link href="/" className="transition-colors hover:text-violet-200">Back to site</Link>
        </p>
      </main>
    </div>
  )
}
