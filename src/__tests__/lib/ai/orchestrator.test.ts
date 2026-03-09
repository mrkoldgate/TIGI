import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/lib/ai/provider', () => ({
  getAiProvider:      vi.fn(),
  getAnthropicClient: vi.fn(),
  AI_MODELS: {
    assistant:  'claude-haiku-4-5-20251001',
    analysis:   'claude-sonnet-4-6',
    structured: 'claude-haiku-4-5-20251001',
  },
}))

vi.mock('@/lib/ai/prompt-templates', () => ({
  buildAriaSystemPrompt:        vi.fn().mockReturnValue('You are Aria.'),
  buildValuationNarrativePrompt: vi.fn().mockReturnValue({
    system: 'You are a valuation expert.',
    user:   'Summarise this property.',
  }),
}))

vi.mock('@/lib/assistant/mock-assistant-data', () => ({
  getMockResponse: vi.fn().mockReturnValue([{ type: 'text', text: 'mock response' }]),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info:  vi.fn(),
    warn:  vi.fn(),
    error: vi.fn(),
  },
}))

import { getAiProvider, getAnthropicClient } from '@/lib/ai/provider'
import { getMockResponse } from '@/lib/assistant/mock-assistant-data'
import { logger } from '@/lib/logger'

const mockGetAiProvider      = getAiProvider      as ReturnType<typeof vi.fn>
const mockGetAnthropicClient = getAnthropicClient  as ReturnType<typeof vi.fn>
const mockGetMockResponse    = getMockResponse     as ReturnType<typeof vi.fn>
const mockLoggerError        = logger.error        as ReturnType<typeof vi.fn>

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeAnthropicClient(responseText: string) {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify([{ type: 'text', text: responseText }]) }],
      }),
    },
  }
}

const BASE_CONTEXT = {
  userId:           'user-001',
  subscriptionTier: 'free' as const,
  role:             'INVESTOR' as const,
}

const PRO_CONTEXT = { ...BASE_CONTEXT, subscriptionTier: 'pro_plus' as const }

const BASE_VALUATION = {
  score: 82,
  summary: 'Solid investment with strong yield prospects.',
  confidence: 'high' as const,
  factors: [],
  comparables: [],
  priceHistory: [],
  aiNarrative: null,
}

const BASE_INPUT = {
  propertyId:  'prop-001',
  propertyType: 'residential' as const,
  location:    { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  size:        120,
  bedrooms:    3,
  bathrooms:   2,
  yearBuilt:   2015,
  askingPrice: 55_000_000,
  currency:    'NGN' as const,
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AIOrchestrator.chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module-level singleton between tests
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns mock response when AI_PROVIDER=mock', async () => {
    mockGetAiProvider.mockReturnValue('mock')
    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    const result = await orch.chat([{ role: 'user', text: 'hello', timestamp: new Date() }], BASE_CONTEXT)

    expect(result.provider).toBe('mock')
    expect(result.model).toBeNull()
    expect(mockGetMockResponse).toHaveBeenCalledWith('hello')
  })

  it('calls Anthropic and returns result when AI_PROVIDER=anthropic', async () => {
    mockGetAiProvider.mockReturnValue('anthropic')
    const client = makeAnthropicClient('AI reply')
    mockGetAnthropicClient.mockResolvedValue(client)

    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    const result = await orch.chat(
      [{ role: 'user', text: 'hello', timestamp: new Date() }],
      BASE_CONTEXT,
    )

    expect(result.provider).toBe('anthropic')
    expect(result.model).toBe('claude-haiku-4-5-20251001')
    expect(client.messages.create).toHaveBeenCalledOnce()
  })

  it('falls back to mock when Anthropic throws', async () => {
    mockGetAiProvider.mockReturnValue('anthropic')
    mockGetAnthropicClient.mockResolvedValue({
      messages: {
        create: vi.fn().mockRejectedValue(new Error('API rate limit')),
      },
    })

    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    const result = await orch.chat(
      [{ role: 'user', text: 'hello', timestamp: new Date() }],
      BASE_CONTEXT,
    )

    expect(result.provider).toBe('mock')
    expect(mockLoggerError).toHaveBeenCalledOnce()
    expect(mockLoggerError.mock.calls[0][0]).toMatch(/anthropic failed/i)
  })

  it('includes latencyMs in response', async () => {
    mockGetAiProvider.mockReturnValue('mock')
    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    const result = await orch.chat([{ role: 'user', text: 'ping', timestamp: new Date() }])

    expect(typeof result.latencyMs).toBe('number')
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('passes the last user message to getMockResponse', async () => {
    mockGetAiProvider.mockReturnValue('mock')
    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    await orch.chat([
      { role: 'user',      text: 'first question', timestamp: new Date() },
      { role: 'assistant', text: 'first answer',   timestamp: new Date() },
      { role: 'user',      text: 'follow-up',      timestamp: new Date() },
    ])

    expect(mockGetMockResponse).toHaveBeenCalledWith('follow-up')
  })
})

describe('AIOrchestrator.enrichValuationNarrative', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns existing summary unchanged in mock mode', async () => {
    mockGetAiProvider.mockReturnValue('mock')
    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    const result = await orch.enrichValuationNarrative(BASE_VALUATION, BASE_INPUT, BASE_CONTEXT)

    expect(result.provider).toBe('mock')
    expect(result.result).toBe(BASE_VALUATION.summary)
  })

  it('returns existing summary for free user even with Anthropic configured', async () => {
    mockGetAiProvider.mockReturnValue('anthropic')
    const client = makeAnthropicClient('enriched narrative')
    mockGetAnthropicClient.mockResolvedValue(client)

    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    // Free tier — should NOT call Anthropic
    const result = await orch.enrichValuationNarrative(BASE_VALUATION, BASE_INPUT, BASE_CONTEXT)

    expect(result.provider).toBe('mock')
    expect(client.messages.create).not.toHaveBeenCalled()
  })

  it('calls Anthropic for Pro+ user with AI_PROVIDER=anthropic', async () => {
    mockGetAiProvider.mockReturnValue('anthropic')
    const client = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Institutional-grade narrative for the property.' }],
        }),
      },
    }
    mockGetAnthropicClient.mockResolvedValue(client)

    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    const result = await orch.enrichValuationNarrative(BASE_VALUATION, BASE_INPUT, PRO_CONTEXT)

    expect(result.provider).toBe('anthropic')
    expect(result.model).toBe('claude-sonnet-4-6')
    expect(result.result).toBe('Institutional-grade narrative for the property.')
    expect(client.messages.create).toHaveBeenCalledOnce()
  })

  it('falls back to rule-based summary when Anthropic throws (Pro+ user)', async () => {
    mockGetAiProvider.mockReturnValue('anthropic')
    mockGetAnthropicClient.mockResolvedValue({
      messages: {
        create: vi.fn().mockRejectedValue(new Error('Model overloaded')),
      },
    })

    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    const result = await orch.enrichValuationNarrative(BASE_VALUATION, BASE_INPUT, PRO_CONTEXT)

    expect(result.provider).toBe('mock')
    expect(result.result).toBe(BASE_VALUATION.summary)
    expect(mockLoggerError).toHaveBeenCalledOnce()
    expect(mockLoggerError.mock.calls[0][0]).toMatch(/anthropic failed/i)
  })

  it('returns empty string fallback when valuation has no summary', async () => {
    mockGetAiProvider.mockReturnValue('mock')
    const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orch = getAIOrchestrator()
    const result = await orch.enrichValuationNarrative(
      { ...BASE_VALUATION, summary: undefined },
      BASE_INPUT,
    )

    expect(result.result).toBe('')
  })
})
