/**
 * IntentPreparationService — bridges off-chain TransactionIntent to
 * a serialized, unsigned Solana transaction ready for client-side signing.
 *
 * Architecture:
 *   1. A compliance officer APPROVES a TransactionIntent (off-chain, DB state)
 *   2. User (or system) calls prepareIntent() → builds & serializes a Solana tx
 *   3. Serialized tx stored in intent.metadata.walletPreparation
 *   4. Intent status → READY_TO_SIGN
 *   5. Client receives the serialized tx, signs it with Phantom/Solflare
 *   6. Client POSTs signed tx to /api/intents/[id]/submit
 *   7. Server submits to Solana → signature stored in metadata
 *   8. Intent status → EXECUTED
 *
 * M3 implementation: uses the SPL Memo program to record intent on-chain.
 * This creates an immutable, auditable on-chain reference without claiming
 * any property transfer — that semantics belongs to M5 (escrow program).
 *
 * M5 extension points are marked with TODO(M5) comments.
 */

import { SolanaService } from './solana-service'
import type { PreparedTransaction } from './solana-service'
import { TIGI_PROGRAMS, getIntentTypeFull } from './transaction-programs'
import type { TIGIProgramId, IntentTypeFull } from './transaction-programs'

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * On-chain memo payload for TIGI intent records.
 * Stored as compact JSON in the SPL Memo program instruction data.
 * Provides a human-readable, verifiable on-chain trail.
 *
 * v2 changes from v1:
 *   - `type` now uses full names ('express_interest'|'purchase'|'investment'|'lease')
 *     instead of abbreviated codes ('int'|'pur'|'inv'|'lea') for on-chain legibility
 */
export interface IntentMemoPayload {
  /** Schema version — bump when structure changes */
  v: 1 | 2
  /** Short prefix for TIGI-originated memos */
  app: 'tigi'
  /** Off-chain intent ID (CUID) */
  intent: string
  /** Intent type — full name for on-chain legibility */
  type: IntentTypeFull
  /** Property ID (first 8 chars for brevity) */
  prop: string
  /** Fractional qty (PREPARE_INVEST only) */
  qty?: number
  /** UTC seconds timestamp */
  ts: number
}

/**
 * The on-chain preparation state stored in TransactionIntent.metadata.
 * Populated by prepareIntent(), read by WalletPreparationPanel.
 */
export interface WalletPreparation extends PreparedTransaction {
  /**
   * Which Solana program handles this transaction.
   * Uses the TIGIProgramId registry — see transaction-programs.ts.
   * MEMO for M6; ESCROW / TOKEN_TRANSFER in M7+.
   */
  program: TIGIProgramId
  /** The full memo text written to chain */
  memoText: string
  /** UTC ISO string when this preparation was created */
  preparedAt: string
  /** Address that prepared this tx (server-side, for audit) */
  preparedBy: 'server'
}

// ── IntentPreparationService ───────────────────────────────────────────────

export class IntentPreparationService {
  private constructor(private readonly solana: SolanaService) { }

  static async create(): Promise<IntentPreparationService> {
    const solana = await SolanaService.create()
    return new IntentPreparationService(solana)
  }

  // ── Core: prepare ─────────────────────────────────────────────────────────

  /**
   * Builds an unsigned Solana transaction for an approved intent.
   *
   * The transaction writes a structured memo to the Solana Memo program,
   * creating an immutable on-chain record of this intent.
   *
   * The transaction is NOT submitted here — it is returned to the caller
   * so the client can sign it with their wallet (Phantom/Solflare) or
   * the platform custodial wallet (server-side signing, M5).
   *
   * @param intent        - The approved TransactionIntent record
   * @param signerAddress - Public key of the wallet that will sign
   * @returns             - WalletPreparation to store in intent.metadata
   */
  async prepareIntent(
    intent: {
      id: string
      intentType: string
      propertyId: string
      fractionQty: number | null
    },
    signerAddress: string,
  ): Promise<WalletPreparation> {
    // Use the program registry to determine the correct program for this intent.
    // M6: all intents use MEMO. M7: ESCROW for purchase/invest, TOKEN_TRANSFER at issuance.
    const programId: TIGIProgramId = 'MEMO'
    const program = TIGI_PROGRAMS[programId]

    const memoPayload: IntentMemoPayload = {
      v: 2,
      app: 'tigi',
      intent: intent.id,
      type: getIntentTypeFull(intent.intentType),
      prop: intent.propertyId.slice(0, 8),
      ts: Math.floor(Date.now() / 1_000),
      ...(intent.fractionQty != null ? { qty: intent.fractionQty } : {}),
    }

    const memoText = JSON.stringify(memoPayload)

    const prepared = await this.solana.buildMemoTransaction(
      signerAddress,
      memoText,
      program.address,
    )

    return {
      ...prepared,
      program: programId,
      memoText,
      preparedAt: new Date().toISOString(),
      preparedBy: 'server',
    }
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  /**
   * Checks whether a stored WalletPreparation is still valid
   * (i.e., the embedded blockhash has not expired on-chain).
   *
   * Should be checked before showing the "Sign transaction" UI.
   * Returns { valid: false, reason } if expired so the caller can
   * re-prepare rather than presenting a stale transaction.
   */
  async validatePreparation(prep: WalletPreparation): Promise<{
    valid: boolean
    reason?: string
  }> {
    // Local check first: preparation timestamp + TTL heuristic
    const preparedAt = new Date(prep.preparedAt).getTime()
    const ageMs = Date.now() - preparedAt
    const ttlMs = 90_000 // 90 seconds conservative TTL

    if (ageMs > ttlMs) {
      return { valid: false, reason: 'Preparation expired. Please prepare again.' }
    }

    // On-chain check: ask RPC if blockhash is still valid
    const isValid = await this.solana.isBlockhashValid(prep.blockhash)
    if (!isValid) {
      return { valid: false, reason: 'Transaction blockhash expired. Please prepare again.' }
    }

    return { valid: true }
  }

  // ── Parsing ────────────────────────────────────────────────────────────────

  /**
   * Parses an IntentMemoPayload from a raw memo string.
   * Returns null if the memo doesn't match the TIGI schema.
   * Used by audit tooling to decode on-chain intent records.
   *
   * Supports both v1 (legacy abbreviated codes) and v2 (full names).
   */
  static parseMemo(memoText: string): IntentMemoPayload | null {
    try {
      const payload = JSON.parse(memoText) as IntentMemoPayload
      if (payload.app !== 'tigi') return null
      if (payload.v !== 1 && payload.v !== 2) return null
      return payload
    } catch {
      return null
    }
  }
}
