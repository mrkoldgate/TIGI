import type { Metadata } from 'next'
import { Users, ShieldCheck, Clock, UserX } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Users — Admin',
  description: 'User management and KYC oversight.',
}

// ---------------------------------------------------------------------------
// /admin/users — User management
//
// MVP: Stub. Shows intended feature set with milestone markers.
// M2: User search, KYC status management, role assignment, suspension.
// M7: Full identity verification dashboard with document review.
// ---------------------------------------------------------------------------

const FEATURES = [
  { icon: Users,       label: 'User search + filter by role, KYC status, country',         milestone: 'M2'  },
  { icon: ShieldCheck, label: 'KYC document review and approve / reject workflow',           milestone: 'M2'  },
  { icon: Clock,       label: 'Account suspension, reinstatement, and audit log',            milestone: 'M2'  },
  { icon: UserX,       label: 'Identity verification document portal (Sumsub / Persona)',    milestone: 'M7'  },
]

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
          Administration
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-[#EDEDF3]">User Management</h1>
        <p className="mt-1 text-sm text-[#8E8E9C]">
          Search, verify, and manage all platform users.
        </p>
      </div>

      <AdminComingSoon
        icon={Users}
        heading="User management arrives in M2"
        description="Full user database with KYC workflow, role management, and audit trails."
        features={FEATURES}
      />
    </div>
  )
}

// Shared stub component — inline to avoid creating a shared file for stubs only
function AdminComingSoon({
  icon: Icon,
  heading,
  description,
  features,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  heading: string
  description: string
  features: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; milestone: string }[]
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#33333F] bg-[#1E1E2A] p-8">
      <div className="mx-auto max-w-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#272735] text-[#8E8E9C]">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-[#EDEDF3]">{heading}</h2>
        <p className="mt-1.5 text-sm text-[#8E8E9C]">{description}</p>

        <ul className="mt-6 space-y-3">
          {features.map(({ icon: FIcon, label, milestone }) => (
            <li key={label} className="flex items-start gap-3">
              <FIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3A3A4A]" />
              <span className="flex-1 text-sm text-[#8E8E9C]">{label}</span>
              <span className="flex items-center gap-1 rounded border border-[#33333F] bg-[#171721] px-1.5 py-0.5 text-[10px] text-[#8E8E9C]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                {milestone}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
