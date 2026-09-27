"use client";

/* Trigger-once staggered reveal (systemic — same feel as dashboard motion). */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/smooth";

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          delay,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    });
    return () => ctx.revert();
  }, [delay, y]);

  return (
    // @ts-expect-error polymorphic tag
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Split a string into word spans for kinetic stagger reveals. */
export function splitWords(text: string): React.ReactNode[] {
  return text.split(" ").map((w, i) => (
    <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
      <span className="word-inner inline-block will-change-transform">{w}</span>
      {i < text.split(" ").length - 1 ? "\u00A0" : ""}
    </span>
  ));
}
