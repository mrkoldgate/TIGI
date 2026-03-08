import type { UserRole, KycStatus } from '@prisma/client'

// ---------------------------------------------------------------------------
// RBAC — Role-Based Access Control utilities.
// Based on docs/flows/role-matrix.md §5.1
//
// DB roles: INVESTOR | OWNER | BOTH | ADMIN | COMPLIANCE_OFFICER
// ---------------------------------------------------------------------------

type SessionUser = {
  role?: UserRole | string
  kycStatus?: KycStatus | string
  subscriptionTier?: string
}

// ---------------------------------------------------------------------------
// Role checks
// ---------------------------------------------------------------------------

export function hasRole(user: SessionUser | null | undefined, ...roles: (UserRole | string)[]): boolean {
  if (!user) return false
  return roles.includes(user.role ?? '')
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return hasRole(user, 'ADMIN')
}

export function isComplianceOfficer(user: SessionUser | null | undefined): boolean {
  return hasRole(user, 'COMPLIANCE_OFFICER')
}

export function isAdminOrCompliance(user: SessionUser | null | undefined): boolean {
  return hasRole(user, 'ADMIN', 'COMPLIANCE_OFFICER')
}

export function isOwner(user: SessionUser | null | undefined): boolean {
  return hasRole(user, 'OWNER', 'BOTH', 'ADMIN')
}

export function isInvestor(user: SessionUser | null | undefined): boolean {
  return hasRole(user, 'INVESTOR', 'BOTH', 'ADMIN')
}

// ---------------------------------------------------------------------------
// KYC checks
// ---------------------------------------------------------------------------

export function hasKyc(user: SessionUser | null | undefined): boolean {
  return user?.kycStatus === 'VERIFIED'
}

export function kycPending(user: SessionUser | null | undefined): boolean {
  return user?.kycStatus === 'PENDING' || user?.kycStatus === 'SUBMITTED'
}

// ---------------------------------------------------------------------------
// Subscription checks
// ---------------------------------------------------------------------------

export function isPro(user: SessionUser | null | undefined): boolean {
  const tier = user?.subscriptionTier
  return tier === 'pro' || tier === 'pro_plus' || tier === 'enterprise'
}

export function isProPlus(user: SessionUser | null | undefined): boolean {
  const tier = user?.subscriptionTier
  return tier === 'pro_plus' || tier === 'enterprise'
}

// ---------------------------------------------------------------------------
// Permission matrix
// Based on role-matrix.md §5.2 — coarse feature permissions
// ---------------------------------------------------------------------------

type Permission =
  | 'marketplace.browse'
  | 'marketplace.invest'
  | 'property.list'
  | 'property.manage'
  | 'ai.basicValuation'
  | 'ai.deepValuation'
  | 'kyc.submit'
  | 'admin.dashboard'
  | 'admin.compliance'
  | 'legacy.designate'

const PERMISSION_MAP: Record<Permission, (user: SessionUser) => boolean> = {
  'marketplace.browse': () => true,
  'marketplace.invest': (u) => isInvestor(u) && hasKyc(u),
  'property.list': (u) => isOwner(u),
  'property.manage': (u) => isOwner(u),
  'ai.basicValuation': (u) => !!u.role,
  'ai.deepValuation': (u) => isPro(u),
  'kyc.submit': (u) => !!u.role,
  'admin.dashboard': (u) => isAdmin(u),
  'admin.compliance': (u) => isAdminOrCompliance(u),
  'legacy.designate': (u) => isInvestor(u),
}

export function hasPermission(
  user: SessionUser | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false
  return PERMISSION_MAP[permission]?.(user) ?? false
}
