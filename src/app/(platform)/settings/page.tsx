import type { Metadata } from 'next'
import { Settings } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your profile, wallet, and account preferences.',
}

// ---------------------------------------------------------------------------
// Settings Page — /settings
// M2: Profile, wallet display. M4: Wallet connect. M11: Security/2FA.
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        description="Profile, wallet, subscription, and security."
      />

      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A24] text-[#6B6B80]">
          <Settings className="h-7 w-7" />
        </div>
        <h3 className="text-h3 mb-2">Settings Coming in M2</h3>
        <p className="max-w-sm text-sm text-[#6B6B80]">
          Profile editing, avatar upload, wallet display, password management,
          and connected accounts. Part of the auth and user management milestone.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A3A] bg-[#0A0A0F] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          <span className="text-xs text-[#A0A0B2]">Milestone 2</span>
        </div>
      </div>
    </div>
  )
}
