/**
 * Painted figure sheets — cutting a generated walk cycle into frames.
 *
 * ART DIRECTION, RECORDED (16 Aug 2026). The figures are now line-and-fill —
 * closed contour, flat colour, legible at eighty pixels — standing against
 * scenery that stays alla prima oil. That is a deliberate contrast and not a
 * drift: figures read as drawn people moving through a painted world, the way a
 * cut-paper figure reads on a painted stage. docs/02 §1 and docs/09 carry the
 * note. Everything else in 09 still governs the PLATES, which have not changed.
 *
 * WHAT THIS MODULE DOES. A generated sheet arrives as one image: a grid of
 * cells, one row per facing, one column per frame, on a flat field with the
 * generator's own labels in the margins. This slices it into the exact shape
 * the renderer already consumes — nine textures per facing, idle first — so
 * nothing downstream knows or cares whether a frame was painted by a person or
 * by art.ts.
 *
 * IT IS ALWAYS OPTIONAL. If the sheet is absent, unreadable, or still being
 * regenerated, `loadFigureSheet` resolves to null and the renderer falls back to
 * the procedural figures. A missing asset must never be able to break a class
 * period.
 */

export type Facing = 'front' | 'side' | 'back';

export interface SheetSpec {
  /** Where the image lives, relative to the site root. */
  src: string;
  /** Frames per facing, including the idle in cell 1. */
  cols: number;
  /** Facings, in the order their rows appear top to bottom. */
  rows: Facing[];
  /**
   * Margins trimmed off the whole sheet before the grid is measured, as
   * fractions of the image. The generator writes its own row and frame labels
   * into the margins — "front", "idle", "1" — and 02 §9.5 forbids generated
   * lettering reaching a player, so the labels are cut off here rather than
   * being asked for politely in the prompt.
   */
  margin: { left: number; right: number; top: number; bottom: number };
  /**
   * The flat field behind the figures, keyed out. Sampled from the sheet's own
   * top-left pixel after the margin trim, so a regenerated sheet with a slightly
   * different grey-green needs no numbers changing here.
   */
  keyTolerance: number;
  /**
   * Facings whose art faces the wrong way and must be mirrored on cutting.
   *
   * The renderer walks the side cycle to frame-left and flips it in the engine
   * to walk the other way, so a sheet drawn facing frame-right has to be turned
   * once here. Doing it at cut time rather than at draw time means the engine's
   * own mirror still means what it says.
   */
  flip: Facing[];
}

/** The current sheet. Cut to the sheet actually generated on 16 Aug 2026. */
export const WASHINGTON_SHEET: SheetSpec = {
  src: 'figures/washington-sheet.png',
  cols: 9,
  rows: ['front', 'side', 'back'],
  // The generated sheet carries a label gutter down the left and a caption strip
  // under each row. Tuned against the delivered image; /sprites.html shows the
  // cut, which is the only honest way to set these.
  margin: { left: 0.055, right: 0.005, top: 0.005, bottom: 0.0 },
  keyTolerance: 46,
  flip: ['side'],
};

/**
 * Knock the flat field out of a cut cell.
 *
 * A hard threshold, not a feather: these figures have a closed dark contour, so
 * there is a real edge to cut against and a soft key would only leave a halo of
 * the field colour around every man. Pixels near the key colour go fully
 * transparent; everything else is left exactly as painted.
 */
function keyOut(x: CanvasRenderingContext2D, w: number, h: number, key: [number, number, number], tol: number): void {
  const img = x.getImageData(0, 0, w, h);
  const d = img.data;
  const t2 = tol * tol * 3;
  for (let i = 0; i < d.length; i += 4) {
    const dr = d[i] - key[0];
    const dg = d[i + 1] - key[1];
    const db = d[i + 2] - key[2];
    if (dr * dr + dg * dg + db * db <= t2) d[i + 3] = 0;
  }
  x.putImageData(img, 0, 0);
}

/**
 * Trim a cut cell down to what is actually drawn, then re-place it in a box of
 * fixed size with the feet on the bottom edge.
 *
 * This is the step that stops the walk cycle jittering. Cropping each frame to
 * its own contents would let the man shift a few pixels a frame — the generator
 * does not centre a figure to the pixel — and at eighty pixels that reads as a
 * limp. Instead every frame is placed by ONE rule: horizontal centre of mass,
 * feet on the baseline.
 */
function normalise(cell: HTMLCanvasElement, boxW: number, boxH: number): HTMLCanvasElement {
  const x = cell.getContext('2d')!;
  const { data } = x.getImageData(0, 0, cell.width, cell.height);
  let x0 = cell.width;
  let x1 = -1;
  let y0 = cell.height;
  let y1 = -1;
  for (let y = 0; y < cell.height; y++) {
    for (let px = 0; px < cell.width; px++) {
      if (data[(y * cell.width + px) * 4 + 3] > 24) {
        if (px < x0) x0 = px;
        if (px > x1) x1 = px;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const out = document.createElement('canvas');
  out.width = boxW;
  out.height = boxH;
  if (x1 < x0 || y1 < y0) return out; // nothing drawn in this cell
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const s = Math.min(boxW / w, boxH / h);
  const g = out.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(cell, x0, y0, w, h, (boxW - w * s) / 2, boxH - h * s, w * s, h * s);
  return out;
}

/**
 * Load and cut a sheet.
 *
 * Resolves to null on any failure — missing file, wrong size, a browser that
 * will not read the pixels back — because the procedural figures are always
 * there behind this and a blank man is worse than an old one.
 */
export async function loadFigureSheet(
  spec: SheetSpec = WASHINGTON_SHEET,
  height = 320,
): Promise<Record<Facing, HTMLCanvasElement[]> | null> {
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = spec.src;
  });
  if (!img || !img.naturalWidth) return null;

  try {
    // The whole sheet, minus the generator's label margins.
    const gx = Math.round(img.naturalWidth * spec.margin.left);
    const gy = Math.round(img.naturalHeight * spec.margin.top);
    const gw = Math.round(img.naturalWidth * (1 - spec.margin.left - spec.margin.right));
    const gh = Math.round(img.naturalHeight * (1 - spec.margin.top - spec.margin.bottom));
    const cw = Math.floor(gw / spec.cols);
    const ch = Math.floor(gh / spec.rows.length);

    // The key colour, read from the sheet itself rather than hard-coded.
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    probe.getContext('2d')!.drawImage(img, gx + 2, gy + 2, 1, 1, 0, 0, 1, 1);
    const p = probe.getContext('2d')!.getImageData(0, 0, 1, 1).data;
    const key: [number, number, number] = [p[0], p[1], p[2]];

    const boxW = Math.round(height * 0.46); // ground.ts FIGURE_ASPECT
    const out = {} as Record<Facing, HTMLCanvasElement[]>;

    spec.rows.forEach((facing, r) => {
      const frames: HTMLCanvasElement[] = [];
      for (let c = 0; c < spec.cols; c++) {
        const cell = document.createElement('canvas');
        cell.width = cw;
        cell.height = ch;
        const g = cell.getContext('2d')!;
        if (spec.flip.includes(facing)) {
          g.translate(cw, 0);
          g.scale(-1, 1);
        }
        g.drawImage(img, gx + c * cw, gy + r * ch, cw, ch, 0, 0, cw, ch);
        keyOut(g, cw, ch, key, spec.keyTolerance);
        frames.push(normalise(cell, boxW, height));
      }
      out[facing] = frames;
    });

    // A sheet that cut to nothing is a mis-specified grid, not usable art.
    const drawn = out[spec.rows[0]].some((c) => {
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 24) return true;
      return false;
    });
    return drawn ? out : null;
  } catch {
    return null; // a tainted canvas, or anything else — fall back quietly
  }
}
