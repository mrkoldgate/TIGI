import {
  ShoppingBag,
  TrendingUp,
  Tag,
  Building2,
  MapPin,
  HardHat,
  Scale,
  BarChart2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ---------------------------------------------------------------------------
// Onboarding configuration — single source of truth for:
//   1. Step definitions (path, label, step number)
//   2. Role cards (8 user-facing roles → DB role mapping)
//   3. Interests config (dynamic questions per role)
// ---------------------------------------------------------------------------

// =============================================================================
// Steps
// =============================================================================

export type OnboardingStepKey = 'role' | 'profile' | 'interests' | 'complete'

export interface OnboardingStep {
  key: OnboardingStepKey
  path: string
  label: string
  step: number // 1-indexed
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { key: 'role',      path: '/onboarding/role',      label: 'Your role',  step: 1 },
  { key: 'profile',   path: '/onboarding/profile',   label: 'Profile',    step: 2 },
  { key: 'interests', path: '/onboarding/interests', label: 'Interests',  step: 3 },
  { key: 'complete',  path: '/onboarding/complete',  label: 'All set',    step: 4 },
]

export const TOTAL_STEPS = ONBOARDING_STEPS.length

// =============================================================================
// Role cards
// =============================================================================

export type UserTypeValue =
  | 'BUYER'
  | 'INVESTOR'
  | 'SELLER'
  | 'PROPERTY_OWNER'
  | 'LAND_OWNER'
  | 'DEVELOPER'
  | 'LEGAL_PROFESSIONAL'
  | 'FINANCIAL_PROFESSIONAL'

export type DbRole = 'INVESTOR' | 'OWNER' | 'BOTH'

export interface RoleCard {
  userType: UserTypeValue
  dbRole: DbRole
  label: string
  tagline: string
  description: string
  icon: LucideIcon
  // Subtle gradient for card background (dark, TIGI palette)
  gradient: string
  badge?: string // e.g. "Popular"
}

export const ROLE_CARDS: RoleCard[] = [
  {
    userType: 'BUYER',
    dbRole: 'INVESTOR',
    label: 'Buyer',
    tagline: 'Purchase properties outright',
    description:
      'Find and buy residential or commercial properties. Full ownership, direct transactions, on-chain title transfer.',
    icon: ShoppingBag,
    gradient: 'linear-gradient(145deg, #0F1820 0%, #0A1420 100%)',
  },
  {
    userType: 'INVESTOR',
    dbRole: 'INVESTOR',
    label: 'Investor',
    tagline: 'Fractional ownership from any amount',
    description:
      'Invest in tokenized property fractions, earn passive yield, and build a diversified real estate portfolio.',
    icon: TrendingUp,
    gradient: 'linear-gradient(145deg, #0F1A14 0%, #0A1810 100%)',
    badge: 'Popular',
  },
  {
    userType: 'SELLER',
    dbRole: 'OWNER',
    label: 'Seller',
    tagline: 'List and sell your property',
    description:
      'List your property on TIGI, accept offers from verified buyers, and close deals with on-chain settlement.',
    icon: Tag,
    gradient: 'linear-gradient(145deg, #1A100A 0%, #180D08 100%)',
  },
  {
    userType: 'PROPERTY_OWNER',
    dbRole: 'OWNER',
    label: 'Property Owner',
    tagline: 'Manage and tokenize your assets',
    description:
      'List properties for fractional sale or full sale, manage tenants, receive rental distributions on-chain.',
    icon: Building2,
    gradient: 'linear-gradient(145deg, #121018 0%, #0E0C16 100%)',
  },
  {
    userType: 'LAND_OWNER',
    dbRole: 'OWNER',
    label: 'Land Owner',
    tagline: 'Unlock value from land assets',
    description:
      'List land parcels for sale, lease, or development. Connect with developers and investors seeking raw land.',
    icon: MapPin,
    gradient: 'linear-gradient(145deg, #101A10 0%, #0C1A0C 100%)',
  },
  {
    userType: 'DEVELOPER',
    dbRole: 'BOTH',
    label: 'Developer',
    tagline: 'Fund, build, and sell projects',
    description:
      'List development projects for investment, source land, manage investor distributions, and exit on-chain.',
    icon: HardHat,
    gradient: 'linear-gradient(145deg, #1A1408 0%, #181006 100%)',
  },
  {
    userType: 'LEGAL_PROFESSIONAL',
    dbRole: 'INVESTOR',
    label: 'Legal Professional',
    tagline: 'Real estate law & compliance',
    description:
      'Access deal flow, review on-chain contracts, advise clients on tokenized transactions and compliance.',
    icon: Scale,
    gradient: 'linear-gradient(145deg, #0A0F1A 0%, #080C18 100%)',
  },
  {
    userType: 'FINANCIAL_PROFESSIONAL',
    dbRole: 'INVESTOR',
    label: 'Financial Advisor',
    tagline: 'Guide clients to real estate wealth',
    description:
      'Explore tokenized real estate for client portfolios, access valuation data, and monitor yield performance.',
    icon: BarChart2,
    gradient: 'linear-gradient(145deg, #0A1018 0%, #080E16 100%)',
  },
]

// Derive DB role from userType
export function getDbRole(userType: UserTypeValue): DbRole {
  const card = ROLE_CARDS.find((c) => c.userType === userType)
  return card?.dbRole ?? 'INVESTOR'
}

// =============================================================================
// Interests config — dynamic questions per role
// =============================================================================

export interface InterestOption {
  value: string
  label: string
}

export interface InterestQuestion {
  id: string
  label: string
  hint?: string
  options: InterestOption[]
}

export type InterestsConfig = Record<UserTypeValue, InterestQuestion[]>

const PROPERTY_TYPE_QUESTION: InterestQuestion = {
  id: 'propertyTypes',
  label: 'Which property types interest you most?',
  options: [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land & lots' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'mixed', label: 'Mixed use' },
  ],
}

const BUDGET_QUESTION: InterestQuestion = {
  id: 'budgetRange',
  label: 'What is your approximate investment budget?',
  options: [
    { value: 'under_50k', label: 'Under $50,000' },
    { value: '50k_250k', label: '$50,000 – $250,000' },
    { value: '250k_1m', label: '$250,000 – $1M' },
    { value: '1m_plus', label: '$1M+' },
  ],
}

const GEO_QUESTION: InterestQuestion = {
  id: 'geographicFocus',
  label: 'Where are you primarily focused?',
  options: [
    { value: 'local', label: 'My city / region' },
    { value: 'national', label: 'Nationwide' },
    { value: 'international', label: 'International' },
    { value: 'no_preference', label: 'No preference' },
  ],
}

const HORIZON_QUESTION: InterestQuestion = {
  id: 'investmentHorizon',
  label: 'What is your investment horizon?',
  options: [
    { value: 'short', label: 'Short-term (< 2 years)' },
    { value: 'mid', label: 'Mid-term (2–5 years)' },
    { value: 'long', label: 'Long-term (5+ years)' },
    { value: 'flexible', label: 'Flexible' },
  ],
}

const LISTING_TIMELINE_QUESTION: InterestQuestion = {
  id: 'listingTimeline',
  label: 'When are you looking to list?',
  options: [
    { value: 'now', label: 'Within 3 months' },
    { value: 'soon', label: '3–12 months' },
    { value: 'later', label: '12+ months' },
    { value: 'exploring', label: 'Just exploring' },
  ],
}

const PROPERTY_COUNT_QUESTION: InterestQuestion = {
  id: 'propertyCount',
  label: 'How many properties do you own?',
  options: [
    { value: '1', label: '1 property' },
    { value: '2_5', label: '2–5 properties' },
    { value: '6_20', label: '6–20 properties' },
    { value: '20_plus', label: '20+' },
  ],
}

export const INTERESTS_CONFIG: InterestsConfig = {
  BUYER: [
    PROPERTY_TYPE_QUESTION,
    BUDGET_QUESTION,
    GEO_QUESTION,
  ],

  INVESTOR: [
    PROPERTY_TYPE_QUESTION,
    BUDGET_QUESTION,
    HORIZON_QUESTION,
    GEO_QUESTION,
  ],

  SELLER: [
    PROPERTY_TYPE_QUESTION,
    LISTING_TIMELINE_QUESTION,
    GEO_QUESTION,
  ],

  PROPERTY_OWNER: [
    PROPERTY_COUNT_QUESTION,
    PROPERTY_TYPE_QUESTION,
    {
      id: 'ownerGoal',
      label: 'What is your primary goal on TIGI?',
      options: [
        { value: 'liquidity', label: 'Access liquidity' },
        { value: 'passive_income', label: 'Passive rental income' },
        { value: 'portfolio_optimize', label: 'Portfolio optimization' },
        { value: 'legacy', label: 'Estate & legacy planning' },
      ],
    },
  ],

  LAND_OWNER: [
    {
      id: 'landType',
      label: 'What type of land do you own?',
      options: [
        { value: 'residential_plot', label: 'Residential plot' },
        { value: 'agricultural', label: 'Agricultural' },
        { value: 'commercial_site', label: 'Commercial site' },
        { value: 'raw_land', label: 'Raw / undeveloped' },
      ],
    },
    LISTING_TIMELINE_QUESTION,
    GEO_QUESTION,
  ],

  DEVELOPER: [
    {
      id: 'projectType',
      label: 'What kind of projects do you develop?',
      options: [
        { value: 'residential', label: 'Residential housing' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'mixed_use', label: 'Mixed-use' },
        { value: 'renovation', label: 'Renovation / repositioning' },
      ],
    },
    {
      id: 'fundingNeed',
      label: 'Typical project funding needed?',
      options: [
        { value: 'under_1m', label: 'Under $1M' },
        { value: '1m_10m', label: '$1M – $10M' },
        { value: '10m_plus', label: '$10M+' },
      ],
    },
    GEO_QUESTION,
  ],

  LEGAL_PROFESSIONAL: [
    {
      id: 'specialization',
      label: 'Your area of specialization?',
      options: [
        { value: 'real_estate_law', label: 'Real estate law' },
        { value: 'corporate_law', label: 'Corporate & M&A' },
        { value: 'tax_law', label: 'Tax & compliance' },
        { value: 'estate_planning', label: 'Estate planning' },
      ],
    },
    {
      id: 'clientTypes',
      label: 'Who are your primary clients?',
      options: [
        { value: 'individuals', label: 'Individual buyers / sellers' },
        { value: 'investors', label: 'Investors & funds' },
        { value: 'developers', label: 'Developers' },
        { value: 'institutions', label: 'Institutional' },
      ],
    },
  ],

  FINANCIAL_PROFESSIONAL: [
    {
      id: 'specialization',
      label: 'Your area of practice?',
      options: [
        { value: 'wealth_management', label: 'Wealth management' },
        { value: 'financial_planning', label: 'Financial planning' },
        { value: 'portfolio_advisory', label: 'Portfolio advisory' },
        { value: 'fund_management', label: 'Fund management' },
      ],
    },
    {
      id: 'clientTypes',
      label: 'Typical client profile?',
      options: [
        { value: 'retail', label: 'Retail investors' },
        { value: 'hnw', label: 'High-net-worth individuals' },
        { value: 'institutional', label: 'Institutional clients' },
        { value: 'family_office', label: 'Family offices' },
      ],
    },
  ],
}
