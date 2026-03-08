'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { MAIN_NAV } from '@/lib/nav-config'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// MarketingNav — Public-facing navigation
//
// States:
//   Unauthenticated: logo | nav links | Sign In · Get Started
//   Authenticated:   logo | nav links | Dashboard (gold pill)
// ---------------------------------------------------------------------------

export function MarketingNav() {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Add background opacity when scrolled
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-200',
        scrolled
          ? 'border-[#1F1F2E] bg-[#0A0A0F]/95 backdrop-blur-md'
          : 'border-transparent bg-[#0A0A0F]/60 backdrop-blur-sm'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-8 px-6 lg:px-8">
        {/* Logo */}
        <Logo />

        {/* Desktop nav — centered primary links */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Main navigation">
          {MAIN_NAV.map((item) => {
            const active =
              pathname === item.marketingHref ||
              pathname.startsWith(`${item.marketingHref}/`)

            return (
              <Link
                key={item.key}
                href={item.marketingHref}
                aria-label={item.description}
                className={cn(
                  'group relative px-3.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-[#F5F5F7]'
                    : 'text-[#A0A0B2] hover:text-[#F5F5F7]'
                )}
              >
                {item.label}
                {/* Active/hover underline */}
                <span
                  className={cn(
                    'absolute bottom-0 left-3.5 right-3.5 h-px rounded-full transition-all duration-200',
                    active
                      ? 'bg-[#C9A84C] opacity-100'
                      : 'bg-[#C9A84C] opacity-0 group-hover:opacity-40'
                  )}
                />
              </Link>
            )
          })}
        </nav>

        {/* Desktop auth CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            // Authenticated state — single Dashboard CTA
            <Link
              href="/dashboard"
              className="gold-glow flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#0A0A0F] transition-colors hover:bg-[#B8932F]"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          ) : (
            // Unauthenticated state — Sign in + Get started
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-[#A0A0B2] transition-colors hover:text-[#F5F5F7]"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="gold-glow rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#0A0A0F] transition-colors hover:bg-[#B8932F]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-[#A0A0B2] transition-colors hover:bg-[#111118] hover:text-[#F5F5F7] md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu — slide down */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out md:hidden',
          mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="border-t border-[#1F1F2E] bg-[#0A0A0F] px-6 pb-6">
          {/* Nav links */}
          <nav className="mt-4 space-y-0.5" aria-label="Mobile navigation">
            {MAIN_NAV.map((item) => {
              const active =
                pathname === item.marketingHref ||
                pathname.startsWith(`${item.marketingHref}/`)

              return (
                <Link
                  key={item.key}
                  href={item.marketingHref}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#111118] text-[#C9A84C]'
                      : 'text-[#A0A0B2] hover:bg-[#111118] hover:text-[#F5F5F7]'
                  )}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Auth CTAs */}
          <div className="mt-4 flex flex-col gap-2 border-t border-[#1F1F2E] pt-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-colors hover:bg-[#B8932F]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg border border-[#2A2A3A] px-4 py-2.5 text-center text-sm font-medium text-[#F5F5F7] transition-colors hover:bg-[#111118]"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-[#C9A84C] px-4 py-2.5 text-center text-sm font-semibold text-[#0A0A0F] transition-colors hover:bg-[#B8932F]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
