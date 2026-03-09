import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/billing/billing-service', () => ({
  getBillingService: vi.fn(),
  resetBillingService: vi.fn(),
}))

import { auth } from '@/auth'
import { getBillingService } from '@/lib/billing/billing-service'
import { POST as checkoutPOST } from '@/app/api/billing/checkout/route'
import { POST as webhookPOST } from '@/app/api/billing/webhook/route'

// ── Helpers ─────────────────────────────────────────────────────────────────

const mockAuth            = auth as ReturnType<typeof vi.fn>
const mockGetBilling      = getBillingService as ReturnType<typeof vi.fn>

function makeSession(overrides: Record<string, unknown> = {}) {
  return { user: { id: 'user-001', subscriptionTier: 'free', ...overrides } }
}

function makeRequest(url: string, body: unknown, method = 'POST'): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── POST /api/billing/checkout ───────────────────────────────────────────────

describe('POST /api/billing/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)
    const res = await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'pro' }) as Parameters<typeof checkoutPOST>[0])
    expect(res.status).toBe(401)
  })

  it('returns 401 when session has no user.id', async () => {
    mockAuth.mockResolvedValueOnce({ user: {} })
    const res = await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'pro' }) as Parameters<typeof checkoutPOST>[0])
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid plan', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const res = await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'invalid_plan' }) as Parameters<typeof checkoutPOST>[0])
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeTruthy()
  })

  it('returns 400 when already on requested plan', async () => {
    mockAuth.mockResolvedValueOnce(makeSession({ subscriptionTier: 'pro' }))
    const res = await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'pro' }) as Parameters<typeof checkoutPOST>[0])
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toMatch(/already on/i)
  })

  it('returns checkout url from Stripe (mock service)', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const mockService = {
      createCheckoutSession: vi.fn().mockResolvedValueOnce({ url: 'https://checkout.stripe.com/session/cs_test_123' }),
    }
    mockGetBilling.mockReturnValueOnce(mockService)

    const res = await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'pro', annual: false }) as Parameters<typeof checkoutPOST>[0])
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('https://checkout.stripe.com/session/cs_test_123')
  })

  it('returns success: true from mock billing service', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const mockService = {
      createCheckoutSession: vi.fn().mockResolvedValueOnce({ success: true }),
    }
    mockGetBilling.mockReturnValueOnce(mockService)

    const res = await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'pro' }) as Parameters<typeof checkoutPOST>[0])
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 500 when billing service throws', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const mockService = {
      createCheckoutSession: vi.fn().mockRejectedValueOnce(new Error('Stripe API error')),
    }
    mockGetBilling.mockReturnValueOnce(mockService)

    const res = await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'pro' }) as Parameters<typeof checkoutPOST>[0])
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBeTruthy()
    // Must not expose internal error detail to the client
    expect(json.error).not.toMatch(/stripe api error/i)
  })

  it('returns 400 for downgrade attempt via checkout', async () => {
    // User is on pro+ and tries to downgrade to pro via checkout
    mockAuth.mockResolvedValueOnce(makeSession({ subscriptionTier: 'pro_plus' }))
    const res = await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'pro' }) as Parameters<typeof checkoutPOST>[0])
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toBeTruthy()
  })

  it('passes annual flag to billing service', async () => {
    mockAuth.mockResolvedValueOnce(makeSession())
    const mockService = {
      createCheckoutSession: vi.fn().mockResolvedValueOnce({ url: 'https://checkout.stripe.com/annual' }),
    }
    mockGetBilling.mockReturnValueOnce(mockService)

    await checkoutPOST(makeRequest('http://localhost/api/billing/checkout', { plan: 'pro', annual: true }) as Parameters<typeof checkoutPOST>[0])

    const call = mockService.createCheckoutSession.mock.calls[0][0]
    expect(call.annual).toBe(true)
    expect(call.plan).toBe('pro')
    expect(call.userId).toBe('user-001')
  })
})

// ── POST /api/billing/webhook ────────────────────────────────────────────────

describe('POST /api/billing/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 immediately in mock mode', async () => {
    const originalEnv = process.env.BILLING_PROVIDER
    delete process.env.BILLING_PROVIDER

    const req = new Request('http://localhost/api/billing/webhook', {
      method: 'POST',
      body: 'stripe-payload',
    })
    const res = await webhookPOST(req as Parameters<typeof webhookPOST>[0])
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)

    process.env.BILLING_PROVIDER = originalEnv
  })

  it('returns 400 when Stripe signature header is missing', async () => {
    process.env.BILLING_PROVIDER = 'stripe'

    const req = new Request('http://localhost/api/billing/webhook', {
      method: 'POST',
      body: 'stripe-payload',
      // no stripe-signature header
    })
    const res = await webhookPOST(req as Parameters<typeof webhookPOST>[0])
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/signature/i)

    delete process.env.BILLING_PROVIDER
  })
})
