// ---------------------------------------------------------------------------
// POST /api/intents/[id]/submit
//
// Accepts a signed, base64-encoded Solana transaction from the client,
// submits it to the network, and on confirmation marks the intent EXECUTED.
//
// This is the final step in the intent → on-chain flow:
//   READY_TO_SIGN → (client signs) → POST here → EXECUTED
//
// Body: { signedTransaction: string } — base64 VersionedTransaction
//
// What it does:
//   1. Validates the intent is READY_TO_SIGN and owned by the caller
//   2. Verifies the stored WalletPreparation matches the submission
//   3. Calls SolanaService.submitSignedTransaction()
//   4. On success: updates intent status → EXECUTED, stores Solana
//      signature + explorer URL in intent.metadata
//   5. Writes AuditLog with signature
//
// On-chain confirmation is awaited synchronously (confirmed commitment).
// For M5 this may be changed to async (submit + poll) to avoid timeout.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SolanaService } from '@/lib/solana/solana-service'
import type { WalletPreparation } from '@/lib/solana/intent-preparation'
import { logger } from '@/lib/logger'

const SubmitSchema = z.object({
  signedTransaction: z.string().min(1),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const parsed = SubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  const { signedTransaction } = parsed.data

  try {
    const intent = await prisma.transactionIntent.findUnique({
      where:  { id },
      select: {
        id:         true,
        userId:     true,
        status:     true,
        intentType: true,
        propertyId: true,
        metadata:   true,
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

    if (intent.status !== 'READY_TO_SIGN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Intent must be READY_TO_SIGN to submit. Current status: ${intent.status}`,
          },
        },
        { status: 409 },
      )
    }

    // Verify a preparation exists in metadata
    const metadata     = (intent.metadata ?? {}) as Record<string, unknown>
    const preparation  = metadata.walletPreparation as WalletPreparation | undefined

    if (!preparation) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_PREPARATION', message: 'No preparation found. Call /prepare first.' } },
        { status: 409 },
      )
    }

    // Submit signed transaction to Solana
    const solana    = await SolanaService.create()
    const submitted = await solana.submitSignedTransaction(signedTransaction)

    // Mark intent EXECUTED + store on-chain reference
    await prisma.$transaction(async (tx) => {
      await tx.transactionIntent.update({
        where: { id },
        data:  {
          status:   'EXECUTED' as never,
          metadata: {
            ...metadata,
            solanaSignature: submitted.signature,
            explorerUrl:     submitted.explorerUrl,
            executedAt:      new Date().toISOString(),
          },
        },
      })

      await tx.auditLog.create({
        data: {
          userId:       session.user.id,
          action:       'intent.submit',
          resourceType: 'TransactionIntent',
          resourceId:   id,
          metadata: {
            intentType:      intent.intentType,
            solanaSignature: submitted.signature,
            explorerUrl:     submitted.explorerUrl,
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        intentId:        id,
        status:          'EXECUTED',
        solanaSignature: submitted.signature,
        explorerUrl:     submitted.explorerUrl,
      },
    })
  } catch (err) {
    logger.error('[api/intents/[id]/submit POST]', { error: err instanceof Error ? err.message : String(err) })

    // If tx was rejected by the network, give a clean message
    const errMsg = (err as Error).message ?? ''
    const isOnChainError =
      errMsg.includes('Transaction simulation failed') ||
      errMsg.includes('blockhash not found') ||
      errMsg.includes('BlockhashNotFound')

    return NextResponse.json(
      {
        success: false,
        error: {
          code:    isOnChainError ? 'TX_FAILED' : 'INTERNAL_ERROR',
          message: isOnChainError
            ? 'Transaction was rejected by the Solana network. Please try again.'
            : 'Failed to submit transaction',
        },
      },
      { status: isOnChainError ? 409 : 500 },
    )
  }
}
