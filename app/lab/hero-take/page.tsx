import type { Metadata } from "next";
import { LabHeroTake } from "./lab";

// Private preview of the scroll-film hero; kept out of search.
export const metadata: Metadata = { title: "Hero film (one take) preview — IntoreAI", robots: { index: false, follow: false } };

export default function Page() {
  return <LabHeroTake />;
}
