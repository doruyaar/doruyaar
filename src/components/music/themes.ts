import type { Palette } from "./scene";

/** Canvas ink for the concept. The font stack is added by the story. */
export type CanvasColors = Omit<Palette, "musicFont">;

/**
 * Concept 03 is the score on paper: it reuses the /pipeline palette
 * verbatim, so the two concepts read as one system.
 *
 * The waveform is a desaturated steel blue that sits visually *behind*
 * the copy instead of competing with it.
 */
export const THEME: {
  /** Semantic tokens set on the page root; see globals.css. */
  vars: Record<string, string>;
  canvas: CanvasColors;
} = {
  vars: {
    "--bg": "#f4f2ec",
    "--fg": "#111114",
    "--muted": "#6e6e73",
    "--line": "rgba(17,17,20,0.12)",
    "--accent": "#1f4bff",
    "--accent-ink": "#ffffff",
  },
  canvas: { fg: "#111114", accent: "#1f4bff", muted: "#6e6e73", wave: "#5b6a91" },
};
