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
import { setPlateLight } from './art';
import { FIRST_SCENE, SCENES, ledgerFor, type Decision, type NpcThread, type Scene } from './content';
import { reckon } from './ledger';
import { THEATRES } from './theatre';
import { CSS, mountSheet, Overlay, type OptionView } from './ui';
import { SCENE_ORDER } from './scene-order';
import type { VoiceId } from './palette';
import { councilFor, lockOn, rejoinderFor } from './council';
import { timePasses } from './transition';
import {
  applyDelta,
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
mountSheet();

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

/*
 * Point the key light before the plates are painted, not after: the lighting
 * is baked into the strokes, so it has to be set while they are being laid.
 * The third term is how much of a key there is at all — Cambridge in July is
 * flat overcast (sun y 0.05, no shadow worth the name) and gets a weak one.
 */
const lightFor = (sc: Scene): void =>
  setPlateLight(sc.sun[0], sc.sun[1], sc.sun[1] < 0.1 ? 0.45 : 1);

lightFor(scene);
const renderer = new DioramaRenderer(canvas, scene.plates, actorsFor(scene), propsFor(scene));
renderer.setSun(scene.sun[0], scene.sun[1]);
const headOf = (sc: Scene) => ({ when: sc.when, title: sc.title, purpose: sc.purpose });
const returnOf = (sc: Scene) => ({
  strength: sc.strength,
  noStrength: sc.noStrength,
  expiring: sc.expiring,
});

const overlay = new Overlay(overlayRoot, headOf(scene));
overlay.setReturn(returnOf(scene));

/** Interactables looked at this session, for the journal. */
const seen = new Set<string>();
/** Ambient voices already spoken, so none repeats. */
const heardAmbient = new Set<string>();

/*
 * The interjection budget. Without it, a player who walks the diagonal across a
 * camp collects four interior thoughts in six seconds and the Council reads as
 * a tooltip system rather than as a man thinking.
 */
const AMBIENT_GAP = 40_000; // ms between any two interjections
const VOICE_GAP = 120_000; // ms before the same voice speaks again
const AMBIENT_PER_SCENE = 4;
let lastAmbientAt = -Infinity;
let spokenThisScene = 0;
const lastVoiceAt = new Map<string, number>();

/** Player position on the ground plane. */
const pos: GroundPos = { x: 0.5, z: 0.34 };
const held = { left: false, right: false, up: false, down: false };
let busy = false;

const WALK_X = 0.30; // frame-widths per second
const WALK_Z = 0.22; // depth is slower; it covers less apparent ground
const REACH = 0.085;

/**
 * Walkable bounds. The far edge is derived per scene from the plates — see
 * walkFar() — because it is the nearest solid thing painted across the ground,
 * not a number somebody picked.
 */
const BOUND = { x0: 0.05, x1: 0.95, z0: 0.10, z1: scene.walkTo ?? 0.82 };

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
  // The same three facts as the corner of the screen, in sentences, because a
  // student reading the journal on Thursday has lost the habit of the form.
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
  const strength = count + clock;
  overlay.showJournal(
    { where: scene.where, when: scene.when, objectives: scene.objectives },
    scene.purpose, strength, read, owed(), noticed, doneTasks, () => {
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
  // The interior is a presence, not a broadcast. Four thoughts is a scene's
  // whole ration, and a player who crosses three zones at a run hears one of
  // them and carries the other two as something almost said.
  if (spokenThisScene >= AMBIENT_PER_SCENE) return;
  const now = performance.now();
  if (now - lastAmbientAt < AMBIENT_GAP) return;

  for (const a of scene.ambient) {
    if (heardAmbient.has(a.id)) continue;
    if (groundDist(pos, a) > a.r) continue;

    /*
     * The opportunity is spent on arrival, whether or not anyone speaks.
     *
     * Marking it heard before testing the voices is deliberate: a player who
     * walks past the graves in silence has walked past them, and should not be
     * able to pace back and forth until some part of him is loud enough to
     * comment. The thought that did not come is the readout.
     */
    heardAmbient.add(a.id);

    // The loudest voice authored here that clears the threshold and is not
    // still cooling down, so no one part of him narrates a whole scene by
    // virtue of standing nearest the door.
    let pick: { voice: VoiceId; line: string; l: number } | null = null;
    for (const [voice, line] of Object.entries(a.variants) as [VoiceId, string][]) {
      if (!line) continue;
      if (now - (lastVoiceAt.get(voice) ?? -Infinity) < VOICE_GAP) continue;
      const l = loudness(voice, state.stats);
      if (l < a.minLoudness) continue;
      if (!pick || l > pick.l) pick = { voice, line, l };
    }
    if (!pick) return; // nobody here had it in them today

    overlay.showThought(pick.voice, pick.line);
    const me = renderer.screenPos(pos);
    overlay.setThoughtAnchor(me.x, me.y - 6);
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
      id: o.id,
      label: o.label,
      full: o.full,
      favoured: o.favoured,
      locked: lock.locked,
      lockNote: lock.locked && lock.kind === 'knowledge' ? lock.note : undefined,
      // The voice's own emblem replaces the letter glyph, so the two kinds of
      // lock are told apart at a glance and before either is read.
      lockVoice: lock.locked && lock.kind === 'voice' ? lock.voice : undefined,
    };
  });

  const portrait = { seed: d.portraitSeed, coat: d.coat, id: d.portrait };

  // Beat 1: the council argues. Beat 2: you decide.
  overlay.showCouncil(portrait, voices, rejoinderFor(d, voices, state.stats), () => {
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

  /*
   * The warm-up runs first, before a word is spoken, so that the first decision
   * panel a student ever sees is one where nothing can go wrong. By the time
   * the real question arrives they have already used the interface once.
   *
   * It has to sit BELOW `step`, not above it: `step` is a const arrow function,
   * so calling it from a callback declared earlier in the body is a temporal
   * dead zone error. It threw on the very first playthrough after the result
   * card, which is the one place a student would certainly have hit it.
   */
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

  /*
   * A look-and-name instrument. Re-opens itself after each bearing, so a player
   * sweeping the glass stays in the glass rather than being dropped back onto
   * the parapet between one position and the next.
   */
  if (it.survey) {
    const openGlass = (): void => {
      const rows = it.survey!.map((t) => ({
        id: t.id,
        at: t.at,
        bearing: t.bearing,
        name: t.name,
        done: state.knowledge.has(t.grants),
      }));
      overlay.showSurvey(
        it.label,
        // A still of the frame on screen. Grabbed through snapshot() rather
        // than read off the canvas, because a WebGL buffer is gone by the time
        // any later code could look at it.
        renderer.snapshot(),
        rows,
        (id) => {
          const t = it.survey!.find((v) => v.id === id)!;
          state.knowledge.add(t.grants);
          autosave(state);
          refreshCode();
          overlay.showExamine(t.name, t.text, openGlass);
        },
        () => {
          busy = false;
        },
      );
    };
    openGlass();
    return;
  }

  // The exit reports what is still owed rather than refusing to open. Nothing
  // in this game blocks the player; it only tells them what they are leaving.
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
      if (left.length) {
        busy = false;
        return;
      }
      // Closing the act is a thing that happens ON the way out, not instead of
      // it: the books are shut here and the fade carries him to whatever is
      // next, in that order.
      if (ends !== undefined) {
        closeAct(ends, onward);
        return;
      }
      if (onward) {
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
  // Backtick is the convention, F2 is the one that exists on every keyboard.
  if (e.key === '`' || e.key === '~' || e.key === 'F2') {
    e.preventDefault();
    toggleDevBar();
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
 * Shut the books on an act.
 *
 * The reckoning is assembled from the decision record at the moment it is
 * shown — never accumulated as the act runs — so a player who resumes from a
 * passport code on another machine gets the identical page. That is also why
 * nothing here writes to state: there is nothing to write.
 *
 * An act with no reckoning authored yet is not an error. It walks straight
 * through to the next scene, which is what the last seven acts do today.
 */
function closeAct(act: number, onward: string | undefined): void {
  const done = (): void => {
    if (onward) {
      enterScene(onward);
      return;
    }
    // Nothing is built past here. He stays on the parapet, and the exit will
    // hand him the page again if he wants to read it twice — it is a document,
    // not a results screen, and re-reading a document is allowed.
    busy = false;
  };

  const r = reckon(act, state, ledgerFor);
  if (!r) {
    done();
    return;
  }
  overlay.showReckoning(r, done);
}

/**
 * Move to another composed view.
 *
 * Everything scene-scoped resets: position, what has been looked at, which
 * interior voices have spoken. What persists is the state — the stats, the
 * knowledge, the decisions — which is the whole point of the passport.
 */
function enterScene(id: string): void {
  const from = scene;
  const to = SCENES[id];
  if (to && from !== to && timePasses(from, to)) {
    busy = true;
    overlay.fadeThrough(() => loadScene(id), () => {});
    return;
  }
  loadScene(id);
}

function loadScene(id: string): void {
  scene = SCENES[id];
  state.scene = scene.id;
  state.act = scene.act;
  // A new act reads the world's mood from where the last one left the man.
  takeSnapshot(state);
  autosave(state);

  seen.clear();
  heardAmbient.clear();
  // The budget is per scene, and the cooldowns do not follow him through a door.
  spokenThisScene = 0;
  lastAmbientAt = -Infinity;
  lastVoiceAt.clear();
  speaking = null;
  pos.x = 0.5;
  pos.z = 0.34;
  held.left = held.right = held.up = held.down = false;

  lightFor(scene);
  BOUND.z1 = scene.walkTo ?? 0.82;
  renderer.loadScene(scene.plates, actorsFor(scene), propsFor(scene));
  renderer.setSun(scene.sun[0], scene.sun[1]);
  overlay.setPlate(headOf(scene));
  overlay.setReturn(returnOf(scene));
  refreshCode();
  refreshIntent();

  busy = true;
  openAct(scene.act, () => arrive(scene));
}

/**
 * The arrival card. Where, when, what has happened, what he is here to do.
 */
function arrive(sc: Scene): void {
  busy = true;
  overlay.showOpening(
    {
      where: sc.where,
      when: sc.when,
      situation: sc.situation,
      objectives: sc.objectives,
      opening: sc.opening,
    },
    () => {
      busy = false;
    },
  );
}

/**
 * The theatre map, once per act, before anything else.
 *
 * The ORDER is the argument and it is worth stating: the war, then the errand.
 * A student sees four hundred miles of coast with six marks on it, most of them
 * nothing to do with them and one of them eight weeks old, and only then are
 * they told which hill they are standing on this morning. Reverse those two and
 * the map becomes a decoration on a briefing; in this order the briefing is a
 * detail of the map.
 *
 * Once per act, tracked here rather than in `state`, because it is a thing this
 * session has shown and not a thing the player has done — it has no business in
 * the passport, and a student resuming mid-act should not sit through it twice.
 */
let theatreAct = -1;

function openAct(act: number, then: () => void): void {
  const sheet = THEATRES[act];
  if (theatreAct === act || !sheet) {
    then();
    return;
  }
  theatreAct = act;
  overlay.showTheatre(sheet, then);
}

refreshCode();
refreshIntent();
requestAnimationFrame(frame);

// The map and the arrival card run once per fresh start. A student resuming on
// a new Chromebook next period should not sit through the scene-setting again —
// and marking the act as shown is what stops the map arriving one scene late,
// the first time they cross a threshold inside the act they resumed into.
if (resumed) {
  theatreAct = state.act;
} else {
  busy = true;
  openAct(scene.act, () => arrive(scene));
}


/* ------------------------------------------------------------------ dev bar
 *
 * A scene picker.
 *
 * Reaching Act 2 means settling two threads and walking to the chariot, which
 * is right for a player and unbearable for anybody checking whether a tree
 * looks correct. This jumps straight to any scene.
 *
 * It has a visible handle, and that is the point of this note. The first cut
 * opened on the backtick key and nothing else — no button, no hint, nothing on
 * screen — so the only way to know it existed was to be told, and being told is
 * not a feature. A tool nobody can find is a tool that does not exist. There is
 * a tab in the corner now; the key still works for anyone who prefers it.
 *
 * Deliberately not behind a build flag either. A teacher who finds this has
 * found a way to show a class the camp without playing to it, which is useful
 * rather than dangerous — there is nothing to cheat at in a game with no fail
 * state.
 */
let devBar: HTMLDivElement | null = null;

/** The always-visible handle. Small, quiet, and unmistakably a tool. */
function mountDevTab(): void {
  const tab = document.createElement('button');
  tab.className = 'devtab';
  tab.textContent = 'dev';
  tab.title = 'Jump to any scene (` or F2)';
  tab.onclick = () => toggleDevBar();
  document.body.append(tab);
}

function toggleDevBar(): void {
  if (devBar) {
    devBar.remove();
    devBar = null;
    return;
  }
  devBar = document.createElement('div');
  devBar.className = 'devbar';
  const label = document.createElement('span');
  label.textContent = 'dev · jump to scene';
  devBar.append(label);

  for (const id of SCENE_ORDER) {
    const sc = SCENES[id];
    const b = document.createElement('button');
    b.textContent = `${id} — ${sc ? sc.title : 'not built'}`;
    b.disabled = !sc;
    if (id === scene.id) b.className = 'here';
    b.onclick = () => {
      if (!sc) return;
      toggleDevBar();
      pos.x = 0.5;
      pos.z = 0.34;
      seen.clear();
      heardAmbient.clear();
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

mountDevTab();
