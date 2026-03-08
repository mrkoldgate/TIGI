import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// PATCH /api/users/me/role
//
// Legacy endpoint — kept for post-onboarding role changes (e.g. Settings page).
// New onboarding flow uses /api/users/me/onboarding instead.
// ---------------------------------------------------------------------------

const schema = z.object({
  role: z.enum(['INVESTOR', 'OWNER', 'BOTH']),
})

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid role', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { role } = parsed.data

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { role },
    })

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'user.role.update',
        resourceType: 'User',
        resourceId: session.user.id,
        metadata: { role },
      },
    })
  })

  return NextResponse.json({ success: true, role })
}
