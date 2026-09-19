"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Temporary A/B switch between the two design concepts.
 * Delete this component (and the losing route) once a concept is chosen.
 */
const concepts = [
  { href: "/particles", label: "Particles", hint: "01" },
  { href: "/music", label: "Music", hint: "02" },
] as const;

export default function ConceptSwitch() {
  const pathname = usePathname();
  // `/` renders concept 01, so it should light up the same tab as `/particles`.
  const current = pathname === "/" ? "/particles" : pathname;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div
        role="tablist"
        aria-label="Design concept"
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-bg/70 p-1 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <span className="eyebrow hidden pl-3 pr-2 sm:inline">Concept</span>
        {concepts.map((c) => {
          const active = current?.startsWith(c.href);
          return (
            <Link
              key={c.href}
              href={c.href}
              role="tab"
              aria-selected={active}
              className={[
                "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-300",
                active
                  ? "bg-fg text-bg"
                  : "text-muted hover:text-fg",
              ].join(" ")}
            >
              <span className="font-mono text-[10px] opacity-60">{c.hint}</span>
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
