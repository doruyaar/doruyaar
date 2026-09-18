"use client";

import { useRef } from "react";
import { experience } from "@/content/mock";
import { useReveal } from "./useReveal";

/** Professional experience, rendered as an editorial timeline. */
export default function Work() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="work"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-10 md:py-44"
    >
      <div className="mb-16 flex items-end justify-between gap-6 md:mb-24">
        <h2 className="display reveal text-[clamp(2.4rem,6vw,5.5rem)]">
          Experience
        </h2>
        <p className="eyebrow reveal pb-3">
          {experience[experience.length - 1].period.split(" ")[0]} - today
        </p>
      </div>

      <ol>
        {experience.map((e) => (
          <li
            key={e.id}
            className="reveal group grid gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-8 md:py-14"
          >
            <div className="md:col-span-3">
              <p className="eyebrow">{e.period}</p>
              <p className="mt-3 font-mono text-sm text-accent">{e.highlight}</p>
            </div>
            <div className="md:col-span-4">
              <h3 className="text-[clamp(1.4rem,2.4vw,2.2rem)] leading-tight tracking-tight">
                {e.role}
              </h3>
              <p className="mt-2 text-muted">{e.company}</p>
              <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted/70">
                {e.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </p>
            </div>
            <div className="md:col-span-5">
              <p className="text-lg leading-relaxed">{e.summary}</p>
              <ul className="mt-5 space-y-2 text-muted">
                {e.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-muted/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
