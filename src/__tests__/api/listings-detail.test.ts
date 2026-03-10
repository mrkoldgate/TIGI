import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/services/listing.service', () => ({
  createListingService: vi.fn(),
  ListingNotFoundError: class ListingNotFoundError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ListingNotFoundError' }
  },
  ListingForbiddenError: class ListingForbiddenError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ListingForbiddenError' }
  },
  ListingStateError: class ListingStateError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ListingStateError' }
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { auth } from '@/auth'
import {
  createListingService,
  ListingNotFoundError,
  ListingForbiddenError,
  ListingStateError,
} from '@/lib/services/listing.service'
import { GET, PATCH } from '@/app/api/listings/[id]/route'

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAuth                 = auth                 as ReturnType<typeof vi.fn>
const mockCreateListingService = createListingService as ReturnType<typeof vi.fn>

function makeSession(overrides: Record<string, unknown> = {}) {
  return { user: { id: 'user-123', role: 'OWNER', ...overrides } }
}

function makeParams(id = 'listing-abc') {
  return { params: Promise.resolve({ id }) }
}

function makeGetRequest(): Request {
  return new Request('http://localhost/api/listings/listing-abc', { method: 'GET' })
}

function makePatchRequest(body: unknown): Request {
  return new Request('http://localhost/api/listings/listing-abc', {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

const FAKE_LISTING = {
  id:      'listing-abc',
  title:   'Test Property',
  status:  'DRAFT',
  ownerId: 'user-123',
}

// ── GET /api/listings/[id] ────────────────────────────────────────────────────

describe('GET /api/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await GET(makeGetRequest(), makeParams())
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 200 with the listing for the owner', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      getListing: vi.fn().mockResolvedValueOnce(FAKE_LISTING),
    })

    const res = await GET(makeGetRequest(), makeParams())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.id).toBe('listing-abc')
  })

  it('returns 404 when the listing does not exist', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      getListing: vi.fn().mockResolvedValueOnce(null),
    })

    const res = await GET(makeGetRequest(), makeParams())
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns 403 when the requester is not the listing owner', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ id: 'different-user' }))
    mockCreateListingService.mockReturnValueOnce({
      getListing: vi.fn().mockResolvedValueOnce({ ...FAKE_LISTING, ownerId: 'user-123' }),
    })

    const res = await GET(makeGetRequest(), makeParams())
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns 500 on service error', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      getListing: vi.fn().mockRejectedValueOnce(new Error('DB connection lost')),
    })

    const res = await GET(makeGetRequest(), makeParams())
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })
})

// ── PATCH /api/listings/[id] ──────────────────────────────────────────────────

describe('PATCH /api/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await PATCH(makePatchRequest({ title: 'New Title' }), makeParams())
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 for invalid JSON', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const req = new Request('http://localhost/api/listings/listing-abc', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    '{bad',
    })
    const res = await PATCH(req, makeParams())
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('INVALID_JSON')
  })

  it('returns 200 with updated listing on valid partial update', async () => {
    const updated = { ...FAKE_LISTING, title: 'Updated Title' }
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      updateListing: vi.fn().mockResolvedValueOnce(updated),
    })

    const res = await PATCH(makePatchRequest({ title: 'Updated Title' }), makeParams())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.title).toBe('Updated Title')
  })

  it('returns 200 with no-op update (empty patch is valid)', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      updateListing: vi.fn().mockResolvedValueOnce(FAKE_LISTING),
    })

    // UpdateListingSchema has all optional fields — empty object is valid
    const res = await PATCH(makePatchRequest({}), makeParams())
    expect(res.status).toBe(200)
  })

  it('returns 404 when service throws ListingNotFoundError', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      updateListing: vi.fn().mockRejectedValueOnce(new ListingNotFoundError('Listing not found')),
    })

    const res = await PATCH(makePatchRequest({ title: 'New Title' }), makeParams())
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('returns 403 when service throws ListingForbiddenError', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      updateListing: vi.fn().mockRejectedValueOnce(new ListingForbiddenError('Access denied')),
    })

    const res = await PATCH(makePatchRequest({ title: 'New Title' }), makeParams())
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('returns 409 when editing an ACTIVE listing (ListingStateError)', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      updateListing: vi.fn().mockRejectedValueOnce(
        new ListingStateError('Cannot edit a listing in ACTIVE state'),
      ),
    })

    const res = await PATCH(makePatchRequest({ title: 'New Title' }), makeParams())
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('INVALID_STATE')
  })

  it('returns 500 on unexpected service errors', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateListingService.mockReturnValueOnce({
      updateListing: vi.fn().mockRejectedValueOnce(new Error('DB timeout')),
    })

    const res = await PATCH(makePatchRequest({ title: 'New Title' }), makeParams())
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })
})
