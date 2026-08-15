/**
 * A contact sheet for the figures.
 *
 * Walk cycles cannot be judged one frame at a time, and neither cycles nor
 * faces can be judged inside the game, where a figure is eighty pixels tall and
 * moving. This lays every facing against every phase, and a spread of NPCs, at
 * a size where the drawing is legible. Not shipped to students — it is a bench,
 * like variants.html.
 */
import { characterCutout, washingtonFrames } from './art';
import type { Facing } from './art';

const out = document.getElementById('out')!;

const section = (title: string, id?: string) => {
  const sec = document.createElement('div');
  if (id) sec.id = id;
  const h = document.createElement('h2');
  h.textContent = title;
  sec.append(h);
  out.append(sec);
  return sec;
};

const row = (sec: HTMLElement, label: string, cells: HTMLCanvasElement[]) => {
  const r = document.createElement('div');
  r.className = 'row';
  const cap = document.createElement('div');
  cap.className = 'cap';
  cap.textContent = label;
  r.append(cap, ...cells);
  sec.append(r);
};

for (const riband of [false, true]) {
  const sec = section(
    riband ? 'Act 2 onward — with the light blue riband' : 'Act 1 — no riband yet',
  );
  for (const facing of ['front', 'side', 'back'] as Facing[]) {
    row(sec, facing, washingtonFrames(facing, 8, 260, { riband }));
  }
}

/*
 * The other people.
 *
 * The question of how far this technique goes is not answerable at eighty
 * pixels, so here they are large. Every figure is the same function with a
 * different seed: no two faces, hair or builds alike, and none of it authored
 * one at a time.
 */
{
  const sec = section('NPCs — one function, thirty seeds', 'npcs');
  const coats = ['#7A5C3E', '#6B4F35', '#8A7B5E', '#5F5B4C', '#8C8578',
    '#6E5B45', '#7C6B52', '#B8AE93', '#4B5645', '#847A61'];
  for (const hat of ['tricorne', 'round', 'none'] as const) {
    row(sec, hat, coats.map((coat, i) => characterCutout(coat, 300 + i * 37, 240, -1, {
      hat, build: 0.88 + (i % 4) * 0.08,
    })));
  }
}
