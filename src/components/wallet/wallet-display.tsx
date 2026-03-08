'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Check, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWalletTIGI } from '@/hooks/use-tigi-wallet'

// ---------------------------------------------------------------------------
// WalletDisplay — shows active wallet address with copy + explorer link.
// Used in Settings → Wallet page and as a compact version in TopNav.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Full display — for settings page
// ---------------------------------------------------------------------------

interface WalletDisplayProps {
  className?: string
}

export function WalletDisplay({ className }: WalletDisplayProps) {
  const { walletMode, publicKey, displayAddress, explorerUrl, walletLabel, walletIcon } =
    useWalletTIGI()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!publicKey) return
    navigator.clipboard.writeText(publicKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!publicKey) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-[#1E1E2A] bg-[#0E0E16] p-4',
          className,
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A1A24]">
          <Shield className="h-4 w-4 text-[#3A3A48]" />
        </div>
        <div>
          <p className="text-sm text-[#4A4A60]">No wallet available</p>
          <p className="text-xs text-[#3A3A48]">Account setup may still be in progress</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-[#0E0E16] p-4',
        walletMode === 'connected'
          ? 'border-[#C9A84C]/20'
          : 'border-[#1E1E2A]',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        {walletMode === 'connected' && walletIcon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={walletIcon} alt={walletLabel} className="h-9 w-9 rounded-xl" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/10">
            <Shield className="h-4 w-4 text-[#C9A84C]" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{walletLabel}</span>
            {walletMode === 'custodial' && (
              <span className="rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/8 px-2 py-0.5 text-[10px] font-medium text-[#C9A84C]">
                Managed
              </span>
            )}
            {walletMode === 'connected' && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                Connected
              </span>
            )}
          </div>
          {/* Full address in monospace */}
          <p className="mt-1 truncate font-mono text-xs text-[#4A4A60]">{displayAddress}</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy address"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4A4A60] transition-colors hover:bg-[#1A1A24] hover:text-[#9999AA]"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Solana Explorer"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4A4A60] transition-colors hover:bg-[#1A1A24] hover:text-[#9999AA]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// WalletStatusBadge — compact indicator for TopNav / sidebar
// Shows a green dot if connected, gold managed indicator if custodial
// ---------------------------------------------------------------------------

interface WalletStatusBadgeProps {
  className?: string
  showAddress?: boolean
}

export function WalletStatusBadge({ className, showAddress = true }: WalletStatusBadgeProps) {
  const { walletMode, displayAddress, walletIcon, walletLabel } = useWalletTIGI()

  if (walletMode === 'none') return null

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-[#1E1E2A] bg-[#111118] px-2.5 py-1.5',
        className,
      )}
      title={walletLabel}
    >
      {walletMode === 'connected' && walletIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={walletIcon} alt={walletLabel} className="h-4 w-4 rounded-sm" />
      ) : (
        <Shield className="h-3 w-3 text-[#C9A84C]" />
      )}
      {showAddress && (
        <span className="font-mono text-[11px] text-[#6B6B80]">{displayAddress}</span>
      )}
      {walletMode === 'connected' && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-label="Connected" />
      )}
    </div>
  )
}
