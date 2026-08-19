/**
 * MV-02 — Mount Vernon, the passage, May 1775.
 *
 * The interior of the house, entered from MV-01 through the west door and left
 * the same way. Same morning, same act, same man: the two are joined by a cut,
 * not a fade, because he only walked through a door.
 *
 * WHY THIS SCENE EXISTS. Act 1 asked the player to answer Martha and then put
 * her on the lawn, because the lawn was the only place there was. The house
 * stood at the horizon with a painted door nobody could reach, and a player who
 * looked for his wife indoors — which is where a man's wife is at eight in the
 * morning — found a wall. So the inside of the house is a place now. Martha is
 * in it, the ledger she is contradicted by is in it, and the three pieces of
 * business a man does at a desk have moved to the desk.
 *
 * Density: twelve interactables per walkable scene is the floor and CI fails
 * below it.
 *
 * Copy discipline: examine strings run 25-45 words; the decision UI carries
 * roughly 60 words at the moment of choosing.
 *
 * STAGING. Everything painted on the far wall has an interactable under it at a
 * ground point the player can actually stand on — see the note at the head of
 * the interior section in `art.ts`. The walkable band stops at 0.60, short of
 * the wall at 0.66, so nothing in the room can be walked into and nothing
 * standing against it can hide a figure.
 */

import type { Ambient, Business, Interactable, NpcThread, Scene, Task } from '../types';

const MARTHA = { portraitSeed: 202, coat: '#6B4F35' };

/**
 * Martha Washington, from the likenesses.
 *
 * Small — a little under five feet, against a husband of six foot two, and the
 * difference is worth seeing in the frame. Dark hair under the white linen cap
 * she wears in every portrait of her, and a plain gown of a good but sober
 * colour: she was the wealthiest widow in Virginia and dressed like someone who
 * had nothing left to prove.
 */
const MARTHA_LOOK = {
  coat: '#6B4F35',
  hat: 'none' as const,
  gown: true,
  cap: true,
  hair: '#3E3226',
  build: 0.96,
  tall: 0.84,
};

export const MV02: Scene = {
  id: 'MV-02',
  act: 1,
  title: 'Mount Vernon — the passage',
  subtitle: 'May 1775',

  /** Act 1's question, asked in the room where it is actually being avoided. */
  purpose: 'Answer your wife before you answer Congress.',
  plates: 'hall',
  /*
   * The light comes from the east door at the end of the passage, which is
   * open on the river. Placed a little below the horizon in uv so the warm
   * pool lands on the floor rather than on the ceiling — indoors, the sun is a
   * doorway, and a doorway is at eye level.
   */
  sun: [0.49, 0.42],
  exitTo: 'MV-01',
  exitPrompt: 'Step back out to the west front?',

  /*
   * The walkable band stops short of the far wall.
   *
   * A plate is flat: a figure further off than the nearest thing painted on it
   * is drawn behind ALL of it. The wall stands at 0.66 and everything against
   * it — the stair, the clock, the glass — is painted at that depth, so the
   * ground has to stop before it or the player walks into a wall and vanishes
   * through it in the same step.
   */
  walkTo: 0.60,

  strength: null,
  noStrength: 'There is no army. That is the whole of the difficulty.',
  expiring: null,

  where: 'Mount Vernon — inside the house',
  when: 'May 1775',

  situation: [
    'The letter from Philadelphia came up from the ferry an hour ago. It is on the table and you ' +
      'have read it four times.',
    'Your wife asked you a question a week ago and you have not answered it. She is in the ' +
      'parlour, and she knows you have not.',
    'The uniform came down from the press before the letter ever arrived. Somebody carried it. ' +
      'Somebody saw.',
  ],
  objectives: [
    'Find Martha and answer her.',
    'Clear the desk. The morning entry, the letter, the instruments.',
    'The west door takes you back out to the yard.',
  ],

  opening: [
    'The passage runs the depth of the house, and the east door is open on the river.',
    'It is the quietest room you own, and this morning it is quieter than that.',
  ],

  business: [
    { decision: 'A1-D2', pending: 'Martha is waiting on an answer you have not given her' },
  ] as Business[],

  /*
   * The exit is the door back to the lawn, and it is ALSO a plain door (see
   * `goTo` below), which is the pairing that matters: the door mechanism runs
   * first in `interact()`, so this never gates. A man is not stopped on his way
   * out of his own passage to be told what he has not finished.
   */
  exit: 'west_door',
  settled: 'There is nothing left in the house to settle.',

  ambient: [
    {
      id: 'amb.stair',
      x: 0.90, z: 0.52, r: 0.11, minLoudness: 0.30,
      variants: {
        restraint: 'You built this stair. You will not see the top of it again for a long time.',
        vanity: 'Every man who comes up that passage looks at this stair first. That was the idea.',
        duty: 'The house will stand whether you are in it or not. That is what a house is for.',
      },
    },
    {
      id: 'amb.parlour',
      x: 0.20, z: 0.50, r: 0.11, minLoudness: 0.32,
      variants: {
        restraint: 'She buried a husband and two children before she met you. She knows what going means.',
        temper: 'Say it plainly or say nothing. She has never once thanked you for the softer version.',
        duty: 'Whatever you tell Congress, you owe this room the truth first.',
      },
    },
    {
      id: 'amb.press',
      x: 0.70, z: 0.24, r: 0.10, minLoudness: 0.34,
      variants: {
        vanity: 'Blue faced with buff, cut to your own drawing. Nobody orders that by accident.',
        ambition: 'You had it made in the autumn. You have known since the autumn.',
        restraint: 'A coat is not a decision. Keep telling yourself that and see who believes it.',
      },
    },
  ] as Ambient[],

  /** Setting a desk in order before leaving it for eight years. */
  allTasksFlag: 'obs.a1.study_settled',

  tasks: [
    {
      id: 'task.weather',
      label: 'make the weather entry',
      x: 0.24, z: 0.14,
      done:
        'Fair. Wind southerly. Mercury at sixty-four at sunrise. You have written this line ' +
        'nearly every morning for sixteen years, and it takes you longer today than it should.',
      grants: 'task.a1.weather',
      note: 'Made the morning weather entry',
      prop: 'table',
    },
    {
      id: 'task.letter',
      label: 'write to Burwell Bassett',
      x: 0.60, z: 0.13,
      done:
        'To your brother-in-law, because he will not repeat it. You write that you are going to ' +
        'Philadelphia, and that you do not know what you will be when you come back. Then you ' +
        'seal it before you can read it over.',
      grants: 'task.a1.letter',
      note: 'Wrote to Burwell Bassett — the first time you have said it in writing',
      prop: 'table',
    },
    {
      id: 'task.instruments',
      label: 'put up the instruments',
      x: 0.88, z: 0.20,
      done:
        'Chain, compass and the Ohio field books go back in the chest, and the chest goes under ' +
        'the stair. You will not be laying out any ground this year.',
      grants: 'task.a1.instruments',
      note: 'Put up the surveying instruments',
      prop: 'chest',
    },
  ] as Task[],

  interactables: [
    /*
     * THE DOOR BACK OUT.
     *
     * At the near edge of the frame, because that is where it is: the player
     * walked in through it and it is now at his back. It is drawn by what it
     * does rather than by itself — the wedge of lawn light up the boards on the
     * near plate — and walking down to the bottom of the frame finds it.
     */
    {
      id: 'west_door',
      label: 'the west door',
      x: 0.50,
      z: 0.12,
      examine:
        'Standing open on the yard, and the morning coming in flat across the boards behind you. ' +
        'The chariot is out there, and the messenger, and everything that has to be settled ' +
        'outdoors.',
      goTo: 'MV-01',
      arriveAt: { x: 0.278, z: 0.72 },
    },
    {
      id: 'pegs',
      label: 'the pegs by the door',
      x: 0.07,
      z: 0.40,
      examine:
        'A riding cloak and a round hat, on the pegs where they always are. Under them, a place ' +
        'worn pale in the plaster by sixteen years of the same shoulder going past.',
    },
    {
      id: 'parlour_door',
      label: 'the parlour door',
      x: 0.178,
      z: 0.55,
      examine:
        'Standing open on the west parlour, and she is in there. You have walked past this door ' +
        'four times this morning on business that could have waited.',
    },
    {
      id: 'clock',
      label: 'the tall case clock',
      x: 0.324,
      z: 0.55,
      examine:
        'Eight feet of walnut and a brass dial, wound every Sunday since it came up from ' +
        'Williamsburg. It is the only thing in this house that has never once waited for you.',
    },
    {
      id: 'east_door',
      label: 'the east door',
      x: 0.488,
      z: 0.55,
      examine:
        'Open on the river front, and the whole passage full of the light off the water. Two miles ' +
        'of Potomac and Maryland beyond it, and none of it is where you are going.',
      grants: 'obs.a1.river',
    },
    {
      id: 'study_door',
      label: 'the study door',
      x: 0.627,
      z: 0.55,
      examine:
        'Shut, which it is not usually at this hour. The accounts are behind it, and the maps, and ' +
        'the chair nobody else sits in. You have not been able to work in there since Tuesday.',
    },
    {
      id: 'looking_glass',
      label: 'the looking glass',
      x: 0.729,
      z: 0.55,
      examine:
        'A plain glass over a side table, hung for straightening a stock before you go out. Forty-' +
        'three years old, grey at the temple, and a full head above most rooms you walk into.',
    },
    /*
     * THE STAIR.
     *
     * An interactable as much as a piece of scenery: it is the thing whose
     * absence made a house read as one flat room, so it is worth being able to
     * walk to the foot of it and be told what is up there.
     */
    {
      id: 'stair',
      label: 'the stair',
      x: 0.93,
      z: 0.55,
      examine:
        'Black walnut, turned balusters, and a rail worn pale where a hand goes. It climbs to the ' +
        'bedchambers and the garret above them. Nobody up there this morning is asleep.',
      grants: 'obs.a1.stair',
    },
    {
      id: 'ledger',
      label: 'the farm ledger',
      x: 0.30,
      z: 0.24,
      examine:
        'Wheat, herring, flour to the West Indies, in your own hand. Every entry assumes you will ' +
        'be here in the autumn to make the next one.',
      grants: 'doc.a1.ledger',
      contradicts: {
        heard: 'heard.a1.martha',
        line:
          'The last entry is three weeks old. You stopped writing them the week the news came ' +
          'from Boston — before the uniform came down from the press, and before you said nothing.',
        grants: 'obs.a1.ledger_stops',
        note: 'The ledger stops the week the Boston news came — you decided earlier than you have admitted',
      },
      prop: 'papers',
    },
    {
      id: 'uniform',
      label: 'the new uniform',
      x: 0.70,
      z: 0.24,
      examine:
        'Blue faced with buff, cut to your own specification, hanging where it can be seen. You ' +
        'have not said why you had it made. Neither has anyone asked.',
      grants: 'obs.a1.uniform',
      prop: 'uniform',
    },
    {
      id: 'commission',
      label: 'the Fairfax commission',
      x: 0.44,
      z: 0.36,
      examine:
        'Command of the Fairfax Independent Company. You did not ask for it either. Four counties ' +
        'have now named you to something, and none of them waited for an answer.',
      grants: 'doc.a1.commission',
      prop: 'papers',
    },
    {
      id: 'braddock',
      label: "Braddock's sash",
      x: 0.16,
      z: 0.30,
      examine:
        'Crimson silk, given to you as he was dying on the Monongahela road. Two horses shot ' +
        'under you that day, four balls through your coat, and nine hundred men lost in three hours.',
      grants: 'doc.a1.braddock',
      prop: 'sash',
    },
    {
      id: 'surveyors_chest',
      label: "the surveyor's chest",
      x: 0.80,
      z: 0.32,
      examine:
        'Chain, compass, and the Ohio field books from when you were seventeen. You know that ' +
        'country better than any man in Virginia. Ground is a thing you can read.',
      grants: 'obs.a1.surveying',
      prop: 'chest',
    },
  ] as Interactable[],

  npcs: [
    {
      id: 'martha',
      look: MARTHA_LOOK,
      name: 'Martha',
      hearFlag: 'heard.a1.martha',
      /* In the passage rather than in the parlour: she has come out to the door
         of it, which is a different fact about the morning than sitting still. */
      x: 0.36,
      z: 0.44,
      lines: [
        {
          speaker: 'Martha',
          ...MARTHA,
          text: 'You have read it four times. It says the same thing each time.',
        },
        {
          speaker: 'Martha',
          ...MARTHA,
          text:
            'You had Lund bring the uniform down from the press before the letter ever came. ' +
            'I saw him carry it. You have not said a word about it since.',
        },
      ],
      decision: {
        id: 'A1-D2',
        prompt: 'She is not asking whether you will go. She is asking what you mean to wear.',
        speaker: 'Martha',
        portrait: 'martha',
        ...MARTHA,
        voices: ['vanity', 'restraint', 'duty', 'temper'],
        interjections: {
          vanity: 'One soldier in a room of lawyers. They will not need it explained.',
          restraint: 'Wearing it is asking. Ask out loud, or want nothing.',
          duty: 'You hold a commission. It is not a costume.',
          temper: 'Let them ask you straight, or let them find someone else.',
        },
        rejoinders: {
          vanity: 'Every one of them will describe that coat in a letter home.',
          restraint: 'Wear it once and you can never be the man who did not.',
          duty: 'She asked what you mean to be. Answer that.',
        },
        options: [
          {
            id: 'wear_uniform',
            label: 'Wear it',
            full: 'Wear the uniform to Philadelphia and let the room draw its own conclusion.',
            favoured: ['vanity', 'duty'],
            effects: { legitimacy: 5, character: -3, judgment: 2 },
            result:
              'He wore it through every session. No one recorded him saying he wanted the command, ' +
              'and no one in that room was in any doubt.',
          },
          {
            id: 'wear_plain',
            label: 'Wear plain clothes',
            full: 'Go dressed as what you are today — a Virginia planter, and nothing more.',
            favoured: ['restraint'],
            effects: { character: 5, legitimacy: -3 },
            result:
              'You go in broadcloth. If they want a soldier they will have to say the word ' +
              'themselves, and they may not.',
          },
          {
            id: 'tell_martha',
            label: 'Tell her the truth',
            full:
              'Say that you had it made because you expect to be asked, and that you do not know ' +
              'whether you should be.',
            favoured: ['restraint', 'temper'],
            requires: 'obs.a1.ledger_stops',
            lockNote: 'you have not admitted to yourself when you decided',
            effects: { character: 7, loyalty: 2 },
            result:
              'It is the first time you have said it aloud. She does not tell you it will be all ' +
              'right, which is why you told her.',
          },
        ],
      },
      after: [
        {
          speaker: 'Martha',
          ...MARTHA,
          text: 'Then go and see Lund about the accounts. If you are leaving, he should hear it from you.',
        },
      ],
    },
  ] as NpcThread[],
};
