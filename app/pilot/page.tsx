import type { Metadata } from "next";
import { Button, Card, Badge, Kicker } from "@intoreai/design-system/primitives";
import { PilotForm } from "./form";
import { Wordmark, IconArrow, IconCheck } from "@/components/icons";
import { Imigongo } from "@/components/media/imigongo";
import { MediaImage } from "@/components/media/media-image";

export const metadata: Metadata = { title: "Book a pilot — IntoreAI" };

const STEPS = [
  ["Tell us about your hiring", "Roles, volume, and where screening hurts most. 20 minutes."],
  ["We configure a pilot", "Your jobs, your rubrics, your interviewers — no rip-and-replace."],
  ["You hire with evidence", "Ranked shortlists with written reasoning. You decide, always."],
];

export default function PilotPage() {
  return (
    <main className="bg-paper text-ink">
      <Imigongo variant="zigzag" tone="clay" scale={0.55} sweep={false} className="relative h-4" />
      <header className="mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)] py-6">
        <a href="/" aria-label="IntoreAI home">
          <Wordmark className="text-2xl" />
        </a>
      </header>

      <section className="mx-auto max-w-[1400px] px-[clamp(20px,5vw,72px)] pb-24 pt-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Kicker index="Pilot">Request access</Kicker>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.98]">
              Run hiring on <span className="text-signal">evidence.</span>
            </h1>
            <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
              Pilots run with your real roles and your real hiring team. We configure
              screening rubrics together, and every recommendation ships with its reasoning.
            </p>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -bottom-5 -right-5 left-8 top-8 overflow-hidden rounded-card">
              <Imigongo variant="diamond" tone="clay" scale={0.8} className="absolute inset-0" />
            </div>
            <MediaImage
              id="pillar-interview"
              alt="A structured interview in a Kigali meeting room (illustrative)"
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              parallax={false}
              className="aspect-[16/10] rounded-card shadow-[0_40px_80px_-40px_rgba(19,27,23,0.55)]"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <ol className="space-y-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex gap-5 rounded-card border border-line bg-surface-elevated p-6">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal-tint font-display text-lg font-black text-signal-deep">
                  {i + 1}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold">{t}</h2>
                  <p className="mt-1 font-sans text-[15px] text-ink-soft">{d}</p>
                </div>
              </li>
            ))}
            <li className="flex items-center gap-2 font-sans text-sm text-mist">
              <IconCheck className="h-5 w-5 text-signal" /> No auto-reject. No black boxes. Cancel anytime.
            </li>
          </ol>

          <Card className="h-fit p-8 md:p-10">
            <h2 className="font-display text-3xl font-bold">Request access</h2>
            <p className="mt-2 font-sans text-[15px] text-mist">
              We reply within two business days.
            </p>
            <PilotForm />
          </Card>
        </div>
      </section>
    </main>
  );
}
