'use client'

import { useEffect, useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { SolanaWalletProvider } from '@/components/wallet/wallet-provider'
import { WalletModal } from '@/components/wallet/wallet-modal'

// ---------------------------------------------------------------------------
// Providers — Root client provider tree.
//   SessionProvider — wraps app for useSession() access
//   SolanaWalletProvider — Phantom/Solflare adapter + WalletModalContext
//   WalletModal — rendered once at root; opened via useWalletModal().open()
//
// SSR note: SolanaWalletProvider reads browser extension state that does not
// exist during server rendering. We defer mounting it until after hydration
// to prevent React hydration mismatches on wallet-dependent UI (e.g. the
// WalletButton and WalletModal which show different states once Phantom is
// detected in the browser).
// ---------------------------------------------------------------------------

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <SessionProvider>
      {mounted ? (
        <SolanaWalletProvider>
          {children}
          <WalletModal />
        </SolanaWalletProvider>
      ) : (
        // Render children without wallet context during SSR and first hydration.
        // Wallet-dependent components (WalletButton, WalletPreparationPanel)
        // handle walletMode === 'none' gracefully, so this is invisible to users.
        children
      )}
    </SessionProvider>
  )
}
