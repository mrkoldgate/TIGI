'use client'

// ---------------------------------------------------------------------------
// WalletPreparationPanel — shown when a TransactionIntent is READY_TO_SIGN.
//
// Flow:
//   1. Component receives intentId + walletPreparation from parent
//   2. "Sign transaction" button → calls signTransaction() on wallet adapter
//      (Phantom/Solflare must be connected; custodial signing in a future update)
//   3. POSTs signed tx to POST /api/intents/[id]/submit
//   4. On success: shows confirmation with Solana Explorer link
//   5. Calls onSuccess(signature, explorerUrl) so parent can refresh intent list
//
// Signing steps shown to user:
//   signing   — wallet popup open; "Approve in your wallet…"
//   submitting — signed tx sent to server/network; "Recording on Solana…"
//
// Edge cases handled:
//   - Not connected: shows "Connect a wallet to sign" with WalletButton
//   - Wrong wallet connected: preparation.requiredSigner !== publicKey
//   - Blockhash expired (>90s since prepare): shows "Refresh" button
//   - User cancelled wallet popup: error cleared silently
//   - Tx rejected on-chain: shows error with retry
//   - Custodial wallet: shows info + "Connect external wallet" prompt
// ---------------------------------------------------------------------------

import { useState, useCallback } from 'react'
import {
  PenLine,
  CheckCircle2,
  Loader2,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Wallet,
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import { cn } from '@/lib/utils'
import { useWalletTIGI } from '@/hooks/use-tigi-wallet'
import { useWalletModal } from './wallet-provider'
import { getProgramInfo } from '@/lib/solana/transaction-programs'
import type { TIGIProgramId } from '@/lib/solana/transaction-programs'

// ── Types ──────────────────────────────────────────────────────────────────

interface WalletPreparationData {
  serialized:           string
  requiredSigner:       string
  blockhash:            string
  lastValidBlockHeight: number
  expiresAt:            string
  program:              TIGIProgramId
  memoText:             string
}

interface WalletPreparationPanelProps {
  intentId:    string
  preparation: WalletPreparationData
  onSuccess?:  (signature: string, explorerUrl: string) => void
  onRefreshed?: (newPreparation: WalletPreparationData) => void
  className?:  string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isExpired(expiresAt: string): boolean {
  return Date.now() > new Date(expiresAt).getTime()
}

// Wallet error names that indicate deliberate user cancellation (not a bug).
const USER_CANCELLED_NAMES = new Set([
  'WalletWindowClosedError',
  'WalletUserRejectError',
])

function isUserCancellation(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  if (USER_CANCELLED_NAMES.has(err.name)) return true
  const msg = err.message.toLowerCase()
  return msg.includes('user rejected') ||
         msg.includes('transaction cancelled') ||
         msg.includes('user cancelled')
}

// ── Component ──────────────────────────────────────────────────────────────

export function WalletPreparationPanel({
  intentId,
  preparation,
  onSuccess,
  onRefreshed,
  className,
}: WalletPreparationPanelProps) {
  // 'idle' | 'signing' | 'submitting' gives the user step-by-step feedback.
  const [step,       setStep]       = useState<'idle' | 'signing' | 'submitting'>('idle')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [confirmed,    setConfirmed]    = useState<{
    signature:   string
    explorerUrl: string
  } | null>(null)

  const { walletMode, publicKey, walletLabel } = useWalletTIGI()
  const { signTransaction }                    = useWallet()
  const { open: openWalletModal }              = useWalletModal()

  const expired   = isExpired(preparation.expiresAt)
  const isBusy    = step !== 'idle'

  // ── Refresh preparation ────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      const res  = await fetch(`/api/intents/${intentId}/prepare`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message ?? `Request failed (${res.status})`)
      onRefreshed?.(json.data.preparation as WalletPreparationData)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsRefreshing(false)
    }
  }, [intentId, onRefreshed])

  // ── Sign + submit ──────────────────────────────────────────────────────

  const handleSign = useCallback(async () => {
    if (!signTransaction || !publicKey) return

    // Guard: wallet must match the signer the server prepared for.
    // This prevents a confusing "invalid signer" error from Solana.
    if (preparation.requiredSigner !== publicKey) {
      setError(
        `Wrong wallet connected. Please connect the wallet ending in …${preparation.requiredSigner.slice(-6)} to sign.`,
      )
      return
    }

    setStep('signing')
    setError(null)

    try {
      // 1. Deserialize the unsigned transaction from server
      const txBytes = Buffer.from(preparation.serialized, 'base64')
      const tx      = VersionedTransaction.deserialize(txBytes)

      // 2. Ask wallet to sign (opens Phantom/Solflare popup)
      let signed: VersionedTransaction
      try {
        signed = await signTransaction(tx)
      } catch (err) {
        if (isUserCancellation(err)) {
          // Silently clear — user closed the popup, no error to show.
          setStep('idle')
          return
        }
        throw err
      }

      // 3. Submit signed tx to server → Solana network
      setStep('submitting')
      const signedBase64 = Buffer.from(signed.serialize()).toString('base64')

      const res  = await fetch(`/api/intents/${intentId}/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ signedTransaction: signedBase64 }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message ?? `Request failed (${res.status})`)

      setConfirmed({
        signature:   json.data.solanaSignature,
        explorerUrl: json.data.explorerUrl,
      })
      onSuccess?.(json.data.solanaSignature, json.data.explorerUrl)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setStep('idle')
    }
  }, [signTransaction, publicKey, preparation, intentId, onSuccess])

  // ── Success state ──────────────────────────────────────────────────────

  if (confirmed) {
    return (
      <div className={cn(
        'rounded-xl border border-[#22C55E]/25 bg-[#0D0D14] p-4 space-y-3',
        className,
      )}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
          <p className="text-sm font-medium text-[#F5F5F7]">
            Interest recorded on Solana
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[#6B6B80]">
          Your fractional economic interest record has been confirmed on the Solana blockchain.
          Our team will reach out within 1–2 business days.
        </p>
        <a
          href={confirmed.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-[#C9A84C] hover:text-[#D4B55A]"
        >
          <ExternalLink className="h-3 w-3" />
          View on Solana Explorer
        </a>
        <p className="font-mono text-[10px] text-[#4A4A60]">
          sig: {confirmed.signature.slice(0, 16)}…
        </p>
      </div>
    )
  }

  // ── No connected wallet ────────────────────────────────────────────────

  if (walletMode !== 'connected') {
    return (
      <div className={cn(
        'rounded-xl border border-[#2A2A3A] bg-[#0D0D14] p-4 space-y-3',
        className,
      )}>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[#6B6B80]" />
          <p className="text-sm font-medium text-[#A0A0B2]">
            Wallet signature required
          </p>
        </div>

        {walletMode === 'custodial' ? (
          <>
            <p className="text-[11px] leading-relaxed text-[#6B6B80]">
              Your transaction is ready to sign. Connect a Phantom or Solflare wallet to sign
              directly. Server-assisted signing for your platform wallet is coming in a future update.
            </p>
            <button
              type="button"
              onClick={openWalletModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2A2A3A] py-2.5 text-sm font-medium text-[#A0A0B2] transition-all hover:border-[#3A3A4A] hover:text-[#F5F5F7] active:scale-[0.98]"
            >
              <Wallet className="h-4 w-4" />
              Connect wallet to sign
            </button>
          </>
        ) : (
          <p className="text-[11px] text-[#6B6B80]">
            No wallet found. Please set up your wallet in Settings.
          </p>
        )}
      </div>
    )
  }

  // ── Expired preparation ────────────────────────────────────────────────

  if (expired) {
    return (
      <div className={cn(
        'rounded-xl border border-[#F59E0B]/20 bg-[#0D0D14] p-4 space-y-3',
        className,
      )}>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />
          <p className="text-sm font-medium text-[#F59E0B]">Preparation window expired</p>
        </div>
        <p className="text-[11px] leading-relaxed text-[#6B6B80]">
          Solana transactions embed a recent block reference that expires after ~90 seconds.
          This is a network-level safety mechanism — not an error. Refresh to generate a fresh
          transaction and continue signing.
        </p>
        {error && <p className="text-[11px] text-[#EF4444]">{error}</p>}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2A2A3A] py-2.5 text-sm font-medium text-[#A0A0B2] transition-all hover:border-[#3A3A4A] hover:text-[#F5F5F7] disabled:opacity-50 active:scale-[0.98]"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh transaction
        </button>
      </div>
    )
  }

  // ── Ready to sign ──────────────────────────────────────────────────────

  // Warn if the connected wallet doesn't match the prepared signer.
  const signerMismatch = publicKey && preparation.requiredSigner !== publicKey

  return (
    <div className={cn(
      'rounded-xl border border-[#C9A84C]/20 bg-[#0D0D14] p-4 space-y-3',
      className,
    )}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <PenLine className="h-4 w-4 text-[#C9A84C]" />
        <p className="text-sm font-medium text-[#F5F5F7]">Ready to sign</p>
      </div>

      {/* What will happen */}
      <div className="rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2.5">
        <p className="text-[11px] font-medium text-[#A0A0B2]">What this signs</p>
        <p className="mt-0.5 text-[11px] text-[#6B6B80]">
          A digital record of your fractional economic interest will be written to the
          Solana blockchain. No funds are transferred at this step.
        </p>
      </div>

      {/* Wallet info */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#4A4A60]">Signing with</span>
        <span className="font-medium text-[#A0A0B2]">{walletLabel}</span>
      </div>

      {/* Program + network */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#4A4A60]">Program</span>
        <span className="font-mono text-[#6B6B80]">{getProgramInfo(preparation.program).displayName}</span>
      </div>

      {/* Signer mismatch warning */}
      {signerMismatch && (
        <div className="flex items-start gap-2 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#F59E0B]" />
          <div className="text-[11px] text-[#F59E0B]">
            <p className="font-medium">Wrong wallet connected</p>
            <p className="mt-0.5 text-[#A07030]">
              This transaction was prepared for …{preparation.requiredSigner.slice(-8)}.
              Connect that wallet, or click Refresh below to rebuild for your current wallet.
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#F59E0B] hover:text-[#FFBF00] disabled:opacity-50"
            >
              {isRefreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Rebuild for current wallet
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !signerMismatch && (
        <div className="flex items-start gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#EF4444]" />
          <p className="text-[11px] text-[#EF4444]">{error}</p>
        </div>
      )}

      {/* Sign button */}
      <button
        type="button"
        onClick={handleSign}
        disabled={isBusy || !!signerMismatch}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] py-3 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B55A] disabled:opacity-60 active:scale-[0.98]"
      >
        {step === 'signing' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Approve in your wallet…
          </>
        ) : step === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Recording on Solana…
          </>
        ) : (
          <>
            <PenLine className="h-4 w-4" />
            Sign with {walletLabel}
          </>
        )}
      </button>

      <p className="text-[10px] leading-relaxed text-[#4A4A60]">
        Your wallet will open to confirm. No funds are transferred at this step.
        A nominal network fee (~0.000005 SOL) applies.
      </p>
    </div>
  )
}
