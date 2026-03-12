'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  ArrowLeftRight,
  Building2,
  Map,
  Landmark,
  Bell,
  Lightbulb,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'
import { useSavedListings } from '@/lib/saved/saved-context'

// ---------------------------------------------------------------------------
// Sidebar — Platform navigation
//
// Nav vocabulary aligns with the public marketing nav (user-facing labels).
// Routes map to actual Next.js app routes via (platform) group.
//
// Widths: 240px expanded | 64px icon-only collapsed
// Mobile: overlay mode — full-width drawer over content, closable via backdrop
// Active state: gold left indicator + gold text
// ---------------------------------------------------------------------------

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onMobileClose: () => void
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  milestone?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/marketplace', label: 'Explore', icon: Compass },
  { href: '/saved', label: 'Saved', icon: Heart },
  { href: '/portfolio', label: 'Invest', icon: TrendingUp },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/listings', label: 'My Properties', icon: Building2 },
  { href: '/leasing', label: 'Land', icon: Map },
  { href: '/inheritance', label: 'Legacy', icon: Landmark },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/insights', label: 'Insights', icon: Lightbulb, milestone: 'M5' },
]

const BOTTOM_NAV: NavItem[] = [
  { href: '/assistant', label: 'Aria', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#0A0A0F]/70 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.06] bg-[#020409]/70 backdrop-blur-xl transition-all duration-200 shadow-[4px_0_32px_-8px_rgba(0,0,0,0.6)]',
          // Desktop: collapsed or expanded
          collapsed ? 'md:w-16' : 'md:w-60',
          // Mobile: full drawer when open, hidden when closed
          'max-md:w-72',
          mobileOpen ? 'translate-x-0' : 'max-md:-translate-x-full'
        )}
      >
        {/* Top atmospheric glow — adds depth without noise */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-violet-600/[0.07] via-blue-600/[0.03] to-transparent"
          aria-hidden="true"
        />

        {/* Logo row */}
        <div
          className={cn(
            'flex h-16 flex-shrink-0 items-center border-b border-white/5 px-4',
            collapsed && !mobileOpen ? 'md:justify-center' : 'gap-2.5'
          )}
        >
          <Logo collapsed={collapsed && !mobileOpen} />

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#6B6B80] transition-colors hover:bg-white/5 hover:text-[#A0A0B2] md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4" aria-label="Platform navigation">
          <ul className="space-y-0.5 px-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <SidebarLink
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed && !mobileOpen}
                  onClick={onMobileClose}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom nav */}
        <div className="flex-shrink-0 border-t border-white/5 py-3">
          <ul className="space-y-0.5 px-2">
            {BOTTOM_NAV.map((item) => (
              <li key={item.href}>
                <SidebarLink
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed && !mobileOpen}
                  onClick={onMobileClose}
                />
              </li>
            ))}
          </ul>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className={cn(
              'mt-2 hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#6B6B80] transition-colors hover:bg-white/5 hover:text-[#A0A0B2] md:flex',
              collapsed ? 'justify-center' : ''
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------
// Individual sidebar link
// ---------------------------------------------------------------------------

interface SidebarLinkProps {
  item: NavItem
  active: boolean
  collapsed: boolean
  onClick?: () => void
}

function SidebarLink({ item, active, collapsed, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300',
        active
          ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_0_20px_rgba(52,211,153,0.04)]'
          : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-white',
        collapsed ? 'justify-center' : ''
      )}
    >
      {/* Active left indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
      )}

      {/* Icon */}
      <item.icon
        className={cn(
          'h-4 w-4 flex-shrink-0 transition-colors',
          active ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-[#64748B] group-hover:text-[#94A3B8]'
        )}
      />

      {/* Label + badge (milestone or saved count) */}
      {!collapsed && (
        <span className="flex flex-1 items-center justify-between">
          <span className="font-medium">{item.label}</span>
          {item.href === '/saved' ? (
            <SavedCountBadge />
          ) : item.milestone ? (
            <span className="rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[10px] text-[#94A3B8]">
              {item.milestone}
            </span>
          ) : null}
        </span>
      )}

      {/* Collapsed: saved dot indicator when count > 0 */}
      {collapsed && item.href === '/saved' && <SavedDotBadge />}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Saved count badge — reads from context, renders only when count > 0
// ---------------------------------------------------------------------------

function SavedCountBadge() {
  const { savedCount } = useSavedListings()
  if (savedCount === 0) return null
  return (
    <span className="rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
      {savedCount > 99 ? '99+' : savedCount}
    </span>
  )
}

function SavedDotBadge() {
  const { savedCount } = useSavedListings()
  if (savedCount === 0) return null
  return (
    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
  )
}
