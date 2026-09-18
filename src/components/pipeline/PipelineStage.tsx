"use client";

import { useMemo, useRef } from "react";
import { stages } from "@/content/mock";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  EXIT,
  LANE_X0,
  NET,
  NODE,
  VB,
  lanes,
  netEdges,
  strands,
} from "./geometry";

/**
 * The pinned scroll story. The wrapper is 5 viewports tall; the inner stage
 * is sticky. One GSAP timeline (4 "beats") is scrubbed by scroll progress.
 */
export default function PipelineStage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const strandPaths = useMemo(() => strands(), []);
  const lanePaths = useMemo(() => lanes(), []);
  const edges = useMemo(() => netEdges(), []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(wrapRef);
      // GSAP can't tween `var(--x)` colors, so resolve them once.
      const css = getComputedStyle(wrapRef.current!);
      const ACCENT = css.getPropertyValue("--accent").trim();
      const FG = css.getPropertyValue("--fg").trim();

      // Prepare every stroke to be "undrawn".
      const prep = (sel: string) =>
        q<SVGGeometryElement>(sel).forEach((el) => {
          const len = el.getTotalLength();
          // Gap slightly longer than the path so round caps never leave a
          // stray dot at either end while the stroke is "undrawn".
          gsap.set(el, {
            strokeDasharray: `${len} ${len + 4}`,
            strokeDashoffset: len + 2,
          });
        });
      prep(".strand");
      prep(".lane");
      prep(".edge");
      prep(".exit");

      gsap.set(".node, .neuron", { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(".label", { opacity: 0, y: 6 });
      gsap.set(".cap", { opacity: 0, y: 24 });
      gsap.set(".mark", { opacity: 0.25 });
      gsap.set(".pulse", { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
        },
      });

      const caption = (i: number, at: number) => {
        tl.to(`.cap-${i}`, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, at + 0.02)
          .to(`.mark-${i}`, { opacity: 1, duration: 0.1 }, at + 0.02);
        if (i < stages.length - 1) {
          tl.to(`.cap-${i}`, { opacity: 0, y: -24, duration: 0.14, ease: "power2.in" }, at + 0.86)
            .to(`.mark-${i}`, { opacity: 0.25, duration: 0.1 }, at + 0.86);
        }
      };

      // 01 · Ingest — noisy strands draw in
      tl.to(".strand", { strokeDashoffset: 0, duration: 0.85, stagger: 0.012 }, 0.02);
      tl.to(".label-ingest", { opacity: 1, y: 0, duration: 0.1 }, 0.55);
      caption(0, 0);

      // 02 · Transform — node lands, strands quiet down, clean lanes emerge
      tl.to(".node", { scale: 1, duration: 0.25, ease: "back.out(1.6)" }, 1.0);
      tl.to(".strand", { opacity: 0.28, duration: 0.3 }, 1.0);
      tl.to(".lane", { strokeDashoffset: 0, duration: 0.5, stagger: 0.04 }, 1.25);
      tl.to(".label-transform", { opacity: 1, y: 0, duration: 0.1 }, 1.2);
      caption(1, 1);

      // 03 · Model — neurons pop, edges wire up, a pulse fires through
      tl.to(".neuron", { scale: 1, duration: 0.2, stagger: 0.02, ease: "back.out(2)" }, 2.0);
      tl.to(".edge", { strokeDashoffset: 0, duration: 0.45, stagger: 0.008 }, 2.15);
      tl.to(".edge", { stroke: ACCENT, duration: 0.12, stagger: { each: 0.006, from: "start" } }, 2.6)
        .to(".edge", { stroke: FG, duration: 0.14, stagger: { each: 0.006, from: "start" } }, 2.72);
      tl.to(".neuron", { fill: ACCENT, duration: 0.1, stagger: 0.015 }, 2.62)
        .to(".neuron", { fill: FG, duration: 0.14, stagger: 0.015 }, 2.76);
      tl.to(".label-model", { opacity: 1, y: 0, duration: 0.1 }, 2.3);
      caption(2, 2);

      // 04 · Serve — one clean line leaves, carrying a signal
      tl.to(".exit", { strokeDashoffset: 0, duration: 0.5 }, 3.05);
      tl.to(".pulse", { opacity: 1, duration: 0.05 }, 3.1)
        .to(".pulse", { attr: { cx: EXIT.x1 }, duration: 0.5 }, 3.1)
        .to(".pulse", { opacity: 0, duration: 0.05 }, 3.55);
      tl.to(".label-serve", { opacity: 1, y: 0, duration: 0.1 }, 3.3);
      tl.to(".strand", { opacity: 0.12, duration: 0.4 }, 3.1);
      caption(3, 3);

      // Keep the timeline exactly 4 beats long.
      tl.to({}, { duration: 0.01 }, 4);
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Progress marks */}
        <ol className="absolute left-6 top-24 z-10 flex gap-5 font-mono text-xs md:left-10 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-4">
          {stages.map((s, i) => (
            <li key={s.id} className={`mark mark-${i} flex items-center gap-3`}>
              <span className="h-px w-5 bg-fg" />
              {s.index}
            </li>
          ))}
        </ol>

        {/* Captions */}
        <div className="absolute inset-x-6 bottom-24 z-10 md:inset-x-auto md:left-28 md:top-1/2 md:w-[21vw] md:min-w-[280px] md:-translate-y-1/2">
          {stages.map((s, i) => (
            <article
              key={s.id}
              className={`cap cap-${i} absolute bottom-0 left-0 w-full md:bottom-auto md:top-1/2 md:-translate-y-1/2`}
            >
              <p className="eyebrow mb-4">
                {s.index} / {s.id}
              </p>
              <h2 className="display text-[clamp(2rem,3.6vw,3.6rem)]">{s.title}</h2>
              <p className="mt-5 max-w-md leading-relaxed text-muted">{s.body}</p>
              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-muted/80">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* The stage */}
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute left-0 top-0 h-[55svh] w-full md:left-[31%] md:h-full md:w-[69%]"
          aria-hidden
        >
          <g fill="none" stroke="var(--fg)" strokeWidth="1.1" strokeLinecap="round">
            {strandPaths.map((d, i) => (
              <path key={i} d={d} className="strand" strokeWidth={i % 3 === 0 ? 1.4 : 0.8} />
            ))}
          </g>

          <g className="node">
            <rect
              x={NODE.x}
              y={NODE.y}
              width={NODE.w}
              height={NODE.h}
              rx="4"
              fill="var(--bg)"
              stroke="var(--fg)"
              strokeWidth="1.4"
            />
            {/* schematic “rows” inside the node */}
            {[0, 1, 2, 3, 4].map((r) => (
              <line
                key={r}
                x1={NODE.x + 22}
                x2={NODE.x + NODE.w - 22}
                y1={NODE.y + 36 + r * 22}
                y2={NODE.y + 36 + r * 22}
                stroke="var(--fg)"
                strokeOpacity={0.35}
                strokeWidth="1"
              />
            ))}
            <circle cx={LANE_X0} cy={VB.cy} r="3.5" fill="var(--fg)" />
          </g>

          <g fill="none" stroke="var(--fg)" strokeWidth="1.3" strokeLinecap="round">
            {lanePaths.map((d, i) => (
              <path key={i} d={d} className="lane" />
            ))}
          </g>

          <g stroke="var(--fg)" strokeWidth="0.9" strokeLinecap="round">
            {edges.map((e, i) => (
              <line key={i} className="edge" x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
            ))}
          </g>
          <g fill="var(--fg)">
            {NET.cols.map((c, ci) =>
              c.ys.map((y) => (
                <circle key={`${ci}-${y}`} className="neuron" cx={c.x} cy={y} r={NET.r} />
              )),
            )}
          </g>

          <line
            className="exit"
            x1={EXIT.x0}
            y1={EXIT.y}
            x2={EXIT.x1}
            y2={EXIT.y}
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle className="pulse" cx={EXIT.x0} cy={EXIT.y} r="5" fill="var(--accent)" />

          {/* stage labels */}
          <g
            fontFamily="var(--font-mono)"
            fontSize="11"
            letterSpacing="0.14em"
            fill="var(--muted)"
          >
            <text className="label label-ingest" x={120} y={VB.h - 60}>
              INGEST
            </text>
            <text className="label label-transform" x={NODE.x} y={NODE.y - 22}>
              TRANSFORM
            </text>
            <text className="label label-model" x={NET.cols[0].x - 10} y={NODE.y - 22}>
              MODEL
            </text>
            <text className="label label-serve" x={EXIT.x0 + 40} y={EXIT.y - 18}>
              SERVE
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
