"use client";

/* Cinematic-only: Lenis smooth scroll wired to GSAP ScrollTrigger. */

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let current: Lenis | null = null;

/** Freeze page scroll (e.g. under the mobile menu), with or without Lenis. */
export function setScrollLocked(locked: boolean) {
  if (locked) current?.stop();
  else current?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      current = null;
    };
  }, []);

  return <>{children}</>;
}

export { gsap, ScrollTrigger };
