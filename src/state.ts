/**
 * Global state: four hidden stats, knowledge flags, decision record.
 *
 * Ruling applied here (docs disagreed): the stat range is 0-100, not 0-127.
 * Every authored delta in 05-act-scene-inventory.md and every threshold in
 * 07-stat-and-voice-system.md is written against 0-100.
 *
 * The two paths never cross:
 *   documents write to `knowledge`  (they unlock dialogue OPTIONS)
 *   decisions write to `stats`      (they move the man)
 */

export type StatId = 'judgment' | 'legitimacy' | 'loyalty' | 'character';
export type Band = 'low' | 'mid' | 'high';

export const BAND_LOW = 34;
export const BAND_HIGH = 67;

/** Deltas attenuate near the bounds so the run can neither saturate nor die. */
const KNEE = 30;

export interface GameState {
  stats: Record<StatId, number>;
  /** Snapshot taken at act entry. Drives portrait + world mood only. */
  snapshot: Record<StatId, number>;
  knowledge: Set<string>;
  decisions: Map<string, string>;
  act: number;
  scene: string;
}

export function initialState(): GameState {
  return {
    stats: { judgment: 48, legitimacy: 55, loyalty: 40, character: 60 },
    snapshot: { judgment: 48, legitimacy: 55, loyalty: 40, character: 60 },
    knowledge: new Set<string>(),
    decisions: new Map<string, string>(),
    act: 1,
    scene: 'MV-01',
  };
}

export function bandOf(v: number): Band {
  if (v < BAND_LOW) return 'low';
  if (v < BAND_HIGH) return 'mid';
  return 'high';
}

/**
 * Soft shoulder: a delta attenuates to 40% within KNEE points of the bound it
 * is pushing toward. Sealed decisions bypass this — that is what "sealed" means
 * arithmetically.
 */
export function applyDelta(
  state: GameState,
  stat: StatId,
  delta: number,
  sealed = false,
): void {
  const cur = state.stats[stat];
  let d = delta;
  if (!sealed) {
    const room = delta > 0 ? 100 - cur : cur;
    if (room < KNEE) d = delta * (0.4 + 0.6 * (room / KNEE));
  }
  state.stats[stat] = Math.max(0, Math.min(100, Math.round(cur + d)));
}

/** Called at act entry only. Anti-shimmer, and anti-optimisation. */
export function takeSnapshot(state: GameState): void {
  state.snapshot = { ...state.stats };
}

/**
 * Composite character scalar driving the portrait ladder. Deliberately separate
 * from the world-mood controller, which carries a time term and per-act floors —
 * Washington's face must not change because it is April at Valley Forge.
 */
export function characterScalar(s: Record<StatId, number>): number {
  return (
    (0.4 * s.character + 0.25 * s.legitimacy + 0.25 * s.loyalty + 0.1 * s.judgment) /
    100
  );
}

/** World mood, 0..1. Drives the wash, never the line. */
export function moodScalar(s: Record<StatId, number>): number {
  return (0.4 * s.loyalty + 0.3 * s.legitimacy + 0.2 * s.character + 0.1 * s.judgment) / 100;
}

/**
 * Voice loudness. Each voice is a monotone weighted pair of normalised stats.
 * This is why the condition grammar needs a `voice` leaf: it cannot be
 * expressed as a single-stat threshold.
 */
export function loudness(voice: string, s: Record<StatId, number>): number {
  const n = (k: StatId) => s[k] / 100;
  switch (voice) {
    // Grievance is the ranks' as much as his: the more the army trusts him, the
    // more freely he is furious on its behalf.
    case 'temper':
      return 0.55 * n('loyalty') + 0.45 * (1 - n('character'));
    // The voice that would save him fades first, as he frays and as his
    // standing collapses.
    case 'restraint':
      return 0.55 * n('character') + 0.45 * n('legitimacy');
    // Good judgment with slipping self-government — a genuinely dangerous man,
    // and he is the one who hears the spur loudest.
    case 'ambition':
      return 0.60 * n('judgment') + 0.40 * (1 - n('character'));
    // The only even split and the only formula with no inverted term. The
    // plainest voice gets the plainest arithmetic.
    case 'duty':
      return 0.50 * n('legitimacy') + 0.50 * n('character');
    // Inverted against standing (R5): as the credit collapses, the mirror gets
    // louder. The student sees no number; they notice a preening voice that
    // will not shut up.
    case 'vanity':
      return 0.65 * (1 - n('legitimacy')) + 0.35 * n('judgment');
    default:
      return 0;
  }
}

/** Below this a voice is dropped from an authored set — subject to the floor. */
export const DROP_BELOW = 0.28;
/** At or above this a voice will not let the argument end, and speaks again. */
export const INSIST_ABOVE = 0.72;
/** R4: never fewer than two voices at a decision, and never all five. */
export const COUNCIL_MIN = 2;
export const COUNCIL_MAX = 4;
