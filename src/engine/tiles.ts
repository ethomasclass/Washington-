/**
 * The ground: one atlas of 32x32 pixel tiles, four variants each.
 *
 * Four variants is the number. One repeats visibly at this camera pitch, two
 * reads as a checkerboard, eight is indistinguishable from four and costs
 * texture. The variant is chosen by `hash(col, row)`, so the same map always
 * lays out the same way and nothing crawls between frames.
 *
 * Texture, not colour, carries the material. A gravel drive is gravel because
 * somebody scattered stones on it, not because it is a slightly different grey
 * from the lawn — that is the same rule the print direction had about hatching,
 * and it is the one part of that document that survives contact with pixels.
 */

import { hash, hline, px, rect, shade, speckle, surface, vline, type Surface } from './pixels';
import { P } from '../palette';

export const TILE_PX = 32;
export const VARIANTS = 4;

export type TileId =
  | 'grass' | 'lawn' | 'meadow' | 'gravel' | 'dirt' | 'mud' | 'sand' | 'shallow' | 'water'
  | 'flag' | 'brickyard' | 'site' | 'garden' | 'board' | 'painted' | 'kitchenfloor'
  | 'deck' | 'cellar' | 'carpet' | 'straw';

/** Draw order in the atlas. Index is the row. */
export const TILE_ORDER: TileId[] = [
  'grass', 'lawn', 'meadow', 'gravel', 'dirt', 'mud', 'sand', 'shallow', 'water',
  'flag', 'brickyard', 'site', 'garden', 'board', 'painted', 'kitchenfloor',
  'deck', 'cellar', 'carpet', 'straw',
];

export const TILE_INDEX: Record<TileId, number> = Object.fromEntries(
  TILE_ORDER.map((t, i) => [t, i]),
) as Record<TileId, number>;

/** Whether a tile can be stood on at all, before any object layer is applied. */
export const TILE_SOLID: Partial<Record<TileId, boolean>> = { water: true };

/** Tiles that ripple. The renderer scrolls their UVs a little. */
export const TILE_LIQUID: Partial<Record<TileId, boolean>> = { water: true, shallow: true };

type Ramp = readonly [string, string, string];

function base(g: CanvasRenderingContext2D, r: Ramp, v: number): void {
  rect(g, 0, 0, TILE_PX, TILE_PX, r[1]);
  speckle(g, 0, 0, TILE_PX, TILE_PX, r[0], 0.10, v * 31 + 1);
  speckle(g, 0, 0, TILE_PX, TILE_PX, r[2], 0.07, v * 31 + 2);
}

/** Blades: short vertical ticks, two values, denser at the bottom of the tile. */
function blades(g: CanvasRenderingContext2D, r: Ramp, v: number, density: number, len: number): void {
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const h = hash(x, y, v * 97 + 5);
      if (h > density) continue;
      const c = h < density * 0.45 ? r[2] : r[0];
      const l = 1 + Math.floor(h * len * 3);
      vline(g, x, y, l, c);
    }
  }
}

function drawTile(id: TileId, v: number): Surface {
  const s = surface(TILE_PX, TILE_PX);
  const g = s.g;
  switch (id) {
    case 'grass': {
      base(g, [P.grassD, P.grass, P.grassL], v);
      blades(g, [P.grassD, P.grass, P.grassL], v, 0.16, 1);
      // The odd dandelion. One tile in four gets one, which is enough.
      if (v === 2) { px(g, 9, 20, P.buffL); px(g, 22, 7, P.buffL); }
      break;
    }
    case 'lawn': {
      // Mown and rolled. Washington laid this out himself and the game should
      // be able to say so: the roller leaves bands.
      base(g, [P.lawnD, P.lawn, P.lawnL], v);
      // The roller leaves bands. Keep them faint: at 0.06 the four variants
      // tiled into a visible checkerboard across the whole bowling green.
      for (let y = (v % 2) * 8; y < TILE_PX; y += 16) {
        rect(g, 0, y, TILE_PX, 8, shade(P.lawn, 0.028));
      }
      blades(g, [P.lawnD, P.lawn, P.lawnL], v, 0.08, 0);
      break;
    }
    case 'meadow': {
      base(g, [P.grassD, shade(P.grass, -0.06), P.leafDry], v);
      blades(g, [P.grassD, P.grass, P.leafDry], v, 0.26, 2);
      break;
    }
    case 'gravel': {
      base(g, [P.gravelD, P.gravel, P.gravelL], v);
      for (let i = 0; i < 40; i++) {
        const x = Math.floor(hash(i, v, 11) * TILE_PX);
        const y = Math.floor(hash(i, v, 12) * TILE_PX);
        const w = 1 + Math.floor(hash(i, v, 13) * 2);
        rect(g, x, y, w, 1, hash(i, v, 14) < 0.5 ? P.gravelD : P.gravelL);
      }
      break;
    }
    case 'dirt': {
      base(g, [P.dirtD, P.dirt, P.dirtL], v);
      // Ruts, broken. A continuous line every eleven pixels reads as a plank
      // floor from above, which is what the Quarter's yard looked like before
      // this was broken up.
      for (let x = 5 + (v % 3) * 4; x < TILE_PX; x += 13) {
        for (let y = 0; y < TILE_PX; y++) {
          if (hash(x, y, v + 7) < 0.55) continue;
          px(g, x, y, P.dirtD);
          px(g, x + 1, y, shade(P.dirtD, -0.08));
        }
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.gravel, 0.07, v + 21);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.dirtL, 0.06, v + 22);
      break;
    }
    case 'mud': {
      base(g, [P.mudD, P.mud, P.mudL], v);
      for (let i = 0; i < 6; i++) {
        const x = Math.floor(hash(i, v, 31) * 26), y = Math.floor(hash(i, v, 32) * 26);
        rect(g, x, y, 5, 3, P.mudD);
        hline(g, x, y, 5, shade(P.water, -0.1));
      }
      break;
    }
    case 'sand': {
      base(g, [P.sandD, P.sand, P.sandL], v);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.gravelD, 0.04, v + 41);
      break;
    }
    case 'shallow': {
      base(g, [P.waterD, shade(P.water, 0.12), P.waterL], v);
      for (let y = 2 + v * 3; y < TILE_PX; y += 9) hline(g, 0, y, TILE_PX, P.foam);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.sand, 0.06, v + 51);
      break;
    }
    case 'water': {
      rect(g, 0, 0, TILE_PX, TILE_PX, P.water);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.waterD, 0.12, v + 61);
      // Broken horizontal glints. Bloom picks these up and does the rest.
      for (let i = 0; i < 7; i++) {
        const x = Math.floor(hash(i, v, 71) * 24);
        const y = Math.floor(hash(i, v, 72) * TILE_PX);
        hline(g, x, y, 3 + Math.floor(hash(i, v, 73) * 5), P.waterL);
        if (hash(i, v, 74) < 0.4) hline(g, x + 1, y - 1, 3, P.foam);
      }
      break;
    }
    case 'flag': {
      rect(g, 0, 0, TILE_PX, TILE_PX, P.stone);
      // Irregular flags, so the paving reads as laid rather than tiled.
      const cuts = [0, 13, 22, TILE_PX];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const x0 = cuts[i] + (i ? 1 : 0), y0 = cuts[j] + (j ? 1 : 0);
          const w = cuts[i + 1] - x0, h = cuts[j + 1] - y0;
          const tone = hash(i, j, v * 7) < 0.5 ? P.stone : shade(P.stone, hash(i, j, v * 9) * 0.12 - 0.06);
          rect(g, x0, y0, w, h, tone);
          hline(g, x0, y0, w, P.stoneL);
          vline(g, x0 + w - 1, y0, h, P.stoneD);
          speckle(g, x0, y0, w, h, P.stoneD, 0.05, v + i + j);
        }
      }
      break;
    }
    case 'brickyard': {
      rect(g, 0, 0, TILE_PX, TILE_PX, P.brickD);
      for (let row = 0; row < 8; row++) {
        const off = (row % 2) * 8 + (v % 2) * 4;
        for (let cx = -8; cx < TILE_PX; cx += 16) {
          const x = cx + off;
          rect(g, x, row * 4, 15, 3, hash(x, row, v) < 0.3 ? shade(P.brick, -0.1) : P.brick);
          hline(g, x, row * 4, 15, shade(P.brick, 0.12));
        }
      }
      break;
    }
    case 'site': {
      // Trampled earth, sawdust, wood chips. The building site's floor.
      base(g, [P.dirtD, shade(P.dirt, -0.05), P.dirtL], v);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.pineL, 0.09, v + 81);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.pine, 0.06, v + 82);
      for (let i = 0; i < 4; i++) {
        const x = Math.floor(hash(i, v, 91) * 26), y = Math.floor(hash(i, v, 92) * 28);
        rect(g, x, y, 4, 2, P.pine);
        hline(g, x, y, 4, P.pineL);
      }
      break;
    }
    case 'garden': {
      base(g, [P.dirtD, P.dirt, P.dirtL], v);
      for (let x = 3; x < TILE_PX; x += 7) {
        vline(g, x, 0, TILE_PX, P.mudD);
        for (let y = (v * 3) % 6; y < TILE_PX; y += 6) {
          px(g, x, y, P.leafL); px(g, x - 1, y + 1, P.leaf); px(g, x + 1, y + 1, P.leaf);
        }
      }
      break;
    }
    case 'board': {
      // Wide pine boards, the mansion's floors. Grain runs one way per tile.
      rect(g, 0, 0, TILE_PX, TILE_PX, P.floorB);
      for (let y = 0; y < TILE_PX; y += 8) {
        hline(g, 0, y, TILE_PX, P.floorD);
        hline(g, 0, y + 1, TILE_PX, shade(P.floorB, 0.08));
        for (let x = 0; x < TILE_PX; x++) {
          if (hash(x, y, v * 13) < 0.10) px(g, x, y + 3 + Math.floor(hash(x, y, v) * 4), P.floorD);
        }
        // Nail heads at the joists.
        px(g, 5 + (v % 3) * 9, y + 1, shade(P.floorD, -0.3));
      }
      break;
    }
    case 'painted': {
      // A painted-canvas floorcloth — what a fine room had before carpets.
      rect(g, 0, 0, TILE_PX, TILE_PX, P.plaster);
      for (let y = 0; y < TILE_PX; y += 16) {
        for (let x = 0; x < TILE_PX; x += 16) {
          const dark = ((x / 16 + y / 16) % 2) === 0;
          rect(g, x, y, 16, 16, dark ? shade(P.ochreWall, 0.1) : P.plasterL);
          rect(g, x, y, 16, 1, shade(P.ochreWallD, 0.1));
        }
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.plasterD, 0.05, v);
      break;
    }
    case 'kitchenfloor': {
      rect(g, 0, 0, TILE_PX, TILE_PX, shade(P.brickD, 0.05));
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const x = col * 8, y = row * 8;
          rect(g, x, y, 7, 7, hash(col, row, v) < 0.4 ? shade(P.brick, -0.12) : P.brick);
          hline(g, x, y, 7, shade(P.brick, 0.14));
        }
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.blackD, 0.06, v + 3);  // soot
      break;
    }
    case 'deck': {
      rect(g, 0, 0, TILE_PX, TILE_PX, P.woodD);
      for (let x = 0; x < TILE_PX; x += 10) {
        rect(g, x, 0, 9, TILE_PX, hash(x, v, 5) < 0.4 ? shade(P.wood, -0.08) : P.wood);
        vline(g, x, 0, TILE_PX, P.woodD);
        vline(g, x + 1, 0, TILE_PX, P.woodL);
        speckle(g, x, 0, 9, TILE_PX, P.woodD, 0.06, v + x);
      }
      // Gaps you can see the river through.
      for (let x = 9; x < TILE_PX; x += 10) vline(g, x, 0, TILE_PX, shade(P.waterD, -0.2));
      break;
    }
    case 'cellar': {
      base(g, [shade(P.mudD, -0.15), P.mudD, P.mud], v);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.stoneD, 0.05, v);
      break;
    }
    case 'carpet': {
      rect(g, 0, 0, TILE_PX, TILE_PX, P.wine);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.wineD, 0.14, v);
      for (let y = 4; y < TILE_PX; y += 12) {
        for (let x = 4 + ((y / 12) % 2) * 6; x < TILE_PX; x += 12) {
          px(g, x, y, P.buff); px(g, x + 1, y + 1, P.buffD);
          px(g, x - 1, y + 1, P.buffD); px(g, x, y + 2, P.buff);
        }
      }
      break;
    }
    case 'straw': {
      base(g, [P.sandD, shade(P.sand, -0.05), P.buffL], v);
      for (let i = 0; i < 30; i++) {
        const x = Math.floor(hash(i, v, 101) * 28), y = Math.floor(hash(i, v, 102) * 30);
        const len = 3 + Math.floor(hash(i, v, 103) * 4);
        if (hash(i, v, 104) < 0.5) hline(g, x, y, len, P.buffL);
        else vline(g, x, y, len, P.sandD);
      }
      break;
    }
  }
  return s;
}

let ATLAS: Surface | null = null;

/** The whole ground atlas: VARIANTS across, one row per tile type. */
export function tileAtlas(): Surface {
  if (ATLAS) return ATLAS;
  const s = surface(TILE_PX * VARIANTS, TILE_PX * TILE_ORDER.length);
  TILE_ORDER.forEach((id, row) => {
    for (let v = 0; v < VARIANTS; v++) {
      s.g.drawImage(drawTile(id, v).canvas, v * TILE_PX, row * TILE_PX);
    }
  });
  ATLAS = s;
  return s;
}

/** UV rect for one tile, in atlas space. */
export function tileUV(id: TileId, variant: number): [number, number, number, number] {
  const row = TILE_INDEX[id];
  const u = (variant % VARIANTS) / VARIANTS;
  const v = row / TILE_ORDER.length;
  return [u, v, 1 / VARIANTS, 1 / TILE_ORDER.length];
}

/**
 * The vertical face of a height step — a cut bank, a retaining wall, a wharf
 * edge. One texture, tiled, and the map picks between earth and stone.
 */
export function riserTexture(kind: 'earth' | 'stone' | 'timber'): Surface {
  const s = surface(TILE_PX, TILE_PX);
  const g = s.g;
  if (kind === 'earth') {
    rect(g, 0, 0, TILE_PX, TILE_PX, P.dirtD);
    speckle(g, 0, 0, TILE_PX, TILE_PX, shade(P.dirtD, -0.18), 0.16, 1);
    speckle(g, 0, 0, TILE_PX, TILE_PX, P.dirt, 0.10, 2);
    hline(g, 0, 0, TILE_PX, P.grassD);
    hline(g, 0, 1, TILE_PX, shade(P.grassD, -0.15));
    for (let x = 0; x < TILE_PX; x += 3) if (hash(x, 0, 9) < 0.5) vline(g, x, 2, 2 + Math.floor(hash(x, 1, 9) * 3), P.grassD);
  } else if (kind === 'stone') {
    rect(g, 0, 0, TILE_PX, TILE_PX, P.stoneD);
    for (let row = 0; row < 4; row++) {
      const off = (row % 2) * 7;
      for (let x = -14; x < TILE_PX; x += 14) {
        rect(g, x + off, row * 8, 13, 7, hash(x, row, 3) < 0.4 ? shade(P.stone, -0.08) : P.stone);
        hline(g, x + off, row * 8, 13, P.stoneL);
      }
    }
  } else {
    rect(g, 0, 0, TILE_PX, TILE_PX, P.woodD);
    for (let x = 0; x < TILE_PX; x += 6) {
      rect(g, x, 0, 5, TILE_PX, hash(x, 0, 4) < 0.5 ? P.wood : shade(P.wood, -0.1));
      vline(g, x, 0, TILE_PX, P.woodD);
    }
  }
  return s;
}
