'use client'

// ---------------------------------------------------------------------------
// LegacyHubClient — main Legacy module UI.
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
      // Re-attach beneficiaries (PUT response may not include them fully)
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
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
          Structured Planning Tool
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">
          {LEGACY_MESSAGING.moduleTitle}
        </h1>
        <p className="mt-1 text-sm text-[#6B6B80]">
          {LEGACY_MESSAGING.shortDescription}
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} totalSteps={STEPS.length} />

      {/* Step content */}
      <div className="rounded-2xl border border-[#2A2A3A] bg-[#0D0D14] p-6">

        {/* ── Step 0: Overview / Disclaimer ─────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A78BFA]/10">
                <Landmark className="h-5 w-5 text-[#A78BFA]" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-[#F5F5F7]">
                  Set up your legacy preferences
                </h2>
                <p className="text-xs text-[#6B6B80]">Takes about 5 minutes</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#A78BFA]/20 bg-[#A78BFA]/5 p-4">
              <p className="text-xs leading-relaxed text-[#A0A0B2]">
                {LEGACY_MESSAGING.disclaimer}
              </p>
            </div>

            <ul className="space-y-3">
              {STEPS.slice(1).map((s, i) => {
                const Icon = s.icon
                return (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#6B6B80]">
                    <Icon className="h-4 w-4 text-[#A78BFA]/60 flex-shrink-0" />
                    {s.label}
                  </li>
                )
              })}
            </ul>

            <button
              onClick={() => goToStep(1)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A78BFA]/20 px-5 py-2.5 text-sm font-semibold text-[#A78BFA] border border-[#A78BFA]/30 hover:bg-[#A78BFA]/30 transition-all disabled:opacity-50"
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
              <label className="block text-xs font-medium text-[#6B6B80] mb-2">
                General instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={5}
                placeholder="Describe your general estate wishes. For example: how assets should be distributed, any specific bequests, charitable intentions, or family priorities…"
                className="w-full resize-none rounded-lg border border-[#2A2A3A] bg-[#111118] px-4 py-3 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6B80] mb-2">
                Special conditions (optional)
              </label>
              <textarea
                value={specialConditions}
                onChange={(e) => setSpecialConditions(e.target.value)}
                rows={3}
                placeholder="Any special conditions, contingencies, or time-based restrictions…"
                className="w-full resize-none rounded-lg border border-[#2A2A3A] bg-[#111118] px-4 py-3 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
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
                    className="flex items-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#111118] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#F5F5F7] truncate">{b.name}</p>
                      <p className="text-xs text-[#6B6B80]">
                        {RELATIONSHIP_LABELS[b.relationship] ?? b.relationship}
                        {b.email && ` · ${b.email}`}
                      </p>
                    </div>
                    <span className={cn(
                      'flex-shrink-0 rounded-lg px-2.5 py-0.5 text-xs font-semibold tabular-nums',
                      b.allocationPercent > 0 ? 'bg-[#A78BFA]/10 text-[#A78BFA]' : 'bg-[#2A2A3A] text-[#4A4A5E]',
                    )}>
                      {b.allocationPercent}%
                    </span>
                    <button
                      onClick={() => { setEditBeneficiary(b); setShowBenefForm(true) }}
                      className="flex-shrink-0 text-[#4A4A5E] hover:text-[#6B6B80] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBeneficiary(b.id)}
                      disabled={deletingId === b.id}
                      className="flex-shrink-0 text-[#4A4A5E] hover:text-[#EF4444] transition-colors"
                    >
                      {deletingId === b.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2A2A3A] py-8 text-center">
                <Users className="mx-auto h-6 w-6 text-[#4A4A5E]" />
                <p className="mt-2 text-sm text-[#4A4A5E]">No beneficiaries added yet</p>
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#A78BFA]/30 px-4 py-2.5 text-xs font-medium text-[#A78BFA] hover:border-[#A78BFA]/50 hover:bg-[#A78BFA]/5 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Add beneficiary
              </button>
            )}

            {totalAllocation > 0 && totalAllocation !== 100 && (
              <p className="text-xs text-[#F59E0B]">
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

            <p className="text-xs text-[#6B6B80]">
              An executor (or personal representative) is the individual who administers your estate.
              This is optional but recommended — it helps our compliance team coordinate with the right person.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#6B6B80] mb-1">Executor full name</label>
                <input
                  type="text"
                  value={executorName}
                  onChange={(e) => setExecutorName(e.target.value)}
                  placeholder="e.g. Robert Johnson"
                  className="w-full rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6B80] mb-1">Executor email</label>
                <input
                  type="email"
                  value={executorEmail}
                  onChange={(e) => setExecutorEmail(e.target.value)}
                  placeholder="executor@example.com"
                  className="w-full rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6B80] mb-1">Executor phone</label>
                <input
                  type="tel"
                  value={executorPhone}
                  onChange={(e) => setExecutorPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
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

            <p className="text-xs text-[#6B6B80]">
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

      {/* Error banner */}
      {submitError && step !== 5 && (
        <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
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
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const Icon      = s.icon
        const isPast    = i < currentStep
        const isCurrent = i === currentStep
        return (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border transition-all',
                isPast    && 'border-[#A78BFA]/40 bg-[#A78BFA]/10 text-[#A78BFA]',
                isCurrent && 'border-[#A78BFA] bg-[#A78BFA]/20 text-[#A78BFA]',
                !isPast && !isCurrent && 'border-[#2A2A3A] text-[#4A4A5E]',
              )}
            >
              {isPast
                ? <CheckCircle2 className="h-3 w-3" />
                : <Icon className="h-3 w-3" />}
            </div>
            {i < totalSteps - 1 && (
              <div className={cn('h-px w-4 sm:w-6', isPast ? 'bg-[#A78BFA]/30' : 'bg-[#2A2A3A]')} />
            )}
          </div>
        )
      })}
      <span className="ml-2 text-xs text-[#4A4A5E]">
        {currentStep < STEPS.length ? STEPS[currentStep].label : 'Done'}
      </span>
    </div>
  )
}

function StepHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A78BFA]/10">
        <Icon className="h-4 w-4 text-[#A78BFA]" />
      </div>
      <div>
        <h2 className="font-heading text-base font-semibold text-[#F5F5F7]">{title}</h2>
        <p className="text-xs text-[#6B6B80]">{subtitle}</p>
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
    <div className="flex items-center justify-between border-t border-[#1A1A24] pt-4">
      <button
        type="button"
        onClick={onBack}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] px-4 py-2 text-xs font-medium text-[#6B6B80] hover:border-[#3A3A4A] hover:text-[#A0A0B2] transition-colors disabled:opacity-50"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#A78BFA]/20 px-5 py-2 text-xs font-semibold text-[#A78BFA] border border-[#A78BFA]/30 hover:bg-[#A78BFA]/30 transition-all disabled:opacity-50"
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
        <span className="text-[#6B6B80]">Total allocation</span>
        <span className={cn(
          'font-semibold tabular-nums',
          isComplete ? 'text-[#4ADE80]' : isOver ? 'text-[#EF4444]' : 'text-[#F59E0B]',
        )}>
          {total}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#1A1A24]">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isComplete ? 'bg-[#4ADE80]' : isOver ? 'bg-[#EF4444]' : 'bg-[#F59E0B]',
          )}
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  )
}

function DocumentUploadArea() {
  return (
    <div className="rounded-xl border border-dashed border-[#2A2A3A] py-8 text-center">
      <Paperclip className="mx-auto h-6 w-6 text-[#4A4A5E]" />
      <p className="mt-2 text-sm text-[#4A4A5E]">Document uploads coming soon</p>
      <p className="mt-1 text-xs text-[#3A3A4A]">
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
            ? <p className="text-sm text-[#A0A0B2] whitespace-pre-wrap">{instructions}</p>
            : <p className="text-sm text-[#4A4A5E] italic">Not provided</p>}
        </ReviewSection>

        <ReviewSection title={`Beneficiaries (${beneficiaries.length})`}>
          {beneficiaries.length > 0 ? (
            <ul className="space-y-1.5">
              {beneficiaries.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#F5F5F7]">{b.name}</span>
                  <div className="flex items-center gap-2 text-xs text-[#6B6B80]">
                    <span>{RELATIONSHIP_LABELS[b.relationship] ?? b.relationship}</span>
                    <span className="font-semibold text-[#A78BFA]">{b.allocationPercent}%</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#EF4444]">No beneficiaries added — required before submitting.</p>
          )}
          {beneficiaries.length > 0 && <AllocationBar total={totalAllocation} />}
        </ReviewSection>

        {(executorName || executorEmail) && (
          <ReviewSection title="Executor">
            <p className="text-sm text-[#F5F5F7]">{executorName}</p>
            {executorEmail && <p className="text-xs text-[#6B6B80]">{executorEmail}</p>}
            {executorPhone && <p className="text-xs text-[#6B6B80]">{executorPhone}</p>}
          </ReviewSection>
        )}
      </div>

      {/* Compliance note */}
      <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4A4A5E]" />
          <p className="text-xs text-[#4A4A5E] leading-relaxed">
            {LEGACY_MESSAGING.complianceNote}
          </p>
        </div>
      </div>

      {/* Validation warning */}
      {!canSubmit && (
        <div className="flex items-center gap-2 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2.5 text-xs text-[#F59E0B]">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {beneficiaries.length === 0
            ? 'Add at least one beneficiary before submitting.'
            : `Allocation total is ${totalAllocation}% — must be 100% to submit.`}
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-xs text-[#EF4444]">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#1A1A24] pt-4">
        <button
          onClick={onBack}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] px-4 py-2 text-xs font-medium text-[#6B6B80] hover:border-[#3A3A4A] hover:text-[#A0A0B2] transition-colors disabled:opacity-50"
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
              ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30 hover:bg-[#A78BFA]/30'
              : 'bg-[#2A2A3A] text-[#4A4A5E] cursor-not-allowed',
          )}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit for Review
        </button>
      </div>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B80]">{title}</p>
      {children}
    </div>
  )
}

// ── StatusView — shown when plan is not in DRAFT ─────────────────────────────

function StatusView({ plan, onRequestEdit }: { plan: LegacyPlanRecord; onRequestEdit: () => void }) {
  const statusConfig = {
    SUBMITTED:    { label: 'Submitted', color: 'text-[#818CF8]', bg: 'bg-[#818CF8]/10', border: 'border-[#818CF8]/20', icon: Clock },
    UNDER_REVIEW: { label: 'Under Review', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20', icon: Clock },
    ACTIVE:       { label: 'Active', color: 'text-[#4ADE80]', bg: 'bg-[#4ADE80]/10', border: 'border-[#4ADE80]/20', icon: CheckCircle2 },
    SUSPENDED:    { label: 'Suspended', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20', icon: AlertTriangle },
  } as const

  const cfg     = statusConfig[plan.status as keyof typeof statusConfig]
  const Icon    = cfg?.icon ?? Clock

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
          Structured Planning Tool
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">
          {LEGACY_MESSAGING.moduleTitle}
        </h1>
      </div>

      {/* Status card */}
      <div className={cn('rounded-2xl border p-6 space-y-3', cfg?.border, cfg?.bg)}>
        <div className="flex items-center gap-3">
          <Icon className={cn('h-5 w-5', cfg?.color)} />
          <p className={cn('font-semibold', cfg?.color)}>{cfg?.label}</p>
        </div>
        <p className="text-sm text-[#A0A0B2]">
          {plan.status === 'SUBMITTED' || plan.status === 'UNDER_REVIEW'
            ? LEGACY_MESSAGING.submittedMessage
            : plan.status === 'ACTIVE'
            ? LEGACY_MESSAGING.activeMessage
            : 'Your legacy plan has been suspended. Please contact support.'}
        </p>
        {plan.reviewNote && (
          <div className="rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2">
            <p className="text-xs text-[#6B6B80]">
              <span className="font-medium text-[#A0A0B2]">Reviewer note:</span> {plan.reviewNote}
            </p>
          </div>
        )}
        {plan.submittedAt && (
          <p className="text-xs text-[#4A4A5E]">
            Submitted {new Date(plan.submittedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-[#2A2A3A] bg-[#0D0D14] p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B80]">Plan summary</p>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-[#A78BFA]" />
          <span className="text-[#A0A0B2]">{plan.beneficiaries.length} beneficiar{plan.beneficiaries.length === 1 ? 'y' : 'ies'}</span>
        </div>
        {plan.executorName && (
          <div className="flex items-center gap-2 text-sm">
            <UserCog className="h-4 w-4 text-[#A78BFA]" />
            <span className="text-[#A0A0B2]">Executor: {plan.executorName}</span>
          </div>
        )}

        {(plan.status === 'ACTIVE') && (
          <button
            onClick={onRequestEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] px-3 py-1.5 text-xs font-medium text-[#6B6B80] hover:border-[#3A3A4A] hover:text-[#A0A0B2] transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit preferences
          </button>
        )}
      </div>

      {/* Legal reminder */}
      <div className="flex items-start gap-3 rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-4 py-3">
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#4A4A5E]" />
        <p className="text-xs text-[#4A4A5E] leading-relaxed">
          {LEGACY_MESSAGING.complianceNote}
        </p>
      </div>
    </div>
  )
}
