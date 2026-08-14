/**
 * In Washington's Shoes — playable prototype.
 *
 * Scope: one scene, one act, placeholder art. It exists to prove the loop that
 * every act is built from — walk a composed view, examine things, talk, decide,
 * and have the decision register in the world rather than on a scoreboard.
 *
 * What is deliberately real here: the layer stack and parallax, the walk-plane,
 * the wash-mood shader driven by hidden stats, the documents-unlock-options
 * rule, the council chorus with loudness-ordered voices, and the passport save.
 *
 * What is deliberately fake: all art, and everything past scene MV-01.
 */

import { DioramaRenderer } from './renderer';
import { SCENE, type Decision, type NpcThread } from './content';
import { CSS, Overlay, type OptionView } from './ui';
import {
  applyDelta,
  DROP_BELOW,
  initialState,
  loudness,
  moodScalar,
  takeSnapshot,
  type GameState,
} from './state';
import { autosave, encode, loadAutosave } from './passport';
import type { VoiceId } from './palette';

const style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const overlayRoot = document.getElementById('overlay') as HTMLElement;

const renderer = new DioramaRenderer(canvas);
const overlay = new Overlay(overlayRoot, SCENE.title, SCENE.subtitle);

const state: GameState = loadAutosave() ?? initialState();
takeSnapshot(state);

/** Player position along the walk-plane, as a scalar 0..1. */
let t = 0.5;
let held = { left: false, right: false };
let busy = false;
const done = new Set<string>();

const WALK_SPEED = 0.34; // plane-widths per second
const REACH = 0.06;

function nearest(): { kind: 'thing' | 'npc'; id: string; label: string; t: number } | null {
  let best: { kind: 'thing' | 'npc'; id: string; label: string; t: number } | null = null;
  let bestD = REACH;
  for (const it of SCENE.interactables) {
    const d = Math.abs(it.t - t);
    if (d < bestD) {
      bestD = d;
      best = { kind: 'thing', id: it.id, label: it.label, t: it.t };
    }
  }
  for (const n of SCENE.npcs) {
    const d = Math.abs(n.t - t);
    if (d < bestD) {
      bestD = d;
      best = { kind: 'npc', id: n.id, label: 'speak', t: n.t };
    }
  }
  return best;
}

function screenXFor(planeT: number): number {
  return (planeT - 0.5) * innerWidth * 0.86 + innerWidth / 2;
}

function refreshCode(): void {
  overlay.setCode(encode(state));
}

/** Pick 2–4 voices, loudest first, dropping any that are too quiet to speak. */
function councilFor(d: Decision): { id: VoiceId; line: string }[] {
  return d.voices
    .map((id) => ({ id, l: loudness(id, state.stats) }))
    .filter((v) => v.l >= DROP_BELOW)
    .sort((a, b) => b.l - a.l)
    .slice(0, 4)
    .map((v) => ({ id: v.id, line: d.interjections[v.id] ?? '' }))
    .filter((v) => v.line.length > 0);
}

function runDecision(d: Decision, after: () => void): void {
  const options: OptionView[] = d.options.map((o) => ({
    id: o.id,
    text: o.text,
    locked: !!o.requires && !state.knowledge.has(o.requires),
    lockNote: o.lockNote,
  }));

  overlay.showDecision(
    d.speaker,
    d.prompt,
    { seed: d.portraitSeed, coat: d.coat },
    councilFor(d),
    options,
    (id) => {
      const picked = d.options.find((o) => o.id === id)!;
      // Decisions move stats. Documents never do.
      for (const [stat, delta] of Object.entries(picked.effects)) {
        applyDelta(state, stat as keyof GameState['stats'], delta as number);
      }
      state.decisions.set(d.id, id);
      autosave(state);
      refreshCode();
      overlay.close();
      overlay.showExamine('the room', picked.result, () => {
        // The world re-reads the snapshot on the next act boundary. For the
        // prototype we take it immediately so the wash visibly answers.
        takeSnapshot(state);
        busy = false;
        after();
      });
    },
  );
}

function runThread(n: NpcThread): void {
  busy = true;
  let i = 0;
  const step = (): void => {
    if (i < n.lines.length) {
      const line = n.lines[i++];
      overlay.showLine(
        line.speaker,
        line.text,
        { seed: line.portraitSeed, coat: line.coat },
        step,
      );
      return;
    }
    if (n.decision && !state.decisions.has(n.decision.id)) {
      runDecision(n.decision, () => {});
      return;
    }
    busy = false;
  };
  step();
}

function interact(): void {
  if (busy) return;
  const near = nearest();
  if (!near) return;

  if (near.kind === 'npc') {
    const n = SCENE.npcs.find((x) => x.id === near.id)!;
    runThread(n);
    return;
  }

  const it = SCENE.interactables.find((x) => x.id === near.id)!;
  busy = true;
  // Documents unlock options. They never grant stats.
  if (it.grants) state.knowledge.add(it.grants);
  done.add(it.id);
  autosave(state);
  refreshCode();
  overlay.showExamine(it.label, it.examine, () => {
    busy = false;
  });
}

addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') held.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') held.right = true;
  if (!busy && (e.key === 'e' || e.key === 'E' || e.key === ' ')) {
    e.preventDefault();
    interact();
  }
});
addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') held.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') held.right = false;
});

let last = performance.now();
function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (!busy) {
    if (held.left) t -= WALK_SPEED * dt;
    if (held.right) t += WALK_SPEED * dt;
    t = Math.max(0.04, Math.min(0.96, t));
  }

  renderer.setPlayerT(t);
  renderer.setMood(moodScalar(state.snapshot));

  if (!busy) {
    const near = nearest();
    if (near) overlay.showPrompt(near.label, screenXFor(near.t), innerHeight * 0.58);
    else overlay.hidePrompt();
  } else {
    overlay.hidePrompt();
  }

  renderer.render();
  requestAnimationFrame(frame);
}

refreshCode();
requestAnimationFrame(frame);
