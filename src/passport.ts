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

function checksum(bits: number[]): number {
  // CRC-8 over the payload. Cheap, and catches every single-character slip.
  let crc = 0xff;
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] ?? 0);
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 0x80 ? ((crc << 1) ^ 0x31) & 0xff : (crc << 1) & 0xff;
  }
  return crc;
}

export function encode(state: GameState): string {
  const w = new BitWriter();
  w.write(1, 4); // format version
  w.write(state.act, 4);
  for (const s of STATS) w.write(state.stats[s], 7);
  for (const s of STATS) w.write(state.snapshot[s], 7);
  for (const flag of FLAG_REGISTRY) w.write(state.knowledge.has(flag) ? 1 : 0, 1);

  const payload = w.bitArray();
  const crc = checksum(payload);
  const all = payload.slice();
  for (let i = 7; i >= 0; i--) all.push((crc >> i) & 1);

  const raw = bitsToBase32(all);
  return (raw.match(/.{1,4}/g) ?? []).join('-');
}

export function decode(code: string): GameState {
  const clean = code.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/I/g, '1').replace(/L/g, '1').replace(/O/g, '0');
  const bits = base32ToBits(clean);

  const payloadLen = 4 + 4 + 7 * 8 + FLAG_REGISTRY.length;
  if (bits.length < payloadLen + 8) throw new Error('code is too short');

  const payload = bits.slice(0, payloadLen);
  let given = 0;
  for (let i = 0; i < 8; i++) given = (given << 1) | bits[payloadLen + i];
  if (checksum(payload) !== given) throw new Error('that code has a typo in it');

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
