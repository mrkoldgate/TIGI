import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

vi.mock('@/lib/config', () => ({
  config: {
    app:     { nodeEnv: 'test', url: 'http://localhost:3000', name: 'TIGI' },
    ai:      { provider: 'mock' },
    storage: { provider: 'local' },
    solana:  { network: 'devnet' },
  },
}))

import { prisma } from '@/lib/db'
import { GET } from '@/app/api/health/route'

const mockQueryRaw = prisma.$queryRaw as ReturnType<typeof vi.fn>

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with status=ok when DB is healthy', async () => {
    mockQueryRaw.mockResolvedValueOnce([{ '1': 1 }])
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('ok')
    expect(json.checks.database).toBe('ok')
  })

  it('returns 503 with status=degraded when DB is unreachable', async () => {
    mockQueryRaw.mockRejectedValueOnce(new Error('Connection refused'))
    const res = await GET()
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json.status).toBe('degraded')
    expect(json.checks.database).toBe('error')
  })

  it('includes timestamp and environment fields', async () => {
    mockQueryRaw.mockResolvedValueOnce([{ '1': 1 }])
    const res = await GET()
    const json = await res.json()
    expect(json.timestamp).toBeDefined()
    expect(json.environment).toBeDefined()
  })

  it('includes version field', async () => {
    mockQueryRaw.mockResolvedValueOnce([{ '1': 1 }])
    const res = await GET()
    const json = await res.json()
    expect(json.version).toBeDefined()
  })
})
