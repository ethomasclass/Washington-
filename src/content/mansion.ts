/**
 * INSIDE THE HOUSE — both floors, each one map.
 *
 * A floor is one map with real walls and doorways, and the camera follows the
 * player from the passage into the parlour into the study without a single
 * transition. That was the point of choosing it: a house you are inside of,
 * rather than a series of rooms that happen to be adjacent in a menu.
 *
 * THE WALL RULE that makes it work is in `build.ts`: a wall with floor on the
 * near side of it is a back wall and is drawn to full height; a wall with floor
 * only on the far side is between the eye and the room, and is cut down to a
 * sill. Nobody has to rotate anything, and there is nothing to rotate.
 *
 * PLAN, 1775. The passage runs from the west door to the river door with the
 * black walnut stair in it. North of the passage: two parlours. South of it: a
 * chamber and the small dining room. Beyond the dining room, in the wing
 * finished this year, the study. Beyond the north parlour, through a doorway
 * with no door in it yet, the New Room — four walls, no plaster, no floor, and
 * open to the sky. You can walk into it. There is nothing in it.
 *
 * Orientation is the same as the estate: low row = east/river, high row =
 * west/front, low column = north, high column = south.
 */

import type { Interactable, MapDef, NpcDef, PropInstance } from '../types';
import { LIGHT } from '../palette';
import { INDOOR_LEGEND } from './legend';
import { Canvas } from './paint';
import { MARTHA, HOUSEMAID } from './people';

const W = 40, H = 22;

/* ---------------------------------------------------------------------- *
 * GROUND FLOOR
 * ---------------------------------------------------------------------- */

function groundFloorTiles(): string[] {
  const cv = new Canvas(W, H, ' ');
  // Main block.
  cv.rect(7, 2, 25, 19, '.');
  // The passage takes a painted floorcloth, which is what a fine hall had
  // before anybody in Virginia owned a carpet big enough.
  cv.rect(18, 3, 3, 17, 'p');
  // The west parlour is the best room in the house and gets the carpet.
  cv.rect(8, 12, 9, 8, 'c');
  // The south wing: the study, finished this year.
  cv.rect(31, 7, 8, 12, '.');
  // The north wing shell: no floor laid, so it is the building site's ground.
  cv.rect(1, 5, 7, 13, 'x');
  return cv.lines();
}

function groundFloorWalls(): string[] {
  const cv = new Canvas(W, H, ' ');
  const box = (x: number, z: number, w: number, d: number) => {
    for (let c = x; c < x + w; c++) { cv.set(c, z, '#'); cv.set(c, z + d - 1, '#'); }
    for (let r = z; r < z + d; r++) { cv.set(x, r, '#'); cv.set(x + w - 1, r, '#'); }
  };
  box(7, 2, 25, 19);          // the 1758 block
  box(31, 7, 8, 12);          // the south wing
  box(1, 5, 7, 13);           // the north wing shell

  // The passage walls, and the cross walls that make four rooms of the rest.
  for (let r = 3; r < 20; r++) { cv.set(17, r, '#'); cv.set(21, r, '#'); }
  for (let c = 8; c < 17; c++) cv.set(c, 11, '#');
  for (let c = 22; c < 31; c++) cv.set(c, 11, '#');

  // Doorways. A gap in a wall is a doorway; there is nothing else to it.
  cv.set(17, 6, ' '); cv.set(17, 16, ' ');
  cv.set(21, 6, ' '); cv.set(21, 16, ' ');
  cv.set(31, 13, ' ');                       // dining room into the study
  cv.set(7, 8, ' '); cv.set(7, 9, ' ');      // into the unfinished wing
  cv.set(19, 20, ' ');                       // the west front door
  cv.set(19, 2, ' ');                        // the river door
  return cv.lines();
}

function groundFloorProps(): PropInstance[] {
  return [
    // --- the passage: the stair, and almost nothing else ---------------
    { id: 'chairSide', x: 18.6, z: 12.5 },
    { id: 'chairSide', x: 20.4, z: 12.5, flip: true },
    { id: 'candleStand', x: 20.4, z: 5.4 },
    { id: 'framedPortrait', x: 18.4, z: 3.4 },

    // --- the west parlour: the best room in the house -------------------
    { id: 'mantel', x: 12.5, z: 12.5, scale: 0.6 },
    { id: 'armchair', x: 10.2, z: 15.4 },
    { id: 'armchair', x: 14.6, z: 15.4, flip: true },
    { id: 'tableRound', x: 12.4, z: 16.6 },
    { id: 'framedPortrait', x: 9.4, z: 12.4 },
    { id: 'candleStand', x: 15.6, z: 13.6 },
    { id: 'bookStack', x: 12.4, z: 16.0 },

    // --- the little parlour ---------------------------------------------
    { id: 'mantel', x: 12.5, z: 3.5, scale: 0.6 },
    { id: 'tableRound', x: 12.4, z: 7.4 },
    { id: 'chairSide', x: 10.2, z: 8.2 },
    { id: 'chairSide', x: 14.6, z: 8.2, flip: true },
    { id: 'spinningWheel', x: 15.4, z: 5.2 },

    // --- the chamber below stairs ---------------------------------------
    { id: 'bedTester', x: 26.0, z: 5.4 },
    { id: 'chestDrawers', x: 23.2, z: 9.0 },
    { id: 'candleStand', x: 29.4, z: 8.0 },
    { id: 'trunkBox', x: 29.0, z: 9.6 },

    // --- the small dining room -------------------------------------------
    { id: 'mantel', x: 24.5, z: 12.5, scale: 0.6 },
    { id: 'tableLong', x: 26.2, z: 16.4 },
    { id: 'chairSide', x: 23.4, z: 17.4 },
    { id: 'chairSide', x: 29.0, z: 17.4, flip: true },
    { id: 'chairSide', x: 24.8, z: 14.6 },
    { id: 'chairSide', x: 27.6, z: 14.6, flip: true },
    { id: 'sideboard', x: 29.2, z: 12.6 },

    // --- the study, one year old ------------------------------------------
    { id: 'mantel', x: 34.5, z: 7.5, scale: 0.55 },
    { id: 'desk', x: 35.0, z: 12.0 },
    { id: 'chairSide', x: 35.0, z: 13.6 },
    { id: 'bookcase', x: 32.6, z: 8.6 },
    { id: 'bookcase', x: 37.2, z: 8.6 },
    { id: 'globe', x: 37.4, z: 12.4 },
    { id: 'papers', x: 33.6, z: 12.2 },
    { id: 'chestSurveyor', x: 33.2, z: 16.2 },
    { id: 'candleStand', x: 37.4, z: 15.8 },

    // --- the New Room, which is a room only on the drawing ----------------
    { id: 'sawhorse', x: 3.4, z: 12.4 },
    { id: 'timberStack', x: 4.6, z: 15.2 },
    { id: 'toolChest', x: 2.6, z: 9.4 },
    { id: 'ladder', x: 6.2, z: 7.4 },
    { id: 'barrow', x: 4.2, z: 8.2 },
  ];
}

function groundFloorThings(): Interactable[] {
  return [
    /* --- the study: the densest few square metres in the act ---------- */
    {
      id: 'drawer',
      label: 'the locked drawer',
      x: 35, z: 12,
      examine:
        'The middle drawer of the desk, and the only thing in this house you keep locked. In it, '
        + 'folded once, a document in French with your signature at the foot of it.',
      document: 'DOC-A1.1',
    },
    {
      id: 'fairfax-letter',
      label: 'a letter, unfinished',
      x: 34, z: 12,
      examine:
        'Your own hand, copied into the letter book last August. To Bryan Fairfax, who wanted one '
        + 'more petition to the King.',
      document: 'DOC-A1.6',
    },
    {
      id: 'resolves',
      label: 'the Fairfax Resolves',
      x: 33, z: 9,
      examine:
        'Twenty-four resolutions off the Alexandria press, with your name at the head of them. You '
        + 'chaired the meeting that adopted these. Nobody made you.',
      document: 'DOC-A1.2',
    },
    {
      id: 'diary',
      label: 'the diary',
      x: 36, z: 12,
      examine:
        'Open on the desk at this week. The weather every morning, the state of the wheat, the '
        + 'mercury at sunrise. You have written this line nearly every day for sixteen years.',
      document: 'DOC-A1.7',
    },
    {
      // Planted here and paid off in Act 7, at Newburgh. Do not remark on it.
      // Nothing in this string tells the student it will ever matter.
      id: 'spectacles',
      label: 'a pair of spectacles',
      x: 37, z: 12,
      examine:
        'In the small drawer, in a shagreen case, unworn. You had them made last year and you have '
        + 'not put them on in front of anybody.',
      grants: 'obs.a1.spectacles',
    },
    {
      id: 'cato',
      label: 'a copy of Cato',
      x: 33, z: 8,
      examine:
        'Addison’s play, well used. A Roman refuses a crown and dies rather than take one. You '
        + 'have seen it performed and you quote it in letters without marking the quotation.',
    },
    {
      id: 'dismal',
      label: 'the Dismal Swamp ledger',
      x: 38, z: 9,
      examine:
        'The company’s accounts. Forty thousand acres of drowned ground bought on a survey you '
        + 'walked yourself, worked by people hired out from estates like this one.',
    },
    {
      id: 'fowling-piece',
      label: 'the fowling piece',
      x: 34, z: 8,
      examine:
        'Over the mantel, where it is decoration rather than a weapon. There is not a musket in this '
        + 'house that has been fired at a person, and you are the only man in it who has been.',
    },

    /* --- the west parlour ----------------------------------------------- */
    {
      id: 'peale',
      label: 'the Peale portrait',
      x: 9, z: 12,
      examine:
        'Painted three years ago: a colonel of the Virginia Regiment in a uniform sixteen years out '
        + 'of date, with a gorget at the throat and a musket he has not carried since he was twenty-six.',
      grants: 'obs.a1.peale',
    },
    {
      id: 'account-book',
      label: "Martha's account book",
      x: 13, z: 16,
      examine:
        'Household expenses, in her hand, ruled and totalled. She ran an estate of her own before she '
        + 'married you and she has never once needed to be told what anything costs.',
    },
    {
      id: 'commission',
      label: 'the Fairfax commission',
      x: 15, z: 13,
      examine:
        'Command of the Fairfax Independent Company, on the mantel where it can be seen. Four counties '
        + 'have named you to something this year and none of them waited for an answer.',
      grants: 'doc.a1.commission',
    },

    /* --- the little parlour and the chamber ------------------------------ */
    {
      id: 'gorget',
      label: 'the gorget and sash',
      x: 12, z: 7,
      examine:
        'A crescent of silver on a ribbon, and a crimson silk sash. Braddock gave you the sash as he '
        + 'was dying on the Monongahela road, and you were twenty-three, and you have kept it fifteen years.',
      grants: 'doc.a1.braddock',
    },
    {
      id: 'survey',
      label: 'a survey of Dogue Run',
      x: 26, z: 9,
      examine:
        'Drawn by you, in ink, with the bearings written along each line. It is a beautiful piece of '
        + 'work and it is the only thing in this house you made with your own hands.',
      grants: 'obs.a1.surveying',
    },

    /* --- the New Room ------------------------------------------------------ */
    {
      id: 'newroom',
      label: 'the New Room',
      x: 4, z: 12,
      examine:
        'Four walls, no ceiling, no floor, and grass coming up through the sills. On the drawing it '
        + 'is the largest and finest room in Virginia. Standing in it, it is weather.',
      grants: 'obs.a1.study',
    },
  ];
}

function groundFloorNpcs(): NpcDef[] {
  return [
    {
      id: 'martha',
      name: 'Martha',
      spec: MARTHA,
      x: 12, z: 15, facing: 0,
      hearFlag: 'heard.a1.martha',
      lines: [
        { speaker: 'Martha', text: 'You have read it four times. It says the same thing each time.', mood: 'warm' },
        {
          speaker: 'Martha',
          text:
            'You had Lund bring the uniform down from the press before the letter ever came. I saw '
            + 'him carry it across the yard. You have not said a word about it since.',
          mood: 'hard',
        },
      ],
      decision: {
        id: 'A1-D1',
        prompt:
          'She is not asking whether you will go. She has known that for a week. She is asking what '
          + 'you expect to happen when you get there.',
        speaker: 'Martha',
        portrait: 'martha',
        voices: ['vanity', 'restraint', 'duty', 'temper'],
        interjections: {
          vanity: 'A room full of lawyers in broadcloth and one man dressed as a soldier. They will not need to be told.',
          restraint: 'To say it aloud is to have decided it. You have not decided it. Have you.',
          duty: 'She has buried two children and she is not a woman who wants comfort instead of an answer.',
          temper: 'Say it plainly or say nothing. She has earned better than a form of words.',
        },
        rejoinders: {
          restraint: 'Whatever you tell her now is what she will repeat to herself for eight years.',
          vanity: 'The letter you write in June will be read for two hundred years. This will not.',
        },
        /*
         * CHARACTERIZATION ONLY. Every option is `effects: {}`.
         *
         * It alters six later strings, the tone of her entry in the letterbook,
         * and one clause of the epilogue. It moves nothing. This is the game's
         * first demonstration of R11 and it should be the first real choice
         * the student makes, so that the second one — which does move something
         * — arrives without any warning that it is different.
         */
        options: [
          {
            id: 'not_expected',
            label: 'You do not expect it',
            full: 'Tell her you do not expect to be chosen, and that there are better men in that room.',
            favoured: ['restraint'],
            effects: {},
            result:
              'She lets it stand. She does not say that you had the coat made in February. You both '
              + 'hear her not say it.',
          },
          {
            id: 'expect_and_dread',
            label: 'You expect it, and dread it',
            full: 'Tell her you expect to be chosen and that you do not want it.',
            favoured: ['duty', 'temper'],
            effects: {},
            result:
              'She asks how long. You say you cannot know. She says that she will manage, which is '
              + 'true, and is not the answer to the question you did not ask.',
          },
          {
            id: 'already_decided',
            label: 'You have already decided',
            full: 'Tell her the truth: that you had the coat made in February, and that you have known since.',
            favoured: ['temper'],
            requires: 'obs.a1.ledger_stops',
            lockNote: 'you have not admitted to yourself when you decided',
            effects: {},
            result:
              'It is the first time you have said it aloud. She does not tell you it will be all '
              + 'right, which is precisely why you told her.',
          },
        ],
      },
      after: [
        {
          speaker: 'Martha',
          text:
            'Then go and see Lund about the north end before you go down to the boat. If you are '
            + 'leaving, he should hear it from you and not from me.',
        },
      ],
    },
    {
      id: 'maid',
      name: 'A housemaid',
      spec: HOUSEMAID,
      x: 26, z: 16, facing: 3,
      lines: [
        {
          speaker: 'A housemaid',
          text: 'Mrs Washington is in the west parlour, sir. She has been since breakfast.',
        },
      ],
    },
  ];
}

export const MANSION_GROUND: MapDef = {
  id: 'MV-HOUSE-1',
  title: 'Mount Vernon — the ground floor',
  when: '4 May 1775',
  light: LIGHT.interiorDay,
  interior: true,
  wallStyle: 'panelled',
  wallHeight: 2.15,
  ground: groundFloorTiles(),
  objects: groundFloorWalls(),
  legend: INDOOR_LEGEND,
  props: groundFloorProps(),
  interactables: groundFloorThings(),
  npcs: groundFloorNpcs(),
  spawn: { x: 19, z: 19, facing: 3 },
  arrival: [
    'The passage runs the depth of the house, front door to river door, and the black walnut stair '
    + 'is in the middle of it.',
  ],
  zones: [
    {
      id: 'newroom',
      x: 0, z: 4, w: 8, d: 15,
      light: LIGHT.interiorOpen,
      dist: 19,
    },
  ],
  portals: [
    {
      id: 'out-front', x: 19, z: 20, w: 1, d: 1,
      to: 'MV-ESTATE', at: [38, 36], facing: 0,
      label: 'out to the west front', transition: 'cut',
    },
    {
      id: 'out-river', x: 19, z: 2, w: 1, d: 1,
      to: 'MV-ESTATE', at: [38, 26], facing: 3,
      label: 'out to the east lawn', transition: 'cut',
    },
    {
      id: 'upstairs', x: 18, z: 7, w: 3, d: 2,
      to: 'MV-HOUSE-2', at: [19, 9], facing: 0,
      label: 'up the stair', transition: 'cut',
    },
  ],
};

/* ---------------------------------------------------------------------- *
 * UPPER FLOOR
 * ---------------------------------------------------------------------- */

function upperTiles(): string[] {
  const cv = new Canvas(W, H, ' ');
  cv.rect(7, 2, 25, 19, '.');
  cv.rect(18, 3, 3, 17, 'p');
  cv.rect(31, 7, 8, 12, '.');
  cv.rect(32, 8, 6, 6, 'c');
  return cv.lines();
}

function upperWalls(): string[] {
  const cv = new Canvas(W, H, ' ');
  const box = (x: number, z: number, w: number, d: number) => {
    for (let c = x; c < x + w; c++) { cv.set(c, z, '#'); cv.set(c, z + d - 1, '#'); }
    for (let r = z; r < z + d; r++) { cv.set(x, r, '#'); cv.set(x + w - 1, r, '#'); }
  };
  box(7, 2, 25, 19);
  box(31, 7, 8, 12);
  for (let r = 3; r < 20; r++) { cv.set(17, r, '#'); cv.set(21, r, '#'); }
  for (let c = 8; c < 17; c++) cv.set(c, 11, '#');
  for (let c = 22; c < 31; c++) cv.set(c, 11, '#');
  cv.set(17, 6, ' '); cv.set(17, 16, ' ');
  cv.set(21, 6, ' '); cv.set(21, 16, ' ');
  cv.set(31, 13, ' ');
  return cv.lines();
}

export const MANSION_UPPER: MapDef = {
  id: 'MV-HOUSE-2',
  title: 'Mount Vernon — the chambers',
  when: '4 May 1775',
  light: LIGHT.interiorDay,
  interior: true,
  wallStyle: 'plaster',
  wallHeight: 2.05,
  ground: upperTiles(),
  objects: upperWalls(),
  legend: INDOOR_LEGEND,
  spawn: { x: 19, z: 10, facing: 0 },
  arrival: ['Five chambers and a passage. Four of them are made up for guests who are not coming.'],
  props: [
    // The Washingtons' own chamber, over the new study.
    { id: 'bedTester', x: 34.6, z: 9.0 },
    { id: 'chestDrawers', x: 32.6, z: 12.4 },
    { id: 'trunkBox', x: 37.0, z: 12.6 },
    { id: 'candleStand', x: 37.2, z: 9.2 },
    { id: 'chairSide', x: 33.0, z: 15.6 },
    { id: 'mantel', x: 34.5, z: 7.5, scale: 0.5 },

    // Guest chambers, made up and empty.
    { id: 'bedSimple', x: 12.0, z: 5.0 },
    { id: 'chestDrawers', x: 15.4, z: 8.4 },
    { id: 'bedSimple', x: 12.0, z: 13.6 },
    { id: 'washTub', x: 9.2, z: 17.4 },
    { id: 'bedSimple', x: 26.0, z: 5.0 },
    { id: 'chestDrawers', x: 29.2, z: 8.6 },
    { id: 'bedSimple', x: 26.0, z: 13.6 },
    { id: 'candleStand', x: 23.0, z: 17.4 },
    { id: 'mantel', x: 12.5, z: 3.5, scale: 0.5 },
    { id: 'mantel', x: 26.5, z: 11.5, scale: 0.5 },

    // The passage.
    { id: 'chairSide', x: 18.6, z: 4.4 },
    { id: 'framedPortrait', x: 20.4, z: 3.4 },
    { id: 'candleStand', x: 20.4, z: 17.6 },
  ],
  interactables: [
    {
      id: 'press',
      label: 'the clothes press',
      x: 33, z: 12,
      examine:
        'Empty on the left-hand side, where the blue coat hung until this morning. Lund carried it '
        + 'down in February and nobody in this house has mentioned it since.',
      grants: 'obs.a1.uniform',
    },
    {
      id: 'window-east',
      label: 'the east window',
      x: 26, z: 3,
      examine:
        'The whole reach of the river from here, and the roof of the new north wing below with no '
        + 'slate on it. From this window it is not a house being enlarged. It is a house with a hole in it.',
      grants: 'obs.a1.northwing',
    },
    {
      id: 'trunks',
      label: 'the packed trunks',
      x: 37, z: 12,
      examine:
        'Two, corded and marked, and a field case beside them. Somebody has packed for a journey of '
        + 'unknown length and has not asked how long, because there is no answer to be had.',
    },
    {
      id: 'childrens-room',
      label: 'a made-up bed',
      x: 12, z: 13,
      examine:
        'Aired and turned down. Patsy died two years ago in this house at seventeen, and Jacky is at '
        + 'his own place now. The room is kept as though somebody were expected.',
    },
  ],
  portals: [
    {
      id: 'downstairs', x: 18, z: 10, w: 3, d: 2,
      to: 'MV-HOUSE-1', at: [19, 10], facing: 3,
      label: 'down the stair', transition: 'cut',
    },
  ],
};
