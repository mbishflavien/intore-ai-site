import type { Metadata } from "next";
import { Button, Card, Badge, Tag, Skeleton } from "@intoreai/design-system/primitives";
import { Wordmark, IconCheck, IconShield, IconEye } from "@/components/icons";

export const metadata: Metadata = { title: "Product preview — AI shortlist — IntoreAI" };

/*
 * PROOF OF CONSISTENCY (Section 3A acceptance test):
 * a real product screen built with ONLY @intoreai/design-system primitives
 * and tokens. Zero cinematic imports (no GSAP, no Lenis, no cursor) —
 * yet it reads as the same company as the marketing homepage.
 * Sample data, clearly labeled.
 */

const CANDIDATES = [
  {
    rank: 1,
    name: "Aline Mukamana",
    score: 92,
    verdict: "Advance to offer",
    tone: "signal" as const,
    strengths: ["Verified proof ×3", "Relevance 88"],
    gaps: ["System design depth"],
    reasoning: "Top verified-proof score in pool; panel unanimous on communication.",
  },
  {
    rank: 2,
    name: "Jean Claude N.",
    score: 78,
    verdict: "Advance to interview",
    tone: "signal" as const,
    strengths: ["Strong SQL proof", "Kigali-based"],
    gaps: ["No systems experience"],
    reasoning: "Solid technical signal; confirm seniority in a structured round.",
  },
  {
    rank: 3,
    name: "Divine Uwase",
    score: 64,
    verdict: "Hold — needs review",
    tone: "gold" as const,
    strengths: ["Fast learner signal"],
    gaps: ["Sparse evidence", "Unverified claims ×2"],
    reasoning: "Potential, but evidence is thin. Human review required before any move.",
  },
];

export default function ShortlistDemo() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-paper/90">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-[clamp(20px,5vw,72px)] py-4">
          <a href="/" aria-label="Back to site">
            <Wordmark className="text-xl" />
          </a>
          <Badge tone="clay">Sample data — product preview</Badge>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,72px)] py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-mist">
              Senior Full-Stack Engineer · 34 applicants
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">
              AI shortlist
            </h1>
            <p className="mt-2 max-w-xl font-sans text-[15px] text-ink-soft">
              Ranked and explained. Nothing here hires anyone —{" "}
              <strong>you sign every decision.</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">Export report</Button>
            <Button size="sm">Schedule interviews</Button>
          </div>
        </div>

        <ol className="mt-8 space-y-4">
          {CANDIDATES.map((c) => (
            <li key={c.rank}>
              <Card className="p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg font-black text-paper"
                    >
                      {c.rank}
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-bold">{c.name}</h2>
                      <p className="mt-1 flex flex-wrap gap-1.5">
                        {c.strengths.map((s) => (
                          <Tag key={s} tone="signal">{s}</Tag>
                        ))}
                        {c.gaps.map((g) => (
                          <Tag key={g} tone="line">{g}</Tag>
                        ))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-5xl font-black tabular-nums">{c.score}</p>
                    <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-mist">fit score</p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/[0.08]">
                  <div className="h-full rounded-full bg-signal" style={{ width: `${c.score}%` }} />
                </div>

                <div className="mt-4 grid gap-3 rounded-xl bg-paper p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <p className="font-sans text-sm leading-relaxed text-ink-soft">
                    <IconEye className="mr-1.5 inline h-4 w-4 text-signal" />
                    {c.reasoning}
                  </p>
                  <Badge tone={c.tone}>{c.verdict}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm">Advance</Button>
                  <Button size="sm" variant="secondary">Hold</Button>
                  <Button size="sm" variant="ghost">Reject with reason</Button>
                  <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-xs text-mist">
                    <IconShield className="h-4 w-4 text-signal" /> Decision trail recorded
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <Card className="mt-6 flex items-start gap-3 border-signal/30 bg-signal-tint p-5">
          <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-signal-deep" />
          <p className="font-sans text-sm leading-relaxed text-signal-deep">
            <strong>Integrity note:</strong> one applicant was excluded from ranking
            pending document verification — shown to you, never silently dropped.
            This screen uses only shared design-system primitives: same type, same
            color logic, same motion language as the marketing site.
          </p>
        </Card>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-mist">Loading state</p>
            <Skeleton className="mt-3 h-5 w-2/3" />
            <Skeleton className="mt-2 h-5 w-1/2" />
          </Card>
          <Card className="flex items-center justify-between p-5">
            <p className="font-sans text-sm font-semibold">Same company, both surfaces.</p>
            <Button href="/" variant="secondary" size="sm">Back to site</Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
