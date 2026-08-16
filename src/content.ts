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
import { BAND_WIDTH, figureHalfW, frameX, spreadAt } from './ground';
import type { Decision, Scene, Station } from './types';
import type { LedgerLine } from './ledger';

export * from './types';

/* ------------------------------------------------------------------ staging */

/**
 * Where a station's things sit, as half-axes of an ellipse about it.
 *
 * Wider than it is deep because the frame is: the walkable ground is nearly
 * twice as wide as it is deep once the horizon is accounted for, and a circle
 * in ground coordinates draws as a long oval running away from the camera.
 * These numbers are about three men wide at the near edge, which is what a
 * group of people working round one table actually occupies.
 */
const RING = { x: 0.075, z: 0.055 };

/**
 * People stand outside the ring of things. A man works at his table, not on it.
 *
 * Extras share the radius and take the far side of it, which is cheaper than a
 * second ring and keeps every figure at a station roughly the same distance
 * out — a group standing at one remove from the work, rather than a target
 * ringed by concentric orbits of bystanders.
 */
const STAND = 1.75;

/** Walkable bounds, mirrored from main.ts. Nothing is ever staged outside them. */
const BOUND = { x0: 0.06, x1: 0.94, z0: 0.11 };

/** A stable angle per station, so five stations are not five identical rosettes. */
const spin = (id: string): number =>
  ([...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7) / 997) * Math.PI * 2;

/**
 * Place every station's members around it.
 *
 * Run once, at module load, over every scene — so by the time anything reads a
 * position it is already staged, and no consumer needs to know stations exist.
 *
 * The rule is that positions are DERIVED. An author says what belongs where and
 * never types a coordinate, which is the only way clustering survives contact
 * with editing: a hand-placed cluster is one careless nudge from being a
 * scatter again, and the scatter is invisible in a diff.
 *
 * Order matters and is meant to: members are laid anticlockwise from the far
 * side of the station, so the first thing authored stands at the back of the
 * group and the last stands nearest the camera.
 */
function stage(scene: Scene): void {
  if (!scene.stations) return;
  const far = (scene.walkTo ?? 0.82) - 0.005;
  /*
   * A place on the ring, reflected rather than clamped where it would leave the
   * frame.
   *
   * Clamping is the obvious thing and it is wrong: a station near the left edge
   * has three of its members pushed onto x = 0.06 and they stack in a column
   * against the wall, which is worse than the scatter this exists to fix.
   * Reflecting keeps the member at its proper distance from the station and
   * simply puts it on the other side, so a group at the edge of the frame
   * bunches inward the way a real one does.
   */
  const put = (o: { x: number; z: number }, s: Station, r: number, t: number, squash = 1): void => {
    const dx = RING.x * r * Math.cos(t);
    const dz = RING.z * r * squash * Math.sin(t);
    o.x = s.x + dx < BOUND.x0 || s.x + dx > BOUND.x1 ? s.x - dx : s.x + dx;
    o.z = s.z + dz < BOUND.z0 || s.z + dz > far ? s.z - dz : s.z + dz;
    o.x = Math.max(BOUND.x0, Math.min(BOUND.x1, o.x));
    o.z = Math.max(BOUND.z0, Math.min(far, o.z));
  };

  for (const s of scene.stations) {
    const things = [
      ...scene.interactables.filter((i) => i.at === s.id),
      ...scene.tasks.filter((t) => t.at === s.id),
    ];
    const base = spin(s.id);
    /*
     * A table and a wall are LINES, not areas.
     *
     * Things on a trestle sit along its length at one depth; things on a
     * chimney breast hang on one plane. Ringing them the way a fire or a stack
     * of casks rings its ground puts half of them a foot behind the furniture
     * they are supposed to be lying on, and lifting those onto the tabletop
     * then draws them floating past its back edge. So the ring is flattened
     * where the surface is flat, and the members spread sideways instead.
     */
    const flat = s.surface === 'table' || s.surface === 'wall';
    things.forEach((o, i) => {
      const n = things.length;
      // A station holding one thing puts it in the middle; there is no ring to
      // speak of, and pushing it off-centre only makes the furniture look wrong.
      if (n === 1) put(o, s, 0, 0);
      else if (flat) {
        // Along the length of it, alternating a little forward and back so a
        // row of five documents is a table in use and not a filing cabinet.
        const frac = (i / (n - 1)) * 2 - 1;
        o.x = Math.max(BOUND.x0, Math.min(BOUND.x1, s.x + RING.x * frac));
        o.z = Math.max(BOUND.z0, Math.min(far, s.z + RING.z * 0.28 * (i % 2 ? 1 : -1)));
      } else put(o, s, 1, base + Math.PI / 2 + (i * Math.PI * 2) / n);
    });

    /*
     * People stand on the OUTWARD side of their station — left of a station in
     * the left half of the frame, right of one in the right half — fanned out
     * from there.
     *
     * Not an arbitrary angle, and the reason is perspective. Two figures at
     * different depths converge toward the middle of the frame as they recede,
     * so two stations either side of centre that each put their man on the
     * inward side produce a pair that overlaps on screen while sitting a
     * comfortable distance apart on the ground. Facing them outward pushes
     * every figure toward the edge it belongs to and the frame stays legible.
     */
    const out = s.x < 0.5 ? Math.PI : 0;
    const folk = scene.npcs.filter((n) => n.at === s.id);
    folk.forEach((n, j) => put(n, s, STAND, out + (j - (folk.length - 1) / 2) * 0.9 - 0.35));

    // And the men who are simply here, gathered BEHIND the work — a station
    // reads as a place people have come to, rather than a display case with one
    // attendant, and standing them at the back keeps them clear of the person
    // the player actually has to speak to.
    const crowd = (scene.extras ?? []).filter((e) => e.at === s.id);
    crowd.forEach((e, k) =>
      put(e, s, STAND * 1.2, Math.PI / 2 + (k - (crowd.length - 1) / 2) * 0.95));

    // A thought about this place fires at the place. Where two share a station
    // they are pulled apart, or the second could never speak.
    const thoughts = scene.ambient.filter((a) => a.at === s.id);
    thoughts.forEach((a, m) =>
      thoughts.length === 1 ? put(a, s, 0, 0) : put(a, s, 0.8, base + m * Math.PI));
  }
}

/**
 * Push overlapping figures apart, after staging.
 *
 * The ring gets people to the right PLACE; it cannot get them to a legible
 * arrangement, because whether two figures overlap is a fact about the frame
 * and not about the ground. Perspective compresses width with depth, so a man
 * at the back of the scene and a man at the front can stand a comfortable pace
 * apart on the ground and still be drawn one in front of the other — and no
 * amount of choosing clever angles fixes that, as two attempts at choosing
 * clever angles demonstrated.
 *
 * So it is measured in the frame, where it matters, and relaxed until it
 * clears. Targets are heavy and extras are light: a man the player has to walk
 * up to and speak with stays where the staging put him, and the scenery moves
 * around him.
 */
function separate(scene: Scene): void {
  if (!scene.stations) return;
  type Body = { o: { x: number; z: number }; w: number; need: number };
  const bodies: Body[] = [
    ...scene.npcs.map((n) => ({ o: n, w: 0.25, need: 0.016 })),
    ...(scene.extras ?? []).map((e) => ({ o: e, w: 1, need: 0.008 })),
  ];
  /*
   * Two constraints, relaxed together in one loop.
   *
   * Run one after the other and they undo each other: pushing a man clear of
   * the next station's papers walks him straight back in front of the sergeant
   * he was just moved away from. Both were true at the same time, so both have
   * to be solved at the same time.
   */
  const fixed = [...scene.interactables, ...scene.tasks];
  const far = (scene.walkTo ?? 0.82) - 0.005;
  for (let pass = 0; pass < 120; pass++) {
    let worst = 0;

    /*
     * People off other stations' things.
     *
     * A person stands further out from their station than the things do, so the
     * outer ring of one station can reach into the inner ring of the next. Two
     * targets a reach apart is a targeting problem, and it does not care that
     * one of them is a man. Things never move: the cluster is the authored
     * shape, and the person is the one who can take a step.
     */
    for (const n of scene.npcs) {
      for (const f of fixed) {
        // A man may stand at his own table; he may not stand on it.
        const clear = f.at === n.at ? 0.072 : 0.092;
        const dx = n.x - f.x;
        const dz = (n.z - f.z) * 0.75;
        const d = Math.hypot(dx, dz) || 1e-4;
        if (d >= clear) continue;
        worst = Math.max(worst, clear - d);
        const k = (clear - d) * 0.5;
        n.x = Math.max(BOUND.x0, Math.min(BOUND.x1, n.x + (dx / d) * k));
        n.z = Math.max(BOUND.z0, Math.min(far, n.z + (dz / d) * k * 1.33));
      }
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const need = Math.max(a.need, b.need);
        const ax = frameX(a.o.x, a.o.z);
        const bx = frameX(b.o.x, b.o.z);
        const gap = Math.abs(ax - bx) - figureHalfW(a.o.z) - figureHalfW(b.o.z);
        if (gap >= need) continue;
        worst = Math.max(worst, need - gap);
        // Convert the frame shortfall back into ground x, split by weight.
        const push = ((need - gap) / spreadAt(0.5) / BAND_WIDTH) * 0.6;
        const dir = ax <= bx ? -1 : 1;
        const total = a.w + b.w || 1;
        a.o.x = Math.max(BOUND.x0, Math.min(BOUND.x1, a.o.x + dir * push * (a.w / total)));
        b.o.x = Math.max(BOUND.x0, Math.min(BOUND.x1, b.o.x - dir * push * (b.w / total)));
      }
    }
    if (worst === 0) return;
  }
}

for (const s of [MV01, CB01, CB02, CB03]) {
  stage(s);
  separate(s);
}

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
