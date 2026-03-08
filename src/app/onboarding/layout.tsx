import Link from 'next/link'
import { signOut } from '@/auth'

// ---------------------------------------------------------------------------
// Onboarding layout — minimal, focused. No sidebar/topnav distractions.
// Shows progress indicator + TIGI logo. Sign-out safety escape.
// ---------------------------------------------------------------------------

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#0A0A0F]">
      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <header className="relative flex h-16 items-center justify-between border-b border-[#111118] px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <TigiLogoMark />
          <span className="font-heading text-lg font-bold tracking-tight">TIGI</span>
        </Link>

        {/* Sign out — in case user wants to switch account */}
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="text-sm text-[#4A4A60] transition-colors hover:text-[#9999AA]"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* Content */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}

function TigiLogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden>
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
