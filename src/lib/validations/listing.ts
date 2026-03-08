import { z } from 'zod'

// ---------------------------------------------------------------------------
// Listing validation schemas — shared between API routes and future forms.
//
// Used by:
//   POST /api/listings         → CreateListingSchema
//   PATCH /api/listings/[id]   → UpdateListingSchema (partial)
//   POST /api/listings/[id]/submit → no body, just auth + ownership check
// ---------------------------------------------------------------------------

const PROPERTY_TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE', 'LAND'] as const
const LISTING_TYPES = ['BUY', 'LEASE', 'BOTH'] as const
const OWNERSHIP_MODELS = ['FULL', 'FRACTIONAL', 'BOTH'] as const

// ── Create (full payload from the multi-step form) ───────────────────────────

export const CreateListingSchema = z.object({
  // Basic info
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().max(5000).default(''),

  // Location
  address: z.string().min(5).max(255),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().default('US'),
  zipCode: z.string().max(20).optional(),

  // Classification
  type: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_TYPES).default('BUY'),
  ownershipModel: z.enum(OWNERSHIP_MODELS).default('FULL'),

  // Pricing
  price: z.number().positive().optional(),
  leaseRateMonthly: z.number().positive().optional(),

  // Property specs (nullable for land)
  sqft: z.number().int().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 5).optional(),

  // Land specs (nullable for property)
  lotAcres: z.number().positive().optional(),
  parcelId: z.string().max(100).optional(),
  zoningCode: z.string().max(50).optional(),

  // Tokenization
  isTokenized: z.boolean().default(false),
  tokenTotalSupply: z.number().int().positive().optional(),
  tokenPricePerFraction: z.number().positive().optional(),
}).superRefine((data, ctx) => {
  // A listing needs at least a sale price or a lease rate
  if (!data.price && !data.leaseRateMonthly) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one of price or leaseRateMonthly is required',
      path: ['price'],
    })
  }
  // Fractional listings need token parameters
  if (data.isTokenized || data.ownershipModel !== 'FULL') {
    if (!data.tokenTotalSupply) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'tokenTotalSupply required for fractional listings', path: ['tokenTotalSupply'] })
    }
    if (!data.tokenPricePerFraction) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'tokenPricePerFraction required for fractional listings', path: ['tokenPricePerFraction'] })
    }
  }
})

// ── Update (all fields optional — PATCH semantics) ───────────────────────────

export const UpdateListingSchema = CreateListingSchema.partial()

// ── TypeScript types ─────────────────────────────────────────────────────────

export type CreateListingInput = z.infer<typeof CreateListingSchema>
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>
