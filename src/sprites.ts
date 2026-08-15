/**
 * A contact sheet for the figures.
 *
 * Walk cycles cannot be judged one frame at a time, and neither cycles nor
 * faces can be judged inside the game, where a figure is eighty pixels tall and
 * moving. This lays every facing against every phase, and a spread of NPCs, at
 * a size where the drawing is legible. Not shipped to students — it is a bench,
 * like variants.html.
 */
import { characterCutout, prop, washingtonFrames } from './art';
import type { Facing, PropKind } from './art';

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

/*
 * Named people, and the horse.
 *
 * These three are drawn to resemble particular individuals rather than to fill
 * a crowd, so they are worth looking at on their own.
 */
{
  const sec = section('Named figures', 'named');
  sec.append(Object.assign(document.createElement('div'), {
    className: 'row',
  }));
  const r = sec.querySelector('.row')!;
  const cap = document.createElement('div');
  cap.className = 'cap';
  cap.textContent = 'MV-01';
  r.append(cap);
  // Martha: a gown, a linen cap, and a good deal shorter than her husband.
  r.append(characterCutout('#6B4F35', 202, 250 * 0.84, -1, {
    gown: true, cap: true, hair: '#3E3226', build: 0.96, hat: 'none',
  }));
  // William Lee, in the Washington livery: white faced scarlet.
  r.append(characterCutout('#DCD3BC', 505, 250, -1, {
    facings: '#8E4A44', hat: 'round', skin: '#7A5237', hair: '#2B2118', build: 0.98,
  }));
  // Lund, for comparison — an ordinary man in an ordinary coat.
  r.append(characterCutout('#7A5C3E', 404, 250, -1, { hat: 'round', build: 1.1 }));
  for (const seed of [11, 12, 13]) r.append(prop('horse', seed));
}

/*
 * Set pieces.
 *
 * Chiefly here so that "would that really be sitting on the lawn?" can be asked
 * of each one at a size where the answer is visible. Anything holding paper
 * carries its own furniture, because paper does not lie on grass.
 */
{
  const sec = section('Set pieces', 'props');
  const kinds: PropKind[] = [
    'papers', 'chest', 'uniform', 'sash', 'table', 'barrel',
    'kettle', 'musket', 'horn', 'canteen', 'drum', 'bucket', 'fire', 'necessary',
  ];
  row(sec, 'a', kinds.slice(0, 7).map((k, i) => prop(k, 2 + i * 5)));
  row(sec, 'b', kinds.slice(7).map((k, i) => prop(k, 3 + i * 7)));
  // Both variants of the paper prop, side by side.
  row(sec, 'papers', [prop('papers', 2), prop('papers', 3), prop('papers', 4), prop('papers', 5)]);
}
