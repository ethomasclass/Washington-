/**
 * CB-01 — "The Camp Street", Cambridge, July 1775.
 *
 * Built to docs/05-act-scene-inventory.md §2.3. The act's thesis is that
 * command is administration: there is no battle here, only a powder shortage,
 * an army whose enlistments all expire on the same day, and a shanty-town that
 * is not a camp.
 *
 * FIXED LOSS (R20): there is no powder and nothing the player does produces
 * any. The August 1775 discovery — roughly nine thousand pounds against the
 * three hundred barrels the returns claimed, about nine rounds a man — cannot
 * be repaired by any route in this act. Every option that appears to address
 * it addresses only who knows.
 *
 * CORRECTION against the inventory: the inventory lists Sarah Osborn among the
 * NPCs here. She was not with the army until 1780 and is not in this scene.
 * The consistency critic caught it; the fix belongs upstream in the doc too.
 *
 * REVIEW GATE: the William Lee line carries the same R5 sign-off requirement as
 * the Mount Vernon thread.
 */

import type { Ambient, Business, Interactable, NpcThread, Scene, Task } from '../types';

const GREENE = { portraitSeed: 606, coat: '#4B5645' };
const BRAGG = { portraitSeed: 707, coat: '#8C8578' };
const WHITCOMB = { portraitSeed: 808, coat: '#6E5B45' };
const LEE = { portraitSeed: 505, coat: '#5F5B4C' };

export const CB01: Scene = {
  id: 'CB-01',
  act: 2,
  title: 'Cambridge — the camp street',
  subtitle: 'July 1775',
  plates: 'camp',
  // Flat overcast, no directional key — the act's stated tone.
  sun: [0.5, 0.05],
  purpose: 'Turn a mob into an army.',

  /**
   * The first return. Enormous, and useless.
   *
   * Figures are of the documented order for the siege lines in mid-1775 and are
   * marked approximate on the object itself, because the real returns were
   * contested — see the ration-issue contradiction below.
   */
  strength: { fit: 13743, onRolls: 16770, dated: '3 July 1775' },
  noStrength: '',

  opening: [
    'Sixteen thousand men are sitting in front of Boston, and every one of them ' +
      'believes he is already a soldier.',
    'You have been in camp four days. You have not yet found anyone who can tell you ' +
      'how much powder there is.',
  ],

  business: [
    { decision: 'A2-D1', pending: 'Greene is waiting to hear what you mean to do about the powder' },
  ] as Business[],

  /*
   * Two ways out of this camp in the design: up the lane to the parlour, and
   * out along the trench to the lines. The parlour is an interior and wants a
   * plate system that does not exist yet, so the trench is the one that leads
   * anywhere for now and the lane stays as a thing to look at.
   */
  exit: 'trench_out',
  exitTo: 'CB-03',
  exitPrompt: 'Out along the trench to the lines?',
  settled: 'The camp knows what it is going to know. The rest is paperwork.',
  allTasksFlag: 'obs.a2.orders_issued',

  ambient: [
    {
      id: 'amb2.tents',
      voice: 'restraint',
      line: 'One regiment in ordered rows, and nine thousand men in brush piles. Start there.',
      x: 0.865, z: 0.58, r: 0.11, minLoudness: 0.34,
    },
    {
      id: 'amb2.shelters',
      voice: 'temper',
      line: 'They elected their officers. Their officers shave them for sixpence and call it discipline.',
      x: 0.22, z: 0.60, r: 0.11, minLoudness: 0.30,
    },
    {
      id: 'amb2.boston',
      voice: 'ambition',
      line: 'Howe has six thousand regulars in that town and no notion of what you do not have.',
      x: 0.50, z: 0.78, r: 0.11, minLoudness: 0.32,
    },
    {
      id: 'amb2.kettle',
      voice: 'duty',
      line: 'Eight men to a kettle, and the kettle is theirs, not yours. Nothing here belongs to the army.',
      x: 0.36, z: 0.20, r: 0.10, minLoudness: 0.32,
    },
    {
      id: 'amb2.necessary',
      voice: 'vanity',
      line: 'You are a general officer of the united colonies, legislating where men may relieve themselves.',
      x: 0.66, z: 0.17, r: 0.10, minLoudness: 0.30,
    },
  ] as Ambient[],

  tasks: [
    {
      id: 't2.orders',
      label: 'issue the general orders',
      x: 0.13, z: 0.17,
      done:
        'Against profane cursing and swearing, which is a vice hitherto little known in an ' +
        'American army. Against firing a musket merely to learn whether it still fires. And on ' +
        'where a man may and may not relieve himself.',
      grants: 'task.a2.orders',
      note: 'Issued the general orders — swearing, muskets, and the necessary',
      prop: 'table',
    },
    {
      id: 't2.rounds',
      label: 'walk the shelter lines',
      x: 0.225, z: 0.15,
      done:
        'Boards, sailcloth, board and sailcloth mixed, stone and turf, birch, brush. Emerson ' +
        'was right: every shelter is a portrait of the regiment that built it, and none of ' +
        'them is a portrait of an army.',
      grants: 'task.a2.rounds',
      note: 'Walked the shelter lines',
      prop: 'drum',
    },
    {
      id: 't2.return',
      label: 'sign the weekly return',
      x: 0.46, z: 0.13,
      done:
        'You sign it because it must be signed. You do not believe the number, and the man ' +
        'who wrote it does not believe it either.',
      grants: 'task.a2.return',
      note: 'Signed a weekly return you do not believe',
      requires: 'doc.a2.ration_return',
      requiresNote: 'you have not seen what the commissary issues',
      prop: 'papers',
    },
    {
      id: 't2.powder',
      label: 'work out the powder',
      x: 0.79, z: 0.13,
      done:
        'Nine thousand pounds. Call it a pound to a man for eight rounds and a little over. ' +
        'One general action spends it and there is no second action. The number was always ' +
        'there. What was missing was anybody willing to write down what it meant.',
      grants: 'obs.a2.powder_arithmetic',
      note: 'Worked out what nine rounds a man actually permits',
      requires: 'obs.a2.powder_horn',
      requiresNote: 'you have not yet seen a man who knows exactly what he carries',
      prop: 'barrel',
    },
    {
      id: 't2.reed',
      label: 'write to Joseph Reed',
      x: 0.925, z: 0.14,
      done:
        'You write what you would not say aloud in this camp, and you write it to a man in ' +
        'Philadelphia who is not in it. Then you seal it, and it is out of your hands, and it ' +
        'will outlive you.',
      grants: 'task.a2.reed',
      note: 'Wrote to Joseph Reed — plainly, and in your own hand',
      prop: 'table',
    },
  ] as Task[],

  interactables: [
    {
      id: 'ration_return',
      label: 'the ration return',
      x: 0.09, z: 0.31,
      examine:
        'What the commissary actually issued this week, counted in mouths fed. It is four ' +
        'thousand short of the strength the army returns claim. Neither paper is marked true.',
      grants: 'doc.a2.ration_return',
      prop: 'papers',
    },
    {
      id: 'reed_letter',
      label: 'your letter to Joseph Reed',
      x: 0.175, z: 0.45,
      examine:
        'Unfinished, in your own hand. You have written that the men are an exceeding dirty and ' +
        'nasty people, and you have not crossed it out.',
      grants: 'doc.a2.reed_letter',
      contradicts: {
        heard: 'heard.a2.greene',
        line:
          'Greene stood in this lane an hour ago and called them the best material in America. ' +
          'Both of you are looking at the same men. Only one of you wrote it down.',
        grants: 'obs.a2.greene_contradiction',
        note: 'Greene calls them the best material in America — your own letter calls them nasty',
      },
      prop: 'papers',
    },
    {
      id: 'emerson',
      label: "Emerson's letter",
      x: 0.245, z: 0.68,
      examine:
        'The Cambridge minister writing to a friend. He lists the shelters by material and calls ' +
        'the camp a curiosity. He means it kindly. It is still the most exact description of ' +
        'your army that anyone has written.',
      grants: 'doc.a2.emerson',
      prop: 'papers',
    },
    {
      id: 'enlistment_paper',
      label: 'a printed enlistment paper',
      x: 0.33, z: 0.36,
      examine:
        'Signed by a man from Braintree. The term runs to the thirty-first of December. So does ' +
        'every other paper in this camp. On the first of January you will have no army at all ' +
        'unless every one of them signs again.',
      grants: 'doc.a2.enlistment',
      prop: 'papers',
    },
    {
      id: 'kettle',
      label: 'a cooking kettle',
      x: 0.36, z: 0.20,
      examine:
        'One kettle among eight men, and it belongs to whichever of them brought it from home. ' +
        'When his term is up it walks out of camp with him.',
      prop: 'kettle',
    },
    {
      id: 'powder_horn',
      label: 'a powder horn',
      x: 0.425, z: 0.55,
      examine:
        'Scrimshawed, and half full. A militia habit — a man carries his own powder and knows ' +
        'exactly what he has. The army cannot say the same.',
      grants: 'obs.a2.powder_horn',
      prop: 'horn',
    },
    {
      id: 'musket',
      label: 'a musket with no bayonet',
      x: 0.53, z: 0.28,
      examine:
        'A fowling piece off a farm wall. It will kill a man at fifty yards and it will not hold ' +
        'a line against regulars who come on at the run with eighteen inches of steel.',
      prop: 'musket',
    },
    {
      id: 'hunting_shirt',
      label: 'a hunting shirt on a line',
      x: 0.49, z: 0.63,
      examine:
        'Fringed linen, the Virginia riflemen. They shoot better than anyone in this camp at ' +
        'three hundred yards and they will not dig, and both facts are about to be your problem.',
      prop: 'shirt',
    },
    {
      id: 'necessary',
      label: 'the necessary',
      x: 0.66, z: 0.17,
      examine:
        'A trench, sited badly, uphill of the water. Half the sickness in this camp comes out of ' +
        'that decision, and nobody who made it thought of it as a decision.',
      prop: 'necessary',
    },
    {
      id: 'canteen',
      label: 'a canteen made from a cheesebox',
      x: 0.665, z: 0.34,
      examine:
        'Two cheesebox lids and a strap. It leaks. The man who made it is proud of it and shows ' +
        'you how the seam is set.',
      prop: 'canteen',
    },
    {
      id: 'greene_tents',
      label: "Greene's tent line",
      x: 0.865, z: 0.58,
      examine:
        'Rhode Island. Ordered rows, straight streets, tents that match. One regiment out of ' +
        'thirty-eight that looks like it was raised on purpose.',
      grants: 'obs.a2.greene_tents',
    },
    {
      id: 'brush_shelter',
      label: 'a brush shelter',
      x: 0.875, z: 0.25,
      examine:
        'Cut boughs over a frame, with a coat for a door. Two men live here. It will not survive ' +
        'October, and October is coming whatever the Congress decides.',
    },
    {
      id: 'boston_view',
      label: 'Boston across the water',
      x: 0.50, z: 0.78,
      examine:
        'Grey roofs and a church spire, and somewhere under them six thousand regulars who have ' +
        'been fed, paid and drilled since before you owned a uniform.',
      grants: 'obs.a2.boston',
    },
    {
      id: 'lane_up',
      label: 'the lane to headquarters',
      x: 0.94, z: 0.70,
      examine:
        'Up past the Vassall house, where the returns are, and the dispatches, and the map ' +
        'table with the whole war laid flat on it.',
    },
    {
      id: 'marquee',
      label: "the Rhode Island marquee",
      x: 0.90,
      z: 0.40,
      examine:
        'Greene bought proper canvas out of his own colony\'s money before he marched. His men sleep ' +
        'dry, in rows, and know where to stand. Nobody ordered him to do it, which is the part you ' +
        'keep turning over.',
      grants: 'obs.a2.marquee',
    },
    {
      id: 'headquarters',
      label: 'the Vassall house',
      x: 0.10,
      z: 0.74,
      examine:
        'A Loyalist merchant\'s mansion, pale yellow, still furnished. He left in a hurry and you ' +
        'sleep in his bedchamber. Your men are under brush a quarter mile down the slope, and you ' +
        'are aware of the distance every time you walk up it.',
      grants: 'obs.a2.headquarters',
    },
    {
      id: 'cook_fire',
      label: 'a cook fire',
      x: 0.255,
      z: 0.52,
      examine:
        'Eight men to a kettle and no two of them from the same town. They are boiling salt beef ' +
        'and arguing about whose turn it was to fetch the wood, which is the sound of an army ' +
        'that is not one yet.',
      grants: 'obs.a2.cook_fire',
      prop: 'fire',
    },
    {
      id: 'trench_out',
      label: 'the trench to the lines',
      x: 0.77,
      z: 0.80,
      examine:
        'A covered way running north out of the camp toward the works above Charlestown, dug deep ' +
        'enough to walk without being seen from the water. Everything you have ordered this ' +
        'morning ends up at the far end of it.',
    },
  ] as Interactable[],

  /**
   * The rest of the army.
   *
   * Sixteen thousand men were on the rolls and the scene had four people in it.
   * These are not threads and not targets — they stand, they shift their
   * weight, and they make the place look inhabited. Coats are all drab: no
   * Continental blue anywhere but on Washington, which is the rule the whole
   * palette is built around.
   */
  extras: [
    { x: 0.060, z: 0.20, coat: '#7E7059', hat: 'round', seed: 911, build: 0.96, tall: 0.97 },
    { x: 0.060, z: 0.38, coat: '#6E6350', hat: 'none', seed: 922, build: 1.04, tall: 1.01 },
    { x: 0.220, z: 0.64, coat: '#8A7F66', hat: 'round', seed: 933, build: 0.92, tall: 0.95 },
    { x: 0.860, z: 0.23, coat: '#6A6152', hat: 'tricorne', seed: 944, build: 1.0, tall: 0.99 },
    { x: 0.920, z: 0.16, coat: '#7C7159', hat: 'none', seed: 955, build: 0.98, tall: 1.02 },
    { x: 0.900, z: 0.53, coat: '#847A61', hat: 'round', seed: 966, build: 1.06, tall: 0.96 },
  ],

  npcs: [
    {
      id: 'greene',
      look: { coat: '#6A5F4A', hat: 'tricorne', build: 1.06, tall: 1.01 },
      name: 'General Greene',
      hearFlag: 'heard.a2.greene',
      x: 0.735, z: 0.46,
      lines: [
        {
          speaker: 'Nathanael Greene',
          ...GREENE,
          text:
            'Rhode Island has tents because Rhode Island bought tents. The rest came as they ' +
            'were told to come, which was: come.',
        },
        {
          speaker: 'Nathanael Greene',
          ...GREENE,
          text:
            'They are the best material in America, sir. Nobody has yet troubled to make ' +
            'anything of them.',
        },
      ],
      decision: {
        id: 'A2-D1',
        prompt:
          'Nine thousand pounds of powder. Not three hundred barrels. About nine rounds to a ' +
          'man, and no battle survives nine rounds. Who is told?',
        speaker: 'Nathanael Greene',
        ...GREENE,
        voices: ['restraint', 'temper', 'duty', 'vanity', 'ambition'],
        interjections: {
          restraint:
            'If it is written down it will be read by somebody, and one of those somebodies ' +
            'will be in Boston by Friday.',
          duty: 'Congress raised this army. Congress is entitled to know what it has raised.',
          ambition:
            'Howe does not know. So long as Howe does not know, nine rounds and ninety thousand ' +
            'look the same from his side of the water.',
          vanity:
            'A general who announces he cannot fight has announced it to his own men as well.',
          temper: 'Someone counted three hundred barrels. Find him and let him explain it to me.',
        },
        options: [
          {
            id: 'tell_nobody',
            label: 'Tell no one',
            full: 'Carry it alone. Not Congress, not the general officers, not Greene standing here.',
            favoured: ['ambition', 'vanity'],
            effects: { judgment: 5, character: -4, loyalty: -2 },
            result:
              'You say nothing, and the not-saying goes on for weeks, and it is the loneliest ' +
              'thing you have done. Howe never learns. Neither does anyone who might have helped.',
          },
          {
            id: 'tell_council',
            label: 'Tell the general officers',
            full: 'Put it to the general officers under an oath of secrecy, and no further.',
            favoured: ['restraint', 'duty'],
            effects: { loyalty: 5, judgment: 3, legitimacy: -2 },
            result:
              'Eight men now know. Eight men can also think, and two of them think of things ' +
              'you had not. It does not make any powder.',
          },
          {
            id: 'tell_congress',
            label: 'Tell Congress plainly',
            full: 'Write it to Philadelphia in plain terms, and let them do what they can with it.',
            favoured: ['duty'],
            effects: { legitimacy: 6, character: 4, judgment: -3 },
            result:
              'You write it plainly. Congress is alarmed, slow, and honest with you in return. ' +
              'The letter is copied more times than you would like.',
          },
          {
            id: 'tell_informed',
            label: 'Tell them what it means',
            full:
              'Send the powder return itself, with the arithmetic done: nine rounds a man, and ' +
              'what that permits and forbids.',
            favoured: ['duty', 'restraint'],
            requires: 'obs.a2.powder_arithmetic',
            lockNote: 'you have not worked out what nine rounds a man actually permits',
            effects: { judgment: 8, legitimacy: 5, character: 3 },
            result:
              'You send them the number and the meaning of the number, which are different ' +
              'things, and which almost nobody sends together. It buys you credit you will ' +
              'spend for eight years.',
          },
        ],
      },
      after: [
        {
          speaker: 'Nathanael Greene',
          ...GREENE,
          text: 'Then we drill them, sir. It is the only thing we have enough of.',
        },
      ],
    },

    {
      id: 'bragg',
      look: { coat: '#B8AE93', hat: 'none', build: 1.02, tall: 1.04 },
      name: 'Sergeant Bragg',
      x: 0.60, z: 0.68,
      lines: [
        {
          speaker: 'Sergeant Absalom Bragg',
          ...BRAGG,
          text:
            'Virginia riflemen, sir. We can put a ball through a man at three hundred yards. ' +
            'We do not dig.',
        },
        {
          speaker: 'Sergeant Absalom Bragg',
          ...BRAGG,
          text:
            'The New England men dig all day and shoot like farmers. Neither lot will take an ' +
            'order from the other. You will want to think on that before winter.',
        },
      ],
    },

    {
      id: 'whitcomb',
      look: { coat: '#7C6B52', hat: 'round', build: 0.88, tall: 0.92 },
      name: 'Private Whitcomb',
      x: 0.42, z: 0.33,
      lines: [
        {
          speaker: 'Private Ezekiel Whitcomb',
          ...WHITCOMB,
          text: 'Massachusetts, sir. Signed to the thirty-first of December.',
        },
        {
          speaker: 'Private Ezekiel Whitcomb',
          ...WHITCOMB,
          text:
            'My father is getting the hay in alone. I told him I would be home for it. I have ' +
            'been telling him that since June.',
        },
      ],
    },

    {
      id: 'lee2',
      look: { coat: '#5F5B4C', hat: 'round', build: 0.95, tall: 0.99 },
      name: 'William Lee',
      x: 0.135, z: 0.55,
      lines: [
        {
          speaker: 'William Lee',
          ...LEE,
          text:
            'They ask me what you are like, sir. The men. They ask me before they ask anybody ' +
            'else, because I am the one they can ask.',
        },
      ],
    },
  ] as NpcThread[],
};
