import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { getKycSubmissionsForAdmin, type AdminKycItem } from '@/lib/compliance/kyc-query'
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
// KYC items: sourced from DB via getKycSubmissionsForAdmin (real submissions).
// All other types: sourced from MOCK_COMPLIANCE_QUEUE (Listing, Inheritance,
//   Anomaly not yet backed by DB — coming in later milestones).
//
// KYC items have kycSubmissionId populated so ComplianceQueue can enable
// the Approve / Reject / Escalate action buttons.
// ---------------------------------------------------------------------------

function kycItemToQueueItem(item: AdminKycItem): ComplianceQueueItem {
  const daysInQueue = Math.max(
    0,
    Math.floor((Date.now() - new Date(item.submittedAt).getTime()) / 86_400_000),
  )

  // Map KycStatus → ComplianceItemStatus
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

export default async function AdminCompliancePage() {
  await requireAdmin()

  // Real KYC submissions from DB
  const kycSubmissions = await getKycSubmissionsForAdmin()
  const realKycItems   = kycSubmissions.map(kycItemToQueueItem)

  // Non-KYC items still come from mock data (Listing, Inheritance, Anomaly)
  const mockNonKyc = MOCK_COMPLIANCE_QUEUE.filter((i) => i.type !== 'KYC')

  // Merge: real KYC first, then mock non-KYC
  const items: ComplianceQueueItem[] = [...realKycItems, ...mockNonKyc]

  return <ComplianceQueueClient items={items} />
}
