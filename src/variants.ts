/**
 * Decision-UI comparison bench.
 *
 * Four takes on the same decision (A1-D1), so the reading load of each can be
 * judged against the others rather than described. Word counts are computed
 * live from what is actually on screen, because "it feels like a lot of text"
 * deserves a number.
 *
 * Not part of the game. This page exists to pick a direction.
 */

import { INK, PAPER, VOICE_INK, type VoiceId } from './palette';
import { LOCK_GLYPH, EMBLEM } from './emblems';
import { portraitPlate } from './art';

interface Opt {
  label: string;
  full: string;
  favoured: VoiceId[];
  locked?: boolean;
  lockNote?: string;
}

/** The current shipping copy. */
const OLD_PROMPT =
  'They will offer you the command. An army that does not exist, paid in a currency that does ' +
  'not hold, against the finest infantry in the world. What do you say?';

/** Trimmed. Same information, a third of the words. */
const NEW_PROMPT =
  'An army that does not exist, in a currency that does not hold, against the best infantry in ' +
  'the world. Well?';

const VOICES: { id: VoiceId; line: string }[] = [
  {
    id: 'restraint',
    line: 'You lost more men than you saved at the Monongahela. You have never commanded above a regiment.',
  },
  { id: 'duty', line: 'Virginia sent you. The question is not whether you want it.' },
  {
    id: 'ambition',
    line: 'No man in these colonies has held a field command like it. There will not be a second offer.',
  },
  {
    id: 'vanity',
    line: 'Wear the uniform to the chamber and let them arrive at the name themselves. It is not asking.',
  },
];

const OPTS: Opt[] = [
  {
    label: 'Accept — plainly',
    full: 'Say plainly that you do not think yourself equal to it.',
    favoured: ['restraint', 'duty'],
  },
  {
    label: 'Accept — and refuse the pay',
    full: 'Expenses only, accounted to the last shilling.',
    favoured: ['restraint', 'vanity'],
  },
  {
    label: 'Accept — and warn them',
    full: 'Tell them what Concord means: the regulars can be bled on a road. This will be a long war.',
    favoured: ['ambition', 'duty'],
    locked: true,
    lockNote: 'you have not read the Boston paper',
  },
  {
    label: 'Decline',
    full: 'Say the command should go to a man the New England men already trust.',
    favoured: ['restraint'],
  },
];

const OLD_OPTS = [
  'Accept, and say plainly that you do not think yourself equal to it.',
  'Accept, and refuse the pay — expenses only, accounted to the last shilling.',
  'Accept, and tell them what Concord means: the regulars can be bled on a road, and this will ' +
    'be a long war, not a short one.',
  'Decline. Say the command should go to a man the New England men already trust.',
];

const CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; background: ${PAPER.SMOKED};
         font-family: "Source Sans 3", system-ui, sans-serif; color: ${INK.SETTLED}; }
  .bar { position: sticky; top: 0; z-index: 10; display: flex; gap: 6px; align-items: center;
         flex-wrap: wrap; padding: 12px 20px; background: ${PAPER.BRIGHT};
         border-bottom: 1px solid ${INK.FADED}; }
  .bar h1 { font-size: 15px; margin: 0 14px 0 0; font-variant: small-caps; letter-spacing: .1em;
            font-weight: 600; }
  .tab { font: inherit; font-size: 14px; padding: 6px 14px; cursor: pointer;
         background: none; border: 1px solid ${INK.FADED}; color: ${INK.SETTLED}; }
  .tab[aria-pressed="true"] { background: ${INK.SETTLED}; color: ${PAPER.BRIGHT};
                              border-color: ${INK.SETTLED}; }
  .count { margin-left: auto; font-size: 13px; color: ${INK.LIGHT}; font-variant-numeric: tabular-nums; }
  .count b { color: ${INK.SETTLED}; font-size: 17px; }

  .stage { padding: 28px 20px 60px; display: flex; justify-content: center; }
  .note { max-width: 1080px; margin: 0 auto 18px; font-size: 15px; color: ${INK.LIGHT};
          line-height: 1.55; font-style: italic; }

  .panel { width: min(1080px, 100%); background: ${PAPER.BRIGHT}; border: 1px solid ${INK.FADED};
           box-shadow: 0 18px 44px rgba(36,28,20,.18); padding: 22px 26px; display: flex; gap: 22px; }
  .well { width: 300px; height: 400px; flex: 0 0 300px; background: ${PAPER.COOL};
          border: 1px solid ${INK.FADED}; display: flex; align-items: center; justify-content: center; }
  .well img { width: 288px; height: 384px; }
  .body { flex: 1; min-width: 0; }
  .speaker { font-variant: small-caps; letter-spacing: .1em; font-size: 15px; color: ${INK.LIGHT};
             margin-bottom: 8px; }
  .line { font-size: 19px; line-height: 1.55; max-width: 62ch; }

  .council { margin: 16px 0 4px; border-left: 2px solid ${PAPER.SHADOW}; padding-left: 14px; }
  .voice { margin-bottom: 10px; }
  .voice-name { font-variant: small-caps; letter-spacing: .11em; font-size: 14px; font-weight: 700;
                display: flex; align-items: center; gap: 8px; font-size: 15px; }
  .voice-line { font-style: italic; font-size: 18px; line-height: 1.5; max-width: 60ch; }

  .opts { list-style: none; margin: 18px 0 0; padding: 0; }
  .opt { display: block; width: 100%; text-align: left; cursor: pointer; background: none;
         border: none; border-left: 3px solid transparent; padding: 9px 10px; font: inherit;
         font-size: 18px; line-height: 1.5; color: ${INK.SETTLED}; }
  .opt:hover, .opt:focus-visible { background: ${PAPER.SMOKED}; border-left-color: ${INK.SETTLED};
                                   outline: none; }
  .opt.locked { cursor: not-allowed; color: ${INK.LOCKED}; text-decoration: line-through;
                text-decoration-thickness: 1px; }
  .opt.locked:hover { background: none; border-left-color: transparent; }
  .glyph { display: inline-block; text-decoration: none; margin-right: 8px; color: ${INK.LIGHT};
           vertical-align: -.12em; }
  .mnote { font-style: italic; font-size: 15px; color: ${INK.LIGHT}; text-decoration: none;
           display: inline-block; margin-left: 10px; }

  /* Short-label variants */
  .opt.short { display: flex; align-items: center; gap: 10px; font-size: 19px; }
  .opt.short .lbl { font-variant: small-caps; letter-spacing: .045em; }
  .marks { margin-left: auto; display: flex; gap: 9px; font-size: 23px; opacity: .9; }
  .expand { margin-top: 14px; padding: 12px 14px 12px 13px; border-left: 2px solid ${PAPER.SHADOW};
            font-size: 17px; line-height: 1.5; color: ${INK.SETTLED}; min-height: 3.2em;
            background: ${PAPER.WARM}; }
  .expand .why { display: block; margin-top: 7px; font-size: 14px; color: ${INK.LIGHT};
                 font-style: italic; }

  .emblem-row { display: flex; gap: 16px; align-items: center; margin: 14px 0 2px;
                padding-left: 2px; font-size: 22px; }
  .emblem-row .e { position: relative; }
  .beat { margin-top: 12px; font-size: 14px; color: ${INK.LIGHT}; letter-spacing: .04em; }
  .beatbtn { font: inherit; font-size: 14px; background: none; border: 1px solid ${INK.FADED};
             color: ${INK.SETTLED}; padding: 5px 12px; cursor: pointer; margin-left: 10px; }
`;

const style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);

const app = document.getElementById('app')!;
const bar = document.createElement('div');
bar.className = 'bar';
app.appendChild(bar);
const stage = document.createElement('div');
stage.className = 'stage';
app.appendChild(stage);

const TABS = [
  ['current', 'Current'],
  ['a', 'A — short labels'],
  ['b', 'B — two beats'],
  ['c', 'C — emblems'],
] as const;
type TabId = (typeof TABS)[number][0];

const NOTES: Record<TabId, string> = {
  current:
    'What ships today. Prompt, four council voices and four full-sentence options all arrive at ' +
    'once, every element the same density.',
  a:
    'Options collapse to short labels; the full sentence for the focused option appears in one ' +
    'place below. You skim four choices and read only the one you are weighing. Prompt trimmed.',
  b:
    'The council argues first and you click through it; the choice arrives on its own beat with ' +
    'the voices collapsed to a row of emblems. Same content, half the simultaneous load.',
  c:
    'The council’s opinion moves onto the options as emblems — a spur beside a choice ' +
    'means Ambition wants it. The lock becomes a key glyph instead of a sentence.',
};

let tab: TabId = 'a';
let focused = 0;
let beat: 'council' | 'choice' = 'council';

const h1 = document.createElement('h1');
h1.textContent = 'Decision UI';
bar.appendChild(h1);
for (const [id, label] of TABS) {
  const b = document.createElement('button');
  b.className = 'tab';
  b.textContent = label;
  b.addEventListener('click', () => {
    tab = id;
    focused = 0;
    beat = id === 'b' || id === 'c' ? 'council' : 'choice';
    render();
  });
  bar.appendChild(b);
}
const count = document.createElement('div');
count.className = 'count';
bar.appendChild(count);

const well = (): string =>
  `<div class="well"><img src="${portraitPlate('#55627A', 303).toDataURL()}" alt=""></div>`;

function councilBlock(): string {
  return (
    '<div class="council">' +
    VOICES.map(
      (v) =>
        `<div class="voice"><span class="voice-name" style="color:${VOICE_INK[v.id]}">` +
        `${EMBLEM[v.id]}${v.id}</span>` +
        `<span class="voice-line">${v.line}</span></div>`,
    ).join('') +
    '</div>'
  );
}

function longOptions(): string {
  return (
    '<ul class="opts">' +
    OLD_OPTS.map((t, i) => {
      const locked = i === 2;
      return (
        `<li><button class="opt${locked ? ' locked' : ''}"${locked ? ' disabled' : ''}>` +
        (locked
          ? `<span class="glyph">✕</span>${t}<span class="mnote">— you have not read the Boston paper</span>`
          : t) +
        '</button></li>'
      );
    }).join('') +
    '</ul>'
  );
}

function shortOptions(withEmblems: boolean): string {
  const items = OPTS.map((o, i) => {
    const marks = withEmblems
      ? `<span class="marks">${o.favoured
          .map((v) => `<span style="color:${VOICE_INK[v]}">${EMBLEM[v]}</span>`)
          .join('')}</span>`
      : '';
    const lock = o.locked
      ? withEmblems
        ? `<span class="glyph" title="locked — a primary source you have not read">${LOCK_GLYPH}</span>`
        : '<span class="glyph">✕</span>'
      : '';
    return (
      `<li><button class="opt short${o.locked ? ' locked' : ''}"${o.locked ? ' disabled' : ''} ` +
      `data-i="${i}">${lock}<span class="lbl">${o.label}</span>${marks}</button></li>`
    );
  }).join('');

  const f = OPTS[focused];
  const why =
    f.locked && f.lockNote
      ? `<span class="why">Locked — ${f.lockNote}.</span>`
      : withEmblems
        ? `<span class="why">${f.favoured.join(' and ')} would have it so.</span>`
        : '';
  return `<ul class="opts">${items}</ul><div class="expand">${f.full}${why}</div>`;
}

function emblemRow(): string {
  return (
    '<div class="emblem-row">' +
    VOICES.map(
      (v) =>
        `<span class="e" style="color:${VOICE_INK[v.id]}" title="${v.id}: ${v.line}">` +
        `${EMBLEM[v.id]}</span>`,
    ).join('') +
    '<span class="beat">the council has spoken — hover an emblem to hear it again</span></div>'
  );
}

function render(): void {
  for (const b of Array.from(bar.querySelectorAll<HTMLButtonElement>('.tab'))) {
    b.setAttribute(
      'aria-pressed',
      String(TABS.find((t) => t[1] === b.textContent)?.[0] === tab),
    );
  }

  let body = '';
  if (tab === 'current') {
    body =
      `<div class="speaker">Congress messenger</div><div class="line">${OLD_PROMPT}</div>` +
      councilBlock() +
      longOptions();
  } else if (tab === 'a') {
    body =
      `<div class="speaker">Congress messenger</div><div class="line">${NEW_PROMPT}</div>` +
      councilBlock() +
      shortOptions(false);
  } else if (beat === 'council') {
    body =
      `<div class="speaker">Congress messenger</div><div class="line">${NEW_PROMPT}</div>` +
      councilBlock() +
      `<div class="beat">beat 1 of 2 — the council argues` +
      `<button class="beatbtn" id="next">then decide →</button></div>`;
  } else {
    body =
      `<div class="speaker">Congress messenger</div><div class="line">${NEW_PROMPT}</div>` +
      emblemRow() +
      shortOptions(tab === 'c');
  }

  stage.innerHTML =
    `<div><div class="note">${NOTES[tab]}</div>` +
    `<div class="panel">${well()}<div class="body">${body}</div></div></div>`;

  stage.querySelector('#next')?.addEventListener('click', () => {
    beat = 'choice';
    render();
  });
  for (const b of Array.from(stage.querySelectorAll<HTMLButtonElement>('.opt.short'))) {
    const i = Number(b.dataset.i);
    const focus = (): void => {
      focused = i;
      render();
    };
    b.addEventListener('mouseenter', focus);
    b.addEventListener('focus', focus);
  }

  // Count what a student actually has to read on this screen.
  const panel = stage.querySelector('.panel') as HTMLElement;
  const words = (panel.innerText.match(/[A-Za-z’'-]+/g) ?? []).length;
  count.innerHTML = `words on screen &nbsp;<b>${words}</b>`;
}

render();
