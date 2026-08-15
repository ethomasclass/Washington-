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
import { applyDelta, initialState, loudness, type StatId } from './state';
import { sceneList } from './content';
import { figureHalfW, frameX } from './ground';
import { councilFor, lockOn, rejoinderFor } from './council';
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

  /*
   * The council's rules, checked rather than remembered.
   *
   * These are the ones a writer breaks by accident at 11pm: a rejoinder for a
   * voice that is not in the set, a voice lock on a threshold nothing can
   * reach, or — the bad one — enough locks on one decision that a player can
   * arrive at it with nothing to say.
   */
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
  const surfaces = CSS.slice(CSS.indexOf('.journal, .panel'), CSS.indexOf('* { box-sizing'));
  check('the surfaces carry a full-opacity ink line',
    surfaces.includes(`border: 1px solid ${INK.SETTLED}`), surfaces.slice(0, 60));
}

console.log('\nthe council');
{
  const decisions: Decision[] = sceneList()
    .flatMap((s) => s.npcs.map((n) => n.decision))
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
   * Scenes are visited in order; the people inside one are not. A player picks
   * who to speak to first, and Act 1's lock turns entirely on that choice — so
   * a walk that fixed the authoring order would report the lock as dead when it
   * is merely order-dependent. Permute within each scene, chain the scenes.
   */
  const permute = <T,>(xs: T[]): T[][] =>
    xs.length <= 1
      ? [xs]
      : xs.flatMap((x, i) =>
          permute([...xs.slice(0, i), ...xs.slice(i + 1)]).map((rest) => [x, ...rest]),
        );

  let sequences: Decision[][] = [[]];
  for (const id of SCENE_ORDER) {
    const sc = sceneList().find((s) => s.id === id);
    if (!sc) continue;
    const here = sc.npcs.map((n) => n.decision).filter((d): d is Decision => Boolean(d));
    if (!here.length) continue;
    sequences = sequences.flatMap((head) => permute(here).map((tail) => [...head, ...tail]));
  }
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
