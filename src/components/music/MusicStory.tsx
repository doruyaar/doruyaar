"use client";

import { useRef } from "react";
import { profile, stages } from "@/content/mock";
import { gsap, useGSAP } from "@/lib/gsap";
import { useStageProgress } from "@/components/shared/useStageProgress";
import MusicCanvas from "./MusicCanvas";
import { musicState } from "./state";

/** Musical reading of each beat, shown as the stage eyebrow. */
const MOVEMENTS = ["noise", "rhythm", "harmony", "performance"];

type Props = {
  /** Font-family stack (from next/font) that contains the music glyphs. */
  musicFont: string;
};

/**
 * Concept 03 - “Noise → Music”.
 * A single waveform is tuned from static into a melody as you scroll.
 */
export default function MusicStory({ musicFont }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo(
        ".hero-word",
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.08 },
      ).fromTo(
        ".hero-meta",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
        "-=0.7",
      );

      gsap.to(".hero-fade", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: "#top",
          start: "40% top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  useStageProgress(ref, {
    extras: [
      { id: "work", start: "top bottom", end: "top 20%" },
      { id: "contact", start: "top 85%", end: "top 5%" },
    ],
    onChange: (p, velocity) => {
      const n = stages.length;
      const pWork = p[n] ?? 0;
      const pContact = p[n + 1] ?? 0;
      musicState.shape = p.reduce((a, b) => a + b, 0);
      musicState.opacity = 1 - 0.6 * pWork + 0.5 * pContact;
      musicState.velocity = velocity;
    },
  });

  const words = profile.name.split(" ");

  return (
    <div ref={ref} className="relative">
      {/* The canvas ink lives in themes.ts, next to the page tokens it matches. */}
      <MusicCanvas musicFont={musicFont} />

      {/* Hero */}
      <section
        id="top"
        className="relative z-10 flex h-[100svh] flex-col justify-end px-6 pb-16 md:px-10 md:pb-20"
      >
        <div className="hero-fade">
          <p className="hero-meta eyebrow mb-6">{profile.roleLong}</p>
          <h1 className="display text-[clamp(3.5rem,13vw,13rem)]">
            {words.map((w, i) => (
              <span key={i} className="block overflow-hidden">
                <span className="hero-word block">{w}</span>
              </span>
            ))}
          </h1>
          <p className="hero-meta mt-12 max-w-md text-lg leading-relaxed text-muted md:text-xl">
            {profile.tagline}
          </p>
        </div>
      </section>

      {/* Story stages */}
      {stages.map((s, i) => (
        <section key={s.id} className="stage relative z-10 h-[160vh]">
          <div className="sticky top-0 flex h-[100svh] items-end px-6 pb-28 md:items-center md:px-10 md:pb-0">
            <article className="w-full max-w-md md:max-w-lg">
              <p className="eyebrow reveal mb-5">
                {s.index} / {MOVEMENTS[i]}
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
