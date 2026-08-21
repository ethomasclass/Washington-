/**
 * THE DELAWARE AND TRENTON — 25 and 26 December 1776.
 *
 * Three places and one of them twice: the Pennsylvania bank above
 * McConkey's Ferry on Christmas afternoon, the same bank at night with the
 * boats going over, and King Street in Trenton at eight the next morning —
 * and then King Street again, after.
 *
 * ORIENTATION at the ferry:
 *     up the screen    = the Delaware, and New Jersey beyond it
 *     down the screen  = the Pennsylvania bank, the camp, the road from Newtown
 *
 * ORIENTATION at Trenton:
 *     up the screen    = down King Street toward the Old Barracks and the river
 *     down the screen  = the head of the town, where the columns came in
 *
 * TWO CORRECTIONS THIS MAP EXISTS TO MAKE, both of them things a picture can
 * do and a paragraph cannot:
 *
 *   THE BOAT. The Durham boat is forty to sixty feet long, four feet deep,
 *   BLACK, high-sided, and poled. It is a freight barge for iron ore. The men
 *   stood up in it because there was nowhere to sit. It is established on the
 *   bank in daylight in the first scene, before it is ever used, so that the
 *   student has looked at the correct object with no drama attached to it.
 *
 *   THE HESSIANS. They turn out under arms, in the street, in formation. They
 *   are not sprawled over bottles. Rall had doubled his guards, had been
 *   warned twice, and had asked for a redoubt and been refused. The reason
 *   nobody expected this attack is that no reasonable officer would have made
 *   it.
 */

import type { MapDef, PropInstance, StructureDef } from '../types';
import { LIGHT } from '../palette';
import { Canvas, scatter } from './paint';
import { FIELD_LEGEND } from './legend';
import { ferryCampNpcs, trentonNpcs } from './delaware-people';
import { ferryCampThings, trentonThings } from './delaware-things';

export type Bank = 'day' | 'night';
export type Street = 'fight' | 'after';

/* ---------------------------------------------------------------------- *
 * McCONKEY'S FERRY
 * ---------------------------------------------------------------------- */

export const D_COLS = 72, D_ROWS = 54;

/** The water, the bank, and the road. */
export const D_SHORE = 15;
export const D_LANDING_X = 30, D_LANDING_W = 12;
export const D_CAMP_N = 28, D_CAMP_S = 40;

function bankGround(state: Bank): string[] {
  const w = state === 'night';
  const cv = new Canvas(D_COLS, D_ROWS, 'n');

  // --- New Jersey, across three hundred yards of running ice -------------
  cv.band(0, 3, 'o');
  cv.rect(0, 3, D_COLS, 1, 'z');
  cv.ragged('o', 'n', 0.30, 401);

  /*
   * THE RIVER, AND WHY IT IS `ice` RATHER THAN `water`.
   *
   * The Delaware on Christmas night 1776 was not frozen over and it was not
   * clear: it was running ice — plates of it, some of them large enough to
   * stave a boat, coming down on the current in the dark. The `ice` tile
   * draws plates with dark water between them, and it is solid, which is
   * both true (you cannot walk it) and necessary (the boats are the only
   * way over, and that is the act).
   */
  cv.rect(0, 4, D_COLS, D_SHORE - 4, 'i');

  // --- the bank ------------------------------------------------------------
  cv.rect(0, D_SHORE, D_COLS, 2, 'z');
  cv.rect(D_LANDING_X, D_SHORE - 2, D_LANDING_W, 5, 'k');    // the landing stage
  cv.rect(D_LANDING_X - 5, D_SHORE + 2, D_LANDING_W + 10, 4, 'l');
  cv.ragged('l', 'n', 0.30, 402);

  // The road down from Newtown, and the ferry road along the bank.
  cv.path([[36, D_SHORE + 4], [34, 24], [32, 34], [30, 44], [32, D_ROWS - 1]], 4.4, 'l');
  cv.path([[6, D_SHORE + 6], [24, D_SHORE + 5], [48, D_SHORE + 6], [66, D_SHORE + 5]], 3.6, 'l');

  // --- the camp ------------------------------------------------------------
  cv.rect(8, D_CAMP_N, D_COLS - 18, D_CAMP_S - D_CAMP_N + 1, 'n');
  cv.rect(10, D_CAMP_N + 1, D_COLS - 22, D_CAMP_S - D_CAMP_N - 1, 'l');
  cv.ragged('l', 'n', 0.26, 403);

  // Ploughland behind the camp, frozen into ridges nobody can walk on well.
  cv.rect(4, D_CAMP_S + 4, 26, 8, 'o');
  cv.rect(46, D_CAMP_S + 3, 22, 8, 'o');
  cv.ragged('o', 'n', 0.28, 404);

  if (w) {
    // Four hours of two and a half thousand men and eighteen guns. The
    // landing and the road are churned; the fields are not.
    cv.rect(D_LANDING_X - 7, D_SHORE + 2, D_LANDING_W + 14, 6, 'u');
    cv.path([[36, D_SHORE + 6], [34, 24], [32, 34]], 5.0, 'u');
    cv.ragged('u', 'l', 0.30, 405);
  }
  return cv.lines();
}

/**
 * The bank is low and the ground rises gently away from it.
 *
 * THE STEPS ARE RAGGED, AND THEY HAVE TO BE.
 *
 * Every elevation band here is a full-width rectangle, and a full-width
 * rectangle of elevation draws a riser face that runs from one edge of the
 * map to the other in a dead straight line. In the camp that is invisible,
 * because there are two hundred props standing on it. On the open road up
 * from the landing there is nothing on it at all, and the first build of
 * this map had a perfectly ruled horizontal seam across the middle of the
 * frame that read as a drawing error rather than as a slope.
 *
 * `ragged` on the elevation grid fixes it for four lines: it only converts
 * cells that are already on a boundary, so the terraces keep their heights
 * and lose their straight edges. The order matters — work down from the
 * high ground, so each step is broken against the one below it before that
 * one is broken in turn.
 */
function bankElevation(): string[] {
  const cv = new Canvas(D_COLS, D_ROWS, '0');
  cv.band(0, 3, '1');
  cv.rect(0, D_SHORE + 2, D_COLS, 4, '1');
  cv.rect(0, D_SHORE + 6, D_COLS, 5, '2');
  cv.rect(0, D_SHORE + 11, D_COLS, 6, '3');
  cv.rect(0, D_SHORE + 17, D_COLS, D_ROWS - D_SHORE - 17, '4');
  cv.ragged('4', '3', 0.34, 411);
  cv.ragged('3', '2', 0.34, 412);
  cv.ragged('2', '1', 0.30, 413);
  cv.ragged('1', '0', 0.26, 414);
  return cv.lines();
}

function bankProps(state: Bank): PropInstance[] {
  const night = state === 'night';
  const out: PropInstance[] = [];
  const add = (l: Array<{ id: string; x: number; z: number; flip?: boolean }>) => { for (const p of l) out.push(p); };

  // --- the landing -------------------------------------------------------
  out.push(
    { id: 'wharfPost', x: D_LANDING_X + 0.4, z: D_SHORE - 1.6 },
    { id: 'wharfPost', x: D_LANDING_X + D_LANDING_W - 0.6, z: D_SHORE - 1.6 },
    { id: 'wharfPost', x: D_LANDING_X + 0.4, z: D_SHORE + 2.4 },
    { id: 'wharfPost', x: D_LANDING_X + D_LANDING_W - 0.6, z: D_SHORE + 2.4 },
  );

  if (night) {
    /*
     * The crossing, in progress. Three Durham boats on the water and two at
     * the stage, and Glover's men working them with poles.
     */
    out.push(
      { id: 'durhamBoat', x: 20.0, z: D_SHORE - 6.0 },
      { id: 'durhamBoat', x: 44.0, z: D_SHORE - 8.0, flip: true },
      { id: 'durhamBoat', x: 34.0, z: D_SHORE - 3.0 },
      { id: 'flatBoat', x: 56.0, z: D_SHORE - 5.0 },
      { id: 'flatBoat', x: 10.0, z: D_SHORE - 4.0, flip: true },
      { id: 'fieldGun', x: 26.0, z: D_SHORE + 4.0 },
      { id: 'fieldGun', x: 46.0, z: D_SHORE + 4.4, flip: true },
      { id: 'shotPile', x: 40.0, z: D_SHORE + 5.0 },
      { id: 'kitPile', x: 22.0, z: D_SHORE + 6.0 },
      { id: 'horse', x: 58.0, z: D_SHORE + 6.4 },
    );
    // Two lanterns to a brigade, carried by the leading regiment's officers,
    // and every other light in this camp is out. It is in general orders.
    for (const [x, z] of [[26, D_SHORE + 3], [42, D_SHORE + 3], [34, 22], [32, 32], [30, 42]] as const) {
      out.push({ id: 'shipLantern', x, z });
    }
  } else {
    // Christmas afternoon: the boats are hauled up on the bank, black,
    // long, and empty, so the student looks at the right object before it
    // matters. This is the F-17 corrective, delivered as a silhouette.
    out.push(
      { id: 'durhamBoat', x: 16.0, z: D_SHORE + 2.2 },
      { id: 'durhamBoat', x: 50.0, z: D_SHORE + 2.4, flip: true },
      { id: 'durhamBoat', x: 34.0, z: D_SHORE + 5.6 },
      { id: 'flatBoat', x: 60.0, z: D_SHORE + 3.0 },
      { id: 'fieldGun', x: 24.0, z: D_SHORE + 8.0 },
      { id: 'fieldGun', x: 44.0, z: D_SHORE + 8.4, flip: true },
      { id: 'wagonTilt', x: 56.0, z: D_SHORE + 9.0 },
      { id: 'horse', x: 62.0, z: D_SHORE + 10.4 },
      { id: 'trough', x: 58.0, z: D_SHORE + 11.4 },
    );
  }

  /* --- the camp: shelters, not tents ------------------------------------ *
   * There are almost no tents left in this army. What there is, is brush,
   * board and whatever the men have contrived, and the fires are too small
   * because the wood has to be carried and nobody has an axe to spare.
   * ------------------------------------------------------------------- */
  for (let i = 0; i < 8; i++) {
    out.push({ id: 'brushShelter', x: 12.0 + i * 6.0, z: D_CAMP_N + 2.0, flip: i % 2 === 0 });
  }
  for (let i = 0; i < 6; i++) {
    out.push({ id: 'brushShelter', x: 16.0 + i * 6.6, z: D_CAMP_S - 2.0, flip: i % 3 === 0 });
  }
  for (let i = 0; i < 5; i++) {
    out.push({ id: 'campKettle', x: 14.0 + i * 9.5, z: D_CAMP_N + 5.4 });
    out.push({ id: 'woodpile', x: 18.0 + i * 9.5, z: D_CAMP_N + 6.8, flip: i % 2 === 0 });
  }
  out.push(
    { id: 'musketStack', x: 26.0, z: D_CAMP_N + 4.0 },
    { id: 'musketStack', x: 48.0, z: D_CAMP_S - 4.0, flip: true },
    { id: 'drum', x: 36.0, z: D_CAMP_N + 4.4 },
    { id: 'campTable', x: 42.0, z: D_CAMP_N + 3.6 },
    { id: 'kitPile', x: 20.0, z: D_CAMP_S - 5.0 },
    { id: 'kitPile', x: 52.0, z: D_CAMP_N + 8.0, flip: true },
    { id: 'necessary', x: 8.0, z: D_CAMP_S + 3.0 },
    { id: 'washTub', x: 30.0, z: D_CAMP_S - 3.4 },
    { id: 'powderCask', x: 46.0, z: D_CAMP_N + 7.0 },
    { id: 'powderCask', x: 47.4, z: D_CAMP_N + 7.6 },
  );

  // --- the country ---------------------------------------------------------
  add(scatter('oakBare', [6, 22], [22, 24], 4, 1.2, 411));
  add(scatter('oakBare', [52, 22], [68, 24], 4, 1.2, 412));
  add(scatter('pineSnow', [4, 44], [20, 46], 4, 1.3, 413));
  add(scatter('pineSnow', [54, 45], [68, 47], 4, 1.3, 414));
  add(scatter('snowDrift', [8, 20], [64, 20], 7, 1.2, 415));
  add(scatter('snowDrift', [10, 48], [62, 49], 6, 1.2, 416));
  out.push(
    { id: 'railFence', x: 6.0, z: D_CAMP_S + 3.4 },
    { id: 'railFence', x: 10.0, z: D_CAMP_S + 3.4 },
    { id: 'railFence', x: 60.0, z: D_CAMP_S + 3.0, flip: true },
    { id: 'railFence', x: 64.0, z: D_CAMP_S + 3.0, flip: true },
    { id: 'signpost', x: 36.0, z: D_ROWS - 8.0 },
    { id: 'milestone', x: 29.0, z: D_ROWS - 5.0 },
  );

  return out;
}

function bankStructures(): StructureDef[] {
  return [
    /*
     * McConkey's ferry house, an inn on the Pennsylvania bank. Washington's
     * officers used it on the twenty-fifth and it is still standing.
     */
    {
      id: 'mcconkeys',
      x: 44, z: D_SHORE + 8, w: 10, d: 5, h: 2.7,
      style: 'clapboard', roof: 'gable', pitch: 1.25,
      cornice: true, seed: 81,
      faces: {
        south: [
          { at: 2.0, kind: 'window' }, { at: 5.0, kind: 'doorway' }, { at: 8.0, kind: 'window' },
        ],
        west: [{ at: 2.5, kind: 'window' }],
      },
      chimneys: [{ at: 0.8, on: 'west', h: 1.4 }, { at: 9.2, on: 'east', h: 1.4 }],
    },
    { id: 'ferryBarn', x: 14, z: D_SHORE + 9, w: 11, d: 5, h: 2.6,
      style: 'clapboard', roof: 'gable', pitch: 1.3, seed: 82,
      faces: { south: [{ at: 3.0, kind: 'doorway' }, { at: 8.0, kind: 'doorway' }] } },
    { id: 'springHouse', x: 60, z: D_SHORE + 14, w: 4, d: 3, h: 1.8,
      style: 'brick', roof: 'shed', pitch: 0.8, seed: 83,
      faces: { south: [{ at: 2.0, kind: 'door' }] } },
    /* New Jersey, across the water, and nothing on it but trees. */
    { id: 'jerseyBarn', x: 18, z: 0, w: 8, d: 2, h: 2.0, style: 'clapboard', roof: 'gable', pitch: 1.2, seed: 84 },
    { id: 'jerseyHouse', x: 46, z: 0, w: 6, d: 2, h: 1.9, style: 'clapboard', roof: 'gable', pitch: 1.2, seed: 85 },
  ];
}

export function ferryCamp(state: Bank): MapDef {
  const night = state === 'night';
  return {
    id: night ? 'DL-BANK-N' : 'DL-BANK',
    title: night ? "McConkey's Ferry — the crossing" : "McConkey's Ferry",
    when: night ? 'The night of 25 December 1776' : '25 December 1776',
    light: night ? LIGHT.delawareNight : LIGHT.ferryCamp,
    fogNear: night ? 33 : 34,
    fogFar: night ? 54 : 88,
    ground: bankGround(state),
    elev: bankElevation(),
    legend: FIELD_LEGEND,
    props: bankProps(state),
    structures: bankStructures(),
    spawn: night ? { x: 34, z: D_SHORE + 6, facing: 3 } : { x: 34, z: 44, facing: 3 },

    arrival: night
      ? [
        'Eleven at night on Christmas Day, and the storm came on at about the hour the first '
        + 'boat went over. Sleet, then hail, then snow, and a wind driving all three of them '
        + 'along the river.',
        'Two thousand four hundred men, eighteen guns and the horses, three hundred yards over '
        + 'water that is running ice, in boats poled by fishermen from Marblehead.',
        'The plan requires you to be across by midnight. It is eleven, and the first brigade is '
        + 'not over.',
      ]
      : [
        'The Pennsylvania bank above McConkey&rsquo;s Ferry, Christmas afternoon. This is the '
        + 'worst camp this army has ever had and there is not a tent in it.',
        'Two and a half thousand men fit for duty. Every enlistment expires on the thirty-first '
        + 'of December, which is six days from now, and Congress has left Philadelphia.',
        'The boats are hauled up on the bank. They are black, they are sixty feet long, and they '
        + 'carry iron ore.',
      ],

    zones: night
      ? [
        {
          id: 'crossing',
          x: 0, z: 0, w: D_COLS, d: D_SHORE + 8,
          light: LIGHT.delawareNight,
          dist: 22,
          onEnter: [
            'The ice comes down on the current in plates and the men fend it off the bows with '
            + 'the poles, and every time one strikes it goes through the boat like a hammer on a '
            + 'barrel.',
            'Nobody is speaking. The order is for the profoundest silence and it is being kept, '
            + 'which in an army that has never kept an order in its life is the first thing '
            + 'tonight that ought to tell you something.',
          ],
        },
      ]
      : [
        { id: 'bankday', x: 0, z: 0, w: D_COLS, d: D_SHORE + 8, light: LIGHT.ferryCamp, dist: 27 },
      ],

    ambient: night
      ? [
        {
          id: 'amb4.ice', x: 34, z: D_SHORE + 2, r: 5, minLoudness: 0.30,
          variants: {
            restraint: 'Three hours to get across and you have not got three hours.',
            temper: 'Glover&rsquo;s men have been in that water since dark and not one of them has said a word about it.',
            ambition: 'Every hour late is an hour of daylight you attack in. Keep them moving.',
            duty: 'Two lanthorns to a brigade and no other light. It is in the orders and it is being obeyed.',
          },
        },
        {
          id: 'amb4.storm', x: 34, z: 24, r: 6, minLoudness: 0.34,
          variants: {
            temper: 'Sleet, then hail, then snow, and it came on at exactly the hour it could do most harm.',
            restraint: 'Their powder is wet. So is yours. Whatever happens at the other end happens with the bayonet.',
            vanity: 'Somebody will paint this one day and get every single thing about it wrong.',
          },
        },
      ]
      : [
        {
          id: 'amb4.camp', x: 34, z: D_CAMP_N + 4, r: 6, minLoudness: 0.30,
          variants: {
            duty: 'Six days. On the first of January you do not command an army, you command a rumour.',
            temper: 'Not a tent. Not one. They have been sleeping under brush since the eighth of December.',
            restraint: 'Count the feet, not the muskets. That is the number that decides what you can ask them to do.',
            ambition: 'Two and a half thousand men and six days. Whatever this is going to be, it is now.',
          },
        },
        {
          id: 'amb4.boats', x: 34, z: D_SHORE + 4, r: 5, minLoudness: 0.32,
          variants: {
            ambition: 'Sixty feet, four feet deep, and they carry iron. They will carry eighteen guns.',
            restraint: 'Look at the river. Then look at the boats. Then say the thing out loud to yourself first.',
          },
        },
      ],

    npcs: ferryCampNpcs(state),
    interactables: ferryCampThings(state),

    marks: [
      { x: 34, z: 2, label: 'the Jersey shore', overWater: true, grants: 'map.a4.jersey' },
      { x: 34, z: D_SHORE - 1, label: 'the river' },
      { x: 34, z: D_SHORE + 2, label: 'the landing' },
      { x: 48, z: D_SHORE + 12, label: "McConkey's" },
      { x: 34, z: D_CAMP_N + 4, label: 'the camp' },
      { x: 34, z: D_ROWS - 8, label: 'the Newtown road' },
    ],

    portals: night
      ? [{
        /*
         * THE ROAD TO TRENTON.
         *
         * Nine miles, four hours, in sleet, and it happens in a fade —
         * because there are no decisions in it and nothing to look at, and
         * the one thing that would be worse than compressing that march is
         * making a student walk it.
         */
        id: 'the-march',
        x: 30, z: D_SHORE + 8, w: 8, d: 2,
        to: 'TR-STREET', at: [31, 46] as [number, number], facing: 3 as const,
        label: 'form the column on the road',
        transition: 'fade' as const,
        requires: 'obs.a4.went_on',
        lockedNote:
          'Glover is on the bank with the last of the guns coming over and he has asked you a '
          + 'question. Nothing moves off this shore until it is answered.',
      }]
      : [{
        id: 'to-the-boats',
        x: D_LANDING_X + 4, z: D_SHORE + 3, w: 4, d: 2,
        to: 'DL-BANK-N', at: [34, D_SHORE + 6] as [number, number], facing: 3 as const,
        label: 'go down to the boats',
        transition: 'fade' as const,
        requires: 'obs.a4.bounty_settled',
        lockedNote:
          'There are two and a half thousand men in that camp whose papers run out on the '
          + 'thirty-first, and not one of them has been told what happens then.',
      }],
  };
}

export const DL_BANK = ferryCamp('day');
export const DL_BANK_NIGHT = ferryCamp('night');

/* ---------------------------------------------------------------------- *
 * KING STREET, TRENTON
 * ---------------------------------------------------------------------- */

export const T_COLS = 64, T_ROWS = 58;

/** The street runs up the screen; the town is the two sides of it. */
export const T_STREET_W = 26, T_STREET_E = 37;
export const T_HEAD = 44;           // where the columns came in
export const T_BARRACKS_X = 8, T_BARRACKS_Z = 12;

function streetGround(): string[] {
  const cv = new Canvas(T_COLS, T_ROWS, 'n');

  // --- the Assunpink and the bridge, at the far end of the town ----------
  cv.band(0, 4, 'n');
  cv.rect(0, 4, T_COLS, 3, 'i');
  cv.rect(T_STREET_W, 4, T_STREET_E - T_STREET_W + 1, 3, 'k');   // the bridge
  cv.ragged('i', 'n', 0.30, 421);

  // --- King Street, and Queen Street running parallel to the east --------
  cv.rect(T_STREET_W, 7, T_STREET_E - T_STREET_W + 1, T_ROWS - 7, 'y');
  cv.rect(T_STREET_E + 12, 10, 8, T_ROWS - 16, 'y');
  // The two of them converge at the head of the town, which is the whole
  // reason the plan is two columns: one down each, meeting at the top.
  cv.path([[T_STREET_E + 16, 14], [T_STREET_E + 10, 10], [T_STREET_E + 2, 8]], 5.0, 'y');

  // Cross lanes, so the town is a town and not a corridor.
  for (const z of [16, 26, 36]) cv.rect(6, z, T_COLS - 12, 3, 'y');

  // --- yards, gardens and the ground behind the houses -------------------
  cv.rect(4, 10, 20, 6, 'v');
  cv.rect(44, 40, 16, 8, 'v');
  cv.rect(8, 42, 14, 8, 'o');
  cv.ragged('v', 'n', 0.26, 422);
  cv.ragged('o', 'n', 0.26, 423);
  cv.ragged('y', 'n', 0.24, 424);

  /*
   * THE ORCHARD at the head of the town, where Rall was shot.
   *
   * It is drawn in both states and it is not remarked on until afterwards,
   * because on the morning of the twenty-sixth it is an orchard.
   */
  cv.rect(42, T_HEAD + 2, 16, 8, 'o');
  return cv.lines();
}

/** Trenton falls toward the Assunpink. Gently, and one step per row. */
function streetElevation(): string[] {
  const cv = new Canvas(T_COLS, T_ROWS, '0');
  cv.rect(0, 7, T_COLS, 8, '1');
  cv.rect(0, 15, T_COLS, 9, '2');
  cv.rect(0, 24, T_COLS, 9, '3');
  cv.rect(0, 33, T_COLS, 9, '4');
  cv.rect(0, 42, T_COLS, T_ROWS - 42, '5');
  // Ragged, for the reason given at `bankElevation`. Trenton needs it less
  // — there are houses on both sides of the street to break the eye — but a
  // town built on a hill does not have five perfectly level shelves in it,
  // and one straight seam across a snow-covered street is one too many.
  cv.ragged('5', '4', 0.30, 421);
  cv.ragged('4', '3', 0.30, 422);
  cv.ragged('3', '2', 0.30, 423);
  cv.ragged('2', '1', 0.26, 424);
  return cv.lines();
}

function streetProps(state: Street): PropInstance[] {
  const after = state === 'after';
  const out: PropInstance[] = [];
  const add = (l: Array<{ id: string; x: number; z: number; flip?: boolean }>) => { for (const p of l) out.push(p); };

  // --- the street itself ---------------------------------------------------
  out.push(
    { id: 'well', x: 24.0, z: 22.0 },
    { id: 'signpost', x: 39.0, z: 30.0 },
    { id: 'milestone', x: 24.0, z: T_HEAD - 1.0 },
    { id: 'woodpile', x: 40.0, z: 18.0 },
    { id: 'woodpile', x: 22.0, z: 34.0, flip: true },
    { id: 'cartTwoWheel', x: 42.0, z: 24.0 },
    { id: 'barrel', x: 21.0, z: 14.0 },
    { id: 'crate', x: 22.4, z: 15.0 },
  );

  if (!after) {
    /*
     * THE HESSIANS TURNING OUT.
     *
     * Under arms, in the street, forming. `docs/05` §4.3 is explicit and the
     * whole act depends on it: they are not sprawled over bottles. A stand
     * of arms in the street with bayonets on the barrels, and the two guns
     * they got into action before they were taken.
     */
    out.push(
      /*
       * THE GUNS ARE AT THE HEAD OF THE STREET, WHICH IS HIGH `z`.
       *
       * They were at low `z` on the first pass — down by the Assunpink
       * bridge, at the bottom of the town — which put Forrest's battery
       * behind the Hessians and firing away from them. The column came in
       * at `T_HEAD`; the street runs downhill from there to the barracks
       * and the bridge; the guns unlimbered across the top of it and fired
       * the length of it. That is the entire reason Trenton took
       * forty-five minutes instead of a morning, so it is worth getting
       * the two ends of the street the right way round.
       */
      { id: 'fieldGun', x: 29.0, z: 38.0 },
      { id: 'fieldGun', x: 34.0, z: 38.4, flip: true },
      { id: 'shotPile', x: 31.5, z: 39.4 },

      // Rall's own two brass pieces, run out into the street and served
      // long enough to fire a handful of rounds up it before a rush of
      // Virginians took them at the muzzle.
      { id: 'fieldGun', x: 28.0, z: 15.0, flip: true },
      { id: 'fieldGun', x: 31.0, z: 15.6 },

      /*
       * And the men. The rank runs across the street rather than down it,
       * because a company forming to face fire coming down King Street
       * forms across King Street, and because a line of five sprites
       * shoulder to shoulder only reads as a line when it is broadside to
       * the camera.
       */
      { id: 'hessianFile', x: 28.0, z: 19.0 },
      { id: 'hessianFile', x: 33.4, z: 19.0 },
      { id: 'hessianFile', x: 29.6, z: 21.4 },
      { id: 'hessianFile', x: 35.0, z: 21.4 },
      { id: 'hessianFile', x: 30.6, z: 24.6 },
      { id: 'armsStand', x: 24.0, z: 17.0 },
      { id: 'armsStand', x: 38.0, z: 20.0, flip: true },
      { id: 'drum', x: 27.0, z: 27.0 },
      { id: 'kitPile', x: 36.0, z: 28.0 },
    );
  } else {
    /*
     * AFTER. Forty-five minutes, and the whole of it is in what is lying in
     * the street: the arms grounded, the caps off, and the guns taken.
     */
    out.push(
      { id: 'armsStand', x: 27.0, z: 18.0 },
      { id: 'armsStand', x: 31.0, z: 18.4 },
      { id: 'armsStand', x: 35.0, z: 18.0, flip: true },
      { id: 'armsStand', x: 29.0, z: 22.0 },
      { id: 'armsStand', x: 34.0, z: 22.4, flip: true },
      { id: 'hessianCap', x: 30.0, z: 26.0 },
      { id: 'hessianCap', x: 33.4, z: 28.0, flip: true },
      { id: 'hessianCap', x: 27.0, z: 31.0 },
      { id: 'fieldGun', x: 28.0, z: 12.0 },
      { id: 'fieldGun', x: 35.0, z: 12.4, flip: true },
      { id: 'gunSpiked', x: 40.0, z: 14.0 },
      { id: 'kitPile', x: 24.0, z: 28.0 },
      { id: 'kitPile', x: 38.0, z: 32.0, flip: true },
      { id: 'wagonTilt', x: 44.0, z: 20.0 },
      { id: 'wagonTilt', x: 46.0, z: 28.0, flip: true },
      { id: 'graveMarker', x: 46.0, z: T_HEAD + 4.0 },
      { id: 'graveMarker', x: 48.4, z: T_HEAD + 4.6 },
    );
  }

  // --- the orchard and the country ----------------------------------------
  add(scatter('oakBare', [43, 48], [57, 50], 6, 1.0, 431));
  add(scatter('oakBare', [44, 52], [56, 53], 5, 1.0, 432));
  add(scatter('pineSnow', [4, 50], [18, 52], 4, 1.2, 433));
  add(scatter('snowDrift', [6, 44], [20, 46], 5, 1.0, 434));
  out.push(
    { id: 'railFence', x: 42.0, z: T_HEAD + 1.0 },
    { id: 'railFence', x: 46.0, z: T_HEAD + 1.0 },
    { id: 'railFence', x: 50.0, z: T_HEAD + 1.0 },
    { id: 'gate', x: 54.0, z: T_HEAD + 1.0 },
    { id: 'haystack', x: 14.0, z: 46.0 },
    { id: 'haystack', x: 18.0, z: 49.0, flip: true },
  );
  return out;
}

function streetStructures(): StructureDef[] {
  const town: StructureDef[] = [];
  /*
   * THE OLD BARRACKS — 1758, two storeys of stone with a continuous arcade
   * of doorways along the front. It is the one building in Trenton anybody
   * would recognise and it is still there.
   */
  town.push({
    id: 'oldBarracks',
    x: T_BARRACKS_X, z: T_BARRACKS_Z, w: 14, d: 5, h: 3.0,
    style: 'brick', roof: 'gable', pitch: 1.2,
    cornice: true, plinth: true, storeyH: 1.4, seed: 91,
    faces: {
      south: [
        { at: 1.5, kind: 'doorway' }, { at: 3.5, kind: 'doorway' }, { at: 5.5, kind: 'doorway' },
        { at: 7.5, kind: 'doorway' }, { at: 9.5, kind: 'doorway' }, { at: 11.5, kind: 'doorway' },
        { at: 1.5, kind: 'window', storey: 1 }, { at: 3.5, kind: 'window', storey: 1 },
        { at: 5.5, kind: 'window', storey: 1 }, { at: 7.5, kind: 'window', storey: 1 },
        { at: 9.5, kind: 'window', storey: 1 }, { at: 11.5, kind: 'window', storey: 1 },
      ],
    },
    chimneys: [{ at: 2.0, on: 'ridge', h: 1.0 }, { at: 12.0, on: 'ridge', h: 1.0 }],
  });

  /* The Methodist church, where Rall was carried and where he died. */
  town.push({
    id: 'methodist',
    x: 44, z: 12, w: 7, d: 5, h: 2.9,
    style: 'clapboard', roof: 'gable', pitch: 1.6, seed: 92,
    faces: { south: [{ at: 3.5, kind: 'door' }, { at: 1.5, kind: 'window' }, { at: 5.5, kind: 'window' }] },
  });

  /*
   * The town, as two rows of houses down King Street.
   *
   * Trenton in 1776 is about a hundred houses. They are drawn as a run of
   * narrow gable-ended fronts rather than as individual buildings with
   * characters, because from the head of the street that is what a street
   * is, and because the thing the player is meant to be looking at is what
   * is standing in it.
   */
  const rows: Array<[number, number, number]> = [
    [16, 20, 3], [16, 26, 4], [16, 33, 3], [16, 39, 4],
    [40, 22, 4], [40, 29, 3], [40, 35, 4], [40, 41, 3],
    [50, 20, 4], [50, 30, 4], [6, 24, 4], [6, 32, 3], [6, 38, 4],
  ];
  rows.forEach(([x, z, w], i) => {
    town.push({
      id: `house${i}`,
      x, z, w, d: 4, h: 2.4 + (i % 3) * 0.2,
      style: i % 3 === 0 ? 'brick' : 'clapboard',
      roof: 'gable', pitch: 1.3, cornice: i % 4 === 0, seed: 100 + i,
      faces: {
        south: w >= 4
          ? [{ at: 1.0, kind: 'window' }, { at: 2.5, kind: 'door' }, { at: 3.5, kind: 'window' }]
          : [{ at: 1.0, kind: 'door' }, { at: 2.2, kind: 'window' }],
      },
      chimneys: [{ at: 0.6, on: 'west', h: 1.1 }],
    });
  });
  return town;
}

export function trenton(state: Street): MapDef {
  const after = state === 'after';
  return {
    id: after ? 'TR-STREET-A' : 'TR-STREET',
    title: 'King Street, Trenton',
    when: after ? '26 December 1776, after' : 'Eight in the morning, 26 December 1776',
    light: after ? LIGHT.trentonAfter : LIGHT.trentonMorning,
    fogNear: 34,
    fogFar: 78,
    ground: streetGround(),
    elev: streetElevation(),
    legend: FIELD_LEGEND,
    props: streetProps(state),
    structures: streetStructures(),
    spawn: { x: 31, z: T_HEAD - 2, facing: 3 },

    arrival: after
      ? [
        'Forty-five minutes, from the first shot at the head of the street to the last regiment '
        + 'grounding its arms in it.',
        'Nine hundred and some prisoners forming up in the sleet in a town they were quartered in '
        + 'last night. Twenty-two of theirs dead, and Rall is in the Methodist church with two '
        + 'balls in him and will not see tomorrow.',
        'The army goes straight back across the river tonight, with all of them. Nobody is '
        + 'staying in Trenton.',
      ]
      : [
        'Eight in the morning and full daylight, because you are three hours late. Nine miles from '
        + 'the ferry in sleet, in two columns, and both of them arrive within four minutes of each '
        + 'other, which nobody planned and nobody could have.',
        'King Street runs away down the hill in front of you toward the barracks and the bridge. '
        + 'Queen Street runs parallel to it and Sullivan is at the head of that one.',
        'The Hessians are turning out under arms. They are not asleep, they are not drunk, and '
        + 'they are forming in the street.',
      ],

    zones: [
      {
        id: 'street',
        x: 0, z: 0, w: T_COLS, d: 40,
        light: after ? LIGHT.trentonAfter : LIGHT.trentonMorning,
        dist: 26,
      },
      ...(after
        ? [{
          /*
           * The orchard at the head of the town. Its own light, and it is a
           * shade colder and closer than the street — the one place on this
           * map where the camera stops being about a victory.
           */
          id: 'orchard',
          x: 40, z: T_HEAD, w: 20, d: T_ROWS - T_HEAD,
          light: LIGHT.trentonMorning,
          dist: 22,
          onEnter: [
            'Rall was hit here, twice, getting his regiments out of the town by the only way that '
            + 'was still open, which was through an orchard.',
            'His men carried him to the Methodist church. He asked that his people be treated '
            + 'well, and was told they would be, and it was true.',
          ],
        }]
        : []),
    ],

    ambient: after
      ? [
        {
          id: 'amb4.prisoners', x: 31, z: 22, r: 6, minLoudness: 0.30,
          variants: {
            duty: 'Nine hundred men who did not choose to come here, rented out by their own prince at seven pounds a head.',
            vanity: 'Philadelphia has not had good news since June. Give them nine hundred pieces of it in the street.',
            restraint: 'Whatever is done to these men is read by the men who hold four thousand of yours in the hulks.',
            ambition: 'Beaten a European regiment in the field. The first time in this war that anybody has.',
          },
        },
        {
          id: 'amb4.cost', x: 46, z: T_HEAD + 4, r: 5, minLoudness: 0.34,
          variants: {
            restraint: 'Two men frozen on the road. They are named on the return and nowhere else.',
            duty: 'Four wounded in the town. One of them is a Virginia lieutenant shot through both hands.',
            temper: 'And on the thirty-first every paper in this army still runs out, and this fixes none of it.',
          },
        },
      ]
      : [
        {
          id: 'amb4.street', x: 31, z: 30, r: 6, minLoudness: 0.30,
          variants: {
            ambition: 'Two streets, two columns, and they meet at the bottom. Do not let them out of the town.',
            restraint: 'Their powder is as wet as yours. This is going to be done with the bayonet and you have not got enough of them.',
            temper: 'They are forming. Whoever told you they would be drunk has never seen a Hessian.',
            duty: 'The men have been on that road since four. Do not ask them to stand about in it now.',
          },
        },
        {
          id: 'amb4.guns', x: 31, z: 14, r: 5, minLoudness: 0.34,
          variants: {
            ambition: 'Knox has the guns at the head of the street firing straight down it. That is the battle.',
            vanity: 'Every gun in this town came three hundred miles on a sledge because a bookseller said it could be done.',
          },
        },
      ],

    npcs: trentonNpcs(state),
    interactables: trentonThings(state),

    marks: [
      { x: 31, z: 5, label: 'the Assunpink bridge' },
      { x: 14, z: 17, label: 'the Old Barracks' },
      { x: 47, z: 17, label: 'the Methodist church' },
      { x: 31, z: 30, label: 'King Street' },
      { x: 49, z: 26, label: 'Queen Street' },
      { x: 48, z: T_HEAD + 4, label: 'the orchard' },
    ],

    portals: [],
  };
}

export const TR_STREET = trenton('fight');
export const TR_STREET_AFTER = trenton('after');
