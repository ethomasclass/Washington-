/**
 * Content types.
 *
 * In the real build the scenes are JSON on disk, validated by the build-time
 * linter (06-technical-architecture.md §6). They are typed TypeScript here only
 * so the prototype compiles without a loader; these interfaces are the schema.
 */

import type { StatId } from './state';
import type { VoiceId } from './palette';

/**
 * A document that contradicts something a person said.
 *
 * The binding rule from reference-game-analysis.md: every scene must contain at
 * least one object whose examine text contradicts an NPC. It is the mechanic
 * that teaches source-checking without ever naming it — but it only lands if
 * the claim was heard first, so the extra line is gated on having spoken to
 * them.
 */
export interface Contradiction {
  /** Flag set when the person makes the claim. */
  heard: string;
  /** Appended to the examine text once the claim has been heard. */
  line: string;
  /** Set once the player has both heard the claim and seen the document. */
  grants: string;
  /** How the journal records it. */
  note: string;
}

export interface Interactable {
  id: string;
  label: string;
  /** Across the frame, 0..1. */
  x: number;
  /** Into the frame: 0 at the near edge, 1 at the horizon. */
  z: number;
  examine: string;
  /** Reading this sets a knowledge flag. Documents never move stats. */
  grants?: string;
  contradicts?: Contradiction;
}

/**
 * An interior voice, spoken unprompted as Washington passes something.
 *
 * Gated on the voice being loud enough to speak, so which thoughts a player
 * hears at all depends on the man they are building. A quiet Temper simply
 * never says the bitter thing about the royal commission.
 */
export interface Ambient {
  id: string;
  voice: VoiceId;
  line: string;
  x: number;
  z: number;
  /** Ground radius that triggers it. */
  r: number;
  /** Minimum loudness for this voice to speak here. */
  minLoudness: number;
}

/**
 * Something he does, rather than something he looks at.
 *
 * Historically constrained: Washington was a planter, and the daily work of
 * Mount Vernon was done by enslaved people and hired hands. He rode the farms,
 * kept the weather diary, wrote letters, inspected, and gave instructions. He
 * did not muck stalls or feed livestock, and a game that has him do so is
 * lying about how the place ran.
 *
 * So where a task involves physical work, the result names who actually did it.
 * That is the whole point of including tasks at all: the ordinary business of
 * the morning is where the arrangement of the place shows itself.
 */
export interface Task {
  id: string;
  /** Phrased as an action — this is a thing done, not a thing read. */
  label: string;
  x: number;
  z: number;
  /** What happens when he does it. */
  done: string;
  grants: string;
  /** How the journal records it. */
  note: string;
  /** Gate, if it needs something known or someone spoken to first. */
  requires?: string;
  requiresNote?: string;
}

export interface DialogueLine {
  speaker: string;
  portraitSeed: number;
  coat: string;
  text: string;
}

export interface Option {
  id: string;
  /** Short label — what the player scans. Two to five words. */
  label: string;
  /** The full sentence. Shown only for the focused option. */
  full: string;
  /** Which council voices would have it so. Rendered as emblems. */
  favoured: VoiceId[];
  /** Knowledge flag required. Without it the option is struck, not hidden. */
  requires?: string;
  lockNote?: string;
  effects: Partial<Record<StatId, number>>;
  result: string;
}

export interface Decision {
  id: string;
  prompt: string;
  speaker: string;
  portraitSeed: number;
  coat: string;
  voices: VoiceId[];
  interjections: Partial<Record<VoiceId, string>>;
  options: Option[];
}

/**
 * How a figure is built, so a crowd is not one person in five coats.
 *
 * Silhouette does most of the differentiating at this size — a round hat reads
 * differently from a tricorne at eighty pixels, and height and build separate
 * people faster than colour does.
 */
export interface Look {
  coat: string;
  hat?: 'tricorne' | 'round' | 'none';
  /** Shoulder and hip width multiplier, around 1. */
  build?: number;
  /** Height multiplier, around 1. Washington was notably tall. */
  tall?: number;
}

export interface NpcThread {
  id: string;
  /** Appearance in the world, distinct from the dialogue portrait. */
  look?: Look;
  /** Set once their lines have been heard, so documents can contradict them. */
  hearFlag?: string;
  /** Shown on the interaction prompt. "speak" tells the player nothing. */
  name: string;
  x: number;
  z: number;
  lines: DialogueLine[];
  decision?: Decision;
  /** Lines shown once the thread's decision is done. */
  after?: DialogueLine[];
}


/**
 * Business the act will not close without. Everything else in the scene is
 * optional, and the optional things are what open the locked choices — so a
 * student who only does the business gets a thinner version of the same act
 * rather than a shorter one.
 */
export interface Business {
  /** The decision that settles it. */
  decision: string;
  /** How Washington thinks about it while it is unsettled. */
  pending: string;
}


/** A composed view: one plate, one ground plane, one act's worth of business. */
export interface Scene {
  id: string;
  act: number;
  title: string;
  subtitle: string;
  /** What this act is for, in one line. */
  purpose: string;
  /** Strength present and fit for duty. Null before there is an army. */
  strength: { fit: number; onRolls: number; dated: string } | null;
  /** Shown in place of the return when there is nothing to count. */
  noStrength: string;
  opening: string[];
  business: Business[];
  /** Interactable that ends the scene. */
  exit: string;
  /** Scene to move to when the exit is taken, if any. */
  exitTo?: string;
  /** Confirmation shown before leaving. */
  exitPrompt: string;
  settled: string;
  allTasksFlag: string;
  ambient: Ambient[];
  tasks: Task[];
  interactables: Interactable[];
  npcs: NpcThread[];
  /** Which placeholder plate set the renderer should build. */
  plates: 'vernon' | 'camp';
}
