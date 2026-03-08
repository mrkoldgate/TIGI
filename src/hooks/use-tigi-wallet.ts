'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSession } from 'next-auth/react'
import { truncateAddress, getExplorerUrl } from '@/lib/solana/client'

// ---------------------------------------------------------------------------
// useWalletTIGI — unified wallet abstraction for TIGI.
//
// Resolves the active wallet from two possible sources:
//   1. Connected wallet (Phantom/Solflare via wallet adapter) — Tier 2
//   2. Custodial wallet (server-managed — from session.user.walletAddress) — Tier 1
//
// Components should use this hook, not useWallet() directly, so that the
// custodial/connected distinction stays contained here.
//
// UX language follows solana-strategy.md §2.4:
//   - Custodial → "TIGI Managed Wallet" (never say "custodial")
//   - Connected → wallet name ("Phantom", "Solflare")
// ---------------------------------------------------------------------------

export type WalletMode = 'custodial' | 'connected' | 'none'

export interface TigiWalletState {
  /** Whether the user has a custodial or connected wallet (or neither yet) */
  walletMode: WalletMode

  /** Active wallet public key — custodial or connected, whichever is active */
  publicKey: string | null

  /** Truncated address for display (e.g. "7xKd...aF2g") */
  displayAddress: string | null

  /** Solana Explorer URL for the active address */
  explorerUrl: string | null

  /** Human-readable wallet label ("TIGI Managed Wallet" | "Phantom" | "Solflare") */
  walletLabel: string

  /** Wallet icon URL (null for custodial) */
  walletIcon: string | null

  /** True while the wallet adapter is establishing a connection */
  isConnecting: boolean

  /** True if a connected wallet is active (adapter is connected) */
  isConnected: boolean

  /** True if user has any wallet (custodial always gives true after registration) */
  hasWallet: boolean
}

export function useWalletTIGI(): TigiWalletState {
  const { data: session } = useSession()
  const {
    publicKey: adapterPublicKey,
    wallet: adapterWallet,
    connected,
    connecting,
  } = useWallet()

  // After connecting, persist the external wallet address to the DB.
  // This runs once per new public key.
  const lastSavedKey = useRef<string | null>(null)

  useEffect(() => {
    if (!connected || !adapterPublicKey || !session?.user?.id) return
    const key = adapterPublicKey.toBase58()
    if (key === lastSavedKey.current) return // already saved this session

    lastSavedKey.current = key

    fetch('/api/wallet/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: key,
        walletName: adapterWallet?.adapter.name ?? 'Unknown',
      }),
    }).catch((err) => {
      console.warn('[wallet] Failed to persist connected wallet:', err)
    })
  }, [connected, adapterPublicKey, adapterWallet, session?.user?.id])

  // Determine the active wallet mode
  const walletMode: WalletMode = (() => {
    if (connected && adapterPublicKey) return 'connected'
    if (session?.user?.walletAddress) return 'custodial'
    return 'none'
  })()

  const publicKey =
    walletMode === 'connected'
      ? adapterPublicKey!.toBase58()
      : session?.user?.walletAddress ?? null

  const walletLabel = (() => {
    if (walletMode === 'connected') return adapterWallet?.adapter.name ?? 'Wallet'
    if (walletMode === 'custodial') return 'TIGI Managed Wallet'
    return 'No wallet'
  })()

  return {
    walletMode,
    publicKey,
    displayAddress: publicKey ? truncateAddress(publicKey) : null,
    explorerUrl: publicKey ? getExplorerUrl(publicKey, 'address') : null,
    walletLabel,
    walletIcon: adapterWallet?.adapter.icon ?? null,
    isConnecting: connecting,
    isConnected: connected,
    hasWallet: walletMode !== 'none',
  }
}

// ---------------------------------------------------------------------------
// useWalletActions — connect/disconnect actions.
// Separated from state so components that only need actions don't re-render
// on every wallet state change.
// ---------------------------------------------------------------------------

export function useWalletActions() {
  const { select, connect, disconnect, wallets } = useWallet()
  const { data: session, update: updateSession } = useSession()

  const connectWallet = useCallback(
    async (walletName: string) => {
      const target = wallets.find((w) => w.adapter.name === walletName)
      if (!target) throw new Error(`Wallet "${walletName}" not registered`)

      select(target.adapter.name)
      // connect() is called after select() in the wallet modal
      // so we just select here — modal's onSelect triggers connect()
    },
    [select, wallets],
  )

  const disconnectWallet = useCallback(async () => {
    await disconnect()

    try {
      const res = await fetch('/api/wallet/disconnect', { method: 'POST' })
      if (res.ok) {
        const { walletAddress } = await res.json()
        await updateSession({ walletAddress })
      }
    } catch (err) {
      console.warn('[wallet] Failed to persist disconnect:', err)
    }
  }, [disconnect, updateSession])

  return { connectWallet, disconnectWallet, availableWallets: wallets }
}
