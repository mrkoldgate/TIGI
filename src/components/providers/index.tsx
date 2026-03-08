'use client'

import { SessionProvider } from 'next-auth/react'

// ---------------------------------------------------------------------------
// Providers — Root client provider tree.
//   M2: SessionProvider — wraps app for useSession() access ✓
//   M4: WalletAdapterProvider (Solana) — TODO
// ---------------------------------------------------------------------------

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {/* M4: <WalletAdapterProvider wallets={wallets}> */}
      {children}
    </SessionProvider>
  )
}
