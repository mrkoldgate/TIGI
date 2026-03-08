'use client'

import { Search, ChevronDown, Menu } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'

// ---------------------------------------------------------------------------
// TopNav — Platform top navigation bar
// Height: 64px. Contains: mobile sidebar toggle, search, notifications, user.
// Sits above the scrollable content area, inside the content column.
// ---------------------------------------------------------------------------

interface TopNavProps {
  onMobileMenuToggle?: () => void
}

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
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

        {/* User menu — M2: replace with real auth session */}
        <UserMenu />
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// User menu — placeholder until auth is wired in M2
// ---------------------------------------------------------------------------

function UserMenu() {
  return (
    <button className="flex items-center gap-2.5 rounded-lg border border-[#2A2A3A] bg-[#1A1A24] py-1.5 pl-1.5 pr-3 transition-colors hover:border-[#C9A84C]">
      {/* Avatar */}
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C9A84C] font-heading text-xs font-semibold text-[#0A0A0F]">
        JD
      </div>
      <span className="hidden text-sm font-medium text-[#F5F5F7] sm:block">John D.</span>
      <ChevronDown className="h-3.5 w-3.5 text-[#6B6B80]" />
    </button>
  )
}
