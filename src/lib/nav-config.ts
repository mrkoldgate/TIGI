// ---------------------------------------------------------------------------
// TIGI Nav Config — Centralized navigation definitions
// Single source of truth for all nav labels, routes, and descriptions.
// Consumed by: MarketingNav, MarketingFooter (marketing hrefs)
// Sidebar uses this for labels; platform hrefs are defined inline there.
// ---------------------------------------------------------------------------

export interface MainNavItem {
  key: string
  label: string
  marketingHref: string
  platformHref: string
  description: string // screen reader / potential dropdown tooltip
}

// Primary nav items — vocabulary intentionally non-technical
export const MAIN_NAV: MainNavItem[] = [
  {
    key: 'explore',
    label: 'Explore',
    marketingHref: '/marketplace',
    platformHref: '/marketplace',
    description: 'Browse tokenized real estate properties',
  },
  {
    key: 'invest',
    label: 'Invest',
    marketingHref: '/invest',
    platformHref: '/portfolio',
    description: 'Fractional ownership from any amount',
  },
  {
    key: 'land',
    label: 'Land',
    marketingHref: '/land',
    platformHref: '/leasing',
    description: 'Lease or acquire land assets',
  },
  {
    key: 'legacy',
    label: 'Legacy',
    marketingHref: '/legacy',
    platformHref: '/inheritance',
    description: 'Estate planning and asset transfer',
  },
  {
    key: 'insights',
    label: 'Insights',
    marketingHref: '/insights',
    platformHref: '/insights',
    description: 'AI-powered market intelligence',
  },
]

// Footer link columns
export const FOOTER_LINKS = {
  Platform: [
    { label: 'Explore Properties', href: '/marketplace' },
    { label: 'Invest', href: '/invest' },
    { label: 'Land & Leasing', href: '/land' },
    { label: 'Legacy Planning', href: '/legacy' },
    { label: 'Insights', href: '/insights' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'For Investors', href: '/investors' },
    { label: 'For Owners', href: '/owners' },
    { label: 'Careers', href: '/careers' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Risk Disclosure', href: '/legal/risk-disclosure' },
    { label: 'Offering Documents', href: '/legal/offering' },
  ],
}
