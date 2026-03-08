import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { getKycSubmissionsForAdmin, type AdminKycItem } from '@/lib/compliance/kyc-query'
import { getLegacyPlansForAdmin, type AdminLegacyItem } from '@/lib/compliance/legacy-query'
import { ComplianceQueueClient } from '@/components/admin/compliance-queue-client'
import {
  MOCK_COMPLIANCE_QUEUE,
  type ComplianceQueueItem,
  type ComplianceItemStatus,
} from '@/lib/admin/mock-admin-data'

export const metadata: Metadata = {
  title: 'Compliance — Admin',
  description: 'KYC verification, listing reviews, inheritance submissions, and flagged anomalies.',
}

// ---------------------------------------------------------------------------
// /admin/compliance — Compliance review queue
//
// KYC items:         sourced from DB via getKycSubmissionsForAdmin (real)
// Inheritance items: sourced from DB via getLegacyPlansForAdmin (real)
// All other types:   sourced from MOCK_COMPLIANCE_QUEUE (Listing, Anomaly)
// ---------------------------------------------------------------------------

function kycItemToQueueItem(item: AdminKycItem): ComplianceQueueItem {
  const daysInQueue = Math.max(
    0,
    Math.floor((Date.now() - new Date(item.submittedAt).getTime()) / 86_400_000),
  )

  const statusMap: Record<string, ComplianceItemStatus> = {
    PENDING:   'PENDING',
    SUBMITTED: 'IN_REVIEW',
    VERIFIED:  'APPROVED',
    REJECTED:  'REJECTED',
  }

  return {
    id:              `kyc-${item.id}`,
    kycSubmissionId: item.id,
    type:            'KYC',
    status:          statusMap[item.status] ?? 'PENDING',
    priority:        daysInQueue > 7 ? 'CRITICAL' : daysInQueue > 3 ? 'HIGH' : daysInQueue > 0 ? 'NORMAL' : 'NEW',
    subjectId:       item.user.id,
    subjectLabel:    item.user.name ?? item.user.email,
    subjectMeta:     item.user.userType ?? item.user.role,
    notes:           item.reviewNote ?? 'KYC submission pending review.',
    documentCount:   [item.idFrontUrl, item.idBackUrl, item.selfieUrl].filter(Boolean).length || undefined,
    submittedAt:     new Date(item.submittedAt).toISOString(),
    daysInQueue,
  }
}

function legacyItemToQueueItem(item: AdminLegacyItem): ComplianceQueueItem {
  const daysInQueue = Math.max(
    0,
    Math.floor((Date.now() - item.submittedAt.getTime()) / 86_400_000),
  )

  const statusMap: Record<string, ComplianceItemStatus> = {
    SUBMITTED:    'IN_REVIEW',
    UNDER_REVIEW: 'IN_REVIEW',
  }

  return {
    id:           `legacy-${item.id}`,
    legacyPlanId: item.id,
    type:         'INHERITANCE',
    status:       statusMap[item.status] ?? 'PENDING',
    priority:     daysInQueue > 7 ? 'CRITICAL' : daysInQueue > 3 ? 'HIGH' : daysInQueue > 0 ? 'NORMAL' : 'NEW',
    subjectId:    item.userId,
    subjectLabel: item.user.name ?? item.user.email,
    subjectMeta:  item.user.userType ?? item.user.role,
    notes:        item.reviewNote ?? `Legacy plan submitted with ${item.beneficiaryCount} beneficiar${item.beneficiaryCount === 1 ? 'y' : 'ies'}.`,
    submittedAt:  item.submittedAt.toISOString(),
    daysInQueue,
  }
}

export default async function AdminCompliancePage() {
  await requireAdmin()

  // Real submissions from DB
  const [kycSubmissions, legacyPlans] = await Promise.all([
    getKycSubmissionsForAdmin(),
    getLegacyPlansForAdmin(),
  ])

  const realKycItems    = kycSubmissions.map(kycItemToQueueItem)
  const realLegacyItems = legacyPlans.map(legacyItemToQueueItem)

  // Mock items for types not yet backed by DB (Listing, Anomaly)
  const mockOther = MOCK_COMPLIANCE_QUEUE.filter(
    (i) => i.type !== 'KYC' && i.type !== 'INHERITANCE',
  )

  // Merge: real items first, then mock placeholders
  const items: ComplianceQueueItem[] = [...realKycItems, ...realLegacyItems, ...mockOther]

  return <ComplianceQueueClient items={items} />
}
