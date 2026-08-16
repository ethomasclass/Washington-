/**
 * Scene plates cut from one generated painting.
 *
 * `docs/03a` §0 is explicit: "there is exactly one canonical generation per
 * plate", and L0–L5 are compositional zones inside that one image rather than
 * six separate generations. This module is the other half of that instruction —
 * it takes the single painting and produces the layer stack the renderer wants.
 *
 * WHY BANDS WORK HERE, WHEN THEY USUALLY DO NOT. Cutting a flat image into
 * parallax layers normally fails on occlusion: lift a midground mass, slide it,
 * and you reveal ground that was never painted behind it. Two things make this
 * game the exception.
 *
 *   1. The parallax is tiny on purpose. PARALLAX_MAX_PX is 64 on a 1600-wide
 *      frame and the renderer calls it "breath, not a camera move". The largest
 *      relative shift between neighbouring bands is a few dozen pixels.
 *   2. The composition is already depth-by-height. The horizon is locked at
 *      0.34 project-wide and the walkable band runs from it to the bottom edge,
 *      so a horizontal band IS a depth band. Nothing has to be inferred.
 *
 * So the cut is horizontal, and every band keeps a generous strip of what lies
 * BEHIND it, faded out along that edge. When a band breathes, the pixels that
 * come out from under it are painted pixels belonging to the band behind, not a
 * hole — and the seam is a soft gradient rather than a line, so there is nothing
 * for the eye to catch.
 *
 * WHAT THIS CANNOT DO. It cannot separate a tent from the ground beside it, or
 * let the player walk BEHIND a painted object that is not a full-width band.
 * Anything the player must pass behind still wants either its own generation or
 * a prop composited in-engine, exactly as 03a §4.0.2 already says.
 */

const W = 1600;
const H = 900;

export interface SceneryBand {
  /** Where the band starts and ends, as fractions of image height. */
  from: number;
  to: number;
  /**
   * How far the band is extended DOWNWARD past `to`, as a fraction of image
   * height, fading to nothing across that distance.
   *
   * This is the whole trick. The extension is painted content belonging to what
   * is behind the next band down, so when the two slide against one another the
   * gap fills with picture instead of with nothing.
   */
  bleed: number;
  /** Which slot in the renderer's six-layer stack this band occupies. */
  slot: number;
}

export interface ScenerySpec {
  /** Candidate paths, first that loads wins — the file arrives by hand. */
  src: string[];
  /**
   * Where the horizon sits in the SOURCE image, as a fraction of its height.
   *
   * The engine's horizon is locked at 0.34 (ground.ts HORIZON) and everything —
   * figure scale, walk plane, painted scenery — is measured from it. A
   * generation will not land it exactly, so the image is scaled and shifted at
   * cut time to put its horizon on the engine's. Getting this number wrong is
   * the one failure that makes figures look like they are floating.
   */
  horizon: number;
  bands: SceneryBand[];
}

/**
 * The default cut: three real bands.
 *
 * Deliberately few. Every extra band is another seam that can be caught out by
 * parallax, and the return falls off fast — the difference between three bands
 * and six, at 64 pixels of travel, is not visible, while the risk of a visible
 * hole triples.
 */
export const DEFAULT_BANDS: SceneryBand[] = [
  // Everything above and just past the horizon: sky, far shore, distant town.
  { from: 0, to: 0.40, bleed: 0.06, slot: 0 },
  // The ground the player walks, from the horizon to the bottom edge.
  { from: 0.34, to: 1, bleed: 0, slot: 2 },
  // The near-field occluder 03a §3 asks every exterior to carry, cropped by the
  // bottom edge, which passes in front of everything including the player.
  { from: 0.86, to: 1, bleed: 0, slot: 5 },
];

const blank = (): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
};

/**
 * Cut one band, with its soft lower edge.
 *
 * The source is drawn scaled and offset so that its horizon lands on the
 * engine's, then everything outside the band is erased and the bleed is faded
 * with a gradient in `destination-out`. Painting the fade rather than clipping
 * is what leaves a soft edge instead of a cut one.
 */
function cutBand(
  img: HTMLImageElement,
  band: SceneryBand,
  scale: number,
  dx: number,
  dy: number,
): HTMLCanvasElement {
  const c = blank();
  const x = c.getContext('2d')!;
  x.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);

  const top = band.from * H;
  const bottom = Math.min(H, band.to * H);
  const bleedPx = band.bleed * H;

  x.globalCompositeOperation = 'destination-out';
  // Everything above the band.
  if (top > 0) x.fillRect(0, 0, W, top);
  // Everything below the band and its bleed.
  if (bottom + bleedPx < H) {
    x.fillStyle = '#000';
    x.fillRect(0, bottom + bleedPx, W, H - bottom - bleedPx);
  }
  // The bleed itself, faded out so the seam is a gradient and not a line.
  if (bleedPx > 0) {
    const g = x.createLinearGradient(0, bottom, 0, bottom + bleedPx);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,1)');
    x.fillStyle = g;
    x.fillRect(0, bottom, W, bleedPx);
  }
  x.globalCompositeOperation = 'source-over';
  return c;
}

/**
 * Load a generated scene painting and cut it into the renderer's layer stack.
 *
 * Returns null on any failure, because the procedural plate painters are always
 * behind this and a scene that will not build is worse than one that looks like
 * a placeholder.
 */
export async function loadScenery(spec: ScenerySpec): Promise<HTMLCanvasElement[] | null> {
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
    /*
     * Fit the painting to the frame, then slide it so its horizon sits on the
     * engine's. Width is matched rather than height: a generation is composed
     * with margin on all four sides (03a slot 5), so losing a little top or
     * bottom costs nothing, whereas losing the sides costs composition.
     */
    const scale = W / img.naturalWidth;
    const dx = 0;
    const dy = H * 0.34 - img.naturalHeight * scale * spec.horizon;

    const out: HTMLCanvasElement[] = [blank(), blank(), blank(), blank(), blank(), blank()];
    for (const band of spec.bands) {
      out[band.slot] = cutBand(img, band, scale, dx, dy);
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * The scenes that have a painting waiting for them.
 *
 * Keyed by plate set, so a scene picks up its painting through the field it
 * already carries and nothing has to be wired twice. A plate set that is not
 * listed, or whose file is missing, keeps its procedural painter.
 */
export const SCENERY: Record<string, ScenerySpec> = {
  vernon: { src: ['plates/vernon.jpg', 'plates/vernon.png'], horizon: 0.34, bands: DEFAULT_BANDS },
  camp: { src: ['plates/camp.jpg', 'plates/camp.png'], horizon: 0.34, bands: DEFAULT_BANDS },
  lines: { src: ['plates/lines.jpg', 'plates/lines.png'], horizon: 0.34, bands: DEFAULT_BANDS },
  // An interior has no horizon in the landscape sense; the wall foot does the
  // same job, and the default bands still describe it — wall above, floor below.
  parlour: { src: ['plates/parlour.jpg', 'plates/parlour.png'], horizon: 0.34, bands: DEFAULT_BANDS },
};
