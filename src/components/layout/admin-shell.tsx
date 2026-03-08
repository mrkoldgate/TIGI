'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  LogOut,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// AdminShell — Admin route group layout container
// Separate from AppShell. Admin nav is narrower with different links.
// Role check is enforced by middleware — this shell assumes ADMIN role.
// ---------------------------------------------------------------------------

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
]

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      {/* Admin sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[#1F1F2E] bg-[#111118]">
        {/* Logo + admin badge */}
        <div className="flex h-16 items-center gap-3 border-b border-[#1F1F2E] px-4">
          <Logo />
          <span className="rounded border border-[#EF4444]/30 bg-[#EF4444]/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#EF4444]">
            Admin
          </span>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-0.5 px-2">
            {ADMIN_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'bg-[#1A1A24] text-[#C9A84C]'
                        : 'text-[#A0A0B2] hover:bg-[#1A1A24] hover:text-[#F5F5F7]'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-[#C9A84C]" />
                    )}
                    <item.icon
                      className={cn(
                        'h-4 w-4 flex-shrink-0',
                        active ? 'text-[#C9A84C]' : 'text-[#6B6B80]'
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Back to platform */}
        <div className="border-t border-[#1F1F2E] p-3">
          <Link
            href="/marketplace"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B6B80] transition-colors hover:bg-[#1A1A24] hover:text-[#A0A0B2]"
          >
            <LogOut className="h-4 w-4" />
            Back to platform
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-60 flex-1">
        <main className="min-h-screen">
          <div className="page-content animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
