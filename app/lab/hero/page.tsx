import type { Metadata } from "next";
import { LabHero } from "./lab";

// Private preview of the scroll-film hero; kept out of search.
export const metadata: Metadata = { title: "Hero film preview — IntoreAI", robots: { index: false, follow: false } };

export default function Page() {
  return <LabHero />;
}
