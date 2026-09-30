# Performance & Verification Notes

## Enhancement pass (media + scroll-reversal) — measured

New media (all genuine screen captures of `intore-ai-frontend` with seeded
data — Playwright/Chromium, API-authenticated, no fabricated UI):

| File | Size | Content |
|---|---|---|
| `public/videos/modules/screening.webm` / `.mp4` / `.jpg` | 124 / 153 / 41 KB | Ranked shortlist scroll + candidate detail, live scores |
| `public/videos/modules/interview.webm` / `.mp4` / `.jpg` | 73 / 113 / 40 KB | Interview scheduling flow, live app |
| `public/videos/modules/integrity.webm` / `.mp4` / `.jpg` | 67 / 102 / 34 KB | Evidence/score-breakdown review pane |
| `public/videos/modules/recommendation.webm` / `.mp4` / `.jpg` | 75 / 120 / 41 KB | Written recommendation + decision buttons |
| `public/videos/modules/prep.webm` / `.mp4` / `.jpg` | 210 / 256 / 50 KB | Applicant Upskill hub, skill-gap recommendations |

Capture: 960px viewport, 12fps, VP9 crf34 / H264 crf26. Posters are stills
from the same clips. Videos play only while their module is rail-active
(verified: ≤1 playing), all paused under `prefers-reduced-motion`.

Acceptance suite (`accept.mjs`, Playwright): 10/10 — 5 videos wired with
poster+webm+mp4+muted+loop; hero canvas frame-differs; metrics count then
reset on scroll-back; rail re-highlights 01 in reverse; zero page errors on a
full down+up pass; reduced-motion pauses everything with readable hero.

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
- **Product walkthrough uses real screen recordings** (`public/videos/modules/`),
  IO-gated and playing only while their row is active.
- **Ambient film loops** (`public/videos/ambient/`, via `AmbientVideo`) are muted,
  IO-gated, `preload="none"` below the fold, and poster-only under reduced motion.
- **Imigongo textures are drawn in code** (`components/media/imigongo.tsx`, SVG
  patterns): 0 image bytes, and the fallback for any photo or film not yet generated.
- **One WebGL effect** (pillar image hover, `DistortImage`): initialised on first
  hover, renders only while easing, and skipped on touch and under reduced motion.

## Media budget (visual pass)

| Asset | Budget |
|---|---|
| Hero film loop (`hero-loop`, 1600w) | ≤ 1.5 MB webm |
| Any other ambient loop | ≤ 900 KB webm |
| Hero / above-the-fold photo | ≤ 180 KB AVIF at 1280w |
| Other photos | lazy-loaded, AVIF + WebP `srcset` (640/1280/2000) |

Pipeline: raw sources in `assets-src/` (git-ignored) → `node scripts/optimize-media.mjs`
→ `public/media/`, `public/videos/ambient/` and `lib/media-manifest.json`.
Prompts: `docs/IMAGE_PROMPTS.md` and `docs/VIDEO_PROMPTS.md`.
