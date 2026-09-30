import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--fd-fraunces",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--fd-public",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://intore.ai"),
  title: "IntoreAI — AI ranks. Humans decide.",
  description:
    "AI-powered screening, in-platform interviews, integrity monitoring, and explainable recommendations — with a human always making the final call.",
  openGraph: {
    title: "IntoreAI — AI ranks. Humans decide.",
    description:
      "Screening, interviews, integrity, and recommendations for hiring teams. Plus a Prep Hub for candidates.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body>
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
