/**
 * Point-cloud targets for the particle morph. Every generator returns a
 * Float32Array of length COUNT * 3 in world units (roughly ±5 x, ±3.5 y).
 * Runs on the client only (text sampling needs a canvas).
 */

export const COUNT = 22000;

export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (r: () => number) => {
  // Box–Muller
  const u = Math.max(r(), 1e-9);
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Fill remaining slots by re-sampling existing points with a jitter. */
function fill(pts: number[], count: number, r: () => number, jitter = 0.02) {
  const out = new Float32Array(count * 3);
  const n = pts.length / 3;
  for (let i = 0; i < count; i++) {
    const j = i < n ? i : Math.floor(r() * n);
    out[i * 3] = pts[j * 3] + (r() - 0.5) * jitter;
    out[i * 3 + 1] = pts[j * 3 + 1] + (r() - 0.5) * jitter;
    out[i * 3 + 2] = pts[j * 3 + 2] + (r() - 0.5) * jitter;
  }
  return out;
}

/** Sample the glyphs of `text` into points spanning `width` world units. */
export function textShape(
  text: string,
  count = COUNT,
  { width = 10.5, weight = 600, depth = 0.25 } = {},
): Float32Array {
  const r = rng(11);
  const cw = 1400;
  const ch = 420;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  const family =
    getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

  // Fit font size to the canvas width.
  let size = 300;
  ctx.font = `${weight} ${size}px ${family}`;
  const measured = ctx.measureText(text).width;
  size = Math.min(320, (size * (cw * 0.92)) / measured);
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, cw / 2, ch / 2 + size * 0.04);

  const data = ctx.getImageData(0, 0, cw, ch).data;
  const cand: number[] = [];
  const step = 2;
  for (let y = 0; y < ch; y += step) {
    for (let x = 0; x < cw; x += step) {
      if (data[(y * cw + x) * 4 + 3] > 140) cand.push(x, y);
    }
  }
  const scale = width / cw;
  const pts: number[] = [];
  const n = cand.length / 2;
  for (let i = 0; i < count; i++) {
    const j = Math.floor(r() * n);
    const x = (cand[j * 2] - cw / 2 + (r() - 0.5) * step) * scale;
    const y = -(cand[j * 2 + 1] - ch / 2 + (r() - 0.5) * step) * scale;
    pts.push(x, y, (r() - 0.5) * depth);
  }
  return new Float32Array(pts);
}

/** Brownian chaos: a soft, wide, noisy cloud. */
export function cloudShape(count = COUNT): Float32Array {
  const r = rng(23);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = gauss(r) * 2.6;
    out[i * 3 + 1] = gauss(r) * 1.6;
    out[i * 3 + 2] = gauss(r) * 1.4;
  }
  return out;
}

/** Sparse ambient: very wide, very calm — the backdrop for text sections. */
export function ambientShape(count = COUNT): Float32Array {
  const r = rng(29);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = (r() - 0.5) * 24;
    out[i * 3 + 1] = (r() - 0.5) * 16;
    out[i * 3 + 2] = -3 - r() * 8;
  }
  return out;
}

/** A grid of database cylinders — structure, storage, order. */
export function warehouseShape(count = COUNT): Float32Array {
  const r = rng(37);
  const pts: number[] = [];
  const cols = 4;
  const rows = 2;
  const R = 0.62;
  const H = 1.25;
  const gapX = 2.15;
  const gapY = 2.35;
  const per = Math.floor(count / (cols * rows));
  for (let c = 0; c < cols; c++) {
    for (let rw = 0; rw < rows; rw++) {
      const cx = (c - (cols - 1) / 2) * gapX;
      const cy = (rw - (rows - 1) / 2) * gapY;
      for (let i = 0; i < per; i++) {
        const k = r();
        const a = r() * Math.PI * 2;
        if (k < 0.55) {
          // side wall
          pts.push(cx + Math.cos(a) * R, cy + (r() - 0.5) * H, Math.sin(a) * R);
        } else if (k < 0.85) {
          // three rings (the classic DB icon)
          const ring = Math.floor(r() * 3);
          const y = cy - H / 2 + (ring / 2) * H;
          pts.push(cx + Math.cos(a) * R, y + (r() - 0.5) * 0.02, Math.sin(a) * R);
        } else {
          // top cap
          const rr = Math.sqrt(r()) * R;
          pts.push(cx + Math.cos(a) * rr, cy + H / 2, Math.sin(a) * rr);
        }
      }
    }
  }
  // Tilt the whole grid slightly so the tops read as ellipses.
  const tilt = 0.55;
  for (let i = 0; i < pts.length; i += 3) {
    const y = pts[i + 1];
    const z = pts[i + 2];
    pts[i + 1] = y * Math.cos(tilt) - z * Math.sin(tilt);
    pts[i + 2] = y * Math.sin(tilt) + z * Math.cos(tilt);
  }
  return fill(pts, count, r, 0.01);
}

/** Fully-connected network: dense node spheres + sparse edges. */
export function networkShape(count = COUNT): Float32Array {
  const r = rng(41);
  const layers = [4, 7, 7, 5, 2];
  const xs = layers.map((_, i) => (i - (layers.length - 1) / 2) * 2.3);
  const nodes: [number, number, number][][] = layers.map((n, li) =>
    Array.from({ length: n }, (_, k) => [
      xs[li],
      (k - (n - 1) / 2) * 0.85,
      (r() - 0.5) * 0.6,
    ]),
  );
  const pts: number[] = [];
  const nodeBudget = Math.floor(count * 0.45);
  const totalNodes = layers.reduce((a, b) => a + b, 0);
  const perNode = Math.floor(nodeBudget / totalNodes);
  for (const layer of nodes) {
    for (const [x, y, z] of layer) {
      for (let i = 0; i < perNode; i++) {
        const rad = 0.2 * Math.cbrt(r());
        const th = r() * Math.PI * 2;
        const ph = Math.acos(2 * r() - 1);
        pts.push(
          x + rad * Math.sin(ph) * Math.cos(th),
          y + rad * Math.sin(ph) * Math.sin(th),
          z + rad * Math.cos(ph),
        );
      }
    }
  }
  // edges
  const edges: [number[], number[]][] = [];
  for (let l = 0; l < nodes.length - 1; l++)
    for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push([a, b]);
  const edgeBudget = count - pts.length / 3;
  const perEdge = Math.max(1, Math.floor(edgeBudget / edges.length));
  for (const [a, b] of edges) {
    for (let i = 0; i < perEdge; i++) {
      const t = r();
      pts.push(
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      );
    }
  }
  return fill(pts, count, r, 0.008);
}

/** Tilt (about x) baked into the 3D graph so the surface is seen from above. */
export const GRAPH_TILT = 0.5;

/**
 * The finished product: a 3D graph. A saddle surface (hyperbolic paraboloid,
 * y = a·(x² − z²)) drawn as a wireframe of iso-lines, the data points it was
 * fitted to scattered around it, three axes with tick marks and a floor grid.
 * Posed three-quarter, from slightly above.
 */
export function graphShape(count = COUNT): Float32Array {
  const r = rng(53);
  const pts: number[] = [];
  const R = 2.4; // half extent of the x/z domain
  const A = 0.3; // saddle steepness
  const floorY = -2.0;
  const f = (x: number, z: number) => A * (x * x - z * z);

  // Surface iso-lines (both directions) — the wireframe of the plot.
  const lines = 19;
  const perLine = Math.floor((count * 0.5) / (lines * 2));
  for (let l = 0; l < lines; l++) {
    const c = -R + (2 * R * l) / (lines - 1);
    for (let i = 0; i < perLine; i++) {
      const t = -R + 2 * R * r();
      pts.push(t, f(t, c), c); // constant z
      pts.push(c, f(c, t), t); // constant x
    }
  }
  // Fine mesh in between (sparser) so the surface reads as a sheet.
  const sheetN = Math.floor(count * 0.1);
  for (let i = 0; i < sheetN; i++) {
    const x = -R + 2 * R * r();
    const z = -R + 2 * R * r();
    pts.push(x, f(x, z), z);
  }
  // Observations the surface was fitted to: scattered just off it.
  const dataN = Math.floor(count * 0.1);
  for (let i = 0; i < dataN; i++) {
    const x = -R + 2 * R * r();
    const z = -R + 2 * R * r();
    pts.push(x, f(x, z) + gauss(r) * 0.22, z);
  }
  // Floor grid.
  const gridLines = 9;
  const gridN = Math.floor(count * 0.12);
  for (let i = 0; i < gridN; i++) {
    const l = -R + (2 * R * Math.floor(r() * gridLines)) / (gridLines - 1);
    const t = -R + 2 * R * r();
    if (r() < 0.5) pts.push(t, floorY, l);
    else pts.push(l, floorY, t);
  }
  // Axes from the back-left corner, with ticks.
  const o = { x: -R - 0.25, y: floorY, z: R + 0.25 };
  const axisLen = 2 * R + 0.5;
  const yAxisLen = A * R * R - floorY + 0.4; // just past the saddle's peak
  const axisN = count - pts.length / 3;
  for (let i = 0; i < axisN; i++) {
    const k = r();
    const len = k < 0.34 || k >= 0.67 ? axisLen : yAxisLen;
    const t = r() * len;
    const tick = r() < 0.18 ? (r() - 0.5) * 0.24 : 0;
    const at = Math.round(t / (len / 8)) * (len / 8);
    const tt = tick ? at : t;
    if (k < 0.34) pts.push(o.x + tt, o.y + tick, o.z); // x axis
    else if (k < 0.67) pts.push(o.x + tick, o.y + tt, o.z); // y axis
    else pts.push(o.x, o.y + tick, o.z - tt); // z axis (into the screen)
  }

  // Pose: turn for a three-quarter view, tilt so we look down onto it.
  const turnY = -0.62;
  for (let i = 0; i < pts.length; i += 3) {
    let x = pts[i];
    const y = pts[i + 1];
    let z = pts[i + 2];
    const x1 = x * Math.cos(turnY) + z * Math.sin(turnY);
    const z1 = -x * Math.sin(turnY) + z * Math.cos(turnY);
    x = x1;
    z = z1;
    const y2 = y * Math.cos(GRAPH_TILT) - z * Math.sin(GRAPH_TILT);
    const z2 = y * Math.sin(GRAPH_TILT) + z * Math.cos(GRAPH_TILT);
    pts[i] = x;
    pts[i + 1] = y2 + 0.55;
    pts[i + 2] = z2;
  }
  return fill(pts, count, r, 0.01);
}
