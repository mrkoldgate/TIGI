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
  glowColor:      string  // CSS rgba for Wope/Dimension-style neon glow
  defaultActionUrl: string // fallback URL when no actionUrl was stored
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  LISTING_APPROVED: {
    label: 'Listing Approved',
    iconName: 'CheckCircle2',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    glowColor: 'rgba(52,211,153,0.6)',
    defaultActionUrl: '/listings',
  },
  LISTING_REJECTED: {
    label: 'Listing Rejected',
    iconName: 'XCircle',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    glowColor: 'rgba(248,113,113,0.5)',
    defaultActionUrl: '/listings',
  },
  LISTING_UPDATE_REQUESTED: {
    label: 'Update Requested',
    iconName: 'AlertCircle',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    glowColor: 'rgba(251,191,36,0.5)',
    defaultActionUrl: '/listings',
  },
  KYC_APPROVED: {
    label: 'Identity Verified',
    iconName: 'ShieldCheck',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    glowColor: 'rgba(52,211,153,0.6)',
    defaultActionUrl: '/settings',
  },
  KYC_REJECTED: {
    label: 'Verification Declined',
    iconName: 'ShieldX',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    glowColor: 'rgba(248,113,113,0.5)',
    defaultActionUrl: '/settings',
  },
  KYC_UPDATE_REQUESTED: {
    label: 'Update Required',
    iconName: 'ShieldAlert',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    glowColor: 'rgba(251,191,36,0.5)',
    defaultActionUrl: '/settings',
  },
  INTENT_CREATED: {
    label: 'New Interest',
    iconName: 'TrendingUp',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    glowColor: 'rgba(34,211,238,0.5)',
    defaultActionUrl: '/listings',
  },
  LEASE_INTEREST_CREATED: {
    label: 'Lease Interest',
    iconName: 'MapPin',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    glowColor: 'rgba(96,165,250,0.5)',
    defaultActionUrl: '/listings',
  },
  LEGACY_SUBMITTED: {
    label: 'Plan Submitted',
    iconName: 'Landmark',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    glowColor: 'rgba(167,139,250,0.5)',
    defaultActionUrl: '/inheritance',
  },
  LEGACY_APPROVED: {
    label: 'Plan Approved',
    iconName: 'CheckCircle2',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    glowColor: 'rgba(52,211,153,0.6)',
    defaultActionUrl: '/inheritance',
  },
  LEGACY_REJECTED: {
    label: 'Plan Suspended',
    iconName: 'XCircle',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    glowColor: 'rgba(248,113,113,0.5)',
    defaultActionUrl: '/inheritance',
  },
  LEGACY_UPDATE_REQUESTED: {
    label: 'Plan Update Needed',
    iconName: 'AlertCircle',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    glowColor: 'rgba(251,191,36,0.5)',
    defaultActionUrl: '/inheritance',
  },
  SYSTEM_ANNOUNCEMENT: {
    label: 'Announcement',
    iconName: 'Bell',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    glowColor: 'rgba(34,211,238,0.5)',
    defaultActionUrl: '/dashboard',
  },
}
