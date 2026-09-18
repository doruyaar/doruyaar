"use client";

import { useRef } from "react";
import { profile } from "@/content/mock";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "./useReveal";

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  useReveal(ref);

  useGSAP(
    () => {
      const path = lineRef.current;
      if (!path) return;
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: "power2.inOut",
        scrollTrigger: { trigger: ref.current, start: "top 60%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section
      id="contact"
      ref={ref}
      className="relative mx-auto flex min-h-[90vh] max-w-[1600px] flex-col justify-between px-6 pb-28 pt-32 md:px-10 md:pt-44"
    >
      <div>
        <p className="eyebrow reveal mb-8">Contact</p>
        <h2 className="display reveal text-[clamp(2.8rem,9vw,9.5rem)]">
          Let&apos;s build
          <br />
          <span className="relative inline-block">
            something.
            <svg
              aria-hidden
              viewBox="0 0 600 24"
              preserveAspectRatio="none"
              className="absolute -bottom-2 left-0 h-[0.12em] w-full overflow-visible md:-bottom-3"
            >
              <path
                ref={lineRef}
                d="M2 14 C 120 4, 240 22, 360 12 S 560 6, 598 12"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h2>
        <p className="reveal mt-14 text-lg text-muted md:text-xl">
          Send me a mail to{" "}
          <a
            href={`mailto:${profile.email}`}
            className="text-fg underline decoration-line decoration-1 underline-offset-[6px] transition-colors duration-300 hover:text-accent hover:decoration-accent"
          >
            {profile.email}
          </a>
        </p>
      </div>

      <footer className="mt-28 flex flex-col gap-6 border-t border-line pt-8 font-mono text-xs tracking-widest text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name.toUpperCase()} · {profile.roleLong.toUpperCase()}
        </p>
        <ul className="flex gap-6">
          {profile.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-fg"
              >
                {s.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
