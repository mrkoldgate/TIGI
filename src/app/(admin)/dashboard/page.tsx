import type { Metadata } from 'next'
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client'

export const metadata: Metadata = {
  title: 'Command Center — Admin',
  description: 'TIGI platform administration and oversight.',
}

export default function AdminDashboardPage() {
  return <AdminDashboardClient />
}
