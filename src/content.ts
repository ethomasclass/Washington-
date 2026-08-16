/**
 * The scene registry.
 *
 * Scenes live one to a file under scenes/. In the real build these are JSON on
 * disk loaded per act, which is also the payload strategy: a class period only
 * ever needs one act resident.
 */

import { MV01 } from './scenes/mv01';
import { CB01 } from './scenes/cb01';
import { CB02 } from './scenes/cb02';
import { CB03 } from './scenes/cb03';
import type { Decision, Scene } from './types';
import type { LedgerLine } from './ledger';

export * from './types';

export const SCENES: Record<string, Scene> = {
  [MV01.id]: MV01,
  [CB01.id]: CB01,
  [CB02.id]: CB02,
  [CB03.id]: CB03,
};

export const FIRST_SCENE = MV01.id;

export const sceneList = (): Scene[] => Object.values(SCENES);

/**
 * Every decision in the game, warm-ups included, in no particular order.
 *
 * Decisions are authored inside the thread that raises them, which is right for
 * writing and useless for looking one up six months later by id. The reckoning
 * has to do exactly that: `state.decisions` records id pairs and nothing else,
 * so the ledger lines have to be found again from the content.
 */
export function decisionList(): Decision[] {
  const out: Decision[] = [];
  for (const scene of sceneList()) {
    for (const thread of scene.npcs) {
      if (thread.warmup) out.push(thread.warmup);
      if (thread.decision) out.push(thread.decision);
    }
  }
  return out;
}

/**
 * What a settled decision put in, or took out of, the army.
 *
 * The lookup `reckon()` runs on. Returns nothing for the great majority of
 * choices — most decisions in this game move the man and not the headcount,
 * and a game where every choice adjusts a visible number is the scoreboard
 * `08` §2.2 exists to prevent.
 */
export function ledgerFor(decision: string, option: string): LedgerLine[] {
  const d = decisionList().find((x) => x.id === decision);
  return d?.options.find((o) => o.id === option)?.ledger ?? [];
}
