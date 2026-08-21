/**
 * The ledger: what an act cost, in men, and why.
 *
 * `docs/08-progress-enlistment-and-playability.md` §3. The Return shows what the
 * army IS; this shows what happened to it, and it is the only place in the game
 * where a number the player can see moves because of something they did.
 *
 * FOUR RULES, and they are what keep this from being a score.
 *
 * 1. Every line names its cause, in plain English, in the past tense. Not
 *    "morale penalty" — *"went home when their time ran out"*. This is the
 *    causal-naming rule (07) applied to arithmetic.
 * 2. At least one line is always something the player did, phrased so they
 *    recognise their own decision in it.
 * 3. At least one line is always something they could not have changed (R20).
 *    Putting the fixed loss on the same page as the earned gain, in the same
 *    type, is the most honest thing this game can do about command.
 * 4. No total, no comparison, no rank. The screen never says "better than last
 *    act" and never shows the historical figure — that belongs in the epilogue
 *    where there is room to argue with it.
 *
 * And the arithmetic rule that matters most (08 §2.2, RT-2): **the ledger is
 * never a function of the four hidden stats.** Every man in it is traceable to
 * an authored, named outcome. If a student reverse-engineers this, all they can
 * reverse-engineer is a list of things that actually happened.
 *
 * NOT IN THE PASSPORT. `06-technical-architecture.md` §6 rules counters out of
 * the code: they are recomputed from the decision record at assembly time,
 * which is exactly what `reckon()` does. Nothing here is stored.
 */

import type { GameState } from './state';

export interface LedgerLine {
  /** Signed, in men. Negative is a loss. */
  n: number;
  /** Why. Past tense, plain English, never a stat name. */
  cause: string;
  /**
   * True when this line is the direct consequence of a decision the player
   * made. The screen does not mark these — the player recognises their own
   * choice or they do not — but the linter uses it to enforce rule 2.
   */
  earned?: boolean;
}

export interface Reckoning {
  act: number;
  /** Where the act's strength was counted from, and when. */
  openedWith: number;
  openedOn: string;
  closedOn: string;
  lines: LedgerLine[];
  /** Sum of the opening and every line. Shown, never labelled as a score. */
  closedWith: number;
}

/**
 * What each act opens with, and the losses it takes whatever anyone does.
 *
 * FIGURES ARE UNVERIFIED. The opening strength is `CB-01`'s sourced return of
 * 3 July 1775. Everything below it is of the documented order — fewer than half
 * the army remained in service in January 1776, with strength falling under
 * 10,500 — but no line here has been checked against a primary source, and
 * `08` §10 makes that blocking for classroom use. Marked, not hidden.
 */
const ACTS: Record<number, {
  openedWith: number;
  openedOn: string;
  closedOn: string;
  fixed: LedgerLine[];
}> = {
  2: {
    openedWith: 16770,
    openedOn: '3 July 1775',
    closedOn: '1 January 1776',
    fixed: [
      /*
       * The fixed loss (R20), and it is the largest line on the page.
       *
       * Every enlistment in this army expires on 31 December and nothing the
       * player does prevents it. What their decision at the roll changes is how
       * many of these men come back — never whether the paper runs out. The
       * biggest number on the reckoning is therefore one they did not cause,
       * which is the whole design: a screen where every line is earned teaches
       * that command is a score.
       */
      { n: -6800, cause: 'whose time ran out on the thirty-first of December' },
      { n: -1900, cause: 'sick, or gone without being written down' },
      // A gain that is also not theirs. Militia are lent, not commanded.
      { n: 1800, cause: 'marched in from the county militia, for six weeks' },
    ],
  },

  /*
   * ACT 3 — BROOKLYN. FIGURES UNVERIFIED, and marked, like Act 2's.
   *
   * The opening strength is of the documented order for the army in and
   * around New York in late August 1776 — Washington reported something over
   * nineteen thousand on the rolls with a great many sick — and no line here
   * has been checked against a primary source. `08` §10 makes that blocking
   * for classroom use.
   *
   * The fixed losses are the act. About a thousand men were taken or killed
   * on Long Island on the twenty-seventh, including two major generals, and
   * the Connecticut militia went home in September in whole companies —
   * which is not a casualty and is by far the larger number. The evacuation
   * is on the page as a GAIN, because nine thousand men who were not
   * captured is what the night was for.
   */
  3: {
    openedWith: 19000,
    openedOn: '26 August 1776',
    closedOn: '30 August 1776',
    fixed: [
      { n: -5300, cause: 'militia who went home in September, by companies and by regiments' },
      { n: -1100, cause: 'sick, in a camp with no hospital worth the name' },
      { n: 9000, cause: 'taken off Long Island in one night, and not one man lost doing it' },
      { n: -9000, cause: 'who were on that island in the first place' },
    ],
  },

  /*
   * ACT 4 — THE DELAWARE. FIGURES UNVERIFIED, and marked.
   *
   * The opening strength is the documented order for the force at
   * McConkey's on 25 December: about two thousand four hundred fit for duty.
   * The largest line on the page is the one nothing on the twenty-sixth
   * changed — every enlistment expired on the thirty-first, and Trenton
   * bought six weeks, not a solution.
   */
  4: {
    openedWith: 2400,
    openedOn: '25 December 1776',
    closedOn: '31 December 1776',
    fixed: [
      { n: -1300, cause: 'whose enlistment expired on the thirty-first, as it always would' },
      { n: -60, cause: 'lost to exposure, frostbite and the road' },
      { n: 900, cause: 'Hessian prisoners, marched back across the river the same night' },
    ],
  },
};

/**
 * Assemble the act's reckoning from the decision record.
 *
 * Recomputed, never accumulated: the same decisions always produce the same
 * page, on any machine, which is the determinism the classroom requires.
 */
export function reckon(
  act: number,
  state: GameState,
  earnedFor: (decisionId: string, optionId: string) => LedgerLine[],
): Reckoning | null {
  const a = ACTS[act];
  if (!a) return null;

  const lines: LedgerLine[] = [...a.fixed];
  for (const [decision, option] of state.decisions) {
    for (const line of earnedFor(decision, option)) lines.push({ ...line, earned: true });
  }

  /*
   * Losses first, then the gains — so the page reads as the hole and then what
   * was done about it, which is the order the winter actually happened in. And
   * heaviest first inside each group, in both directions: a column that ran
   * ascending on one side and descending on the other would be arithmetically
   * tidy and would read as though the small gains mattered most.
   */
  lines.sort((p, q) =>
    p.n < 0 === q.n < 0 ? Math.abs(q.n) - Math.abs(p.n) : p.n - q.n);

  return {
    act,
    openedWith: a.openedWith,
    openedOn: a.openedOn,
    closedOn: a.closedOn,
    lines,
    closedWith: lines.reduce((t, l) => t + l.n, a.openedWith),
  };
}

/** Which acts have a reckoning authored. Used by the linter. */
export const RECKONED_ACTS = Object.keys(ACTS).map(Number);
