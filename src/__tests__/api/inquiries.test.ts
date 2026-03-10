import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/inquiries/inquiry-service', () => ({
  createInquiry:    vi.fn(),
  getUserInquiries: vi.fn(),
  getOwnerInquiries: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { auth } from '@/auth'
import { createInquiry, getUserInquiries, getOwnerInquiries } from '@/lib/inquiries/inquiry-service'
import { POST, GET } from '@/app/api/inquiries/route'

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAuth              = auth              as ReturnType<typeof vi.fn>
const mockCreateInquiry     = createInquiry     as ReturnType<typeof vi.fn>
const mockGetUser           = getUserInquiries  as ReturnType<typeof vi.fn>
const mockGetOwner          = getOwnerInquiries as ReturnType<typeof vi.fn>

function makeSession(overrides: Record<string, unknown> = {}) {
  return { user: { id: 'user-001', ...overrides } }
}

function makePostRequest(body: unknown): Request {
  return new Request('http://localhost/api/inquiries', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

function makeGetRequest(role?: string): Request {
  const url = role
    ? `http://localhost/api/inquiries?role=${role}`
    : 'http://localhost/api/inquiries'
  return new Request(url, { method: 'GET' })
}

const VALID_BODY = {
  propertyId:  'prop-abc',
  inquiryType: 'GENERAL',
  message:     'Hello, I have a question about this property.',
}

const FAKE_INQUIRY = {
  id:         'inq-001',
  propertyId: 'prop-abc',
  inquiryType: 'GENERAL',
  message:    'Hello, I have a question about this property.',
  status:     'NEW',
}

// ── POST /api/inquiries ───────────────────────────────────────────────────────

describe('POST /api/inquiries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await POST(makePostRequest(VALID_BODY))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 400 for invalid JSON body', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const req = new Request('http://localhost/api/inquiries', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    '{bad',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when propertyId is missing', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await POST(makePostRequest({ inquiryType: 'GENERAL', message: 'Hello property owner' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/propertyId/)
  })

  it('returns 400 when inquiryType is not a valid enum value', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await POST(makePostRequest({ ...VALID_BODY, inquiryType: 'FAKE_TYPE' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/inquiryType/)
  })

  it('returns 400 when message is fewer than 10 characters', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await POST(makePostRequest({ ...VALID_BODY, message: 'Short' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/10 characters/)
  })

  it('returns 400 when message exceeds 2000 characters', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const longMessage = 'a'.repeat(2001)
    const res = await POST(makePostRequest({ ...VALID_BODY, message: longMessage }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/2000 characters/)
  })

  it('returns 403 when user tries to inquire on their own listing', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateInquiry.mockRejectedValueOnce(new Error('You cannot inquire on your own listing'))
    const res = await POST(makePostRequest(VALID_BODY))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toMatch(/own listing/)
  })

  it('returns 201 with inquiry on success', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateInquiry.mockResolvedValueOnce(FAKE_INQUIRY)
    const res = await POST(makePostRequest(VALID_BODY))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.inquiry.id).toBe('inq-001')
    // Verify service was called with the right payload
    expect(mockCreateInquiry).toHaveBeenCalledWith(
      'user-001',
      expect.objectContaining({
        propertyId:  'prop-abc',
        inquiryType: 'GENERAL',
      }),
    )
  })

  it('trims whitespace from message before calling service', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateInquiry.mockResolvedValueOnce(FAKE_INQUIRY)
    await POST(makePostRequest({ ...VALID_BODY, message: '  Hello, I have a question.  ' }))
    expect(mockCreateInquiry).toHaveBeenCalledWith(
      'user-001',
      expect.objectContaining({ message: 'Hello, I have a question.' }),
    )
  })

  it('accepts all four valid inquiry types', async () => {
    const types = ['GENERAL', 'INTERESTED_BUYING', 'INTERESTED_INVESTING', 'INTERESTED_LEASING']
    for (const inquiryType of types) {
      mockAuth.mockResolvedValueOnce(makeSession())
      mockCreateInquiry.mockResolvedValueOnce(FAKE_INQUIRY)
      const res = await POST(makePostRequest({ ...VALID_BODY, inquiryType }))
      expect(res.status).toBe(201)
    }
  })

  it('returns 500 on unexpected service error', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockCreateInquiry.mockRejectedValueOnce(new Error('DB timeout'))
    const res = await POST(makePostRequest(VALID_BODY))
    expect(res.status).toBe(500)
  })
})

// ── GET /api/inquiries ────────────────────────────────────────────────────────

describe('GET /api/inquiries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
  })

  it('returns sender inquiries when role param is omitted', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockGetUser.mockResolvedValueOnce([FAKE_INQUIRY])
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.inquiries).toHaveLength(1)
    expect(mockGetUser).toHaveBeenCalledWith('user-001')
    expect(mockGetOwner).not.toHaveBeenCalled()
  })

  it('returns sender inquiries when role=sender', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockGetUser.mockResolvedValueOnce([FAKE_INQUIRY])
    const res = await GET(makeGetRequest('sender'))
    expect(res.status).toBe(200)
    expect(mockGetUser).toHaveBeenCalledWith('user-001')
  })

  it('returns owner inquiries when role=owner', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const ownerInquiries = [{ ...FAKE_INQUIRY, id: 'inq-owned-001' }]
    mockGetOwner.mockResolvedValueOnce(ownerInquiries)
    const res = await GET(makeGetRequest('owner'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.inquiries).toHaveLength(1)
    expect(mockGetOwner).toHaveBeenCalledWith('user-001')
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  it('returns 500 on service error', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockGetUser.mockRejectedValueOnce(new Error('Connection refused'))
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(500)
  })
})
