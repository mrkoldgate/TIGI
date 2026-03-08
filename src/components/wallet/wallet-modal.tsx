'use client'

import { useCallback, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import type { WalletName } from '@solana/wallet-adapter-base'
import { X, ExternalLink, Shield, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWalletModal } from './wallet-provider'

// ---------------------------------------------------------------------------
// WalletModal — TIGI-styled wallet selection dialog.
//
// Rendered once at the root via Providers. Opens on useWalletModal().open().
// Does NOT use @solana/wallet-adapter-react-ui — fully custom TIGI design.
//
// UX principles (solana-strategy.md §2.4):
//   - Phantom first, labeled "Recommended"
//   - Clear language: "Connect your wallet" not "link web3 wallet"
//   - Security message: "Your private key never leaves your wallet"
//   - If wallet not installed: "Get Phantom" external link
// ---------------------------------------------------------------------------

// Human-readable wallet descriptions for the modal
const WALLET_DESCRIPTIONS: Record<string, string> = {
  Phantom: 'The most popular Solana wallet — fast, safe, trusted by millions.',
  Solflare: 'Feature-rich Solana wallet with staking and DeFi built in.',
}

const WALLET_INSTALL_URLS: Record<string, string> = {
  Phantom: 'https://phantom.app',
  Solflare: 'https://solflare.com',
}

function walletErrorMessage(name: string): string {
  const map: Record<string, string> = {
    WalletWindowBlockedError: 'Pop-up blocked — allow pop-ups for this site and try again.',
    WalletWindowClosedError: 'Connection window closed.',
    WalletConnectionError: 'Connection failed. Check that your wallet is unlocked and try again.',
    WalletNotReadyError: `${name} is not installed.`,
  }
  return map[name] ?? 'Connection failed. Please try again.'
}

export function WalletModal() {
  const { isOpen, close } = useWalletModal()
  const { wallets, select, connect, connecting } = useWallet()
  const [connectingName, setConnectingName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSelectWallet = useCallback(
    async (walletName: WalletName) => {
      setError(null)
      setConnectingName(walletName)

      try {
        select(walletName)
        await connect()
        close()
      } catch (err: unknown) {
        const errName = (err as Error)?.name ?? ''
        const errMessage = (err as Error)?.message ?? ''
        // User cancelling is expected — don't show an error for it
        if (errName === 'WalletWindowClosedError' || errMessage.includes('User rejected')) {
          setError(null)
        } else {
          setError(walletErrorMessage(errName))
        }
      } finally {
        setConnectingName(null)
      }
    },
    [select, connect, close],
  )

  // Sort: installed wallets first, then not-detected
  const sortedWallets = [...wallets].sort((a, b) => {
    const order = [WalletReadyState.Installed, WalletReadyState.Loadable, WalletReadyState.NotDetected]
    return order.indexOf(a.readyState) - order.indexOf(b.readyState)
  })

  const isPhantomFirst = sortedWallets[0]?.adapter.name === 'Phantom'

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl',
            'border border-[#1E1E2A] bg-[#111118] shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          )}
          aria-describedby="wallet-modal-desc"
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-[#4A4A60] transition-colors hover:bg-[#1A1A24] hover:text-[#9999AA]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          {/* Header */}
          <div className="border-b border-[#1A1A24] px-6 pb-5 pt-6">
            <Dialog.Title className="font-heading text-lg font-bold text-white">
              Connect your wallet
            </Dialog.Title>
            <Dialog.Description id="wallet-modal-desc" className="mt-1 text-sm text-[#6B6B80]">
              Use an external wallet instead of your TIGI managed wallet.
            </Dialog.Description>
          </div>

          {/* Wallet list */}
          <div className="space-y-2 p-4">
            {sortedWallets.map((wallet, idx) => {
              const isInstalled = wallet.readyState === WalletReadyState.Installed ||
                wallet.readyState === WalletReadyState.Loadable
              const isThisConnecting = connectingName === wallet.adapter.name
              const isRecommended = idx === 0 && isPhantomFirst && wallet.adapter.name === 'Phantom'
              const description = WALLET_DESCRIPTIONS[wallet.adapter.name]
              const installUrl = WALLET_INSTALL_URLS[wallet.adapter.name]

              return (
                <div key={wallet.adapter.name}>
                  {isInstalled ? (
                    <button
                      type="button"
                      onClick={() => handleSelectWallet(wallet.adapter.name as WalletName)}
                      disabled={connecting || !!connectingName}
                      className={cn(
                        'group relative w-full rounded-xl border p-4 text-left transition-all duration-150',
                        'border-[#1E1E2A] bg-[#0E0E16] hover:border-[#2A2A3A] hover:bg-[#141420]',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        isThisConnecting && 'border-[#C9A84C]/30 bg-[#C9A84C]/5',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Wallet icon */}
                        {wallet.adapter.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={wallet.adapter.icon}
                            alt={wallet.adapter.name}
                            className="h-9 w-9 rounded-xl"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-[#1A1A24]" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {wallet.adapter.name}
                            </span>
                            {isRecommended && (
                              <span className="rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-2 py-0.5 text-[10px] font-medium text-[#C9A84C]">
                                Recommended
                              </span>
                            )}
                          </div>
                          {description && (
                            <p className="mt-0.5 truncate text-xs text-[#4A4A60]">
                              {description}
                            </p>
                          )}
                        </div>

                        {isThisConnecting ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#C9A84C]" />
                        ) : (
                          <span className="shrink-0 text-xs text-[#3A3A48] transition-colors group-hover:text-[#9999AA]">
                            Connect →
                          </span>
                        )}
                      </div>
                    </button>
                  ) : (
                    // Not installed — show install link
                    <a
                      href={installUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-3 rounded-xl border border-[#1A1A24] bg-[#0A0A0F] p-4 opacity-60 transition-opacity hover:opacity-80"
                    >
                      {wallet.adapter.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={wallet.adapter.icon}
                          alt={wallet.adapter.name}
                          className="h-9 w-9 rounded-xl grayscale"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-[#1A1A24]" />
                      )}
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#6B6B80]">
                          {wallet.adapter.name}
                        </span>
                        <p className="mt-0.5 text-xs text-[#3A3A48]">Not installed</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#3A3A48]" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Footer — security message */}
          <div className="flex items-start gap-2.5 border-t border-[#1A1A24] px-5 py-4">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4A4A60]" />
            <p className="text-[11px] leading-relaxed text-[#3A3A48]">
              Your private key never leaves your wallet — TIGI cannot access or move your funds
              without your approval.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
