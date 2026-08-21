/**
 * Content types.
 *
 * Everything a writer authors is one of these. The engine reads them; nothing
 * in here knows what a texture is. That separation is what let the whole art
 * direction change under the writing without a line of the writing moving.
 */

import type { VoiceId } from './palette';
import type { ActorSpec } from './engine/actors';
import type { TileId } from './engine/tiles';
import type { Opening, WallStyle } from './engine/structures';
import type { Light } from './palette';
import type { Mood } from './engine/actors';
import type { LedgerLine } from './ledger';
import type { Mark } from './engine/overlay';

export type StatKey = 'judgment' | 'legitimacy' | 'loyalty' | 'character';

/* ---------------------------------------------------------------------- *
 * Decisions
 * ---------------------------------------------------------------------- */

export interface DecisionOption {
  id: string;
  /** The button. Four words at most. */
  label: string;
  /** The sentence he actually says or does. */
  full: string;
  favoured?: VoiceId[];
  effects: Partial<Record<StatKey, number>>;
  /** Knowledge flag that must be held for this to be sayable at all. */
  requires?: string;
  lockNote?: string;
  /** A part of him that has to be loud enough for him to say it. */
  voiceLock?: { voice: VoiceId; min: number };
  /** What happened. Past tense, never congratulatory. */
  result: string;
  /** Set on the option that is what the historical man did. */
  historical?: boolean;
  /**
   * Knowledge flags this option sets.
   *
   * Decisions write to `stats` and documents write to `knowledge`, and those
   * two paths deliberately never cross — see the header of `state.ts`. This
   * is not a crossing: nothing here may ever be the `requires` of another
   * option, and the linter checks it. It exists so the WORLD can know what
   * was settled — the season that follows the council of war, the order that
   * is now standing at the guard post — without main.ts growing a special
   * case per decision.
   */
  grants?: string[];
  /**
   * What this cost, in men, with the cause named in plain English.
   *
   * Rule 2 of the ledger (`ledger.ts`): at least one line on the reckoning is
   * always something the player did, phrased so they recognise their own
   * decision in it. These are those lines. The fixed losses live in
   * `ledger.ts` and are not authored here, because the player did not cause
   * them.
   */
  ledger?: LedgerLine[];
}

export interface Decision {
  id: string;
  prompt: string;
  speaker?: string;
  /** Whose portrait sits beside the question. */
  portrait?: string;
  voices: VoiceId[];
  interjections: Partial<Record<VoiceId, string>>;
  rejoinders?: Partial<Record<VoiceId, string>>;
  options: DecisionOption[];
  /**
   * Sealed decisions carry the red wax and the line THIS WILL NOT COME AGAIN,
   * and they bypass the soft shoulder in applyDelta. There are eight in the
   * whole game and Act 1 has one.
   */
  sealed?: boolean;
}

/* ---------------------------------------------------------------------- *
 * People
 * ---------------------------------------------------------------------- */

export interface Line {
  speaker: string;
  text: string;
  mood?: Mood;
}

export interface NpcDef {
  id: string;
  name: string;
  spec: ActorSpec;
  /** Tile position on the map that owns them. */
  x: number;
  z: number;
  facing?: 0 | 1 | 2 | 3;
  /** Walks a loop of tile positions when idle. */
  patrol?: Array<[number, number]>;
  /** Set when they have been spoken to at least once. */
  hearFlag?: string;
  lines: Line[];
  /** Spoken before the main lines, once, and it decides nothing. */
  warmup?: Decision;
  decision?: Decision;
  after?: Line[];
  /**
   * Witness Register. Marks a person the game will not let you transact with:
   * no task, no reward, no stat, and the interface says so by having nothing
   * to offer. Requires the §7.6 pedagogical sign-off before it ships.
   */
  sensitive?: boolean;
}

/* ---------------------------------------------------------------------- *
 * Things
 * ---------------------------------------------------------------------- */

export interface Interactable {
  id: string;
  label: string;
  x: number;
  z: number;
  examine: string;
  /** Knowledge flag granted by looking at it. */
  grants?: string;
  /** A second paragraph that only appears once something else is known. */
  contradicts?: {
    heard: string;
    line: string;
    grants?: string;
    note?: string;
  };
  /** Opens the document reader rather than the examine panel. */
  document?: string;
  /**
   * Opens a purpose-built screen instead of, or after, the examine panel.
   *
   * There are three, one per act that has a map table, and they are the
   * only three: a plan of the country between Ticonderoga and Cambridge
   * with tokens on it, a draught of the East River with a wind rose on it,
   * and the northern department with Saratoga on it. None of them is a
   * document and none of them is a conversation. The only honest way to put
   * a logistics problem, a wind, or a battle somebody else reported in
   * front of a student is to let them move the thing and watch what happens.
   *
   * Everything else in this game that looked like it wanted a special case
   * turned out not to need one, and that should stay true.
   */
  opens?: 'survey' | 'wind' | 'northern';
}

export type DocRegister = 'printed' | 'secretary' | 'engrossed' | 'rough';

export interface DocumentDef {
  id: string;
  title: string;
  cite: string;
  register: DocRegister;
  /** Body, as paragraphs. Rendered in-engine; never generated as an image. */
  body: string[];
  /** What reading it opens. */
  grants?: string;
  /** A short line under the title saying what this is and why it is here. */
  gloss?: string;
}

/* ---------------------------------------------------------------------- *
 * Maps
 * ---------------------------------------------------------------------- */

export interface StructureDef {
  id: string;
  /** Tile coordinates of the north-west corner. */
  x: number;
  z: number;
  /** Footprint in tiles. */
  w: number;
  d: number;
  /** Height in tiles. */
  h: number;
  style: WallStyle;
  roof?: 'hip' | 'gable' | 'shed' | 'none';
  /** Ridge height above the eaves, in tiles. */
  pitch?: number;
  /** Per-face openings, keyed by the face that carries them. */
  faces?: Partial<Record<'south' | 'north' | 'east' | 'west', Opening[]>>;
  cornice?: boolean;
  plinth?: boolean;
  /** Storey height in tiles, for placing upper-floor openings. */
  storeyH?: number;
  chimneys?: Array<{ at: number; on: 'east' | 'west' | 'ridge'; h: number }>;
  /** Walk straight through it — used for the open north wing. */
  passable?: boolean;
  seed?: number;
}

export interface PropInstance {
  id: string;
  x: number;
  z: number;
  /** Overrides the prop's own scale. 1 = as drawn. */
  scale?: number;
  /** Mirror horizontally. Free variety. */
  flip?: boolean;
  variant?: number;
}

export interface Portal {
  id: string;
  x: number;
  z: number;
  /** Tiles either side of (x,z) that also trigger it. */
  w?: number;
  d?: number;
  to: string;
  /** Spawn on the destination map. */
  at: [number, number];
  facing?: 0 | 1 | 2 | 3;
  label: string;
  /** 'cut' for a doorway, 'fade' for time or distance. */
  transition?: 'cut' | 'fade';
  /** Held shut until this flag is known. */
  requires?: string;
  lockedNote?: string;
  /**
   * A different destination once a flag is held.
   *
   * This is how one door serves two seasons. The Vassall House is the same
   * house in November and in January; what changes is the Cambridge outside
   * it. Rather than duplicating the interior, its door out carries an
   * alternative, and the flag that switches it is set by the decision that
   * ends the autumn.
   */
  alt?: { requires: string; to: string; at: [number, number] };
}

export interface MapDef {
  id: string;
  title: string;
  when: string;
  light: Light;
  /** One character per tile; decoded through `legend`. */
  ground: string[];
  /** Digits, one per tile. Height = digit * STEP. Optional; default flat. */
  elev?: string[];
  /** '#' wall, '+' doorway, ' ' nothing. Interiors mostly. */
  objects?: string[];
  legend: Record<string, TileId>;
  wallStyle?: WallStyle;
  wallTint?: string;
  wallHeight?: number;
  interior?: boolean;
  ceiling?: boolean;
  /**
   * How far the haze reaches, in world units. Defaults are 34/110 outdoors
   * and 14/46 indoors.
   *
   * Every map before Act 3 wanted the same distance, because every map
   * before Act 3 was a place you could see across. The night at the Brooklyn
   * ferry is not: the far shore is a mile off, it is dark, it is raining,
   * and `docs/05` §3.3 says in terms that the far shore is not drawn at all.
   * Bringing the fog in to 8/34 draws it by not drawing it.
   */
  fogNear?: number;
  fogFar?: number;
  structures?: StructureDef[];
  props: PropInstance[];
  npcs?: NpcDef[];
  interactables?: Interactable[];
  portals?: Portal[];
  spawn: { x: number; z: number; facing?: 0 | 1 | 2 | 3 };
  /**
   * Regions of one map that carry their own light.
   *
   * This is how the Witness Register survives a continuous world: the Quarter
   * is not a separate scene any more, so the grade has to change as the player
   * walks into it. Bloom drains, colour goes out, the camera comes in close,
   * and it takes about three seconds. The gate is literal, and nothing on
   * screen announces it.
   */
  zones?: Array<{
    id: string;
    x: number; z: number; w: number; d: number;
    light: Light;
    /** Camera distance inside the zone. Lower is closer and more level. */
    dist?: number;
    /**
     * A note in the game's own voice, shown once before anything else when
     * the player first crosses in.
     *
     * This is NOT narration and not a character speaking — it is the only
     * place in the game that steps out of 1775 and addresses the student
     * directly, in the present. It exists so that walking into the quarter
     * where the people Washington enslaved lived cannot be experienced as
     * scenery. Anything using it owes a source.
     */
    notice?: { title: string; body: string[]; source?: string };
    /** Fired once, the first time the player crosses in. */
    onEnter?: string[];
  }>;
  /**
   * What a surveyor would triangulate on from this ground.
   *
   * Deliberately a short, authored list rather than every interactable on
   * the map: a survey names the fixed points you take bearings to, and a
   * survey with a bearing to every barrel in the camp is not a survey. See
   * `engine/overlay.ts`.
   */
  marks?: Mark[];
  /** Shown once, on arrival, in the place banner. */
  arrival?: string[];
  /** Ambient interior-voice lines, fired by proximity, once each. */
  ambient?: Array<{
    id: string;
    x: number;
    z: number;
    r: number;
    minLoudness?: number;
    variants: Partial<Record<VoiceId, string>>;
  }>;
}
