/**
 * Passport codes — the save system.
 *
 * No accounts, no backend, no student data leaving the device. The student
 * writes down (or copies) a short code at the end of a class period and types
 * it back in the next one, on whatever Chromebook they end up with.
 *
 * Crockford Base32, grouped in fours, with a checksum so a mistyped code fails
 * cleanly instead of silently corrupting a run.
 */

import { initialState, type GameState, type StatId } from './state';
import { SCENE_ORDER } from './scene-order';

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: no I, L, O, U
const STATS: StatId[] = ['judgment', 'legitimacy', 'loyalty', 'character'];

/**
 * Registry of every flag that can persist. Index is the bit position, so this
 * list is append-only: reordering it invalidates every save code in every
 * classroom. A flag missing from here silently fails to persist, which is why
 * passport.test.ts checks the registry against the content.
 */
/**
 * THE PASSPORT SUBSET — what actually travels in the code.
 *
 * `FLAG_REGISTRY` below is every flag the game sets. This is the far smaller
 * set that survives a change of device, and the distinction is the whole
 * reason the code stays short enough to copy off a whiteboard.
 *
 * The rule, and it derives from a rule that already existed:
 *
 *   07 §2.1.3 — "No knowledge lock may reference a document not findable in
 *   the act where the lock appears."
 *
 * Every lock is therefore satisfiable inside its own act. So an `obs.`, `task.`
 * or `heard.` flag has no reader after the act that set it: it gates a
 * contradiction, a journal line or an option in the same forty minutes, and
 * then it is spent. Carrying it to another machine three days later buys the
 * student nothing and costs everyone a character of code.
 *
 * `doc.` flags are different and they all persist. The Documents ribbon is a
 * list of which primary sources this student actually read — it is the
 * assessment artifact (07 §2.2), the epilogue reads it, and 07 §1.6 budgets
 * 51 bits for exactly this.
 *
 * APPEND-ONLY, like the registry. Position is meaning: reordering this array
 * silently reinterprets every code in every classroom.
 */
export const PASSPORT_FLAGS: string[] = [
  'doc.a1.boston_clipping',
  'doc.a1.ledger',
  'doc.a1.commission',
  'doc.a1.braddock',
  'doc.a1.accounts',
  'doc.a2.ration_return',
  'doc.a2.reed_letter',
  'doc.a2.emerson',
  'doc.a2.enlistment',
  'doc.a2.letter_home',
  'doc.a2.doolittle',
  'doc.a2.knox',
  'doc.a2.congress',
  'doc.a2.returns',
  // --- appended for the rebuilt Act 1. APPEND-ONLY: never reorder. ---------
  'doc.a1.necessity',
  'doc.a1.resolves',
  'doc.a1.osnaburg',
  'doc.a1.fairfax',
  'doc.a1.diary',
];

export const FLAG_REGISTRY: string[] = [
  'doc.a1.boston_clipping',
  'doc.a1.ledger',
  'doc.a1.commission',
  'doc.a1.braddock',
  'doc.a1.accounts',
  'obs.a1.scaffolding',
  'obs.a1.uniform',
  'obs.a1.surveying',
  'heard.a1.martha',
  'heard.a1.lund',
  'obs.a1.ledger_stops',
  'obs.a1.lund_pays',
  'task.a1.instruments',
  'task.a1.weather',
  'task.a1.letter',
  'task.a1.orders',
  'task.a1.nelson',
  'obs.a1.house_in_order',
  'obs.a1.river',
  'doc.a2.ration_return',
  'doc.a2.reed_letter',
  'doc.a2.emerson',
  'doc.a2.enlistment',
  'obs.a2.powder_horn',
  'obs.a2.greene_tents',
  'obs.a2.boston',
  'heard.a2.greene',
  'obs.a2.greene_contradiction',
  'obs.a2.powder_arithmetic',
  'task.a2.orders',
  'task.a2.rounds',
  'task.a2.return',
  'task.a2.reed',
  'obs.a2.orders_issued',
  'obs.a2.marquee',
  'obs.a2.headquarters',
  'obs.a2.cook_fire',
  'map.a2.charlestown',
  'map.a2.bunker',
  'map.a2.copps',
  'map.a2.north_church',
  'map.a2.beacon',
  'map.a2.ferry',
  'map.a2.shipping',
  'obs.a2.gabion',
  'obs.a2.graves',
  'obs.a2.deserter',
  'obs.a2.rum',
  'doc.a2.letter_home',
  'doc.a2.doolittle',
  'obs.a2.plates_contradiction',
  'obs.a2.enlistment_roll',
  'heard.a2.prescott',
  'heard.a2.doolittle',
  'heard.a2.starr',
  'task.a2.parapet',
  'task.a2.gabions',
  'task.a2.passes',
  'obs.a2.lines_in_order',
  // CB-02, the headquarters parlour.
  'heard.a2.knox',
  'heard.a2.gates',
  'doc.a2.knox',
  'doc.a2.congress',
  'doc.a2.returns',
  'obs.a2.map',
  'obs.a2.inkstand',
  'obs.a2.commissary',
  'obs.a2.orders_july',
  'obs.a2.books',
  'obs.a2.chairs',
  'obs.a2.window',
  'obs.a2.portrait',
  'obs.a2.congress_contradiction',
  'task.a2.dispatches',
  'task.a2.knox_sent',
  'task.a2.firewood',
  'obs.a2.hq_done',
  // --- appended for the rebuilt Act 1. APPEND-ONLY: never reorder. ---------
  'doc.a1.necessity',
  'doc.a1.resolves',
  'doc.a1.osnaburg',
  'doc.a1.fairfax',
  'doc.a1.diary',
  'obs.a1.northwing',
  'obs.a1.venetian',
  'obs.a1.limepit',
  'obs.a1.haha',
  'obs.a1.cellar',
  'obs.a1.pot',
  'obs.a1.garden',
  'obs.a1.fiddle',
  'heard.a1.billy',
  'heard.a1.jenkins',
  'heard.a1.frank',
  'heard.a1.doll',
  'heard.a1.harry',
  'heard.a1.simms',
  'obs.a1.study',
  'obs.a1.peale',
  'obs.a1.spectacles',
  'obs.a1.quarter_contradiction',

];

class BitWriter {
  private bits: number[] = [];
  write(value: number, width: number): void {
    for (let i = width - 1; i >= 0; i--) this.bits.push((value >> i) & 1);
  }
  bitArray(): number[] {
    return this.bits;
  }
}

function bitsToBase32(bits: number[]): string {
  const padded = bits.slice();
  while (padded.length % 5 !== 0) padded.push(0);
  let out = '';
  for (let i = 0; i < padded.length; i += 5) {
    let v = 0;
    for (let j = 0; j < 5; j++) v = (v << 1) | padded[i + j];
    out += ALPHABET[v];
  }
  return out;
}

function base32ToBits(s: string): number[] {
  const bits: number[] = [];
  for (const ch of s) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) throw new Error(`bad character: ${ch}`);
    for (let i = 4; i >= 0; i--) bits.push((v >> i) & 1);
  }
  return bits;
}

/**
 * CRC-16/CCITT over the payload.
 *
 * This was CRC-8, and CRC-8 was enough while the flag registry was short. At
 * thirty-four flags the payload outgrew it: the round-trip test found two
 * single-character typos in eighty-nine that collided to the same checksum and
 * would have decoded as a silently different run. Sixteen bits costs two more
 * characters on the code and restores the guarantee.
 */
const CRC_BITS = 16;

function checksum(bits: number[]): number {
  let crc = 0xffff;
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] ?? 0);
    crc ^= (byte & 0xff) << 8;
    for (let k = 0; k < 8; k++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

export function encode(state: GameState): string {
  const w = new BitWriter();
  w.write(1, 4); // format version
  w.write(state.act, 4);
  w.write(Math.max(0, SCENE_ORDER.indexOf(state.scene)), 5);
  for (const s of STATS) w.write(state.stats[s], 7);
  for (const s of STATS) w.write(state.snapshot[s], 7);
  for (const flag of PASSPORT_FLAGS) w.write(state.knowledge.has(flag) ? 1 : 0, 1);

  const payload = w.bitArray();
  const crc = checksum(payload);
  const all = payload.slice();
  for (let i = CRC_BITS - 1; i >= 0; i--) all.push((crc >> i) & 1);

  const raw = bitsToBase32(all);
  return (raw.match(/.{1,4}/g) ?? []).join('-');
}

export function decode(code: string): GameState {
  const clean = code.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/I/g, '1').replace(/L/g, '1').replace(/O/g, '0');
  const bits = base32ToBits(clean);

  const payloadLen = 4 + 4 + 5 + 7 * 8 + PASSPORT_FLAGS.length;
  if (bits.length < payloadLen + CRC_BITS) throw new Error('code is too short');

  const payload = bits.slice(0, payloadLen);
  let given = 0;
  for (let i = 0; i < CRC_BITS; i++) given = (given << 1) | bits[payloadLen + i];
  if (checksum(payload) !== given) throw new Error('that code has a typo in it');

  /*
   * The tail.
   *
   * Base32 packs five bits to a character, so the last character of a code
   * almost always carries a few bits past the end of the checksum. They are
   * written as zeroes. If they are not zeroes coming back in, the code was
   * mistyped — and without this check a typo in the final character is silently
   * accepted, because nothing downstream ever reads those bits. The state it
   * decodes to happens to be right, but "happens to be right" is not a property
   * to ship: the student should be told the code is wrong while they still have
   * the paper in front of them.
   */
  for (let i = payloadLen + CRC_BITS; i < bits.length; i++) {
    if (bits[i] !== 0) throw new Error('that code has a typo in it');
  }

  let p = 0;
  const read = (width: number): number => {
    let v = 0;
    for (let i = 0; i < width; i++) v = (v << 1) | payload[p++];
    return v;
  };

  const version = read(4);
  if (version !== 1) throw new Error(`unknown save version ${version}`);

  const state = initialState();
  state.act = read(4);
  state.scene = SCENE_ORDER[read(5)] ?? SCENE_ORDER[0];
  for (const s of STATS) state.stats[s] = read(7);
  for (const s of STATS) state.snapshot[s] = read(7);
  state.knowledge = new Set<string>();
  for (const flag of PASSPORT_FLAGS) if (read(1)) state.knowledge.add(flag);
  return state;
}

const LS_KEY = 'washington.autosave';

/*
 * THE TWO SAVES, AND WHY THEY ARE NOT THE SAME THING.
 *
 * 07 §1.6: "localStorage holds the full state object. The code holds the
 * resumable subset."
 *
 * This used to store `encode(state)` — the autosave WAS the passport code. It
 * looked like economy and it was the reason the code grew without bound: if the
 * code is also the local save, then every flag has to travel in it or a page
 * refresh loses your afternoon, and 59 flags for three scenes projects to a
 * hundred-character code by Act 8.
 *
 * Separated, each does its own job properly. Locally you lose nothing at all,
 * ever. On another machine you resume with your stats, your position and every
 * document you have read, and you re-walk the scene you were standing in —
 * which costs a few minutes of looking and is the correct price for a save you
 * can write on your hand.
 */

/** Everything, as JSON. Sets and Maps do not survive stringify on their own. */
export function serialise(state: GameState): string {
  return JSON.stringify({
    v: 1,
    act: state.act,
    scene: state.scene,
    stats: state.stats,
    snapshot: state.snapshot,
    knowledge: [...state.knowledge],
    decisions: [...state.decisions],
  });
}

export function deserialise(raw: string): GameState | null {
  const o = JSON.parse(raw) as {
    v?: number; act?: number; scene?: string;
    stats?: GameState['stats']; snapshot?: GameState['snapshot'];
    knowledge?: string[]; decisions?: [string, string][];
  };
  if (o.v !== 1 || !o.stats || !o.snapshot || !o.scene) return null;
  return {
    act: o.act ?? 1,
    scene: o.scene,
    stats: o.stats,
    snapshot: o.snapshot,
    knowledge: new Set(o.knowledge ?? []),
    decisions: new Map(o.decisions ?? []),
  };
}

export function autosave(state: GameState): void {
  try {
    localStorage.setItem(LS_KEY, serialise(state));
  } catch {
    /* private browsing, shared device, wiped profile — the passport code is the real save */
  }
}

export function loadAutosave(): GameState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    // A code left by an older build still loads, rather than dropping a run on
    // the floor the first time a student opens the game after an update.
    return raw.trim().startsWith('{') ? deserialise(raw) : decode(raw);
  } catch {
    return null;
  }
}
