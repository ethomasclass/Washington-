/**
 * MOUNT VERNON, 4 MAY 1775 — one continuous estate.
 *
 * There are no scene breaks on this map. The player walks in at the west gate,
 * up the bowling green, round the carriage circle, past the north end where the
 * house is open to the sky, out along the north lane to the Quarter, back
 * through the forecourt, down the east lawn over the ha-ha, and on to the
 * landing. Four of the old build's separate plates are one place, and the walk
 * between them is the act.
 *
 * ORIENTATION. The map is screen-aligned, not compass-aligned, and the two do
 * not match — so this is the key, and it is the only place it is written down:
 *
 *     up the screen (low row)    = EAST, the river
 *     down the screen (high row) = WEST, the land approach
 *     screen left (low column)   = NORTH, the new wing and the Quarter
 *     screen right (high column) = SOUTH, the study wing, kitchen and stable
 *
 * A structure's `south` face is therefore the one nearest the camera, which on
 * the Mansion is its WEST front. Read `faces.south` as "the front".
 *
 * THE HISTORY THIS MAP IS MAKING AN ARGUMENT ABOUT. In May 1775 this is a
 * building site. The south wing — the study — was finished this year. The
 * north wing was begun about now and its interior will not be done until about
 * 1787. The kitchen and the servants' hall are both going up in 1775, and the
 * colonnades that will tie them to the house do not exist. There is no piazza
 * (1777) and no cupola (1778). The largest object on this map is an unfinished
 * house, and Act 1's fixed loss is that it stays that way.
 */

import type { MapDef, PropInstance } from '../types';
import { LIGHT } from '../palette';
import { Canvas, scatter, terraces } from './paint';
import { COLS, ROWS, LEGEND } from './legend';
import { estateNpcs } from './estate-people';
import { estateThings } from './estate-things';

/* ---------------------------------------------------------------------- *
 * The ground
 * ---------------------------------------------------------------------- */

function ground(): string[] {
  const cv = new Canvas(COLS, ROWS, '.');

  // The Potomac, and the fall to it. Nearly two miles across at this reach.
  cv.band(0, 7, 'w');
  cv.band(7, 3, 'h');
  cv.band(10, 3, 's');
  cv.band(13, 5, 'm');
  cv.ragged('m', '.', 0.45, 11);
  cv.ragged('s', 'm', 0.4, 12);
  cv.ragged('h', 'w', 0.4, 13);

  // The landing: a timber wharf running out over the shallows.
  cv.rect(35, 9, 10, 6, 'k');
  cv.rect(36, 15, 8, 3, 'd');

  // The east lawn, falling in terraces from the house to the water.
  cv.rect(24, 18, 34, 10, '.');

  // The mansion terrace, and the ground the house stands on.
  cv.rect(16, 27, 46, 10, '.');

  // The forecourt: a gravel carriage circle on the axis of the front door.
  cv.ellipse(39, 40, 10, 5.4, 'g');
  cv.ellipse(39, 40, 6, 2.8, ',');

  // The bowling green, laid out by Washington himself, with the serpentine
  // walks either side of it. Nothing on this side of the house grew where it
  // chose to, and the map should say so by being obviously drawn.
  cv.rect(29, 44, 21, 15, ',');
  cv.path([[26, 58], [23, 52], [24, 46], [29, 43]], 3.4, 'g');
  cv.path([[52, 58], [55, 52], [54, 46], [49, 43]], 3.4, 'g');
  cv.path([[39, 61], [39, 47]], 4.4, 'g');

  // Nothing on this estate has a machine-cut edge. Break every boundary the
  // painter just drew as a rectangle, or the forecourt reads as a diagram.
  cv.ragged('g', ',', 0.28, 51);
  cv.ragged('g', '.', 0.28, 52);
  cv.ragged(',', '.', 0.22, 53);

  // The north lane, past the building site, out to the Quarter.
  cv.path([[32, 38], [24, 36], [16, 35]], 4.2, 'd');
  cv.rect(3, 28, 15, 14, 'd');
  cv.ragged('d', '.', 0.35, 21);
  cv.rect(4, 36, 6, 4, 'v');     // a garden plot, worked outside the working day
  cv.rect(12, 29, 4, 3, 'r');    // straw, where the stock is bedded
  cv.rect(9, 38, 5, 2, 'r');
  cv.ragged('d', 'm', 0.16, 61);  // grass coming back through the yard

  // The building site. Trampled earth, sawdust, chips, and the lime.
  cv.rect(18, 26, 15, 15, 'x');
  cv.ragged('x', '.', 0.4, 31);

  // The south ground: kitchen yard, stable, paddock.
  cv.rect(50, 40, 12, 7, 'b');
  cv.rect(56, 30, 18, 8, 'd');
  cv.rect(56, 38, 19, 12, 'm');
  cv.ragged('m', '.', 0.4, 41);

  // The path down to the landing, over the ha-ha and along the slope.
  // Round the south end of the house, because there is a house in the way.
  cv.path([[50, 41], [55, 37], [55, 28], [50, 25], [45, 21], [41, 17], [40, 14]], 3.6, 'd');
  // And a second way down past the north wing, so the east lawn is not a
  // cul-de-sac reachable only from the kitchen yard.
  cv.path([[22, 38], [21, 30], [24, 26], [30, 24]], 3.4, 'd');

  return cv.lines();
}

/**
 * The ground falls about three units from the house to the water, in six steps.
 * Every step gets a cut-bank riser, which is what makes the east lawn read as
 * a hillside rather than a green rectangle.
 */
function elevation(): string[] {
  return terraces(COLS, ROWS, [
    [0, 0], [10, 1], [14, 2], [18, 3], [21, 4], [24, 5], [26, 6], [28, 7],
  ]);
}

/* ---------------------------------------------------------------------- *
 * What is standing on it
 * ---------------------------------------------------------------------- */

function props(): PropInstance[] {
  const out: PropInstance[] = [];
  const add = (list: Array<{ id: string; x: number; z: number; flip?: boolean }>) => {
    for (const p of list) out.push(p);
  };

  // --- the building site. The act's argument, in objects. ---------------
  out.push(
    { id: 'scaffold', x: 28.0, z: 35.2 },
    { id: 'ladder', x: 31.6, z: 34.6 },
    { id: 'timberStack', x: 21.5, z: 33.5 },
    { id: 'timberStack', x: 20.4, z: 38.6, flip: true },
    { id: 'timberStack', x: 19.4, z: 30.0 },
    { id: 'limePit', x: 20.0, z: 35.4 },
    { id: 'sawpit', x: 22.5, z: 40.4 },
    { id: 'sawhorse', x: 27.6, z: 40.2 },
    { id: 'sawhorse', x: 30.2, z: 40.6, flip: true },
    { id: 'barrow', x: 25.2, z: 33.4 },
    { id: 'stonePile', x: 18.6, z: 32.4 },
    { id: 'toolChest', x: 31.0, z: 40.4 },
    { id: 'crate', x: 33.0, z: 40.8 },
  );

  // --- the forecourt ----------------------------------------------------
  out.push(
    { id: 'chariot', x: 46.0, z: 44.6 },
    { id: 'trunkBox', x: 43.4, z: 45.4 },
    { id: 'chestSurveyor', x: 41.8, z: 46.2 },
    { id: 'papers', x: 44.6, z: 46.4 },
    { id: 'bench', x: 33.0, z: 44.0 },
  );

  // Clipped boxwood round the circle, and the two flanking groves.
  //
  // Kept clear of the serpentine walks, not just close to them. The walks run
  // [[26,58],[23,52],[24,46],[29,43]] west and its mirror east — a straight
  // row of decor at a FIXED x, next to a path that CURVES, drifts onto the
  // path's own swept width at whichever z the curve happens to bend toward
  // it. That was the actual bug: trees planted "beside the path" that the
  // path bent into. Everything here now sits outside the path's full x-range
  // across the whole z-span it borders, not just outside it at one point.
  add(scatter('boxwood', [31, 36.6], [47, 36.6], 7, 0.5, 5));
  add(scatter('boxwood', [31, 45.4], [47, 45.4], 7, 0.5, 6));
  add(scatter('oak', [17, 47], [17, 57], 4, 1.2, 7));
  add(scatter('oak', [61, 47], [61, 57], 4, 1.2, 8));
  add(scatter('elm', [14, 43], [14, 55], 3, 1.0, 9));
  add(scatter('elm', [64, 43], [64, 55], 3, 1.0, 10));
  add(scatter('shrub', [19, 44], [19, 58], 7, 0.7, 11));
  add(scatter('shrub', [59, 44], [59, 58], 7, 0.7, 12));

  // Two grown trees on the axis of the forecourt, and planting against the
  // dependencies. Without them the circle is a green rectangle with a house
  // behind it, and the eye has nothing to travel along.
  out.push(
    { id: 'elm', x: 29.5, z: 43.4 },
    { id: 'elm', x: 48.6, z: 43.4, flip: true },
    { id: 'oak', x: 33.0, z: 41.5 },
    { id: 'oak', x: 45.5, z: 41.8, flip: true },
    { id: 'shrub', x: 34.6, z: 35.6 },
    { id: 'shrub', x: 43.8, z: 35.6, flip: true },
    { id: 'flowerbed', x: 36.0, z: 43.0 },
    { id: 'flowerbed', x: 42.6, z: 43.2 },
  );

  out.push(
    { id: 'gate', x: 39.0, z: 60.0 },
    { id: 'railFence', x: 34.0, z: 60.0 },
    { id: 'railFence', x: 30.0, z: 60.0 },
    { id: 'railFence', x: 44.0, z: 60.0, flip: true },
    { id: 'railFence', x: 48.0, z: 60.0, flip: true },
    { id: 'signpost', x: 42.2, z: 58.6 },
    { id: 'necessary', x: 26.0, z: 50.0 },
    { id: 'necessary', x: 52.0, z: 50.0 },
  );

  // --- the ha-ha, and the east lawn ------------------------------------
  // The ha-ha runs along the top of the fall, with a gap either end where the
  // two paths come down. It is laid in alternate tiles on purpose: a solid rank
  // would be a fence, and a fence is the one thing a ha-ha exists not to be.
  for (let x = 28; x <= 52; x += 2) out.push({ id: 'hahaWall', x, z: 24.4, flip: x % 4 === 0 });
  add(scatter('oak', [28, 22], [36, 20], 3, 1.2, 13));
  add(scatter('oak', [46, 20], [54, 22], 3, 1.2, 14));
  add(scatter('pineTree', [22, 16], [30, 13], 4, 1.4, 15));
  add(scatter('pineTree', [50, 13], [58, 17], 4, 1.4, 16));
  add(scatter('sapling', [33, 24], [47, 24], 5, 1.0, 17));

  // --- the landing ------------------------------------------------------
  out.push(
    { id: 'sloop', x: 40.0, z: 7.2, scale: 1.5 },
    { id: 'wharfPost', x: 35.4, z: 9.4 },
    { id: 'wharfPost', x: 44.4, z: 9.4 },
    { id: 'wharfPost', x: 35.4, z: 13.6 },
    { id: 'wharfPost', x: 44.4, z: 13.6 },
    { id: 'netRack', x: 37.0, z: 16.4 },
    { id: 'herringBarrel', x: 42.4, z: 15.8 },
    { id: 'herringBarrel', x: 43.6, z: 16.4 },
    { id: 'barrel', x: 41.0, z: 14.2 },
    { id: 'crate', x: 38.4, z: 13.2 },
    { id: 'uniformOnChest', x: 42.6, z: 12.4 },
    { id: 'papers', x: 39.2, z: 15.4 },
  );

  // --- the Quarter -------------------------------------------------------
  // Nothing here is a set piece. It is a yard with the ordinary apparatus of
  // people living in it, and the archaeology is furnished exactly: the root
  // cellar under the floor, a pot that is not estate issue, a garden worked
  // outside the working day.
  out.push(
    { id: 'cookFire', x: 10.4, z: 37.0 },
    { id: 'washTub', x: 8.0, z: 34.4 },
    { id: 'workTable', x: 13.2, z: 36.2 },
    { id: 'barrel', x: 5.4, z: 33.0 },
    { id: 'sack', x: 6.6, z: 33.4 },
    { id: 'trough', x: 15.4, z: 30.2 },
    { id: 'spinningWheel', x: 4.6, z: 31.4 },
    { id: 'railFence', x: 3.5, z: 40.4 },
    { id: 'railFence', x: 7.5, z: 40.4 },
    { id: 'flowerbed', x: 6.0, z: 37.6 },
    { id: 'shrub', x: 2.6, z: 27.4 },
  );
  add(scatter('oak', [2, 22], [16, 21], 4, 1.4, 18));

  // --- the south ground: kitchen yard, stable, paddock -----------------
  out.push(
    { id: 'well', x: 50.4, z: 46.6 },
    { id: 'cartTwoWheel', x: 62.0, z: 39.0 },
    { id: 'horse', x: 63.4, z: 42.4 },
    { id: 'horse', x: 67.0, z: 44.6, flip: true },
    { id: 'trough', x: 60.2, z: 41.0 },
    { id: 'barrel', x: 55.0, z: 46.4 },
    { id: 'barrel', x: 56.2, z: 46.8 },
    { id: 'sack', x: 53.6, z: 46.2 },
  );
  for (let x = 58; x <= 74; x += 4) out.push({ id: 'railFence', x, z: 49.4 });
  for (let z = 40; z <= 48; z += 4) out.push({ id: 'railFence', x: 74.4, z });
  add(scatter('oak', [64, 28], [72, 26], 3, 1.4, 19));
  add(scatter('elm', [66, 52], [72, 56], 3, 1.2, 20));

  return out;
}

/* ---------------------------------------------------------------------- *
 * The map
 * ---------------------------------------------------------------------- */

export const ESTATE: MapDef = {
  id: 'MV-ESTATE',
  title: 'Mount Vernon',
  when: '4 May 1775',
  light: LIGHT.vernonMorning,
  ground: ground(),
  elev: elevation(),
  legend: LEGEND,
  props: props(),
  spawn: { x: 39, z: 57, facing: 3 },

  arrival: [
    'Mount Vernon, the fourth of May, 1775. You have been home since the autumn and you have not '
    + 'been still for a day of it.',
    'A rider came up from the ferry this morning with a letter from Philadelphia, and the house '
    + 'has been quiet in a particular way ever since.',
  ],

  structures: [
    /* The 1758 house. Two and a half storeys, rusticated siding — pine cut to
     * look like ashlar, painted, and sand thrown at the wet paint. No piazza,
     * no cupola, no weathervane: none of them exist yet. */
    {
      id: 'mansion',
      x: 31, z: 28, w: 15, d: 7, h: 3.4,
      style: 'rusticated', roof: 'hip', pitch: 1.35,
      cornice: true, plinth: true, storeyH: 1.5, seed: 21,
      faces: {
        // The west front. Seven bays, the door on the centre line.
        south: [
          { at: 1.5, kind: 'window' }, { at: 3.5, kind: 'window' }, { at: 5.5, kind: 'window' },
          { at: 7.5, kind: 'door' },
          { at: 9.5, kind: 'window' }, { at: 11.5, kind: 'window' }, { at: 13.5, kind: 'window' },
          { at: 1.5, kind: 'window', storey: 1 }, { at: 3.5, kind: 'window', storey: 1 },
          { at: 5.5, kind: 'window', storey: 1 }, { at: 7.5, kind: 'window', storey: 1 },
          { at: 9.5, kind: 'window', storey: 1 }, { at: 11.5, kind: 'window', storey: 1 },
          { at: 13.5, kind: 'window', storey: 1 },
        ],
        // The river front, which in 1775 is still just a wall with windows.
        north: [
          { at: 2.5, kind: 'window' }, { at: 5.5, kind: 'window' },
          { at: 7.5, kind: 'door' },
          { at: 9.5, kind: 'window' }, { at: 12.5, kind: 'window' },
          { at: 2.5, kind: 'window', storey: 1 }, { at: 5.5, kind: 'window', storey: 1 },
          { at: 7.5, kind: 'window', storey: 1 },
          { at: 9.5, kind: 'window', storey: 1 }, { at: 12.5, kind: 'window', storey: 1 },
        ],
      },
      chimneys: [{ at: 3.0, on: 'ridge', h: 1.1 }, { at: 12.0, on: 'ridge', h: 1.1 }],
    },

    /* The south wing — the study — finished this year. It is the newest thing
     * on the estate and it is worth the player noticing that. */
    {
      id: 'southWing',
      x: 46, z: 29, w: 6, d: 6, h: 3.0,
      style: 'rusticated', roof: 'hip', pitch: 1.1,
      cornice: true, plinth: true, storeyH: 1.4, seed: 22,
      faces: {
        south: [
          { at: 1.5, kind: 'window' }, { at: 4.5, kind: 'window' },
          { at: 1.5, kind: 'window', storey: 1 }, { at: 4.5, kind: 'window', storey: 1 },
        ],
        east: [{ at: 3.0, kind: 'window' }, { at: 3.0, kind: 'window', storey: 1 }],
      },
      chimneys: [{ at: 3.0, on: 'east', h: 1.2 }],
    },

    /* The north wing. Framed, part sheathed, open to the weather, and it will
     * still be open when he comes home in Act 8. `frameOpen` draws the studs
     * with transparent gaps, so the player can see straight through the end of
     * the house, and `passable` lets them walk into it. */
    {
      id: 'northWing',
      x: 25, z: 28, w: 6, d: 7, h: 3.2,
      style: 'frameOpen', roof: 'none',
      passable: true, seed: 23,
      faces: {
        south: [{ at: 3.0, kind: 'venetian' }],
      },
    },

    /* Built in 1775, both of them, and not yet joined to the house by the
     * colonnades that will make this composition make sense. */
    {
      id: 'kitchen',
      x: 52, z: 41, w: 7, d: 5, h: 2.6,
      style: 'clapboard', roof: 'gable', pitch: 1.1,
      cornice: true, seed: 24,
      faces: {
        south: [{ at: 2.0, kind: 'window' }, { at: 4.5, kind: 'doorway' }],
        west: [{ at: 2.5, kind: 'window' }],
      },
      chimneys: [{ at: 1.0, on: 'west', h: 1.5 }],
    },
    {
      id: 'servantsHall',
      x: 20, z: 41, w: 7, d: 5, h: 2.6,
      style: 'clapboard', roof: 'gable', pitch: 1.1,
      cornice: true, seed: 25,
      faces: {
        south: [{ at: 2.5, kind: 'doorway' }, { at: 5.0, kind: 'window' }],
        east: [{ at: 2.5, kind: 'window' }],
      },
      chimneys: [{ at: 6.0, on: 'east', h: 1.5 }],
    },

    /* The House for Families: the quarter that stood near the mansion until
     * 1792. Two storeys, framed and weatherboarded over a brick cellar, and
     * the cellar is where the archaeology comes from. */
    {
      id: 'houseForFamilies',
      x: 6, z: 31, w: 8, d: 4, h: 3.0,
      style: 'log', roof: 'gable', pitch: 1.1, seed: 26,
      faces: {
        south: [
          { at: 1.5, kind: 'window' }, { at: 4.0, kind: 'doorway' }, { at: 6.5, kind: 'window' },
        ],
      },
      chimneys: [{ at: 0.6, on: 'west', h: 1.2 }],
    },

    { id: 'stable', x: 60, z: 30, w: 10, d: 6, h: 2.9,
      style: 'clapboard', roof: 'gable', pitch: 1.2, seed: 27,
      faces: { south: [{ at: 2.0, kind: 'doorway' }, { at: 5.0, kind: 'window' }, { at: 8.0, kind: 'doorway' }] } },

    { id: 'smokehouse', x: 49, z: 30, w: 3, d: 3, h: 2.2,
      style: 'brick', roof: 'gable', pitch: 0.9, seed: 28,
      faces: { south: [{ at: 1.5, kind: 'door' }] },
      chimneys: [{ at: 1.5, on: 'ridge', h: 0.7 }] },

    { id: 'fishHouse', x: 33, z: 15, w: 5, d: 3, h: 2.3,
      style: 'clapboard', roof: 'shed', pitch: 0.8, seed: 29,
      faces: { south: [{ at: 2.5, kind: 'doorway' }] } },
  ],

  /**
   * THE WITNESS REGISTER, as a place on the map rather than a scene you load.
   *
   * Walk north past the scaffolding and the light changes. Bloom goes to zero,
   * the saturation falls to a fifth, the warmth comes out of the key, and the
   * camera comes in from twenty-five units to fifteen — which is as near to
   * standing at eye level as a fixed pitch can get.
   *
   * It takes about three seconds and nothing announces it. A student who walks
   * in and out again will feel the prettiness stop and will not immediately be
   * able to say why, and that is the whole of the intended effect.
   */
  zones: [
    {
      id: 'quarter',
      x: 0, z: 24, w: 19, d: 18,
      light: LIGHT.witness,
      dist: 22,
      onEnter: [
        'The lane runs out past the last of the timber and there is nothing laid out here. '
        + 'Nobody planted anything to be looked at from a window.',
      ],
    },
    {
      id: 'river',
      x: 22, z: 8, w: 38, d: 14,
      light: LIGHT.vernonRiver,
      dist: 27,
    },
  ],

  ambient: [
    {
      id: 'amb.house', x: 27, z: 38, r: 5,
      minLoudness: 0.3,
      variants: {
        restraint: 'Sixteen years and it is not finished. You are not a man who leaves things half-built.',
        vanity: 'It is the north end that shows from the river. Of course it is the north end that is open.',
        duty: 'Lund will write to you about the roof, and you will answer from a tent, and it will get done.',
      },
    },
    {
      id: 'amb.braddock', x: 44, z: 45, r: 4,
      minLoudness: 0.3,
      variants: {
        temper: 'Twenty years you asked them for a royal commission. Twenty years they gave you nothing.',
        ambition: 'Braddock died in your arms and you were twenty-three. Nobody else here has been shot at.',
        vanity: 'They printed the Great Meadows in London. Give them something else to print.',
      },
    },
    {
      id: 'amb.river', x: 41, z: 22, r: 5,
      minLoudness: 0.32,
      variants: {
        duty: 'The herring will come up in April whether you are here to count them or not.',
        restraint: 'Everything here runs on a season. An army does not, and you have not learned that yet.',
      },
    },
    {
      id: 'amb.green', x: 39, z: 52, r: 5,
      minLoudness: 0.34,
      variants: {
        vanity: 'You moved grown trees to stand where you wanted them. Nobody does that for himself alone.',
        ambition: 'Two days to Philadelphia. The vote will not wait for a man who sets out on Thursday.',
        restraint: 'You laid every walk on this side of the house. None of it will notice you are gone.',
      },
    },
    {
      id: 'amb.stable', x: 62, z: 40, r: 4.5,
      minLoudness: 0.36,
      variants: {
        duty: 'Every acre of this runs because you stand over it. That will be true of an army too.',
        restraint: 'You can be absent from a mill for a season. Ask what an army does in a season alone.',
      },
    },
  ],

  npcs: estateNpcs(),
  interactables: estateThings(),

  portals: [
    {
      id: 'front-door',
      x: 37, z: 35, w: 3, d: 1,
      to: 'MV-HOUSE-1',
      at: [19, 20],
      facing: 3,
      label: 'go in at the front door',
      transition: 'cut',
    },
    {
      id: 'river-door',
      x: 37, z: 27, w: 3, d: 1,
      to: 'MV-HOUSE-1',
      at: [19, 3],
      facing: 0,
      label: 'go in at the river door',
      transition: 'cut',
    },
  ],
};
