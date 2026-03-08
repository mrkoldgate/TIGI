import { AdminShell } from '@/components/layout/admin-shell'

// Admin layout — ADMIN role only.
// Role check is handled in middleware.ts (requireRole(['ADMIN'])).
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
