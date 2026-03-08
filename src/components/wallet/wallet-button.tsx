'use client'

import { Loader2, Wallet, Unplug } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWalletTIGI, useWalletActions } from '@/hooks/use-tigi-wallet'
import { useWalletModal } from './wallet-provider'

// ---------------------------------------------------------------------------
// WalletButton — connect / disconnect trigger.
//
// Variants:
//   "connect"    — shown when no external wallet is connected (custodial mode)
//   "connected"  — shown with truncated address + disconnect action
//
// This button is placed inside Settings → Wallet. It can also be imported
// into any authenticated page that needs a direct connect CTA.
// It should NOT appear in the main navigation — Solana is invisible to most users.
// ---------------------------------------------------------------------------

interface WalletButtonProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline'
}

export function WalletButton({
  className,
  size = 'md',
  variant = 'outline',
}: WalletButtonProps) {
  const { walletMode, displayAddress, isConnecting, walletIcon, walletLabel } = useWalletTIGI()
  const { disconnectWallet } = useWalletActions()
  const { open: openModal } = useWalletModal()

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-5 text-base gap-2',
  }

  if (walletMode === 'connected') {
    // Connected state — show address + disconnect
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {/* Address display */}
        <div
          className={cn(
            'flex items-center rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/5',
            sizeClasses[size],
          )}
        >
          {walletIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={walletIcon} alt={walletLabel} className="h-4 w-4 rounded-sm" />
          ) : (
            <Wallet className="h-4 w-4 text-[#C9A84C]" />
          )}
          <span className="font-mono text-[#C9A84C]">{displayAddress}</span>
        </div>

        {/* Disconnect */}
        <button
          type="button"
          onClick={disconnectWallet}
          title="Disconnect wallet"
          className={cn(
            'flex items-center rounded-xl border border-[#1E1E2A] text-[#6B6B80]',
            'transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400',
            sizeClasses[size],
          )}
        >
          <Unplug className="h-4 w-4" />
          <span>Disconnect</span>
        </button>
      </div>
    )
  }

  // Connect state — trigger modal
  return (
    <button
      type="button"
      onClick={openModal}
      disabled={isConnecting}
      className={cn(
        'flex items-center rounded-xl font-medium transition-all',
        sizeClasses[size],
        variant === 'primary' && [
          'bg-[#C9A84C] text-[#0A0A0F]',
          'hover:bg-[#D4B86A] active:scale-[0.98]',
          'disabled:opacity-60',
        ],
        variant === 'outline' && [
          'border border-[#2A2A3A] bg-transparent text-[#9999AA]',
          'hover:border-[#3A3A4A] hover:text-white',
          'disabled:opacity-60',
        ],
        className,
      )}
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4" />
      )}
      {isConnecting ? 'Connecting…' : 'Connect wallet'}
    </button>
  )
}
