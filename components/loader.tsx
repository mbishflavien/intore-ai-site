"use client";

/* Branded loader: counting with the wordmark. Skipped on repeat visits.
 * Exit: the wordmark's signal dot swells to fill the screen ("signal found"),
 * then the curtain lifts onto the hero. onDone fires as the curtain starts
 * lifting (hero begins its reveal underneath); onExit when it's gone. */

import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/icons";
import { gsap } from "@/lib/motion/smooth";
import { prefersReducedMotion } from "@/lib/media";

export function Loader({ onDone, onExit }: { onDone: () => void; onExit: () => void }) {
  const [count, setCount] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  // Parent re-renders mid-exit (started → true); keep the effect from restarting.
  const cb = useRef({ onDone, onExit });
  cb.current = { onDone, onExit };

  useEffect(() => {
    const onDone = () => cb.current.onDone();
    const onExit = () => cb.current.onExit();
    if (sessionStorage.getItem("intore-seen")) {
      onDone();
      onExit();
      return;
    }
    const exit = () => {
      sessionStorage.setItem("intore-seen", "1");
      const el = root.current;
      // The Wordmark's trailing dot.
      const dot = el?.querySelector<HTMLElement>(".rounded-full.bg-signal");
      if (!el || !dot || prefersReducedMotion()) {
        onDone();
        onExit();
        return;
      }
      const r = dot.getBoundingClientRect();
      const reach = Math.hypot(
        Math.max(r.left, window.innerWidth - r.left),
        Math.max(r.top, window.innerHeight - r.top),
      );
      gsap
        .timeline()
        .to([".loader-fade", dot.previousElementSibling], { opacity: 0, y: -16, duration: 0.35, ease: "power2.in" })
        .to(dot, { scale: (reach * 2.2) / r.width, duration: 0.8, ease: "expo.in" }, 0.1)
        .add(onDone)
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" })
        .add(onExit);
    };
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(exit, 150);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-night text-paper"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <Wordmark onDark className="text-4xl" />
      <p className="loader-fade mt-4 font-display text-6xl tabular-nums" aria-live="polite">
        {count}
        <span className="text-clay">%</span>
      </p>
      <div className="loader-fade mt-6 h-px w-48 bg-paper/15">
        <div className="h-px bg-signal transition-[width]" style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}
