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
//
// Session sync:
//   - On external wallet connect: persists address to DB AND updates the
//     NextAuth session so session.user.walletAddress reflects the change
//     immediately — no page reload required.
//   - On unexpected disconnect (user revokes in extension while app is open):
//     auto-calls /api/wallet/disconnect and updates session to restore
//     the custodial address.
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
  const { data: session, update: updateSession } = useSession()
  const {
    publicKey: adapterPublicKey,
    wallet:    adapterWallet,
    connected,
    connecting,
  } = useWallet()

  // Track the last key we successfully persisted to avoid duplicate requests.
  const lastSavedKey = useRef<string | null>(null)

  // Track whether the previous render had an external wallet connected,
  // so we can detect an unexpected disconnect (revoked in extension).
  const wasConnectedRef = useRef<boolean>(false)

  // ── On external wallet connect: persist + sync session ─────────────────
  useEffect(() => {
    if (!connected || !adapterPublicKey || !session?.user?.id) return

    const key = adapterPublicKey.toBase58()
    if (key === lastSavedKey.current) return // already handled this session

    lastSavedKey.current = key

    fetch('/api/wallet/connect', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        walletAddress: key,
        walletName:    adapterWallet?.adapter.name ?? 'Unknown',
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          // Sync session immediately so components see the new address
          // without requiring a page reload.
          await updateSession({ walletAddress: key })
        } else {
          console.warn('[wallet] Failed to persist connected wallet:', res.status)
        }
      })
      .catch((err) => {
        console.warn('[wallet] Failed to persist connected wallet:', err)
      })
  }, [connected, adapterPublicKey, adapterWallet, session?.user?.id, updateSession])

  // ── On unexpected disconnect: auto-restore session ──────────────────────
  // Detects the case where the adapter becomes disconnected while we were
  // in 'connected' mode — user revoked in browser extension, or extension
  // crashed. We call /api/wallet/disconnect to restore the custodial address
  // in DB and update the session, so the UI stays consistent.
  useEffect(() => {
    const wasConnected = wasConnectedRef.current
    wasConnectedRef.current = connected

    if (
      !connected &&
      wasConnected &&
      session?.user?.id &&
      lastSavedKey.current
    ) {
      // Was connected, now unexpectedly disconnected — restore custodial
      lastSavedKey.current = null // reset so re-connect works

      fetch('/api/wallet/disconnect', { method: 'POST' })
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json() as { walletAddress: string | null }
            await updateSession({ walletAddress: json.walletAddress })
          }
        })
        .catch((err) => {
          console.warn('[wallet] Failed to restore custodial on unexpected disconnect:', err)
        })
    }
  // Only re-run when connected changes — other deps would cause loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  // ── Resolve active wallet state ─────────────────────────────────────────
  const walletMode: WalletMode = (() => {
    if (connected && adapterPublicKey) return 'connected'
    if (session?.user?.walletAddress)  return 'custodial'
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
    explorerUrl:    publicKey ? getExplorerUrl(publicKey, 'address') : null,
    walletLabel,
    walletIcon:     adapterWallet?.adapter.icon ?? null,
    isConnecting:   connecting,
    isConnected:    connected,
    hasWallet:      walletMode !== 'none',
  }
}

// ---------------------------------------------------------------------------
// useWalletActions — connect/disconnect actions.
// Separated from state so components that only need actions don't re-render
// on every wallet state change.
// ---------------------------------------------------------------------------

export function useWalletActions() {
  const { select, disconnect, wallets } = useWallet()
  const { update: updateSession }       = useSession()

  const connectWallet = useCallback(
    async (walletName: string) => {
      const target = wallets.find((w) => w.adapter.name === walletName)
      if (!target) throw new Error(`Wallet "${walletName}" not registered`)

      select(target.adapter.name)
      // connect() is called after select() in the wallet modal —
      // we just select here; the modal's onSelect triggers connect().
    },
    [select, wallets],
  )

  const disconnectWallet = useCallback(async () => {
    await disconnect()

    try {
      const res = await fetch('/api/wallet/disconnect', { method: 'POST' })
      if (res.ok) {
        const json = await res.json() as { walletAddress: string | null }
        await updateSession({ walletAddress: json.walletAddress })
      }
    } catch (err) {
      console.warn('[wallet] Failed to persist disconnect:', err)
    }
  }, [disconnect, updateSession])

  return { connectWallet, disconnectWallet, availableWallets: wallets }
}
