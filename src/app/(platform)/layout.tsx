import { AppShell } from '@/components/layout/app-shell'
import { SavedListingsProvider } from '@/lib/saved/saved-context'
import { AssistantProvider } from '@/lib/assistant/assistant-context'

// Platform layout — authenticated users only.
// Auth check is handled in middleware.ts.
// Layout wraps all /marketplace, /portfolio, /transactions, etc.
//
// SavedListingsProvider — save state shared across marketplace, detail pages,
//   /saved page, and sidebar badge.
// AssistantProvider — Aria panel open/close state and conversation shared
//   across all platform pages; panel is mounted in AppShell.
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SavedListingsProvider>
      <AssistantProvider>
        <AppShell>{children}</AppShell>
      </AssistantProvider>
    </SavedListingsProvider>
  )
}
