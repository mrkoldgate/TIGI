// ---------------------------------------------------------------------------
// GET /api/wallet/balance
//
// Returns the SOL balance of the authenticated user's active wallet.
// The "active wallet" is session.user.walletAddress (custodial or connected).
//
// Response: { success: true, data: { lamports, sol, display, network, isMainnet } }
//
// Used by:
//   - Settings → Wallet page (show live balance)
//   - WalletPreparationPanel (show whether user can afford tx fees)
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SolanaService } from '@/lib/solana/solana-service'
import { getNetwork } from '@/lib/solana/client'
import { logger } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const walletAddress = session.user.walletAddress
  if (!walletAddress) {
    return NextResponse.json(
      { success: false, error: { code: 'NO_WALLET', message: 'No wallet address on account' } },
      { status: 404 },
    )
  }

  if (!SolanaService.isValidAddress(walletAddress)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ADDRESS', message: 'Wallet address is not a valid Solana public key' } },
      { status: 422 },
    )
  }

  try {
    const service = await SolanaService.create()
    const balance = await service.getBalance(walletAddress)
    const network = getNetwork()

    return NextResponse.json({
      success: true,
      data: {
        ...balance,
        network,
        isMainnet: network === 'mainnet-beta',
      },
    })
  } catch (err) {
    logger.error('[api/wallet/balance GET]', err)
    return NextResponse.json(
      { success: false, error: { code: 'RPC_ERROR', message: 'Failed to fetch balance from Solana network' } },
      { status: 502 },
    )
  }
}
