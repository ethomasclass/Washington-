/**
 * THE MAP TABLE — a drawn survey sheet, full screen, with tokens on it.
 *
 * The only screen in this game that is not a panel of text, and it exists for
 * one reason: Knox's march is a logistics problem, and a logistics problem
 * put in front of a student as four paragraphs of prose is a reading
 * comprehension exercise about oxen. Put in front of them as a sheet with a
 * route on it and a token they move, it is the thing itself — you decide how
 * many teams, which way round, what you are prepared to leave behind and how
 * you are going to pay, and then the dispatches come in over the next eight
 * weeks and tell you what your four decisions were worth.
 *
 * THE ARITHMETIC IS AUTHORED, NOT SIMULATED. Four choices, each worth a step
 * in each of two directions, resolving into exactly four possible outcomes
 * per axis:
 *
 *   guns arrived   23   38   51   59
 *   days late       0    9   17   26
 *
 * Fifty-nine and no days late is what actually happened, and it is reachable
 * — but only by the four decisions that Knox actually made, which are not
 * the obvious ones. Leaving the heavy pieces behind looks prudent and costs
 * you the guns that could reach Boston. Haggling over the teams looks
 * responsible and costs you a fortnight. That inversion is the teaching, and
 * it is the reason this is a screen and not a paragraph.
 *
 * NO GENERATED TEXT ON THE SHEET. Every place name is DOM text laid over the
 * canvas. The drawing underneath is coastline, water, hachures and a route,
 * and not one readable letter of it is drawn in pixels — the same rule the
 * documents obey, for the same reason.
 */

import { P } from '../palette';
import { hash, line as inkLine, px, rect, surface, type Surface } from '../engine/pixels';
import { sfxConfirm, sfxDocument, sfxSelect } from '../engine/audio';

export interface SurveyResult {
  guns: number;
  daysLate: number;
  /** Stable id for the decision record, so the run can be re-derived. */
  id: string;
}

/** The four outcomes on each axis, worst to best / best to worst. */
export const GUNS = [23, 38, 51, 59] as const;
export const DAYS_LATE = [0, 9, 17, 26] as const;

interface Choice {
  id: string;
  label: string;
  detail: string;
  /** Toward more guns arriving. */
  guns: -1 | 0 | 1;
  /** Toward arriving later. */
  late: -1 | 0 | 1;
  /** Requires a knowledge flag to be offered at all. */
  requires?: string;
  lockNote?: string;
}

interface Stage {
  id: string;
  /** What the player is being asked, in one line. */
  question: string;
  /** Where on the sheet the token stands while this is being decided. */
  at: [number, number];
  choices: Choice[];
  /** What comes back by express afterwards, keyed by choice id. */
  dispatch: Record<string, string>;
}

/* ---------------------------------------------------------------------- *
 * The route
 * ---------------------------------------------------------------------- */

/** Normalised positions on the sheet, and the order the train passes them. */
const ROUTE: Array<{ id: string; at: [number, number]; name: string; kind: 'fort' | 'town' }> = [
  { id: 'ticonderoga', at: [0.09, 0.13], name: 'Ticonderoga', kind: 'fort' },
  { id: 'fortgeorge', at: [0.17, 0.31], name: 'Fort George', kind: 'fort' },
  { id: 'albany', at: [0.31, 0.55], name: 'Albany', kind: 'town' },
  { id: 'claverack', at: [0.42, 0.68], name: 'the Hudson', kind: 'town' },
  { id: 'blandford', at: [0.60, 0.57], name: 'Blandford', kind: 'town' },
  { id: 'springfield', at: [0.70, 0.67], name: 'Springfield', kind: 'town' },
  { id: 'framingham', at: [0.82, 0.72], name: 'Framingham', kind: 'town' },
  { id: 'cambridge', at: [0.905, 0.79], name: 'Cambridge', kind: 'town' },
];

const STAGES: Stage[] = [
  {
    id: 'teams',
    question: 'The guns are at the fort and nothing in this country will move them but oxen.',
    at: [0.13, 0.22],
    choices: [
      {
        id: 'eighty',
        label: 'Eighty yoke, at the asking price',
        detail:
          'Take every team between the lake and Saratoga at what the farmers ask, and do not '
          + 'argue about it.',
        guns: 1, late: -1,
      },
      {
        id: 'forty',
        label: 'Forty yoke, and haggle',
        detail:
          'Half the teams, at half the price, and make two journeys of it. The army has no money '
          + 'and every shilling of this is on credit.',
        guns: -1, late: 1,
      },
      {
        id: 'impress',
        label: 'Impress them under warrant',
        detail:
          'Take the teams by military warrant and pay in certificates the holder may present to '
          + 'Congress at some future date.',
        guns: 0, late: 1,
      },
    ],
    dispatch: {
      eighty:
        'Fort George, 5 December. Eighty yoke engaged and forty-two sledges built. The farmers '
        + 'came in willingly, which Knox attributes to being paid, and which is probably right.',
      forty:
        'Fort George, 9 December. Forty yoke only. Colonel Knox writes that he will make two '
        + 'journeys of it and that the second will be made in worse weather than the first, and '
        + 'he is not wrong about that.',
      impress:
        'Fort George, 8 December. Teams obtained under warrant. Three drivers have gone home and '
        + 'taken their oxen with them, and there is no court between here and Albany that would '
        + 'convict a man for it.',
    },
  },
  {
    id: 'route',
    question: 'Down the lake to Albany, and then a river that is not yet a road.',
    at: [0.26, 0.48],
    choices: [
      {
        id: 'ice_road',
        label: 'Wait, and cross on the ice',
        detail:
          'Hold at Albany until the Hudson bears, then take the sledges straight over and down '
          + 'the frozen river. Faster than any road, if it holds.',
        guns: 0, late: -1,
      },
      {
        id: 'land_road',
        label: 'Go round by the post road',
        detail:
          'Do not wait for the river. Take the land road south and east, which is longer, worse, '
          + 'and there whatever the weather does.',
        guns: 1, late: 1,
      },
      {
        id: 'split',
        label: 'Split the train',
        detail:
          'Send the light pieces round by road and hold the heavy ones for the ice. Two problems '
          + 'instead of one, and half a solution to each.',
        guns: -1, late: 0,
      },
    ],
    dispatch: {
      ice_road:
        'Albany, 25 December. The river bore, and then it did not: a sledge with an eighteen-'
        + 'pounder went through at Half Moon and was fished up with the help of the whole town. '
        + 'Knox reports the gun undamaged and calls it, in writing, the drowned piece.',
      land_road:
        'Albany, 28 December. Gone round by the road. General Schuyler writes that Colonel Knox '
        + 'has not slept in a bed since the seventeenth and appears not to have noticed.',
      split:
        'Albany, 30 December. The train is in two parts thirty miles apart and neither half has '
        + 'the teams to move the other. Knox has gone back for the second himself.',
    },
  },
  {
    id: 'load',
    question: 'Between here and Cambridge there is a range of hills nobody has taken a gun over.',
    at: [0.53, 0.60],
    choices: [
      {
        id: 'everything',
        label: 'Everything, over the hills',
        detail:
          'All fifty-nine pieces, mortars included, up the Berkshires and down the other side '
          + 'with ropes and drag-chains on every sledge.',
        guns: 1, late: 1,
      },
      {
        id: 'leave_heaviest',
        label: 'Leave the heavy mortars',
        detail:
          'Take what the hills will bear and leave the rest at Springfield to be sent for. Half '
          + 'the labour and half the risk.',
        guns: -1, late: -1,
      },
    ],
    dispatch: {
      everything:
        'Blandford, 10 January. The drivers refused the descent and Knox argued with them in the '
        + 'road for two hours, then went down first himself with a chain on his own sledge. They '
        + 'followed. Nothing was lost.',
      leave_heaviest:
        'Springfield, 12 January. The heavy pieces are in a barn under guard. They are the only '
        + 'guns in the train that could reach the shipping in Boston harbour, and they are one '
        + 'hundred miles from it.',
    },
  },
  {
    id: 'money',
    question: 'The teams change at Springfield and the fresh drivers want paying before they start.',
    at: [0.78, 0.71],
    choices: [
      {
        id: 'hard_money',
        label: 'Send hard money ahead',
        detail:
          'Strip the military chest and send coin ahead by express, so that the money is at '
          + 'Springfield before the guns are.',
        guns: 0, late: -1,
      },
      {
        id: 'certificates',
        label: 'Pay in certificates',
        detail:
          'Congress paper, against a Congress that has been in existence for eighteen months and '
          + 'has never yet paid anybody in silver.',
        guns: 0, late: 1,
      },
      {
        id: 'schuyler',
        label: "Let Schuyler stand surety",
        detail:
          'Ask General Schuyler to underwrite the whole train on his own private credit, which '
          + 'he has already done twice this winter without being asked.',
        requires: 'doc.a2.knox',
        lockNote: "you have not read Knox's own account, and do not know who has been paying for this",
        guns: 1, late: -1,
      },
    ],
    dispatch: {
      hard_money:
        'Springfield, 20 January. Paid in coin and the teams turned out at first light. Knox '
        + 'notes that this is the first time in the war that anything has been paid for on the '
        + 'day it was owed.',
      certificates:
        'Springfield, 24 January. The drivers took the certificates and then took four days to '
        + 'find their oxen. Nobody refused. Nobody hurried.',
      schuyler:
        'Springfield, 18 January. General Schuyler&rsquo;s note answered on sight. He has now '
        + 'lent this army more of his own money than Congress has voted it, and has mentioned it '
        + 'to nobody.',
    },
  },
];

/* ---------------------------------------------------------------------- *
 * The sheet
 * ---------------------------------------------------------------------- */

const SHEET_W = 640, SHEET_H = 400;

/**
 * The drawing.
 *
 * A surveyor's sheet: laid paper, a lake, a river, hachured hills, a compass
 * rose and a scale bar. Everything is drawn from `hash()` rather than
 * `Math.random()`, so the same sheet comes up on every machine in the room —
 * which matters more here than anywhere else in the game, because a teacher
 * is going to point at it.
 */
function drawSheet(): Surface {
  const s = surface(SHEET_W, SHEET_H);
  const g = s.g;

  // Laid paper, with the chain lines a hand-made sheet actually has.
  rect(g, 0, 0, SHEET_W, SHEET_H, P.paper);
  for (let y = 0; y < SHEET_H; y += 2) {
    for (let x = 0; x < SHEET_W; x++) if (hash(x, y, 3) < 0.05) px(g, x, y, P.paperDim);
  }
  for (let x = 18; x < SHEET_W; x += 26) {
    for (let y = 0; y < SHEET_H; y++) if (hash(x, y, 5) < 0.5) px(g, x, y, P.paperDim);
  }
  // Foxing, in the corners, where a sheet that has been rolled up gets it.
  for (let i = 0; i < 260; i++) {
    const cx = hash(i, 0, 7) < 0.5 ? hash(i, 1, 8) * 90 : SHEET_W - hash(i, 1, 8) * 90;
    const cy = hash(i, 2, 9) < 0.5 ? hash(i, 3, 10) * 70 : SHEET_H - hash(i, 3, 10) * 70;
    px(g, cx | 0, cy | 0, P.buffD);
  }

  const X = (t: number) => Math.round(t * SHEET_W);
  const Y = (t: number) => Math.round(t * SHEET_H);

  // --- Lake George and Lake Champlain, running down from the fort --------
  const lake: Array<[number, number]> = [
    [0.075, 0.05], [0.09, 0.14], [0.115, 0.21], [0.14, 0.27], [0.165, 0.32],
  ];
  for (let i = 0; i < lake.length - 1; i++) {
    for (let w = -7; w <= 7; w++) {
      inkLine(g, X(lake[i][0]) + w, Y(lake[i][1]), X(lake[i + 1][0]) + w, Y(lake[i + 1][1]),
        Math.abs(w) > 5 ? P.blueD : '#B9CBD6');
    }
  }

  // --- the Hudson, south from Albany ------------------------------------
  const hudson: Array<[number, number]> = [
    [0.245, 0.40], [0.285, 0.50], [0.315, 0.58], [0.355, 0.68], [0.375, 0.80], [0.39, 0.95],
  ];
  for (let i = 0; i < hudson.length - 1; i++) {
    for (let w = -5; w <= 5; w++) {
      inkLine(g, X(hudson[i][0]) + w, Y(hudson[i][1]), X(hudson[i + 1][0]) + w, Y(hudson[i + 1][1]),
        Math.abs(w) > 3 ? P.blueD : '#B9CBD6');
    }
  }

  // --- the Berkshires, in hachures. A surveyor draws hills as combs -----
  for (let i = 0; i < 46; i++) {
    const t = i / 45;
    const bx = X(0.47 + t * 0.20);
    const by = Y(0.44 + Math.sin(t * Math.PI * 2.2) * 0.055 + t * 0.10);
    const n = 4 + Math.floor(hash(i, 0, 11) * 4);
    for (let k = 0; k < n; k++) {
      const len = 4 + Math.floor(hash(i, k, 12) * 7);
      inkLine(g, bx + k * 2, by, bx + k * 2 - 1, by + len, P.inkSoft);
    }
  }
  // A second, lower range east of the first, so the country reads as country.
  for (let i = 0; i < 26; i++) {
    const t = i / 25;
    const bx = X(0.74 + t * 0.11);
    const by = Y(0.55 + Math.sin(t * Math.PI * 1.6) * 0.03 + t * 0.06);
    for (let k = 0; k < 3; k++) inkLine(g, bx + k * 2, by, bx + k * 2 - 1, by + 5, P.inkSoft);
  }

  // --- the coast, bottom right. Boston harbour, and the reason for all of it
  const coast: Array<[number, number]> = [
    [1.00, 0.60], [0.985, 0.66], [0.99, 0.73], [0.965, 0.80], [0.98, 0.88], [0.955, 0.97],
  ];
  for (let i = 0; i < coast.length - 1; i++) {
    inkLine(g, X(coast[i][0]), Y(coast[i][1]), X(coast[i + 1][0]), Y(coast[i + 1][1]), P.ink);
    inkLine(g, X(coast[i][0]) + 3, Y(coast[i][1]), X(coast[i + 1][0]) + 3, Y(coast[i + 1][1]), P.blueD);
  }
  for (let i = 0; i < 400; i++) {
    const t = hash(i, 1, 13);
    const cx = X(0.965 + hash(i, 2, 14) * 0.035);
    const cy = Y(0.62 + t * 0.36);
    if (hash(i, 3, 15) < 0.4) px(g, cx, cy, '#B9CBD6');
  }

  // --- the route: a dashed line through every waypoint -------------------
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const [x0, y0] = ROUTE[i].at, [x1, y1] = ROUTE[i + 1].at;
    const steps = 60;
    for (let k = 0; k <= steps; k++) {
      if ((k >> 1) % 2 === 0) continue;
      const t = k / steps;
      px(g, X(x0 + (x1 - x0) * t), Y(y0 + (y1 - y0) * t), P.scarletD);
      px(g, X(x0 + (x1 - x0) * t), Y(y0 + (y1 - y0) * t) + 1, P.scarletD);
    }
  }

  // --- the marks. A fort is a square bastion; a town is a circle ---------
  for (const r of ROUTE) {
    const cx = X(r.at[0]), cy = Y(r.at[1]);
    if (r.kind === 'fort') {
      rect(g, cx - 4, cy - 4, 9, 9, P.paper);
      inkLine(g, cx - 4, cy - 4, cx + 4, cy - 4, P.ink);
      inkLine(g, cx - 4, cy + 4, cx + 4, cy + 4, P.ink);
      inkLine(g, cx - 4, cy - 4, cx - 4, cy + 4, P.ink);
      inkLine(g, cx + 4, cy - 4, cx + 4, cy + 4, P.ink);
      // Bastions at the corners, which is how a fort is drawn and not a house.
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
        inkLine(g, cx + dx * 4, cy + dy * 4, cx + dx * 7, cy + dy * 7, P.ink);
      }
    } else {
      for (let a = 0; a < 32; a++) {
        const t = (a / 32) * Math.PI * 2;
        px(g, Math.round(cx + Math.cos(t) * 4), Math.round(cy + Math.sin(t) * 4), P.ink);
      }
      px(g, cx, cy, P.ink);
    }
  }

  // --- a compass rose, north to the top left ------------------------------
  const rx = X(0.115), ry = Y(0.86);
  for (let a = 0; a < 8; a++) {
    const t = (a / 8) * Math.PI * 2;
    const len = a % 2 === 0 ? 22 : 12;
    inkLine(g, rx, ry, Math.round(rx + Math.cos(t) * len), Math.round(ry + Math.sin(t) * len),
      a === 6 ? P.scarletD : P.inkSoft);
  }
  for (let a = 0; a < 48; a++) {
    const t = (a / 48) * Math.PI * 2;
    px(g, Math.round(rx + Math.cos(t) * 25), Math.round(ry + Math.sin(t) * 25), P.inkSoft);
  }

  // --- a scale bar, in miles ---------------------------------------------
  const sbx = X(0.30), sby = Y(0.885);
  rect(g, sbx, sby, 120, 5, P.paper);
  for (let i = 0; i < 6; i++) rect(g, sbx + i * 20, sby, 20, 5, i % 2 ? P.ink : P.paper);
  for (let i = 0; i <= 6; i++) inkLine(g, sbx + i * 20, sby - 3, sbx + i * 20, sby + 8, P.ink);
  inkLine(g, sbx, sby, sbx + 120, sby, P.ink);
  inkLine(g, sbx, sby + 5, sbx + 120, sby + 5, P.ink);

  // --- a border, ruled twice, as a surveyor rules one --------------------
  for (const inset of [8, 12]) {
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

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, cls?: string, html?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

/** Bucket a running score of -4..+4 into one of the four authored outcomes. */
function bucket(score: number): 0 | 1 | 2 | 3 {
  if (score <= -2) return 0;
  if (score <= 0) return 1;
  if (score <= 2) return 2;
  return 3;
}

export class SurveySheet {
  readonly root: HTMLDivElement;
  private board: HTMLDivElement;
  private token: HTMLDivElement;
  private ask: HTMLDivElement;
  private opts: HTMLDivElement;
  private wire: HTMLDivElement;
  private foot: HTMLDivElement;

  private resolveKey: ((code: string) => void) | null = null;

  constructor() {
    this.root = el('div');
    this.root.id = 'survey';

    const frame = el('div', 'frame');
    this.board = el('div', 'board');
    this.board.style.backgroundImage = `url(${sheetUrl()})`;

    // Place names, as DOM text over the drawing. Nothing readable is ever
    // rendered into the canvas — same rule the documents obey.
    for (const r of ROUTE) {
      // Anything past two thirds across hangs its label back over the sheet,
      // or the last three names on the route run off the paper.
      const lab = el('span', `place${r.at[0] > 0.66 ? ' right' : ''}`, r.name);
      lab.style.left = `${r.at[0] * 100}%`;
      lab.style.top = `${r.at[1] * 100}%`;
      this.board.append(lab);
    }
    const scale = el('span', 'scale', '0 &nbsp; &nbsp;20 &nbsp;&nbsp; 40 &nbsp;&nbsp; 60 miles');
    scale.style.left = '30%';
    scale.style.top = '91%';
    this.board.append(scale);
    const north = el('span', 'north', 'N');
    north.style.left = '11.5%';
    north.style.top = '78%';
    this.board.append(north);

    this.token = el('div', 'token');
    this.board.append(this.token);

    this.ask = el('div', 'ask');
    this.opts = el('div', 'opts');
    this.wire = el('div', 'wire');
    this.foot = el('div', 'foot');

    frame.append(
      el('div', 'head',
        '<span class="ttl">A Survey of the Country between Ticonderoga and Cambridge</span>'
        + '<span class="sub">the train of artillery &mdash; December 1775</span>'),
      this.board, this.ask, this.opts, this.wire, this.foot,
    );
    this.root.append(frame);

    window.addEventListener('keydown', (e) => {
      if (!this.root.classList.contains('on')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this.resolveKey) {
        const r = this.resolveKey;
        this.resolveKey = null;
        r(e.code);
      }
    });
  }

  private key(codes: string[] = []): Promise<string> {
    return new Promise((resolve) => {
      const onKey = (code: string) => {
        if (codes.length && !codes.includes(code)) { this.resolveKey = onKey; return; }
        resolve(code);
      };
      this.resolveKey = onKey;
    });
  }

  private moveToken(at: [number, number]): void {
    this.token.style.left = `${at[0] * 100}%`;
    this.token.style.top = `${at[1] * 100}%`;
  }

  /**
   * Run the whole sequence and return what arrived, and when.
   *
   * Four questions, a dispatch after each, and a fifth dispatch that is the
   * arrival. If the player has already done this, `replay` shows them the
   * sheet with the result on it and asks nothing.
   */
  async run(knowledge: ReadonlySet<string>): Promise<SurveyResult> {
    this.root.classList.add('on');
    sfxDocument();
    this.moveToken(ROUTE[0].at);
    this.board.classList.add('lit');

    let gunScore = 0, lateScore = 0;
    const picked: string[] = [];

    for (let si = 0; si < STAGES.length; si++) {
      const stage = STAGES[si];
      this.moveToken(stage.at);
      this.ask.innerHTML =
        `<span class="n">${si + 1} of ${STAGES.length}</span>${stage.question}`;
      this.wire.classList.remove('on');
      this.foot.innerHTML =
        '<span class="key">&larr; &rarr;</span> choose &nbsp; <span class="key">SPACE</span> settle it';

      const rows = stage.choices.map((c) => {
        const locked = !!c.requires && !knowledge.has(c.requires);
        const row = el('button', `opt${locked ? ' locked' : ''}`);
        row.innerHTML =
          `<span class="lab">${c.label}</span><span class="det">${c.detail}</span>`
          + (locked ? `<span class="lock">&mdash; ${c.lockNote}</span>` : '');
        return { c, row, locked };
      });
      this.opts.innerHTML = '';
      for (const r of rows) this.opts.append(r.row);

      const open = rows.filter((r) => !r.locked);
      let i = 0;
      const paint = () => {
        rows.forEach((r) => r.row.classList.remove('on'));
        open[i].row.classList.add('on');
      };
      paint();

      for (;;) {
        const code = await this.key();
        if (code === 'ArrowLeft' || code === 'ArrowUp' || code === 'KeyA' || code === 'KeyW') {
          i = (i - 1 + open.length) % open.length; sfxSelect(); paint();
        } else if (code === 'ArrowRight' || code === 'ArrowDown' || code === 'KeyD' || code === 'KeyS') {
          i = (i + 1) % open.length; sfxSelect(); paint();
        } else if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
          break;
        }
      }

      const chosen = open[i].c;
      sfxConfirm();
      picked.push(chosen.id);
      gunScore += chosen.guns;
      lateScore += chosen.late;

      // The train moves, and eight days later a rider comes in.
      this.opts.innerHTML = '';
      this.moveToken(ROUTE[Math.min(ROUTE.length - 1, si * 2 + 2)].at);
      this.wire.innerHTML =
        `<span class="hdr">By express</span><p>${stage.dispatch[chosen.id]}</p>`;
      this.wire.classList.add('on');
      this.foot.innerHTML = '<span class="key">SPACE</span> read on';
      await this.key(['Space', 'Enter', 'KeyE']);
    }

    /*
     * The two axes, bucketed.
     *
     * Worth checking the historical path by hand, because it is the one that
     * has to land exactly: eighty yoke (+1 gun, -1 late), the ice road (0,
     * -1), everything over the hills (+1, +1), Schuyler's surety (+1, -1).
     * That is a gun score of +3 and a late score of -2 — fifty-nine pieces,
     * not a day late, which is what happened. And it is only reachable by a
     * player who read Knox's own account, because that is where Schuyler is.
     */
    const guns = GUNS[bucket(gunScore)];
    const daysLate = DAYS_LATE[bucket(lateScore)];

    this.moveToken(ROUTE[ROUTE.length - 1].at);
    this.ask.innerHTML = '<span class="n">the fifth dispatch</span>The train is in.';
    this.wire.innerHTML =
      `<span class="hdr">Cambridge, ${daysLate === 0 ? '24' : daysLate === 9 ? '2' : daysLate === 17 ? '10' : '19'} `
      + `${daysLate < 9 ? 'January' : 'February'} 1776</span>`
      + `<p><strong>${guns} pieces</strong> of ordnance brought into camp, `
      + `${daysLate === 0
        ? 'on the day Colonel Knox undertook to bring them.'
        : `${daysLate} days later than he undertook.`}</p>`
      + `<p>${
        guns === 59
          ? 'Every gun that was at Ticonderoga is now at Cambridge, including the heavy pieces, '
            + 'which are the only ones on this continent that can reach the shipping in Boston '
            + 'harbour from Dorchester Heights.'
          : guns === 51
            ? 'Nearly the whole train, and enough of the heavy metal to be worth putting on a '
              + 'hill. What is missing is missing because somebody was careful.'
            : guns === 38
              ? 'Two thirds of it, and not the two thirds that mattered most. The mortars are in '
                + 'a barn at Springfield with a guard on them.'
              : 'A third of what was at the fort. It is more artillery than this army has ever '
                + 'had, and it is not enough to make a British admiral move his ships.'
      }</p>`
      + `<p class="cite">${daysLate === 0
        ? 'This is what happened: 59 pieces, about 60 tons, some 300 miles, in 56 days.'
        : 'What happened was 59 pieces in 56 days. The difference is your four decisions.'}</p>`;
    this.wire.classList.add('on');
    this.foot.innerHTML = '<span class="key">SPACE</span> roll the sheet up';
    await this.key(['Space', 'Enter', 'KeyE']);

    this.root.classList.remove('on');
    return { guns, daysLate, id: picked.join('-') };
  }

  /** The sheet again, after it has been settled. Asks nothing. */
  async replay(result: SurveyResult): Promise<void> {
    this.root.classList.add('on');
    sfxDocument();
    this.moveToken(ROUTE[ROUTE.length - 1].at);
    this.ask.innerHTML = '<span class="n">settled</span>The train came in, and this is what came in with it.';
    this.opts.innerHTML = '';
    this.wire.innerHTML =
      `<span class="hdr">The account of it</span>`
      + `<p><strong>${result.guns} pieces</strong> brought into camp, `
      + `${result.daysLate === 0 ? 'on the day undertaken' : `${result.daysLate} days late`}.</p>`;
    this.wire.classList.add('on');
    this.foot.innerHTML = '<span class="key">SPACE</span> roll the sheet up';
    await this.key(['Space', 'Enter', 'KeyE']);
    this.root.classList.remove('on');
  }
}
