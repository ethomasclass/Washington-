/**
 * CAMBRIDGE AND THE LINES BEFORE BOSTON — one continuous place, in two winters.
 *
 * The old build had this as three separate scenes with three separate loading
 * screens: the camp street, the headquarters parlour, and the works above
 * Charlestown. They are one walk now, and the walk is the act. You come up out
 * of the camp street, along the lane under the elms to a borrowed mansion, and
 * on up the covered way to a parapet a mile from an army that is better than
 * yours in every measurable respect. Nothing loads in between, and the whole
 * distance is about four hundred paces, which is roughly what it was.
 *
 * ORIENTATION. Screen-aligned, not compass-aligned, and this is the only place
 * it is written down:
 *
 *     up the screen (low row)    = toward BOSTON, across the water
 *     down the screen (high row) = the country, the road out to Watertown
 *     screen left (low column)   = the Charles and the ferry road
 *     screen right (high column) = the common, and the college
 *
 * THE TWO SEASONS. `cambridge('summer')` and `cambridge('winter')` are the
 * same function. The ground layout, the buildings, the paths and every
 * position on the map are identical in both; what changes is the tile a
 * surface is painted with, the light, the trees, and what people are standing
 * in the street. That constraint is deliberate and load-bearing — a student
 * who walked this camp in July has to be able to recognise the exact spot in
 * December, or the season is a new level rather than the same place four
 * months later, and the whole point is that it is the same place four months
 * later and half the men are gone.
 *
 * THE HILL. The elevation is not monotonic, which is new: the estate fell in
 * one direction from the house to the river, and this rises from the camp to
 * a crest and then drops off a bluff into the water. `build.ts` handles it —
 * the riser test is on the magnitude of the difference and the riser material
 * is double-sided — but it is worth knowing that the biggest single face in
 * the game is the front of that parapet, and it is nine steps.
 */

import type { MapDef, PropInstance, StructureDef } from '../types';
import { LIGHT } from '../palette';
import { Canvas, scatter } from './paint';
import { CAMP_LEGEND } from './legend';
import { campNpcs } from './cambridge-people';
import { campThings } from './cambridge-things';

export type Season = 'summer' | 'winter';

export const C_COLS = 86;
export const C_ROWS = 70;

/* ---------------------------------------------------------------------- *
 * The plan, as named numbers
 *
 * Every coordinate in this file, in `cambridge-people.ts` and in
 * `cambridge-things.ts` is derived from these. Move one and the rooms, the
 * ranks of tents and the people move with it, which is the whole reason the
 * estate was painted rather than typed.
 * ---------------------------------------------------------------------- */

/** The works. */
/*
 * THE PARAPET, IN THREE ROWS, AND WHY IT IS THREE.
 *
 * Row CREST_N is the revetment — the bank itself, gabions set shoulder to
 * shoulder with felled trees laid into them, and it is SOLID. Rows
 * CREST_N+1..CREST_S are the walk along the top of it. The first version had
 * the revetment scattered along a walkable crest at three-tile spacing, and
 * the reachability flood found the consequence immediately: pockets of the
 * crest fenced off between a gabion, an abatis and the line of the
 * unfinished work, standable and unstandable-on. A wall should be a wall.
 */
export const CREST_N = 12, CREST_S = 14;     // revetment, then the walk
export const STEP_N = 15, STEP_S = 19;       // the firing step behind it
export const WORKS_S = 23;                   // the reverse slope, and the graves
/** The covered way down off the hill. */
export const TRENCH_TOP: [number, number] = [33, 22];
export const TRENCH_FOOT: [number, number] = [41, 35];

/** Headquarters. */
export const HOUSE_X = 42, HOUSE_Z = 34, HOUSE_W = 15, HOUSE_D = 8;
export const DOOR_X = 49, DOOR_Z = 42;       // the portal, on the gravel

/** The camp. */
export const STREET_N = 54, STREET_S = 59;   // the trampled street, inclusive
export const TENTS_N = 50, TENTS_S = 60;     // the two ranks either side of it
export const PARADE_Z = 62;

/* ---------------------------------------------------------------------- *
 * The ground
 * ---------------------------------------------------------------------- */

/**
 * One painter for both seasons.
 *
 * `t()` is the whole trick: every call names what the surface IS — turf,
 * beaten earth, grass, the street — and the season decides what character
 * that becomes. Snow does not get painted on top of a summer map; it is what
 * grass is called in December.
 */
function ground(season: Season): string[] {
  const w = season === 'winter';
  const t = {
    field: w ? 'n' : '.',        // open ground
    rough: w ? 'n' : 'm',        // meadow, scrub, the reverse slope
    street: w ? 'l' : 't',       // where four thousand men walk: slush or dust
    path: w ? 'l' : 'd',         // the lane, the covered way
    yard: w ? 'l' : 'g',         // the headquarters gravel
    works: w ? 'n' : 'e',        // cut turf, on the parapet
    step: w ? 'l' : 'd',         // the firing step, always beaten
    bare: w ? 'n' : 'x',         // the unfinished work, all spoil and chips
    water: w ? 'i' : 'w',        // the river takes ice in January
    shore: w ? 'i' : 'h',
    ruin: 'x',                   // Charlestown, burnt in June, in any weather
    /*
     * The fringe: a row of rougher ground between anything beaten and
     * anything green.
     *
     * Grass against trampled earth is a very large jump in value, and
     * breaking that edge with `ragged` alone produced a hard two-colour
     * checkerboard two tiles deep — a chessboard, not a camp. One row of
     * meadow between them gives the eye a middle value to land on, and then
     * a single light ragging of each of the two boundaries reads as ground
     * wearing out rather than as a pattern.
     */
    fringe: w ? 'n' : 'm',
  };

  const cv = new Canvas(C_COLS, C_ROWS, t.field);

  // --- the far shore: what is left of Charlestown, and the ground they hold -
  cv.band(0, 4, t.ruin);
  cv.rect(0, 3, C_COLS, 1, t.shore);
  cv.ragged(t.ruin, t.shore, 0.30, 81);

  // --- the water. A mile of it, and it is the whole problem ---------------
  cv.rect(0, 4, C_COLS, 3, t.water);

  /*
   * THE FORWARD SLOPE, which is what makes the parapet look like a parapet.
   *
   * Without it the crest sat nine steps above open water in a single tile
   * boundary, and the projection put the water immediately behind the
   * gabions: a bank a man could not see the front of, standing in the sea.
   * Two rows of ground in front of it — the slope and the tide line —
   * give the bank a face to fall down and the eye something to read the
   * height against.
   *
   * They are unreachable, and that is correct. The revetment above them is
   * solid the whole width of the map, so there is no way onto the forward
   * slope of your own works in sight of the British lines, which is exactly
   * the arrangement the men holding it were under.
   */
  cv.rect(0, 7, C_COLS, 1, t.shore);
  cv.rect(0, 8, C_COLS, 4, t.rough);
  cv.ragged(t.shore, t.water, 0.36, 82);
  cv.ragged(t.rough, t.shore, 0.30, 83);

  // --- the works ----------------------------------------------------------
  cv.rect(0, CREST_N, C_COLS, CREST_S - CREST_N + 1, t.works);
  cv.rect(0, STEP_N, C_COLS, STEP_S - STEP_N + 1, t.step);
  cv.rect(0, STEP_S + 1, C_COLS, WORKS_S - STEP_S, t.rough);
  // The unfinished work, where the gabions are being set and nobody has
  // finished setting them. This is the focal object of the whole hill.
  cv.rect(24, STEP_N, 11, 6, t.bare);
  // The traverse at the west end, where the trench turns back on itself.
  cv.rect(10, STEP_N, 9, 7, t.step);
  // The guard post at the east end.
  cv.rect(58, STEP_N, 10, 6, t.step);
  // The burying ground, on the reverse slope where a man can stand up.
  cv.rect(42, WORKS_S - 3, 11, 4, t.rough);

  // --- the covered way, down off the hill to the lane --------------------
  cv.path([TRENCH_TOP, [35, 27], [38, 31], TRENCH_FOOT], 4.0, t.path);

  // --- headquarters -------------------------------------------------------
  cv.rect(36, 42, 28, 7, t.yard);          // the forecourt
  cv.rect(HOUSE_X - 2, HOUSE_Z - 2, HOUSE_W + 4, HOUSE_D + 3, t.field);
  cv.rect(36, 42, 28, 7, t.yard);
  // The lane: up from the camp street, round the forecourt, and away east to
  // the stable yard. Two ways in, so the house is never a cul-de-sac.
  cv.path([[30, STREET_N - 1], [34, 50], [40, 46], [48, 44]], 4.2, t.path);
  cv.path([[48, 44], [58, 45], [66, 44], [70, 48], [68, STREET_N - 1]], 4.0, t.path);
  cv.rect(64, 38, 12, 6, t.path);          // the stable yard

  /* --- the camp ---------------------------------------------------------
   *
   * ONLY the street and the parade are beaten ground. The ranks the tents
   * stand on are the fringe — rougher, drier grass — and everything between
   * them is field.
   *
   * The first version made all of it trampled, on the reasoning that four
   * thousand men wear out whatever they stand on — which is true, and which
   * produced one continuous brown field seventeen rows deep with no shape in
   * it at all. The street has to be a street, and it is only a street if
   * there is something either side of it that is not.
   * ------------------------------------------------------------------- */
  cv.rect(3, STREET_N - 1, C_COLS - 6, STREET_S - STREET_N + 3, t.fringe);
  cv.rect(4, STREET_N, C_COLS - 8, STREET_S - STREET_N + 1, t.street);
  // The parade, which is the only piece of ground in the camp that is level
  // on purpose, and it is kept clear of the street by two rows of grass.
  cv.rect(17, PARADE_Z - 1, 30, 7, t.fringe);
  cv.rect(18, PARADE_Z, 28, 5, t.street);
  // And a fringe either side of the ranks the tents stand on, so the two
  // ranks read as pitched ground rather than as a change of paint.
  cv.rect(6, TENTS_N, C_COLS - 12, 3, t.fringe);
  cv.rect(6, TENTS_S, C_COLS - 12, 3, t.fringe);
  // The wagon park and the magazine, kept well down the field from the fires.
  cv.rect(62, PARADE_Z - 2, 20, 8, t.path);
  // The sinks, at the bottom of the slope and downwind, which is the single
  // most important sanitary fact of the whole first summer.
  cv.rect(4, C_ROWS - 6, 10, 4, w ? 'l' : 'u');

  // Nothing on this ground has a machine-cut edge either.
  /*
   * Two light passes rather than one heavy one.
   *
   * `ragged` only ever converts tiles that are ON the boundary, so running
   * it twice at half strength eats two tiles deep in places and one in
   * others, which is a broken edge. One pass at 0.3 eats exactly one tile
   * everywhere and produces a very legible pixel staircase — and in the
   * winter, where two adjacent surfaces are close in value, that staircase
   * was the most visible thing on the map.
   */
  cv.ragged(t.street, t.fringe, 0.34, 71);
  cv.ragged(t.fringe, t.field, 0.30, 72);
  cv.ragged(t.path, t.field, 0.24, 73);
  cv.ragged(t.path, t.fringe, 0.24, 74);
  cv.ragged(t.yard, t.field, 0.22, 75);
  cv.ragged(t.rough, t.field, 0.26, 76);
  cv.ragged(t.bare, t.step, 0.28, 77);
  if (!w) cv.ragged('h', 'w', 0.40, 78);

  return cv.lines();
}

/**
 * The hill.
 *
 * Nine steps from the camp to the crest of the parapet, and then straight off
 * the front of it into the water. The drop is 3.78 world units in a single
 * tile boundary and it is meant to be alarming: you are standing on top of a
 * bank of earth thrown up in a fortnight, a mile from the best army in the
 * world, and there is nothing underneath you but the river.
 *
 * The water is `TILE_SOLID`, so the front of the parapet needs no railing and
 * no invisible wall. A player who walks north off the crest is stopped by the
 * Charles, which is exactly what stopped everybody else.
 */
function elevation(): string[] {
  const cv = new Canvas(C_COLS, C_ROWS, '0');
  // Charlestown, across the water, standing a little above its own shore.
  // Charlestown, and the hill behind it that cost them a thousand men in June.
  // Drawn as a silhouette rather than a place: it is the only high ground in
  // this act and it belongs to somebody else.
  cv.band(0, 2, '3');
  cv.rect(0, 2, C_COLS, 1, '2');
  cv.rect(0, 3, C_COLS, 1, '1');
  /*
   * The glacis in front of the works, and the tide line under it.
   *
   * The arithmetic of this camera, written down because it governs every
   * slope in the game and it is not obvious. Screen-up is
   * `dy * cos(pitch) - dz * sin(pitch)`, and at CAM_PITCH 0.63 that is
   * `0.808 dy + 0.589 dz`. One row further from the camera lifts a tile
   * 0.589 up the screen; one elevation step (0.42) drops it 0.339. So a
   * slope that falls TWO steps per row moves 0.589 - 0.679 = -0.09 up the
   * screen — which is to say it is drawn in the same place as the row in
   * front of it and is completely invisible.
   *
   * The first attempt fell two steps a row for five rows and could not be
   * seen at all. This is a flat glacis one step below the crest: every row
   * of it lifts a clean 0.589, so four rows put two and a half tiles of
   * visible ground beyond the revetment, and the eye finally reads the
   * gabions as standing on something rather than in the sea.
   *
   * ANY future slope in this game has to fall less than 1.74 steps per row
   * or it will not be visible. That is the number.
   */
  cv.rect(0, 7, C_COLS, 1, '4');
  cv.rect(0, 8, C_COLS, 4, '7');
  cv.rect(0, CREST_N, C_COLS, CREST_S - CREST_N + 1, '9');
  cv.rect(0, STEP_N, C_COLS, STEP_S - STEP_N + 1, '7');
  cv.rect(0, 20, C_COLS, 2, '6');
  cv.rect(0, 22, C_COLS, 2, '5');
  cv.rect(0, 24, C_COLS, 3, '4');
  cv.rect(0, 27, C_COLS, 3, '3');
  cv.rect(0, 30, C_COLS, 2, '2');
  cv.rect(0, 32, C_COLS, 2, '1');
  // Everything from the foot of the covered way down is the flat of the
  // common, because it was: Cambridge is a river town on a plain and the
  // whole of the high ground in this act is the ground somebody else holds.
  // The break lands at row 34, so the headquarters footprint sits entirely
  // on the level rather than with one corner up a terrace.
  cv.rect(0, 34, C_COLS, C_ROWS - 34, '0');
  return cv.lines();
}

/* ---------------------------------------------------------------------- *
 * What is standing on it
 * ---------------------------------------------------------------------- */

function props(season: Season): PropInstance[] {
  const w = season === 'winter';
  const out: PropInstance[] = [];
  const add = (list: Array<{ id: string; x: number; z: number; flip?: boolean }>) => {
    for (const p of list) out.push(p);
  };

  /* --- the works ------------------------------------------------------- *
   * The argument of the hill, in objects: a work nobody has finished, guns
   * there is no powder for, and eleven graves of men nobody shot.
   * ------------------------------------------------------------------- */

  // The unfinished work. Gabions half set, in a line that stops.
  for (let i = 0; i < 7; i++) {
    out.push({ id: 'gabion', x: 24.6 + i * 1.5, z: 16.4, flip: i % 2 === 0 });
  }
  // ...and then four more lying on their sides where the party knocked off.
  out.push(
    { id: 'fascineStack', x: 27.0, z: 19.4 },
    { id: 'fascineStack', x: 31.5, z: 19.6, flip: true },
    { id: 'gabion', x: 33.4, z: 18.2 },
    { id: 'barrow', x: 29.6, z: 18.0 },
    { id: 'toolChest', x: 25.4, z: 19.2 },
  );

  /*
   * THE REVETMENT.
   *
   * A gabion to every tile the whole width of the map, with five abatis laid
   * into it, and the row is solid the whole way. That is what a parapet is: a
   * wall of earth in baskets, not a line of ornaments with gaps you can walk
   * through. Scattering them at three-tile spacing looked like a bank from a
   * distance and behaved like a picket fence, and the reachability flood
   * found the pockets of crest it fenced off before anybody could walk into
   * one.
   */
  for (let x = 5; x < C_COLS - 4; x++) {
    out.push({ id: 'gabion', x: x + 0.5, z: CREST_N + 0.4, flip: x % 2 === 0, scale: 0.9 });
  }
  // Felled trees on the forward slope, laid with their sharpened branches
  // outward. Ugly, cheap, and worth more than any number of muskets to men
  // who cannot yet be relied on to stand and reload. Nobody can reach them
  // and nobody is meant to: they are what the enemy would have to come
  // through, drawn from the side that would not have to.
  for (const x of [8, 22, 36, 50, 64, 78]) {
    out.push({ id: 'abatis', x, z: CREST_N - 0.6, flip: (x / 14) % 2 === 0 });
  }
  for (const x of [4, 18, 32, 46, 60, 74]) {
    out.push({ id: 'abatis', x, z: CREST_N - 3.4, flip: x % 4 === 0 });
  }
  for (const x of [15, 29, 43, 57, 71]) {
    out.push({ id: 'palisade', x, z: CREST_N - 2.2, flip: x % 2 === 0 });
  }

  // The two guns the army has up here, and a pile of shot for guns it has not.
  out.push(
    { id: 'fieldGun', x: 44.0, z: 17.2 },
    { id: 'fieldGun', x: 52.0, z: 17.4, flip: true },
    { id: 'shotPile', x: 48.4, z: 18.0 },
    { id: 'powderCask', x: 46.6, z: 18.6 },
    { id: 'spyglassRest', x: 40.0, z: 14.6 },
  );

  // The traverse at the west end.
  out.push(
    { id: 'palisade', x: 12.0, z: 20.4 },
    { id: 'palisade', x: 16.0, z: 20.6, flip: true },
    { id: 'campTable', x: 14.6, z: 17.4 },
    { id: 'barrel', x: 11.4, z: 18.2 },
    { id: 'musketStack', x: 17.2, z: 17.0 },
  );

  // The guard post at the east end.
  out.push(
    { id: 'sentryBox', x: 66.0, z: 16.6 },
    { id: 'campKettle', x: 61.0, z: 18.4 },
    { id: 'barrel', x: 63.4, z: 18.8 },
    { id: 'campTable', x: 59.6, z: 19.2 },
    { id: 'musketStack', x: 64.2, z: 18.0 },
    { id: 'drum', x: 62.2, z: 16.4 },
  );

  // The burying ground. Eleven of them, named on boards, and not one shot.
  for (let i = 0; i < 11; i++) {
    out.push({
      id: 'graveMarker',
      x: 42.6 + (i % 6) * 1.7,
      z: WORKS_S - 2.4 + Math.floor(i / 6) * 1.6,
    });
  }

  // The flag. In summer it is a bare staff on the crest, which is what the
  // camp had; on 1 January 1776 the Grand Union goes up it, and that is the
  // last thing this act does.
  out.push({ id: w ? 'grandUnion' : 'flagStaff', x: 36.0, z: CREST_N + 1.4 });

  /* --- the covered way, and the slope ---------------------------------- */
  out.push(
    { id: 'fascineStack', x: 34.4, z: 25.6 },
    { id: 'woodpile', x: 37.0, z: 28.4 },
    { id: 'barrow', x: 36.2, z: 32.0, flip: true },
  );

  /* --- headquarters ----------------------------------------------------- */
  out.push(
    { id: 'tentMarquee', x: 24.0, z: 40.0 },
    { id: 'sentryBox', x: 44.0, z: 43.4 },
    { id: 'sentryBox', x: 51.4, z: 43.4, flip: true },
    { id: 'wagonTilt', x: 60.0, z: 46.4 },
    { id: 'horse', x: 68.0, z: 40.6 },
    { id: 'horse', x: 71.4, z: 41.8, flip: true },
    { id: 'trough', x: 66.0, z: 42.4 },
    { id: 'cartTwoWheel', x: 63.0, z: 40.0 },
    { id: 'woodpile', x: 38.4, z: 40.4 },
    { id: 'campTable', x: 28.0, z: 43.6 },
    { id: 'chestSurveyor', x: 21.0, z: 43.2 },
    { id: 'papers', x: 26.4, z: 43.0 },
    { id: 'bench', x: 55.0, z: 47.2 },
    { id: 'barrel', x: 34.4, z: 46.6 },
  );

  /* --- the camp street --------------------------------------------------
   * Two ranks of shelter down a beaten street, and the whole argument of the
   * act is that the two ranks are not the same. Rhode Island came up tented
   * and drilled because Rhode Island had spent the money; two hundred yards
   * on, men are sleeping under brush. A student who walks the street should
   * be able to see the inequality before anybody explains it.
   * ------------------------------------------------------------------- */

  // The north rank: Greene's brigade. Proper wedge tents, dressed by the line.
  //
  // Nine in July. Five in December, and the four gaps are not decoration —
  // they are where four companies of Connecticut men were, and the ground
  // they stood on is the only thing left of them on this map.
  for (let i = 0; i < (w ? 5 : 9); i++) {
    out.push({ id: 'tentWedge', x: 10.0 + i * 5.2, z: TENTS_N + 1.2, flip: i % 2 === 1 });
  }

  if (!w) {
    // The south rank, west half: boards, sailcloth, brush, and no two alike.
    const shanty = ['brushShelter', 'tentWedge', 'brushShelter', 'brushShelter', 'tentWedge'];
    for (let i = 0; i < 5; i++) {
      out.push({ id: shanty[i], x: 9.0 + i * 5.6, z: TENTS_S + 1.2, flip: i % 2 === 0 });
    }
    // The south rank, east half: worse again, and it goes on out of the frame.
    for (let i = 0; i < 6; i++) {
      out.push({ id: 'brushShelter', x: 40.0 + i * 5.4, z: TENTS_S + 1.4, flip: i % 3 === 0 });
    }
  }
  // In winter the south rank is log huts, and they are STRUCTURES rather than
  // props — see `structures()`. A hut is a building with a door in it, and
  // the difference between a shelter you crawl under and a shelter you walk
  // into is most of what the army spent December finding out.

  // The mess fires down the middle of the street, one to six men.
  for (let i = 0; i < 7; i++) {
    out.push({ id: 'campKettle', x: 12.0 + i * 8.4, z: STREET_N + 1.6 });
    out.push({ id: 'woodpile', x: 14.2 + i * 8.4, z: STREET_S - 0.6, flip: i % 2 === 0 });
  }
  out.push(
    { id: 'washTub', x: 20.4, z: STREET_S - 0.8 },
    { id: 'washTub', x: 56.0, z: STREET_N + 1.0, flip: true },
    { id: 'drum', x: 33.0, z: STREET_S - 1.2 },
    { id: 'musketStack', x: 26.0, z: STREET_N + 0.8 },
    { id: 'musketStack', x: 48.6, z: STREET_S - 0.8, flip: true },
    { id: 'musketStack', x: 66.0, z: STREET_N + 1.2 },
    { id: 'campTable', x: 44.0, z: STREET_N + 0.6 },
    { id: 'sack', x: 42.2, z: STREET_N + 1.4 },
    { id: 'barrel', x: 70.4, z: STREET_S - 1.0 },
    { id: 'crate', x: 72.0, z: STREET_S - 0.4 },
  );

  // The necessaries, at the bottom of the field and downwind. Two of them for
  // an army of sixteen thousand, which is the arithmetic behind the graves.
  out.push(
    { id: 'necessary', x: 6.4, z: C_ROWS - 5.4 },
    { id: 'necessary', x: 10.6, z: C_ROWS - 5.0, flip: true },
  );

  // The wagon park and the magazine yard.
  out.push(
    { id: 'wagonTilt', x: 66.0, z: PARADE_Z + 1.0 },
    { id: 'wagonTilt', x: 74.0, z: PARADE_Z + 2.4, flip: true },
    { id: 'powderCask', x: 71.0, z: PARADE_Z - 0.6 },
    { id: 'powderCask', x: 72.4, z: PARADE_Z - 0.2 },
    { id: 'crate', x: 78.0, z: PARADE_Z + 1.4 },
    { id: 'barrel', x: 63.4, z: PARADE_Z + 3.6 },
  );

  // Knox's train, on the winter map only, standing in the yard where the
  // whole camp walks past it. The single piece of unambiguously good news in
  // the act, and the only saturated colour in a grey frame.
  if (w) {
    out.push(
      { id: 'gunSledge', x: 36.0, z: PARADE_Z + 1.0 },
      { id: 'gunSledge', x: 46.0, z: PARADE_Z + 2.2, flip: true },
      { id: 'shotPile', x: 42.0, z: PARADE_Z + 3.0 },
    );
  }

  /* --- the trees --------------------------------------------------------
   * The lane to headquarters was famously under elms. In December they are
   * the same elms and there is nothing on them, which is most of what makes
   * the winter map read as the same place.
   * ------------------------------------------------------------------- */
  const shade = w ? 'oakBare' : 'elm';
  const conifer = w ? 'pineSnow' : 'pineTree';
  add(scatter(shade, [34, 47], [34, 39], 4, 1.1, 81));
  add(scatter(shade, [62, 38], [62, 48], 4, 1.1, 82));
  add(scatter(shade, [2, 44], [2, 58], 5, 1.2, 83));
  add(scatter(shade, [83, 42], [83, 58], 5, 1.2, 84));
  add(scatter(conifer, [4, 26], [16, 24], 4, 1.4, 85));
  add(scatter(conifer, [70, 24], [82, 27], 4, 1.4, 86));
  add(scatter(w ? 'oakBare' : 'oak', [20, 30], [30, 28], 3, 1.3, 87));
  add(scatter(w ? 'oakBare' : 'oak', [52, 28], [64, 30], 3, 1.3, 88));
  if (!w) {
    add(scatter('shrub', [8, 34], [24, 33], 6, 0.8, 89));
    add(scatter('shrub', [58, 33], [78, 34], 6, 0.8, 90));
  } else {
    add(scatter('snowDrift', [8, 34], [24, 33], 6, 0.9, 89));
    add(scatter('snowDrift', [58, 33], [78, 34], 6, 0.9, 90));
    add(scatter('snowDrift', [10, 46], [76, 46], 8, 1.2, 91));
    add(scatter('snowDrift', [12, 20], [72, 20], 7, 1.0, 92));
  }

  // The fence along the road out, and the rail into the paddock.
  for (let x = 6; x <= 78; x += 6) out.push({ id: 'railFence', x, z: C_ROWS - 3.5 });
  out.push({ id: 'gate', x: 42.0, z: C_ROWS - 3.5 });
  out.push({ id: 'signpost', x: 45.6, z: C_ROWS - 4.8 });

  return out;
}

/* ---------------------------------------------------------------------- *
 * The buildings
 * ---------------------------------------------------------------------- */

function structures(season: Season): StructureDef[] {
  return [
    /*
     * THE VASSALL HOUSE.
     *
     * A Georgian mansion on Brattle Street, built in 1759, and its owner was
     * a loyalist who had left it in a hurry. Washington took it over in July
     * 1775 and ran the siege out of it until April 1776. Later it was
     * Longfellow's house for forty-five years, which is why it is still
     * standing.
     *
     * The fact worth putting in front of a student is not that it is
     * handsome. It is that the commander in chief of the Continental Army
     * spent the first winter of the Revolution living in a house he had
     * confiscated from a man on the other side, and that a great many of the
     * best houses in Cambridge were empty that year for exactly that reason.
     * The examine text does that job; the building only has to be obviously
     * the finest thing on the map.
     */
    {
      id: 'vassall',
      x: HOUSE_X, z: HOUSE_Z, w: HOUSE_W, d: HOUSE_D, h: 3.6,
      style: 'clapboard', roof: 'hip', pitch: 1.3,
      cornice: true, plinth: true, storeyH: 1.5, seed: 41,
      faces: {
        // The front, on Brattle Street, toward the camera. Five bays and a
        // pedimented door on the centre line.
        south: [
          { at: 1.5, kind: 'window' }, { at: 4.5, kind: 'window' },
          { at: 7.5, kind: 'door' },
          { at: 10.5, kind: 'window' }, { at: 13.5, kind: 'window' },
          { at: 1.5, kind: 'window', storey: 1 }, { at: 4.5, kind: 'window', storey: 1 },
          { at: 7.5, kind: 'window', storey: 1 },
          { at: 10.5, kind: 'window', storey: 1 }, { at: 13.5, kind: 'window', storey: 1 },
        ],
        // The garden front, looking up the hill toward the works — which is
        // the view from the room he did the work in.
        north: [
          { at: 2.5, kind: 'window' }, { at: 5.5, kind: 'window' },
          { at: 7.5, kind: 'doorway' },
          { at: 9.5, kind: 'window' }, { at: 12.5, kind: 'window' },
          { at: 2.5, kind: 'window', storey: 1 }, { at: 7.5, kind: 'window', storey: 1 },
          { at: 12.5, kind: 'window', storey: 1 },
        ],
        east: [{ at: 4.0, kind: 'window' }, { at: 4.0, kind: 'window', storey: 1 }],
        west: [{ at: 4.0, kind: 'window' }, { at: 4.0, kind: 'window', storey: 1 }],
      },
      chimneys: [
        { at: 3.0, on: 'ridge', h: 1.1 }, { at: 11.5, on: 'ridge', h: 1.1 },
      ],
    },

    /* The stable and coach house, off to the east of the forecourt. */
    {
      id: 'hqStable',
      x: 66, z: 36, w: 10, d: 5, h: 2.9,
      style: 'clapboard', roof: 'gable', pitch: 1.2, seed: 42,
      faces: {
        south: [
          { at: 2.0, kind: 'doorway' }, { at: 5.0, kind: 'window' }, { at: 8.0, kind: 'doorway' },
        ],
      },
    },

    /* The guard house at the gate of the lane. */
    {
      id: 'guardHouse',
      x: 24, z: 46, w: 6, d: 4, h: 2.4,
      style: 'clapboard', roof: 'gable', pitch: 1.0, seed: 43,
      faces: { south: [{ at: 2.5, kind: 'doorway' }, { at: 4.5, kind: 'window' }] },
      chimneys: [{ at: 0.6, on: 'west', h: 1.2 }],
    },

    /*
     * The magazine. Brick, small, thick-walled, and standing well away from
     * every fire in the camp — and there is very nearly nothing in it. It is
     * built like a bank vault around thirty-six barrels.
     */
    {
      id: 'magazine',
      x: 72, z: 46, w: 6, d: 4, h: 2.6,
      style: 'brick', roof: 'gable', pitch: 1.0, seed: 44,
      faces: { south: [{ at: 3.0, kind: 'door' }] },
    },

    /*
     * The winter huts.
     *
     * By December the army was building log huts — the tents were unusable
     * and there was no other way to get through a New England winter on open
     * ground. They stand on the same rank the summer's brush shelters stood
     * on, so the student walks the same street and finds a different thing.
     */
    ...(season === 'winter'
      ? [8, 16, 24, 32, 40, 48, 56].map((x, i): StructureDef => ({
        id: `hut${i}`,
        x, z: TENTS_S, w: 6, d: 3, h: 1.9,
        style: 'log', roof: 'gable', pitch: 0.8, seed: 50 + i,
        faces: { south: [{ at: 3.0, kind: 'doorway' }] },
        chimneys: [{ at: 0.6, on: 'west', h: 1.0 }],
      }))
      : []),

    /*
     * Charlestown, across the water: the ground they hold, and what is left
     * of the town they burnt on the seventeenth of June to clear their way up
     * the hill. These are roofless shells and they are meant to read as
     * roofless from a mile off, which is the one thing this camera is good at.
     */
    /*
     * Low, narrow, and a lot of them. The first version was five six-tile
     * brick boxes two storeys high, which from the parapet read as a row of
     * new warehouses rather than as four hundred burnt houses — the eye
     * takes height and regularity for construction, and a ruin has to be
     * neither. Nothing here is more than a storey and a half, no two are the
     * same width, and the gaps between them are wider than the walls.
     */
    /*
     * CHARLESTOWN, AS IT LOOKED FROM THIS HILL.
     *
     * Chimney stacks, and almost nothing else. Four hundred houses burnt on
     * the seventeenth of June and what stood afterwards was masonry: the
     * chimneys, one storey of the odd brick wall, and a great deal of
     * nothing. That is also, conveniently, the one silhouette that cannot be
     * mistaken for construction at this distance — the version before this
     * was five two-storey brick boxes six tiles wide and read as a row of
     * new warehouses, because the eye takes height and regularity for
     * building and a ruin has to be neither.
     */
    { id: 'stack0', x: 7, z: 0, w: 1, d: 1, h: 2.2, style: 'brick', roof: 'none', seed: 60 },
    { id: 'stack1', x: 11, z: 1, w: 1, d: 1, h: 1.6, style: 'brick', roof: 'none', seed: 61 },
    { id: 'stack2', x: 14, z: 2, w: 1, d: 1, h: 2.4, style: 'brick', roof: 'none', seed: 62 },
    { id: 'stack3', x: 19, z: 0, w: 1, d: 1, h: 1.8, style: 'brick', roof: 'none', seed: 63 },
    { id: 'stack4', x: 23, z: 1, w: 1, d: 1, h: 2.0, style: 'brick', roof: 'none', seed: 64 },
    { id: 'stack5', x: 26, z: 2, w: 1, d: 1, h: 1.4, style: 'brick', roof: 'none', seed: 65 },
    { id: 'stack6', x: 31, z: 0, w: 1, d: 1, h: 2.3, style: 'brick', roof: 'none', seed: 66 },
    { id: 'stack7', x: 35, z: 1, w: 1, d: 1, h: 1.7, style: 'brick', roof: 'none', seed: 67 },
    { id: 'stack8', x: 38, z: 2, w: 1, d: 1, h: 2.1, style: 'brick', roof: 'none', seed: 68 },
    { id: 'stack9', x: 43, z: 0, w: 1, d: 1, h: 1.5, style: 'brick', roof: 'none', seed: 69 },
    { id: 'stack10', x: 47, z: 1, w: 1, d: 1, h: 2.4, style: 'brick', roof: 'none', seed: 70 },
    { id: 'stack11', x: 50, z: 2, w: 1, d: 1, h: 1.9, style: 'brick', roof: 'none', seed: 71 },
    { id: 'stack12', x: 55, z: 0, w: 1, d: 1, h: 1.6, style: 'brick', roof: 'none', seed: 72 },
    { id: 'stack13', x: 59, z: 1, w: 1, d: 1, h: 2.2, style: 'brick', roof: 'none', seed: 73 },
    { id: 'stack14', x: 62, z: 2, w: 1, d: 1, h: 1.4, style: 'brick', roof: 'none', seed: 74 },
    { id: 'stack15', x: 67, z: 0, w: 1, d: 1, h: 2.0, style: 'brick', roof: 'none', seed: 75 },
    { id: 'stack16', x: 71, z: 1, w: 1, d: 1, h: 1.8, style: 'brick', roof: 'none', seed: 76 },
    { id: 'stack17', x: 74, z: 2, w: 1, d: 1, h: 2.3, style: 'brick', roof: 'none', seed: 77 },
    { id: 'stack18', x: 79, z: 0, w: 1, d: 1, h: 1.6, style: 'brick', roof: 'none', seed: 78 },
    { id: 'ruinWall1', x: 16, z: 2, w: 4, d: 1, h: 0.9, style: 'brick', roof: 'none', seed: 90 },
    { id: 'ruinWall2', x: 36, z: 2, w: 5, d: 1, h: 0.8, style: 'brick', roof: 'none', seed: 91 },
    { id: 'ruinWall3', x: 57, z: 2, w: 4, d: 1, h: 1.0, style: 'brick', roof: 'none', seed: 92 },
    { id: 'ruinWall4', x: 70, z: 2, w: 3, d: 1, h: 0.8, style: 'brick', roof: 'none', seed: 93 },
  ];
}

/* ---------------------------------------------------------------------- *
 * The map
 * ---------------------------------------------------------------------- */

export function cambridge(season: Season): MapDef {
  const w = season === 'winter';
  return {
    id: w ? 'CB-CAMP-W' : 'CB-CAMP',
    title: w ? 'Cambridge — the lines' : 'Cambridge — the camp',
    when: w ? 'December 1775' : 'July 1775',
    light: w ? LIGHT.campWinter : LIGHT.campSummer,
    ground: ground(season),
    elev: elevation(),
    legend: CAMP_LEGEND,
    props: props(season),
    structures: structures(season),
    spawn: w ? { x: 34, z: 57, facing: 3 } : { x: 34, z: 61, facing: 3 },

    arrival: w
      ? [
        'The same street. You have walked it every day since July and this morning you do not '
        + 'recognise it.',
        'Half the tents are down and the men who slept in them are in Connecticut. What is left '
        + 'is building huts, because a tent will not do this and everybody has finally admitted it.',
        'Eleven days until the thirty-first, and after that every contract in this army has '
        + 'expired.',
      ]
      : [
        'The camp before Boston, the third of July, 1775. Sixteen thousand men on the rolls and '
        + 'nobody can tell you how many are fit.',
        'You took command under a tree on the common this morning. Nobody cheered, which was '
        + 'sensible of them, because nothing whatever has changed yet.',
        'The town is a mile off across the water, and the only army in this country that already '
        + 'looks like an army is in it.',
      ],

    /*
     * THREE ZONES, AND THE ACT'S WHOLE LIGHT ARC IS IN THEM.
     *
     * The camp is the map's own light. The lane is cooler and greener and
     * quieter — you have left the noise. The works are the low sun and the
     * cold, and the camera comes in because there is nothing up there worth
     * a wide shot except the thing you cannot reach.
     */
    zones: [
      {
        id: 'works',
        x: 0, z: 4, w: C_COLS, d: WORKS_S - 2,
        light: w ? LIGHT.linesWinter : LIGHT.linesNovember,
        dist: 28,
        onEnter: w
          ? [
            'The works have not improved and there are fewer men on them. What the frost did to '
            + 'the gabions the thaw will finish.',
          ]
          : [
            'Half a mile of earth thrown up by men who were not paid to dig, and beyond it a mile '
            + 'of water you cannot cross.',
          ],
      },
      {
        id: 'lane',
        x: 18, z: WORKS_S + 8, w: 60, d: 26,
        light: w ? LIGHT.campWinter : LIGHT.campLane,
        dist: 29,
      },
    ],

    ambient: w
      ? [
        {
          id: 'amb.december', x: 34, z: 56, r: 5, minLoudness: 0.32,
          variants: {
            temper: 'They will go home in December because a piece of paper says they may. Paper.',
            duty: 'They signed for eight months and they have served eight months. The paper is the whole quarrel.',
            ambition: 'Six weeks. Whatever this army is going to do, it does it before the tenth or not at all.',
            restraint: 'Every man who goes tells a county what this was like. Mind what you send home with them.',
          },
        },
        {
          id: 'amb.graves', x: 46, z: 21, r: 4.5, minLoudness: 0.34,
          variants: {
            restraint: 'Not one of those men was shot. The camp did it, and the camp is yours to order.',
            duty: 'Their names are in a return you signed. That is the only place they are written down.',
            temper: 'Camp fever, and a commissary who has never once been asked to explain himself.',
          },
        },
        {
          id: 'amb.huts', x: 20, z: 61, r: 5, minLoudness: 0.30,
          variants: {
            duty: 'They are building winter quarters for an army that is legally dissolved in eleven days.',
            vanity: 'Every officer who rides up here writes home about the huts. Let them find them good.',
            ambition: 'Knox is somewhere west of Albany with sixty guns and no word in a fortnight.',
          },
        },
      ]
      : [
        {
          id: 'amb.tents', x: 24, z: 52, r: 5, minLoudness: 0.30,
          variants: {
            restraint: 'Rhode Island came up tented and drilled. Two hundred yards on, men are under brush.',
            temper: 'Thirteen colonies, thirteen commissaries, thirteen ideas of what a soldier is owed.',
            duty: 'Whatever this is, you are to make one army of it by the autumn.',
          },
        },
        {
          id: 'amb.boston', x: 40, z: 16, r: 5, minLoudness: 0.30,
          variants: {
            duty: 'You can see everything they have. Seeing it and reaching it are different trades.',
            ambition: 'Seven positions, and the ice will carry men to four of them by January.',
            restraint: 'Count them again in a week. What you can see from here changes with the weather.',
          },
        },
        {
          id: 'amb.charlestown', x: 52, z: 14, r: 4.5, minLoudness: 0.32,
          variants: {
            ambition: 'They burned a town to take a hill. Let the country see it and count the cost for you.',
            vanity: 'Every account of this war will begin with that hill. You were not on it.',
            temper: 'Howe watched it burn from a boat and called it a regrettable necessity.',
          },
        },
        {
          id: 'amb.necessary', x: 9, z: C_ROWS - 5, r: 4, minLoudness: 0.34,
          variants: {
            restraint: 'Two of these for sixteen thousand men. The graves on the hill start here.',
            duty: 'You have written three general orders about the sinks. Write a fourth.',
          },
        },
        {
          id: 'amb.works', x: 29, z: 18, r: 4.5, minLoudness: 0.36,
          variants: {
            vanity: 'Every officer who rides up here writes home about the works. Let them find them good.',
            duty: 'You have never spared the spade. It is the one thing you have always been able to give them.',
            restraint: 'Works are for holding ground you mean to leave. Do not fall in love with them.',
          },
        },
      ],

    /*
     * THE SEVEN POSITIONS, AND WHY THEY ARE MARKS AND NOT OBJECTS.
     *
     * In the old build these were seven interactables at the spyglass, and
     * the player pressed SPACE seven times without moving. Here they are
     * fixed points across the water: stand on the parapet, hold the survey
     * key, and the glass names what it is looking at, with the range to it.
     * That is what a man with a glass on a rest actually does, and it is one
     * interaction where there were seven.
     *
     * `overWater` on all seven because the sightline test would otherwise be
     * blocked by the river — the water is solid to a walking man and clear
     * to a telescope, and this is the only place in the engine where those
     * two facts have to be told apart.
     *
     * Every one of these is a real position a student can afterwards be
     * shown on a map of Boston harbour in 1775.
     */
    marks: [
      { x: 24, z: 2, label: 'Charlestown', overWater: true, grants: 'map.a2.charlestown' },
      { x: 31, z: 0, label: "Bunker's Hill", overWater: true, grants: 'map.a2.bunker' },
      { x: 36, z: 3, label: 'the ferry ways', overWater: true, grants: 'map.a2.ferry' },
      { x: 45, z: 1, label: 'Christ Church', overWater: true, grants: 'map.a2.north_church' },
      { x: 50, z: 2, label: "Copp's Hill battery", overWater: true, grants: 'map.a2.copps' },
      { x: 60, z: 2, label: 'Beacon Hill', overWater: true, grants: 'map.a2.beacon' },
      { x: 70, z: 3, label: 'the fleet in the stream', overWater: true, grants: 'map.a2.shipping' },
      // And the ground behind him, which is the other half of a survey.
      { x: 49, z: 38, label: 'head quarters' },
      { x: 29, z: 18, label: 'the unfinished work' },
      { x: 47, z: WORKS_S - 1, label: 'the burying ground' },
      { x: 75, z: 48, label: 'the magazine' },
      { x: 32, z: PARADE_Z + 2, label: 'the parade' },
    ],

    npcs: campNpcs(season),
    interactables: campThings(season),

    portals: [
      {
        id: 'hq-door',
        x: DOOR_X - 1, z: DOOR_Z, w: 3, d: 1,
        to: w ? 'CB-HQ-W' : 'CB-HQ',
        at: [19, 20], facing: 3,
        label: 'go in at the headquarters door',
        transition: 'cut',
      },
    ],
  };
}

export const CAMBRIDGE_SUMMER = cambridge('summer');
export const CAMBRIDGE_WINTER = cambridge('winter');
