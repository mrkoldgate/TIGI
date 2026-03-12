'use client'

import { Search, ChevronDown, Menu } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import type { ShellUser } from './app-shell'

// ---------------------------------------------------------------------------
// TopNav — Platform top navigation bar
// Height: 64px. Contains: mobile sidebar toggle, search, notifications, user.
// ---------------------------------------------------------------------------

interface TopNavProps {
  onMobileMenuToggle?: () => void
  user?: ShellUser | null
}

export function TopNav({ onMobileMenuToggle, user }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-4 border-b border-white/[0.06] bg-[#020409]/60 px-4 backdrop-blur-2xl md:px-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03),0_4px_24px_-8px_rgba(0,0,0,0.5)]">
      {/* Mobile sidebar toggle */}
      {onMobileMenuToggle && (
        <button
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#A0A0B2] transition-colors hover:border-white/20 hover:text-white md:hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* Search */}
      <div className="relative min-w-0 flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search properties..."
          className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-9 pr-4 text-sm text-white placeholder-[#64748B] outline-none transition-all focus:border-purple-500/50 focus:bg-white/10 focus:ring-1 focus:ring-purple-500/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <UserMenu user={user} />
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// User menu — real session user name + computed initials
// ---------------------------------------------------------------------------

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  return email.split('@')[0].slice(0, 2).toUpperCase()
}

function getDisplayName(name: string | null, email: string): string {
  if (name) return name.trim().split(/\s+/)[0]
  const local = email.split('@')[0]
  return local.length > 12 ? `${local.slice(0, 12)}…` : local
}

interface UserMenuProps {
  user?: ShellUser | null
}

function UserMenu({ user }: UserMenuProps) {
  const initials = user ? getInitials(user.name, user.email) : '—'
  const displayName = user ? getDisplayName(user.name, user.email) : 'Account'

  return (
    <button
      className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition-all hover:border-white/20 hover:bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
      aria-label="User menu"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-heading text-xs font-semibold text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
        {initials}
      </div>
      <span className="hidden text-sm font-medium text-white sm:block">{displayName}</span>
      <ChevronDown className="h-3.5 w-3.5 text-[#94A3B8]" />
    </button>
  )
}
