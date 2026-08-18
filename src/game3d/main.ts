/**
 * In Washington's Shoes — the game, in three dimensions.
 *
 * This is src/main.ts's game loop with the diorama renderer swapped for the
 * first-person environment engine. Everything that IS the game is reused
 * verbatim: the scene content (src/scenes/*), the hidden stats and knowledge
 * flags (state.ts), the Council (council.ts), the passport save (passport.ts),
 * the act reckoning (ledger.ts), and the entire DOM overlay (ui.ts) — the
 * briefing, the Return, the journal, speech, decisions, the theatre map.
 *
 * What changes is the space. The player walks the researched 3D grounds in
 * first person; the authored content anchors to the same STATIONS the 2D
 * staging computed from, mapped scene-by-scene onto world coordinates.
 *
 * CB-02 (the Vassall House parlour) lives INSIDE the Cambridge world: the
 * camp's exit stands in the house's entry hall, so reaching the parlour means
 * walking the lane, finding the house, and stepping in through the door.
 */

import * as THREE from 'three';
import {
  FIRST_SCENE, SCENES, ledgerFor,
  type Decision, type NpcThread, type Scene,
} from '../content';
import { reckon } from '../ledger';
import { THEATRES } from '../theatre';
import { CSS, mountSheet, Overlay, type OptionView } from '../ui';
import { SCENE_ORDER } from '../scene-order';
import type { VoiceId } from '../palette';
import { councilFor, lockOn, rejoinderFor } from '../council';
import {
  applyDelta, initialState, loudness, takeSnapshot,
  type GameState, type StatId,
} from '../state';
import { autosave, encode, loadAutosave } from '../passport';
import { EngravingPass } from '../fp/engraving';
import { FirstPerson } from '../fp/controller';
import { SCENES as ENV_SCENES, buildEnv, type BuiltEnv } from '../env/scene';
import * as E from '../env/vernon-kit';
import { MARKS as VA } from '../env/vassall';

// ---------------------------------------------------------------------------
// CONTENT → WORLD: per-scene station anchors
// ---------------------------------------------------------------------------

interface EnvMapping {
  env: string;                                   // env scene id
  spawn: { x: number; z: number; yaw: number };
  /** World metres per content unit, for spreading a station's members. */
  localScale: number;
  anchors: Record<string, [number, number]>;     // station id → world (x, z)
  /**
   * Where a raised spyglass looks. A survey names things on the still it was
   * raised over, so the still must face the thing being surveyed — the
   * harbour, not whichever hillside the player happened to be watching.
   */
  surveyYaw?: number;
}

const ENV: Record<string, EnvMapping> = {
  'MV-01': {
    env: 'mount-vernon',
    spawn: { x: -26, z: 6, yaw: -1.25 },
    localScale: 30,
    anchors: {
      piazza: [-7, -3],        // the writing table by the west door
      chest: [-6.5, 8],        // the surveyor's chest at the house's south end
      paddock: [-14, 31],      // the paddock rail at the stable
      packing: [5, 14.5],      // the trunk by the scaffolding — the new wing
      lawn: [30, 8],           // the bluff lip over the Potomac
      drive: [-17, 4],         // the chariot on the forecourt drive
    },
  },
  'CB-01': {
    env: 'cambridge',
    spawn: { x: -36, z: 6, yaw: -1.5 },
    localScale: 32,
    anchors: {
      mess: [-8, 12],
      trestle: [6, 2],
      shelters: [-2, 26],
      landing: [46, 8],
      arms: [16, -8.5],
      rhodeisland: [24, -20],
      // The way to headquarters is the house itself: the exit stands in the
      // Vassall house's entry hall, so the player walks the lane, finds the
      // house, and steps in through the door before the act can move on.
      hq: [VA.hall[0], VA.hall[1]],
    },
  },
  'CB-02': {
    env: 'cambridge',   // the parlour IS the camp's world — same Cambridge, indoors
    spawn: { x: VA.hall[0], z: VA.hall[1], yaw: -1.5 }, // in the hall, facing the parlour door
    localScale: 6,      // parlour scale: a room, not a field
    anchors: {
      door: [VA.door[0], VA.door[1]],
      hearth: [VA.hearth[0] - 0.9, VA.hearth[1]],
      maptable: [VA.maptable[0], VA.maptable[1] - 0.4], // the table's near side, so Gates stands clear of it
      secretary: [VA.secretary[0], VA.secretary[1] - 0.9],
      window: [VA.window[0], VA.window[1] + 0.7],
    },
  },
  'CB-03': {
    env: 'lines',
    spawn: { x: -14, z: 12, yaw: -1.35 },
    localScale: 26,
    anchors: {
      traverse: [3, -40],
      parapet: [4.2, -2],
      guard: [2.5, 40],
      work: [-6, 15],
      graves: [-26, 24],
    },
    surveyYaw: -1.3, // out over the Charles toward Charlestown and the harbour
  },
};


// ---------------------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------------------

const style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);
mountSheet();

const canvas = document.getElementById('view') as HTMLCanvasElement;
const overlayRoot = document.getElementById('overlay') as HTMLElement;
const hintEl = document.getElementById('hint') as HTMLElement;

const resumed = loadAutosave();
const state: GameState = resumed ?? initialState();
if (!ENV[state.scene]) state.scene = FIRST_SCENE; // a 2D-only save lands on solid ground
takeSnapshot(state);

let scene: Scene = SCENES[state.scene] ?? SCENES[FIRST_SCENE];
state.scene = scene.id;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
let W = innerWidth, H = innerHeight;
renderer.setSize(W, H, false);

const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 6000);
const fp = new FirstPerson(camera, canvas, [], 100, []);
fp.eyeHeight = 1.7;

const engraving = new EngravingPass(
  renderer, W * renderer.getPixelRatio(), H * renderer.getPixelRatio(), { ink: 0.7, paper: 0 });

addEventListener('resize', () => {
  W = innerWidth; H = innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  engraving.setSize(W * renderer.getPixelRatio(), H * renderer.getPixelRatio());
});

const headOf = (sc: Scene) => ({ when: sc.when, title: sc.title, purpose: sc.purpose });
const returnOf = (sc: Scene) => ({
  strength: sc.strength, noStrength: sc.noStrength, expiring: sc.expiring,
});

const overlay = new Overlay(overlayRoot, headOf(scene));
overlay.setReturn(returnOf(scene));

// ---------------------------------------------------------------------------
// THE WORLD, and the content standing in it
// ---------------------------------------------------------------------------

let env: BuiltEnv | null = null;
/** Game-driven objects (NPC figures), cleared on every scene change. */
let cast = new THREE.Group();
let castAnimators: Array<(t: number, dt: number) => void> = [];

interface Placed { x: number; z: number; }
const placedAt = new Map<string, Placed>();     // content id → world position

function mapping(): EnvMapping { return ENV[scene.id]; }

/** World position for a content item, via its station. */
function worldOf(item: { at?: string; x: number; z: number }): Placed {
  const m = mapping();
  const st = scene.stations?.find((s) => s.id === item.at)
    ?? (scene.stations ?? []).reduce(
      (best: null | { s: { id: string; x: number; z: number }; d: number }, s) => {
        const d = Math.hypot(item.x - s.x, item.z - s.z);
        return !best || d < best.d ? { s, d } : best;
      }, null)?.s;
  if (!st) return { x: 0, z: 0 };
  const a = m.anchors[st.id] ?? [0, 0];
  return {
    x: a[0] + (item.x - st.x) * m.localScale,
    z: a[1] + (item.z - st.z) * m.localScale,
  };
}

function groundY(x: number, z: number): number {
  if (!env) return 0;
  return env.heightOverride?.(x, z, fp.pos.y - fp.eyeHeight) ?? env.height(x, z);
}

/**
 * Push a placement out of collision boxes. NPCs must never stand inside a
 * hut, a table, or an earthwork; items are pushed only out of LARGE boxes
 * (buildings, works) — a letter belongs on the table whose box it sits in.
 */
function declip(p0: Placed, clear: number, minArea = 0): Placed {
  let p = p0;
  for (let pass = 0; pass < 4; pass++) {
    const b = env!.boxes.find((bb) =>
      (bb.maxX - bb.minX) * (bb.maxZ - bb.minZ) >= minArea &&
      p.x > bb.minX - clear && p.x < bb.maxX + clear &&
      p.z > bb.minZ - clear && p.z < bb.maxZ + clear);
    if (!b) return p;
    const exits: Array<[number, Placed]> = [
      [p.x - (b.minX - clear), { x: b.minX - clear, z: p.z }],
      [(b.maxX + clear) - p.x, { x: b.maxX + clear, z: p.z }],
      [p.z - (b.minZ - clear), { x: p.x, z: b.minZ - clear }],
      [(b.maxZ + clear) - p.z, { x: p.x, z: b.maxZ + clear }],
    ];
    exits.sort((a, c) => a[0] - c[0]);
    p = exits[0][1];
  }
  return p;
}

/** Stand the scene's cast up as articulated figures. */
function buildCast(): void {
  if (!env) return;
  cast = new THREE.Group();
  castAnimators = [];
  for (const n of scene.npcs) {
    const p = declip(worldOf(n), 0.5);
    placedAt.set(`npc:${n.id}`, p);
    const look: Partial<import('../types').Look> = n.look ?? {};
    const coat = parseInt((look.coat ?? n.lines[0]?.coat ?? '#6B4F35').replace('#', ''), 16);
    const pr = E.person({
      dress: look.gown ? 'gown' : 'coat',
      color: coat,
      hat: look.gown ? (look.cap ? 'cap' : 'none')
        : look.hat === 'round' ? 'straw' : look.hat === 'none' ? 'none' : 'tricorne',
      pose: 'stand',
      seed: n.lines[0]?.portraitSeed ?? 7,
    });
    // face the spawn, roughly — a person stands to meet you
    const m = mapping();
    pr.group.position.set(p.x, groundY(p.x, p.z), p.z);
    pr.group.rotation.y = Math.atan2(m.spawn.x - p.x, m.spawn.z - p.z);
    cast.add(pr.group);
    castAnimators.push(pr.animate);
  }
  for (const it of [...scene.interactables, ...scene.tasks]) {
    placedAt.set(it.id, declip(worldOf(it), 0.4, 6));
  }
  env.scene.add(cast);
}

// ---------------------------------------------------------------------------
// GAME STATE MACHINERY — ported from src/main.ts
// ---------------------------------------------------------------------------

const seen = new Set<string>();
const heardAmbient = new Set<string>();
const AMBIENT_GAP = 40_000;
const VOICE_GAP = 120_000;
const AMBIENT_PER_SCENE = 4;
let lastAmbientAt = -Infinity;
let spokenThisScene = 0;
const lastVoiceAt = new Map<string, number>();

let busy = false;
let covered = false;
const REACH = 3.4; // metres

const dist2 = (a: Placed, b: Placed): number => Math.hypot(a.x - b.x, a.z - b.z);

interface Target { kind: 'thing' | 'npc' | 'task'; id: string; label: string; pos: Placed; }

function inReach(): Target[] {
  const me = { x: fp.pos.x, z: fp.pos.z };
  const found: { t: Target; d: number }[] = [];
  const add = (t: Target, d: number): void => { if (d < REACH) found.push({ t, d }); };
  for (const it of scene.interactables) {
    const p = placedAt.get(it.id)!;
    add({ kind: 'thing', id: it.id, label: it.label, pos: p }, dist2(me, p));
  }
  for (const t of scene.tasks) {
    if (state.knowledge.has(t.grants)) continue;
    const p = placedAt.get(t.id)!;
    add({ kind: 'task', id: t.id, label: t.label, pos: p }, dist2(me, p));
  }
  for (const n of scene.npcs) {
    const p = placedAt.get(`npc:${n.id}`)!;
    add({ kind: 'npc', id: n.id, label: `speak to ${n.name}`, pos: p }, dist2(me, p));
  }
  found.sort((a, b) => a.d - b.d);
  return found.map((f) => f.t);
}

let picked: string | null = null;
function selected(): Target | null {
  const list = inReach();
  if (list.length === 0) { picked = null; return null; }
  const held = list.find((t) => t.id === picked);
  if (held) return held;
  picked = list[0].id;
  return list[0];
}
function cycle(): void {
  const list = inReach();
  if (list.length < 2) return;
  const i = list.findIndex((t) => t.id === picked);
  picked = list[(i + 1) % list.length].id;
}

const refreshCode = (): void => overlay.setCode(encode(state));

/** Project a world point to CSS pixels for prompts and speech anchors. */
function screenPos(x: number, y: number, z: number): { x: number; y: number } {
  const v = new THREE.Vector3(x, y, z).project(camera);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
}

const owed = (): string[] =>
  scene.business.filter((b) => !state.decisions.has(b.decision)).map((b) => b.pending);

function refreshIntent(): void {
  const left = owed();
  if (!left.length) { overlay.setIntent(scene.settled); return; }
  const joined = left.length === 1 ? left[0] : `${left[0]}, and ${left[1]}`;
  overlay.setIntent(`${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`);
}

/** Panels need the mouse; walking needs the lock. Trade cleanly. */
function enterPanel(): void {
  busy = true;
  document.exitPointerLock();
}

function openJournal(): void {
  enterPanel();
  const read = scene.interactables.filter((i) => seen.has(i.id)).map((i) => i.label);
  const noticed = scene.interactables
    .filter((i) => i.contradicts && state.knowledge.has(i.contradicts.grants))
    .map((i) => i.contradicts!.note);
  const doneTasks = scene.tasks.filter((t) => state.knowledge.has(t.grants)).map((t) => t.note);
  const count = scene.strength
    ? `Return of ${scene.strength.dated}: ${scene.strength.fit.toLocaleString()} present and ` +
      `fit for duty, of ${scene.strength.onRolls.toLocaleString()} on the rolls.`
    : scene.noStrength;
  const clock = scene.expiring
    ? ` The contracts of ${
        scene.expiring.count === undefined
          ? scene.expiring.who
          : `${scene.expiring.count.toLocaleString()} ${scene.expiring.who}`
      } end on ${scene.expiring.date}. After that they may lawfully go home.`
    : '';
  overlay.showJournal(
    { where: scene.where, when: scene.when, objectives: scene.objectives },
    scene.purpose, count + clock, read, owed(), noticed, doneTasks, () => { busy = false; });
}

function checkAmbient(): void {
  if (busy) return;
  if (spokenThisScene >= AMBIENT_PER_SCENE) return;
  const now = performance.now();
  if (now - lastAmbientAt < AMBIENT_GAP) return;
  const m = mapping();
  const me = { x: fp.pos.x, z: fp.pos.z };
  for (const a of scene.ambient) {
    if (heardAmbient.has(a.id)) continue;
    const p = worldOf(a);
    if (dist2(me, p) > a.r * m.localScale) continue;
    heardAmbient.add(a.id);
    let pick: { voice: VoiceId; line: string; l: number } | null = null;
    for (const [voice, line] of Object.entries(a.variants) as [VoiceId, string][]) {
      if (!line) continue;
      if (now - (lastVoiceAt.get(voice) ?? -Infinity) < VOICE_GAP) continue;
      const l = loudness(voice, state.stats);
      if (l < a.minLoudness) continue;
      if (!pick || l > pick.l) pick = { voice, line, l };
    }
    if (!pick) return;
    overlay.showThought(pick.voice, pick.line);
    overlay.setThoughtAnchor(W / 2, H * 0.72);
    lastAmbientAt = now;
    lastVoiceAt.set(pick.voice, now);
    spokenThisScene++;
    return;
  }
}

function runDecision(d: Decision, after: () => void): void {
  const voices = councilFor(d, state.stats);
  const options: OptionView[] = d.options.map((o) => {
    const lock = lockOn(o, state.stats, state.knowledge);
    return {
      id: o.id, label: o.label, full: o.full, favoured: o.favoured,
      locked: lock.locked,
      lockNote: lock.locked && lock.kind === 'knowledge' ? lock.note : undefined,
      lockVoice: lock.locked && lock.kind === 'voice' ? lock.voice : undefined,
    };
  });
  const portrait = { seed: d.portraitSeed, coat: d.coat, id: d.portrait };
  overlay.showCouncil(portrait, voices, rejoinderFor(d, voices, state.stats), () => {
    overlay.showDecision(d.speaker, d.prompt, portrait, voices, options, (id) => {
      const chosen = d.options.find((o) => o.id === id)!;
      for (const [stat, delta] of Object.entries(chosen.effects)) {
        applyDelta(state, stat as StatId, delta as number);
      }
      state.decisions.set(d.id, id);
      autosave(state);
      refreshCode();
      overlay.showExamine('the room', chosen.result, () => {
        takeSnapshot(state);
        refreshIntent();
        busy = false;
        after();
      });
    });
  });
}

let speaking: NpcThread | null = null;

function anchorSpeech(): void {
  if (!speaking) return;
  const p = placedAt.get(`npc:${speaking.id}`)!;
  const s = screenPos(p.x, groundY(p.x, p.z) + 1.95, p.z);
  overlay.setSpeechAnchor(s.x, s.y);
}

function runThread(n: NpcThread): void {
  enterPanel();
  speaking = n;
  const settled = !!n.decision && state.decisions.has(n.decision.id);
  const lines = settled ? (n.after ?? []) : n.lines;
  let i = 0;
  const step = (): void => {
    if (i < lines.length) {
      const line = lines[i++];
      overlay.showSpeech(line.speaker, line.text, step);
      anchorSpeech();
      return;
    }
    if (n.hearFlag) {
      state.knowledge.add(n.hearFlag);
      autosave(state);
      refreshCode();
    }
    if (n.decision && !state.decisions.has(n.decision.id)) {
      speaking = null;
      runDecision(n.decision, () => {});
      return;
    }
    speaking = null;
    busy = false;
  };
  if (n.warmup && !state.decisions.has(n.warmup.id)) {
    speaking = null;
    runDecision(n.warmup, () => {
      busy = true;
      speaking = n;
      step();
    });
    return;
  }
  step();
}

/** A still of the 3D frame, for the spyglass panorama. */
function snapshot(): HTMLCanvasElement {
  if (env) engraving.render(env.scene, camera);
  const c = document.createElement('canvas');
  c.width = renderer.domElement.width;
  c.height = renderer.domElement.height;
  c.getContext('2d')!.drawImage(renderer.domElement, 0, 0);
  return c;
}

function interact(): void {
  if (busy) return;
  const near = selected();
  if (!near) return;

  if (near.kind === 'npc') {
    runThread(scene.npcs.find((x) => x.id === near.id)!);
    return;
  }

  if (near.kind === 'task') {
    const t = scene.tasks.find((x) => x.id === near.id)!;
    enterPanel();
    if (t.requires && !state.knowledge.has(t.requires)) {
      overlay.showExamine(t.label, `Not yet — ${t.requiresNote ?? 'not now'}.`, () => { busy = false; });
      return;
    }
    state.knowledge.add(t.grants);
    let text = t.done;
    if (scene.tasks.every((x) => state.knowledge.has(x.grants))) {
      state.knowledge.add(scene.allTasksFlag);
      text += '\n\nThat is the last of it. The place is in order, and there is nothing ' +
        'left to do here but go.';
    }
    autosave(state);
    refreshCode();
    overlay.showExamine(t.label, text, () => { busy = false; });
    return;
  }

  const it = scene.interactables.find((x) => x.id === near.id)!;
  enterPanel();
  seen.add(it.id);
  if (it.grants) state.knowledge.add(it.grants);
  autosave(state);
  refreshCode();

  if (it.survey) {
    const sy = mapping().surveyYaw;
    if (sy !== undefined) { fp.yaw = sy; fp.pitch = 0.01; fp.update(0, groundY); }
    const openGlass = (): void => {
      const rows = it.survey!.map((t) => ({
        id: t.id, at: t.at, y: t.y ?? 0.3, bearing: t.bearing, name: t.name,
        done: state.knowledge.has(t.grants),
      }));
      overlay.showSurvey(it.label, snapshot(), rows, (id) => {
        const t = it.survey!.find((v) => v.id === id)!;
        state.knowledge.add(t.grants);
        autosave(state);
        refreshCode();
        overlay.showExamine(t.name, t.text, openGlass);
      }, () => { busy = false; });
    };
    openGlass();
    return;
  }

  if (it.id === scene.exit) {
    const left = owed();
    const onward = scene.exitTo;
    const ends = scene.endsAct;
    const text = left.length
      ? `${it.examine} But ${left.join(', and ')}.`
      : `${it.examine}\n\n${
          onward || ends !== undefined ? scene.exitPrompt : 'Nothing here is unfinished.'
        }`;
    overlay.showExamine(it.label, text, () => {
      if (left.length) { busy = false; return; }
      if (ends !== undefined) { closeAct(ends, onward); return; }
      if (onward) { enterScene(onward); return; }
      busy = false;
    });
    return;
  }

  let text = it.examine;
  const c = it.contradicts;
  if (c && state.knowledge.has(c.heard)) {
    text = `${text}\n\n${c.line}`;
    state.knowledge.add(c.grants);
    autosave(state);
    refreshCode();
  }
  overlay.showExamine(it.label, text, () => { busy = false; });
}

// ---------------------------------------------------------------------------
// SCENE FLOW
// ---------------------------------------------------------------------------

function closeAct(act: number, onward: string | undefined): void {
  const done = (): void => {
    if (onward) { enterScene(onward); return; }
    busy = false;
  };
  const r = reckon(act, state, ledgerFor);
  if (!r) { done(); return; }
  overlay.showReckoning(r, done);
}

function enterScene(id: string): void {
  const to = SCENES[id];
  if (!to || !ENV[id]) { busy = false; return; }
  busy = true;
  overlay.fadeThrough(() => loadScene(id), () => {});
}

function loadScene(id: string): void {
  scene = SCENES[id];
  state.scene = scene.id;
  state.act = scene.act;
  takeSnapshot(state);
  autosave(state);

  seen.clear();
  heardAmbient.clear();
  spokenThisScene = 0;
  lastAmbientAt = -Infinity;
  lastVoiceAt.clear();
  speaking = null;
  picked = null;
  placedAt.clear();

  const m = mapping();
  const def = ENV_SCENES[m.env];
  env = buildEnv(def, def.defaultWeather);
  fp.setWorld(env.bounds, env.boxes, []);
  fp.setPose(m.spawn.x, m.spawn.z, m.spawn.yaw);
  buildCast();

  overlay.setPlate(headOf(scene));
  overlay.setReturn(returnOf(scene));
  refreshCode();
  refreshIntent();

  busy = true;
  openAct(scene.act, () => arrive(scene));
}

function arrive(sc: Scene): void {
  enterPanel();
  overlay.showOpening(
    { where: sc.where, when: sc.when, situation: sc.situation,
      objectives: sc.objectives, opening: sc.opening },
    () => { busy = false; },
  );
}

let theatreAct = -1;
function openAct(act: number, then: () => void): void {
  const sheet = THEATRES[act];
  if (theatreAct === act || !sheet) { then(); return; }
  const prev = theatreAct >= 0 ? THEATRES[theatreAct] : undefined;
  theatreAct = act;
  covered = true;
  document.exitPointerLock();
  overlay.showTheatre(sheet, prev, () => {
    covered = false;
    then();
  });
}

// ---------------------------------------------------------------------------
// INPUT & FRAME
// ---------------------------------------------------------------------------

addEventListener('keydown', (e) => {
  if (!busy && (e.key === 'j' || e.key === 'J')) { e.preventDefault(); openJournal(); return; }
  if (!busy && (e.key === 'e' || e.key === 'E')) { e.preventDefault(); interact(); return; }
  if (!busy && e.key === 'Tab') { e.preventDefault(); cycle(); return; }
  if (e.key === '`' || e.key === '~' || e.key === 'F2') { e.preventDefault(); toggleDevBar(); }
});

let last = performance.now();
function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (env) {
    if (!busy) fp.update(dt, groundY);
    env.update(dt, camera, now * 0.001);
    const t = now * 0.001;
    for (const fn of castAnimators) fn(t, dt);

    const near = busy ? null : selected();
    if (near) {
      const s = screenPos(near.pos.x, groundY(near.pos.x, near.pos.z) + 1.4, near.pos.z);
      const list = inReach();
      const i = list.findIndex((x) => x.id === near.id);
      overlay.showPrompt(
        list.length > 1 ? `${near.label}  ·  Tab ${i + 1}/${list.length}` : near.label,
        s.x, s.y);
    } else {
      overlay.hidePrompt();
    }
    anchorSpeech();
    if (!busy) checkAmbient();
    overlay.setThoughtAnchor(W / 2, H * 0.72);

    hintEl.style.opacity = !busy && !fp.isLocked ? '1' : '0';
    if (!covered) engraving.render(env.scene, camera);
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------------------
// DEV BAR — jump to any 3D-mapped scene
// ---------------------------------------------------------------------------

let devBar: HTMLDivElement | null = null;
function mountDevTab(): void {
  const tab = document.createElement('button');
  tab.className = 'devtab';
  tab.textContent = 'dev';
  tab.title = 'Jump to any scene (` or F2)';
  tab.onclick = () => toggleDevBar();
  document.body.append(tab);
}
function toggleDevBar(): void {
  if (devBar) { devBar.remove(); devBar = null; return; }
  devBar = document.createElement('div');
  devBar.className = 'devbar';
  const label = document.createElement('span');
  label.textContent = 'dev · jump to scene (3D)';
  devBar.append(label);
  for (const id of SCENE_ORDER) {
    const sc = SCENES[id];
    const b = document.createElement('button');
    const has3d = !!ENV[id];
    b.textContent = `${id} — ${sc ? sc.title : 'not built'}${sc && !has3d ? ' (2D only)' : ''}`;
    b.disabled = !sc || !has3d;
    if (id === scene.id) b.className = 'here';
    b.onclick = () => {
      if (!sc || !has3d) return;
      toggleDevBar();
      enterScene(id);
    };
    devBar.append(b);
  }
  const note = document.createElement('span');
  note.className = 'note';
  note.textContent = '` or F2 to close · stats and flags are kept';
  devBar.append(note);
  document.body.append(devBar);
}

// ---------------------------------------------------------------------------

if (resumed) theatreAct = state.act; // a returning player has seen this act's map
loadScene(scene.id);

// Scripted vantage for headless verification: ?px=&pz=&yaw= drops the player
// at a spot after boot. Harmless in play — no UI mentions it.
{
  const q = new URLSearchParams(location.search);
  if (q.has('px') && q.has('pz')) {
    fp.setPose(Number(q.get('px')), Number(q.get('pz')), Number(q.get('yaw') ?? 0));
  }
}
// Debug handle for the headless probes; nothing in the game reads it.
(window as unknown as Record<string, unknown>).__g3d =
  { placedAt, fp, THREE, camera, get env() { return env; } };
refreshCode();
refreshIntent();
mountDevTab();
requestAnimationFrame(frame);
