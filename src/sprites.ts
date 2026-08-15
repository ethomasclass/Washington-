/**
 * A contact sheet for the player sprite.
 *
 * Walk cycles cannot be judged one frame at a time, and they certainly cannot
 * be judged inside the game where the figure is eighty pixels tall and moving.
 * This lays every facing out against every phase at a size where the legs are
 * legible. Not shipped to students — it is a bench, like variants.html.
 */
import { washingtonFrames } from './art';
import type { Facing } from './art';

const out = document.getElementById('out')!;

for (const riband of [false, true]) {
  const h = document.createElement('h2');
  h.textContent = riband ? 'Act 2 onward — with the light blue riband' : 'Act 1 — no riband yet';
  out.append(h);
  for (const facing of ['front', 'side', 'back'] as Facing[]) {
    const row = document.createElement('div');
    row.className = 'row';
    const cap = document.createElement('div');
    cap.className = 'cap';
    cap.textContent = facing;
    row.append(cap);
    for (const c of washingtonFrames(facing, 8, 260, { riband })) row.append(c);
    out.append(row);
  }
}
