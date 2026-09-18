"use client";

import { useRef } from "react";
import Image from "next/image";
import { sideProjects, type SideProject } from "@/content/mock";
import { useReveal } from "./useReveal";

/**
 * Personal / open-source projects. Each card has a screenshot slot —
 * drop an image into `public/projects/` and set `image` on the entry in
 * `src/content/mock.ts`. Missing images get a generated placeholder.
 */
export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="projects"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-10 md:py-44"
    >
      <div className="mb-16 grid gap-6 md:mb-24 md:grid-cols-12 md:items-end">
        <h2 className="display reveal text-[clamp(2.4rem,6vw,5.5rem)] md:col-span-7">
          Things I build
          <br />
          on my own time
        </h2>
        <p className="reveal text-muted md:col-span-4 md:col-start-9 md:pb-3">
          Side projects, open source and writing. Screenshots, repos and the
          occasional article.
        </p>
      </div>

      <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {sideProjects.map((p, i) => (
          <li key={p.id} className="reveal group">
            <Shot project={p} index={i} />
            <div className="mt-6 flex items-baseline justify-between gap-4">
              <h3 className="text-xl leading-tight tracking-tight md:text-2xl">
                {p.title}
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
    </section>
  );
}

function Shot({ project, index }: { project: SideProject; index: number }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-line bg-fg/[0.03]">
      {project.image ? (
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <Placeholder index={index} />
      )}
    </div>
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
