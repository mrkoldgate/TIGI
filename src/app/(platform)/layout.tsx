import { AppShell } from '@/components/layout/app-shell'
import { SavedListingsProvider } from '@/lib/saved/saved-context'
import { AssistantProvider } from '@/lib/assistant/assistant-context'
import { getCurrentUser } from '@/lib/auth/session'
import { getSavedEntriesForUser } from '@/lib/saved/saved-query'

// Platform layout — authenticated users only.
// Auth enforcement is handled in middleware.ts (authConfig.authorized callback).
//
// Async so it can:
//   - seed SavedListingsProvider from DB (no empty-then-hydrate flash)
//   - pass real user context to AppShell → TopNav → UserMenu
//
// SavedListingsProvider — save state shared across marketplace, detail pages,
//   /saved page, sidebar badge, and all card components.
// AssistantProvider — Aria panel open/close + conversation shared across pages.
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  // undefined → local (localStorage) mode; [] → authenticated with nothing saved yet
  const initialEntries = user ? await getSavedEntriesForUser(user.id) : undefined

  // Minimal user context surfaced in the shell (UserMenu, etc.)
  const shellUser = user
    ? { name: user.name ?? null, email: user.email ?? '' }
    : null

  return (
    <SavedListingsProvider initialEntries={initialEntries}>
      <AssistantProvider>
        <AppShell user={shellUser}>{children}</AppShell>
      </AssistantProvider>
    </SavedListingsProvider>
  )
}
