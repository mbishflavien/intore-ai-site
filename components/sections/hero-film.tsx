"use client";

/* HeroFilm: the hero as a short film you scroll through (and rewind).
 *   Act 1  drone glide over Kigali's hills, leaves whipping past the lens
 *          → one continuous push to a hillside office, through the glass,
 *            into an interview
 *   Act 2  overwhelm (the recruiter's day turns grey, papers fly) → real paper
 *          sheets rush past the camera and dissolve into emerald signal
 *          → clarity at dawn, and the ask.
 * Every clip is a frame sequence (scripts/video-frames.mjs, key-frames.mjs).
 * One canvas draws every visual from a single scroll position; the copy beats
 * are DOM layered on top. */

import { useEffect, useRef } from "react";
import { Button, Magnetic } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";
import { getImage, midSrc, prefersReducedMotion } from "@/lib/media";
import { IconArrow } from "@/components/icons";

const SEQ = {
  hills: { id: "drone-hills", count: 98 },
  foliage: { id: "drone-foliage", count: 60 },
  push: { id: "drone-push", count: 99 },
  overwhelm: { id: "overwhelm", count: 100 },
};
const PAPER = { id: "paper-tumble", count: 60, cols: 8 };

// Where each piece of the story lives on the 0 → 1 scroll track.
const T = {
  hills: [0, 0.2], // the glide
  foliage: [0, 0.16], // leaves pass the lens during the glide
  push: [0.19, 0.5], // hills → building → through the glass → the interview
  overwhelm: [0.5, 0.8], // golden turns grey, papers fly, head in hands
  papers: [0.72, 0.9], // sheets rush past the camera, then turn into signal
  clarityIn: [0.88, 0.94],
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, [a, b]: number[]) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Paper = { x: number; y: number; rot: number; spin: number; tile: number; delay: number };
type Seq = { frames: (HTMLImageElement | null)[]; url: (i: number) => string };

export function HeroFilm() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!el || !canvas || !ctx) return;
    const reduced = prefersReducedMotion();
    let alive = true;

    // ——— assets: frame sequences, loaded in the order the story needs them ———
    const size = window.innerWidth < 768 ? "sm" : "lg";
    const seq = ({ id, count }: { id: string; count: number }): Seq => ({
      frames: new Array(count).fill(null),
      url: (i) => `/frames/${id}/${size}/${String(i + 1).padStart(4, "0")}.webp`,
    });
    const hills = seq(SEQ.hills);
    const foliage = seq(SEQ.foliage);
    const push = seq(SEQ.push);
    const overwhelm = seq(SEQ.overwhelm);
    const load = (s: Seq, i: number) =>
      new Promise<void>((res) => {
        if (s.frames[i] || !alive) return res();
        const im = new Image();
        im.decoding = "async";
        im.onload = () => {
          s.frames[i] = im;
          res();
        };
        im.onerror = () => res();
        im.src = s.url(i);
      });
    // A queue drained by a few workers: first frames, then a coarse pass (every 6th)
    // so scrubbing works early, then everything, act by act.
    const queue: [Seq, number][] = [];
    const add = (s: Seq, step: number) => s.frames.forEach((_, i) => i % step === 0 && queue.push([s, i]));
    [hills, foliage, push, overwhelm].forEach((s) => queue.push([s, 0]));
    [hills, foliage, push].forEach((s) => add(s, 6));
    [hills, foliage, push].forEach((s) => add(s, 1));
    add(overwhelm, 6);
    add(overwhelm, 1);
    const worker = async () => {
      while (alive && queue.length) {
        const [s, i] = queue.shift()!;
        await load(s, i);
      }
    };
    if (!reduced) for (let w = 0; w < 4; w++) worker();

    const still = (id: string) => {
      const e = getImage(id);
      const im = new Image();
      if (e) im.src = midSrc(id, e);
      return im;
    };
    const desk = still("hero-still");
    const paperAtlas = new Image();
    if (!reduced) paperAtlas.src = `/frames/${PAPER.id}/atlas.webp`;

    // ——— papers: real keyed sheets, each starting at a different point of the tumble ———
    const papers: Paper[] = Array.from({ length: window.innerWidth < 768 ? 26 : 46 }, () => ({
      x: (Math.random() - 0.5) * 1.7,
      y: (Math.random() - 0.35) * 0.9,
      rot: (Math.random() - 0.5) * 1.2,
      spin: (Math.random() - 0.5) * 1.6,
      tile: Math.floor(Math.random() * PAPER.count),
      delay: Math.random() * 0.45,
    }));

    // ——— film grain: a few tiles of noise, swapped and shifted every frame. It
    // restores the texture that video compression smooths away, and ties the
    // generated clips together as one piece of 35mm. ———
    const grain = Array.from({ length: 4 }, () => {
      const c = document.createElement("canvas");
      c.width = c.height = 192;
      const g = c.getContext("2d")!;
      const img = g.createImageData(192, 192);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 128 + (Math.random() + Math.random() + Math.random() - 1.5) * 90;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      return ctx.createPattern(c, "repeat")!;
    });
    let tick = 0;

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
    /** The frame at t (0..1) of a sequence, or the nearest one that has loaded. */
    const frameAt = (s: Seq, t: number) => {
      const n = s.frames.length, i = Math.round(clamp(t) * (n - 1));
      for (let d = 0; d < n; d++) {
        if (s.frames[i - d]) return s.frames[i - d];
        if (s.frames[i + d]) return s.frames[i + d];
      }
      return null;
    };

    const drawPapers = (p: number) => {
      const t = seg(p, T.papers);
      if (t <= 0 || t >= 1 || !paperAtlas.complete || !paperAtlas.naturalWidth) return;
      const f = Math.min(W, H) * 0.9; // focal length
      const tw = paperAtlas.naturalWidth / PAPER.cols; // one atlas tile, in image pixels
      for (const pp of papers) {
        const k = clamp((t - pp.delay * 0.5) / 0.55); // this sheet's flight 0..1
        if (k <= 0) continue;
        const z = 3.2 - k * 3.05; // far → just past the lens
        if (z <= 0.12) continue;
        const sx = W / 2 + (pp.x * f) / z;
        const sy = H * 0.6 + (pp.y * f) / z - k * H * 0.12;
        const s = (f / z) * 0.16;
        // The last stretch of the flight turns each sheet into a signal dot.
        const dot = clamp((t - 0.5 - pp.delay * 0.25) / 0.2);
        ctx.save();
        ctx.translate(sx, sy);
        if (dot < 1) {
          // Fade in from the distance, and out before a sheet fills the lens.
          ctx.globalAlpha = (1 - dot) * clamp(k * 4) * clamp((z - 0.35) / 0.6);
          ctx.rotate(pp.rot + k * pp.spin);
          const i = (pp.tile + Math.floor(k * 40)) % PAPER.count; // keeps tumbling as it flies
          ctx.drawImage(paperAtlas, (i % PAPER.cols) * tw, Math.floor(i / PAPER.cols) * tw, tw, tw, -s / 2, -s / 2, s, s);
        }
        if (dot > 0) {
          ctx.globalAlpha = dot * (1 - seg(p, [0.92, 0.98]));
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
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#0e1512";
      ctx.fillRect(0, 0, W, H);

      // Act 1: the glide, then one continuous push into the interview room.
      const glide = seg(p, T.hills);
      const into = seg(p, T.push);
      const pushIn = ease(seg(p, [T.push[0], T.push[0] + 0.03])); // crossfade hills → push
      const pushOut = 1 - ease(seg(p, [T.overwhelm[0] - 0.01, T.overwhelm[0] + 0.03]));
      if (pushIn < 1) cover(frameAt(hills, glide), 1.02 + glide * 0.08, 1, "none", 0.5, 0.62);
      if (pushIn > 0 && pushOut > 0) cover(frameAt(push, into), 1.04 + (1 - pushIn) * 0.06, pushIn * pushOut, "none", 0.5, 0.55);

      // Leaves rush past the lens: they spread outwards and sit darker and
      // softer than the plate, as foreground would against a dawn sky.
      const leaf = seg(p, T.foliage);
      const leafAlpha = 1 - ease(seg(p, [T.foliage[1] - 0.05, T.foliage[1]]));
      if (leafAlpha > 0) cover(frameAt(foliage, leaf), 1.05 + leaf * 0.6, leafAlpha, "brightness(0.62) saturate(0.85) blur(1.5px)", 0.5, 0.55);

      // Act 2: the recruiter's day, from golden to grey and buried in paper.
      const ow = seg(p, T.overwhelm);
      const owIn = ease(seg(p, [T.overwhelm[0] - 0.01, T.overwhelm[0] + 0.03]));
      const clarity = ease(seg(p, T.clarityIn));
      if (owIn > 0 && clarity < 1) {
        const dim = seg(p, [T.overwhelm[1] - 0.04, T.papers[1]]); // dims as the signal takes over
        cover(frameAt(overwhelm, ow), 1.04 + ow * 0.06, owIn, dim > 0 ? `brightness(${1 - dim * 0.55})` : "none", 0.4, 0.5);
      }
      cover(desk, 1.08 + seg(p, [0.88, 1]) * 0.04, clarity, "none", 0.45, 0.5);

      // Legibility: darken toward the bottom from the room onward.
      const shade = seg(p, [0.33, 0.37]);
      if (shade > 0) {
        const g = ctx.createLinearGradient(0, H, 0, 0);
        g.addColorStop(0, `rgba(14,21,18,${0.85 * shade})`);
        g.addColorStop(0.55, `rgba(14,21,18,${0.25 * shade})`);
        g.addColorStop(1, "rgba(14,21,18,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      drawPapers(p);

      // Grain last, over everything; drawn at device pixels so it stays fine.
      const gt = Math.floor(tick++ / 3); // ~20 grain changes a second, like film
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = grain[gt % grain.length];
      const ox = (gt * 53) % 192, oy = (gt * 97) % 192;
      ctx.translate(-ox, -oy);
      ctx.fillRect(0, 0, W * dpr + ox, H * dpr + oy);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
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
      load(hills, 0).then(() => draw(0));
      return () => {
        alive = false;
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
          end: "+=600%",
          pin: true,
          scrub: true,
          onUpdate: (self) => (target = self.progress),
        },
      });
      // Each beat: [in, out] on the 0..1 track. The first starts visible.
      const spans: [number, number][] = [[0, 0.1], [0.12, 0.28], [0.38, 0.5], [0.56, 0.7], [0.76, 0.88], [0.91, 1.01]];
      beats.forEach((b, i) => {
        const [a, z] = spans[i];
        if (i > 0) tl.fromTo(b, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.03 }, a);
        if (z <= 1) tl.to(b, { autoAlpha: 0, y: -40, duration: 0.03 }, z - 0.03);
      });
      tl.to({}, { duration: 0.001 }, 1); // pin the timeline length to exactly 0..1
    }, el);
    raf = requestAnimationFrame(loop);

    return () => {
      alive = false;
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

      {/* 1 — the building on the hill */}
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
