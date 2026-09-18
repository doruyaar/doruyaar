"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { sideProjects, type SideProject } from "@/content/mock";
import { getLenis } from "@/lib/lenis";
import { useReveal } from "./useReveal";

/**
 * Personal / open-source projects. Each card has a screenshot slot -
 * drop an image into `public/projects/` and set `image` on the entry in
 * `src/content/mock.ts`. Missing images get a generated placeholder.
 *
 * The screenshot opens a lightbox; the title goes to the project itself
 * (its first link - the repo, or the article).
 */
export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const [zoomed, setZoomed] = useState<SideProject | null>(null);

  return (
    <section
      id="projects"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-10 md:py-44"
    >
      <h2 className="display reveal mb-16 text-[clamp(2.4rem,6vw,5.5rem)] md:mb-24">
        Things I build
        <br />
        on my own time
      </h2>

      <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
        {sideProjects.map((p, i) => (
          <li key={p.id} className="reveal group">
            <Shot project={p} index={i} onZoom={() => setZoomed(p)} />
            <div className="mt-6 flex items-baseline justify-between gap-4">
              <h3 className="text-xl leading-tight tracking-tight md:text-2xl">
                <Title project={p} />
              </h3>
              {p.year && <span className="eyebrow shrink-0">{p.year}</span>}
            </div>
            <p className="mt-3 leading-relaxed text-muted">{p.description}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted/70">
                {p.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <ul className="flex gap-4 font-mono text-xs tracking-widest">
                {p.links.map((l) => (
                  <li key={l.href + l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-line pb-0.5 transition-colors hover:border-accent hover:text-accent"
                    >
                      {l.label.toUpperCase()} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      {zoomed && <Lightbox project={zoomed} onClose={() => setZoomed(null)} />}
    </section>
  );
}

/** Links the card heading to the project - its repo, or the article. */
function Title({ project }: { project: SideProject }) {
  const primary = project.links[0];
  if (!primary) return <>{project.title}</>;

  return (
    <a
      href={primary.href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-muted decoration-1 underline-offset-[6px] transition-colors duration-300 hover:text-accent hover:decoration-accent"
    >
      {project.title}
    </a>
  );
}

const FRAME =
  "relative aspect-[16/10] overflow-hidden rounded-md border border-line bg-fg/[0.03]";

function Shot({
  project,
  index,
  onZoom,
}: {
  project: SideProject;
  index: number;
  onZoom: () => void;
}) {
  if (!project.image) {
    return (
      <div className={FRAME}>
        <Placeholder index={index} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onZoom}
      aria-label={`Enlarge the ${project.title} screenshot`}
      className={`${FRAME} block w-full cursor-zoom-in`}
    >
      <Image
        src={project.image}
        alt={`${project.title} screenshot`}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-end justify-end p-4"
      >
        <span className="rounded-full border border-line bg-bg/80 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] backdrop-blur-sm transition-colors duration-300 group-hover:border-accent group-hover:text-accent">
          Enlarge ⤢
        </span>
      </span>
    </button>
  );
}

/**
 * Full-size screenshot over a dimmed page. Closes on Escape, on the backdrop
 * and on the button; Lenis is paused so the page stays put underneath.
 */
function Lightbox({
  project,
  onClose,
}: {
  project: SideProject;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const lenis = getLenis();
    lenis?.stop();
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const frame = requestAnimationFrame(() => setShown(true));

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      lenis?.start();
      opener?.focus();
    };
  }, [onClose]);

  const primary = project.links[0];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} screenshot`}
      onClick={onClose}
      className={`fixed inset-0 z-[100] flex cursor-zoom-out flex-col items-center justify-center gap-5 bg-bg/90 p-4 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none md:p-8 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full border border-line px-3 py-1 font-mono text-xs tracking-widest transition-colors hover:border-accent hover:text-accent md:right-8 md:top-8"
      >
        CLOSE ✕
      </button>

      <figure
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full cursor-default flex-col items-center gap-4"
      >
        <div className="relative h-[70vh] w-[92vw] max-w-[1400px] md:h-[76vh]">
          <Image
            src={project.image!}
            alt={`${project.title} screenshot`}
            fill
            sizes="92vw"
            className="object-contain"
            priority
          />
        </div>
        <figcaption className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-2 text-center">
          <span className="text-lg tracking-tight">{project.title}</span>
          {primary && (
            <a
              href={primary.href}
              target="_blank"
              rel="noreferrer"
              className="border-b border-line pb-0.5 font-mono text-xs tracking-widest transition-colors hover:border-accent hover:text-accent"
            >
              {primary.label.toUpperCase()} ↗
            </a>
          )}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}

/** Generated stand-in until a real screenshot is added. */
function Placeholder({ index }: { index: number }) {
  return (
    <div className="absolute inset-0 flex items-end justify-between p-5">
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-fg/[0.12]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`dots-${index}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${index})`} />
      </svg>
      <span className="eyebrow relative">screenshot slot</span>
      <span className="display relative text-5xl text-fg/20">0{index + 1}</span>
    </div>
  );
}
