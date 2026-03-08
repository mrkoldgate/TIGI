import Link from 'next/link'

// ---------------------------------------------------------------------------
// Auth layout — minimal centered layout for sign in / sign up / verify.
// No nav, no footer. Just TIGI logo + centered card on dark background.
// ---------------------------------------------------------------------------

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0A0A0F]">
      {/* Radial glow behind card */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="relative mb-8 flex items-center gap-2 text-[#C9A84C] transition-opacity hover:opacity-80"
        aria-label="TIGI home"
      >
        <TigiLogoMark />
        <span className="font-heading text-xl font-bold tracking-tight text-white">
          TIGI
        </span>
      </Link>

      {/* Card */}
      <div className="relative w-full max-w-[440px] px-4">
        {children}
      </div>

      {/* Footer line */}
      <p className="relative mt-8 text-center text-xs text-[#3A3A48]">
        © {new Date().getFullYear()} TIGI. All rights reserved.{' '}
        <Link href="/legal" className="hover:text-[#C9A84C] transition-colors">
          Privacy
        </Link>
        {' · '}
        <Link href="/legal/terms" className="hover:text-[#C9A84C] transition-colors">
          Terms
        </Link>
      </p>
    </div>
  )
}

function TigiLogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect width="28" height="28" rx="6" fill="#C9A84C" fillOpacity="0.12" />
      <path
        d="M14 6L20 10V14L14 18L8 14V10L14 6Z"
        stroke="#C9A84C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 18V22M8 14L4 16M20 14L24 16"
        stroke="#C9A84C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
