"use client";

import { useEffect, useRef } from "react";
import { drawScene, invalidateGlyphCache, type Palette } from "./scene";
import { musicState } from "./state";
import { THEME } from "./themes";

type Props = {
  /** CSS font-family stack that contains music glyphs. */
  musicFont: string;
};

/**
 * Fixed full-screen 2D canvas. Runs its own rAF loop, smooths the
 * scroll-driven state and hands everything to `drawScene`.
 *
 * It sits at a negative z-index inside the page's isolated stacking
 * context, so every piece of copy is guaranteed to render above it.
 */
export default function MusicCanvas({ musicFont }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    // Clefs, rests and accidentals are drawn with a music font; once it has
    // actually loaded, drop the glyph metrics measured against the fallback.
    let cancelled = false;
    if ("fonts" in document) {
      const probes = ["\u{1D11E}", "\u{1D122}", "\u{1D13D}", "\u266F"];
      Promise.all(probes.map((ch) => document.fonts.load(`100px ${musicFont}`, ch)))
        .then(() => {
          if (!cancelled) invalidateGlyphCache();
        })
        .catch(() => {});
    }

    // `codaCy` is geometry, not a mood: it is copied straight through so the
    // wave sticks to the contact copy instead of trailing it while scrolling.
    const smoothed = { shape: musicState.shape, opacity: 1, velocity: 0, codaCy: 0 };
    const pal: Palette = { ...THEME.canvas, musicFont };
    let raf = 0;
    let last = performance.now();
    const start = last;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = Math.min(1, dt * 5.5);
      smoothed.shape += (musicState.shape - smoothed.shape) * k;
      smoothed.opacity += (musicState.opacity - smoothed.opacity) * k;
      musicState.velocity += (0 - musicState.velocity) * Math.min(1, dt * 3);
      smoothed.velocity = musicState.velocity;
      smoothed.codaCy = musicState.codaCy;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene(ctx, W, H, (now - start) / 1000, smoothed, pal, dpr);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [musicFont]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
