'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'
import { NavProgressBar } from '@/components/ui/interactions'

// ---------------------------------------------------------------------------
// MarketingNav — v4
// v6: Africa-first links (Verify, Markets, Shares, Legacy). Transparent over the hero photograph, settles onto the onyx canvas once the
// page scrolls (Mercury). Links point at the homepage chapters plus Pricing,
// so nothing in the public nav leads to a missing page.
// ---------------------------------------------------------------------------

const LINKS = [
  { label: 'Verify', href: '/verify' },
  { label: 'Markets', href: '/#markets' },
  { label: 'Shares', href: '/#how' },
  { label: 'Legacy', href: '/#legacy' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
]

export function MarketingNav() {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const solid = scrolled || open || pathname !== '/'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-[72px] transition-[background-color,backdrop-filter,box-shadow] duration-500',
        solid ? 'glass-nav' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-8 px-5 sm:px-8">
        <Logo />

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main navigation">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'relative rounded-full px-3.5 py-2 text-[14px] no-underline transition-colors duration-300 hover:bg-white/[0.06]',
                pathname === l.href ? 'text-[#F5F5F7]' : 'text-[#C3C3CC] hover:text-[#F5F5F7]'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary !px-5 !py-2.5 text-sm no-underline">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-glass !px-4 !py-2.5 text-sm no-underline">
                Sign in
              </Link>
              <Link href="/waitlist" className="btn-primary !px-5 !py-2.5 text-sm no-underline">
                Join the waitlist
              </Link>
            </>
          )}
        </div>

        <button
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-[#F5F5F7] lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {scrolled && <NavProgressBar />}

      {open && (
        <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#000000] px-5 pb-8 pt-4 sm:px-8 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-[rgba(255,255,255,0.06)] py-4 text-[17px] text-[#F5F5F7] no-underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary no-underline">Dashboard</Link>
            ) : (
              <>
                <Link href="/waitlist" className="btn-primary no-underline">Join the waitlist</Link>
                <Link href="/auth/login" className="btn-glass no-underline">Sign in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
