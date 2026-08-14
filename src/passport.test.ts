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

console.log(failures === 0 ? '\nall passport checks passed' : `\n${failures} FAILED`);
if (failures > 0) process.exit(1);
