/**
 * Pure drawing code for Concept 02 - “Noise → Music”.
 *
 * One waveform runs across the screen. Scroll morphs it from a calm hero
 * line, into raw noise, into a quantised step sequence (rhythm), into
 * stacked harmonics (harmony), into a clean melody (performance).
 *
 * Underneath, a staff fades in and scattered notes snap onto it, group
 * into chords, and finally settle into an engraved piano score: brace,
 * treble + bass clef, time signature, tempo, dynamics, tilted noteheads,
 * slanted beams, ledger lines, accidentals, a slur and a hairpin - with a
 * playhead sweeping across and an “orchestra” spectrum breathing below.
 *
 * The waveform is always drawn in `pal.wave` (a quiet background tint) so
 * it reads as the layer *under* the copy, never as ink on top of it.
 */

export type Palette = {
  /** Ink: staff, notes, engraving text. */
  fg: string;
  /** Highlight: playhead, active notes, coda wave. */
  accent: string;
  muted: string;
  /** The ever-present waveform - a background layer, quieter than ink. */
  wave: string;
  /** CSS font-family stack that contains music glyphs (clefs, rests, accidentals). */
  musicFont: string;
};

export type SceneState = {
  shape: number; // 0..6, smoothed
  opacity: number; // 0..1
  velocity: number; // 0..1
};

const TAU = Math.PI * 2;
const BARS = 8;

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const vnoise = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
};
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Parse `#rgb` / `#rrggbb` / `rgb(r,g,b)` into [r, g, b]; null otherwise. */
const parseColor = (c: string): [number, number, number] | null => {
  const s = c.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.replace(/./g, (ch) => ch + ch);
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  // `mixColor` emits `rgb(...)`, so its own output can be blended again.
  const rgb = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(s);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
  return null;
};
const rgbCache = new Map<string, [number, number, number] | null>();
/** Linear blend between two CSS colours; `t` = 0 → `a`, 1 → `b`. */
export function mixColor(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  let ca = rgbCache.get(a);
  if (ca === undefined) rgbCache.set(a, (ca = parseColor(a)));
  let cb = rgbCache.get(b);
  if (cb === undefined) rgbCache.set(b, (cb = parseColor(b)));
  if (!ca || !cb) return t < 0.5 ? a : b;
  const r = Math.round(lerp(ca[0], cb[0], t));
  const g = Math.round(lerp(ca[1], cb[1], t));
  const bl = Math.round(lerp(ca[2], cb[2], t));
  return `rgb(${r},${g},${bl})`;
}
/** Triangle weight: 1 at `k`, 0 one shape away. */
const weight = (shape: number, k: number) => Math.max(0, 1 - Math.abs(shape - k));

// ---------------------------------------------------------------------------
// Waveform per stage (u in 0..1 along x, returns amplitude in units of H)

const waves: ((u: number, t: number) => number)[] = [
  // 0 hero - calm, breathing, tucked above the headline
  (u, t) => 0.028 * Math.sin(TAU * (u * 2 - t * 0.12)) + 0.008 * Math.sin(TAU * (u * 7 + t * 0.3)),
  // 1 noise - raw, jittery
  (u, t) =>
    0.2 *
    ((vnoise(u * 38 + t * 2.4) * 2 - 1) * 0.55 +
      Math.sin(u * 95 + t * 8.5) * 0.22 +
      (vnoise(u * 150 - t * 3.6) * 2 - 1) * 0.35),
  // 2 rhythm - quantised step sequencer
  (u, t) => {
    const k = Math.floor(u * 16);
    const beat = Math.floor(t * 2);
    return 0.15 * (hash(k * 7.31 + beat * 13.7) * 2 - 1);
  },
  // 3 harmony - stacked harmonics
  (u, t) =>
    0.15 *
    (Math.sin(TAU * (u * 3 + t * 0.2)) * 0.55 +
      Math.sin(TAU * (u * 6 + t * 0.32)) * 0.3 +
      Math.sin(TAU * (u * 12 - t * 0.26)) * 0.15),
  // 4 performance - the sound under the score: small, clean, on the beat
  (u, t) => 0.035 * Math.sin(TAU * (u * 5 - t * 0.5)) * (0.7 + 0.3 * Math.max(0, Math.sin(t * 4))),
  // 5 ambient - a hair line
  (u, t) => 0.018 * Math.sin(TAU * (u * 2 - t * 0.12)),
  // 6 coda - one slow accent wave
  (u, t) => 0.055 * Math.sin(TAU * (u * 1.5 - t * 0.2)),
];

/** Vertical centre of the wave per stage, in units of H. */
const WAVE_CY = [0.17, 0.5, 0.76, 0.76, 0.86, 0.5, 0.72];
/** How strongly the wave is faded out on the left (behind the copy). */
const LEFT_FADE = [0, 1, 1, 1, 1, 0, 0];

// ---------------------------------------------------------------------------
// The score (stage 4). Steps are half-spaces from the middle line, up = +.
// Staff 0 is treble (middle line B4), staff 1 is bass (middle line D3).

type Dur = "w" | "h" | "q" | "e";
type Acc = "#" | "b" | "n";
type SheetNote = {
  bar: number;
  beat: number;
  step: number;
  dur: Dur;
  staff: 0 | 1;
  beam?: "start" | "end";
  acc?: Acc;
};
type SheetRest = { bar: number; beat: number; dur: "q" | "w"; staff: 0 | 1 };

const SHEET: SheetNote[] = [
  // treble
  { staff: 0, bar: 0, beat: 0, step: 2, dur: "q" },
  { staff: 0, bar: 0, beat: 1, step: 4, dur: "q" },
  { staff: 0, bar: 0, beat: 2, step: 5, dur: "e", beam: "start" },
  { staff: 0, bar: 0, beat: 2.5, step: 6, dur: "e", beam: "end" },
  { staff: 0, bar: 0, beat: 3, step: 4, dur: "q" },
  { staff: 0, bar: 1, beat: 0, step: 3, dur: "h" },
  { staff: 0, bar: 1, beat: 2, step: 1, dur: "q", acc: "#" },
  { staff: 0, bar: 1, beat: 3, step: 2, dur: "q" },
  { staff: 0, bar: 2, beat: 0, step: 4, dur: "e", beam: "start" },
  { staff: 0, bar: 2, beat: 0.5, step: 5, dur: "e", beam: "end" },
  { staff: 0, bar: 2, beat: 1, step: 6, dur: "e", beam: "start" },
  { staff: 0, bar: 2, beat: 1.5, step: 5, dur: "e", beam: "end" },
  { staff: 0, bar: 2, beat: 2, step: 4, dur: "q" },
  { staff: 0, bar: 2, beat: 3, step: 2, dur: "q" },
  { staff: 0, bar: 3, beat: 0.6, step: 0, dur: "w" },
  // bass
  { staff: 1, bar: 0, beat: 0, step: -2, dur: "q" },
  { staff: 1, bar: 0, beat: 1, step: 0, dur: "q" },
  { staff: 1, bar: 0, beat: 2, step: 1, dur: "q" },
  { staff: 1, bar: 1, beat: 0, step: 2, dur: "e", beam: "start" },
  { staff: 1, bar: 1, beat: 0.5, step: 3, dur: "e", beam: "end" },
  { staff: 1, bar: 1, beat: 1, step: 1, dur: "q" },
  { staff: 1, bar: 1, beat: 2, step: -1, dur: "h" },
  { staff: 1, bar: 2, beat: 0, step: 0, dur: "h" },
  { staff: 1, bar: 2, beat: 2, step: 2, dur: "h", acc: "n" },
];
const RESTS: SheetRest[] = [
  { staff: 1, bar: 0, beat: 3, dur: "q" },
  { staff: 1, bar: 3, beat: 1.5, dur: "w" },
];
/** Slur over the treble phrase in bar 1 (indices into SHEET). */
const SLUR: [number, number] = [5, 7];
/** Crescendo hairpin under the treble staff, in (bar, beat) → (bar, beat). */
const HAIRPIN = { from: [2, 0], to: [3, 0.6] } as const;

const NOTE_COUNT = SHEET.length; // 24
const SHEET_BARS = 4;
/**
 * Engraved stem direction per note, fixed from its *final* position so it
 * never flips while the note is still flying in. Beamed pairs share one.
 */
const FINAL_UP: boolean[] = SHEET.map((n) => n.step < 0);
for (let n = 0; n < NOTE_COUNT; n++) {
  if (SHEET[n].beam !== "start") continue;
  const up = (SHEET[n].step + SHEET[n + 1].step) / 2 < 0;
  FINAL_UP[n] = FINAL_UP[n + 1] = up;
}
/** Second staff offset, in steps (half-spaces). */
const STAFF2_STEPS = -16;

/** Position of a beat in “music space” (0 = first barline, 1 = final barline). */
const beatU = (bar: number, beat: number) => (bar + (beat + 0.45) / 4) / SHEET_BARS;

// Positions per stage: x in 0..1, y in steps. For the score sets, x lives in
// music space (after clef + time signature); otherwise across the whole staff.
type NotePos = { x: number; y: number };
const rand = Array.from({ length: NOTE_COUNT }, (_, i) => hash(i * 3.17 + 0.5));

function notePositions(stage: number): NotePos[] {
  const out: NotePos[] = [];
  for (let i = 0; i < NOTE_COUNT; i++) {
    const r1 = hash(i * 1.71 + 9.2);
    const r2 = hash(i * 2.93 + 4.4);
    switch (stage) {
      case 2: {
        // quantised: evenly spaced, snapped to staff steps
        const step = Math.round((hash(i * 5.3 + 1.1) * 2 - 1) * 4);
        out.push({ x: (i + 0.5) / NOTE_COUNT, y: step });
        break;
      }
      case 3: {
        // chords: groups of three stacked in thirds on 8 beats
        const chord = Math.floor(i / 3);
        const voice = i % 3;
        const root = Math.round((hash(chord * 2.2 + 7.7) * 2 - 1) * 2) - 2;
        out.push({ x: (chord + 0.5) / BARS, y: root + voice * 2 });
        break;
      }
      case 4: {
        const n = SHEET[i];
        out.push({ x: beatU(n.bar, n.beat), y: n.step + (n.staff === 1 ? STAFF2_STEPS : 0) });
        break;
      }
      default:
        // scattered noise
        out.push({ x: r1, y: (r2 * 2 - 1) * 9 });
    }
  }
  return out;
}

const NOTE_STAGE = [1, 1, 2, 3, 4, 4, 4];
const NOTE_SETS = NOTE_STAGE.map(notePositions);
const MUSIC_SPACE = NOTE_STAGE.map((s) => s === 4);
const NOTE_ALPHA = [0, 0.95, 0.95, 0.95, 0.95, 0, 0];
const STAFF_ALPHA = [0, 0.12, 1, 1, 1, 0, 0];

// ---------------------------------------------------------------------------
// Engraving helpers. All sizes are in staff spaces (`sp`).

const GLYPH = {
  gClef: "\u{1D11E}",
  fClef: "\u{1D122}",
  quarterRest: "\u{1D13D}",
  sharp: "\u266F",
  flat: "\u266D",
  natural: "\u266E",
};
const ACC_GLYPH: Record<Acc, string> = { "#": GLYPH.sharp, b: GLYPH.flat, n: GLYPH.natural };

type Fit = { size: number; asc: number; desc: number; w: number };
let fitCache = new Map<string, Fit>();
/** Call once the music font has finished loading so glyphs are re-measured. */
export function invalidateGlyphCache() {
  fitCache = new Map();
}

/** Font size (and metrics) at which `ch` is exactly `targetH` px tall. */
function fitGlyph(ctx: CanvasRenderingContext2D, ch: string, family: string, targetH: number): Fit {
  const key = `${ch}|${family}|${Math.round(targetH * 4)}`;
  const hit = fitCache.get(key);
  if (hit) return hit;
  const probe = 100;
  ctx.font = `${probe}px ${family}`;
  const m = ctx.measureText(ch);
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || probe;
  const k = targetH / h;
  const fit = {
    size: probe * k,
    asc: m.actualBoundingBoxAscent * k,
    desc: m.actualBoundingBoxDescent * k,
    w: m.width * k,
  };
  fitCache.set(key, fit);
  return fit;
}

/** Draw `ch` so its bounding box is `targetH` tall with its bottom on `yBottom`. */
function glyph(
  ctx: CanvasRenderingContext2D,
  ch: string,
  family: string,
  x: number,
  yBottom: number,
  targetH: number,
  align: CanvasTextAlign = "left",
) {
  const f = fitGlyph(ctx, ch, family, targetH);
  ctx.font = `${f.size}px ${family}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = align;
  ctx.fillText(ch, x, yBottom - f.desc);
  return f;
}

/** Engraved notehead: tilted oval, hollow for half/whole, wide for whole. */
function noteHead(ctx: CanvasRenderingContext2D, x: number, y: number, sp: number, dur: Dur) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  if (dur === "w") {
    ctx.ellipse(0, 0, sp * 0.86, sp * 0.54, 0, 0, TAU);
    ctx.ellipse(0, 0, sp * 0.26, sp * 0.42, -0.55, 0, TAU);
    ctx.fill("evenodd");
  } else if (dur === "h") {
    ctx.rotate(-0.42);
    ctx.ellipse(0, 0, sp * 0.64, sp * 0.46, 0, 0, TAU);
    ctx.ellipse(0, 0, sp * 0.5, sp * 0.19, 0, 0, TAU);
    ctx.fill("evenodd");
  } else {
    ctx.rotate(-0.42);
    ctx.ellipse(0, 0, sp * 0.64, sp * 0.46, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
/** Horizontal half-extent of a (tilted) notehead. */
const headHalfW = (sp: number, dur: Dur) => (dur === "w" ? sp * 0.86 : sp * 0.6);

/** Piano brace: two mirrored, tapered S-curves meeting in a point. */
function brace(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, sp: number) {
  const ym = (y0 + y1) / 2;
  const half = (y1 - y0) / 2;
  const N = 28;
  const drawHalf = (dir: 1 | -1) => {
    // dir = 1 → top half (y0 → ym), -1 → bottom half (y1 → ym)
    const ys = dir === 1 ? y0 : y1;
    const p0 = { x: x + sp * 0.45, y: ys };
    const c1 = { x: x - sp * 0.55, y: ys + dir * half * 0.32 };
    const c2 = { x: x + sp * 0.6, y: ys + dir * half * 0.78 };
    const p3 = { x: x - sp * 0.6, y: ym };
    const pt = (k: number) => {
      const a = 1 - k;
      return {
        x: a * a * a * p0.x + 3 * a * a * k * c1.x + 3 * a * k * k * c2.x + k * k * k * p3.x,
        y: a * a * a * p0.y + 3 * a * a * k * c1.y + 3 * a * k * k * c2.y + k * k * k * p3.y,
      };
    };
    const w = (k: number) => sp * (0.06 + 0.4 * Math.sin(k * Math.PI) ** 1.5);
    ctx.beginPath();
    for (let n = 0; n <= N; n++) {
      const k = n / N;
      const p = pt(k);
      if (n === 0) ctx.moveTo(p.x - w(k) / 2, p.y);
      else ctx.lineTo(p.x - w(k) / 2, p.y);
    }
    for (let n = N; n >= 0; n--) {
      const k = n / N;
      const p = pt(k);
      ctx.lineTo(p.x + w(k) / 2, p.y);
    }
    ctx.closePath();
    ctx.fill();
  };
  drawHalf(1);
  drawHalf(-1);
}

/** Tapered slur between two points, arching above or below. */
function slur(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, sp: number, above: boolean) {
  const dir = above ? -1 : 1;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const rise = sp * 1.0 * dir;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(mx, my + rise * 2, x1, y1);
  ctx.quadraticCurveTo(mx, my + rise * 2 - sp * 0.36 * dir, x0, y0);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------

export function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  s: SceneState,
  pal: Palette,
  dpr = 1,
) {
  ctx.clearRect(0, 0, W, H);
  const shape = Math.min(6, Math.max(0, s.shape));
  const i = Math.min(5, Math.floor(shape));
  const tt = shape - i;
  const mobile = W < 768;

  const mixArr = (arr: number[]) => lerp(arr[i], arr[i + 1], tt);
  const cy = mixArr(WAVE_CY) * H;
  const leftFade = mobile ? 0 : mixArr(LEFT_FADE);
  const burst = Math.sin(tt * Math.PI);
  const perf = weight(shape, 4); // “we are at the score”
  const sheetIn = smooth((shape - 3.3) / 0.7) * (1 - smooth((shape - 4.5) / 0.5)); // score furniture

  // Staff geometry. On desktop the score lives to the right of the copy
  // column (which is ~560px wide); on mobile it takes the full width.
  const sx0 = mobile ? W * 0.06 : Math.max(W * 0.4, Math.min(600, W * 0.55));
  const sx1 = W - (mobile ? W * 0.06 : W * 0.07);
  const sp = mobile ? 11 : Math.min(20, H * 0.022); // staff space
  // One staff sits at the wave centre; the score is two staves centred.
  const staffCy = mobile ? lerp(H * 0.28, H * 0.22, sheetIn) : lerp(H * 0.5, H * 0.5 - 4 * sp, sheetIn);
  const staffY = (staff: 0 | 1) => staffCy - (staff === 1 ? STAFF2_STEPS : 0) * (sp / 2);
  const stepY = (step: number) => staffCy - (step * sp) / 2;
  const snap = (v: number) => (Math.round(v * dpr - 0.5) + 0.5) / dpr;
  const leadPx = Math.min(7.6 * sp, (sx1 - sx0) * 0.22);
  const lead = sx0 + leadPx; // first barline, where the music starts
  const uToX = (u: number, music: boolean) => (music ? lead + (sx1 - lead) * u : sx0 + (sx1 - sx0) * u);
  const barX = (b: number) => lead + ((sx1 - lead) * b) / SHEET_BARS;
  const beatX = (bar: number, beat: number) => uToX(beatU(bar, beat), true);
  const beatPx = (sx1 - lead) / (SHEET_BARS * 4);
  const font = pal.musicFont;
  const serif = `"Times New Roman", Times, "Liberation Serif", serif`;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // --- Staves
  const staffA = mixArr(STAFF_ALPHA) * s.opacity;
  const drawStaff = (yc: number, alpha: number) => {
    if (alpha < 0.01) return;
    ctx.strokeStyle = pal.fg;
    ctx.lineWidth = Math.max(1, sp * 0.09);
    ctx.lineCap = "butt";
    ctx.globalAlpha = alpha * 0.45;
    for (let l = -2; l <= 2; l++) {
      const y = snap(yc + l * sp);
      ctx.beginPath();
      ctx.moveTo(sx0, y);
      ctx.lineTo(sx1, y);
      ctx.stroke();
    }
    ctx.lineCap = "round";
  };
  drawStaff(staffY(0), staffA);
  drawStaff(staffY(1), staffA * sheetIn);

  // Bar lines: 8 sequencer bars in rhythm/harmony, 4 real bars in the score.
  const seqBars = clamp01(shape - 1.5) * (1 - sheetIn);
  if (staffA > 0.01 && seqBars > 0.01) {
    ctx.globalAlpha = staffA * 0.5 * seqBars;
    ctx.strokeStyle = pal.fg;
    ctx.lineWidth = 1;
    for (let b = 0; b <= BARS; b++) {
      const x = sx0 + ((sx1 - sx0) * b) / BARS;
      ctx.beginPath();
      ctx.moveTo(x, staffY(0) - 2 * sp);
      ctx.lineTo(x, staffY(0) + 2 * sp);
      ctx.stroke();
    }
  }

  // --- Score furniture: brace, system line, barlines, clefs, time, tempo, dynamics
  if (sheetIn > 0.01) {
    const top = staffY(0) - 2 * sp;
    const bottom = staffY(1) + 2 * sp;
    ctx.fillStyle = pal.fg;
    ctx.strokeStyle = pal.fg;
    ctx.lineCap = "butt";

    // barlines run through both staves (piano grand staff)
    ctx.globalAlpha = staffA * 0.8 * sheetIn;
    ctx.lineWidth = Math.max(1, sp * 0.16);
    for (let b = 0; b < SHEET_BARS; b++) {
      const x = snap(barX(b));
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
    // system line at the very start
    {
      const x = snap(sx0);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
    // final barline: thin + thick
    {
      const xThin = snap(sx1 - sp * 0.95);
      ctx.beginPath();
      ctx.moveTo(xThin, top);
      ctx.lineTo(xThin, bottom);
      ctx.stroke();
      ctx.fillRect(sx1 - sp * 0.5, top, sp * 0.5, bottom - top);
    }
    // brace
    brace(ctx, sx0 - sp * 0.85, top, bottom, sp);

    // clefs - anchored like real engraving: the treble curl on the G line,
    // the bass clef's head on the F line.
    ctx.globalAlpha = staffA * 0.95 * sheetIn;
    glyph(ctx, GLYPH.gClef, font, sx0 + sp * 0.55, stepY(-2) + sp * 2.63, sp * 7.0);
    glyph(ctx, GLYPH.fClef, font, sx0 + sp * 0.6, staffY(1) - sp + sp * 1.05, sp * 3.55);

    // time signature: lining serif digits, one in each half of the staff
    ctx.font = `700 ${sp * 2.85}px ${serif}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const tsX = sx0 + leadPx * 0.74;
    for (const st of [0, 1] as const) {
      const yc = staffY(st);
      ctx.fillText("4", tsX, yc);
      ctx.fillText("4", tsX, yc + 2 * sp);
    }

    // tempo mark above the treble staff
    ctx.textAlign = "left";
    ctx.font = `700 ${sp * 1.45}px ${serif}`;
    const tempoY = top - sp * 1.9;
    ctx.fillText("Moderato", tsX - sp * 0.9, tempoY);
    const tempoW = ctx.measureText("Moderato").width;
    const nx = tsX - sp * 0.9 + tempoW + sp * 1.2;
    ctx.save();
    ctx.translate(nx, tempoY - sp * 0.25);
    ctx.scale(0.55, 0.55);
    noteHead(ctx, 0, 0, sp, "q");
    ctx.fillRect(sp * 0.58 - sp * 0.06, -sp * 3.2, sp * 0.12, sp * 3.2);
    ctx.restore();
    ctx.font = `${sp * 1.35}px ${serif}`;
    ctx.fillText("= 96", nx + sp * 0.8, tempoY);

    // dynamics between the staves
    const dynY = staffCy + sp * 4.15;
    ctx.font = `italic 700 ${sp * 2.1}px ${serif}`;
    ctx.textBaseline = "middle";
    ctx.fillText("mf", beatX(0, 0) - sp * 0.7, dynY);
    // hairpin (crescendo)
    ctx.lineWidth = Math.max(1, sp * 0.11);
    ctx.lineCap = "round";
    const hx0 = beatX(HAIRPIN.from[0], HAIRPIN.from[1]) - sp * 0.4;
    const hx1 = beatX(HAIRPIN.to[0], HAIRPIN.to[1]) - sp * 0.6;
    ctx.beginPath();
    ctx.moveTo(hx0, dynY);
    ctx.lineTo(hx1, dynY - sp * 0.7);
    ctx.moveTo(hx0, dynY);
    ctx.lineTo(hx1, dynY + sp * 0.7);
    ctx.stroke();

    // rests
    for (const r of RESTS) {
      const x = beatX(r.bar, r.beat);
      const yc = staffY(r.staff);
      if (r.dur === "w") {
        // whole rest hangs from the 4th line
        ctx.fillRect(x - sp * 0.65, snap(yc - sp) - 0.5 / dpr, sp * 1.3, sp * 0.5);
      } else {
        glyph(ctx, GLYPH.quarterRest, font, x, yc + sp * 1.5, sp * 3.0, "center");
      }
    }
  }

  // --- Playhead + orchestra (performance only)
  const play = (t * 0.16) % 2;
  const playStaff = Math.floor(play) as 0 | 1;
  const playX = lead + (play - playStaff) * (sx1 - lead);
  if (perf > 0.01) {
    const yc = staffY(playStaff);
    ctx.globalAlpha = perf * 0.9 * s.opacity;
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(playX, yc - 3.4 * sp);
    ctx.lineTo(playX, yc + 3.4 * sp);
    ctx.stroke();

    // orchestra: a row of sections breathing in time under the score
    const nBars = mobile ? 24 : 48;
    const baseY = H - (mobile ? 120 : 100);
    const bw = (sx1 - sx0) / nBars;
    const beat = Math.max(0, Math.sin(t * TAU * 0.8));
    for (let b = 0; b < nBars; b++) {
      const sec = b / nBars;
      const h =
        sp * 0.35 +
        sp *
          2.2 *
          (0.35 + 0.65 * Math.abs(Math.sin(t * 2.1 + sec * 9.0) * Math.sin(t * 0.7 + sec * 3.1))) *
          (0.55 + 0.45 * beat);
      const hot = Math.abs(sec - (play - playStaff)) < 0.03;
      ctx.globalAlpha = perf * s.opacity * (hot ? 0.95 : 0.35);
      ctx.fillStyle = hot ? pal.accent : pal.wave;
      ctx.fillRect(sx0 + b * bw + bw * 0.3, baseY - h, bw * 0.4, h);
    }
  }

  // --- Notes
  const noteA = mixArr(NOTE_ALPHA) * s.opacity;
  if (noteA > 0.01) {
    const from = NOTE_SETS[i];
    const to = NOTE_SETS[i + 1];
    const fromMusic = MUSIC_SPACE[i];
    const toMusic = MUSIC_SPACE[i + 1];
    // Between two stages that share the same layout (e.g. score → ambient)
    // the notes must sit perfectly still: no lift, no accent flash.
    const still = NOTE_STAGE[i] === NOTE_STAGE[i + 1];
    const stemLen = sp * 3.5;
    const stemW = Math.max(1, sp * 0.12);

    // Stemmed heads all share one width, so stems never jump sideways.
    const hw = headHalfW(sp, "q");

    type Drawn = { x: number; y: number; k: number; settle: number; up: boolean; end: number; dur: Dur };
    const pos: Drawn[] = [];
    for (let n = 0; n < NOTE_COUNT; n++) {
      const note = SHEET[n];
      const k = smooth((tt - rand[n] * 0.35) / 0.65);
      const a = from[n];
      const b = to[n];
      const x = lerp(uToX(a.x, fromMusic), uToX(b.x, toMusic), k);
      const step = lerp(a.y, b.y, k);
      const lift = still ? 0 : Math.sin(k * Math.PI) * sp * 1.4 * (0.5 + rand[n]);
      const y = stepY(step) - lift;
      // How far the note has become its engraved self (duration glyph, stem
      // direction, beam, accidental). Until it starts landing on the score
      // every note is a plain up-stemmed quarter; from there it eases in
      // continuously, so nothing snaps or flips mid-flight.
      const settle = shape >= 4 ? 1 : i === 3 ? smooth((k - 0.45) / 0.4) : 0;
      const up = FINAL_UP[n];
      pos.push({ x, y, k, settle, up, dur: note.dur, end: up ? y - stemLen : y + stemLen });
    }
    // Beamed pairs share a stem direction and a (gently slanted) beam.
    for (let n = 0; n < NOTE_COUNT; n++) {
      if (SHEET[n].beam !== "start") continue;
      const p = pos[n];
      const q = pos[n + 1];
      const up = p.up;
      const ideal = (d: Drawn) => (up ? d.y - stemLen : d.y + stemLen);
      const slant = Math.max(-sp * 0.8, Math.min(sp * 0.8, ideal(q) - ideal(p)));
      const min = sp * 3.1;
      p.end = up ? Math.min(p.y - min, q.y - min - slant) : Math.max(p.y + min, q.y + min - slant);
      q.end = p.end + slant;
    }

    ctx.lineCap = "butt";
    for (let n = 0; n < NOTE_COUNT; n++) {
      const p = pos[n];
      const note = SHEET[n];
      const active =
        perf > 0.01 && note.staff === playStaff && Math.abs(p.x - playX) < beatPx * 0.45 && shape > 3.6;
      // In-flight tint follows the same arc as `lift`, so it fades to ink
      // continuously as the note lands instead of snapping at k === 1.
      const flight = still ? 0 : Math.min(1, 1.4 * burst * Math.sin(p.k * Math.PI));
      const col = active ? pal.accent : mixColor(pal.fg, pal.accent, flight);
      const baseA = noteA * (active ? 1 : 0.92);
      ctx.globalAlpha = baseA;
      ctx.fillStyle = col;
      ctx.strokeStyle = col;

      // Engraving details fade in with `settle`.
      if (p.settle > 0.01) {
        ctx.globalAlpha = baseA * p.settle;

        // ledger lines, at the note's final staff position
        const st = note.step;
        if (Math.abs(st) >= 6) {
          const lhw = headHalfW(sp, p.dur) + sp * 0.3;
          ctx.lineWidth = Math.max(1, sp * 0.12);
          for (let l = 6; l <= Math.abs(st); l += 2) {
            const y = snap(stepY(Math.sign(st) * l + (note.staff === 1 ? STAFF2_STEPS : 0)));
            ctx.beginPath();
            ctx.moveTo(p.x - lhw, y);
            ctx.lineTo(p.x + lhw, y);
            ctx.stroke();
          }
        }

        // accidental
        if (note.acc) {
          const acc = ACC_GLYPH[note.acc];
          const h = note.acc === "#" ? sp * 2.7 : note.acc === "n" ? sp * 2.7 : sp * 2.4;
          // flats sit with their bowl on the note; sharps/naturals are centred
          const yBottom = note.acc === "b" ? p.y + sp * 0.62 : p.y + h / 2;
          glyph(ctx, acc, font, p.x - headHalfW(sp, p.dur) - sp * 0.25, yBottom, h, "right");
        }
        ctx.globalAlpha = baseA;
      }

      // head: cross-fade from the generic quarter into the engraved duration
      if (p.dur === "q" || p.settle >= 0.99) {
        noteHead(ctx, p.x, p.y, sp, p.dur);
      } else if (p.settle <= 0.01) {
        noteHead(ctx, p.x, p.y, sp, "q");
      } else {
        ctx.globalAlpha = baseA * (1 - p.settle);
        noteHead(ctx, p.x, p.y, sp, "q");
        ctx.globalAlpha = baseA * p.settle;
        noteHead(ctx, p.x, p.y, sp, p.dur);
        ctx.globalAlpha = baseA;
      }

      // stem: starts life pointing up, then eases into its engraved direction
      // (shrinking through the head and growing out the other side), and
      // fades away entirely for whole notes.
      const stemA = p.dur === "w" ? 1 - p.settle : 1;
      if (stemA > 0.01) {
        const finalEnd = p.dur === "w" ? p.y - stemLen : p.end;
        const end = lerp(p.y - stemLen, finalEnd, p.settle);
        const down = end > p.y;
        // up stems hang off the right of the head, down stems off the left
        const side = p.dur === "w" || p.up ? 0 : p.settle;
        const sxp = lerp(p.x + hw - stemW, p.x - hw, side);
        const len = Math.abs(end - p.y) - sp * 0.15;
        ctx.globalAlpha = baseA * stemA;
        if (len > 0) ctx.fillRect(sxp, down ? p.y + sp * 0.15 : end, stemW, len);

        // beam to the partner eighth
        if (p.dur === "e" && note.beam === "start" && p.settle > 0.01) {
          const q = pos[n + 1];
          const qEnd = lerp(q.y - stemLen, q.end, q.settle);
          const sxq = lerp(q.x + hw - stemW, q.x - hw, p.up ? 0 : q.settle);
          const th = sp * 0.5 * (p.up ? 1 : -1);
          ctx.globalAlpha = baseA * Math.min(p.settle, q.settle);
          ctx.beginPath();
          ctx.moveTo(sxp, end);
          ctx.lineTo(sxq + stemW, qEnd);
          ctx.lineTo(sxq + stemW, qEnd + th);
          ctx.lineTo(sxp, end + th);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = baseA;
      }

      if (active) {
        ctx.globalAlpha = noteA * 0.4 * (0.5 + 0.5 * Math.sin(t * 12));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sp * 1.3, 0, TAU);
        ctx.stroke();
      }
    }

    // slur over the bar-1 treble phrase
    const a = pos[SLUR[0]];
    const b = pos[SLUR[1]];
    const slurIn = Math.min(a.settle, b.settle);
    if (slurIn > 0.01 && sheetIn > 0.01) {
      ctx.globalAlpha = noteA * 0.9 * sheetIn * slurIn;
      ctx.fillStyle = pal.fg;
      // arch above the phrase, clearing the highest notehead
      const yTop = Math.min(a.y, b.y) - sp * 0.85;
      slur(ctx, a.x + sp * 0.1, yTop, b.x - sp * 0.1, yTop, sp, true);
    }
    ctx.lineCap = "round";
  }

  // --- Harmonic layers (harmony stage only)
  const harm = weight(shape, 3);
  if (harm > 0.01) {
    const parts = [
      (u: number) => 0.15 * 0.55 * Math.sin(TAU * (u * 3 + t * 0.2)),
      (u: number) => 0.15 * 0.3 * Math.sin(TAU * (u * 6 + t * 0.32)),
      (u: number) => 0.15 * 0.15 * Math.sin(TAU * (u * 12 - t * 0.26)),
    ];
    ctx.lineWidth = 1;
    parts.forEach((f, pi) => {
      ctx.globalAlpha = harm * 0.3 * s.opacity * (1 - pi * 0.2);
      ctx.strokeStyle = pi === 0 ? pal.accent : pal.wave;
      strokeWave(ctx, W, cy, H, (u) => f(u), leftFade);
    });
  }

  // --- Main wave (background layer: quiet tint, never ink)
  const fa = waves[i];
  const fb = waves[i + 1];
  const jitter = s.velocity * 0.03;
  const mainWave = (u: number) => {
    const k = smooth((tt - vnoise(u * 9) * 0.35) / 0.65);
    const base = lerp(fa(u, t), fb(u, t), k);
    const spike = Math.sin(k * Math.PI) * (vnoise(u * 60 + t * 6) * 2 - 1) * 0.06;
    return base + spike + (vnoise(u * 200 + t * 20) * 2 - 1) * jitter;
  };
  // Accent bleeds in mid-morph and takes over for the coda.
  const accentMix = Math.max(burst, weight(shape, 6));
  ctx.lineWidth = mobile ? 1.3 : 1.7;
  ctx.globalAlpha = 0.75 * (1 - accentMix) * s.opacity;
  ctx.strokeStyle = pal.wave;
  if (ctx.globalAlpha > 0.01) strokeWave(ctx, W, cy, H, mainWave, leftFade);
  if (accentMix > 0.01) {
    ctx.globalAlpha = 0.9 * accentMix * s.opacity;
    ctx.strokeStyle = pal.accent;
    strokeWave(ctx, W, cy, H, mainWave, leftFade);
  }

  ctx.globalAlpha = 1;
}

function strokeWave(
  ctx: CanvasRenderingContext2D,
  W: number,
  cy: number,
  H: number,
  f: (u: number) => number,
  leftFade: number,
) {
  const N = 420;
  // Fade the wave out behind the copy column by splitting into segments
  // with their own alpha (cheap and good enough for a hairline).
  const segs = leftFade > 0 ? 6 : 1;
  const baseAlpha = ctx.globalAlpha;
  for (let sgi = 0; sgi < segs; sgi++) {
    const u0 = sgi / segs;
    const u1 = (sgi + 1) / segs;
    const fade = leftFade > 0 ? smooth((u0 - 0.28) / 0.22) : 1;
    const a = baseAlpha * lerp(1, fade, leftFade);
    if (a < 0.01) continue;
    ctx.globalAlpha = a;
    ctx.beginPath();
    const n0 = Math.floor(u0 * N);
    const n1 = Math.ceil(u1 * N);
    for (let n = n0; n <= n1; n++) {
      const u = n / N;
      const x = u * W;
      const y = cy + f(u) * H;
      if (n === n0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = baseAlpha;
}
