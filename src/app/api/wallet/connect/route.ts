import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// POST /api/wallet/connect
//
// Called by useWalletTIGI when an external wallet is connected via the adapter.
// Saves the connected wallet address to User.walletAddress and writes an audit
// log. The previous custodial address is preserved in CustodialWallet.publicKey
// and restored on disconnect.
// ---------------------------------------------------------------------------

const bodySchema = z.object({
  walletAddress: z.string().min(32).max(44),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid wallet address', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { walletAddress } = parsed.data
  const userId = session.user.id

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { walletAddress },
    })

    await tx.auditLog.create({
      data: {
        userId,
        action: 'wallet.connect',
        resourceType: 'User',
        resourceId: userId,
        metadata: { walletAddress },
      },
    })
  })

  return NextResponse.json({ success: true, walletAddress })
}
