'use client'

// ---------------------------------------------------------------------------
// IntentReadinessChecklist — Pre-flight signing checklist for a transaction
// intent in APPROVED status.
//
// Shows every readiness check (wallet, KYC, status) as a labelled row with
// pass/fail styling and optional CTAs. Replaces the bare "Prepare to sign"
// button with a contextual explanation of what is required and why.
//
// Renders as two sections:
//   1. Readiness checklist — each check with ✓/✗, label, and detail
//   2. "What signing does" explanation (always shown, educates the user)
//
// When all checks pass: shows the "Prepare to sign" button with a loading
// state. Calls onPrepare() when clicked — parent handles the API call.
//
// When any check fails: shows the specific blocker with its CTA.
// ---------------------------------------------------------------------------

import { Check, X, AlertCircle, Loader2, PenLine, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useWalletTIGI } from '@/hooks/use-tigi-wallet'
import { useWalletModal } from '@/components/wallet/wallet-provider'
import { evaluateReadiness } from '@/lib/solana/transaction-readiness'
import { getProgramInfo } from '@/lib/solana/transaction-programs'
import type { ReadinessCheck } from '@/lib/solana/transaction-readiness'

// ── Props ──────────────────────────────────────────────────────────────────

interface IntentReadinessChecklistProps {
  intentId:    string
  intentType:  string
  intentStatus: string
  isPreparing: boolean
  prepareError: string | null
  onPrepare:   () => void
  className?:  string
}

// ── Sub-component: single check row ───────────────────────────────────────

function CheckRow({ check, onWalletConnect }: {
  check:           ReadinessCheck
  onWalletConnect: () => void
}) {
  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className={cn(
        'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full',
        check.passed
          ? 'bg-[#22C55E]/15 text-[#22C55E]'
          : 'bg-[#EF4444]/12 text-[#EF4444]',
      )}>
        {check.passed
          ? <Check className="h-2.5 w-2.5" />
          : <X    className="h-2.5 w-2.5" />
        }
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-xs font-medium',
          check.passed ? 'text-[#A0A0B2]' : 'text-[#F5F5F7]',
        )}>
          {check.label}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[#6B6B80]">
          {check.detail}
        </p>

        {/* Action CTA — only shown when check fails and has an action */}
        {!check.passed && (
          check.id === 'wallet_type' ? (
            <button
              type="button"
              onClick={onWalletConnect}
              className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#C9A84C] hover:text-[#D4B55A]"
            >
              <Wallet className="h-3 w-3" />
              Connect Phantom or Solflare
            </button>
          ) : check.actionHref ? (
            <a
              href={check.actionHref}
              className="mt-1.5 inline-block text-[11px] font-medium text-[#C9A84C] hover:text-[#D4B55A]"
            >
              {check.actionLabel} →
            </a>
          ) : null
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function IntentReadinessChecklist({
  intentId:     _intentId,
  intentType,
  intentStatus,
  isPreparing,
  prepareError,
  onPrepare,
  className,
}: IntentReadinessChecklistProps) {
  const { data: session }    = useSession()
  const { walletMode, publicKey } = useWalletTIGI()
  const { open: openWalletModal } = useWalletModal()

  const walletAddress = publicKey ?? session?.user?.walletAddress as string | null | undefined
  const kycStatus     = (session?.user as { kycStatus?: string } | undefined)?.kycStatus

  const readiness = evaluateReadiness({
    intentStatus,
    intentType,
    walletAddress,
    walletMode,
    kycStatus,
  })

  const programInfo = getProgramInfo('MEMO')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Checklist */}
      <div className="rounded-xl border border-[#1E1E2A] bg-[#0D0D14] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#4A4A60]">
          Signing requirements
        </p>

        <div className="space-y-3">
          {readiness.checks.map((check) => (
            <CheckRow
              key={check.id}
              check={check}
              onWalletConnect={openWalletModal}
            />
          ))}
        </div>

        {/* Next action summary */}
        {!readiness.canPrepare && readiness.blockingReason && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#F59E0B]" />
            <p className="text-[11px] leading-relaxed text-[#A0A0B2]">
              {readiness.nextAction}
            </p>
          </div>
        )}
      </div>

      {/* "What signing does" explanation */}
      <div className="rounded-xl border border-[#1E1E2A] bg-[#111118] p-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#4A4A60]">
          What signing does
        </p>
        <p className="text-[11px] leading-relaxed text-[#6B6B80]">
          {programInfo.userExplanation}
        </p>
        <div className="mt-2.5 flex items-center gap-3 border-t border-[#1E1E2A] pt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#4A4A60]">Program</span>
            <span className="font-mono text-[10px] text-[#6B6B80]">{programInfo.displayName}</span>
          </div>
          <span className="text-[#2A2A3A]">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#4A4A60]">Fee</span>
            <span className="text-[10px] text-[#6B6B80]">~0.000005 SOL</span>
          </div>
          <span className="text-[#2A2A3A]">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#4A4A60]">Funds moved</span>
            <span className="text-[10px] text-[#4ADE80]">None</span>
          </div>
        </div>
      </div>

      {/* Prepare button — only enabled when all checks pass */}
      {prepareError && (
        <div className="flex items-start gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#EF4444]" />
          <p className="text-[11px] text-[#EF4444]">{prepareError}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onPrepare}
        disabled={!readiness.canPrepare || isPreparing}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]',
          readiness.canPrepare
            ? 'bg-[#C9A84C] text-[#0A0A0F] hover:bg-[#D4B55A] disabled:opacity-60'
            : 'cursor-not-allowed border border-[#2A2A3A] bg-[#0D0D14] text-[#4A4A60]',
        )}
      >
        {isPreparing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing transaction…
          </>
        ) : (
          <>
            <PenLine className="h-4 w-4" />
            {readiness.canPrepare ? 'Prepare to sign' : 'Requirements not met'}
          </>
        )}
      </button>
    </div>
  )
}
