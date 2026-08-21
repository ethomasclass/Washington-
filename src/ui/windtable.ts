/**
 * THE EAST RIVER — the second map table, and the wind.
 *
 * `docs/05` §3.2, and it is the sharpest single sentence in the whole
 * document: *"A northeast wind — which is what blew — prevents Howe's ships
 * beating up the East River to cut the ferry. That is why the army got away,
 * and no student has ever been told it."*
 *
 * So this table has one instrument on it and the instrument is a wind rose.
 * The player turns the wind and watches the reach of the British fleet change
 * on the drawing in front of them. Turn it to the south-west and the whole
 * East River goes red and the ferry with it; turn it back to the north-east
 * and the river closes to them. Nothing is explained. The arrow is turned by
 * the student and the consequence is drawn.
 *
 * WHAT THIS IS NOT. It is not a wind you can set. The wind on the night of
 * 29 August was north-east and it stayed north-east, and the table says so
 * when the player leaves it. What they can do is find out what it was worth,
 * which is a different and better thing than being allowed to choose it.
 *
 * A square-rigged ship of 1776 cannot sail closer than about six points off
 * the wind and cannot tack a mile of tidal river against a foul wind and a
 * running ebb. That is the whole of the physics and it is period-correct.
 */

import { P } from '../palette';
import { hash, line as inkLine, px, rect, surface, type Surface } from '../engine/pixels';
import { sfxConfirm, sfxDocument, sfxSelect } from '../engine/audio';

const SHEET_W = 520, SHEET_H = 420;

/** The eight points, clockwise from north, as they were named. */
const POINTS = [
  'North', 'North-east', 'East', 'South-east',
  'South', 'South-west', 'West', 'North-west',
] as const;

/** The wind that actually blew, and held, from the 27th to the 30th. */
const HISTORICAL = 1;   // north-east

/**
 * What the fleet can reach, per wind.
 *
 * A ship beating up the East River from the Narrows is heading roughly
 * north-east. She can do it on anything from about south-west round to west,
 * badly on north-west and south, and not at all on north-east or east —
 * which is dead on the nose, in a mile-wide tidal race, with an ebb under her.
 *
 * `reach` is how far up the river, 0 (nothing) to 1 (past the ferry).
 */
const REACH: number[] = [
  0.35,  // North      — a beam wind, foul on the last reach
  0.00,  // North-east — dead on the nose. Nothing moves.
  0.10,  // East       — near enough on the nose to be the same thing
  0.55,  // South-east — a fair slant as far as the Wallabout
  0.80,  // South      — she lays it
  1.00,  // South-west — dead fair. Straight up, and the ferry is cut.
  0.90,  // West       — fair, with the tide to fight
  0.45,  // North-west — a shift, and a hard one
];

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, cls?: string, html?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

/* ---------------------------------------------------------------------- *
 * The sheet
 * ---------------------------------------------------------------------- */

/**
 * The drawing: the Narrows, the two islands, the East River between them,
 * and the ferry.
 *
 * Deliberately a rougher sheet than Knox's — that one is a survey drawn at
 * leisure by a man who wanted it handsome, and this is a chart scratched on
 * a drum head by somebody who needed it this afternoon.
 */
function drawSheet(): Surface {
  const s = surface(SHEET_W, SHEET_H);
  const g = s.g;
  const X = (t: number) => Math.round(t * SHEET_W);
  const Y = (t: number) => Math.round(t * SHEET_H);

  rect(g, 0, 0, SHEET_W, SHEET_H, P.paper);
  for (let y = 0; y < SHEET_H; y += 2) {
    for (let x = 0; x < SHEET_W; x++) if (hash(x, y, 11) < 0.06) px(g, x, y, P.paperDim);
  }
  // A drum head is round and the sheet was pinned to one. The ring shows.
  for (let a = 0; a < 700; a++) {
    const t = (a / 700) * Math.PI * 2;
    px(g, Math.round(SHEET_W / 2 + Math.cos(t) * 205), Math.round(SHEET_H / 2 + Math.sin(t) * 190), P.paperDim);
  }

  // --- the water: the harbour, the river, and the bay -------------------
  const water = (pts: Array<[number, number]>, wide: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const steps = 90;
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const x = X(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t);
        const y = Y(pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t);
        for (let wdt = -wide; wdt <= wide; wdt++) {
          px(g, x + wdt, y, Math.abs(wdt) > wide - 3 ? P.blueD : '#BBCEDA');
        }
      }
    }
  };
  // The East River, running from the harbour up past the ferry to Hell Gate.
  water([[0.30, 0.92], [0.42, 0.72], [0.50, 0.52], [0.58, 0.32], [0.66, 0.10]], 17);
  // The harbour and the Narrows, coming in bottom left.
  water([[0.02, 0.72], [0.14, 0.84], [0.26, 0.93]], 22);

  // --- the two shores ----------------------------------------------------
  // Manhattan, west of the river.
  for (let i = 0; i < 3200; i++) {
    const t = hash(i, 1, 21);
    const u = hash(i, 2, 22);
    const x = X(0.02 + t * 0.44);
    const y = Y(0.04 + u * 0.86);
    // Keep off the water by leaving the river's own band alone.
    const river = 0.30 + (1 - u) * 0.36;
    if (x / SHEET_W > river - 0.05) continue;
    if (hash(i, 3, 23) < 0.16) px(g, x, y, P.paperDim);
  }
  // Long Island, east of it.
  for (let i = 0; i < 3600; i++) {
    const t = hash(i, 4, 24), u = hash(i, 5, 25);
    const x = X(0.52 + t * 0.46), y = Y(0.06 + u * 0.90);
    const river = 0.30 + (1 - u) * 0.40;
    if (x / SHEET_W < river + 0.06) continue;
    if (hash(i, 6, 26) < 0.16) px(g, x, y, P.paperDim);
  }

  // --- the marks ---------------------------------------------------------
  const markSquare = (fx: number, fy: number) => {
    const cx = X(fx), cy = Y(fy);
    rect(g, cx - 4, cy - 4, 9, 9, P.paper);
    inkLine(g, cx - 4, cy - 4, cx + 4, cy - 4, P.ink);
    inkLine(g, cx - 4, cy + 4, cx + 4, cy + 4, P.ink);
    inkLine(g, cx - 4, cy - 4, cx - 4, cy + 4, P.ink);
    inkLine(g, cx + 4, cy - 4, cx + 4, cy + 4, P.ink);
  };
  markSquare(0.545, 0.415);   // the ferry
  markSquare(0.40, 0.46);     // New York
  markSquare(0.68, 0.50);     // the Brooklyn line
  markSquare(0.12, 0.80);     // the fleet, at anchor

  // The American line, as a dashed arc across the Brooklyn neck.
  for (let a = 0; a <= 120; a++) {
    const t = a / 120;
    if ((a >> 1) % 2 === 0) continue;
    const x = X(0.60 + Math.sin(t * Math.PI) * 0.16);
    const y = Y(0.30 + t * 0.34);
    px(g, x, y, P.scarletD); px(g, x + 1, y, P.scarletD);
  }

  // Shoals, hatched, off the ferry stairs — the reason two boats at a time.
  for (let i = 0; i < 90; i++) {
    const x = X(0.50 + hash(i, 7, 27) * 0.05);
    const y = Y(0.40 + hash(i, 8, 28) * 0.06);
    inkLine(g, x, y, x + 4, y + 3, P.inkSoft);
  }

  for (const inset of [7, 11]) {
    inkLine(g, inset, inset, SHEET_W - inset, inset, P.ink);
    inkLine(g, inset, SHEET_H - inset, SHEET_W - inset, SHEET_H - inset, P.ink);
    inkLine(g, inset, inset, inset, SHEET_H - inset, P.ink);
    inkLine(g, SHEET_W - inset, inset, SHEET_W - inset, SHEET_H - inset, P.ink);
  }
  return s;
}

let SHEET: string | null = null;
function sheetUrl(): string {
  if (!SHEET) SHEET = drawSheet().canvas.toDataURL();
  return SHEET;
}

/* ---------------------------------------------------------------------- *
 * The screen
 * ---------------------------------------------------------------------- */

export interface WindResult {
  /** Every point of the compass the player actually turned the arrow to. */
  tried: number;
  /** True once they have seen a wind that opens the river. */
  sawTheRisk: boolean;
}

export class WindTable {
  readonly root: HTMLDivElement;
  private board: HTMLDivElement;
  private rose: HTMLDivElement;
  private track: HTMLDivElement;
  private ask: HTMLDivElement;
  private wire: HTMLDivElement;
  private foot: HTMLDivElement;
  private resolveKey: ((code: string) => void) | null = null;
  private open = false;
  private wind = HISTORICAL;
  private seen = new Set<number>();

  constructor() {
    this.root = el('div', 'sheetui');
    this.root.id = 'windtable';
    const frame = el('div', 'frame');

    this.board = el('div', 'board');
    this.board.style.backgroundImage = `url(${sheetUrl()})`;
    for (const [name, x, y] of [
      ['New York', 0.40, 0.46], ['the ferry', 0.545, 0.415],
      ['the line', 0.68, 0.50], ['the fleet', 0.12, 0.80],
      ['Hell Gate', 0.68, 0.08], ['the Narrows', 0.06, 0.90],
    ] as const) {
      const lab = el('span', `place${x > 0.62 ? ' right' : ''}`, name);
      lab.style.left = `${x * 100}%`;
      lab.style.top = `${y * 100}%`;
      this.board.append(lab);
    }
    /*
     * THE TRACK — how far up the river the fleet gets on this wind.
     *
     * Drawn as a band along the river's own line, in the one colour this
     * interface reserves for the enemy. It is the whole readout, it moves
     * when the arrow moves, and it needs no legend.
     */
    this.track = el('div', 'track');
    this.board.append(this.track);
    this.rose = el('div', 'rose');
    this.rose.innerHTML = '<span class="needle"></span><span class="pip n">N</span>';
    this.board.append(this.rose);

    this.ask = el('div', 'ask');
    this.wire = el('div', 'wire');
    this.foot = el('div', 'foot');
    frame.append(
      el('div', 'head',
        '<span class="ttl">A Draught of the East River and the Ferry</span>'
        + '<span class="sub">taken on a drum head &mdash; 29 August 1776</span>'),
      this.board, this.ask, this.wire, this.foot,
    );
    this.root.append(frame);

    window.addEventListener('keydown', (e) => {
      if (!this.open) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this.resolveKey) { const r = this.resolveKey; this.resolveKey = null; r(e.code); }
    });
  }

  private key(): Promise<string> {
    return new Promise((resolve) => { this.resolveKey = resolve; });
  }

  private paint(): void {
    const reach = REACH[this.wind];
    this.rose.style.setProperty('--deg', `${this.wind * 45}deg`);
    // The band runs from the harbour up the river as far as the wind allows.
    this.track.style.setProperty('--reach', `${Math.round(reach * 100)}`);
    this.track.classList.toggle('cuts', reach >= 0.85);
    this.track.classList.toggle('none', reach <= 0.12);

    const name = POINTS[this.wind];
    const verdict =
      reach <= 0.12
        ? 'Dead on the nose. Not one of them moves up this river.'
        : reach < 0.5
          ? 'They can work up as far as the Wallabout and no further, and slowly.'
          : reach < 0.85
            ? 'They lay it, with the tide against them. The ferry is within reach by morning.'
            : 'Dead fair. They are past the ferry on one tide and the army is cut off on this island.';

    this.ask.innerHTML =
      `<span class="n">the wind</span><strong>${name}</strong> &mdash; ${verdict}`;
    this.wire.innerHTML =
      '<span class="hdr">What a square-rigged ship can do</span>'
      + '<p>She will not lie closer than about six points off the wind. To come up this river from '
      + 'the Narrows she must head north-east, so a wind out of the north-east is dead on her nose '
      + 'in a mile-wide tidal race with the ebb under her, and she stays where she is.</p>'
      + `<p class="cite">Points tried: ${this.seen.size} of 8. It blew from the north-east from `
      + 'the twenty-seventh to the thirtieth and did not shift.</p>';
    this.wire.classList.add('on');
  }

  /** Turn the wind, and find out what it was worth. */
  async run(): Promise<WindResult> {
    this.open = true;
    this.root.classList.add('on');
    sfxDocument();
    this.wind = HISTORICAL;
    this.seen = new Set([HISTORICAL]);
    this.foot.innerHTML =
      '<span class="key">&larr; &rarr;</span>turn the wind'
      + '<span class="key">SPACE</span>put the sheet down';
    this.paint();

    for (;;) {
      const code = await this.key();
      if (code === 'Space' || code === 'Enter' || code === 'KeyE' || code === 'Escape') break;
      if (code === 'ArrowLeft' || code === 'KeyA') {
        this.wind = (this.wind + 7) % 8; sfxSelect(); this.seen.add(this.wind); this.paint();
      } else if (code === 'ArrowRight' || code === 'KeyD') {
        this.wind = (this.wind + 1) % 8; sfxSelect(); this.seen.add(this.wind); this.paint();
      }
    }

    sfxConfirm();
    this.open = false;
    this.root.classList.remove('on');
    return {
      tried: this.seen.size,
      sawTheRisk: [...this.seen].some((w) => REACH[w] >= 0.85),
    };
  }
}
