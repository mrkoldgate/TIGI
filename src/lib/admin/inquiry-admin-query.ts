// ---------------------------------------------------------------------------
// Admin inquiry query — aggregate counts for the admin command center.
//
// Returns gracefully on DB error so the admin dashboard degrades silently
// rather than crashing.
// ---------------------------------------------------------------------------

import { prisma } from '@/lib/db'

export interface InquirySummary {
  /** Total inquiries across all listings */
  total:    number
  /** Inquiries with status = NEW (unread) */
  newCount: number
  /** Inquiries created in the last 7 days */
  last7d:   number
}

export async function getInquirySummaryForAdmin(): Promise<InquirySummary> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const [total, newCount, last7d] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.inquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ])
    return { total, newCount, last7d }
  } catch {
    return { total: 0, newCount: 0, last7d: 0 }
  }
}
