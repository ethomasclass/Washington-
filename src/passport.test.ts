/**
 * Round-trip checks for the passport codec.
 *
 * This is the one piece of the project where a silent bug destroys a student's
 * work with no way to recover it, so it gets tested even though almost nothing
 * else in a game like this is worth a unit test.
 *
 * Run with:  npx tsx src/passport.test.ts
 */

import { decode, encode, FLAG_REGISTRY } from './passport';
import { SCENE_ORDER } from './scene-order';
import { applyDelta, initialState } from './state';
import { sceneList } from './content';
import { figureHalfW, frameX } from './ground';

let failures = 0;

function check(name: string, cond: boolean, detail = ''): void {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name} ${detail}`);
  }
}

console.log('passport codec');

// 1. A fresh run survives the trip.
{
  const a = initialState();
  const b = decode(encode(a));
  check('fresh state round-trips stats', JSON.stringify(a.stats) === JSON.stringify(b.stats));
  check('fresh state round-trips act', a.act === b.act);
}

// 2. A played run survives the trip.
{
  const a = initialState();
  applyDelta(a, 'judgment', 8);
  applyDelta(a, 'legitimacy', -6);
  applyDelta(a, 'character', 5);
  a.knowledge.add('doc.a1.boston_clipping');
  a.knowledge.add('obs.a1.scaffolding');
  a.act = 3;

  const b = decode(encode(a));
  check('played state round-trips stats', JSON.stringify(a.stats) === JSON.stringify(b.stats),
    `${JSON.stringify(a.stats)} vs ${JSON.stringify(b.stats)}`);
  check('played state round-trips act', a.act === b.act);
  check('knowledge flags survive',
    [...a.knowledge].every((f) => b.knowledge.has(f)) && a.knowledge.size === b.knowledge.size);
  check('unset flags stay unset', !b.knowledge.has('doc.a1.ledger'));
}

// 3. Every stat value in range survives exactly.
{
  let exact = true;
  for (let v = 0; v <= 100; v++) {
    const a = initialState();
    a.stats.loyalty = v;
    if (decode(encode(a)).stats.loyalty !== v) exact = false;
  }
  check('all stat values 0..100 survive exactly', exact);
}

// 4. Every registered flag has its own bit.
{
  let independent = true;
  for (const flag of FLAG_REGISTRY) {
    const a = initialState();
    a.knowledge.add(flag);
    const b = decode(encode(a));
    if (!b.knowledge.has(flag) || b.knowledge.size !== 1) independent = false;
  }
  check('each flag round-trips independently', independent);
}

// 5. A typo is rejected rather than silently accepted.
{
  const good = encode(initialState());
  const chars = good.replace(/-/g, '');
  let caught = 0;
  let missed = 0;
  for (let i = 0; i < chars.length; i++) {
    for (const sub of ['2', '7', 'K', 'Z']) {
      if (chars[i] === sub) continue;
      const bad = chars.slice(0, i) + sub + chars.slice(i + 1);
      try {
        decode(bad);
        missed++;
      } catch {
        caught++;
      }
    }
  }
  check(`single-character typos rejected (${caught} caught, ${missed} missed)`, missed === 0);
}

// 6. Formatting is forgiving: case, spacing and hyphens should not matter.
{
  const good = encode(initialState());
  const messy = ` ${good.toLowerCase().replace(/-/g, ' ')} `;
  let ok = true;
  try {
    decode(messy);
  } catch {
    ok = false;
  }
  check('lowercase, spaced and unhyphenated codes still decode', ok);
}

/*
 * 7. The code stays short enough for a student to copy by hand.
 *
 * Measured on the payload, not the display. encode() groups the characters in
 * fours with hyphens for legibility and decode() throws them away, so a student
 * who copies the groups wrong still gets in — the hyphens are not part of what
 * has to be right. The old check counted them and so was measuring the wrong
 * thing by about a fifth.
 *
 * Thirty-two payload characters is roughly a Windows product key and a half.
 * Past that a class period starts losing time to typing.
 */
{
  const shown = encode(initialState());
  const len = shown.replace(/-/g, '').length;
  check(`code is ${len} payload characters, shown as ${shown.length} (target: under 32)`, len < 32);
}

/*
 * 8. The passport has a ceiling, and this says how far off it is.
 *
 * Every flag is one bit and the registry is append-only, so the code grows with
 * the content and never shrinks. At the rate the first three scenes set — about
 * twenty flags each — the eight acts this game is specified for would need a
 * code of a hundred characters, which no class is going to copy off a board.
 *
 * That is an architecture problem, not a tuning one, and the fix is in the
 * design already: a class period only ever needs one act resident, so a code
 * should carry the run rather than the browsing history. Most obs.* flags exist
 * to fill a journal and gate a contradiction inside a single scene and have no
 * business surviving the act. This check does not fail on that — it reports the
 * headroom, so the decision gets made before a classroom is depending on it.
 */
{
  const bits = 4 + 4 + 5 + 7 * 8 + FLAG_REGISTRY.length + 16;
  const room = Math.floor((32 * 5 - bits) / 1);
  console.log(`  note ${FLAG_REGISTRY.length} flags · ${bits} bits · ` +
    `${room} bits of headroom before the code passes 32 characters`);
}

// ---------------------------------------------------------------- content linter
//
// A first slice of the build-time linter specced in 06-technical-architecture.md
// §6, run over every scene. These are the checks that fail silently at runtime
// rather than loudly, so they are the ones worth having early.

const REACH = 0.085;
const BOUND = { x0: 0.05, x1: 0.95, z0: 0.1, z1: 0.82 };
const registry = new Set(FLAG_REGISTRY);
const allGrants = new Set<string>();

for (const scene of sceneList()) {
  console.log(`\ncontent · ${scene.id}`);

  const grants = new Set<string>();
  const requires = new Set<string>();
  for (const it of scene.interactables) {
    if (it.grants) grants.add(it.grants);
    for (const t of it.survey ?? []) grants.add(t.grants);
    if (it.contradicts) {
      grants.add(it.contradicts.grants);
      requires.add(it.contradicts.heard);
    }
  }
  for (const n of scene.npcs) {
    if (n.hearFlag) grants.add(n.hearFlag);
    for (const o of n.decision?.options ?? []) if (o.requires) requires.add(o.requires);
  }
  for (const t of scene.tasks) {
    grants.add(t.grants);
    if (t.requires) requires.add(t.requires);
  }
  grants.add(scene.allTasksFlag);
  for (const g of grants) allGrants.add(g);

  const unregistered = [...grants, ...requires].filter((f) => !registry.has(f));
  check('every flag is in the passport registry', unregistered.length === 0, unregistered.join(', '));

  const unsatisfiable = [...requires].filter((f) => !grants.has(f));
  check('every required flag is granted in the same scene', unsatisfiable.length === 0,
    unsatisfiable.join(', '));

  // Emblems, locks, and the voices behind them.
  const orphans: string[] = [];
  const unnoted: string[] = [];
  for (const n of scene.npcs) {
    const d = n.decision;
    if (!d) continue;
    const authored = new Set(d.voices);
    for (const o of d.options) {
      for (const v of o.favoured) if (!authored.has(v)) orphans.push(`${d.id}/${o.id}: ${v}`);
      if (o.requires && !o.lockNote) unnoted.push(`${d.id}/${o.id}`);
    }
    for (const v of d.voices) if (!d.interjections[v]) orphans.push(`${d.id}: ${v} silent`);
  }
  check('option emblems cite only voices present', orphans.length === 0, orphans.join('; '));
  check('every gated option explains its lock', unnoted.length === 0, unnoted.join(', '));

  const silentTasks = scene.tasks.filter((t) => t.requires && !t.requiresNote).map((t) => t.id);
  check('every gated task explains itself', silentTasks.length === 0, silentTasks.join(', '));

  const badAmbient: string[] = [];
  for (const a of scene.ambient) {
    if (!a.line.trim()) badAmbient.push(`${a.id}: empty`);
    if (a.x < BOUND.x0 || a.x > BOUND.x1 || a.z < BOUND.z0 || a.z > BOUND.z1)
      badAmbient.push(`${a.id}: out of bounds`);
    if (a.r < 0.06) badAmbient.push(`${a.id}: radius under a walking step`);
    if (a.minLoudness > 0.62) badAmbient.push(`${a.id}: threshold unreachable`);
  }
  check('ambient voices reachable and authored', badAmbient.length === 0, badAmbient.join('; '));

  check(`a document answers back (${scene.interactables.filter((i) => i.contradicts).length})`,
    scene.interactables.some((i) => i.contradicts));

  /*
   * The register rule (08-progress-enlistment-and-playability.md §8).
   *
   * The world may be hard — Sergeant Starr says "the paper says the tenth of
   * December" because that is how he talked, and difficulty there is the
   * subject matter. The interface may not be. So the strings a lost student
   * reads to find out what they are doing get measured, and nothing else does.
   *
   * Sentences, not strings: a situation line is allowed to be three short
   * sentences and is not allowed to be one long one. That is the actual
   * failure mode — the 44-word single sentence with its verb four clauses in.
   */
  const sentences = (s: string): string[] =>
    s.split(/(?<=[.?!])\s+/).map((t) => t.trim()).filter(Boolean);
  const words = (s: string): number => s.split(/\s+/).filter(Boolean).length;
  const overlong: string[] = [];
  const measure = (label: string, text: string, cap: number): void => {
    for (const sn of sentences(text)) {
      if (words(sn) > cap) overlong.push(`${label}: ${words(sn)} words`);
    }
  };
  scene.objectives.forEach((o, i) => measure(`objective ${i + 1}`, o, 16));
  scene.situation.forEach((s, i) => measure(`situation ${i + 1}`, s, 22));
  measure('purpose', scene.purpose, 16);
  measure('noStrength', scene.noStrength, 22);
  check('interface strings stay inside the register', overlong.length === 0,
    overlong.join('; '));

  check(`the job line is short enough to read at a glance (${words(scene.purpose)} words)`,
    words(scene.purpose) <= 14, scene.purpose);

  check('three objectives at most, or it is a chore list',
    scene.objectives.length > 0 && scene.objectives.length <= 3);

  check(`density floor (${scene.interactables.length} interactables, floor 12)`,
    scene.interactables.length >= 12);

  // Nothing may be shadowed by a neighbour, in the metric the game targets with.
  const pts = [
    ...scene.interactables.map((i) => ({ id: i.id, x: i.x, z: i.z })),
    ...scene.npcs.map((n) => ({ id: n.id, x: n.x, z: n.z })),
    ...scene.tasks.map((t) => ({ id: t.id, x: t.x, z: t.z })),
  ];
  let worst = { a: '', b: '', d: 1 };
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, (pts[i].z - pts[j].z) * 0.75);
      if (d < worst.d) worst = { a: pts[i].id, b: pts[j].id, d };
    }
  }
  check(`nothing shadowed (closest pair ${worst.d.toFixed(3)})`, worst.d >= REACH,
    `${worst.a} / ${worst.b}`);

  /*
   * Ground distance is not enough on its own. Depth compresses the frame toward
   * the centre, so two figures a comfortable step apart at the front of the
   * scene are drawn on top of each other at the back — the ground-space check
   * above passes and the players still see one blob. This one measures the gap
   * where it actually matters, in frame widths after projection.
   *
   * Figures only. Interactables are painted into the plates and have no cutout
   * to collide with.
   */
  /*
   * Two different requirements, so two different thresholds.
   *
   * A target the player has to walk up to and speak with must stand clear of
   * every other figure, or one of them is unreachable. An extra is scenery: men
   * in a camp stand close together and a crowd that keeps a polite two paces
   * between everybody reads as a queue. So extras must not obscure a target and
   * must not stack exactly on each other, and are otherwise free to overlap.
   */
  const gapBetween = (a: { x: number; z: number }, c: { x: number; z: number }) =>
    Math.abs(frameX(a.x, a.z) - frameX(c.x, c.z)) - figureHalfW(a.z) - figureHalfW(c.z);
  const targets = scene.npcs.map((n) => ({ id: n.id, x: n.x, z: n.z }));
  const extras = (scene.extras ?? []).map((e, k) => ({ id: `extra${k}`, x: e.x, z: e.z }));

  let tight = { a: '', b: '', gap: 1 };
  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      const gap = gapBetween(targets[i], targets[j]);
      if (gap < tight.gap) tight = { a: targets[i].id, b: targets[j].id, gap };
    }
  }
  for (const e of extras) {
    for (const t of targets) {
      const gap = gapBetween(e, t);
      if (gap < tight.gap) tight = { a: e.id, b: t.id, gap };
    }
  }
  check(`no figure obscures a target (tightest ${tight.gap.toFixed(3)} of the frame)`,
    tight.gap >= 0.012, `${tight.a} / ${tight.b}`);

  let stacked = { a: '', b: '', gap: 1 };
  for (let i = 0; i < extras.length; i++) {
    for (let j = i + 1; j < extras.length; j++) {
      const gap = gapBetween(extras[i], extras[j]);
      if (gap < stacked.gap) stacked = { a: extras[i].id, b: extras[j].id, gap };
    }
  }
  if (extras.length > 1) {
    check(`no two extras stack (tightest ${stacked.gap.toFixed(3)} of the frame)`,
      stacked.gap >= 0.004, `${stacked.a} / ${stacked.b}`);
  }

  const outside = pts.filter(
    (p) => p.x < BOUND.x0 || p.x > BOUND.x1 || p.z < BOUND.z0 || p.z > BOUND.z1,
  );
  check('every target inside the walkable bounds', outside.length === 0,
    outside.map((p) => p.id).join(', '));

  check('the exit exists in the scene', scene.interactables.some((i) => i.id === scene.exit),
    scene.exit);
  if (scene.exitTo) {
    check(`exit leads somewhere real (${scene.exitTo})`, sceneList().some((s) => s.id === scene.exitTo));
  }
  check('the scene is in the save-code order', SCENE_ORDER.includes(scene.id), scene.id);
}

console.log('\ncontent · across scenes');
{
  const dead = FLAG_REGISTRY.filter((f) => !allGrants.has(f));
  check('no registry flag is dead weight', dead.length === 0, dead.join(', '));

  const missing = sceneList().filter((s) => !SCENE_ORDER.includes(s.id)).map((s) => s.id);
  check('every scene has a save-code slot', missing.length === 0, missing.join(', '));

  const withArmy = sceneList().filter((s) => s.strength);
  check(`the return is shown once there is an army (${withArmy.length} of ${sceneList().length})`,
    withArmy.every((s) => s.strength!.fit <= s.strength!.onRolls));
}

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} FAILED`);
if (failures > 0) process.exit(1);
