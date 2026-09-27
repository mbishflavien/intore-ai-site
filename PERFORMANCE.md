# Performance & Verification Notes

## Production build (measured)

`npm run build` — Next.js 15.5.26, all 7 routes static:

| Route | Size | First Load JS |
|---|---|---|
| `/` (homepage) | 60.9 kB | 163 kB |
| `/demo/shortlist` | 2.57 kB | 105 kB |
| `/pilot` | 3.21 kB | 106 kB |
| `/legal` | 2.57 kB | 105 kB |

Key evidence for the shared-package budget: `/demo/shortlist` ships **105 kB**
total — importing `@intoreai/design-system` drags in zero GSAP/Lenis code.
The cinematic libraries (≈58 kB extra) load only on `/`.

`npm run typecheck` passes. All routes return 200 on the dev server.

## Budget (Section 6 targets — verify before pilot launch)

- Lighthouse mobile: performance ≥ 85, accessibility ≥ 95, best-practices ≥ 95
  (marketing `/` and `/demo/shortlist`).
- LCP < 2.5s on throttled 4G.
- prefers-reduced-motion fallback: implemented in every animated component;
  verify by toggling the emulation in devtools (not yet formally recorded).

## How to verify

1. `npm run build && npm run start`, then run Lighthouse (Chrome devtools or
   `npx lighthouse http://localhost:3001 --view`) against `/` and
   `/demo/shortlist`.
2. Toggle `prefers-reduced-motion: reduce` in devtools → loader still dismisses,
   pins/scrubs/marquees/cursor go static, content fully readable.
3. Keyboard-only pass: every CTA, nav link, form field, and mockup reachable
   with a visible focus ring.

## Known trade-offs / substitutions (stated, not hidden)

- **Tailwind v4 CSS-first tokens** (`@theme` in `tokens.css`) instead of
  `tailwind.config.ts` — same single-source behavior on the current stack.
- **Fonts via `next/font/google`** (Fraunces + Public Sans): downloaded at build
  time and self-hosted — zero runtime Google CDN calls.
- **Animated token-built mockups instead of product videos**: no screen-capture
  footage exists yet; mockups are IO-gated, transform/opacity-only, and ─ by
  construction ─ already match the shared design system.
- **No autoplay video shipped at all** (nothing to gate); add per Section 4.5
  with `.webm` + `.mp4`, poster, and IntersectionObserver gating when footage lands.
