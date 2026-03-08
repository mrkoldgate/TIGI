'use client'

import { SessionProvider } from 'next-auth/react'
import { SolanaWalletProvider } from '@/components/wallet/wallet-provider'
import { WalletModal } from '@/components/wallet/wallet-modal'

// ---------------------------------------------------------------------------
// Providers — Root client provider tree.
//   SessionProvider — wraps app for useSession() access
//   SolanaWalletProvider — Phantom/Solflare adapter + WalletModalContext
//   WalletModal — rendered once at root; opened via useWalletModal().open()
// ---------------------------------------------------------------------------

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SolanaWalletProvider>
        {children}
        <WalletModal />
      </SolanaWalletProvider>
    </SessionProvider>
  )
}
