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

import {
  ellipse, hash, hline, px, rect, shade, speckle, surface, vline, type Surface,
} from './pixels';
import { P } from '../palette';

export const TILE_PX = 32;
export const VARIANTS = 4;

export type TileId =
  | 'grass' | 'lawn' | 'meadow' | 'gravel' | 'dirt' | 'mud' | 'sand' | 'shallow' | 'water'
  | 'flag' | 'brickyard' | 'site' | 'garden' | 'board' | 'painted' | 'kitchenfloor'
  | 'deck' | 'cellar' | 'carpet' | 'straw'
  // Cambridge, and the winter it turns into.
  | 'snow' | 'slush' | 'turf' | 'trampled' | 'ice'
  // New England indoors. A different house has to be a different house.
  | 'oakfloor' | 'marbled' | 'carpetBlue'
  // Brooklyn, and the Delaware.
  | 'marsh' | 'mudflat' | 'cobble' | 'plank' | 'furrow' | 'sleet'
  // Valley Forge, and the three states one camp goes through.
  | 'campmud' | 'hutfloor' | 'parade' | 'springturf' | 'sawdust';

/** Draw order in the atlas. Index is the row. */
export const TILE_ORDER: TileId[] = [
  'grass', 'lawn', 'meadow', 'gravel', 'dirt', 'mud', 'sand', 'shallow', 'water',
  'flag', 'brickyard', 'site', 'garden', 'board', 'painted', 'kitchenfloor',
  'deck', 'cellar', 'carpet', 'straw',
  'snow', 'slush', 'turf', 'trampled', 'ice',
  'oakfloor', 'marbled', 'carpetBlue',
  'marsh', 'mudflat', 'cobble', 'plank', 'furrow', 'sleet',
  'campmud', 'hutfloor', 'parade', 'springturf', 'sawdust',
];

export const TILE_INDEX: Record<TileId, number> = Object.fromEntries(
  TILE_ORDER.map((t, i) => [t, i]),
) as Record<TileId, number>;

/**
 * Whether a tile can be stood on at all, before any object layer is applied.
 *
 * Ice is solid, and that is a decision rather than an oversight. Whether the
 * Charles would bear a column of troops is the question the entire council of
 * war turns on, and it was never answered by anybody walking out to look:
 * Washington proposed the assault, the council refused it, and he abided. A
 * player who can stroll across to Charlestown has been handed the answer to
 * the act's central question by the collision system.
 */
export const TILE_SOLID: Partial<Record<TileId, boolean>> = { water: true, ice: true };

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

    /* ------------------------------------------------------------------
     * CAMBRIDGE IN WINTER.
     *
     * The whole difficulty with snow in a bloomed pixel renderer is that the
     * obvious drawing of it — a white tile — is a white tile, and a white
     * tile at bloom 0.3 is a light source. So none of these ever reaches
     * paper. `snow` tops out at snowL and gets its read from the drifts and
     * the blue shadow in the hollows, not from being bright.
     * ---------------------------------------------------------------- */
    case 'snow': {
      rect(g, 0, 0, TILE_PX, TILE_PX, P.snow);
      // Drifted hollows, lit crowns. Snow is a surface with a shape, and if
      // you draw it as a flat value it reads as fog.
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(hash(i, v, 111) * 26);
        const y = Math.floor(hash(i, v, 112) * 26);
        const w = 5 + Math.floor(hash(i, v, 113) * 8);
        rect(g, x, y, w, 3, P.snowD);
        hline(g, x, y, w, P.snowL);
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.snowL, 0.10, v + 114);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.snowD, 0.05, v + 115);
      // A blade of last year's grass through the crust, one tile in four.
      if (v === 1) { vline(g, 11, 18, 4, P.leafDry); vline(g, 24, 6, 3, P.leafDry); }
      break;
    }
    case 'slush': {
      // Where four thousand men have walked on it. This is the tile that does
      // most of the winter's work: the camp street is slush, not snow.
      base(g, [P.slushD, P.slush, P.slushL], v);
      for (let i = 0; i < 8; i++) {
        const x = Math.floor(hash(i, v, 121) * 26), y = Math.floor(hash(i, v, 122) * 28);
        rect(g, x, y, 4 + Math.floor(hash(i, v, 123) * 5), 2, P.mudD);
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.snowL, 0.08, v + 124);
      speckle(g, 0, 0, TILE_PX, TILE_PX, shade(P.slushD, -0.12), 0.06, v + 125);
      break;
    }
    case 'trampled': {
      // The summer camp's parade: beaten, dusty, and nothing grows on it.
      base(g, [shade(P.dirtD, -0.04), P.dirt, P.sandD], v);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.dirtD, 0.10, v + 131);
      // Boot prints, which is the one detail that says four thousand men.
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(hash(i, v, 132) * 28), y = Math.floor(hash(i, v, 133) * 28);
        rect(g, x, y, 3, 4, shade(P.dirtD, -0.10));
      }
      break;
    }
    case 'turf': {
      // Cut sods, stacked and beaten down — the top of a field work. Laid in
      // courses, because that is how a man with a spade actually does it.
      rect(g, 0, 0, TILE_PX, TILE_PX, P.turf);
      for (let row = 0; row < 4; row++) {
        const off = (row % 2) * 8 + (v % 2) * 4;
        for (let cx = -8; cx < TILE_PX; cx += 16) {
          const x = cx + off, y = row * 8;
          rect(g, x, y, 15, 7, hash(x, row, v) < 0.35 ? shade(P.turf, -0.08) : P.turf);
          hline(g, x, y, 15, P.turfL);
          vline(g, x, y, 7, P.turfD);
        }
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.grassD, 0.07, v + 141);
      break;
    }
    /* ------------------------------------------------------------------
     * NEW ENGLAND INDOORS.
     *
     * A borrowed loyalist house on Brattle Street should not be furnished
     * out of a Virginia planter's floor tiles, and the first build of it
     * was: the same wide pine boards, the same ochre floorcloth, the same
     * wine turkey carpet. Two rooms in two colonies eight hundred miles
     * apart looked like two rooms in the same house, which is a claim
     * about the eighteenth century that is simply not true.
     *
     * So: narrower and darker boards, a black-and-white diamond floorcloth
     * of the kind a Boston merchant imported to imitate marble paving, and
     * a blue-green carpet instead of a red one.
     * ---------------------------------------------------------------- */
    case 'oakfloor': {
      // Narrow quartered oak, laid tight. Half the board width of the
      // mansion's pine and a good deal darker, so the two never read alike.
      rect(g, 0, 0, TILE_PX, TILE_PX, shade(P.woodD, 0.06));
      for (let y = 0; y < TILE_PX; y += 5) {
        const tone = hash(0, y, v * 11) < 0.4 ? shade(P.wood, -0.10) : P.woodD;
        rect(g, 0, y, TILE_PX, 4, tone);
        hline(g, 0, y, TILE_PX, shade(P.wood, 0.10));
        for (let x = 0; x < TILE_PX; x++) {
          if (hash(x, y, v * 17) < 0.09) px(g, x, y + 1 + Math.floor(hash(x, y, v) * 3), shade(P.woodD, -0.18));
        }
      }
      // End joints, staggered, which is what says boards rather than lines.
      for (let y = 0; y < TILE_PX; y += 5) {
        const jx = Math.floor(hash(1, y, v * 23) * TILE_PX);
        vline(g, jx, y, 4, shade(P.woodD, -0.22));
      }
      break;
    }
    case 'marbled': {
      /*
       * A painted floorcloth in black and white diamonds — canvas, oiled,
       * and meant to be mistaken for marble paving at the far end of a
       * hall. Two colonial gentlemen, one of whom is at war with the other,
       * both trying to make a wooden floor look like Italy.
       *
       * Diamonds, not squares: a square checker is the Mount Vernon
       * floorcloth turned monochrome and would read as the same object.
       */
      rect(g, 0, 0, TILE_PX, TILE_PX, P.plasterL);
      for (let y = 0; y < TILE_PX; y++) {
        for (let x = 0; x < TILE_PX; x++) {
          // Manhattan distance on a rotated lattice makes a diamond grid.
          const d = (Math.abs(((x + y) % 32) - 16) + Math.abs(((x - y + 64) % 32) - 16));
          if (d < 16) px(g, x, y, shade(P.blackD, 0.06));
        }
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.plasterD, 0.06, v);
      // Wear. A floorcloth that has been walked on for fifteen years.
      speckle(g, 0, 0, TILE_PX, TILE_PX, shade(P.plaster, -0.05), 0.05, v + 9);
      break;
    }
    case 'carpetBlue': {
      // A turkey carpet in blue and green, not red — and the pattern is a
      // repeating lozenge rather than the mansion's scattered stars.
      rect(g, 0, 0, TILE_PX, TILE_PX, P.parlourD);
      speckle(g, 0, 0, TILE_PX, TILE_PX, shade(P.parlourD, -0.10), 0.14, v);
      for (let y = 2; y < TILE_PX; y += 8) {
        for (let x = 2 + ((y / 8) % 2) * 4; x < TILE_PX; x += 8) {
          for (let k = 0; k < 4; k++) {
            px(g, x + k, y + 3 - k, P.verdigris);
            px(g, x + k, y + 3 + k, P.verdigrisD);
            px(g, x + 6 - k, y + 3 - k, P.verdigris);
            px(g, x + 6 - k, y + 3 + k, P.verdigrisD);
          }
          px(g, x + 3, y + 3, P.buffD);
        }
      }
      // The border thread, which is what makes it a carpet and not a colour.
      for (let y = 0; y < TILE_PX; y += 16) hline(g, 0, y, TILE_PX, shade(P.parlour, 0.10));
      break;
    }
    /* ------------------------------------------------------------------
     * BROOKLYN AND THE DELAWARE.
     *
     * Two of these decide whether Act 3 works at all. `marsh` is Gowanus,
     * which is where a third of the Maryland line was lost and which most
     * students picture as a field — it is cordgrass standing in salt water,
     * and the tile has to have the water in it. `mudflat` is the same
     * ground twice a day at low tide, and it is the reason the timing of
     * the whole battle turns on a tide table.
     * ---------------------------------------------------------------- */
    case 'marsh': {
      // Standing water first, then cordgrass growing up out of it, so the
      // water shows through between the blades rather than sitting behind.
      base(g, [P.siltD, P.silt, P.marshD], v);
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(hash(i, v, 161) * 24), y = Math.floor(hash(i, v, 162) * 24);
        ellipse(g, x + 4, y + 4, 5, 3, shade(P.waterD, 0.06));
        hline(g, x, y + 2, 7, shade(P.waterL, -0.10));
      }
      // Cordgrass: tall, thin, and leaning one way — a marsh has a wind in it.
      for (let i = 0; i < 46; i++) {
        const x = Math.floor(hash(i, v, 163) * TILE_PX);
        const y = Math.floor(hash(i, v, 164) * TILE_PX);
        const len = 4 + Math.floor(hash(i, v, 165) * 7);
        const c = hash(i, v, 166) < 0.35 ? P.marshL : hash(i, v, 167) < 0.7 ? P.marsh : P.marshD;
        for (let k = 0; k < len; k++) px(g, x + Math.floor(k / 3), y - k, c);
      }
      break;
    }
    case 'mudflat': {
      // Low water. Ribbed by the tide, and the ribs run one way.
      base(g, [P.siltD, P.flat, P.flatL], v);
      for (let y = (v * 2) % 5; y < TILE_PX; y += 5) {
        for (let x = 0; x < TILE_PX; x++) {
          const yy = y + Math.round(Math.sin((x + v * 8) * 0.35) * 1.5);
          px(g, x, yy, P.flatD);
          px(g, x, yy + 1, shade(P.flatL, 0.06));
        }
      }
      // Shell and weed, which is what a flat is actually covered in.
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.plasterD, 0.05, v + 168);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.marshD, 0.04, v + 169);
      break;
    }
    case 'cobble': {
      // A ferry road. Rounded beach stone set in sand, not dressed setts.
      rect(g, 0, 0, TILE_PX, TILE_PX, P.sandD);
      for (let i = 0; i < 34; i++) {
        const x = Math.floor(hash(i, v, 171) * TILE_PX);
        const y = Math.floor(hash(i, v, 172) * TILE_PX);
        const r = 2 + Math.floor(hash(i, v, 173) * 2);
        const t = hash(i, v, 174);
        ellipse(g, x, y, r + 1, r, P.cobbleD);
        ellipse(g, x, y - 1, r, r - 1, t < 0.4 ? P.cobbleL : P.cobble);
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.sand, 0.10, v + 175);
      break;
    }
    case 'plank': {
      // A ferry stair and a landing stage: heavy planks running across, wet.
      rect(g, 0, 0, TILE_PX, TILE_PX, P.woodD);
      for (let y = 0; y < TILE_PX; y += 8) {
        rect(g, 0, y, TILE_PX, 7, hash(0, y, v) < 0.4 ? shade(P.wood, -0.10) : P.wood);
        hline(g, 0, y, TILE_PX, P.woodL);
        hline(g, 0, y + 7, TILE_PX, shade(P.woodD, -0.12));
        // Wet: a couple of dark patches per plank, never a wash over all.
        if (hash(1, y, v + 3) < 0.5) {
          rect(g, Math.floor(hash(2, y, v) * 20), y + 1, 8, 5, shade(P.woodD, -0.06));
        }
      }
      for (let x = 4; x < TILE_PX; x += 11) {
        for (let y = 3; y < TILE_PX; y += 8) px(g, x, y, P.ironD);
      }
      break;
    }
    case 'furrow': {
      // Winter plough on the Pennsylvania bank: frozen ridges with old snow
      // lying in the bottoms. Nothing walks well on it and it looks it.
      base(g, [P.mudD, P.mud, P.dirtL], v);
      for (let x = (v * 3) % 7; x < TILE_PX; x += 7) {
        for (let y = 0; y < TILE_PX; y++) {
          const xx = x + Math.round(Math.sin((y + v * 5) * 0.3) * 1.2);
          vline(g, xx, y, 1, P.mudD);
          px(g, xx + 3, y, P.snowD);
          if (hash(xx, y, v) < 0.4) px(g, xx + 4, y, P.snow);
        }
      }
      break;
    }
    case 'sleet': {
      /*
       * Not weather — GROUND. This is the surface of King Street on the
       * morning of the twenty-sixth: frozen slush over cobble, with the
       * stone showing through where it has been walked and driven on.
       *
       * The sleet in the air is the post stack's business. A tile that
       * tried to be falling sleet would crawl every time the camera moved,
       * which is the one thing pixel art must never do.
       */
      rect(g, 0, 0, TILE_PX, TILE_PX, P.slush);
      for (let i = 0; i < 20; i++) {
        const x = Math.floor(hash(i, v, 181) * TILE_PX);
        const y = Math.floor(hash(i, v, 182) * TILE_PX);
        const r = 2 + Math.floor(hash(i, v, 183) * 2);
        ellipse(g, x, y, r + 1, r, P.cobbleD);
        ellipse(g, x, y - 1, r, r - 1, P.cobble);
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.snowL, 0.16, v + 184);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.slushD, 0.10, v + 185);
      break;
    }
    case 'campmud': {
      /*
       * THE BRIGADE STREET IN DECEMBER, AND THE WHOLE OF THE ACT'S PROBLEM.
       *
       * Not the mud of a building site and not the churned mud of the ferry
       * road: this is twelve thousand men living on eight acres for six
       * months with no drainage and no lime. It freezes at night and thaws
       * by noon and is never once dry, which is why the tile carries both
       * — frozen ridges in the ruts and standing water in the hollows, in
       * the same thirty-two pixels.
       *
       * Waldo's diary is the source everybody quotes and the phrase that
       * sticks is "a pox on my bad luck... poor food — hard lodging — cold
       * weather — fatigue — nasty cloathes — nasty cookery". This is the
       * ground he wrote it standing on.
       */
      base(g, [P.campD, P.camp, P.campL], v);
      // Ruts, running with the street rather than across it.
      for (let y = (v * 5) % 9; y < TILE_PX; y += 9) {
        for (let x = 0; x < TILE_PX; x++) {
          const yy = y + Math.round(Math.sin((x + v * 7) * 0.22) * 1.4);
          hline(g, x, yy, 1, P.campD);
          px(g, x, yy - 1, shade(P.campD, -0.14));
        }
      }
      /*
       * Standing water: ONE pool per tile, and it is muddy water rather
       * than sky.
       *
       * Three pools a tile in a near-black blue made the brigade street
       * read as wet tarmac with oil on it. A puddle in a churned field is
       * the colour of the field with a shine on it, not the colour of the
       * sky — the sky only wins when the puddle is large and still, and
       * these are neither.
       */
      if (hash(0, v, 501) < 0.7) {
        const x = Math.floor(hash(1, v, 502) * TILE_PX);
        const y = Math.floor(hash(2, v, 503) * TILE_PX);
        const r = 3 + Math.floor(hash(3, v, 504) * 3);
        ellipse(g, x, y, r + 2, r, shade(P.campD, -0.22));
        ellipse(g, x, y - 1, r, r - 1, shade(P.slushD, -0.06));
        px(g, x - 1, y - 2, P.slush);
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.campL, 0.06, v + 505);
      break;
    }
    case 'hutfloor': {
      /*
       * Inside a hut: bare earth, beaten hard, with straw where a man
       * sleeps. Fourteen feet by sixteen for twelve men means the straw is
       * most of the floor and there is no furniture to speak of.
       */
      base(g, [shade(P.campD, -0.10), P.campD, P.camp], v);
      for (let i = 0; i < 22; i++) {
        const x = Math.floor(hash(i, v, 511) * TILE_PX);
        const y = Math.floor(hash(i, v, 512) * TILE_PX);
        const len = 4 + Math.floor(hash(i, v, 513) * 7);
        if (hash(i, v, 514) < 0.5) hline(g, x, y, len, P.greenwoodD);
        else hline(g, x, y + 1, Math.max(2, len - 2), P.greenwood);
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.greenwoodL, 0.05, v + 515);
      break;
    }
    case 'parade': {
      /*
       * The Grand Parade. Two thousand men drilled on it every day from
       * March, and the difference between this and `campmud` is that this
       * has been WALKED — flattened, uniform, and with the ruts driven out
       * of it by feet rather than by wheels. It is the only ground in the
       * act that looks deliberate, which is exactly the argument.
       */
      base(g, [P.campD, P.camp, P.campL], v);
      speckle(g, 0, 0, TILE_PX, TILE_PX, shade(P.camp, 0.10), 0.22, v + 521);
      speckle(g, 0, 0, TILE_PX, TILE_PX, shade(P.campD, -0.08), 0.14, v + 522);
      // A faint grain running one way, from a thousand men facing the same
      // direction. Almost subliminal, and it is what tells the eye this
      // ground is used rather than abandoned.
      for (let y = 2; y < TILE_PX; y += 6) {
        for (let x = (v * 3) % 4; x < TILE_PX; x += 4) px(g, x, y, shade(P.campL, 0.06));
      }
      break;
    }
    case 'springturf': {
      /*
       * MAY, ON GROUND THAT WAS MUD IN FEBRUARY.
       *
       * Deliberately not `grass` and deliberately not `lawn`. The first
       * green over a winter camp comes up in patches through churned earth,
       * so the mud is still in this tile and is meant to be — it is what
       * makes the green mean something. A clean lawn here would say the
       * winter had not happened.
       */
      base(g, [P.springD, P.spring, P.springL], v);
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(hash(i, v, 531) * TILE_PX);
        const y = Math.floor(hash(i, v, 532) * TILE_PX);
        const r = 2 + Math.floor(hash(i, v, 533) * 4);
        ellipse(g, x, y, r + 2, r, P.camp);
        ellipse(g, x, y - 1, r, r - 1, P.campL);
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.springL, 0.16, v + 534);
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.springD, 0.10, v + 535);
      break;
    }
    case 'sawdust': {
      /*
       * Where the huts were cut. Chips, sawdust and bark over frozen
       * ground, and it is pale — the one light-coloured surface in a
       * December frame, because a hillside of oaks felled in three weeks
       * leaves an acre of raw wood on the ground.
       */
      base(g, [P.campD, P.greenwoodD, P.greenwood], v);
      for (let i = 0; i < 26; i++) {
        const x = Math.floor(hash(i, v, 541) * TILE_PX);
        const y = Math.floor(hash(i, v, 542) * TILE_PX);
        const w = 2 + Math.floor(hash(i, v, 543) * 4);
        rect(g, x, y, w, 2, hash(i, v, 544) < 0.4 ? P.greenwoodL : P.greenwood);
        px(g, x, y, P.woodD);
      }
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.greenwoodL, 0.12, v + 545);
      break;
    }
    case 'ice': {
      // The Charles, hard enough to bear a man by January. The whole of A2-D2
      // turns on whether it will bear a column, so the tile has to look like
      // something you could be wrong about.
      rect(g, 0, 0, TILE_PX, TILE_PX, shade(P.waterL, 0.18));
      speckle(g, 0, 0, TILE_PX, TILE_PX, P.snow, 0.16, v + 151);
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(hash(i, v, 152) * TILE_PX);
        const y = Math.floor(hash(i, v, 153) * TILE_PX);
        const len = 6 + Math.floor(hash(i, v, 154) * 12);
        if (hash(i, v, 155) < 0.5) hline(g, x, y, len, P.waterD);
        else vline(g, x, y, len, P.waterD);
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
