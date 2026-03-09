import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update:     vi.fn(),
    },
  },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { PATCH } from '@/app/api/settings/profile/route'
import { DEFAULT_NOTIFICATION_PREFS } from '@/lib/settings/notification-prefs'

// ── Helpers ─────────────────────────────────────────────────────────────────

const mockAuth        = auth as ReturnType<typeof vi.fn>
const mockFindUnique  = prisma.user.findUnique as ReturnType<typeof vi.fn>
const mockUpdate      = prisma.user.update as ReturnType<typeof vi.fn>

function makeSession(overrides: Record<string, unknown> = {}) {
  return { user: { id: 'user-001', ...overrides } }
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/settings/profile', {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

const BASE_USER = {
  preferences: { notificationPrefs: DEFAULT_NOTIFICATION_PREFS },
}

const UPDATED_USER = {
  id:         'user-001',
  name:       'Test User',
  email:      'test@example.com',
  phone:      null,
  location:   null,
  bio:        null,
  avatarUrl:  null,
  preferences: BASE_USER.preferences,
}

// ── PATCH /api/settings/profile ─────────────────────────────────────────────

describe('PATCH /api/settings/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Auth ──────────────────────────────────────────────────────────────────

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await PATCH(makeRequest({ name: 'Alice' }))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBeTruthy()
  })

  it('returns 401 when session has no user.id', async () => {
    mockAuth.mockResolvedValueOnce({ user: {} })
    const res = await PATCH(makeRequest({ name: 'Alice' }))
    expect(res.status).toBe(401)
  })

  // ── Validation ────────────────────────────────────────────────────────────

  it('returns 400 for invalid JSON body', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const req = new Request('http://localhost/api/settings/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    '{bad json',
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })

  it('returns 422 when name is an empty string', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await PATCH(makeRequest({ name: '   ' }))
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error).toMatch(/name/i)
  })

  it('returns 422 when name exceeds 80 characters', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await PATCH(makeRequest({ name: 'a'.repeat(81) }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when bio exceeds 500 characters', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await PATCH(makeRequest({ bio: 'x'.repeat(501) }))
    expect(res.status).toBe(422)
    const json = await res.json()
    expect(json.error).toMatch(/bio/i)
  })

  it('accepts bio of exactly 500 characters', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockFindUnique.mockResolvedValueOnce(BASE_USER)
    mockUpdate.mockResolvedValueOnce(UPDATED_USER)
    const res = await PATCH(makeRequest({ bio: 'x'.repeat(500) }))
    expect(res.status).toBe(200)
  })

  // ── Success cases ─────────────────────────────────────────────────────────

  it('updates name and trims whitespace', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockFindUnique.mockResolvedValueOnce(BASE_USER)
    const updated = { ...UPDATED_USER, name: 'Alice Smith' }
    mockUpdate.mockResolvedValueOnce(updated)

    const res = await PATCH(makeRequest({ name: '  Alice Smith  ' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.user.name).toBe('Alice Smith')

    // Verify prisma.user.update was called with trimmed name
    const updateCall = mockUpdate.mock.calls[0][0]
    expect(updateCall.data.name).toBe('Alice Smith')
  })

  it('sets phone, location, bio to null when passed as null', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockFindUnique.mockResolvedValueOnce(BASE_USER)
    mockUpdate.mockResolvedValueOnce(UPDATED_USER)

    const res = await PATCH(makeRequest({ phone: null, location: null, bio: null }))
    expect(res.status).toBe(200)

    const updateCall = mockUpdate.mock.calls[0][0]
    expect(updateCall.data.phone).toBeNull()
    expect(updateCall.data.location).toBeNull()
    expect(updateCall.data.bio).toBeNull()
  })

  it('merges notificationPrefs with existing preferences', async () => {
    const existingPrefs = { ...DEFAULT_NOTIFICATION_PREFS, emailMarketing: true }
    mockAuth.mockResolvedValueOnce(makeSession())
    mockFindUnique.mockResolvedValueOnce({
      preferences: { notificationPrefs: existingPrefs, someOtherKey: 'value' },
    })
    mockUpdate.mockResolvedValueOnce(UPDATED_USER)

    const res = await PATCH(makeRequest({
      notificationPrefs: { emailMarketing: false, emailInquiries: false },
    }))
    expect(res.status).toBe(200)

    const updateCall = mockUpdate.mock.calls[0][0]
    const savedPrefs = updateCall.data.preferences.notificationPrefs
    expect(savedPrefs.emailMarketing).toBe(false)
    expect(savedPrefs.emailInquiries).toBe(false)
    // Other prefs unchanged
    expect(savedPrefs.emailListingUpdates).toBe(true)
    expect(savedPrefs.inAppAll).toBe(true)
    // Other keys in preferences object preserved
    expect(updateCall.data.preferences.someOtherKey).toBe('value')
  })

  it('preserves existing notificationPrefs when not provided', async () => {
    const existingPrefs = { ...DEFAULT_NOTIFICATION_PREFS, emailMarketing: true }
    mockAuth.mockResolvedValueOnce(makeSession())
    mockFindUnique.mockResolvedValueOnce({
      preferences: { notificationPrefs: existingPrefs },
    })
    mockUpdate.mockResolvedValueOnce(UPDATED_USER)

    // PATCH only name — prefs not provided
    const res = await PATCH(makeRequest({ name: 'Bob' }))
    expect(res.status).toBe(200)

    const updateCall = mockUpdate.mock.calls[0][0]
    // Prefs must be carried over unchanged
    expect(updateCall.data.preferences.notificationPrefs.emailMarketing).toBe(true)
  })

  it('applies DEFAULT_NOTIFICATION_PREFS when user has no existing preferences', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockFindUnique.mockResolvedValueOnce({ preferences: null })
    mockUpdate.mockResolvedValueOnce(UPDATED_USER)

    const res = await PATCH(makeRequest({ name: 'New User' }))
    expect(res.status).toBe(200)

    const updateCall = mockUpdate.mock.calls[0][0]
    expect(updateCall.data.preferences.notificationPrefs).toEqual(DEFAULT_NOTIFICATION_PREFS)
  })

  it('does not set name in updateData when name is not provided', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockFindUnique.mockResolvedValueOnce(BASE_USER)
    mockUpdate.mockResolvedValueOnce(UPDATED_USER)

    await PATCH(makeRequest({ phone: '+15551234567' }))

    const updateCall = mockUpdate.mock.calls[0][0]
    expect('name' in updateCall.data).toBe(false)
    expect(updateCall.data.phone).toBe('+15551234567')
  })

  // ── Error handling ────────────────────────────────────────────────────────

  it('returns 500 when prisma.user.update throws', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    mockFindUnique.mockResolvedValueOnce(BASE_USER)
    mockUpdate.mockRejectedValueOnce(new Error('DB connection error'))

    const res = await PATCH(makeRequest({ name: 'Alice' }))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBeTruthy()
  })
})
