"use client";

/* Scroll-scrubbed vertical drift for decorative layers. Off under reduced motion. */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/smooth";

export function Parallax({
  children,
  className = "",
  amount = 18,
}: {
  children: React.ReactNode;
  className?: string;
  /** Total travel in % of the element's height (positive drifts up). */
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: amount / 2 },
        {
          yPercent: -amount / 2,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, [amount]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
