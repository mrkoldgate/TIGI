'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { MAIN_NAV } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import { Magnetic, NavProgressBar } from '@/components/ui/interactions'

// ---------------------------------------------------------------------------
// MarketingNav — Premium tech nav
//
// Behaviors:
//   · Hides on scroll-down, reveals on scroll-up (threshold: 100px)
//   · Glass pill deepens on scroll (glass-heavy + inset shadow)
//   · "Magic tab" hover — a shared motion.span slides between nav links
//   · Hamburger icon animates between Menu ↔ X with rotation
//   · Mobile menu slides in/out with spring physics (AnimatePresence)
//   · NavProgressBar: gradient scroll-progress line at the bottom of the pill
// ---------------------------------------------------------------------------

export function MarketingNav() {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handler = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 12)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'py-3' : 'py-5',
        isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      )}
    >
      <div
        className={cn(
          'mx-auto w-full transition-all duration-500',
          scrolled ? 'px-4 lg:px-12 2xl:px-24' : 'px-6 lg:px-12 2xl:px-24'
        )}
      >
        {/* ── Pill container ── */}
        <div
          className={cn(
            'relative flex items-center gap-6 rounded-full px-6 py-3 transition-all duration-500',
            scrolled
              ? 'glass-heavy shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(255,255,255,0.06)_inset]'
              : 'bg-transparent'
          )}
        >
          {/* Logo */}
          <Magnetic strength={0.1}>
            <Logo />
          </Magnetic>

          {/* Desktop nav — "magic tab" hover underline */}
          <nav
            className="hidden flex-1 items-center justify-center gap-1 md:flex"
            aria-label="Main navigation"
            onMouseLeave={() => setHoveredKey(null)}
          >
            {MAIN_NAV.map((item) => {
              const active =
                pathname === item.marketingHref ||
                pathname.startsWith(`${item.marketingHref}/`)

              return (
                <Magnetic key={item.key} strength={0.2}>
                  <Link
                    href={item.marketingHref}
                    aria-label={item.description}
                    onMouseEnter={() => setHoveredKey(item.key)}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                      active ? 'text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#CBD5E1]'
                    )}
                  >
                    {/* Hover background pill — shared layoutId so it smoothly slides */}
                    {hoveredKey === item.key && !active && (
                      <motion.span
                        layoutId="nav-hover-bg"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {/* Active indicator — also layout-animated */}
                    {active && (
                      <motion.span
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'rgba(59,130,246,0.10)',
                          border: '1px solid rgba(59,130,246,0.18)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </Magnetic>
              )
            })}
          </nav>

          {/* Desktop auth CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <Magnetic strength={0.15}>
                <Link
                  href="/dashboard"
                  className="btn-gold gold-glow flex items-center gap-2 !py-2 !px-5 text-sm no-underline"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </Magnetic>
            ) : (
              <>
                <Magnetic strength={0.15}>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#F8FAFC]"
                  >
                    Sign in
                  </Link>
                </Magnetic>
                <Magnetic strength={0.15}>
                  <Link
                    href="/auth/register"
                    className="btn-gold gold-glow flex items-center gap-2 !py-2 !px-5 text-sm no-underline"
                  >
                    Get started
                    <ArrowUpRight className="h-3 w-3 opacity-70" />
                  </Link>
                </Magnetic>
              </>
            )}
          </div>

          {/* Mobile hamburger — animates between Menu ↔ X */}
          <button
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full glass text-[#64748B] transition-colors hover:text-[#F8FAFC] md:hidden overflow-hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Scroll progress bar — renders inside the pill once scrolled */}
          {scrolled && <NavProgressBar />}
        </div>
      </div>

      {/* Mobile menu — spring-physics slide in/out */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="md:hidden mx-4 mt-2"
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
                          ? 'glass text-[#60A5FA]'
                          : 'text-[#64748B] hover:text-[#F8FAFC]'
                      )}
                    >
                      <span>{item.label}</span>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                      )}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.05] pt-4">
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
                    <Link href="/auth/login" className="btn-glass text-center text-sm no-underline">
                      Sign in
                    </Link>
                    <Link href="/auth/register" className="btn-gold text-center text-sm no-underline">
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
