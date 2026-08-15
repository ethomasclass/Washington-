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
import { portraitPlate } from './art';

export const CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; background: ${PAPER.WARM}; }
  #app { position: relative; width: 100vw; height: 100vh; }
  #stage { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  #overlay {
    position: absolute; inset: 0; pointer-events: none;
    font-family: "Source Sans 3", "Source Sans Pro", system-ui, sans-serif;
    color: ${INK.SETTLED};
  }

  .plate-title { position: absolute; top: 26px; left: 34px; font-variant: small-caps;
                 letter-spacing: .09em; font-size: 15px; color: ${INK.LIGHT}; }
  .plate-title b { display: block; font-size: 20px; color: ${INK.SETTLED}; font-weight: 600; }

  /* Washington's own sense of what is unfinished. Not an objective marker —
     it is written as a thought, and it names people rather than tasks. */
  .intent { position: absolute; top: 82px; left: 34px; max-width: 40ch;
            font-size: 16px; line-height: 1.5; font-style: italic; color: ${INK.FADED};
            border-left: 2px solid ${PAPER.SHADOW}; padding-left: 12px; }

  .journal { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
             width: min(680px, calc(100vw - 64px)); background: ${PAPER.BRIGHT};
             border: 1px solid ${INK.FADED}; box-shadow: 0 18px 44px rgba(36,28,20,.22);
             padding: 26px 30px; pointer-events: auto; }
  .journal h2 { margin: 0 0 4px; font-size: 20px; font-variant: small-caps;
                letter-spacing: .08em; font-weight: 600; }
  .journal h3 { margin: 18px 0 6px; font-size: 14px; font-variant: small-caps;
                letter-spacing: .1em; color: ${INK.LIGHT}; font-weight: 700; }
  .journal ul { margin: 0; padding-left: 20px; font-size: 17px; line-height: 1.6; }
  .journal .none { font-size: 17px; color: ${INK.LIGHT}; font-style: italic; }

  .hint { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%);
          font-size: 14px; color: ${INK.LIGHT}; letter-spacing: .04em; }

  /* Speech is anchored to whoever is speaking. The figure is standing right
     there, so the bubble carries no portrait — the portrait well is for the
     deliberation panel, where there is no body on screen to look at. */
  .bubble { position: absolute; transform: translate(-50%, -100%);
            width: max-content; max-width: min(46ch, calc(100vw - 80px));
            background: ${PAPER.BRIGHT}; border: 1px solid ${INK.FADED};
            padding: 13px 17px 14px; pointer-events: auto;
            box-shadow: 0 12px 30px rgba(36,28,20,.20); }
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
                    border-color: ${INK.FADED} transparent transparent transparent; }
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
            letter-spacing: .05em; color: ${INK.SETTLED}; background: ${PAPER.BRIGHT};
            border: 1px solid ${INK.FADED}; padding: 3px 10px; white-space: nowrap; }

  .panel { position: absolute; left: 50%; bottom: 34px; transform: translateX(-50%);
           width: min(1080px, calc(100vw - 64px)); background: ${PAPER.BRIGHT};
           border: 1px solid ${INK.FADED}; box-shadow: 0 18px 44px rgba(36,28,20,.22);
           padding: 22px 26px; pointer-events: auto; display: flex; gap: 22px; }
  .well { width: 300px; height: 400px; flex: 0 0 300px; display: flex; align-items: center;
          justify-content: center; background: ${PAPER.COOL}; border: 1px solid ${INK.FADED}; }
  .well img { width: 288px; height: 384px; display: block; }
  .panel.compact .well { display: none; }
  .body { flex: 1; min-width: 0; display: flex; flex-direction: column; }

  .speaker { font-variant: small-caps; letter-spacing: .1em; font-size: 15px;
             color: ${INK.LIGHT}; margin-bottom: 8px; }
  .line { font-size: 19px; line-height: 1.55; max-width: 64ch; }

  .council { margin: 16px 0 4px; border-left: 2px solid ${PAPER.SHADOW}; padding-left: 14px; }
  .voice { margin-bottom: 11px; }
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

  .codebar { position: absolute; top: 22px; right: 26px; pointer-events: auto;
             background: ${PAPER.BRIGHT}; border: 1px solid ${INK.FADED}; padding: 10px 14px;
             font-size: 13px; letter-spacing: .06em; color: ${INK.LIGHT}; }
  .codebar b { display: block; font-size: 16px; letter-spacing: .16em; color: ${INK.SETTLED};
               font-weight: 600; margin-top: 4px; font-variant-numeric: tabular-nums; }
`;

export interface VoiceView {
  id: VoiceId;
  line: string;
}

export interface OptionView {
  id: string;
  label: string;
  full: string;
  favoured: VoiceId[];
  locked: boolean;
  lockNote?: string;
}

type Portrait = { seed: number; coat: string };

export class Overlay {
  private root: HTMLElement;
  private panel: HTMLElement | null = null;
  private thought: HTMLElement | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(root: HTMLElement, title: string, subtitle: string) {
    this.root = root;
    const t = document.createElement('div');
    t.className = 'plate-title';
    t.innerHTML = `<b>${title}</b>${subtitle}`;
    root.appendChild(t);

    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = '← → ↑ ↓ or WASD to walk · E look · Enter confirm · J what remains';
    root.appendChild(hint);
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
      this.root.appendChild(el);
    }
    el.textContent = text;
  }

  /** Arrival card — the situation, before the player has control. */
  showOpening(title: string, subtitle: string, lines: string[], onDone: () => void): void {
    const p = this.makePanel(true);
    p.innerHTML =
      `<div class="body"><div class="speaker">${title} · ${subtitle}</div>` +
      lines.map((l) => `<div class="line" style="margin-bottom:10px">${l}</div>`).join('') +
      '<div class="continue">press <b>Space</b> to begin</div></div>';
    this.waitForDismiss(onDone);
  }

  /** What he has looked at, noticed, and still owes. Opened on demand. */
  showJournal(read: string[], owed: string[], noticed: string[], onDone: () => void): void {
    this.clearPanel();
    const j = document.createElement('div');
    j.className = 'journal';
    j.innerHTML =
      '<h2>What remains</h2>' +
      '<h3>Owed an answer</h3>' +
      (owed.length
        ? `<ul>${owed.map((o) => `<li>${o}</li>`).join('')}</ul>`
        : '<div class="none">Nothing. You may go when you please.</div>') +
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
  showCouncil(portrait: Portrait, voices: VoiceView[], onDone: () => void): void {
    const p = this.makePanel();
    p.innerHTML =
      this.wellFor(portrait) +
      '<div class="body"><div class="speaker">the council</div><div class="council">' +
      voices
        .map(
          (v) =>
            `<div class="voice"><span class="voice-name" style="color:${VOICE_INK[v.id]}">` +
            `${EMBLEM[v.id]}${v.id}</span>` +
            `<span class="voice-line">${v.line}</span></div>`,
        )
        .join('') +
      '</div><div class="continue">press <b>Space</b> to decide</div></div>';
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
      const why = f.locked
        ? `<span class="why">Locked — ${f.lockNote ?? 'not available to you'}.</span>`
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
            const lock = o.locked ? `<span class="glyph">${LOCK_GLYPH}</span>` : '';
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
