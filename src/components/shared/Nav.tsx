"use client";

import { profile } from "@/content/mock";

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 mix-blend-difference">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 text-white md:px-10">
        <a href="#top" className="font-mono text-xs tracking-widest">
          {profile.name.toUpperCase()}
        </a>
        <ul className="hidden items-center gap-8 text-xs font-mono tracking-widest md:flex">
          <li>
            <a className="opacity-70 transition-opacity hover:opacity-100" href="#work">
              WORK
            </a>
          </li>
          <li>
            <a className="opacity-70 transition-opacity hover:opacity-100" href="#projects">
              PROJECTS
            </a>
          </li>
          <li>
            <a className="opacity-70 transition-opacity hover:opacity-100" href="#about">
              ABOUT
            </a>
          </li>
          <li>
            <a className="opacity-70 transition-opacity hover:opacity-100" href="#contact">
              CONTACT
            </a>
          </li>
        </ul>
        <a
          href={`mailto:${profile.email}`}
          className="font-mono text-xs tracking-widest opacity-70 transition-opacity hover:opacity-100"
        >
          {profile.email}
        </a>
      </nav>
    </header>
  );
}
