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
    <div className="relative flex min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Background Atmosphere — pure black void with slow-drift orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-indigo-900/[0.07] rounded-full blur-[160px] -translate-y-1/2 translate-x-1/3 animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-violet-900/[0.06] rounded-full blur-[140px] translate-y-1/3 -translate-x-1/3 animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-900/[0.03] rounded-full blur-[120px]" />
        {/* Noise texture overlay */}
        <div className="noise absolute inset-0" />
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
          sidebarCollapsed ? "md:grid-cols-[64px_1fr]" : "md:grid-cols-[240px_1fr]",
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
          <main className="flex-1 overflow-auto">
            <div className="px-4 pb-16 sm:px-6 lg:px-12">
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
