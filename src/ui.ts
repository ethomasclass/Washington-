/**
 * The DOM overlay: dialogue, the council, and the decision UI.
 *
 * The player spends most of the game here, so this is where the design
 * attention goes. Rules honoured from the docs, each of which some document
 * elsewhere got wrong and the critics caught:
 *
 *  - a council voice's ink colours its NAME only. The line beneath is always
 *    INK-SETTLED at 10.66:1. Colour is never the only channel — each voice
 *    also carries an emblem and a distinct position.
 *  - locked options are struck, glyphed and annotated at FULL contrast, never
 *    greyed. Greying text below threshold to indicate state is the most common
 *    accessibility failure in games and we are not committing it.
 *  - nothing is timed. Not one choice, in eight acts.
 *
 * The decision runs in two beats: the council argues, then the choice arrives
 * with the voices collapsed to emblems. That split is most of why this screen
 * carries ~60 words instead of 175.
 */

import { INK, PAPER, VOICE_INK, type VoiceId } from './palette';
import { EMBLEM, LOCK_GLYPH } from './emblems';
import { grainTile, portraitPlate } from './art';

/**
 * Lay the paper.
 *
 * Generated once at startup and handed to CSS as a custom property, so every
 * surface in the DOM layer shares one tile and the browser decodes it once.
 * Called before the first paint; if it never runs, `var(--grain, none)` leaves
 * the panels as plain paper rather than as broken ones.
 */
export function mountSheet(): void {
  document.documentElement.style.setProperty('--grain', `url(${grainTile()})`);
}

export const CSS = `
/* The briefing. Place and date read as a dateline, because that is what it is. */
.brief .stamp {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 16px; padding-bottom: 8px; margin-bottom: 12px;
  border-bottom: 1px solid #C3B79B;
}
.brief .place { font-variant: small-caps; letter-spacing: 0.09em; font-size: 19px; }
.brief .date { font-style: italic; opacity: 0.72; }
.brief .head {
  font-variant: small-caps; letter-spacing: 0.11em; font-size: 12px;
  opacity: 0.62; margin: 16px 0 6px;
}
.brief .line { margin-bottom: 7px; }
.brief .line.quiet { opacity: 0.78; font-style: italic; }
.brief .objectives { margin: 0; padding-left: 22px; }
.brief .objectives li { margin-bottom: 5px; }
.journal .stamp {
  display: flex; justify-content: space-between; align-items: baseline; gap: 16px;
  padding-bottom: 6px; margin-bottom: 10px; border-bottom: 1px solid #C3B79B;
}
.journal .place { font-variant: small-caps; letter-spacing: 0.08em; }
.journal .date { font-style: italic; opacity: 0.7; }
.journal .objectives { margin: 0 0 14px; padding-left: 20px; }
.journal .objectives li { margin-bottom: 4px; }

/* The spyglass. Everything goes dark but the circle. */
.glass {
  /* pointer-events: auto, because the overlay root disables them so the game
     can be clicked through everywhere else. */
  position: fixed; inset: 0; z-index: 60; pointer-events: auto;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; background: rgba(12, 9, 6, 0.9);
}
/* The two rings are the instrument — the barrel and its brass collar, drawn as
   an object. The soft drop shadow that used to sit under them was not, and is
   gone. */
.glass .eye {
  border-radius: 50%;
  box-shadow: 0 0 0 7px #23180F, 0 0 0 10px #4A3A24;
}
.glass .eyecap {
  font-variant: small-caps; letter-spacing: 0.10em; font-size: 13px;
  color: #D8CDB6; opacity: 0.85;
}
.glass .bearings {
  display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;
  max-width: min(880px, 92vw);
}
.glass .continue { color: #C3B79B; opacity: 0.62; }

/* The spyglass list: bearing on the left, what it proved to be on the right. */
.survey { display: flex; flex-direction: column; gap: 5px; margin-top: 12px; }
/* The bearing list is in-world UI — it is what the glass shows — so it obeys
   the same discipline as everything else: square corners, a full-opacity ink
   line, and no half-transparent fill. */
.sopt {
  display: flex; justify-content: space-between; gap: 14px;
  font: inherit; text-align: left; cursor: pointer;
  padding: 8px 12px; color: #3B2E22;
}
.sopt:hover { background-color: #FFFDF6; }
.sopt.seen { cursor: default; opacity: 0.72; border-style: dashed; }
.sopt .bear { font-style: italic; }
.sopt .named { font-variant: small-caps; letter-spacing: 0.04em; }

/* The dev scene picker. Plain, out of the way, and obviously a tool. */
.devtab {
  position: fixed; left: 10px; bottom: 10px; z-index: 9998;
  font: 11px/1 ui-monospace, Menlo, Consolas, monospace;
  letter-spacing: 0.10em; text-transform: uppercase;
  color: #C3B79B; background: rgba(30, 24, 18, 0.55);
  border: 1px solid rgba(150, 132, 102, 0.5); border-radius: 3px;
  padding: 5px 9px; cursor: pointer; opacity: 0.55;
}
.devtab:hover { opacity: 1; background: rgba(30, 24, 18, 0.9); }
.devbar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999;
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  padding: 10px 14px; background: rgba(30, 24, 18, 0.92);
  border-top: 1px solid #6B5B45;
  font: 12px/1.4 ui-monospace, Menlo, Consolas, monospace; color: #D8CDB6;
}
.devbar span { opacity: 0.72; letter-spacing: 0.06em; text-transform: uppercase; }
.devbar span.note { margin-left: auto; opacity: 0.5; text-transform: none; }
.devbar button {
  font: inherit; color: #EFE7D5; background: #4A3D2C;
  border: 1px solid #6B5B45; border-radius: 3px; padding: 5px 10px; cursor: pointer;
}
.devbar button:hover:not(:disabled) { background: #5E4E38; }
.devbar button.here { background: #7A6242; border-color: #A8916B; }
.devbar button:disabled { opacity: 0.38; cursor: default; }

  /*
   * THE SHEET.
   *
   * Every surface in the DOM layer is a piece of paper, and this is what makes
   * it one: the grain tile multiplied over the paper value, and the chain lines
   * of laid paper — 1px verticals at 96px, which is about the inch they
   * actually sat at — at 5%. The chain lines are meant to be felt rather than
   * seen, and on a panel this size perhaps four of them land.
   *
   * Both go on the background layers only, never on the element, so no text is
   * ever blended. Type in this game is never textured (02 §6): the paper is
   * behind the words, not on them.
   *
   * --grain is set at runtime by mountSheet(); if it has not been set the rule
   * degrades to plain paper rather than to a broken url().
   */
  .journal, .panel, .bubble, .return, .codebar, .prompt, .intent, .hint, .sopt {
    background-color: ${PAPER.BRIGHT};
    background-image:
      repeating-linear-gradient(90deg, rgba(110,97,82,.05) 0 1px, transparent 1px 96px),
      var(--grain, none);
    background-size: auto, 128px 128px;
    background-blend-mode: normal, multiply;
    /*
     * THE LINE. 02 §8.1: every UI element carries an ink line at full opacity.
     * This is the plates' outline discipline applied to the DOM, and it is most
     * of why the chrome belongs to the game — these were INK-FADED hairlines,
     * which is a web border wearing a period colour.
     */
    border: 1px solid ${INK.SETTLED};
    /* No drop shadows anywhere (02 §8.1, §9.16). A sheet lies ON the sheet; it
       does not hover above it casting a soft modern shadow. */
    box-shadow: none;
    border-radius: 0;
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; background: ${PAPER.WARM}; }
  #app { position: relative; width: 100vw; height: 100vh; }
  #stage { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  #overlay {
    position: absolute; inset: 0; pointer-events: none;
    font-family: "Source Sans 3", "Source Sans Pro", system-ui, sans-serif;
    color: ${INK.SETTLED};
  }

  /*
   * The two-line header.
   *
   * Line one is a dateline: when, then where, in the form a student would write
   * at the top of a page. Line two is the job, in plain modern English, and it
   * is the bigger of the two on purpose — a player who has forgotten everything
   * needs what they are doing before they need what the hill is called.
   */
  /* Header and intent share one column in normal flow. They were two fixed
     positions and the job line collided with the thought under it the moment
     it wrapped to a second line, which is most scenes. */
  .topleft { position: absolute; top: 26px; left: 34px; max-width: 44ch; }
  .plate-title { }
  /* FADED rather than LIGHT: the dateline sits over open sky in two of the
     three scenes, and LIGHT washes out against it. This is the line a student
     copies into a notebook, so it has to survive a pale background. */
  .plate-title .dateline { display: block; font-variant: small-caps;
                           letter-spacing: .10em; font-size: 14px; color: ${INK.FADED}; }
  .plate-title b { display: block; margin-top: 3px; font-size: 21px; line-height: 1.35;
                   color: ${INK.SETTLED}; font-weight: 600; }

  /*
   * The return: the army's own weekly headcount, and the only number in the
   * game the player is ever shown.
   *
   * It is a fact, not a score. No colour coding, no arrows, no deltas — the
   * four stats are hidden because Washington could not count them, and this is
   * visible because he could, and did, obsessively, and complained for eight
   * years that the figures were late and wrong.
   */
  .return { position: absolute; top: 22px; right: 26px; width: 268px;
            padding: 11px 14px 12px; font-size: 15px; color: ${INK.SETTLED}; }
  .return .cap { font-variant: small-caps; letter-spacing: .10em; font-size: 12px;
                 color: ${INK.LIGHT}; padding-bottom: 6px; margin-bottom: 7px;
                 border-bottom: 1px solid ${PAPER.SHADOW}; }
  .return .row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 3px; }
  .return .row b { flex: 0 0 72px; text-align: right; font-size: 18px; font-weight: 600;
                   font-variant-numeric: tabular-nums; }
  .return .row span { font-size: 14px; color: ${INK.LIGHT}; line-height: 1.3; }
  .return .none { font-size: 15px; line-height: 1.45; font-style: italic; color: ${INK.FADED}; }
  /* The clock. Ruled off from the count because it is a different kind of fact:
     the numbers are what you have, the date is what you are about to lose. */
  .return .clock { margin-top: 9px; padding-top: 8px; border-top: 1px solid ${PAPER.SHADOW}; }
  .return .clock .when { font-variant: small-caps; letter-spacing: .09em; font-size: 13px;
                         color: ${INK.LIGHT}; }
  .return .clock .who { font-size: 15px; line-height: 1.35; }
  .return .clock .who b { font-weight: 600; font-variant-numeric: tabular-nums; }

  /* Washington's own sense of what is unfinished. Not an objective marker —
     it is written as a thought, and it names people rather than tasks. */
  /*
   * The standing sense of what is unfinished. It was italic ink printed
   * directly onto the plate, and over Mount Vernon's pale sky it was close to
   * unreadable — which is the failure 02 §8.1 is guarding against when it says
   * a UI element is a physical object or it does not exist. Floating text is
   * not an object. A slip of paper is.
   *
   * The heavy edge stays on the left only, as a memorandum ruled down one side.
   */
  .intent { margin-top: 14px; max-width: 40ch;
            font-size: 16px; line-height: 1.5; font-style: italic; color: ${INK.SETTLED};
            border-left-width: 3px; padding: 9px 13px; }

  .journal { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
             width: min(680px, calc(100vw - 64px));
             padding: 26px 30px; pointer-events: auto; }
  .journal h2 { margin: 0 0 4px; font-size: 20px; font-variant: small-caps;
                letter-spacing: .08em; font-weight: 600; }
  .journal h3 { margin: 18px 0 6px; font-size: 14px; font-variant: small-caps;
                letter-spacing: .1em; color: ${INK.LIGHT}; font-weight: 700; }
  .journal ul { margin: 0; padding-left: 20px; font-size: 17px; line-height: 1.6; }
  .journal .none { font-size: 17px; color: ${INK.LIGHT}; font-style: italic; }
  .journal .purpose { font-size: 18px; line-height: 1.5; margin: 2px 0 4px;
                      color: ${INK.SETTLED}; }
  /* The return is shown because he could count it. The four stats are not,
     because he could not. */
  .journal .strength { font-size: 17px; color: ${INK.SETTLED};
                       font-variant-numeric: tabular-nums; }

  /* The control legend — the one piece of chrome with no fictional excuse, so
     it is kept small, set on paper like everything else, and will be retired
     when the game has taught its controls some other way. */
  /* Bottom left rather than bottom centre: centred, it ran underneath the
     passport code, and two paper objects overlapping reads as a bug in a game
     whose whole claim is that these are physical things. */
  .hint { position: absolute; bottom: 22px; left: 66px;
          font-size: 13px; color: ${INK.SETTLED}; letter-spacing: .04em;
          padding: 5px 12px; }
  /* Once it had a paper ground of its own it started colliding with the panel
     that sits over it. Nothing is being read from it while a panel is open, so
     it goes away — and the frame is quieter for it. */
  #overlay:has(.panel) .hint, #overlay:has(.journal) .hint,
  #overlay:has(.panel) .codebar, #overlay:has(.journal) .codebar { display: none; }

  /* Speech is anchored to whoever is speaking. The figure is standing right
     there, so the bubble carries no portrait — the portrait well is for the
     deliberation panel, where there is no body on screen to look at. */
  .bubble { position: absolute; transform: translate(-50%, -100%);
            width: max-content; max-width: min(46ch, calc(100vw - 80px));
            padding: 13px 17px 14px; pointer-events: auto; }
  .bubble .who { font-variant: small-caps; letter-spacing: .1em; font-size: 13px;
                 color: ${INK.LIGHT}; margin-bottom: 5px; }
  .bubble .said { font-size: 18px; line-height: 1.5; }
  .bubble .more { margin-top: 9px; font-size: 13px; color: ${INK.LIGHT};
                  letter-spacing: .05em; }
  .bubble .more b { font-weight: 600; color: ${INK.SETTLED}; }
  .bubble::before, .bubble::after { content: ''; position: absolute; width: 0; height: 0;
                                    border-style: solid; }
  .bubble::before { left: var(--tail, 50%); margin-left: -10px; bottom: -13px;
                    border-width: 13px 10px 0 10px;
                    border-color: ${INK.SETTLED} transparent transparent transparent; }
  .bubble::after  { left: var(--tail, 50%); margin-left: -9px; bottom: -11px;
                    border-width: 12px 9px 0 9px;
                    border-color: ${PAPER.BRIGHT} transparent transparent transparent; }

  /* An interior voice. Deliberately not a speech bubble: no border, no tail,
     no keypress. It arrives while you are walking and leaves on its own. */
  /* Parked off-screen until the first anchor lands, so a new thought never
     flashes at its static position for a frame before it is placed. */
  .thought { position: absolute; left: -9999px; top: 0;
             transform: translate(-50%, -100%); pointer-events: none;
             width: max-content; max-width: min(40ch, calc(100vw - 90px));
             padding: 2px 0 0; opacity: 0; transition: opacity .5s ease; }
  .thought.in { opacity: 1; }
  .thought .vn { font-variant: small-caps; letter-spacing: .12em; font-size: 13px;
                 font-weight: 700; display: flex; align-items: center; gap: 7px;
                 margin-bottom: 2px; }
  .thought .vl { font-style: italic; font-size: 18px; line-height: 1.45;
                 color: ${INK.SETTLED};
                 text-shadow: 0 0 7px ${PAPER.BRIGHT}, 0 0 14px ${PAPER.BRIGHT},
                              0 0 3px ${PAPER.BRIGHT}; }

  .prompt { position: absolute; transform: translate(-50%, 0); font-size: 14px;
            letter-spacing: .05em; color: ${INK.SETTLED};
            padding: 3px 10px; white-space: nowrap; }

  .panel { position: absolute; left: 50%; bottom: 34px; transform: translateX(-50%);
           width: min(1080px, calc(100vw - 64px));
           padding: 22px 26px; pointer-events: auto; display: flex; gap: 22px; }
  .well { width: 300px; height: 400px; flex: 0 0 300px; display: flex; align-items: center;
          justify-content: center; background: ${PAPER.COOL}; border: 1px solid ${INK.SETTLED}; }
  .well img { width: 288px; height: 384px; display: block; }
  .panel.compact .well { display: none; }
  .body { flex: 1; min-width: 0; display: flex; flex-direction: column; }

  .speaker { font-variant: small-caps; letter-spacing: .1em; font-size: 15px;
             color: ${INK.LIGHT}; margin-bottom: 8px; }
  .line { font-size: 19px; line-height: 1.55; max-width: 64ch; }

  .council { margin: 16px 0 4px; border-left: 2px solid ${PAPER.SHADOW}; padding-left: 14px; }
  .voice { margin-bottom: 11px; }
  /* The rejoinder. Set in after the others, and indented off them, because it
     is a second attempt rather than a new speaker. */
  .voice.again { margin-left: 22px; margin-top: -2px;
                 animation: rejoin .32s ease both; }
  @keyframes rejoin { from { opacity: 0; transform: translateY(4px); }
                      to   { opacity: 1; transform: none; } }
  .voice-name { font-variant: small-caps; letter-spacing: .11em; font-size: 15px; font-weight: 700;
                display: flex; align-items: center; gap: 8px; }
  .voice-line { font-style: italic; font-size: 18px; line-height: 1.5; color: ${INK.SETTLED};
                max-width: 62ch; }

  /* The council collapsed to emblems, once it has spoken. */
  .emblem-row { display: flex; gap: 16px; align-items: center; margin: 15px 0 4px;
                font-size: 23px; }
  .emblem-row .e { cursor: help; }
  .emblem-row .said { margin-left: 6px; font-size: 13px; color: ${INK.LIGHT};
                      letter-spacing: .04em; font-style: italic; }

  .options { list-style: none; margin: 12px 0 0; padding: 0; }
  .opt { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
         cursor: pointer; background: none; border: none; border-left: 3px solid transparent;
         padding: 9px 10px; font: inherit; font-size: 19px; line-height: 1.5;
         color: ${INK.SETTLED}; }
  .opt .lbl { font-variant: small-caps; letter-spacing: .045em; }
  .opt:hover, .opt.on { background: ${PAPER.SMOKED}; border-left-color: ${INK.SETTLED};
                        outline: none; }
  .opt.locked { cursor: not-allowed; color: ${INK.LOCKED}; }
  .opt.locked .lbl { text-decoration: line-through; text-decoration-thickness: 1px; }
  .marks { margin-left: auto; display: flex; gap: 9px; font-size: 23px; opacity: .9; }
  .glyph { color: ${INK.LIGHT}; display: inline-flex; font-size: 20px; }

  .expand { margin-top: 14px; padding: 12px 14px; border-left: 2px solid ${PAPER.SHADOW};
            background: ${PAPER.WARM}; font-size: 17px; line-height: 1.5; min-height: 3.4em; }
  .expand .why { display: block; margin-top: 7px; font-size: 14px; color: ${INK.LIGHT};
                 font-style: italic; }

  .continue { margin-top: 14px; font-size: 14px; color: ${INK.LIGHT}; letter-spacing: .05em; }
  .continue b { font-weight: 600; color: ${INK.SETTLED}; }

  /* Moved off the top-right corner, which now belongs to the return. The code
     is an end-of-period utility, not something played with. */
  .codebar { position: absolute; bottom: 20px; right: 26px; pointer-events: auto;
             padding: 10px 14px;
             font-size: 13px; letter-spacing: .06em; color: ${INK.LIGHT}; }
  .codebar b { display: block; font-size: 16px; letter-spacing: .16em; color: ${INK.SETTLED};
               font-weight: 600; margin-top: 4px; font-variant-numeric: tabular-nums; }
`;

// Defined with the selection rules that produce it, not here.
import type { VoiceView } from './council';
export type { VoiceView };

export interface OptionView {
  id: string;
  label: string;
  full: string;
  favoured: VoiceId[];
  locked: boolean;
  /** Set for a knowledge lock: what has not been read, in his own accusation. */
  lockNote?: string;
  /** Set for a voice lock: which part of him is not loud enough to say it. */
  lockVoice?: VoiceId;
}

type Portrait = { seed: number; coat: string };

/** The two-line header: a dateline, and the job in plain English. */
export interface SceneHead {
  when: string;
  title: string;
  purpose: string;
}

export interface ReturnView {
  strength: { fit: number; onRolls: number; dated: string } | null;
  noStrength: string;
  expiring: { date: string; count?: number; who: string } | null;
}

const headerHtml = (h: SceneHead): string =>
  `<span class="dateline">${h.when} · ${h.title}</span><b>${h.purpose}</b>`;

export class Overlay {
  private root: HTMLElement;
  private panel: HTMLElement | null = null;
  private thought: HTMLElement | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(root: HTMLElement, head: SceneHead) {
    this.root = root;
    const col = document.createElement('div');
    col.className = 'topleft';
    const t = document.createElement('div');
    t.className = 'plate-title';
    t.innerHTML = headerHtml(head);
    col.appendChild(t);
    root.appendChild(col);

    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = '← → ↑ ↓ or WASD to walk · E look · Enter confirm · J what remains';
    root.appendChild(hint);
  }

  /** Retitle the frame when the composed view changes. */
  setPlate(head: SceneHead): void {
    const el = this.root.querySelector<HTMLElement>('.plate-title');
    if (el) el.innerHTML = headerHtml(head);
  }

  /**
   * The return, top right, always.
   *
   * Three lines at most, and each one is a different lesson: what the paper
   * says you have, who can actually stand up, and whose contract runs out. The
   * gap between the first two is never explained anywhere in the game.
   */
  setReturn(r: ReturnView): void {
    let el = this.root.querySelector<HTMLElement>('.return');
    if (!el) {
      el = document.createElement('div');
      el.className = 'return';
      this.root.appendChild(el);
    }
    const row = (n: number, label: string): string =>
      `<div class="row"><b>${n.toLocaleString()}</b><span>${label}</span></div>`;

    const head = r.strength ? `return of ${r.strength.dated}` : 'the return';
    const body = r.strength
      ? row(r.strength.onRolls, 'on the rolls') +
        row(r.strength.fit, 'present and fit for duty')
      : `<div class="none">${r.noStrength}</div>`;

    // The date is always shown; the headcount only where one has been sourced.
    const clock = r.expiring
      ? '<div class="clock">' +
        `<div class="when">time up · ${r.expiring.date}</div>` +
        `<div class="who">${
          r.expiring.count === undefined
            ? r.expiring.who
            : `<b>${r.expiring.count.toLocaleString()}</b> ${r.expiring.who}`
        }</div></div>`
      : '';

    el.innerHTML = `<div class="cap">${head}</div>${body}${clock}`;
  }

  /**
   * The standing sense of what is unfinished, in Washington's own voice.
   * Deliberately not a quest marker: it names the people waiting on him rather
   * than issuing tasks, and it never points at the optional half of the scene.
   */
  setIntent(text: string): void {
    let el = this.root.querySelector<HTMLElement>('.intent');
    if (!el) {
      el = document.createElement('div');
      el.className = 'intent';
      // Under the header, in the same column, so a wrapped job line pushes the
      // thought down instead of printing through it.
      this.root.querySelector('.topleft')!.appendChild(el);
    }
    el.textContent = text;
  }

  /** Arrival card — the situation, before the player has control. */
  /**
   * The briefing.
   *
   * Place and date at the top in a form a student can copy into a notebook,
   * then what has happened, then what he is here to do — numbered, because an
   * objective that is not numbered reads as more atmosphere.
   */
  showOpening(
    brief: {
      where: string;
      when: string;
      situation: string[];
      objectives: string[];
      opening: string[];
    },
    onDone: () => void,
  ): void {
    const p = this.makePanel(true);
    p.innerHTML =
      '<div class="body brief">' +
      `<div class="stamp"><span class="place">${brief.where}</span>` +
      `<span class="date">${brief.when}</span></div>` +
      `<div class="head">Where things stand</div>` +
      brief.situation.map((l) => `<div class="line">${l}</div>`).join('') +
      brief.opening.map((l) => `<div class="line quiet">${l}</div>`).join('') +
      `<div class="head">What you are here to do</div>` +
      '<ol class="objectives">' +
      brief.objectives.map((o) => `<li>${o}</li>`).join('') +
      '</ol>' +
      '<div class="continue">press <b>Space</b> to begin</div></div>';
    this.waitForDismiss(onDone);
  }

  /** What he has looked at, noticed, and still owes. Opened on demand. */
  showJournal(
    brief: { where: string; when: string; objectives: string[] },
    purpose: string,
    strength: string,
    read: string[],
    owed: string[],
    noticed: string[],
    done: string[],
    onDone: () => void,
  ): void {
    this.clearPanel();
    const j = document.createElement('div');
    j.className = 'journal';
    j.innerHTML =
      '<h2>What remains</h2>' +
      `<div class="stamp"><span class="place">${brief.where}</span>` +
      `<span class="date">${brief.when}</span></div>` +
      `<div class="purpose">${purpose}</div>` +
      // The objectives again, because a player who put the game down on Tuesday
      // has no idea what they were doing by Thursday.
      '<h3>What you are here to do</h3>' +
      '<ol class="objectives">' +
      brief.objectives.map((o) => `<li>${o}</li>`).join('') +
      '</ol>' +
      `<h3>The army</h3><div class="strength">${strength}</div>` +
      '<h3>Owed an answer</h3>' +
      (owed.length
        ? `<ul>${owed.map((o) => `<li>${o}</li>`).join('')}</ul>`
        : '<div class="none">Nothing. You may go when you please.</div>') +
      (done.length
        ? `<h3>Done this morning</h3><ul>${done.map((d) => `<li>${d}</li>`).join('')}</ul>`
        : '') +
      (noticed.length
        ? `<h3>Noticed</h3><ul>${noticed.map((n) => `<li>${n}</li>`).join('')}</ul>`
        : '') +
      '<h3>Looked at today</h3>' +
      (read.length
        ? `<ul>${read.map((r) => `<li>${r}</li>`).join('')}</ul>`
        : '<div class="none">Nothing yet.</div>');
    this.root.appendChild(j);
    this.panel = j;
    this.waitForDismiss(onDone);
  }

  private detach(): void {
    if (this.keyHandler) removeEventListener('keydown', this.keyHandler);
    this.keyHandler = null;
  }

  private clearPanel(): void {
    this.detach();
    this.panel?.remove();
    this.panel = null;
  }

  private makePanel(compact = false): HTMLElement {
    this.clearPanel();
    const p = document.createElement('div');
    p.className = compact ? 'panel compact' : 'panel';
    this.root.appendChild(p);
    this.panel = p;
    return p;
  }

  private wellFor(p: Portrait): string {
    return `<div class="well"><img src="${portraitPlate(p.coat, p.seed).toDataURL()}" alt=""></div>`;
  }

  showPrompt(label: string, x: number, y: number): void {
    let el = this.root.querySelector<HTMLElement>('.prompt');
    if (!el) {
      el = document.createElement('div');
      el.className = 'prompt';
      this.root.appendChild(el);
    }
    el.textContent = label;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.display = 'block';
  }

  hidePrompt(): void {
    const el = this.root.querySelector<HTMLElement>('.prompt');
    if (el) el.style.display = 'none';
  }

  showExamine(label: string, text: string, onDone: () => void): void {
    const p = this.makePanel(true);
    p.innerHTML =
      `<div class="body"><div class="speaker">${label}</div>` +
      text
        .split('\n\n')
        .map((para, i) => `<div class="line"${i ? ' style="margin-top:12px"' : ''}>${para}</div>`)
        .join('') +
      `<div class="continue">press <b>Space</b> to continue</div></div>`;
    this.waitForDismiss(onDone);
  }

  /**
   * The spyglass.
   *
   * Not a list with a picture beside it — a view through the instrument. The
   * screen goes dark except for one circle, and inside that circle is a
   * magnified crop of the actual scene taken off the game canvas, swung to
   * whichever bearing is being looked at. Sweeping between bearings pans the
   * glass across the water.
   *
   * The crop is a still, grabbed once when the glass is raised. That is not a
   * shortcut, it is the right behaviour: a man with his eye to a glass is
   * holding still, and the whole frame going quiet is most of what makes it
   * feel like an instrument rather than a menu.
   *
   * The circle is drawn with the eyepiece's own faults — the image falls off
   * toward the rim, and there is a fringe of colour at the edge where cheap
   * eighteenth-century glass could not bring every wavelength to the same
   * focus. Both are period-correct and both are what the eye reads as "lens".
   */
  showSurvey(
    label: string,
    source: HTMLCanvasElement,
    targets: { id: string; at: number; bearing: string; name: string; done: boolean }[],
    onPick: (id: string) => void,
    onDone: () => void,
  ): void {
    this.clearPanel();
    const wrap = document.createElement('div');
    wrap.className = 'glass';

    const D = Math.round(Math.min(innerWidth, innerHeight) * 0.56);
    const eye = document.createElement('canvas');
    eye.className = 'eye';
    eye.width = D;
    eye.height = D;
    const g = eye.getContext('2d')!;

    /** Swing the glass to a bearing and redraw what is in it. */
    const look = (at: number): void => {
      const ZOOM = 3.4;
      const sw = source.width / ZOOM;
      const sh = source.height / ZOOM;
      // Clamped so the glass cannot swing off the edge of the world.
      const sx = Math.max(0, Math.min(source.width - sw, at * source.width - sw / 2));
      // Held on the horizon, which is the only band with anything in it.
      const sy = Math.max(0, Math.min(source.height - sh, source.height * 0.30 - sh / 2));

      g.save();
      g.clearRect(0, 0, D, D);
      g.beginPath();
      g.arc(D / 2, D / 2, D / 2 - 2, 0, Math.PI * 2);
      g.clip();
      g.drawImage(source, sx, sy, sw, sh, 0, 0, D, D);

      // Chromatic fringe: the same crop offset a whisker and tinted, which is
      // what an uncorrected lens does at the edges.
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.16;
      g.drawImage(source, sx, sy, sw, sh, -3, 0, D + 6, D);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;

      // Fall-off toward the rim.
      const vig = g.createRadialGradient(D / 2, D / 2, D * 0.20, D / 2, D / 2, D / 2);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(0.62, 'rgba(20,16,10,0.10)');
      vig.addColorStop(1, 'rgba(14,11,7,0.82)');
      g.fillStyle = vig;
      g.fillRect(0, 0, D, D);

      // A hair of a reticle. Two short strokes, not a rifle sight.
      g.strokeStyle = 'rgba(38,30,20,0.5)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(D / 2 - 16, D / 2);
      g.lineTo(D / 2 + 16, D / 2);
      g.moveTo(D / 2, D / 2 - 16);
      g.lineTo(D / 2, D / 2 + 16);
      g.stroke();
      g.restore();
    };

    const caption = document.createElement('div');
    caption.className = 'eyecap';

    const list = document.createElement('div');
    list.className = 'bearings';

    const render = (): void => {
      const left = targets.filter((t) => !t.done).length;
      caption.textContent = left
        ? `${label} · ${left} bearing${left === 1 ? '' : 's'} not yet made out`
        : `${label} · all of it named`;
      list.innerHTML = targets
        .map(
          (t, i) =>
            `<button class="sopt${t.done ? ' seen' : ''}" data-i="${i}">` +
            `<span class="bear">${t.bearing}</span>` +
            `<span class="named">${t.done ? t.name : '—'}</span></button>`,
        )
        .join('');
      for (const b of Array.from(list.querySelectorAll<HTMLButtonElement>('.sopt'))) {
        const t = targets[Number(b.dataset.i)];
        // Hovering swings the glass, which makes the list feel like an
        // instrument being aimed rather than a set of buttons.
        b.onmouseenter = () => look(t.at);
        b.onclick = () => {
          look(t.at);
          if (!t.done) onPick(t.id);
        };
      }
    };

    const hint = document.createElement('div');
    hint.className = 'continue';
    hint.innerHTML = 'press <b>Space</b> to lower the glass';

    wrap.append(eye, caption, list, hint);
    this.root.append(wrap);
    this.panel = wrap;
    render();
    look(targets.find((t) => !t.done)?.at ?? 0.5);
    this.waitForDismiss(onDone);
  }

  /**
   * A spoken line, in a bubble anchored over the speaker's head. Position is
   * re-applied every frame by the caller, so the bubble stays with the figure
   * if the frame breathes underneath it.
   */
  showSpeech(speaker: string, text: string, onDone: () => void): void {
    this.clearPanel();
    const b = document.createElement('div');
    b.className = 'bubble';
    b.innerHTML =
      `<div class="who">${speaker}</div><div class="said">${text}</div>` +
      '<div class="more">press <b>Space</b> to continue</div>';
    this.root.appendChild(b);
    this.panel = b;
    this.waitForDismiss(onDone);
  }

  /**
   * An interior voice, over Washington's own head. Non-blocking: the player
   * keeps walking, and it fades on its own. Only one at a time — a second
   * thought replaces the first rather than stacking.
   */
  showThought(voice: VoiceId, line: string, ms = 5200): void {
    this.root.querySelector('.thought')?.remove();
    const t = document.createElement('div');
    t.className = 'thought';
    t.innerHTML =
      `<div class="vn" style="color:${VOICE_INK[voice]}">${EMBLEM[voice]}${voice}</div>` +
      `<div class="vl">${line}</div>`;
    this.root.appendChild(t);
    this.thought = t;
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => {
      t.classList.remove('in');
      setTimeout(() => {
        if (this.thought === t) this.thought = null;
        t.remove();
      }, 600);
    }, ms);
  }

  setThoughtAnchor(x: number, y: number): void {
    const t = this.thought;
    if (!t) return;
    const half = t.offsetWidth / 2;
    const cx = Math.max(20 + half, Math.min(innerWidth - 20 - half, x));
    t.style.left = `${cx}px`;
    t.style.top = `${Math.max(t.offsetHeight + 20, y - 10)}px`;
  }

  /** Point the open bubble at a screen position, keeping it inside the frame. */
  setSpeechAnchor(x: number, y: number): void {
    const b = this.panel;
    if (!b || !b.classList.contains('bubble')) return;
    const w = b.offsetWidth;
    const margin = 18;
    const half = w / 2;
    const cx = Math.max(margin + half, Math.min(innerWidth - margin - half, x));
    // Never let the bubble ride off the top of the frame.
    const cy = Math.max(b.offsetHeight + 26, y - 16);
    b.style.left = `${cx}px`;
    b.style.top = `${cy}px`;
    // The tail stays over the speaker even when the body has been nudged inward.
    const tail = Math.max(16, Math.min(w - 16, half + (x - cx)));
    b.style.setProperty('--tail', `${tail}px`);
  }

  /** Beat 1 — the council argues. The player only listens. */
  showCouncil(
    portrait: Portrait,
    voices: VoiceView[],
    rejoinder: VoiceView | null,
    onDone: () => void,
  ): void {
    const p = this.makePanel();
    const voiceHtml = (v: VoiceView, again: boolean): string =>
      `<div class="voice${again ? ' again' : ''}">` +
      `<span class="voice-name" style="color:${VOICE_INK[v.id]}">${EMBLEM[v.id]}${v.id}</span>` +
      `<span class="voice-line">${v.line}</span></div>`;

    p.innerHTML =
      this.wellFor(portrait) +
      '<div class="body"><div class="speaker">the council</div>' +
      `<div class="council">${voices.map((v) => voiceHtml(v, false)).join('')}</div>` +
      '<div class="continue">press <b>Space</b> to decide</div></div>';

    /*
     * The insistence beat.
     *
     * The rejoinder is not in the initial paint: it arrives after everyone has
     * finished, on its own, which is the whole effect — a part of him that will
     * not let the argument end. The prompt is withheld until it lands so the
     * player cannot skip past it without seeing it happen.
     */
    if (rejoinder) {
      const council = p.querySelector('.council')!;
      const prompt = p.querySelector<HTMLElement>('.continue')!;
      prompt.style.visibility = 'hidden';
      setTimeout(() => {
        if (!council.isConnected) return;
        council.insertAdjacentHTML('beforeend', voiceHtml(rejoinder, true));
        prompt.style.visibility = '';
      }, 600);
    }

    this.waitForDismiss(onDone);
  }

  /** Beat 2 — the choice, with the council collapsed to emblems. */
  showDecision(
    speaker: string,
    prompt: string,
    portrait: Portrait,
    voices: VoiceView[],
    options: OptionView[],
    onPick: (id: string) => void,
  ): void {
    const p = this.makePanel();
    let focus = options.findIndex((o) => !o.locked);
    if (focus < 0) focus = 0;

    const draw = (): void => {
      const f = options[focus];
      /*
       * The two refusals read differently on purpose.
       *
       * A knowledge lock is an accusation about something he has not looked at,
       * and it is openable: go and find the thing. A voice lock names the part
       * of him that is too quiet, and it is not openable today by any means at
       * all. Neither is greyed — both stay at full contrast, struck and glyphed,
       * because greying text to indicate state is the accessibility failure
       * this project has committed to not making.
       */
      const why = f.locked
        ? f.lockVoice
          ? `<span class="why" style="color:${VOICE_INK[f.lockVoice]}">` +
            `${f.lockVoice} is not loud enough to say this.</span>`
          : `<span class="why">Locked — ${f.lockNote ?? 'not available to you'}.</span>`
        : f.favoured.length
          ? `<span class="why">${f.favoured.join(' and ')} would have it so.</span>`
          : '';

      p.innerHTML =
        this.wellFor(portrait) +
        `<div class="body"><div class="speaker">${speaker}</div>` +
        `<div class="line">${prompt}</div>` +
        '<div class="emblem-row">' +
        voices
          .map(
            (v) =>
              `<span class="e" style="color:${VOICE_INK[v.id]}" title="${v.id} — ${v.line}">` +
              `${EMBLEM[v.id]}</span>`,
          )
          .join('') +
        '<span class="said">the council has spoken — hover to hear it again</span></div>' +
        '<ul class="options">' +
        options
          .map((o, i) => {
            const marks = o.favoured.length
              ? `<span class="marks">${o.favoured
                  .map((v) => `<span style="color:${VOICE_INK[v]}">${EMBLEM[v]}</span>`)
                  .join('')}</span>`
              : '';
            const lock = !o.locked
              ? ''
              : o.lockVoice
                ? `<span class="glyph" style="color:${VOICE_INK[o.lockVoice]}">` +
                  `${EMBLEM[o.lockVoice]}</span>`
                : `<span class="glyph">${LOCK_GLYPH}</span>`;
            return (
              `<li><button class="opt${o.locked ? ' locked' : ''}${i === focus ? ' on' : ''}" ` +
              `data-i="${i}"${o.locked ? ' aria-disabled="true"' : ''}>` +
              `${lock}<span class="lbl">${o.label}</span>${marks}</button></li>`
            );
          })
          .join('') +
        `</ul><div class="expand">${f.full}${why}</div></div>`;

      for (const b of Array.from(p.querySelectorAll<HTMLButtonElement>('.opt'))) {
        const i = Number(b.dataset.i);
        b.addEventListener('mouseenter', () => {
          focus = i;
          draw();
        });
        b.addEventListener('click', () => {
          if (options[i].locked) {
            focus = i;
            draw();
            return;
          }
          this.clearPanel();
          onPick(options[i].id);
        });
      }
    };

    draw();

    this.detach();
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        focus = (focus + 1) % options.length;
        draw();
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        focus = (focus - 1 + options.length) % options.length;
        draw();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (options[focus].locked) return;
        const id = options[focus].id;
        this.clearPanel();
        onPick(id);
      }
    };
    addEventListener('keydown', this.keyHandler);
  }

  private waitForDismiss(onDone: () => void): void {
    this.detach();
    this.keyHandler = (e: KeyboardEvent) => {
      if ([' ', 'Enter', 'Escape', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
        this.clearPanel();
        onDone();
      }
    };
    addEventListener('keydown', this.keyHandler);
  }

  close(): void {
    this.clearPanel();
  }

  setCode(code: string): void {
    let el = this.root.querySelector<HTMLElement>('.codebar');
    if (!el) {
      el = document.createElement('div');
      el.className = 'codebar';
      this.root.appendChild(el);
    }
    el.innerHTML = `your passport code<b>${code}</b>`;
  }
}
