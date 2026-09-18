"use client";

import { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Animates every `.reveal` descendant of `scope` in with a soft stagger the
 * first time the section enters the viewport.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const items = gsap.utils.toArray<HTMLElement>(".reveal", el);
      if (!items.length) return;

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          once: true,
        },
      });
    },
    { scope },
  );
}
