"use client";

import { useState, type ReactNode } from "react";
import Nav from "@/components/shared/Nav";
import MusicStory from "./MusicStory";
import ThemeSwitch from "./ThemeSwitch";
import { THEMES, type MusicTheme } from "./themes";

type Props = {
  /** next/font class that exposes the music glyph variable. */
  fontClass: string;
  /** Font-family stack that contains the music glyphs. */
  musicFont: string;
  /** Sections rendered below the scroll story. */
  children: ReactNode;
};

/**
 * Owns the Concept 03 palette so the switch can swap it at runtime. The
 * variables are set here and inherited by everything on the page; the
 * canvas gets its ink handed to it directly.
 */
export default function MusicShell({ fontClass, musicFont, children }: Props) {
  const [theme, setTheme] = useState<MusicTheme>("dark");

  return (
    <main
      className={`theme-transition relative isolate ${fontClass}`}
      style={
        {
          ...THEMES[theme].vars,
          background: "var(--bg)",
          color: "var(--fg)",
        } as React.CSSProperties
      }
    >
      <Nav />
      <ThemeSwitch
        theme={theme}
        onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />
      <MusicStory musicFont={musicFont} theme={theme} />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
