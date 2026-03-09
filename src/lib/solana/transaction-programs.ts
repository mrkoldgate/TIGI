/**
 * transaction-programs.ts — TIGI Solana program registry.
 *
 * A central reference for every Solana program TIGI uses or plans to use.
 * Consumers import named constants and helpers rather than hardcoding
 * program addresses or capability flags throughout the codebase.
 *
 * Current state (M6):
 *   MEMO           — live, used for intent recording
 *   ESCROW         — planned M7: hold funds during compliance review
 *   TOKEN_TRANSFER — planned M7: issue fractional interest tokens
 *
 * Adding a new program:
 *   1. Add an entry to TIGI_PROGRAMS
 *   2. Add an intent type mapping in INTENT_TYPE_TO_PROGRAM (if relevant)
 *   3. Implement the program handler in solana-service.ts
 *   No other changes needed — consumers call getProgramInfo() / getIntentProgram()
 */

// ── Program registry ───────────────────────────────────────────────────────

export type TIGIProgramId = 'MEMO' | 'ESCROW' | 'TOKEN_TRANSFER'

export type ProgramStatus = 'live' | 'planned'

export interface TIGIProgramInfo {
  /** Short identifier used in WalletPreparation.program */
  id:          TIGIProgramId
  /** On-chain program address */
  address:     string
  /** Human-readable name shown in the signing UI */
  displayName: string
  /** One-line description of what this program does */
  description: string
  /** Deployment status — 'live' = usable now, 'planned' = future milestone */
  status:      ProgramStatus
  /** Plain-English explanation for users seeing this in the signing panel */
  userExplanation: string
}

export const TIGI_PROGRAMS: Record<TIGIProgramId, TIGIProgramInfo> = {
  MEMO: {
    id:          'MEMO',
    address:     'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
    displayName: 'SPL Memo',
    description: 'Writes a structured record of your intent to the Solana blockchain.',
    status:      'live',
    userExplanation:
      'This creates an immutable, publicly verifiable record that you expressed this intent ' +
      'at this moment. No funds move and no legal transfer occurs at this step.',
  },

  ESCROW: {
    id:          'ESCROW',
    address:     '',  // assigned when program is deployed
    displayName: 'TIGI Escrow',
    description: 'Holds funds in a Solana Program Derived Address (PDA) pending compliance clearance.',
    status:      'planned',
    userExplanation:
      'Your committed funds are locked in a smart contract escrow. ' +
      'Neither party can access them until all compliance conditions are met. ' +
      'If the transaction does not complete, funds are returned to your wallet.',
  },

  TOKEN_TRANSFER: {
    id:          'TOKEN_TRANSFER',
    address:     '',  // assigned when program is deployed
    displayName: 'Fractional Interest Issuance',
    description: 'Issues fractional economic interest tokens to the investor's wallet.',
    status:      'planned',
    userExplanation:
      'Digital records representing your proportional economic interest in this property ' +
      'are transferred to your wallet. These are not legal title — see full disclosures.',
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns program metadata for a given program ID.
 * Throws if the program is unknown — callers should use known IDs only.
 */
export function getProgramInfo(programId: TIGIProgramId): TIGIProgramInfo {
  const info = TIGI_PROGRAMS[programId]
  if (!info) throw new Error(`[transaction-programs] Unknown program: ${programId}`)
  return info
}

// ── Intent type → intent type label ───────────────────────────────────────
// Full names for on-chain memo payloads (replaces abbreviated 'int'|'pur'|'inv'|'lea').
// Human-readable so anyone inspecting the chain can understand the record.

export type IntentTypeFull = 'express_interest' | 'purchase' | 'investment' | 'lease'

export const INTENT_TYPE_FULL: Record<string, IntentTypeFull> = {
  EXPRESS_INTEREST: 'express_interest',
  PREPARE_PURCHASE: 'purchase',
  PREPARE_INVEST:   'investment',
  PREPARE_LEASE:    'lease',
}

/**
 * Returns the human-readable intent type name for on-chain memo payloads.
 * Falls back to 'express_interest' for unknown types.
 */
export function getIntentTypeFull(intentType: string): IntentTypeFull {
  return INTENT_TYPE_FULL[intentType] ?? 'express_interest'
}

// ── Status guidance ────────────────────────────────────────────────────────
// Plain-English explanations for each intent status, shown in the intent card.

export type IntentStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'APPROVED'
  | 'READY_TO_SIGN'
  | 'EXECUTED'
  | 'CANCELLED'
  | 'EXPIRED'

export interface IntentStatusGuidance {
  /** Short label shown in the status badge */
  label: string
  /** One-sentence explanation of what this status means for the user */
  meaning: string
  /** What the user should do next (or what they're waiting for) */
  nextStep: string | null
}

export const INTENT_STATUS_GUIDANCE: Record<IntentStatus, IntentStatusGuidance> = {
  PENDING: {
    label:    'Submitted',
    meaning:  'Your intent has been received and is in the queue for review.',
    nextStep: 'No action needed. Our compliance team typically reviews within 1–2 business days.',
  },
  REVIEWING: {
    label:    'Under Review',
    meaning:  'A compliance officer is reviewing your intent.',
    nextStep: 'No action needed. You will be notified when a decision is made.',
  },
  APPROVED: {
    label:    'Approved — Action Required',
    meaning:  'Your intent has been approved. You can now prepare your wallet to sign the on-chain record.',
    nextStep: 'Connect your Solana wallet and click "Prepare to sign" to create your transaction.',
  },
  READY_TO_SIGN: {
    label:    'Ready to Sign',
    meaning:  'A transaction has been prepared for your wallet to sign.',
    nextStep: 'Open your wallet (Phantom or Solflare) and sign the transaction to record your intent on Solana.',
  },
  EXECUTED: {
    label:    'Recorded On-Chain',
    meaning:  'Your intent has been recorded on the Solana blockchain.',
    nextStep: 'Our team will follow up within 1–2 business days to discuss next steps.',
  },
  CANCELLED: {
    label:    'Cancelled',
    meaning:  'This intent was cancelled.',
    nextStep: null,
  },
  EXPIRED: {
    label:    'Expired',
    meaning:  'This intent was not acted upon within the allowed time.',
    nextStep: 'You may submit a new intent for this property.',
  },
}
