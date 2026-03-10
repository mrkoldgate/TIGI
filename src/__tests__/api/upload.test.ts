import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/storage', () => ({
  getStorageProvider: vi.fn(),
  validateUpload:     vi.fn(),
  safeExtension:      vi.fn(),
}))

import { auth } from '@/auth'
import { getStorageProvider, validateUpload, safeExtension } from '@/lib/storage'
import { POST } from '@/app/api/upload/route'

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAuth            = auth             as ReturnType<typeof vi.fn>
const mockGetStorage      = getStorageProvider as ReturnType<typeof vi.fn>
const mockValidateUpload  = validateUpload   as ReturnType<typeof vi.fn>
const mockSafeExtension   = safeExtension    as ReturnType<typeof vi.fn>

function makeSession(overrides: Record<string, unknown> = {}) {
  return { user: { id: 'user-001', ...overrides } }
}

/** Returns a fake File of the given size (in bytes). */
function makeFile(name = 'photo.jpg', type = 'image/jpeg', sizeBytes = 512 * 1024) {
  return new File([new Uint8Array(sizeBytes)], name, { type })
}

/** Builds a Request with multipart/form-data body. */
function makeFormRequest(file?: File, purpose?: string): Request {
  const fd = new FormData()
  if (file     !== undefined) fd.append('file',    file)
  if (purpose  !== undefined) fd.append('purpose', purpose)
  return new Request('http://localhost/api/upload', { method: 'POST', body: fd })
}

// ── POST /api/upload ──────────────────────────────────────────────────────────

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Safe defaults that allow requests to pass through to storage
    mockValidateUpload.mockReturnValue({ valid: true, message: '' })
    mockSafeExtension.mockReturnValue('jpg')
    mockGetStorage.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ url: 'https://cdn.example.com/user-avatar/user-001/test.jpg', key: 'user-avatar/user-001/test.jpg' }),
    })
  })

  // ── Auth ──────────────────────────────────────────────────────────────────

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await POST(new Request('http://localhost/api/upload', { method: 'POST' }))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error.code).toBe('UNAUTHORIZED')
  })

  // ── File validation ───────────────────────────────────────────────────────

  it('returns 400 when no file field in form data', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    // FormData with no file
    const res = await POST(makeFormRequest(undefined, 'user-avatar'))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('BAD_REQUEST')
    expect(json.error.message).toMatch(/'file' field is required/)
  })

  it('returns 400 for an unknown purpose value', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await POST(makeFormRequest(makeFile(), 'invalid-purpose'))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('BAD_REQUEST')
    expect(json.error.message).toMatch(/Invalid purpose/)
  })

  it('returns 422 when validateUpload rejects the file', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockValidateUpload.mockReturnValueOnce({ valid: false, message: 'File type not allowed' })
    const res = await POST(makeFormRequest(makeFile('doc.pdf', 'application/pdf'), 'user-avatar'))
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.message).toBe('File type not allowed')
  })

  it('returns 422 when avatar exceeds the 2 MB limit', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    // validateUpload passes (type is fine) but avatar-specific size check triggers
    const bigFile = makeFile('avatar.jpg', 'image/jpeg', 3 * 1024 * 1024) // 3 MB
    const res = await POST(makeFormRequest(bigFile, 'user-avatar'))
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.message).toMatch(/2 MB/)
  })

  // ── Success ───────────────────────────────────────────────────────────────

  it('returns 201 with correct response shape on successful avatar upload', async () => {
    const file = makeFile('me.jpg', 'image/jpeg', 500 * 1024)
    mockAuth.mockResolvedValueOnce(makeSession())
    mockSafeExtension.mockReturnValue('jpg')
    const expectedUrl = 'https://r2.dev/user-avatar/user-001/uuid-here.jpg'
    mockGetStorage.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ url: expectedUrl }),
    })

    const res = await POST(makeFormRequest(file, 'user-avatar'))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toMatchObject({
      url:      expectedUrl,
      fileName: 'me.jpg',
      mimeType: 'image/jpeg',
    })
    // Key must follow purpose/userId/uuid.ext format
    expect(json.data.key).toMatch(/^user-avatar\/user-001\/.+\.jpg$/)
  })

  it('returns 201 for listing-images purpose', async () => {
    const file = makeFile('house.jpg', 'image/jpeg', 1024 * 1024)
    mockAuth.mockResolvedValueOnce(makeSession())
    mockGetStorage.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ url: 'https://r2.dev/listing-images/user-001/uuid.jpg' }),
    })

    const res = await POST(makeFormRequest(file, 'listing-images'))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.key).toMatch(/^listing-images\/user-001\//)
  })

  // ── Storage errors ────────────────────────────────────────────────────────

  it('returns 500 when the storage provider throws', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 100 * 1024)
    mockAuth.mockResolvedValueOnce(makeSession())
    mockGetStorage.mockReturnValue({
      upload: vi.fn().mockRejectedValue(new Error('R2 connection refused')),
    })

    const res = await POST(makeFormRequest(file, 'user-avatar'))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error.code).toBe('STORAGE_ERROR')
  })
})
