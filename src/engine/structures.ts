/**
 * Buildings.
 *
 * A structure is a box with a texture per face and a roof on top. The textures
 * are generated at 32 pixels per world tile, so a facade five tiles wide is a
 * 160px canvas and every clapboard, sash bar and window light is an actual
 * pixel rather than a decal stretched over a wall.
 *
 * The mansion's siding is the one piece of period detail worth insisting on:
 * it is pine, bevelled and blocked out to look like ashlar masonry, painted,
 * and then sand was thrown at the wet paint so it would read as cut stone. It
 * is a very deliberate lie told by a man who wanted a stone house and had a
 * forest. A student who examines it is told exactly that.
 */

import {
  hash, hline, px, rect, shade, speckle, stroke, surface, vline, type Surface,
} from './pixels';
import { P } from '../palette';

export const PPT = 32;   // pixels per tile

export type WallStyle =
  | 'rusticated'    // the mansion: sand-painted pine cut to look like stone
  | 'clapboard'     // the outbuildings
  | 'brick'
  | 'log'           // the quarter
  | 'frameOpen'     // the north wing: studs and sheathing, no siding yet
  | 'plaster'       // interior
  | 'panelled'      // interior, a fine room in Virginia
  | 'papered'       // interior, a merchant's room in New England
  | 'boarded'       // interior, feather-edged sheathing: a plain room
  | 'wash';         // interior, limewashed

export interface Opening {
  /** Tile offset along the face, from the left. */
  at: number;
  kind: 'window' | 'door' | 'doorway' | 'venetian' | 'roundel' | 'none';
  /** Storey, 0 = ground. */
  storey?: number;
}

export interface FacadeOpts {
  style: WallStyle;
  /** In tiles. */
  wide: number;
  /** In tiles. */
  high: number;
  openings?: Opening[];
  /** Draw a moulded cornice along the top. */
  cornice?: boolean;
  /** Draw a plinth / water table along the bottom. */
  plinth?: boolean;
  /** Storey height in tiles. Governs where upper windows land. */
  storeyH?: number;
  seed?: number;
  /**
   * Override the wall's body colour.
   *
   * `wallInterior` has taken a tint since it was written and nothing ever
   * passed one, so every interior in the game came out the same shade of
   * plaster. It is the cheapest single lever there is for making one house
   * not look like another house.
   */
  tint?: string;
}

/* ---------------------------------------------------------------------- *
 * Wall surfaces
 * ---------------------------------------------------------------------- */

/**
 * Rustication, drawn as boards, not as a brick wall.
 *
 * The real thing at Mount Vernon is long horizontal boards, bevelled at the
 * bottom edge to throw a shadow line and read as a course of cut stone from a
 * distance — sand thrown into the wet paint on top of that. What it is NOT is
 * masonry: no staggered joints, no unit smaller than the wall is wide. The
 * first version of this function drew a broken-jointed block bond — the
 * coursing pattern of a BRICK wall, not a board wall — and at this pixel
 * count that pattern reads as the material, whatever the colour says. Every
 * course here now runs the full width of the wall, the way a board does.
 */
function sidingRusticated(g: CanvasRenderingContext2D, w: number, h: number, seed: number): void {
  rect(g, 0, 0, w, h, P.rust);
  const bh = 11;
  for (let row = 0; row * bh < h; row++) {
    const y = row * bh;
    const tone = hash(0, row, seed) < 0.3 ? shade(P.rust, -0.03) : P.rust;
    rect(g, 0, y, w, bh - 1, tone);
    // The lit top edge and the shadow the bevel throws underneath — this is
    // what carries "board," and it runs the length of the course, unbroken.
    hline(g, 0, y, w, P.rustL);
    hline(g, 0, y + bh - 2, w, P.rustD);
    // A rustication score: a shallow scribed line further down each board,
    // the thing that makes a flat board read as a worked stone face without
    // cutting the board itself into pieces.
    if (bh > 8) hline(g, 0, y + Math.round(bh * 0.55), w, shade(P.rust, -0.02));
    // Butt joints, at realistic board lengths and staggered a full board so
    // no two rows joint at the same point — a broken bond in the LONG
    // direction only, which real coursed siding also does.
    const boardLen = 130 + Math.round(hash(row, seed, 3) * 40);
    const off = (row % 2) * (boardLen / 2);
    for (let x = -off; x < w; x += boardLen) {
      if (x > 0) vline(g, x, y, bh - 1, P.rustD);
    }
  }
  // The sand. This is the whole texture and it has to be visible at 80px.
  speckle(g, 0, 0, w, h, P.rustD, 0.11, seed + 1);
  speckle(g, 0, 0, w, h, shade(P.rustL, 0.1), 0.08, seed + 2);
}

function sidingClapboard(g: CanvasRenderingContext2D, w: number, h: number, seed: number): void {
  rect(g, 0, 0, w, h, P.rustD);
  for (let y = 0; y < h; y += 7) {
    rect(g, 0, y, w, 6, hash(0, y, seed) < 0.35 ? shade(P.rust, -0.05) : P.rust);
    hline(g, 0, y, w, P.rustL);
    hline(g, 0, y + 6, w, P.rustD);
  }
  speckle(g, 0, 0, w, h, P.rustD, 0.05, seed);
}

function sidingBrick(g: CanvasRenderingContext2D, w: number, h: number, seed: number): void {
  rect(g, 0, 0, w, h, shade(P.brickD, -0.1));
  for (let row = 0; row * 7 < h; row++) {
    const off = (row % 2) * 8;
    for (let x = -16; x < w; x += 16) {
      rect(g, x + off, row * 7, 15, 6, hash(x, row, seed) < 0.35 ? shade(P.brick, -0.12) : P.brick);
      hline(g, x + off, row * 7, 15, shade(P.brick, 0.14));
    }
  }
}

function sidingLog(g: CanvasRenderingContext2D, w: number, h: number, seed: number): void {
  rect(g, 0, 0, w, h, P.mudD);
  for (let y = 0; y < h; y += 13) {
    rect(g, 0, y, w, 11, P.trunk);
    hline(g, 0, y, w, P.trunkL);
    hline(g, 0, y + 10, w, P.trunkD);
    for (let x = 0; x < w; x += 3) if (hash(x, y, seed) < 0.25) vline(g, x, y + 2, 7, P.trunkD);
    // Chinked with clay between the courses.
    rect(g, 0, y + 11, w, 2, P.mudD);
    speckle(g, 0, y + 11, w, 2, P.mud, 0.3, seed + y);
  }
}

function sidingFrameOpen(g: CanvasRenderingContext2D, w: number, h: number, seed: number): void {
  // The north wing in May 1775: framed, sheathed in places, open in others.
  // The gaps are transparent, so you see straight through the unfinished end
  // of the house — which is the single most useful thing this file draws.
  for (let x = 0; x < w; x += 18) {
    rect(g, x, 0, 7, h, P.pine);
    vline(g, x, 0, h, P.pineL);
    vline(g, x + 6, 0, h, P.pineD);
    for (let y = 0; y < h; y++) if (hash(x, y, seed) < 0.08) px(g, x + 3, y, P.pineD);
  }
  // Girts and a plate.
  for (const y of [0, Math.round(h * 0.45), h - 8]) rect(g, 0, y, w, 8, P.pine);
  hline(g, 0, 0, w, P.pineL);
  // Some sheathing already nailed on, at the bottom, in bands.
  for (let y = Math.round(h * 0.55); y < h - 8; y += 9) {
    if (hash(0, y, seed + 3) < 0.55) {
      rect(g, 0, y, w, 8, P.pineD);
      hline(g, 0, y, w, P.pine);
    }
  }
}

function wallInterior(g: CanvasRenderingContext2D, w: number, h: number, style: WallStyle, seed: number, tint?: string): void {
  const body = tint ?? (style === 'wash' ? P.plasterL : P.plaster);
  rect(g, 0, 0, w, h, body);
  speckle(g, 0, 0, w, h, shade(body, -0.06), 0.10, seed);
  speckle(g, 0, 0, w, h, shade(body, 0.08), 0.06, seed + 1);
  if (style === 'papered') {
    /*
     * PRINTED PAPER, which is the single most legible way to say "this is
     * not Virginia".
     *
     * English printed paper was a Boston merchant's status object in the
     * 1770s — imported, taxed, and hung in the best room. It is a
     * completely different surface from Virginia fielded panelling: no
     * dado, no stiles, no rails, just a repeat running the full height with
     * a printed border at the top where a cornice would be.
     *
     * The repeat is drawn, not sampled, and it is a damask-ish lozenge
     * because that is what survives in the collections. Never letters.
     */
    const rep = 22;
    for (let y = -rep; y < h + rep; y += rep) {
      for (let x = ((y / rep) % 2) * (rep / 2); x < w + rep; x += rep) {
        const cx = Math.round(x), cy = Math.round(y);
        // A lozenge, hatched, and a small flower at the crossing points.
        for (let k = 0; k <= 7; k++) {
          px(g, cx + k, cy - 7 + k, shade(body, -0.16));
          px(g, cx + k, cy + 7 - k, shade(body, -0.16));
          px(g, cx - k, cy - 7 + k, shade(body, -0.16));
          px(g, cx - k, cy + 7 - k, shade(body, -0.16));
        }
        for (let k = 0; k <= 3; k++) {
          px(g, cx + k, cy - 3 + k, shade(body, 0.14));
          px(g, cx - k, cy + 3 - k, shade(body, 0.14));
        }
        px(g, cx, cy, shade(body, 0.22));
      }
    }
    // The printed border, at the top, in place of a cornice.
    rect(g, 0, 0, w, 7, shade(body, -0.24));
    hline(g, 0, 0, w, shade(body, 0.18));
    hline(g, 0, 6, w, shade(body, 0.18));
    for (let x = 2; x < w; x += 6) { px(g, x, 3, shade(body, 0.26)); px(g, x + 3, 3, shade(body, -0.34)); }
    // Seams, every roll width. Paper came in strips and you could see it.
    for (let x = 0; x < w; x += 44) vline(g, x, 7, h - 13, shade(body, -0.09));
  }
  if (style === 'boarded') {
    // Feather-edged horizontal sheathing: a plain room, a farmhouse, a
    // barracks. Cheap, quick, and nothing like a panelled parlour.
    for (let y = 4; y < h - 6; y += 9) {
      rect(g, 0, y, w, 8, hash(0, y, seed) < 0.4 ? shade(body, -0.07) : body);
      hline(g, 0, y, w, shade(body, 0.16));
      hline(g, 0, y + 7, w, shade(body, -0.20));
      for (let x = 0; x < w; x++) if (hash(x, y, seed + 5) < 0.06) px(g, x, y + 3, shade(body, -0.18));
    }
    // Nails at the studs.
    for (let x = 7; x < w; x += 32) {
      for (let y = 8; y < h - 8; y += 9) px(g, x, y, shade(body, -0.32));
    }
  }
  if (style === 'panelled') {
    // Dado, chair rail, and fielded panels above — a fine room in 1775.
    const dado = Math.round(h * 0.42);
    rect(g, 0, dado, w, h - dado, shade(body, -0.12));
    hline(g, 0, dado, w, shade(body, 0.25));
    hline(g, 0, dado + 2, w, shade(body, -0.3));
    for (let x = 6; x < w - 10; x += 40) {
      stroke(g, x, dado + 8, 32, h - dado - 16, shade(body, -0.25));
      stroke(g, x + 2, dado + 10, 28, h - dado - 20, shade(body, 0.2));
    }
    for (let x = 8; x < w - 12; x += 46) {
      stroke(g, x, 10, 38, dado - 22, shade(body, -0.22));
      stroke(g, x + 2, 12, 34, dado - 26, shade(body, 0.18));
    }
    hline(g, 0, 4, w, shade(body, 0.3));
    hline(g, 0, 6, w, shade(body, -0.25));
  }
  // Skirting, always.
  rect(g, 0, h - 6, w, 6, shade(body, -0.22));
  hline(g, 0, h - 6, w, shade(body, 0.2));
}

/* ---------------------------------------------------------------------- *
 * Openings
 * ---------------------------------------------------------------------- */

function sash(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lit: boolean): void {
  // Architrave.
  rect(g, x - 3, y - 3, w + 6, h + 6, P.trimD);
  rect(g, x - 2, y - 2, w + 4, h + 4, P.trim);
  hline(g, x - 3, y - 3, w + 6, P.trimL);
  // Glass, dark against a lit wall — a window reads as a hole, not a mirror.
  rect(g, x, y, w, h, lit ? P.glassL : P.glassDark);
  rect(g, x, y, w, Math.round(h * 0.5), lit ? P.glass : shade(P.glassDark, 0.08));
  // Twelve lights over twelve. Muntins are one pixel and they matter.
  const cols = 3, rows = 4;
  for (let i = 1; i < cols; i++) vline(g, x + Math.round((w * i) / cols), y, h, P.trimL);
  for (let j = 1; j < rows * 2; j++) hline(g, x, y + Math.round((h * j) / (rows * 2)), w, P.trimL);
  hline(g, x, y + Math.round(h / 2), w, P.trim);
  // A reflection band in the upper sash, which is what makes glass read as glass.
  rect(g, x + 1, y + 2, Math.round(w * 0.4), 3, shade(P.glassL, 0.2));
  rect(g, x - 4, y + h + 3, w + 8, 3, P.trimD);
  hline(g, x - 4, y + h + 3, w + 8, P.trimL);
}

function doorLeaf(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, open: boolean): void {
  rect(g, x - 4, y - 4, w + 8, h + 4, P.trimD);
  rect(g, x - 3, y - 3, w + 6, h + 3, P.trim);
  if (open) {
    // A doorway you can see into. Dark, and slightly warm at the bottom.
    rect(g, x, y, w, h, shade(P.blackD, -0.3));
    rect(g, x, y + h - 8, w, 8, shade(P.brownD, -0.3));
    return;
  }
  rect(g, x, y, w, h, P.greenD);
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {
      const pw = Math.round((w - 12) / 2), ph = Math.round((h - 20) / 3);
      const px0 = x + 4 + i * (pw + 4), py0 = y + 5 + j * (ph + 4);
      stroke(g, px0, py0, pw, ph, shade(P.greenD, -0.3));
      rect(g, px0 + 1, py0 + 1, pw - 2, ph - 2, P.green);
      hline(g, px0 + 1, py0 + 1, pw - 2, P.greenL);
    }
  }
  px(g, x + w - 5, y + Math.round(h * 0.55), P.buffL);
  // Fanlight over the door.
  rect(g, x - 2, y - 9, w + 4, 6, P.glassDark);
  for (let i = 1; i < 5; i++) vline(g, x - 2 + Math.round(((w + 4) * i) / 5), y - 9, 6, P.trimL);
  hline(g, x - 4, y - 11, w + 8, P.trimL);
}

/**
 * A whole face of a building, generated at 32px/tile.
 */
export function facade(o: FacadeOpts): Surface {
  const w = Math.round(o.wide * PPT);
  const h = Math.round(o.high * PPT);
  const seed = o.seed ?? 7;
  const s = surface(w, h);
  const g = s.g;

  switch (o.style) {
    case 'rusticated': sidingRusticated(g, w, h, seed); break;
    case 'clapboard': sidingClapboard(g, w, h, seed); break;
    case 'brick': sidingBrick(g, w, h, seed); break;
    case 'log': sidingLog(g, w, h, seed); break;
    case 'frameOpen': sidingFrameOpen(g, w, h, seed); break;
    default: wallInterior(g, w, h, o.style, seed, o.tint); break;
  }

  if (o.plinth) {
    rect(g, 0, h - 12, w, 12, shade(P.rustD, -0.12));
    hline(g, 0, h - 12, w, P.rustL);
    speckle(g, 0, h - 12, w, 12, P.stoneD, 0.12, seed);
  }
  if (o.cornice) {
    rect(g, 0, 0, w, 9, P.trim);
    hline(g, 0, 0, w, P.trimL);
    hline(g, 0, 4, w, P.trimD);
    rect(g, 0, 7, w, 3, P.trimD);
    // Modillions under the eaves, spaced by the tile grid.
    for (let x = 6; x < w; x += 14) rect(g, x, 7, 6, 4, P.trimL);
  }

  const storeyH = (o.storeyH ?? 2.2) * PPT;
  for (const op of o.openings ?? []) {
    const cx = Math.round(op.at * PPT);
    const storey = op.storey ?? 0;
    // Storeys are counted from the ground up; the canvas runs top-down.
    const floorY = h - 10 - storey * storeyH;
    if (op.kind === 'window') {
      const ww = Math.round(PPT * 0.60), hh = Math.round(PPT * 1.00);
      sash(g, cx - ww / 2, floorY - hh - Math.round(PPT * 0.40), ww, hh, false);
    } else if (op.kind === 'door' || op.kind === 'doorway') {
      const ww = Math.round(PPT * 0.85), hh = Math.round(PPT * 1.55);
      doorLeaf(g, cx - ww / 2, floorY - hh, ww, hh, op.kind === 'doorway');
    } else if (op.kind === 'venetian') {
      // The New Room's great window — the one architectural set-piece at
      // Mount Vernon, and in 1775 it is a hole in a frame with no glass in it.
      const ww = Math.round(PPT * 1.9), hh = Math.round(PPT * 1.5);
      const x0 = cx - ww / 2, y0 = floorY - hh - Math.round(PPT * 0.4);
      rect(g, x0 - 4, y0 - 4, ww + 8, hh + 8, P.pineD);
      rect(g, x0, y0, ww, hh, shade(P.blackD, -0.2));
      rect(g, x0 + ww * 0.36, y0 - 10, ww * 0.28, hh + 10, shade(P.blackD, -0.2));
      vline(g, x0 + ww * 0.34, y0 - 8, hh + 8, P.pine);
      vline(g, x0 + ww * 0.64, y0 - 8, hh + 8, P.pine);
    } else if (op.kind === 'roundel') {
      const r = Math.round(PPT * 0.45);
      for (let yy = -r; yy <= r; yy++) {
        const ww = Math.round(Math.sqrt(Math.max(0, r * r - yy * yy)));
        hline(g, cx - ww, floorY - storeyH * 0.6 + yy, ww * 2, P.glassDark);
      }
      for (let a = 0; a < 8; a++) {
        const th = (a / 8) * Math.PI;
        vline(g, cx + Math.round(Math.cos(th) * r * 0.7), floorY - storeyH * 0.6 - r * 0.7, Math.round(r * 1.4), P.trimL);
      }
    }
  }
  return s;
}

/** Shingles, for every roof on the estate. */
export function roofTexture(seed = 3): Surface {
  const s = surface(64, 64);
  const g = s.g;
  rect(g, 0, 0, 64, 64, P.roofD);
  for (let row = 0; row * 6 < 64; row++) {
    const off = (row % 2) * 5;
    for (let x = -10; x < 64; x += 10) {
      const tone = hash(x, row, seed) < 0.3 ? shade(P.roof, -0.10)
        : hash(x, row, seed + 1) < 0.2 ? shade(P.roof, 0.08) : P.roof;
      rect(g, x + off, row * 6, 9, 5, tone);
      hline(g, x + off, row * 6, 9, P.roofL);
      vline(g, x + off, row * 6, 5, P.roofD);
    }
  }
  speckle(g, 0, 0, 64, 64, P.roofD, 0.08, seed);
  // Moss, on the north pitch. It reappears in Act 8 and it should be findable.
  speckle(g, 0, 40, 64, 24, shade(P.leafD, -0.1), 0.05, seed + 9);
  return s;
}

/** A chimney stack, four faces the same. */
export function chimneyTexture(): Surface {
  const s = surface(32, 96);
  const g = s.g;
  sidingBrick(g, 32, 96, 5);
  rect(g, 0, 0, 32, 7, shade(P.brick, 0.12));
  hline(g, 0, 0, 32, P.brickL);
  hline(g, 0, 6, 32, shade(P.brickD, -0.2));
  speckle(g, 0, 0, 32, 10, P.blackD, 0.2, 2);
  return s;
}

/** Ceiling, seen from below in an interior. Plain, with a joist rhythm. */
export function ceilingTexture(): Surface {
  const s = surface(64, 64);
  rect(s.g, 0, 0, 64, 64, P.plasterD);
  speckle(s.g, 0, 0, 64, 64, shade(P.plasterD, -0.08), 0.08, 1);
  for (let y = 0; y < 64; y += 16) hline(s.g, 0, y, 64, shade(P.plasterD, -0.1));
  return s;
}
