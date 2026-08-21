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
  // --- Act 2's documents. APPEND-ONLY: never reorder. ---------------------
  'doc.a2.black_enlistment',
  'doc.a2.lund_letter',
  'doc.a2.powder_return',
  // --- Act 3's documents. APPEND-ONLY: never reorder. ---------------------
  'doc.a3.arnold',
  'doc.a3.congress_ny',
  'doc.a3.enemy_report',
  'doc.a3.hancock',
  'doc.a3.jamaica_order',
  'doc.a3.manifest',
  'doc.a3.murray',
  // --- Act 4's documents. APPEND-ONLY: never reorder. ---------------------
  'doc.a4.cap_plate',
  'doc.a4.crisis',
  'doc.a4.morris',
  'doc.a4.password',
  'doc.a4.rall_note',
  'doc.a4.reenlist',
  'doc.a4.trenton_report',
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

  /* --------------------------------------------------------------------
   * ACT 2 — Cambridge and the lines before Boston.
   *
   * APPEND-ONLY, like everything above it. Several of these replace flags
   * of the same NAME that the pre-rebuild Act 2 registered and that no
   * shipped code has ever set — they are left in place above rather than
   * removed, because removing a line from this list renumbers every bit
   * after it and invalidates every save code in every classroom. A dead
   * flag costs one bit. A renumbering costs an afternoon of somebody's
   * lesson.
   * ------------------------------------------------------------------ */
  'doc.a2.black_enlistment',
  'doc.a2.lund_letter',
  'doc.a2.powder_return',
  'heard.a2.billy',
  'heard.a2.bragg',
  'heard.a2.campwoman',
  'heard.a2.campwoman_w',
  'heard.a2.drummer',
  'heard.a2.drummer_w',
  'heard.a2.gates_w',
  'heard.a2.greene_w',
  'heard.a2.harrison',
  'heard.a2.martha',
  'heard.a2.reed',
  'heard.a2.salem',
  'heard.a2.sentry',
  'heard.a2.sentry_w',
  'heard.a2.whitcomb',
  'heard.a2.whitcomb_w',
  'obs.a2.camp_bed',
  'obs.a2.camp_women',
  'obs.a2.charlestown',
  'obs.a2.council_abided',
  'obs.a2.council_overruled',
  'obs.a2.council_pressed',
  'obs.a2.dinner',
  'obs.a2.dispatch',
  'obs.a2.dunmore_named',
  'obs.a2.empty_ground',
  'obs.a2.enlistment_opened',
  'obs.a2.enlistment_wide',
  'obs.a2.express',
  'obs.a2.field_desk',
  'obs.a2.firewood',
  'obs.a2.garret',
  'obs.a2.glass',
  'obs.a2.guns',
  'obs.a2.hunting_shirt',
  'obs.a2.huts',
  'obs.a2.kettle',
  'obs.a2.knox_gone',
  'obs.a2.knox_train',
  'obs.a2.letter_home',
  'obs.a2.magazine',
  'obs.a2.martha_came',
  'obs.a2.necessary',
  'obs.a2.no_bayonet',
  'obs.a2.noble_train',
  'obs.a2.orders',
  'obs.a2.orders_book',
  'obs.a2.parade',
  'obs.a2.parapet',
  'obs.a2.plate',
  'obs.a2.plates',
  'obs.a2.ration_return',
  'obs.a2.reasons_written',
  'obs.a2.returns',
  'obs.a2.spyglass',
  'obs.a2.unfinished',
  'obs.a2.upper_window',
  'obs.a2.vassall',
  'obs.a2.winter_came',

  /* --------------------------------------------------------------------
   * ACT 3 — Brooklyn, the marsh, and the ferry. APPEND-ONLY.
   * ------------------------------------------------------------------ */
  'doc.a3.arnold',
  'doc.a3.congress_ny',
  'doc.a3.enemy_report',
  'doc.a3.hancock',
  'doc.a3.jamaica_order',
  'doc.a3.manifest',
  'doc.a3.murray',
  'heard.a3.billy',
  'heard.a3.ferrywoman',
  'heard.a3.ferrywoman_night',
  'heard.a3.ford',
  'heard.a3.glover',
  'heard.a3.glover_house',
  'heard.a3.glover_night',
  'heard.a3.greene',
  'heard.a3.hamilton',
  'heard.a3.hamilton_house',
  'heard.a3.marblehead',
  'heard.a3.marblehead_b',
  'heard.a3.maryland',
  'heard.a3.mifflin',
  'heard.a3.militia',
  'heard.a3.putnam',
  'heard.a3.putnam_house',
  'heard.a3.stirling',
  'heard.a3.sullivan',
  'map.a3.flatbush',
  'map.a3.gowanus',
  'map.a3.jamaica',
  'map.a3.new_york',
  'map.a3.stone_house',
  'obs.a3.abatis',
  'obs.a3.beef',
  'obs.a3.bluff',
  'obs.a3.books',
  'obs.a3.burn_asked',
  'obs.a3.chart',
  'obs.a3.colour',
  'obs.a3.concentrated',
  'obs.a3.cordgrass',
  'obs.a3.divided',
  'obs.a3.false_order',
  'obs.a3.fleet',
  'obs.a3.fog',
  'obs.a3.fort',
  'obs.a3.four_chimneys',
  'obs.a3.hale_met',
  'obs.a3.hale_sent',
  'obs.a3.jamaica',
  'obs.a3.jamaica_contradiction',
  'obs.a3.left_behind',
  'obs.a3.line_walked',
  'obs.a3.livingston',
  'obs.a3.loyalist',
  'obs.a3.luck',
  'obs.a3.manifest_read',
  'obs.a3.map',
  'obs.a3.mill_dam',
  'obs.a3.minutes',
  'obs.a3.night_came',
  'obs.a3.oars',
  'obs.a3.order_written',
  'obs.a3.river',
  'obs.a3.shells',
  'obs.a3.shoe',
  'obs.a3.sick',
  'obs.a3.spade',
  'obs.a3.spiked',
  'obs.a3.stage',
  'obs.a3.stone_house',
  'obs.a3.tide',
  'obs.a3.water',
  'obs.a3.weather',
  'obs.a3.went_himself',
  'obs.a3.wind',
  'obs.a3.wind_table',
  'obs.a3.wind_understood',
  'obs.a3.window',
  'obs.a3.works',
  'obs.a3.works_contradiction',
  'obs.a3.flats',
  'obs.a3.greene_contradiction',
  'obs.a3.ropewalk',

  /* --------------------------------------------------------------------
   * ACT 4 — the Delaware and Trenton. APPEND-ONLY.
   * ------------------------------------------------------------------ */
  'doc.a4.cap_plate',
  'doc.a4.crisis',
  'doc.a4.morris',
  'doc.a4.password',
  'doc.a4.rall_note',
  'doc.a4.reenlist',
  'doc.a4.trenton_report',
  'heard.a4.billy',
  'heard.a4.continental_b',
  'heard.a4.glover',
  'heard.a4.hessian',
  'heard.a4.honeyman',
  'heard.a4.knox',
  'heard.a4.knox_after',
  'heard.a4.knox_fight',
  'heard.a4.martin',
  'heard.a4.martin_after',
  'heard.a4.martin_fight',
  'heard.a4.martin_night',
  'heard.a4.ragged',
  'heard.a4.rall',
  'heard.a4.virginia',
  'heard.a4.virginia_fight',
  'heard.a4.young',
  'map.a4.jersey',
  'obs.a4.baggage',
  'obs.a4.barracks',
  'obs.a4.bayonets',
  'obs.a4.bounty_appeal',
  'obs.a4.bounty_pledged',
  'obs.a4.bounty_referred',
  'obs.a4.bounty_settled',
  'obs.a4.bridge',
  'obs.a4.casualties',
  'obs.a4.church',
  'obs.a4.column',
  'obs.a4.cost_contradiction',
  'obs.a4.durham',
  'obs.a4.feet',
  'obs.a4.forming_contradiction',
  'obs.a4.guns_over',
  'obs.a4.guns_street',
  'obs.a4.hessian_guns',
  'obs.a4.hessians_forming',
  'obs.a4.honeyman_contradiction',
  'obs.a4.houses',
  'obs.a4.king_street',
  'obs.a4.knox_contradiction',
  'obs.a4.lanthorns',
  'obs.a4.orchard',
  'obs.a4.paraded',
  'obs.a4.picket_order',
  'obs.a4.plundered',
  'obs.a4.poles',
  'obs.a4.prisoners',
  'obs.a4.quartered',
  'obs.a4.queen_street',
  'obs.a4.ration',
  'obs.a4.running_ice',
  'obs.a4.shelters',
  'obs.a4.silence',
  'obs.a4.sleet',
  'obs.a4.split_force',
  'obs.a4.still_expires',
  'obs.a4.storm',
  'obs.a4.strength',
  'obs.a4.tally',
  'obs.a4.timetable',
  'obs.a4.turned_back',
  'obs.a4.went_on',
  'obs.a4.wet_musket',

  /* --- Act 5: Valley Forge, December 1777 – June 1778 ------------------ */
  'doc.a5.alliance',
  'doc.a5.conway',
  'doc.a5.drill',
  'doc.a5.firecake',
  'doc.a5.naked',
  'doc.a5.pox',
  'doc.a5.saratoga',
  'heard.a5.billy',
  'heard.a5.cochran',
  'heard.a5.conway',
  'heard.a5.dana',
  'heard.a5.greene',
  'heard.a5.hamilton',
  'heard.a5.hamilton_potts',
  'heard.a5.hamilton_potts_m',
  'heard.a5.harrow',
  'heard.a5.hutting',
  'heard.a5.laundress',
  'heard.a5.laundress_may',
  'heard.a5.martin',
  'heard.a5.martin_march',
  'heard.a5.rhodeisland',
  'heard.a5.rhodeisland_may',
  'heard.a5.steuben',
  'heard.a5.steuben_may',
  'heard.a5.waldo',
  'heard.a5.walker',
  'obs.a5.bake',
  'obs.a5.bayonet',
  'obs.a5.beef',
  'obs.a5.brush',
  'obs.a5.clay',
  'obs.a5.cochran_contradiction',
  'obs.a5.committee',
  'obs.a5.conway_contradiction',
  'obs.a5.conway_gone',
  'obs.a5.culper',
  'obs.a5.dead',
  'obs.a5.desertion',
  'obs.a5.discharge',
  'obs.a5.feet',
  'obs.a5.feu',
  'obs.a5.finished',
  'obs.a5.firecake_seen',
  'obs.a5.four_names',
  'obs.a5.green',
  'obs.a5.hospital',
  'obs.a5.house',
  'obs.a5.hut_inside',
  'obs.a5.intervals',
  'obs.a5.lafayette',
  'obs.a5.letter_home',
  'obs.a5.marquee',
  'obs.a5.model',
  'obs.a5.mortality',
  'obs.a5.northern',
  'obs.a5.officers',
  'obs.a5.order',
  'obs.a5.pay',
  'obs.a5.prize',
  'obs.a5.returns',
  'obs.a5.sanitation',
  'obs.a5.still_dying',
  'obs.a5.stumps',
  'obs.a5.town',
  'obs.a5.waldo_contradiction',
  'obs.a5.waldo_diary',
  'obs.a5.cabal_letter',
  'obs.a5.cabal_public',
  'obs.a5.cabal_resign',
  'obs.a5.cabal_settled',
  'obs.a5.cabal_silent',
  'obs.a5.committee_paper',
  'obs.a5.committee_settled',
  'obs.a5.committee_shown',
  'obs.a5.committee_threat',
  'obs.a5.drill_all',
  'obs.a5.drill_model',
  'obs.a5.drill_none',
  'obs.a5.drill_settled',
  'obs.a5.pox_all',
  'obs.a5.pox_none',
  'obs.a5.pox_recruits',
  'obs.a5.pox_settled',
  'obs.a5.temper_loud',
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
