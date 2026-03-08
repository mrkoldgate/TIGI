import Link from 'next/link'
import { ShieldCheck, Clock, ShieldOff } from 'lucide-react'
import {
  type RecentUser,
  type UserKycStatus,
  type UserRole,
  type AdminPlatformStats,
  formatAdminRelative,
} from '@/lib/admin/mock-admin-data'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// UserSummary — User metrics + recent registrations panel.
//
// Split layout:
//   Top:    4 compact user KPI tiles (total, verified, pending KYC, new this week)
//   Bottom: mini table of the 5 most recent registrations
//
// Source: ADMIN_PLATFORM_STATS + MOCK_RECENT_USERS in MVP.
// DB path: prisma counts + prisma.user.findMany({ orderBy: createdAt, take: 5 })
// ---------------------------------------------------------------------------

const KYC_CONFIG: Record<UserKycStatus, { icon: React.ElementType; color: string; label: string }> = {
  VERIFIED:   { icon: ShieldCheck, color: 'text-[#4ADE80]', label: 'Verified'   },
  PENDING:    { icon: Clock,       color: 'text-[#F59E0B]', label: 'Pending'    },
  UNVERIFIED: { icon: ShieldOff,   color: 'text-[#6B6B80]', label: 'Unverified' },
}

const ROLE_COLORS: Record<UserRole, string> = {
  INVESTOR:     'text-[#818CF8]',
  BUYER:        'text-[#A0A0B2]',
  OWNER:        'text-[#C9A84C]',
  PROFESSIONAL: 'text-[#4ADE80]',
  ADMIN:        'text-[#EF4444]',
}

interface UserKpiTileProps {
  label: string
  value: number | string
  sub?: string
  accent?: string
}

function UserKpiTile({ label, value, sub, accent }: UserKpiTileProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-[#1F1F2E] bg-[#0D0D14] p-3">
      <p className={cn('font-heading text-xl font-semibold tabular-nums', accent ?? 'text-[#F5F5F7]')}>
        {value}
      </p>
      <p className="text-[11px] text-[#6B6B80]">{label}</p>
      {sub && <p className="text-[10px] text-[#4A4A5E]">{sub}</p>}
    </div>
  )
}

interface UserSummaryProps {
  stats: AdminPlatformStats
  recentUsers: RecentUser[]
}

export function UserSummary({ stats, recentUsers }: UserSummaryProps) {
  const verifiedPct =
    stats.totalUsers > 0
      ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
      : 0

  return (
    <div className="space-y-4">
      {/* KPI tile row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <UserKpiTile
          label="Total users"
          value={stats.totalUsers.toLocaleString()}
        />
        <UserKpiTile
          label="KYC verified"
          value={stats.verifiedUsers.toLocaleString()}
          sub={`${verifiedPct}% of total`}
          accent="text-[#4ADE80]"
        />
        <UserKpiTile
          label="Pending KYC"
          value={stats.pendingKycUsers}
          accent={stats.pendingKycUsers > 20 ? 'text-[#F59E0B]' : undefined}
        />
        <UserKpiTile
          label="New this week"
          value={`+${stats.newUsersLast7d}`}
          accent="text-[#818CF8]"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1F1F2E]" />

      {/* Recent registrations */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
          Recent Registrations
        </p>
        <div className="space-y-1">
          {recentUsers.map((user) => {
            const kyc = KYC_CONFIG[user.kycStatus]
            const KycIcon = kyc.icon

            return (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[#111118]"
              >
                {/* Avatar */}
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#1A1A24] text-[11px] font-semibold text-[#6B6B80]">
                  {user.initials}
                </div>

                {/* Name + role */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#F5F5F7]">{user.name}</p>
                  <p className={cn('text-[10px]', ROLE_COLORS[user.role])}>{user.role}</p>
                </div>

                {/* Country */}
                <span className="hidden text-[11px] text-[#4A4A5E] sm:block">{user.country}</span>

                {/* KYC */}
                <KycIcon className={cn('h-3.5 w-3.5 flex-shrink-0', kyc.color)} title={kyc.label} />

                {/* Time */}
                <span className="w-12 flex-shrink-0 text-right text-[11px] text-[#4A4A5E]">
                  {formatAdminRelative(user.joinedAt)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer link */}
      <Link
        href="/admin/users"
        className="flex items-center gap-1 text-xs text-[#6B6B80] transition-colors hover:text-[#C9A84C]"
      >
        Manage all users →
      </Link>
    </div>
  )
}
