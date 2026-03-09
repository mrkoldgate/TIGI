import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    property: {
      findUnique: vi.fn(),
    },
    transactionIntent: {
      findFirst: vi.fn(),
      create:    vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/notifications/notification-service', () => ({
  createNotification: vi.fn(),
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { POST, GET } from '@/app/api/intents/route'

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPropertyFindUnique = prisma.property.findUnique as ReturnType<typeof vi.fn>
const mockIntentFindFirst    = prisma.transactionIntent.findFirst as ReturnType<typeof vi.fn>
const mockPrismaTransaction  = prisma.$transaction as ReturnType<typeof vi.fn>
const mockIntentFindMany     = (prisma.transactionIntent as Record<string, ReturnType<typeof vi.fn>>).findMany

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id:        'user-001',
      role:      'INVESTOR',
      kycStatus: 'VERIFIED',
      ...overrides,
    },
  }
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/intents', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

const EXPRESS_INTEREST_BODY = {
  propertyId: 'prop-abc',
  intentType: 'EXPRESS_INTEREST',
}

const PREPARE_INVEST_BODY = {
  propertyId:  'prop-abc',
  intentType:  'PREPARE_INVEST',
  fractionQty: 10,
}

const ACTIVE_PROPERTY = {
  id:          'prop-abc',
  status:      'ACTIVE',
  isTokenized: true,
  title:       'Test Property',
  ownerId:     'owner-001',
}

// ── POST /api/intents ─────────────────────────────────────────────────────────

describe('POST /api/intents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await POST(makeRequest(EXPRESS_INTEREST_BODY))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const req = new Request('http://localhost/api/intents', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    '{invalid}',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 422 for missing propertyId', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await POST(makeRequest({ intentType: 'EXPRESS_INTEREST' }))
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 403 when INVESTOR role missing for PREPARE_INVEST', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ role: 'OWNER', kycStatus: 'VERIFIED' }))
    const res = await POST(makeRequest(PREPARE_INVEST_BODY))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns 403 (KYC_REQUIRED) when KYC is not verified for PREPARE_INVEST', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ role: 'INVESTOR', kycStatus: 'PENDING' }))
    const res = await POST(makeRequest(PREPARE_INVEST_BODY))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('KYC_REQUIRED')
  })

  it('returns 403 when KYC is null for PREPARE_PURCHASE', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ role: 'INVESTOR', kycStatus: null }))
    const res = await POST(makeRequest({ propertyId: 'prop-abc', intentType: 'PREPARE_PURCHASE' }))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('KYC_REQUIRED')
  })

  it('does NOT require KYC for EXPRESS_INTEREST', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ role: 'INVESTOR', kycStatus: null }))
    mockPropertyFindUnique.mockResolvedValueOnce(ACTIVE_PROPERTY)
    mockIntentFindFirst.mockResolvedValueOnce(null)
    const fakeIntent = { id: 'intent-001', status: 'PENDING' }
    mockPrismaTransaction.mockImplementationOnce(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      return fn({
        ...prisma,
        transactionIntent: { create: vi.fn().mockResolvedValueOnce(fakeIntent) } as never,
        auditLog: { create: vi.fn() } as never,
      })
    })
    const res = await POST(makeRequest(EXPRESS_INTEREST_BODY))
    // Should not be 403 — falls through to the property check
    expect(res.status).not.toBe(403)
  })

  it('returns 404 when property does not exist', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockPropertyFindUnique.mockResolvedValueOnce(null)
    const res = await POST(makeRequest(EXPRESS_INTEREST_BODY))
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns 409 when property is not ACTIVE', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockPropertyFindUnique.mockResolvedValueOnce({ ...ACTIVE_PROPERTY, status: 'UNDER_REVIEW' })
    const res = await POST(makeRequest(EXPRESS_INTEREST_BODY))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('LISTING_UNAVAILABLE')
  })

  it('returns 409 when PREPARE_INVEST on a non-tokenized listing', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockPropertyFindUnique.mockResolvedValueOnce({ ...ACTIVE_PROPERTY, isTokenized: false })
    const res = await POST(makeRequest(PREPARE_INVEST_BODY))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('NOT_TOKENIZED')
  })

  it('returns 409 for duplicate active intent', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockPropertyFindUnique.mockResolvedValueOnce(ACTIVE_PROPERTY)
    mockIntentFindFirst.mockResolvedValueOnce({ id: 'existing-intent' })
    const res = await POST(makeRequest(EXPRESS_INTEREST_BODY))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('DUPLICATE_INTENT')
  })

  it('returns 201 with created intent on success', async () => {
    const fakeIntent = { id: 'intent-new', status: 'PENDING', intentType: 'EXPRESS_INTEREST' }
    mockAuth.mockResolvedValueOnce(makeSession())
    mockPropertyFindUnique.mockResolvedValueOnce(ACTIVE_PROPERTY)
    mockIntentFindFirst.mockResolvedValueOnce(null)
    mockPrismaTransaction.mockImplementationOnce(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      return fn({
        ...prisma,
        transactionIntent: { create: vi.fn().mockResolvedValueOnce(fakeIntent) } as never,
        auditLog: { create: vi.fn() } as never,
      })
    })
    const res = await POST(makeRequest(EXPRESS_INTEREST_BODY))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.id).toBe('intent-new')
  })
})

// ── GET /api/intents ──────────────────────────────────────────────────────────

describe('GET /api/intents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns the user intents on success', async () => {
    const fakeIntents = [
      { id: 'i1', intentType: 'EXPRESS_INTEREST', property: { id: 'p1', title: 'Prop 1' } },
      { id: 'i2', intentType: 'PREPARE_INVEST',   property: { id: 'p2', title: 'Prop 2' } },
    ]
    mockAuth.mockResolvedValueOnce(makeSession())
    // GET uses prisma.transactionIntent.findMany directly
    ;(prisma.transactionIntent as Record<string, ReturnType<typeof vi.fn>>).findMany =
      vi.fn().mockResolvedValueOnce(fakeIntents)
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(2)
  })
})
