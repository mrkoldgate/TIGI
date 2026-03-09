import { describe, it, expect } from 'vitest'
import {
  hasRole,
  isAdmin,
  isComplianceOfficer,
  isAdminOrCompliance,
  isOwner,
  isInvestor,
  hasKyc,
  kycPending,
  isPro,
  isProPlus,
  hasPermission,
} from '@/lib/auth/rbac'

// ---------------------------------------------------------------------------
// rbac — pure role/KYC/subscription helpers
// ---------------------------------------------------------------------------

describe('hasRole', () => {
  it('returns false for null user', () => {
    expect(hasRole(null, 'ADMIN')).toBe(false)
  })
  it('returns false for undefined user', () => {
    expect(hasRole(undefined, 'ADMIN')).toBe(false)
  })
  it('returns true when role matches single argument', () => {
    expect(hasRole({ role: 'ADMIN' }, 'ADMIN')).toBe(true)
  })
  it('returns true when role matches any of the listed arguments', () => {
    expect(hasRole({ role: 'OWNER' }, 'INVESTOR', 'OWNER', 'BOTH')).toBe(true)
  })
  it('returns false when role does not match', () => {
    expect(hasRole({ role: 'INVESTOR' }, 'ADMIN')).toBe(false)
  })
})

describe('isAdmin', () => {
  it('returns true for ADMIN role', () => {
    expect(isAdmin({ role: 'ADMIN' })).toBe(true)
  })
  it('returns false for non-admin roles', () => {
    expect(isAdmin({ role: 'COMPLIANCE_OFFICER' })).toBe(false)
    expect(isAdmin({ role: 'INVESTOR' })).toBe(false)
    expect(isAdmin({ role: 'OWNER' })).toBe(false)
  })
})

describe('isAdminOrCompliance', () => {
  it('returns true for ADMIN', () => {
    expect(isAdminOrCompliance({ role: 'ADMIN' })).toBe(true)
  })
  it('returns true for COMPLIANCE_OFFICER', () => {
    expect(isAdminOrCompliance({ role: 'COMPLIANCE_OFFICER' })).toBe(true)
  })
  it('returns false for other roles', () => {
    expect(isAdminOrCompliance({ role: 'INVESTOR' })).toBe(false)
  })
})

describe('isOwner', () => {
  it('returns true for OWNER, BOTH, ADMIN', () => {
    expect(isOwner({ role: 'OWNER' })).toBe(true)
    expect(isOwner({ role: 'BOTH' })).toBe(true)
    expect(isOwner({ role: 'ADMIN' })).toBe(true)
  })
  it('returns false for INVESTOR and COMPLIANCE_OFFICER', () => {
    expect(isOwner({ role: 'INVESTOR' })).toBe(false)
    expect(isOwner({ role: 'COMPLIANCE_OFFICER' })).toBe(false)
  })
})

describe('isInvestor', () => {
  it('returns true for INVESTOR, BOTH, ADMIN', () => {
    expect(isInvestor({ role: 'INVESTOR' })).toBe(true)
    expect(isInvestor({ role: 'BOTH' })).toBe(true)
    expect(isInvestor({ role: 'ADMIN' })).toBe(true)
  })
  it('returns false for OWNER', () => {
    expect(isInvestor({ role: 'OWNER' })).toBe(false)
  })
})

describe('hasKyc', () => {
  it('returns true only for VERIFIED status', () => {
    expect(hasKyc({ kycStatus: 'VERIFIED' })).toBe(true)
    expect(hasKyc({ kycStatus: 'PENDING' })).toBe(false)
    expect(hasKyc({ kycStatus: 'SUBMITTED' })).toBe(false)
    expect(hasKyc({ kycStatus: 'REJECTED' })).toBe(false)
    expect(hasKyc({})).toBe(false)
    expect(hasKyc(null)).toBe(false)
  })
})

describe('kycPending', () => {
  it('returns true for PENDING and SUBMITTED', () => {
    expect(kycPending({ kycStatus: 'PENDING' })).toBe(true)
    expect(kycPending({ kycStatus: 'SUBMITTED' })).toBe(true)
  })
  it('returns false for VERIFIED and REJECTED', () => {
    expect(kycPending({ kycStatus: 'VERIFIED' })).toBe(false)
    expect(kycPending({ kycStatus: 'REJECTED' })).toBe(false)
    expect(kycPending({})).toBe(false)
  })
})

describe('isPro', () => {
  it('returns true for pro, pro_plus, enterprise', () => {
    expect(isPro({ subscriptionTier: 'pro' })).toBe(true)
    expect(isPro({ subscriptionTier: 'pro_plus' })).toBe(true)
    expect(isPro({ subscriptionTier: 'enterprise' })).toBe(true)
  })
  it('returns false for free and undefined', () => {
    expect(isPro({ subscriptionTier: 'free' })).toBe(false)
    expect(isPro({})).toBe(false)
    expect(isPro(null)).toBe(false)
  })
})

describe('isProPlus', () => {
  it('returns true only for pro_plus and enterprise', () => {
    expect(isProPlus({ subscriptionTier: 'pro_plus' })).toBe(true)
    expect(isProPlus({ subscriptionTier: 'enterprise' })).toBe(true)
    expect(isProPlus({ subscriptionTier: 'pro' })).toBe(false)
    expect(isProPlus({ subscriptionTier: 'free' })).toBe(false)
  })
})

describe('hasPermission', () => {
  it('returns false for null user on any permission', () => {
    expect(hasPermission(null, 'marketplace.browse')).toBe(false)
    expect(hasPermission(null, 'admin.dashboard')).toBe(false)
  })

  it('marketplace.browse is open to all authenticated users', () => {
    expect(hasPermission({ role: 'INVESTOR' }, 'marketplace.browse')).toBe(true)
    expect(hasPermission({ role: 'OWNER' }, 'marketplace.browse')).toBe(true)
  })

  it('marketplace.invest requires INVESTOR role + VERIFIED KYC', () => {
    expect(hasPermission({ role: 'INVESTOR', kycStatus: 'VERIFIED' }, 'marketplace.invest')).toBe(true)
    expect(hasPermission({ role: 'INVESTOR', kycStatus: 'PENDING' },  'marketplace.invest')).toBe(false)
    expect(hasPermission({ role: 'OWNER',    kycStatus: 'VERIFIED' }, 'marketplace.invest')).toBe(false)
  })

  it('property.list requires owner-type role', () => {
    expect(hasPermission({ role: 'OWNER' },    'property.list')).toBe(true)
    expect(hasPermission({ role: 'BOTH' },     'property.list')).toBe(true)
    expect(hasPermission({ role: 'INVESTOR' }, 'property.list')).toBe(false)
  })

  it('ai.deepValuation requires Pro subscription', () => {
    expect(hasPermission({ role: 'INVESTOR', subscriptionTier: 'pro' },  'ai.deepValuation')).toBe(true)
    expect(hasPermission({ role: 'INVESTOR', subscriptionTier: 'free' }, 'ai.deepValuation')).toBe(false)
  })

  it('admin.dashboard requires ADMIN role', () => {
    expect(hasPermission({ role: 'ADMIN' },    'admin.dashboard')).toBe(true)
    expect(hasPermission({ role: 'INVESTOR' }, 'admin.dashboard')).toBe(false)
  })

  it('admin.compliance accepts ADMIN and COMPLIANCE_OFFICER', () => {
    expect(hasPermission({ role: 'ADMIN' },              'admin.compliance')).toBe(true)
    expect(hasPermission({ role: 'COMPLIANCE_OFFICER' }, 'admin.compliance')).toBe(true)
    expect(hasPermission({ role: 'OWNER' },              'admin.compliance')).toBe(false)
  })
})
