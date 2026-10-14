// ---------------------------------------------------------------------------
// TIGI offer — the single source for products, markets, listing checks and
// fees shown on the public site. Mirrors "TIGI Business Plan v2 — Africa
// first" (Oct 2026). Change numbers here, not in pages, so the site, the plan
// and the pitch deck stay in step.
//
// Everything marked `assumption: true` is a price TIGI is testing in its
// first 90 days, and is labelled that way wherever it is shown.
// ---------------------------------------------------------------------------

export type ProductId = 'verify' | 'shares' | 'legacy'

export interface Product {
  id: ProductId
  name: string
  short: string
  body: string
  status: string
  href: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'verify',
    name: 'TIGI Verify',
    short: 'Title checked at the registry. Money held until the deed moves.',
    body:
      'Before you pay for a plot or a home, TIGI checks the title at the official registry, vets the seller or developer, and holds your money with a licensed escrow partner until the deed is in your name.',
    status: 'Launching first · Nigeria, Senegal, Mali',
    href: '/verify',
  },
  {
    id: 'shares',
    name: 'TIGI Shares',
    short: 'Own part of a vetted rental property, from about $100.',
    body:
      'Buy shares in completed, income-producing buildings that have passed Verify. Rent is paid out to shareholders. Offered only where TIGI holds the licence or exemption.',
    status: 'Kenya sandbox first, then the US',
    href: '/#how',
  },
  {
    id: 'legacy',
    name: 'TIGI Legacy',
    short: 'Name who inherits each holding, and keep the papers with it.',
    body:
      'Name heirs for every property you own through TIGI, keep the deed and documents in one vault, and give your family a guided path through the transfer with partner notaries.',
    status: 'With Verify, from launch',
    href: '/#legacy',
  },
]

/** Every property must pass all five before it can be offered on TIGI Shares. */
export const LISTING_CHECKS: Array<{ title: string; body: string }> = [
  {
    title: 'Title confirmed at the registry',
    body: 'Checked against the official land registry by TIGI and a partner notary, not taken from an uploaded document.',
  },
  {
    title: 'Independent valuation',
    body: 'A licensed valuer prices the property. TIGI’s own AI estimate is shown next to it, never instead of it.',
  },
  {
    title: 'A licensed property manager',
    body: 'An independent local manager collects rent and keeps the building in repair. TIGI keeps the right to audit them.',
  },
  {
    title: 'Taxes, insurance and repairs funded',
    body: 'Property taxes and insurance are paid up and a repair reserve is set aside before the first share is sold.',
  },
  {
    title: 'Completed buildings only',
    body: 'No off-plan or unfinished projects at launch. You buy into something that already stands and earns rent.',
  },
]

export type MarketStatus = 'first' | 'next' | 'parallel'

export interface Market {
  country: string
  flag: string
  products: string
  why: string
  route: string
  status: MarketStatus
  region: 'Africa' | 'North America'
}

export const MARKETS: Market[] = [
  {
    country: 'Nigeria',
    flag: 'NG',
    products: 'Verify, then Legacy',
    why: 'The largest diaspora and the most title fraud.',
    route: 'Verify needs no securities licence. Shares wait for the SEC’s digital-asset rules.',
    status: 'first',
    region: 'Africa',
  },
  {
    country: 'Senegal',
    flag: 'SN',
    products: 'Verify, Legacy',
    why: 'Foreigners can hold full title. A strong network in Dakar.',
    route: 'Verify and Legacy only, until the regional regulator sets tokenisation rules.',
    status: 'first',
    region: 'Africa',
  },
  {
    country: 'Mali',
    flag: 'ML',
    products: 'Verify, Legacy',
    why: 'Title reform under way, and families abroad who buy at home.',
    route: 'Verify and Legacy only, with partner notaries in Bamako.',
    status: 'first',
    region: 'Africa',
  },
  {
    country: 'Kenya',
    flag: 'KE',
    products: 'Shares',
    why: 'The only large African market with a live tokenisation licence.',
    route: 'Capital Markets Authority sandbox, then the tokenisation licence.',
    status: 'next',
    region: 'Africa',
  },
  {
    country: 'Rwanda',
    flag: 'RW',
    products: 'Shares showcase',
    why: 'Africa’s best land registry, and a 2026 law for property-backed tokens.',
    route: 'Capital Market Authority approval.',
    status: 'next',
    region: 'Africa',
  },
  {
    country: 'United States',
    flag: 'US',
    products: 'Shares',
    why: 'Where the largest African diasporas live, and a proven model.',
    route: 'Accredited-investor pilot first, then a Reg A offering open to everyone.',
    status: 'parallel',
    region: 'North America',
  },
  {
    country: 'Canada',
    flag: 'CA',
    products: 'Shares',
    why: 'A large French-speaking West African diaspora, mostly in Montréal.',
    route: 'Offering memorandum through a registered dealer.',
    status: 'parallel',
    region: 'North America',
  },
]

export const MARKET_STATUS_LABEL: Record<MarketStatus, string> = {
  first: 'Launching first',
  next: 'Next',
  parallel: 'Parallel track',
}

export interface Fee {
  product: string
  item: string
  fee: string
  who: string
  when: string
  assumption?: boolean
}

export const FEES: Fee[] = [
  { product: 'Verify', item: 'Title check', fee: '$150 per property', who: 'Buyer', when: 'When you order the check', assumption: true },
  { product: 'Verify', item: 'Escrow', fee: '1% of the price, minimum $250', who: 'Buyer', when: 'Only when the deed transfers', assumption: true },
  { product: 'Shares', item: 'Sourcing', fee: '3% of the purchase price', who: 'Built into the offering', when: 'Once, when the property is bought' },
  { product: 'Shares', item: 'Management', fee: '1% of property value a year', who: 'Built into the offering', when: 'Monthly, from rental income' },
  { product: 'Shares', item: 'Resale', fee: '1% of the sale', who: 'Seller', when: 'When you sell shares' },
  { product: 'Legacy', item: 'Subscription', fee: '$5 a month or $49 a year', who: 'Subscriber', when: 'Monthly or yearly' },
  { product: 'Pro', item: 'Research tools', fee: '$29 a month', who: 'Subscriber', when: 'Monthly' },
  { product: 'Developers', item: 'Structuring and listing', fee: '$10,000–25,000 per project', who: 'Developer', when: 'Per project' },
]

/** Rules TIGI follows from day one (plan §9). */
export const PRINCIPLES: Array<{ title: string; body: string }> = [
  { title: 'Licence first', body: 'No shares are sold in a country until TIGI holds the licence or exemption it needs there.' },
  { title: 'We never hold your money', body: 'Purchase money sits with a licensed bank, trustee, broker-dealer or escrow agent, never in TIGI’s accounts.' },
  { title: 'The register is the record', body: 'The legal record of who owns what is the official register. The blockchain keeps a matching copy you can check.' },
  { title: 'No keys to manage', body: 'Accounts are custodial by default. You never need a crypto wallet to use TIGI.' },
  { title: 'Verified people only', body: 'Identity and anti-money-laundering checks on every buyer and investor, through a licensed provider.' },
  { title: 'No promised liquidity', body: 'Shares are long-term holdings. You can sell only where a licensed resale venue exists.' },
]

export const RAISE = {
  amount: '$3M',
  stage: 'pre-seed',
  months: 24,
}
