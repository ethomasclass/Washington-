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
import { CAMBRIDGE_SUMMER, CAMBRIDGE_WINTER } from './content/cambridge';
import { HQ_AUTUMN, HQ_UP_AUTUMN, HQ_UP_WINTER, HQ_WINTER } from './content/vassall';
import { ACT2_DECISIONS } from './content/act2-decisions';
import { ACT3_DECISIONS } from './content/act3-decisions';
import { BK_LINES, BK_FERRY, BK_FERRY_NIGHT } from './content/brooklyn';
import { FOUR_CHIMNEYS } from './content/four-chimneys';
import { SurveySheet, type SurveyResult } from './ui/survey';
import { WindTable } from './ui/windtable';
import { Travel } from './ui/travel';
import { SurveyOverlay } from './engine/overlay';
import { isDown } from './engine/input';
import { reckon, type LedgerLine } from './ledger';

/* ---------------------------------------------------------------------- *
 * Constants
 * ---------------------------------------------------------------------- */

const MAPS: Record<string, MapDef> = {
  [ESTATE.id]: ESTATE,
  [MANSION_GROUND.id]: MANSION_GROUND,
  [MANSION_UPPER.id]: MANSION_UPPER,
  [CAMBRIDGE_SUMMER.id]: CAMBRIDGE_SUMMER,
  [CAMBRIDGE_WINTER.id]: CAMBRIDGE_WINTER,
  [HQ_AUTUMN.id]: HQ_AUTUMN,
  [HQ_WINTER.id]: HQ_WINTER,
  [HQ_UP_AUTUMN.id]: HQ_UP_AUTUMN,
  [HQ_UP_WINTER.id]: HQ_UP_WINTER,
  [BK_LINES.id]: BK_LINES,
  [BK_FERRY.id]: BK_FERRY,
  [BK_FERRY_NIGHT.id]: BK_FERRY_NIGHT,
  [FOUR_CHIMNEYS.id]: FOUR_CHIMNEYS,
};

/**
 * Which act a map belongs to. Drives the objective rail and the act break,
 * and it is a lookup rather than a field on `MapDef` because a map does not
 * need to know what act it is in — the game does.
 */
const MAP_ACT: Record<string, number> = {
  [ESTATE.id]: 1, [MANSION_GROUND.id]: 1, [MANSION_UPPER.id]: 1,
  [CAMBRIDGE_SUMMER.id]: 2, [HQ_AUTUMN.id]: 2, [HQ_UP_AUTUMN.id]: 2,
  [CAMBRIDGE_WINTER.id]: 2, [HQ_WINTER.id]: 2, [HQ_UP_WINTER.id]: 2,
  [BK_LINES.id]: 3, [BK_FERRY.id]: 3, [BK_FERRY_NIGHT.id]: 3, [FOUR_CHIMNEYS.id]: 3,
};

/**
 * The ledger's earned lines, looked up from the decision record.
 *
 * `ledger.ts` recomputes the reckoning from scratch every time rather than
 * accumulating it, so this has to be a pure function of (decision, option)
 * and nothing else. It is: every line is authored on the option that causes
 * it, in `act2-decisions.ts`.
 */
const EARNED = new Map<string, LedgerLine[]>();
for (const d of [...ACT2_DECISIONS, ...ACT3_DECISIONS]) {
  for (const o of d.options) if (o.ledger) EARNED.set(`${d.id}/${o.id}`, o.ledger);
}

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
    // Undefined means 1: a light that has never thought about exposure is a
    // daylight, and a daylight is exposed as lit.
    exposure: (a.exposure ?? 1) + ((b.exposure ?? 1) - (a.exposure ?? 1)) * t,
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

  /** The map table's four decisions, once they have been settled. */
  private survey: SurveySheet;
  private surveyResult: SurveyResult | null = null;
  /** The East River, and the wind that saved the army. */
  private windTable: WindTable;
  /** The held-key survey of the ground. Never takes the keyboard. */
  private overlay: SurveyOverlay;
  /** F1. The build jump, and the one a teacher wants too. */
  private travel: Travel;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = makeRenderer(canvas);
    this.post = new Post(this.renderer);
    this.rig = new Rig(1);
    this.postSettings = postFor(this.light);
    this.ui = new Ui({
      portraitFor: (id) => (id ? portraitOf(id) : null),
      passport: () => encode(this.state),
    });
    this.survey = new SurveySheet();
    this.windTable = new WindTable();
    this.overlay = new SurveyOverlay();
    this.travel = new Travel();
    const stage = document.getElementById('stage')!;
    stage.append(
      this.ui.root, this.survey.root, this.windTable.root,
      this.overlay.root, this.travel.root,
    );

    /*
     * F1, from anywhere, including out of a conversation.
     *
     * Its own listener rather than a branch in the frame loop, for two
     * reasons. `readInput()` only surfaces the handful of codes the game
     * itself binds, and adding F1 to that set would make it a game key. And
     * a panel that opens only when the loop is idle is useless precisely
     * when you want it — mid-dialogue, looking at a room, wanting to be in
     * a different room.
     *
     * The panel takes the keyboard from the moment it opens, so nothing it
     * consumes reaches the world. `this.busy` is held across the await for
     * the same reason: without it the frame after the panel closes reads a
     * stale Space and interacts with whatever the player has just landed
     * beside.
     */
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'F1' || this.travel.open) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      void this.openTravel();
    }, true);
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
    applyFog(
      this.scene, this.light,
      def.fogNear ?? (def.interior ? 14 : 34),
      def.fogFar ?? (def.interior ? 46 : 110),
    );
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

  /**
   * The travel panel: pick a place, go and stand in it.
   *
   * No fade and no arrival narration. This is not a journey the player has
   * made, it is the camera being moved by whoever is building or teaching
   * the thing, and dressing it as travel would put two seconds of curtain
   * between every look at a room and the next one.
   */
  private async openTravel(): Promise<void> {
    const wasBusy = this.busy;
    this.busy = true;
    this.overlay.setVisible(false);
    try {
      const dest = await this.travel.choose(this.mapId);
      if (!dest) return;
      this.loadMap(dest.map, dest.at, (dest.facing ?? 0) as Dir);
      this.ui.toast(`Travelled: ${dest.label}`);
    } finally {
      this.busy = wasBusy;
      this.refreshObjectives();
    }
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
      reachIdx: this.reachIdx,
      firedAmbient: [...this.firedAmbient],
    };
  }

  /* ---------------- objectives ---------------------------------------- */

  private refreshObjectives(): void {
    if (this.actOver) { this.ui.setObjectives([]); return; }
    const has = (k: string) => this.state.knowledge.has(k);
    const done = (d: string) => this.state.decisions.has(d);

    if (MAP_ACT[this.mapId] === 2) {
      /*
       * ACT 2's RAIL, AND WHY IT IS NOT A CHECKLIST OF FOUR DECISIONS.
       *
       * The winter half of this act deliberately does not tell the player
       * that anything is coming: they walk out of a council of war into
       * December and the objectives change under them, which is as near as
       * an interface can get to how the winter of 1775 actually arrived.
       */
      const winter = has('obs.a2.winter_came');
      this.ui.setObjectives(
        winter
          ? [
            { text: 'Answer Reed. The order of 12 November is still standing.', done: done('A2-D3') },
            { text: 'Give Sergeant Starr an answer. Eleven hundred wait on it.', done: done('A2-D4') },
            { text: 'Walk the parapet on the first of January.', done: this.actOver },
            ...(has('obs.a2.knox_gone') && !has('doc.a2.knox')
              ? [{ text: 'There has been no word from Knox in eighteen days.', done: false }]
              : []),
          ]
          : [
            { text: 'Tell Greene what is in the magazine, or do not.', done: done('A2-D1') },
            { text: 'Put the assault to the council of war.', done: done('A2-D2') },
            { text: 'Settle the train of artillery at the map table.', done: !!this.surveyResult },
            ...(has('obs.a2.spyglass') && !has('map.a2.shipping')
              ? [{ text: 'Hold SHIFT on the parapet and name what is over there.', done: false }]
              : []),
          ],
        winter ? 'Eleven days' : 'This summer',
      );
      return;
    }

    if (MAP_ACT[this.mapId] === 3) {
      /*
       * ACT 3's RAIL, AND WHAT IT DOES NOT SAY.
       *
       * It never mentions holding the position, winning, or preventing
       * anything, because none of those was available. It lists three things
       * to settle and one place to walk to, and the act ends in a defeat on
       * every branch. The rail is the first place a student would look for a
       * promise the game is not making, so it does not make one.
       */
      const night = has('obs.a3.night_came');
      this.ui.setObjectives(
        night
          ? [
            { text: 'Get them off. Every one of them, before it is light.', done: this.actOver },
            { text: 'Answer Hamilton about Knowlton&rsquo;s volunteer.', done: done('A3-D3') },
            ...(has('obs.a3.manifest_read')
              ? []
              : [{ text: 'The manifest is on a barrel head at the stage.', done: false }]),
          ]
          : [
            { text: 'Tell Stirling where to put his brigade.', done: done('A3-D1') },
            { text: 'Walk the line to the end of it.', done: has('obs.a3.line_walked') },
            { text: 'Settle the covering party with Mifflin.', done: done('A3-D2') },
            ...(has('obs.a3.map') && !has('obs.a3.wind_understood')
              ? [{ text: 'Turn the wind on the drum-head chart.', done: false }]
              : []),
          ],
        night ? 'Before it is light' : 'The twenty-sixth',
      );
      return;
    }

    this.ui.setObjectives([
      { text: 'Answer Martha. She asked you a week ago.', done: done('A1-D1') },
      { text: 'See Lund about the north end.', done: done('A1-D2') },
      { text: 'Give Jenkins something to carry back.', done: done('A1-D3') },
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

    if (it.opens === 'survey') await this.openSurvey();
    if (it.opens === 'wind') await this.openWind();
  }

  /**
   * The East River, and the wind.
   *
   * Unlike the Knox table this one settles nothing and can be opened as often
   * as the player likes — it is an instrument, not a decision. What it does
   * is record that they turned the arrow far enough to see a wind that opens
   * the river, because a student who has seen the south-west case has
   * understood the whole of why the army got off Long Island, and one option
   * at Four Chimneys is written for somebody who has.
   */
  private async openWind(): Promise<void> {
    const r = await this.windTable.run();
    this.state.knowledge.add('obs.a3.wind_table');
    if (r.sawTheRisk) {
      const fresh = !this.state.knowledge.has('obs.a3.wind_understood');
      this.state.knowledge.add('obs.a3.wind_understood');
      if (fresh) this.ui.toast('A south-west wind puts them past the ferry on one tide');
    }
  }

  /**
   * The map table.
   *
   * Four decisions and five dispatches, and then it is settled and it stays
   * settled: coming back to the table shows you the account of what came in,
   * and does not let you have another go. The whole point of the sequence is
   * that a supply decision is made once, in the dark, and answered eight
   * weeks later by a rider.
   */
  private async openSurvey(): Promise<void> {
    if (this.surveyResult) {
      await this.survey.replay(this.surveyResult);
      return;
    }
    const r = await this.survey.run(this.state.knowledge);
    this.surveyResult = r;
    this.state.decisions.set('A2-KNOX', r.id);
    this.state.knowledge.add('obs.a2.knox_train');
    if (r.guns === 59) this.state.knowledge.add('obs.a2.noble_train');
    this.ui.toast(`The train: ${r.guns} pieces, ${r.daysLate === 0 ? 'on time' : `${r.daysLate} days late`}`);
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
    // A decision may tell the WORLD what was settled. It may never tell
    // another decision — see the note on `grants` in types.ts, and the
    // linter assertion that enforces it.
    for (const f of chosen.grants ?? []) this.state.knowledge.add(f);
    await this.ui.narrate(chosen.result);
  }

  private async usePortal(p: Portal): Promise<void> {
    if (p.requires && !this.state.knowledge.has(p.requires)) {
      await this.ui.narrate(p.lockedNote ?? 'Not yet.');
      return;
    }
    sfxDoor();
    await this.ui.fadeOut();
    // One door, two seasons. You go in at this one in the autumn and the
    // council of war settles what the army is going to do about Boston; you
    // come out of it into December, and nothing announces it.
    const alt = p.alt && this.state.knowledge.has(p.alt.requires) ? p.alt : null;
    this.loadMap(alt?.to ?? p.to, alt?.at ?? p.at, (p.facing ?? 0) as Dir);
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
    const e = this.light.exposure ?? 1;
    this.postSettings.gain = [e, e * 1.01, e * 1.09];
    this.player.setLight(this.light);
    for (const v of this.npcViews.values()) v.setLight(this.light);

    if (active && (active.notice || active.onEnter) && !this.firedZones.has(active.id)) {
      this.firedZones.add(active.id);
      this.busy = true;
      // The notice first, and on its own. It is the game speaking as itself;
      // the narration after it is Washington again, and the student has to be
      // able to tell those two apart or the notice has failed.
      if (active.notice) await this.ui.notice(active.notice);
      if (active.onEnter) await this.ui.narrate(active.onEnter);
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
            // --- Act 2 -------------------------------------------------
            ['Nathanael Greene', 'heard.a2.greene', 'Rhode Island. A foundryman&rsquo;s son who learned war out of books.'],
            ['Henry Knox', 'heard.a2.knox', 'A Boston bookseller of twenty-five who proposes to fetch the guns.'],
            ['Horatio Gates', 'heard.a2.gates', 'Adjutant General. Twenty years in the King&rsquo;s service.'],
            ['Joseph Reed', 'heard.a2.reed', 'Military secretary. A Philadelphia lawyer who writes what you say.'],
            ['Robert Harrison', 'heard.a2.harrison', 'Secretary, and your own attorney from Alexandria.'],
            ['Colonel Prescott', 'heard.a2.prescott', 'Held the redoubt on Breed&rsquo;s Hill through three assaults.'],
            ['Amos Doolittle', 'heard.a2.doolittle', 'An engraver. Made the only pictures of Lexington by a man who went.'],
            ['Sergeant Starr', 'heard.a2.starr', 'Connecticut. His paper runs out on the tenth of December.'],
            ['Salem Poor', 'heard.a2.salem', 'Bought his own freedom in 1769. Fought at Bunker Hill.'],
            ['William Lee, in the field', 'heard.a2.billy', 'Enslaved. Six months in this camp, and no date to count to.'],
            ['Bragg', 'heard.a2.bragg', 'A Virginia rifleman. Six hundred miles in three weeks.'],
            ['Whitcomb', 'heard.a2.whitcomb', 'A scout. Counts what is over there and reports the count.'],
            ['A woman of the camp', 'heard.a2.campwoman', 'On the rations at half a man&rsquo;s allowance, and worth more.'],
            ['Martha, at Cambridge', 'heard.a2.martha', 'Came five hundred miles in December, and said nothing about it.'],
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
    if (MAP_ACT[this.mapId] === 2) { await this.maybeEndActTwo(); return; }
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

    /*
     * And on to Cambridge.
     *
     * Six weeks and four hundred miles happen inside one fade, which is the
     * right amount of screen time for a journey the player has no decisions
     * in. The snapshot is taken BEFORE the crossing, so Act 2's world mood
     * and his portrait are set by the man who got on the boat, not by what
     * happens to him in the first ten minutes of the camp.
     */
    await this.ui.fadeOut(700);
    this.state.act = 2;
    this.state.scene = 'CB-01';
    takeSnapshot(this.state);
    this.actOver = false;
    this.firedZones.clear();
    this.firedAmbient.clear();
    this.loadMap(CAMBRIDGE_SUMMER.id);
    await this.ui.fadeIn(700);
    await this.ui.narrate(CAMBRIDGE_SUMMER.arrival!);
    this.busy = false;
  }

  /**
   * THE END OF ACT 2.
   *
   * On the parapet, on the first of January 1776, once Starr has his answer.
   * The Grand Union goes up the staff — thirteen stripes and the King's
   * colours still in the canton, because independence has not been declared
   * and most of this army has not asked for it — and then the reckoning.
   *
   * There is no exit door. The act ends where the player chooses to walk,
   * and the only place it can end is the highest and most exposed ground on
   * the map, which is the one piece of staging in this game that is allowed
   * to be a little bit of a flourish.
   */
  private async maybeEndActTwo(): Promise<void> {
    if (this.actOver || this.mapId !== CAMBRIDGE_WINTER.id) return;
    const onCrest = this.player.z < 14 && this.player.x > 30 && this.player.x < 44;
    if (!onCrest) return;

    if (!this.state.decisions.has('A2-D4')) {
      if (!this.firedZones.has('nudge:crest')) {
        this.firedZones.add('nudge:crest');
        this.busy = true;
        await this.ui.narrate(
          'The staff is bare and the halyard is rove and there is a bundle of new bunting under '
          + 'a stone at the foot of it. Sergeant Starr is still standing at the unfinished work '
          + 'with eleven hundred men behind him, waiting to be told whether his own paper means '
          + 'what it says.',
        );
        this.busy = false;
      }
      return;
    }

    this.busy = true;
    this.actOver = true;
    await this.ui.narrate([
      'The first of January, 1776. Whatever this army was on the thirty-first of December, it is '
      + 'not that this morning, and the men standing in these works signed nothing that obliged '
      + 'them to be here.',
      'The new colours go up the staff at noon: thirteen stripes, and the King&rsquo;s crosses '
      + 'still in the corner of it. Nobody has declared anything. They are fighting the King&rsquo;s '
      + 'army under the King&rsquo;s flag and they have been doing it for eight months.',
      'Across the water somebody in Boston sees it go up, and reports that the rebels have hoisted '
      + 'the union flag in token of submission, and is wrong about that in a way that will be '
      + 'funny for two hundred years.',
    ]);

    const r = reckon(2, this.state, (d, o) => EARNED.get(`${d}/${o}`) ?? []);
    if (r) await this.ui.reckoning(r);

    takeSnapshot(this.state);
    this.refreshObjectives();
    await this.ui.narrate([
      `Act Two is done. Your code is ${encode(this.state)} — write it down; the next lesson starts from it.`,
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
    this.overlay.resize(w, h);
  }

  /**
   * THE SURVEY, HELD.
   *
   * Held, not toggled, and it never consumes a key — hold SHIFT and the
   * ground is read the way a surveyor reads it, and you can keep walking
   * while you do it. It only comes up outdoors, because contours off a
   * floorboard would be a joke.
   *
   * A mark that is in sight while the survey is up is LEARNED. That is how
   * the seven British positions across the water are gathered: stand on the
   * parapet, hold the key, and the glass names them with the range to each,
   * once, quietly, in a toast. Reading them off a telescope is what scouting
   * is, and it is one interaction where the old build had seven.
   */
  private updateOverlay(): void {
    const want =
      !this.built.def.interior && !this.busy && !this.ui.modal
      && (isDown('ShiftLeft') || isDown('ShiftRight'));
    this.overlay.setVisible(want);
    if (!want) return;

    const marks = this.built.def.marks ?? [];
    if (!marks.length) return;
    const sighted = this.overlay.draw(
      this.rig.camera, this.built.grid,
      { x: this.player.x, y: this.player.y, z: this.player.z },
      marks,
    );
    for (const m of sighted) {
      if (!m.grants || this.state.knowledge.has(m.grants)) continue;
      this.state.knowledge.add(m.grants);
      this.ui.toast(`Taken by survey: ${m.label}`);
      this.refreshObjectives();
    }
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
    this.updateOverlay();

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

/*
 * F2 and ` still cycle the map list, and they are now the poor relation.
 *
 * The cycle lands you on each map's own spawn point in a fixed order, so
 * getting to the burying ground meant pressing it four times and then
 * walking. F1 opens the travel panel instead: named places, a position on
 * the map as well as the map, and a mark against wherever you are standing.
 * The cycle is kept because it is one key and sometimes one key is what you
 * want, and because it costs six lines.
 */
window.addEventListener('keydown', (e) => {
  if (e.code !== 'F2' && e.code !== 'Backquote') return;
  const order = [
    ESTATE.id, MANSION_GROUND.id, MANSION_UPPER.id,
    CAMBRIDGE_SUMMER.id, HQ_AUTUMN.id, HQ_UP_AUTUMN.id,
    CAMBRIDGE_WINTER.id, HQ_WINTER.id, HQ_UP_WINTER.id,
  ];
  const cur = order.indexOf((game as unknown as { mapId: string }).mapId);
  game.loadMap(order[(cur + 1) % order.length]);
});

export { TILE };
