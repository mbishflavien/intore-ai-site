/* Social share card: og-base photo (when generated) under the promise,
 * set in Fraunces. Falls back to night + clay trim until the photo exists. */

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getImage } from "@/lib/media";

export const alt = "IntoreAI: AI ranks. Humans decide.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TITLE = "AI ranks.Humans decide.IntoreAI";

async function fraunces(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@144,900&text=${encodeURIComponent(TITLE)}`,
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null; // offline build: system serif
  }
}

async function photo(): Promise<string | null> {
  if (!getImage("og-base")) return null;
  // JPEG made at card size by scripts/optimize-media.mjs (Satori can't decode AVIF/WebP).
  const buf = await readFile(join(process.cwd(), "public/media/og-base-og.jpg"));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

export default async function OgImage() {
  const [font, bg] = await Promise.all([fraunces(), photo()]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "#0e1512",
          position: "relative",
          fontFamily: font ? "Fraunces" : "serif",
        }}
      >
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(14,21,18,0.92) 0%, rgba(14,21,18,0.55) 60%, rgba(14,21,18,0.15) 100%)",
          }}
        />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14, background: "#c2542b" }} />
        <div style={{ display: "flex", alignItems: "baseline", color: "#f6f3ec", fontSize: 40, fontWeight: 900 }}>
          IntoreAI
          <div style={{ width: 13, height: 13, borderRadius: 99, background: "#12805c", marginLeft: 6 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 104, fontWeight: 900, lineHeight: 0.98, letterSpacing: -2 }}>
          <span style={{ color: "#f6f3ec" }}>AI ranks.</span>
          <span style={{ color: "#2fbf8c" }}>Humans decide.</span>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Fraunces", data: font, weight: 900, style: "normal" }] : [] },
  );
}
