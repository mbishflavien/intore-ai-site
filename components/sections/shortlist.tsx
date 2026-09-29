"use client";

/* The idea in one scroll: hundreds of applications (dots) drift as noise,
 * get scored into a distribution, and the strongest evidence rises into a
 * ranked shortlist. Nobody is thrown away: everyone else settles into a
 * "reviewed, reasons kept" block. Pinned + scrubbed, so it reverses on
 * scroll-up; the cursor parts the field. Reduced motion shows the end state. */

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/motion/smooth";
import { prefersReducedMotion } from "@/lib/media";

const STEPS = [
  ["Every application arrives.", "Hundreds of CVs, each given the same full read. No shortcuts, no keyword gate."],
  ["Every one is scored, and explained.", "Five dimensions, with written reasoning for each candidate your team can open and question."],
  ["A shortlist your team can defend.", "The strongest evidence rises to the top. The decision stays human."],
];
const SHORTLIST = 7;
const INK = [19, 27, 23];
const SIGNAL = [18, 128, 92];

type P = {
  s: number; // score 0..1
  rank: number;
  ax: number; ay: number; ph: number; // noise home + phase
  bx: number; by: number; // distribution
  cx: number; cy: number; // final
  ox: number; oy: number; // cursor offset (sprung)
  d: number; // stagger 0..1
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function Shortlist() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!el || !canvas || !ctx) return;
    const reduced = prefersReducedMotion();
    const steps = Array.from(el.querySelectorAll<HTMLElement>(".sl-step"));
    const font = getComputedStyle(el).fontFamily;

    let W = 0, H = 0, dpr = 1, mobile = false;
    let ps: P[] = [];
    let reviewedLabel = { x: 0, y: 0 };
    let listX = 0, listW = 0;

    const layout = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio, 2);
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      mobile = W < 768;
      const n = mobile ? 180 : 340;
      if (ps.length !== n) {
        ps = Array.from({ length: n }, () => {
          const s = Math.pow((Math.random() + Math.random() + Math.random()) / 3, 1.3);
          return { s, rank: 0, ax: 0, ay: 0, ph: Math.random() * 6.28, bx: 0, by: 0, cx: 0, cy: 0, ox: 0, oy: 0, d: Math.random() };
        });
        [...ps].sort((a, b) => b.s - a.s).forEach((p, i) => (p.rank = i));
      }
      // Field the dots live in (desktop: right of the copy; mobile: under it).
      const fx = mobile ? W * 0.06 : W * 0.44, fw = mobile ? W * 0.88 : W * 0.52;
      const fy = mobile ? H * 0.42 : H * 0.14, fh = mobile ? H * 0.52 : H * 0.72;
      const gap = mobile ? 8 : 11;
      // A: noise
      for (const p of ps) { p.ax = fx + Math.random() * fw; p.ay = fy + Math.random() * fh; }
      // B: score distribution, stacked columns (best scores on the right)
      const bins = mobile ? 16 : 26;
      const heights = new Array(bins).fill(0);
      const byScore = [...ps].sort((a, b) => a.s - b.s);
      const smin = byScore[0].s, smax = byScore[byScore.length - 1].s;
      for (const p of byScore) {
        const b = Math.min(bins - 1, Math.floor(((p.s - smin) / (smax - smin + 1e-6)) * bins));
        p.bx = fx + (b + 0.5) * (fw / bins);
        p.by = fy + fh - heights[b]++ * gap;
      }
      // C: ranked shortlist rows + everyone else in a calm "reviewed" block
      listX = mobile ? fx : fx + fw * 0.46;
      listW = mobile ? fw : fw * 0.54;
      const rowH = mobile ? 26 : Math.min(52, fh / (SHORTLIST + 1));
      const cols = mobile ? Math.floor(fw / gap) : 16;
      const blockRows = Math.ceil((ps.length - SHORTLIST) / cols);
      const listH = rowH * (SHORTLIST - 1);
      // Desktop: block and list side by side, both centred in the field.
      // Mobile: list on top, block beneath, the pair centred vertically.
      const stackH = listH + 44 + blockRows * gap;
      const listY = mobile ? fy + Math.max(0, (fh - stackH) / 2) : fy + (fh - listH) / 2;
      const blockX = fx;
      const blockY = mobile ? listY + listH + 44 : fy + (fh - blockRows * gap) / 2;
      for (const p of ps) {
        if (p.rank < SHORTLIST) {
          p.cx = listX + 10; p.cy = listY + p.rank * rowH;
        } else {
          const k = p.rank - SHORTLIST;
          p.cx = blockX + (k % cols) * gap;
          p.cy = blockY + Math.floor(k / cols) * gap;
        }
      }
      reviewedLabel = { x: blockX, y: blockY - 16 };
    };

    let progress = reduced ? 1 : 0;
    let shown = -1;
    const setStep = (i: number) => {
      if (i === shown) return;
      shown = i;
      steps.forEach((s, j) => s.classList.toggle("is-active", reduced || j === i));
    };

    const mouse = { x: -1e4, y: -1e4 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = mouse.y = -1e4; };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const pB = progress, sorted = ps;
      for (const p of sorted) {
        const eb = ease(clamp((pB - 0.14 - p.d * 0.1) / 0.24));
        const ec = ease(clamp((pB - 0.56 - p.d * 0.1) / 0.26));
        const wob = (1 - eb) * 6;
        const ax = p.ax + Math.sin(t * 0.0006 + p.ph) * wob * 2;
        const ay = p.ay + Math.cos(t * 0.0005 + p.ph * 1.3) * wob * 2;
        let x = ax + (p.bx - ax) * eb, y = ay + (p.by - ay) * eb;
        x += (p.cx - x) * ec; y += (p.cy - y) * ec;
        // Cursor parts the field (sprung, so it settles back smoothly).
        const dx = x - mouse.x, dy = y - mouse.y, dist = Math.hypot(dx, dy), R = 90;
        const push = dist < R && !reduced ? (R - dist) * 0.55 : 0;
        p.ox += ((dist ? (dx / dist) * push : 0) - p.ox) * 0.12;
        p.oy += ((dist ? (dy / dist) * push : 0) - p.oy) * 0.12;
        x += p.ox; y += p.oy;

        const top = p.rank < SHORTLIST;
        const heat = Math.pow(p.s, 5) * eb; // strong scores glow as they're scored
        const sig = top ? Math.max(heat, ec) : heat * (1 - ec);
        const c = INK.map((v, i) => Math.round(v + (SIGNAL[i] - v) * clamp(sig * 1.4)));
        const alpha = top ? 0.5 + 0.5 * Math.max(eb, ec) : 0.42 - 0.12 * ec;
        const rad = top ? 2.8 + ec * 3.6 : 2.5 - ec * 0.5;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();

        if (top && ec > 0.02) {
          // Score bar + rank label draw in with the final state.
          const len = (listW - 120) * (0.55 + 0.45 * p.s) * ec;
          ctx.strokeStyle = `rgba(18,128,92,${0.25 * ec})`;
          ctx.lineWidth = 6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x + 14, y);
          ctx.lineTo(x + 14 + len, y);
          ctx.stroke();
          ctx.fillStyle = `rgba(19,27,23,${ec})`;
          ctx.font = `700 ${mobile ? 11 : 13}px ${font}`;
          ctx.textBaseline = "middle";
          ctx.fillText(`#${p.rank + 1}`, x + 22 + len, y);
          ctx.fillStyle = `rgba(107,118,112,${ec})`;
          ctx.font = `500 ${mobile ? 10 : 12}px ${font}`;
          ctx.fillText(`${Math.round(60 + p.s * 38)} · reasons written`, x + 50 + len, y);
        }
      }
      const lc = ease(clamp((pB - 0.8) / 0.15));
      if (lc > 0) {
        ctx.fillStyle = `rgba(107,118,112,${lc})`;
        ctx.font = `600 ${mobile ? 10 : 12}px ${font}`;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(`${ps.length - SHORTLIST} more reviewed · every reason kept`.toUpperCase(), reviewedLabel.x, reviewedLabel.y);
      }
    };

    layout();
    setStep(reduced ? 2 : 0);
    if (reduced) {
      draw(0);
      const onResize = () => { layout(); draw(0); };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=260%",
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        progress = self.progress;
        setStep(progress < 0.36 ? 0 : progress < 0.68 ? 1 : 2);
      },
    });

    let raf = 0, visible = false;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (visible) draw(t);
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    raf = requestAnimationFrame(loop);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      st.kill();
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={root}
      aria-label="How IntoreAI turns applications into a shortlist"
      className="relative h-[100svh] overflow-hidden bg-paper font-sans"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <div className="relative mx-auto flex h-full max-w-[1400px] px-[clamp(20px,5vw,72px)] pt-24 md:items-center md:pt-0">
        <ol className="sl-steps w-full md:w-[38%]">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="sl-step">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-clay">0{i + 1}</p>
              <h2 className="mt-2 font-display text-[clamp(1.75rem,3.4vw,3rem)] font-black leading-[1.02]">{t}</h2>
              <p className="mt-3 max-w-md text-[16px] leading-relaxed text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
