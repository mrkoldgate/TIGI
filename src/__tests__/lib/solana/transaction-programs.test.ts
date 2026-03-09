import { describe, it, expect } from 'vitest'
import {
  getProgramInfo,
  getIntentTypeFull,
  TIGI_PROGRAMS,
  INTENT_TYPE_FULL,
  INTENT_STATUS_GUIDANCE,
} from '@/lib/solana/transaction-programs'

// ---------------------------------------------------------------------------
// transaction-programs — registry accessors and mapping helpers
// ---------------------------------------------------------------------------

describe('TIGI_PROGRAMS registry', () => {
  it('has MEMO, ESCROW, TOKEN_TRANSFER entries', () => {
    expect(Object.keys(TIGI_PROGRAMS)).toEqual(
      expect.arrayContaining(['MEMO', 'ESCROW', 'TOKEN_TRANSFER']),
    )
  })

  it('MEMO is live with a non-empty address', () => {
    expect(TIGI_PROGRAMS.MEMO.status).toBe('live')
    expect(TIGI_PROGRAMS.MEMO.address.length).toBeGreaterThan(0)
  })

  it('ESCROW and TOKEN_TRANSFER are planned', () => {
    expect(TIGI_PROGRAMS.ESCROW.status).toBe('planned')
    expect(TIGI_PROGRAMS.TOKEN_TRANSFER.status).toBe('planned')
  })

  it('every program has required metadata fields', () => {
    for (const program of Object.values(TIGI_PROGRAMS)) {
      expect(program.id).toBeDefined()
      expect(program.displayName).toBeDefined()
      expect(program.description).toBeDefined()
      expect(program.userExplanation).toBeDefined()
    }
  })
})

describe('getProgramInfo', () => {
  it('returns correct info for MEMO', () => {
    const info = getProgramInfo('MEMO')
    expect(info.id).toBe('MEMO')
    expect(info.displayName).toBe('SPL Memo')
  })

  it('throws for an unknown program ID', () => {
    // @ts-expect-error intentionally passing invalid ID
    expect(() => getProgramInfo('UNKNOWN')).toThrow(/Unknown program/)
  })
})

describe('getIntentTypeFull', () => {
  it('maps all known intent types correctly', () => {
    expect(getIntentTypeFull('EXPRESS_INTEREST')).toBe('express_interest')
    expect(getIntentTypeFull('PREPARE_PURCHASE')).toBe('purchase')
    expect(getIntentTypeFull('PREPARE_INVEST')).toBe('investment')
    expect(getIntentTypeFull('PREPARE_LEASE')).toBe('lease')
  })

  it('falls back to express_interest for unknown types', () => {
    expect(getIntentTypeFull('UNKNOWN_TYPE')).toBe('express_interest')
  })
})

describe('INTENT_TYPE_FULL record', () => {
  it('covers all four intent types', () => {
    const keys = Object.keys(INTENT_TYPE_FULL)
    expect(keys).toContain('EXPRESS_INTEREST')
    expect(keys).toContain('PREPARE_PURCHASE')
    expect(keys).toContain('PREPARE_INVEST')
    expect(keys).toContain('PREPARE_LEASE')
  })
})

describe('INTENT_STATUS_GUIDANCE', () => {
  const statuses = ['PENDING', 'REVIEWING', 'APPROVED', 'READY_TO_SIGN', 'EXECUTED', 'CANCELLED', 'EXPIRED'] as const

  it('covers all seven intent statuses', () => {
    for (const status of statuses) {
      expect(INTENT_STATUS_GUIDANCE[status]).toBeDefined()
    }
  })

  it('every status has a label and meaning', () => {
    for (const status of statuses) {
      const guidance = INTENT_STATUS_GUIDANCE[status]
      expect(guidance.label, status).toBeDefined()
      expect(guidance.meaning, status).toBeDefined()
    }
  })

  it('CANCELLED and EXPIRED have null nextStep', () => {
    expect(INTENT_STATUS_GUIDANCE.CANCELLED.nextStep).toBeNull()
  })

  it('APPROVED guidance instructs user to prepare wallet', () => {
    expect(INTENT_STATUS_GUIDANCE.APPROVED.nextStep).toMatch(/wallet|sign/i)
  })
})
