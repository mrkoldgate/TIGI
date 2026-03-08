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
    <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-4 border-b border-[#1F1F2E] bg-[#111118]/90 px-4 backdrop-blur-sm md:px-6">
      {/* Mobile sidebar toggle */}
      {onMobileMenuToggle && (
        <button
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#2A2A3A] bg-[#1A1A24] text-[#A0A0B2] transition-colors hover:border-[#C9A84C] hover:text-[#F5F5F7] md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* Search */}
      <div className="relative min-w-0 flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B6B80]" />
        <input
          type="text"
          placeholder="Search properties..."
          className="w-full rounded-lg border border-[#2A2A3A] bg-[#22222E] py-2 pl-9 pr-4 text-sm text-[#F5F5F7] placeholder-[#6B6B80] outline-none transition-colors focus:border-[#C9A84C] focus:ring-0"
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
  const initials    = user ? getInitials(user.name, user.email)    : '—'
  const displayName = user ? getDisplayName(user.name, user.email) : 'Account'

  return (
    <button
      className="flex items-center gap-2.5 rounded-lg border border-[#2A2A3A] bg-[#1A1A24] py-1.5 pl-1.5 pr-3 transition-colors hover:border-[#C9A84C]"
      aria-label="User menu"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C9A84C] font-heading text-xs font-semibold text-[#0A0A0F]">
        {initials}
      </div>
      <span className="hidden text-sm font-medium text-[#F5F5F7] sm:block">{displayName}</span>
      <ChevronDown className="h-3.5 w-3.5 text-[#6B6B80]" />
    </button>
  )
}
