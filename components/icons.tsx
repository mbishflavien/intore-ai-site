"use client";

/* Custom IntoreAI icon family — 1.75px stroke, round caps.
 * Shared by marketing + product (empty states, status icons).
 * Never substitute a generic pack glyph for these. */

function Base({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconScreen = ({ className = "" }: { className?: string }) => (
  <Base className={className}>
    <path d="M4 5h16v11H4z" />
    <path d="M9 20h6M12 16v4" />
    <path d="M8 9.5l1.2 1.2L12 8M14 12.5l1.2 1.2L18 11" strokeWidth={1.5} />
  </Base>
);

export const IconInterview = ({ className = "" }: { className?: string }) => (
  <Base className={className}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
    <path d="M16 8.5l2 2 3.5-4" strokeWidth={1.5} />
  </Base>
);

export const IconShield = ({ className = "" }: { className?: string }) => (
  <Base className={className}>
    <path d="M12 3l7 2.8v5.4c0 4.4-3 7.6-7 9.3-4-1.7-7-4.9-7-9.3V5.8z" />
    <path d="M9.5 11.5l1.8 1.8 3.4-3.8" strokeWidth={1.5} />
  </Base>
);

export const IconSpark = ({ className = "" }: { className?: string }) => (
  <Base className={className}>
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
    <circle cx="12" cy="12" r="2.2" />
  </Base>
);

export const IconCompass = ({ className = "" }: { className?: string }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.5 8.5l-2.2 4.8-4.8 2.2 2.2-4.8z" />
  </Base>
);

export const IconCheck = ({ className = "" }: { className?: string }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.2l2.4 2.4 4.6-5" strokeWidth={2} />
  </Base>
);

export const IconArrow = ({ className = "" }: { className?: string }) => (
  <Base className={className}>
    <path d="M4 12h15M13 6l6 6-6 6" strokeWidth={2} />
  </Base>
);

export const IconEye = ({ className = "" }: { className?: string }) => (
  <Base className={className}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </Base>
);

/* Wordmark: "Intore" (Kinyarwanda — to gather/assemble) + signal dot. */
export function Wordmark({
  className = "",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={`inline-flex items-baseline gap-1 font-display font-black tracking-tight ${className}`}>
      <span className={onDark ? "text-paper" : "text-ink"}>IntoreAI</span>
      <span aria-hidden="true" className="inline-block h-[0.32em] w-[0.32em] rounded-full bg-signal" />
    </span>
  );
}
