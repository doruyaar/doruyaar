import type { Metadata } from "next";
import Nav from "@/components/shared/Nav";
import Work from "@/components/shared/Work";
import Projects from "@/components/shared/Projects";
import About from "@/components/shared/About";
import Contact from "@/components/shared/Contact";
import PipelineHero from "@/components/pipeline/PipelineHero";
import PipelineStage from "@/components/pipeline/PipelineStage";

export const metadata: Metadata = { title: "Concept 01 · Pipeline" };

/**
 * Concept 01 - “The Pipeline”.
 * Light, paper-like canvas. One line runs through the whole story:
 * chaos → structure → learning → a single clean signal.
 */
export default function PipelinePage() {
  return (
    <main
      className="pipeline-theme relative"
      style={
        {
          "--bg": "#f4f2ec",
          "--fg": "#111114",
          "--muted": "#6e6e73",
          "--line": "rgba(17,17,20,0.12)",
          "--accent": "#1f4bff",
          "--accent-ink": "#ffffff",
          background: "var(--bg)",
          color: "var(--fg)",
        } as React.CSSProperties
      }
    >
      <Nav />
      <PipelineHero />
      <PipelineStage />
      <Work />
      <Projects />
      <About />
      <Contact />
    </main>
  );
}
