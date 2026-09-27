# Design System Usage Guide

For whoever builds the next screen six months from now. Read this before adding
anything visual.

## Which typeface, when

- Headlines, hero numerals, marketing stats → **Fraunces** (`font-display`).
- Everything else (body, buttons, tables, forms, toasts) → **Public Sans** (`font-sans`).
- Dashboard density: title 1.25rem · body 0.875rem · label 0.6875rem uppercase.
  Same faces, never a third font.

## When accent color is allowed

- `signal` (emerald) = **interactive or active only**: primary CTA, current step,
  selected state, success. Never decorative backgrounds, never illustration fill.
- `clay` = editorial emphasis: kickers, pull-quotes, warning-adjacent callouts.
- If you need a new color, you don't — combine these.

## Motion table

| Context | Duration | Easing | Pattern |
|---|---|---|---|
| Button hover/press | 180ms | expo-out | lift 1px / scale 0.98 |
| Card hover | 180ms | expo-out | elevation change only |
| Modal enter/exit | 250ms | expo-out | fade + 8px rise |
| Toast in/out | 300ms | expo-out | slide-in, auto-dismiss 3.5s |
| Skeleton | 1.2s pulse | linear | ink at 7% opacity |
| Section reveal (marketing) | 750ms | expo-out | trigger-once, staggered 60ms |
| Scrubbed storytelling | scroll-linked | linear map | transform/opacity ONLY |

Cinematic motion (pinning, scrub, split-text, marquees, cursor) is
**marketing-only**. Never import GSAP/Lenis into dashboard bundles.

## Before adding a new component, check

Primitives that already exist: `Button` (primary/secondary/ghost/onDark),
`Badge`/`Tag`, `Card`, `Kicker`, `Marquee`, `CountUp`, `Magnetic`, `Skeleton`.
Compose from these first. A new primitive needs a reason written here.

## Anti-drift rule

Tokens live in `@intoreai/design-system` (`tokens.css` + `tokens.ts`).
If you catch yourself typing a hex code, a font name, or a duration anywhere
else — stop, and add it to the package instead.
