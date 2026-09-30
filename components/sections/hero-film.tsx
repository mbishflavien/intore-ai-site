"use client";

/* HeroFilm: the hero as a short film you scroll through (and rewind).
 *   Act 1  drone glide over Kigali's hills (real footage as a frame sequence)
 *          → push into an interview room
 *   Act 2  overwhelm (buried in CVs) → the papers fly past the camera and
 *          dissolve into emerald signal → clarity at dawn, and the ask.
 * One canvas draws every visual from a single scroll position; the copy beats
 * are DOM layered on top. Act 2's overwhelm/paper visuals are code stand-ins
 * until the generated assets (docs/HERO_STORY.md) arrive. */

import { useEffect, useRef } from "react";
import { Button, Magnetic } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";
import { getImage, midSrc, prefersReducedMotion } from "@/lib/media";
import { IconArrow } from "@/components/icons";

const FRAMES = { id: "drone-hills", count: 98 };

// Where each piece of the story lives on the 0 → 1 scroll track.
const T = {
  droneEnd: 0.4, // glide finishes
  roomIn: [0.36, 0.47], // push through into the interview room
  overwhelmIn: [0.57, 0.63],
  papers: [0.63, 0.84], // sheets fly past, then turn into signal
  clarityIn: [0.83, 0.9],
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, [a, b]: number[]) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Paper = { x: number; y: number; z: number; rot: number; spin: number; tilt: number; delay: number; lines: number[] };

export function HeroFilm() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!el || !canvas || !ctx) return;
    const reduced = prefersReducedMotion();

    // ——— assets ———
    const size = window.innerWidth < 768 ? "sm" : "lg";
    const frames: (HTMLImageElement | null)[] = new Array(FRAMES.count).fill(null);
    const loadFrame = (i: number) =>
      new Promise<void>((res) => {
        if (frames[i]) return res();
        const im = new Image();
        im.decoding = "async";
        im.onload = () => {
          frames[i] = im;
          res();
        };
        im.onerror = () => res();
        im.src = `/frames/${FRAMES.id}/${size}/${String(i + 1).padStart(4, "0")}.webp`;
      });
    // First frame now, then a coarse pass (every 6th) so scrubbing works early, then the rest.
    (async () => {
      await loadFrame(0);
      for (let i = 0; i < FRAMES.count; i += 6) await loadFrame(i);
      for (let i = 0; i < FRAMES.count; i++) await loadFrame(i);
    })();
    const still = (id: string) => {
      const e = getImage(id);
      const im = new Image();
      if (e) im.src = midSrc(id, e);
      return im;
    };
    const room = still("pillar-interview");
    const desk = still("hero-still");

    // ——— papers (stand-in until paper-1…6 exist) ———
    const papers: Paper[] = Array.from({ length: window.innerWidth < 768 ? 34 : 60 }, () => ({
      x: (Math.random() - 0.5) * 1.6,
      y: (Math.random() - 0.3) * 0.9,
      z: 0,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 3,
      tilt: Math.random(),
      delay: Math.random() * 0.45,
      lines: Array.from({ length: 9 }, () => 0.45 + Math.random() * 0.45),
    }));

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio, 1.5);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    /** Draw an image cover-fitted, scaled about (fx, fy) in 0..1 screen space. */
    const cover = (im: HTMLImageElement | null, scale: number, alpha: number, filter = "none", fx = 0.5, fy = 0.5) => {
      if (!im || !im.complete || !im.naturalWidth || alpha <= 0) return;
      const r = Math.max(W / im.naturalWidth, H / im.naturalHeight) * scale;
      const w = im.naturalWidth * r, h = im.naturalHeight * r;
      ctx.globalAlpha = alpha;
      ctx.filter = filter;
      ctx.drawImage(im, fx * W - w * fx, fy * H - h * fy, w, h);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
    };
    const nearestFrame = (i: number) => {
      for (let d = 0; d < FRAMES.count; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    };

    const drawPapers = (p: number) => {
      const t = seg(p, T.papers);
      if (t <= 0 || t >= 1) return;
      const f = Math.min(W, H) * 0.9; // focal length
      for (const pp of papers) {
        const k = clamp((t - pp.delay * 0.5) / 0.55); // this sheet's flight 0..1
        if (k <= 0) continue;
        const z = 3.2 - k * 3.05; // far → just past the lens
        if (z <= 0.12) continue;
        const sx = W / 2 + (pp.x * f) / z;
        const sy = H * 0.62 + (pp.y * f) / z - k * H * 0.12;
        const s = (f / z) * 0.12;
        // The last stretch of the flight turns each sheet into a signal dot.
        const dot = clamp((t - 0.5 - pp.delay * 0.25) / 0.2);
        ctx.save();
        ctx.translate(sx, sy);
        if (dot < 1) {
          // Fade in from the distance, and out before a sheet fills the lens.
          ctx.globalAlpha = (1 - dot) * clamp(k * 4) * clamp((z - 0.35) / 0.6);
          ctx.rotate(pp.rot + k * pp.spin);
          ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(pp.tilt * 6 + k * 5))); // tumble
          ctx.fillStyle = "#f6f3ec";
          ctx.shadowColor = "rgba(0,0,0,0.25)";
          ctx.shadowBlur = 12;
          ctx.fillRect(-s * 0.35, -s * 0.5, s * 0.7, s);
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(19,27,23,0.28)";
          pp.lines.forEach((len, i) => ctx.fillRect(-s * 0.26, -s * 0.38 + i * s * 0.085, s * 0.52 * len, Math.max(1, s * 0.018)));
        }
        if (dot > 0) {
          ctx.globalAlpha = dot * (1 - seg(p, [0.9, 0.97]));
          ctx.fillStyle = "#2fbf8c";
          ctx.beginPath();
          ctx.arc(0, 0, 2 + dot * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    const draw = (p: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0e1512";
      ctx.fillRect(0, 0, W, H);

      // Act 1: the drone glide, then a push through into the room.
      const glide = clamp(p / T.droneEnd);
      const push = ease(seg(p, T.roomIn));
      const droneAlpha = 1 - seg(p, [0.43, 0.49]);
      if (droneAlpha > 0) {
        const frame = nearestFrame(Math.round(glide * (FRAMES.count - 1)));
        cover(frame, 1.02 + glide * 0.06 + push * 0.9, droneAlpha, push > 0 ? `blur(${push * 6}px)` : "none", 0.5, 0.62);
      }
      const roomAlpha = ease(seg(p, [0.4, 0.47])) * (1 - ease(seg(p, T.overwhelmIn)));
      cover(room, 1.35 - push * 0.3 + seg(p, [0.47, 0.6]) * 0.06, roomAlpha, "none", 0.55, 0.5);

      // Act 2: the same recruiter, evening and overwhelmed (stand-in: graded hero photo).
      const deskPush = seg(p, [0.57, 1]) * 0.1;
      const overwhelm = ease(seg(p, T.overwhelmIn)) * (1 - ease(seg(p, T.clarityIn)));
      cover(desk, 1.08 + deskPush, overwhelm, "grayscale(0.65) brightness(0.5) contrast(1.1)", 0.45, 0.5);
      cover(desk, 1.08 + deskPush, ease(seg(p, T.clarityIn)), "none", 0.45, 0.5);

      // Legibility: darken toward the bottom from the room onward.
      const shade = seg(p, [0.44, 0.5]);
      if (shade > 0) {
        const g = ctx.createLinearGradient(0, H, 0, 0);
        g.addColorStop(0, `rgba(14,21,18,${0.85 * shade})`);
        g.addColorStop(0.55, `rgba(14,21,18,${0.25 * shade})`);
        g.addColorStop(1, "rgba(14,21,18,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      drawPapers(p);
    };

    // ——— scroll drive: canvas + copy beats on one timeline ———
    let target = 0, current = 0, raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      current += (target - current) * 0.12;
      draw(current);
    };

    if (reduced) {
      loadFrame(0).then(() => draw(0));
      return () => {
        io.disconnect();
        window.removeEventListener("resize", resize);
      };
    }

    const beats = gsap.utils.toArray<HTMLElement>(".film-beat", el);
    const gctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=520%",
          pin: true,
          scrub: true,
          onUpdate: (self) => (target = self.progress),
        },
      });
      // Each beat: [in, out] on the 0..1 track. The first starts visible.
      const spans: [number, number][] = [[0, 0.13], [0.17, 0.34], [0.49, 0.58], [0.6, 0.67], [0.75, 0.86], [0.89, 1.01]];
      beats.forEach((b, i) => {
        const [a, z] = spans[i];
        if (i > 0) tl.fromTo(b, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.03 }, a);
        if (z <= 1) tl.to(b, { autoAlpha: 0, y: -40, duration: 0.03 }, z - 0.03);
      });
      tl.to({}, { duration: 0.001 }, 1); // pin the timeline length to exactly 0..1
    }, el);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      gctx.revert();
      window.removeEventListener("resize", resize);
    };
  }, []);

  const beat = "film-beat pointer-events-none absolute inset-x-0 mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)]";
  const big = "font-display font-black leading-[0.98] tracking-tight";

  return (
    <section ref={root} id="top" aria-label="IntoreAI, told in one scroll" className="relative h-[100svh] overflow-hidden bg-night">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      {/* 0 — over the hills (ink on the bright dawn sky) */}
      <div className={`${beat} top-[16vh] text-ink`}>
        <h1 className={`${big} max-w-4xl text-[clamp(2.6rem,6.4vw,6.4rem)]`}>
          AI ranks the shortlist.
          <br />
          <span className="text-signal">Humans make the hire.</span>
        </h1>
        <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
          <Magnetic>
            <Button href="/pilot" size="lg" data-cursor="Go">
              Book a pilot <IconArrow className="h-5 w-5" />
            </Button>
          </Magnetic>
          <Button href="#product" size="lg" variant="secondary">
            See how it works
          </Button>
        </div>
      </div>

      {/* 1 — still over the hills */}
      <div className={`${beat} invisible top-[18vh] text-ink opacity-0`}>
        <p className={`${big} max-w-3xl text-[clamp(2rem,4.6vw,4.4rem)]`}>
          Somewhere in these hills, a team is about to meet its next great hire.
        </p>
      </div>

      {/* 2 — in the room */}
      <div className={`${beat} invisible bottom-[10vh] text-paper opacity-0`}>
        <p className={`${big} max-w-3xl text-[clamp(2.2rem,5.2vw,5rem)]`}>Every interview, on the record.</p>
        <p className="mt-4 max-w-md font-sans text-lg text-paper/75">
          Structured questions, shared scorecards, one comparable record for every candidate.
        </p>
      </div>

      {/* 3 — overwhelm */}
      <div className={`${beat} invisible bottom-[10vh] text-paper opacity-0`}>
        <p className={`${big} max-w-3xl text-[clamp(2.2rem,5.2vw,5rem)]`}>
          Four hundred applications. One recruiter. <span className="text-clay">One week.</span>
        </p>
        <p className="mt-4 max-w-md font-sans text-lg text-paper/75">
          Good people get lost in the pile. Not because they're weak, but because nobody has time to read.
        </p>
      </div>

      {/* 4 — signal */}
      <div className={`${beat} invisible bottom-[10vh] text-paper opacity-0`}>
        <p className={`${big} max-w-3xl text-[clamp(2.2rem,5.2vw,5rem)]`}>
          IntoreAI reads every one, <span className="text-signal">and writes down why.</span>
        </p>
        <p className="mt-4 max-w-md font-sans text-lg text-paper/75">
          Five dimensions. Written reasoning. Integrity flags a person reviews.
        </p>
      </div>

      {/* 5 — clarity */}
      <div className={`${beat} invisible bottom-[10vh] text-paper opacity-0`}>
        <p className={`${big} max-w-3xl text-[clamp(2.2rem,5.2vw,5rem)]`}>
          A shortlist you can defend. <span className="text-signal">A decision that's yours.</span>
        </p>
        <div className="pointer-events-auto mt-8">
          <Button href="/pilot" size="lg" variant="onDark">
            Book a pilot <IconArrow className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
