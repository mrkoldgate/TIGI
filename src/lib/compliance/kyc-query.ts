// ---------------------------------------------------------------------------
// kyc-query.ts — Server-side KYC data fetching.
//
// Used by:
//   - /settings/kyc page (user-facing status + history)
//   - /admin/compliance page (admin review queue)
//
// All functions are wrapped in React cache() for request deduplication.
// ---------------------------------------------------------------------------

import { cache } from 'react'
import { prisma } from '@/lib/db'
import type { KycStatus } from '@prisma/client'

// ── User-facing ───────────────────────────────────────────────────────────────

export interface KycStatusData {
  kycStatus: KycStatus
  verification: {
    id:          string
    status:      KycStatus
    provider:    string
    idFrontUrl:  string | null
    idBackUrl:   string | null
    selfieUrl:   string | null
    reviewNote:  string | null
    reviewedAt:  Date   | null
    submittedAt: Date
    updatedAt:   Date
  } | null
}

export const getKycStatusForUser = cache(
  async (userId: string): Promise<KycStatusData> => {
    try {
      const [user, latest] = await Promise.all([
        prisma.user.findUnique({
          where:  { id: userId },
          select: { kycStatus: true },
        }),
        prisma.kycVerification.findFirst({
          where:   { userId },
          orderBy: { submittedAt: 'desc' },
          select: {
            id:          true,
            status:      true,
            provider:    true,
            idFrontUrl:  true,
            idBackUrl:   true,
            selfieUrl:   true,
            reviewNote:  true,
            reviewedAt:  true,
            submittedAt: true,
            updatedAt:   true,
          },
        }),
      ])

      return {
        kycStatus:    user?.kycStatus ?? 'NONE',
        verification: latest,
      }
    } catch (err) {
      console.warn('[kyc-query] DB unavailable:', (err as Error).message)
      return { kycStatus: 'NONE', verification: null }
    }
  },
)

// ── Admin-facing ──────────────────────────────────────────────────────────────

export interface AdminKycItem {
  id:          string
  status:      KycStatus
  provider:    string
  idFrontUrl:  string | null
  idBackUrl:   string | null
  selfieUrl:   string | null
  reviewedBy:  string | null
  reviewNote:  string | null
  reviewedAt:  Date   | null
  submittedAt: Date
  updatedAt:   Date
  user: {
    id:       string
    name:     string | null
    email:    string
    userType: string | null
    role:     string
  }
}

export const getKycSubmissionsForAdmin = cache(
  async (statusFilter?: KycStatus): Promise<AdminKycItem[]> => {
    try {
      const rows = await prisma.kycVerification.findMany({
        where: statusFilter ? { status: statusFilter } : undefined,
        include: {
          user: {
            select: { id: true, name: true, email: true, userType: true, role: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
        take: 100,
      })
      return rows as AdminKycItem[]
    } catch (err) {
      console.warn('[kyc-query] Admin DB unavailable:', (err as Error).message)
      return []
    }
  },
)

// ── Compliance queue stats ─────────────────────────────────────────────────────

export interface KycQueueStats {
  total:     number
  pending:   number
  submitted: number
  verified:  number
  rejected:  number
}

export const getKycQueueStats = cache(async (): Promise<KycQueueStats> => {
  try {
    const counts = await prisma.kycVerification.groupBy({
      by:     ['status'],
      _count: { status: true },
    })
    const m = Object.fromEntries(counts.map((c) => [c.status, c._count.status]))
    return {
      total:     counts.reduce((s, c) => s + c._count.status, 0),
      pending:   m['PENDING']   ?? 0,
      submitted: m['SUBMITTED'] ?? 0,
      verified:  m['VERIFIED']  ?? 0,
      rejected:  m['REJECTED']  ?? 0,
    }
  } catch {
    return { total: 0, pending: 0, submitted: 0, verified: 0, rejected: 0 }
  }
})
