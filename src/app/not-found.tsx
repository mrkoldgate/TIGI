import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { WaveChars } from '@/components/motion/wave-text'

// ---------------------------------------------------------------------------
// 404 — v6. Black canvas, violet light, wave title. Two ways forward.
// ---------------------------------------------------------------------------

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black px-5 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 45% at 50% 40%, rgba(139,92,246,0.16) 0%, rgba(99,102,241,0.05) 45%, transparent 75%)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto flex h-[72px] w-full max-w-[1200px] items-center">
        <Logo />
      </div>

      <main className="relative mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center pb-24 text-center">
        <p className="text-label flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" aria-hidden="true" />
          Error 404
        </p>
        <h1 data-reveal="wave" className="text-display mt-6">
          <WaveChars text="No record at this address." />
        </h1>
        <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-[#C3C3CC]">
          The page you were looking for doesn&apos;t exist or has moved. Unlike a land title, we can point you somewhere
          that checks out.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-glass no-underline">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Link href="/verify" className="btn-primary no-underline">
            How Verify works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  )
}
