import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Prisma singleton — prevents multiple instances in Next.js dev hot-reload
// See system-architecture.md §2.3
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
