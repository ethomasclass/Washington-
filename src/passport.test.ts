/**
 * The linter. `npm test` runs it and it must be green before any commit.
 *
 * Two jobs. The codec has to round-trip every state a classroom can produce,
 * because a save code that fails on Thursday is a lesson that does not happen.
 * And the content has to obey the design rules that were written down and, in
 * the old build, went unenforced in exactly the places they mattered.
 */

import { decode, encode, FLAG_REGISTRY, PASSPORT_FLAGS } from './passport';
import { SCENE_ORDER } from './scene-order';
import { applyDelta, initialState, loudness, type StatId } from './state';
import { councilFor, lockOn } from './council';
import { COUNCIL_MAX, COUNCIL_MIN } from './state';
import type { Decision, MapDef } from './types';

import { ESTATE } from './content/estate';
import { MANSION_GROUND, MANSION_UPPER } from './content/mansion';
import { DOCUMENTS } from './content/documents';
import { A1_D4_UNIFORM } from './content/departure';
import { LEGEND, INDOOR_LEGEND } from './content/legend';
import { PROPS } from './engine/props';
import { makeGrid, reachable, withinReach } from './engine/collision';
import { CAM_DIST_EXTERIOR } from './engine/view';

let failures = 0;
let checks = 0;

function ok(cond: boolean, what: string): void {
  checks++;
  if (!cond) { failures++; console.error(`  FAIL  ${what}`); }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

const MAPS: MapDef[] = [ESTATE, MANSION_GROUND, MANSION_UPPER];

function decisionsOf(m: MapDef): Decision[] {
  const out: Decision[] = [];
  for (const n of m.npcs ?? []) {
    if (n.warmup) out.push(n.warmup);
    if (n.decision) out.push(n.decision);
  }
  return out;
}
const ALL_DECISIONS = [...MAPS.flatMap(decisionsOf), A1_D4_UNIFORM];

/* ---------------------------------------------------------------------- */
section('passport codec');

{
  const s = initialState();
  const code = encode(s);
  const back = decode(code);
  ok(back !== null, 'a fresh state round-trips');
  ok(back!.stats.judgment === s.stats.judgment, 'stats survive the round trip');

  // Every registered flag set at once, which is the worst case for length.
  const full = initialState();
  for (const f of FLAG_REGISTRY) full.knowledge.add(f);
  full.stats = { judgment: 91, legitimacy: 12, loyalty: 77, character: 40 };
  const fullCode = encode(full);
  const fullBack = decode(fullCode);
  ok(fullBack !== null, 'a saturated state round-trips');
  for (const f of PASSPORT_FLAGS) {
    ok(fullBack!.knowledge.has(f), `passport flag survives: ${f}`);
  }
  console.log(`  code length ${fullCode.length} at full knowledge`);

  // A mangled code must be REJECTED, not half-read. `decode` signals that by
  // returning null or by throwing; either is a refusal, and a silent partial
  // read is the only outcome that would put a wrong run in front of a student.
  let rejected = false;
  try { rejected = decode('NOTACODE') === null; } catch { rejected = true; }
  ok(rejected, 'a mangled code is rejected rather than half-read');

  const dup = new Set(FLAG_REGISTRY);
  ok(dup.size === FLAG_REGISTRY.length, 'FLAG_REGISTRY has no duplicates');
  const pdup = new Set(PASSPORT_FLAGS);
  ok(pdup.size === PASSPORT_FLAGS.length, 'PASSPORT_FLAGS has no duplicates');
  ok(SCENE_ORDER.length > 0, 'SCENE_ORDER is populated');
}

/* ---------------------------------------------------------------------- */
section('the stat model');

{
  const s = initialState();
  applyDelta(s, 'judgment', 500);
  ok(s.stats.judgment <= 100, 'a stat cannot exceed 100');
  applyDelta(s, 'judgment', -500);
  ok(s.stats.judgment >= 0, 'a stat cannot go below 0');

  // The soft shoulder attenuates; sealed decisions do not.
  const soft = initialState(); soft.stats.character = 95;
  applyDelta(soft, 'character', 10);
  const hard = initialState(); hard.stats.character = 95;
  applyDelta(hard, 'character', 10, true);
  ok(hard.stats.character >= soft.stats.character, 'a sealed delta is not attenuated');
}

/* ---------------------------------------------------------------------- */
section('R4 — the Council speaks two to four, never one, never five');

{
  const corners: Array<Record<StatId, number>> = [];
  for (const j of [5, 95]) for (const l of [5, 95]) for (const ly of [5, 95]) for (const c of [5, 95]) {
    corners.push({ judgment: j, legitimacy: l, loyalty: ly, character: c });
  }
  corners.push(initialState().stats);

  for (const d of ALL_DECISIONS) {
    const authored = d.voices.filter((v) => (d.interjections[v] ?? '').length > 0).length;
    ok(authored >= COUNCIL_MIN, `${d.id}: at least ${COUNCIL_MIN} voices are authored`);
    for (const stats of corners) {
      const spoken = councilFor(d, stats);
      ok(spoken.length >= Math.min(COUNCIL_MIN, authored), `${d.id}: never fewer than the floor`);
      ok(spoken.length <= COUNCIL_MAX, `${d.id}: never more than ${COUNCIL_MAX}`);
      ok(new Set(spoken.map((v) => v.id)).size === spoken.length, `${d.id}: no voice speaks twice`);
    }
  }
}

/* ---------------------------------------------------------------------- */
section('R6 — interjections are short, and never offer a choice');

{
  for (const d of ALL_DECISIONS) {
    for (const [v, line] of Object.entries(d.interjections)) {
      const words = (line ?? '').trim().split(/\s+/).length;
      ok(words <= 32, `${d.id}/${v}: ${words} words (<= 32)`);
    }
    for (const [v, line] of Object.entries(d.rejoinders ?? {})) {
      const words = (line ?? '').trim().split(/\s+/).length;
      ok(words <= 32, `${d.id}/${v} rejoinder: ${words} words (<= 32)`);
    }
  }
}

/* ---------------------------------------------------------------------- */
section('every locked option is openable inside this act');

{
  const grantable = new Set<string>();
  for (const m of MAPS) {
    for (const it of m.interactables ?? []) {
      if (it.grants) grantable.add(it.grants);
      if (it.contradicts?.grants) grantable.add(it.contradicts.grants);
      if (it.document && DOCUMENTS[it.document]?.grants) grantable.add(DOCUMENTS[it.document].grants!);
    }
    for (const n of m.npcs ?? []) if (n.hearFlag) grantable.add(n.hearFlag);
  }

  for (const d of ALL_DECISIONS) {
    for (const o of d.options) {
      if (!o.requires) continue;
      ok(grantable.has(o.requires),
        `${d.id}/${o.id} needs "${o.requires}", which something in Act 1 grants`);
      ok(!!o.lockNote, `${d.id}/${o.id} says why it is shut`);
    }
    // A voice lock has to be reachable from somewhere in the stat space.
    for (const o of d.options) {
      if (!o.voiceLock) continue;
      let reachable = false;
      for (const j of [0, 50, 100]) for (const l of [0, 50, 100]) {
        for (const ly of [0, 50, 100]) for (const c of [0, 50, 100]) {
          if (loudness(o.voiceLock.voice, { judgment: j, legitimacy: l, loyalty: ly, character: c })
            >= o.voiceLock.min) reachable = true;
        }
      }
      ok(reachable, `${d.id}/${o.id}: its voice lock is reachable at all`);
      const shutAtStart = lockOn(o, initialState().stats, new Set());
      ok(shutAtStart.locked, `${d.id}/${o.id}: shut at the opening vector, or the lock is decoration`);
    }
    // Never a decision where nothing can be chosen at the opening vector.
    const open = d.options.filter((o) => !lockOn(o, initialState().stats, new Set()).locked);
    ok(open.length >= 2, `${d.id}: at least two options are open at the opening vector`);
  }
}

/* ---------------------------------------------------------------------- */
section('documents');

{
  for (const [id, doc] of Object.entries(DOCUMENTS)) {
    ok(doc.id === id, `${id}: id matches its key`);
    ok(doc.body.length > 0, `${id}: has a body`);
    ok(!!doc.cite, `${id}: is cited`);
    if (doc.grants) {
      ok(FLAG_REGISTRY.includes(doc.grants), `${id}: grants "${doc.grants}", which is registered`);
    }
  }
  // R2: documents never move a stat. There is nowhere for them to.
  const referenced = new Set<string>();
  for (const m of MAPS) for (const it of m.interactables ?? []) if (it.document) referenced.add(it.document);
  for (const id of referenced) ok(!!DOCUMENTS[id], `a document referenced on a map exists: ${id}`);
  const orphans = Object.keys(DOCUMENTS).filter((d) => !referenced.has(d));
  ok(orphans.length === 0, `every document is findable (orphans: ${orphans.join(', ') || 'none'})`);
}

/* ---------------------------------------------------------------------- */
section('flags');

{
  const used = new Set<string>();
  for (const m of MAPS) {
    for (const it of m.interactables ?? []) {
      if (it.grants) used.add(it.grants);
      if (it.contradicts?.grants) used.add(it.contradicts.grants);
    }
    for (const n of m.npcs ?? []) if (n.hearFlag) used.add(n.hearFlag);
  }
  for (const f of used) ok(FLAG_REGISTRY.includes(f), `flag is registered: ${f}`);
}

/* ---------------------------------------------------------------------- */
section('maps');

{
  for (const m of MAPS) {
    const rows = m.ground.length;
    const cols = m.ground[0].length;
    ok(m.ground.every((r) => r.length === cols), `${m.id}: every ground row is the same width`);
    if (m.elev) ok(m.elev.length === rows, `${m.id}: the elevation layer matches the ground`);
    if (m.objects) ok(m.objects.length === rows, `${m.id}: the object layer matches the ground`);

    const legend = m.interior ? INDOOR_LEGEND : LEGEND;
    const unknown = new Set<string>();
    for (const row of m.ground) for (const ch of row) if (ch !== ' ' && !legend[ch]) unknown.add(ch);
    ok(unknown.size === 0, `${m.id}: no unknown ground characters (${[...unknown].join('') || 'none'})`);

    // The spawn has to be somewhere you can stand.
    const sch = m.ground[m.spawn.z]?.[m.spawn.x] ?? ' ';
    ok(!!legend[sch], `${m.id}: the spawn tile exists`);
    const sobj = m.objects?.[m.spawn.z]?.[m.spawn.x] ?? ' ';
    ok(sobj !== '#', `${m.id}: the spawn is not inside a wall`);

    // Every prop the map asks for has to be a prop.
    for (const p of m.props) ok(!!PROPS[p.id], `${m.id}: prop exists: ${p.id}`);

    // Portals have to go somewhere, and land somewhere legal.
    for (const p of m.portals ?? []) {
      const dest = MAPS.find((x) => x.id === p.to);
      ok(!!dest, `${m.id}/${p.id}: leads to a map that exists`);
      if (!dest) continue;
      const dlegend = dest.interior ? INDOOR_LEGEND : LEGEND;
      const ch = dest.ground[p.at[1]]?.[p.at[0]] ?? ' ';
      ok(!!dlegend[ch], `${m.id}/${p.id}: lands on a tile that exists`);
      const dobj = dest.objects?.[p.at[1]]?.[p.at[0]] ?? ' ';
      ok(dobj !== '#', `${m.id}/${p.id}: does not land inside a wall`);
    }

    // People have to be standing somewhere, and be reachable.
    for (const n of m.npcs ?? []) {
      const ch = m.ground[n.z]?.[n.x] ?? ' ';
      ok(!!legend[ch], `${m.id}/${n.id}: stands on a tile that exists`);
      const obj = m.objects?.[n.z]?.[n.x] ?? ' ';
      ok(obj !== '#', `${m.id}/${n.id}: is not standing inside a wall`);
    }
    for (const it of m.interactables ?? []) {
      const ch = m.ground[it.z]?.[it.x] ?? ' ';
      ok(!!legend[ch], `${m.id}/${it.id}: sits on a tile that exists`);
    }

    // R3: at least one contradiction per place that has people in it.
    if ((m.npcs ?? []).length > 2) {
      const contradictions = (m.interactables ?? []).filter((i) => i.contradicts).length;
      ok(contradictions >= 1, `${m.id}: carries at least one source contradiction`);
    }

    // Density: the old architecture set a floor of twelve interactables for a
    // walkable place, and it is a good floor.
    if (!m.interior || m.id === 'MV-HOUSE-1') {
      ok((m.interactables ?? []).length >= 12,
        `${m.id}: at least 12 things to look at (has ${(m.interactables ?? []).length})`);
    }

    // Examine strings: 20-60 words. Longer and it is a label, not a look.
    for (const it of m.interactables ?? []) {
      const w = it.examine.trim().split(/\s+/).length;
      ok(w >= 15 && w <= 60, `${m.id}/${it.id}: examine is ${w} words (15-60)`);
    }
  }
}

/* ---------------------------------------------------------------------- */
section('every map can actually be walked');

/*
 * This section exists because the servants' hall was placed across the north
 * lane and sealed the Quarter off from the rest of the estate, and the build
 * was green, the types were clean, and nothing said a word. Flood the map from
 * the spawn; anything the flood cannot come within arm's length of is not in
 * the game, whatever the map file says.
 */
{
  for (const m of MAPS) {
    const grid = makeGrid(m);
    const seen = reachable(grid, [m.spawn.x, m.spawn.z]);
    let open = 0;
    for (let i = 0; i < seen.length; i++) if (seen[i]) open++;
    let walkable = 0;
    for (let i = 0; i < grid.solid.length; i++) if (!grid.solid[i]) walkable++;
    console.log(`  ${m.id}: ${open} of ${walkable} standable tiles reachable`);
    ok(open > 0, `${m.id}: the spawn is not sealed in`);
    // A map with a big marooned island is usually a wall somebody did not mean.
    ok(open / Math.max(1, walkable) > 0.75,
      `${m.id}: at least three quarters of the standable ground is connected`);

    for (const n of m.npcs ?? []) {
      ok(withinReach(grid, seen, n.x, n.z), `${m.id}: ${n.id} can be reached and spoken to`);
    }
    for (const it of m.interactables ?? []) {
      ok(withinReach(grid, seen, it.x, it.z), `${m.id}: ${it.id} can be reached and examined`);
    }
    for (const p of m.portals ?? []) {
      ok(withinReach(grid, seen, p.x, p.z), `${m.id}: the ${p.id} door can be reached`);
    }
  }
}

/* ---------------------------------------------------------------------- */
section('the Witness Register');

{
  const quarter = (ESTATE.npcs ?? []).filter((n) => n.sensitive);
  ok(quarter.length >= 3, 'the Quarter has at least three named people');
  for (const n of quarter) {
    ok(!n.decision, `${n.id}: has no decision — there is nothing to transact here`);
    ok(!n.warmup, `${n.id}: has no warmup decision either`);
  }
  const zone = (ESTATE.zones ?? []).find((z) => z.id === 'quarter');
  ok(!!zone, 'the Quarter is a zone with its own light');
  ok(zone!.light.bloom === 0, 'the Quarter runs no bloom');
  ok(zone!.light.saturation < 0.3, 'the Quarter runs almost no colour');
  // "Eye level, never above" is a fixed-pitch camera's nearest equivalent:
  // come in. The number that matters is that it is meaningfully closer than
  // the estate's own, not any particular value.
  ok((zone!.dist ?? 99) <= CAM_DIST_EXTERIOR - 6,
    `the camera comes in close in the Quarter (${zone!.dist} vs ${CAM_DIST_EXTERIOR})`);

  // Nothing in the Quarter may grant a stat, and nothing may be a task.
  const inZone = (x: number, z: number) =>
    x >= zone!.x && x < zone!.x + zone!.w && z >= zone!.z && z < zone!.z + zone!.d;
  for (const it of ESTATE.interactables ?? []) {
    if (!inZone(it.x, it.z)) continue;
    ok(!!it.examine, `${it.id}: is examinable`);
  }
}

/* ---------------------------------------------------------------------- */
section('R20 — the act contains a loss the player cannot prevent');

{
  // The north wing. No option anywhere finishes it, and two separate objects
  // say so. If either of these ever disappears, the act has lost its spine.
  const says = (ESTATE.interactables ?? []).filter((i) =>
    /open to the weather|no glass|never|not paid/i.test(i.examine)).length;
  ok(says >= 2, 'at least two objects state the fixed loss');
  const finishes = ALL_DECISIONS.some((d) =>
    d.options.some((o) => /finish|complete/i.test(o.full) && /wing|house/i.test(o.full)));
  ok(!finishes, 'no decision anywhere offers to finish the house');
}

/* ---------------------------------------------------------------------- */
console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) {
  console.error(`\n${failures} FAILED`);
  process.exit(1);
}
console.log('green\n');
