/**
 * VALLEY FORGE — 19 December 1777 to 19 June 1778.
 *
 * ONE PLACE, THREE TIMES, AND THE PLACE IS THE ARGUMENT.
 *
 * `VF-CAMP` is a brigade street on the Valley Forge plateau, and it is
 * built three times out of one function: December, when there are no huts
 * and the men are living in the open while they cut them; March, when the
 * huts are up and the Grand Parade below the street has von Steuben on it;
 * and May, when the same street is green and a running fire goes down it
 * for the French alliance.
 *
 * ORIENTATION:
 *     up the screen    = up the brigade street, toward the inner line and
 *                        the felled hillside the huts were cut from
 *     down the screen  = the Grand Parade, and beyond it the Schuylkill road
 *
 * THE THING THIS MAP EXISTS TO CORRECT.
 *
 * Ask anyone what Valley Forge was and you will be told a story about
 * suffering: bare feet in snow, a bloody trail, a man praying alone in the
 * woods. Two of those are true and the third is an invention of Parson
 * Weems, who also invented the cherry tree.
 *
 * What the record actually shows is a CONSTRUCTION PROJECT. The hutting
 * order of 18 December 1777 specified the dimensions — fourteen feet by
 * sixteen, six and a half feet to the eaves, the door in the side toward
 * the street, the fireplace at the rear, the gaps daubed with clay — and
 * offered twelve dollars to the first squad in each regiment to finish one
 * to the specification. Squads that built theirs wrong pulled them down and
 * built them again. Two thousand huts went up in about six weeks, on a
 * grid, by brigade, by an army that had no nails, few saws, and, on the
 * day the order was given, two thousand eight hundred and ninety-eight men
 * unfit for duty for want of shoes.
 *
 * So this map is a GRID. The huts are in ranks, at regular intervals, all
 * the same size, because that is what they were. The misery and the order
 * are in the same frame and neither one is allowed to cancel the other —
 * which is the whole of `docs/05` §5.1 and the reason the act has no
 * battle in it and does not need one.
 *
 * AND WHAT IT DOES NOT SHOW.
 *
 * There is no snow on the ground in most of this act, and that is not an
 * oversight. The winter of 1777–78 at Valley Forge was, by the standards of
 * that decade, mild; what killed two thousand men was not cold but typhus,
 * typhoid, dysentery and smallpox in a camp of twelve thousand with no
 * sanitation, and most of them died in the spring rather than in January.
 * A picturesque blizzard would be a comfortable lie. The ground is mud.
 */

import type { MapDef, PropInstance, StructureDef } from '../types';
import { LIGHT } from '../palette';
import { Canvas, scatter } from './paint';
import { FIELD_LEGEND, NE_INDOOR_LEGEND } from './legend';
import { campNpcs, pottsNpcs, hospitalNpcs } from './valleyforge-people';
import { campThings, pottsThings, hospitalThings } from './valleyforge-things';

/** Which of the act's three moments this build of the camp is. */
export type Forge = 'december' | 'march' | 'may';

/* ---------------------------------------------------------------------- *
 * THE BRIGADE STREET
 * ---------------------------------------------------------------------- */

export const V_COLS = 78, V_ROWS = 66;

/** The street runs up the middle; the huts stand in ranks either side. */
export const V_STREET_W = 33, V_STREET_E = 44;
/** The two ranks of huts, and the interval the order specified. */
export const V_RANK_W = 10, V_RANK_E = 47;
export const V_HUT_Z0 = 14, V_HUT_GAP = 9, V_HUT_ROWS = 4;
/** The Grand Parade, below the camp. Where von Steuben happens. */
export const V_PARADE_N = 50, V_PARADE_S = 63;
/** Potts's house stands off the street, to the east, near the Schuylkill. */
export const V_POTTS_X = 62, V_POTTS_Z = 44;

/*
 * THE FOUR CLEAR BANDS, AND WHY EVERY BUILDING HAS TO BE IN ONE.
 *
 * The huts are on a grid and the grid is the whole visual argument, so
 * nothing may be allowed to break it — which means every building, every
 * examinable object and every portal has to live in ground the ranks do not
 * occupy. There are four such bands and they are:
 *
 *     x 0 .. 8      west of the west rank
 *     x 28 .. 33    between the west rank and the street
 *     x 44 .. 45    between the street and the east rank
 *     x 65 .. 78    east of the east rank
 *
 * plus everything below z 43, which is south of the last row of huts.
 *
 * The first build ignored all of this: the bake house sat inside a hut of
 * the west rank, the commissary inside one of the east, the hospital inside
 * another, and Potts's house on top of a fourth. The flood fill found every
 * one of them in one run, which is the entire reason it exists.
 */
export const V_BAND_W = 2, V_BAND_E = 69;

function campGround(state: Forge): string[] {
  const may = state === 'may';
  const cv = new Canvas(V_COLS, V_ROWS, may ? 'S' : 'C');

  /*
   * THE FELLED HILLSIDE, ACROSS THE TOP.
   *
   * Six hundred huts is an acre of oak a week, and the ground it came off
   * is at the head of the street with the stumps still in it. In May it is
   * greening over and the stumps are still there, because a stump does not
   * go away in five months.
   */
  cv.band(0, 6, 'W');
  cv.ragged('W', may ? 'S' : 'C', 0.34, 701);

  // The brigade street itself, beaten to mud and never dry.
  cv.rect(V_STREET_W, 6, V_STREET_E - V_STREET_W + 1, V_ROWS - 6, 'C');
  // Cross lanes between the ranks of huts, one per row of huts.
  for (let i = 0; i < V_HUT_ROWS; i++) {
    const z = V_HUT_Z0 + i * V_HUT_GAP + 5;
    cv.rect(6, z, V_COLS - 12, 3, 'C');
  }
  // The lane down to Potts's house and the Schuylkill road.
  cv.path([[V_STREET_E, 38], [54, 40], [V_POTTS_X + 2, 42]], 3.4, 'C');

  /*
   * THE GRAND PARADE.
   *
   * `parade` rather than `campmud`, and it is the only ground in the act
   * that looks deliberate: two thousand men drilled on it every day from
   * March and walked the ruts out of it. In December it is not a parade
   * yet — nobody is drilling — so it is mud like everything else, and that
   * difference is the act happening in the ground texture.
   */
  cv.rect(6, V_PARADE_N, V_COLS - 12, V_PARADE_S - V_PARADE_N + 1,
    state === 'december' ? 'C' : 'P');
  cv.ragged(state === 'december' ? 'C' : 'P', may ? 'S' : 'C', 0.26, 702);

  if (may) {
    // The first green comes up in the places nobody walks: between the
    // ranks, behind the huts, along the edges. Never on the street.
    cv.ragged('S', 'C', 0.22, 703);
  }
  cv.ragged('C', may ? 'S' : 'C', 0.20, 704);
  return cv.lines();
}

/**
 * The plateau falls away to the south, toward the parade and the river.
 *
 * Gently: at `CAM_PITCH` a slope of more than 1.74 elevation steps per row
 * is invisible, so this is one step every five or six rows and no more. The
 * point of it is that from the head of the street you can see down the
 * whole camp, which is the shot the act opens and closes on.
 */
function campElevation(): string[] {
  const cv = new Canvas(V_COLS, V_ROWS, '0');
  cv.band(0, 8, '5');
  cv.rect(0, 8, V_COLS, 8, '4');
  cv.rect(0, 16, V_COLS, 10, '3');
  cv.rect(0, 26, V_COLS, 12, '2');
  cv.rect(0, 38, V_COLS, 12, '1');
  cv.rect(0, 50, V_COLS, V_ROWS - 50, '0');
  cv.ragged('5', '4', 0.30, 711);
  cv.ragged('4', '3', 0.30, 712);
  cv.ragged('3', '2', 0.30, 713);
  cv.ragged('2', '1', 0.28, 714);
  cv.ragged('1', '0', 0.26, 715);
  return cv.lines();
}

function campProps(state: Forge): PropInstance[] {
  const out: PropInstance[] = [];
  const add = (l: Array<{ id: string; x: number; z: number; flip?: boolean }>) => {
    for (const p of l) out.push(p);
  };

  /*
   * THE RANKS OF HUTS, AND THE ONE LOOP THAT MAKES THE ACT.
   *
   * Same coordinates in all three states. In December they are `hutFrame`
   * and `forgeHutRaw` — pegged out, three courses up, no roofs. From March
   * they are `forgeHut`, finished, identical, in line. A player who walks
   * this street twice has watched a town get built without being told that
   * is what they were looking at.
   *
   * The interval is the order's: the huts stand in ranks with a lane
   * between each pair of rows, doors to the street. Regularity is the
   * point and is not softened.
   */
  for (let row = 0; row < V_HUT_ROWS; row++) {
    const z = V_HUT_Z0 + row * V_HUT_GAP;
    for (const [x, flip] of [[V_RANK_W, false], [V_RANK_E, true]] as const) {
      for (let k = 0; k < 3; k++) {
        const hx = x + k * 8;
        if (state === 'december') {
          /*
           * THE WORK COMES TOWARD YOU.
           *
           * The two ranks NEAREST the player are three courses up; the two
           * farthest are still pegged out on the ground. That is both the
           * truer picture — the brigades nearest the parade hutted first,
           * because that is where the order was read — and the only
           * arrangement that puts anything standing in the establishing
           * shot. Built the other way round, the whole December frame was
           * flat sills on mud receding into fog, in an act whose argument
           * is two thousand huts.
           */
          out.push(row >= 1
            ? { id: 'forgeHutRaw', x: hx, z, flip }
            : { id: 'hutFrame', x: hx, z, flip });
        } else {
          out.push({ id: 'forgeHut', x: hx, z, flip });
        }
      }
    }
  }

  // The head of the street: the hillside they are cutting it all out of.
  add(scatter('stumpCut', [4, 2], [V_COLS - 6, 5], 22, 0.7, 721));
  add(scatter('stumpCut', [4, 7], [V_COLS - 6, 9], 9, 0.9, 722));
  out.push(
    { id: 'greenTimber', x: 24, z: 8 },
    { id: 'greenTimber', x: 52, z: 8, flip: true },
    { id: 'sawhorse', x: 31, z: 10 },
    { id: 'sawhorse', x: 44, z: 10, flip: true },
  );

  if (state === 'december') {
    /*
     * THE DECEMBER STREET IS FULL OF WORK, AND IT HAS TO BE.
     *
     * The first build put the tools in a tidy handful and the frame came
     * out as an empty muddy field with a well in it — which is what the
     * ground looked like and is exactly the wrong thing to show, because
     * on the nineteenth of December this plateau held eleven thousand men
     * building two thousand houses at once. What a camp under construction
     * looks like is CLUTTER: timber dragged where it fell, sawhorses in
     * the road, chips everywhere, a fire every forty feet, and nowhere to
     * put your feet.
     *
     * So the street gets a deterministic scatter of the work, laid down
     * the middle where the camera is. It is the single biggest difference
     * between the December frame and the May one, and it is not the huts.
     */
    add(scatter('stumpCut', [V_STREET_W, 12], [V_STREET_E, 46], 14, 0.6, 741));
    add(scatter('greenTimber', [V_STREET_W, 14], [V_STREET_E - 2, 44], 7, 1.0, 742));
    add(scatter('sawhorse', [V_STREET_W, 16], [V_STREET_E, 42], 6, 0.9, 743));
    add(scatter('woodpile', [V_STREET_W, 18], [V_STREET_E, 40], 4, 1.0, 744));
    // And between the ranks, where the squads are working on their own huts.
    add(scatter('greenTimber', [12, 16], [28, 44], 6, 0.9, 745));
    add(scatter('greenTimber', [46, 16], [62, 44], 6, 0.9, 746));
    add(scatter('sawhorse', [12, 18], [28, 42], 5, 0.8, 747));
    add(scatter('sawhorse', [46, 18], [62, 42], 5, 0.8, 748));
    add(scatter('stumpCut', [10, 16], [64, 44], 18, 0.6, 749));
    out.push(
      { id: 'greenTimber', x: 31, z: 20 },
      { id: 'greenTimber', x: 42, z: 29, flip: true },
      { id: 'greenTimber', x: 31, z: 38 },
      { id: 'toolChest', x: 36, z: 22 },
      { id: 'sawhorse', x: 42, z: 31 },
      { id: 'barrow', x: 31, z: 34 },
      { id: 'ladder', x: 42, z: 21, flip: true },
      { id: 'brushShelter', x: 24, z: 45 },
      { id: 'brushShelter', x: 30, z: 47, flip: true },
      { id: 'brushShelter', x: 50, z: 46 },
      { id: 'brushShelter', x: 56, z: 44, flip: true },
    );
  }

  // Cook fires down the street, which is where the camp actually lived.
  for (let i = 0; i < 5; i++) {
    const z = 16 + i * 9;
    out.push({ id: 'cookFire', x: i % 2 ? V_STREET_W + 2 : V_STREET_E - 2, z });
    out.push({ id: 'campKettle', x: i % 2 ? V_STREET_W + 4 : V_STREET_E - 4, z: z + 1 });
  }
  out.push(
    { id: 'washTub', x: 31, z: 44 },
    { id: 'woodpile', x: 31, z: 26 },
    { id: 'woodpile', x: 42, z: 35, flip: true },
    { id: 'well', x: 46, z: 46 },
    { id: 'campTable', x: 38, z: 46 },
  );

  /*
   * THE GRAND PARADE. Empty in December — nobody drills a starving army —
   * and von Steuben's hundred men on it from March. In May the whole line
   * is on it for the *feu de joie*.
   */
  if (state === 'march') {
    out.push(
      { id: 'continentalFile', x: 30, z: V_PARADE_N + 4 },
      { id: 'continentalFile', x: 36, z: V_PARADE_N + 4 },
      { id: 'continentalFile', x: 42, z: V_PARADE_N + 4 },
      { id: 'continentalFile', x: 32, z: V_PARADE_N + 8 },
      { id: 'continentalFile', x: 38, z: V_PARADE_N + 8 },
      { id: 'bayonetPost', x: 22, z: V_PARADE_N + 5 },
      { id: 'bayonetPost', x: 26, z: V_PARADE_N + 5 },
      { id: 'bayonetPost', x: 52, z: V_PARADE_N + 5 },
      { id: 'drum', x: 46, z: V_PARADE_N + 3 },
    );
  }
  if (state === 'may') {
    // Eleven thousand men in two lines, which is eight files of sprites and
    // the fog doing the rest. The running fire goes down the front line
    // right to left and back along the second, which is why they are drawn
    // as two continuous ranks and not as a crowd.
    for (let k = 0; k < 7; k++) {
      out.push({ id: 'continentalFile', x: 14 + k * 8, z: V_PARADE_N + 3 });
      out.push({ id: 'continentalFile', x: 16 + k * 8, z: V_PARADE_N + 9 });
    }
    out.push(
      { id: 'flagStaff', x: 38, z: V_PARADE_N - 2 },
      { id: 'grandUnion', x: 38, z: V_PARADE_N - 3 },
      { id: 'fieldGun', x: 20, z: V_PARADE_S - 2 },
      { id: 'fieldGun', x: 56, z: V_PARADE_S - 2, flip: true },
      { id: 'drum', x: 44, z: V_PARADE_N - 1 },
    );
  }

  /*
   * THE BURYING GROUND, off to the west, and it is in every state.
   *
   * About two thousand men died here and the great majority of them died
   * of disease rather than of cold, and more of them died in April and May
   * than in January. The markers are in the May build too, and there are
   * more of them, because that is when it happened.
   */
  const graves = state === 'december' ? 5 : state === 'march' ? 11 : 16;
  for (let i = 0; i < graves; i++) {
    out.push({
      id: 'graveMarker',
      x: 8 + (i % 4) * 2.4,
      z: 52 + Math.floor(i / 4) * 2.2,
      flip: i % 2 === 1,
    });
  }

  // The country beyond: the Schuylkill woods, bare or in leaf.
  const tree = state === 'may' ? 'oak' : 'oakBare';
  add(scatter(tree, [2, 58], [22, 64], 9, 1.1, 731));
  add(scatter(tree, [58, 56], [76, 64], 10, 1.1, 732));
  add(scatter(tree, [70, 12], [76, 46], 7, 1.2, 733));
  return out;
}

function campStructures(state: Forge): StructureDef[] {
  return [
    /*
     * The Isaac Potts house — small, stone, two storeys, and deliberately
     * NOT a mansion. He lived in his marquee until the huts were built,
     * because he had said he would, and moved in here when they were.
     */
    {
      id: 'potts',
      x: V_POTTS_X, z: V_POTTS_Z, w: 7, d: 5, h: 3.4,
      style: 'stone', roof: 'gable', pitch: 1.2,
      cornice: true, seed: 91,
      faces: {
        south: [
          { at: 1.6, kind: 'window' }, { at: 4.0, kind: 'doorway' }, { at: 6.4, kind: 'window' },
        ],
        west: [{ at: 2.0, kind: 'window' }, { at: 4.4, kind: 'window' }],
      },
      chimneys: [{ at: 0.7, on: 'west', h: 1.6 }, { at: 7.3, on: 'east', h: 1.6 }],
    },
    // The commissary's store and the artificers' shop, in the side bands.
    {
      id: 'commissary', x: V_BAND_E, z: 30, w: 8, d: 5, h: 2.6,
      style: 'boarded', roof: 'gable', pitch: 1.25, seed: 92,
      faces: { south: [{ at: 2.5, kind: 'doorway' }, { at: 6.0, kind: 'doorway' }] },
    },
    {
      id: 'artificers', x: V_BAND_W, z: 34, w: 5, d: 4, h: 2.5,
      style: 'boarded', roof: 'shed', pitch: 0.9, seed: 93,
      faces: { south: [{ at: 2.5, kind: 'doorway' }] },
      chimneys: [{ at: 4.5, on: 'east', h: 1.2 }],
    },
    /*
     * The flying hospital. A hut like the others and larger, and the act
     * marks it: `docs/05` §5.3. Twelve men in fourteen by sixteen with the
     * berths built up the walls.
     */
    {
      id: 'hospital', x: V_BAND_E, z: 16, w: 8, d: 6, h: 2.4,
      style: 'boarded', roof: 'gable', pitch: 1.2, seed: 94,
      faces: { south: [{ at: 4.0, kind: 'doorway' }] },
      chimneys: [{ at: 0.8, on: 'west', h: 1.3 }],
    },
    // The bake house, which is where the fire cake came from.
    {
      id: 'bakehouse', x: V_BAND_W, z: 22, w: 5, d: 4, h: 2.2,
      style: 'stone', roof: 'shed', pitch: 0.9, seed: 95,
      faces: { south: [{ at: 2.5, kind: 'door' }] },
      chimneys: [{ at: 4.5, on: 'east', h: 1.5 }],
    },
    ...(state === 'december'
      ? [{
        // The marquee is not a structure — see the prop. This is the
        // guard hut at the head of the street, which went up first.
        id: 'guardhut', x: 24, z: 8, w: 5, d: 4, h: 2.2,
        style: 'boarded' as const, roof: 'gable' as const, pitch: 1.2, seed: 96,
        faces: { south: [{ at: 2.5, kind: 'doorway' as const }] },
      }]
      : []),
  ];
}

/* ---------------------------------------------------------------------- *
 * The camp, three times
 * ---------------------------------------------------------------------- */

const CAMP_TITLE: Record<Forge, [string, string]> = {
  december: ['The Valley Forge', '19 December 1777'],
  march: ['The Grand Parade', 'March 1778'],
  may: ['The Valley Forge', '6 May 1778'],
};

export function valleyForge(state: Forge): MapDef {
  const [title, when] = CAMP_TITLE[state];
  return {
    id: state === 'december' ? 'VF-CAMP' : state === 'march' ? 'VF-CAMP-M' : 'VF-CAMP-S',
    title,
    when,
    light: state === 'december' ? LIGHT.forgeDecember
      : state === 'march' ? LIGHT.forgeFebruary : LIGHT.forgeMay,
    fogNear: 36,
    fogFar: state === 'may' ? 108 : 88,
    ground: campGround(state),
    elev: campElevation(),
    legend: FIELD_LEGEND,
    props: campProps(state),
    structures: campStructures(state),
    npcs: campNpcs(state),
    interactables: campThings(state),
    /*
     * YOU STAND AT THE FOOT OF THE STREET AND THE CAMP RECEDES AWAY FROM YOU.
     *
     * `docs/05` §5.3 asks for a shallow three-quarter view down a brigade
     * street, receding, and that is a fact about where the player is put:
     * up-screen on this map is toward the felled hillside, so the huts have
     * to be BETWEEN the player and it or they are behind the camera.
     *
     * The first build spawned at z 12 — above the first rank — and the
     * establishing shot of the whole act was a bare hillside with two
     * sawhorses on it and not one hut in frame, in an act whose entire
     * argument is two thousand huts on a grid.
     */
    spawn: state === 'march'
      ? { x: 38, z: V_PARADE_N - 4, facing: 1 }
      : { x: 38, z: 46, facing: 1 },

    /*
     * The marks a surveyor takes from this ground.
     *
     * Deliberately the works of the camp rather than the country: he is not
     * surveying Pennsylvania here, he is looking at what his own army has
     * built, and the ranges are what tell you how big it is. Six hundred
     * huts on a grid is a town the size of the fourth-largest city in
     * America at that date, which is a fact best arrived at by measuring it.
     */
    marks: [
      { x: 38, z: 6, label: 'the felled ground', grants: 'obs.a5.stumps' },
      { x: V_RANK_W + 8, z: V_HUT_Z0, label: 'the first rank', grants: 'obs.a5.rank' },
      { x: V_RANK_E + 8, z: V_HUT_Z0 + V_HUT_GAP * 3, label: 'the last rank', grants: 'obs.a5.grid' },
      { x: V_POTTS_X + 3, z: V_POTTS_Z + 2, label: "Potts's house", grants: 'obs.a5.potts' },
      { x: V_BAND_E + 4, z: 19, label: 'the flying hospital', grants: 'obs.a5.hospital' },
      { x: 38, z: V_PARADE_N + 6, label: 'the Grand Parade', grants: 'obs.a5.parade' },
      { x: 11, z: 54, label: 'the burying ground', grants: 'obs.a5.graves' },
      { x: V_BAND_W + 2, z: 24, label: 'the bake house', grants: 'obs.a5.bake' },
    ],

    arrival: {
      december: [
        'The nineteenth of December, and the army marched onto this plateau this morning after '
        + 'eight days on the road from Whitemarsh. There is nothing here. There is a forge that '
        + 'burned two years ago, a hillside of oak, and eleven thousand men.',
        'The order went out yesterday. Fourteen feet by sixteen, six and a half feet at the eaves, '
        + 'door to the street, fireplace at the rear, gaps daubed with clay. Twelve dollars to the '
        + 'first party in each regiment that finishes one to the specification.',
        'A return made today: two thousand eight hundred and ninety-eight men unfit for duty '
        + 'because they are barefoot and otherwise naked. That is one man in four.',
      ],
      march: [
        'March, and the huts are up. Two thousand of them, in ranks, to the specification, and '
        + 'the men are inside them.',
        'A Prussian arrived at the end of February with a large dog, a French cook and a letter '
        + 'from Franklin. He speaks almost no English. He has taken a hundred men out of the line '
        + 'as a model company and he is drilling them himself, in person, which no officer of this '
        + 'army has ever done.',
        'Below the huts is a flat field the men have started calling the Grand Parade.',
      ],
      may: [
        'The sixth of May, and the street you first walked up in the mud is green.',
        'France has recognised the United States. The treaty was signed at Paris on the sixth of '
        + 'February and it took three months to cross. It was signed because of Saratoga, which '
        + 'was won by a man whose name is not in the despatch about it.',
        'The order for today specifies the ceremony exactly: the brigades paraded, a signal gun, a '
        + 'running fire of musketry from the right of the front line to the left and back along the '
        + 'second. Then three cheers. Then an extra gill of rum to every man.',
      ],
    }[state],

    ambient: [
      {
        id: 'amb5.order', x: 38, z: 20, r: 6, minLoudness: 0.30,
        variants: {
          duty: 'The specification is the whole of it. A hut a man built himself, to a measure he '
            + 'was given, is a hut he will keep the rain out of.',
          restraint: 'Twelve dollars is a great deal of money to men who have not been paid in '
            + 'five months. It is also cheaper than losing them.',
          ambition: 'Two thousand of them in six weeks. Nobody in Europe would believe this army '
            + 'could do it, and nobody in Europe is going to be told.',
        },
      },
      {
        id: 'amb5.parade', x: 38, z: V_PARADE_N + 6, r: 7, minLoudness: 0.34,
        variants: {
          ambition: 'A hundred men. In six weeks he will have the line. In three months he will '
            + 'have an army that can be marched at somebody.',
          temper: 'He is drilling them himself because your officers will not. Remember which of '
            + 'them said so out loud.',
          vanity: 'Every foreign officer Congress has sent you has wanted a command. This one '
            + 'asked for a hundred men and a field.',
          duty: 'They are learning to stand still. That is not a small thing. Every man who ran at '
            + 'Kip&rsquo;s Bay ran because nobody had ever taught him what to do instead.',
        },
      },
      {
        id: 'amb5.graves', x: 11, z: 54, r: 6, minLoudness: 0.26,
        variants: {
          duty: 'Most of them are not the cold. It is the camp fever, and the flux, and the pox, '
            + 'and there is no drain in eight acres.',
          restraint: 'They will die faster in April than they are dying now. Sickness follows the '
            + 'thaw, not the frost, and everyone here knows it and no one says it.',
          temper: 'Congress has been told. Congress has been told in writing, four times, in your '
            + 'hand.',
        },
      },
    ],

    portals: [
      {
        id: 'to-potts',
        x: V_POTTS_X + 3, z: V_POTTS_Z + 5,
        to: state === 'december' ? 'VF-POTTS' : 'VF-POTTS-M',
        at: [9, 17], facing: 0,
        label: "Potts's house",
      },
      /*
       * THE HOSPITAL HUT IS A DECEMBER DOOR ONLY, AND THAT IS DELIBERATE.
       *
       * The hut itself has one exit and it can only go to one place, so a
       * door into it from March or May would put the player back in
       * December on the way out. That could be solved with three copies of
       * the hut — and should not be, because the scene belongs to the
       * winter: `A5-D1` is a winter decision, the four men on the board are
       * sick that winter, and a hospital hut you can drop into in May with
       * the alliance being read on the field below is a different and much
       * worse scene than the one `docs/05` §5.3 asks for.
       */
      ...(state === 'december'
        ? [{
          id: 'to-hospital',
          x: V_BAND_E + 4, z: 23,
          to: 'VF-HOSPITAL',
          at: [10, 14] as [number, number],
          facing: 0 as const,
          label: 'the flying hospital',
        }]
        : []),
    ],
  };
}

export const VF_CAMP = valleyForge('december');
export const VF_CAMP_MARCH = valleyForge('march');
export const VF_CAMP_MAY = valleyForge('may');

/* ---------------------------------------------------------------------- *
 * THE POTTS HOUSE
 *
 * Two rooms and a passage on the ground floor, which is all the room there
 * was: he had a life guard, a family of aides, a great deal of
 * correspondence, and Martha from February, in a stone farmhouse about
 * twenty-four feet square.
 *
 * It is deliberately not the Vassall House. Cambridge headquarters was a
 * confiscated Tory mansion with a Palladian front and the Vassalls' own
 * plate still in the dining room; this is a rented ironmaster's dwelling
 * with a plain board floor and one good chair in it. The wall style says so
 * — `boarded`, not `panelled` and not `papered`.
 * ---------------------------------------------------------------------- */

const P_COLS = 30, P_ROWS = 24;

function pottsGround(): string[] {
  /*
   * 'b' — BOARD, EVERYWHERE, AND NOT ONE FLOORCLOTH IN THE HOUSE.
   *
   * The first build used 'k' out of the New England legend, which is the
   * kitchen floor, and every room in headquarters came out in red tile
   * like a Dutch parlour. This is a rented ironmaster's farmhouse with a
   * plain wide board floor in every room, and the absence of any covering
   * is the point: Cambridge headquarters had the Vassalls' own carpets in
   * it and this has boards, and the difference is the whole of what the
   * two houses say about the two winters.
   */
  const cv = new Canvas(P_COLS, P_ROWS, ' ');
  // Passage through the middle, front door to back.
  cv.rect(7, 4, 5, P_ROWS - 8, 'b');
  // The office, west: the map table, the papers, the work.
  cv.rect(2, 4, 5, 8, 'b');
  cv.rect(2, 12, 5, P_ROWS - 16, 'b');
  // The dining room, east, which is where the council sat.
  cv.rect(12, 4, 10, P_ROWS - 8, 'b');
  cv.rect(22, 6, 6, 8, 'b');
  return cv.lines();
}

function pottsWalls(): string[] {
  const cv = new Canvas(P_COLS, P_ROWS, ' ');
  cv.rect(1, 3, 28, 1, '#');
  cv.rect(1, P_ROWS - 4, 28, 1, '#');
  cv.rect(1, 3, 1, P_ROWS - 6, '#');
  cv.rect(28, 3, 1, P_ROWS - 6, '#');
  // The passage walls.
  cv.rect(6, 4, 1, P_ROWS - 8, '#');
  cv.rect(12, 4, 1, P_ROWS - 8, '#');
  cv.set(6, 9, '+');
  cv.set(12, 9, '+');
  cv.set(12, 16, '+');
  // The little back room off the dining room.
  cv.rect(22, 5, 1, 10, '#');
  cv.set(22, 10, '+');
  // Front door and back door.
  cv.set(9, 3, '+');
  cv.set(9, P_ROWS - 4, '+');
  return cv.lines();
}

export function pottsHouse(state: Forge): MapDef {
  const march = state !== 'december';
  return {
    id: march ? 'VF-POTTS-M' : 'VF-POTTS',
    title: "Potts's house",
    when: march ? 'March 1778' : 'December 1777',
    light: LIGHT.pottsHouse,
    interior: true,
    ceiling: true,
    wallStyle: 'boarded',
    /*
     * Plain lime whitewash over board. The one colour decision in this room
     * and it is a negative one: no paper, no panelling, no tint. Cambridge
     * got a blue-green printed ground because a Cambridge merchant could
     * afford imported paper; the Potts house got whitewash because it was a
     * farmhouse belonging to an ironmaster's widow.
     */
    wallTint: '#B4AE9E',
    wallHeight: 2.5,
    ground: pottsGround(),
    objects: pottsWalls(),
    legend: NE_INDOOR_LEGEND,
    props: [
      // The office, west, and it is a working room and not a study.
      { id: 'mapTable', x: 4.0, z: 6.4 },
      { id: 'chairWindsor', x: 4.0, z: 8.4 },
      { id: 'papers', x: 3.0, z: 5.4 },
      { id: 'bureauSlant', x: 2.6, z: 14.0 },
      { id: 'chairLadderback', x: 4.2, z: 15.4 },
      { id: 'chestSurveyor', x: 5.0, z: 18.0 },
      { id: 'candleStand', x: 2.6, z: 10.6 },

      // The passage: a plain hall with a stair and nothing in it.
      { id: 'bench', x: 9.0, z: 6.0 },
      { id: 'trunkBox', x: 10.0, z: 17.0 },

      // The dining room, east, which is the council room and the office and
      // the mess, because there is nowhere else.
      { id: 'tableLong', x: 16.0, z: 10.0 },
      { id: 'chairLadderback', x: 14.0, z: 8.4 },
      { id: 'chairLadderback', x: 14.0, z: 11.6 },
      { id: 'chairLadderback', x: 18.4, z: 8.4 },
      { id: 'chairLadderback', x: 18.4, z: 11.6 },
      { id: 'chairWing', x: 16.0, z: 6.0 },
      { id: 'chimneyNE', x: 20.0, z: 5.0 },
      { id: 'cupboardCorner', x: 20.6, z: 17.0 },
      { id: 'candleStand', x: 13.4, z: 14.0 },
      { id: 'bookStack', x: 17.6, z: 15.0 },

      // The back room: the aides, and the copying.
      { id: 'desk', x: 25.0, z: 8.0 },
      { id: 'chairSide', x: 25.0, z: 10.0 },
      { id: 'papers', x: 26.2, z: 7.2 },
      { id: 'bookcase', x: 26.6, z: 11.6 },
      ...(march
        ? [{ id: 'tentMarquee' as const, x: 25.0, z: 12.6 }]
        : []),
    ],
    npcs: pottsNpcs(state),
    interactables: pottsThings(state),
    spawn: { x: 9, z: 17, facing: 0 },
    portals: [
      {
        id: 'potts-out',
        x: 9, z: 20,
        to: march ? 'VF-CAMP-M' : 'VF-CAMP',
        at: [V_POTTS_X + 4, V_POTTS_Z + 7], facing: 1,
        label: 'the camp',
      },
    ],
    arrival: march
      ? [
        'The room he does his work in, and it is one room. There is a table, there are chairs, and '
        + 'there is a very great deal of paper.',
      ]
      : [
        'He lived in the marquee until the huts were built, because he had said he would, and the '
        + 'men knew it, and it was worth more than the discomfort cost.',
        'This is the room he moved into when they were finished. Mrs. Potts&rsquo;s farmhouse: '
        + 'stone, two storeys, and about twenty-four feet square.',
      ],
  };
}

export const VF_POTTS = pottsHouse('december');
export const VF_POTTS_MARCH = pottsHouse('march');

/* ---------------------------------------------------------------------- *
 * THE FLYING HOSPITAL
 *
 * One hut. Fourteen by sixteen, six and a half to the ridge, one
 * window-hole, and twelve men in it.
 *
 * `docs/05` §5.3 gives this scene R5's camera and framing without R5's grey
 * wash: eye level rather than above, close, and marked `sensitive`. The
 * light does the work — `hospitalHut` is the lowest exposure of any
 * interior in this game — and the room is small enough that the player
 * cannot stand back from it, which is the point.
 * ---------------------------------------------------------------------- */

const H_COLS = 22, H_ROWS = 20;

function hospitalGround(): string[] {
  const cv = new Canvas(H_COLS, H_ROWS, ' ');
  cv.rect(3, 4, 16, 12, 'H');
  return cv.lines();
}

function hospitalWalls(): string[] {
  const cv = new Canvas(H_COLS, H_ROWS, ' ');
  cv.rect(2, 3, 18, 1, '#');
  cv.rect(2, 16, 18, 1, '#');
  cv.rect(2, 3, 1, 14, '#');
  cv.rect(19, 3, 1, 14, '#');
  cv.set(10, 16, '+');
  return cv.lines();
}

export const VF_HOSPITAL: MapDef = {
  id: 'VF-HOSPITAL',
  title: 'The flying hospital',
  when: 'The Valley Forge, winter 1777–78',
  light: LIGHT.hospitalHut,
  interior: true,
  ceiling: true,
  wallStyle: 'boarded',
  wallTint: '#8C7C64',
  wallHeight: 2.0,
  ground: hospitalGround(),
  objects: hospitalWalls(),
  legend: NE_INDOOR_LEGEND,
  props: [
    { id: 'hospitalBunk', x: 5.0, z: 6.0 },
    { id: 'hospitalBunk', x: 5.0, z: 10.0 },
    { id: 'hospitalBunk', x: 5.0, z: 14.0 },
    { id: 'hospitalBunk', x: 17.0, z: 6.0, flip: true },
    { id: 'hospitalBunk', x: 17.0, z: 10.0, flip: true },
    { id: 'hospitalBunk', x: 17.0, z: 14.0, flip: true },
    { id: 'chimneyNE', x: 11.0, z: 5.0 },
    { id: 'campKettle', x: 13.0, z: 6.4 },
    { id: 'candleStand', x: 9.0, z: 7.0 },
    { id: 'washTub', x: 13.4, z: 13.0 },
    { id: 'papers', x: 8.6, z: 12.0 },
    { id: 'bench', x: 11.0, z: 11.0 },
  ],
  npcs: hospitalNpcs(),
  interactables: hospitalThings(),
  spawn: { x: 10, z: 14, facing: 0 },
  portals: [
    {
      id: 'hospital-out',
      x: 10, z: 15,
      to: 'VF-CAMP',
      at: [64, 25], facing: 1,
      label: 'out',
    },
  ],
  arrival: [
    'Fourteen feet by sixteen. Six and a half feet to the ridge, so you cannot stand up straight '
    + 'in it and neither can anybody else. One window-hole. Twelve men.',
    'Dr. Cochran is at the far end of it and he has been waiting for you.',
  ],
};
