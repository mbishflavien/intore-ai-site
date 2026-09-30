/* Home-screen icon: same mark as app/icon.svg, rendered to PNG at build. */

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0e1512", position: "relative" }}>
        {/* Serif "I": top serif, stem, bottom serif */}
        <div style={{ position: "absolute", left: 48, top: 39, width: 56, height: 14, background: "#f6f3ec" }} />
        <div style={{ position: "absolute", left: 65, top: 39, width: 22, height: 102, background: "#f6f3ec" }} />
        <div style={{ position: "absolute", left: 48, top: 127, width: 56, height: 14, background: "#f6f3ec" }} />
        <div
          style={{ position: "absolute", left: 115, top: 113, width: 28, height: 28, borderRadius: 999, background: "#12805c" }}
        />
      </div>
    ),
    size,
  );
}
