import { describe, it, expect } from 'vitest'
import { IntentPreparationService } from '@/lib/solana/intent-preparation'
import type { IntentMemoPayload } from '@/lib/solana/intent-preparation'

// ---------------------------------------------------------------------------
// IntentPreparationService.parseMemo — static pure function, no I/O needed.
// prepareIntent() / validatePreparation() require a live Solana RPC connection
// and are covered by integration tests rather than unit tests.
// ---------------------------------------------------------------------------

describe('IntentPreparationService.parseMemo', () => {
  function makePayload(overrides: Partial<IntentMemoPayload> = {}): string {
    const base: IntentMemoPayload = {
      v:      2,
      app:    'tigi',
      intent: 'clh1234567890',
      type:   'express_interest',
      prop:   'abc12345',
      ts:     1_700_000_000,
    }
    return JSON.stringify({ ...base, ...overrides })
  }

  it('parses a valid v2 payload', () => {
    const result = IntentPreparationService.parseMemo(makePayload())
    expect(result).not.toBeNull()
    expect(result!.v).toBe(2)
    expect(result!.app).toBe('tigi')
    expect(result!.intent).toBe('clh1234567890')
    expect(result!.type).toBe('express_interest')
  })

  it('parses a v2 payload that includes optional qty', () => {
    const result = IntentPreparationService.parseMemo(makePayload({ qty: 5, type: 'investment' }))
    expect(result).not.toBeNull()
    expect(result!.qty).toBe(5)
    expect(result!.type).toBe('investment')
  })

  it('accepts v1 payloads for backward compatibility', () => {
    const v1Payload = JSON.stringify({
      v:      1,
      app:    'tigi',
      intent: 'old-intent-id',
      type:   'int',
      prop:   'prop1234',
      ts:     1_600_000_000,
    })
    // parseMemo should NOT return null for v1
    const result = IntentPreparationService.parseMemo(v1Payload)
    expect(result).not.toBeNull()
  })

  it('returns null for non-TIGI memos', () => {
    const foreign = JSON.stringify({ app: 'other', v: 1, intent: 'xyz' })
    expect(IntentPreparationService.parseMemo(foreign)).toBeNull()
  })

  it('returns null for unknown schema version', () => {
    const future = makePayload({ v: 99 as never })
    expect(IntentPreparationService.parseMemo(future)).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    expect(IntentPreparationService.parseMemo('not-json')).toBeNull()
    expect(IntentPreparationService.parseMemo('')).toBeNull()
    expect(IntentPreparationService.parseMemo('{bad json')).toBeNull()
  })

  it('returns null for a plain string (non-TIGI on-chain memo)', () => {
    expect(IntentPreparationService.parseMemo('Hello world')).toBeNull()
  })

  it('returns null for null-app payload', () => {
    const result = IntentPreparationService.parseMemo(
      JSON.stringify({ v: 2, app: null, intent: 'x', type: 'express_interest', prop: 'y', ts: 1 })
    )
    expect(result).toBeNull()
  })
})
