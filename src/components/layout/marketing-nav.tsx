'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Menu, X, LayoutDashboard, ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { MAIN_NAV } from '@/lib/nav-config'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// MarketingNav — Premium glass morphism navigation
// ---------------------------------------------------------------------------

export function MarketingNav() {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'py-3'
          : 'py-5'
      )}
    >
      {/* Glass container — floats inside the viewport with rounded edges */}
      <div
        className={cn(
          'mx-auto max-w-[1320px] px-4 transition-all duration-500',
          scrolled
            ? 'px-4 lg:px-6'
            : 'px-6 lg:px-8'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-6 rounded-full px-6 py-3 transition-all duration-500',
            scrolled
              ? 'glass-heavy shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'bg-transparent'
          )}
        >
          {/* Logo */}
          <Logo />

          {/* Desktop nav — centered links */}
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
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                    active
                      ? 'text-[#F0EDE6]'
                      : 'text-[#9B9687] hover:text-[#F0EDE6]'
                  )}
                >
                  {item.label}
                  {/* Active glow indicator */}
                  {active && (
                    <span
                      className="absolute inset-0 rounded-full opacity-100"
                      style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.12)' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Desktop auth CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-gold gold-glow flex items-center gap-2 !py-2 !px-5 text-sm no-underline"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#9B9687] transition-colors hover:text-[#F0EDE6]"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-gold gold-glow flex items-center gap-2 !py-2 !px-5 text-sm no-underline"
                >
                  Get started
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full glass text-[#9B9687] transition-colors hover:text-[#F0EDE6] md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — glass slide-down */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-400 ease-in-out md:hidden mx-4 mt-2',
          mobileOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="glass-heavy rounded-3xl px-6 pb-6">
          <nav className="mt-4 space-y-1" aria-label="Mobile navigation">
            {MAIN_NAV.map((item) => {
              const active =
                pathname === item.marketingHref ||
                pathname.startsWith(`${item.marketingHref}/`)

              return (
                <Link
                  key={item.key}
                  href={item.marketingHref}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                    active
                      ? 'glass text-[#D4A843]'
                      : 'text-[#9B9687] hover:text-[#F0EDE6]'
                  )}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-[#D4A843]" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.04] pt-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-gold flex items-center justify-center gap-2 text-sm no-underline"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-glass text-center text-sm no-underline"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-gold text-center text-sm no-underline"
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
