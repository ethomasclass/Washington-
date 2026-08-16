/**
 * CB-02 — "Headquarters Parlour", the Vassall House, Cambridge, November 1775.
 *
 * Built to docs/05-act-scene-inventory.md §2.2. The act's hub: the confiscated
 * Loyalist's fine room where Washington runs the war on paper. The shot is the
 * gap between the handsome furniture and the paperwork buried on the map table.
 *
 * THIS IS THE FIRST PLAYABLE SLICE. The full design puts five NPCs, nine
 * documents and three decisions in this room. Built here: the room itself, Knox
 * and Gates, the dispatches the war is actually made of, and the one fresh
 * contradiction the parlour owns — Congress answering a question he did not ask.
 * The powder decision (A2-D1) and the strength-vs-ration contradiction (C4) are
 * NOT repeated here: both already live in CB-01, where they were built.
 *
 * DEFERRED, and deliberately: Knox leaves for Ticonderoga and returns by letter;
 * the sealed council of war (A2-D2) is the act's apex and belongs at Prospect
 * Hill; Reed, Harrison and the rest are a second pass.
 *
 * REVIEW GATE — R5, and a standing instruction from the project owner (16 Aug
 * 2026). The Black-enlistment thread — Dunmore's Proclamation (A2-D3), the bar
 * of 12 November 1775 and its reversal of 30 December, and the Billy Lee thread
 * — is NOT built here and must not be switched on without named pedagogical
 * sign-off. When it is built, the player must NEVER be able to choose to exclude
 * Black soldiers: the bar that existed and Washington's reversal of it are taught
 * as what happened — narration and document, not a selectable option — and the
 * player's only agency is in ending and formalising it, never in imposing it.
 */

import type { Ambient, Interactable, NpcThread, Scene, Task } from '../types';

const KNOX = { portraitSeed: 317, coat: '#5B5240' };
const GATES = { portraitSeed: 428, coat: '#6A6152' };

export const CB02: Scene = {
  id: 'CB-02',
  act: 2,
  title: 'Cambridge — the headquarters parlour',
  subtitle: 'November 1775',
  plates: 'parlour',
  // The only key light in the room is the grey morning in the two windows,
  // stage left and low.
  sun: [0.22, 0.5],
  purpose: 'Run the war from a borrowed room.',

  // No fresh return exists for the autumn, and none is invented — the same
  // discipline CB-03 keeps (V-A2.2). What the room has is the clock.
  strength: null as { fit: number; onRolls: number; dated: string } | null,
  noStrength: 'The last return you believe is four months old. Nobody has sent a better one.',
  expiring: { date: '31 December', who: 'nearly every regiment you have' },

  // A shallow room: the walkable floor stops well short of the back wall, which
  // sits at the horizon. Authored, because a plate cannot know where a room ends.
  walkTo: 0.55,
  // The camera brought into the room, so the men read at parlour scale rather
  // than as small figures on a wide floor.
  figureScale: 1.45,

  where: 'Cambridge, Massachusetts — headquarters, the Vassall house',
  when: 'November 1775',

  situation: [
    'The finest house in Cambridge, left in a hurry by a Loyalist who did not wait to be asked. ' +
      'It is the only room for miles with a door you can shut, so the war is run from its parlour.',
    'The camp outside is the same mob you found in July, four months colder. The powder is still ' +
      'nine rounds a man. Every enlistment in the army still ends on the thirty-first of December.',
    'What is new is on the table. Dispatches, and returns that disagree with each other. And one ' +
      'idea so unreasonable it may be the only one left. The guns at Ticonderoga, three hundred ' +
      'miles off, and a bookseller who swears he can fetch them.',
  ],
  objectives: [
    'Go through the morning’s dispatches. The war is mostly this.',
    'Hear Knox out on the guns before you decide he is mad.',
    'Read what Congress troubled to send you, and mark what it does not say.',
  ],

  arrival: [
    'The Head Quarters at Cambridge, in the House of Mr Vassall, November 1775.',
    'The camp is four months colder and no better armed. Up the lane stands the ' +
      'finest house in Cambridge, left in a hurry by a Loyalist who did not wait to ' +
      'be asked, and the war is run from its parlour.',
    'It is the only room for miles with a door that shuts.',
  ],

  opening: [
    'A good carpet, a good fire laid but not lit, and on the wall a family that used to live here, ' +
      'turned to face it.',
    'You have signed your name eleven times before breakfast, and not one of the signatures made ' +
      'any powder.',
  ],

  business: [] as never[],

  /*
   * The way forward is the map table itself: everything on it points down to the
   * lines above Charlestown, and leaving the room is following it there. The door
   * back to the camp is a thing to look at, not a second exit — the engine carries
   * one way out of a scene, and forward is the one that matters.
   */
  exit: 'map_table',
  exitTo: 'CB-03',
  exitPrompt: 'Down to the lines above Charlestown, where all of this ends up?',
  settled: 'The table is as clear as it is going to get, which is not clear. The war goes on being paperwork.',
  allTasksFlag: 'obs.a2.hq_done',

  ambient: [
    {
      id: 'amb2b.table',
      x: 0.5, z: 0.28, r: 0.12, minLoudness: 0.32,
      variants: {
        duty: 'Every paper on this table is a man, or a barrel, or a promise. Read it as though it were.',
        restraint: 'You cannot fight what you cannot count, and you cannot count what four clerks will not agree on.',
        temper: 'Somewhere in this pile is the man who wrote three hundred barrels. He is still drawing his pay.',
      },
    },
    {
      id: 'amb2b.portrait',
      x: 0.84, z: 0.44, r: 0.1, minLoudness: 0.3,
      variants: {
        restraint: 'They left the pictures. A man who means to come back does not leave the pictures.',
        duty: 'Turn it to the wall or take it down, but do not leave it half-shamed. Decide the small things too.',
        vanity: 'One day a house like this will keep a picture of you, and turn it to the wall the year after.',
      },
    },
    {
      id: 'amb2b.window',
      x: 0.16, z: 0.4, r: 0.1, minLoudness: 0.34,
      variants: {
        ambition: 'Sixty tons of iron over the Berkshires in winter. If it can be done, the man who does it is made.',
        restraint: 'Boston is four miles that way and a world away. You will take it with arithmetic or not at all.',
        temper: 'Out there they think you are a Virginian playing at soldiers. In here you are a Virginian doing sums.',
      },
    },
  ] as Ambient[],

  tasks: [
    {
      id: 't2b.dispatches',
      label: 'go through the dispatches',
      x: 0.42, z: 0.14,
      done:
        'A quarrel over rank between two colonels. A demand for a wagon. A minister asking that his ' +
        'son be spared the Sabbath drill. This is command: not the battle, but the thousand small ' +
        'papers that decide whether there is an army left to fight one.',
      grants: 'task.a2.dispatches',
      note: 'Went through a morning’s dispatches, and made an army out of answering them',
      prop: 'papers',
    },
    {
      id: 't2b.order',
      label: 'write the order that sends Knox north',
      x: 0.74, z: 0.22,
      done:
        'You put it in writing: a bookseller with no rank worth the name, sent three hundred miles ' +
        'in winter to bring back the guns of a fort nobody has counted. Written down, it reads like ' +
        'a man who has run out of sensible ideas. You sign it anyway.',
      grants: 'task.a2.knox_sent',
      note: 'Ordered Knox to Ticonderoga for the guns — and wrote it down, so the record shows who chose',
      requires: 'heard.a2.knox',
      requiresNote: 'you have not yet heard Knox out on the guns',
      prop: 'papers',
    },
    {
      id: 't2b.firewood',
      label: 'sign the bill for firewood',
      x: 0.90, z: 0.28,
      done:
        'The house eats a cord of wood a day and the bill comes to you, because everything comes to ' +
        'you. The commander-in-chief of the United Colonies, initialling a woodcutter’s account. ' +
        'It is not beneath the office. It is the office.',
      grants: 'task.a2.firewood',
      note: 'Signed the firewood bill, because the war is also a household',
      prop: 'papers',
    },
  ] as Task[],

  interactables: [
    {
      id: 'map_table',
      label: 'the map table',
      x: 0.5, z: 0.2,
      examine:
        'The whole war laid out under a week of returns. Boston and its neck, the ring of your works ' +
        'around it, and every position across the water that you have been told to fear. Move the ' +
        'papers and the country is under them; leave them and the papers are the country. Everything ' +
        'on this table runs downhill to the lines above Charlestown.',
      grants: 'obs.a2.map',
      prop: 'table',
    },
    {
      id: 'inkstand',
      label: "the owner's silver inkstand",
      x: 0.62, z: 0.16,
      examine:
        'A fine thing, left behind: chased silver, three wells, a Tory merchant’s initials on the lid. ' +
        'You sign the confiscation of his neighbours’ property with his own ink. Nobody in this room ' +
        'says anything about that, and everybody has noticed it.',
      grants: 'obs.a2.inkstand',
    },
    {
      id: 'knox_letter',
      label: "Knox's plan for the guns",
      x: 0.4, z: 0.3,
      examine:
        'In his own eager hand: the heavy guns of Ticonderoga, taken in the spring by men nobody sent, ' +
        'brought here on ox-sledges over the snow. He calls it, without blushing, a noble train of ' +
        'artillery. It is three hundred miles, two rivers and a mountain range, in winter. It is also ' +
        'the only way anyone has named to put a gun on those heights that the ships cannot answer.',
      grants: 'doc.a2.knox',
      prop: 'papers',
    },
    {
      id: 'congress_letter',
      label: 'the letter from Congress',
      x: 0.66, z: 0.3,
      examine:
        'You broke the seal expecting powder, or money, or leave to enlist the men you need. Congress ' +
        'has instead settled, at length and with great care, which of two colonels ranks the other. ' +
        'It is a fair question. It is not the one you asked.',
      grants: 'doc.a2.congress',
      contradicts: {
        heard: 'heard.a2.gates',
        line:
          'Gates swears Philadelphia has this whole army on paper, sent weekly in his own fair hand. ' +
          'This is Philadelphia’s reply: a ruling on the seniority of two colonels, and not one word ' +
          'on the powder, or on the men whose time runs out at the New Year.',
        grants: 'obs.a2.congress_contradiction',
        note: 'Gates says Congress knows everything — their letter answers a question you never asked',
      },
      prop: 'papers',
    },
    {
      id: 'returns',
      label: 'the returns of the whole army',
      x: 0.28, z: 0.22,
      examine:
        'Four clerks, four hands, four totals. Add the regiments one way and you have one army; add ' +
        'them the way the commissary counts mouths and you have a smaller one. Nobody has marked ' +
        'which is true, because nobody knows, and the man who signs at the bottom is you.',
      grants: 'doc.a2.returns',
      prop: 'papers',
    },
    {
      id: 'commissary_ledger',
      label: "the commissary's ledger",
      x: 0.3, z: 0.44,
      examine:
        'Rations issued, counted in mouths that ate them. It is an honest book — the one honest count ' +
        'in the room — and it is the one nobody wants read aloud, because it is smaller than the ' +
        'number you send to Congress and larger than the number you have muskets for.',
      grants: 'obs.a2.commissary',
      prop: 'papers',
    },
    {
      id: 'general_orders',
      label: 'the General Orders book',
      x: 0.58, z: 0.42,
      examine:
        'The orders of 4 July, the day after you took command: one army now, not the militia of four ' +
        'colonies; no man to leave camp without a pass; and the whole of it to be read at the head of ' +
        'every regiment. You are building an army out of the only material you have unlimited stock ' +
        'of, which is paper and the habit of obedience.',
      grants: 'obs.a2.orders_july',
      prop: 'papers',
    },
    {
      id: 'knox_books',
      label: "Knox's crate of gunnery books",
      x: 0.74, z: 0.46,
      examine:
        'A bookseller went to war and brought his stock. Treatises on artillery in three languages, ' +
        'read twice and marked in the margins. It is the whole of your army’s formal training in the ' +
        'science of guns, and it is a reading list. It will have to do, because it is what there is.',
      grants: 'obs.a2.books',
      prop: 'chest',
    },
    {
      id: 'chairs',
      label: 'the council chairs',
      x: 0.5, z: 0.52,
      examine:
        'A ring of good chairs the Loyalist left, drawn up now for a council of war. Ward, Putnam, ' +
        'Greene, Gates. When you propose the thing you most want to do, it is these chairs that will ' +
        'tell you no, and it is in this room that you will have to decide whether no is an answer.',
      grants: 'obs.a2.chairs',
    },
    {
      id: 'window_boston',
      label: 'the window toward Boston',
      x: 0.14, z: 0.44,
      examine:
        'From here, on a clear morning, you can just make out the works on the far shore — the red of ' +
        'their coats, small as a rumour. Four miles of water and a Loyalist’s good glass between you ' +
        'and the only thing in this country that already looks like an army.',
      grants: 'obs.a2.window',
    },
    {
      id: 'portrait',
      label: 'the portrait turned to the wall',
      x: 0.86, z: 0.5,
      examine:
        'A Loyalist family in their good clothes, still hanging where they left it, turned to face the ' +
        'plaster. Someone in this house could not bear to look at them and could not bring themselves ' +
        'to take them down. You are living in a room that belongs to people who fled you, and the ' +
        'picture is the only one of them who stayed.',
      grants: 'obs.a2.portrait',
    },
    {
      id: 'door',
      label: 'the door to the camp',
      x: 0.07, z: 0.16,
      examine:
        'The way you came in. Beyond it the lane runs down to the camp, and the camp to the trenches, ' +
        'and none of it is quieter for your having shut the door on it.',
    },
  ] as Interactable[],

  npcs: [
    {
      id: 'knox',
      look: { coat: '#5B5240', hat: 'none', build: 1.22, tall: 1.03 },
      name: 'Colonel Knox',
      hearFlag: 'heard.a2.knox',
      x: 0.8, z: 0.34,
      lines: [
        {
          speaker: 'Henry Knox',
          ...KNOX,
          text:
            'A bookseller, sir, before all this. I sold every book on gunnery in Boston and read them ' +
            'twice before I did. It is the nearest thing to a trained artillerist you have, and I am ' +
            'aware of how that sounds.',
        },
        {
          speaker: 'Henry Knox',
          ...KNOX,
          text:
            'The guns are sitting in Ticonderoga doing nothing but rusting. Give me the oxen and the ' +
            'sledges and the leave to try, and I will put fifty of them on these heights before the ' +
            'ice breaks. Everyone I have said this to has laughed. You are not laughing.',
        },
      ],
      after: [
        {
          speaker: 'Henry Knox',
          ...KNOX,
          text: 'Then I had better go and be mad three hundred miles from here, where it will do some good.',
        },
      ],
    },
    {
      id: 'gates',
      look: { coat: '#6A6152', hat: 'tricorne', build: 1.08, tall: 0.98 },
      name: 'General Gates',
      hearFlag: 'heard.a2.gates',
      x: 0.2, z: 0.32,
      lines: [
        {
          speaker: 'Horatio Gates',
          ...GATES,
          text:
            'Adjutant general, sir, and glad of the work. Give me the returns and a week and I will ' +
            'tell you to a man what you command. Order is the whole of it. An army that knows its own ' +
            'numbers is halfway to being an army.',
        },
        {
          speaker: 'Horatio Gates',
          ...GATES,
          text:
            'And it all goes to Philadelphia, weekly, in my own fair hand. Whatever else Congress may ' +
            'be short of, sir, it is not short of knowing exactly what this army is. I see to that ' +
            'myself.',
        },
      ],
      after: [
        {
          speaker: 'Horatio Gates',
          ...GATES,
          text: 'You will not find a more willing man in this camp, sir. Remember that, whatever comes.',
        },
      ],
    },
  ] as NpcThread[],
};
