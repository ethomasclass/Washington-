/**
 * Prototype content for MV-01 — Mount Vernon, the west front, May 1775.
 *
 * In the real build this is JSON on disk, validated by the build-time linter
 * (06-technical-architecture.md §6). It is typed TypeScript here only so the
 * prototype compiles without a loader; the shape is the schema.
 *
 * Note on scope: the Quarter, and the named enslaved people the design calls
 * for, are deliberately NOT improvised here. That content is specified in
 * reference/historical-visual-reference.md §7 and gated behind a review step;
 * placeholder code is the wrong place to draft it.
 */

import type { StatId } from './state';
import type { VoiceId } from './palette';

export interface Interactable {
  id: string;
  label: string;
  /** Position along the walk-plane, 0..1. */
  t: number;
  examine: string;
  /** Reading this sets a knowledge flag. Documents never move stats. */
  grants?: string;
}

export interface DialogueLine {
  speaker: string;
  portraitSeed: number;
  coat: string;
  text: string;
}

export interface Option {
  id: string;
  text: string;
  /** Knowledge flag required. Without it the option is shown struck, not hidden. */
  requires?: string;
  /** Why it is struck — shown in the margin. */
  lockNote?: string;
  effects: Partial<Record<StatId, number>>;
  result: string;
}

export interface Decision {
  id: string;
  prompt: string;
  speaker: string;
  portraitSeed: number;
  coat: string;
  voices: VoiceId[];
  interjections: Record<string, string>;
  options: Option[];
}

export interface NpcThread {
  id: string;
  t: number;
  lines: DialogueLine[];
  decision?: Decision;
}

export const SCENE = {
  id: 'MV-01',
  act: 1,
  title: 'Mount Vernon — the west front',
  subtitle: 'May 1775',
  interactables: [
    {
      id: 'scaffolding',
      label: 'the scaffolding',
      t: 0.62,
      examine:
        'The north wing is open to the weather. Lund has the joiners on it, and the bill for the ' +
        'work sits unpaid in the study. You have been building this house for sixteen years and it ' +
        'is still not finished.',
      grants: 'obs.a1.scaffolding',
    },
    {
      id: 'newspaper',
      label: 'a Boston newspaper',
      t: 0.3,
      examine:
        'Three weeks old by the time it reached the Potomac. Concord and Lexington, and a column ' +
        'of regulars harried the whole nineteen miles back to Charlestown by farmers who would not ' +
        'stand and fight in the open. Whatever this is, it is not a riot any longer.',
      grants: 'doc.a1.boston_clipping',
    },
    {
      id: 'ledger',
      label: 'the farm ledger',
      t: 0.44,
      examine:
        'Wheat, herring, flour to the West Indies. The columns are in your own hand. Every entry ' +
        'assumes you will be here in the autumn to make the next one.',
      grants: 'doc.a1.ledger',
    },
    {
      id: 'fence',
      label: 'the paddock rail',
      t: 0.84,
      examine: 'Nelson is in the near paddock, out of temper. He will be saddled before the week is out.',
    },
  ] as Interactable[],

  npcs: [
    {
      id: 'martha',
      t: 0.24,
      lines: [
        {
          speaker: 'Martha',
          portraitSeed: 202,
          coat: '#6B4F35',
          text: 'You have read it four times. It says the same thing each time.',
        },
        {
          speaker: 'Martha',
          portraitSeed: 202,
          coat: '#6B4F35',
          text:
            'You packed the uniform before the letter came. I saw it. You had Lund bring it down ' +
            'from the press and you have not said a word about it since.',
        },
      ],
    },
    {
      id: 'messenger',
      t: 0.78,
      lines: [
        {
          speaker: 'Congress messenger',
          portraitSeed: 303,
          coat: '#55627A',
          text:
            'Philadelphia, sir. The Congress has voted to raise an army before it has voted who ' +
            'is to command it. There are those who think the two questions have the same answer.',
        },
      ],
      decision: {
        id: 'A1-D1',
        prompt:
          'They will offer you the command. An army that does not exist, paid in a currency that ' +
          'does not hold, against the finest infantry in the world. What do you say?',
        speaker: 'Congress messenger',
        portraitSeed: 303,
        coat: '#55627A',
        voices: ['ambition', 'restraint', 'duty', 'vanity'],
        interjections: {
          ambition:
            'No man in these colonies has held a field command like it. There will not be a second offer.',
          restraint:
            'You lost more men than you saved at the Monongahela. You have never commanded above a regiment.',
          duty: 'Virginia sent you. The question is not whether you want it.',
          vanity:
            'Wear the uniform to the chamber and let them arrive at the name themselves. It is not asking.',
          temper: 'Let them offer it plainly, or let them find another man.',
        },
        options: [
          {
            id: 'accept_plain',
            text: 'Accept, and say plainly that you do not think yourself equal to it.',
            effects: { character: 6, legitimacy: 4, judgment: -1 },
            result:
              'You say it in the chamber and mean it, and it is written down, and it will be quoted ' +
              'against you and for you for the rest of your life.',
          },
          {
            id: 'accept_pay',
            text: 'Accept, and refuse the pay — expenses only, accounted to the last shilling.',
            effects: { legitimacy: 7, character: 5, loyalty: -2 },
            result:
              'It costs Congress more in the end than the salary would have. It also means no man ' +
              'can say you took the war for a living.',
          },
          {
            id: 'accept_informed',
            text:
              'Accept, and tell them what Concord means: the regulars can be bled on a road, and ' +
              'this will be a long war, not a short one.',
            requires: 'doc.a1.boston_clipping',
            lockNote: 'you have not read the Boston paper',
            effects: { judgment: 8, legitimacy: 3, character: 2 },
            result:
              'They wanted reassurance and you gave them arithmetic. Some of them will remember it ' +
              'in three years as the first honest thing anyone said in that room.',
          },
          {
            id: 'decline',
            text: 'Decline. Say the command should go to a man the New England men already trust.',
            effects: { character: 3, legitimacy: -6, judgment: 1 },
            result:
              'You say it, and they do not accept it, and the saying of it is remembered as modesty ' +
              'rather than as the refusal you intended.',
          },
        ],
      },
    },
  ] as NpcThread[],
};
