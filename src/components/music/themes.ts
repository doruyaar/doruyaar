import type { Palette } from "./scene";

export type MusicTheme = "dark" | "light";

/** Canvas ink for one theme. The font stack is added by the story. */
export type CanvasColors = Omit<Palette, "musicFont">;

type Theme = {
  /** Semantic tokens set on the page root; see globals.css. */
  vars: Record<string, string>;
  canvas: CanvasColors;
};

/**
 * Concept 03 runs in two keys.
 *
 * `dark` is the studio: cool ivory ink on deep navy with a calm, confident
 * blue accent. `light` is the score on paper and reuses the /pipeline
 * palette verbatim, so the two concepts read as one system.
 *
 * In both, the waveform is a desaturated steel blue that sits visually
 * *behind* the copy instead of competing with it.
 */
export const THEMES: Record<MusicTheme, Theme> = {
  dark: {
    vars: {
      "--bg": "#0b0f17",
      "--fg": "#eef2f8",
      "--muted": "#8b96a8",
      "--line": "rgba(238,242,248,0.12)",
      "--accent": "#5b9dff",
      "--accent-ink": "#06183a",
    },
    canvas: { fg: "#eef2f8", accent: "#5b9dff", muted: "#8b96a8", wave: "#6d86ad" },
  },
  light: {
    vars: {
      "--bg": "#f4f2ec",
      "--fg": "#111114",
      "--muted": "#6e6e73",
      "--line": "rgba(17,17,20,0.12)",
      "--accent": "#1f4bff",
      "--accent-ink": "#ffffff",
    },
    canvas: { fg: "#111114", accent: "#1f4bff", muted: "#6e6e73", wave: "#5b6a91" },
  },
};
