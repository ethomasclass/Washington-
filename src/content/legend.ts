/**
 * The tile legend for the exterior maps, and the estate's dimensions.
 *
 * Kept out of the map file so the painter, the map and the linter all read the
 * same characters from one place. A character with no entry here is a hole,
 * which is how an interior gets a footprint that is not a rectangle.
 */

import type { TileId } from '../engine/tiles';

export const COLS = 76;
export const ROWS = 62;

export const LEGEND: Record<string, TileId> = {
  '.': 'grass',
  ',': 'lawn',
  'm': 'meadow',
  'g': 'gravel',
  'd': 'dirt',
  'u': 'mud',
  's': 'sand',
  'h': 'shallow',
  'w': 'water',
  'f': 'flag',
  'b': 'brickyard',
  'x': 'site',
  'v': 'garden',
  'k': 'deck',
  'r': 'straw',
};

/**
 * CAMBRIDGE. Its own legend, because the winter needs characters the estate
 * has no use for and the estate needs a bowling green Cambridge has never
 * heard of. Sharing one alphabet across both would mean every future map
 * inherits every past map's vocabulary, which is how a legend becomes a
 * dictionary nobody reads.
 */
export const CAMP_LEGEND: Record<string, TileId> = {
  '.': 'grass',
  'm': 'meadow',
  'g': 'gravel',
  'd': 'dirt',
  'u': 'mud',
  't': 'trampled',
  'e': 'turf',
  's': 'sand',
  'h': 'shallow',
  'w': 'water',
  'i': 'ice',
  'n': 'snow',
  'l': 'slush',
  'r': 'straw',
  'b': 'brickyard',
  'f': 'flag',
  'x': 'site',
  'v': 'garden',
};

/** Interiors use their own, smaller set. */
export const INDOOR_LEGEND: Record<string, TileId> = {
  '.': 'board',
  'p': 'painted',
  'c': 'carpet',
  'k': 'kitchenfloor',
  'e': 'cellar',
  'x': 'site',
  'f': 'flag',
  'g': 'gravel',
};

/** What a footstep sounds like on each tile. */
export const STEP_SOUND: Partial<Record<TileId, 'grass' | 'gravel' | 'board' | 'stone'>> = {
  grass: 'grass', lawn: 'grass', meadow: 'grass', garden: 'grass', straw: 'grass',
  gravel: 'gravel', dirt: 'gravel', site: 'gravel', sand: 'gravel', mud: 'gravel',
  board: 'board', painted: 'board', carpet: 'board', deck: 'board',
  flag: 'stone', brickyard: 'stone', kitchenfloor: 'stone', cellar: 'stone',
  // Cambridge. Snow is the quietest footstep in the game and slush is the
  // loudest, which is most of what a winter camp sounds like.
  snow: 'grass', slush: 'gravel', trampled: 'gravel', turf: 'grass', ice: 'stone',
};
