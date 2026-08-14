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
import { applyDelta, initialState } from './state';
import { SCENE } from './content';

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

// 7. The code stays short enough for a student to copy by hand.
{
  const len = encode(initialState()).length;
  check(`code is ${len} characters (target: under 32)`, len < 32);
}

// ---------------------------------------------------------------- content linter
//
// A first slice of the build-time linter specced in 06-technical-architecture.md
// §6. These are the checks that fail silently at runtime rather than loudly, so
// they are the ones worth having before there is any content to speak of.

console.log('\ncontent');

{
  const grants = new Set<string>();
  const requires = new Set<string>();
  for (const it of SCENE.interactables) if (it.grants) grants.add(it.grants);
  for (const n of SCENE.npcs) {
    for (const o of n.decision?.options ?? []) if (o.requires) requires.add(o.requires);
  }
  const registry = new Set(FLAG_REGISTRY);

  const unregistered = [...grants, ...requires].filter((f) => !registry.has(f));
  check(
    'every flag used in content is in the passport registry',
    unregistered.length === 0,
    unregistered.join(', '),
  );

  const unsatisfiable = [...requires].filter((f) => !grants.has(f));
  check(
    'every required flag is granted by something reachable',
    unsatisfiable.length === 0,
    unsatisfiable.join(', '),
  );

  const unused = [...registry].filter((f) => !grants.has(f));
  check('no registry flag is dead weight', unused.length === 0, unused.join(', '));
}

{
  // An emblem beside an option must belong to a voice that actually spoke at
  // that decision, or the player is being shown an opinion from nobody.
  const orphans: string[] = [];
  const unnoted: string[] = [];
  for (const n of SCENE.npcs) {
    const d = n.decision;
    if (!d) continue;
    const authored = new Set(d.voices);
    for (const o of d.options) {
      for (const v of o.favoured) {
        if (!authored.has(v)) orphans.push(`${d.id}/${o.id}: ${v}`);
      }
      if (o.requires && !o.lockNote) unnoted.push(`${d.id}/${o.id}`);
    }
    for (const v of d.voices) {
      if (!d.interjections[v]) orphans.push(`${d.id}: ${v} has no line`);
    }
  }
  check('option emblems only cite voices present at that decision', orphans.length === 0,
    orphans.join('; '));
  check('every gated option explains its lock', unnoted.length === 0, unnoted.join(', '));
}

{
  const n = SCENE.interactables.length;
  check(`scene meets the density floor (${n} interactables, floor 12)`, n >= 12);

  // Ground separation, using the same weighted metric the game targets with.
  // Two targets closer together than the interaction reach means the nearer one
  // always wins and the other can never be selected.
  const REACH = 0.085;
  const pts = [
    ...SCENE.interactables.map((i) => ({ id: i.id, x: i.x, z: i.z })),
    ...SCENE.npcs.map((n) => ({ id: n.id, x: n.x, z: n.z })),
  ];
  let worst = { a: '', b: '', d: 1 };
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, (pts[i].z - pts[j].z) * 0.75);
      if (d < worst.d) worst = { a: pts[i].id, b: pts[j].id, d };
    }
  }
  check(
    `no target is shadowed by a neighbour (closest pair ${worst.d.toFixed(3)})`,
    worst.d >= REACH,
    `${worst.a} / ${worst.b}`,
  );

  const outside = pts.filter((p) => p.x < 0.05 || p.x > 0.95 || p.z < 0.1 || p.z > 0.82);
  check('every target is inside the walkable bounds', outside.length === 0,
    outside.map((p) => p.id).join(', '));
}

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} FAILED`);
if (failures > 0) process.exit(1);
