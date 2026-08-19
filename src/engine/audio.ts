/**
 * Sound, synthesised. No audio files ship, for the same reason no images do.
 *
 * Everything here is a short envelope over an oscillator or a noise burst. It
 * is not a score — it is the layer of small confirmations that separates a
 * thing that feels like a game from a thing that feels like a document viewer,
 * and it was the cheapest single upgrade available.
 *
 * R14 stands: fife and drum are diegetic only. Nothing in this file plays them.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

function ac(): AudioContext | null {
  if (!enabled) return null;
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.32;
    master.connect(ctx.destination);
  } catch {
    enabled = false;
    return null;
  }
  return ctx;
}

/** Browsers will not start audio until the student has touched something. */
export function unlockAudio(): void {
  const c = ac();
  if (c && c.state === 'suspended') void c.resume();
}

export function setAudioEnabled(on: boolean): void {
  enabled = on;
  if (master) master.gain.value = on ? 0.32 : 0;
}

export function audioEnabled(): boolean { return enabled; }

function env(node: AudioNode, t0: number, attack: number, decay: number, peak: number): GainNode {
  const c = ctx!;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  node.connect(g);
  g.connect(master!);
  return g;
}

function tone(freq: number, dur: number, type: OscillatorType, peak = 0.2, slideTo?: number): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  env(o, t0, 0.006, dur, peak);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise(dur: number, peak: number, lp: number, hp = 60): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, Math.max(1, n), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  const low = c.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = lp;
  const high = c.createBiquadFilter();
  high.type = 'highpass';
  high.frequency.value = hp;
  src.connect(low); low.connect(high);
  env(high, t0, 0.004, dur, peak);
  src.start(t0);
}

let stepFlip = false;

/** A footfall. Alternates so a walk has a left and a right in it. */
export function sfxStep(surface: 'grass' | 'gravel' | 'board' | 'stone' = 'grass'): void {
  stepFlip = !stepFlip;
  const lp = surface === 'grass' ? 900 : surface === 'gravel' ? 2600 : surface === 'board' ? 1500 : 3200;
  noise(surface === 'board' ? 0.07 : 0.05, surface === 'grass' ? 0.055 : 0.085, lp * (stepFlip ? 1 : 0.86));
  if (surface === 'board') tone(stepFlip ? 96 : 88, 0.05, 'sine', 0.06);
}

/** The type blip under revealed text. Quiet, and pitched to the speaker. */
export function sfxType(pitch = 1): void {
  tone(520 * pitch, 0.022, 'square', 0.028);
}

export function sfxSelect(): void { tone(660, 0.05, 'triangle', 0.10, 880); }
export function sfxConfirm(): void { tone(523, 0.09, 'triangle', 0.13, 784); }
export function sfxCancel(): void { tone(392, 0.09, 'triangle', 0.10, 294); }
export function sfxDenied(): void { tone(196, 0.14, 'sawtooth', 0.07, 165); }

/** Examining something. A page turning, more or less. */
export function sfxExamine(): void { noise(0.13, 0.06, 3400, 900); }

/** A document opening: paper, then a settling low note. */
export function sfxDocument(): void {
  noise(0.18, 0.07, 3000, 700);
  tone(147, 0.4, 'sine', 0.05);
}

/** A door. Latch, then the swing. */
export function sfxDoor(): void {
  tone(140, 0.05, 'square', 0.06);
  noise(0.26, 0.05, 700, 90);
}

/** A decision committing. This is the only sound in the game with weight. */
export function sfxSeal(): void {
  const c = ac();
  if (!c) return;
  noise(0.10, 0.10, 1200, 200);
  tone(110, 0.75, 'sine', 0.14);
  tone(164.8, 0.6, 'sine', 0.07);
}

/** A Council voice arriving. Pitched per voice, so the ear learns them. */
const VOICE_PITCH: Record<string, number> = {
  ambition: 392, restraint: 294, temper: 220, duty: 262, vanity: 440,
};
export function sfxVoice(id: string): void {
  tone(VOICE_PITCH[id] ?? 330, 0.16, 'sine', 0.07);
  tone((VOICE_PITCH[id] ?? 330) * 1.5, 0.10, 'sine', 0.03);
}
