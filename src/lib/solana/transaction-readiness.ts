/**
 * transaction-readiness.ts — Pre-flight readiness checks for Solana signing.
 *
 * Aggregates all conditions a user must meet before they can call
 * POST /api/intents/[id]/prepare and subsequently sign a transaction.
 *
 * This is a pure computation layer — no DB calls, no API calls.
 * Pass in the data you have (intent, session) and get back a structured
 * readiness result the UI can render as a checklist.
 *
 * Design goals:
 *   - UI shows WHY the user can't sign before they hit the API
 *   - Each check carries its own label, detail, and optional CTA
 *   - The result drives both the checklist component and the prepare button state
 *
 * Checks (evaluated in dependency order):
 *   1. intent_status       — must be APPROVED or READY_TO_SIGN
 *   2. wallet_connected    — must have an active wallet address on account
 *   3. wallet_type         — must be an external wallet (custodial can't sign client-side yet)
 *   4. kyc_verified        — required for PREPARE_INVEST and PREPARE_PURCHASE
 *
 * Adding a new check:
 *   1. Add the check ID to ReadinessCheckId
 *   2. Add the check logic to evaluateReadiness()
 *   3. The UI picks it up automatically
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type ReadinessCheckId =
  | 'intent_status'
  | 'wallet_connected'
  | 'wallet_type'
  | 'kyc_verified'

export interface ReadinessCheck {
  id:           ReadinessCheckId
  /** Short label shown in the checklist row */
  label:        string
  /** One-line detail — why this check passed or what the user needs to do */
  detail:       string
  /** Whether this check is currently satisfied */
  passed:       boolean
  /** CTA label if the check has a direct action the user can take */
  actionLabel?: string
  /** Route or handler the CTA navigates to */
  actionHref?:  string
}

export interface TransactionReadiness {
  /** True when all checks pass and the user can call /prepare */
  canPrepare: boolean
  /** All individual checks, in display order */
  checks: ReadinessCheck[]
  /**
   * Single sentence describing the immediate next action.
   * Used as the call-to-action subtitle above the prepare button.
   */
  nextAction: string
  /**
   * The single most-important blocker if canPrepare is false.
   * null when canPrepare is true.
   */
  blockingReason: string | null
}

// ── Input ──────────────────────────────────────────────────────────────────

export interface ReadinessInput {
  intentStatus: string
  intentType:   string
  /** Active wallet address from session (User.walletAddress). Null = no wallet. */
  walletAddress: string | null | undefined
  /** 'connected' = external Phantom/Solflare; 'custodial' = platform managed; 'none' = none */
  walletMode:    'connected' | 'custodial' | 'none'
  /** KYC verification status from session */
  kycStatus:     string | null | undefined
}

// ── Checks requiring KYC ──────────────────────────────────────────────────

const KYC_REQUIRED_INTENT_TYPES = new Set(['PREPARE_INVEST', 'PREPARE_PURCHASE'])

// ── Core evaluator ────────────────────────────────────────────────────────

/**
 * Evaluates all pre-flight readiness checks for a transaction intent.
 *
 * @param input  Current state of the intent and the user's session
 * @returns      TransactionReadiness — drives the checklist UI and prepare button
 */
export function evaluateReadiness(input: ReadinessInput): TransactionReadiness {
  const checks: ReadinessCheck[] = []

  // ── Check 1: Intent status ──────────────────────────────────────────────

  const preparableStatuses = new Set(['APPROVED', 'READY_TO_SIGN'])
  const statusOk = preparableStatuses.has(input.intentStatus)

  checks.push({
    id:     'intent_status',
    label:  'Intent approved',
    detail: statusOk
      ? 'Your intent has been reviewed and approved.'
      : input.intentStatus === 'PENDING' || input.intentStatus === 'REVIEWING'
        ? 'Your intent is still under review. You can prepare your wallet once it is approved.'
        : `Intent is ${input.intentStatus.toLowerCase()} — a new intent must be submitted.`,
    passed: statusOk,
  })

  // ── Check 2: Wallet address present ────────────────────────────────────

  const hasWallet = !!input.walletAddress
  checks.push({
    id:          'wallet_connected',
    label:       'Wallet set up',
    detail:      hasWallet
      ? 'Your wallet address is registered on your account.'
      : 'A wallet address must be associated with your account.',
    passed:      hasWallet,
    actionLabel: !hasWallet ? 'Set up wallet' : undefined,
    actionHref:  !hasWallet ? '/settings/wallet' : undefined,
  })

  // ── Check 3: External wallet (can sign client-side) ─────────────────────

  const needsExternalWallet = input.walletMode !== 'connected'
  const walletTypeOk        = input.walletMode === 'connected'

  checks.push({
    id:     'wallet_type',
    label:  'Signing wallet connected',
    detail: walletTypeOk
      ? 'Your Phantom or Solflare wallet is connected and can sign.'
      : input.walletMode === 'custodial'
        ? 'Your TIGI-managed wallet cannot sign directly in this version. Connect Phantom or Solflare.'
        : 'Connect a Phantom or Solflare wallet to sign transactions.',
    passed:      walletTypeOk,
    actionLabel: needsExternalWallet ? 'Connect wallet' : undefined,
    // Note: actionHref is undefined here because opening the wallet modal
    // requires a client-side callback — the checklist component handles it.
  })

  // ── Check 4: KYC (conditional) ──────────────────────────────────────────

  const requiresKyc = KYC_REQUIRED_INTENT_TYPES.has(input.intentType)
  if (requiresKyc) {
    const kycOk = input.kycStatus === 'VERIFIED'
    checks.push({
      id:     'kyc_verified',
      label:  'Identity verified',
      detail: kycOk
        ? 'Your identity has been verified.'
        : input.kycStatus === 'PENDING' || input.kycStatus === 'SUBMITTED'
          ? 'Your KYC submission is being reviewed. This typically takes 1–2 business days.'
          : 'Investment and purchase intents require identity verification. Complete KYC in Settings.',
      passed:      kycOk,
      actionLabel: !kycOk && input.kycStatus !== 'PENDING' && input.kycStatus !== 'SUBMITTED'
        ? 'Verify identity'
        : undefined,
      actionHref: !kycOk && input.kycStatus !== 'PENDING' && input.kycStatus !== 'SUBMITTED'
        ? '/settings/kyc'
        : undefined,
    })
  }

  // ── Result ──────────────────────────────────────────────────────────────

  const failedChecks    = checks.filter(c => !c.passed)
  const canPrepare      = failedChecks.length === 0
  const blockingCheck   = failedChecks[0] ?? null

  const nextAction = canPrepare
    ? 'Your wallet is ready. Click below to prepare your transaction for signing.'
    : blockingCheck?.actionLabel
      ? `${blockingCheck.actionLabel} to continue.`
      : blockingCheck?.detail ?? 'Complete the steps above to continue.'

  return {
    canPrepare,
    checks,
    nextAction,
    blockingReason: blockingCheck ? blockingCheck.detail : null,
  }
}
