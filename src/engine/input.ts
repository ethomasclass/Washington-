/**
 * Input. Arrows or WASD to walk, Space/Enter/E to act, Tab to cycle what is in
 * reach, Escape for the letterbook, a gamepad if one is plugged in, and a
 * thumb on a phone.
 *
 * A classroom Chromebook may or may not have a trackpad the student can use
 * well, so everything is reachable from the keyboard and nothing needs a mouse.
 *
 * TOUCH ENTERS THIS FILE THROUGH EXACTLY ONE DOOR — `setTouchAxis`.
 *
 * Everything else the on-screen pad does, it does by dispatching real
 * `KeyboardEvent`s at `window`, so it arrives here through the same listener
 * a keyboard uses and every other consumer in the game — the modal panel in
 * `ui.ts`, the travel panel's `F1`, the survey sheet's arrows, the held
 * `Shift` the ground overlay reads — keeps working with no knowledge that a
 * finger was involved. See `engine/touch.ts`.
 *
 * The stick is the one thing that cannot go through that door, because a key
 * is on or off and a thumb is neither: quantising it to eight directions
 * makes a phone feel like a d-pad from 1987. So the stick, and only the
 * stick, writes an analogue vector straight into the state below.
 */

export interface InputState {
  ax: number;
  az: number;
  act: boolean;
  cancel: boolean;
  cycle: boolean;
  menu: boolean;
  any: boolean;
}

const DOWN = new Set<string>();
const PRESSED = new Set<string>();

/** The on-screen stick's vector, -1..1 on each axis. See `engine/touch.ts`. */
let touchX = 0, touchZ = 0;

/**
 * Set the analogue stick vector. Called from the touch layer on every
 * pointer move and zeroed on release; harmless on a machine with no touch,
 * where it is simply never called.
 */
export function setTouchAxis(x: number, z: number): void {
  touchX = x;
  touchZ = z;
}

const MOVE: Record<string, [number, number]> = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

const SWALLOW = new Set([
  ...Object.keys(MOVE), 'Space', 'Enter', 'KeyE', 'Tab', 'Escape', 'Backquote', 'F2',
]);

export function installInput(target: HTMLElement | Window = window): () => void {
  const down = (e: KeyboardEvent) => {
    if (e.repeat) { DOWN.add(e.code); return; }
    DOWN.add(e.code);
    PRESSED.add(e.code);
    if (SWALLOW.has(e.code)) e.preventDefault();
  };
  const up = (e: KeyboardEvent) => { DOWN.delete(e.code); };
  const blur = () => { DOWN.clear(); setTouchAxis(0, 0); };
  target.addEventListener('keydown', down as EventListener);
  target.addEventListener('keyup', up as EventListener);
  window.addEventListener('blur', blur);
  return () => {
    target.removeEventListener('keydown', down as EventListener);
    target.removeEventListener('keyup', up as EventListener);
    window.removeEventListener('blur', blur);
  };
}

let padCycle = false;
let padAct = false;
/**
 * Set once `getGamepads()` throws and never cleared for the rest of the
 * session. The optional-call `?.()` only guards a missing method — it does
 * nothing for a browser that HAS the method but whose Permissions-Policy
 * forbids calling it, which is exactly what an embedded iframe (Artifact's
 * viewer among them) does. Uncaught, that throws from inside the render
 * loop every single frame, and because nothing upstream wraps `readInput()`,
 * the first throw stops `requestAnimationFrame` from ever rescheduling —
 * the whole game freezes on frame one with no error the player can see.
 */
let gamepadBlocked = false;

export function readInput(): InputState {
  let ax = touchX, az = touchZ;
  for (const code of DOWN) {
    const m = MOVE[code];
    if (m) { ax += m[0]; az += m[1]; }
  }

  let pads: (Gamepad | null)[] = [];
  if (!gamepadBlocked) {
    try {
      pads = navigator.getGamepads?.() ?? [];
    } catch {
      gamepadBlocked = true;
    }
  }
  const pad = pads[0];
  let padActNow = false, padCycleNow = false, padMenu = false, padCancel = false;
  if (pad) {
    const dz = (v: number) => (Math.abs(v) > 0.35 ? v : 0);
    ax += dz(pad.axes[0] ?? 0);
    az += dz(pad.axes[1] ?? 0);
    if (pad.buttons[12]?.pressed) az -= 1;
    if (pad.buttons[13]?.pressed) az += 1;
    if (pad.buttons[14]?.pressed) ax -= 1;
    if (pad.buttons[15]?.pressed) ax += 1;
    padActNow = !!pad.buttons[0]?.pressed;
    padCycleNow = !!pad.buttons[5]?.pressed;
    padMenu = !!pad.buttons[9]?.pressed;
    padCancel = !!pad.buttons[1]?.pressed;
  }

  const edge = (code: string) => PRESSED.has(code);
  const state: InputState = {
    ax: Math.max(-1, Math.min(1, ax)),
    az: Math.max(-1, Math.min(1, az)),
    act: edge('Space') || edge('Enter') || edge('KeyE') || (padActNow && !padAct),
    cancel: edge('Escape') || padCancel,
    cycle: edge('Tab') || (padCycleNow && !padCycle),
    menu: edge('KeyQ') || padMenu,
    any: PRESSED.size > 0 || padActNow,
  };
  padAct = padActNow;
  padCycle = padCycleNow;
  return state;
}

/** Call once per frame, after everything has read the state. */
export function endFrameInput(): void {
  PRESSED.clear();
}

export function isDown(code: string): boolean { return DOWN.has(code); }
