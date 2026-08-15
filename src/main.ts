/**
 * In Washington's Shoes — playable prototype.
 *
 * Scope: one scene, one act, placeholder art. It exists to prove the loop that
 * every act is built from — walk a composed view, examine things, talk, decide,
 * and have the decision register in the world rather than on a scoreboard.
 *
 * What is deliberately real here: the layer stack and parallax, the walk-plane,
 * the wash-mood shader driven by hidden stats, the documents-unlock-options
 * rule, the two-beat council decision, and the passport save.
 *
 * What is deliberately fake: all art, and everything past scene MV-01.
 */

import { DioramaRenderer, type GroundPos } from './renderer';
import { FIRST_SCENE, SCENES, type Decision, type NpcThread, type Scene } from './content';
import { CSS, Overlay, type OptionView, type VoiceView } from './ui';
import {
  applyDelta,
  DROP_BELOW,
  initialState,
  loudness,
  moodScalar,
  takeSnapshot,
  type GameState,
  type StatId,
} from './state';
import { autosave, encode, loadAutosave } from './passport';

const style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const overlayRoot = document.getElementById('overlay') as HTMLElement;

const resumed = loadAutosave();
const state: GameState = resumed ?? initialState();
takeSnapshot(state);

/** The composed view currently on screen. */
let scene: Scene = SCENES[state.scene] ?? SCENES[FIRST_SCENE];
state.scene = scene.id;

/** Everything the renderer needs to stand a figure up, from the scene data. */
const actorsFor = (sc: Scene) => [
  ...sc.npcs.map((n, i) => ({
    x: n.x,
    z: n.z,
    seed: n.lines[0]?.portraitSeed ?? 200 + i * 97,
    coat: n.look?.coat ?? n.lines[0]?.coat ?? '#6B4F35',
    hat: n.look?.hat,
    build: n.look?.build,
    tall: n.look?.tall,
    gown: n.look?.gown,
    skin: n.look?.skin,
    hair: n.look?.hair,
    facings: n.look?.facings,
    cap: n.look?.cap,
  })),
  // Extras are drawn by the same path as the threads, so they take their size
  // and position from depth for free and cannot drift out of scale.
  ...(sc.extras ?? []),
];

/**
 * Everything with something drawn under it.
 *
 * Interactables and tasks both carry an optional prop; anything that is a view
 * rather than an object leaves it off. The seed is derived from the id so a
 * given kettle looks the same every time the scene loads.
 */
const propsFor = (sc: Scene) =>
  [...sc.interactables, ...sc.tasks]
    .filter((o): o is typeof o & { prop: NonNullable<typeof o.prop> } => Boolean(o.prop))
    .map((o) => ({
      x: o.x,
      z: o.z,
      kind: o.prop,
      seed: [...o.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 9973, 7),
    }));

const renderer = new DioramaRenderer(canvas, scene.plates, actorsFor(scene), propsFor(scene));
renderer.setSun(scene.sun[0], scene.sun[1]);
const overlay = new Overlay(overlayRoot, scene.title, scene.subtitle);

/** Interactables looked at this session, for the journal. */
const seen = new Set<string>();
/** Ambient voices already spoken, so none repeats. */
const heardAmbient = new Set<string>();

/** Player position on the ground plane. */
const pos: GroundPos = { x: 0.5, z: 0.34 };
const held = { left: false, right: false, up: false, down: false };
let busy = false;

const WALK_X = 0.30; // frame-widths per second
const WALK_Z = 0.22; // depth is slower; it covers less apparent ground
const REACH = 0.085;

/** Walkable bounds. Beyond z = 0.82 you would be inside the house. */
const BOUND = { x0: 0.05, x1: 0.95, z0: 0.10, z1: 0.82 };

/**
 * Ground distance. Depth counts for slightly less than width because the
 * walkable area is much wider than it is deep, so a metre "into" the frame
 * reads as a shorter step than a metre across it.
 */
const groundDist = (a: GroundPos, b: GroundPos): number =>
  Math.hypot(a.x - b.x, (a.z - b.z) * 0.75);

interface Target {
  kind: 'thing' | 'npc' | 'task';
  id: string;
  label: string;
  pos: GroundPos;
}

function nearest(): Target | null {
  let best: Target | null = null;
  let bestD = REACH;
  for (const it of scene.interactables) {
    const d = groundDist(pos, it);
    if (d < bestD) {
      bestD = d;
      best = { kind: 'thing', id: it.id, label: it.label, pos: { x: it.x, z: it.z } };
    }
  }
  for (const t of scene.tasks) {
    if (state.knowledge.has(t.grants)) continue; // done; nothing left to do here
    const d = groundDist(pos, t);
    if (d < bestD) {
      bestD = d;
      best = { kind: 'task', id: t.id, label: t.label, pos: { x: t.x, z: t.z } };
    }
  }
  for (const n of scene.npcs) {
    const d = groundDist(pos, n);
    if (d < bestD) {
      bestD = d;
      best = { kind: 'npc', id: n.id, label: `speak to ${n.name}`, pos: { x: n.x, z: n.z } };
    }
  }
  return best;
}

const refreshCode = (): void => overlay.setCode(encode(state));

function anchorSpeech(): void {
  if (!speaking) return;
  const p = renderer.screenPos({ x: speaking.x, z: speaking.z });
  overlay.setSpeechAnchor(p.x, p.y);
}

/** Business still owed. Optional discoveries are deliberately not listed. */
const owed = (): string[] =>
  scene.business.filter((b) => !state.decisions.has(b.decision)).map((b) => b.pending);

function refreshIntent(): void {
  const left = owed();
  if (!left.length) {
    overlay.setIntent(scene.settled);
    return;
  }
  // Sentence-case the first clause, join with "and", end with a full stop.
  const joined = left.length === 1 ? left[0] : `${left[0]}, and ${left[1]}`;
  overlay.setIntent(`${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`);
}

function openJournal(): void {
  busy = true;
  const read = scene.interactables.filter((i) => seen.has(i.id)).map((i) => i.label);
  const noticed = scene.interactables
    .filter((i) => i.contradicts && state.knowledge.has(i.contradicts.grants))
    .map((i) => i.contradicts!.note);
  const doneTasks = scene.tasks
    .filter((t) => state.knowledge.has(t.grants))
    .map((t) => t.note);
  const strength = scene.strength
    ? `Return of ${scene.strength.dated}: ${scene.strength.fit.toLocaleString()} present and ` +
      `fit for duty, of ${scene.strength.onRolls.toLocaleString()} on the rolls.`
    : scene.noStrength;
  overlay.showJournal(scene.purpose, strength, read, owed(), noticed, doneTasks, () => {
    busy = false;
  });
}

/**
 * Interior voices, spoken as he passes. Each fires once, and only if that voice
 * is loud enough to speak — so which thoughts a player hears at all depends on
 * the man they are building.
 */
function checkAmbient(): void {
  if (busy) return;
  for (const a of scene.ambient) {
    if (heardAmbient.has(a.id)) continue;
    if (groundDist(pos, a) > a.r) continue;
    heardAmbient.add(a.id);
    if (loudness(a.voice, state.stats) < a.minLoudness) continue; // too quiet to speak
    overlay.showThought(a.voice, a.line);
    const me = renderer.screenPos(pos);
    overlay.setThoughtAnchor(me.x, me.y - 6);
    return;
  }
}

/**
 * Two to four voices speak, loudest first. A voice too quiet to reach the
 * threshold does not speak at all — that silence is itself a stat readout.
 */
function councilFor(d: Decision): VoiceView[] {
  return d.voices
    .map((id) => ({ id, l: loudness(id, state.stats) }))
    .filter((v) => v.l >= DROP_BELOW)
    .sort((a, b) => b.l - a.l)
    .slice(0, 4)
    .map((v) => ({ id: v.id, line: d.interjections[v.id] ?? '' }))
    .filter((v) => v.line.length > 0);
}

function runDecision(d: Decision, after: () => void): void {
  const voices = councilFor(d);
  const options: OptionView[] = d.options.map((o) => ({
    id: o.id,
    label: o.label,
    full: o.full,
    favoured: o.favoured,
    locked: !!o.requires && !state.knowledge.has(o.requires),
    lockNote: o.lockNote,
  }));

  const portrait = { seed: d.portraitSeed, coat: d.coat };

  // Beat 1: the council argues. Beat 2: you decide.
  overlay.showCouncil(portrait, voices, () => {
    overlay.showDecision(d.speaker, d.prompt, portrait, voices, options, (id) => {
      const picked = d.options.find((o) => o.id === id)!;
      // Decisions move stats. Documents never do.
      for (const [stat, delta] of Object.entries(picked.effects)) {
        applyDelta(state, stat as StatId, delta as number);
      }
      state.decisions.set(d.id, id);
      autosave(state);
      refreshCode();
      overlay.showExamine('the room', picked.result, () => {
        // The world re-reads the snapshot at act boundaries. The prototype
        // takes it immediately so the wash visibly answers the choice.
        takeSnapshot(state);
        refreshIntent();
        busy = false;
        after();
      });
    });
  });
}

/** Where the open speech bubble is pointing, if any. */
let speaking: NpcThread | null = null;

function runThread(n: NpcThread): void {
  busy = true;
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
    // Their claim has now been made, so documents can contradict it.
    if (n.hearFlag) {
      state.knowledge.add(n.hearFlag);
      autosave(state);
      refreshCode();
    }
    if (n.decision && !state.decisions.has(n.decision.id)) {
      // Deliberation is not speech: the council and the choice get the panel,
      // with the portrait, because there is no body on screen to look at.
      speaking = null;
      runDecision(n.decision, () => {});
      return;
    }
    speaking = null;
    busy = false;
  };
  step();
}

function interact(): void {
  if (busy) return;
  const near = nearest();
  if (!near) return;

  if (near.kind === 'npc') {
    runThread(scene.npcs.find((x) => x.id === near.id)!);
    return;
  }

  if (near.kind === 'task') {
    const t = scene.tasks.find((x) => x.id === near.id)!;
    busy = true;
    // Gated tasks say why rather than going quiet — nothing here refuses the
    // player without explaining itself.
    if (t.requires && !state.knowledge.has(t.requires)) {
      overlay.showExamine(t.label, `Not yet — ${t.requiresNote ?? 'not now'}.`, () => {
        busy = false;
      });
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
    overlay.showExamine(t.label, text, () => {
      busy = false;
    });
    return;
  }

  const it = scene.interactables.find((x) => x.id === near.id)!;
  busy = true;
  seen.add(it.id);
  // Documents unlock options. They never grant stats.
  if (it.grants) state.knowledge.add(it.grants);
  autosave(state);
  refreshCode();

  // The exit reports what is still owed rather than refusing to open. Nothing
  // in this game blocks the player; it only tells them what they are leaving.
  if (it.id === scene.exit) {
    const left = owed();
    const onward = scene.exitTo;
    const text = left.length
      ? `${it.examine} But ${left.join(', and ')}.`
      : `${it.examine}\n\n${onward ? scene.exitPrompt : 'Nothing here is unfinished.'}`;
    overlay.showExamine(it.label, text, () => {
      if (onward && !left.length) {
        enterScene(onward);
        return;
      }
      busy = false;
    });
    return;
  }

  // A document that answers back to something a person said. The extra line
  // only appears once the claim has actually been heard — an inconsistency you
  // were not present for is not a discovery.
  let text = it.examine;
  const c = it.contradicts;
  if (c && state.knowledge.has(c.heard)) {
    text = `${text}\n\n${c.line}`;
    state.knowledge.add(c.grants);
    autosave(state);
    refreshCode();
  }

  overlay.showExamine(it.label, text, () => {
    busy = false;
  });
}

const KEYS: Record<string, keyof typeof held> = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
};

addEventListener('keydown', (e) => {
  const k = KEYS[e.key];
  if (k && !busy) {
    held[k] = true;
    e.preventDefault();
  }
  if (!busy && (e.key === 'j' || e.key === 'J')) {
    e.preventDefault();
    openJournal();
    return;
  }
  if (!busy && (e.key === 'e' || e.key === 'E' || e.key === ' ')) {
    e.preventDefault();
    interact();
  }
});
addEventListener('keyup', (e) => {
  const k = KEYS[e.key];
  if (k) held[k] = false;
});
/** A panel stealing focus must not leave the player walking into a wall. */
addEventListener('blur', () => {
  held.left = held.right = held.up = held.down = false;
});

let last = performance.now();
function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (!busy) {
    let dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    let dz = (held.up ? 1 : 0) - (held.down ? 1 : 0);
    if (dx && dz) {
      // Normalise the diagonal so cutting a corner is not the fast route.
      const k = Math.SQRT1_2;
      dx *= k;
      dz *= k;
    }
    const px = pos.x;
    const pz = pos.z;
    pos.x = Math.max(BOUND.x0, Math.min(BOUND.x1, pos.x + dx * WALK_X * dt));
    pos.z = Math.max(BOUND.z0, Math.min(BOUND.z1, pos.z + dz * WALK_Z * dt));
    // Gait is driven by ground actually covered, so walking into a bound stops
    // the legs instead of leaving them running on the spot.
    renderer.setFacing(pos.x - px, pos.z - pz);
    renderer.setGait(Math.hypot(pos.x - px, pos.z - pz), dt);
  } else {
    renderer.setGait(0, dt);
  }

  renderer.setPlayerPos(pos, dt);
  renderer.setMood(moodScalar(state.snapshot));

  const near = busy ? null : nearest();
  if (near) {
    const p = renderer.screenPos(near.pos);
    overlay.showPrompt(near.label, p.x, p.y - 14);
  } else {
    overlay.hidePrompt();
  }

  anchorSpeech();
  if (!busy) checkAmbient();
  const me = renderer.screenPos(pos);
  overlay.setThoughtAnchor(me.x, me.y - 6);
  renderer.render();
  requestAnimationFrame(frame);
}

/**
 * Move to another composed view.
 *
 * Everything scene-scoped resets: position, what has been looked at, which
 * interior voices have spoken. What persists is the state — the stats, the
 * knowledge, the decisions — which is the whole point of the passport.
 */
function enterScene(id: string): void {
  scene = SCENES[id];
  state.scene = scene.id;
  state.act = scene.act;
  // A new act reads the world's mood from where the last one left the man.
  takeSnapshot(state);
  autosave(state);

  seen.clear();
  heardAmbient.clear();
  speaking = null;
  pos.x = 0.5;
  pos.z = 0.34;
  held.left = held.right = held.up = held.down = false;

  renderer.loadScene(scene.plates, actorsFor(scene), propsFor(scene));
  renderer.setSun(scene.sun[0], scene.sun[1]);
  overlay.setPlate(scene.title, scene.subtitle);
  refreshCode();
  refreshIntent();

  busy = true;
  overlay.showOpening(scene.title, scene.subtitle, [...scene.opening, scene.purpose], () => {
    busy = false;
  });
}

refreshCode();
refreshIntent();
requestAnimationFrame(frame);

// The arrival card runs once per fresh start. A student resuming on a new
// Chromebook next period should not sit through the scene-setting again.
if (!resumed) {
  busy = true;
  overlay.showOpening(scene.title, scene.subtitle, [...scene.opening, scene.purpose], () => {
    busy = false;
  });
}
