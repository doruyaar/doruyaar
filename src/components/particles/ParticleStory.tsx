"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { profile, stages } from "@/content/mock";
import { gsap, useGSAP } from "@/lib/gsap";
import { useStageProgress } from "@/components/shared/useStageProgress";
import { particleState } from "./state";

const ParticleScene = dynamic(() => import("./ParticleScene"), { ssr: false });

/**
 * Concept 02 — the fixed particle canvas plus the scroll sections that drive
 * which shape the particles are forming.
 */
export default function ParticleStory() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".hero-meta",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, delay: 0.9 },
      );
    },
    { scope: ref },
  );

  // Shape = sum of all progresses: 0 name → 1 chaos → 2 warehouse →
  // 3 network → 4 3D graph → 5 ambient (work) → 6 initials (contact).
  useStageProgress(ref, {
    extras: [
      { id: "work", start: "top bottom", end: "top 20%" },
      { id: "contact", start: "top 85%", end: "top 5%" },
    ],
    onChange: (p, velocity) => {
      const n = stages.length;
      const pWork = p[n] ?? 0;
      const pContact = p[n + 1] ?? 0;
      particleState.shape = p.reduce((a, b) => a + b, 0);
      // Beside the text during the story, centred for the backdrop, to the
      // right of the CTA at the end.
      particleState.offsetX = 2.4 * p[0] * (1 - pWork) + 5.4 * pContact;
      particleState.opacity = 1 - 0.68 * pWork + 0.45 * pContact;
      particleState.velocity = velocity;
    },
  });

  return (
    <div ref={ref} className="relative">
      <ParticleScene color="#e9e9e6" accent="#7df3c8" />

      {/* Hero: the particles ARE the name; HTML keeps it accessible. */}
      <section
        id="top"
        className="relative z-10 flex h-[100svh] flex-col justify-end px-6 pb-16 md:px-10 md:pb-20"
      >
        <h1 className="sr-only">{profile.name}</h1>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="hero-meta eyebrow mb-4">{profile.roleLong}</p>
            <p className="hero-meta max-w-md text-lg leading-relaxed text-muted md:text-xl">
              {profile.tagline}
            </p>
          </div>
          <p className="hero-meta eyebrow flex items-center gap-3">
            <span className="inline-block h-6 w-px animate-pulse bg-fg" />
            Scroll — signal from noise
          </p>
        </div>
      </section>

      {/* Story stages */}
      {stages.map((s) => (
        <section key={s.id} className="stage relative z-10 h-[160vh]">
          <div className="sticky top-0 flex h-[100svh] items-center px-6 md:px-10">
            <article className="w-full max-w-md md:max-w-lg">
              <p className="eyebrow reveal mb-5">
                {s.index} / {s.id}
              </p>
              <h2 className="display reveal text-[clamp(2.2rem,5vw,4.8rem)]">
                {s.title}
              </h2>
              <p className="reveal mt-6 text-lg leading-relaxed text-muted">
                {s.body}
              </p>
              <ul className="reveal mt-7 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-muted/80">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      ))}
    </div>
  );
}
