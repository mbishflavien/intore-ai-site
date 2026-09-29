"use client";

/* Final CTA: full-viewport contrast shift into night, over an ambient film loop.
 * Footer: designed, Kigali time, and an outline wordmark that draws itself in. */

import { useEffect, useState } from "react";
import { Button, Magnetic } from "@intoreai/design-system/primitives";
import { Reveal } from "@/lib/motion/reveal";
import { Wordmark, IconArrow } from "@/components/icons";
import { gsap } from "@/lib/motion/smooth";
import { useRef } from "react";
import { AmbientVideo } from "@/components/media/ambient-video";

function CtaLine({ text, accent = false }: { text: string; accent?: boolean }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <span className={`cta-word inline-block will-change-transform ${accent ? "text-signal" : ""}`}>
            {w}
          </span>
          {i < text.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-word",
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-night px-[clamp(20px,5vw,72px)] py-28 text-paper md:py-48">
      <AmbientVideo
        id="closing-loop"
        posterId="closing-still"
        alt="A hiring manager closes a laptop after a decision, Kigali at night (illustrative)"
        className="absolute inset-0 h-full w-full opacity-60"
        fallback={{ variant: "diamond", tone: "night", scale: 1.8 }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,21,18,0.55)_0%,rgba(14,21,18,0.92)_75%)]" />
      <div className="relative mx-auto max-w-[1400px] text-center">
        <p className="font-display leading-[1.0] font-black tracking-tight text-[clamp(2.25rem,6vw,5.5rem)]">
          <CtaLine text="Hiring decisions that move" />
          <br />
          <CtaLine text="faster —" accent /> <CtaLine text="without moving" />
          <br />
          <CtaLine text="the human out of the loop." />
        </p>
        <Reveal delay={0.2} className="mt-10 flex justify-center gap-4">
          <Magnetic>
            <Button href="/pilot" size="lg" variant="onDark" data-cursor="Go">
              Book a pilot <IconArrow className="h-5 w-5" />
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

function KigaliTime() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const f = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Kigali",
        }).format(new Date()),
      );
    f();
    const id = setInterval(f, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums">
      Kigali <span className="text-signal">{time}</span>
    </span>
  );
}

// Longer than any single glyph outline at this size, so each letter draws fully.
const DASH = 1400;

function OutlineWordmark() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        svg.querySelector("text"),
        { strokeDashoffset: DASH },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: svg, start: "top bottom", end: "bottom 85%", scrub: true },
        },
      );
      gsap.fromTo(
        svg.querySelector("circle"),
        { scale: 0, transformOrigin: "center" },
        {
          scale: 1,
          ease: "back.out(3)",
          scrollTrigger: { trigger: svg, start: "bottom 88%", toggleActions: "play reverse play reverse" },
        },
      );
    });
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} aria-hidden="true" viewBox="0 0 1000 190" className="mt-14 w-full select-none overflow-visible">
      <text
        x="487"
        y="160"
        textAnchor="middle"
        textLength="930"
        lengthAdjust="spacingAndGlyphs"
        className="font-display font-black"
        style={{ fontSize: 190, fill: "none", stroke: "rgba(246,243,236,0.4)", strokeWidth: 1.2, strokeDasharray: DASH }}
      >
        IntoreAI
      </text>
      <circle cx="975" cy="146" r="14" className="fill-signal" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-night pb-10 pt-16 text-paper">
      <div className="mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)]">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_auto_auto]">
          <div>
            <Wordmark onDark className="text-3xl" />
            <p className="mt-4 max-w-sm font-sans text-[15px] leading-relaxed text-paper/60">
              AI-powered screening, interviews, and integrity — with a human
              always making the final call.
            </p>
            <p className="mt-4 font-sans text-sm text-paper/40">
              <KigaliTime /> · CAT
            </p>
          </div>
          <nav aria-label="Product">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-paper/40">Product</p>
            <ul className="mt-3 space-y-2 font-sans text-[15px]">
              {[["Screening", "#product"], ["How it works", "#flow"], ["Trust", "#trust"], ["Roadmap", "#roadmap"]].map(([l, h]) => (
                <li key={l}>
                  <a href={h} className="text-paper/70 hover:text-paper">{l}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-paper/40">Company</p>
            <ul className="mt-3 space-y-2 font-sans text-[15px]">
              <li><a href="/pilot" className="text-paper/70 hover:text-paper">Book a pilot</a></li>
              <li><a href="/demo/shortlist" className="text-paper/70 hover:text-paper">Product preview</a></li>
              <li><a href="/legal" className="text-paper/70 hover:text-paper">Legal & privacy</a></li>
            </ul>
          </nav>
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-paper/40">Contact</p>
            <p className="mt-3 font-sans text-[15px] text-paper/70">pilots@intore.ai</p>
          </div>
        </div>
        <OutlineWordmark />
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-paper/10 pt-6 font-sans text-xs text-paper/40 md:flex-row">
          <p>© 2026 IntoreAI. All rights reserved.</p>
          <p>AI assists. Humans decide.</p>
        </div>
      </div>
    </footer>
  );
}
