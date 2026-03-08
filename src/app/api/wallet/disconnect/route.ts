import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

// ---------------------------------------------------------------------------
// POST /api/wallet/disconnect
//
// Called by useWalletActions.disconnectWallet() after the wallet adapter
// disconnects. Restores User.walletAddress to the custodial wallet address
// (fetched from CustodialWallet record). Writes an audit log.
//
// Returns { walletAddress } so the client can update the session via
// updateSession({ walletAddress }).
// ---------------------------------------------------------------------------

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Fetch the user's custodial wallet (created at registration)
  const custodialWallet = await prisma.custodialWallet.findUnique({
    where: { userId },
    select: { publicKey: true },
  })

  const custodialAddress = custodialWallet?.publicKey ?? null

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { walletAddress: custodialAddress },
    })

    await tx.auditLog.create({
      data: {
        userId,
        action: 'wallet.disconnect',
        resourceType: 'User',
        resourceId: userId,
        metadata: { restoredCustodial: custodialAddress ?? 'none' },
      },
    })
  })

  return NextResponse.json({ success: true, walletAddress: custodialAddress })
}
