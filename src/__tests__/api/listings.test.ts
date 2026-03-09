import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks must be declared before any imports that resolve through them.
// vi.mock() calls are hoisted to the top of the file by vitest.
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/services/listing.service', () => ({
  createListingService: vi.fn(),
  ListingStateError: class ListingStateError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ListingStateError' }
  },
}))

import { auth } from '@/auth'
import { createListingService } from '@/lib/services/listing.service'
import { GET, POST } from '@/app/api/listings/route'

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockCreateListingService = createListingService as ReturnType<typeof vi.fn>

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id:   'user-123',
      role: 'OWNER',
      ...overrides,
    },
  }
}

function makeRequest(body?: unknown): Request {
  if (body === undefined) {
    return new Request('http://localhost/api/listings', { method: 'GET' })
  }
  return new Request('http://localhost/api/listings', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

const VALID_LISTING_BODY = {
  title:       'Test Property',
  type:        'RESIDENTIAL',
  address:     '123 Main St',
  city:        'Miami',
  state:       'FL',
  country:     'US',
  zipCode:     '33101',
  price:       500000,
  isTokenized: false,
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await POST(makeRequest(VALID_LISTING_BODY))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 403 when user is INVESTOR (not an owner)', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ role: 'INVESTOR' }))
    const res = await POST(makeRequest(VALID_LISTING_BODY))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns 422 when required fields are missing', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await POST(makeRequest({ title: 'Missing required fields' }))
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_FAILED')
  })

  it('returns 400 for invalid JSON body', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const req = new Request('http://localhost/api/listings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    'not-json{{{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('INVALID_JSON')
  })

  it('returns 201 with the created listing on success', async () => {
    const fakeListing = { id: 'listing-abc', title: 'Test Property', status: 'DRAFT' }
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      createDraft: vi.fn().mockResolvedValueOnce(fakeListing),
    })

    const res = await POST(makeRequest(VALID_LISTING_BODY))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.id).toBe('listing-abc')
  })

  it('returns 201 for BOTH role (owner+investor)', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ role: 'BOTH' }))
    mockCreateListingService.mockReturnValueOnce({
      createDraft: vi.fn().mockResolvedValueOnce({ id: 'listing-xyz', status: 'DRAFT' }),
    })
    const res = await POST(makeRequest(VALID_LISTING_BODY))
    expect(res.status).toBe(201)
  })

  it('returns 201 for ADMIN role', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ role: 'ADMIN' }))
    mockCreateListingService.mockReturnValueOnce({
      createDraft: vi.fn().mockResolvedValueOnce({ id: 'listing-admin', status: 'DRAFT' }),
    })
    const res = await POST(makeRequest(VALID_LISTING_BODY))
    expect(res.status).toBe(201)
  })

  it('returns 500 when the service throws', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      createDraft: vi.fn().mockRejectedValueOnce(new Error('DB connection lost')),
    })
    const res = await POST(makeRequest(VALID_LISTING_BODY))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('GET /api/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns owner listings on success', async () => {
    const fakeListings = [{ id: 'l1', title: 'Listing 1' }, { id: 'l2', title: 'Listing 2' }]
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      getOwnerListings: vi.fn().mockResolvedValueOnce(fakeListings),
    })
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(2)
  })

  it('returns 500 on service error', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      getOwnerListings: vi.fn().mockRejectedValueOnce(new Error('timeout')),
    })
    const res = await GET()
    expect(res.status).toBe(500)
  })
})
