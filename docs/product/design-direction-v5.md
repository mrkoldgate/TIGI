# TIGI — Design Direction v5 "Hyper-Glass Elite, refined"

> **Status:** Proposed (branch `redesign/tigi-v5`, built on top of the local Antigravity v4 work)
> **Keeps:** everything the owner asked for in v4 — pure black canvas, nested glass trays, top-edge lighting, indigo action colour, glow orbs, scroll animation, parallax, glossy translucent buttons, rich hover.
> **Adds:** a clearer type system, photography as content, real investment patterns, honest copy, and a CSS fix that was breaking spacing across the app.

## References

| Reference | What TIGI takes from it |
|---|---|
| Hen-ry, Glassflow, Dimension, Wope, Paragon, Novu (v4 brief) | Black base, layered glass, outer **trays** with nested **cells**, 1px top-edge light, inner rim bevel, indigo halo on hover, cyan "live" indicators. |
| Mercury (Refero Styles) | Full-bleed photography before product UI, one action colour, pill controls, measured display weight, calm spacing. |
| Revolut, Wealthsimple, Wise, Coinbase, Apple | Same discipline: one action colour, photography carries atmosphere, pills, no clutter. Coinbase: green/red price semantics. |
| Coinbase "Explore" / Robinhood (Refero Screens) | Market table (filters, price, change, sparkline, one action per row) and the order ticket. |
| Netflix / Prime Video / Apple TV | "Browse by collection" photo rail. |
| MANNA, Samara (architecture) | Photo plates with captions in the gutter. |
| INVERSA, Origin Financial | Mono uppercase labels as the data voice. |
| Amissa Studios site | Numbered chapters with a running label. |

## Tokens

| Role | Value |
|---|---|
| Canvas | `#000000` (surfaces `#050505`, `#0A0A0F`) |
| Glass | `bg-white/[0.02–0.05]`, blur 16–48px, hairline `white/[0.04–0.08]` |
| Text | `#F5F5F7` primary · `#C3C3CC` body · `#8E8E9C` labels |
| Action | Indigo `#6366F1` → hover `#818CF8` (glossy gradient + rim light + halo) |
| Live / on-chain | Cyan `#22D3EE` |
| Positive / negative | Emerald `#34D399` / Red `#F87171` (data only) |
| Pending | Amber `#F59E0B` |
| Display type | Archivo variable, width 106–112%, weight 500–520 |
| UI type | Inter |
| Data type | JetBrains Mono, uppercase labels, tabular figures |

## Motion

- Hero headline words rise in (pure CSS, always ends visible).
- `[data-reveal]` scroll reveals (`up`, `fade`, `blur`, `scale`, `left`, `right`, `clip`) driven by a tiny inline script — independent of React, so content can never get stuck hidden; respects reduced motion.
- Parallax: hero photo sinks/scales while copy lifts; photo plates drift inside their frames.
- Hover: sheen sweep on buttons, cell edge-light widens with an indigo halo, images zoom, table rows get an indigo marker, cards tilt.

## Content rules

- Every number on public pages is a product rule (minimum, plan price) or labelled **sample / illustration**.
- Private-beta status appears in the hero, the trust section and the footer.
- Estate and AI features carry their "not legal advice / not an appraisal" notes.

## Fix worth knowing

`globals.css` reset `* { padding: 0; margin: 0 }` outside a CSS layer. In Tailwind v4 that beats every spacing utility (`p-*`, `m-*`, `mx-auto`, `space-y-*`), which is why sections looked cramped or collapsed. Base rules now sit in `@layer base` and custom classes in `@layer components`.
