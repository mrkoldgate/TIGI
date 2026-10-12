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
    <div className="relative flex min-h-screen bg-black text-white selection:bg-violet-500/30">
      {/* Atmosphere — same orbs as the public site: indigo + violet, a trace of cyan */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute -right-40 -top-56 h-[760px] w-[760px] rounded-full bg-violet-600/[0.08] blur-[180px]" />
        <div className="absolute -bottom-64 left-[10%] h-[680px] w-[680px] rounded-full bg-indigo-500/[0.07] blur-[180px]" />
        <div className="absolute right-[20%] top-[45%] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.03] blur-[160px]" />
      </div>

      {/* Sidebar — fixed left column (desktop) / overlay (mobile) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* 
          Main Layout Grid (Desktop)
          We use a grid with an empty spacer column to physically reserve the space 
          for the fixed sidebar. This is the gold standard for reliable dashboard layouts.
      */}
      <div 
        className={cn(
          "grid min-h-screen w-full transition-all duration-300",
          sidebarCollapsed ? "md:grid-cols-[72px_1fr]" : "md:grid-cols-[248px_1fr]",
          "grid-cols-1"
        )}
      >
        {/* Sidebar Spacer — Takes up the fixed sidebar's space on desktop */}
        <div className="hidden md:block" aria-hidden="true" />

        {/* Content Column */}
        <div className="flex min-w-0 flex-col flex-1">
          {/* TopNav — sticky, spans content width */}
          <TopNav
            onMobileMenuToggle={() => setMobileSidebarOpen((o) => !o)}
            user={user}
          />

          {/* Scrollable content area */}
          <main className="relative min-w-0 flex-1 overflow-x-clip">
            <div className="mx-auto w-full max-w-[1360px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Aria — floating trigger + slide-over panel */}
      <AssistantTrigger />
      <AssistantPanel />
    </div>
  )
}
