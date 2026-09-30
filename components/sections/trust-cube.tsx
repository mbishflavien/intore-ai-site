"use client";

/* Trust cube: six promises, one per face, framed in imigongo. Pure CSS 3D (no
 * WebGL, no download). Drag to spin, it snaps to the nearest face; the markers
 * and arrow keys jump between faces. Until someone touches it, it turns to the
 * next promise every few seconds. The faces are decorative to assistive tech;
 * the current promise is announced from a live region instead. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Imigongo } from "@/components/media/imigongo";
import { prefersReducedMotion } from "@/lib/media";

type Face = {
  title: string;
  line: string;
  motif: "zigzag" | "diamond" | "lattice";
  tone: "clay" | "night" | "paper";
  /** Cube rotation (deg) that brings this face to the front. */
  rx: number;
  ry: number;
  /** Where the face sits on the cube. */
  place: string;
};

const FACES: Face[] = [
  { title: "Humans decide", line: "Every hire is signed by a person, never by the model.", motif: "zigzag", tone: "clay", rx: 0, ry: 0, place: "rotateY(0deg)" },
  { title: "Every score, explained", line: "Five dimensions, with reasons your team can read and question.", motif: "diamond", tone: "night", rx: 0, ry: -90, place: "rotateY(90deg)" },
  { title: "Consent first", line: "Candidates know what is observed, why, and can withdraw.", motif: "lattice", tone: "paper", rx: 0, ry: -180, place: "rotateY(180deg)" },
  { title: "Fair, and measured", line: "Outcome parity tracked across groups, not assumed.", motif: "diamond", tone: "clay", rx: 0, ry: -270, place: "rotateY(270deg)" },
  { title: "Your data, your rights", line: "Export or erase everything we hold, whenever you ask.", motif: "zigzag", tone: "night", rx: -90, ry: 0, place: "rotateX(90deg)" },
  { title: "Compliant by design", line: "Rwanda DPL, GDPR and the EU AI Act, mapped per market.", motif: "lattice", tone: "paper", rx: 90, ry: 0, place: "rotateX(-90deg)" },
];

const INK: Record<Face["tone"], string> = {
  clay: "bg-paper text-ink",
  night: "bg-night text-paper",
  paper: "bg-surface-elevated text-ink",
};

/** Nearest angle to `from` that is equivalent to `to` (mod 360), so turns take the short way. */
const near = (from: number, to: number) => to + Math.round((from - to) / 360) * 360;

export function TrustCube() {
  const cube = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rot = useRef({ rx: -12, ry: 18, trx: 0, try: 0, vx: 0 });
  const touched = useRef(false);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [face, setFace] = useState(0);

  const goTo = useCallback((i: number) => {
    const f = FACES[i];
    const r = rot.current;
    r.trx = f.rx;
    // Top/bottom read upright only with no Y turn; sides keep their turn short.
    r.try = f.rx !== 0 ? near(r.ry, 0) : near(r.ry, f.ry);
    setFace(i);
  }, []);

  // Spring the cube toward its target every frame.
  useEffect(() => {
    const el = cube.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    let raf = 0;
    const r = rot.current;
    goTo(0);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const k = reduced ? 1 : dragging.current ? 1 : 0.1;
      r.rx += (r.trx - r.rx) * k;
      r.ry += (r.try - r.ry) * k;
      // A little resting tilt so it always reads as a solid object.
      const tilt = dragging.current || r.trx !== 0 ? 0 : -8;
      el.style.transform = `rotateX(${r.rx + tilt}deg) rotateY(${r.ry}deg)`;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [goTo]);

  // Until someone interacts, turn to the next promise every few seconds (while visible).
  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const id = setInterval(() => {
      if (!touched.current && visible) setFace((f) => {
        const n = (f + 1) % FACES.length;
        goTo(n);
        return n;
      });
    }, 3200);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [goTo]);

  // Drag to spin; release snaps to the face nearest the viewer.
  const onDown = (e: React.PointerEvent) => {
    touched.current = true;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const r = rot.current;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    r.try += dx * 0.45;
    r.trx = Math.max(-100, Math.min(100, r.trx - dy * 0.45));
    r.vx = dx;
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const r = rot.current;
    if (r.trx < -45) return goTo(4);
    if (r.trx > 45) return goTo(5);
    // Fling: carry some velocity into the snap.
    const snapped = Math.round((r.try + r.vx * 3) / 90) * 90;
    const side = ((((-snapped / 90) % 4) + 4) % 4) as 0 | 1 | 2 | 3;
    r.trx = 0;
    r.try = snapped;
    setFace(side);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowRight: face < 4 ? (face + 1) % 4 : 1,
      ArrowLeft: face < 4 ? (face + 3) % 4 : 3,
      ArrowUp: 4,
      ArrowDown: 5,
    };
    if (e.key in map) {
      e.preventDefault();
      touched.current = true;
      goTo(map[e.key]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        ref={stage}
        tabIndex={0}
        role="group"
        aria-roledescription="rotating cube"
        aria-label="Six trust promises. Drag, or use the arrow keys, to turn the cube."
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        data-cursor="Drag"
        className="relative cursor-grab touch-pan-y select-none rounded-3xl [perspective:1100px] active:cursor-grabbing"
        style={{ width: "var(--s)", height: "var(--s)", ["--s" as string]: "clamp(230px, 28vw, 340px)" }}
      >
        <div ref={cube} className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
          {FACES.map((f, i) => (
            <div
              key={f.title}
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden rounded-[18px] [backface-visibility:hidden]"
              style={{ transform: `${f.place} translateZ(calc(var(--s) / 2))` }}
            >
              <Imigongo variant={f.motif} tone={f.tone} scale={0.9} sweep={false} className="absolute inset-0" />
              <div
                className={`absolute inset-[13%] flex flex-col justify-between rounded-xl p-5 shadow-[inset_0_0_0_1px_rgba(19,27,23,0.08)] ${INK[f.tone]}`}
              >
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-clay">
                  0{i + 1} / 06
                </span>
                <div>
                  <p className="font-display text-[clamp(1.25rem,2.1vw,1.7rem)] font-black leading-[1.05]">{f.title}</p>
                  <p className="mt-2 font-sans text-[13px] leading-snug opacity-75">{f.line}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1" role="tablist" aria-label="Trust promises">
          {FACES.map((f, i) => (
            <button
              key={f.title}
              type="button"
              role="tab"
              aria-selected={face === i}
              aria-label={f.title}
              onClick={() => {
                touched.current = true;
                goTo(i);
              }}
              className="grid h-8 w-8 place-items-center rounded-full"
            >
              <span
                className={`block h-2.5 rounded-full transition-all duration-300 ${face === i ? "w-6 bg-signal" : "w-2.5 bg-ink/25"}`}
              />
            </button>
          ))}
        </div>
        <p aria-live="polite" className="sr-only">
          <span className="font-semibold text-ink">{FACES[face].title}.</span> {FACES[face].line}
        </p>
      </div>
    </div>
  );
}
