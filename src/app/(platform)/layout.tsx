import { AppShell } from '@/components/layout/app-shell'
import { SavedListingsProvider } from '@/lib/saved/saved-context'

// Platform layout — authenticated users only.
// Auth check is handled in middleware.ts.
// Layout wraps all /marketplace, /portfolio, /transactions, etc.
//
// SavedListingsProvider sits here so save state is shared across:
//   - Marketplace browse page
//   - Property / land detail pages
//   - /saved favorites page
//   - Sidebar saved count badge
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SavedListingsProvider>
      <AppShell>{children}</AppShell>
    </SavedListingsProvider>
  )
}
