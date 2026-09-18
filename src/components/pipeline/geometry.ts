/**
 * Deterministic geometry for the pipeline stage SVG (viewBox 1200 x 700).
 * Seeded so server and client render identical markup.
 */

export const VB = { w: 1000, h: 700, cy: 350 };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const NODE = { x: 400, y: 270, w: 150, h: 160 };
export const MERGE = { x: NODE.x, y: VB.cy };

/** Noisy input strands: chaos on the left converging into the node. */
export function strands(count = 16, seed = 7): string[] {
  const rnd = mulberry32(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const y0 = 50 + rnd() * (VB.h - 100);
    const segs = 3;
    let d = `M -40 ${y0.toFixed(1)}`;
    let px = -40;
    let py = y0;
    for (let s = 0; s < segs; s++) {
      const t = (s + 1) / segs;
      const nx = -40 + (MERGE.x + 40) * t;
      // Wander less as we approach the merge point.
      const wobble = (1 - t) * 130;
      const ny = s === segs - 1 ? MERGE.y : py + (rnd() - 0.5) * wobble * 2;
      const c1x = px + (nx - px) * 0.4;
      const c1y = py + (rnd() - 0.5) * wobble;
      const c2x = px + (nx - px) * 0.6;
      const c2y = ny + (rnd() - 0.5) * wobble;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${nx.toFixed(1)} ${ny.toFixed(1)}`;
      px = nx;
      py = ny;
    }
    out.push(d);
  }
  return out;
}

/** Clean lanes leaving the node and fanning out into the model's input layer. */
export const LANE_Y = [290, 330, 370, 410];
export const LANE_X0 = NODE.x + NODE.w;
export const LANE_X1 = 740;

export function lanes(): string[] {
  const startYs = [320, 340, 360, 380];
  return LANE_Y.map((y, i) => {
    const y0 = startYs[i];
    const mx = (LANE_X0 + LANE_X1) / 2;
    return `M ${LANE_X0} ${y0} C ${mx} ${y0}, ${mx} ${y}, ${LANE_X1} ${y}`;
  });
}

/** Minimal neural glyph: 4 → 3 → 1 */
export const NET = {
  cols: [
    { x: 740, ys: LANE_Y },
    { x: 820, ys: [310, 350, 390] },
    { x: 900, ys: [350] },
  ],
  r: 7,
};

export function netEdges(): { x1: number; y1: number; x2: number; y2: number }[] {
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let c = 0; c < NET.cols.length - 1; c++) {
    const a = NET.cols[c];
    const b = NET.cols[c + 1];
    for (const y1 of a.ys) for (const y2 of b.ys) edges.push({ x1: a.x, y1, x2: b.x, y2 });
  }
  return edges;
}

export const EXIT = { x0: NET.cols[2].x + NET.r, x1: VB.w + 40, y: VB.cy };
