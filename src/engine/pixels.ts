/**
 * Low-level pixel-art helpers.
 *
 * Every image in this game is drawn procedurally into an offscreen canvas once
 * at boot and then handed to WebGL as a texture. No .png ships, nothing is
 * fetched, and `npm run build:single` stays a single file a teacher can put on
 * a USB stick. That constraint is the whole reason this module exists, and it
 * is also why the game can have four hundred distinct props: they cost lines,
 * not megabytes.
 *
 * Two rules that are load-bearing:
 *
 *  1. **Never `Math.random()` for anything drawn.** Use `hash()`. A texture
 *     that reseeds between frames shimmers, and a texture that reseeds between
 *     runs means two students see different houses.
 *  2. **Integer coordinates only.** Everything snaps with `| 0`. A pixel drawn
 *     at x=4.5 is a grey pixel at 4 and a grey pixel at 5, and the whole style
 *     dies of it.
 */

export interface Surface {
  canvas: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  w: number;
  h: number;
}

/** An offscreen canvas with smoothing off and the origin at the top left. */
export function surface(w: number, h: number): Surface {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return { canvas, g, w, h };
}

/**
 * Deterministic hash → [0,1). The only source of variation in the renderer.
 * Three integer inputs so a caller can key on (x, y, layer) without collisions.
 */
export function hash(x: number, y: number, seed = 0): number {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (seed | 0) * 1274126177;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Hash into an integer range [lo, hi]. */
export function hashInt(x: number, y: number, seed: number, lo: number, hi: number): number {
  return lo + Math.floor(hash(x, y, seed) * (hi - lo + 1));
}

/** Pick from a list, deterministically. */
export function pick<T>(list: readonly T[], x: number, y: number, seed = 0): T {
  return list[Math.floor(hash(x, y, seed) * list.length) % list.length];
}

export function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string): void {
  g.fillStyle = c;
  g.fillRect(x | 0, y | 0, w | 0, h | 0);
}

export function px(g: CanvasRenderingContext2D, x: number, y: number, c: string): void {
  g.fillStyle = c;
  g.fillRect(x | 0, y | 0, 1, 1);
}

export function hline(g: CanvasRenderingContext2D, x: number, y: number, w: number, c: string): void {
  rect(g, x, y, w, 1, c);
}

export function vline(g: CanvasRenderingContext2D, x: number, y: number, h: number, c: string): void {
  rect(g, x, y, 1, h, c);
}

/** 1px hollow rectangle — the outline pass that sells the 16-bit look. */
export function stroke(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string): void {
  hline(g, x, y, w, c);
  hline(g, x, y + h - 1, w, c);
  vline(g, x, y, h, c);
  vline(g, x + w - 1, y, h, c);
}

/** Bresenham line, one pixel wide, no antialiasing. */
export function line(
  g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, c: string,
): void {
  let x = x0 | 0, y = y0 | 0;
  const dx = Math.abs((x1 | 0) - x), dy = -Math.abs((y1 | 0) - y);
  const sx = x < (x1 | 0) ? 1 : -1, sy = y < (y1 | 0) ? 1 : -1;
  let err = dx + dy;
  for (let guard = 0; guard < 4096; guard++) {
    px(g, x, y, c);
    if (x === (x1 | 0) && y === (y1 | 0)) return;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

/** Filled axis-aligned ellipse, integer-snapped. */
export function ellipse(
  g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, c: string,
): void {
  g.fillStyle = c;
  for (let y = -ry; y <= ry; y++) {
    const t = 1 - (y * y) / (ry * ry);
    if (t <= 0) continue;
    const w = Math.round(rx * Math.sqrt(t));
    if (w <= 0) continue;
    g.fillRect((cx - w) | 0, (cy + y) | 0, w * 2, 1);
  }
}

/** Filled circle. */
export function disc(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string): void {
  ellipse(g, cx, cy, r, r, c);
}

/**
 * Scatter single pixels through a box at a given density.
 * The workhorse for grass, gravel, foxing, plaster and every other surface that
 * needs to not be a flat colour without needing a noise texture.
 */
export function speckle(
  g: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  c: string, density: number, seed = 0,
): void {
  g.fillStyle = c;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (hash(x + i, y + j, seed) < density) g.fillRect((x + i) | 0, (y + j) | 0, 1, 1);
    }
  }
}

/**
 * A vertical three-value shade over a box: shadow band at the left, body,
 * highlight at the right. Used by anything cylindrical — barrels, tree trunks,
 * columns, chimneys, a man's arm.
 */
export function cylinder(
  g: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  ramp: readonly [string, string, string],
  lightFromLeft = true,
): void {
  rect(g, x, y, w, h, ramp[1]);
  const edge = Math.max(1, Math.round(w * 0.22));
  if (lightFromLeft) {
    rect(g, x + w - edge, y, edge, h, ramp[0]);
    vline(g, x, y, h, ramp[2]);
  } else {
    rect(g, x, y, edge, h, ramp[0]);
    vline(g, x + w - 1, y, h, ramp[2]);
  }
}

/**
 * A box drawn as a solid: body, a shaded face on one side, a lit top edge, and
 * a 1px ink outline. This one function is most of the furniture in the game.
 */
export function solid(
  g: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  ramp: readonly [string, string, string],
  ink: string,
  shadeRight = true,
): void {
  rect(g, x, y, w, h, ramp[1]);
  const s = Math.max(1, Math.round(w * 0.28));
  if (shadeRight) rect(g, x + w - s, y, s, h, ramp[0]);
  else rect(g, x, y, s, h, ramp[0]);
  hline(g, x + 1, y, w - 2, ramp[2]);
  stroke(g, x, y, w, h, ink);
}

/** Replace one exact colour with another across a whole surface. */
export function swap(s: Surface, from: string, to: string): void {
  const img = s.g.getImageData(0, 0, s.w, s.h);
  const d = img.data;
  const f = parseHex(from), t = parseHex(to);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] === f[0] && d[i + 1] === f[1] && d[i + 2] === f[2] && d[i + 3] > 0) {
      d[i] = t[0]; d[i + 1] = t[1]; d[i + 2] = t[2];
    }
  }
  s.g.putImageData(img, 0, 0);
}

export function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function toHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mix two hex colours. t=0 is a, t=1 is b. */
export function mix(a: string, b: string, t: number): string {
  const A = parseHex(a), B = parseHex(b);
  return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}

/** Lighten or darken by a fraction. Positive lightens. */
export function shade(hex: string, amount: number): string {
  return amount >= 0 ? mix(hex, '#ffffff', amount) : mix(hex, '#000000', -amount);
}

/** Build a three-step ramp from one mid colour. Used when content names one hue. */
export function rampFrom(mid: string): readonly [string, string, string] {
  return [shade(mid, -0.30), mid, shade(mid, 0.22)];
}

/**
 * Draw a 1px dark outline around every opaque pixel that touches transparency.
 * Run last on any sprite that has to hold up against a lit 3D ground: without
 * it, a figure dissolves into whatever is behind them the moment the grass
 * happens to be the same value as their coat.
 */
export function outline(s: Surface, colour = '#241C14'): void {
  const img = s.g.getImageData(0, 0, s.w, s.h);
  const d = img.data;
  const w = s.w, h = s.h;
  const alpha = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) alpha[i] = d[i * 4 + 3] > 8 ? 1 : 0;
  const c = parseHex(colour);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (alpha[i]) continue;
      const near =
        (x > 0 && alpha[i - 1]) || (x < w - 1 && alpha[i + 1]) ||
        (y > 0 && alpha[i - w]) || (y < h - 1 && alpha[i + w]);
      if (!near) continue;
      d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255;
    }
  }
  s.g.putImageData(img, 0, 0);
}

/**
 * A soft round shadow, drawn once and reused under everything that stands up.
 * Cheaper than a shadow map by three orders of magnitude and, at this camera
 * pitch with this much bloom, indistinguishable from one.
 */
export function blobShadow(size = 32): Surface {
  const s = surface(size, size);
  const c = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c + 0.5) / c, dy = (y - c + 0.5) / c;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r >= 1) continue;
      const a = Math.pow(1 - r, 1.6) * 0.55;
      s.g.fillStyle = `rgba(20,16,10,${a.toFixed(3)})`;
      s.g.fillRect(x, y, 1, 1);
    }
  }
  return s;
}
