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

/**
 * NEW YORK AND THE DELAWARE. Acts 3 and 4.
 *
 * Its own alphabet again, and for the same reason Cambridge got one: Brooklyn
 * needs salt marsh, tidal flat, cobble and plank, and has no use whatever for
 * a bowling green. Sharing one legend across every exterior in the game would
 * mean every future map inherited every past map's vocabulary, which is how a
 * legend turns into a dictionary nobody reads.
 */
export const FIELD_LEGEND: Record<string, TileId> = {
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
  // Acts 3 and 4's own ground.
  'q': 'marsh',
  'z': 'mudflat',
  'c': 'cobble',
  'k': 'plank',
  'o': 'furrow',
  'y': 'sleet',
  // Act 5's own ground. Five characters, and the act is three of them in
  // sequence: 'C' in December, 'P' from March, 'S' in May.
  'C': 'campmud',
  'P': 'parade',
  'S': 'springturf',
  'W': 'sawdust',
  'H': 'hutfloor',
};

/**
 * VIRGINIA INDOORS. Mount Vernon's floors and nobody else's.
 *
 * Wide pine boards, an ochre painted floorcloth in the passage, and a wine
 * turkey carpet in the best room.
 */
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

/**
 * NEW ENGLAND INDOORS. The Vassall House, and everything north of it.
 *
 * The same characters mean different floors, which is the whole point: the
 * first build of Cambridge used the Virginia legend and the borrowed
 * loyalist mansion came out furnished like a Potomac planter's. Narrow dark
 * oak instead of wide pine; a black-and-white diamond floorcloth imitating
 * marble paving instead of an ochre checker; a blue-green carpet instead of
 * a red one.
 */
export const NE_INDOOR_LEGEND: Record<string, TileId> = {
  '.': 'oakfloor',
  'p': 'marbled',
  'c': 'carpetBlue',
  'k': 'kitchenfloor',
  'e': 'cellar',
  'x': 'site',
  'f': 'flag',
  'b': 'board',
  'g': 'gravel',
  /*
   * The floor of a hut, which is an interior in every sense the engine
   * cares about and is bare beaten earth with straw on it. It is in the New
   * England legend rather than a legend of its own because Act 5's two
   * interiors are a Pennsylvania farmhouse and a soldier's hut, and one
   * character is not worth a third legend.
   */
  'H': 'hutfloor',
};

/** What a footstep sounds like on each tile. */
export const STEP_SOUND: Partial<Record<TileId, 'grass' | 'gravel' | 'board' | 'stone'>> = {
  grass: 'grass', lawn: 'grass', meadow: 'grass', garden: 'grass', straw: 'grass',
  gravel: 'gravel', dirt: 'gravel', site: 'gravel', sand: 'gravel', mud: 'gravel',
  board: 'board', painted: 'board', carpet: 'board', deck: 'board',
  oakfloor: 'board', marbled: 'board', carpetBlue: 'board',
  flag: 'stone', brickyard: 'stone', kitchenfloor: 'stone', cellar: 'stone',
  // Cambridge. Snow is the quietest footstep in the game and slush is the
  // loudest, which is most of what a winter camp sounds like.
  snow: 'grass', slush: 'gravel', trampled: 'gravel', turf: 'grass', ice: 'stone',
  // Brooklyn and the Delaware. A marsh is the quietest ground in the game and
  // a plank stage is the loudest, which is most of the difference between
  // walking a salt meadow and walking onto a boat in the dark.
  marsh: 'grass', mudflat: 'gravel', cobble: 'stone', plank: 'board',
  furrow: 'gravel', sleet: 'gravel',
};
