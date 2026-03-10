import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    transactionIntent: {
      findUnique: vi.fn(),
      update:     vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/solana/intent-preparation', () => ({
  IntentPreparationService: {
    create: vi.fn(),
  },
}))

vi.mock('@/lib/solana/solana-service', () => ({
  SolanaService: {
    create: vi.fn(),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { IntentPreparationService } from '@/lib/solana/intent-preparation'
import { SolanaService } from '@/lib/solana/solana-service'
import { POST as preparePOST } from '@/app/api/intents/[id]/prepare/route'
import { POST as submitPOST }  from '@/app/api/intents/[id]/submit/route'

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAuth                    = auth                       as ReturnType<typeof vi.fn>
const mockIntentFindUnique        = prisma.transactionIntent.findUnique as ReturnType<typeof vi.fn>
const mockIntentUpdate            = prisma.transactionIntent.update     as ReturnType<typeof vi.fn>
const mockAuditCreate             = prisma.auditLog.create              as ReturnType<typeof vi.fn>
const mockPrismaTransaction       = prisma.$transaction                  as ReturnType<typeof vi.fn>
const mockIPSCreate               = IntentPreparationService.create     as ReturnType<typeof vi.fn>
const mockSolanaCreate            = SolanaService.create                as ReturnType<typeof vi.fn>

function makeSession(overrides: Record<string, unknown> = {}) {
  return { user: { id: 'user-001', walletAddress: 'WalletAAA111', ...overrides } }
}

function makeParams(id = 'intent-001') {
  return { params: Promise.resolve({ id }) }
}

function makeRequest(body?: unknown): Request {
  if (body === undefined) {
    return new Request('http://localhost/api/intents/intent-001/prepare', { method: 'POST' })
  }
  return new Request('http://localhost/api/intents/intent-001/submit', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

const APPROVED_INTENT = {
  id:          'intent-001',
  userId:      'user-001',
  status:      'APPROVED',
  intentType:  'EXPRESS_INTEREST',
  propertyId:  'prop-abc',
  fractionQty: null,
}

const FAKE_PREPARATION = {
  serialized:           'base64-unsigned-tx',
  requiredSigner:       'WalletAAA111',
  blockhash:            'some-blockhash',
  lastValidBlockHeight: 12345678,
  expiresAt:            new Date(Date.now() + 90_000).toISOString(),
  program:              'MEMO_V1',
  memoText:             'TIGI:EXPRESS_INTEREST:prop-abc:intent-001',
}

// ── POST /api/intents/[id]/prepare ────────────────────────────────────────────

describe('POST /api/intents/[id]/prepare', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIntentUpdate.mockResolvedValue({})
    mockAuditCreate.mockResolvedValue({})
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 409 (NO_WALLET) when the session has no walletAddress', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ walletAddress: undefined }))
    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('NO_WALLET')
  })

  it('returns 404 when the intent does not exist', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce(null)
    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns 403 when the intent belongs to another user', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({ ...APPROVED_INTENT, userId: 'other-user' })
    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns 409 (INVALID_STATUS) when intent is PENDING', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({ ...APPROVED_INTENT, status: 'PENDING' })
    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('INVALID_STATUS')
  })

  it('returns 409 (INVALID_STATUS) when intent is already EXECUTED', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({ ...APPROVED_INTENT, status: 'EXECUTED' })
    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('INVALID_STATUS')
  })

  it('allows re-preparation when intent is already READY_TO_SIGN (refreshing expired tx)', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({ ...APPROVED_INTENT, status: 'READY_TO_SIGN' })
    mockIPSCreate.mockResolvedValueOnce({ prepareIntent: vi.fn().mockResolvedValueOnce(FAKE_PREPARATION) })
    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(200)
  })

  it('returns 200 with preparation data on success', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce(APPROVED_INTENT)
    mockIPSCreate.mockResolvedValueOnce({
      prepareIntent: vi.fn().mockResolvedValueOnce(FAKE_PREPARATION),
    })

    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.intentId).toBe('intent-001')
    expect(json.data.preparation.serialized).toBe('base64-unsigned-tx')
    expect(json.data.preparation.requiredSigner).toBe('WalletAAA111')
    expect(json.data.preparation.program).toBe('MEMO_V1')
    // Verify intent was persisted
    expect(mockIntentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'intent-001' } }),
    )
    // Verify audit log created
    expect(mockAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'intent.prepare' }) }),
    )
  })

  it('returns 500 when IntentPreparationService throws', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce(APPROVED_INTENT)
    mockIPSCreate.mockRejectedValueOnce(new Error('RPC connection failed'))
    const res = await preparePOST(makeRequest(), makeParams())
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })
})

// ── POST /api/intents/[id]/submit ─────────────────────────────────────────────

describe('POST /api/intents/[id]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrismaTransaction.mockImplementation(async (fn: (tx: typeof prisma) => unknown) =>
      fn({
        ...prisma,
        transactionIntent: { update: vi.fn() } as never,
        auditLog:          { create: vi.fn() } as never,
      }),
    )
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await submitPOST(makeRequest({ signedTransaction: 'abc' }), makeParams())
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid JSON body', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const req = new Request('http://localhost/api/intents/intent-001/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    '{bad-json',
    })
    const res = await submitPOST(req, makeParams())
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('BAD_REQUEST')
  })

  it('returns 422 when signedTransaction is missing', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await submitPOST(makeRequest({ signedTransaction: '' }), makeParams())
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 404 when intent does not exist', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce(null)
    const res = await submitPOST(makeRequest({ signedTransaction: 'base64signedtx' }), makeParams())
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns 403 when intent belongs to another user', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({
      id: 'intent-001', userId: 'other-user', status: 'READY_TO_SIGN',
      intentType: 'EXPRESS_INTEREST', propertyId: 'prop-abc', metadata: {},
    })
    const res = await submitPOST(makeRequest({ signedTransaction: 'base64signedtx' }), makeParams())
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns 409 (INVALID_STATUS) when intent is not READY_TO_SIGN', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({
      id: 'intent-001', userId: 'user-001', status: 'APPROVED',
      intentType: 'EXPRESS_INTEREST', propertyId: 'prop-abc', metadata: {},
    })
    const res = await submitPOST(makeRequest({ signedTransaction: 'base64signedtx' }), makeParams())
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('INVALID_STATUS')
  })

  it('returns 409 (NO_PREPARATION) when metadata has no walletPreparation', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({
      id: 'intent-001', userId: 'user-001', status: 'READY_TO_SIGN',
      intentType: 'EXPRESS_INTEREST', propertyId: 'prop-abc', metadata: {},
    })
    const res = await submitPOST(makeRequest({ signedTransaction: 'base64signedtx' }), makeParams())
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('NO_PREPARATION')
  })

  it('returns 200 with signature and explorer URL on success', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({
      id:         'intent-001',
      userId:     'user-001',
      status:     'READY_TO_SIGN',
      intentType: 'EXPRESS_INTEREST',
      propertyId: 'prop-abc',
      metadata:   { walletPreparation: FAKE_PREPARATION },
    })
    mockSolanaCreate.mockResolvedValueOnce({
      submitSignedTransaction: vi.fn().mockResolvedValueOnce({
        signature:   'solana-sig-abc123',
        explorerUrl: 'https://explorer.solana.com/tx/solana-sig-abc123',
      }),
    })

    const res = await submitPOST(makeRequest({ signedTransaction: 'base64signedtx' }), makeParams())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.status).toBe('EXECUTED')
    expect(json.data.solanaSignature).toBe('solana-sig-abc123')
    expect(json.data.explorerUrl).toContain('solana-sig-abc123')
  })

  it('returns 409 (TX_FAILED) when Solana rejects due to expired blockhash', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({
      id: 'intent-001', userId: 'user-001', status: 'READY_TO_SIGN',
      intentType: 'EXPRESS_INTEREST', propertyId: 'prop-abc',
      metadata: { walletPreparation: FAKE_PREPARATION },
    })
    mockSolanaCreate.mockResolvedValueOnce({
      submitSignedTransaction: vi.fn().mockRejectedValueOnce(
        new Error('blockhash not found'),
      ),
    })

    const res = await submitPOST(makeRequest({ signedTransaction: 'base64signedtx' }), makeParams())
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('TX_FAILED')
    expect(json.error.message).toMatch(/rejected by the Solana network/)
  })

  it('returns 409 (TX_FAILED) when Solana reports simulation failure', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({
      id: 'intent-001', userId: 'user-001', status: 'READY_TO_SIGN',
      intentType: 'EXPRESS_INTEREST', propertyId: 'prop-abc',
      metadata: { walletPreparation: FAKE_PREPARATION },
    })
    mockSolanaCreate.mockResolvedValueOnce({
      submitSignedTransaction: vi.fn().mockRejectedValueOnce(
        new Error('Transaction simulation failed: Error processing Instruction 0'),
      ),
    })

    const res = await submitPOST(makeRequest({ signedTransaction: 'base64signedtx' }), makeParams())
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('TX_FAILED')
  })

  it('returns 500 on non-Solana errors', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockIntentFindUnique.mockResolvedValueOnce({
      id: 'intent-001', userId: 'user-001', status: 'READY_TO_SIGN',
      intentType: 'EXPRESS_INTEREST', propertyId: 'prop-abc',
      metadata: { walletPreparation: FAKE_PREPARATION },
    })
    mockSolanaCreate.mockResolvedValueOnce({
      submitSignedTransaction: vi.fn().mockRejectedValueOnce(new Error('DB write failed')),
    })

    const res = await submitPOST(makeRequest({ signedTransaction: 'base64signedtx' }), makeParams())
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })
})
