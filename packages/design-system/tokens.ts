/**
 * @intoreai/design-system — tokens.ts
 * Framework-light numeric/string tokens (no React, no GSAP here —
 * importing this into the dashboard must never drag cinematic deps).
 */

export const easing = {
  expo: "cubic-bezier(0.16, 1, 0.3, 1)",
  swift: "cubic-bezier(0.32, 0.72, 0, 1)",
} as const;

export const duration = {
  micro: 180,
  reveal: 750,
  hero: 1600,
  stagger: 60,
} as const;

/** Fluid display scale (marketing) — clamp() from mobile to 34"+ hero. */
export const displayScale = {
  hero: "clamp(3rem, 9vw, 8.5rem)",
  h1: "clamp(2.5rem, 6vw, 5.5rem)",
  h2: "clamp(2rem, 4.5vw, 3.75rem)",
  h3: "clamp(1.5rem, 3vw, 2.25rem)",
} as const;

/** Compact UI scale (dashboards) — same faces, tighter rhythm. */
export const uiScale = {
  title: "1.25rem/1.3",
  body: "0.875rem/1.55",
  label: "0.6875rem/1.4",
} as const;

export const palette = {
  paper: "#f6f3ec",
  parchment: "#ede8db",
  ink: "#131b17",
  inkSoft: "#2b3530",
  mist: "#6b7670",
  line: "#dcd5c4",
  night: "#0e1512",
  nightSoft: "#1a2420",
  signal: "#12805c",
  signalDeep: "#0b5c42",
  signalTint: "#dcefe4",
  clay: "#c2542b",
  clayTint: "#f6e3d6",
  gold: "#d9a441",
} as const;
