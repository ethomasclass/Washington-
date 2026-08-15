/**
 * Cut or fade — 02 §8.6, "Cut = space. Fade = time."
 *
 * Walking through a door is a hard cut, because the man went somewhere and no
 * time passed. A fade to bare paper is spent only where time actually passed:
 * an act break, or a jump of months inside one act, which Act 2 does twice.
 *
 * Read off the scenes' own datelines rather than a hand-maintained list of
 * transitions, so a writer who moves a scene from July to November gets the
 * transition that change implies without touching the engine — and cannot get
 * a cut across four months by forgetting to add a table row.
 */

import type { Scene } from './types';

export function timePasses(from: Scene, to: Scene): boolean {
  // An act boundary always counts, even where the datelines happen to match:
  // in this game an act break is a reckoning, and the interlude sits in it.
  return from.act !== to.act || from.when !== to.when;
}
