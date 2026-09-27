"use client";

/* Branded loader: counting with the wordmark. Skipped on repeat visits. */

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/icons";

export function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("intore-seen")) {
      onDone();
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        sessionStorage.setItem("intore-seen", "1");
        setTimeout(onDone, 150);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-night text-paper">
      <Wordmark onDark className="text-4xl" />
      <p className="mt-4 font-display text-6xl tabular-nums" aria-live="polite">
        {count}
        <span className="text-clay">%</span>
      </p>
      <div className="mt-6 h-px w-48 bg-paper/15">
        <div className="h-px bg-signal transition-[width]" style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}
