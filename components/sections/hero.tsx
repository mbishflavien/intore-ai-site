"use client";

/* Hero: kinetic split-text headline + generative "signal in noise" canvas. */

import { useEffect, useRef } from "react";
import { Button, Magnetic, Badge } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";
import { splitWords } from "@/lib/motion/reveal";
import { IconArrow } from "@/components/icons";

function SignalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0,
      h = 0;
    const dots = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.6 + 0.4,
      v: Math.random() * 0.0006 + 0.0002,
      lit: Math.random() < 0.18,
    }));
    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      w = canvas.width = r.width;
      h = canvas.height = r.height;
    };
    resize();
    window.addEventListener("resize", resize);
    let t = 0;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      // faint field
      ctx.fillStyle = "rgba(19,27,23,0.10)";
      for (const d of dots) {
        d.y -= d.v;
        if (d.y < 0) d.y = 1;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.s, 0, Math.PI * 2);
        ctx.fill();
      }
      // lit signals rising + connecting threads
      const lit = dots.filter((d) => d.lit);
      ctx.strokeStyle = "rgba(18,128,92,0.35)";
      ctx.lineWidth = 1;
      for (let i = 0; i < lit.length; i++) {
        for (let j = i + 1; j < lit.length; j++) {
          const dx = (lit[i].x - lit[j].x) * w;
          const dy = (lit[i].y - lit[j].y) * h;
          if (dx * dx + dy * dy < 130 * 130) {
            ctx.beginPath();
            ctx.moveTo(lit[i].x * w, lit[i].y * h);
            ctx.lineTo(lit[j].x * w, lit[j].y * h);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "#12805c";
      for (const d of lit) {
        const pulse = 2 + Math.sin(t / 22 + d.x * 9) * 0.9;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

export function Hero({ started }: { started: boolean }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!started) return;
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".word-inner",
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.05, delay: 0.15 },
      );
      gsap.fromTo(
        ".hero-fade",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.12, delay: 0.7 },
      );
    }, el);
    return () => ctx.revert();
  }, [started]);

  return (
    <section ref={root} id="top" className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <SignalCanvas />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)]">
        <p className="hero-fade mb-6">
          <Badge tone="signal">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
            Pilot-stage · Kigali & remote teams
          </Badge>
        </p>
        <h1 className="font-display font-black leading-[0.95] tracking-tight text-ink text-[clamp(3rem,9vw,8.5rem)]">
          {splitWords("AI ranks the shortlist.")}
          <br />
          <span className="text-signal">{splitWords("Humans make the hire.")}</span>
        </h1>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="hero-fade max-w-xl font-sans text-lg leading-relaxed text-ink-soft md:text-xl">
            IntoreAI screens every application, runs structured interviews, and flags
            integrity risks — then hands you an explainable recommendation.
            The decision is always yours.
          </p>
          <div className="hero-fade flex flex-wrap items-center gap-4">
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

        <dl className="hero-fade mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-4">
          {[
            ["Screen", "Every CV scored, explained"],
            ["Interview", "Structured, in-platform"],
            ["Integrity", "Flags, never verdicts"],
            ["Prep Hub", "Candidates arrive ready"],
          ].map(([t, d]) => (
            <div key={t} className="bg-paper px-6 py-5">
              <dt className="font-display text-2xl font-bold">{t}</dt>
              <dd className="mt-1 font-sans text-sm text-mist">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
