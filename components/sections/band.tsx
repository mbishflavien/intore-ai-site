"use client";

/* Trust marquee band: real differentiators, two counter-rotating rows. */

import { Marquee } from "@intoreai/design-system/primitives";

const ROW_A = ["Human-in-the-loop", "Explainable AI", "Bias guardrails", "Consented monitoring"];
const ROW_B = ["GDPR-aligned", "Rwanda DPL", "EU AI Act ready", "Humans always decide"];

function Row({ items, dot }: { items: string[]; dot: string }) {
  return (
    <>
      {items.map((t) => (
        <span key={t} className="mx-6 inline-flex items-center gap-6 whitespace-nowrap">
          <span className="font-display text-3xl font-black tracking-tight md:text-4xl">{t}</span>
          <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
        </span>
      ))}
    </>
  );
}

export function TrustBand() {
  return (
    <section aria-label="Trust signals" className="overflow-hidden border-y border-line bg-clay py-2 text-paper">
      <Marquee speed={30}>
        <Row items={ROW_A} dot="bg-paper" />
      </Marquee>
      <div className="border-t border-paper/25">
        <Marquee speed={38} reverse>
          <Row items={ROW_B} dot="bg-night" />
        </Marquee>
      </div>
    </section>
  );
}
