"use client";

import { useRef } from "react";
import { profile, skillGroups, stats } from "@/content/mock";
import { useReveal } from "./useReveal";

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="about"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-10 md:py-44"
    >
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow reveal mb-6">About</p>
          <h2 className="display reveal text-[clamp(2rem,4.2vw,4rem)]">
            {profile.tagline}
          </h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="reveal text-lg leading-relaxed text-muted md:text-xl">
            {profile.intro}
          </p>
          <p className="reveal mt-6 font-mono text-xs tracking-widest text-muted/70">
            {profile.languages.map((l) => `${l.label.toUpperCase()} ${l.level.toUpperCase()}`).join(" · ")}
          </p>
        </div>
      </div>

      <dl className="mt-24 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-line pt-10 md:grid-cols-4 md:gap-x-12">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`reveal ${i > 0 ? "md:border-l md:border-line md:pl-12" : ""}`}
          >
            <dd className="display text-[clamp(2rem,4vw,3.6rem)]">{s.value}</dd>
            <dt className="eyebrow mt-3 leading-relaxed">
              {s.label}
              <span className="mt-2 block text-[0.62rem] text-muted/60">{s.source}</span>
            </dt>
          </div>
        ))}
      </dl>

      <dl className="mt-24 grid gap-y-8 border-t border-line pt-10 md:grid-cols-12 md:gap-y-6">
        {skillGroups.map((g) => (
          <div key={g.label} className="contents">
            <dt className="eyebrow reveal md:col-span-3 md:pt-1">{g.label}</dt>
            <dd className="reveal flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm text-muted md:col-span-9 md:border-b md:border-line md:pb-6">
              {g.items.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
