"use client";

/* The Problem: pinned viewport, HR vs Seeker pains swap on scroll. */

import { useEffect, useRef } from "react";
import { Kicker } from "@intoreai/design-system/primitives";
import { gsap } from "@/lib/motion/smooth";

const HR = [
  ["Inconsistent CV review", "Two recruiters read the same CV and score it differently. Standards drift with mood, Monday, and workload."],
  ["Vanishing interview signal", "The insight from a great interview lives in someone's notebook. It never reaches the hiring decision."],
  ["All-or-nothing AI", "Tools that auto-reject candidates behind closed doors — unexplainable, unauditable, untrusted."],
];

const SEEKERS = [
  ["Black-hole applications", "You apply into silence. No stages, no feedback, no idea where you stand."],
  ["Unverifiable prep", "Interview advice scattered across the internet — none of it specific to the company you're facing."],
  ["Judged by keywords", "A career reduced to whether your CV happens to contain the right magic words."],
];

export function Problem() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelector(".swap-b")?.classList.remove("opacity-0");
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "+=220%", pin: true, scrub: 0.6 },
      });
      tl.to(".swap-a", { opacity: 0, y: -40, duration: 1 }, 0.5);
      tl.fromTo(".swap-b", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 }, 0.8);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative bg-night text-paper">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-[clamp(20px,5vw,72px)] py-24">
        <Kicker index="01" onDark>
          The problem
        </Kicker>
        <h2 className="mt-6 max-w-4xl font-display text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-[1.02]">
          Hiring is broken on <span className="text-clay">both sides</span> of the table.
        </h2>

        <div className="mt-10 flex gap-6 font-sans text-sm font-bold uppercase tracking-[0.18em]">
          <span className="text-paper">For HR & employers</span>
          <span className="text-signal">→ then job seekers</span>
          <span className="ml-auto hidden text-paper/40 md:inline">Scroll — hear the other side</span>
        </div>

        <div className="relative mt-8 min-h-[300px]">
          <ul className="swap-a grid gap-5 md:grid-cols-3">
            {HR.map(([t, d], i) => (
              <li key={t} className="rounded-card border border-paper/12 bg-night-soft p-7">
                <p className="font-display text-5xl font-black text-paper/15">0{i + 1}</p>
                <h3 className="mt-3 font-display text-2xl font-bold">{t}</h3>
                <p className="mt-2 font-sans text-[15px] leading-relaxed text-paper/65">{d}</p>
              </li>
            ))}
          </ul>
          <ul className="swap-b absolute inset-0 grid gap-5 opacity-0 md:grid-cols-3">
            {SEEKERS.map(([t, d], i) => (
              <li key={t} className="rounded-card border border-signal/30 bg-night-soft p-7">
                <p className="font-display text-5xl font-black text-signal/40">0{i + 1}</p>
                <h3 className="mt-3 font-display text-2xl font-bold">{t}</h3>
                <p className="mt-2 font-sans text-[15px] leading-relaxed text-paper/65">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

