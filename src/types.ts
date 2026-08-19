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
    /** Fired once, the first time the player crosses in. */
    onEnter?: string[];
  }>;
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
