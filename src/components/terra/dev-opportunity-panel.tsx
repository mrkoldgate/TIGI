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
    <div className="rounded-xl border border-[#22C55E]/25 bg-[#0D110D] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-[#4ADE80]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4ADE80]">
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
        <div key={h} className="mb-1.5 flex items-start gap-2 text-xs text-[#8A9E8A]">
          <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#4ADE80]" />
          {h}
        </div>
      ))}

      {/* Key metrics chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {opp.utilitiesAvailable.map((u) => (
          <span key={u} className="rounded border border-[#1E2D1E] bg-[#111A11] px-2 py-0.5 text-[10px] text-[#5A7060]">
            {u}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-[#4A6A4A]">
        {cfg.description} Verify entitlement status with local planning authority.
      </p>
    </div>
  )
}

// ── Full panel (detail tab) ──────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1E2D1E] bg-[#0D110D] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#4ADE80]" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#4A6A4A]">{title}</p>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#1A2D1A] py-2 last:border-0">
      <span className="text-xs text-[#5A7060]">{label}</span>
      <span className="text-right text-xs font-medium text-[#E8F0E8]">{value}</span>
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
          <p className="text-sm text-[#5A7060]">{cfg.description}</p>
        </div>
        <Zap className={cn('h-6 w-6', cfg.color)} />
      </div>

      {/* Highlights */}
      {opp.highlights.length > 0 && (
        <Section icon={Check} title="Development Highlights">
          <ul className="space-y-2">
            {opp.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-[#8A9E8A]">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4ADE80]" />
                {h}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Zoning */}
      <Section icon={Building2} title="Zoning &amp; Entitlements">
        {opp.zoningDescription && (
          <p className="mb-4 text-sm leading-relaxed text-[#8A9E8A]">{opp.zoningDescription}</p>
        )}
        <div className="divide-y divide-[#1A2D1A]">
          <InfoRow label="Entitlement status" value={opp.entitlementStatus} />
          <InfoRow label="Max buildable units" value={opp.maxBuildableUnits ? String(opp.maxBuildableUnits) : null} />
          <InfoRow label="Max floor area ratio" value={opp.maxFloorAreaRatio ? `${opp.maxFloorAreaRatio}:1` : null} />
          <InfoRow label="Height limit" value={opp.heightLimitFt ? `${opp.heightLimitFt} ft` : null} />
          <InfoRow label="Environmental status" value={opp.environmentalStatus} />
        </div>
        {opp.permitsAvailable.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4A6A4A]">
              Permits Available
            </p>
            {opp.permitsAvailable.map((p) => (
              <div key={p} className="flex items-center gap-2 text-xs text-[#8A9E8A]">
                <FileCheck className="h-3 w-3 shrink-0 text-[#4ADE80]" />
                {p}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Infrastructure */}
      <Section icon={Plug} title="Infrastructure">
        <div className="divide-y divide-[#1A2D1A]">
          <InfoRow label="Road access"   value={opp.roadAccess ? `Yes — ${opp.roadType ?? 'see listing'}` : 'No direct access'} />
          <InfoRow label="Topography"    value={opp.topography} />
          <InfoRow label="Flood zone"    value={opp.floodZone} />
        </div>
        {opp.utilitiesAvailable.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#4A6A4A]">
              Utilities at Site
            </p>
            <div className="flex flex-wrap gap-1.5">
              {opp.utilitiesAvailable.map((u) => (
                <span key={u} className="rounded border border-[#22C55E]/20 bg-[#22C55E]/5 px-2.5 py-1 text-[11px] text-[#4ADE80]">
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
          <p className="text-sm leading-relaxed text-[#5A7060]">
            {opp.financingNotes}
          </p>
        </Section>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-[#1A2D1A] px-3 py-2.5">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#4A6A4A]" />
        <p className="text-[10px] leading-relaxed text-[#4A6A4A]">
          Development information is provided for informational purposes only and is subject to change.
          Verify all zoning, permits, and entitlements with local authorities before making investment decisions.
          Crowdfunding and development financing structures require regulatory compliance — consult legal counsel.
        </p>
      </div>
    </div>
  )
}
