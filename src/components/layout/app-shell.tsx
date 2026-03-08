'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'
import { AssistantPanel } from '@/components/assistant/assistant-panel'
import { AssistantTrigger } from '@/components/assistant/assistant-trigger'

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
  name:  string | null
  email: string
}

interface AppShellProps {
  children: React.ReactNode
  user?:    ShellUser | null
}

export function AppShell({ children, user }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      {/* Sidebar — fixed left column (desktop) / overlay (mobile) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content column — offset by sidebar width on desktop only */}
      <div
        className="flex flex-1 flex-col transition-all duration-200 md:ml-[--sidebar-w]"
        style={{ '--sidebar-w': sidebarCollapsed ? '64px' : '240px' } as React.CSSProperties}
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
