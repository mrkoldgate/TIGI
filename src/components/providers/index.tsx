'use client'

// ---------------------------------------------------------------------------
// Providers — Root client provider tree.
// Add providers here as they're integrated:
//   M2: SessionProvider (NextAuth)
//   M4: WalletAdapterProvider (Solana)
//   Post-MVP: ThirdParty analytics, etc.
// ---------------------------------------------------------------------------

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // M2: Wrap with <SessionProvider session={session}>
  // M4: Wrap with <WalletAdapterProvider wallets={wallets}>
  return <>{children}</>
}
