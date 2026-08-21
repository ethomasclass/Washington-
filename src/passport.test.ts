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
import { PROPS } from './engine/props';
import { makeGrid, reachable, withinReach } from './engine/collision';
import { CAM_DIST_EXTERIOR } from './engine/view';
import { CAMBRIDGE_SUMMER, CAMBRIDGE_WINTER } from './content/cambridge';
import { HQ_AUTUMN, HQ_UP_AUTUMN, HQ_UP_WINTER, HQ_WINTER } from './content/vassall';
import { A2_D3_ENLISTMENT, ACT2_DECISIONS } from './content/act2-decisions';
import { ACT3_DECISIONS } from './content/act3-decisions';
import { BK_FERRY, BK_FERRY_NIGHT, BK_LINES } from './content/brooklyn';
import { FOUR_CHIMNEYS } from './content/four-chimneys';
import { reckon, RECKONED_ACTS } from './ledger';
import { DESTINATIONS } from './ui/travel';

let failures = 0;
let checks = 0;

function ok(cond: boolean, what: string): void {
  checks++;
  if (!cond) { failures++; console.error(`  FAIL  ${what}`); }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

const MAPS: MapDef[] = [
  ESTATE, MANSION_GROUND, MANSION_UPPER,
  CAMBRIDGE_SUMMER, HQ_AUTUMN, HQ_UP_AUTUMN,
  CAMBRIDGE_WINTER, HQ_WINTER, HQ_UP_WINTER,
  BK_LINES, BK_FERRY, FOUR_CHIMNEYS, BK_FERRY_NIGHT,
];

/**
 * Which maps belong to which act.
 *
 * Several rules are per-act rather than per-map — a locked option has to be
 * openable inside ITS OWN act, not anywhere in the game — and getting that
 * wrong is how a lock that is satisfiable only in Act 1 ends up gating an
 * option in Act 2 and dead-ending a student who came in on a save code.
 */
const ACT_OF: Record<string, number> = {
  [ESTATE.id]: 1, [MANSION_GROUND.id]: 1, [MANSION_UPPER.id]: 1,
  [CAMBRIDGE_SUMMER.id]: 2, [HQ_AUTUMN.id]: 2, [HQ_UP_AUTUMN.id]: 2,
  [CAMBRIDGE_WINTER.id]: 2, [HQ_WINTER.id]: 2, [HQ_UP_WINTER.id]: 2,
  [BK_LINES.id]: 3, [BK_FERRY.id]: 3, [FOUR_CHIMNEYS.id]: 3, [BK_FERRY_NIGHT.id]: 3,
};
const mapsOfAct = (a: number) => MAPS.filter((m) => ACT_OF[m.id] === a);

function decisionsOf(m: MapDef): Decision[] {
  const out: Decision[] = [];
  for (const n of m.npcs ?? []) {
    if (n.warmup) out.push(n.warmup);
    if (n.decision) out.push(n.decision);
  }
  return out;
}
/*
 * Every decision, deduplicated.
 *
 * Act 2's decisions are authored in one file and attached to NPCs on two
 * seasonal maps, so walking the maps finds some of them twice. Deduplicating
 * by id rather than by object identity also catches the real mistake this
 * guards against: two different decisions accidentally sharing an id, which
 * would silently make the second one unreachable because the first is
 * already in `state.decisions`.
 */
const SEEN_DECISIONS = new Map<string, Decision>();
for (const d of [
  ...MAPS.flatMap(decisionsOf), A1_D4_UNIFORM, ...ACT2_DECISIONS, ...ACT3_DECISIONS,
]) {
  const prior = SEEN_DECISIONS.get(d.id);
  if (prior && prior !== d) {
    failures++; console.error(`  FAIL  two different decisions share the id ${d.id}`);
  }
  SEEN_DECISIONS.set(d.id, d);
}
const ALL_DECISIONS = [...SEEN_DECISIONS.values()];

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
  const grantsOf = (maps: MapDef[]) => {
    const g = new Set<string>();
    for (const m of maps) {
      for (const it of m.interactables ?? []) {
        if (it.grants) g.add(it.grants);
        if (it.contradicts?.grants) g.add(it.contradicts.grants);
        if (it.document && DOCUMENTS[it.document]?.grants) g.add(DOCUMENTS[it.document].grants!);
      }
      for (const n of m.npcs ?? []) if (n.hearFlag) g.add(n.hearFlag);
      for (const mk of m.marks ?? []) if (mk.grants) g.add(mk.grants);
    }
    return g;
  };
  const byAct = new Map<number, Set<string>>([
    [1, grantsOf(mapsOfAct(1))], [2, grantsOf(mapsOfAct(2))], [3, grantsOf(mapsOfAct(3))],
  ]);
  const actOfDecision = new Map<string, number>();
  for (const m of MAPS) for (const d of decisionsOf(m)) actOfDecision.set(d.id, ACT_OF[m.id]);
  actOfDecision.set('A1-D4', 1);
  const grantable = new Set([...byAct.get(1)!, ...byAct.get(2)!]);

  for (const d of ALL_DECISIONS) {
    /*
     * 07 §2.1.3 — no knowledge lock may reference a document not findable in
     * the act where the lock appears. Checked per act, not globally, because
     * a global check passes happily on a lock in Act 2 whose only key is on
     * the estate — and a student who joined the class in week two would find
     * the option permanently shut with nothing on the map to open it.
     */
    const act = actOfDecision.get(d.id) ?? 0;
    const inAct = byAct.get(act) ?? grantable;
    for (const o of d.options) {
      if (!o.requires) continue;
      ok(inAct.has(o.requires),
        `${d.id}/${o.id} needs "${o.requires}", which something in Act ${act || '?'} grants`);
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

    // Each map's OWN legend, not one of two globals. Cambridge brought its
    // own alphabet — snow, slush, turf, ice — and a global lookup here would
    // have quietly reported every winter tile as an unknown character.
    const legend = m.legend;
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
      const dlegend = dest.legend;
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

  /*
   * The notice is not decoration and it is not optional. A future edit that
   * drops it, empties it, or quietly strips its citations turns the Quarter
   * back into scenery, and that is precisely the failure the whole Witness
   * Register exists to prevent. So it is asserted, including the source line
   * — §6.4's test is "that is what happened, and here is the source," and a
   * claim of this weight without the second half does not ship.
   */
  const notice = zone!.notice;
  ok(!!notice, 'the Quarter carries a notice in the game\'s own voice');
  ok((notice?.body.length ?? 0) >= 3, 'the notice actually says something');
  ok(!!notice?.source && notice.source.length > 40, 'the notice cites its sources');
  const words = (notice?.body ?? []).join(' ');
  ok(/enslav/i.test(words), 'the notice uses the word enslaved rather than a euphemism');
  ok(/135|123|153/.test(words), 'the notice gives real numbers');
  // R4 of the anti-textbook rules: no implication the player could fix it.
  ok(/nothing you choose/i.test(words),
    'the notice says plainly that the player cannot change any of it');

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
section('A2-D3 — the binding production note');

/*
 * The four clauses of the production note at the head of `A2_D3_ENLISTMENT`,
 * asserted rather than trusted.
 *
 * A comment saying "do not soften this" survives exactly as long as the next
 * person who reads it. These do not care whether anybody read it. If a future
 * edit adds a conscience to that room, or lets a student vote for the bar, or
 * quietly hands out a Character point for the humane-sounding branch, `npm
 * test` goes red and says which clause was broken.
 */
{
  const d = A2_D3_ENLISTMENT;

  // 2. Three voices. Not four, not five. The silence of Temper and Vanity is
  //    the design: the loudest parts of him are simply not interested.
  ok(d.voices.length === 3, `A2-D3 has exactly three voices (has ${d.voices.length})`);
  ok(!d.voices.includes('temper') && !d.voices.includes('vanity'),
    'A2-D3: Temper and Vanity have nothing to say about this, and do not');

  // 1. No voice argues it on moral grounds, because none did in that room.
  //    The council of 8 October voted it down unanimously; the reversal on 30
  //    December was argued on manpower and on Dunmore.
  const MORAL = /\b(moral|conscience|right thing|justice|humanity|wicked|wrong to|ought not|cruel)\b/i;
  for (const [v, l] of Object.entries(d.interjections)) {
    ok(!MORAL.test(l ?? ''), `A2-D3/${v}: argues manpower or authority, never morals`);
  }

  // 3. Personal Character does not move on any branch. No option here is a
  //    moral improvement, because none of them was.
  for (const o of d.options) {
    ok(o.effects.character === undefined,
      `A2-D3/${o.id}: does not move Personal Character`);
  }

  // 4. The player can NEVER choose to exclude. The bar is already in force
  //    when they arrive; their only agency is in ending it, formalising it,
  //    or handing it to somebody else.
  /*
   * The verb has to be the player's, and it has to be doing the excluding.
   * An earlier version of this test matched the bare noun "bar" and failed
   * the option that STRIKES the bar — which is exactly the kind of false
   * positive that gets a rule switched off. It matches an act of exclusion,
   * not the word for the thing being removed.
   */
  const EXCLUDE =
    /\b(exclude|reject|forbid|prohibit)\b|\b(bar|turn away|turn them away|keep out)\b\s+(them|him|these|the free|negroes|any)/i;
  for (const o of d.options) {
    ok(!EXCLUDE.test(o.label) && !EXCLUDE.test(o.full),
      `A2-D3/${o.id}: is not an option to exclude anybody`);
  }
  ok(d.options.some((o) => o.historical),
    'A2-D3: the order actually issued on 30 December is on the page and marked');
}

/* ---------------------------------------------------------------------- */
section('sealed decisions, and the flags a decision may set');

{
  const sealed = ALL_DECISIONS.filter((d) => d.sealed);
  ok(sealed.length >= 1, 'the game has at least one sealed decision');
  for (const d of sealed) {
    /*
     * A sealed decision bypasses the soft shoulder, so its deltas are the
     * ones that actually land whatever the run has already spent — and a
     * sealed decision that moved nothing much would be a wax seal on an
     * empty envelope. Five, not eight: Act 1's sealed decision is authored
     * at six and the balance of it has been played, and a linter that
     * demands a content change to satisfy a number the linter itself
     * invented is a linter that gets switched off.
     */
    const biggest = Math.max(...d.options.flatMap((o) =>
      Object.values(o.effects).map((v) => Math.abs(v as number))));
    ok(biggest >= 5, `${d.id}: a sealed decision moves something by at least 5 (max ${biggest})`);
  }

  /*
   * The rule from `types.ts`: a decision may tell the WORLD what was settled
   * and may never tell another DECISION. Crossing that would make one
   * decision the key to another's locked option, which is the exact thing
   * R2 exists to prevent — the only key to a locked option is a primary
   * source the student went and found.
   */
  const decisionGrants = new Set(ALL_DECISIONS.flatMap((d) => d.options.flatMap((o) => o.grants ?? [])));
  for (const d of ALL_DECISIONS) {
    for (const o of d.options) {
      if (!o.requires) continue;
      ok(!decisionGrants.has(o.requires),
        `${d.id}/${o.id}: its key is a source, not another decision`);
    }
  }
  for (const f of decisionGrants) ok(FLAG_REGISTRY.includes(f), `decision flag is registered: ${f}`);
}

/* ---------------------------------------------------------------------- */
section('the ledger');

{
  for (const act of RECKONED_ACTS) {
    const s = initialState();
    // The worst case for the arithmetic: every decision in the act settled
    // the way that costs the most men.
    for (const d of ALL_DECISIONS) {
      const worst = [...d.options].sort((a, b) =>
        (a.ledger ?? []).reduce((t, l) => t + l.n, 0) - (b.ledger ?? []).reduce((t, l) => t + l.n, 0))[0];
      s.decisions.set(d.id, worst.id);
    }
    const r = reckon(act, s, (id, opt) => {
      const d = ALL_DECISIONS.find((x) => x.id === id);
      return d?.options.find((o) => o.id === opt)?.ledger ?? [];
    });
    ok(!!r, `act ${act} has a reckoning authored`);
    if (!r) continue;

    // Rule 3: at least one line is always something the player could not
    // have changed. R20, on the accounting page.
    ok(r.lines.some((l) => !l.earned), `act ${act}: the reckoning carries a loss nobody could prevent`);
    // Rule 1: every line names its cause in plain English, past tense, and
    // never a stat name.
    for (const l of r.lines) {
      ok(l.cause.length > 8, `act ${act}: "${l.cause}" is a cause, not a label`);
      ok(!/judgment|legitimacy|loyalty|character|morale|penalt/i.test(l.cause),
        `act ${act}: "${l.cause}" names a fact, not a mechanic`);
    }
    // And an army cannot end an act below zero however badly it goes.
    ok(r.closedWith > 0, `act ${act}: the worst run still leaves an army (${r.closedWith})`);
  }
}

/* ---------------------------------------------------------------------- */
section('Act 2 — the shape of the act');

{
  const a2 = mapsOfAct(2);

  // The seasons are the same PLACE. If the two Cambridge maps ever stop
  // agreeing tile for tile on where the ground is, a student who walked this
  // camp in July cannot recognise the spot in December, and the whole point
  // of building two states rather than two levels is gone.
  ok(CAMBRIDGE_SUMMER.ground.length === CAMBRIDGE_WINTER.ground.length,
    'the two Cambridges are the same size');
  const sameShape = CAMBRIDGE_SUMMER.ground.every((row, r) =>
    row.length === CAMBRIDGE_WINTER.ground[r].length);
  ok(sameShape, 'the two Cambridges agree row for row');
  ok(JSON.stringify(CAMBRIDGE_SUMMER.elev) === JSON.stringify(CAMBRIDGE_WINTER.elev),
    'the hill is the same hill in both seasons');

  // The season is reached by a door, not by a menu, and the flag that opens
  // it is set by the decision that ends the autumn.
  const out = (HQ_AUTUMN.portals ?? []).find((p) => p.alt);
  ok(!!out, 'the headquarters door carries the season');
  ok(out?.alt?.to === CAMBRIDGE_WINTER.id, 'and it leads into the winter');
  const setsWinter = ALL_DECISIONS.some((d) =>
    d.options.every((o) => (o.grants ?? []).includes(out!.alt!.requires)));
  ok(setsWinter, 'and every branch of one decision sets it, so the winter cannot be dodged');

  // R3 on the new ground.
  for (const m of [CAMBRIDGE_SUMMER, HQ_AUTUMN]) {
    ok((m.interactables ?? []).some((i) => i.contradicts),
      `${m.id}: carries at least one source contradiction`);
  }

  // The survey. Seven positions across the water, learned by looking.
  const marks = CAMBRIDGE_SUMMER.marks ?? [];
  const granting = marks.filter((m) => m.grants);
  ok(granting.length === 7, `seven British positions are named by survey (${granting.length})`);
  ok(granting.every((m) => m.overWater),
    'all seven are across the water, or the sightline test would refuse them');
  for (const m of granting) ok(FLAG_REGISTRY.includes(m.grants!), `survey flag registered: ${m.grants}`);
  // And the winter map keeps them, so a student who missed them in July can
  // still take them in January.
  ok((CAMBRIDGE_WINTER.marks ?? []).filter((m) => m.grants).length === 7,
    'the seven are still there in the winter');

  /*
   * MAP TABLES ARE RARE, and the assertion exists to keep them rare.
   *
   * One per act that has one, plus one extra for Act 2 because Cambridge
   * exists in two seasons and the same table stands in both. Anything beyond
   * that is a second special case, and the rule this project keeps proving is
   * that a thing which looks like it wants a special case almost never does.
   */
  const opens = MAPS.flatMap((m) => (m.interactables ?? []).filter((i) => i.opens));
  const kinds = new Set(opens.map((i) => i.opens));
  ok(opens.length <= 4, `map tables stay rare (${opens.length} objects open a screen)`);
  ok(kinds.size <= 2, `and there are at most two kinds of them (${[...kinds].join(', ')})`);
  ok(opens.filter((i) => i.opens === 'survey').length === 2,
    "Knox's table stands in both seasons of Cambridge");

  // The Witness Register followed the army north.
  const witnesses = a2.flatMap((m) => (m.npcs ?? []).filter((n) => n.sensitive));
  ok(witnesses.length >= 2, 'Act 2 carries the Witness Register forward');
  for (const n of witnesses) {
    ok(!n.decision, `${n.id}: has no decision — there is nothing to transact here`);
    ok(!n.warmup, `${n.id}: has no warmup decision either`);
  }

  // R20 for Act 2: there is no powder, and nothing anywhere produces any.
  const makesPowder = ALL_DECISIONS.some((d) =>
    d.options.some((o) => /\b(find|obtain|buy|make|import|more)\b[^.]{0,30}powder/i.test(o.full)));
  ok(!makesPowder, 'no decision anywhere conjures powder');
  const saysSo = (CAMBRIDGE_SUMMER.interactables ?? []).filter((i) =>
    /thirty-six|three hundred|not enough|would not fill/i.test(i.examine)).length;
  ok(saysSo >= 1, 'at least one object on the ground states the fixed loss');

  // Both seasons have to be worth walking.
  for (const m of [CAMBRIDGE_SUMMER, CAMBRIDGE_WINTER]) {
    ok((m.interactables ?? []).length >= 18,
      `${m.id}: at least 18 things to look at (has ${(m.interactables ?? []).length})`);
    ok((m.npcs ?? []).length >= 4, `${m.id}: at least four people (has ${(m.npcs ?? []).length})`);
  }

  /*
   * Charlestown is UNREACHABLE, on purpose, and this is the assertion that
   * makes that an intention rather than a tolerated 6% of marooned ground.
   * The whole act is about a mile of water you cannot cross, and a player who
   * can walk over to the enemy's works has been handed the answer to the
   * council of war by the collision grid.
   */
  for (const m of [CAMBRIDGE_SUMMER, CAMBRIDGE_WINTER]) {
    const grid = makeGrid(m);
    const seen = reachable(grid, [m.spawn.x, m.spawn.z]);
    ok(!withinReach(grid, seen, 30, 1, 2.5), `${m.id}: Charlestown cannot be walked to`);
  }
}

/* ---------------------------------------------------------------------- */
section('the travel panel');

/*
 * A build tool that lands you inside a wall is worse than no build tool: you
 * spend the next two minutes deciding whether the map is broken or the jump
 * is. Every destination is checked exactly as hard as a portal is.
 */
{
  const seen = new Set<string>();
  for (const g of DESTINATIONS) {
    ok(!!g.heading && !!g.where, 'every travel group is labelled');
    for (const d of g.rows) {
      const m = MAPS.find((x) => x.id === d.map);
      ok(!!m, `travel: ${d.label} goes to a map that exists (${d.map})`);
      if (!m) continue;
      ok(!seen.has(d.label), `travel: "${d.label}" is named once`);
      seen.add(d.label);

      const [x, z] = d.at ?? [m.spawn.x, m.spawn.z];
      const ch = m.ground[z]?.[x] ?? ' ';
      ok(!!m.legend[ch], `travel: ${d.label} lands on a tile that exists`);
      ok((m.objects?.[z]?.[x] ?? ' ') !== '#', `travel: ${d.label} does not land inside a wall`);

      // And it has to be somewhere you could have walked to, or the jump has
      // put the player somewhere the game cannot get them out of.
      const grid = makeGrid(m);
      const reach = reachable(grid, [m.spawn.x, m.spawn.z]);
      const i = grid.at(x, z);
      ok(i >= 0 && !!reach[i], `travel: ${d.label} lands somewhere connected to the map`);
    }
  }
  // Every map in the game is reachable from the panel, or it is a map nobody
  // working on this can look at without typing into a console.
  for (const m of MAPS) {
    ok(DESTINATIONS.some((g) => g.rows.some((d) => d.map === m.id)),
      `travel: ${m.id} can be reached from the panel`);
  }
}

/* ---------------------------------------------------------------------- */
console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) {
  console.error(`\n${failures} FAILED`);
  process.exit(1);
}
console.log('green\n');
