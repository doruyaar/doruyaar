"use client";

import { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export type ExtraTrigger = { id: string; start: string; end: string };

type Options = {
  /** Selector (inside `scope`) for the story sections, in order. */
  stageSelector?: string;
  /** Where the morph should be complete while a stage slides in. */
  stageEnd?: string;
  /** Elements outside `scope` (by id) that own one extra progress each. */
  extras?: ExtraTrigger[];
  /** Fires with the array of 0→1 progresses (stages first, extras after). */
  onChange: (progress: number[], velocity: number) => void;
};

/**
 * Scroll story driver shared by the canvas-based concepts.
 *
 * Every stage section owns one 0→1 progress that fills while the section
 * slides into view; extras (e.g. #work, #contact) each own one more. The
 * consumer typically sums them into a continuous "shape" value. Because
 * each trigger only writes its own slot, ScrollTrigger refresh order can
 * never produce an inconsistent state.
 *
 * Also reveals `.reveal` children of each stage once it is mostly in view.
 */
export function useStageProgress(
  scope: RefObject<HTMLElement | null>,
  { stageSelector = ".stage", stageEnd = "top 15%", extras = [], onChange }: Options,
) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const sections = q<HTMLElement>(stageSelector);
      const progress = new Array<number>(sections.length + extras.length).fill(0);

      const emit = (velocity = 0) => onChange(progress.slice(), velocity);

      const track = (i: number, trigger: Element, start: string, end: string) =>
        ScrollTrigger.create({
          trigger,
          start,
          end,
          onUpdate: (st) => {
            progress[i] = st.progress;
            emit(Math.min(1, Math.abs(st.getVelocity()) / 5000));
          },
          onRefresh: (st) => {
            progress[i] = st.progress;
            emit();
          },
        });

      sections.forEach((sec, i) => {
        track(i, sec, "top bottom", stageEnd);
        const items = sec.querySelectorAll(".reveal");
        if (items.length) {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.08,
            scrollTrigger: { trigger: sec, start: "top 55%", once: true },
          });
        }
      });

      // Selector strings inside a scoped gsap.context resolve relative to the
      // scope, so look these up on the document explicitly.
      extras.forEach((x, k) => {
        const el = document.getElementById(x.id);
        if (el) track(sections.length + k, el, x.start, x.end);
      });

      emit();
    },
    { scope },
  );
}
