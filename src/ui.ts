/**
 * The DOM overlay: dialogue, options, council interjections, examine text.
 *
 * The player spends most of the game here, so this is where the design
 * attention goes. Rules honoured from the docs, each of which a document
 * somewhere else got wrong and the critics caught:
 *
 *  - a council voice's ink colours its NAME only. The line beneath is always
 *    INK-SETTLED at 10.66:1. Colour is never the only channel.
 *  - locked options are struck, glyphed and annotated — never greyed. Greying
 *    text below contrast threshold is the most common accessibility failure in
 *    games and we are not committing it.
 *  - nothing is timed. Not one choice, in eight acts.
 */

import { INK, PAPER, VOICE_INK, type VoiceId } from './palette';
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

  .plate-title {
    position: absolute; top: 26px; left: 34px;
    font-variant: small-caps; letter-spacing: .09em;
    font-size: 15px; color: ${INK.LIGHT};
  }
  .plate-title b { display: block; font-size: 20px; color: ${INK.SETTLED}; font-weight: 600; }

  .hint {
    position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%);
    font-size: 14px; color: ${INK.LIGHT}; letter-spacing: .04em;
  }

  .prompt {
    position: absolute; transform: translate(-50%, 0);
    font-size: 14px; letter-spacing: .05em; color: ${INK.SETTLED};
    background: ${PAPER.BRIGHT}; border: 1px solid ${INK.FADED};
    padding: 3px 10px; white-space: nowrap;
  }
  .prompt::after { content: ""; }

  .panel {
    position: absolute; left: 50%; bottom: 34px; transform: translateX(-50%);
    width: min(1080px, calc(100vw - 64px));
    background: ${PAPER.BRIGHT};
    border: 1px solid ${INK.FADED};
    box-shadow: 0 18px 44px rgba(36,28,20,.22);
    padding: 22px 26px; pointer-events: auto;
    display: flex; gap: 22px;
  }
  .well { width: 300px; height: 400px; flex: 0 0 300px;
          display: flex; align-items: center; justify-content: center;
          background: ${PAPER.COOL}; border: 1px solid ${INK.FADED}; }
  .well img { width: 288px; height: 384px; display: block; }
  .panel.compact .well { display: none; }
  .body { flex: 1; min-width: 0; display: flex; flex-direction: column; }

  .speaker { font-variant: small-caps; letter-spacing: .1em; font-size: 15px;
             color: ${INK.LIGHT}; margin-bottom: 8px; }
  .line { font-size: 19px; line-height: 1.55; max-width: 64ch; }

  .council { margin: 16px 0 4px; border-left: 2px solid ${PAPER.SHADOW}; padding-left: 14px; }
  .voice { margin-bottom: 10px; }
  .voice-name { font-variant: small-caps; letter-spacing: .11em; font-size: 14px;
                font-weight: 700; display: block; }
  .voice-line { font-style: italic; font-size: 18px; line-height: 1.5;
                color: ${INK.SETTLED}; max-width: 62ch; }

  .options { list-style: none; margin: 16px 0 0; padding: 0; }
  .options li { margin: 0 0 2px; }
  .opt {
    display: block; width: 100%; text-align: left; cursor: pointer;
    background: none; border: none; padding: 8px 10px;
    font: inherit; font-size: 18px; line-height: 1.5; color: ${INK.SETTLED};
    border-left: 3px solid transparent;
  }
  .opt:hover, .opt:focus-visible { background: ${PAPER.SMOKED}; border-left-color: ${INK.SETTLED}; outline: none; }
  .opt.locked {
    cursor: not-allowed; color: ${INK.LOCKED};
    text-decoration: line-through; text-decoration-thickness: 1px;
  }
  .opt.locked:hover { background: none; border-left-color: transparent; }
  /* inline-block, not inline: text-decoration propagates to inline children,
     and the note is an annotation about the strike, not part of it. */
  .margin-note { font-style: italic; font-size: 15px; color: ${INK.LIGHT};
                 text-decoration: none; display: inline-block; margin-left: 10px; }
  .glyph { color: ${INK.LIGHT}; margin-right: 8px; text-decoration: none; display: inline-block; }

  .continue { margin-top: 14px; font-size: 14px; color: ${INK.LIGHT}; letter-spacing: .05em; }

  .codebar {
    position: absolute; top: 22px; right: 26px; pointer-events: auto;
    background: ${PAPER.BRIGHT}; border: 1px solid ${INK.FADED};
    padding: 10px 14px; font-size: 13px; letter-spacing: .06em; color: ${INK.LIGHT};
  }
  .codebar b { display: block; font-size: 16px; letter-spacing: .16em;
               color: ${INK.SETTLED}; font-weight: 600; margin-top: 4px;
               font-variant-numeric: tabular-nums; }
`;

export interface OptionView {
  id: string;
  text: string;
  locked: boolean;
  lockNote?: string;
}

export class Overlay {
  private root: HTMLElement;
  private panel: HTMLElement | null = null;

  constructor(root: HTMLElement, title: string, subtitle: string) {
    this.root = root;
    const t = document.createElement('div');
    t.className = 'plate-title';
    t.innerHTML = `<b>${title}</b>${subtitle}`;
    root.appendChild(t);

    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = '← → or A / D to walk · E or Space to look · Esc to step back';
    root.appendChild(hint);
  }

  private clearPanel(): void {
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

  showPrompt(label: string, screenX: number, screenY: number): void {
    let el = this.root.querySelector<HTMLElement>('.prompt');
    if (!el) {
      el = document.createElement('div');
      el.className = 'prompt';
      this.root.appendChild(el);
    }
    el.textContent = label;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;
    el.style.display = 'block';
  }

  hidePrompt(): void {
    const el = this.root.querySelector<HTMLElement>('.prompt');
    if (el) el.style.display = 'none';
  }

  /** Examine text: no portrait, no options, dismiss to continue. */
  showExamine(label: string, text: string, onDone: () => void): void {
    const p = this.makePanel(true);
    const body = document.createElement('div');
    body.className = 'body';
    body.innerHTML =
      `<div class="speaker">${label}</div>` +
      `<div class="line">${text}</div>` +
      `<div class="continue">press Space or Esc to continue</div>`;
    p.appendChild(body);
    this.waitForDismiss(onDone);
  }

  showLine(
    speaker: string,
    text: string,
    portrait: { seed: number; coat: string },
    onDone: () => void,
  ): void {
    const p = this.makePanel();
    p.appendChild(this.wellFor(portrait));
    const body = document.createElement('div');
    body.className = 'body';
    body.innerHTML =
      `<div class="speaker">${speaker}</div>` +
      `<div class="line">${text}</div>` +
      `<div class="continue">press Space to continue</div>`;
    p.appendChild(body);
    this.waitForDismiss(onDone);
  }

  showDecision(
    speaker: string,
    prompt: string,
    portrait: { seed: number; coat: string },
    voices: { id: VoiceId; line: string }[],
    options: OptionView[],
    onPick: (id: string) => void,
  ): void {
    const p = this.makePanel();
    p.appendChild(this.wellFor(portrait));

    const body = document.createElement('div');
    body.className = 'body';
    body.innerHTML = `<div class="speaker">${speaker}</div><div class="line">${prompt}</div>`;

    if (voices.length) {
      const council = document.createElement('div');
      council.className = 'council';
      for (const v of voices) {
        const el = document.createElement('div');
        el.className = 'voice';
        // Name carries the colour; the line never does.
        el.innerHTML =
          `<span class="voice-name" style="color:${VOICE_INK[v.id]}">${v.id}</span>` +
          `<span class="voice-line">${v.line}</span>`;
        council.appendChild(el);
      }
      body.appendChild(council);
    }

    const ul = document.createElement('ul');
    ul.className = 'options';
    for (const o of options) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.className = o.locked ? 'opt locked' : 'opt';
      b.type = 'button';
      if (o.locked) {
        b.disabled = true;
        b.setAttribute('aria-disabled', 'true');
        b.innerHTML =
          `<span class="glyph">✕</span>${o.text}` +
          `<span class="margin-note">— ${o.lockNote ?? 'not available'}</span>`;
      } else {
        b.textContent = o.text;
        b.addEventListener('click', () => onPick(o.id));
      }
      li.appendChild(b);
      ul.appendChild(li);
    }
    body.appendChild(ul);
    p.appendChild(body);

    const first = ul.querySelector<HTMLButtonElement>('.opt:not(.locked)');
    first?.focus();
  }

  private wellFor(portrait: { seed: number; coat: string }): HTMLElement {
    const well = document.createElement('div');
    well.className = 'well';
    const img = document.createElement('img');
    img.src = portraitPlate(portrait.coat, portrait.seed).toDataURL();
    img.alt = '';
    well.appendChild(img);
    return well;
  }

  private waitForDismiss(onDone: () => void): void {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        removeEventListener('keydown', handler);
        this.clearPanel();
        onDone();
      }
    };
    addEventListener('keydown', handler);
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
