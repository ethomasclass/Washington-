/**
 * Round-trip checks for the passport codec.
 *
 * This is the one piece of the project where a silent bug destroys a student's
 * work with no way to recover it, so it gets tested even though almost nothing
 * else in a game like this is worth a unit test.
 *
 * Run with:  npx tsx src/passport.test.ts
 */

import { decode, deserialise, encode, FLAG_REGISTRY, PASSPORT_FLAGS, serialise } from './passport';
import { SCENE_ORDER } from './scene-order';
import { applyDelta, initialState, loudness, type StatId } from './state';
import { decisionList, FIRST_SCENE, ledgerFor, SCENES, sceneList } from './content';
import { reckon, RECKONED_ACTS } from './ledger';
import {
  at, confidenceOf, gridRef, labelOffset, MAP_H, MAP_W, SCARS, scarsFor, THEATRES,
} from './theatre';
import { figureHalfW, frameX } from './ground';
import { walkFar } from './art';
import { councilFor, lockOn, rejoinderFor } from './council';
import { timePasses } from './transition';
import { CSS } from './ui';
import { INK, type VoiceId } from './palette';
import type { Decision } from './types';

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
  a.knowledge.add('obs.a1.scaffolding'); // act-scoped: deliberately does not travel
  a.act = 3;

  const b = decode(encode(a));
  check('played state round-trips stats', JSON.stringify(a.stats) === JSON.stringify(b.stats),
    `${JSON.stringify(a.stats)} vs ${JSON.stringify(b.stats)}`);
  check('played state round-trips act', a.act === b.act);
  check('documents survive the trip', b.knowledge.has('doc.a1.boston_clipping'));
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
  for (const flag of PASSPORT_FLAGS) {
    const a = initialState();
    a.knowledge.add(flag);
    const b = decode(encode(a));
    if (!b.knowledge.has(flag) || b.knowledge.size !== 1) independent = false;
  }
  check(`each passport flag round-trips independently (${PASSPORT_FLAGS.length})`, independent);

  /*
   * The scoping rule, asserted rather than trusted.
   *
   * Every document must travel — the ribbon is the assessment artifact. Nothing
   * else may, or the code starts growing with the content again, which is the
   * failure this whole split exists to prevent.
   */
  const docs = FLAG_REGISTRY.filter((f) => f.startsWith('doc.'));
  const missing = docs.filter((f) => !PASSPORT_FLAGS.includes(f));
  check(`every document travels (${docs.length})`, missing.length === 0, missing.join(', '));

  const strays = PASSPORT_FLAGS.filter((f) => !f.startsWith('doc.'));
  check('nothing but documents travels', strays.length === 0, strays.join(', '));

  const unregistered = PASSPORT_FLAGS.filter((f) => !FLAG_REGISTRY.includes(f));
  check('every passport flag is a real flag', unregistered.length === 0, unregistered.join(', '));

  /*
   * An act-scoped flag is DROPPED by the code on purpose. This asserts the
   * intended loss, so that if someone later makes a within-act observation
   * gate something in a later act, this fails and they have to think about it.
   */
  {
    const a = initialState();
    a.knowledge.add('task.a1.weather');
    a.knowledge.add('doc.a1.ledger');
    const b = decode(encode(a));
    check('act-scoped flags do not travel, documents do',
      !b.knowledge.has('task.a1.weather') && b.knowledge.has('doc.a1.ledger'));
  }

  // The local save, which is a different thing and loses nothing.
  {
    const a = initialState();
    a.knowledge.add('task.a1.weather');
    a.knowledge.add('doc.a1.ledger');
    a.decisions.set('A1-D1', 'accept_plain');
    a.act = 2;
    const b = deserialise(serialise(a))!;
    check('the local save keeps everything the code drops',
      b.knowledge.has('task.a1.weather') && b.decisions.get('A1-D1') === 'accept_plain' &&
      b.act === 2 && b.knowledge.size === a.knowledge.size);
  }
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
 * 8. The ceiling, and how much room is left under it.
 *
 * This used to report a problem: every flag was one bit, the registry is
 * append-only, and three scenes had already spent 59 of them — which projected
 * to a hundred-character code by Act 8 and a class that would never copy it.
 *
 * The fix was architectural, not arithmetic. Only documents travel now (see
 * PASSPORT_FLAGS), because 07 §2.1.3 guarantees every lock is satisfiable
 * inside its own act, so nothing else has a reader on the far side of a device
 * change. The ceiling is therefore no longer set by how much content exists —
 * it is set by 07 §1.6's budget of 51 documents for the whole game, and that
 * number is fixed. The line below prints both today's size and the size at the
 * full budget, so the headroom is a fact on every run rather than a hope.
 */
{
  const bits = 4 + 4 + 5 + 7 * 8 + PASSPORT_FLAGS.length + 10;
  const chars = Math.ceil(bits / 5);
  // 07 §1.6 budgets 51 documents for the whole game. That is the real ceiling.
  const atFull = Math.ceil((4 + 4 + 5 + 7 * 8 + 51 + 10) / 5);
  console.log(`  note ${FLAG_REGISTRY.length} flags set, ${PASSPORT_FLAGS.length} of them travel · ` +
    `${bits} bits · ${chars} chars now, ${atFull} at the full 51-document budget (cap 32)`);
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

  /*
   * The council's rules, checked rather than remembered.
   *
   * These are the ones a writer breaks by accident at 11pm: a rejoinder for a
   * voice that is not in the set, a voice lock on a threshold nothing can
   * reach, or — the bad one — enough locks on one decision that a player can
   * arrive at it with nothing to say.
   */
  /*
   * A warm-up is a rehearsal, not a decision. The moment one acquires a stat
   * effect it stops being free and the student's first ever choice starts
   * costing them something before they know what the panel is.
   */
  const stakes: string[] = [];
  for (const n of scene.npcs) {
    if (!n.warmup) continue;
    for (const o of n.warmup.options) {
      const moved = Object.entries(o.effects).filter(([, v]) => v);
      if (moved.length) stakes.push(`${n.warmup.id}/${o.id}: ${moved.map(([k, v]) => `${k} ${v}`).join(', ')}`);
      if (o.requires || o.voiceLock) stakes.push(`${n.warmup.id}/${o.id}: locked`);
    }
  }
  check('warm-up choices cost nothing and lock nothing', stakes.length === 0, stakes.join('; '));

  const councilFaults: string[] = [];
  for (const n of scene.npcs) {
    const d = n.decision;
    if (!d) continue;
    const authored = new Set(d.voices);

    for (const v of Object.keys(d.rejoinders ?? {}) as VoiceId[]) {
      if (!authored.has(v)) councilFaults.push(`${d.id}: rejoinder for unauthored ${v}`);
      const words = (d.rejoinders![v] ?? '').split(/\s+/).filter(Boolean).length;
      // A rejoinder is an interruption, not a second speech.
      if (words > 14) councilFaults.push(`${d.id}/${v}: rejoinder ${words} words, cap 14`);
    }

    for (const o of d.options) {
      const vl = o.voiceLock;
      if (!vl) continue;
      if (!authored.has(vl.voice))
        councilFaults.push(`${d.id}/${o.id}: voice-locked on ${vl.voice}, who is not in the room`);
      // A threshold outside a voice's attainable range is a permanently dead
      // option wearing the costume of a choice.
      if (vl.min <= 0 || vl.min >= 0.95)
        councilFaults.push(`${d.id}/${o.id}: threshold ${vl.min} is unreachable`);
      if (o.requires)
        councilFaults.push(`${d.id}/${o.id}: double-locked — a player can only be told one reason`);
    }

    // R4 needs somewhere to land: an authored set must be able to seat two.
    if (d.voices.filter((v) => (d.interjections[v] ?? '').length > 0).length < 2)
      councilFaults.push(`${d.id}: fewer than two voices can actually speak`);

    const alwaysOpen = d.options.filter((o) => !o.requires && !o.voiceLock).length;
    if (alwaysOpen < 2)
      councilFaults.push(`${d.id}: only ${alwaysOpen} option(s) open to every player`);
  }
  check('the council obeys its own rules', councilFaults.length === 0, councilFaults.join('; '));

  const silentTasks = scene.tasks.filter((t) => t.requires && !t.requiresNote).map((t) => t.id);
  check('every gated task explains itself', silentTasks.length === 0, silentTasks.join(', '));

  const badAmbient: string[] = [];
  let variantTotal = 0;
  for (const a of scene.ambient) {
    const spoken = Object.entries(a.variants).filter(([, l]) => l && l.trim());
    variantTotal += spoken.length;
    /*
     * A slot is an opportunity, not a line (07 §3.5.2). One voice is a slot
     * that says the same thing to every player in every classroom, which is
     * what these all were before — and it is invisible in review, because a
     * single-voice slot reads perfectly well on the page.
     */
    if (spoken.length < 2) badAmbient.push(`${a.id}: ${spoken.length} voice(s), needs 2+`);
    for (const [v, line] of spoken) {
      if (line.split(/\s+/).length > 30) badAmbient.push(`${a.id}/${v}: over 30 words`);
    }
    if (a.x < BOUND.x0 || a.x > BOUND.x1 || a.z < BOUND.z0 || a.z > BOUND.z1)
      badAmbient.push(`${a.id}: out of bounds`);
    if (a.r < 0.06) badAmbient.push(`${a.id}: radius under a walking step`);
    if (a.minLoudness > 0.62) badAmbient.push(`${a.id}: threshold unreachable`);
  }
  check(`ambient slots carry a choice of voices (${scene.ambient.length} slots, ` +
    `${variantTotal} lines)`, badAmbient.length === 0, badAmbient.join('; '));

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

  /*
   * DEPTH AND REACH.
   *
   * Two failures that look identical to a player — "I can't get to it" and "it
   * isn't there" — and neither is visible in a scene file, because both depend
   * on numbers that live in three other modules.
   *
   * 1. Reach. The walkable band stops at `walkTo`; anything further than one
   *    REACH beyond it can never be interacted with.
   * 2. Occlusion. A plate is flat, so a figure further away than a plate's
   *    nearest painted content is drawn behind ALL of it. Sergeant Starr stood
   *    at z 0.62 against an earth bank whose nearest point is 0.618, so the man
   *    the whole scene is about was painted out of it.
   */
  const band = scene.walkTo ?? 0.82;
  const plateFar = walkFar(scene.plates);
  const reachFrom = (z: number) => Math.abs(z - Math.min(Math.max(z, BOUND.z0), band)) * 0.75;

  const unreachable = [
    ...scene.npcs.map((n) => ({ k: 'npc', id: n.id, z: n.z })),
    ...scene.tasks.map((t) => ({ k: 'task', id: t.id, z: t.z })),
    ...scene.interactables.map((i) => ({ k: 'thing', id: i.id, z: i.z })),
  ].filter((o) => reachFrom(o.z) > REACH);
  check(`everything is inside arm's reach of the band (0.10..${band.toFixed(3)})`,
    unreachable.length === 0,
    unreachable.map((o) => `${o.k}:${o.id}@${o.z}`).join(', '));

  /*
   * Whether a plate HIDES what is behind it cannot be derived from its depth.
   *
   * The first cut of this check assumed it could, and flagged four figures in
   * the camp — including Greene's sergeant — as painted out. They are not: the
   * camp's midground is scattered tents with daylight between them and every
   * figure shows through. Only a plate that paints something solid across the
   * full width actually hides anyone, and nothing in PLATE_DEPTHS knows the
   * difference between a tent row and an earth bank.
   *
   * So the author declares it. `walkTo` means "there is a barrier here and the
   * ground stops"; where a scene sets one, a figure beyond it is behind that
   * barrier and cannot be seen or spoken to. Where a scene does not, the plates
   * are see-through and there is nothing to check.
   */
  if (scene.walkTo !== undefined) {
    const hidden = [
      ...scene.npcs.map((n) => ({ k: 'npc', id: n.id, z: n.z })),
      ...(scene.extras ?? []).map((e, i) => ({ k: 'extra', id: `${i}`, z: e.z })),
    ].filter((o) => o.z >= scene.walkTo!);
    check(`no figure stands behind the barrier at z ${scene.walkTo.toFixed(3)}`,
      hidden.length === 0, hidden.map((o) => `${o.k}:${o.id}@${o.z}`).join(', '));
  } else if (plateFar < 0.82) {
    // Not a failure — a note, so the debt is visible. A plate whose nearest
    // content sits inside the walkable band MIGHT hide figures behind it, and
    // whether it does is a question for eyes, not for arithmetic.
    console.log(`  note ${scene.id}: midground nearest content at z ${plateFar.toFixed(3)}, ` +
      `band runs to ${band.toFixed(2)} — check by eye that nothing back there is hidden`);
  }

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

/*
 * THE LEDGER.
 *
 * `08` §3 gives the reckoning four rules, and three of them are checkable by a
 * machine. This is where they get checked, because they are the rules that stop
 * the one visible number in the game from becoming a score, and a rule that
 * lives only in a docstring is a rule until somebody is in a hurry.
 */
console.log('\nthe ledger · 08 §3');
{
  /*
   * Words that would turn a cause into a scoreboard readout. The four stat
   * names are the dangerous ones — a line reading "1,100 lost to low
   * legitimacy" hands the player the hidden model and turns the whole act into
   * an optimisation problem — and the rest are the vocabulary a game reaches
   * for when it has stopped writing and started reporting.
   */
  const BANNED = ['judgment', 'legitimacy', 'loyalty', 'character',
    'morale', 'score', 'points', 'bonus', 'penalty', 'rating', 'level'];

  for (const s of sceneList()) {
    if (s.endsAct === undefined) continue;
    check(`${s.id} ends act ${s.endsAct}, and that act has a page to show`,
      RECKONED_ACTS.includes(s.endsAct));
  }
  for (const act of RECKONED_ACTS) {
    const closers = sceneList().filter((s) => s.endsAct === act);
    check(`act ${act}'s reckoning is reachable — exactly one scene closes it`,
      closers.length === 1, closers.map((s) => s.id).join(', ') || 'no scene ends it');
  }

  const blank = initialState();
  /** The act's page with nothing decided: the lines that arrive whatever he does. */
  const fixed = (act: number) => reckon(act, blank, () => [])!;

  for (const act of RECKONED_ACTS) {
    const f = fixed(act);
    // Rule 3. Without this the screen teaches that everything that happened to
    // the army was somebody's fault, which is the opposite of the lesson.
    check(`act ${act} carries a loss he could not have prevented (R20)`,
      f.lines.some((l) => l.n < 0));

    const movers = sceneList()
      .filter((s) => s.act === act)
      .flatMap((s) => s.npcs.map((n) => n.decision).filter((d): d is Decision => Boolean(d)))
      .filter((d) => d.options.some((o) => o.ledger?.length));
    // Rule 2. A page with no earned line is a cutscene with arithmetic on it.
    check(`act ${act} has at least one line the player earned`, movers.length > 0);

    // Every way the act's count-moving decisions can land. Small by design —
    // most decisions in this game move the man, not the headcount.
    let combos: [string, string][][] = [[]];
    for (const d of movers) {
      combos = combos.flatMap((head) =>
        d.options.map((o): [string, string][] => [...head, [d.id, o.id]]));
    }
    const pages = combos.map((c) =>
      reckon(act, { ...blank, decisions: new Map(c) }, ledgerFor)!);

    const closes = pages.map((p) => p.closedWith);
    const lo = Math.min(...closes);
    const hi = Math.max(...closes);
    check(`act ${act} closes between ${lo.toLocaleString()} and ${hi.toLocaleString()} ` +
      `across ${pages.length} paths — the choices move it, and none of them ends the war`,
      hi > lo && lo > 0);

    /*
     * The claim `ledger.ts` makes in prose, asserted: the biggest number on the
     * page is one the player did not cause. If an earned line ever outgrows the
     * fixed loss, the act has quietly become a thing you can win.
     */
    const worstFixed = Math.max(...f.lines.map((l) => Math.abs(l.n)));
    const bestEarned = Math.max(
      ...pages.flatMap((p) => p.lines.filter((l) => l.earned).map((l) => Math.abs(l.n))));
    check(`act ${act}'s largest line is not his doing`, worstFixed > bestEarned,
      `fixed ${worstFixed} vs earned ${bestEarned}`);
  }

  // Rule 1, over every cause in the content — fixed and authored alike.
  const causes = [
    ...RECKONED_ACTS.flatMap((a) => fixed(a).lines.map((l) => l.cause)),
    ...decisionList().flatMap((d) => d.options.flatMap((o) => o.ledger ?? [])).map((l) => l.cause),
  ];
  const named = causes.filter((c) => BANNED.some((w) => c.toLowerCase().includes(w)));
  check(`no cause names a stat or a game word (${causes.length} causes)`,
    named.length === 0, named.join(' / '));
  // Each one is printed after a figure, so it has to read as the tail of that
  // sentence — "1,900 sick, or gone without being written down" — and not as a
  // sentence of its own with the number bolted on the front.
  const standalone = causes.filter((c) => /^[A-Z]/.test(c) || c.endsWith('.'));
  check('every cause is a fragment that follows a number',
    standalone.length === 0, standalone.join(' / '));
}

/*
 * THE THEATRE MAP.
 *
 * The page an act opens on, and the one screen in the game whose entire payload
 * is a *relationship between two dates*. That makes it unusually easy to break
 * silently: a wrong received date does not throw, does not look wrong, and
 * quietly teaches a student that Washington knew something he did not.
 */
console.log('\nthe theatre map');
{
  const acts = Object.keys(THEATRES).map(Number);
  check(`every act with built scenes opens on a map (${acts.join(', ')})`,
    sceneList().every((s) => THEATRES[s.act] !== undefined),
    sceneList().filter((s) => !THEATRES[s.act]).map((s) => s.id).join(', '));

  for (const act of acts) {
    const tm = THEATRES[act];
    // 04 §7.3 sets 4–9 annotations for a map table. A page carries the same
    // load: below four there is nothing to read, above nine it is an atlas.
    check(`act ${act}: ${tm.tokens.length} marks, which is a page and not a list`,
      tm.tokens.length >= 3 && tm.tokens.length <= 9);

    const ids = tm.tokens.map((t) => t.id);
    check(`act ${act}'s marks have distinct ids`, new Set(ids).size === ids.length,
      ids.join(', '));

    for (const t of tm.tokens) {
      const where = `act ${act} · ${t.label}`;
      // The projection is fixed and the sheet is not scrollable, so anything
      // outside it is simply not on the page.
      const [x, y] = at(t.lon, t.lat);
      check(`${where} is on the sheet`, x > 0.01 && x < 0.99 && y > 0.01 && y < 0.99,
        `${x.toFixed(2)}, ${y.toFixed(2)}`);

      // The whole reading. A report cannot arrive before it is written, and a
      // report cannot arrive after the day the sheet is drawn.
      if (t.received) {
        check(`${where}: reached him after it happened`,
          Date.parse(t.received) >= Date.parse(t.dated),
          `${t.dated} → ${t.received}`);
        check(`${where}: reached him before the sheet was drawn`,
          Date.parse(t.received) <= Date.parse(tm.asOf),
          `${t.received} > ${tm.asOf}`);
      }
      check(`${where}: he knows it, saw it, or it is openly a rumour`,
        Boolean(t.received || t.seen || t.known) || /nobody|said to be|do not/i.test(t.note),
        t.note.slice(0, 50));

      // The label sits beside the mark, in the margin of a page. It is not the
      // note, and the moment it starts explaining, the map has become a wiki.
      check(`${where}: the label is a label`, t.label.split(/\s+/).length <= 5);

      // The lettered grid is only useful if it resolves. A mark that falls
      // outside A1..E4 means the projection and the grid have drifted apart.
      check(`${where}: sits in a named square (${gridRef(t.lon, t.lat)})`,
        /^[A-E][1-5]$/.test(gridRef(t.lon, t.lat)));
    }

    /*
     * The point of the register, asserted. A sheet on which everything is
     * certain has no reason to draw confidence at all; a sheet on which nothing
     * is has stopped being a map and become a mood. Every act's page must show
     * the player both — something he is looking at, and something he is only
     * being told.
     */
    const conf = tm.tokens.map((t) => confidenceOf(t, tm.asOf));
    check(`act ${act} has something he can see and something he cannot`,
      conf.some((k) => k === 'seen' || k === 'certain') &&
      conf.some((k) => k === 'old' || k === 'stale'),
      conf.join(', '));

    // The map is the world's register, not the interface's, so its prose is not
    // word-counted (08 §8.1) — but it must never reach for the vocabulary.
    const chrome = tm.tokens
      .filter((t) => /\b(enemy unit|objective|intel|fog of war|strength: )\b/i.test(t.note));
    check(`act ${act} names things the way he would`, chrome.length === 0,
      chrome.map((t) => t.label).join(', '));
  }

  // Labels that land on top of each other are the failure mode this page has,
  // because four of Act 2's six marks are inside twelve miles of one another.
  for (const act of acts) {
    const tm = THEATRES[act];
    const placed = tm.tokens.map((t) => {
      const [x, y] = at(t.lon, t.lat);
      const [dx, dy] = labelOffset(t);
      // Sheet fractions to base units, which is what the offsets are in.
      return { t, x: x * MAP_W + dx, y: y * MAP_H + dy };
    });
    const clashes: string[] = [];
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const dx = Math.abs(placed[i].x - placed[j].x);
        const dy = Math.abs(placed[i].y - placed[j].y);
        // Roughly a label's height, and half the width of a short one.
        if (dx < 58 && dy < 17) clashes.push(`${placed[i].t.label} / ${placed[j].t.label}`);
      }
    }
    check(`act ${act}'s labels do not print through each other`, clashes.length === 0,
      clashes.join('; '));
  }

  /*
   * IDENTITY ACROSS ACTS.
   *
   * A mark that keeps its id from one page to the next is the same thing at two
   * moments, and that is what the ghost and the slide are drawn from. A mark
   * that quietly changes id between acts becomes two unrelated things, the
   * movement stops being shown, and nothing anywhere reports it — which is why
   * this is a test and not a convention.
   */
  {
    const seq = acts.sort((p, q) => p - q);
    for (let i = 1; i < seq.length; i++) {
      const prev = THEATRES[seq[i - 1]];
      const tm = THEATRES[seq[i]];
      const carried = tm.tokens.filter((t) => prev.tokens.some((p) => p.id === t.id));
      check(`act ${seq[i - 1]} → ${seq[i]}: ${carried.length} marks carry over`,
        carried.length > 0, 'nothing on this page was on the last one');
      const moved = carried.filter((t) => {
        const p = prev.tokens.find((x) => x.id === t.id)!;
        return Math.abs(p.lon - t.lon) >= 0.05 || Math.abs(p.lat - t.lat) >= 0.05;
      });
      // Not a failure — a note. An act where nothing moved is a real thing (a
      // siege is exactly that), and the writers should be able to read it off.
      console.log(`  note act ${seq[i]}: ${moved.length} of ${carried.length} ` +
        `carried marks moved${moved.length ? ` — ${moved.map((t) => t.label).join(', ')}` : ''}`);
    }
  }

  /*
   * SCARS. They only ever accumulate, and most of them are never his.
   */
  {
    const dated = SCARS.every((sc) => !Number.isNaN(Date.parse(sc.on)));
    check(`every scar has a date (${SCARS.length})`, dated);

    /*
     * Accumulation is guaranteed by the date filter, so checking the DRAWN
     * count for monotonicity would be both a tautology and wrong — a scar is
     * suppressed on any page where a live mark already stands on it, so the
     * drawn count legitimately falls. Lexington is a mark in Act 1 and a scar
     * in Act 2: zero, then one.
     *
     * The invariant with teeth is underneath it. The pages have to run forward
     * in time, or the whole layer accumulates in the wrong order and nothing
     * anywhere says so.
     */
    const seq = acts.sort((p, q) => p - q);
    for (let i = 1; i < seq.length; i++) {
      check(`act ${seq[i]} is drawn after act ${seq[i - 1]}`,
        Date.parse(THEATRES[seq[i]].asOf) > Date.parse(THEATRES[seq[i - 1]].asOf),
        `${THEATRES[seq[i - 1]].asOf} → ${THEATRES[seq[i]].asOf}`);
    }
    for (const act of seq) {
      const n = scarsFor(THEATRES[act]).length;
      console.log(`  note act ${act}: ${n} scars on the page`);
    }

    /*
     * The claim the layer exists to make. It passes trivially with three scars
     * and it is here so that it cannot stop being true by accident once there
     * are thirty — the moment more than half the war is something Washington
     * personally did, this game has started flattering him.
     */
    const his = SCARS.filter((sc) => sc.his).length;
    check(`most of the war is not his doing (${his} of ${SCARS.length})`,
      his * 2 <= SCARS.length);
  }

  /*
   * THEIR MARKS TELEPORT AND YOURS WALK.
   *
   * A track is a record of what somebody was SEEN to do, so a passage by sea can
   * never carry one — nobody on this side of the water watched a fleet cross it.
   * Draw a track to a ship and the map has quietly claimed a kind of knowledge
   * the Continental army did not have, and Act 3's whole point (the fleet was
   * off Boston, and then it was in the Narrows, and there is nothing in between)
   * goes with it.
   *
   * Scoped exactly to sea passages and no wider. British forces that marched
   * overland were watched and reported, and those tracks are legitimate.
   */
  for (const act of acts) {
    const tm = THEATRES[act];
    const ships = tm.tokens.filter((t) => t.kind === 'ship');
    /*
     * The radius has to mean "the same mark", not "nearby". The first cut used
     * half a degree and flagged Washington's road up from Philadelphia, because
     * it ends at Cambridge and the fleet is fifteen miles away in the harbour —
     * which is true of practically everything in Act 2. In a theatre this
     * crowded, proximity is not evidence; landing on the point is.
     */
    const landed = (tm.tracks ?? []).filter((tr) => {
      const [ex, ey] = tr.path[tr.path.length - 1];
      return ships.some((sh) => Math.abs(sh.lon - ex) < 0.08 && Math.abs(sh.lat - ey) < 0.06);
    });
    check(`act ${act}: nothing tracks a fleet across open water`, landed.length === 0,
      landed.map((tr) => tr.label).join('; '));

    for (const tr of tm.tracks ?? []) {
      check(`act ${act} · ${tr.label}: the road has somewhere to go`, tr.path.length >= 2);
      const off = tr.path.filter(([lo, la]) => {
        const [x, y] = at(lo, la);
        return x < 0 || x > 1 || y < 0 || y > 1;
      });
      check(`act ${act} · ${tr.label}: stays on the sheet`, off.length === 0,
        `${off.length} waypoints off the map`);
    }
  }
}

console.log('\ntransitions · 02 §8.6');
{
  // Every transition the built content can actually make, and which treatment
  // the rule gives it. Printed rather than merely asserted, because "which of
  // these fades" is a thing the writers will want to read off the test output.
  for (const from of sceneList()) {
    const to = sceneList().find((s) => s.id === from.exitTo);
    if (!to) continue;
    const fade = timePasses(from, to);
    check(`${from.id} → ${to.id} · ${fade ? 'fade' : 'cut'} (${from.when} → ${to.when})`,
      // An act boundary must never be a cut; that is the one way to get this
      // wrong that costs the act break its weight.
      fade || from.act === to.act);
  }
  const mv = sceneList().find((s) => s.id === 'MV-01')!;
  check('a move inside one moment is a cut, not a fade', !timePasses(mv, mv));
}

console.log('\nchrome · 02 §8.1');
{
  /*
   * "A UI element is a physical object in the fiction, or it does not exist."
   *
   * The banned list is explicit in 02 §8.1 and §9.16, and every item on it is a
   * thing a person adds at 1am because a panel looked flat. Checked here rather
   * than remembered, because by the time anyone notices, four surfaces have it
   * and the chrome has quietly become a web app laid over a watercolour.
   *
   * Two exemptions, both deliberate. The dev bar is meant to look like a tool
   * that is not part of the game. The spyglass eyepiece uses spread-only
   * shadows to draw the barrel and its brass collar — those are rings, an
   * object, not a shadow cast by a floating pane.
   */
  const rules = CSS.split('}')
    .map((r) => r.trim())
    .filter((r) => r.includes('{'))
    .filter((r) => !/\.devtab|\.devbar|\.glass \.eye/.test(r.split('{')[0]));

  const sins: string[] = [];
  for (const rule of rules) {
    const sel = rule.split('{')[0].trim().replace(/\s+/g, ' ').slice(0, 40);
    const body = rule.slice(rule.indexOf('{') + 1);
    for (const decl of body.split(';')) {
      const [propRaw, ...rest] = decl.split(':');
      const prop = propRaw.trim();
      const value = rest.join(':').trim();
      if (!prop || !value) continue;
      if (prop === 'backdrop-filter') sins.push(`${sel}: backdrop-filter`);
      if (/\bblur\(/.test(value)) sins.push(`${sel}: blur()`);
      if (prop === 'border-radius' && value !== '0') sins.push(`${sel}: border-radius ${value}`);
      if (prop === 'box-shadow' && value !== 'none') {
        // A shadow is legitimate only as a ring: zero offset AND zero blur, so
        // all that is left is spread. Anything else is a drop shadow.
        // Split on the commas BETWEEN shadows, not the ones inside rgba().
        const shadows: string[] = [];
        let depth = 0;
        let cur = '';
        for (const ch of value) {
          if (ch === '(') depth++;
          if (ch === ')') depth--;
          if (ch === ',' && depth === 0) {
            shadows.push(cur);
            cur = '';
          } else cur += ch;
        }
        shadows.push(cur);
        for (const shadow of shadows) {
          const nums = shadow.trim().match(/-?[\d.]+px/g) ?? [];
          if (nums.length < 3 || nums.slice(0, 3).some((n) => parseFloat(n) !== 0))
            sins.push(`${sel}: drop shadow "${shadow.trim()}"`);
        }
      }
    }
  }
  check(`no banned chrome in ${rules.length} rules`, sins.length === 0, sins.join('; '));

  // Every surface that sits on the plate must carry the ink line at full
  // opacity — the DOM half of the outline discipline.
  /*
   * Anchored on `.journal,` rather than on the whole selector list, because the
   * list grows: adding `.reckoning` to it silently broke this check — indexOf
   * returned -1, the slice came back empty, and a green test turned red for a
   * reason that had nothing to do with the rule it guards.
   */
  const from = CSS.indexOf('.journal,');
  check('the surface rule is where this check thinks it is', from > 0);
  const surfaces = CSS.slice(from, CSS.indexOf('* { box-sizing'));
  check('the surfaces carry a full-opacity ink line',
    surfaces.includes(`border: 1px solid ${INK.SETTLED}`), surfaces.slice(0, 60));
}

console.log('\nthe council');
{
  const decisions: Decision[] = sceneList()
    .flatMap((s) => s.npcs.flatMap((n) => [n.warmup, n.decision]))
    .filter((d): d is Decision => Boolean(d));

  // R4, exercised against every authored set at four corners of the stat space
  // rather than only at the vector the prototype happens to produce.
  const CORNERS: Record<string, Record<StatId, number>> = {
    opening: { judgment: 48, legitimacy: 55, loyalty: 40, character: 60 },
    ruined: { judgment: 0, legitimacy: 0, loyalty: 0, character: 0 },
    exemplary: { judgment: 100, legitimacy: 100, loyalty: 100, character: 100 },
    'loved and slipping': { judgment: 50, legitimacy: 20, loyalty: 95, character: 15 },
  };

  const faults: string[] = [];
  for (const d of decisions) {
    for (const [where, stats] of Object.entries(CORNERS)) {
      const spoke = councilFor(d, stats);
      if (spoke.length < 2) faults.push(`${d.id} @ ${where}: ${spoke.length} voice(s) — floor is 2`);
      if (spoke.length > 4) faults.push(`${d.id} @ ${where}: ${spoke.length} voices — cap is 4`);
      if (new Set(spoke.map((v) => v.id)).size !== spoke.length)
        faults.push(`${d.id} @ ${where}: a voice speaks twice`);
      for (let i = 1; i < spoke.length; i++) {
        if (loudness(spoke[i - 1].id, stats) < loudness(spoke[i].id, stats))
          faults.push(`${d.id} @ ${where}: out of order at ${spoke[i].id}`);
      }
      if (spoke.some((v) => !v.line.trim())) faults.push(`${d.id} @ ${where}: an empty line spoke`);
      // Insistence may only ever be the voice that opened, and only its own line.
      const r = rejoinderFor(d, spoke, stats);
      if (r && r.id !== spoke[0].id) faults.push(`${d.id} @ ${where}: ${r.id} rejoined out of turn`);
      if (r && r.line !== d.rejoinders?.[r.id]) faults.push(`${d.id} @ ${where}: invented rejoinder`);
    }
  }
  check(`R4 holds at every corner (${decisions.length} decisions × 4 vectors)`,
    faults.length === 0, faults.slice(0, 4).join('; '));

  /*
   * Voice locks must be live content, not decoration.
   *
   * A threshold nothing can reach is a permanently struck line that promises a
   * choice it will never give; a threshold everything clears is a lock the
   * player never sees work. Both are failures, and neither is visible by
   * reading the scene file — it depends on what the deltas upstream can do. So
   * walk every path through the authored decisions and require each lock to be
   * observed both open and shut.
   */
  const locked: Record<string, { open: number; shut: number }> = {};
  const walk = (seq: Decision[], i: number, stats: Record<StatId, number>): void => {
    if (i === seq.length) return;
    const d = seq[i];
    for (const o of d.options) {
      if (!o.voiceLock) continue;
      const key = `${d.id}/${o.id}`;
      locked[key] ??= { open: 0, shut: 0 };
      // Knowledge empty on purpose: this asks what the VOICE locks do alone.
      lockOn(o, stats, new Set<string>()).locked ? locked[key].shut++ : locked[key].open++;
    }
    for (const o of d.options) {
      const next = { ...stats };
      const s = { stats: next } as Parameters<typeof applyDelta>[0];
      for (const [k, v] of Object.entries(o.effects)) applyDelta(s, k as StatId, v as number);
      walk(seq, i + 1, next);
    }
  };

  /*
   * Moments are visited in order; the people inside one are not.
   *
   * A player picks who to speak to first, and Act 1's lock turns entirely on
   * that choice — so a walk that fixed the authoring order would report the
   * lock as dead when it is merely order-dependent.
   *
   * A MOMENT, not a scene, is the unit that can be shuffled, and the
   * distinction started mattering the day the house got an inside. Mount Vernon
   * is two scenes now, joined by a door, and `timePasses()` says a door costs
   * nothing: a player can answer his wife and then the messenger, or the
   * messenger and then his wife, and Act 1's whole voice lock is the difference.
   * So scenes sharing an act and a dateline are pooled and permuted together.
   *
   * The chain is PLAY order, walked from the first scene through exits and
   * doors — never SCENE_ORDER, which is the save code's bit order, is
   * append-only, and puts the newest room in the game after Act 2.
   */
  const permute = <T,>(xs: T[]): T[][] =>
    xs.length <= 1
      ? [xs]
      : xs.flatMap((x, i) =>
          permute([...xs.slice(0, i), ...xs.slice(i + 1)]).map((rest) => [x, ...rest]),
        );

  const played: string[] = [];
  {
    const queue = [FIRST_SCENE];
    while (queue.length) {
      const id = queue.shift()!;
      const sc = SCENES[id];
      if (!sc || played.includes(id)) continue;
      played.push(id);
      // Doors first: a door leads somewhere inside the same moment.
      for (const it of sc.interactables) if (it.goTo) queue.push(it.goTo);
      if (sc.exitTo) queue.push(sc.exitTo);
    }
  }
  check(`play order reaches every scene (${played.join(' → ')})`,
    played.length === sceneList().length,
    sceneList().filter((s) => !played.includes(s.id)).map((s) => s.id).join(', '));

  let sequences: Decision[][] = [[]];
  let moment: { key: string; ds: Decision[] } | null = null;
  const flush = (): void => {
    if (!moment || !moment.ds.length) return;
    const here = moment.ds;
    sequences = sequences.flatMap((head) => permute(here).map((tail) => [...head, ...tail]));
    moment = null;
  };
  for (const id of played) {
    const sc = SCENES[id];
    const key = `${sc.act}·${sc.when}`;
    if (!moment || moment.key !== key) {
      flush();
      moment = { key, ds: [] };
    }
    moment.ds.push(...sc.npcs.map((n) => n.decision).filter((d): d is Decision => Boolean(d)));
  }
  flush();
  for (const seq of sequences) walk(seq, 0, { ...CORNERS.opening });

  const dead = Object.entries(locked).filter(([, c]) => c.open === 0 || c.shut === 0);
  const summary = Object.entries(locked)
    .map(([k, c]) => `${k} ${c.open}/${c.open + c.shut} open`)
    .join(', ');
  check(`every voice lock is reachable both ways — ${summary}`, dead.length === 0,
    dead.map(([k, c]) => `${k}: open ${c.open}, shut ${c.shut}`).join('; '));
}

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} FAILED`);
if (failures > 0) process.exit(1);
