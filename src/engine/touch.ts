/**
 * THE THUMB PAD — playing this on a phone.
 *
 * The game was built for a classroom Chromebook and it shows: everything is
 * on the keyboard, nothing needs a mouse, and on a telephone none of that is
 * reachable at all. This file is the whole of the fix, and it is deliberately
 * the only file in the engine that knows a touchscreen exists.
 *
 * THE ONE IDEA: A FINGER PRESSES KEYS.
 *
 * Every button on the pad dispatches a real `KeyboardEvent` at `window` —
 * `Space` for act, `Tab` for cycle, `Escape` for the letterbook, `ShiftLeft`
 * held for the ground survey, `F1` for travel. They arrive at the same
 * listeners a keyboard's would, in the same order, with the same
 * `stopImmediatePropagation()` fight between the modal panel and the world
 * already settled the way it was settled months ago. Nothing else in the game
 * needed changing, and nothing else in the game can tell the difference.
 *
 * The single exception is the stick, which writes an analogue vector into
 * `input.ts` through `setTouchAxis`, because a key is on or off and a thumb
 * is neither. Quantising a thumb to eight directions is what makes a phone
 * port feel like a d-pad taped to a screen.
 *
 * THE STICK FLOATS.
 *
 * It has no fixed home. Put a thumb down anywhere in the lower-left of the
 * screen and the stick appears under it; drag and it follows; lift and it is
 * gone. A stick painted in one place is a stick you have to look at, and the
 * whole point of a thumb control is that the eyes stay on the game. This also
 * solves the two-hand problem for free: left thumb walks from wherever it
 * happens to land, right thumb presses.
 *
 * TAP TO CONTINUE.
 *
 * A single capture-phase listener on `window` turns any tap that is not on
 * something already interactive into `Space`, but only while a panel is open.
 * That covers dialogue, narration, documents, notices, the reckoning and the
 * letterbook in one rule, and it is why none of those panels needed a line of
 * their own. It distinguishes a tap from a drag by distance and duration, so
 * scrolling a long document does not also dismiss it — which it did, on the
 * first build, on the very first document anybody tried to read.
 */

import { setTouchAxis } from './input';

export interface TouchOpts {
  /**
   * True while any panel owns the input: a conversation, a document, the
   * letterbook, a map table, the travel list. The pad hides itself and taps
   * become "continue".
   */
  panelOpen: () => boolean;
  /** True while the player is somewhere the ground survey works. */
  canSurvey: () => boolean;
}

/* ---------------------------------------------------------------------- *
 * Synthetic keys
 * ---------------------------------------------------------------------- */

/**
 * `code` is what the whole game reads; `key` is filled in for the sake of
 * anything that ever looks at it, and `bubbles` matters because every
 * listener in the game is on `window` and half of them are on the bubble
 * phase.
 */
function keyEvent(type: 'keydown' | 'keyup', code: string): KeyboardEvent {
  const key = code === 'Space' ? ' '
    : code.startsWith('Key') ? code.slice(3).toLowerCase()
      : code.startsWith('Arrow') || code === 'Escape' || code === 'Tab' || code === 'Enter' ? code
        : code === 'ShiftLeft' ? 'Shift'
          : code;
  return new KeyboardEvent(type, { code, key, bubbles: true, cancelable: true });
}

function tap(code: string): void {
  window.dispatchEvent(keyEvent('keydown', code));
  window.dispatchEvent(keyEvent('keyup', code));
}

function hold(code: string, down: boolean): void {
  window.dispatchEvent(keyEvent(down ? 'keydown' : 'keyup', code));
}

/* ---------------------------------------------------------------------- *
 * Is this a phone?
 * ---------------------------------------------------------------------- */

/**
 * Coarse pointer, or a screen that reports touch points, or `?touch=1`.
 *
 * The query parameter is not a debug afterthought — it is how anybody checks
 * this layout without a phone in their hand, and it is how a teacher on a
 * touchscreen laptop that reports a fine pointer gets the pad anyway. A
 * device with both a keyboard and a touchscreen gets the pad AND the
 * keyboard, because both work and neither costs the other anything.
 */
export function wantsTouch(): boolean {
  try {
    const forced = new URLSearchParams(location.search).get('touch');
    if (forced === '1') return true;
    if (forced === '0') return false;
  } catch { /* no location, no query, no matter */ }
  try {
    if (window.matchMedia('(pointer: coarse)').matches) return true;
  } catch { /* older browser */ }
  return (navigator.maxTouchPoints ?? 0) > 0;
}

/**
 * What the interface should call the "go on" key.
 *
 * Every hint in the game used to say SPACE, which on a phone is a lie about
 * a key that is not there. One constant, read once at boot, rather than a
 * branch in each of the eleven places that print a hint — and it is a
 * constant rather than a function because the answer cannot change during a
 * session: a device does not grow a keyboard halfway through Act 3.
 */
export const KEY_GO = wantsTouch() ? 'TAP' : 'SPACE';

/** And what to call the "put it down" key: there is no ESC under a thumb. */
export const KEY_BACK = wantsTouch() ? 'TAP' : 'ESC';

/* ---------------------------------------------------------------------- *
 * The pad
 * ---------------------------------------------------------------------- */

function el(tag: string, cls: string, html = ''): HTMLElement {
  const n = document.createElement(tag);
  n.className = cls;
  if (html) n.innerHTML = html;
  return n;
}

/** Where the thumb has to travel for the stick to read full deflection. */
const STICK_RADIUS = 56;
/** Below this the stick reads as centred, so a resting thumb does not creep. */
const STICK_DEAD = 0.16;
/** A tap is a press that moved less than this many pixels... */
const TAP_SLOP = 14;
/** ...and lasted less than this long. */
const TAP_MS = 600;

export class TouchPad {
  readonly root: HTMLElement;
  private stick: HTMLElement;
  private knob: HTMLElement;
  private zone: HTMLElement;
  private lookBtn: HTMLElement;

  /** The pointer currently driving the stick, or null. */
  private stickId: number | null = null;
  private originX = 0;
  private originY = 0;

  constructor(private o: TouchOpts) {
    this.root = el('div', 'pad');
    this.root.id = 'pad';

    this.zone = el('div', 'stickzone');
    this.stick = el('div', 'stick');
    this.knob = el('div', 'knob');
    this.stick.append(this.knob);
    this.zone.append(this.stick);

    const btns = el('div', 'btns');
    const act = this.button('act', 'ACT', 'Talk, examine, continue');
    const cycle = this.button('cycle', 'NEXT', 'Cycle what is in reach');
    this.lookBtn = this.button('look', 'LOOK', 'Read the ground');
    btns.append(this.lookBtn, cycle, act);

    const pills = el('div', 'pills');
    const book = this.button('pill', 'BOOK', 'The letterbook');
    const maps = this.button('pill', 'GO', 'Travel');
    pills.append(book, maps);

    this.root.append(this.zone, btns, pills);

    /* --- the stick ---------------------------------------------------- */
    this.zone.addEventListener('pointerdown', (e) => {
      if (this.stickId !== null) return;
      this.stickId = e.pointerId;
      this.zone.setPointerCapture(e.pointerId);
      this.originX = e.clientX;
      this.originY = e.clientY;
      this.stick.style.left = `${e.clientX}px`;
      this.stick.style.top = `${e.clientY}px`;
      this.stick.classList.add('on');
      this.drag(e.clientX, e.clientY);
      e.preventDefault();
    });
    this.zone.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.stickId) return;
      this.drag(e.clientX, e.clientY);
      e.preventDefault();
    });
    const release = (e: PointerEvent) => {
      if (e.pointerId !== this.stickId) return;
      this.stickId = null;
      this.stick.classList.remove('on');
      this.knob.style.transform = 'translate(-50%,-50%)';
      setTouchAxis(0, 0);
    };
    this.zone.addEventListener('pointerup', release);
    this.zone.addEventListener('pointercancel', release);

    /* --- the buttons -------------------------------------------------- */
    this.press(act, () => tap('Space'));
    this.press(cycle, () => tap('Tab'));
    this.press(book, () => tap('Escape'));
    this.press(maps, () => tap('F1'));

    /*
     * LOOK is held, not tapped, because the survey it opens is held — that
     * is a decision the overlay made for good reasons and this button is not
     * the place to overturn it. Press and the ground is read; lift and it is
     * not; and you can still walk with the other thumb while you do it.
     */
    this.lookBtn.addEventListener('pointerdown', (e) => {
      this.lookBtn.setPointerCapture(e.pointerId);
      this.lookBtn.classList.add('down');
      hold('ShiftLeft', true);
      e.preventDefault();
    });
    const lookUp = () => {
      this.lookBtn.classList.remove('down');
      hold('ShiftLeft', false);
    };
    this.lookBtn.addEventListener('pointerup', lookUp);
    this.lookBtn.addEventListener('pointercancel', lookUp);

    this.installTapToContinue();
  }

  private button(cls: string, label: string, title: string): HTMLElement {
    const b = el('button', `b b-${cls}`, label);
    b.setAttribute('type', 'button');
    b.setAttribute('aria-label', title);
    b.setAttribute('title', title);
    return b;
  }

  /**
   * A button that fires on press rather than on click.
   *
   * `click` on a touchscreen is a synthesised event that arrives up to three
   * hundred milliseconds after the finger lands, and in a game that reads as
   * a broken button. Firing on `pointerdown` and swallowing the click is the
   * whole difference between a control that feels made of wood and one that
   * feels made of nothing.
   */
  private press(node: HTMLElement, fn: () => void): void {
    node.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      node.classList.add('down');
      fn();
    });
    const up = () => node.classList.remove('down');
    node.addEventListener('pointerup', up);
    node.addEventListener('pointercancel', up);
    node.addEventListener('pointerleave', up);
    node.addEventListener('click', (e) => e.preventDefault());
  }

  private drag(cx: number, cy: number): void {
    let dx = (cx - this.originX) / STICK_RADIUS;
    let dy = (cy - this.originY) / STICK_RADIUS;
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    const mag = Math.min(1, len);
    this.knob.style.transform =
      `translate(calc(-50% + ${dx * STICK_RADIUS}px), calc(-50% + ${dy * STICK_RADIUS}px))`;
    if (mag < STICK_DEAD) { setTouchAxis(0, 0); return; }
    setTouchAxis(dx, dy);
  }

  /**
   * Any tap that is not already on something interactive, while a panel is
   * open, is "continue".
   *
   * Capture phase on `window`, so it does not care what is painted on top of
   * what — which matters, because the panels are a plain DOM stack with no
   * z-index anywhere in the stylesheet and working out which of them is
   * frontmost at a given moment is not a thing this file should have to know.
   *
   * The drag test is the part that was learned rather than designed. Without
   * it, the first drag of a scrollable document — the reckoning, a long
   * notice, the letterbook — dismissed the document instead of scrolling it.
   */
  private installTapToContinue(): void {
    let sx = 0, sy = 0, st = 0, live = false;
    window.addEventListener('pointerdown', (e) => {
      live = e.pointerType !== 'mouse' && this.o.panelOpen();
      sx = e.clientX; sy = e.clientY; st = performance.now();
    }, true);
    window.addEventListener('pointerup', (e) => {
      if (!live) return;
      live = false;
      if (!this.o.panelOpen()) return;
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > TAP_SLOP) return;
      if (performance.now() - st > TAP_MS) return;
      const t = e.target as HTMLElement | null;
      // Anything that already answers a tap answers this one instead: a
      // decision option, a travel destination, a map-table control, a button.
      if (t?.closest('.choice, .row, .dest, .opt, .board, button, a, input, select, textarea')) return;
      tap('Space');
    }, true);
  }

  /** Called every frame. Cheap, and it is the only thing that owns the pad's
   * visibility, so there is exactly one place where the pad can be wrong. */
  update(): void {
    const panel = this.o.panelOpen();
    this.root.classList.toggle('away', panel);
    // Published on the root element so the stylesheet can react to it —
    // the objective rail is hidden behind an open panel on a phone, where
    // it is a clipped half-sentence poking out from under a conversation.
    document.documentElement.classList.toggle('panel', panel);
    this.lookBtn.classList.toggle('off', !this.o.canSurvey());
    if (panel && this.stickId !== null) {
      // A panel opened with a thumb still on the stick — a conversation
      // starting as you walk into someone is the common case — so let go of
      // it for them, or he keeps walking into the wall behind them.
      this.stickId = null;
      this.stick.classList.remove('on');
      setTouchAxis(0, 0);
    }
  }
}

/** Build the pad if this is a touch device, and nothing at all if it is not. */
export function installTouch(o: TouchOpts): TouchPad | null {
  if (!wantsTouch()) return null;
  document.documentElement.classList.add('touch');
  return new TouchPad(o);
}
