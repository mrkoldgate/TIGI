'use client'

// ---------------------------------------------------------------------------
// DevOpportunityPanel — Structured development opportunity display.
//
// Variants:
//   'compact'  — badge + bullet highlights (action panel sidebar)
//   'full'     — complete breakdown (ZoningTab, detail page)
// ---------------------------------------------------------------------------

import { Check, Zap, AlertCircle, Building2, Plug, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DevOpportunity } from '@/lib/terra/terra-types'
import { DEV_STAGE_CONFIG } from '@/lib/terra/terra-types'

// ── Stage badge ─────────────────────────────────────────────────────────────

export function DevStageBadge({ stage }: { stage: DevOpportunity['stage'] }) {
  const cfg = DEV_STAGE_CONFIG[stage]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border',
      cfg.color, cfg.bg, cfg.border,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.bg.replace('/10', ''))} />
      {cfg.label}
    </span>
  )
}

// ── Compact panel (action sidebar) ──────────────────────────────────────────

interface DevOpportunityPanelProps {
  opportunity: DevOpportunity
  variant?:    'compact' | 'full'
}

export function DevOpportunityPanel({ opportunity, variant = 'compact' }: DevOpportunityPanelProps) {
  if (variant === 'full') return <DevOpportunityFull opp={opportunity} />
  return <DevOpportunityCompact opp={opportunity} />
}

function DevOpportunityCompact({ opp }: { opp: DevOpportunity }) {
  const cfg = DEV_STAGE_CONFIG[opp.stage]

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-4">
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-400/[0.06] blur-[30px]" aria-hidden="true" />
      <div className="relative mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Development Opportunity
          </span>
        </div>
        <span className={cn(
          'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
          cfg.color, cfg.border, cfg.bg,
        )}>
          {cfg.label}
        </span>
      </div>

      {/* Top highlights */}
      {opp.highlights.slice(0, 4).map((h) => (
        <div key={h} className="mb-1.5 flex items-start gap-2 text-xs text-zinc-400">
          <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
          {h}
        </div>
      ))}

      {/* Key metrics chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {opp.utilitiesAvailable.map((u) => (
          <span key={u} className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-500">
            {u}
          </span>
        ))}
      </div>

      <p className="relative mt-3 text-[10px] leading-relaxed text-zinc-600">
        {cfg.description} Verify entitlement status with local planning authority.
      </p>
    </div>
  )
}

// ── Full panel (detail tab) ──────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-emerald-400" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">{title}</p>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-right text-xs font-medium text-white">{value}</span>
    </div>
  )
}

function DevOpportunityFull({ opp }: { opp: DevOpportunity }) {
  const cfg = DEV_STAGE_CONFIG[opp.stage]

  return (
    <div className="space-y-5">

      {/* Stage header */}
      <div className={cn(
        'flex items-center justify-between rounded-xl border p-4',
        cfg.border, cfg.bg,
      )}>
        <div>
          <p className={cn('font-heading text-lg font-bold', cfg.color)}>{cfg.label}</p>
          <p className="text-sm text-zinc-500">{cfg.description}</p>
        </div>
        <Zap className={cn('h-6 w-6', cfg.color)} />
      </div>

      {/* Highlights */}
      {opp.highlights.length > 0 && (
        <Section icon={Check} title="Development Highlights">
          <ul className="space-y-2">
            {opp.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-zinc-400">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                {h}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Zoning */}
      <Section icon={Building2} title="Zoning &amp; Entitlements">
        {opp.zoningDescription && (
          <p className="mb-4 text-sm leading-relaxed text-zinc-400">{opp.zoningDescription}</p>
        )}
        <div className="divide-y divide-white/[0.06]">
          <InfoRow label="Entitlement status" value={opp.entitlementStatus} />
          <InfoRow label="Max buildable units" value={opp.maxBuildableUnits ? String(opp.maxBuildableUnits) : null} />
          <InfoRow label="Max floor area ratio" value={opp.maxFloorAreaRatio ? `${opp.maxFloorAreaRatio}:1` : null} />
          <InfoRow label="Height limit" value={opp.heightLimitFt ? `${opp.heightLimitFt} ft` : null} />
          <InfoRow label="Environmental status" value={opp.environmentalStatus} />
        </div>
        {opp.permitsAvailable.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Permits Available
            </p>
            {opp.permitsAvailable.map((p) => (
              <div key={p} className="flex items-center gap-2 text-xs text-zinc-400">
                <FileCheck className="h-3 w-3 shrink-0 text-emerald-400" />
                {p}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Infrastructure */}
      <Section icon={Plug} title="Infrastructure">
        <div className="divide-y divide-white/[0.06]">
          <InfoRow label="Road access"   value={opp.roadAccess ? `Yes — ${opp.roadType ?? 'see listing'}` : 'No direct access'} />
          <InfoRow label="Topography"    value={opp.topography} />
          <InfoRow label="Flood zone"    value={opp.floodZone} />
        </div>
        {opp.utilitiesAvailable.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Utilities at Site
            </p>
            <div className="flex flex-wrap gap-1.5">
              {opp.utilitiesAvailable.map((u) => (
                <span key={u} className="rounded border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] text-emerald-400">
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Financing notes */}
      {opp.financingNotes && (
        <Section icon={AlertCircle} title="Financing Notes">
          <p className="text-sm leading-relaxed text-zinc-500">
            {opp.financingNotes}
          </p>
        </Section>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-white/[0.08] px-3 py-2.5">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-600" />
        <p className="text-[10px] leading-relaxed text-zinc-600">
          Development information is provided for informational purposes only and is subject to change.
          Verify all zoning, permits, and entitlements with local authorities before making investment decisions.
          Crowdfunding and development financing structures require regulatory compliance — consult legal counsel.
        </p>
      </div>
    </div>
  )
}
