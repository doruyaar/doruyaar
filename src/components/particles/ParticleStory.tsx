"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { profile, stages } from "@/content/mock";
import { gsap, useGSAP } from "@/lib/gsap";
import { useStageProgress } from "@/components/shared/useStageProgress";
import { particleState } from "./state";

const ParticleScene = dynamic(() => import("./ParticleScene"), { ssr: false });

/** A free area of the screen, as fractions of the viewport height / width. */
type Zone = { centerY: number; boxW: number; boxH: number };

/**
 * Where the particles may live, measured from the DOM. Portrait: `story` is
 * the band between the nav and the top of the (bottom-aligned) stage copy;
 * `contact` is the gap between the CTA and the footer once the page is
 * scrolled to its end. Landscape: `textRight` is the right edge of the copy
 * column. Defaults cover the first frames before the measurement runs.
 */
type Zones = { story: Zone; contact: Zone; textRight: number };
const DEFAULT_ZONES: Zones = {
  story: { centerY: 0.3, boxW: 0.9, boxH: 0.35 },
  contact: { centerY: 0.68, boxW: 0.8, boxH: 0.12 },
  textRight: 0.38,
};

function measureZones(root: HTMLElement): Zones {
  const frames = root.querySelectorAll<HTMLElement>("[data-stage-frame]");
  if (!frames.length) return DEFAULT_ZONES;
  const H = frames[0].clientHeight; // 100svh in px
  const W = frames[0].clientWidth;
  const navH = document.querySelector("header")?.offsetHeight ?? 64;

  // Story, portrait: the copy is bottom-aligned inside each pinned frame, so
  // the free band runs from under the nav to the top of the tallest copy.
  // Landscape: remember how far right the copy column reaches.
  let copyTop = H;
  let textRight = 0;
  frames.forEach((f) => {
    const copy = f.firstElementChild as HTMLElement | null;
    if (!copy) return;
    copyTop = Math.min(copyTop, copy.offsetTop);
    textRight = Math.max(textRight, (copy.offsetLeft + copy.offsetWidth) / W);
  });
  const top = (navH + 12) / H;
  const bottom = (copyTop - 20) / H;
  const story: Zone = {
    centerY: (top + bottom) / 2,
    boxW: 0.9,
    boxH: Math.max(0.12, bottom - top),
  };

  // Contact: at the end of the page the section's bottom edge sits on the
  // viewport's bottom edge; place the initials between the CTA and footer.
  let contact = DEFAULT_ZONES.contact;
  const section = document.getElementById("contact");
  const cta = section?.querySelector<HTMLElement>("[data-contact-cta]");
  const footer = section?.querySelector<HTMLElement>("footer");
  if (section && cta && footer) {
    const sh = section.offsetHeight;
    const gapTop = Math.max(navH, H - (sh - (cta.offsetTop + cta.offsetHeight)));
    const gapBottom = H - (sh - footer.offsetTop);
    contact = {
      centerY: (gapTop + gapBottom) / 2 / H,
      boxW: 0.8,
      boxH: Math.max(0.06, (gapBottom - gapTop - 24) / H),
    };
  }
  return { story, contact, textRight: textRight || DEFAULT_ZONES.textRight };
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Turn the scroll progresses into particle targets.
 * Shape = sum of all progresses: 0 name → 1 chaos → 2 warehouse →
 * 3 network → 4 3D graph → 5 ambient (work) → 6 initials (contact).
 */
function applyProgress(p: number[], zones: Zones) {
  const n = stages.length;
  const pWork = p[n] ?? 0;
  const pContact = p[n + 1] ?? 0;
  particleState.shape = p.reduce((a, b) => a + b, 0);
  // Landscape: beside the text during the story, centred for the backdrop,
  // to the right of the CTA at the end.
  const beside = (p[0] ?? 0) * (1 - pWork);
  particleState.offsetX = 2.4 * beside + 5.4 * pContact;
  particleState.opacity = 1 - 0.68 * pWork + 0.45 * pContact;
  particleState.landscape.beside = beside;
  particleState.landscape.textRight = zones.textRight;

  // Portrait: above the copy during the story, centred backdrop for the
  // work sections, then into the CTA/footer gap for the initials.
  const { story, contact } = zones;
  const pp = particleState.portrait;
  pp.centerY = mix(mix(story.centerY, 0.5, pWork), contact.centerY, pContact);
  pp.cover = pWork * (1 - pContact);
  pp.boxW = mix(story.boxW, contact.boxW, pContact);
  pp.boxH = mix(story.boxH, contact.boxH, pContact);
  pp.shapeW = mix(13, 7.5, pContact); // name width → initials width
  pp.shapeH = mix(7, 1.4, pContact); // tallest story shape → initials height
}

/**
 * Concept 01 - the fixed particle canvas plus the scroll sections that drive
 * which shape the particles are forming.
 */
export default function ParticleStory() {
  const ref = useRef<HTMLDivElement>(null);
  const zones = useRef<Zones>(DEFAULT_ZONES);
  const progress = useRef<number[]>([]);

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

  useStageProgress(ref, {
    extras: [
      { id: "work", start: "top bottom", end: "top 20%" },
      { id: "contact", start: "top 85%", end: "top 5%" },
    ],
    onChange: (p, velocity) => {
      progress.current = p;
      particleState.velocity = velocity;
      applyProgress(p, zones.current);
    },
  });

  // Re-measure the free zones whenever layout can change (viewport size,
  // web fonts arriving) and re-apply the current scroll state right away.
  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      zones.current = measureZones(ref.current);
      applyProgress(progress.current, zones.current);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={ref} className="relative">
      <ParticleScene color="#e9e9e6" accent="#7df3c8" />

      {/* Hero: the particles ARE the name; HTML keeps it accessible. */}
      <section
        id="top"
        className="relative z-10 flex h-[100svh] flex-col justify-end px-6 pb-16 md:px-10 md:pb-20 short:pb-8"
      >
        <h1 className="sr-only">{profile.name}</h1>
        <div>
          <p className="hero-meta eyebrow mb-4">{profile.roleLong}</p>
          <p className="hero-meta max-w-md text-lg leading-relaxed text-muted md:text-xl">
            {profile.tagline}
          </p>
        </div>
      </section>

      {/* Story stages. Landscape: copy centred on the left, shapes beside it.
          Portrait: copy at the bottom, shapes in the free band above.
          `short:` compacts the copy on landscape phones. */}
      {stages.map((s) => (
        <section key={s.id} className="stage relative z-10 h-[160vh]">
          <div
            data-stage-frame
            className="sticky top-0 flex h-[100svh] items-center px-6 md:px-10 portrait:items-end portrait:pb-12"
          >
            <article className="w-full max-w-md md:max-w-lg short:max-w-sm">
              <p className="eyebrow reveal mb-4 md:mb-5 short:mb-2">
                {s.index} / {s.id}
              </p>
              <h2 className="display reveal text-[clamp(2.2rem,5vw,4.8rem)] short:text-[1.75rem]">
                {s.title}
              </h2>
              <p className="reveal mt-5 text-base leading-relaxed text-muted md:mt-6 md:text-lg short:mt-3 short:text-sm">
                {s.body}
              </p>
              <ul className="reveal mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-muted/80 md:mt-7 short:mt-3">
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
