/**
 * asset-representation.ts — Combines off-chain Property data with on-chain
 * Token data into a single AssetRepresentation object.
 *
 * IMPORTANT — Messaging rules:
 *   ✅  "Fractional economic interest"
 *   ✅  "Digital record of proportional economic interest"
 *   ✅  "Proportional participation in asset economics"
 *   ❌  "Ownership" (implies legal title transfer)
 *   ❌  "Title" (a legal instrument — not what tokens represent here)
 *   ❌  "Deed" or "Certificate" (same concern)
 *
 * These constraints are enforced by always sourcing user-facing copy
 * from the ASSET_MESSAGING constant below. Never hardcode investment
 * copy directly in UI components — import from here.
 *
 * All functions are wrapped in React cache() for request deduplication.
 */

import { cache } from 'react'
import { prisma } from '@/lib/db'
import { getExplorerUrl, getNetwork } from './client'
import type { SolanaNetwork } from './client'

// ── Messaging constants ────────────────────────────────────────────────────
// Single source of truth for legally-accurate, mainstream-friendly copy.
// UI components import these constants rather than hardcoding strings.

export const ASSET_MESSAGING = {
  /** The short instrument name shown in badges and labels */
  instrumentName: 'Fractional Economic Interest',

  /** One-line description shown near investment CTAs */
  shortDescription:
    'A digital record of proportional economic interest in this property.',

  /** Multi-line disclosure shown on invest confirmation and statements */
  fullDisclosure:
    'Fractional interests are digital records of proportional participation ' +
    'in the economic performance of the underlying property. ' +
    'They do not represent legal title, deed, or ownership of real property. ' +
    'Returns are subject to market conditions and are not guaranteed. ' +
    'This is not a securities offering. Please review full disclosures before investing.',

  /** Short compliance note for invest buttons */
  complianceNote:
    'Not a securities offering. Digital economic interest only. Returns not guaranteed.',

  /** CTA label for acquiring fractional interest */
  investCta: 'Acquire Fractional Interest',

  /** Short CTA for mobile */
  investCtaShort: 'Invest',

  /** Shown after a successful intent submission */
  intentSubmittedMessage:
    'Your interest has been registered. Our team will review and reach out within 1–2 business days.',

  /** Shown after the on-chain record is confirmed */
  onChainConfirmedMessage:
    'Your fractional interest record has been recorded on Solana.',

  /** Devnet disclaimer */
  devnetNotice:
    'You are on Solana Devnet. No real assets or funds are involved.',
} as const

// ── Types ──────────────────────────────────────────────────────────────────

export interface TokenInfo {
  mintAddress:      string
  totalSupply:      number
  availableSupply:  number
  soldSupply:       number
  soldPercent:      number
  pricePerFraction: number
  status:           string
}

export interface AssetRepresentation {
  propertyId:    string
  propertyTitle: string
  city:          string
  state:         string
  assetType:     'PROPERTY' | 'LAND'
  listPrice:     number | null

  /**
   * Token record. null if this property has not yet been tokenized.
   * Check `token !== null` before showing fractional investment UI.
   */
  token: TokenInfo | null

  /** Legally-accurate, mainstream-friendly copy. Always use this. */
  messaging: typeof ASSET_MESSAGING

  /** On-chain context */
  onChain: {
    /** Current Solana network */
    network:     SolanaNetwork
    /** false on devnet — signals UI to show the devnet notice */
    isMainnet:   boolean
    /** Link to the mint on Solana Explorer (null if no mint yet) */
    explorerUrl: string | null
  }
}

// ── Query ──────────────────────────────────────────────────────────────────

/**
 * Returns the AssetRepresentation for a property.
 * Returns null if the property does not exist or is not ACTIVE.
 *
 * Combines:
 *   - Property row (off-chain application data)
 *   - Token row (on-chain representation config, if tokenized)
 */
export const getAssetRepresentation = cache(
  async (propertyId: string): Promise<AssetRepresentation | null> => {
    try {
      const property = await prisma.property.findUnique({
        where:   { id: propertyId, status: 'ACTIVE' },
        select: {
          id:          true,
          title:       true,
          city:        true,
          state:       true,
          type:        true,
          price:       true,
          isTokenized: true,
          token:       {
            select: {
              mintAddress:      true,
              totalSupply:      true,
              availableSupply:  true,
              pricePerFraction: true,
              status:           true,
            },
          },
        },
      })

      if (!property) return null

      const assetType: 'PROPERTY' | 'LAND' =
        property.type === 'LAND' ? 'LAND' : 'PROPERTY'

      let token: TokenInfo | null = null
      if (property.isTokenized && property.token) {
        const t          = property.token
        const totalSupply = t.totalSupply
        const available   = t.availableSupply
        const sold        = totalSupply - available
        const soldPercent = totalSupply > 0
          ? Math.round((sold / totalSupply) * 100)
          : 0

        token = {
          mintAddress:      t.mintAddress,
          totalSupply,
          availableSupply:  available,
          soldSupply:       sold,
          soldPercent,
          pricePerFraction: Number(t.pricePerFraction),
          status:           t.status,
        }
      }

      const network    = getNetwork()
      const explorerUrl = token
        ? getExplorerUrl(token.mintAddress, 'address')
        : null

      return {
        propertyId:    property.id,
        propertyTitle: property.title,
        city:          property.city,
        state:         property.state,
        assetType,
        listPrice:     property.price ? Number(property.price) : null,
        token,
        messaging:     ASSET_MESSAGING,
        onChain: {
          network,
          isMainnet:   network === 'mainnet-beta',
          explorerUrl,
        },
      }
    } catch (err) {
      console.warn('[asset-representation] DB unavailable:', (err as Error).message)
      return null
    }
  },
)

/**
 * Type guard: returns true if the asset is tokenized and ready for investment.
 */
export function isInvestable(asset: AssetRepresentation): asset is AssetRepresentation & {
  token: TokenInfo
} {
  return asset.token !== null && asset.token.status === 'ACTIVE' && asset.token.availableSupply > 0
}
