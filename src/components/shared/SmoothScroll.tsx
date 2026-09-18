"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scroll wired into GSAP's ticker so ScrollTrigger and the
 * scroll position stay perfectly in sync (one clock for everything).
 */
export default function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      anchors: true,
      respectReducedMotion: true,
    });
    lenis.current = instance;

    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis.current = null;
    };
  }, []);

  // Every concept shares this layout, so Lenis survives the route change
  // holding the old scroll position: land each one at the top of its story.
  // A reload is left alone — the browser restores that itself.
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.clearScrollMemory();
  }, [pathname]);

  return null;
}
