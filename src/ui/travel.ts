/**
 * THE TRAVEL PANEL — hit F1 and go anywhere.
 *
 * A build tool first and a teacher's tool second, and it is the same tool
 * either way: when you are iterating on how a place looks you need to be
 * standing in it in two seconds, not walking four hundred paces to it, and
 * when you are teaching from this you need the room you are about to talk
 * about on the projector before the class loses interest.
 *
 * It replaces `F2`, which cycled the map list blind — you pressed it until
 * the right place came up, you landed on that map's spawn point, and if what
 * you wanted to look at was the burying ground you then walked to the burying
 * ground. Destinations here are places, not maps: a map id AND a position on
 * it, named for what is there.
 *
 * TWO RULES, both learned the hard way elsewhere in this interface.
 *
 *  1. It stops every key it sees with `stopImmediatePropagation()` while it
 *     is open. `installInput()`'s handler sits on the same `window` node, and
 *     `stopPropagation()` does nothing at all to a sibling listener on the
 *     same node — that is the bug that made Space-to-dismiss also queue an
 *     interact and restart every conversation you tried to leave.
 *  2. It consumes nothing at all while it is shut. A dev tool that eats a
 *     keypress on a frame where it is invisible is worse than no dev tool.
 */

import { sfxCancel, sfxConfirm, sfxSelect } from '../engine/audio';

export interface Destination {
  /** Map id. */
  map: string;
  /** Where on it, in tiles. Omitted means the map's own spawn. */
  at?: [number, number];
  facing?: 0 | 1 | 2 | 3;
  label: string;
  /** A word about what is worth looking at there. */
  note?: string;
}

export interface TravelGroup {
  heading: string;
  where: string;
  rows: Destination[];
}

/**
 * Everywhere worth standing.
 *
 * Kept as content rather than derived from the map list, because "the
 * Quarter" and "the burying ground" are not properties of a `MapDef` — they
 * are the answer to "what am I working on this afternoon," and that is a
 * judgement a person makes, not a thing a loop can find.
 */
export const DESTINATIONS: TravelGroup[] = [
  {
    heading: 'Act One',
    where: 'Mount Vernon, 4 May 1775',
    rows: [
      { map: 'MV-ESTATE', at: [39, 57], facing: 3, label: 'The west gate', note: 'where the act opens' },
      { map: 'MV-ESTATE', at: [39, 46], facing: 3, label: 'The bowling green', note: 'serpentine walks, and the best ground for the survey overlay' },
      { map: 'MV-ESTATE', at: [39, 42], facing: 3, label: 'The forecourt', note: 'the carriage circle and the west front' },
      { map: 'MV-ESTATE', at: [26, 38], facing: 1, label: 'The building site', note: 'scaffold, lime pit, sawpit — the act’s argument' },
      { map: 'MV-ESTATE', at: [10, 35], facing: 1, label: 'The Quarter', note: 'the Witness Register. The grade changes on the way in' },
      { map: 'MV-ESTATE', at: [39, 22], facing: 3, label: 'The east lawn', note: 'the ha-ha and the fall to the river' },
      { map: 'MV-ESTATE', at: [39, 12], facing: 3, label: 'The landing', note: 'where the act ends and Act Two begins' },
      { map: 'MV-ESTATE', at: [62, 40], facing: 2, label: 'The stable yard', note: 'kitchen, smokehouse, paddock' },
    ],
  },
  {
    heading: 'Act One — indoors',
    where: 'The mansion',
    rows: [
      { map: 'MV-HOUSE-1', at: [19, 19], facing: 3, label: 'The passage', note: 'front door to river door, and the stair' },
      { map: 'MV-HOUSE-1', at: [11, 17], facing: 3, label: 'The west parlour', note: 'Martha, the Peale portrait' },
      { map: 'MV-HOUSE-1', at: [35, 14], facing: 3, label: 'The study', note: 'the locked drawer, the diary, the spectacles' },
      { map: 'MV-HOUSE-1', at: [4, 12], facing: 0, label: 'The New Room', note: 'four walls and the sky' },
      { map: 'MV-HOUSE-2', at: [19, 10], facing: 0, label: 'The chambers', note: 'the clothes press, the packed trunks' },
    ],
  },
  {
    heading: 'Act Two',
    where: 'Cambridge, July–November 1775',
    rows: [
      { map: 'CB-CAMP', at: [34, 61], facing: 3, label: 'The parade', note: 'where the act opens' },
      { map: 'CB-CAMP', at: [26, 56], facing: 3, label: 'The camp street', note: 'Greene, and the two ranks that are not the same' },
      { map: 'CB-CAMP', at: [50, 56], facing: 3, label: 'The street, east end', note: 'Bragg, Salem Poor, the hunting shirt' },
      { map: 'CB-CAMP', at: [40, 46], facing: 3, label: 'Headquarters gate', note: 'the forecourt, the marquee, the sentries' },
      { map: 'CB-CAMP', at: [36, 30], facing: 3, label: 'The covered way', note: 'the climb up off the common' },
      { map: 'CB-CAMP', at: [40, 16], facing: 3, label: 'The works', note: 'the guns, the unfinished work, the powder cask' },
      { map: 'CB-CAMP', at: [38, 14], facing: 3, label: 'The parapet', note: 'the glass. Hold SHIFT here' },
      { map: 'CB-CAMP', at: [46, 21], facing: 3, label: 'The burying ground', note: 'eleven of them, and not one of them shot' },
      { map: 'CB-CAMP', at: [14, 18], facing: 1, label: 'The traverse', note: 'the west end, and the deserter’s coat' },
      { map: 'CB-CAMP', at: [62, 18], facing: 2, label: 'The guard post', note: 'Doolittle and the four plates' },
    ],
  },
  {
    heading: 'Act Two — indoors',
    where: 'The Vassall House',
    rows: [
      { map: 'CB-HQ', at: [19, 19], facing: 3, label: 'The hall', note: 'street door to garden door' },
      { map: 'CB-HQ', at: [11, 18], facing: 3, label: 'The office', note: 'Knox, and the map table' },
      { map: 'CB-HQ', at: [9, 8], facing: 2, label: 'The council room', note: 'Gates, fourteen chairs, and the light comes down' },
      { map: 'CB-HQ', at: [27, 8], facing: 3, label: 'The secretaries', note: 'the orderly book and the cipher' },
      { map: 'CB-HQ', at: [27, 17], facing: 3, label: 'The dining room', note: 'the Vassalls’ own plate, in daily use' },
      { map: 'CB-HQ-UP', at: [18, 10], facing: 0, label: 'Upstairs at headquarters', note: 'the camp bed, the field desk' },
    ],
  },
  {
    heading: 'Act Two — the winter',
    where: 'Cambridge, December 1775 – January 1776',
    rows: [
      { map: 'CB-CAMP-W', at: [34, 57], facing: 3, label: 'The street in the snow', note: 'the huts, and four gaps in a rank of nine' },
      { map: 'CB-CAMP-W', at: [40, 63], facing: 3, label: 'Knox’s train', note: 'the sledges, on the parade' },
      { map: 'CB-CAMP-W', at: [30, 18], facing: 3, label: 'The works in January', note: 'Starr, and the enlistment roll' },
      { map: 'CB-CAMP-W', at: [36, 14], facing: 3, label: 'The parapet, 1 January', note: 'the Grand Union, and the end of the act' },
      { map: 'CB-HQ-W', at: [12, 18], facing: 3, label: 'Headquarters', note: 'Reed, the petition, and Knox’s empty chair' },
      { map: 'CB-HQ-UP-W', at: [18, 10], facing: 0, label: 'Upstairs in December', note: 'Martha came five hundred miles in December' },
    ],
  },
];

const FLAT: Array<{ d: Destination; group: number }> = [];
DESTINATIONS.forEach((g, gi) => g.rows.forEach((d) => FLAT.push({ d, group: gi })));

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, cls?: string, html?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

export class Travel {
  readonly root: HTMLDivElement;
  private list: HTMLDivElement;
  private foot: HTMLDivElement;
  private resolveKey: ((code: string) => void) | null = null;
  private sel = 0;

  /** True while the panel owns the keyboard. */
  open = false;

  constructor() {
    this.root = el('div');
    this.root.id = 'travel';
    const frame = el('div', 'frame');
    this.list = el('div', 'list');
    this.foot = el('div', 'foot');
    frame.append(
      el('div', 'head',
        '<span class="ttl">Travel</span>'
        + '<span class="sub">the build jump &mdash; F1 from anywhere</span>'),
      this.list, this.foot,
    );
    this.root.append(frame);

    window.addEventListener('keydown', (e) => {
      if (!this.open) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this.resolveKey) {
        const r = this.resolveKey;
        this.resolveKey = null;
        r(e.code);
      }
    });
  }

  private key(): Promise<string> {
    return new Promise((resolve) => { this.resolveKey = resolve; });
  }

  private paint(currentMap: string): void {
    let html = '';
    for (const g of DESTINATIONS) {
      html += `<div class="grp"><span class="h">${g.heading}</span>`
        + `<span class="w">${g.where}</span></div>`;
      for (const d of g.rows) {
        const i = FLAT.findIndex((f) => f.d === d);
        // The place you are standing in right now is marked, so F1 tells you
        // where you are as well as where you could be.
        const here = d.map === currentMap;
        html += `<div class="row${i === this.sel ? ' on' : ''}${here ? ' here' : ''}">`
          + `<span class="lab">${d.label}</span>`
          + `<span class="note">${d.note ?? ''}</span>`
          + `<span class="map">${d.map}</span></div>`;
      }
    }
    this.list.innerHTML = html;
    const on = this.list.querySelector('.row.on') as HTMLElement | null;
    on?.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Show the panel and resolve with where to go, or null if it was dismissed.
   *
   * The cursor opens on the first destination of whichever group the player
   * is currently standing in, so F1-Enter is "back to the top of this place"
   * rather than "back to Mount Vernon" — which is the motion you actually
   * want forty times an afternoon.
   */
  async choose(currentMap: string): Promise<Destination | null> {
    const mine = FLAT.findIndex((f) => f.d.map === currentMap);
    this.sel = mine >= 0 ? mine : 0;
    this.open = true;
    this.root.classList.add('on');
    this.foot.innerHTML =
      '<span class="key">&uarr; &darr;</span>choose'
      + '<span class="key">&larr; &rarr;</span>by act'
      + '<span class="key">ENTER</span>go'
      + '<span class="key">ESC</span>stay';
    this.paint(currentMap);

    for (;;) {
      const code = await this.key();
      if (code === 'Escape' || code === 'F1') {
        sfxCancel();
        this.open = false;
        this.root.classList.remove('on');
        return null;
      }
      if (code === 'Enter' || code === 'Space' || code === 'KeyE') {
        sfxConfirm();
        this.open = false;
        this.root.classList.remove('on');
        return FLAT[this.sel].d;
      }
      const move = (n: number) => {
        this.sel = (this.sel + n + FLAT.length) % FLAT.length;
        sfxSelect();
        this.paint(currentMap);
      };
      if (code === 'ArrowUp' || code === 'KeyW') move(-1);
      else if (code === 'ArrowDown' || code === 'KeyS') move(1);
      else if (code === 'ArrowLeft' || code === 'KeyA') {
        // To the top of the previous group, which is how you get from the
        // camp street to the winter camp street in one press.
        const g = FLAT[this.sel].group;
        const target = FLAT.findIndex((f) => f.group === (g - 1 + DESTINATIONS.length) % DESTINATIONS.length);
        this.sel = target; sfxSelect(); this.paint(currentMap);
      } else if (code === 'ArrowRight' || code === 'KeyD') {
        const g = FLAT[this.sel].group;
        const target = FLAT.findIndex((f) => f.group === (g + 1) % DESTINATIONS.length);
        this.sel = target; sfxSelect(); this.paint(currentMap);
      }
    }
  }
}
