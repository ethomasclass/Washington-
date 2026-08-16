/** The bake-off bench. Not shipped to students; a bench, like sprites.html. */
import { MEDIA, renderCamp } from './bakeoff';
import { loadFigureSheet } from './figures';

const out = document.getElementById('out')!;

void loadFigureSheet(undefined, 150).then((frames) => {
  for (const med of MEDIA) {
    const box = document.createElement('div');
    box.className = 'plate';
    const h = document.createElement('h2');
    h.textContent = med.name;
    const n = document.createElement('p');
    n.className = 'note';
    n.textContent = med.note;

    const plate = renderCamp(med.id, 1280, 720);
    // The figures go on last, exactly as the engine composites them.
    if (frames) {
      const g = plate.getContext('2d')!;
      g.drawImage(frames.front[0], 1280 * 0.46, 720 * 0.62);
      g.drawImage(frames.side[3], 1280 * 0.30, 720 * 0.70);
    }
    box.append(h, n, plate);
    out.append(box);
  }
});
