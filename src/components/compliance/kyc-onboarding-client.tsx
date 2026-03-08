'use client'

// ---------------------------------------------------------------------------
// KYCOnboardingClient — Multi-step identity verification flow.
//
// Steps:
//   1. Status check / welcome — show current status, CTA
//   2. Requirements overview  — what we collect and why (trust-first legal)
//   3. Personal information   — legal name, DOB, address
//   4. ID document upload     — government-issued ID front (+ back optional)
//   5. Liveness / selfie      — placeholder for vendor integration
//   6. Review & submit        — confirmation before submitting
//
// Status lifecycle:
//   NONE      → shows "Start verification" CTA
//   PENDING   → user is in-progress; can continue
//   SUBMITTED → "Under review" state, no more edits
//   VERIFIED  → complete; shows confirmation
//   REJECTED  → shows rejection note; allows resubmission
//
// Vendor integration path:
//   Step 5 is a placeholder. When a real provider (Persona/Jumio/Onfido) is
//   integrated, replace the SelfieStep component with an SDK embed and
//   capture the providerRef to pass on submission.
// ---------------------------------------------------------------------------

import React, { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { UploadZone } from '@/components/ui/upload-zone'
import type { KycStatusData } from '@/lib/compliance/kyc-query'

// ── Types ──────────────────────────────────────────────────────────────────

interface PersonalInfo {
  legalName:    string
  dateOfBirth:  string
  addressLine1: string
  city:         string
  state:        string
  country:      string
}

interface DocSlot {
  file:        File | null
  preview:     string | null
  status:      'idle' | 'uploading' | 'done' | 'error'
  storageKey:  string | null
  url:         string | null
  errorMessage: string | null
}

const EMPTY_DOC_SLOT: DocSlot = {
  file: null, preview: null, status: 'idle',
  storageKey: null, url: null, errorMessage: null,
}

const GOLD  = '#C9A84C'
const GREEN = '#4ADE80'

// ── Step config ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Welcome'  },
  { id: 2, label: 'Overview' },
  { id: 3, label: 'Identity' },
  { id: 4, label: 'Documents'},
  { id: 5, label: 'Selfie'   },
  { id: 6, label: 'Submit'   },
]

// ── Props ──────────────────────────────────────────────────────────────────

interface KYCOnboardingClientProps {
  initialData: KycStatusData
  userDisplayName?: string | null
  userRole?: string
}

// ── Root component ─────────────────────────────────────────────────────────

export function KYCOnboardingClient({
  initialData,
  userDisplayName,
  userRole,
}: KYCOnboardingClientProps) {
  const [kycData, setKycData]   = useState<KycStatusData>(initialData)
  const [step, setStep]         = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError]   = useState<string | null>(null)
  const [submitted, setSubmitted]       = useState(false)

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    legalName: userDisplayName ?? '',
    dateOfBirth:  '',
    addressLine1: '',
    city:         '',
    state:        '',
    country:      'US',
  })

  const [idFront, setIdFront] = useState<DocSlot>(EMPTY_DOC_SLOT)
  const [idBack,  setIdBack]  = useState<DocSlot>(EMPTY_DOC_SLOT)

  const status = kycData.kycStatus

  // Already submitted/verified — skip to status screen on mount
  useEffect(() => {
    if (status === 'SUBMITTED' || status === 'VERIFIED' || status === 'REJECTED') {
      setStep(7) // status screen
    }
  }, [status])

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, 7)), [])
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])

  // ── Upload helper ──────────────────────────────────────────────────────

  const uploadDoc = useCallback(
    async (
      file: File,
      setter: React.Dispatch<React.SetStateAction<DocSlot>>,
    ) => {
      const preview = URL.createObjectURL(file)
      setter((s) => ({ ...s, file, preview, status: 'uploading', errorMessage: null }))
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('purpose', 'user-docs-kyc')
        const res  = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error?.message ?? 'Upload failed')
        const { key, url } = json.data as { key: string; url: string }
        setter((s) => ({ ...s, status: 'done', storageKey: key, url }))
      } catch (err) {
        setter((s) => ({
          ...s,
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Upload failed',
        }))
      }
    },
    [],
  )

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/users/me/kyc', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:      'submit',
          personalInfo,
          idFrontUrl:  idFront.url,
          idFrontKey:  idFront.storageKey,
          idBackUrl:   idBack.url  ?? undefined,
          idBackKey:   idBack.storageKey ?? undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message ?? 'Submission failed')
      setKycData((prev) => ({ ...prev, kycStatus: 'SUBMITTED' }))
      setSubmitted(true)
      setStep(7)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }, [personalInfo, idFront, idBack])

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
          Account Verification
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#F5F5F7]">Identity Verification</h1>
        <p className="mt-1 text-sm text-[#6B6B80]">
          Required to unlock investing and trading features on TIGI.
        </p>
      </div>

      {/* Step progress (shown for in-progress steps 1–6) */}
      {step <= 6 && (
        <KycStepProgress currentStep={step} />
      )}

      {/* Step content */}
      <div className="mt-6 rounded-2xl border border-[#2A2A3A] bg-[#0A0A0F] p-6 shadow-xl sm:p-8">
        {step === 1 && (
          <WelcomeStep
            status={status}
            userRole={userRole}
            onStart={async () => {
              // Create PENDING record
              await fetch('/api/users/me/kyc', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ action: 'start' }),
              })
              goNext()
            }}
          />
        )}
        {step === 2 && <OverviewStep onNext={goNext} onBack={goBack} />}
        {step === 3 && (
          <PersonalInfoStep
            info={personalInfo}
            onChange={setPersonalInfo}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 4 && (
          <DocumentUploadStep
            idFront={idFront}
            idBack={idBack}
            onUploadFront={(f) => uploadDoc(f, setIdFront)}
            onUploadBack={(f)  => uploadDoc(f, setIdBack)}
            onRemoveFront={() => setIdFront(EMPTY_DOC_SLOT)}
            onRemoveBack={()  => setIdBack(EMPTY_DOC_SLOT)}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 5 && <SelfieStep onNext={goNext} onBack={goBack} />}
        {step === 6 && (
          <ReviewSubmitStep
            personalInfo={personalInfo}
            idFront={idFront}
            idBack={idBack}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            onBack={goBack}
          />
        )}
        {step === 7 && (
          <StatusScreen
            status={kycData.kycStatus}
            reviewNote={kycData.verification?.reviewNote ?? null}
            submittedAt={kycData.verification?.submittedAt ?? null}
            justSubmitted={submitted}
            onRestart={() => {
              setKycData((prev) => ({ ...prev, kycStatus: 'NONE' }))
              setIdFront(EMPTY_DOC_SLOT)
              setIdBack(EMPTY_DOC_SLOT)
              setSubmitted(false)
              setStep(1)
            }}
          />
        )}
      </div>

      {/* Legal disclaimer */}
      {step <= 6 && (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-[#4A4A5E]">
          TIGI collects identity documents solely for regulatory compliance purposes.
          Documents are encrypted in transit and at rest.
          This verification does not constitute legal compliance certification.{' '}
          <span className="text-[#6B6B80]">Privacy Policy · Terms of Service</span>
        </p>
      )}
    </div>
  )
}

// ── Step progress bar ──────────────────────────────────────────────────────

function KycStepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = step.id < currentStep
        const isActive    = step.id === currentStep
        const isLast      = i === STEPS.length - 1

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-semibold transition-all',
                  isCompleted ? 'border-transparent text-[#0A0A0F]'   :
                  isActive    ? 'border-[#C9A84C] text-[#C9A84C]'     :
                                'border-[#2A2A3A] text-[#4A4A5E]',
                )}
                style={isCompleted ? { backgroundColor: GOLD } : {}}
              >
                {isCompleted ? '✓' : step.id}
              </div>
              <span className={cn(
                'hidden text-[9px] font-medium sm:block',
                isActive ? 'text-[#F5F5F7]' : isCompleted ? 'text-[#C9A84C]' : 'text-[#4A4A5E]',
              )}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className="mb-3.5 h-[2px] flex-1 transition-all"
                style={{ backgroundColor: step.id < currentStep ? GOLD : '#2A2A3A' }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Step 1: Welcome ────────────────────────────────────────────────────────

const ROLE_REQUIREMENTS: Record<string, string[]> = {
  INVESTOR:  ['Government-issued photo ID', 'Proof of address', 'Selfie / liveness check'],
  OWNER:     ['Government-issued photo ID', 'Proof of address', 'Business documentation (if applicable)'],
  BOTH:      ['Government-issued photo ID', 'Proof of address', 'Selfie / liveness check'],
  default:   ['Government-issued photo ID', 'Proof of address'],
}

function WelcomeStep({
  status,
  userRole,
  onStart,
}: {
  status: string
  userRole?: string
  onStart: () => Promise<void>
}) {
  const [starting, setStarting] = useState(false)
  const reqs = ROLE_REQUIREMENTS[userRole ?? 'default'] ?? ROLE_REQUIREMENTS.default

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A84C]/15">
        <ShieldIcon color={GOLD} />
      </div>
      <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">Verify Your Identity</h2>
      <p className="mb-6 text-sm leading-relaxed text-[#A0A0B2]">
        Identity verification is required to invest in tokenized assets, initiate purchases,
        and access TIGI's full marketplace. The process takes approximately 3–5 minutes.
      </p>

      {/* What you'll need */}
      <div className="mb-6 rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
          What You'll Need
        </p>
        <ul className="space-y-2">
          {reqs.map((req) => (
            <li key={req} className="flex items-center gap-2 text-sm text-[#A0A0B2]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Trust badges */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Encrypted',   sub: 'AES-256-GCM' },
          { label: 'Secure',      sub: 'Access controlled' },
          { label: 'Compliant',   sub: 'GDPR aligned' },
        ].map(({ label, sub }) => (
          <div key={label} className="rounded-lg border border-[#2A2A3A] bg-[#14141E] px-3 py-2.5 text-center">
            <p className="text-xs font-semibold text-[#F5F5F7]">{label}</p>
            <p className="text-[10px] text-[#6B6B80]">{sub}</p>
          </div>
        ))}
      </div>

      <button
        disabled={starting}
        onClick={async () => {
          setStarting(true)
          try { await onStart() } finally { setStarting(false) }
        }}
        className={cn(
          'w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all',
          'bg-[#C9A84C] text-[#0A0A0F] hover:bg-[#D4A84C] disabled:opacity-50',
        )}
      >
        {starting ? 'Starting…' : 'Begin Verification'}
      </button>
    </div>
  )
}

// ── Step 2: Overview ───────────────────────────────────────────────────────

function OverviewStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">What We Collect & Why</h2>
      <p className="mb-6 text-sm text-[#A0A0B2]">
        TIGI is required by applicable financial regulations to verify the identity of users
        who transact on the platform. This section explains what we collect and how we use it.
      </p>

      <div className="space-y-3">
        {[
          {
            title: 'Personal Information',
            desc:  'Legal name, date of birth, and residential address. Required to match against government-issued ID.',
            notice: null,
          },
          {
            title: 'Government-Issued Photo ID',
            desc:  'A valid passport, national ID card, or driver\'s license. Both sides may be required.',
            notice: null,
          },
          {
            title: 'Selfie / Liveness Check',
            desc:  'A live photo to confirm you are the document holder. Performed via a secure third-party verification provider.',
            notice: 'Vendor integration in progress. Currently a placeholder step.',
          },
        ].map(({ title, desc, notice }) => (
          <div key={title} className="rounded-xl border border-[#2A2A3A] bg-[#14141E] p-4">
            <p className="mb-1 text-sm font-semibold text-[#F5F5F7]">{title}</p>
            <p className="text-xs leading-relaxed text-[#6B6B80]">{desc}</p>
            {notice && (
              <p className="mt-2 rounded-md border border-[#F59E0B]/20 bg-[#F59E0B]/8 px-2.5 py-1.5 text-[10px] text-[#F59E0B]">
                ⚠ {notice}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-[#2A2A3A] bg-[#14141E] p-4">
        <p className="text-xs leading-relaxed text-[#6B6B80]">
          <strong className="text-[#A0A0B2]">Data Retention:</strong> Identity documents are stored
          for the duration required by applicable law and deleted thereafter.
          TIGI does not sell or share verification data with third parties
          except as required for regulatory compliance.{' '}
          <strong className="text-[#A0A0B2]">
            This verification process does not constitute legal advice or regulatory certification.
          </strong>
        </p>
      </div>

      <StepActions onBack={onBack} onNext={onNext} canNext />
    </div>
  )
}

// ── Step 3: Personal Info ──────────────────────────────────────────────────

function PersonalInfoStep({
  info,
  onChange,
  onNext,
  onBack,
}: {
  info:     PersonalInfo
  onChange: React.Dispatch<React.SetStateAction<PersonalInfo>>
  onNext:   () => void
  onBack:   () => void
}) {
  const f = (field: keyof PersonalInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }))

  const canProceed =
    info.legalName.trim().length >= 2 &&
    /^\d{4}-\d{2}-\d{2}$/.test(info.dateOfBirth) &&
    info.addressLine1.trim().length >= 3 &&
    info.city.trim() &&
    info.state.trim()

  return (
    <div className="animate-fade-in">
      <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">Personal Information</h2>
      <p className="mb-6 text-sm text-[#A0A0B2]">
        Enter your details exactly as they appear on your government-issued ID.
      </p>

      <div className="space-y-4">
        <KycField
          label="Legal Full Name"
          placeholder="As shown on your ID"
          value={info.legalName}
          onChange={f('legalName')}
          hint="Include middle name if shown on your ID."
        />
        <KycField
          label="Date of Birth"
          type="date"
          placeholder="YYYY-MM-DD"
          value={info.dateOfBirth}
          onChange={f('dateOfBirth')}
          hint="Must be 18 years or older."
        />

        <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
            Residential Address
          </p>
          <div className="space-y-3">
            <KycField
              label="Street Address"
              placeholder="123 Main Street, Apt 4B"
              value={info.addressLine1}
              onChange={f('addressLine1')}
            />
            <div className="grid grid-cols-2 gap-3">
              <KycField
                label="City"
                placeholder="Austin"
                value={info.city}
                onChange={f('city')}
              />
              <KycField
                label="State / Province"
                placeholder="TX"
                value={info.state}
                onChange={f('state')}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#A0A0B2]">Country</label>
              <select
                value={info.country}
                onChange={f('country')}
                className="w-full rounded-lg border border-[#2A2A3A] bg-[#22222E] px-3 py-2.5 text-sm text-[#F5F5F7] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <StepActions onBack={onBack} onNext={onNext} canNext={canProceed} />
    </div>
  )
}

// ── Step 4: Document Upload ────────────────────────────────────────────────

function DocumentUploadStep({
  idFront,
  idBack,
  onUploadFront,
  onUploadBack,
  onRemoveFront,
  onRemoveBack,
  onNext,
  onBack,
}: {
  idFront: DocSlot
  idBack:  DocSlot
  onUploadFront: (f: File) => void
  onUploadBack:  (f: File) => void
  onRemoveFront: () => void
  onRemoveBack:  () => void
  onNext: () => void
  onBack: () => void
}) {
  const canProceed = idFront.status === 'done'

  return (
    <div className="animate-fade-in">
      <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">Upload ID Document</h2>
      <p className="mb-6 text-sm text-[#A0A0B2]">
        Upload a clear photo of your government-issued ID. Accepted: passport, national ID,
        or driver's licence.
      </p>

      <div className="space-y-5">
        {/* Front */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
            Front of ID <span className="text-[#EF4444]">*</span>
          </p>
          <UploadZone
            label="Click or drag to upload front"
            hint="JPEG, PNG, PDF · Max 50 MB"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            maxBytes={50 * 1024 * 1024}
            onFile={onUploadFront}
            uploading={idFront.status === 'uploading'}
            uploaded={idFront.status === 'done'}
            fileName={idFront.file?.name}
            onRemove={idFront.status === 'done' ? onRemoveFront : undefined}
            error={idFront.status === 'error' ? (idFront.errorMessage ?? 'Upload failed') : undefined}
            accentColor={GOLD}
          />
        </div>

        {/* Back */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
            Back of ID{' '}
            <span className="font-normal normal-case text-[#4A4A5E]">(optional — required for national ID / driver's licence)</span>
          </p>
          <UploadZone
            label="Click or drag to upload back"
            hint="JPEG, PNG, PDF · Max 50 MB"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            maxBytes={50 * 1024 * 1024}
            onFile={onUploadBack}
            uploading={idBack.status === 'uploading'}
            uploaded={idBack.status === 'done'}
            fileName={idBack.file?.name}
            onRemove={idBack.status === 'done' ? onRemoveBack : undefined}
            error={idBack.status === 'error' ? (idBack.errorMessage ?? 'Upload failed') : undefined}
            accentColor={GOLD}
          />
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-[#2A2A3A] bg-[#14141E] p-4">
          <p className="mb-2 text-xs font-semibold text-[#A0A0B2]">Photo tips</p>
          <ul className="space-y-1 text-xs text-[#6B6B80]">
            {[
              'Ensure all four corners of the document are visible',
              'Photo must be in focus and well-lit',
              'Do not cover any part of the document',
              'Glare and shadows should be minimised',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#3A3A4A]" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <StepActions onBack={onBack} onNext={onNext} canNext={canProceed} nextLabel="Continue" />
    </div>
  )
}

// ── Step 5: Selfie / Liveness ──────────────────────────────────────────────

function SelfieStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">Selfie Verification</h2>
      <p className="mb-6 text-sm text-[#A0A0B2]">
        A liveness check confirms you are the person in the document you uploaded.
      </p>

      <div className="flex flex-col items-center rounded-xl border border-[#F59E0B]/25 bg-[#F59E0B]/6 px-6 py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10">
          <CameraIcon color="#F59E0B" />
        </div>
        <p className="mb-2 text-sm font-semibold text-[#F59E0B]">
          Liveness Check — Coming Soon
        </p>
        <p className="max-w-sm text-xs leading-relaxed text-[#6B6B80]">
          TIGI will integrate a real-time liveness verification provider (Persona, Jumio, or Onfido)
          in a future milestone. For now, this step is bypassed during the initial KYC flow.
          Manual review by a compliance officer includes document-to-face comparison.
        </p>
      </div>

      <StepActions onBack={onBack} onNext={onNext} canNext nextLabel="Skip — Continue to Review" />
    </div>
  )
}

// ── Step 6: Review & Submit ────────────────────────────────────────────────

function ReviewSubmitStep({
  personalInfo,
  idFront,
  idBack,
  isSubmitting,
  submitError,
  onSubmit,
  onBack,
}: {
  personalInfo: PersonalInfo
  idFront:      DocSlot
  idBack:       DocSlot
  isSubmitting: boolean
  submitError:  string | null
  onSubmit:     () => void
  onBack:       () => void
}) {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">Review & Submit</h2>
      <p className="mb-6 text-sm text-[#A0A0B2]">
        Review your information before submitting. Your submission will be reviewed by a TIGI
        compliance officer within 1–3 business days.
      </p>

      {/* Personal info summary */}
      <div className="mb-4 overflow-hidden rounded-xl border border-[#2A2A3A]">
        <div className="bg-[#C9A84C]/10 px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">Personal Information</p>
        </div>
        <div className="divide-y divide-[#1A1A24] px-4">
          {[
            { label: 'Legal Name',   value: personalInfo.legalName     || '—' },
            { label: 'Date of Birth', value: personalInfo.dateOfBirth   || '—' },
            { label: 'Address',      value: [personalInfo.addressLine1, personalInfo.city, personalInfo.state, personalInfo.country].filter(Boolean).join(', ') || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-xs text-[#6B6B80]">{label}</span>
              <span className="text-right text-xs font-medium text-[#F5F5F7]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents summary */}
      <div className="mb-4 overflow-hidden rounded-xl border border-[#2A2A3A]">
        <div className="bg-[#C9A84C]/10 px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">Documents</p>
        </div>
        <div className="divide-y divide-[#1A1A24] px-4">
          {[
            { label: 'ID Front', slot: idFront },
            { label: 'ID Back',  slot: idBack  },
          ].map(({ label, slot }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-xs text-[#6B6B80]">{label}</span>
              <span className={cn('text-xs font-medium', slot.status === 'done' ? 'text-[#4ADE80]' : 'text-[#4A4A5E]')}>
                {slot.status === 'done' ? slot.file?.name ?? 'Uploaded' : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal acknowledgment */}
      <div className="mb-5 rounded-xl border border-[#2A2A3A] bg-[#14141E] p-4">
        <p className="text-xs leading-relaxed text-[#6B6B80]">
          By submitting, I confirm that the information provided is accurate and complete.
          I understand that providing false information may result in account termination
          and may be subject to applicable legal consequences.{' '}
          <strong className="text-[#A0A0B2]">
            This verification is for identity confirmation only and does not constitute
            legal, financial, or regulatory approval.
          </strong>
        </p>
      </div>

      {submitError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-xs text-[#EF4444]">
          {submitError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-xl border border-[#2A2A3A] px-5 py-2.5 text-sm font-medium text-[#A0A0B2] transition-colors hover:border-[#3A3A4A] hover:text-[#F5F5F7] disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="rounded-xl bg-[#C9A84C] px-8 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4A84C] disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Verification'}
        </button>
      </div>
    </div>
  )
}

// ── Step 7: Status screen ──────────────────────────────────────────────────

function StatusScreen({
  status,
  reviewNote,
  submittedAt,
  justSubmitted,
  onRestart,
}: {
  status:        string
  reviewNote:    string | null
  submittedAt:   Date | null
  justSubmitted: boolean
  onRestart:     () => void
}) {
  if (status === 'VERIFIED') {
    return (
      <div className="animate-fade-in flex flex-col items-center py-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: GREEN + '20' }}>
          <CheckCircleIcon color={GREEN} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">Identity Verified</h2>
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#A0A0B2]">
          Your identity has been successfully verified. You now have full access to TIGI's
          investment features, tokenized asset purchases, and marketplace transactions.
        </p>
        <StatusBadge status="VERIFIED" />
      </div>
    )
  }

  if (status === 'SUBMITTED' || justSubmitted) {
    return (
      <div className="animate-fade-in flex flex-col items-center py-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F59E0B]/15">
          <ClockIcon color="#F59E0B" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">Verification Submitted</h2>
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#A0A0B2]">
          Your documents are under review by a TIGI compliance officer.
          You'll receive an email notification when your verification is complete.
          This typically takes 1–3 business days.
        </p>
        <StatusBadge status="SUBMITTED" />
        {submittedAt && (
          <p className="mt-4 text-xs text-[#4A4A5E]">
            Submitted {new Date(submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
    )
  }

  if (status === 'REJECTED') {
    return (
      <div className="animate-fade-in flex flex-col items-center py-10 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EF4444]/15">
          <XCircleIcon color="#EF4444" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-[#F5F5F7]">Verification Not Approved</h2>
        <p className="mb-4 max-w-sm text-sm leading-relaxed text-[#A0A0B2]">
          Unfortunately, we were unable to verify your identity at this time.
          Please review the note below and resubmit with corrected information.
        </p>
        {reviewNote && (
          <div className="mb-6 w-full rounded-xl border border-[#EF4444]/25 bg-[#EF4444]/8 p-4 text-left">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#EF4444]">Reviewer Note</p>
            <p className="text-sm text-[#A0A0B2]">{reviewNote}</p>
          </div>
        )}
        <button
          onClick={onRestart}
          className="rounded-xl bg-[#C9A84C] px-8 py-2.5 text-sm font-semibold text-[#0A0A0F] hover:bg-[#D4A84C] transition-all"
        >
          Resubmit Verification
        </button>
      </div>
    )
  }

  // PENDING or NONE — shouldn't normally reach here (caught in useEffect)
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <p className="text-sm text-[#6B6B80]">Verification in progress…</p>
    </div>
  )
}

// ── Shared primitives ──────────────────────────────────────────────────────

function KycField({
  label,
  hint,
  type = 'text',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[#A0A0B2]">{label}</label>
      <input
        id={id}
        type={type}
        className={cn(
          'w-full rounded-lg border border-[#2A2A3A] bg-[#22222E]',
          'px-4 py-2.5 text-sm text-[#F5F5F7] placeholder:text-[#4A4A5E]',
          'outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20',
          'transition-colors duration-150',
        )}
        {...props}
      />
      {hint && <p className="text-[11px] text-[#4A4A5E]">{hint}</p>}
    </div>
  )
}

function StepActions({
  onBack,
  onNext,
  canNext,
  nextLabel = 'Continue',
}: {
  onBack:    () => void
  onNext:    () => void
  canNext:   boolean
  nextLabel?: string
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      <button
        onClick={onBack}
        className="rounded-xl border border-[#2A2A3A] px-5 py-2.5 text-sm font-medium text-[#A0A0B2] transition-colors hover:border-[#3A3A4A] hover:text-[#F5F5F7]"
      >
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="rounded-xl bg-[#C9A84C] px-6 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4A84C] disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {nextLabel} →
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; dot: string }> = {
    NONE:      { label: 'Not Started', color: 'text-[#6B6B80]',  dot: 'bg-[#3A3A4A]' },
    PENDING:   { label: 'In Progress', color: 'text-[#F59E0B]',  dot: 'bg-[#F59E0B]' },
    SUBMITTED: { label: 'Under Review', color: 'text-[#818CF8]', dot: 'bg-[#818CF8]' },
    VERIFIED:  { label: 'Verified',    color: 'text-[#4ADE80]',  dot: 'bg-[#4ADE80]' },
    REJECTED:  { label: 'Not Approved', color: 'text-[#EF4444]', dot: 'bg-[#EF4444]' },
  }
  const c = cfg[status] ?? cfg.NONE
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-[#2A2A3A] bg-[#111118] px-3 py-1 text-xs font-semibold', c.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}

// ── Inline SVG icons ──────────────────────────────────────────────────────

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CameraIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function CheckCircleIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function ClockIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function XCircleIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}
