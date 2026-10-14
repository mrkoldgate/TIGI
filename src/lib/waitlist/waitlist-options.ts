// ---------------------------------------------------------------------------
// Waitlist options — shared by the /waitlist form (client) and the API route
// (server). Client-safe: no Node imports.
// ---------------------------------------------------------------------------

export const WAITLIST_INTERESTS = [
  { id: 'verify', label: 'Verify a property I’m buying', hint: 'Title check and escrow' },
  { id: 'shares', label: 'Own shares in rental property', hint: 'Where licensed' },
  { id: 'legacy', label: 'Plan who inherits my property', hint: 'Legacy' },
  { id: 'list', label: 'List a property or project', hint: 'Owners and developers' },
  { id: 'investor', label: 'Invest in TIGI the company', hint: 'Angels and funds' },
] as const

export type WaitlistInterest = (typeof WAITLIST_INTERESTS)[number]['id']
export const WAITLIST_INTEREST_IDS = WAITLIST_INTERESTS.map((i) => i.id) as WaitlistInterest[]

/** Where people want to buy or invest. Launch markets first. */
export const WAITLIST_MARKETS = [
  'Nigeria',
  'Senegal',
  'Mali',
  'Kenya',
  'Rwanda',
  'Côte d’Ivoire',
  'Ghana',
  'United States',
  'Canada',
  'Other',
] as const

/** Where people live — the diaspora hubs first. */
export const WAITLIST_HOMES = [
  'United States',
  'Canada',
  'France',
  'United Kingdom',
  'United Arab Emirates',
  'Nigeria',
  'Senegal',
  'Mali',
  'Kenya',
  'Other',
] as const

export const WAITLIST_AMOUNTS = [
  'Under $1,000',
  '$1,000 – $10,000',
  '$10,000 – $50,000',
  '$50,000 – $250,000',
  'Over $250,000',
  'Not sure yet',
] as const
