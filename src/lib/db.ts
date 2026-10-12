import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Prisma singleton — prevents multiple instances in Next.js dev hot-reload
// See system-architecture.md §2.3
//
// On Vercel the schema's SQLite file (prisma/dev.db) is created and seeded at
// build time (scripts/build-demo-db.mjs) and bundled read-only. SQLite needs a
// writable location, so each server instance copies it to /tmp on first use.
// Locally nothing changes: Prisma uses prisma/dev.db as before.
// ---------------------------------------------------------------------------

function vercelDemoDbUrl(): string | undefined {
  if (!process.env.VERCEL) return undefined
  try {
    const bundled = path.join(process.cwd(), 'prisma', 'dev.db')
    const writable = '/tmp/tigi-demo.db'
    if (!fs.existsSync(writable) && fs.existsSync(bundled)) {
      fs.copyFileSync(bundled, writable)
    }
    return fs.existsSync(writable) ? `file:${writable}` : undefined
  } catch (err) {
    console.error('[db] Could not prepare the demo database:', err)
    return undefined
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const datasourceUrl = vercelDemoDbUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
