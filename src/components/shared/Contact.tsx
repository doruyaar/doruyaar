"use client";

import { useRef, useState } from "react";
import { profile } from "@/content/mock";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "./useReveal";

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useReveal(ref);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      return; // clipboard unavailable; the mailto link still works
    }
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  }

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
        {/* `data-contact-cta`: the music canvas parks its coda wave under this row. */}
        <div
          data-contact-cta
          className="reveal mt-14 flex flex-wrap items-center gap-x-10 gap-y-6"
        >
          <a
            href={`mailto:${profile.email}`}
            className="display group/mail relative inline-block text-[clamp(1.5rem,4.5vw,3.25rem)] transition-colors duration-300 hover:text-accent"
          >
            {profile.email}
            {/* Hairline rule plus an accent line that wipes in from the left. */}
            <span
              aria-hidden
              className="absolute -bottom-[0.22em] left-0 h-px w-full bg-line"
            />
            <span
              aria-hidden
              className="absolute -bottom-[0.22em] left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover/mail:scale-x-100"
            />
          </a>
          <button
            type="button"
            onClick={copyEmail}
            aria-label={`Copy ${profile.email} to clipboard`}
            className={`inline-flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
              copied
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-line text-muted hover:border-accent/50 hover:bg-accent/5 hover:text-accent"
            }`}
          >
            {/* Both icons and both labels share one grid cell, so the state
                swap is a crossfade with no width shift. */}
            <span className="grid h-3.5 w-3.5 shrink-0">
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`col-start-1 row-start-1 h-full w-full transition-opacity duration-200 ${copied ? "opacity-0" : "opacity-100"}`}
              >
                <rect x="5.25" y="5.25" width="8.5" height="8.5" rx="2" />
                <path d="M10.75 5.25V4.25a2 2 0 0 0-2-2H4.25a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2h1" />
              </svg>
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`col-start-1 row-start-1 h-full w-full transition-opacity duration-200 ${copied ? "opacity-100" : "opacity-0"}`}
              >
                <path d="M2.75 8.5 6.25 12l7-7.5" />
              </svg>
            </span>
            <span className="grid">
              <span
                className={`col-start-1 row-start-1 transition-opacity duration-200 ${copied ? "opacity-0" : "opacity-100"}`}
              >
                Copy
              </span>
              <span
                className={`col-start-1 row-start-1 transition-opacity duration-200 ${copied ? "opacity-100" : "opacity-0"}`}
              >
                Copied
              </span>
            </span>
          </button>
          <span aria-live="polite" className="sr-only">
            {copied ? `${profile.email} copied to clipboard` : ""}
          </span>
        </div>
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
