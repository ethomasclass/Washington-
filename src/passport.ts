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
  for (const flag of FLAG_REGISTRY) w.write(state.knowledge.has(flag) ? 1 : 0, 1);

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

  const payloadLen = 4 + 4 + 5 + 7 * 8 + FLAG_REGISTRY.length;
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
  for (const flag of FLAG_REGISTRY) if (read(1)) state.knowledge.add(flag);
  return state;
}

const LS_KEY = 'washington.autosave';

export function autosave(state: GameState): void {
  try {
    localStorage.setItem(LS_KEY, encode(state));
  } catch {
    /* private browsing, shared device, wiped profile — the passport code is the real save */
  }
}

export function loadAutosave(): GameState | null {
  try {
    const code = localStorage.getItem(LS_KEY);
    return code ? decode(code) : null;
  } catch {
    return null;
  }
}
