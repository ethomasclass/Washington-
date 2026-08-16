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
  /**
   * Where the image lives, relative to the site root — tried in order, first
   * one that loads wins.
   *
   * A list rather than a single path because the asset arrives from outside the
   * build: it is exported by whatever generated it and uploaded by hand, and it
   * has already turned up once as `washington-sheet.png.jpg` — a JPEG wearing a
   * doubled extension, which a single hard-coded path would have silently
   * ignored while the game went on drawing the placeholder. Guessing a few
   * sensible names costs one failed request and removes a whole class of
   * "I uploaded it and nothing happened".
   */
  src: string[];
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
   * Trimmed off every CELL after slicing, as fractions of the cell.
   *
   * Separate from `margin`, which is trimmed off the sheet once, because the
   * generator captions every row — "idle 1 2 …" sits under each band, not just
   * under the last one — so a single bottom margin on the whole sheet cannot
   * reach the first two. The left and right insets also clear the pale rules the
   * generator draws between columns, which are not the field colour and so
   * survive the key.
   */
  cellInset: { left: number; right: number; top: number; bottom: number };
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

/*
 * The current sheet. Cut to the sheet actually generated on 16 Aug 2026.
 *
 * KNOWN DEBT, carried deliberately and not forgotten. This sheet wears the light
 * blue riband in every frame, and the riband is documented from 14 July 1775 —
 * so it is wrong at Mount Vernon, which is May. The engine has always known the
 * difference (`riband = plateSet !== 'vernon'`) and the procedural figures still
 * honour it; a painted sheet cannot, because there is only one of them. Act 1
 * therefore shows the riband early until a no-riband variant is generated.
 *
 * Also owed, from the same generation: the epaulettes and gold braid are later
 * than 1775 and quietly undercut why the riband exists at all — it was adopted
 * BECAUSE there was no insignia — the riding boots should be stockings and
 * buckled shoes for a man on foot in camp, and the hair reads as a wig when it
 * should be his own, powdered. All four are on the regeneration list.
 */
export const WASHINGTON_SHEET: SheetSpec = {
  src: [
    'figures/washington-sheet.jpg',
    'figures/washington-sheet.png',
    'figures/washington-sheet.webp',
    'figures/washington-sheet.png.jpg',
  ],
  cols: 9,
  rows: ['front', 'side', 'back'],
  // Tuned against the delivered 2048 x 2048 sheet. /sprites.html shows the cut,
  // which is the only honest way to set these.
  margin: { left: 0.045, right: 0.004, top: 0.004, bottom: 0.0 },
  cellInset: { left: 0.04, right: 0.04, top: 0.005, bottom: 0.02 },
  keyTolerance: 40,
  flip: ['side'],
};

/**
 * Knock the flat field out of a cut cell, by flooding in from the edges.
 *
 * NOT a global colour match, which is what this was first and which failed
 * exactly as badly as it deserved to. The field is a grey-green and the coat is
 * a dark navy, and in a JPEG the two are close enough — once compression noise
 * has moved every pixel a little — that a tolerance wide enough to clear the
 * background also punched holes straight through the uniform. The man came out
 * with the sky showing through his chest.
 *
 * Flooding from the border cannot do that. Only background CONNECTED to the
 * outside of the cell is removed, so an enclosed patch of coat that happens to
 * resemble the field is untouchable no matter how close the colours are. It is
 * also what makes the tolerance safe to widen for a lossy source: the risk of a
 * wide tolerance is now confined to the outside of the silhouette.
 */
function keyOut(
  x: CanvasRenderingContext2D,
  w: number,
  h: number,
  key: [number, number, number],
  tol: number,
): void {
  const img = x.getImageData(0, 0, w, h);
  const d = img.data;
  const t2 = tol * tol * 3;
  const near = (i: number): boolean => {
    const dr = d[i] - key[0];
    const dg = d[i + 1] - key[1];
    const db = d[i + 2] - key[2];
    return dr * dr + dg * dg + db * db <= t2;
  };

  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (px: number, py: number): void => {
    if (px < 0 || py < 0 || px >= w || py >= h) return;
    const n = py * w + px;
    if (seen[n]) return;
    seen[n] = 1;
    if (!near(n * 4)) return;
    d[n * 4 + 3] = 0;
    stack.push(n);
  };

  for (let px = 0; px < w; px++) {
    push(px, 0);
    push(px, h - 1);
  }
  for (let py = 0; py < h; py++) {
    push(0, py);
    push(w - 1, py);
  }
  while (stack.length) {
    const n = stack.pop()!;
    const px = n % w;
    const py = (n / w) | 0;
    push(px - 1, py);
    push(px + 1, py);
    push(px, py - 1);
    push(px, py + 1);
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
  const w = cell.width;
  const h = cell.height;
  const img = x.getImageData(0, 0, w, h);
  const data = img.data;

  /*
   * KEEP THE MAN, DROP THE CAPTION.
   *
   * The generator letters every frame — "idle", "1", "2" — in a strip under the
   * row, and trimming that strip off by eye is a losing game: set the trim deep
   * enough to clear the lettering on one row and it takes the boots off another,
   * because the rows do not sit at identical heights. Tuning that number was
   * costing a frame either way.
   *
   * So the cell is separated into connected regions instead, and everything that
   * is not the figure is erased. A letter is a tiny island; the man is one large
   * mass. Anything under a tenth of the largest region's area goes, which drops
   * lettering and specks of JPEG noise and keeps a detached cuff or hat. The
   * inset trims then only have to be roughly right.
   */
  const label = new Int32Array(w * h).fill(-1);
  const areas: number[] = [];
  const stack: number[] = [];
  for (let start = 0; start < w * h; start++) {
    if (label[start] !== -1 || data[start * 4 + 3] <= 24) continue;
    const id = areas.length;
    let area = 0;
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const n = stack.pop()!;
      area++;
      const px = n % w;
      const py = (n / w) | 0;
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        const nx = px + ox;
        const ny = py + oy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const m = ny * w + nx;
        if (label[m] !== -1 || data[m * 4 + 3] <= 24) continue;
        label[m] = id;
        stack.push(m);
      }
    }
    areas.push(area);
  }
  const biggest = areas.length ? Math.max(...areas) : 0;
  const keep = (id: number): boolean => id >= 0 && areas[id] >= biggest * 0.1;
  for (let n = 0; n < w * h; n++) {
    if (data[n * 4 + 3] > 24 && !keep(label[n])) data[n * 4 + 3] = 0;
  }
  x.putImageData(img, 0, 0);

  let x0 = w;
  let x1 = -1;
  let y0 = h;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let px = 0; px < w; px++) {
      if (data[(y * w + px) * 4 + 3] > 24) {
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
  const fw = x1 - x0 + 1;
  const fh = y1 - y0 + 1;
  const s = Math.min(boxW / fw, boxH / fh);
  const g = out.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(cell, x0, y0, fw, fh, (boxW - fw * s) / 2, boxH - fh * s, fw * s, fh * s);
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
  const tryLoad = (src: string): Promise<HTMLImageElement | null> =>
    new Promise((resolve) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => resolve(null);
      el.src = src;
    });

  let img: HTMLImageElement | null = null;
  for (const src of spec.src) {
    img = await tryLoad(src);
    if (img && img.naturalWidth) break;
    img = null;
  }
  if (!img) return null;

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
        // The part of the cell that is actually the figure: the caption strip
        // and the column rules are cut away before anything else looks at it.
        const ix = Math.round(cw * spec.cellInset.left);
        const iy = Math.round(ch * spec.cellInset.top);
        const iw = Math.round(cw * (1 - spec.cellInset.left - spec.cellInset.right));
        const ih = Math.round(ch * (1 - spec.cellInset.top - spec.cellInset.bottom));
        const cell = document.createElement('canvas');
        cell.width = iw;
        cell.height = ih;
        const g = cell.getContext('2d')!;
        if (spec.flip.includes(facing)) {
          g.translate(iw, 0);
          g.scale(-1, 1);
        }
        g.drawImage(img, gx + c * cw + ix, gy + r * ch + iy, iw, ih, 0, 0, iw, ih);
        keyOut(g, iw, ih, key, spec.keyTolerance);
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
