// ---------------------------------------------------------------------------
// TIGI Inquiry — type definitions.
//
// InquiryType  — maps to the Prisma enum (GENERAL | INTERESTED_BUYING | …)
// InquiryStatus — NEW | READ | REPLIED
// InquiryDTO   — the client-facing shape returned from the API and service
//
// These types sit between the raw Prisma model and the UI layer.
// ---------------------------------------------------------------------------

export type InquiryType =
  | 'GENERAL'
  | 'INTERESTED_BUYING'
  | 'INTERESTED_INVESTING'
  | 'INTERESTED_LEASING'

export type InquiryStatus = 'NEW' | 'READ' | 'REPLIED'

// ---------------------------------------------------------------------------
// UI display helpers
// ---------------------------------------------------------------------------

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  GENERAL:               'General Question',
  INTERESTED_BUYING:     'Interested in Buying',
  INTERESTED_INVESTING:  'Interested in Investing',
  INTERESTED_LEASING:    'Interested in Leasing',
}

export const INQUIRY_TYPE_SHORT: Record<InquiryType, string> = {
  GENERAL:               'Question',
  INTERESTED_BUYING:     'Buy',
  INTERESTED_INVESTING:  'Invest',
  INTERESTED_LEASING:    'Lease',
}

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  NEW:     'Sent',
  READ:    'Viewed',
  REPLIED: 'Replied',
}

// ---------------------------------------------------------------------------
// API / service shapes
// ---------------------------------------------------------------------------

/** Payload accepted by POST /api/inquiries */
export interface SubmitInquiryPayload {
  propertyId:  string
  inquiryType: InquiryType
  message:     string
}

/** Client-facing inquiry shape returned from GET /api/inquiries */
export interface InquiryDTO {
  id:             string
  propertyId:     string
  propertyTitle:  string
  propertyCity:   string
  propertyState:  string
  propertyType:   string
  ownerId:        string
  fromUserId:     string
  fromUserName:   string | null
  fromInitials:   string
  inquiryType:    InquiryType
  message:        string
  status:         InquiryStatus
  createdAt:      string
}
