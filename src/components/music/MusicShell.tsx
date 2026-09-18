import type { ReactNode } from "react";
import Nav from "@/components/shared/Nav";
import MusicStory from "./MusicStory";
import { THEME } from "./themes";

type Props = {
  /** next/font class that exposes the music glyph variable. */
  fontClass: string;
  /** Font-family stack that contains the music glyphs. */
  musicFont: string;
  /** Sections rendered below the scroll story. */
  children: ReactNode;
};

/**
 * Owns the Concept 03 palette. The variables are set here and inherited by
 * everything on the page; the canvas gets its ink handed to it directly.
 */
export default function MusicShell({ fontClass, musicFont, children }: Props) {
  return (
    <main
      className={`relative isolate ${fontClass}`}
      style={
        {
          ...THEME.vars,
          background: "var(--bg)",
          color: "var(--fg)",
        } as React.CSSProperties
      }
    >
      <Nav />
      <MusicStory musicFont={musicFont} />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
