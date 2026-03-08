// ---------------------------------------------------------------------------
// ListingService — TIGI listing persistence layer.
//
// Responsibilities:
//   - Create and update listing drafts linked to the authenticated owner
//   - Transition listing status (DRAFT → UNDER_REVIEW)
//   - Fetch owner's listings and single listings by ID
//
// Architecture:
//   ListingService class (injectable, testable)
//   createListingService() factory → consumers use the factory
//   All Prisma calls go through this layer; no Prisma imports in route handlers
//
// Upgrade path:
//   - Add audit log writes once AuditLog service is extracted
//   - Add email notifications (trigger on submit / approve / reject)
//   - Replace `createListingService()` factory with dependency injection
//     if the service module pattern grows more complex
// ---------------------------------------------------------------------------

import type { Property, ListingStatus } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { CreateListingInput, UpdateListingInput } from '@/lib/validations/listing'

// ── Error types ──────────────────────────────────────────────────────────────

export class ListingNotFoundError extends Error {
  constructor(id: string) {
    super(`Listing ${id} not found`)
    this.name = 'ListingNotFoundError'
  }
}

export class ListingForbiddenError extends Error {
  constructor() {
    super('You do not have permission to modify this listing')
    this.name = 'ListingForbiddenError'
  }
}

export class ListingStateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ListingStateError'
  }
}

// ── Service interface ────────────────────────────────────────────────────────

export interface IListingService {
  createDraft(input: CreateListingInput, userId: string): Promise<Property>
  updateListing(id: string, input: UpdateListingInput, userId: string): Promise<Property>
  submitForReview(id: string, userId: string): Promise<Property>
  getOwnerListings(userId: string): Promise<Property[]>
  getListing(id: string): Promise<Property | null>
}

// ── Implementation ───────────────────────────────────────────────────────────

class ListingServiceImpl implements IListingService {
  async createDraft(input: CreateListingInput, userId: string): Promise<Property> {
    return prisma.property.create({
      data: {
        ownerId: userId,
        title: input.title,
        description: input.description ?? '',
        type: input.type,
        status: 'DRAFT',
        listingType: input.listingType ?? 'BUY',
        ownershipModel: input.ownershipModel ?? 'FULL',

        // Location
        address: input.address,
        city: input.city,
        state: input.state,
        country: input.country ?? 'US',
        zipCode: input.zipCode,

        // Pricing
        price: input.price != null ? input.price : undefined,
        leaseRateMonthly: input.leaseRateMonthly != null ? input.leaseRateMonthly : undefined,

        // Property specs
        sqft: input.sqft,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        yearBuilt: input.yearBuilt,

        // Land specs
        lotAcres: input.lotAcres,
        parcelId: input.parcelId,
        zoningCode: input.zoningCode,

        // Tokenization
        isTokenized: input.isTokenized ?? false,
      },
    })
  }

  async updateListing(id: string, input: UpdateListingInput, userId: string): Promise<Property> {
    const existing = await this._requireOwnership(id, userId)

    // Only allow edits on mutable statuses
    const mutableStatuses: ListingStatus[] = ['DRAFT', 'UNDER_REVIEW']
    if (!mutableStatuses.includes(existing.status)) {
      throw new ListingStateError(`Cannot edit a listing with status ${existing.status}`)
    }

    // If editing an UNDER_REVIEW listing, reset to DRAFT so it gets re-reviewed
    const resetToDraft = existing.status === 'UNDER_REVIEW'

    return prisma.property.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.listingType !== undefined && { listingType: input.listingType }),
        ...(input.ownershipModel !== undefined && { ownershipModel: input.ownershipModel }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.state !== undefined && { state: input.state }),
        ...(input.zipCode !== undefined && { zipCode: input.zipCode }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.leaseRateMonthly !== undefined && { leaseRateMonthly: input.leaseRateMonthly }),
        ...(input.sqft !== undefined && { sqft: input.sqft }),
        ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
        ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
        ...(input.yearBuilt !== undefined && { yearBuilt: input.yearBuilt }),
        ...(input.lotAcres !== undefined && { lotAcres: input.lotAcres }),
        ...(input.parcelId !== undefined && { parcelId: input.parcelId }),
        ...(input.zoningCode !== undefined && { zoningCode: input.zoningCode }),
        ...(input.isTokenized !== undefined && { isTokenized: input.isTokenized }),
        ...(resetToDraft && { status: 'DRAFT' as ListingStatus }),
      },
    })
  }

  async submitForReview(id: string, userId: string): Promise<Property> {
    const existing = await this._requireOwnership(id, userId)

    if (existing.status !== 'DRAFT') {
      throw new ListingStateError(
        existing.status === 'UNDER_REVIEW'
          ? 'Listing is already under review'
          : `Cannot submit a listing with status ${existing.status}`,
      )
    }

    return prisma.property.update({
      where: { id },
      data: { status: 'UNDER_REVIEW' },
    })
  }

  async getOwnerListings(userId: string): Promise<Property[]> {
    return prisma.property.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getListing(id: string): Promise<Property | null> {
    return prisma.property.findUnique({ where: { id } })
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async _requireOwnership(id: string, userId: string): Promise<Property> {
    const listing = await prisma.property.findUnique({ where: { id } })
    if (!listing) throw new ListingNotFoundError(id)
    if (listing.ownerId !== userId) throw new ListingForbiddenError()
    return listing
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createListingService(): IListingService {
  return new ListingServiceImpl()
}
