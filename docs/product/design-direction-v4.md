# TIGI — Design Direction v4 "Private Ledger"

> **Status:** Proposed (branch `redesign/private-ledger`)
> **Supersedes:** the v3 "neon / glass" pivot. Returns to the intent of `design-principles.md` (§1: private wealth office, gold accent, never neon) with a modern banking execution.

## Research (Refero Styles + Screens, Oct 2026)

| Reference | Role in TIGI |
|---|---|
| **Mercury** — "alpine banking at blue hour" | **Primary.** Onyx canvas `#171721`, graphite cards one value step up `#1E1E2A`, no shadows, pill controls, measured display weight (~480), full-bleed photographic hero before product UI, one chromatic colour reserved for the primary action. |
| Revolut, Wealthsimple, Wise, Coinbase, Apple | Confirm the same rules: one action colour, pills, no shadows, monochrome UI with colour carried by photography. Coinbase supplies semantic up/down colours for price moves. |
| Coinbase "Explore" / Robinhood order panel (Screens) | Market table (filter chips, name + code, price, change, sparkline, one action per row) and the order-ticket illustration. |
| Netflix / Prime Video / Apple TV | "Browse by collection" photo rail: landscape cards, horizontal scroll-snap, title beneath. |
| MANNA, Samara (architecture) | Photography is content: square-cornered plates, captions in the gutter beneath, no tinted overlays (a legibility scrim only where text sits on the image). |
| INVERSA, Origin Financial | Mono uppercase labels as the "survey / data" voice (codes, captions, labels). |
| Amissa Studios site | Numbered chapters with a running label (`01 MARKET`). |

## Reference lock

- **Preserve (Mercury):** onyx canvas, graphite card lift, no shadows or glass, pill buttons, display weight ~480 never bold, spacious rhythm, photographic hero.
- **Brand substitution:** Mercury's cobalt → **TIGI gold `#C9A84C`**, used **only** for the primary action (and focus ring). Not for text, icons, borders or decoration.
- **Borrow only:** mono labels (INVERSA/Origin), gutter captions (MANNA), chapter numbers (Amissa), market table + order ticket (Coinbase/Robinhood), collection rail (streaming apps).
- **Reject:** blue/violet accents, glassmorphism, glows, gradient text, orbs, particle backgrounds, custom cursor, magnetic buttons, invented platform statistics.

## Tokens

| Token | Value | Role |
|---|---|---|
| Canvas | `#171721` | Page background |
| Card | `#1E1E2A` | Raised surfaces |
| Control | `#272735` | Secondary fills, inputs |
| Ivory | `#EDEDF3` | Headings, primary text, secondary (outline/inverse) buttons |
| Ash | `#C3C3CC` | Body copy |
| Muted | `#8E8E9C` | Labels, captions |
| Gold | `#C9A84C` / hover `#D4B45E` | Primary action only |
| Up / Down | `#7FD1A8` / `#F08A80` | Price change, data only |
| Display | Archivo (variable, width 112%, weight 480) | Headlines |
| UI | Inter | Body and controls |
| Data | JetBrains Mono | Labels, codes, figures |
| Radius | pills for controls · 12px cards · square photo plates | |

## Content rules

- Every number on public pages is a product rule (minimum, plan price) or labelled **sample / illustration**.
- Private-beta status is stated in the hero, the trust section and the footer.
- Estate and AI features carry their "not legal advice / not an appraisal" notes.
