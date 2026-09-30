"use client";

/* Imigongo: Rwanda's geometric relief art, drawn in code.
 * Three tiled motifs, each rendered as shadow + highlight + face layers so the
 * ridges read as raised relief. A slow raking "light sweep" can pass over it.
 * Zero image bytes, crisp at any size, and it's the fallback for every media slot. */

import { useId } from "react";

type Variant = "zigzag" | "diamond" | "lattice";
type Tone = "clay" | "night" | "paper";

const TONES: Record<Tone, { base: string; ridges: [string, string, string] }> = {
  clay: { base: "#c2542b", ridges: ["#131b17", "#f6f3ec", "#131b17"] },
  night: { base: "#0e1512", ridges: ["#c2542b", "#f6f3ec", "#1a2420"] },
  paper: { base: "#ede8db", ridges: ["#c2542b", "#dcd5c4", "#f6e3d6"] },
};

const SIZE: Record<Variant, [number, number]> = {
  zigzag: [48, 36],
  diamond: [64, 64],
  lattice: [32, 32],
};

function Motif({ variant, colors }: { variant: Variant; colors: [string, string, string] }) {
  const [a, b, c] = colors;
  if (variant === "zigzag") {
    return (
      <g fill="none" strokeWidth={7} strokeLinejoin="miter">
        {[6, 18, 30].map((y, i) => (
          <path
            key={y}
            stroke={[a, b, c][i]}
            d={`M-12 ${y + 6} L0 ${y - 6} L12 ${y + 6} L24 ${y - 6} L36 ${y + 6} L48 ${y - 6} L60 ${y + 6}`}
          />
        ))}
      </g>
    );
  }
  if (variant === "diamond") {
    const ring = (cx: number, cy: number, r: number, col: string, k: string) => (
      <path key={k} stroke={col} d={`M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy}Z`} />
    );
    return (
      <g fill="none" strokeWidth={5}>
        {[28, 20, 12, 4].map((r, i) => ring(32, 32, r, [a, b, c, b][i], `c${r}`))}
        {[0, 64].flatMap((x) =>
          [0, 64].flatMap((y) => [ring(x, y, 12, c, `e${x}${y}12`), ring(x, y, 4, b, `e${x}${y}4`)]),
        )}
      </g>
    );
  }
  return (
    <g fill="none" strokeWidth={3}>
      <path stroke={a} d="M0 0 L32 32 M32 0 L0 32" />
      <path stroke={b} d="M16 11 L21 16 L16 21 L11 16Z" fill={c} />
    </g>
  );
}

export function Imigongo({
  variant = "zigzag",
  tone = "clay",
  scale = 1,
  sweep = true,
  className = "",
}: {
  variant?: Variant;
  tone?: Tone;
  scale?: number;
  sweep?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const { base, ridges } = TONES[tone];
  const [w, h] = SIZE[variant];
  const layers = [
    { id: `${uid}s`, dx: 1.6, dy: 2.2, colors: ["rgba(0,0,0,.38)", "rgba(0,0,0,.38)", "rgba(0,0,0,.38)"] },
    { id: `${uid}h`, dx: -0.9, dy: -1.1, colors: ["rgba(255,248,235,.28)", "rgba(255,248,235,.28)", "rgba(255,248,235,.28)"] },
    { id: `${uid}f`, dx: 0, dy: 0, colors: ridges },
  ] as const;

  return (
    <div aria-hidden="true" className={`imigongo pointer-events-none overflow-hidden ${className}`} style={{ background: base }}>
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {layers.map((l) => (
            <pattern
              key={l.id}
              id={l.id}
              width={w}
              height={h}
              patternUnits="userSpaceOnUse"
              patternTransform={`scale(${scale}) translate(${l.dx} ${l.dy})`}
            >
              <Motif variant={variant} colors={l.colors as [string, string, string]} />
            </pattern>
          ))}
        </defs>
        {layers.map((l) => (
          <rect key={l.id} width="100%" height="100%" fill={`url(#${l.id})`} />
        ))}
      </svg>
      {sweep && <div className="imigongo-sweep absolute inset-y-0 -left-full w-[300%]" />}
    </div>
  );
}
