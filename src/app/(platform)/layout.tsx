import { AppShell } from '@/components/layout/app-shell'

// Platform layout — authenticated users only.
// Auth check is handled in middleware.ts.
// Layout wraps all /marketplace, /portfolio, /transactions, etc.
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
