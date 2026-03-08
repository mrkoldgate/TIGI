import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Shield, Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { WalletDisplay } from '@/components/wallet/wallet-display'
import { WalletButton } from '@/components/wallet/wallet-button'

export const metadata: Metadata = {
  title: 'Wallet — Settings',
  description: 'Manage your TIGI wallet and external wallet connections.',
}

// ---------------------------------------------------------------------------
// /settings/wallet — Wallet management page.
//
// Sections:
//   1. Current wallet — WalletDisplay (custodial or connected)
//   2. External wallet — WalletButton (connect / disconnect)
//   3. Custodial explanation — what it is, how it works
//   4. Devnet notice — until mainnet is live
// ---------------------------------------------------------------------------

export default async function WalletSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { walletAddress: true, kycStatus: true },
  })

  const custodialWallet = await prisma.custodialWallet.findUnique({
    where: { userId: session.user.id },
    select: { publicKey: true },
  })

  const hasCustodialWallet = !!custodialWallet?.publicKey
  const walletAddress = user?.walletAddress ?? null
  const isExternalConnected =
    hasCustodialWallet && walletAddress !== custodialWallet?.publicKey

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Wallet"
        description="Your on-chain identity for tokenized real estate transactions."
      />

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Current wallet */}
        <section>
          <SectionLabel>Active wallet</SectionLabel>
          <div className="rounded-2xl border border-[#1E1E2A] bg-[#111118] p-5">
            <WalletDisplay size="lg" showDetails />
          </div>
        </section>

        {/* External wallet connection */}
        <section>
          <SectionLabel>External wallet</SectionLabel>
          <div className="rounded-2xl border border-[#1E1E2A] bg-[#111118] p-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-white">
                {isExternalConnected ? 'Connected wallet' : 'Connect your own wallet'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B6B80]">
                {isExternalConnected
                  ? 'Your Phantom or Solflare wallet is active. Disconnect to return to your platform-managed wallet.'
                  : 'Use Phantom or Solflare to control your own keys. Your platform wallet is preserved and restored on disconnect.'}
              </p>
            </div>
            <WalletButton size="md" variant="outline" />
          </div>
        </section>

        {/* Custodial explanation */}
        <section>
          <SectionLabel>How your platform wallet works</SectionLabel>
          <div className="rounded-2xl border border-[#1E1E2A] bg-[#111118] p-5 space-y-4">
            <ExplainerRow
              icon={Shield}
              title="Managed for you"
              body="TIGI automatically creates a Solana wallet when you sign up. You don't need a browser extension to buy, sell, or hold tokenized property titles."
            />
            <ExplainerRow
              icon={Info}
              title="Self-custody upgrade"
              body="Power users can connect an external wallet at any time. Your platform wallet stays intact and becomes active again when you disconnect."
            />
          </div>
        </section>

        {/* Devnet notice */}
        <div className="flex items-start gap-3 rounded-xl border border-[#2A2A3A] bg-[#0A0A0F] px-4 py-3">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <p className="text-xs leading-relaxed text-[#6B6B80]">
            <span className="font-medium text-[#9999AA]">Devnet active.</span>{' '}
            All wallets and transactions are on Solana Devnet. No real assets are involved.
            Mainnet will go live with the tokenization module.
          </p>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#4A4A60]">
      {children}
    </p>
  )
}

function ExplainerRow({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2A2A3A] bg-[#1A1A24]">
        <Icon className="h-4 w-4 text-[#6B6B80]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#CCCCDD]">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#6B6B80]">{body}</p>
      </div>
    </div>
  )
}
