// ---------------------------------------------------------------------------
// POST /api/intents/[id]/prepare
//
// Builds an unsigned Solana transaction for an APPROVED TransactionIntent
// and advances the intent to READY_TO_SIGN.
//
// This is the bridge between the off-chain intent layer and on-chain signing.
//
// Requirements:
//   - Caller must own the intent
//   - Intent must be APPROVED
//   - Caller must have an active wallet address
//
// What it does:
//   1. Calls IntentPreparationService.prepareIntent() to build a Memo tx
//      that records this intent ID on-chain.
//   2. Stores the WalletPreparation in intent.metadata.walletPreparation
//   3. Sets intent.status = READY_TO_SIGN
//   4. Returns the serialized (unsigned) transaction to the client.
//
// The client then:
//   - Shows WalletPreparationPanel with the "Sign transaction" button
//   - Signs via wallet adapter (Phantom/Solflare) or custodial path (M5)
//   - POSTs the signed tx to POST /api/intents/[id]/submit
//
// NOTE: The prepared transaction has a TTL of ~90 seconds (blockhash TTL).
// If the user takes too long, they must re-call this endpoint to get a
// fresh preparation (the status stays READY_TO_SIGN, metadata is overwritten).
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { IntentPreparationService } from '@/lib/solana/intent-preparation'
import { logger } from '@/lib/logger'

const PREPARABLE_STATUSES = ['APPROVED', 'READY_TO_SIGN'] as const

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
      { success: false, error: { code: 'NO_WALLET', message: 'No wallet address on account. Connect a wallet first.' } },
      { status: 409 },
    )
  }

  const { id } = await params

  try {
    const intent = await prisma.transactionIntent.findUnique({
      where:  { id },
      select: {
        id:          true,
        userId:      true,
        status:      true,
        intentType:  true,
        propertyId:  true,
        fractionQty: true,
      },
    })

    if (!intent) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Intent not found' } },
        { status: 404 },
      )
    }

    if (intent.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not your intent' } },
        { status: 403 },
      )
    }

    if (!PREPARABLE_STATUSES.includes(intent.status as typeof PREPARABLE_STATUSES[number])) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Intent must be APPROVED to prepare. Current status: ${intent.status}`,
          },
        },
        { status: 409 },
      )
    }

    // Build the unsigned Solana transaction
    const svc         = await IntentPreparationService.create()
    const preparation = await svc.prepareIntent(
      {
        id:          intent.id,
        intentType:  intent.intentType,
        propertyId:  intent.propertyId,
        fractionQty: intent.fractionQty,
      },
      walletAddress,
    )

    // Persist preparation metadata + advance status
    const existing = (intent as { metadata?: Record<string, unknown> }).metadata ?? {}
    await prisma.transactionIntent.update({
      where: { id },
      data:  {
        status:   'READY_TO_SIGN' as never,
        metadata: {
          ...(existing as object),
          walletPreparation: preparation,
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId:       session.user.id,
        action:       'intent.prepare',
        resourceType: 'TransactionIntent',
        resourceId:   id,
        metadata: {
          intentType:    intent.intentType,
          signerAddress: walletAddress,
          program:       preparation.program,
          blockhash:     preparation.blockhash,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data:    {
        intentId:    id,
        preparation: {
          serialized:           preparation.serialized,
          requiredSigner:       preparation.requiredSigner,
          blockhash:            preparation.blockhash,
          lastValidBlockHeight: preparation.lastValidBlockHeight,
          expiresAt:            preparation.expiresAt,
          program:              preparation.program,
          memoText:             preparation.memoText,
        },
      },
    })
  } catch (err) {
    logger.error('[api/intents/[id]/prepare POST]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to prepare transaction' } },
      { status: 500 },
    )
  }
}
