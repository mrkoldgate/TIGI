import type { Metadata } from 'next'
import { ComplianceQueueClient } from '@/components/admin/compliance-queue-client'
import { MOCK_COMPLIANCE_QUEUE } from '@/lib/admin/mock-admin-data'

export const metadata: Metadata = {
  title: 'Compliance — Admin',
  description: 'KYC verification, listing reviews, inheritance submissions, and flagged anomalies.',
}

// ---------------------------------------------------------------------------
// /admin/compliance — Compliance review queue
//
// M2:  Full review workflows (approve / reject / escalate), document viewer,
//      audit trail, KYC document comparison.
// M5:  AML automated transaction screening, suspicious activity reports.
// M8:  Inheritance submission legal workflow.
// M10: FINCEN / SEC regulatory reporting exports for tokenized offerings.
// ---------------------------------------------------------------------------

export default function AdminCompliancePage() {
  return <ComplianceQueueClient items={MOCK_COMPLIANCE_QUEUE} />
}
