/**
 * THE NORTHERN DEPARTMENT — the third map table, and the only one about a
 * battle the player was not at.
 *
 * `docs/05` §5.4 folds Saratoga in here rather than giving it an act, and
 * the reason it works is that a map is the honest way to deliver a battle
 * somebody else fought: Washington was two hundred miles south of it, was
 * not consulted about it, and learned it the way this table learns it —
 * from despatches, weeks late, written by men with reasons.
 *
 * THREE SHEETS, AND EACH ONE DOES A DIFFERENT JOB.
 *
 * 1. THE PLAN. Three armies were supposed to converge on Albany: Burgoyne
 *    south from Canada, St. Leger east down the Mohawk, and Howe (or
 *    Clinton, in the event) north up the Hudson. The player picks each
 *    column and finds out what became of it. Only one of them arrived, and
 *    the reason the other two did not is in each case unglamorous and
 *    specific. This is what a campaign plan failing actually looks like and
 *    it is nothing like a battlefield.
 *
 * 2. THE FIELD, 7 OCTOBER. Two markers: where Gates was, and where Arnold
 *    went. The despatch to Congress and Arnold's own account are both
 *    readable and they disagree about the same afternoon. The student
 *    watches one man win a battle and another man report it.
 *
 * 3. WHAT IT BOUGHT. France recognised the United States on 6 February 1778
 *    because Burgoyne surrendered in October, and the table shows what that
 *    meant materially rather than sentimentally: a fleet, a loan, and cloth.
 *
 * THE ARNOLD SEED IS THE WHOLE POINT OF PUTTING THIS HERE. When he turns in
 * 1780 the student will already have stood at this table and seen the
 * despatch with no names in it. The game never excuses him and never has
 * to, because it does not need to editorialise about a document the player
 * has read for themselves.
 */

import { P } from '../palette';
import { hash, line as inkLine, px, rect, surface, type Surface } from '../engine/pixels';
import { sfxCancel, sfxConfirm, sfxDocument, sfxSelect } from '../engine/audio';
import { KEY_GO } from '../engine/touch';

const SHEET_W = 520, SHEET_H = 420;

export interface NorthernResult {
  /** Every flag the table earned, for the caller to fold into knowledge. */
  learned: string[];
}

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
 * The northern department: Champlain at the top, the Hudson running down to
 * Albany, the Mohawk coming in from the west, and New York a long way south.
 *
 * A staff map rather than a survey. It is drawn in one hand, in ink, with
 * the water in a wash and the roads as broken lines, and it has the two
 * things a staff map has that a survey does not: distances that matter and
 * arrows that were somebody's intention.
 */
function drawSheet(): Surface {
  const s = surface(SHEET_W, SHEET_H);
  const g = s.g;
  const X = (t: number) => Math.round(t * SHEET_W);
  const Y = (t: number) => Math.round(t * SHEET_H);

  rect(g, 0, 0, SHEET_W, SHEET_H, P.paper);
  for (let y = 0; y < SHEET_H; y += 2) {
    for (let x = 0; x < SHEET_W; x++) if (hash(x, y, 31) < 0.05) px(g, x, y, P.paperDim);
  }

  // --- the water ---------------------------------------------------------
  const water = (pts: Array<[number, number]>, wide: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      for (let k = 0; k <= 90; k++) {
        const t = k / 90;
        const x = X(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t);
        const y = Y(pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t);
        for (let w = -wide; w <= wide; w++) {
          px(g, x + w, y, Math.abs(w) > wide - 2 ? P.blueD : '#C2D3DD');
        }
      }
    }
  };
  // Lake Champlain and Lake George, coming down out of Canada.
  water([[0.46, 0.02], [0.45, 0.12], [0.44, 0.24], [0.45, 0.34]], 9);
  // The Hudson, from Fort Edward down past Bemis Heights to Albany and on.
  water([[0.45, 0.34], [0.47, 0.46], [0.49, 0.60], [0.52, 0.76], [0.55, 0.98]], 7);
  // The Mohawk, in from the west.
  water([[0.02, 0.52], [0.16, 0.51], [0.32, 0.53], [0.46, 0.56]], 5);

  // --- the country -------------------------------------------------------
  // Hills, as hachure clumps, on both sides of the Hudson.
  for (let i = 0; i < 130; i++) {
    const x = X(0.06 + hash(i, 1, 41) * 0.86);
    const y = Y(0.06 + hash(i, 2, 42) * 0.86);
    // Keep off the rivers.
    if (Math.abs(x - X(0.47)) < 22 && y > Y(0.30)) continue;
    if (Math.abs(x - X(0.45)) < 24 && y < Y(0.34)) continue;
    for (let k = 0; k < 5; k++) {
      inkLine(g, x + k * 2, y, x + k * 2 - 1, y + 5, P.paperDim);
    }
  }
  // Woods, as stipple, west of the Hudson where Burgoyne's road was.
  for (let i = 0; i < 2400; i++) {
    const x = X(0.20 + hash(i, 3, 43) * 0.24);
    const y = Y(0.10 + hash(i, 4, 44) * 0.42);
    if (hash(i, 5, 45) < 0.30) px(g, x, y, P.paperDim);
  }

  /*
   * THE THREE ARROWS, AND THE TWO THAT STOP.
   *
   * Burgoyne's runs the whole way down and ends at Bemis Heights.
   * St. Leger's comes in from the west and stops dead at Fort Stanwix.
   * Clinton's comes up from the south and stops forty-five miles short.
   *
   * The two that stop are drawn BROKEN, and the break is where they
   * stopped. Nothing on the sheet says which is which — that is what the
   * three options on the first page are for.
   */
  const arrow = (pts: Array<[number, number]>, solid: boolean, colour: string) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const ax = X(pts[i][0]), ay = Y(pts[i][1]);
      const bx = X(pts[i + 1][0]), by = Y(pts[i + 1][1]);
      if (solid) {
        inkLine(g, ax, ay, bx, by, colour);
        inkLine(g, ax, ay + 1, bx, by + 1, colour);
      } else {
        // Dashed: drawn as short segments with gaps, which on a staff map
        // is what an intention that did not happen looks like.
        const n = 14;
        for (let k = 0; k < n; k += 2) {
          const t0 = k / n, t1 = (k + 1) / n;
          inkLine(g,
            Math.round(ax + (bx - ax) * t0), Math.round(ay + (by - ay) * t0),
            Math.round(ax + (bx - ax) * t1), Math.round(ay + (by - ay) * t1), colour);
        }
      }
    }
  };
  arrow([[0.46, 0.04], [0.45, 0.22], [0.44, 0.34], [0.46, 0.46]], true, P.scarletD);
  arrow([[0.04, 0.50], [0.18, 0.50], [0.30, 0.52]], false, P.scarletD);
  arrow([[0.56, 0.97], [0.55, 0.86], [0.54, 0.78]], false, P.scarletD);

  // --- the places --------------------------------------------------------
  const mark = (tx: number, ty: number, big = false) => {
    const x = X(tx), y = Y(ty);
    if (big) {
      rect(g, x - 4, y - 4, 9, 9, P.ink);
      rect(g, x - 2, y - 2, 5, 5, P.paper);
    } else {
      rect(g, x - 2, y - 2, 5, 5, P.ink);
    }
  };
  mark(0.46, 0.03);          // St. Johns, and Canada beyond
  mark(0.44, 0.30);          // Fort Edward
  mark(0.46, 0.47, true);    // Bemis Heights
  mark(0.50, 0.62, true);    // Albany
  mark(0.30, 0.52);          // Fort Stanwix
  mark(0.55, 0.95);          // New York
  return s;
}

let SHEET: string | null = null;
function sheetUrl(): string {
  if (!SHEET) SHEET = drawSheet().canvas.toDataURL();
  return SHEET;
}

/* ---------------------------------------------------------------------- *
 * The content
 * ---------------------------------------------------------------------- */

interface Choice {
  id: string;
  label: string;
  detail: string;
  /** Where the token goes when this is picked. */
  at: [number, number];
  answer: string;
  grants: string;
}

interface Stage {
  question: string;
  choices: Choice[];
}

/**
 * The three sheets.
 *
 * Every one of these answers is a fact with a citation behind it and none of
 * them is the version in the textbook, which is generally "the Americans won
 * at Saratoga and France joined the war".
 */
const STAGES: Stage[] = [
  {
    question:
      'Three armies were to meet at Albany. Which of them arrived?',
    choices: [
      {
        id: 'burgoyne',
        label: 'Burgoyne, from Canada',
        detail: 'Eight thousand men, south by Champlain',
        at: [0.45, 0.24],
        grants: 'obs.a5.burgoyne',
        answer:
          'He arrived, and that is the whole of his difficulty. He took Ticonderoga in July '
          + 'without a fight and then spent twenty-four days making twenty-three miles through '
          + 'woods that Schuyler had felled across the road ahead of him, dragging a siege train '
          + 'and thirty carts of his own baggage. By the time he reached the Hudson his supply ran '
          + 'back a hundred and eighty-five miles to Canada and he had lost a thousand men at '
          + 'Bennington trying to fix it. He surrendered five thousand seven hundred on the '
          + 'seventeenth of October.',
      },
      {
        id: 'stleger',
        label: 'St. Leger, from the west',
        detail: 'Down the Mohawk, with Iroquois allies',
        at: [0.30, 0.52],
        grants: 'obs.a5.stleger',
        answer:
          'He did not. He was held at Fort Stanwix for three weeks by a garrison that would not '
          + 'go, and then Arnold sent a man ahead of his relief column to tell the besiegers that '
          + 'the Americans were coming in overwhelming force, which was untrue. The Iroquois left. '
          + 'St. Leger went back to Canada having fought no battle he did not win and achieved '
          + 'nothing whatever.',
      },
      {
        id: 'clinton',
        label: 'Up the Hudson, from New York',
        detail: 'The third column, and the one that mattered',
        at: [0.55, 0.86],
        grants: 'obs.a5.clinton',
        answer:
          'Howe took the army to Philadelphia instead &mdash; which is where you were, at '
          + 'Brandywine and Germantown, all autumn. Clinton, left in New York with what remained, '
          + 'went up the Hudson in October, took two forts, burned Kingston, got to within about '
          + 'forty-five miles of Albany, and turned around. The northern campaign was a plan that '
          + 'required three armies and was executed by one.',
      },
    ],
  },
  {
    question:
      'The seventh of October, at Bemis Heights. Where was the fighting decided?',
    choices: [
      {
        id: 'gates',
        label: "Gates's headquarters",
        detail: 'Two miles behind the line',
        at: [0.49, 0.55],
        grants: 'obs.a5.gates_hq',
        answer:
          'He was there for the whole of it. That is not in itself a criticism &mdash; a general '
          + 'commanding is entitled to be where he can be found, and Gates had chosen the ground '
          + 'at Bemis Heights, which was the single best decision of the campaign and won it. His '
          + 'despatch to Congress, three days later, names no officer below himself and reports '
          + 'that the success was owing chiefly to the spirit of the troops. He also sent it '
          + 'directly to Congress rather than through his commander-in-chief.',
      },
      {
        id: 'breymann',
        label: 'The Breymann redoubt',
        detail: 'The right of the British line',
        at: [0.44, 0.44],
        grants: 'obs.a5.breymann',
        answer:
          'Arnold had been relieved of his command after a quarrel with Gates and was under '
          + 'orders to remain in camp. He heard the firing, rode to it without orders, put himself '
          + 'at the head of regiments that were not his, and carried the redoubt at the point of '
          + 'the bayonet, which ended the battle. He was shot in the entrance of the sally-port, '
          + 'in the leg he had already broken at Quebec, and his horse was killed under him.',
      },
      {
        id: 'ground',
        label: 'The ground itself',
        detail: 'Chosen in September, by Kosciuszko',
        at: [0.46, 0.47],
        grants: 'obs.a5.ground',
        answer:
          'Thaddeus Kosciuszko, a Polish engineer, laid out the works on the bluff at Bemis '
          + 'Heights in September: a position astride the only road, with the river on one flank '
          + 'and broken ground on the other, that Burgoyne could neither turn nor go round nor '
          + 'leave behind him. Gates chose to take his advice. It is the reason there was a battle '
          + 'there at all, and Kosciuszko is in nobody&rsquo;s despatch either.',
      },
    ],
  },
  {
    question:
      'Saratoga is why France came in. What did that actually mean?',
    choices: [
      {
        id: 'fleet',
        label: 'A fleet',
        detail: 'The thing this war has never had',
        at: [0.55, 0.95],
        grants: 'obs.a5.fleet',
        answer:
          'D&rsquo;Estaing sails in April with twelve ships of the line. Every campaign of this '
          + 'war so far has been decided by a British fleet going wherever it liked while you '
          + 'walked. From now on that is a contest, and in three years a French fleet at the mouth '
          + 'of the Chesapeake will be the whole of the reason Yorktown is possible.',
      },
      {
        id: 'money',
        label: 'A loan, and cloth',
        detail: 'What an army wears and is paid in',
        at: [0.50, 0.62],
        grants: 'obs.a5.loan',
        answer:
          'Subsidies, then loans, then more loans, and by the end of it France has spent something '
          + 'over a billion livres on this and will be bankrupt within eleven years, which is a '
          + 'sentence worth reading twice with 1789 in mind. It also means uniform cloth. The men '
          + 'you are looking at have no coats. In eighteen months they will, and they will be blue, '
          + 'and they will have come from France.',
      },
      {
        id: 'war',
        label: 'A world war',
        detail: 'Which is what this becomes',
        at: [0.46, 0.03],
        grants: 'obs.a5.worldwar',
        answer:
          'Spain in 1779, the Dutch in 1780, and fighting in the West Indies, at Gibraltar, off '
          + 'India and in West Africa. Britain stops being an empire putting down a colonial '
          + 'rebellion and becomes a power fighting three navies at once with no ally in Europe. '
          + 'The thirteen states become one theatre of several, and not always the one getting the '
          + 'ships.',
      },
    ],
  },
];

/* ---------------------------------------------------------------------- *
 * The panel
 * ---------------------------------------------------------------------- */

export class NorthernTable {
  readonly root: HTMLDivElement;
  private board: HTMLDivElement;
  private token: HTMLSpanElement;
  private ask: HTMLDivElement;
  private opts: HTMLDivElement;
  private wire: HTMLDivElement;
  private foot: HTMLDivElement;
  private resolveKey: ((code: string) => void) | null = null;
  private open = false;

  constructor() {
    this.root = el('div', 'sheetui');
    this.root.id = 'northern';
    const frame = el('div', 'frame');

    this.board = el('div', 'board');
    this.board.style.backgroundImage = `url(${sheetUrl()})`;
    for (const [name, x, y] of [
      ['Canada', 0.46, 0.02], ['Fort Edward', 0.42, 0.29],
      ['Bemis Heights', 0.47, 0.47], ['Albany', 0.51, 0.62],
      ['Fort Stanwix', 0.24, 0.52], ['New York', 0.56, 0.95],
    ] as const) {
      const lab = el('span', `place${x > 0.5 ? ' right' : ''}`, name);
      lab.style.left = `${x * 100}%`;
      lab.style.top = `${y * 100}%`;
      this.board.append(lab);
    }
    this.token = el('span', 'token');
    this.board.append(this.token);

    this.ask = el('div', 'ask');
    this.opts = el('div', 'opts');
    this.wire = el('div', 'wire');
    this.foot = el('div', 'foot');
    frame.append(
      el('div', 'head',
        '<span class="ttl">The Northern Department</span>'
        + '<span class="sub">the campaign of 1777, and what came of it</span>'),
      this.board, this.ask, this.opts, this.wire, this.foot,
    );
    this.root.append(frame);

    window.addEventListener('keydown', (e) => {
      if (!this.open) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      this.feed(e.code);
    });
  }

  /**
   * Hand a code to whatever the sheet is waiting on, typed or tapped.
   *
   * The option rows call this with `Space` after moving the cursor to
   * themselves, so a finger and the arrow keys arrive at the same line of
   * the same loop. Same arrangement as the survey sheet, and for the same
   * reason: two ways in, one way through.
   */
  private feed(code: string): void {
    const r = this.resolveKey;
    if (!r) return;
    this.resolveKey = null;
    r(code);
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
   * Run the three sheets.
   *
   * EVERY CHOICE IS ANSWERED, AND THAT IS THE DIFFERENCE FROM KNOX'S TABLE.
   *
   * The survey of the Ticonderoga road is a decision: four questions, one
   * answer each, and the guns you get depend on what you picked. This is
   * not a decision, because Saratoga had already happened and Washington
   * had no part in it. So the player works through every column, every
   * position and every consequence in turn, and the table only closes when
   * there is nothing left on it to look at. What they are doing here is
   * reading a map, not commanding from one.
   */
  async run(): Promise<NorthernResult> {
    this.open = true;
    this.root.classList.add('on');
    sfxDocument();
    const learned: string[] = [];

    for (let si = 0; si < STAGES.length; si++) {
      const stage = STAGES[si];
      const left = new Set(stage.choices.map((c) => c.id));

      while (left.size > 0) {
        this.ask.innerHTML =
          `<span class="n">${si + 1} of ${STAGES.length}</span>${stage.question}`;
        this.wire.classList.remove('on');
        this.foot.innerHTML = left.size === stage.choices.length
          ? (KEY_GO === 'TAP'
            ? '<span class="key">tap</span> what you want to know'
            : '<span class="key">&larr; &rarr;</span> choose &nbsp; <span class="key">SPACE</span> read it')
          : `<span class="key">${left.size}</span> still to look at`;

        const rows = stage.choices.map((c) => {
          const done = !left.has(c.id);
          const row = el('button', `opt${done ? ' locked' : ''}`);
          row.innerHTML =
            `<span class="lab">${c.label}</span><span class="det">${c.detail}</span>`
            + (done ? '<span class="lock">&mdash; read</span>' : '');
          return { c, row, done };
        });
        this.opts.innerHTML = '';
        for (const r of rows) this.opts.append(r.row);

        const open = rows.filter((r) => !r.done);
        let i = 0;
        const paint = () => {
          rows.forEach((r) => r.row.classList.remove('on'));
          open[i].row.classList.add('on');
          this.moveToken(open[i].c.at);
        };
        paint();
        open.forEach((r, oi) => r.row.addEventListener('click', () => {
          i = oi;
          paint();
          this.feed('Space');
        }));

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
        left.delete(chosen.id);
        learned.push(chosen.grants);

        this.opts.innerHTML = '';
        this.moveToken(chosen.at);
        this.wire.innerHTML =
          `<span class="hdr">${chosen.label}</span><p>${chosen.answer}</p>`;
        this.wire.classList.add('on');
        this.foot.innerHTML = `<span class="key">${KEY_GO}</span> back to the map`;
        await this.key(['Space', 'Enter', 'KeyE']);
      }
    }

    /* --- the two despatches, last, and side by side ---------------------- */

    this.opts.innerHTML = '';
    this.ask.innerHTML = '<span class="n">and</span>Two men wrote about the same afternoon.';
    this.wire.innerHTML =
      '<span class="hdr">Gates, to Congress, 20 October</span>'
      + '<p>&ldquo;The Conduct of the Troops under my Command has been such as does them the '
      + 'highest Honour&hellip; the Success of this Army has been chiefly owing to their Spirit '
      + 'and Perseverance.&rdquo;</p>'
      + '<p class="cite">No officer below himself is named anywhere in it. It went to Congress '
      + 'directly and not through the commander-in-chief.</p>'
      + '<p>&ldquo;I was that morning without a command&hellip; I heard the firing on the left and '
      + 'rode to it. We carried the Breymann redoubt at the point of the bayonet. In the entrance '
      + 'of the sally-port I received a ball in the same leg that was broken at Quebec.&rdquo;</p>'
      + '<p class="cite">Arnold, of the seventh of October. He will sell West Point to the British '
      + 'in three years. Nothing on this sheet excuses that. This is simply what he did in 1777 '
      + 'and what was written about it.</p>';
    this.wire.classList.add('on');
    this.foot.innerHTML = `<span class="key">${KEY_GO}</span> roll the sheet up`;
    learned.push('obs.a5.despatches');
    await this.key(['Space', 'Enter', 'KeyE', 'Escape']);

    sfxCancel();
    this.open = false;
    this.root.classList.remove('on');
    return { learned };
  }
}
