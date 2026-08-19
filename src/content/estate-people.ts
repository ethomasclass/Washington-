/**
 * Who is on the estate this morning, and what they say.
 *
 * REVIEW GATE. The three people in the Quarter — Frank Lee, Doll and Harry —
 * are R5 / Witness Register material. Everything factual about them is
 * documented; the framing is not, and it requires named pedagogical sign-off
 * before this ships to students. It is drafted here. It is not approved.
 *
 * DECISION NUMBERING. The inventory doc numbers Act 1 D1-D3. This build has
 * five moments because the world is continuous and the beats spread out over
 * it, so they are numbered D0-D4 and the mapping is:
 *
 *   A1-D0  the messenger, on arrival        — 0 stats, teaches the panel
 *   A1-D1  Martha, in the west parlour      — 0 stats, characterization (doc D1)
 *   A1-D2  Lund, at the north end           — the estate instructions (doc D2)
 *   A1-D3  the messenger, the answer        — the reply to Philadelphia
 *   A1-D4  SEALED, at the landing           — the uniform (doc D3)
 */

import type { NpcDef } from '../types';
import {
  BILLY_LEE, DOLL, FRANK_LEE, HARRY, JENKINS, JOINER, LUND, SIMMS,
} from './people';
import { varyActor } from '../engine/actors';

export function estateNpcs(): NpcDef[] {
  return [
    /* ------------------------------------------------------------------ *
     * Jenkins, of the Alexandria post.
     * ------------------------------------------------------------------ */
    {
      id: 'jenkins',
      name: 'Jenkins',
      spec: JENKINS,
      x: 44, z: 46, facing: 3,
      hearFlag: 'heard.a1.jenkins',

      /*
       * THE FIRST CHOICE IN THE GAME, AND IT DOES NOTHING.
       *
       * Every option is `effects: {}`. The Council argues, the emblems show
       * who wants what, the choice commits and cannot be taken back — and then
       * it turns out to have cost nothing. What it leaves behind is a student
       * who has used the panel once before the panel matters, and one small
       * true thing about the man: how he treats somebody who has ridden two
       * days to reach him, before he knows what the letter says.
       */
      warmup: {
        id: 'A1-D0',
        prompt:
          'He has ridden from Philadelphia and he is still holding his hat. The letter is in his '
          + 'other hand and he has not offered it yet.',
        speaker: 'Jenkins, of the Alexandria post',
        portrait: 'jenkins',
        voices: ['duty', 'vanity', 'restraint', 'temper'],
        interjections: {
          duty: 'He is not a servant. He carries the correspondence of the Congress and he is owed the civility of the door.',
          vanity: 'He will describe this house, and you in it, to men who have never seen either.',
          restraint: 'Whatever is in that letter, it is already true. Another minute will not alter it.',
          temper: 'Two days on the road and they could not spare a man who knows how to hand over a letter.',
        },
        options: [
          {
            id: 'ask_after_ride',
            label: 'Ask after his ride',
            full: 'Ask what the roads were like, and have something brought out to him, before anything else.',
            favoured: ['duty'],
            effects: {},
            result:
              'He tells you about the ferry at the Occoquan and a horse that went lame at Dumfries. '
              + 'It takes four minutes. The letter waits, and is not improved by waiting.',
          },
          {
            id: 'take_it_standing',
            label: 'Take it and read it standing',
            full: 'Put out your hand for the letter and read it where you are, in the yard, with him watching.',
            favoured: ['temper', 'restraint'],
            effects: {},
            result:
              'You read it standing in the grass with your hat still on. He watches your face and '
              + 'learns nothing from it, which is a thing people have remarked on since you were twenty.',
          },
          {
            id: 'have_him_wait',
            label: 'Have him wait',
            full: 'Finish what you were doing. He has come a long way; another quarter hour will not hurt him.',
            favoured: ['vanity'],
            effects: {},
            result:
              'You finish what you were about. It is not rudeness and it is not quite not-rudeness, '
              + 'and by the time you take the letter you have decided something, though not what you think.',
          },
        ],
      },

      lines: [
        {
          speaker: 'Jenkins',
          text:
            'Philadelphia has voted to raise an army before it has voted who is to command it. '
            + 'Some think the two questions have one answer.',
        },
        /*
         * The clock, planted where nobody can act on it.
         *
         * The whole army's terms ran to the end of 1775, and that single fact
         * very nearly ended the war twice. It is mentioned here in May, by a
         * man with no stake in it, as a piece of paperwork — so that when it
         * detonates in Act 2 the student has already been told and has already
         * failed to notice, which is exactly what happened to Congress.
         */
        {
          speaker: 'Jenkins',
          text:
            'They have the New England men down as enlisted to the end of the year, sir. December. '
            + 'After that it is a fresh sheet of paper and every name written again.',
        },
      ],

      decision: {
        id: 'A1-D3',
        prompt:
          'An army that does not exist, in a currency that does not hold, against the best infantry '
          + 'in the world. He is waiting for something to carry back.',
        speaker: 'Jenkins',
        portrait: 'jenkins',
        voices: ['ambition', 'restraint', 'duty', 'vanity', 'temper'],
        interjections: {
          ambition: 'No man in these colonies has held a field command like it. There will not be a second offer.',
          restraint: 'You lost more men than you saved at the Monongahela, and you have never commanded above a regiment.',
          duty: 'Virginia sent you. Whether you want it was never the question.',
          vanity: 'Let them arrive at the name themselves. It is not asking if they say it first.',
          temper: 'Twenty years they passed you over for a royal commission. Twenty years.',
        },
        rejoinders: {
          restraint: 'You have commanded a regiment. They are offering you a continent.',
          duty: 'They will vote tomorrow whether you answer or not.',
          vanity: 'Say no slowly. Nobody remembers a quick refusal.',
        },
        options: [
          {
            id: 'accept_plain',
            label: 'Accept — plainly',
            full: 'Accept, and say plainly that you do not think yourself equal to it.',
            favoured: ['restraint', 'duty'],
            effects: { character: 6, legitimacy: 4, judgment: -1 },
            historical: true,
            result:
              'You say it in the chamber and mean it. It is written down, and it will be quoted '
              + 'both against you and for you for the rest of your life.',
          },
          {
            id: 'accept_pay',
            label: 'Accept — and refuse the pay',
            full: 'Accept, and take no salary. Expenses only, accounted to the last shilling.',
            favoured: ['restraint', 'vanity'],
            effects: { legitimacy: 7, character: 5, loyalty: -2 },
            historical: true,
            result:
              'It will cost Congress more in the end than the salary would have. It also means no '
              + 'man can say you took the war for a living.',
          },
          {
            id: 'accept_informed',
            label: 'Accept — and warn them',
            full:
              'Tell them what Concord means: the regulars can be bled on a road. This will be a long '
              + 'war, not a short one.',
            favoured: ['ambition', 'duty'],
            requires: 'doc.a1.boston_clipping',
            lockNote: 'you have not read the Boston broadside',
            effects: { judgment: 8, legitimacy: 3, character: 2 },
            result:
              'They wanted reassurance and you gave them arithmetic. In three years some of them will '
              + 'remember it as the first honest thing said in that room.',
          },
          {
            id: 'decline',
            label: 'Decline',
            full: 'Say the command should go to a man the New England troops already trust.',
            favoured: ['restraint', 'temper'],
            /*
             * The voice lock of Act 1.
             *
             * Refusing is a real historical position and he weighed it. But a
             * man can only decline the largest thing he has ever been offered
             * if the part of him that preserves is already the loudest part —
             * and at the opening vector it is not, by two thousandths.
             *
             * So the option is struck for a player who rides straight at the
             * messenger, and open for one who has settled the house first.
             * Nothing says so. What the player sees is that a sentence they
             * could not say this morning is available to a man who put his
             * affairs in order before answering Philadelphia.
             *
             * It is deliberately NOT what Washington did. If every locked
             * option were the historically correct one, the lesson would be
             * "raise the stat to find the right answer."
             */
            voiceLock: { voice: 'restraint', min: 0.58 },
            effects: { character: 3, legitimacy: -6, judgment: 1 },
            result:
              'You say it, and they do not accept it, and the saying of it is remembered as modesty '
              + 'rather than as the refusal you intended.',
          },
        ],
      },

      after: [
        {
          speaker: 'Jenkins',
          text: 'I will carry it back tonight, sir. They will have your answer before they have an army.',
        },
      ],
    },

    /* ------------------------------------------------------------------ *
     * Lund Washington, at the north end, with the account book.
     * ------------------------------------------------------------------ */
    {
      id: 'lund',
      name: 'Lund Washington',
      spec: LUND,
      x: 27, z: 38, facing: 0,
      hearFlag: 'heard.a1.lund',
      lines: [
        {
          speaker: 'Lund Washington',
          text:
            'The joiners want paying and the wing is open to the sky. If you go, I can hold the '
            + 'place — but I cannot hold it on promises.',
        },
        {
          speaker: 'Lund Washington',
          text:
            'And whoever pays this army they are raising will find the same. Men do not stay for a '
            + 'cause once the flour runs out. You will learn that faster than I will.',
          mood: 'hard',
        },
      ],
      decision: {
        id: 'A1-D2',
        prompt:
          'He asks it plainly, because he is the one who will have to do it. If the British come up '
          + 'the river, what does the estate do?',
        speaker: 'Lund Washington',
        portrait: 'lund',
        voices: ['restraint', 'duty', 'vanity', 'temper'],
        interjections: {
          restraint: 'You are not there. A rule made at this distance is a rule made for a room you cannot see.',
          duty: 'Whatever you tell him, he will do. That is not his conscience you are spending.',
          vanity: 'They will ask, afterwards, what you said. Say something you would like read aloud.',
          temper: 'Let them burn it. A house is a thing. There will be other houses.',
        },
        rejoinders: {
          duty: 'He is forty-eight and he has never once asked you for anything. He is asking now.',
          restraint: 'Six years from now this exact question arrives, and you will be four hundred miles away.',
        },
        options: [
          {
            id: 'resist',
            label: 'Burn the stores',
            full: 'Resist. Burn the stores rather than supply them, whatever it costs the house.',
            favoured: ['temper', 'duty'],
            effects: { character: 4, legitimacy: 2 },
            result:
              'He writes it down and does not argue. In April 1781 he will do the opposite, to save '
              + 'this house, and you will write him a letter about it that he keeps for the rest of his life.',
          },
          {
            id: 'save_the_house',
            label: 'Save the house',
            full: 'Give them what they ask for. The place is worth more standing than burnt.',
            favoured: ['vanity'],
            effects: { character: -3, judgment: 1 },
            historical: true,
            result:
              'It is what he does. Six years from now HMS Savage lies off this landing and he goes '
              + 'aboard her with provisions, and the house is not burnt, and you are furious about it.',
          },
          {
            id: 'his_judgement',
            label: 'Leave it to him',
            full: 'Say nothing. He is on the ground and you are not; leave it to his judgement.',
            favoured: ['restraint'],
            effects: { character: -1 },
            historical: true,
            result:
              'Which is what you actually gave him: no instruction at all. Six years from now that '
              + 'will turn out to have been a decision, and he will be the one holding it.',
          },
        ],
      },
      after: [
        {
          speaker: 'Lund Washington',
          text:
            'Then it is settled and I will not raise it again. Go and see the north end before you '
            + 'go. You will want to know what you are leaving.',
        },
      ],
    },

    /* ------------------------------------------------------------------ *
     * William Lee, with the horses. He does not speak much, and he is
     * present in every act of this game.
     * ------------------------------------------------------------------ */
    {
      id: 'billy',
      name: 'William Lee',
      spec: BILLY_LEE,
      x: 60, z: 40, facing: 0,
      hearFlag: 'heard.a1.billy',
      sensitive: true,
      lines: [
        { speaker: 'William Lee', text: 'The chariot is packed, sir. Both trunks and the field case.' },
        { speaker: 'William Lee', text: 'I am to come with you, then. However long it runs.' },
      ],
      after: [
        { speaker: 'William Lee', text: 'Nelson is sound. I had him up before it was light.' },
      ],
    },

    /* ------------------------------------------------------------------ *
     * THE QUARTER. Three people, no task, no reward, no stat.
     *
     * The only mechanical thing that happens here is that some examine text
     * and one line of the epilogue are written by whether the player looked.
     * There is no marker, no approval sound, and nothing to collect. If any of
     * that ever appears in this block, the scene has been broken.
     * ------------------------------------------------------------------ */
    {
      id: 'frank',
      name: 'Frank Lee',
      spec: FRANK_LEE,
      x: 14, z: 33, facing: 0,
      hearFlag: 'heard.a1.frank',
      sensitive: true,
      lines: [
        {
          speaker: 'Frank Lee',
          text: 'The table is laid for one less at dinner, sir. Mrs Washington told me this morning.',
        },
        {
          speaker: 'Frank Lee',
          text:
            'My brother goes with you. I stay and keep the house. We were bought together, out of '
            + 'the Mary Lee estate, in sixty-eight.',
        },
        {
          speaker: 'Frank Lee',
          text: 'That is the whole of it, sir. There is nothing else in it.',
          mood: 'hard',
        },
      ],
    },
    {
      id: 'doll',
      name: 'Doll',
      spec: DOLL,
      x: 9, z: 36, facing: 2,
      hearFlag: 'heard.a1.doll',
      sensitive: true,
      lines: [
        {
          speaker: 'Doll',
          text: 'The new kitchen will draw better than the old one. That is what they tell me.',
        },
        {
          speaker: 'Doll',
          text:
            'I have cooked in this place since fifty-nine. Two kitchens now. I expect I shall see '
            + 'the third.',
        },
      ],
    },
    {
      id: 'harry',
      name: 'Harry',
      spec: HARRY,
      x: 6, z: 30, facing: 0,
      hearFlag: 'heard.a1.harry',
      sensitive: true,
      /*
       * The most important person in this game.
       *
       * He leaves for Dunmore's lines in 1776. He serves as a corporal in the
       * Black Pioneers. His name is written into the Book of Negroes in 1783
       * and he sails for Nova Scotia, and in 1792 for Sierra Leone, and in
       * 1800 he takes up arms against the company governing it and is exiled.
       *
       * The student will not learn any of that for eight acts. Here he is a
       * man by a trough with a copper ring, and the copper ring is the only
       * saturated colour the Quarter's grade lets through. Nothing in these
       * three lines foreshadows anything. That is the point of them.
       */
      lines: [
        { speaker: 'Harry', text: 'Morning, sir.' },
        {
          speaker: 'Harry',
          text:
            'I was on the Dismal Swamp survey. Seven weeks in the water. I know that ground better '
            + 'than most men that own it.',
        },
        { speaker: 'Harry', text: 'They say you are going north.' },
      ],
    },

    /* ------------------------------------------------------------------ *
     * The joiners, and the boatman.
     * ------------------------------------------------------------------ */
    {
      id: 'joiner-1',
      name: 'A joiner',
      spec: varyActor(JOINER, 4),
      x: 22, z: 34, facing: 2,
      lines: [
        {
          speaker: 'A joiner',
          text:
            'Mr Lanphier says raised and covered before the frosts. He said that last year and the '
            + 'year before, and I have the same nails in my apron.',
        },
      ],
    },
    {
      id: 'joiner-2',
      name: 'A joiner',
      spec: varyActor(JOINER, 9),
      x: 31, z: 39, facing: 3,
      lines: [
        {
          speaker: 'A joiner',
          text: 'Mind the pit, sir. There is a saw in it and no man on the underside this morning.',
        },
      ],
    },
    {
      id: 'simms',
      name: 'Simms',
      spec: SIMMS,
      x: 38, z: 11, facing: 0,
      hearFlag: 'heard.a1.simms',
      lines: [
        {
          speaker: 'Simms',
          text:
            'Tide serves at two, sir. We will have you at the ferry before dark and Alexandria by '
            + 'morning, wind allowing.',
        },
        {
          speaker: 'Simms',
          text:
            'Shad are running. Herring after them. Forty year I have watched them come up and I '
            + 'have never once known them not to.',
        },
      ],
    },
  ];
}
