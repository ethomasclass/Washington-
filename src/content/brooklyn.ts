/**
 * BROOKLYN, AUGUST 1776 — the line, and the ferry, as two adjoining places.
 *
 * Act 3 is the only act so far that could not be one continuous map, and the
 * reason is worth writing down because it will come up again.
 *
 * The act has two views and they face opposite ways. On the morning of the
 * twenty-sixth you stand on the works and look SOUTH-EAST over the Flatbush
 * plain at an enemy you can see and cannot reach. On the night of the
 * twenty-ninth you stand at the ferry and look NORTH-WEST over the East River
 * at a shore you cannot see and have to reach. A single map has one up-screen
 * direction; these are two.
 *
 * So: two maps, joined by the road, the way the estate joins the house. You
 * walk off the bottom of the line and onto the top of the ferry, and the
 * fifteen hundred yards between them is a fade rather than a menu.
 *
 * ORIENTATION — the line (`BK-LINES`):
 *     up the screen    = SOUTH-EAST, the Flatbush plain, and the enemy
 *     down the screen  = the Heights, the camp, and the road to the ferry
 *     screen left      = the Gowanus marsh and the creek
 *     screen right     = Wallabout, and the Jamaica road going off into it
 *
 * ORIENTATION — the ferry (`BK-FERRY`):
 *     up the screen    = NORTH-WEST, the East River, and Manhattan beyond it
 *     down the screen  = the road back up to the Heights and the line
 *
 * THE FIXED LOSS (R20) is the whole act: Long Island is lost, the army is
 * driven off it, and every branch of `A3-D1` ends the same way. Nothing on
 * either of these maps offers to hold the position, because nothing did.
 */

import type { MapDef, PropInstance, StructureDef } from '../types';
import { LIGHT } from '../palette';
import { Canvas, scatter } from './paint';
import { FIELD_LEGEND } from './legend';
import { lineNpcs, ferryNpcs } from './brooklyn-people';
import { lineThings, ferryThings } from './brooklyn-things';

export type Ferry = 'rain' | 'night';

/* ---------------------------------------------------------------------- *
 * THE LINE
 * ---------------------------------------------------------------------- */

export const L_COLS = 80, L_ROWS = 56;

/** The works. */
export const REVET = 8;                    // the revetment row: solid, the whole width
export const WALK_N = 9, WALK_S = 10;      // the parapet walk
export const STEP_N = 11, STEP_S = 16;     // the firing step and the gun platforms
export const SLOPE_S = 20;                 // the reverse slope
export const CAMP_N = 22, CAMP_S = 30;     // the camp behind the line
/** Fort Putnam, the star salient on the left centre. */
export const FORT_X = 40, FORT_Z = 11;
/** The road down off the Heights, and off the bottom of this map. */
export const ROAD_X = 34;

function lineGround(): string[] {
  const cv = new Canvas(L_COLS, L_ROWS, '.');

  // --- the far ground: Flatbush, and the hills the enemy is on ------------
  cv.band(0, 2, 'm');
  cv.ragged('m', '.', 0.35, 301);

  /*
   * THE PLAIN, and it is UNREACHABLE on purpose.
   *
   * Everything from here to the revetment is the ground in front of the
   * works: the hayfields, the two roads, the abatis. The player can see all
   * of it and can walk on none of it, because a general who strolls out in
   * front of his own abatis to look at the Hessian pickets is not a general
   * anybody wrote about. The linter asserts it stays unreachable.
   */
  cv.rect(0, 2, L_COLS, REVET - 2, 'm');
  // The Flatbush road, coming straight at the centre of the line.
  cv.path([[33, 0], [33, 4], [31, 7]], 3.4, 'd');
  /*
   * THE JAMAICA ROAD, off to the right, running away into the country and
   * off the edge of the map.
   *
   * It is drawn, it is signed with a milestone, and it is four miles beyond
   * the end of the American line. Ten thousand men came down it at two in
   * the morning on the twenty-seventh. The player can see exactly where the
   * battle was lost, from the works, on the twenty-sixth, and cannot do a
   * thing about it — which is the most honest sentence this map can make.
   */
  cv.path([[79, 1], [70, 3], [64, 6], [60, 7]], 3.2, 'd');
  cv.rect(44, 2, 16, 4, 'r');            // hayfields, cut and stooked
  cv.rect(8, 3, 14, 3, 'r');

  // --- the works ----------------------------------------------------------
  cv.rect(0, REVET, L_COLS, WALK_S - REVET + 1, 'e');
  cv.rect(0, STEP_N, L_COLS, STEP_S - STEP_N + 1, 'd');
  cv.rect(0, STEP_S + 1, L_COLS, SLOPE_S - STEP_S, 'm');
  // The fort's platform is cut turf, like the parapet, so it reads as a
  // work rather than as a patch of the parade.
  cv.rect(FORT_X - 1, FORT_Z, 14, 6, 'e');

  // --- the Gowanus marsh, off to the left ---------------------------------
  /*
   * The left flank, and the ground the Marylanders died on.
   *
   * Gowanus creek is tidal, the mill dam crossing was under fire, and the
   * men who could not get over it drowned or were taken. It is walkable —
   * the player is meant to be able to go down into it and find out how bad
   * it is underfoot — and the creek itself is water, which is solid, so it
   * is the flank rather than a way round.
   */
  cv.rect(0, 10, 16, 22, 'q');
  cv.rect(0, 14, 10, 5, 'w');
  cv.rect(0, 19, 13, 3, 'z');
  cv.ragged('q', 'z', 0.30, 302);
  cv.ragged('w', 'z', 0.34, 303);
  cv.path([[10, 21], [14, 24], [17, 27]], 3.0, 'd');   // the mill dam crossing

  // --- the camp behind the line -------------------------------------------
  cv.rect(18, CAMP_N, L_COLS - 24, CAMP_S - CAMP_N + 1, 't');
  cv.rect(17, CAMP_N - 1, L_COLS - 22, CAMP_S - CAMP_N + 3, 'm');
  cv.rect(18, CAMP_N, L_COLS - 24, CAMP_S - CAMP_N + 1, 't');

  // --- the road down off the Heights --------------------------------------
  cv.path([[ROAD_X + 2, SLOPE_S], [ROAD_X, 26], [ROAD_X + 1, 34], [ROAD_X, L_ROWS - 1]], 4.2, 'd');
  // And a lane along the back of the line, so the works are never a dead end
  // reachable only down the middle.
  cv.path([[6, 33], [24, 31], [46, 31], [68, 33]], 3.6, 'd');

  // --- the Wallabout side --------------------------------------------------
  cv.rect(64, 18, 16, 10, 'm');
  cv.rect(70, 36, 10, 8, 'v');           // somebody's garden, still being dug

  cv.ragged('t', 'm', 0.28, 304);
  cv.ragged('d', '.', 0.24, 305);
  cv.ragged('m', '.', 0.26, 306);
  return cv.lines();
}

/**
 * The Heights, which are the whole reason anybody is standing here.
 *
 * Brooklyn Heights is a bluff a hundred feet over the river and the guns on
 * it reach every street in New York. The line is dug across the neck of it.
 * The slope obeys the rule Act 2 wrote down: never more than one elevation
 * step per row, or the fall is invisible at this camera pitch.
 */
function lineElevation(): string[] {
  const cv = new Canvas(L_COLS, L_ROWS, '0');
  cv.band(0, 2, '3');
  cv.rect(0, 2, L_COLS, REVET - 2, '1');
  cv.rect(0, REVET, L_COLS, WALK_S - REVET + 1, '6');
  cv.rect(0, STEP_N, L_COLS, 3, '5');
  cv.rect(0, STEP_N + 3, L_COLS, 3, '4');
  cv.rect(0, STEP_S + 1, L_COLS, 2, '3');
  // Fort Putnam's platform, a step above the rest of the works.
  cv.rect(FORT_X - 1, FORT_Z, 14, 6, '6');
  cv.rect(0, STEP_S + 3, L_COLS, 2, '2');
  cv.rect(0, SLOPE_S + 1, L_COLS, 2, '1');
  cv.rect(0, SLOPE_S + 3, L_COLS, L_ROWS - SLOPE_S - 3, '0');
  // The marsh is at sea level, and the drop into it off the works is the
  // reason the left flank was never really a flank.
  cv.rect(0, 10, 17, 22, '0');
  return cv.lines();
}

function lineProps(): PropInstance[] {
  const out: PropInstance[] = [];
  const add = (l: Array<{ id: string; x: number; z: number; flip?: boolean }>) => { for (const p of l) out.push(p); };

  /* --- the revetment: solid, the whole width, as at Cambridge ---------- */
  for (let x = 4; x < L_COLS - 3; x++) {
    out.push({ id: 'gabion', x: x + 0.5, z: REVET + 0.4, flip: x % 2 === 0, scale: 0.9 });
  }
  // Fascines and palisade on the outer face, and the abatis out in front.
  for (const x of [10, 26, 42, 58, 72]) out.push({ id: 'palisade', x, z: REVET - 0.7, flip: x % 2 === 0 });
  for (const x of [6, 18, 30, 46, 62, 76]) out.push({ id: 'abatis', x, z: REVET - 2.4, flip: (x / 12) % 2 === 0 });

  /* --- the works ------------------------------------------------------- *
   * Two embrasures with guns in them, a good deal of spoil, and the tools
   * still out. "I have never spared the Spade and Pick Ax" — and the line
   * really was well made. It is well made facing the wrong way.
   * ------------------------------------------------------------------- */
  /* Fort Putnam, as a bank with a profile: gabions round three faces and
   * two embrasures cut through the front of it. */
  for (let x = FORT_X - 1; x < FORT_X + 13; x++) {
    if (x >= FORT_X + 2 && x <= FORT_X + 4) continue;   // the west embrasure
    if (x >= FORT_X + 8 && x <= FORT_X + 10) continue;  // the east one
    out.push({ id: 'gabion', x: x + 0.5, z: FORT_Z + 0.4, flip: x % 2 === 0, scale: 0.85 });
  }
  for (const dz of [1, 2, 3, 4]) {
    out.push({ id: 'gabion', x: FORT_X - 0.6, z: FORT_Z + dz, scale: 0.8 });
    out.push({ id: 'gabion', x: FORT_X + 12.6, z: FORT_Z + dz, flip: true, scale: 0.8 });
  }
  out.push(
    { id: 'embrasure', x: FORT_X + 3.0, z: FORT_Z + 0.4, scale: 0.9 },
    { id: 'embrasure', x: FORT_X + 9.0, z: FORT_Z + 0.4, flip: true, scale: 0.9 },
    { id: 'fieldGun', x: FORT_X + 3.0, z: FORT_Z + 2.4 },
    { id: 'fieldGun', x: FORT_X + 9.0, z: FORT_Z + 2.6, flip: true },
    { id: 'shotPile', x: FORT_X + 6.0, z: FORT_Z + 3.2 },
    { id: 'flagStaff', x: FORT_X + 6.0, z: FORT_Z + 1.4 },
  );

  out.push(
    { id: 'embrasure', x: 24.0, z: 10.6 },
    { id: 'embrasure', x: 56.0, z: 10.6, flip: true },
    { id: 'fieldGun', x: 30.0, z: 13.0 },
    { id: 'fieldGun', x: 50.0, z: 13.2, flip: true },
    { id: 'shotPile', x: 34.0, z: 13.8 },
    { id: 'powderCask', x: 46.0, z: 13.6 },
    { id: 'barrow', x: 20.4, z: 14.0 },
    { id: 'toolChest', x: 62.0, z: 14.2 },
    { id: 'fascineStack', x: 27.0, z: 15.4 },
    { id: 'fascineStack', x: 53.5, z: 15.6, flip: true },
    { id: 'drumTable', x: 38.0, z: 12.4 },
    { id: 'spyglassRest', x: 42.0, z: 10.4 },
    { id: 'sentryBox', x: 70.0, z: 12.6 },
    { id: 'musketStack', x: 66.0, z: 14.0 },
    { id: 'musketStack', x: 18.0, z: 13.8, flip: true },
  );

  /* --- the plain in front, which nobody can reach ---------------------- */
  add(scatter('haystack', [10, 4], [20, 4], 3, 0.8, 311));
  add(scatter('haystack', [46, 3], [58, 3], 3, 0.8, 312));
  out.push(
    { id: 'milestone', x: 62.0, z: 6.4 },
    { id: 'railFence', x: 26.0, z: 5.4 },
    { id: 'railFence', x: 30.0, z: 5.4 },
    { id: 'railFence', x: 66.0, z: 4.6, flip: true },
    { id: 'oak', x: 8.0, z: 1.6 },
    { id: 'oak', x: 72.0, z: 1.4, flip: true },
    { id: 'elm', x: 40.0, z: 1.2 },
  );

  /* --- the marsh -------------------------------------------------------- */
  out.push(
    { id: 'shellHeap', x: 6.0, z: 22.4 },
    { id: 'shellHeap', x: 11.0, z: 25.0 },
    { id: 'flatBoat', x: 4.0, z: 20.6 },
    { id: 'netRack', x: 13.0, z: 24.4 },
    { id: 'herringBarrel', x: 9.4, z: 27.0 },
    { id: 'sapling', x: 15.0, z: 12.4 },
    { id: 'sapling', x: 3.6, z: 29.0, flip: true },
  );
  add(scatter('shrub', [2, 11], [15, 11], 5, 0.9, 313));

  /* --- the camp --------------------------------------------------------- */
  for (let i = 0; i < 8; i++) {
    out.push({ id: 'tentWedge', x: 21.0 + i * 5.4, z: CAMP_N + 1.2, flip: i % 2 === 1 });
  }
  for (let i = 0; i < 6; i++) {
    out.push({ id: 'brushShelter', x: 24.0 + i * 6.2, z: CAMP_S - 1.6, flip: i % 3 === 0 });
  }
  for (let i = 0; i < 5; i++) {
    out.push({ id: 'campKettle', x: 23.0 + i * 9.0, z: CAMP_N + 4.0 });
    out.push({ id: 'woodpile', x: 26.0 + i * 9.0, z: CAMP_N + 5.4, flip: i % 2 === 0 });
  }
  out.push(
    { id: 'wagonTilt', x: 62.0, z: CAMP_N + 4.0 },
    { id: 'kitPile', x: 56.0, z: CAMP_N + 5.0 },
    { id: 'kitPile', x: 44.0, z: CAMP_S - 0.6, flip: true },
    { id: 'washTub', x: 30.0, z: CAMP_S - 0.8 },
    { id: 'drum', x: 40.0, z: CAMP_N + 2.0 },
    { id: 'campTable', x: 48.0, z: CAMP_N + 2.4 },
    { id: 'horse', x: 68.0, z: CAMP_S - 1.0 },
    { id: 'trough', x: 65.0, z: CAMP_S + 0.6 },
    { id: 'necessary', x: 74.0, z: CAMP_S + 2.0 },
  );

  /* --- the ground behind, toward the Heights ---------------------------- */
  add(scatter('oak', [8, 38], [20, 40], 4, 1.2, 314));
  add(scatter('elm', [52, 38], [68, 41], 4, 1.2, 315));
  add(scatter('shrub', [22, 44], [46, 45], 6, 0.9, 316));
  out.push(
    { id: 'well', x: 44.0, z: 36.4 },
    { id: 'cartTwoWheel', x: 28.0, z: 38.0 },
    { id: 'railFence', x: 70.0, z: 35.4 },
    { id: 'railFence', x: 74.0, z: 35.4 },
    { id: 'gate', x: 70.0, z: 44.0 },
    { id: 'signpost', x: 37.4, z: 47.0 },
    { id: 'milestone', x: 31.0, z: 50.4 },
  );

  return out;
}

function lineStructures(): StructureDef[] {
  return [
    /*
     * FORT PUTNAM IS NOT A STRUCTURE, and the reason is worth recording.
     *
     * The first version was a `StructureDef` — a twelve-by-five log box at
     * h 1.6 with no roof — and at this camera it read as exactly that: a
     * large brown slab with a flat top standing in a field. A field work has
     * no walls; it is a bank with a profile, and `StructureDef` has no way
     * to make one.
     *
     * So it is built out of ground and props instead: the elevation lifts
     * the platform, and a ring of gabions with two embrasures in it gives
     * the salient its shape. That is also how it was actually made.
     *
     * It survived the campaign. Sixty years later the ground it stood on
     * became Fort Greene Park, and the vault under the monument there holds
     * the bones of the eleven thousand men who died in the prison ships in
     * Wallabout Bay — which is up-screen and to the right of here, and is
     * not in this act because it has not happened yet.
     */
    /* A powder magazine, dug in behind the line. */
    {
      id: 'bkMagazine',
      x: 26, z: 18, w: 5, d: 3, h: 1.9,
      style: 'brick', roof: 'gable', pitch: 0.9, seed: 62,
      faces: { south: [{ at: 2.5, kind: 'door' }] },
    },
    /* A Dutch farmhouse behind the camp — Kings County was Dutch, the
     * farms were Dutch, and a good half of the county was loyalist. */
    {
      id: 'dutchFarm',
      x: 52, z: 36, w: 9, d: 5, h: 2.4,
      style: 'clapboard', roof: 'gable', pitch: 1.3, seed: 63,
      faces: {
        south: [{ at: 2.0, kind: 'doorway' }, { at: 4.5, kind: 'window' }, { at: 7.0, kind: 'window' }],
        west: [{ at: 2.5, kind: 'window' }],
      },
      chimneys: [{ at: 0.8, on: 'west', h: 1.3 }, { at: 8.2, on: 'east', h: 1.3 }],
    },
    { id: 'dutchBarn', x: 62, z: 42, w: 11, d: 6, h: 2.7,
      style: 'clapboard', roof: 'gable', pitch: 1.4, seed: 64,
      faces: { south: [{ at: 3.0, kind: 'doorway' }, { at: 8.0, kind: 'doorway' }] } },
    /* The Old Stone House at Gowanus, out on the left. Two hundred and
     * fifty Marylanders attacked it six times on the twenty-seventh to buy
     * the rest of the division the time to get over the creek. */
    { id: 'oldStoneHouse', x: 3, z: 26, w: 7, d: 4, h: 2.3,
      style: 'brick', roof: 'gable', pitch: 1.2, seed: 65,
      faces: { south: [{ at: 1.5, kind: 'window' }, { at: 3.5, kind: 'doorway' }, { at: 5.5, kind: 'window' }] },
      chimneys: [{ at: 0.6, on: 'west', h: 1.2 }] },
    /* Flatbush, across the plain: a Dutch church and two houses, held by
     * five thousand Hessians and completely out of reach. */
    { id: 'flatbushChurch', x: 30, z: 0, w: 5, d: 2, h: 2.6,
      style: 'brick', roof: 'gable', pitch: 1.4, seed: 66 },
    { id: 'flatbushA', x: 22, z: 0, w: 5, d: 2, h: 1.8, style: 'clapboard', roof: 'gable', pitch: 1.1, seed: 67 },
    { id: 'flatbushB', x: 44, z: 0, w: 6, d: 2, h: 1.8, style: 'clapboard', roof: 'gable', pitch: 1.1, seed: 68 },
    { id: 'flatbushC', x: 56, z: 1, w: 4, d: 1, h: 1.6, style: 'clapboard', roof: 'gable', pitch: 1.0, seed: 69 },
  ];
}

export const BK_LINES: MapDef = {
  id: 'BK-LINES',
  title: 'The Brooklyn line',
  when: '26 August 1776',
  light: LIGHT.brooklynAugust,
  ground: lineGround(),
  elev: lineElevation(),
  legend: FIELD_LEGEND,
  props: lineProps(),
  structures: lineStructures(),
  spawn: { x: ROAD_X, z: 34, facing: 3 },

  arrival: [
    'The lines above Brooklyn, the twenty-sixth of August, 1776. Half a mile of good earthwork '
    + 'across the neck of the Heights, and behind it the guns that reach every street in New York.',
    'Out past the Narrows there are four hundred sail. Thirty-two thousand men came off them at '
    + 'Gravesend three days ago, unopposed, in four hours, and are somewhere in front of you now.',
    'The works are well made. You have never spared the spade.',
  ],

  zones: [
    {
      id: 'works',
      x: 0, z: 0, w: L_COLS, d: SLOPE_S,
      light: LIGHT.brooklynAugust,
      dist: 28,
    },
    {
      /*
       * THE MARSH.
       *
       * Its own light, and it is flatter and greener and duller than the
       * works — because a salt marsh in August under haze is, and because
       * the player should feel the ground change before they read a word
       * about it. The camera comes in, the way it does in the Quarter, for
       * the same reason: this is a place to look at rather than a place to
       * command.
       */
      id: 'marsh',
      x: 0, z: 9, w: 18, d: 24,
      light: LIGHT.brooklynMarsh,
      dist: 25,
      onEnter: [
        'The ground gives under you at the second step and there is standing water in every hoof '
        + 'print. Cordgrass to the waist, then the creek, then the mill dam, and the dam is eight '
        + 'feet wide.',
        'A man in a hurry, in a fight, carrying a musket, gets across this or he does not.',
      ],
    },
  ],

  ambient: [
    {
      id: 'amb3.works', x: 38, z: 13, r: 5, minLoudness: 0.30,
      variants: {
        vanity: 'Half a mile of it, and every officer who rides up writes home about the works.',
        duty: 'You have never spared the spade. It is the one thing you have always been able to give them.',
        restraint: 'A work is only as good as the ground beside it, and the ground beside it is four miles long.',
      },
    },
    {
      id: 'amb3.plain', x: 34, z: 10, r: 4.5, minLoudness: 0.30,
      variants: {
        ambition: 'They have to come at you across two miles of open corn. Let them.',
        temper: 'Thirty-two thousand men landed at Gravesend in four hours and nobody fired a shot at them.',
        restraint: 'Count the roads. Then count the roads you have men on.',
      },
    },
    {
      id: 'amb3.marsh', x: 8, z: 20, r: 5, minLoudness: 0.32,
      variants: {
        restraint: 'A creek is not a flank. It is a thing that stops your own men coming back.',
        duty: 'If the left goes, everything on it comes through here, and this is what it comes through.',
      },
    },
    {
      id: 'amb3.camp', x: 40, z: 26, r: 5, minLoudness: 0.34,
      variants: {
        temper: 'Eight thousand Connecticut militia on the rolls. Ask how many are in these tents.',
        duty: 'They came out for the summer. It is nearly September and nobody has told them what happens then.',
        vanity: 'The Declaration was read to this army in July, in front of the whole line. They cheered.',
      },
    },
    {
      id: 'amb3.jamaica', x: 62, z: 12, r: 5, minLoudness: 0.36,
      variants: {
        restraint: 'That road runs four miles past the end of your line and there are five men on it.',
        ambition: 'Nobody moves ten thousand men down a country road at night. It has never been done here.',
      },
    },
  ],

  npcs: lineNpcs(),
  interactables: lineThings(),

  marks: [
    { x: 33, z: 3, label: 'the Flatbush road', overWater: true },
    { x: 62, z: 6, label: 'the Jamaica road', overWater: true, grants: 'map.a3.jamaica' },
    { x: 32, z: 0, label: 'Flatbush church', overWater: true, grants: 'map.a3.flatbush' },
    { x: 8, z: 16, label: 'Gowanus creek', grants: 'map.a3.gowanus' },
    { x: 6, z: 27, label: 'the Old Stone House', grants: 'map.a3.stone_house' },
    { x: 45, z: 12, label: 'Fort Putnam' },
    { x: 40, z: 26, label: 'the camp' },
    { x: 70, z: 22, label: 'Wallabout' },
  ],

  portals: [
    {
      id: 'road-to-ferry',
      x: ROAD_X - 1, z: L_ROWS - 2, w: 4, d: 2,
      to: 'BK-FERRY', at: [34, 50], facing: 3,
      label: 'take the road down to the ferry',
      transition: 'fade',
      requires: 'obs.a3.line_walked',
      lockedNote:
        'There is a brigadier on the parapet waiting to be told where to put his men, and you '
        + 'have not walked the line yet.',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * THE FERRY
 * ---------------------------------------------------------------------- */

export const F_COLS = 70, F_ROWS = 54;

/** The water, the stage, and the road up. */
export const SHORE = 16;                   // where the land begins
export const STAGE_X = 30, STAGE_W = 10;   // the landing stage, out over the flat
export const HOUSE_X = 42, HOUSE_Z = 30;   // Four Chimneys, on the bluff

function ferryGround(state: Ferry): string[] {
  const cv = new Canvas(F_COLS, F_ROWS, '.');

  // --- Manhattan, across a mile of water and not to be walked to ---------
  cv.band(0, 3, 'g');
  cv.rect(0, 3, F_COLS, 1, 'c');

  // --- the East River ------------------------------------------------------
  cv.rect(0, 4, F_COLS, SHORE - 5, 'w');
  /*
   * THE FLATS.
   *
   * The tide is the whole night. High water at the ferry was about eleven,
   * the ebb ran until near four, and boats that grounded on the flat stayed
   * grounded until it made again. Drawing the flat rather than a clean
   * shoreline is the difference between a river and a tide.
   */
  cv.rect(0, SHORE - 1, F_COLS, 2, 'z');
  cv.ragged('z', 'w', 0.34, 321);

  // --- the landing ---------------------------------------------------------
  cv.rect(STAGE_X, SHORE - 3, STAGE_W, 6, 'k');       // the stage, out over the flat
  cv.rect(STAGE_X - 4, SHORE + 2, STAGE_W + 8, 4, 'c'); // the cobbled ramp
  cv.rect(18, SHORE + 5, 36, 5, 'c');                  // the ferry yard
  cv.ragged('c', '.', 0.28, 322);

  // --- the ferry village ----------------------------------------------------
  cv.path([[36, SHORE + 6], [40, 26], [44, 30]], 4.0, 'd');   // up to the house
  cv.path([[24, SHORE + 8], [22, 28], [26, 38], [32, 46], [34, F_ROWS - 1]], 4.4, 'd');
  cv.rect(48, 20, 18, 8, 'v');            // gardens behind the village
  cv.rect(6, 22, 12, 8, 'r');             // a stackyard

  cv.ragged('d', '.', 0.24, 323);
  cv.ragged('v', '.', 0.22, 324);
  cv.ragged('r', '.', 0.26, 325);

  /*
   * ON THE NIGHT MAP THE GROUND DOES NOT CHANGE, only the light does.
   *
   * That is deliberate and it is the opposite of Act 2's seasons, where the
   * ground changed and the layout did not. Three days pass here, not four
   * months. What is different at midnight on the twenty-ninth is that it is
   * dark, it is raining, there are boats at the stage, and nine thousand men
   * are walking down this road without speaking — and every one of those is
   * a light, a prop or a person, not a tile.
   */
  if (state === 'night') {
    // Except the yard, which four hours of nine thousand men has turned to mud.
    cv.rect(18, SHORE + 5, 36, 5, 'u');
    cv.rect(STAGE_X - 4, SHORE + 2, STAGE_W + 8, 4, 'u');
    cv.ragged('u', 'c', 0.30, 326);
  }
  return cv.lines();
}

/** The bluff. A hundred feet of it, and the ferry is at the bottom. */
function ferryElevation(): string[] {
  const cv = new Canvas(F_COLS, F_ROWS, '0');
  cv.band(0, 4, '1');
  cv.rect(0, SHORE + 4, F_COLS, 2, '1');
  cv.rect(0, SHORE + 6, F_COLS, 2, '2');
  cv.rect(0, SHORE + 8, F_COLS, 3, '3');
  cv.rect(0, SHORE + 11, F_COLS, 3, '4');
  cv.rect(0, SHORE + 14, F_COLS, 3, '5');
  cv.rect(0, SHORE + 17, F_COLS, F_ROWS - SHORE - 17, '6');
  // The road is cut into the bluff rather than going over it, so the walk
  // down is a walk down a road and not a fall.
  cv.rect(20, SHORE + 6, 8, 4, '1');
  cv.rect(20, SHORE + 10, 10, 4, '2');
  cv.rect(24, SHORE + 14, 10, 4, '4');
  return cv.lines();
}

function ferryProps(state: Ferry): PropInstance[] {
  const night = state === 'night';
  const out: PropInstance[] = [];
  const add = (l: Array<{ id: string; x: number; z: number; flip?: boolean }>) => { for (const p of l) out.push(p); };

  // --- the stage and the shore ---------------------------------------------
  out.push(
    { id: 'wharfPost', x: STAGE_X + 0.4, z: SHORE - 2.6 },
    { id: 'wharfPost', x: STAGE_X + STAGE_W - 0.6, z: SHORE - 2.6 },
    { id: 'wharfPost', x: STAGE_X + 0.4, z: SHORE + 2.4 },
    { id: 'wharfPost', x: STAGE_X + STAGE_W - 0.6, z: SHORE + 2.4 },
    { id: 'netRack', x: 20.0, z: SHORE + 1.0 },
    { id: 'herringBarrel', x: 55.0, z: SHORE + 1.4 },
    { id: 'shellHeap', x: 12.0, z: SHORE + 0.4 },
    { id: 'shellHeap', x: 60.0, z: SHORE - 0.2 },
  );

  if (night) {
    /*
     * THE BOATS.
     *
     * Everything Glover could find, and the composition of it is the
     * historical point: a scratch fleet of sloops, flat-bottomed bateaux
     * and whaleboats, rowed by Marblehead fishermen with rags round the
     * oars, nine thousand men in one night without losing a man.
     */
    for (let i = 0; i < 5; i++) {
      out.push({ id: 'flatBoat', x: 16.0 + i * 9.5, z: SHORE - 4.2, flip: i % 2 === 0 });
    }
    out.push(
      { id: 'sloop', x: 52.0, z: SHORE - 8.0, scale: 1.4 },
      { id: 'sloop', x: 14.0, z: SHORE - 9.0, scale: 1.2, flip: true },
      { id: 'flatBoat', x: 38.0, z: SHORE - 9.4 },
    );
    // Lanterns, and they are the only light in the frame. Shielded ones on
    // the New York side of the posts, so nothing shows across the river.
    for (const x of [22, 30, 40, 48, 58]) out.push({ id: 'shipLantern', x, z: SHORE + 3.4 });
    for (const x of [26, 36, 46]) out.push({ id: 'shipLantern', x, z: SHORE + 8.0 });
    out.push(
      { id: 'shipLantern', x: 34.0, z: 30.0 },
      { id: 'shipLantern', x: 24.0, z: 40.0 },
      // What could not go. The manifest is a list of what fits, which means
      // it is also a list of what does not.
      { id: 'gunSpiked', x: 60.0, z: SHORE + 7.0 },
      { id: 'gunSpiked', x: 12.0, z: SHORE + 8.4, flip: true },
      { id: 'kitPile', x: 44.0, z: SHORE + 6.6 },
      { id: 'kitPile', x: 50.0, z: SHORE + 8.2, flip: true },
      { id: 'kitPile', x: 18.0, z: SHORE + 7.4 },
      { id: 'horse', x: 64.0, z: SHORE + 9.0 },
      { id: 'horse', x: 67.0, z: SHORE + 11.0, flip: true },
    );
  } else {
    // On the twenty-ninth, in daylight, in the rain, this is a ferry
    // village with nothing whatever remarkable about it, and the whole
    // point of walking it now is that the player will walk it again.
    out.push(
      { id: 'flatBoat', x: 20.0, z: SHORE + 1.2 },
      { id: 'flatBoat', x: 56.0, z: SHORE + 0.8, flip: true },
      { id: 'barrel', x: 44.0, z: SHORE + 6.0 },
      { id: 'crate', x: 46.4, z: SHORE + 6.8 },
      { id: 'cartTwoWheel', x: 50.0, z: SHORE + 8.0 },
      { id: 'horse', x: 58.0, z: SHORE + 9.4 },
      { id: 'trough', x: 54.0, z: SHORE + 10.0 },
    );
  }

  // --- the village and the bluff -------------------------------------------
  out.push(
    { id: 'well', x: 28.0, z: SHORE + 7.4 },
    { id: 'woodpile', x: 58.0, z: 22.0 },
    { id: 'washTub', x: 10.0, z: SHORE + 8.0 },
    { id: 'necessary', x: 8.0, z: 34.0 },
    { id: 'signpost', x: 37.0, z: SHORE + 7.0 },
    { id: 'railFence', x: 48.0, z: 19.0 },
    { id: 'railFence', x: 52.0, z: 19.0 },
    { id: 'railFence', x: 56.0, z: 19.0 },
    { id: 'gate', x: 60.0, z: 19.0 },
    { id: 'flowerbed', x: 50.0, z: 24.0 },
    { id: 'flowerbed', x: 56.0, z: 25.0 },
  );
  add(scatter('elm', [12, 26], [12, 40], 4, 1.1, 331));
  add(scatter('elm', [64, 30], [64, 44], 4, 1.1, 332));
  add(scatter('oak', [20, 46], [46, 48], 4, 1.3, 333));
  add(scatter('shrub', [6, 44], [22, 46], 5, 0.9, 334));

  return out;
}

function ferryStructures(): StructureDef[] {
  return [
    /*
     * FOUR CHIMNEYS — Philip Livingston's house on Brooklyn Heights.
     *
     * Livingston signed the Declaration seven weeks ago and is at this
     * moment in Philadelphia. His house on the Heights is the American
     * headquarters, his distillery is down at the water, and by October the
     * British will have both — the house as a hospital, the distillery as a
     * naval store. He never got either back and he died at York in 1778
     * still sitting in Congress.
     *
     * Four chimneys, and the name of the house is the count.
     */
    {
      id: 'fourChimneys',
      x: HOUSE_X, z: HOUSE_Z, w: 13, d: 7, h: 3.3,
      style: 'clapboard', roof: 'hip', pitch: 1.25,
      cornice: true, plinth: true, storeyH: 1.5, seed: 71,
      faces: {
        south: [
          { at: 1.5, kind: 'window' }, { at: 4.5, kind: 'window' },
          { at: 6.5, kind: 'door' },
          { at: 8.5, kind: 'window' }, { at: 11.5, kind: 'window' },
          { at: 1.5, kind: 'window', storey: 1 }, { at: 4.5, kind: 'window', storey: 1 },
          { at: 6.5, kind: 'window', storey: 1 },
          { at: 8.5, kind: 'window', storey: 1 }, { at: 11.5, kind: 'window', storey: 1 },
        ],
        north: [
          { at: 3.0, kind: 'window' }, { at: 6.5, kind: 'doorway' }, { at: 10.0, kind: 'window' },
        ],
      },
      chimneys: [
        { at: 1.5, on: 'ridge', h: 1.2 }, { at: 4.5, on: 'ridge', h: 1.2 },
        { at: 8.0, on: 'ridge', h: 1.2 }, { at: 11.0, on: 'ridge', h: 1.2 },
      ],
    },
    /* The ferry house, and the distillery beside it. */
    { id: 'ferryHouse', x: 20, z: SHORE + 11, w: 8, d: 5, h: 2.5,
      style: 'clapboard', roof: 'gable', pitch: 1.2, seed: 72,
      faces: { south: [{ at: 2.0, kind: 'doorway' }, { at: 5.5, kind: 'window' }] },
      chimneys: [{ at: 0.8, on: 'west', h: 1.3 }] },
    { id: 'distillery', x: 54, z: SHORE + 12, w: 10, d: 6, h: 2.8,
      style: 'brick', roof: 'gable', pitch: 1.2, seed: 73,
      faces: { south: [{ at: 2.5, kind: 'doorway' }, { at: 7.0, kind: 'window' }] },
      chimneys: [{ at: 9.2, on: 'east', h: 1.8 }] },
    { id: 'ropewalk', x: 6, z: SHORE + 14, w: 12, d: 3, h: 2.0,
      style: 'clapboard', roof: 'shed', pitch: 0.8, seed: 74,
      faces: { south: [{ at: 3.0, kind: 'doorway' }, { at: 9.0, kind: 'doorway' }] } },
    /* New York, across the water: a spire and a row of roofs, unreachable. */
    { id: 'trinity', x: 30, z: 0, w: 4, d: 2, h: 3.4, style: 'brick', roof: 'gable', pitch: 2.4, seed: 75 },
    { id: 'nyA', x: 12, z: 0, w: 7, d: 2, h: 2.0, style: 'brick', roof: 'gable', pitch: 1.1, seed: 76 },
    { id: 'nyB', x: 21, z: 1, w: 6, d: 2, h: 1.8, style: 'brick', roof: 'gable', pitch: 1.1, seed: 77 },
    { id: 'nyC', x: 38, z: 0, w: 8, d: 2, h: 2.1, style: 'brick', roof: 'gable', pitch: 1.1, seed: 78 },
    { id: 'nyD', x: 50, z: 1, w: 7, d: 2, h: 1.9, style: 'brick', roof: 'gable', pitch: 1.1, seed: 79 },
    { id: 'nyE', x: 60, z: 0, w: 6, d: 2, h: 2.0, style: 'brick', roof: 'gable', pitch: 1.1, seed: 80 },
  ];
}

export function ferry(state: Ferry): MapDef {
  const night = state === 'night';
  return {
    id: night ? 'BK-FERRY-N' : 'BK-FERRY',
    title: night ? 'The ferry landing' : 'Brooklyn ferry',
    when: night ? 'The night of 29 August 1776' : '29 August 1776',
    light: night ? LIGHT.brooklynNight : LIGHT.brooklynRain,
    /*
     * The fog, brought in on the night map — but MEASURED FROM THE CAMERA,
     * which is a thing worth writing down because getting it wrong looks
     * exactly like getting the light wrong.
     *
     * `Rig` sits 30.5 world units back from what it is looking at. So a fog
     * that starts at 8 does not start eight units in front of the player, it
     * started twenty-two units BEHIND him: the figure and everything around
     * him came out eighty-five per cent hazed to the fog colour, the whole
     * frame went flat and dark, and an hour went into the lights and the
     * exposure looking for it.
     *
     * Anything under about 31 fogs the player. The defaults are 34/110
     * outdoors for exactly that reason.
     *
     * `docs/05` §3.3 asks for a far shore that is not drawn at all: 33/56
     * does it, and leaves the landing itself clear.
     */
    fogNear: night ? 33 : 34,
    fogFar: night ? 56 : 82,
    ground: ferryGround(state),
    elev: ferryElevation(),
    legend: FIELD_LEGEND,
    props: ferryProps(state),
    structures: ferryStructures(),
    spawn: night ? { x: 44, z: 40, facing: 3 } : { x: 34, z: 50, facing: 3 },

    arrival: night
      ? [
        'Eleven at night, and it has not stopped raining since Tuesday. There is a north-east '
        + 'wind and it is the only thing keeping their fleet out of this river.',
        'Nine thousand men are coming down that road behind you and not one of them is speaking. '
        + 'The regiments are being taken off the line one at a time and the men beside them are '
        + 'told nothing, so that nobody who is captured tonight can tell anybody anything.',
        'Every boat on the East River is at that stage. Glover&rsquo;s fishermen are rowing them '
        + 'and they have not stopped since dark.',
      ]
      : [
        'Down off the Heights to the water, in rain that has been coming sideways for three days.',
        'A mile of river, and on the far side a city you are supposed to be defending. Behind you '
        + 'on the Heights, nine thousand men in works that face the wrong way.',
        'The generals are at Livingston&rsquo;s house on the bluff. They have been waiting for you '
        + 'since noon.',
      ],

    zones: night
      ? [
        {
          id: 'landing',
          x: 0, z: 0, w: F_COLS, d: SHORE + 6,
          light: LIGHT.brooklynNight,
          dist: 22,
          onEnter: [
            'The oarlocks are wrapped in rag and the men are working in the dark by feel. Somebody '
            + 'has put out every light on the water side of the posts.',
            'Their nearest sentry is six hundred yards up that hill, and the rain is the only '
            + 'reason he cannot hear this.',
          ],
        },
      ]
      : [
        { id: 'shore', x: 0, z: 0, w: F_COLS, d: SHORE + 6, light: LIGHT.brooklynRain, dist: 26 },
      ],

    ambient: night
      ? [
        {
          id: 'amb3.boats', x: 34, z: SHORE + 3, r: 5, minLoudness: 0.30,
          variants: {
            duty: 'Every man who gets in a boat tonight is a man who is still an army in the morning.',
            restraint: 'Do not count them. Count the boats and multiply, and be wrong, and keep going.',
            temper: 'Three days ago you had a position. Now you have a queue.',
          },
        },
        {
          id: 'amb3.wind', x: 34, z: 12, r: 6, minLoudness: 0.32,
          variants: {
            ambition: 'North-east, and holding. Their ships cannot beat up this river against it.',
            restraint: 'The wind is doing what no decision of yours could have done. Remember that it did.',
            vanity: 'Nobody will ever write that the weather saved this army. They will write that you did.',
          },
        },
        {
          id: 'amb3.left', x: 58, z: SHORE + 7, r: 5, minLoudness: 0.34,
          variants: {
            duty: 'Spiked, and left. Every one of those guns was carried up that hill by hand.',
            temper: 'You are leaving artillery on an island for an enemy who has plenty already.',
          },
        },
      ]
      : [
        {
          id: 'amb3.rain', x: 34, z: 24, r: 6, minLoudness: 0.30,
          variants: {
            restraint: 'Three days of this. Not a musket on that line will fire tonight and they know it.',
            duty: 'The men on the works have been standing in it since Tuesday without relief.',
            temper: 'Their fleet has been trying to get up this river for two days and cannot. Two days.',
          },
        },
        {
          id: 'amb3.house', x: 44, z: 38, r: 5, minLoudness: 0.32,
          variants: {
            duty: 'Nine general officers are in that house waiting for you to ask them a question.',
            vanity: 'Whatever is said in that room, the country will read that you decided it.',
            restraint: 'You have already decided. The council is so that it is not only you who has.',
          },
        },
      ],

    npcs: ferryNpcs(state),
    interactables: ferryThings(state),

    marks: [
      { x: 32, z: 1, label: 'New York', overWater: true, grants: 'map.a3.new_york' },
      { x: 31, z: 0, label: 'Trinity spire', overWater: true },
      { x: 34, z: SHORE - 2, label: 'the landing stage' },
      { x: 46, z: HOUSE_Z + 8, label: 'Four Chimneys' },
      { x: 58, z: SHORE + 13, label: "Livingston's distillery" },
      { x: 22, z: SHORE + 12, label: 'the ferry house' },
    ],

    portals: [
      {
        id: 'house-door',
        x: HOUSE_X + 5, z: HOUSE_Z + 8, w: 3, d: 1,
        to: 'BK-HOUSE', at: [16, 17], facing: 3,
        label: 'go in to the council',
        transition: 'cut',
      },
      ...(night
        ? []
        : [{
          id: 'back-up-road',
          x: 32, z: F_ROWS - 2, w: 4, d: 2,
          to: 'BK-LINES', at: [34, 50] as [number, number], facing: 0 as const,
          label: 'back up the road to the line',
          transition: 'fade' as const,
        }]),
    ],
  };
}

export const BK_FERRY = ferry('rain');
export const BK_FERRY_NIGHT = ferry('night');
