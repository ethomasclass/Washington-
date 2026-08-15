/**
 * Who speaks, in what order, and who will not let it end.
 *
 * Pure functions over a stat vector, deliberately kept out of main.ts so the
 * rules that govern the interior can be asserted by the content linter rather
 * than eyeballed. Everything here reads LIVE stats, never the act snapshot:
 * the world is on the slow clock so it cannot be optimised against, but the
 * conversation is on the fast one, or nothing done inside an act could change
 * anything else inside it.
 */

import {
  COUNCIL_MAX,
  COUNCIL_MIN,
  DROP_BELOW,
  INSIST_ABOVE,
  loudness,
  type StatId,
} from './state';
import type { VoiceId } from './palette';
import type { Decision } from './types';

export interface VoiceView {
  id: VoiceId;
  line: string;
}

type Stats = Record<StatId, number>;

/**
 * The performance of an authored set.
 *
 * The writer authors WHICH voices have something to say about this question;
 * the engine decides which of them are audible today and in what order. It
 * never adds a voice the writer did not author — an unauthored voice has
 * nothing to say about that specific question, and a generic bark is worse
 * than silence. This is what protects a decision where the absence of a
 * particular voice IS the design from being helpfully repaired by a system.
 *
 * Three rules, in the order they are applied, because they can fight:
 *
 *  1. DROP — a voice under DROP_BELOW is too quiet to speak. This is how a
 *     player notices that Duty has gone silent.
 *  2. FLOOR — but never fewer than COUNCIL_MIN. The floor always beats the
 *     drop. One voice is not a council, it is an oracle, and an oracle teaches
 *     that leadership is compliance with an inner expert.
 *  3. CAP — and never more than COUNCIL_MAX, so all five never speak at once.
 *
 * Order is always loudest-first. It costs nothing, it is invisible as a
 * mechanic, and it is the most-consumed loudness signal in the game.
 */
export function councilFor(d: Decision, stats: Stats): VoiceView[] {
  const ranked = d.voices
    .filter((id) => (d.interjections[id] ?? '').length > 0)
    .map((id) => ({ id, l: loudness(id, stats) }))
    .sort((a, b) => b.l - a.l);

  const loud = ranked.filter((v) => v.l >= DROP_BELOW);
  // When the floor has to be applied it is filled from the top of the ranking,
  // so the voices that speak are always the loudest present — not a pair
  // chosen by authoring order.
  const kept = loud.length >= COUNCIL_MIN ? loud : ranked.slice(0, COUNCIL_MIN);

  return kept
    .slice(0, COUNCIL_MAX)
    .map((v) => ({ id: v.id, line: d.interjections[v.id] ?? '' }));
}

/**
 * Insistence: the loudest voice, if it is loud enough, speaks once more after
 * everyone else has finished.
 *
 * The single most legible loudness signal in the game — a part of him that will
 * not let the argument end. It is also, deliberately, the mechanism by which a
 * Washington whose standing has collapsed finds that Vanity gets the last word.
 *
 * A voice with no authored rejoinder here never gets it, however loud it is.
 * That is a writer's decision about this question, not an engine default.
 */
export function rejoinderFor(
  d: Decision,
  spoken: VoiceView[],
  stats: Stats,
): VoiceView | null {
  const first = spoken[0];
  if (!first) return null;
  if (loudness(first.id, stats) < INSIST_ABOVE) return null;
  const line = d.rejoinders?.[first.id];
  return line ? { id: first.id, line } : null;
}

/**
 * Whether an option is sayable at all, and why not.
 *
 * Two locks, two different refusals, and the knowledge one is reported first
 * because it is the openable one: if going and reading a thing would fix this,
 * say so, and do not also tell the player about a part of himself he cannot
 * change today.
 */
export type LockState =
  | { locked: false }
  | { locked: true; kind: 'knowledge'; note?: string }
  | { locked: true; kind: 'voice'; voice: VoiceId };

export function lockOn(
  o: Decision['options'][number],
  stats: Stats,
  knowledge: ReadonlySet<string>,
): LockState {
  if (o.requires && !knowledge.has(o.requires)) {
    return { locked: true, kind: 'knowledge', note: o.lockNote };
  }
  if (o.voiceLock && loudness(o.voiceLock.voice, stats) < o.voiceLock.min) {
    return { locked: true, kind: 'voice', voice: o.voiceLock.voice };
  }
  return { locked: false };
}
