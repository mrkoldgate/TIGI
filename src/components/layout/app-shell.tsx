'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'
import { AssistantPanel } from '@/components/assistant/assistant-panel'
import { AssistantTrigger } from '@/components/assistant/assistant-trigger'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// AppShell — Platform layout container
//
// Desktop: fixed sidebar (collapsible 240px → 64px) + content column
// Mobile:  no sidebar offset; sidebar is an overlay drawer toggled via TopNav
//
// State:
//   sidebarCollapsed — desktop only, persisted in localStorage in M2
//   mobileSidebarOpen — mobile only, toggled via hamburger in TopNav
// ---------------------------------------------------------------------------

export interface ShellUser {
  name: string | null
  email: string
}

interface AppShellProps {
  children: React.ReactNode
  user?: ShellUser | null
}

export function AppShell({ children, user }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen bg-[#020409] text-white selection:bg-[#3B82F6]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Sidebar — fixed left column (desktop) / overlay (mobile) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content column — offset by sidebar width on desktop only */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-200',
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-60'
        )}
      >
        <div className="flex flex-1 flex-col">
          {/* TopNav — sticky, spans content width */}
          <TopNav
            onMobileMenuToggle={() => setMobileSidebarOpen((o) => !o)}
            user={user}
          />

          {/* Scrollable content area — horizontal padding applied once here so every
              page gets consistent gutters without each having to repeat px-* classes.
              Vertical padding is intentionally omitted; pages own their own top/bottom
              rhythm (PageHeader, space-y-*, pb-16 etc.). */}
          <main className="flex-1 overflow-auto">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>

      {/* Aria — floating trigger + slide-over panel (both read from AssistantContext) */}
      <AssistantTrigger />
      <AssistantPanel />
    </div>
  )
}
