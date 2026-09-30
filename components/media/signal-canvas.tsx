"use client";

/* Generative "signal in noise": drifting dots where a few emerald signals
 * pulse and link up. Paused off-screen; off under reduced motion. */

import { useEffect, useRef } from "react";

export function SignalCanvas({ onDark = false }: { onDark?: boolean }) {
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
      ctx.fillStyle = onDark ? "rgba(246,243,236,0.22)" : "rgba(19,27,23,0.10)";
      for (const d of dots) {
        d.y -= d.v;
        if (d.y < 0) d.y = 1;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.s, 0, Math.PI * 2);
        ctx.fill();
      }
      // lit signals rising + connecting threads
      const lit = dots.filter((d) => d.lit);
      ctx.strokeStyle = onDark ? "rgba(40,190,140,0.5)" : "rgba(18,128,92,0.35)";
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
      ctx.fillStyle = onDark ? "#2fbf8c" : "#12805c";
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
  }, [onDark]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
