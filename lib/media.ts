/* Typed access to lib/media-manifest.json (written by scripts/optimize-media.mjs). */

import manifest from "./media-manifest.json";

export type ImageEntry = { w: number; h: number; widths: number[]; blur: string };
export type VideoEntry = { landscape?: boolean; portrait?: boolean };

const images = manifest.images as Record<string, ImageEntry>;
const videos = manifest.videos as Record<string, VideoEntry>;

export function getImage(id: string): ImageEntry | undefined {
  return images[id];
}

export function getVideo(id: string): VideoEntry | undefined {
  return videos[id];
}

export function srcSet(id: string, entry: ImageEntry, format: "avif" | "webp") {
  return entry.widths.map((w) => `/media/${id}-${w}.${format} ${w}w`).join(", ");
}

/** A mid-size WebP, e.g. for WebGL textures. */
export function midSrc(id: string, entry: ImageEntry) {
  const w = entry.widths.find((x) => x >= 1280) ?? entry.widths[entry.widths.length - 1];
  return `/media/${id}-${w}.webp`;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
