'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Compass,
  TrendingUp,
  ArrowLeftRight,
  Building2,
  Map,
  Landmark,
  Bell,
  LineChart,
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
// Sidebar — v5
//
// Grouped like a bank app (Mercury / Revolut): mono group labels, calm rows,
// one violet active state with a glowing rail. Cyan is kept for the single
// "live" signal (devnet / private beta) at the bottom.
// Widths: 248px expanded | 72px icon-only collapsed. Mobile: overlay drawer.
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
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Market',
    items: [
      { href: '/marketplace', label: 'Marketplace', icon: Store },
      { href: '/explore', label: 'Explore', icon: Compass },
      { href: '/saved', label: 'Saved', icon: Heart },
    ],
  },
  {
    label: 'Holdings',
    items: [
      { href: '/portfolio', label: 'Portfolio', icon: TrendingUp },
      { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Your assets',
    items: [
      { href: '/listings', label: 'My properties', icon: Building2 },
      { href: '/leasing', label: 'Land', icon: Map },
      { href: '/inheritance', label: 'Legacy', icon: Landmark },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/insights', label: 'Insights', icon: LineChart },
      { href: '/assistant', label: 'Aria', icon: Sparkles },
    ],
  },
]

const BOTTOM_NAV: NavItem[] = [{ href: '/settings', label: 'Settings', icon: Settings }]

export function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const isCollapsed = collapsed && !mobileOpen

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.06] bg-[#030305]/85 backdrop-blur-2xl transition-[width,transform] duration-300 ease-out',
          collapsed ? 'md:w-[72px]' : 'md:w-[248px]',
          'max-md:w-[280px]',
          mobileOpen ? 'translate-x-0' : 'max-md:-translate-x-full'
        )}
      >
        {/* Violet wash at the top, like light falling on glass */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(120%_70%_at_0%_0%,rgba(139,92,246,0.14),transparent_70%)]"
          aria-hidden="true"
        />

        {/* Logo row */}
        <div className={cn('relative flex h-[68px] flex-shrink-0 items-center px-5', isCollapsed && 'md:justify-center md:px-0')}>
          <Logo collapsed={isCollapsed} />
          <button
            onClick={onMobileClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#8E8E9C] transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Groups */}
        <nav className="relative flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-2" aria-label="Platform navigation">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={cn(gi > 0 && 'mt-4')}>
              {isCollapsed ? (
                gi > 0 && <div className="mx-auto mb-3 h-px w-6 bg-white/[0.08]" aria-hidden="true" />
              ) : (
                <p className="text-label mb-1.5 px-3 !text-[10px] !text-[#6E6E7E]">{group.label}</p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <SidebarLink item={item} active={isActive(item.href)} collapsed={isCollapsed} onClick={onMobileClose} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="relative flex-shrink-0 border-t border-white/[0.06] px-3 py-3">
          {!isCollapsed && (
            <div className="mb-3 hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 [@media(min-height:900px)]:block">
              <p className="flex items-center gap-2 text-[12px] font-medium text-[#F5F5F7]">
                <span className="live-dot" aria-hidden="true" />
                Private beta
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-[#8E8E9C]">
                Solana devnet. Listings and balances are sample data.
              </p>
            </div>
          )}

          <ul className="space-y-0.5">
            {BOTTOM_NAV.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} active={isActive(item.href)} collapsed={isCollapsed} onClick={onMobileClose} />
              </li>
            ))}
          </ul>

          <button
            onClick={onToggle}
            className={cn(
              'mt-1 hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[#8E8E9C] transition-colors hover:bg-white/[0.04] hover:text-white md:flex',
              collapsed && 'justify-center'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (<><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>)}
          </button>
        </div>
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------
// Link row
// ---------------------------------------------------------------------------

function SidebarLink({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] no-underline transition-all duration-300',
        active
          ? 'bg-[linear-gradient(90deg,rgba(139,92,246,0.2),rgba(139,92,246,0.04))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(167,139,250,0.18),0_0_30px_-10px_rgba(139,92,246,0.8)]'
          : 'text-[#B4B4C0] hover:bg-white/[0.04] hover:text-white',
        collapsed && 'justify-center px-0'
      )}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.95)]"
          aria-hidden="true"
        />
      )}
      <item.icon
        className={cn(
          'h-[17px] w-[17px] flex-shrink-0 transition-colors duration-300',
          active ? 'text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]' : 'text-[#7E7E8E] group-hover:text-violet-200'
        )}
      />
      {!collapsed && (
        <span className="flex flex-1 items-center justify-between">
          <span className="font-medium tracking-[-0.005em]">{item.label}</span>
          {item.href === '/saved' && <SavedCountBadge />}
        </span>
      )}
      {collapsed && item.href === '/saved' && <SavedDotBadge />}
    </Link>
  )
}

function SavedCountBadge() {
  const { savedCount } = useSavedListings()
  if (savedCount === 0) return null
  return (
    <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-violet-200 ring-1 ring-inset ring-violet-400/30">
      {savedCount > 99 ? '99+' : savedCount}
    </span>
  )
}

function SavedDotBadge() {
  const { savedCount } = useSavedListings()
  if (savedCount === 0) return null
  return <span className="absolute right-3 top-2 h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
}
