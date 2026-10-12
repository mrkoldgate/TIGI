'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// MarketingNav — v4
// Transparent over the hero photograph, settles onto the onyx canvas once the
// page scrolls (Mercury). Links point at the homepage chapters plus Pricing,
// so nothing in the public nav leads to a missing page.
// ---------------------------------------------------------------------------

const LINKS = [
  { label: 'Market', href: '/#market' },
  { label: 'How it works', href: '/#how' },
  { label: 'Land', href: '/#land' },
  { label: 'Legacy', href: '/#legacy' },
  { label: 'Intelligence', href: '/#intelligence' },
  { label: 'Pricing', href: '/pricing' },
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
        'sticky top-0 z-50 h-[72px] transition-colors duration-300',
        solid ? 'bg-[#171721]/95 backdrop-blur-md' : 'bg-transparent'
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
                'rounded-full px-3.5 py-2 text-[14px] no-underline transition-colors',
                pathname === l.href ? 'text-[#EDEDF3]' : 'text-[#C3C3CC] hover:text-[#EDEDF3]'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-gold !px-5 !py-2.5 text-sm no-underline">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost !border-transparent !px-4 !py-2.5 text-sm no-underline hover:!border-[rgba(237,237,243,0.4)]">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-gold !px-5 !py-2.5 text-sm no-underline">
                Get early access
              </Link>
            </>
          )}
        </div>

        <button
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-[#EDEDF3] lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[rgba(237,237,243,0.08)] bg-[#171721] px-5 pb-8 pt-4 sm:px-8 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-[rgba(237,237,243,0.06)] py-4 text-[17px] text-[#EDEDF3] no-underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-gold no-underline">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/register" className="btn-gold no-underline">Get early access</Link>
                <Link href="/auth/login" className="btn-ghost no-underline">Sign in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
