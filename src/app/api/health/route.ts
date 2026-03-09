import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { config } from '@/lib/config'

// ---------------------------------------------------------------------------
// GET /api/health
//
// Lightweight liveness + readiness probe for uptime monitoring, load
// balancers, and deployment pipelines.
//
// Returns 200 / status=ok   when all checks pass.
// Returns 503 / status=degraded when any critical check fails.
//
// Checks:
//   database — SELECT 1 via Prisma to verify the connection pool is alive.
//              A failed DB check marks the response as degraded (503) because
//              most routes depend on the DB.
//
// Usage examples:
//   curl https://tigi.com/api/health                  → CI deploy gate
//   Railway / Render health check path: /api/health
// ---------------------------------------------------------------------------

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}

  // ── Database ────────────────────────────────────────────────────────────

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  // ── Aggregate ───────────────────────────────────────────────────────────

  const healthy = Object.values(checks).every(v => v === 'ok')

  return NextResponse.json(
    {
      status:      healthy ? 'ok' : 'degraded',
      app:         'tigi',
      version:     process.env.npm_package_version ?? '0.1.0',
      environment: config.app.nodeEnv,
      timestamp:   new Date().toISOString(),
      checks,
      config: {
        aiProvider:      config.ai.provider,
        storageProvider: config.storage.provider,
        solanaNetwork:   config.solana.network,
      },
    },
    { status: healthy ? 200 : 503 },
  )
}
