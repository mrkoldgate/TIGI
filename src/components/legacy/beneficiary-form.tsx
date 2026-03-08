'use client'

import { useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LegacyBeneficiaryRecord } from '@/lib/legacy/legacy-query'

// ---------------------------------------------------------------------------
// BeneficiaryForm — inline add / edit form for a single LegacyBeneficiary.
//
// Props:
//   initialData  — pre-populate for edit mode (undefined = add mode)
//   onSave       — called with the saved record after API success
//   onCancel     — called when the user cancels
// ---------------------------------------------------------------------------

const RELATIONSHIP_OPTIONS = [
  { value: 'SPOUSE',      label: 'Spouse'           },
  { value: 'PARTNER',     label: 'Partner'          },
  { value: 'CHILD',       label: 'Child'            },
  { value: 'SIBLING',     label: 'Sibling'          },
  { value: 'PARENT',      label: 'Parent'           },
  { value: 'GRANDCHILD',  label: 'Grandchild'       },
  { value: 'TRUSTEE',     label: 'Trustee'          },
  { value: 'CHARITY',     label: 'Charity / NGO'    },
  { value: 'FRIEND',      label: 'Friend'           },
  { value: 'OTHER',       label: 'Other'            },
]

interface BeneficiaryFormProps {
  initialData?: LegacyBeneficiaryRecord
  onSave:       (record: LegacyBeneficiaryRecord) => void
  onCancel:     () => void
}

export function BeneficiaryForm({ initialData, onSave, onCancel }: BeneficiaryFormProps) {
  const isEdit = !!initialData

  const [name,         setName]         = useState(initialData?.name              ?? '')
  const [email,        setEmail]        = useState(initialData?.email             ?? '')
  const [phone,        setPhone]        = useState(initialData?.phone             ?? '')
  const [relationship, setRelationship] = useState(initialData?.relationship      ?? 'OTHER')
  const [allocation,   setAllocation]   = useState(String(initialData?.allocationPercent ?? 0))
  const [notes,        setNotes]        = useState(initialData?.notes             ?? '')

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const allocNum = parseInt(allocation, 10)
    if (isNaN(allocNum) || allocNum < 0 || allocNum > 100) {
      setError('Allocation must be a number between 0 and 100.')
      return
    }

    setSaving(true)
    try {
      const url    = isEdit ? `/api/users/me/beneficiaries/${initialData!.id}` : '/api/users/me/beneficiaries'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:              name.trim(),
          email:             email.trim() || undefined,
          phone:             phone.trim() || undefined,
          relationship,
          allocationPercent: allocNum,
          notes:             notes.trim() || undefined,
        }),
      })

      const json = await res.json() as { success: boolean; data?: LegacyBeneficiaryRecord; error?: { message: string } }

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? `Request failed (${res.status})`)
      }

      onSave(json.data!)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#2A2A3A] bg-[#0D0D14] p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-[#A78BFA]" />
          <h3 className="text-sm font-semibold text-[#F5F5F7]">
            {isEdit ? 'Edit Beneficiary' : 'Add Beneficiary'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#4A4A5E] hover:text-[#6B6B80] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#6B6B80] mb-1">
            Full name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Smith"
            className="w-full rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-[#6B6B80] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-[#6B6B80] mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
          />
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-xs font-medium text-[#6B6B80] mb-1">Relationship</label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
          >
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Allocation */}
        <div>
          <label className="block text-xs font-medium text-[#6B6B80] mb-1">
            Allocation %
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              className="w-full rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 pr-8 text-sm text-[#F5F5F7] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A4A5E]">%</span>
          </div>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#6B6B80] mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any additional instructions for this beneficiary…"
            className="w-full resize-none rounded-lg border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#EF4444]">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#2A2A3A] px-4 py-2 text-xs font-medium text-[#6B6B80] hover:border-[#3A3A4A] hover:text-[#A0A0B2] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
            saving || !name.trim()
              ? 'bg-[#2A2A3A] text-[#4A4A5E] cursor-not-allowed'
              : 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30 hover:bg-[#A78BFA]/30',
          )}
        >
          {saving && <Loader2 className="h-3 w-3 animate-spin" />}
          {isEdit ? 'Save changes' : 'Add beneficiary'}
        </button>
      </div>
    </form>
  )
}
