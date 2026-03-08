// ---------------------------------------------------------------------------
// Notification type config — single source of truth for icon, color, label,
// and default deep-link for every NotificationType.
//
// iconName strings map to Lucide icon names. Client components import and
// render the actual icon; the config stays server-safe (no JSX).
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'LISTING_UPDATE_REQUESTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'KYC_UPDATE_REQUESTED'
  | 'INTENT_CREATED'
  | 'LEASE_INTEREST_CREATED'
  | 'LEGACY_SUBMITTED'
  | 'LEGACY_APPROVED'
  | 'LEGACY_REJECTED'
  | 'LEGACY_UPDATE_REQUESTED'
  | 'SYSTEM_ANNOUNCEMENT'

export interface NotificationTypeConfig {
  label:          string
  iconName:       string  // Lucide icon component name
  color:          string  // text color class
  bgColor:        string  // background tint class
  borderColor:    string  // border color class
  defaultActionUrl: string // fallback URL when no actionUrl was stored
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  LISTING_APPROVED: {
    label: 'Listing Approved',
    iconName: 'CheckCircle2',
    color: 'text-[#4ADE80]',
    bgColor: 'bg-[#22C55E]/10',
    borderColor: 'border-[#22C55E]/20',
    defaultActionUrl: '/listings',
  },
  LISTING_REJECTED: {
    label: 'Listing Rejected',
    iconName: 'XCircle',
    color: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    borderColor: 'border-[#EF4444]/20',
    defaultActionUrl: '/listings',
  },
  LISTING_UPDATE_REQUESTED: {
    label: 'Update Requested',
    iconName: 'AlertCircle',
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
    borderColor: 'border-[#F59E0B]/20',
    defaultActionUrl: '/listings',
  },
  KYC_APPROVED: {
    label: 'Identity Verified',
    iconName: 'ShieldCheck',
    color: 'text-[#4ADE80]',
    bgColor: 'bg-[#22C55E]/10',
    borderColor: 'border-[#22C55E]/20',
    defaultActionUrl: '/settings',
  },
  KYC_REJECTED: {
    label: 'Verification Declined',
    iconName: 'ShieldX',
    color: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    borderColor: 'border-[#EF4444]/20',
    defaultActionUrl: '/settings',
  },
  KYC_UPDATE_REQUESTED: {
    label: 'Update Required',
    iconName: 'ShieldAlert',
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
    borderColor: 'border-[#F59E0B]/20',
    defaultActionUrl: '/settings',
  },
  INTENT_CREATED: {
    label: 'New Interest',
    iconName: 'TrendingUp',
    color: 'text-[#C9A84C]',
    bgColor: 'bg-[#C9A84C]/10',
    borderColor: 'border-[#C9A84C]/20',
    defaultActionUrl: '/listings',
  },
  LEASE_INTEREST_CREATED: {
    label: 'Lease Interest',
    iconName: 'MapPin',
    color: 'text-[#60A5FA]',
    bgColor: 'bg-[#3B82F6]/10',
    borderColor: 'border-[#3B82F6]/20',
    defaultActionUrl: '/listings',
  },
  LEGACY_SUBMITTED: {
    label: 'Plan Submitted',
    iconName: 'Landmark',
    color: 'text-[#A78BFA]',
    bgColor: 'bg-[#A78BFA]/10',
    borderColor: 'border-[#A78BFA]/20',
    defaultActionUrl: '/inheritance',
  },
  LEGACY_APPROVED: {
    label: 'Plan Approved',
    iconName: 'CheckCircle2',
    color: 'text-[#4ADE80]',
    bgColor: 'bg-[#22C55E]/10',
    borderColor: 'border-[#22C55E]/20',
    defaultActionUrl: '/inheritance',
  },
  LEGACY_REJECTED: {
    label: 'Plan Suspended',
    iconName: 'XCircle',
    color: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    borderColor: 'border-[#EF4444]/20',
    defaultActionUrl: '/inheritance',
  },
  LEGACY_UPDATE_REQUESTED: {
    label: 'Plan Update Needed',
    iconName: 'AlertCircle',
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
    borderColor: 'border-[#F59E0B]/20',
    defaultActionUrl: '/inheritance',
  },
  SYSTEM_ANNOUNCEMENT: {
    label: 'Announcement',
    iconName: 'Bell',
    color: 'text-[#C9A84C]',
    bgColor: 'bg-[#C9A84C]/10',
    borderColor: 'border-[#C9A84C]/20',
    defaultActionUrl: '/dashboard',
  },
}
