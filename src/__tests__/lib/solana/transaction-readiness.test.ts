import { describe, it, expect } from 'vitest'
import { evaluateReadiness } from '@/lib/solana/transaction-readiness'
import type { ReadinessInput } from '@/lib/solana/transaction-readiness'

// ---------------------------------------------------------------------------
// evaluateReadiness — pure pre-flight check function, exhaustive coverage
// ---------------------------------------------------------------------------

const BASE_CONNECTED: ReadinessInput = {
  intentStatus:  'APPROVED',
  intentType:    'EXPRESS_INTEREST',
  walletAddress: 'wallet123',
  walletMode:    'connected',
  kycStatus:     null,
}

describe('evaluateReadiness — happy path', () => {
  it('returns canPrepare=true when all checks pass for EXPRESS_INTEREST', () => {
    const result = evaluateReadiness(BASE_CONNECTED)
    expect(result.canPrepare).toBe(true)
    expect(result.blockingReason).toBeNull()
    expect(result.checks.every(c => c.passed)).toBe(true)
  })

  it('returns canPrepare=true for READY_TO_SIGN status (already prepared, refreshing)', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, intentStatus: 'READY_TO_SIGN' })
    expect(result.canPrepare).toBe(true)
  })

  it('does not include kyc_verified check for EXPRESS_INTEREST', () => {
    const result = evaluateReadiness(BASE_CONNECTED)
    const ids = result.checks.map(c => c.id)
    expect(ids).not.toContain('kyc_verified')
  })

  it('does not include kyc_verified check for PREPARE_LEASE', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, intentType: 'PREPARE_LEASE' })
    const ids = result.checks.map(c => c.id)
    expect(ids).not.toContain('kyc_verified')
  })

  it('includes kyc_verified check for PREPARE_INVEST when KYC is verified', () => {
    const result = evaluateReadiness({
      ...BASE_CONNECTED,
      intentType: 'PREPARE_INVEST',
      kycStatus:  'VERIFIED',
    })
    const kycCheck = result.checks.find(c => c.id === 'kyc_verified')
    expect(kycCheck).toBeDefined()
    expect(kycCheck!.passed).toBe(true)
    expect(result.canPrepare).toBe(true)
  })

  it('includes kyc_verified check for PREPARE_PURCHASE when KYC is verified', () => {
    const result = evaluateReadiness({
      ...BASE_CONNECTED,
      intentType: 'PREPARE_PURCHASE',
      kycStatus:  'VERIFIED',
    })
    expect(result.checks.find(c => c.id === 'kyc_verified')?.passed).toBe(true)
    expect(result.canPrepare).toBe(true)
  })
})

describe('evaluateReadiness — intent status failures', () => {
  it('fails when status is PENDING', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, intentStatus: 'PENDING' })
    expect(result.canPrepare).toBe(false)
    expect(result.checks.find(c => c.id === 'intent_status')?.passed).toBe(false)
  })

  it('fails when status is REVIEWING', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, intentStatus: 'REVIEWING' })
    expect(result.canPrepare).toBe(false)
  })

  it('fails when status is CANCELLED', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, intentStatus: 'CANCELLED' })
    expect(result.canPrepare).toBe(false)
    const check = result.checks.find(c => c.id === 'intent_status')!
    expect(check.detail).toMatch(/cancelled/i)
  })

  it('fails when status is EXECUTED', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, intentStatus: 'EXECUTED' })
    expect(result.canPrepare).toBe(false)
  })
})

describe('evaluateReadiness — wallet failures', () => {
  it('fails when walletAddress is null', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, walletAddress: null, walletMode: 'none' })
    expect(result.canPrepare).toBe(false)
    const check = result.checks.find(c => c.id === 'wallet_connected')!
    expect(check.passed).toBe(false)
    expect(check.actionHref).toBe('/settings/wallet')
  })

  it('fails when walletAddress is undefined', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, walletAddress: undefined, walletMode: 'none' })
    expect(result.checks.find(c => c.id === 'wallet_connected')?.passed).toBe(false)
  })

  it('fails wallet_type check for custodial wallet', () => {
    const result = evaluateReadiness({
      ...BASE_CONNECTED,
      walletAddress: 'custodial-address',
      walletMode:    'custodial',
    })
    const typeCheck = result.checks.find(c => c.id === 'wallet_type')!
    expect(typeCheck.passed).toBe(false)
    expect(result.canPrepare).toBe(false)
  })

  it('wallet_type check passes for connected mode', () => {
    const result = evaluateReadiness(BASE_CONNECTED)
    expect(result.checks.find(c => c.id === 'wallet_type')?.passed).toBe(true)
  })
})

describe('evaluateReadiness — KYC failures', () => {
  it('fails kyc_verified when KYC is not VERIFIED for PREPARE_INVEST', () => {
    const cases = [null, undefined, 'PENDING', 'SUBMITTED', 'REJECTED']
    for (const kycStatus of cases) {
      const result = evaluateReadiness({
        ...BASE_CONNECTED,
        intentType: 'PREPARE_INVEST',
        kycStatus,
      })
      const kycCheck = result.checks.find(c => c.id === 'kyc_verified')!
      expect(kycCheck.passed, `kycStatus=${kycStatus}`).toBe(false)
      expect(result.canPrepare).toBe(false)
    }
  })

  it('shows actionHref=/settings/kyc when KYC is not started', () => {
    const result = evaluateReadiness({
      ...BASE_CONNECTED,
      intentType: 'PREPARE_INVEST',
      kycStatus:  null,
    })
    const kycCheck = result.checks.find(c => c.id === 'kyc_verified')!
    expect(kycCheck.actionHref).toBe('/settings/kyc')
  })

  it('does NOT show actionHref when KYC is PENDING/SUBMITTED (no action to take)', () => {
    const result = evaluateReadiness({
      ...BASE_CONNECTED,
      intentType: 'PREPARE_INVEST',
      kycStatus:  'PENDING',
    })
    const kycCheck = result.checks.find(c => c.id === 'kyc_verified')!
    expect(kycCheck.actionHref).toBeUndefined()
  })
})

describe('evaluateReadiness — blocking reason and nextAction', () => {
  it('sets blockingReason to the first failing check detail', () => {
    const result = evaluateReadiness({ ...BASE_CONNECTED, intentStatus: 'PENDING' })
    expect(result.blockingReason).not.toBeNull()
    expect(typeof result.blockingReason).toBe('string')
  })

  it('blockingReason is null when canPrepare=true', () => {
    const result = evaluateReadiness(BASE_CONNECTED)
    expect(result.blockingReason).toBeNull()
  })

  it('nextAction mentions "ready" when canPrepare=true', () => {
    const result = evaluateReadiness(BASE_CONNECTED)
    expect(result.nextAction.toLowerCase()).toMatch(/ready/)
  })

  it('provides exactly 3 checks for intent types that do not require KYC', () => {
    const result = evaluateReadiness(BASE_CONNECTED)
    expect(result.checks).toHaveLength(3)
  })

  it('provides exactly 4 checks for PREPARE_INVEST', () => {
    const result = evaluateReadiness({
      ...BASE_CONNECTED,
      intentType: 'PREPARE_INVEST',
      kycStatus:  'VERIFIED',
    })
    expect(result.checks).toHaveLength(4)
  })
})
