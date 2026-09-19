import type { Metadata } from "next";
import { Noto_Music } from "next/font/google";
import Work from "@/components/shared/Work";
import Projects from "@/components/shared/Projects";
import About from "@/components/shared/About";
import Contact from "@/components/shared/Contact";
import MusicShell from "@/components/music/MusicShell";

export const metadata: Metadata = { title: "Concept 02 · Music" };

/** Real engraving glyphs (clefs, rests, accidentals) for the canvas score. */
const notoMusic = Noto_Music({
  weight: "400",
  subsets: ["music"],
  display: "swap",
  variable: "--font-music",
});

/**
 * Concept 02 - “Noise → Music”.
 * One waveform is tuned from static into rhythm, harmony and finally a
 * melody as you scroll, engraved on a paper palette.
 */
export default function MusicPage() {
  return (
    <MusicShell
      fontClass={notoMusic.variable}
      musicFont={`${notoMusic.style.fontFamily}, "Apple Symbols", "Segoe UI Symbol", serif`}
    >
      <Work />
      <Projects />
      <About />
      <Contact />
    </MusicShell>
  );
}
