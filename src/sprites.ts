/**
 * The contact sheet: every figure, every facing, every frame of the walk, the
 * whole prop library and the whole tile set, at four times size.
 *
 * This page exists because the game draws everything procedurally, which means
 * a fault in one generator is a fault in every instance of it, and you cannot
 * see that at eighty pixels while it is moving. Open `/sprites.html` and judge
 * the drawing here before judging it in the frame.
 */

import { actorSheet, portrait, FRAMES, type Mood } from './engine/actors';
import { CAST } from './content/people';
import { PROPS } from './engine/props';
import { tileAtlas, TILE_ORDER, TILE_PX, VARIANTS } from './engine/tiles';
import { facade, roofTexture } from './engine/structures';
import { surface } from './engine/pixels';

const DIR_NAME = ['facing you', 'facing left', 'facing right', 'facing away'];

const root = document.getElementById('sheet')!;
document.body.style.cssText =
  'margin:0;padding:28px;background:#14110d;color:#e8dfc8;'
  + 'font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;';

function h(tag: string, css: string, text?: string): HTMLElement {
  const n = document.createElement(tag);
  n.style.cssText = css;
  if (text) n.textContent = text;
  return n;
}

function heading(text: string): void {
  root.append(h('h2', 'margin:34px 0 10px;font-size:13px;letter-spacing:.18em;'
    + 'text-transform:uppercase;color:#c8a13f;font-weight:600;', text));
}

function show(canvas: HTMLCanvasElement, scale: number, label?: string): HTMLElement {
  const wrap = h('div', 'display:inline-block;margin:0 12px 12px 0;text-align:center;vertical-align:bottom;');
  const img = new Image();
  img.src = canvas.toDataURL();
  img.style.cssText =
    `width:${canvas.width * scale}px;height:${canvas.height * scale}px;`
    + 'image-rendering:pixelated;display:block;background:#26211a;border:1px solid #3a3128;';
  wrap.append(img);
  if (label) wrap.append(h('div', 'font-size:11px;color:#8a8070;margin-top:4px;', label));
  return wrap;
}

/* ---- figures ---------------------------------------------------------- */

heading('Figures — 32×48, four directions, four frames, at 4×');
for (const [key, spec] of Object.entries(CAST)) {
  const row = h('div', 'margin-bottom:20px;');
  row.append(h('div', 'font-size:15px;color:#e8dfc8;margin-bottom:6px;', key));
  const sheet = actorSheet(`sheet:${key}`, spec);
  for (let d = 0; d < 4; d++) {
    const strip = h('div', 'display:inline-block;margin-right:22px;vertical-align:top;');
    for (let f = 0; f < FRAMES; f++) strip.append(show(sheet.frames[d][f].canvas, 4));
    strip.append(h('div', 'font-size:11px;color:#8a8070;', DIR_NAME[d]));
    row.append(strip);
  }
  root.append(row);
}

/* ---- portraits --------------------------------------------------------- */

heading('Portraits — 64×80, four moods, at 3×');
for (const [key, spec] of Object.entries(CAST)) {
  const row = h('div', 'display:inline-block;margin:0 20px 18px 0;vertical-align:top;');
  row.append(h('div', 'font-size:13px;margin-bottom:5px;', key));
  for (const mood of ['neutral', 'warm', 'hard', 'tired'] as Mood[]) {
    row.append(show(portrait(spec, mood).canvas, 3, mood));
  }
  root.append(row);
}

/* ---- props -------------------------------------------------------------- */

heading('Props — as drawn, at 2×');
for (const [id, def] of Object.entries(PROPS)) {
  const s = surface(def.w, def.h);
  def.draw(s.g, def.w, def.h, 0);
  root.append(show(s.canvas, 2, `${id} · ${def.w}×${def.h}${def.flat ? ' · flat' : ''}`));
}

/* ---- ground ------------------------------------------------------------- */

heading('Ground — every tile, four variants, at 3×');
const atlas = tileAtlas();
TILE_ORDER.forEach((id, row) => {
  const strip = surface(TILE_PX * VARIANTS, TILE_PX);
  strip.g.drawImage(atlas.canvas, 0, row * TILE_PX, TILE_PX * VARIANTS, TILE_PX, 0, 0, TILE_PX * VARIANTS, TILE_PX);
  root.append(show(strip.canvas, 3, id));
});

/* ---- walls -------------------------------------------------------------- */

heading('Walls and roofs — at 2×');
root.append(show(
  facade({
    style: 'rusticated', wide: 8, high: 4.2, cornice: true, plinth: true, storeyH: 1.8,
    openings: [
      { at: 1.5, kind: 'window' }, { at: 4.0, kind: 'door' }, { at: 6.5, kind: 'window' },
      { at: 1.5, kind: 'window', storey: 1 }, { at: 4.0, kind: 'window', storey: 1 },
      { at: 6.5, kind: 'window', storey: 1 },
    ],
  }).canvas, 2, 'the Mansion — rusticated, sand-painted pine'));
root.append(show(
  facade({
    style: 'frameOpen', wide: 6, high: 3.9,
    openings: [{ at: 3.0, kind: 'venetian' }],
  }).canvas, 2, 'the north wing — framed, part sheathed, open'));
root.append(show(
  facade({ style: 'clapboard', wide: 7, high: 2.6, cornice: true,
    openings: [{ at: 2.0, kind: 'window' }, { at: 4.5, kind: 'doorway' }] }).canvas, 2, 'the kitchen'));
root.append(show(
  facade({ style: 'log', wide: 8, high: 3.0,
    openings: [{ at: 1.5, kind: 'window' }, { at: 4.0, kind: 'doorway' }, { at: 6.5, kind: 'window' }] }).canvas,
  2, 'the House for Families'));
root.append(show(
  facade({ style: 'panelled', wide: 6, high: 2.6 }).canvas, 2, 'a panelled room'));
root.append(show(roofTexture().canvas, 3, 'shingles'));
