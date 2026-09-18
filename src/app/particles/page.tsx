import type { Metadata } from "next";
import Nav from "@/components/shared/Nav";
import Work from "@/components/shared/Work";
import Projects from "@/components/shared/Projects";
import About from "@/components/shared/About";
import Contact from "@/components/shared/Contact";
import ParticleStory from "@/components/particles/ParticleStory";

export const metadata: Metadata = { title: "Concept 02 · Particles" };

/**
 * Concept 02 - “Particles → Structure”.
 * Dark, monochrome. One particle system forms the name, dissolves into
 * noise, then snaps into storage, a network, a 3D graph - and finally you.
 */
export default function ParticlesPage() {
  return (
    <main
      className="relative"
      style={
        {
          "--bg": "#0a0a0c",
          "--fg": "#f2f2ef",
          "--muted": "#8b8b90",
          "--line": "rgba(255,255,255,0.12)",
          "--accent": "#7df3c8",
          "--accent-ink": "#06251b",
          background: "var(--bg)",
          color: "var(--fg)",
        } as React.CSSProperties
      }
    >
      <Nav />
      <ParticleStory />
      <div className="relative z-10">
        <Work />
        <Projects />
        <About />
        <Contact />
      </div>
    </main>
  );
}
