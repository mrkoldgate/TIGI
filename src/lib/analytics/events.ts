// ---------------------------------------------------------------------------
// TIGI Analytics — typed event catalogue.
//
// Architecture: provider-agnostic events are sent to POST /api/analytics
// which can fan out to PostHog, Segment, Mixpanel, or any other provider.
// In development they are also logged to the console.
//
// Adding a new event:
//   1. Add a new variant to TIGIEvent below
//   2. Call track({ name: 'event.name', properties: { ... } }) at the site
//   3. No other changes needed — the ingest route handles persistence
// ---------------------------------------------------------------------------

export type TIGIEvent =
  | {
      name: 'listing.viewed'
      properties: {
        listingId:    string
        propertyType: string
        isLand:       boolean
        price:        number
      }
    }
  | {
      name: 'inquiry.submitted'
      properties: {
        listingId:     string
        inquiryType:   string
        propertyTitle: string
      }
    }
  | {
      name: 'favorite.saved'
      properties: { listingId: string }
    }
  | {
      name: 'favorite.removed'
      properties: { listingId: string }
    }
  | {
      name: 'intent.created'
      properties: { listingId: string; intentType: string }
    }
  | {
      name: 'premium.gate.viewed'
      properties: { feature: string; location?: string }
    }
  | {
      name: 'upgrade.cta.clicked'
      properties: { location: string }
    }
  | {
      name: 'assistant.opened'
      properties?: Record<string, unknown>
    }
  | {
      name: 'valuation.viewed'
      properties: { listingId: string; isPro: boolean; assetType: string }
    }
  | {
      name: 'legacy.created'
      properties?: { beneficiaryCount?: number }
    }
  | {
      name: 'page.viewed'
      properties: { path: string; title?: string }
    }
