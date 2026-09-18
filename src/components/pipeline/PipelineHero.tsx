"use client";

import { useRef } from "react";
import { profile } from "@/content/mock";
import { gsap, useGSAP } from "@/lib/gsap";

export default function PipelineHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.6, ease: "power3.inOut" },
      )
        .fromTo(
          ".hero-word",
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.08 },
          "-=1.0",
        )
        .fromTo(
          ".hero-meta",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
          "-=0.7",
        );

      // Gently fade the hero as the pinned stage takes over.
      gsap.to(".hero-fade", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "40% top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  const words = profile.name.split(" ");

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex h-[100svh] flex-col justify-end overflow-hidden px-6 pb-16 md:px-10 md:pb-20"
    >
      <div className="grid-paper pointer-events-none absolute inset-0" />

      {/* The single line that the whole page is about */}
      <div className="hero-line pointer-events-none absolute left-0 right-0 top-1/2 h-px origin-left bg-fg" />

      <div className="hero-fade relative">
        <p className="hero-meta eyebrow mb-6">{profile.role}</p>
        <h1 className="display text-[clamp(3.5rem,13vw,13rem)]">
          {words.map((w, i) => (
            <span key={i} className="block overflow-hidden">
              <span className="hero-word block">{w}</span>
            </span>
          ))}
        </h1>

        <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="hero-meta max-w-md text-lg leading-relaxed text-muted md:text-xl">
            {profile.tagline}
          </p>
          <p className="hero-meta eyebrow flex items-center gap-3">
            <span className="inline-block h-6 w-px animate-pulse bg-fg" />
            Scroll to follow the data
          </p>
        </div>
      </div>
    </section>
  );
}
