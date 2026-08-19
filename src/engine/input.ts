/**
 * Input. Arrows or WASD to walk, Space/Enter/E to act, Tab to cycle what is in
 * reach, Escape for the letterbook, and a gamepad if one is plugged in.
 *
 * A classroom Chromebook may or may not have a trackpad the student can use
 * well, so everything is reachable from the keyboard and nothing needs a mouse.
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
  const blur = () => { DOWN.clear(); };
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

export function readInput(): InputState {
  let ax = 0, az = 0;
  for (const code of DOWN) {
    const m = MOVE[code];
    if (m) { ax += m[0]; az += m[1]; }
  }

  const pads = navigator.getGamepads?.() ?? [];
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
