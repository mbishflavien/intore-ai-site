"use client";

/* Hero reel: the signature moment. A framed film window expands to full-bleed
 * as you scroll (pinned, scrubbed clip-path), the emerald signal field lights up
 * over the footage, and the promise lands word by word. Reverses on scroll-up. */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/smooth";
import { prefersReducedMotion } from "@/lib/media";
import { AmbientVideo } from "@/components/media/ambient-video";
import { SignalCanvas } from "./hero";

const FRAMED = "inset(12% 8% 12% 8% round 28px)";

function Words({ text, accent = false }: { text: string; accent?: boolean }) {
  return (
    <>
      {text.split(" ").map((w, i, all) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <span className={`reel-word inline-block will-change-transform ${accent ? "text-signal" : ""}`}>{w}</span>
          {i < all.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function Reel() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const frame = el.querySelector<HTMLElement>(".reel-frame");
    if (prefersReducedMotion()) {
      if (frame) frame.style.clipPath = "none";
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "+=130%", pin: true, scrub: 0.7 },
      });
      tl.fromTo(".reel-frame", { clipPath: FRAMED }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", duration: 1 }, 0)
        .fromTo(".reel-media", { scale: 1.22 }, { scale: 1, ease: "none", duration: 1 }, 0)
        .fromTo(".reel-signal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.45)
        .fromTo(".reel-word", { yPercent: 115 }, { yPercent: 0, stagger: 0.05, duration: 0.35, ease: "power3.out" }, 0.6)
        .fromTo(".reel-note", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25 }, 0.85);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label="IntoreAI in context" className="relative h-[100svh] overflow-hidden bg-paper">
      <div className="reel-frame absolute inset-0 overflow-hidden bg-night" style={{ clipPath: FRAMED }}>
        <div className="reel-media absolute inset-0 will-change-transform">
          <AmbientVideo
            id="hero-loop"
            posterId="hero-still"
            eager
            alt="A recruiter in Kigali reviews a ranked shortlist at dawn (illustrative)"
            className="absolute inset-0 h-full w-full"
            fallback={{ variant: "zigzag", tone: "night", scale: 1.6 }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-night/10" />
        <div className="reel-signal pointer-events-none absolute inset-0 opacity-0 mix-blend-screen">
          <SignalCanvas onDark />
        </div>

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)] pb-[clamp(32px,8vh,96px)] text-paper">
          <p className="font-display font-black leading-[0.98] tracking-tight text-[clamp(2.25rem,6.5vw,6rem)]">
            <Words text="Every application read." />
            <br />
            <Words text="Every decision yours." accent />
          </p>
          <p className="reel-note mt-6 max-w-md font-sans text-[15px] leading-relaxed text-paper/70">
            The AI does the reading, scoring and flagging. The judgement, and the hire, stay with your team.
          </p>
        </div>
      </div>
    </section>
  );
}
