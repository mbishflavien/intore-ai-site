"use client";

/* Custom cursor: dot + lagging ring, morphs to labels. Touch/keyboard safe. */

import { useEffect, useRef, useState } from "react";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    setEnabled(true);
    let x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      raf = 0;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as HTMLElement).closest?.("[data-cursor]");
      setLabel(t ? t.getAttribute("data-cursor") : null);
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]">
      <div ref={dot} className="absolute left-0 top-0 -ml-[3px] -mt-[3px]">
        <div className="h-1.5 w-1.5 rounded-full bg-clay" />
      </div>
      <div ref={ring} className="absolute left-0 top-0 -ml-5 -mt-5">
        <div
          className={`flex items-center justify-center rounded-full border border-ink/30 transition-all duration-200 ${
            label ? "h-16 w-16 bg-ink text-paper" : "h-10 w-10 bg-transparent"
          }`}
        >
          {label && (
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em]">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
