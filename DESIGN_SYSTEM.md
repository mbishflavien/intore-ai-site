# IntoreAI Design System

One-page rationale + token reference. The contract behind `@intoreai/design-system`
(`packages/design-system/`). Both the marketing site and the product app import from
this package — never hardcode these values twice.

## 1. Brand idea

Fintech-grade, trustworthy, African-tech-forward. The whole pitch is
**"AI assists, humans decide"** — the visual language must feel precise and
confident, never gimmicky. Warm paper instead of sterile white, deep green-black
ink instead of pure black, one confident emerald reserved for action.

## 2. Type system

- **Display:** Fraunces (variable serif, `font-display`). Characterful, editorial,
  used for oversized headlines and stat numerals only.
- **Workhorse:** Public Sans (`font-sans`). Body, UI, labels, dashboards.
- Self-hosted via `next/font` (build-time download, zero runtime CDN calls).
- Fluid marketing scale: hero `clamp(3rem, 9vw, 8.5rem)` → h3.
- Compact dashboard scale (same two faces, tighter rhythm): title 1.25rem,
  body 0.875rem, label 0.6875rem uppercase.

## 3. Color system

| Token | Value | Meaning |
|---|---|---|
| `paper` | #f6f3ec | Default background (warm, not #fff) |
| `parchment` | #ede8db | Alt section background |
| `ink` | #131b17 | Primary text (never #000) |
| `mist` | #6b7670 | Secondary text |
| `line` | #dcd5c4 | Borders/dividers |
| `night` | #0e1512 | Dark sections |
| `signal` | #12805c | **CTA + active states ONLY** |
| `clay` | #c2542b | Editorial emphasis, kickers, callouts |
| `gold` | #d9a441 | Rare stat accents |

Semantic layer (`surface`, `text-primary`, `accent`, `success`, `warning`,
`danger`) sits on top so dark hero sections and light dashboards share logic.
No gradients-as-identity, no blurred blobs, no purple/blue SaaS cliché.

## 4. Spacing / grid

4pt base scale, 12-column grid, generous outer gutters (`--gutter: clamp(20px, 5vw, 72px)`).
Marketing uses the airy end of the scale; dashboards use the same scale at
denser increments. Never a magic number — always a token or scale step.

## 5. Motion language

- **Easing:** expo-out `cubic-bezier(0.16, 1, 0.3, 1)` for everything content-facing.
- **Durations:** micro 150–300ms · reveals 600–900ms · hero sequence 1.2–2s · staggers 30–100ms.
- **Scrub-linked** (tied to scroll position): pinned storytelling, path-drawing,
  horizontal modules — marketing only.
- **Trigger-once** (plays entering viewport): cards, stats, testimonials — and all
  dashboard list/toast/modal motion (same easing, no scroll link).
- **Custom cursor:** marketing only, disabled on touch + keyboard-safe.
- `prefers-reduced-motion` always gets a static, still-attractive fallback.

## 6. Iconography / illustration

Custom SVG only. No decorative icon-pack glyphs, no emoji status indicators.
The same stroke language (1.75px, round caps, ink/signal/clay) serves marketing
decoration and product empty/status states.
