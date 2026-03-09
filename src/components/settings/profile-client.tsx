'use client'

// ---------------------------------------------------------------------------
// ProfileClient — editable user profile settings.
//
// Sections:
//   1. Avatar — initials-based placeholder + upload slot (future)
//   2. Personal info — name, phone, location, bio (PATCH /api/settings/profile)
//   3. Account info — email (read-only), subscription tier, KYC status (links)
//   4. Notification preferences — toggles persisted via same PATCH endpoint
//   5. Wallet — read-only summary with link to /settings/wallet
//
// Avatar upload is UI-ready but wired to a placeholder until file storage
// (S3 / Cloudflare R2) is activated in M10+.
// ---------------------------------------------------------------------------

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  CreditCard,
  Wallet,
  Bell,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
} from '@/lib/settings/notification-prefs'
import { AvatarUploadButton } from './avatar-upload-button'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProfileClientProps {
  user: {
    id:             string
    name:           string | null
    email:          string
    phone:          string | null
    location:       string | null
    bio:            string | null
    avatarUrl:      string | null
    kycStatus:      string
    subscriptionTier: string
    walletAddress:  string | null
    notificationPrefs: NotificationPrefs
  }
}

// ── Constants ──────────────────────────────────────────────────────────────

const KYC_LABEL: Record<string, string> = {
  NONE:      'Not submitted',
  PENDING:   'Pending review',
  SUBMITTED: 'In review',
  VERIFIED:  'Verified',
  REJECTED:  'Rejected',
}
const KYC_COLOR: Record<string, string> = {
  NONE:      'text-[#6B6B80]',
  PENDING:   'text-[#F59E0B]',
  SUBMITTED: 'text-[#F59E0B]',
  VERIFIED:  'text-[#4ADE80]',
  REJECTED:  'text-[#EF4444]',
}
const TIER_COLOR: Record<string, string> = {
  free:       'text-[#6B6B80]',
  pro:        'text-[#C9A84C]',
  pro_plus:   'text-[#818CF8]',
  enterprise: 'text-[#22C55E]',
}
const TIER_LABEL: Record<string, string> = {
  free:       'Free',
  pro:        'Pro',
  pro_plus:   'Pro+',
  enterprise: 'Enterprise',
}

// ── Root ───────────────────────────────────────────────────────────────────

export function ProfileClient({ user }: ProfileClientProps) {
  const [name, setName]         = useState(user.name ?? '')
  const [phone, setPhone]       = useState(user.phone ?? '')
  const [location, setLocation] = useState(user.location ?? '')
  const [bio, setBio]           = useState(user.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl)

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(user.notificationPrefs)

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg]   = useState('')
  const [isPending, startTransition] = useTransition()

  const initials = (user.name ?? user.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  async function handleSaveProfile() {
    setSaveState('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:              name.trim() || undefined,
          phone:             phone.trim() || null,
          location:          location.trim() || null,
          bio:               bio.trim() || null,
          notificationPrefs: notifPrefs,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Save failed')
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch (err) {
      setErrorMsg((err as Error).message)
      setSaveState('error')
    }
  }

  function toggleNotifPref(key: keyof NotificationPrefs) {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaveState('idle') // Reset saved state when prefs change
  }

  return (
    <div className="space-y-8 pb-16">

      {/* ── Avatar + identity strip ─────────────────────────────────────── */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <AvatarDisplay initials={initials} avatarUrl={avatarUrl} />
          <AvatarUploadButton onAvatarChange={setAvatarUrl} />
        </div>
        <div>
          <p className="text-base font-semibold text-[#F5F5F7]">{user.name ?? 'Anonymous'}</p>
          <p className="text-sm text-[#6B6B80]">{user.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={cn('text-xs font-medium', TIER_COLOR[user.subscriptionTier] ?? 'text-[#6B6B80]')}>
              {TIER_LABEL[user.subscriptionTier] ?? user.subscriptionTier}
            </span>
            <span className="text-[#3A3A4A]">·</span>
            <span className={cn('text-xs font-medium', KYC_COLOR[user.kycStatus] ?? 'text-[#6B6B80]')}>
              {KYC_LABEL[user.kycStatus] ?? user.kycStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ── Personal info ────────────────────────────────────────────────── */}
      <SectionCard title="Personal Information">
        <div className="space-y-4">
          <FieldRow
            label="Full name"
            icon={User}
            required
          >
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaveState('idle') }}
              placeholder="Your full name"
              maxLength={80}
              className={inputClass}
            />
          </FieldRow>

          <FieldRow label="Phone" icon={Phone}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSaveState('idle') }}
              placeholder="+1 (555) 000-0000"
              className={inputClass}
            />
          </FieldRow>

          <FieldRow label="Location" icon={MapPin}>
            <input
              type="text"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setSaveState('idle') }}
              placeholder="City, State or Country"
              maxLength={80}
              className={inputClass}
            />
          </FieldRow>

          <FieldRow label="Bio" icon={FileText} align="top">
            <textarea
              value={bio}
              onChange={(e) => { setBio(e.target.value); setSaveState('idle') }}
              placeholder="A short introduction (optional)"
              maxLength={500}
              rows={3}
              className={cn(inputClass, 'resize-none leading-relaxed')}
            />
            {bio.length > 400 && (
              <p className="mt-1 text-right text-[10px] text-[#6B6B80]">{bio.length}/500</p>
            )}
          </FieldRow>
        </div>
      </SectionCard>

      {/* ── Notification preferences ─────────────────────────────────────── */}
      <SectionCard title="Notification Preferences">
        <div className="space-y-1">
          <NotifToggle
            label="Inquiry notifications"
            description="Email when someone inquires about your listing or contacts you"
            enabled={notifPrefs.emailInquiries}
            onToggle={() => toggleNotifPref('emailInquiries')}
          />
          <NotifToggle
            label="Listing status updates"
            description="Email when your listing review status changes"
            enabled={notifPrefs.emailListingUpdates}
            onToggle={() => toggleNotifPref('emailListingUpdates')}
          />
          <NotifToggle
            label="Token & investment updates"
            description="Email when investment intents or token activity occurs"
            enabled={notifPrefs.emailTokenUpdates}
            onToggle={() => toggleNotifPref('emailTokenUpdates')}
          />
          <NotifToggle
            label="Product announcements"
            description="Occasional emails about new features and platform updates"
            enabled={notifPrefs.emailMarketing}
            onToggle={() => toggleNotifPref('emailMarketing')}
          />
          <NotifToggle
            label="In-app notifications"
            description="Show notification dot and feed for platform activity"
            enabled={notifPrefs.inAppAll}
            onToggle={() => toggleNotifPref('inAppAll')}
          />
        </div>
      </SectionCard>

      {/* ── Account links ────────────────────────────────────────────────── */}
      <SectionCard title="Account">
        <div className="space-y-2">
          {/* Email — not editable */}
          <div className="flex items-center gap-3 rounded-xl border border-[#1E1E2A] bg-[#0D0D14] px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-[#4A4A5E]" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#6B6B80]">Email address</p>
              <p className="truncate text-sm text-[#A0A0B2]">{user.email}</p>
            </div>
            <span className="shrink-0 text-[10px] text-[#4A4A5E]">Managed by auth</span>
          </div>

          {/* KYC status */}
          <AccountLink
            href="/settings/kyc"
            icon={ShieldCheck}
            label="Identity Verification"
            value={KYC_LABEL[user.kycStatus] ?? user.kycStatus}
            valueColor={KYC_COLOR[user.kycStatus]}
          />

          {/* Subscription */}
          <AccountLink
            href="/settings/billing"
            icon={CreditCard}
            label="Plan & Billing"
            value={TIER_LABEL[user.subscriptionTier] ?? user.subscriptionTier}
            valueColor={TIER_COLOR[user.subscriptionTier]}
          />

          {/* Wallet */}
          <AccountLink
            href="/settings/wallet"
            icon={Wallet}
            label="Wallet"
            value={
              user.walletAddress
                ? `${user.walletAddress.slice(0, 6)}…${user.walletAddress.slice(-4)}`
                : 'Platform-managed'
            }
            valueColor="text-[#6B6B80]"
          />
        </div>
      </SectionCard>

      {/* ── Save bar ────────────────────────────────────────────────────── */}
      <div className="sticky bottom-6 flex justify-end">
        <div className="flex items-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#111118]/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          {saveState === 'error' && (
            <p className="text-xs text-[#EF4444]">{errorMsg || 'Save failed'}</p>
          )}
          {saveState === 'saved' && (
            <span className="flex items-center gap-1.5 text-xs text-[#4ADE80]">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <button
            onClick={() => startTransition(handleSaveProfile)}
            disabled={saveState === 'saving' || isPending}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
              'bg-[#C9A84C] text-[#0A0A0F] transition-all',
              'hover:bg-[#D4B85A] disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {(saveState === 'saving' || isPending) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Avatar ─────────────────────────────────────────────────────────────────

function AvatarDisplay({
  initials,
  avatarUrl,
}: {
  initials: string
  avatarUrl: string | null
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt="Avatar"
        className="h-16 w-16 rounded-2xl object-cover border border-[#2A2A3A]"
      />
    )
  }
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2A2A3A] bg-[#1A1A24]">
      <span className="text-xl font-semibold text-[#C9A84C]">{initials || '?'}</span>
    </div>
  )
}

// ── Section card ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#4A4A60]">
        {title}
      </p>
      <div className="rounded-2xl border border-[#1E1E2A] bg-[#111118] p-5">
        {children}
      </div>
    </div>
  )
}

// ── Field row ──────────────────────────────────────────────────────────────

const inputClass = cn(
  'w-full rounded-xl border border-[#2A2A3A] bg-[#0D0D14]',
  'px-3 py-2.5 text-sm text-[#F5F5F7] placeholder-[#4A4A5E]',
  'outline-none transition-colors focus:border-[#C9A84C]/60',
)

function FieldRow({
  label,
  icon: Icon,
  children,
  required,
  align = 'center',
}: {
  label: string
  icon: React.ElementType
  children: React.ReactNode
  required?: boolean
  align?: 'center' | 'top'
}) {
  return (
    <div className={cn('flex gap-3', align === 'top' ? 'items-start' : 'items-center')}>
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2A2A3A] bg-[#1A1A24]',
          align === 'top' && 'mt-0.5',
        )}
      >
        <Icon className="h-4 w-4 text-[#6B6B80]" />
      </div>
      <div className="flex-1 min-w-0">
        <label className="mb-1 block text-xs text-[#6B6B80]">
          {label}
          {required && <span className="ml-0.5 text-[#C9A84C]">*</span>}
        </label>
        {children}
      </div>
    </div>
  )
}

// ── Notification toggle ────────────────────────────────────────────────────

function NotifToggle({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="flex cursor-pointer items-start justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-[#0D0D14]"
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
          <Bell className="h-3.5 w-3.5 text-[#4A4A5E]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#D0D0E0]">{label}</p>
          <p className="mt-0.5 text-xs text-[#6B6B80]">{description}</p>
        </div>
      </div>
      {/* Toggle pill */}
      <button
        role="switch"
        aria-checked={enabled}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
          enabled ? 'bg-[#C9A84C]' : 'bg-[#2A2A3A]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            enabled ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

// ── Account link ───────────────────────────────────────────────────────────

function AccountLink({
  href,
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  href: string
  icon: React.ElementType
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-[#1E1E2A] bg-transparent px-4 py-3 transition-colors hover:border-[#2A2A3A] hover:bg-[#0D0D14]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2A2A3A] bg-[#1A1A24]">
        <Icon className="h-3.5 w-3.5 text-[#6B6B80]" />
      </div>
      <p className="flex-1 text-sm text-[#A0A0B2]">{label}</p>
      <span className={cn('text-xs font-medium', valueColor ?? 'text-[#6B6B80]')}>{value}</span>
      <ChevronRight className="h-3.5 w-3.5 text-[#3A3A4A]" />
    </Link>
  )
}
