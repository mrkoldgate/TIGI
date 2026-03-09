import { describe, it, expect } from 'vitest'
import { getPostLoginRedirect } from '@/lib/auth/session'

// ---------------------------------------------------------------------------
// session — getPostLoginRedirect is the only pure function in this module.
// requireAuth / requireAdmin / requireOnboarded call NextAuth and redirect()
// which are not testable without the full Next.js runtime.
// ---------------------------------------------------------------------------

describe('getPostLoginRedirect', () => {
  it('returns /admin/dashboard for ADMIN', () => {
    expect(getPostLoginRedirect('ADMIN')).toBe('/admin/dashboard')
  })

  it('returns /admin/compliance for COMPLIANCE_OFFICER', () => {
    expect(getPostLoginRedirect('COMPLIANCE_OFFICER')).toBe('/admin/compliance')
  })

  it('returns /listings for OWNER', () => {
    expect(getPostLoginRedirect('OWNER')).toBe('/listings')
  })

  it('returns /marketplace for INVESTOR', () => {
    expect(getPostLoginRedirect('INVESTOR')).toBe('/marketplace')
  })

  it('returns /marketplace for BOTH', () => {
    expect(getPostLoginRedirect('BOTH')).toBe('/marketplace')
  })

  it('returns /marketplace for unknown roles', () => {
    expect(getPostLoginRedirect('UNKNOWN_ROLE')).toBe('/marketplace')
  })

  it('honours a safe callbackUrl', () => {
    expect(getPostLoginRedirect('INVESTOR', '/listings/some-listing')).toBe('/listings/some-listing')
    expect(getPostLoginRedirect('ADMIN',    '/dashboard')).toBe('/dashboard')
  })

  it('ignores callbackUrl that starts with /auth to prevent open redirect loops', () => {
    expect(getPostLoginRedirect('INVESTOR', '/auth/login')).toBe('/marketplace')
  })

  it('ignores external callbackUrl (must start with /)', () => {
    expect(getPostLoginRedirect('INVESTOR', 'https://evil.com')).toBe('/marketplace')
  })

  it('uses role default when callbackUrl is null or undefined', () => {
    expect(getPostLoginRedirect('OWNER', null)).toBe('/listings')
    expect(getPostLoginRedirect('OWNER', undefined)).toBe('/listings')
  })
})
