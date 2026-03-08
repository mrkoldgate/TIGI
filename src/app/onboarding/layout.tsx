import Link from 'next/link'
import { signOut } from '@/auth'
import { OnboardingProgress } from '@/components/onboarding/progress'

// ---------------------------------------------------------------------------
// Onboarding layout — focused shell with step progress + TIGI logo.
// No sidebar, no topnav. Escape hatch: sign out.
// ---------------------------------------------------------------------------

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#0A0A0F]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Fine grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex h-14 items-center justify-between border-b border-[#111118] px-6">
        <Link href="/" className="flex items-center gap-2">
          <TigiLogoMark />
          <span className="font-heading text-base font-bold tracking-tight text-white">
            TIGI
          </span>
        </Link>

        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="text-xs text-[#3A3A48] transition-colors hover:text-[#6B6B80]"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* Step progress bar — client component (needs usePathname) */}
      <OnboardingProgress />

      {/* Page content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-10 md:py-16">
        {children}
      </main>
    </div>
  )
}

function TigiLogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden>
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
