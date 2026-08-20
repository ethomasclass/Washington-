/**
 * THE SURVEYOR'S OVERLAY.
 *
 * Hold a key on any exterior and the frame is read the way the man in it
 * would read it: contours off the elevation grid, sightlines from where he is
 * standing to whatever is worth looking at, and distances in chains and yards.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT A MINIMAP. Washington was a surveyor
 * from the age of sixteen. He ran a chain over the Shenandoah for Lord
 * Fairfax before he had ever heard a shot fired, he laid out his own bowling
 * green, he drew the survey of Dogue Run that hangs in his own house, and the
 * one professional competence he brought to command was the ability to look
 * at a piece of ground and know what it was worth. Every other game about him
 * gives the player a map. This gives the player his eyes: not where things
 * are, but how the ground lies, what can see what, and how far it is —
 * which is the difference between a map and a survey, and it is the whole of
 * why Dorchester Heights worked.
 *
 * THREE RULES.
 *
 *  1. IT IS HELD, NOT TOGGLED. You may walk with it up. A toggle is a mode;
 *     a held key is a way of looking, and the second one is the true thing.
 *  2. IT NEVER TAKES THE KEYBOARD. It draws over the frame and consumes
 *     nothing, so it can never be the reason an input was eaten.
 *  3. IT LIES ABOUT NOTHING. Every contour is read off the same
 *     `grid.height` the player is standing on, every distance is measured
 *     from the same coordinates, and every sightline is blocked by the same
 *     `grid.solid` that blocks a footstep. If it disagrees with the world,
 *     the world is right and this is a bug.
 *
 * IT WORKS ON ACT 1. Nothing in here knows about Cambridge. It takes a grid,
 * a camera and a list of marks, so the estate gets it retroactively — and
 * standing on the bowling green holding the survey key, watching the six
 * terraces of the east lawn draw themselves as contours, is the single
 * clearest statement this game makes about who he was before the war.
 */

import * as THREE from 'three';
import { STEP, type Grid } from './collision';

/** Something worth a sightline. */
export interface Mark {
  x: number;
  z: number;
  label: string;
  /** Draw the line even if the ground blocks it — for water, and the far shore. */
  overWater?: boolean;
  /**
   * Knowledge granted by having the mark in sight with the survey up.
   *
   * This is how the seven British positions across the water are learned.
   * The old build made each of them a separate interactable you pressed
   * SPACE on, seven times, at the same spot; here you stand on the parapet,
   * hold the survey key, and they name themselves — which is both what
   * looking through a glass is actually like and one interaction instead of
   * seven.
   */
  grants?: string;
}

/**
 * A chain is 66 feet, and it is the unit he actually wrote in.
 *
 * One world tile is about ten feet — a man is a little over half a tile wide
 * at this sprite scale and he is six foot two — so the conversion is fixed
 * here once and everything else reads it.
 */
const FEET_PER_TILE = 10;
const FEET_PER_CHAIN = 66;

function distanceLabel(tiles: number): string {
  const feet = tiles * FEET_PER_TILE;
  if (feet < 300) return `${Math.round(feet)} ft`;
  const chains = feet / FEET_PER_CHAIN;
  if (chains < 40) return `${chains.toFixed(1)} ch`;
  return `${(feet / 5280).toFixed(2)} mi`;
}

/** Bresenham over the collision grid: can A see B along the ground? */
function clear(grid: Grid, x0: number, z0: number, x1: number, z1: number): boolean {
  const steps = Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 2);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    if (grid.blocked(x, z)) return false;
  }
  return true;
}

export class SurveyOverlay {
  readonly root: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private legend: HTMLDivElement;
  private on = false;

  /** Reused every frame so the overlay allocates nothing while it is up. */
  private v = new THREE.Vector3();

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'survey-overlay';
    this.canvas = document.createElement('canvas');
    this.g = this.canvas.getContext('2d')!;
    this.legend = document.createElement('div');
    this.legend.className = 'legend';
    this.root.append(this.canvas, this.legend);
  }

  resize(w: number, h: number): void {
    this.canvas.width = w;
    this.canvas.height = h;
  }

  setVisible(v: boolean): void {
    if (v === this.on) return;
    this.on = v;
    this.root.classList.toggle('on', v);
    if (!v) this.g.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  get visible(): boolean { return this.on; }

  /** World point to canvas pixels, or null if it is behind the camera. */
  private project(camera: THREE.Camera, x: number, y: number, z: number): [number, number] | null {
    this.v.set(x, y, z).project(camera);
    if (this.v.z > 1) return null;
    return [
      (this.v.x * 0.5 + 0.5) * this.canvas.width,
      (-this.v.y * 0.5 + 0.5) * this.canvas.height,
    ];
  }

  /**
   * Draw one frame of the survey.
   *
   * Contours first, then the sightlines over them, then the labels over both,
   * which is the order a surveyor's own sheet is built in and also the only
   * order in which the text stays readable.
   */
  draw(
    camera: THREE.Camera,
    grid: Grid,
    from: { x: number; z: number; y: number },
    marks: Mark[],
  ): Mark[] {
    if (!this.on) return [];
    const g = this.g;
    const W = this.canvas.width, H = this.canvas.height;
    g.clearRect(0, 0, W, H);

    /* --- contours -------------------------------------------------------
     *
     * A contour is drawn wherever two adjacent tiles straddle a level, which
     * is exactly the test `build.ts` uses to decide whether to put a riser
     * face there. So the green line always lands on the top of a real cut
     * bank, never a tile away from it, and there is no second source of
     * truth to drift out of agreement.
     * ----------------------------------------------------------------- */
    const c0 = Math.max(0, Math.floor(from.x) - 34);
    const c1 = Math.min(grid.cols - 1, Math.floor(from.x) + 34);
    const r0 = Math.max(0, Math.floor(from.z) - 40);
    const r1 = Math.min(grid.rows - 1, Math.floor(from.z) + 24);

    g.lineWidth = 1.25;
    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        const i = grid.at(c, r);
        if (i < 0) continue;
        const y = grid.height[i];
        const lv = Math.round(y / STEP);
        // Every fifth level is an index contour, drawn heavier. The
        // convention is a real one and a student who has seen a topographic
        // map will recognise it without being told.
        const heavy = lv % 5 === 0;
        for (const [dc, dr] of [[1, 0], [0, 1]] as const) {
          const j = grid.at(c + dc, r + dr);
          if (j < 0) continue;
          const y2 = grid.height[j];
          if (Math.abs(y2 - y) < 0.01) continue;
          const top = Math.max(y, y2);
          /*
           * The segment is the shared EDGE of the two tiles, not a line
           * between their centres. An east neighbour shares the vertical
           * edge at x = c+1 running the depth of the row; a south neighbour
           * shares the horizontal edge at z = r+1 running the width of the
           * column. Getting this wrong draws a lattice of little diagonals
           * that look like contours from a distance and are nonsense up
           * close, which is exactly what the first version of this did.
           */
          const a = dc
            ? this.project(camera, c + 1, top + 0.02, r)
            : this.project(camera, c, top + 0.02, r + 1);
          const b = dc
            ? this.project(camera, c + 1, top + 0.02, r + 1)
            : this.project(camera, c + 1, top + 0.02, r + 1);
          if (!a || !b) continue;
          g.strokeStyle = heavy ? 'rgba(143,232,191,.72)' : 'rgba(111,211,166,.34)';
          g.lineWidth = heavy ? 1.7 : 1.1;
          g.beginPath();
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
          g.stroke();
        }
      }
    }

    /* --- the station: where he is standing ------------------------------ */
    const here = this.project(camera, from.x, from.y + 0.05, from.z);
    if (here) {
      g.strokeStyle = 'rgba(143,232,191,.9)';
      g.lineWidth = 1.5;
      for (const r of [9, 16]) {
        g.beginPath();
        g.arc(here[0], here[1], r, 0, Math.PI * 2);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(here[0] - 22, here[1]); g.lineTo(here[0] + 22, here[1]);
      g.moveTo(here[0], here[1] - 22); g.lineTo(here[0], here[1] + 22);
      g.stroke();
    }

    /* --- sightlines ------------------------------------------------------
     *
     * Solid where the ground is clear between here and there, broken where
     * it is not. That single distinction is the whole military content of
     * the overlay: it is the difference between a hill you can see and a
     * hill you can shoot at.
     * ----------------------------------------------------------------- */
    g.font = '600 12px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    g.textBaseline = 'middle';
    /*
     * Labels are staggered by index rather than laid out.
     *
     * Seven positions across a mile of water land within a few degrees of
     * each other from a fixed camera, so their labels stacked into an
     * unreadable pile along the top of the frame. A proper collision solver
     * for six words of text is not worth writing; three rows of offset,
     * cycled, separates every real case and costs one line.
     */
    let mi = 0;
    for (const m of marks) {
      const d = Math.hypot(m.x - from.x, m.z - from.z);
      if (d > 46) continue;
      const my = grid.heightAt(m.x, m.z);
      const to = this.project(camera, m.x, my + 0.6, m.z);
      if (!to || !here) continue;
      const open = m.overWater || clear(grid, from.x, from.z, m.x, m.z);

      g.strokeStyle = open ? 'rgba(143,232,191,.55)' : 'rgba(232,143,143,.5)';
      g.lineWidth = 1.2;
      g.setLineDash(open ? [] : [4, 5]);
      g.beginPath();
      g.moveTo(here[0], here[1]);
      g.lineTo(to[0], to[1]);
      g.stroke();
      g.setLineDash([]);

      // The mark itself: a small triangulation flag.
      g.strokeStyle = open ? 'rgba(143,232,191,.95)' : 'rgba(232,143,143,.85)';
      g.beginPath();
      g.moveTo(to[0], to[1] + 7);
      g.lineTo(to[0] - 6, to[1] - 5);
      g.lineTo(to[0] + 6, to[1] - 5);
      g.closePath();
      g.stroke();

      const text = `${m.label} · ${distanceLabel(d)}`;
      const wpx = g.measureText(text).width;
      const lx = Math.min(W - wpx - 12, Math.max(6, to[0] - wpx / 2));
      const ly = to[1] - 18 - (mi++ % 3) * 17;
      g.fillStyle = 'rgba(8,14,11,.78)';
      g.fillRect(lx - 5, ly - 9, wpx + 10, 18);
      g.fillStyle = open ? '#cfe9dd' : '#eccccc';
      g.fillText(text, lx, ly);
    }

    /*
     * The legend states the unit, because a number without a unit is a score
     * and this is not a score. A chain is 66 feet and it is the unit he
     * actually wrote his surveys in.
     */
    const level = Math.round(from.y / STEP);
    const sighted = marks.filter((m) => {
      const d = Math.hypot(m.x - from.x, m.z - from.z);
      return d <= 46 && (m.overWater || clear(grid, from.x, from.z, m.x, m.z));
    });
    this.legend.innerHTML =
      `<b>Survey</b><br>station at level ${level}<br>`
      + `${sighted.length} of ${marks.length} marks in sight<br>`
      + `<span style="opacity:.7">1 chain = 66 ft</span>`;

    return sighted;
  }
}
