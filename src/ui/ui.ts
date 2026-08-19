/**
 * The interface controller.
 *
 * One class owns every panel. Each public method that shows something returns a
 * promise that resolves when the student has finished with it, so the game loop
 * reads as `await ui.say(...)` and nothing has to run a state machine over the
 * dialogue.
 *
 * R18 is obeyed: text reveals at 45 characters a second and any input completes
 * the block instantly, so a fast reader never waits for the machine.
 */

import { INK, type VoiceId } from '../palette';
import type { Decision, DocumentDef, Line } from '../types';
import { councilFor, lockOn, rejoinderFor } from '../council';
import type { GameState } from '../state';
import { emblem, sealMark } from './emblems';
import {
  sfxCancel, sfxConfirm, sfxDenied, sfxDocument, sfxSeal, sfxSelect, sfxType, sfxVoice,
} from '../engine/audio';

const REVEAL_CPS = 45;

const VOICE_NAME: Record<VoiceId, string> = {
  ambition: 'Ambition', restraint: 'Restraint', temper: 'Temper',
  duty: 'Duty', vanity: 'Vanity',
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, cls?: string, html?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface UiHooks {
  /** Portrait data URL for a speaker id, or null for a narrator block. */
  portraitFor(id: string | undefined): string | null;
  /** The current save code, for the letterbook's last tab. */
  passport(): string;
}

export class Ui {
  readonly root: HTMLDivElement;
  private banner: HTMLDivElement;
  private rail: HTMLDivElement;
  private reach: HTMLDivElement;
  private dialogue: HTMLDivElement;
  private portrait: HTMLDivElement;
  private speaker: HTMLDivElement;
  private textEl: HTMLDivElement;
  private councilEl: HTMLDivElement;
  private choicesEl: HTMLDivElement;
  private hintEl: HTMLDivElement;
  private sealedEl: HTMLDivElement;
  private reader: HTMLDivElement;
  private sheet: HTMLDivElement;
  private menu: HTMLDivElement;
  private tabsEl: HTMLDivElement;
  private pagesEl: HTMLDivElement;
  private curtain: HTMLDivElement;
  private toastEl: HTMLDivElement;
  private titleEl: HTMLDivElement;

  /** True while any modal panel owns the keyboard. */
  modal = false;

  private resolveKey: ((code: string) => void) | null = null;
  /** Set only while `reveal()` is animating. See the constructor listener. */
  private revealSkip: (() => void) | null = null;

  constructor(private hooks: UiHooks) {
    this.root = el('div');
    this.root.id = 'ui';

    this.banner = el('div');
    this.banner.id = 'banner';
    this.banner.innerHTML = `<span class="place"></span><span class="when"></span>`;

    this.rail = el('div');
    this.rail.id = 'rail';
    this.rail.innerHTML = `<h4>This morning</h4><ul></ul>`;

    this.reach = el('div');
    this.reach.id = 'reach';

    this.dialogue = el('div', 'panel');
    this.dialogue.id = 'dialogue';
    this.portrait = el('div');
    this.portrait.id = 'portrait';
    const say = el('div');
    say.id = 'say';
    this.sealedEl = el('div');
    this.sealedEl.id = 'sealed';
    this.sealedEl.innerHTML =
      `<img src="${sealMark()}" alt=""><span class="words">This will not come again</span>`;
    this.speaker = el('div');
    this.speaker.id = 'speaker';
    this.textEl = el('div');
    this.textEl.id = 'text';
    this.councilEl = el('div');
    this.councilEl.id = 'council';
    this.choicesEl = el('div');
    this.choicesEl.id = 'choices';
    this.hintEl = el('div');
    this.hintEl.id = 'hint';
    say.append(this.sealedEl, this.speaker, this.textEl, this.councilEl, this.choicesEl, this.hintEl);
    this.dialogue.append(this.portrait, say);

    this.reader = el('div');
    this.reader.id = 'reader';
    this.sheet = el('div');
    this.sheet.id = 'sheet';
    this.reader.append(this.sheet);

    this.menu = el('div');
    this.menu.id = 'menu';
    const book = el('div', 'panel');
    book.id = 'book';
    this.tabsEl = el('div');
    this.tabsEl.id = 'tabs';
    this.pagesEl = el('div');
    this.pagesEl.id = 'pages';
    book.append(this.tabsEl, this.pagesEl);
    this.menu.append(book);

    this.curtain = el('div');
    this.curtain.id = 'curtain';
    this.toastEl = el('div');
    this.toastEl.id = 'toast';

    this.titleEl = el('div');
    this.titleEl.id = 'title';
    this.titleEl.innerHTML = `
      <div class="sub">An American history</div>
      <h1>In Washington's Shoes</h1>
      <div class="sub">Act One &mdash; Mount Vernon, May 1775</div>
      <div class="go">Press <span class="key">SPACE</span> to begin</div>`;

    this.root.append(
      this.banner, this.rail, this.reach, this.dialogue,
      this.reader, this.menu, this.curtain, this.toastEl, this.titleEl,
    );

    /*
     * The one keydown listener that decides whether a press belongs to a
     * panel or to the world.
     *
     * It has to run before `installInput()`'s handler does (it does — this
     * listener is attached here, in the constructor, and `installInput()` is
     * only called once `Game.start()` runs, well after `new Ui(...)` has
     * already returned), and it has to use `stopImmediatePropagation()`, NOT
     * `stopPropagation()`.
     *
     * Both listeners sit on the exact same target — `window` — and
     * `stopPropagation()` only stops an event from reaching OTHER nodes as it
     * bubbles or captures; it does nothing at all to a second listener
     * registered on that same node, which is exactly the case here. The first
     * attempt at this fix used `stopPropagation()`, watched the bug happen
     * again in a scripted repro, and that is why this comment now says
     * `stopImmediatePropagation()` explicitly rather than leaving it to be
     * gotten wrong the same way twice.
     *
     * With the right call: while a panel is modal, every key it consumes is
     * stopped dead before `installInput()`'s handler ever runs, so it can
     * never land in the movement/interact system's `PRESSED` set. Losing this
     * meant the Space press that dismissed a line of dialogue also queued up
     * as a fresh "interact" for the very next frame — the player was still
     * standing next to whoever they were just talking to, so the same
     * conversation restarted, forever, every time they tried to leave.
     */
    window.addEventListener('keydown', (e) => {
      if (!this.modal) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this.revealSkip) { this.revealSkip(); return; }
      if (this.resolveKey) {
        const r = this.resolveKey;
        this.resolveKey = null;
        r(e.code);
      }
    });
  }

  /* ---------------- banner, rail, reach ---------------------------- */

  setPlace(place: string, when: string): void {
    (this.banner.querySelector('.place') as HTMLElement).textContent = place;
    (this.banner.querySelector('.when') as HTMLElement).textContent = when;
    this.banner.classList.remove('away');
    window.setTimeout(() => this.banner.classList.add('away'), 3600);
  }

  setObjectives(items: Array<{ text: string; done: boolean }>, heading = 'This morning'): void {
    (this.rail.querySelector('h4') as HTMLElement).textContent = heading;
    const ul = this.rail.querySelector('ul')!;
    ul.innerHTML = '';
    for (const it of items) {
      const li = el('li', it.done ? 'done' : '');
      li.textContent = it.text;
      ul.append(li);
    }
    this.rail.classList.toggle('hide', items.length === 0);
  }

  setReach(label: string | null, extra = 0): void {
    if (!label) { this.reach.classList.remove('on'); return; }
    this.reach.innerHTML =
      `<span class="key">SPACE</span><span>${label}</span>` +
      (extra > 0 ? `<span class="more">&nbsp;&middot; TAB for ${extra} more</span>` : '');
    this.reach.classList.add('on');
  }

  /* ---------------- text ------------------------------------------- */

  private async reveal(node: HTMLElement, text: string): Promise<void> {
    node.textContent = '';
    const cur = el('span', 'cursor', '&#9646;');
    node.append(cur);
    let i = 0;
    let done = false;
    // Routed through the constructor's one listener rather than a private
    // one here, so a key that fast-forwards the reveal is ALSO stopped from
    // reaching the game world — the same leak that broke dialogue advance.
    this.revealSkip = () => { done = true; };
    while (i < text.length && !done) {
      const step = Math.max(1, Math.round(REVEAL_CPS / 30));
      i = Math.min(text.length, i + step);
      cur.before(text.slice(i - step, i));
      if (i % 3 === 0) sfxType();
      await sleep(1000 / 30);
    }
    this.revealSkip = null;
    cur.remove();
    node.textContent = text;
  }

  private waitKey(codes: string[] = []): Promise<string> {
    return new Promise((resolve) => {
      const onKey = (code: string) => {
        if (codes.length && !codes.includes(code)) { this.resolveKey = onKey; return; }
        resolve(code);
      };
      this.resolveKey = onKey;
    });
  }

  /** One or more lines of speech. Resolves when the last has been dismissed. */
  async say(lines: Line[], speakerId?: string): Promise<void> {
    this.modal = true;
    this.dialogue.classList.add('on');
    this.councilEl.innerHTML = '';
    this.choicesEl.innerHTML = '';
    this.sealedEl.classList.remove('on');

    for (const line of lines) {
      const por = this.hooks.portraitFor(speakerId ?? line.speaker);
      if (por) {
        this.portrait.classList.remove('empty');
        this.portrait.innerHTML = `<img src="${por}" alt="">`;
      } else {
        this.portrait.classList.add('empty');
      }
      this.speaker.textContent = line.speaker === '—' ? '' : line.speaker;
      this.hintEl.innerHTML = `<span style="opacity:.7">SPACE to continue</span>`;
      await this.reveal(this.textEl, line.text);
      await this.waitKey(['Space', 'Enter', 'KeyE']);
    }
    this.close();
  }

  /** Narration with no speaker — arrival text, examine text, results. */
  async narrate(text: string | string[]): Promise<void> {
    const arr = Array.isArray(text) ? text : [text];
    await this.say(arr.map((t) => ({ speaker: '—', text: t })));
  }

  close(): void {
    this.dialogue.classList.remove('on');
    this.modal = false;
  }

  /* ---------------- decisions --------------------------------------- */

  /**
   * The decision panel: the question, then the Council, then the options.
   *
   * The Council speaks BEFORE the options appear, one voice at a time, because
   * the set of voices is the stat readout and a student has to be given the
   * beat to notice who did not turn up.
   */
  async decide(d: Decision, state: GameState): Promise<string> {
    this.modal = true;
    this.dialogue.classList.add('on');
    this.choicesEl.innerHTML = '';
    this.councilEl.innerHTML = '';
    this.hintEl.textContent = '';
    this.sealedEl.classList.toggle('on', !!d.sealed);

    const por = this.hooks.portraitFor(d.portrait ?? d.speaker);
    if (por) {
      this.portrait.classList.remove('empty');
      this.portrait.innerHTML = `<img src="${por}" alt="">`;
    } else {
      this.portrait.classList.add('empty');
    }
    this.speaker.textContent = d.speaker ?? '';
    await this.reveal(this.textEl, d.prompt);

    const voices = councilFor(d, state.stats);
    for (const v of voices) {
      await sleep(190);
      sfxVoice(v.id);
      const row = el('div', 'voice');
      row.innerHTML =
        `<img src="${emblem(v.id)}" alt="">` +
        `<div><span class="who" style="color:${INK[v.id]}">${VOICE_NAME[v.id]}</span> ` +
        `<span class="said">${v.line}</span></div>`;
      this.councilEl.append(row);
    }
    const last = rejoinderFor(d, voices, state.stats);
    if (last) {
      await sleep(360);
      sfxVoice(last.id);
      const row = el('div', 'voice');
      row.innerHTML =
        `<img src="${emblem(last.id)}" alt="">` +
        `<div><span class="who" style="color:${INK[last.id]}">${VOICE_NAME[last.id]}</span> ` +
        `<span class="said">${last.line}</span></div>`;
      this.councilEl.append(row);
    }

    // Options.
    const rows: HTMLDivElement[] = [];
    const openIdx: number[] = [];
    d.options.forEach((o, i) => {
      const lock = lockOn(o, state.stats, state.knowledge);
      const row = el('div', 'choice' + (lock.locked ? ' locked' : ''));
      const fav = (o.favoured ?? [])
        .map((v) => `<img src="${emblem(v)}" alt="${VOICE_NAME[v]}" title="${VOICE_NAME[v]}">`)
        .join('');
      let note = '';
      if (lock.locked && lock.kind === 'knowledge') {
        note = `<span class="note">&mdash; ${lock.note ?? 'you have not read what you would need to'}</span>`;
      } else if (lock.locked && lock.kind === 'voice') {
        note = `<span class="note">&mdash; ${VOICE_NAME[lock.voice]} is not loud enough to say this</span>`;
      }
      row.innerHTML =
        `<span class="bullet">&#9654;</span>` +
        `<span><span class="label">${o.full}</span>${note}</span>` +
        `<span class="favoured">${fav}</span>`;
      this.choicesEl.append(row);
      rows.push(row);
      if (!lock.locked) openIdx.push(i);
    });

    this.hintEl.innerHTML =
      `<span style="opacity:.7">&#8593;&#8595; choose &nbsp;&middot;&nbsp; SPACE to commit</span>`;

    let cursor = openIdx[0] ?? 0;
    const paint = () => rows.forEach((r, i) => r.classList.toggle('sel', i === cursor));
    paint();

    rows.forEach((r, i) => {
      r.addEventListener('mouseenter', () => { if (openIdx.includes(i)) { cursor = i; paint(); } });
      r.addEventListener('click', () => { if (openIdx.includes(i)) { cursor = i; paint(); commit(); } });
    });

    let chosen: string | null = null;
    const commit = () => { chosen = d.options[cursor].id; };

    while (chosen === null) {
      const code = await this.waitKey();
      if (code === 'ArrowUp' || code === 'KeyW') {
        const p = openIdx.indexOf(cursor);
        cursor = openIdx[(p - 1 + openIdx.length) % openIdx.length];
        sfxSelect(); paint();
      } else if (code === 'ArrowDown' || code === 'KeyS') {
        const p = openIdx.indexOf(cursor);
        cursor = openIdx[(p + 1) % openIdx.length];
        sfxSelect(); paint();
      } else if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
        if (!openIdx.includes(cursor)) { sfxDenied(); continue; }
        commit();
      }
    }

    if (d.sealed) sfxSeal(); else sfxConfirm();
    this.close();
    return chosen;
  }

  /* ---------------- documents ---------------------------------------- */

  async read(doc: DocumentDef): Promise<void> {
    this.modal = true;
    sfxDocument();
    this.sheet.className = doc.register;
    this.sheet.innerHTML =
      `<h2>${doc.title}</h2>` +
      `<div class="cite">${doc.cite}</div>` +
      (doc.gloss ? `<div class="gloss">${doc.gloss}</div>` : '') +
      `<div class="body">${doc.body.map((p) => `<p>${p}</p>`).join('')}</div>` +
      `<div class="close">SPACE or ESC to put it down</div>`;
    this.reader.classList.add('on');
    this.sheet.scrollTop = 0;
    for (;;) {
      const code = await this.waitKey();
      if (['Space', 'Enter', 'Escape', 'KeyE'].includes(code)) break;
      if (code === 'ArrowDown') this.sheet.scrollTop += 90;
      if (code === 'ArrowUp') this.sheet.scrollTop -= 90;
    }
    sfxCancel();
    this.reader.classList.remove('on');
    this.modal = false;
  }

  /* ---------------- the letterbook ------------------------------------ */

  async openBook(
    tabs: Array<{ id: string; label: string; render(): string }>,
  ): Promise<void> {
    this.modal = true;
    this.menu.classList.add('on');
    let sel = 0;
    const paint = () => {
      this.tabsEl.innerHTML = tabs
        .map((t, i) => `<div class="tab${i === sel ? ' sel' : ''}">${t.label}</div>`)
        .join('');
      this.pagesEl.innerHTML = tabs[sel].render();
      Array.from(this.tabsEl.children).forEach((n, i) =>
        n.addEventListener('click', () => { sel = i; sfxSelect(); paint(); }));
    };
    paint();
    for (;;) {
      const code = await this.waitKey();
      if (code === 'Escape' || code === 'KeyQ') break;
      if (code === 'ArrowRight' || code === 'Tab') { sel = (sel + 1) % tabs.length; sfxSelect(); paint(); }
      if (code === 'ArrowLeft') { sel = (sel - 1 + tabs.length) % tabs.length; sfxSelect(); paint(); }
      if (code === 'ArrowDown') this.pagesEl.scrollTop += 80;
      if (code === 'ArrowUp') this.pagesEl.scrollTop -= 80;
    }
    sfxCancel();
    this.menu.classList.remove('on');
    this.modal = false;
  }

  /* ---------------- odds and ends -------------------------------------- */

  toast(text: string): void {
    this.toastEl.textContent = text;
    this.toastEl.classList.add('on');
    window.setTimeout(() => this.toastEl.classList.remove('on'), 3200);
  }

  async fadeOut(ms = 280): Promise<void> {
    this.curtain.classList.add('on');
    await sleep(ms);
  }

  async fadeIn(ms = 280): Promise<void> {
    this.curtain.classList.remove('on');
    await sleep(ms);
  }

  async title(): Promise<void> {
    this.modal = true;
    for (;;) {
      const code = await this.waitKey();
      if (['Space', 'Enter'].includes(code)) break;
    }
    this.titleEl.classList.add('off');
    this.modal = false;
  }

  hideTitle(): void { this.titleEl.classList.add('off'); }
}
