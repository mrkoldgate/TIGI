'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl } from '@solana/web3.js'
import type { WalletError } from '@solana/wallet-adapter-base'

// ---------------------------------------------------------------------------
// Wallet Modal Context
// Allows any component to open the wallet selection modal via useWalletModal().
// ---------------------------------------------------------------------------

interface WalletModalContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const WalletModalContext = createContext<WalletModalContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
})

export function useWalletModal(): WalletModalContextValue {
  return useContext(WalletModalContext)
}

// ---------------------------------------------------------------------------
// SolanaWalletProvider
// Wraps the app with ConnectionProvider + WalletProvider + modal context.
// Registered wallets: Phantom (primary) + Solflare.
// autoConnect is false — TIGI uses custodial by default; external wallet
// connect is explicit (Settings → Wallet).
// ---------------------------------------------------------------------------

interface SolanaWalletProviderProps {
  children: React.ReactNode
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const network: WalletAdapterNetwork =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta'
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet

  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      clusterApiUrl(network),
    [network],
  )

  // Adapters instantiated once — memoized to prevent re-creation on re-render.
  // Phantom is listed first (recommended wallet for TIGI).
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network],
  )

  // Map adapter errors to human-readable messages (logged, not thrown)
  const handleWalletError = useCallback((error: WalletError) => {
    // Wallet errors are expected (user rejected, closed popup, etc.) — don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('[wallet]', error.name, error.message)
    }
  }, [])

  const modalContextValue = useMemo<WalletModalContextValue>(
    () => ({
      isOpen: isModalOpen,
      open: () => setIsModalOpen(true),
      close: () => setIsModalOpen(false),
    }),
    [isModalOpen],
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
        onError={handleWalletError}
      >
        <WalletModalContext.Provider value={modalContextValue}>
          {children}
        </WalletModalContext.Provider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
