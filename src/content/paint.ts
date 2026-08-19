/**
 * Painting a map instead of typing one.
 *
 * The estate is 76 by 62 tiles. Typed as ASCII art that is 4,712 characters
 * across two layers that have to stay aligned to the column, and the first
 * time somebody inserts a tile the whole thing shears. So the ground and the
 * elevation are painted with operations — fill this rectangle, run this path,
 * scatter this along that edge — and the ASCII is generated.
 *
 * This is the same argument the old build made for staging figures rather than
 * giving them coordinates, and it was right about that too.
 */

export class Canvas {
  readonly cols: number;
  readonly rows: number;
  private cells: string[];

  constructor(cols: number, rows: number, fill = '.') {
    this.cols = cols;
    this.rows = rows;
    this.cells = new Array(cols * rows).fill(fill);
  }

  set(c: number, r: number, ch: string): void {
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return;
    this.cells[r * this.cols + c] = ch;
  }

  get(c: number, r: number): string {
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return ' ';
    return this.cells[r * this.cols + c];
  }

  /** Rectangle, inclusive of x/z, exclusive of the far edge. */
  rect(x: number, z: number, w: number, d: number, ch: string): this {
    for (let r = z; r < z + d; r++) for (let c = x; c < x + w; c++) this.set(c, r, ch);
    return this;
  }

  /** Horizontal band across the whole map. */
  band(z: number, d: number, ch: string): this {
    return this.rect(0, z, this.cols, d, ch);
  }

  /** A filled ellipse — carriage circles, ponds, clumps of planting. */
  ellipse(cx: number, cz: number, rx: number, rz: number, ch: string): this {
    for (let r = Math.floor(cz - rz); r <= Math.ceil(cz + rz); r++) {
      for (let c = Math.floor(cx - rx); c <= Math.ceil(cx + rx); c++) {
        const dx = (c + 0.5 - cx) / rx, dz = (r + 0.5 - cz) / rz;
        if (dx * dx + dz * dz <= 1) this.set(c, r, ch);
      }
    }
    return this;
  }

  /** An open ring — the carriage drive round the forecourt. */
  ring(cx: number, cz: number, rx: number, rz: number, width: number, ch: string): this {
    for (let r = Math.floor(cz - rz - width); r <= Math.ceil(cz + rz + width); r++) {
      for (let c = Math.floor(cx - rx - width); c <= Math.ceil(cx + rx + width); c++) {
        const dx = (c + 0.5 - cx) / rx, dz = (r + 0.5 - cz) / rz;
        const d = Math.sqrt(dx * dx + dz * dz);
        const inner = 1 - width / Math.max(rx, rz);
        if (d <= 1 && d >= inner) this.set(c, r, ch);
      }
    }
    return this;
  }

  /** A path of a given width through a list of waypoints. */
  path(points: Array<[number, number]>, width: number, ch: string): this {
    const half = width / 2;
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, z0] = points[i];
      const [x1, z1] = points[i + 1];
      const steps = Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 3);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = x0 + (x1 - x0) * t;
        const z = z0 + (z1 - z0) * t;
        for (let r = Math.floor(z - half); r <= Math.ceil(z + half); r++) {
          for (let c = Math.floor(x - half); c <= Math.ceil(x + half); c++) {
            if (Math.hypot(c + 0.5 - x, r + 0.5 - z) <= half) this.set(c, r, ch);
          }
        }
      }
    }
    return this;
  }

  /** Replace one character with another inside a rectangle. */
  swap(x: number, z: number, w: number, d: number, from: string, to: string): this {
    for (let r = z; r < z + d; r++) {
      for (let c = x; c < x + w; c++) if (this.get(c, r) === from) this.set(c, r, to);
    }
    return this;
  }

  /**
   * Break up a hard edge, deterministically. A rectangle of meadow with a
   * straight edge reads as a rectangle; the same rectangle with a ragged edge
   * reads as a field. Two lines of code for a large return.
   */
  ragged(target: string, over: string, amount = 0.5, seed = 1): this {
    const h = (c: number, r: number) => {
      let x = c * 374761393 + r * 668265263 + seed * 1274126177;
      x = (x ^ (x >>> 13)) >>> 0;
      return ((Math.imul(x, 1274126177) ^ (x >>> 16)) >>> 0) / 4294967296;
    };
    const out: Array<[number, number]> = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.get(c, r) !== target) continue;
        const edge =
          this.get(c + 1, r) === over || this.get(c - 1, r) === over ||
          this.get(c, r + 1) === over || this.get(c, r - 1) === over;
        if (edge && h(c, r) < amount) out.push([c, r]);
      }
    }
    for (const [c, r] of out) this.set(c, r, over);
    return this;
  }

  lines(): string[] {
    const out: string[] = [];
    for (let r = 0; r < this.rows; r++) {
      out.push(this.cells.slice(r * this.cols, (r + 1) * this.cols).join(''));
    }
    return out;
  }
}

/**
 * An elevation layer built from bands, so terrain reads as terraces cut into a
 * slope — which is what Mount Vernon's east front actually is.
 */
export function terraces(cols: number, rows: number, steps: Array<[number, number]>): string[] {
  const cv = new Canvas(cols, rows, '0');
  for (const [fromRow, level] of steps) cv.rect(0, fromRow, cols, rows - fromRow, String(level));
  return cv.lines();
}

/** Scatter prop instances along a line, deterministically. */
export function scatter(
  id: string,
  from: [number, number],
  to: [number, number],
  n: number,
  jitter = 0.7,
  seed = 3,
): Array<{ id: string; x: number; z: number; flip?: boolean }> {
  const out: Array<{ id: string; x: number; z: number; flip?: boolean }> = [];
  const h = (i: number, k: number) => {
    let x = i * 374761393 + k * 668265263 + seed * 1274126177;
    x = (x ^ (x >>> 13)) >>> 0;
    return ((Math.imul(x, 1274126177) ^ (x >>> 16)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    out.push({
      id,
      x: from[0] + (to[0] - from[0]) * t + (h(i, 1) - 0.5) * jitter * 2,
      z: from[1] + (to[1] - from[1]) * t + (h(i, 2) - 0.5) * jitter * 2,
      flip: h(i, 3) < 0.5,
    });
  }
  return out;
}
