"use client";

import { useState } from "react";
import { Button, Badge } from "@intoreai/design-system/primitives";
import { IconArrow } from "@/components/icons";

const inputCls =
  "min-h-[48px] w-full rounded-xl border border-line bg-paper px-4 font-sans text-[15px] outline-none placeholder:text-mist/60 focus:border-signal";
const labelCls =
  "mb-1.5 block font-sans text-xs font-bold uppercase tracking-[0.14em] text-mist";

export function PilotForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p role="status" className="mt-6 rounded-card border border-signal/30 bg-signal-tint p-6 font-sans font-semibold text-signal-deep">
        Received — we will be in touch within two business days.
      </p>
    );
  }

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Name</span>
          <input required name="name" autoComplete="name" className={inputCls} placeholder="Aline Mukamana" />
        </label>
        <label className="block">
          <span className={labelCls}>Company</span>
          <input required name="company" autoComplete="organization" className={inputCls} placeholder="Acme Ltd" />
        </label>
      </div>
      <label className="block">
        <span className={labelCls}>Work email</span>
        <input required name="email" type="email" autoComplete="email" className={inputCls} placeholder="you@company.com" />
      </label>
      <label className="block">
        <span className={labelCls}>What are you hiring for?</span>
        <textarea required name="roles" rows={4} className={`${inputCls} py-3`} placeholder="e.g. 6 engineers and 2 designers this quarter…" />
      </label>
      <Button type="submit" size="lg" className="w-full">
        Request access <IconArrow className="h-5 w-5" />
      </Button>
      <p className="font-sans text-xs text-mist">
        Or write directly: <span className="font-semibold text-ink">pilots@intore.ai</span> · <Badge tone="line">GDPR-aware handling</Badge>
      </p>
    </form>
  );
}
