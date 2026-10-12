'use client'

// ---------------------------------------------------------------------------
// LegacyHubClient — main Legacy module UI.
//
// TIGI Hyper-Glass v3 — Glassflow Safe/Security monumental aesthetic:
//   Layer 0: Atmospheric orbs (purple + gold, handled by parent page)
//   Layer 1: Deep structural backdrop (bg-black/40, backdrop-blur-3xl)
//            with purple inner wash — wraps the wizard step content
//   Layer 2: Floating glass plates — header, step indicator, wizard card,
//            review sections, status card
//
// Key Glassflow Security fidelity points:
//   • Monumental shield icon in header with triple-layer purple/gold glow
//   • Step indicator circles with neon drop-shadows on current step
//   • Gold accents on security-sensitive elements (compliance, submit)
//   • Deep compound internal shadows on structural backdrop
//   • Form inputs with purple focus glow ring
//
// Two modes:
//   DRAFT (onboardingStep < 5):  Multi-step wizard
//   SUBMITTED / UNDER_REVIEW:    Read-only status view
//   ACTIVE:                      Active plan summary with edit prompt
//   SUSPENDED:                   Suspended notice with contact info
//
// Wizard steps:
//   0 — Intro / disclaimer
//   1 — Estate instructions
//   2 — Beneficiaries
//   3 — Executor details
//   4 — Supporting documents
//   5 — Review & submit
// ---------------------------------------------------------------------------

import { useState, useCallback } from 'react'
import {
  FileText,
  Users,
  UserCog,
  Paperclip,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Landmark,
  ShieldCheck,
  ExternalLink,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LEGACY_MESSAGING, type LegacyPlanRecord, type LegacyBeneficiaryRecord } from '@/lib/legacy/legacy-query'
import { BeneficiaryForm } from './beneficiary-form'

// ── Step config ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Overview',       icon: Landmark      },
  { label: 'Instructions',   icon: FileText       },
  { label: 'Beneficiaries',  icon: Users          },
  { label: 'Executor',       icon: UserCog        },
  { label: 'Documents',      icon: Paperclip      },
  { label: 'Review',         icon: ClipboardCheck },
]

const RELATIONSHIP_LABELS: Record<string, string> = {
  SPOUSE:     'Spouse',
  PARTNER:    'Partner',
  CHILD:      'Child',
  SIBLING:    'Sibling',
  PARENT:     'Parent',
  GRANDCHILD: 'Grandchild',
  TRUSTEE:    'Trustee',
  CHARITY:    'Charity / NGO',
  FRIEND:     'Friend',
  OTHER:      'Other',
}

// ── Props ────────────────────────────────────────────────────────────────────

interface LegacyHubClientProps {
  initialPlan: LegacyPlanRecord | null
}

// ── Component ────────────────────────────────────────────────────────────────

export function LegacyHubClient({ initialPlan }: LegacyHubClientProps) {
  const [plan,          setPlan]          = useState<LegacyPlanRecord | null>(initialPlan)
  const [step,          setStep]          = useState<number>(initialPlan?.onboardingStep ?? 0)
  const [saving,        setSaving]        = useState(false)
  const [submitError,   setSubmitError]   = useState<string | null>(null)
  const [showBenefForm, setShowBenefForm] = useState(false)
  const [editBeneficiary, setEditBeneficiary] = useState<LegacyBeneficiaryRecord | null>(null)
  const [deletingId,    setDeletingId]    = useState<string | null>(null)

  // ── Draft fields (controlled) ──────────────────────────────────────────────
  const [instructions,      setInstructions]      = useState(initialPlan?.instructions      ?? '')
  const [specialConditions, setSpecialConditions] = useState(initialPlan?.specialConditions ?? '')
  const [executorName,      setExecutorName]      = useState(initialPlan?.executorName      ?? '')
  const [executorEmail,     setExecutorEmail]     = useState(initialPlan?.executorEmail     ?? '')
  const [executorPhone,     setExecutorPhone]     = useState(initialPlan?.executorPhone     ?? '')

  const beneficiaries = plan?.beneficiaries ?? []

  // ── Helpers ────────────────────────────────────────────────────────────────

  const totalAllocation = beneficiaries.reduce((s, b) => s + b.allocationPercent, 0)
  const isLocked = plan?.status === 'SUBMITTED' || plan?.status === 'UNDER_REVIEW'

  const savePlan = useCallback(async (overrides: Record<string, unknown> = {}, action?: 'save' | 'submit') => {
    setSaving(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/users/me/legacy', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions,
          specialConditions,
          executorName,
          executorEmail,
          executorPhone,
          onboardingStep: step,
          ...overrides,
          ...(action && { action }),
        }),
      })
      const json = await res.json() as { success: boolean; data?: LegacyPlanRecord; error?: { message: string } }
      if (!res.ok || !json.success) throw new Error(json.error?.message ?? 'Save failed')
      setPlan((prev) => ({
        ...json.data!,
        beneficiaries: prev?.beneficiaries ?? [],
      }))
      return true
    } catch (err) {
      setSubmitError((err as Error).message)
      return false
    } finally {
      setSaving(false)
    }
  }, [instructions, specialConditions, executorName, executorEmail, executorPhone, step])

  const goToStep = async (next: number) => {
    const ok = await savePlan({ onboardingStep: next })
    if (ok) setStep(next)
  }

  const handleDeleteBeneficiary = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/users/me/beneficiaries/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPlan((prev) => prev ? {
          ...prev,
          beneficiaries: prev.beneficiaries.filter((b) => b.id !== id),
        } : prev)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleBeneficiarySaved = (record: LegacyBeneficiaryRecord) => {
    setPlan((prev) => {
      if (!prev) return prev
      const exists = prev.beneficiaries.some((b) => b.id === record.id)
      return {
        ...prev,
        beneficiaries: exists
          ? prev.beneficiaries.map((b) => b.id === record.id ? record : b)
          : [...prev.beneficiaries, record],
      }
    })
    setShowBenefForm(false)
    setEditBeneficiary(null)
  }

  // ── Status view (non-DRAFT) ────────────────────────────────────────────────
  if (plan && plan.status !== 'DRAFT') {
    return <StatusView plan={plan} onRequestEdit={() => setPlan({ ...plan, status: 'DRAFT' })} />
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative space-y-6">

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 2 — Header plate (floating glass)
          Glassflow Safe/Security — monumental shield icon
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] p-6 sm:p-8">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* h-[2px] purple accent top-edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" aria-hidden="true" />
        {/* Dual corner glows — purple + gold */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-500/[0.08] blur-[40px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-amber-500/[0.06] blur-[35px]" aria-hidden="true" />

        <div className="relative flex items-center gap-4">
          {/* ── Monumental shield icon — triple-layer glow ── */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(168,85,247,0.12),0_0_30px_rgba(168,85,247,0.12)]">
            {/* Layer 1 — deep purple glow */}
            <div className="pointer-events-none absolute -inset-3 rounded-2xl bg-purple-500/[0.06] blur-[12px]" aria-hidden="true" />
            {/* Layer 2 — gold accent ring */}
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-amber-400/[0.04] blur-[8px]" aria-hidden="true" />
            {/* Layer 3 — inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-purple-400/[0.08] blur-[6px]" aria-hidden="true" />
            <ShieldCheck
              className="relative h-7 w-7 text-purple-400"
              style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.7))' }}
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Structured Planning Tool
            </p>
            <h1 className="mt-0.5 font-heading text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
              {LEGACY_MESSAGING.moduleTitle}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              {LEGACY_MESSAGING.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 2 — Step indicator plate (floating glass strip)
          ═══════════════════════════════════════════════════════════════════ */}
      <StepIndicator currentStep={step} totalSteps={STEPS.length} />

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 1 — Deep structural backdrop (Novu nested-layer)
          Wraps the wizard step content with glowing internal shadow
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-black/40 backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_40px_rgba(0,0,0,0.4)]">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* ── Top-edge lighting (structural) ── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" aria-hidden="true" />

        {/* ── Glowing internal shadow — Glassflow Safe style ── */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_2px_40px_rgba(168,85,247,0.03),inset_0_-2px_40px_rgba(0,0,0,0.25)]" aria-hidden="true" />
        {/* Inner atmospheric bloom — soft purple from top */}
        <div className="pointer-events-none absolute left-1/2 -top-16 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-purple-500/[0.025] blur-[80px]" aria-hidden="true" />
        {/* Gold security accent — bottom right */}
        <div className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-amber-500/[0.03] blur-[50px]" aria-hidden="true" />
        {/* Purple corner glow — top left */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-purple-400/[0.04] blur-[40px]" aria-hidden="true" />

        {/* ── Step content (Layer 2 floats inside) ── */}
        <div className="relative p-8">

          {/* ── Step 0: Overview / Disclaimer ─────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10 backdrop-blur-xl shadow-[inset_0_0_12px_rgba(168,85,247,0.15),0_0_16px_rgba(168,85,247,0.1)]">
                  <Landmark className="h-5 w-5 text-purple-400" style={{ filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.6))' }} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-white">
                    Set up your legacy preferences
                  </h2>
                  <p className="text-xs text-zinc-500">Takes about 5 minutes</p>
                </div>
              </div>

              {/* Disclaimer — gold security accent */}
              <div className="relative overflow-hidden rounded-xl border border-amber-400/15 bg-amber-400/[0.03] backdrop-blur-3xl p-4">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" aria-hidden="true" />
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' }} />
                  <p className="text-xs leading-relaxed text-zinc-400">
                    {LEGACY_MESSAGING.disclaimer}
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {STEPS.slice(1).map((s, i) => {
                  const Icon = s.icon
                  return (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-500">
                      <Icon className="h-4 w-4 text-purple-400/60 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.3))' }} />
                      {s.label}
                    </li>
                  )
                })}
              </ul>

              <button
                onClick={() => goToStep(1)}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-500/15 px-5 py-2.5 text-sm font-semibold text-purple-400 border border-purple-400/25 hover:bg-purple-500/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.12)] transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {plan ? 'Continue setup' : LEGACY_MESSAGING.startCta}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── Step 1: Estate Instructions ───────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <StepHeader icon={FileText} title="Estate Instructions" subtitle="General preferences for your estate distribution" />

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2">
                  General instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={5}
                  placeholder="Describe your general estate wishes. For example: how assets should be distributed, any specific bequests, charitable intentions, or family priorities…"
                  className="w-full resize-none rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-400/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.1)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2">
                  Special conditions (optional)
                </label>
                <textarea
                  value={specialConditions}
                  onChange={(e) => setSpecialConditions(e.target.value)}
                  rows={3}
                  placeholder="Any special conditions, contingencies, or time-based restrictions…"
                  className="w-full resize-none rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-400/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.1)] transition-all"
                />
              </div>

              <StepNavigation
                step={step}
                total={STEPS.length}
                saving={saving}
                onBack={() => goToStep(0)}
                onNext={() => goToStep(2)}
              />
            </div>
          )}

          {/* ── Step 2: Beneficiaries ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <StepHeader icon={Users} title="Beneficiaries" subtitle="People or organizations to receive your assets" />

              {/* Allocation progress bar */}
              {beneficiaries.length > 0 && (
                <AllocationBar total={totalAllocation} />
              )}

              {/* Beneficiary list */}
              {beneficiaries.length > 0 ? (
                <ul className="space-y-2">
                  {beneficiaries.map((b) => (
                    <li
                      key={b.id}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] px-4 py-3 transition-all hover:border-white/[0.08]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{b.name}</p>
                        <p className="text-xs text-zinc-500">
                          {RELATIONSHIP_LABELS[b.relationship] ?? b.relationship}
                          {b.email && ` · ${b.email}`}
                        </p>
                      </div>
                      <span className={cn(
                        'flex-shrink-0 rounded-lg px-2.5 py-0.5 text-xs font-semibold tabular-nums',
                        b.allocationPercent > 0 ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20' : 'bg-white/[0.04] text-zinc-500 border border-white/[0.05]',
                      )}>
                        {b.allocationPercent}%
                      </span>
                      <button
                        onClick={() => { setEditBeneficiary(b); setShowBenefForm(true) }}
                        className="flex-shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBeneficiary(b.id)}
                        disabled={deletingId === b.id}
                        className="flex-shrink-0 text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        {deletingId === b.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] py-8 text-center">
                  <Users className="mx-auto h-6 w-6 text-zinc-600" />
                  <p className="mt-2 text-sm text-zinc-500">No beneficiaries added yet</p>
                </div>
              )}

              {/* Add / edit form */}
              {showBenefForm ? (
                <BeneficiaryForm
                  initialData={editBeneficiary ?? undefined}
                  onSave={handleBeneficiarySaved}
                  onCancel={() => { setShowBenefForm(false); setEditBeneficiary(null) }}
                />
              ) : (
                <button
                  onClick={() => { setEditBeneficiary(null); setShowBenefForm(true) }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-purple-400/25 px-4 py-2.5 text-xs font-medium text-purple-400 hover:border-purple-400/40 hover:bg-purple-400/5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add beneficiary
                </button>
              )}

              {totalAllocation > 0 && totalAllocation !== 100 && (
                <p className="text-xs text-amber-400">
                  Allocations currently sum to {totalAllocation}%. They must total 100% before you can submit.
                </p>
              )}

              <StepNavigation
                step={step}
                total={STEPS.length}
                saving={saving}
                onBack={() => goToStep(1)}
                onNext={() => goToStep(3)}
              />
            </div>
          )}

          {/* ── Step 3: Executor ──────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <StepHeader icon={UserCog} title="Executor" subtitle="The person responsible for carrying out your instructions" />

              <p className="text-xs text-zinc-500">
                An executor (or personal representative) is the individual who administers your estate.
                This is optional but recommended — it helps our compliance team coordinate with the right person.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Executor full name</label>
                  <input
                    type="text"
                    value={executorName}
                    onChange={(e) => setExecutorName(e.target.value)}
                    placeholder="e.g. Robert Johnson"
                    className="w-full rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-400/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.1)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Executor email</label>
                  <input
                    type="email"
                    value={executorEmail}
                    onChange={(e) => setExecutorEmail(e.target.value)}
                    placeholder="executor@example.com"
                    className="w-full rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-400/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.1)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Executor phone</label>
                  <input
                    type="tel"
                    value={executorPhone}
                    onChange={(e) => setExecutorPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-400/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.1)] transition-all"
                  />
                </div>
              </div>

              <StepNavigation
                step={step}
                total={STEPS.length}
                saving={saving}
                onBack={() => goToStep(2)}
                onNext={() => goToStep(4)}
              />
            </div>
          )}

          {/* ── Step 4: Documents ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <StepHeader icon={Paperclip} title="Supporting Documents" subtitle="Upload any relevant estate planning documents" />

              <p className="text-xs text-zinc-500">
                You can attach existing legal documents (wills, trusts, POA) to support your legacy
                preferences. These are stored securely and visible only to our compliance team.
              </p>

              <DocumentUploadArea />

              <StepNavigation
                step={step}
                total={STEPS.length}
                saving={saving}
                onBack={() => goToStep(3)}
                onNext={() => goToStep(5)}
              />
            </div>
          )}

          {/* ── Step 5: Review & Submit ───────────────────────────────────── */}
          {step === 5 && (
            <ReviewStep
              plan={plan}
              beneficiaries={beneficiaries}
              instructions={instructions}
              specialConditions={specialConditions}
              executorName={executorName}
              executorEmail={executorEmail}
              executorPhone={executorPhone}
              totalAllocation={totalAllocation}
              saving={saving}
              submitError={submitError}
              onBack={() => goToStep(4)}
              onSubmit={async () => {
                const ok = await savePlan({ onboardingStep: 5 }, 'submit')
                if (ok) {
                  setPlan((prev) => prev ? { ...prev, status: 'SUBMITTED', submittedAt: new Date().toISOString() } : prev)
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Error banner */}
      {submitError && step !== 5 && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-3xl px-4 py-2.5 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {submitError}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] px-5 py-4">
      {/* Top-edge lighting */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" aria-hidden="true" />

      <div className="relative flex items-center gap-1.5">
        {STEPS.map((s, i) => {
          const Icon      = s.icon
          const isPast    = i < currentStep
          const isCurrent = i === currentStep
          return (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className={cn(
                  'relative flex h-7 w-7 items-center justify-center rounded-full border transition-all',
                  isPast    && 'border-purple-400/30 bg-purple-400/10 text-purple-400',
                  isCurrent && 'border-purple-400/50 bg-purple-400/20 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
                  !isPast && !isCurrent && 'border-white/[0.05] text-zinc-600',
                )}
              >
                {isPast
                  ? <CheckCircle2 className="h-3 w-3" />
                  : <Icon
                      className="h-3 w-3"
                      style={isCurrent ? { filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.6))' } : undefined}
                    />}
              </div>
              {i < totalSteps - 1 && (
                <div className={cn('h-px w-4 sm:w-6 transition-colors', isPast ? 'bg-purple-400/30' : 'bg-white/[0.04]')} />
              )}
            </div>
          )
        })}
        <span className="ml-2 text-xs text-zinc-500">
          {currentStep < STEPS.length ? STEPS[currentStep].label : 'Done'}
        </span>
      </div>
    </div>
  )
}

function StepHeader({ icon: Icon, title, subtitle }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10 backdrop-blur-xl shadow-[inset_0_0_12px_rgba(168,85,247,0.15),0_0_16px_rgba(168,85,247,0.1)]">
        <Icon className="h-4.5 w-4.5 text-purple-400" style={{ filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.6))' }} />
      </div>
      <div>
        <h2 className="font-heading text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">{title}</h2>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
  )
}

function StepNavigation({
  step, total, saving, onBack, onNext,
}: {
  step: number
  total: number
  saving: boolean
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between border-t border-white/[0.04] pt-4">
      <button
        type="button"
        onClick={onBack}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-4 py-2 text-xs font-medium text-zinc-500 hover:border-white/[0.08] hover:text-zinc-400 transition-all disabled:opacity-50"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-500/15 px-5 py-2 text-xs font-semibold text-purple-400 border border-purple-400/25 hover:bg-purple-500/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.12)] transition-all disabled:opacity-50"
      >
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {step === total - 2 ? 'Review' : 'Continue'}
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function AllocationBar({ total }: { total: number }) {
  const capped    = Math.min(total, 100)
  const isOver    = total > 100
  const isComplete = total === 100

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-500">Total allocation</span>
        <span className={cn(
          'font-semibold tabular-nums',
          isComplete ? 'text-emerald-400' : isOver ? 'text-red-400' : 'text-amber-400',
        )}>
          {total}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isComplete && 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.3)]',
            isOver && 'bg-gradient-to-r from-red-400 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
            !isComplete && !isOver && 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.3)]',
          )}
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  )
}

function DocumentUploadArea() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] py-8 text-center">
      {/* Gold security glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-amber-400/[0.04] blur-[40px]" aria-hidden="true" />
      <Lock className="relative mx-auto h-6 w-6 text-zinc-600" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.3))' }} />
      <p className="relative mt-2 text-sm text-zinc-500">Document uploads coming soon</p>
      <p className="relative mt-1 text-xs text-zinc-600">
        You can submit without documents — add them later in Settings.
      </p>
    </div>
  )
}

interface ReviewStepProps {
  plan:              LegacyPlanRecord | null
  beneficiaries:     LegacyBeneficiaryRecord[]
  instructions:      string
  specialConditions: string
  executorName:      string
  executorEmail:     string
  executorPhone:     string
  totalAllocation:   number
  saving:            boolean
  submitError:       string | null
  onBack:            () => void
  onSubmit:          () => void
}

function ReviewStep({
  beneficiaries, instructions, specialConditions,
  executorName, executorEmail, executorPhone,
  totalAllocation, saving, submitError,
  onBack, onSubmit,
}: ReviewStepProps) {
  const canSubmit = beneficiaries.length > 0 && totalAllocation === 100

  return (
    <div className="space-y-6">
      <StepHeader icon={ClipboardCheck} title="Review & Submit" subtitle="Check your preferences before submitting for review" />

      {/* Summary sections */}
      <div className="space-y-4">
        <ReviewSection title="Estate Instructions">
          {instructions
            ? <p className="text-sm text-zinc-400 whitespace-pre-wrap">{instructions}</p>
            : <p className="text-sm text-zinc-600 italic">Not provided</p>}
        </ReviewSection>

        <ReviewSection title={`Beneficiaries (${beneficiaries.length})`}>
          {beneficiaries.length > 0 ? (
            <ul className="space-y-1.5">
              {beneficiaries.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <span className="text-white">{b.name}</span>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{RELATIONSHIP_LABELS[b.relationship] ?? b.relationship}</span>
                    <span className="font-semibold text-purple-400">{b.allocationPercent}%</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-red-400">No beneficiaries added — required before submitting.</p>
          )}
          {beneficiaries.length > 0 && <AllocationBar total={totalAllocation} />}
        </ReviewSection>

        {(executorName || executorEmail) && (
          <ReviewSection title="Executor">
            <p className="text-sm text-white">{executorName}</p>
            {executorEmail && <p className="text-xs text-zinc-500">{executorEmail}</p>}
            {executorPhone && <p className="text-xs text-zinc-500">{executorPhone}</p>}
          </ReviewSection>
        )}
      </div>

      {/* Compliance note — gold security accent */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/10 bg-amber-400/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" aria-hidden="true" />
        <div className="relative flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' }} />
          <p className="text-xs text-zinc-500 leading-relaxed">
            {LEGACY_MESSAGING.complianceNote}
          </p>
        </div>
      </div>

      {/* Validation warning */}
      {!canSubmit && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 backdrop-blur-3xl px-4 py-2.5 text-xs text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {beneficiaries.length === 0
            ? 'Add at least one beneficiary before submitting.'
            : `Allocation total is ${totalAllocation}% — must be 100% to submit.`}
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-3xl px-4 py-2.5 text-xs text-red-400">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/[0.04] pt-4">
        <button
          onClick={onBack}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-4 py-2 text-xs font-medium text-zinc-500 hover:border-white/[0.08] hover:text-zinc-400 transition-all disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={saving || !canSubmit}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
            canSubmit && !saving
              ? 'bg-gradient-to-r from-purple-500/20 to-amber-500/10 text-purple-400 border border-purple-400/25 hover:from-purple-500/30 hover:to-amber-500/15 hover:shadow-[0_0_24px_rgba(168,85,247,0.15),0_0_12px_rgba(251,191,36,0.08)]'
              : 'bg-white/[0.04] text-zinc-600 border border-white/[0.04] cursor-not-allowed',
          )}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Lock className="h-3.5 w-3.5" />
          Submit for Review
        </button>
      </div>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] p-5 space-y-2">
      {/* Top-edge lighting */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent" aria-hidden="true" />
      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-purple-500/[0.04] blur-[30px]" aria-hidden="true" />
      <p className="relative text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
      <div className="relative">{children}</div>
    </div>
  )
}

// ── StatusView — shown when plan is not in DRAFT ─────────────────────────────

function StatusView({ plan, onRequestEdit }: { plan: LegacyPlanRecord; onRequestEdit: () => void }) {
  const statusConfig = {
    SUBMITTED:    { label: 'Submitted',    color: 'text-indigo-400',  bg: 'bg-indigo-400/5',  border: 'border-indigo-400/15', glow: 'bg-indigo-400/[0.04]', icon: Clock },
    UNDER_REVIEW: { label: 'Under Review', color: 'text-amber-400',   bg: 'bg-amber-400/5',   border: 'border-amber-400/15',  glow: 'bg-amber-400/[0.04]',  icon: Clock },
    ACTIVE:       { label: 'Active',       color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/15', glow: 'bg-emerald-400/[0.04]', icon: CheckCircle2 },
    SUSPENDED:    { label: 'Suspended',    color: 'text-red-400',     bg: 'bg-red-400/5',     border: 'border-red-400/15',     glow: 'bg-red-400/[0.04]',     icon: AlertTriangle },
  } as const

  const cfg  = statusConfig[plan.status as keyof typeof statusConfig]
  const Icon = cfg?.icon ?? Clock

  return (
    <div className="relative space-y-6">

      {/* Header plate */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-500/[0.08] blur-[40px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-amber-500/[0.06] blur-[35px]" aria-hidden="true" />

        <div className="relative flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(168,85,247,0.12),0_0_30px_rgba(168,85,247,0.12)]">
            <div className="pointer-events-none absolute -inset-3 rounded-2xl bg-purple-500/[0.06] blur-[12px]" aria-hidden="true" />
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-amber-400/[0.04] blur-[8px]" aria-hidden="true" />
            <ShieldCheck
              className="relative h-7 w-7 text-purple-400"
              style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.7))' }}
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Structured Planning Tool
            </p>
            <h1 className="mt-0.5 font-heading text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
              {LEGACY_MESSAGING.moduleTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Status card — deep structural backdrop */}
      <div className={cn(
        'relative overflow-hidden rounded-3xl border backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_40px_rgba(0,0,0,0.4)] p-6 space-y-3',
        cfg?.border, cfg?.bg,
      )}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" aria-hidden="true" />
        <div className={cn('pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[40px]', cfg?.glow)} aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <Icon className={cn('h-5 w-5', cfg?.color)} style={{ filter: 'drop-shadow(0 0 6px currentColor)' }} />
          <p className={cn('font-semibold', cfg?.color)}>{cfg?.label}</p>
        </div>
        <p className="relative text-sm text-zinc-400">
          {plan.status === 'SUBMITTED' || plan.status === 'UNDER_REVIEW'
            ? LEGACY_MESSAGING.submittedMessage
            : plan.status === 'ACTIVE'
            ? LEGACY_MESSAGING.activeMessage
            : 'Your legacy plan has been suspended. Please contact support.'}
        </p>
        {plan.reviewNote && (
          <div className="relative rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-3 py-2">
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-400">Reviewer note:</span> {plan.reviewNote}
            </p>
          </div>
        )}
        {plan.submittedAt && (
          <p className="relative text-xs text-zinc-500">
            Submitted {new Date(plan.submittedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </p>
        )}
      </div>

      {/* Summary plate */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] p-5 space-y-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/15 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-purple-500/[0.04] blur-[30px]" aria-hidden="true" />

        <p className="relative text-xs font-semibold uppercase tracking-wide text-zinc-500">Plan summary</p>

        <div className="relative flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.5))' }} />
          <span className="text-zinc-400">{plan.beneficiaries.length} beneficiar{plan.beneficiaries.length === 1 ? 'y' : 'ies'}</span>
        </div>
        {plan.executorName && (
          <div className="relative flex items-center gap-2 text-sm">
            <UserCog className="h-4 w-4 text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.5))' }} />
            <span className="text-zinc-400">Executor: {plan.executorName}</span>
          </div>
        )}

        {(plan.status === 'ACTIVE') && (
          <button
            onClick={onRequestEdit}
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-3 py-1.5 text-xs font-medium text-zinc-500 hover:border-white/[0.08] hover:text-zinc-400 transition-all"
          >
            <Pencil className="h-3 w-3" />
            Edit preferences
          </button>
        )}
      </div>

      {/* Legal reminder — gold security plate */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/10 bg-amber-400/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] px-4 py-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/15 to-transparent" aria-hidden="true" />
        <div className="relative flex items-start gap-3">
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.4))' }} />
          <p className="text-xs text-zinc-500 leading-relaxed">
            {LEGACY_MESSAGING.complianceNote}
          </p>
        </div>
      </div>
    </div>
  )
}
