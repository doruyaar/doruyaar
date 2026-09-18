"use client";

import type { MusicTheme } from "./themes";

type Props = {
  theme: MusicTheme;
  onToggle: () => void;
};

/** How each theme is named in the switch. */
const LABEL: Record<MusicTheme, string> = { dark: "Studio", light: "Paper" };

/**
 * Light/dark switch for Concept 03. Sits under the nav so it stays clear of
 * the concept tabs at the bottom of the screen.
 */
export default function ThemeSwitch({ theme, onToggle }: Props) {
  const light = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label="Light theme"
      onClick={onToggle}
      className="fixed right-6 top-[4.6rem] z-40 flex items-center gap-3 rounded-full border border-line bg-bg/70 py-1.5 pl-4 pr-1.5 backdrop-blur-xl transition-colors duration-300 hover:border-fg/25 md:right-10"
    >
      <span className="eyebrow">{LABEL[theme]}</span>
      <span className="relative block h-5 w-9 rounded-full bg-fg/12">
        <span
          className={[
            "absolute left-0.5 top-0.5 block h-4 w-4 rounded-full bg-accent transition-transform duration-300 ease-out",
            light ? "translate-x-4" : "translate-x-0",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
