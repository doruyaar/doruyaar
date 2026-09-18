"use client";

import type Lenis from "lenis";

/**
 * `SmoothScroll` owns the single Lenis instance; this is where the rest of the
 * app borrows it from — a modal that needs to freeze the page can call
 * `getLenis()?.stop()` instead of fighting Lenis for control of the scroll.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}
