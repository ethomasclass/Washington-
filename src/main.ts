/**
 * The game.
 *
 * Boot, one loop, and the interaction model. Everything else is in `engine/`
 * (which knows nothing about Washington) or `content/` (which knows nothing
 * about WebGL).
 *
 * The loop is deliberately small. Read input, move a man, follow him with a
 * camera, blend the light toward whatever zone he is standing in, find what is
 * in reach, and draw. Every panel that opens is an `await`, so there is no
 * dialogue state machine anywhere in this file.
 */

import * as THREE from 'three';

import { installStyle } from './ui/style';
import { Ui } from './ui/ui';
import {
  applyFog, ActorView, makeRenderer, Rig, CAM_DIST_EXTERIOR, CAM_DIST_INTERIOR,
} from './engine/view';
import { buildMap, TILE, type BuiltMap } from './engine/build';
import { Post, postFor, type PostSettings } from './engine/post';
import { endFrameInput, installInput, readInput } from './engine/input';
import { sfxDoor, sfxExamine, sfxStep, unlockAudio } from './engine/audio';
import { mix, parseHex } from './engine/pixels';
import type { Dir } from './engine/actors';

import { LIGHT, type Light, type VoiceId } from './palette';
import { applyDelta, initialState, loudness, takeSnapshot, type GameState } from './state';
import { encode } from './passport';
import type { Interactable, MapDef, NpcDef, Portal } from './types';

import { ESTATE } from './content/estate';
import { MANSION_GROUND, MANSION_UPPER } from './content/mansion';
import { DOCUMENTS } from './content/documents';
import { portraitOf, WASHINGTON, WASHINGTON_REGIMENTALS } from './content/people';
import { STEP_SOUND } from './content/legend';
import { A1_D4_UNIFORM, DEPARTURE_LINES } from './content/departure';

/* ---------------------------------------------------------------------- *
 * Constants
 * ---------------------------------------------------------------------- */

const MAPS: Record<string, MapDef> = {
  [ESTATE.id]: ESTATE,
  [MANSION_GROUND.id]: MANSION_GROUND,
  [MANSION_UPPER.id]: MANSION_UPPER,
};

const WALK_SPEED = 4.2;
const REACH = 1.9;
/** The player's collision radius. Small: he is a man, not a barrel. */
const BODY = 0.32;

/* ---------------------------------------------------------------------- *
 * Light blending
 * ---------------------------------------------------------------------- */

function lerpLight(a: Light, b: Light, t: number): Light {
  return {
    key: mix(a.key, b.key, t),
    fill: mix(a.fill, b.fill, t),
    haze: mix(a.haze, b.haze, t),
    sun: a.sun + (b.sun - a.sun) * t,
    contrast: a.contrast + (b.contrast - a.contrast) * t,
    bloom: a.bloom + (b.bloom - a.bloom) * t,
    saturation: a.saturation + (b.saturation - a.saturation) * t,
  };
}

/* ---------------------------------------------------------------------- *
 * The game
 * ---------------------------------------------------------------------- */

class Game {
  private renderer: THREE.WebGLRenderer;
  private post: Post;
  private scene = new THREE.Scene();
  private rig: Rig;
  private ui: Ui;
  private state: GameState = initialState();

  private built!: BuiltMap;
  private mapId = '';
  private player!: ActorView;
  private npcViews = new Map<string, ActorView>();

  /** The light we are actually rendering, blended toward the active zone. */
  private light: Light = LIGHT.vernonMorning;
  private targetLight: Light = LIGHT.vernonMorning;
  private targetDist = CAM_DIST_EXTERIOR;
  private postSettings: PostSettings;

  private reachList: Array<Interactable | NpcDef | Portal> = [];
  private reachIdx = 0;
  private stepClock = 0;
  private busy = false;
  private firedAmbient = new Set<string>();
  private firedZones = new Set<string>();
  private lastTime = 0;
  private actOver = false;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = makeRenderer(canvas);
    this.post = new Post(this.renderer);
    this.rig = new Rig(1);
    this.postSettings = postFor(this.light);
    this.ui = new Ui({
      portraitFor: (id) => (id ? portraitOf(id) : null),
      passport: () => encode(this.state),
    });
    document.getElementById('stage')!.append(this.ui.root);
  }

  /* ---------------- map loading -------------------------------------- */

  private clearScene(): void {
    for (const child of [...this.scene.children]) this.scene.remove(child);
    for (const v of this.npcViews.values()) v.dispose();
    this.npcViews.clear();
  }

  loadMap(id: string, at?: [number, number], facing: Dir = 0): void {
    const def = MAPS[id];
    if (!def) throw new Error(`no such map: ${id}`);
    this.clearScene();
    this.mapId = id;
    this.built = buildMap(def);
    this.scene.add(this.built.root);

    this.light = def.light;
    this.targetLight = def.light;
    this.targetDist = def.interior ? CAM_DIST_INTERIOR : CAM_DIST_EXTERIOR;
    this.rig.dist = this.targetDist;
    applyFog(this.scene, this.light, def.interior ? 14 : 34, def.interior ? 46 : 110);
    this.postSettings = postFor(this.light, def.interior ? { vignette: 0.55 } : {});

    // The camera is clamped inside the map, so it never shows the void past
    // the edge — cheaper and more reliable than a skirt of filler tiles.
    const margin = def.interior ? 5 : 9;
    this.rig.bounds = {
      x0: margin, x1: this.built.grid.cols - margin,
      z0: margin, z1: this.built.grid.rows - margin,
    };

    // People.
    for (const n of def.npcs ?? []) {
      const view = new ActorView(`${id}:${n.id}`, n.spec);
      view.face((n.facing ?? 0) as Dir);
      view.place(n.x + 0.5, this.built.grid.heightAt(n.x, n.z), n.z + 0.5);
      view.setLight(this.light);
      this.npcViews.set(n.id, view);
      this.scene.add(view.group);
    }

    // Him.
    const spec = this.state.decisions.get('A1-D4') === 'plain' ? WASHINGTON : WASHINGTON;
    if (!this.player) this.player = new ActorView('player', spec);
    this.scene.add(this.player.group);
    const px = (at?.[0] ?? def.spawn.x) + 0.5;
    const pz = (at?.[1] ?? def.spawn.z) + 0.5;
    this.player.face((at ? facing : (def.spawn.facing ?? 0)) as Dir);
    this.player.place(px, this.built.grid.heightAt(px, pz), pz);
    this.player.setLight(this.light);
    this.rig.snapTo(px, this.player.y, pz);

    this.ui.setPlace(def.title, def.when);
    this.refreshObjectives();
  }

  /** Put him somewhere. Dev only; nothing in the game calls it. */
  warp(x: number, z: number): void {
    this.player.place(x + 0.5, this.built.grid.heightAt(x, z), z + 0.5);
    this.rig.snapTo(this.player.x, this.player.y, this.player.z);
  }

  /** Dev only. What is chasing the player right now, and why. */
  debug(): unknown {
    return {
      pos: [this.player.x, this.player.z],
      busy: this.busy,
      modal: this.ui.modal,
      reach: this.reachList.map((t) => ('label' in t ? t.label : t.name)),
      firedAmbient: [...this.firedAmbient],
    };
  }

  /* ---------------- objectives ---------------------------------------- */

  private refreshObjectives(): void {
    if (this.actOver) { this.ui.setObjectives([]); return; }
    const has = (k: string) => this.state.knowledge.has(k);
    this.ui.setObjectives([
      { text: 'Answer Martha. She asked you a week ago.', done: this.state.decisions.has('A1-D1') },
      { text: 'See Lund about the north end.', done: this.state.decisions.has('A1-D2') },
      { text: 'Give Jenkins something to carry back.', done: this.state.decisions.has('A1-D3') },
      { text: 'Walk down to the landing when you are ready.', done: this.actOver },
      ...(has('doc.a1.fairfax') && !has('heard.a1.harry')
        ? [{ text: 'The lane past the timber goes somewhere.', done: false }]
        : []),
    ]);
  }

  /* ---------------- movement ------------------------------------------ */

  private canStand(x: number, z: number): boolean {
    const g = this.built.grid;
    return !(
      g.blocked(x - BODY, z - BODY) || g.blocked(x + BODY, z - BODY) ||
      g.blocked(x - BODY, z + BODY) || g.blocked(x + BODY, z + BODY)
    );
  }

  private move(dt: number, ax: number, az: number): boolean {
    if (ax === 0 && az === 0) return false;
    const len = Math.hypot(ax, az) || 1;
    const nx = (ax / len) * WALK_SPEED * dt;
    const nz = (az / len) * WALK_SPEED * dt;
    let { x, z } = this.player;
    // Axis-separated, so sliding along a wall works rather than sticking.
    if (this.canStand(x + nx, z)) x += nx;
    if (this.canStand(x, z + nz)) z += nz;
    const y = this.built.grid.heightAt(x, z);
    this.player.place(x, y, z);

    // Facing follows the dominant axis, and prefers to keep the current one
    // on a diagonal so a figure walking north-east does not flicker.
    const cur = this.player.facing;
    if (Math.abs(ax) > Math.abs(az) * 1.15) this.player.face(ax < 0 ? 1 : 2);
    else if (Math.abs(az) > Math.abs(ax) * 1.15) this.player.face(az < 0 ? 3 : 0);
    else if (cur === 0 || cur === 3) this.player.face(az < 0 ? 3 : 0);
    else this.player.face(ax < 0 ? 1 : 2);

    this.stepClock += dt;
    if (this.stepClock > 0.26) {
      this.stepClock = 0;
      const g = this.built.grid;
      const i = g.at(Math.floor(x), Math.floor(z));
      sfxStep(STEP_SOUND[g.tile[i] ?? 'grass'] ?? 'grass');
    }
    return true;
  }

  /* ---------------- what is in reach ----------------------------------- */

  private gatherReach(): void {
    const def = this.built.def;
    const px = this.player.x, pz = this.player.z;
    const near: Array<{ t: Interactable | NpcDef | Portal; d: number }> = [];

    for (const it of def.interactables ?? []) {
      const d = Math.hypot(it.x + 0.5 - px, it.z + 0.5 - pz);
      if (d < REACH) near.push({ t: it, d });
    }
    for (const n of def.npcs ?? []) {
      const d = Math.hypot(n.x + 0.5 - px, n.z + 0.5 - pz);
      if (d < REACH + 0.4) near.push({ t: n, d });
    }
    for (const p of def.portals ?? []) {
      const cx = p.x + (p.w ?? 1) / 2, cz = p.z + (p.d ?? 1) / 2;
      const d = Math.hypot(cx - px, cz - pz);
      if (d < REACH) near.push({ t: p, d });
    }
    near.sort((a, b) => a.d - b.d);
    const list = near.map((n) => n.t);
    // Keep the cursor on whatever it was on, if that is still in reach.
    const held = this.reachList[this.reachIdx];
    this.reachList = list;
    const hi = held ? list.indexOf(held) : -1;
    this.reachIdx = hi >= 0 ? hi : 0;
  }

  private reachLabel(t: Interactable | NpcDef | Portal): string {
    if ('examine' in t) return `look at ${t.label}`;
    if ('lines' in t) return `speak to ${t.name}`;
    return t.label;
  }

  /* ---------------- interaction ---------------------------------------- */

  private async act(): Promise<void> {
    const t = this.reachList[this.reachIdx];
    if (!t) return;
    this.busy = true;
    try {
      if ('examine' in t) await this.examine(t);
      else if ('lines' in t) await this.talk(t);
      else await this.usePortal(t);
    } finally {
      this.busy = false;
      this.refreshObjectives();
    }
  }

  private async examine(it: Interactable): Promise<void> {
    sfxExamine();
    await this.ui.narrate(it.examine);
    if (it.grants) this.state.knowledge.add(it.grants);

    // R3: the contradiction, when the player has the other half of it.
    if (it.contradicts && this.state.knowledge.has(it.contradicts.heard)) {
      await this.ui.narrate(it.contradicts.line);
      if (it.contradicts.grants) this.state.knowledge.add(it.contradicts.grants);
      if (it.contradicts.note) this.ui.toast(it.contradicts.note);
    }

    if (it.document) {
      const doc = DOCUMENTS[it.document];
      if (doc) {
        await this.ui.read(doc);
        if (doc.grants) {
          const fresh = !this.state.knowledge.has(doc.grants);
          this.state.knowledge.add(doc.grants);
          if (fresh) this.ui.toast(`Read: ${doc.title}`);
        }
      }
    }
  }

  private async talk(n: NpcDef): Promise<void> {
    const view = this.npcViews.get(n.id);
    if (view) {
      // Turn to face him. Small, and the first thing anybody notices.
      const dx = this.player.x - view.x, dz = this.player.z - view.z;
      view.face(Math.abs(dx) > Math.abs(dz) ? (dx < 0 ? 1 : 2) : (dz < 0 ? 3 : 0));
    }

    const first = !n.hearFlag || !this.state.knowledge.has(n.hearFlag);

    if (first && n.warmup) await this.runDecision(n.warmup);
    if (first) {
      await this.ui.say(n.lines, n.id);
      if (n.hearFlag) this.state.knowledge.add(n.hearFlag);
      if (n.decision && !this.state.decisions.has(n.decision.id)) await this.runDecision(n.decision);
      if (n.after) await this.ui.say(n.after, n.id);
    } else if (n.decision && !this.state.decisions.has(n.decision.id)) {
      await this.runDecision(n.decision);
      if (n.after) await this.ui.say(n.after, n.id);
    } else {
      await this.ui.say([n.after?.[0] ?? n.lines[n.lines.length - 1]], n.id);
    }
  }

  private async runDecision(d: Parameters<Ui['decide']>[0]): Promise<void> {
    const id = await this.ui.decide(d, this.state);
    const chosen = d.options.find((o) => o.id === id)!;
    this.state.decisions.set(d.id, id);
    for (const [k, v] of Object.entries(chosen.effects)) {
      applyDelta(this.state, k as never, v as number, !!d.sealed);
    }
    await this.ui.narrate(chosen.result);
  }

  private async usePortal(p: Portal): Promise<void> {
    if (p.requires && !this.state.knowledge.has(p.requires)) {
      await this.ui.narrate(p.lockedNote ?? 'Not yet.');
      return;
    }
    sfxDoor();
    await this.ui.fadeOut();
    this.loadMap(p.to, p.at, (p.facing ?? 0) as Dir);
    await this.ui.fadeIn();
    const def = this.built.def;
    if (def.arrival && !this.firedZones.has(`arr:${def.id}`)) {
      this.firedZones.add(`arr:${def.id}`);
      await this.ui.narrate(def.arrival);
    }
  }

  /* ---------------- ambient interior voices ----------------------------- */

  private async checkAmbient(): Promise<void> {
    for (const a of this.built.def.ambient ?? []) {
      if (this.firedAmbient.has(a.id)) continue;
      if (Math.hypot(a.x + 0.5 - this.player.x, a.z + 0.5 - this.player.z) > a.r) continue;
      // Pick the loudest authored voice that clears the floor. If none does,
      // the thought does not arrive, and the silence is the readout.
      const ranked = (Object.keys(a.variants) as VoiceId[])
        .map((v) => ({ v, l: loudness(v, this.state.stats) }))
        .sort((x, y) => y.l - x.l);
      const top = ranked[0];
      if (!top || top.l < (a.minLoudness ?? 0.3)) { this.firedAmbient.add(a.id); continue; }
      this.firedAmbient.add(a.id);
      this.busy = true;
      await this.ui.say([{ speaker: '—', text: a.variants[top.v]! }]);
      this.busy = false;
      return;
    }
  }

  /* ---------------- zones ------------------------------------------------ */

  private async updateZones(dt: number): Promise<void> {
    const def = this.built.def;
    let active: NonNullable<MapDef['zones']>[number] | null = null;
    for (const z of def.zones ?? []) {
      if (
        this.player.x >= z.x && this.player.x < z.x + z.w &&
        this.player.z >= z.z && this.player.z < z.z + z.d
      ) { active = z; break; }
    }
    this.targetLight = active?.light ?? def.light;
    this.targetDist = active?.dist ?? (def.interior ? CAM_DIST_INTERIOR : CAM_DIST_EXTERIOR);

    // Two and a half seconds to cross over, which is about eight paces. Slow
    // enough that nobody sees a switch and fast enough that nobody misses it.
    const k = 1 - Math.exp(-dt * 0.9);
    this.light = lerpLight(this.light, this.targetLight, k);
    this.rig.dist += (this.targetDist - this.rig.dist) * (1 - Math.exp(-dt * 1.2));

    const [r, g, b] = parseHex(this.light.haze);
    (this.scene.fog as THREE.Fog).color.setRGB(r / 255, g / 255, b / 255);
    (this.scene.background as THREE.Color).setRGB(r / 255 * 0.92, g / 255 * 0.92, b / 255 * 0.92);
    this.postSettings.bloom = this.light.bloom;
    this.postSettings.saturation = this.light.saturation;
    this.player.setLight(this.light);
    for (const v of this.npcViews.values()) v.setLight(this.light);

    if (active?.onEnter && !this.firedZones.has(active.id)) {
      this.firedZones.add(active.id);
      this.busy = true;
      await this.ui.narrate(active.onEnter);
      this.busy = false;
    }
  }

  /* ---------------- the letterbook ---------------------------------------- */

  private async openBook(): Promise<void> {
    this.busy = true;
    const docs = Object.values(DOCUMENTS);
    await this.ui.openBook([
      {
        id: 'documents',
        label: 'Documents',
        render: () => {
          const read = docs.filter((d) => d.grants && this.state.knowledge.has(d.grants));
          if (!read.length) return `<h3>Read</h3><div class="empty">Nothing yet. They are lying about the place.</div>`;
          return `<h3>Read &mdash; ${read.length} of ${docs.length}</h3>` +
            read.map((d) => `<div class="row"><span>${d.title}</span><span class="sub">${d.cite}</span></div>`).join('');
        },
      },
      {
        id: 'people',
        label: 'People',
        render: () => {
          const met = [
            ['Martha Washington', 'heard.a1.martha', 'His wife. She ran an estate of her own before this one.'],
            ['Lund Washington', 'heard.a1.lund', 'A cousin, and the man who will hold this place for eight years.'],
            ['Jenkins', 'heard.a1.jenkins', 'Of the Alexandria post. Two days on the road.'],
            ['William Lee', 'heard.a1.billy', 'Enslaved. He goes with you, and he is in every act of this.'],
            ['Frank Lee', 'heard.a1.frank', 'Enslaved. William&rsquo;s brother. He stays.'],
            ['Doll', 'heard.a1.doll', 'Enslaved. Cook at the Mansion House since 1759.'],
            ['Harry', 'heard.a1.harry', 'Enslaved. He worked the Dismal Swamp survey.'],
            ['Simms', 'heard.a1.simms', 'Runs the boat down to the ferry.'],
          ].filter(([, flag]) => this.state.knowledge.has(flag as string));
          if (!met.length) return `<h3>Spoken to</h3><div class="empty">Nobody yet.</div>`;
          return `<h3>Spoken to</h3>` + met
            .map(([n, , s]) => `<div class="row"><span>${n}</span><span class="sub">${s}</span></div>`)
            .join('');
        },
      },
      {
        id: 'decided',
        label: 'Decided',
        render: () => {
          const rows = [...this.state.decisions.entries()];
          if (!rows.length) return `<h3>Settled</h3><div class="empty">Nothing yet.</div>`;
          return `<h3>Settled</h3>` + rows
            .map(([k, v]) => `<div class="row"><span>${k}</span><span class="sub">${v.replace(/_/g, ' ')}</span></div>`)
            .join('');
        },
      },
      {
        id: 'code',
        label: 'Save code',
        render: () =>
          `<h3>Carry this to the next lesson</h3>` +
          `<div class="code">${encode(this.state)}</div>` +
          `<div class="row"><span class="sub">Write it down. It is the whole of your run, and it will '
          + 'fit on the corner of a page.</span></div>`,
      },
    ]);
    this.busy = false;
  }

  /* ---------------- the end of the act ------------------------------------ */

  private async maybeEndAct(): Promise<void> {
    if (this.actOver || this.mapId !== ESTATE.id) return;
    // The wharf. He has to have answered Philadelphia first, or there is
    // nothing to leave for.
    const onWharf = this.player.z < 15 && this.player.x > 34 && this.player.x < 45;
    if (!onWharf) return;
    if (!this.state.decisions.has('A1-D3')) {
      if (!this.firedZones.has('nudge:wharf')) {
        this.firedZones.add('nudge:wharf');
        this.busy = true;
        await this.ui.narrate(
          'Simms has the boat ready and the tide serves at two. There is a man up at the drive who '
          + 'has ridden two days and has not been given anything to carry back.',
        );
        this.busy = false;
      }
      return;
    }
    if (this.state.decisions.has('A1-D4')) return;

    this.busy = true;
    await this.runDecision(A1_D4_UNIFORM);
    const pick = this.state.decisions.get('A1-D4')!;
    if (pick === 'wear_it' || pick === 'wear_and_own_it') {
      this.scene.remove(this.player.group);
      this.player.dispose();
      this.player = new ActorView('player-regimentals', WASHINGTON_REGIMENTALS);
      this.player.place(this.player.x, this.player.y, this.player.z);
      this.scene.add(this.player.group);
      this.player.setLight(this.light);
    }
    await this.ui.narrate(DEPARTURE_LINES[pick] ?? DEPARTURE_LINES.wear_it);
    this.actOver = true;
    takeSnapshot(this.state);
    this.refreshObjectives();
    await this.ui.narrate([
      `Act One is done. Your code is ${encode(this.state)} — write it down; the next lesson starts from it.`,
    ]);
    this.busy = false;
  }

  /* ---------------- the loop ------------------------------------------------ */

  resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.post.resize(w, h);
    this.rig.resize(w / h);
  }

  async start(): Promise<void> {
    installInput();
    window.addEventListener('resize', () => this.resize());
    this.loadMap(ESTATE.id);
    this.resize();
    await this.ui.title();
    unlockAudio();
    await this.ui.narrate(ESTATE.arrival!);
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  private frame(now: number): void {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    const input = readInput();

    if (!this.busy && !this.ui.modal) {
      const moving = this.move(dt, input.ax, input.az);
      this.player.animate(dt, moving);
      this.gatherReach();

      if (input.cycle && this.reachList.length > 1) {
        this.reachIdx = (this.reachIdx + 1) % this.reachList.length;
      }
      if (input.act) void this.act();
      else if (input.cancel || input.menu) void this.openBook();
      else {
        void this.checkAmbient();
        void this.maybeEndAct();
      }

      const t = this.reachList[this.reachIdx];
      this.ui.setReach(t ? this.reachLabel(t) : null, Math.max(0, this.reachList.length - 1));
    } else {
      this.player.animate(dt, false);
      this.ui.setReach(null);
    }

    void this.updateZones(dt);
    this.rig.follow(this.player.x, this.player.y, this.player.z, dt);

    this.renderer.setRenderTarget(this.post.target);
    this.renderer.clear();
    this.renderer.render(this.scene, this.rig.camera);
    this.post.run(this.postSettings);

    endFrameInput();
    requestAnimationFrame((t) => this.frame(t));
  }
}

/* ---------------------------------------------------------------------- *
 * Boot
 * ---------------------------------------------------------------------- */

installStyle();
const stage = document.getElementById('stage') as HTMLDivElement;
const canvas = document.getElementById('view') as HTMLCanvasElement;
if (!stage || !canvas) throw new Error('index.html is missing #stage / #view');

const game = new Game(canvas);
void game.start();

/*
 * The dev handle. `__game.warp(x, z)` and `__game.go('MV-HOUSE-1')` from the
 * console. It is how the walkability of a 76x62 estate gets checked without
 * walking it, and how a teacher jumps to the room they want to show a class.
 */
(window as unknown as { __game: unknown }).__game = {
  go: (id: string, x?: number, z?: number) =>
    game.loadMap(id, x !== undefined && z !== undefined ? [x, z] : undefined),
  warp: (x: number, z: number) => game.warp(x, z),
  debug: () => game.debug(),
};

// The dev jump, kept from the old build because a teacher wants it too.
window.addEventListener('keydown', (e) => {
  if (e.code !== 'F2' && e.code !== 'Backquote') return;
  const order = [ESTATE.id, MANSION_GROUND.id, MANSION_UPPER.id];
  const cur = order.indexOf((game as unknown as { mapId: string }).mapId);
  game.loadMap(order[(cur + 1) % order.length]);
});

export { TILE };
