'use client'

// ---------------------------------------------------------------------------
// CreateListingClient — Multi-step listing creation flow.
//
// Steps:
//   1. AssetTypeStep        — property vs land
//   2. BasicDetailsStep     — title, location, type-specific fields
//   3. PricingStep          — price, listing type, per-acre rate
//   4. OwnershipStep        — full ownership vs fractional tokenization
//   5. MediaStep            — placeholder image upload states
//   6. ReviewStep           — summary before submit
//
// Design:
//   - Property asset → gold (#C9A84C) accent throughout
//   - Land asset → green (#4ADE80) accent throughout
//   - Dark TIGI surface: #0A0A0F / #14141E / #1A1A24 / #2A2A3A border
//
// DB integration path:
//   - handleSubmit → call server action / API route with formState
//   - Media step → real upload endpoint (S3 presigned URL pattern)
// ---------------------------------------------------------------------------

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

type AssetType = 'PROPERTY' | 'LAND'
type PropertyType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED_USE'
type LandUseType = 'AGRICULTURAL' | 'RESIDENTIAL_DEV' | 'COMMERCIAL_DEV' | 'INDUSTRIAL' | 'RECREATIONAL' | 'WATERFRONT' | 'RURAL' | 'MIXED_USE'
type ListingType = 'BUY' | 'LEASE' | 'BOTH'
type OwnershipModel = 'FULL' | 'FRACTIONAL' | 'BOTH'

interface UploadSlot {
  id: string
  file: File | null
  preview: string | null
  status: 'idle' | 'uploading' | 'done' | 'error'
  label: string
}

interface FormState {
  // Step 1
  assetType: AssetType | null
  // Step 2 — shared
  title: string
  description: string
  address: string
  city: string
  state: string
  features: string
  // Step 2 — property-specific
  propertyType: PropertyType | ''
  sqft: string
  bedrooms: string
  bathrooms: string
  yearBuilt: string
  // Step 2 — land-specific
  landUseType: LandUseType | ''
  lotAcres: string
  zoningCode: string
  // Step 3 — pricing
  listingType: ListingType | ''
  price: string
  pricePerAcre: string
  leaseRateMonthly: string
  // Step 4 — ownership
  ownershipModel: OwnershipModel | ''
  tokenTotalSupply: string
  tokenPricePerFraction: string
  // Step 5 — media
  uploadSlots: UploadSlot[]
}

const INITIAL_UPLOAD_SLOTS: UploadSlot[] = [
  { id: 'hero', file: null, preview: null, status: 'idle', label: 'Hero Image' },
  { id: 'img-2', file: null, preview: null, status: 'idle', label: 'Image 2' },
  { id: 'img-3', file: null, preview: null, status: 'idle', label: 'Image 3' },
  { id: 'img-4', file: null, preview: null, status: 'idle', label: 'Image 4' },
  { id: 'img-5', file: null, preview: null, status: 'idle', label: 'Image 5' },
  { id: 'img-6', file: null, preview: null, status: 'idle', label: 'Image 6' },
]

const INITIAL_FORM: FormState = {
  assetType: null,
  title: '',
  description: '',
  address: '',
  city: '',
  state: '',
  features: '',
  propertyType: '',
  sqft: '',
  bedrooms: '',
  bathrooms: '',
  yearBuilt: '',
  landUseType: '',
  lotAcres: '',
  zoningCode: '',
  listingType: '',
  price: '',
  pricePerAcre: '',
  leaseRateMonthly: '',
  ownershipModel: '',
  tokenTotalSupply: '',
  tokenPricePerFraction: '',
  uploadSlots: INITIAL_UPLOAD_SLOTS,
}

const STEPS = [
  { id: 1, label: 'Asset Type' },
  { id: 2, label: 'Basic Details' },
  { id: 3, label: 'Pricing' },
  { id: 4, label: 'Ownership' },
  { id: 5, label: 'Media' },
  { id: 6, label: 'Review' },
]

// ── Accent helpers ─────────────────────────────────────────────────────────

function accent(assetType: AssetType | null) {
  return assetType === 'LAND' ? '#4ADE80' : '#C9A84C'
}

function accentMuted(assetType: AssetType | null) {
  return assetType === 'LAND' ? 'rgba(74,222,128,0.12)' : 'rgba(201,168,76,0.12)'
}

function accentBorder(assetType: AssetType | null) {
  return assetType === 'LAND' ? 'border-[#4ADE80]' : 'border-[#C9A84C]'
}

function accentText(assetType: AssetType | null) {
  return assetType === 'LAND' ? 'text-[#4ADE80]' : 'text-[#C9A84C]'
}

function accentBg(assetType: AssetType | null) {
  return assetType === 'LAND' ? 'bg-[#4ADE80]' : 'bg-[#C9A84C]'
}

// ── Shared UI primitives ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
      {children}
    </p>
  )
}

function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-5', className)}>{children}</div>
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
}

function Textarea({
  label,
  hint,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  const id = label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-label text-xs font-medium text-[#A0A0B2]">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={cn(
          'w-full resize-none rounded-lg border border-[#2A2A3A] bg-[#22222E]',
          'px-4 py-3 text-sm text-[#F5F5F7] placeholder:text-[#6B6B80]',
          'outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20',
          'transition-colors duration-150',
        )}
        {...props}
      />
      {hint && <p className="text-xs text-[#6B6B80]">{hint}</p>}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

function SelectField({ label, hint, value, onChange, options, placeholder }: SelectFieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[#A0A0B2]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-lg border border-[#2A2A3A] bg-[#22222E]',
          'px-4 py-2.5 text-sm text-[#F5F5F7]',
          'outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20',
          'transition-colors duration-150',
          !value && 'text-[#6B6B80]',
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-[#6B6B80]">{hint}</p>}
    </div>
  )
}

interface ToggleCardProps {
  selected: boolean
  onSelect: () => void
  assetType: AssetType | null
  children: React.ReactNode
  className?: string
}

function ToggleCard({ selected, onSelect, assetType, children, className }: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full rounded-xl border p-5 text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]',
        selected
          ? cn(
              'border-2',
              accentBorder(assetType),
              'bg-[#1A1A24]',
            )
          : 'border-[#2A2A3A] bg-[#14141E] hover:border-[#3A3A4E] hover:bg-[#1A1A24]',
        className,
      )}
    >
      {selected && (
        <span
          className={cn(
            'absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
            accentBg(assetType),
            assetType === 'LAND' ? 'text-[#0A0A0F]' : 'text-[#0A0A0F]',
          )}
        >
          ✓
        </span>
      )}
      {children}
    </button>
  )
}

// ── Step Progress ──────────────────────────────────────────────────────────

interface StepProgressProps {
  currentStep: number
  assetType: AssetType | null
}

function StepProgress({ currentStep, assetType }: StepProgressProps) {
  const color = accent(assetType)

  return (
    <div className="mb-10">
      {/* Numeric step line */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep
          const isLast = i === STEPS.length - 1

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300',
                    isCompleted
                      ? 'border-transparent text-[#0A0A0F]'
                      : isActive
                        ? 'border-current text-inherit'
                        : 'border-[#2A2A3A] text-[#6B6B80]',
                  )}
                  style={
                    isCompleted
                      ? { backgroundColor: color }
                      : isActive
                        ? { color, borderColor: color }
                        : {}
                  }
                >
                  {isCompleted ? '✓' : step.id}
                </div>
                <span
                  className={cn(
                    'hidden text-[10px] font-medium sm:block',
                    isActive ? 'text-[#F5F5F7]' : isCompleted ? '' : 'text-[#6B6B80]',
                  )}
                  style={isCompleted ? { color } : {}}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className="mb-4 h-[2px] flex-1 transition-all duration-300"
                  style={{
                    backgroundColor: step.id < currentStep ? color : '#2A2A3A',
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 1: Asset Type ─────────────────────────────────────────────────────

interface Step1Props {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
}

function AssetTypeStep({ form, setForm, onNext }: Step1Props) {
  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[#F5F5F7]">What are you listing?</h2>
        <p className="text-sm text-[#A0A0B2]">
          Select the asset type to tailor the listing form to your specific asset.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ToggleCard
          selected={form.assetType === 'PROPERTY'}
          onSelect={() => setForm((f) => ({ ...f, assetType: 'PROPERTY' }))}
          assetType={form.assetType}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#22222E]">
            <BuildingIcon />
          </div>
          <p className="mb-1 text-base font-semibold text-[#F5F5F7]">Property</p>
          <p className="text-xs leading-relaxed text-[#6B6B80]">
            Residential, commercial, industrial, or mixed-use built assets. Supports full ownership
            and fractional tokenization.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Residential', 'Commercial', 'Industrial', 'Mixed-Use'].map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#2A2A3A] px-2.5 py-0.5 text-[10px] text-[#6B6B80]"
              >
                {t}
              </span>
            ))}
          </div>
        </ToggleCard>

        <ToggleCard
          selected={form.assetType === 'LAND'}
          onSelect={() => setForm((f) => ({ ...f, assetType: 'LAND' }))}
          assetType={form.assetType}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D110D]">
            <LandIcon />
          </div>
          <p className="mb-1 text-base font-semibold text-[#F5F5F7]">Land</p>
          <p className="text-xs leading-relaxed text-[#6B6B80]">
            Agricultural, development, recreational, waterfront, or raw land parcels. Supports
            sale, lease, and development partnerships.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Agricultural', 'Dev. Opportunity', 'Recreational', 'Waterfront'].map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#1E2D1E] px-2.5 py-0.5 text-[10px] text-[#6B6B80]"
              >
                {t}
              </span>
            ))}
          </div>
        </ToggleCard>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          disabled={!form.assetType}
          onClick={onNext}
        >
          Continue
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

// ── Step 2: Basic Details ──────────────────────────────────────────────────

interface Step2Props {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
  onBack: () => void
}

const PROPERTY_TYPE_OPTIONS = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'MIXED_USE', label: 'Mixed-Use' },
]

const LAND_USE_OPTIONS = [
  { value: 'AGRICULTURAL', label: 'Agricultural' },
  { value: 'RESIDENTIAL_DEV', label: 'Residential Development' },
  { value: 'COMMERCIAL_DEV', label: 'Commercial Development' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'RECREATIONAL', label: 'Recreational' },
  { value: 'WATERFRONT', label: 'Waterfront' },
  { value: 'RURAL', label: 'Rural / Ranch' },
  { value: 'MIXED_USE', label: 'Mixed Use' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV',
  'WI','WY',
]

function BasicDetailsStep({ form, setForm, onNext, onBack }: Step2Props) {
  const isLand = form.assetType === 'LAND'
  const f = (field: keyof FormState) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }))

  const canProceed =
    form.title.trim() &&
    form.city.trim() &&
    form.state &&
    (isLand ? form.landUseType : form.propertyType)

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[#F5F5F7]">Basic Details</h2>
        <p className="text-sm text-[#A0A0B2]">
          Describe your {isLand ? 'land parcel' : 'property'} and its location.
        </p>
      </div>

      <FieldGroup>
        {/* Type selection */}
        <SelectField
          label={isLand ? 'Land Use Type' : 'Property Type'}
          value={isLand ? form.landUseType : form.propertyType}
          onChange={isLand ? f('landUseType') : f('propertyType')}
          options={isLand ? LAND_USE_OPTIONS : PROPERTY_TYPE_OPTIONS}
          placeholder="Select a type…"
        />

        <Input
          label="Listing Title"
          placeholder={isLand ? 'e.g. Prime Agricultural Parcel — Central Valley' : 'e.g. Westside Craftsman Bungalow'}
          value={form.title}
          onChange={(e) => f('title')(e.target.value)}
        />

        <Textarea
          label="Description"
          placeholder={
            isLand
              ? 'Describe the land: topography, water access, road frontage, development potential…'
              : 'Describe the property: highlights, condition, neighborhood, unique features…'
          }
          rows={4}
          value={form.description}
          onChange={(e) => f('description')(e.target.value)}
          hint="Markdown is not supported. Plain text only."
        />

        {/* Location */}
        <div>
          <SectionLabel>Location</SectionLabel>
          <FieldGroup>
            <Input
              label="Street Address"
              placeholder="123 Main St"
              value={form.address}
              onChange={(e) => f('address')(e.target.value)}
              hint="Will be verified before listing goes live."
            />
            <FieldRow>
              <Input
                label="City"
                placeholder="Austin"
                value={form.city}
                onChange={(e) => f('city')(e.target.value)}
              />
              <SelectField
                label="State"
                value={form.state}
                onChange={f('state')}
                options={US_STATES.map((s) => ({ value: s, label: s }))}
                placeholder="State…"
              />
            </FieldRow>
          </FieldGroup>
        </div>

        {/* Type-specific fields */}
        {isLand ? (
          <div>
            <SectionLabel>Land Specifications</SectionLabel>
            <FieldGroup>
              <FieldRow>
                <Input
                  label="Total Acreage"
                  type="number"
                  placeholder="120"
                  min="0"
                  step="0.01"
                  value={form.lotAcres}
                  onChange={(e) => f('lotAcres')(e.target.value)}
                  hint="Total parcel acres."
                />
                <Input
                  label="Zoning Code"
                  placeholder="e.g. A-1, C-2, I-3"
                  value={form.zoningCode}
                  onChange={(e) => f('zoningCode')(e.target.value)}
                  hint="Official municipal zoning classification."
                />
              </FieldRow>
            </FieldGroup>
          </div>
        ) : (
          <div>
            <SectionLabel>Property Specifications</SectionLabel>
            <FieldGroup>
              <FieldRow>
                <Input
                  label="Square Footage"
                  type="number"
                  placeholder="2,400"
                  min="0"
                  value={form.sqft}
                  onChange={(e) => f('sqft')(e.target.value)}
                />
                <Input
                  label="Year Built"
                  type="number"
                  placeholder="1998"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={form.yearBuilt}
                  onChange={(e) => f('yearBuilt')(e.target.value)}
                />
              </FieldRow>
              <FieldRow>
                <Input
                  label="Bedrooms"
                  type="number"
                  placeholder="3"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => f('bedrooms')(e.target.value)}
                />
                <Input
                  label="Bathrooms"
                  type="number"
                  placeholder="2"
                  min="0"
                  step="0.5"
                  value={form.bathrooms}
                  onChange={(e) => f('bathrooms')(e.target.value)}
                />
              </FieldRow>
              <Input
                label="Lot Size (acres)"
                type="number"
                placeholder="0.25"
                min="0"
                step="0.01"
                value={form.lotAcres}
                onChange={(e) => f('lotAcres')(e.target.value)}
                hint="Optional — leave blank for condos/apartments."
              />
            </FieldGroup>
          </div>
        )}

        {/* Features */}
        <Textarea
          label="Key Features"
          placeholder="e.g. Hardwood floors, updated kitchen, mountain views, irrigated pasture, rail spur access"
          rows={3}
          value={form.features}
          onChange={(e) => f('features')(e.target.value)}
          hint="Comma-separated. These power AI matching and search filters."
        />
      </FieldGroup>

      <StepActions onBack={onBack} onNext={onNext} canNext={!!canProceed} />
    </div>
  )
}

// ── Step 3: Pricing ────────────────────────────────────────────────────────

interface Step3Props {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
  onBack: () => void
}

const LISTING_TYPE_OPTIONS = [
  { value: 'BUY', label: 'For Sale' },
  { value: 'LEASE', label: 'For Lease' },
  { value: 'BOTH', label: 'Sale or Lease' },
]

function PricingStep({ form, setForm, onNext, onBack }: Step3Props) {
  const isLand = form.assetType === 'LAND'
  const f = (field: keyof FormState) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }))

  const showLeaseRate = form.listingType === 'LEASE' || form.listingType === 'BOTH'
  const showSalePrice = form.listingType === 'BUY' || form.listingType === 'BOTH'
  const canProceed = form.listingType && (showSalePrice ? form.price : true) && (showLeaseRate ? form.leaseRateMonthly : true)

  const acresNum = parseFloat(form.lotAcres)
  const priceNum = parseFloat(form.price)
  const inferredPPA =
    !isNaN(acresNum) && !isNaN(priceNum) && acresNum > 0
      ? (priceNum / acresNum).toLocaleString('en-US', { maximumFractionDigits: 0 })
      : null

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[#F5F5F7]">Pricing</h2>
        <p className="text-sm text-[#A0A0B2]">
          Set your asking price and how buyers or tenants can transact.
        </p>
      </div>

      <FieldGroup>
        <SelectField
          label="Listing Type"
          value={form.listingType}
          onChange={f('listingType')}
          options={LISTING_TYPE_OPTIONS}
          placeholder="Select listing type…"
        />

        {showSalePrice && (
          <Input
            label="Asking Price (USD)"
            type="number"
            placeholder="850,000"
            min="0"
            leftIcon={<span className="text-[#6B6B80]">$</span>}
            value={form.price}
            onChange={(e) => f('price')(e.target.value)}
            hint="Set 0 to display as 'Price on Request'."
          />
        )}

        {showLeaseRate && (
          <Input
            label={isLand ? 'Annual Lease Rate (USD)' : 'Monthly Rent (USD)'}
            type="number"
            placeholder={isLand ? '24,000' : '3,500'}
            min="0"
            leftIcon={<span className="text-[#6B6B80]">$</span>}
            value={form.leaseRateMonthly}
            onChange={(e) => f('leaseRateMonthly')(e.target.value)}
          />
        )}

        {/* Land: per-acre callout */}
        {isLand && form.lotAcres && form.price && (
          <div
            className="rounded-xl border border-[#1E2D1E] p-4"
            style={{ backgroundColor: 'rgba(74,222,128,0.06)' }}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#4ADE80]">
              Per-Acre Rate
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#E8F0E8]">
                ${inferredPPA ?? '—'}
              </span>
              <span className="text-xs text-[#6B6B80]">/ acre (calculated)</span>
            </div>
            <p className="mt-1 text-xs text-[#6B6B80]">
              Based on {form.lotAcres} acres at ${parseFloat(form.price || '0').toLocaleString()} asking price.
            </p>
          </div>
        )}

        {/* AI Valuation note */}
        <div className="rounded-xl border border-[#2A2A3A] bg-[#14141E] p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#22222E]">
              <SparkleIcon />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-[#F5F5F7]">AI Valuation Coming Soon</p>
              <p className="text-xs leading-relaxed text-[#6B6B80]">
                Once your listing is submitted, TIGI's valuation engine will run comparables
                and provide an independent AI estimate. This appears on your listing page
                to build buyer confidence.
              </p>
            </div>
          </div>
        </div>
      </FieldGroup>

      <StepActions onBack={onBack} onNext={onNext} canNext={!!canProceed} />
    </div>
  )
}

// ── Step 4: Ownership / Investment Model ───────────────────────────────────

interface Step4Props {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
  onBack: () => void
}

const OWNERSHIP_OPTIONS: { value: OwnershipModel; label: string; description: string }[] = [
  {
    value: 'FULL',
    label: 'Full Ownership',
    description:
      'The buyer acquires 100% ownership of the asset. Traditional purchase or lease transaction.',
  },
  {
    value: 'FRACTIONAL',
    label: 'Fractional / Tokenized',
    description:
      'Ownership is divided into digital tokens. Multiple investors hold fractional shares. Enables lower entry points and broader liquidity.',
  },
  {
    value: 'BOTH',
    label: 'Full + Fractional',
    description:
      'List for both full acquisition and fractional investment. Investors can buy in at any level.',
  },
]

function OwnershipStep({ form, setForm, onNext, onBack }: Step4Props) {
  const f = (field: keyof FormState) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }))

  const isFractional = form.ownershipModel === 'FRACTIONAL' || form.ownershipModel === 'BOTH'
  const canProceed =
    form.ownershipModel &&
    (!isFractional || (form.tokenTotalSupply && form.tokenPricePerFraction))

  const totalFractionalValue =
    isFractional &&
    form.tokenTotalSupply &&
    form.tokenPricePerFraction
      ? (parseFloat(form.tokenTotalSupply) * parseFloat(form.tokenPricePerFraction)).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })
      : null

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[#F5F5F7]">Ownership Model</h2>
        <p className="text-sm text-[#A0A0B2]">
          Choose how investors and buyers can participate in this asset.
        </p>
      </div>

      <FieldGroup>
        <div className="flex flex-col gap-3">
          {OWNERSHIP_OPTIONS.map((opt) => (
            <ToggleCard
              key={opt.value}
              selected={form.ownershipModel === opt.value}
              onSelect={() => setForm((f) => ({ ...f, ownershipModel: opt.value }))}
              assetType={form.assetType}
            >
              <p className="mb-1 text-sm font-semibold text-[#F5F5F7]">{opt.label}</p>
              <p className="text-xs leading-relaxed text-[#6B6B80]">{opt.description}</p>
            </ToggleCard>
          ))}
        </div>

        {/* Fractional config */}
        {isFractional && (
          <div className="rounded-xl border border-[#2A2A3A] bg-[#14141E] p-5">
            <SectionLabel>Token Configuration</SectionLabel>
            <FieldGroup>
              <FieldRow>
                <Input
                  label="Total Token Supply"
                  type="number"
                  placeholder="1,000"
                  min="1"
                  value={form.tokenTotalSupply}
                  onChange={(e) => f('tokenTotalSupply')(e.target.value)}
                  hint="Total number of ownership tokens to mint."
                />
                <Input
                  label="Price per Token (USD)"
                  type="number"
                  placeholder="500"
                  min="1"
                  leftIcon={<span className="text-[#6B6B80]">$</span>}
                  value={form.tokenPricePerFraction}
                  onChange={(e) => f('tokenPricePerFraction')(e.target.value)}
                  hint="Entry price for a single fraction."
                />
              </FieldRow>

              {totalFractionalValue && (
                <div className="flex items-center justify-between rounded-lg bg-[#22222E] px-4 py-3">
                  <span className="text-xs text-[#6B6B80]">Total tokenized value</span>
                  <span className="text-sm font-semibold text-[#C9A84C]">{totalFractionalValue}</span>
                </div>
              )}

              <div className="rounded-lg border border-[#2A2A3A] px-4 py-3">
                <p className="text-xs leading-relaxed text-[#6B6B80]">
                  <strong className="text-[#A0A0B2]">Note:</strong> Token issuance, smart contract
                  deployment, and regulatory compliance steps are handled after listing approval by
                  the TIGI tokenization team. No on-chain action is required at this stage.
                </p>
              </div>
            </FieldGroup>
          </div>
        )}
      </FieldGroup>

      <StepActions onBack={onBack} onNext={onNext} canNext={!!canProceed} />
    </div>
  )
}

// ── Step 5: Media ──────────────────────────────────────────────────────────

interface Step5Props {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
  onBack: () => void
}

function MediaStep({ form, setForm, onNext, onBack }: Step5Props) {
  const isLand = form.assetType === 'LAND'

  const handleFileSelect = useCallback(
    (slotId: string, file: File) => {
      const preview = URL.createObjectURL(file)
      setForm((prev) => ({
        ...prev,
        uploadSlots: prev.uploadSlots.map((s) =>
          s.id === slotId ? { ...s, file, preview, status: 'done' } : s,
        ),
      }))
    },
    [setForm],
  )

  const handleRemove = useCallback(
    (slotId: string) => {
      setForm((prev) => ({
        ...prev,
        uploadSlots: prev.uploadSlots.map((s) =>
          s.id === slotId
            ? { ...s, file: null, preview: null, status: 'idle' }
            : s,
        ),
      }))
    },
    [setForm],
  )

  const uploadedCount = form.uploadSlots.filter((s) => s.status === 'done').length
  const hasHero = form.uploadSlots[0].status === 'done'

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[#F5F5F7]">Media</h2>
        <p className="text-sm text-[#A0A0B2]">
          Upload photos of your {isLand ? 'land parcel' : 'property'}. High-quality images
          significantly improve listing performance.
        </p>
      </div>

      {/* Hero slot (large) */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
          Hero Image <span className="text-[#EF4444]">*</span>
        </p>
        <UploadSlot
          slot={form.uploadSlots[0]}
          onSelect={(f) => handleFileSelect('hero', f)}
          onRemove={() => handleRemove('hero')}
          assetType={form.assetType}
          large
        />
      </div>

      {/* Additional images (grid) */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
          Additional Images <span className="text-[#A0A0B2]">(up to 5)</span>
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {form.uploadSlots.slice(1).map((slot) => (
            <UploadSlot
              key={slot.id}
              slot={slot}
              onSelect={(f) => handleFileSelect(slot.id, f)}
              onRemove={() => handleRemove(slot.id)}
              assetType={form.assetType}
            />
          ))}
        </div>
      </div>

      {/* Upload counter */}
      <div className="mt-4 flex items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2A2A3A]"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(uploadedCount / 6) * 100}%`,
              backgroundColor: accent(form.assetType),
            }}
          />
        </div>
        <span className="shrink-0 text-xs text-[#6B6B80]">
          {uploadedCount} / 6 uploaded
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-[#2A2A3A] bg-[#14141E] px-4 py-3">
        <p className="text-xs leading-relaxed text-[#6B6B80]">
          <strong className="text-[#A0A0B2]">Supported formats:</strong> JPEG, PNG, WebP. Max 20 MB
          per image.{' '}
          {isLand
            ? 'Aerial or drone photography performs best for land listings.'
            : 'Natural-light exterior and interior shots perform best.'}
        </p>
      </div>

      <StepActions
        onBack={onBack}
        onNext={onNext}
        canNext={hasHero}
        nextLabel="Continue to Review"
      />
    </div>
  )
}

// ── Upload Slot ────────────────────────────────────────────────────────────

interface UploadSlotProps {
  slot: UploadSlot
  onSelect: (file: File) => void
  onRemove: () => void
  assetType: AssetType | null
  large?: boolean
}

function UploadSlot({ slot, onSelect, onRemove, assetType, large }: UploadSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const color = accent(assetType)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onSelect(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onSelect(file)
  }

  if (slot.status === 'done' && slot.preview) {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl border border-[#2A2A3A]',
          large ? 'aspect-[16/9] w-full' : 'aspect-square w-full',
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slot.preview}
          alt={slot.label}
          className="h-full w-full object-cover"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:border-[#EF4444] hover:text-[#EF4444] transition-colors"
          >
            Remove
          </button>
        </div>
        {/* Hero label */}
        {slot.id === 'hero' && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
            Hero
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#2A2A3A]',
        'bg-[#14141E] transition-all duration-200',
        'hover:border-opacity-70',
        large ? 'aspect-[16/9] w-full' : 'aspect-square w-full',
      )}
      style={{ cursor: 'pointer' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleChange}
      />
      <div
        className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: accentMuted(assetType) }}
      >
        <UploadIcon style={{ color }} />
      </div>
      <p className="text-xs font-medium text-[#A0A0B2]">
        {large ? 'Click or drag to upload' : slot.label}
      </p>
      {large && (
        <p className="mt-1 text-[10px] text-[#6B6B80]">JPEG, PNG, WebP · Max 20 MB</p>
      )}
    </div>
  )
}

// ── Step 6: Review & Submit ────────────────────────────────────────────────

interface Step6Props {
  form: FormState
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

function ReviewStep({ form, onBack, onSubmit, isSubmitting }: Step6Props) {
  const isLand = form.assetType === 'LAND'

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-[#F5F5F7]">Review & Submit</h2>
        <p className="text-sm text-[#A0A0B2]">
          Review your listing before submitting for TIGI team review. You can edit after submission
          while it is under review.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Asset type */}
        <ReviewSection
          title="Asset Type"
          assetType={form.assetType}
          rows={[
            { label: 'Type', value: form.assetType === 'LAND' ? 'Land Parcel' : 'Property' },
          ]}
        />

        {/* Basic details */}
        <ReviewSection
          title="Basic Details"
          assetType={form.assetType}
          rows={[
            { label: 'Title', value: form.title || '—' },
            {
              label: isLand ? 'Land Use' : 'Property Type',
              value: isLand
                ? LAND_USE_OPTIONS.find((o) => o.value === form.landUseType)?.label ?? '—'
                : PROPERTY_TYPE_OPTIONS.find((o) => o.value === form.propertyType)?.label ?? '—',
            },
            { label: 'Location', value: [form.city, form.state].filter(Boolean).join(', ') || '—' },
            { label: 'Address', value: form.address || '—' },
            ...(isLand
              ? [
                  { label: 'Acreage', value: form.lotAcres ? `${form.lotAcres} acres` : '—' },
                  { label: 'Zoning Code', value: form.zoningCode || '—' },
                ]
              : [
                  { label: 'Size', value: form.sqft ? `${parseInt(form.sqft).toLocaleString()} sq ft` : '—' },
                  { label: 'Year Built', value: form.yearBuilt || '—' },
                  {
                    label: 'Bed / Bath',
                    value: form.bedrooms || form.bathrooms
                      ? `${form.bedrooms || '—'} bd / ${form.bathrooms || '—'} ba`
                      : '—',
                  },
                ]),
          ]}
        />

        {/* Pricing */}
        <ReviewSection
          title="Pricing"
          assetType={form.assetType}
          rows={[
            {
              label: 'Listing Type',
              value: LISTING_TYPE_OPTIONS.find((o) => o.value === form.listingType)?.label ?? '—',
            },
            {
              label: 'Asking Price',
              value: form.price
                ? `$${parseFloat(form.price).toLocaleString()}`
                : '—',
            },
            ...(form.leaseRateMonthly
              ? [
                  {
                    label: isLand ? 'Annual Lease Rate' : 'Monthly Rent',
                    value: `$${parseFloat(form.leaseRateMonthly).toLocaleString()}`,
                  },
                ]
              : []),
          ]}
        />

        {/* Ownership */}
        <ReviewSection
          title="Ownership Model"
          assetType={form.assetType}
          rows={[
            {
              label: 'Model',
              value: OWNERSHIP_OPTIONS.find((o) => o.value === form.ownershipModel)?.label ?? '—',
            },
            ...(form.ownershipModel === 'FRACTIONAL' || form.ownershipModel === 'BOTH'
              ? [
                  { label: 'Token Supply', value: form.tokenTotalSupply ? `${parseInt(form.tokenTotalSupply).toLocaleString()} tokens` : '—' },
                  {
                    label: 'Price per Token',
                    value: form.tokenPricePerFraction
                      ? `$${parseFloat(form.tokenPricePerFraction).toLocaleString()}`
                      : '—',
                  },
                ]
              : []),
          ]}
        />

        {/* Media */}
        <ReviewSection
          title="Media"
          assetType={form.assetType}
          rows={[
            {
              label: 'Images',
              value: `${form.uploadSlots.filter((s) => s.status === 'done').length} of 6 uploaded`,
            },
          ]}
        >
          {form.uploadSlots.some((s) => s.status === 'done') && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.uploadSlots
                .filter((s) => s.status === 'done' && s.preview)
                .map((s) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={s.id}
                    src={s.preview!}
                    alt={s.label}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ))}
            </div>
          )}
        </ReviewSection>
      </div>

      {/* Terms */}
      <div className="mt-6 rounded-xl border border-[#2A2A3A] bg-[#14141E] p-4">
        <p className="text-xs leading-relaxed text-[#6B6B80]">
          By submitting, you confirm that all information is accurate and that you have the legal
          authority to list this asset. Your listing will be reviewed by the TIGI compliance team
          within 1–2 business days before going live.
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <Button variant="secondary" size="lg" onClick={onBack} disabled={isSubmitting}>
          <ChevronLeft /> Back
        </Button>
        <Button
          variant="primary"
          size="xl"
          onClick={onSubmit}
          loading={isSubmitting}
          className="w-full sm:w-auto"
        >
          Submit Listing
        </Button>
      </div>
    </div>
  )
}

interface ReviewSectionProps {
  title: string
  assetType: AssetType | null
  rows: { label: string; value: string }[]
  children?: React.ReactNode
}

function ReviewSection({ title, assetType, rows, children }: ReviewSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#14141E]">
      <div
        className="px-4 py-2.5"
        style={{ backgroundColor: accentMuted(assetType) }}
      >
        <p className={cn('text-xs font-semibold uppercase tracking-widest', accentText(assetType))}>
          {title}
        </p>
      </div>
      <div className="divide-y divide-[#2A2A3A] px-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-2.5">
            <span className="shrink-0 text-xs text-[#6B6B80]">{row.label}</span>
            <span className="text-right text-xs font-medium text-[#F5F5F7]">{row.value}</span>
          </div>
        ))}
      </div>
      {children && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

// ── Shared step actions ────────────────────────────────────────────────────

interface StepActionsProps {
  onBack: () => void
  onNext: () => void
  canNext: boolean
  nextLabel?: string
}

function StepActions({ onBack, onNext, canNext, nextLabel = 'Continue' }: StepActionsProps) {
  return (
    <div className="mt-8 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
      <Button variant="secondary" size="lg" onClick={onBack}>
        <ChevronLeft /> Back
      </Button>
      <Button
        variant="primary"
        size="lg"
        disabled={!canNext}
        onClick={onNext}
        className="w-full sm:w-auto"
      >
        {nextLabel} <ChevronRight />
      </Button>
    </div>
  )
}

// ── Success screen ─────────────────────────────────────────────────────────

function SuccessScreen({ assetType }: { assetType: AssetType | null }) {
  const router = useRouter()

  return (
    <div className="animate-slide-up flex flex-col items-center py-16 text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: accentMuted(assetType) }}
      >
        <CheckCircleIcon style={{ color: accent(assetType) }} className="h-10 w-10" />
      </div>
      <h2 className="mb-3 text-2xl font-bold text-[#F5F5F7]">Listing Submitted</h2>
      <p className="mb-2 max-w-sm text-sm leading-relaxed text-[#A0A0B2]">
        Your listing has been received and is under TIGI compliance review. You'll receive a
        notification within 1–2 business days.
      </p>
      <p className="mb-10 text-xs text-[#6B6B80]">Reference ID: #{Math.random().toString(36).slice(2, 10).toUpperCase()}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" size="lg" onClick={() => router.push('/marketplace')}>
          Browse Marketplace
        </Button>
        <Button variant="primary" size="lg" onClick={() => router.push('/portfolio')}>
          View Portfolio
        </Button>
      </div>
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────

export function CreateListingClient() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, 6)), [])
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    // DB integration path: replace with server action / API call
    await new Promise((r) => setTimeout(r, 1500))
    setIsSubmitting(false)
    setSubmitted(true)
  }, [])

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <SuccessScreen assetType={form.assetType} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Page header */}
      <div className="mb-10">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
            TIGI Marketplace
          </span>
          <span className="text-[#2A2A3A]">/</span>
          <span
            className={cn('text-xs font-semibold uppercase tracking-widest', accentText(form.assetType))}
          >
            New Listing
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#F5F5F7]">Create Listing</h1>
      </div>

      <StepProgress currentStep={step} assetType={form.assetType} />

      <div className="rounded-2xl border border-[#2A2A3A] bg-[#0A0A0F] p-6 shadow-xl sm:p-8">
        {step === 1 && (
          <AssetTypeStep form={form} setForm={setForm} onNext={goNext} />
        )}
        {step === 2 && (
          <BasicDetailsStep form={form} setForm={setForm} onNext={goNext} onBack={goBack} />
        )}
        {step === 3 && (
          <PricingStep form={form} setForm={setForm} onNext={goNext} onBack={goBack} />
        )}
        {step === 4 && (
          <OwnershipStep form={form} setForm={setForm} onNext={goNext} onBack={goBack} />
        )}
        {step === 5 && (
          <MediaStep form={form} setForm={setForm} onNext={goNext} onBack={goBack} />
        )}
        {step === 6 && (
          <ReviewStep
            form={form}
            onBack={goBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}

// ── Inline SVG icons (no external dep) ────────────────────────────────────

function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M9 21V7l6-4v18M9 12h6M9 8h.01M15 12h.01M15 8h.01" />
    </svg>
  )
}

function LandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l4-4 4 3 4-5 4 4" />
      <path d="M3 21h18" />
      <path d="M12 3v4M9.5 5.5l2.5 2.5 2.5-2.5" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  )
}

function UploadIcon({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function CheckCircleIcon({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
