'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Search, ChevronDown, Menu, User, CreditCard, Wallet, ShieldCheck, LogOut } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import type { ShellUser } from './app-shell'

// ---------------------------------------------------------------------------
// TopNav — v5
// Glass bar: search (Enter opens the marketplace with the query), a cyan
// "Devnet" signal, notifications, and an account menu with sign-out.
// ---------------------------------------------------------------------------

interface TopNavProps {
  onMobileMenuToggle?: () => void
  user?: ShellUser | null
}

export function TopNav({ onMobileMenuToggle, user }: TopNavProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-[68px] flex-shrink-0 items-center gap-3 border-b border-white/[0.06] bg-black/55 px-4 backdrop-blur-2xl md:px-8">
      {onMobileMenuToggle && (
        <button
          onClick={onMobileMenuToggle}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#C3C3CC] transition-colors hover:border-violet-300/30 hover:text-white md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      <form
        role="search"
        className="relative min-w-0 max-w-md flex-1"
        onSubmit={(e) => {
          e.preventDefault()
          const q = query.trim()
          router.push(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace')
        }}
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7E7E8E]" aria-hidden="true" />
        <label htmlFor="global-search" className="sr-only">Search properties</label>
        <input
          id="global-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search properties, cities, land…"
          className="field !rounded-full !py-2.5 !pl-11 !pr-14 !text-[14px]"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-[#8E8E9C] sm:block">
          ⌘K
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-2.5">
        <span className="hidden items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan-200/90 lg:inline-flex">
          <span className="live-dot" aria-hidden="true" />
          Devnet
        </span>
        <NotificationBell />
        <UserMenu user={user} />
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Account menu
// ---------------------------------------------------------------------------

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  return email.split('@')[0].slice(0, 2).toUpperCase()
}

function getDisplayName(name: string | null, email: string): string {
  if (name) return name.trim().split(/\s+/)[0]
  const local = email.split('@')[0]
  return local.length > 12 ? `${local.slice(0, 12)}…` : local
}

const MENU = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/kyc', label: 'Identity check', icon: ShieldCheck },
  { href: '/settings/wallet', label: 'Wallet', icon: Wallet },
  { href: '/settings/billing', label: 'Plan & billing', icon: CreditCard },
]

function UserMenu({ user }: { user?: ShellUser | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const initials = user ? getInitials(user.name, user.email) : '—'
  const displayName = user ? getDisplayName(user.name, user.email) : 'Account'

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] py-1 pl-1 pr-3 transition-all duration-300 hover:border-violet-300/30 hover:bg-violet-500/[0.06] hover:shadow-[0_0_24px_-6px_rgba(139,92,246,0.6)]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(160deg,#8F82FA,#5A42E6)] font-display text-[11px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_16px_rgba(139,92,246,0.5)]">
          {initials}
        </span>
        <span className="hidden text-[13.5px] font-medium text-[#F5F5F7] sm:block">{displayName}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#8E8E9C] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="panel absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden p-1.5 animate-scale-in"
        >
          {user && (
            <div className="border-b border-white/[0.06] px-3 pb-3 pt-2">
              <p className="truncate text-sm font-medium text-[#F5F5F7]">{user.name ?? displayName}</p>
              <p className="truncate font-mono text-[11px] text-[#8E8E9C]">{user.email}</p>
            </div>
          )}
          <div className="py-1">
            {MENU.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-[#C3C3CC] no-underline transition-colors hover:bg-violet-500/[0.08] hover:text-white"
              >
                <m.icon className="h-4 w-4 text-[#8E8E9C]" />
                {m.label}
              </Link>
            ))}
          </div>
          <button
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 rounded-xl border-t border-white/[0.06] px-3 py-2.5 text-left text-[13.5px] text-[#C3C3CC] transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut className="h-4 w-4 text-[#8E8E9C]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
