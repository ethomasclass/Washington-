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
import { cellStyle, portraitFor } from './portraits';
import type { LedgerLine, Reckoning } from './ledger';
import {
  CANVAS_ASPECT, CANVAS_W, canvasAt, confidenceOf, gridRef, labelOffset, longDate,
  provenanceOf, theatreMarks, theatreSheet, type Theatre,
} from './theatre';

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

/*
 * The spyglass. Everything goes dark but the circle you are holding.
 *
 * This used to be a menu: a fixed eyepiece in the middle of the screen and a
 * list of seven buttons under it, and the "looking" was choosing a row. It is
 * now an instrument the player aims. The whole thing — the darkened panorama,
 * the seven rings hidden in it, the glow that gathers when the glass settles on
 * a position, the brass rim of the eyepiece itself — is drawn on ONE canvas,
 * because 02 §8.1 forbids a circle made of the CSS box model and a glow made of
 * a drop shadow. A ring here is ink and light on a surface, not chrome.
 */
.glass {
  /* pointer-events: auto, because the overlay root disables them so the game
     can be clicked through everywhere else. */
  position: fixed; inset: 0; z-index: 60; pointer-events: auto;
  background: rgba(9, 7, 5, 0.94);
  /* The system cursor is hidden: the glass IS the pointer. */
  cursor: none;
}
/* The field fills the screen. Everything the instrument shows is painted here. */
.glass .field { position: absolute; inset: 0; width: 100%; height: 100%; }
/* The two lines of text sit over the field, out of the way at top and bottom.
   They are the only DOM the glass keeps — a count and a key hint — because they
   are words, not objects, and words are the one thing the canvas is worse at. */
.glass .eyecap {
  position: absolute; top: 3.2vh; left: 50%; transform: translateX(-50%);
  font-variant: small-caps; letter-spacing: 0.12em; font-size: 14px;
  color: #D8CDB6; opacity: 0.85; pointer-events: none; white-space: nowrap;
}
.glass .instr {
  position: absolute; bottom: 3vh; left: 50%; transform: translateX(-50%);
  font-size: 13px; letter-spacing: 0.04em; color: #C3B79B; opacity: 0.6;
  pointer-events: none; white-space: nowrap; text-align: center;
}
.glass .instr b { color: #E9DEC6; font-weight: 600; }

/*
 * THE THEATRE MAP — the page that opens an act.
 *
 * A worn sheet on a wooden table, and the whole screen is the table. The first
 * cut framed the map neatly in the middle of a dark field with the caption
 * underneath, which read as a slide in a presentation. This reads as a thing
 * lying in front of you: the wood runs off all four edges, the sheet is torn,
 * two of its corners have lifted, and the caption is a panel laid OVER the foot
 * of the map rather than a paragraph beneath it.
 *
 * Everything about the sheet itself — shadow, tear, curl, ink — is canvas. The
 * table is CSS, because it has to fill a viewport of unknown shape and there is
 * nothing on it to get wrong.
 */
.theatre {
  position: absolute; inset: 0; z-index: 70; pointer-events: auto;
  /*
   * Sheet on the left, caption beside it — because the sheet is now nearly
   * square and a square map under a wide caption wastes half a landscape
   * screen. Stacking them cost the map about a fifth of its size and put the
   * bottom row of grid letters behind the panel, which are one of the two
   * things on this page a student is meant to use.
   */
  display: flex; align-items: center; justify-content: center;
  gap: 26px; padding: 20px 30px 44px;
  /* Oak, lit from over the reader's left shoulder like everything else in this
     game: plank seams, a fine grain across them, and the room falling away at
     the corners. */
  background-color: #43301E;
  background-image:
    repeating-linear-gradient(0deg, rgba(0,0,0,.34) 0 3px, rgba(0,0,0,0) 3px 152px),
    repeating-linear-gradient(0deg, rgba(0,0,0,.11) 0 1px, rgba(0,0,0,0) 1px 7px),
    repeating-linear-gradient(90deg, rgba(255,244,222,.035) 0 2px, rgba(0,0,0,0) 2px 23px),
    radial-gradient(ellipse at 42% 38%, rgba(168,124,72,.55), rgba(24,16,10,.92) 82%);
}
.theatre .sheet { position: relative; display: block; }
.theatre .sheet canvas { display: block; width: 100%; height: 100%; }
/* Marker labels. Absolutely placed against the canvas in fractions, so they
   follow the map at any size and never need a second projection. */
.theatre .tmark {
  position: absolute; transform: translate(-50%, -50%);
  font: italic 15px/1.25 Georgia, "Times New Roman", serif;
  color: ${INK.FLOOR}; white-space: nowrap; pointer-events: none;
  /* The border is always there and usually invisible, so picking a mark does
     not shift the label by a pixel. */
  padding: 1px 5px; border: 1px solid transparent;
}
/* Faint captions for stale marks, matching the ink of the marker they name — a
   position nobody has confirmed does not get a confident label over it. */
.theatre .tmark.old { opacity: 0.7; }
.theatre .tmark.stale { opacity: 0.52; font-style: italic; }
/* The focused mark: the label gets its line, and nothing else changes. */
.theatre .tmark.on { opacity: 1; background: ${PAPER.BRIGHT}; border-color: ${INK.SETTLED}; }
/*
 * The ring round the focused mark is INK, not chrome — a second canvas laid
 * over the sheet, cleared and redrawn as the focus moves.
 *
 * It began as a div with border-radius: 50%, which the chrome linter caught and
 * was right to. Not because a circle is wrong here — a plan circles the thing
 * it is annotating — but because a circle drawn by the CSS box model is a web
 * element pretending, and this one has to be a pen going round a position on a
 * map. Two arcs of canvas, and it sits in the same ink as everything it points
 * at.
 */
.theatre .ringlayer { position: absolute; inset: 0; pointer-events: none; }

/*
 * The caption, laid over the foot of the map.
 *
 * Not a sheet of paper — this is the only thing on the screen that is not in
 * the world, so it does not pretend to be. It is a plate of smoked glass over
 * the map, and this is the one screen in the game where that is allowed.
 */
.theatre .caption {
  /* Width is set in script, from the same arithmetic that sizes the sheet. */
  flex: 0 0 auto; align-self: center; min-height: 220px;
  padding: 18px 24px 16px;
  background: rgba(20, 14, 9, 0.86);
  border: 1px solid #6B5B45;
  color: #EFE7D5; font-size: 17px; line-height: 1.5;
}
.theatre .caption .head {
  display: flex; justify-content: space-between; align-items: baseline; gap: 16px;
  padding-bottom: 7px; margin-bottom: 9px; border-bottom: 1px solid #6B5B45;
}
.theatre .caption .who {
  font-variant: small-caps; letter-spacing: .09em; font-size: 20px; color: #F3B75B;
}
.theatre .caption .when { font-style: italic; opacity: 0.75; font-size: 14px; }
/* The square the mark sits in — C2 — set as a chip, because the whole reason
   the grid is lettered is so that a student can say it out loud. */
.theatre .caption .sq {
  font: 600 13px/1 ui-monospace, Menlo, Consolas, monospace; letter-spacing: .12em;
  color: #1B120A; background: #F3B75B; padding: 4px 7px; margin-right: 10px;
  vertical-align: 2px;
}
.theatre .caption .standing { font-style: italic; opacity: 0.92; }
/* The provenance line — where this came from and how old it is. It is the whole
   point of the screen, so it is set apart and never abbreviated. */
.theatre .caption .from {
  margin-top: 9px; font-size: 13px; letter-spacing: .03em; color: #C0AE8D;
}
.theatre .keys {
  position: absolute; left: 50%; bottom: 1.4vh; transform: translateX(-50%);
  font: 12px/1 ui-monospace, Menlo, Consolas, monospace;
  letter-spacing: .08em; color: #C0AE8D; opacity: 0.85;
}
.theatre .keys b { color: #F3B75B; font-weight: 600; }

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
  .journal, .reckoning, .panel, .bubble, .return, .codebar, .prompt,
  .plate-title, .intent, .hint {
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
  /* The header sits on paper like everything else. It was ink printed straight
     onto the plate, which was survivable over Vernon's pale sky and became
     unreadable the moment the lines got a heavy November one. */
  .plate-title { padding: 9px 14px 11px; }
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
  #overlay:has(.panel) .hint, #overlay:has(.journal) .hint, #overlay:has(.reckoning) .hint,
  #overlay:has(.panel) .codebar, #overlay:has(.journal) .codebar,
  #overlay:has(.reckoning) .codebar { display: none; }

  /*
   * THE RECKONING. What the act cost, in men, and why.
   *
   * Laid out as the document it is imitating: two counts six months apart with
   * the difference itemised between them, which is the form every strength
   * return of the war took. The player has been reading the top half of this
   * page in the corner of the screen all act — same tabular figures, same
   * small-caps caption — so the arithmetic arrives in handwriting they already
   * know.
   *
   * What the CSS is deliberately NOT doing (08 §3, rule 4):
   *   nothing is coloured red or green. A loss and a gain are the same ink,
   *   because a screen that paints the losses red has told the student that
   *   losing men is the fail state rather than the job.
   *   nothing is emphasised for being the player's doing. The four lines they
   *   caused sit in the same type as the three they could not, in one sorted
   *   column, and a player who wants to know which were theirs has to recognise
   *   their own decisions — which is the reading skill the whole game is for.
   *   there is no total row, no last-act comparison, and no historical figure.
   */
  .reckoning { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
               width: min(660px, calc(100vw - 64px));
               padding: 26px 32px 20px; pointer-events: auto; }
  .reckoning h2 { margin: 0; font-size: 20px; font-variant: small-caps;
                  letter-spacing: .08em; font-weight: 600; }
  .reckoning .sub { margin: 3px 0 4px; font-size: 16px; line-height: 1.45;
                    font-style: italic; color: ${INK.LIGHT}; }
  /* The two counts are the frame of the page, so they are ruled off from the
     itemised middle rather than set apart in size — a return does not shout its
     own totals. */
  .reckoning .count { display: flex; align-items: baseline; gap: 14px;
                      padding: 9px 0; font-size: 17px; }
  .reckoning .count b { flex: 0 0 78px; text-align: right; font-size: 19px; font-weight: 600;
                        font-variant-numeric: tabular-nums; }
  .reckoning .count.open { border-bottom: 1px solid ${INK.SETTLED}; margin-bottom: 4px; }
  .reckoning .count.close { border-top: 1px solid ${INK.SETTLED}; margin-top: 6px; }
  .reckoning .head { font-variant: small-caps; letter-spacing: .1em; font-size: 13px;
                     color: ${INK.LIGHT}; font-weight: 700; margin: 12px 0 5px; }
  .reckoning .item { display: flex; align-items: baseline; gap: 14px;
                     font-size: 17px; line-height: 1.45; margin-bottom: 4px; }
  .reckoning .item b { flex: 0 0 78px; text-align: right; font-weight: 600;
                       font-variant-numeric: tabular-nums; }
  .reckoning .continue { margin-top: 14px; font-size: 13px; color: ${INK.LIGHT};
                         letter-spacing: .05em; }
  .reckoning .continue b { font-weight: 600; color: ${INK.SETTLED}; }

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
  /* A painted portrait is one half of a 2-up sheet, shown through the well
     rather than cropped out of the file in post — so what is on disk stays
     exactly what the generator returned, and stays checkable against the
     prompt that produced it. */
  .well.painted { background-repeat: no-repeat; }
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
  /*
   * "Cut = space. Fade = time." (02 §8.6)
   *
   * Walking through a door is a cut, because the man went somewhere. A fade is
   * spent only where time passed — an act break, or a jump of months inside one
   * act, which Act 2 does twice. 900ms to PAPER-BRIGHT, which is the one
   * animation in the game permitted to run past 400ms.
   *
   * To bare paper rather than to black: the sheet is what everything in this
   * game is made of, and a fade to black would be a film convention borrowed
   * into a drawing.
   */
  .fade { position: absolute; inset: 0; z-index: 90; pointer-events: auto;
          background: ${PAPER.BRIGHT}; opacity: 0;
          transition: opacity 400ms linear; }
  .fade.on { opacity: 1; }

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

type Portrait = { seed: number; coat: string; id?: string };

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
  /**
   * A panel that owns more than its DOM — a running animation frame, a window
   * listener — registers how to release it here, and `detach()` runs it when the
   * panel is torn down. The spyglass is the one that needs this: it keeps a
   * requestAnimationFrame loop and a resize handler alive for as long as it is up.
   */
  private panelCleanup: (() => void) | null = null;

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

  /**
   * The theatre map. An act opens on it, and it opens on nothing else.
   *
   * The player can move a focus between the marks and read what he knows about
   * each, and that is the entire interaction. They cannot move a token, cannot
   * order anything, cannot dismiss a single fact on the page. `04` §7 keeps
   * DECIDING for the map table; what this does is the other half of the job the
   * documents already do everywhere else in the game — **reading is not
   * acting**, and this is the screen that says so at the largest possible size.
   *
   * Two things are load-bearing and easy to lose in a later pass:
   *
   * The sheet is sized to `SHEET_ASPECT` and never stretched. A map with the
   * wrong proportions is a map that lies about distance, and distance is the
   * only thing this page is about.
   *
   * The labels are placed in fractions of the sheet, from the same projection
   * that drew the canvas. There is no second coordinate system to drift out of
   * step with the first — which is the bug this design exists to not have.
   */
  showTheatre(theatre: Theatre, prev: Theatre | undefined, onDone: () => void): void {
    this.clearPanel();

    const el = document.createElement('div');
    el.className = 'theatre';

    // The sheet takes the height, the caption takes what is left of the width.
    // One piece of arithmetic for both, so the panel can never overlap the
    // paper however odd the viewport is.
    const capW = Math.round(Math.min(460, Math.max(280, innerWidth * 0.31)));
    const availW = innerWidth - capW - 116;
    const availH = innerHeight - 92;
    let sw = availW;
    let sh = sw / CANVAS_ASPECT;
    if (sh > availH) {
      sh = availH;
      sw = sh * CANVAS_ASPECT;
    }

    const sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.style.width = `${Math.round(sw)}px`;
    sheet.style.height = `${Math.round(sh)}px`;
    // Drawn at 1.6× and shown down, which is the cheapest anti-aliasing there
    // is and it matters here: this page is nothing but ruled lines.
    const cw = Math.round(sw * 1.6);
    const ch = Math.round(sh * 1.6);
    sheet.appendChild(theatreSheet(theatre, cw, ch));

    /*
     * THE ARRIVAL.
     *
     * The page opens on the war as the player last saw it and then changes in
     * front of them: marks that moved slide, ghosts of where they were fade in
     * behind, new scars ink themselves. About a second and a half, and they did
     * nothing to cause any of it — which is the point. The war moved while they
     * were busy somewhere else.
     *
     * Only the marks redraw. The paper, the coast and the grid are printed once
     * and never touched, which is both what makes this cheap and what makes the
     * eight pages read as one page at eight moments.
     */
    let marks = theatreMarks(theatre, prev, cw, ch, prev ? 0 : 1);
    marks.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    sheet.appendChild(marks);

    const ring = document.createElement('canvas');
    ring.className = 'ringlayer';
    ring.width = Math.round(sw);
    ring.height = Math.round(sh);
    ring.style.width = `${Math.round(sw)}px`;
    ring.style.height = `${Math.round(sh)}px`;
    const rc = ring.getContext('2d')!;
    sheet.appendChild(ring);

    const labels = theatre.tokens.map((t) => {
      const [fx, fy] = canvasAt(t.lon, t.lat);
      const conf = confidenceOf(t, theatre.asOf);
      const m = document.createElement('div');
      m.className = `tmark ${conf}`;
      m.textContent = t.label;
      // Off the marker by the offset the sheet drew the leader line to, scaled
      // out of base units — one set of numbers for the ink and the type both,
      // so a label can never drift off the end of its own leader.
      const [dx, dy] = labelOffset(t);
      const s = sw / CANVAS_W;
      m.style.left = `calc(${(fx * 100).toFixed(3)}% + ${(dx * s).toFixed(1)}px)`;
      m.style.top = `calc(${(fy * 100).toFixed(3)}% + ${(dy * s).toFixed(1)}px)`;
      // Held back until the marks have finished moving. A caption that arrives
      // before the thing it names is a caption pointing at nothing.
      if (prev) m.style.opacity = '0';
      sheet.appendChild(m);
      return m;
    });

    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.style.width = `${capW}px`;
    const keys = document.createElement('div');
    keys.className = 'keys';
    keys.innerHTML = '<b>← →</b> read the marks · <b>Space</b> to go on';

    el.append(sheet, caption, keys);
    this.root.appendChild(el);
    this.panel = el;

    // -1 is the sheet itself: the act's standing, before any mark is chosen.
    let focus = -1;
    const draw = (): void => {
      labels.forEach((m, i) => m.classList.toggle('on', i === focus));
      rc.clearRect(0, 0, ring.width, ring.height);
      if (focus < 0) {
        caption.innerHTML =
          '<div class="head">' +
          `<span class="who">${theatre.title}</span>` +
          `<span class="when">as it stood, ${longDate(theatre.asOf)}</span></div>` +
          `<div class="standing">${theatre.standing}</div>`;
        return;
      }
      const t = theatre.tokens[focus];
      const [fx, fy] = canvasAt(t.lon, t.lat);
      // Drawn twice at slightly different radii, the way a hand goes round
      // twice when it wants a thing found again later.
      rc.strokeStyle = INK.SETTLED;
      rc.lineWidth = 1;
      for (const [r, a] of [[26, 0.9], [30, 0.45]] as [number, number][]) {
        rc.globalAlpha = a;
        rc.beginPath();
        rc.arc(fx * ring.width, fy * ring.height, r, 0, Math.PI * 2);
        rc.stroke();
      }
      rc.globalAlpha = 1;
      caption.innerHTML =
        '<div class="head">' +
        `<span class="who"><span class="sq">${gridRef(t.lon, t.lat)}</span>${t.label}</span>` +
        `<span class="when">${focus + 1} of ${theatre.tokens.length}</span></div>` +
        `<div class="note">${t.note}</div>` +
        `<div class="from">${provenanceOf(t, theatre.asOf)}</div>`;
    };
    draw();

    if (prev) {
      const HOLD = 380;
      const RUN = 1150;
      const t0 = performance.now();
      const step = (): void => {
        // The panel is gone — the player pressed on. Stop redrawing it.
        if (!el.isConnected) return;
        const t = (performance.now() - t0 - HOLD) / RUN;
        const next = theatreMarks(theatre, prev, cw, ch, Math.min(1, Math.max(0, t)));
        next.style.cssText = marks.style.cssText;
        marks.replaceWith(next);
        marks = next;
        if (t >= 0.78) for (const m of labels) m.style.opacity = '1';
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    this.detach();
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'Tab') {
        e.preventDefault();
        focus = focus + 1 >= theatre.tokens.length ? -1 : focus + 1;
        draw();
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        focus = focus - 1 < -1 ? theatre.tokens.length - 1 : focus - 1;
        draw();
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        this.clearPanel();
        onDone();
      }
    };
    addEventListener('keydown', this.keyHandler);
  }

  /**
   * The act's reckoning: the two counts, and every man between them.
   *
   * This is the only screen in the game where a number the player can see moves
   * because of something they chose, so it is also the screen most at risk of
   * being read as a score. Three things keep it from being one, and all three
   * are decisions made here rather than in the arithmetic:
   *
   *  - the lines are grouped by direction and by nothing else. Not by whose
   *    fault they were. The 6,800 whose enlistments expired sit above the 1,100
   *    who walked off in January in the same column, in the same ink, and the
   *    player is never told which of the two they caused.
   *  - the causes are printed in full and the numbers are not explained. A
   *    student reading this page learns what happened to an army; they do not
   *    learn what the game thought of them for it.
   *  - the closing count is a fact with a date on it, not a result. It is set
   *    in the same type as the opening count for exactly that reason.
   *
   * Rendered from `reckon()` every time. Nothing on this page is stored, and
   * the same decisions will always print the same page.
   */
  showReckoning(r: Reckoning, onDone: () => void): void {
    this.clearPanel();

    // Grouped by sign, and `reckon()` has already sorted within each — heaviest
    // first in both directions — so the page opens on the hole.
    const gone = r.lines.filter((l) => l.n < 0);
    const came = r.lines.filter((l) => l.n > 0);
    const items = (ls: LedgerLine[]): string =>
      ls
        .map(
          (l) =>
            `<div class="item"><b>${Math.abs(l.n).toLocaleString()}</b>` +
            `<span>${l.cause}</span></div>`,
        )
        .join('');

    const el = document.createElement('div');
    el.className = 'reckoning';
    el.innerHTML =
      '<h2>The army, counted twice</h2>' +
      '<div class="sub">Everything that happened to it in between, and why.</div>' +
      `<div class="count open"><b>${r.openedWith.toLocaleString()}</b>` +
      `<span>on the rolls, ${r.openedOn}</span></div>` +
      (gone.length ? `<div class="head">Gone</div>${items(gone)}` : '') +
      (came.length ? `<div class="head">Stayed, or come in</div>${items(came)}` : '') +
      `<div class="count close"><b>${r.closedWith.toLocaleString()}</b>` +
      `<span>on the rolls, ${r.closedOn}</span></div>` +
      '<div class="continue">press <b>Space</b></div>';

    this.root.appendChild(el);
    this.panel = el;
    this.waitForDismiss(onDone);
  }

  private detach(): void {
    if (this.keyHandler) removeEventListener('keydown', this.keyHandler);
    this.keyHandler = null;
    if (this.panelCleanup) {
      this.panelCleanup();
      this.panelCleanup = null;
    }
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

  /**
   * Carry a scene change through bare paper.
   *
   * `swap` runs at full white, so the player never sees the new plate assemble.
   * 400ms out, a 100ms hold that does the work of a held breath, 400ms back —
   * the 900ms 02 §8.6 specifies for an act break.
   */
  fadeThrough(swap: () => void, done: () => void): void {
    const f = document.createElement('div');
    f.className = 'fade';
    this.root.appendChild(f);
    // Force a style recalc so the browser has a computed opacity of 0 to
    // transition FROM. Without it the append and the class land in one batch,
    // there is no start value, and the fade snaps to white in a single frame —
    // which is a cut, i.e. exactly the thing this method exists not to be.
    void f.offsetWidth;
    f.classList.add('on');

    setTimeout(() => {
      swap();
      setTimeout(() => {
        f.classList.remove('on');
        setTimeout(() => {
          f.remove();
          done();
        }, 400);
      }, 100);
    }, 400);
  }

  /*
   * A painted portrait if one has been generated for this face, and the
   * procedural stand-in if not. The fallback is not a placeholder in the
   * disposable sense — it is what ships until 03b's eighteen sheets exist, and
   * it must never be the thing that stops a scene being playable.
   */
  private wellFor(p: Portrait): string {
    const painted = portraitFor(p.id);
    if (painted) {
      return (
        `<div class="well painted" style="${cellStyle(painted)}" ` +
        `role="img" aria-label="${painted.name}"></div>`
      );
    }
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
   * Not a list with a picture beside it, and no longer a fixed circle you swing
   * with a menu — a view through an instrument you AIM. The screen goes dark and
   * hazy, the way a far shore is to the naked eye, and the glass becomes the
   * pointer: a magnifying circle the player moves across the panorama, holding
   * it on a position until the position resolves and names itself.
   *
   * Seven positions are hidden in the view. Each is marked by a faint shimmer so
   * nobody is ever hunting a blank field, but the shimmer only blooms into a
   * bright ring — and the name — when the glass settles on it and is held there.
   * That is the difference between a looking assignment and a reading one (07):
   * the reward for putting the glass on Bunker's Hill and keeping it there is
   * that Bunker's Hill is now a thing you found, not a row you clicked.
   *
   * Everything is painted on one canvas. The darkened scene, the rings, the
   * glow that gathers under the glass, the brass rim of the eyepiece and the
   * lens's own faults — the fall-off toward the edge and the fringe of colour a
   * cheap eighteenth-century glass leaves — are all ink and light on a surface.
   * 02 §8.1 forbids the alternative: a circle made of border-radius and a glow
   * made of a drop shadow is a web element pretending to be an instrument.
   *
   * The scene behind the glass is a still, grabbed once when the glass is
   * raised. A man with his eye to a glass is holding still, and the whole frame
   * going quiet is most of what makes this an instrument and not a menu.
   */
  showSurvey(
    label: string,
    source: HTMLCanvasElement,
    targets: { id: string; at: number; y: number; bearing: string; name: string; done: boolean }[],
    onPick: (id: string) => void,
    onDone: () => void,
  ): void {
    this.clearPanel();
    const wrap = document.createElement('div');
    wrap.className = 'glass';

    const field = document.createElement('canvas');
    field.className = 'field';
    const caption = document.createElement('div');
    caption.className = 'eyecap';
    const hint = document.createElement('div');
    hint.className = 'instr';
    hint.innerHTML =
      'move the glass · hold it on a position to make it out · ' +
      'press <b>Space</b> to lower the glass';
    wrap.append(field, caption, hint);
    this.root.append(wrap);
    this.panel = wrap;

    const g = field.getContext('2d')!;
    const TAU = Math.PI * 2;
    const ZOOM = 3.4; // magnification of the glass over the naked-eye backdrop
    const HOLD = 520; // ms the glass must rest on a position before it resolves

    // Screen and buffer sizing. The canvas is drawn in CSS pixels; the backing
    // store is scaled by the device ratio so the rim and the type stay crisp.
    let W = 0;
    let H = 0;
    let dpr = 1;
    let D = 0; // glass diameter, on screen
    // The cover transform from the snapshot to the screen — the same arithmetic
    // as `object-fit: cover`, so a target's (at, y) lands in the right place and
    // the magnified crop is taken from the matching spot in the source.
    let scale = 1;
    let ox = 0;
    let oy = 0;
    // The darkened panorama, painted once and blitted every frame.
    const bg = document.createElement('canvas');
    const bgx = bg.getContext('2d')!;

    const layout = (): void => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = innerWidth;
      H = innerHeight;
      D = Math.round(Math.min(W, H) * 0.42);
      field.width = Math.round(W * dpr);
      field.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      scale = Math.max(W / source.width, H / source.height);
      ox = (W - source.width * scale) / 2;
      oy = (H - source.height * scale) / 2;

      // Paint the backdrop: the scene, covered to the screen, then pushed back
      // into dusk so the naked eye cannot pick a battery out of the far shore.
      bg.width = field.width;
      bg.height = field.height;
      bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgx.clearRect(0, 0, W, H);
      bgx.drawImage(source, 0, 0, source.width, source.height, ox, oy, source.width * scale, source.height * scale);
      // A cool wash over everything — distance, and the light going.
      bgx.fillStyle = 'rgba(14, 18, 26, 0.44)';
      bgx.fillRect(0, 0, W, H);
      bgx.fillStyle = 'rgba(9, 7, 5, 0.42)';
      bgx.fillRect(0, 0, W, H);
    };

    // Where each target sits on screen, through the same cover transform.
    const sxOf = (t: { at: number }): number => ox + t.at * source.width * scale;
    const syOf = (t: { y: number }): number => oy + t.y * source.height * scale;

    // The glass follows the pointer; arrow keys nudge it for the keyboard. It
    // starts in the middle, glass lowered onto the centre of the water.
    const pos = { x: 0, y: 0 };
    let placed = false;
    const clamp = (): void => {
      pos.x = Math.max(6, Math.min(W - 6, pos.x));
      pos.y = Math.max(6, Math.min(H - 6, pos.y));
    };

    // Focus accumulates while the glass rests near an un-made-out position, and
    // bleeds away when it moves off. `locked` guards the hand-off so a position
    // resolves exactly once even though the loop is still running the frame it
    // crosses the line.
    let focusId: string | null = null;
    let focusMs = 0;
    let locked = false;

    const nearestOpen = (): { t: typeof targets[number]; d: number } | null => {
      let best: { t: typeof targets[number]; d: number } | null = null;
      for (const t of targets) {
        if (t.done) continue;
        const d = Math.hypot(pos.x - sxOf(t), pos.y - syOf(t));
        if (!best || d < best.d) best = { t, d };
      }
      return best;
    };

    /** One ring on the far shore — a soft glow and a crisp arc of ink-light. */
    const ring = (x: number, y: number, r: number, glow: number, solid: number): void => {
      if (glow > 0) {
        const grad = g.createRadialGradient(x, y, 0, x, y, r * 2.2);
        grad.addColorStop(0, `rgba(243, 183, 91, ${0.28 * glow})`);
        grad.addColorStop(0.5, `rgba(243, 183, 91, ${0.12 * glow})`);
        grad.addColorStop(1, 'rgba(243, 183, 91, 0)');
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x, y, r * 2.2, 0, TAU);
        g.fill();
      }
      g.strokeStyle = `rgba(245, 196, 110, ${solid})`;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
    };

    /** The eyepiece: the magnified crop, its faults, the rings it resolves, and the brass. */
    const eyepiece = (cx: number, cy: number, t: number): void => {
      const span = D / (scale * ZOOM); // source pixels shown across the glass
      const sx = (cx - ox) / scale - span / 2;
      const sy = (cy - oy) / scale - span / 2;

      g.save();
      g.beginPath();
      g.arc(cx, cy, D / 2, 0, TAU);
      g.clip();
      // Black behind, in case the crop runs off the edge of the world.
      g.fillStyle = '#0a0806';
      g.fillRect(cx - D / 2, cy - D / 2, D, D);
      g.drawImage(source, sx, sy, span, span, cx - D / 2, cy - D / 2, D, D);
      // Chromatic fringe: the crop again, offset a whisker and added on the red
      // side, which is what an uncorrected lens does at its edges.
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.14;
      g.drawImage(source, sx, sy, span, span, cx - D / 2 - 3, cy - D / 2, D + 6, D);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      // Fall-off toward the rim.
      const vig = g.createRadialGradient(cx, cy, D * 0.2, cx, cy, D / 2);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(0.62, 'rgba(20,16,10,0.10)');
      vig.addColorStop(1, 'rgba(14,11,7,0.82)');
      g.fillStyle = vig;
      g.fillRect(cx - D / 2, cy - D / 2, D, D);

      /*
       * The rings, drawn AGAIN inside the glass at the magnified positions.
       *
       * The magnified crop is a slice of the raw scene and carries none of the
       * rings painted on the backdrop, so without this a position vanished the
       * moment the glass covered it — which is exactly the thing the glass is
       * for. Here each position that falls within the crop is re-drawn at its
       * place in the lens, larger because everything in the lens is larger, so
       * putting the glass on a position is what makes it clearest, not what
       * hides it.
       */
      const pulse = 0.5 + 0.5 * Math.sin(t / 620);
      for (const tg of targets) {
        const gx = cx - D / 2 + ((tg.at * source.width - sx) / span) * D;
        const gy = cy - D / 2 + ((tg.y * source.height - sy) / span) * D;
        if (Math.hypot(gx - cx, gy - cy) > D / 2 - 6) continue; // outside the lens
        if (tg.done) {
          ring(gx, gy, 26, 0.6, 0.9);
          g.fillStyle = 'rgba(245, 226, 190, 0.95)';
          g.font = '600 15px Georgia, "Times New Roman", serif';
          g.textAlign = 'center';
          g.fillText(tg.name.toUpperCase(), gx, gy + 46);
        } else {
          const focusing = focusId === tg.id ? focusMs / HOLD : 0;
          ring(gx, gy, 24 + 5 * focusing, 0.3 + 0.16 * pulse + 0.7 * focusing, 0.5 + 0.5 * focusing);
        }
      }

      // A hair of a reticle. Two short strokes, not a rifle sight.
      g.strokeStyle = 'rgba(38,30,20,0.5)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx - 16, cy);
      g.lineTo(cx + 16, cy);
      g.moveTo(cx, cy - 16);
      g.lineTo(cx, cy + 16);
      g.stroke();
      g.restore();

      // The brass — the barrel and its collar, drawn as two rings of the object,
      // not as a shadow cast by a floating pane.
      g.strokeStyle = '#23180F';
      g.lineWidth = 7;
      g.beginPath();
      g.arc(cx, cy, D / 2 + 3.5, 0, TAU);
      g.stroke();
      g.strokeStyle = '#4A3A24';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, D / 2 + 8.5, 0, TAU);
      g.stroke();

      /*
       * The gathering arc, around the rim of the glass itself. Holding the glass
       * on a position fills a bright ring clockwise from the top; when it closes,
       * the position resolves. It lives on the brass rather than on the target,
       * because the target is under the glass and cannot be seen from outside it.
       */
      if (focusId && focusMs > 0) {
        g.strokeStyle = 'rgba(245, 205, 130, 0.95)';
        g.lineWidth = 3.5;
        g.beginPath();
        g.arc(cx, cy, D / 2 + 6, -Math.PI / 2, -Math.PI / 2 + TAU * (focusMs / HOLD));
        g.stroke();
      }
    };

    let alive = true;
    let last = 0;
    const frame = (t: number): void => {
      if (!alive || this.panel !== wrap) return;
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;

      // Advance or bleed the focus on the nearest open position.
      const near = nearestOpen();
      const FOCUS_R = D * 0.16;
      if (near && near.d < FOCUS_R) {
        if (focusId !== near.t.id) {
          focusId = near.t.id;
          focusMs = 0;
        }
        focusMs += dt;
        if (focusMs >= HOLD && !locked) {
          locked = true;
          alive = false;
          onPick(near.t.id); // shows the position's entry, then re-raises the glass
          return;
        }
      } else {
        focusId = null;
        focusMs = Math.max(0, focusMs - dt * 1.6);
      }

      g.clearRect(0, 0, W, H);
      g.drawImage(bg, 0, 0, W, H);

      // The rings on the far shore. Found positions hold a steady ring and their
      // name; open ones shimmer faintly, and brighten as the glass gathers on
      // them.
      const pulse = 0.5 + 0.5 * Math.sin(t / 620);
      for (const tg of targets) {
        const x = sxOf(tg);
        const y = syOf(tg);
        if (tg.done) {
          ring(x, y, 15, 0.5, 0.85);
          g.fillStyle = 'rgba(243, 214, 173, 0.92)';
          g.font = '600 12px Georgia, "Times New Roman", serif';
          g.textAlign = 'center';
          g.fillText(tg.name.toUpperCase(), x, y + 30);
        } else {
          // A faint naked-eye shimmer, so the eye has somewhere to take the
          // glass. It brightens a little as the glass gathers on it, but the
          // real resolving — the bright ring, the name — happens in the lens.
          const focusing = focusId === tg.id ? focusMs / HOLD : 0;
          ring(x, y, 13, 0.16 + 0.12 * pulse + 0.35 * focusing, 0.26 + 0.3 * focusing);
        }
      }

      eyepiece(pos.x, pos.y, t);
      requestAnimationFrame(frame);
    };

    const render = (): void => {
      const left = targets.filter((t) => !t.done).length;
      caption.textContent = left
        ? `${label} · ${left} of ${targets.length} still to make out`
        : `${label} · all of it named`;
    };

    const onResize = (): void => {
      layout();
      if (!placed) {
        pos.x = W / 2;
        pos.y = H / 2;
        placed = true;
      }
      clamp();
    };

    wrap.addEventListener('pointermove', (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      placed = true;
      clamp();
    });

    // The keyboard: arrows aim, Space lowers the glass. Held directly rather
    // than through waitForDismiss because the arrows have to be caught too.
    this.keyHandler = (e: KeyboardEvent) => {
      const STEP = 26;
      if (e.key === 'ArrowLeft') pos.x -= STEP;
      else if (e.key === 'ArrowRight') pos.x += STEP;
      else if (e.key === 'ArrowUp') pos.y -= STEP;
      else if (e.key === 'ArrowDown') pos.y += STEP;
      else if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        alive = false;
        this.clearPanel();
        onDone();
        return;
      } else return;
      e.preventDefault();
      placed = true;
      clamp();
    };
    addEventListener('keydown', this.keyHandler);
    addEventListener('resize', onResize);
    // Torn down when the panel is cleared — by Space here, or by the examine
    // overlay that opens when a position resolves — so neither the loop nor the
    // resize listener outlives the glass.
    this.panelCleanup = () => {
      alive = false;
      removeEventListener('resize', onResize);
    };

    onResize();
    render();
    requestAnimationFrame(frame);
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
