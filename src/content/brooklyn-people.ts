/**
 * Who is on the Brooklyn line, and who is at the ferry.
 *
 * Two of the people on the line are prisoners of war within twenty-four
 * hours of the morning the player meets them. Nothing they say forecasts it
 * — Sullivan is confident, Stirling is professional, and Lieutenant Ford is
 * a young man carrying out an order he does not know is inadequate. That is
 * the state of knowledge on the twenty-sixth of August and the act is built
 * on refusing to improve it.
 *
 * WITNESS REGISTER. One person here carries `sensitive: true`: a Marbleheader
 * of Glover's regiment, which was integrated, and whose crews rowed the whole
 * army off Long Island. R5 material; §7.6 sign-off required; drafted and NOT
 * approved.
 */

import type { NpcDef } from '../types';
import type { Ferry } from './brooklyn';
import { SHORE } from './brooklyn';
import {
  FERRY_WOMAN, FORD, GLOVER, HAMILTON, MARBLEHEADER, MARBLEHEADER_BLACK,
  MARYLANDER, MILITIA_CT, PUTNAM, STIRLING, SULLIVAN,
} from './act3-people';
import { BILLY_FIELD } from './act2-people';
import { A3_D1_NEW_YORK, A3_D3_HALE } from './act3-decisions';

/* ---------------------------------------------------------------------- *
 * The line, 26 August
 * ---------------------------------------------------------------------- */

export function lineNpcs(): NpcDef[] {
  return [
    {
      /*
       * Stirling carries the sealed decision, and he carries it because he
       * is the man who has to act on it: he is being told where to put his
       * brigade. The player answers a practical question and only finds out
       * afterwards that it was the whole campaign.
       */
      id: 'stirling',
      name: 'Lord Stirling',
      spec: STIRLING,
      x: 38, z: 11, facing: 3,
      hearFlag: 'heard.a3.stirling',
      lines: [
        {
          speaker: 'Lord Stirling',
          text:
            'The line is a mile and a half from the Gowanus to the Wallabout and it is good line, '
            + 'sir. I have walked every yard of it twice this week.',
        },
        {
          speaker: 'Lord Stirling',
          text:
            'What I have not got is enough of it. The works stop where the works stop, and the '
            + 'country goes on for four miles past the end of them.',
          mood: 'hard',
        },
      ],
      decision: A3_D1_NEW_YORK,
      after: [
        {
          speaker: 'Lord Stirling',
          text:
            'Then I shall put the Marylanders on the right of the Gowanus road, sir, where they '
            + 'can be seen. They are the best-turned-out men on this island and it does the rest '
            + 'of them good to look at somebody who is.',
        },
      ],
    },
    {
      id: 'sullivan',
      name: 'General Sullivan',
      spec: SULLIVAN,
      x: 28, z: 12, facing: 3,
      hearFlag: 'heard.a3.sullivan',
      lines: [
        {
          speaker: 'John Sullivan',
          text:
            'Three passes through the hills, sir: the Gowanus road on our right, the Flatbush road '
            + 'in the centre, and the Bedford road on the left. All three are watched and all '
            + 'three are covered.',
        },
        {
          speaker: 'John Sullivan',
          text:
            'There is a fourth, four miles out on the Jamaica road. It is a cart track through a '
            + 'wood and no army has ever used it. I have five officers of horse on it, which is '
            + 'five more than anybody thought necessary.',
        },
      ],
      after: [
        {
          speaker: 'John Sullivan',
          text:
            'Depend upon it, sir, they will come at the centre. That is where the ground is and '
            + 'that is where the guns are, and a general does what the ground tells him.',
        },
      ],
    },
    {
      /*
       * The hinge of the battle, standing in front of you, telling you the
       * literal truth about an order that is about to lose the campaign.
       */
      id: 'ford',
      name: 'Lieutenant Ford',
      spec: FORD,
      x: 68, z: 13, facing: 3,
      hearFlag: 'heard.a3.ford',
      lines: [
        {
          speaker: 'Lieutenant Ford',
          text:
            'Five of us, sir, mounted, on the Jamaica road, from dark until we are relieved. I '
            + 'have asked twice when that is and I have not been told, so I take it we are not.',
        },
        {
          speaker: 'Lieutenant Ford',
          text:
            'If we see anything we are to give notice. The order does not say to whom, or by what '
            + 'road, and it is four miles back to this line in the dark. I have thought about it '
            + 'a good deal, sir.',
          mood: 'hard',
        },
      ],
      after: [
        {
          speaker: 'Lieutenant Ford',
          text: 'We shall do what we can with it, sir. It is what there is.',
        },
      ],
    },
    {
      id: 'putnam',
      name: 'General Putnam',
      spec: PUTNAM,
      x: 44, z: 24, facing: 3,
      hearFlag: 'heard.a3.putnam',
      lines: [
        {
          speaker: 'Israel Putnam',
          text:
            'Four days I have had this command, sir. Four. I do not know these roads, I do not '
            + 'know these farms, and half the farmers on them drink the King&rsquo;s health at '
            + 'their own tables.',
        },
        {
          speaker: 'Israel Putnam',
          text:
            'Americans are not afraid of their heads, sir, if they are covered. Give a man a bank '
            + 'of earth to stand behind and he will stand behind it all day. It is the running '
            + 'about in the open that they have not the habit of.',
        },
      ],
    },
    {
      id: 'maryland',
      name: 'A Marylander',
      spec: MARYLANDER,
      x: 22, z: 26, facing: 3,
      hearFlag: 'heard.a3.maryland',
      lines: [
        {
          speaker: 'A Marylander',
          text:
            'Smallwood&rsquo;s battalion, sir. The colony clothed us &mdash; scarlet facings, and '
            + 'every man the same, which nobody else on this island can say.',
        },
        {
          speaker: 'A Marylander',
          text:
            'The rest of the army calls us the macaronis on account of it. They stop calling us '
            + 'that when there is anything to do.',
        },
      ],
    },
    {
      id: 'ctmilitia',
      name: 'A Connecticut man',
      spec: MILITIA_CT,
      x: 56, z: 27, facing: 3,
      hearFlag: 'heard.a3.militia',
      lines: [
        {
          speaker: 'A Connecticut man',
          text:
            'Out for the summer, sir, and it is nearly September. There is a farm at home that '
            + 'nobody has cut and a wife who has written twice about it.',
        },
        {
          speaker: 'A Connecticut man',
          text:
            'I am not saying I will go. I am saying eight thousand of us came out and you should '
            + 'ask somebody how many are in these tents this morning, because it is not eight '
            + 'thousand.',
          mood: 'hard',
        },
      ],
    },
    {
      id: 'billy-bk',
      name: 'William Lee',
      spec: BILLY_FIELD,
      x: 40, z: 33, facing: 2,
      hearFlag: 'heard.a3.billy',
      sensitive: true,
      lines: [
        {
          speaker: 'William Lee',
          text:
            'I have your glass, your horses and the road to the ferry, sir. I have ridden it four '
            + 'times since Sunday and I could ride it in the dark, which I expect I shall.',
        },
        {
          speaker: 'William Lee',
          text:
            'The Declaration was read to this army in July. I stood at the back of it with the '
            + 'horses and heard the whole thing. All men are created equal, and then everybody '
            + 'cheered, and then I took the horses back.',
          mood: 'hard',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * The ferry, 29 August, and the night after it
 * ---------------------------------------------------------------------- */

export function ferryNpcs(state: Ferry): NpcDef[] {
  if (state !== 'night') {
    return [
      {
        id: 'glover-day',
        name: 'Colonel Glover',
        spec: GLOVER,
        x: 28, z: SHORE + 7, facing: 3,
        hearFlag: 'heard.a3.glover',
        lines: [
          {
            speaker: 'John Glover',
            text:
              'Marblehead, sir. Fourteenth Continental. Every man in it has been to sea and about '
              + 'half of them have been to sea since they were nine.',
          },
          {
            speaker: 'John Glover',
            text:
              'You have not asked me yet, and I know what it is you are going to ask, and the '
              + 'answer is that it depends entirely on the wind and I will not pretend otherwise '
              + 'to make you feel better about it.',
            mood: 'hard',
          },
        ],
        after: [
          {
            speaker: 'John Glover',
            text:
              'North-east, and holding. While it holds, their ships cannot beat up this river. '
              + 'When it shifts, they can, and then none of this matters.',
          },
        ],
      },
      {
        id: 'ferrywoman',
        name: 'A woman at the ferry',
        spec: FERRY_WOMAN,
        x: 22, z: SHORE + 9, facing: 2,
        hearFlag: 'heard.a3.ferrywoman',
        lines: [
          {
            speaker: 'A woman at the ferry',
            text:
              'Third New York, sir, my husband is. I am on the rations at half allowance and I '
              + 'have two children on no allowance at all, which is the arrangement.',
          },
          {
            speaker: 'A woman at the ferry',
            text:
              'If this army goes over that river I should like to know whether we are on the list '
              + 'of things that go. Nobody will tell me and I have asked three officers.',
            mood: 'hard',
          },
        ],
      },
    ];
  }

  return [
    {
      id: 'glover',
      name: 'Colonel Glover',
      spec: GLOVER,
      x: 34, z: SHORE + 3, facing: 3,
      hearFlag: 'heard.a3.glover_night',
      lines: [
        {
          speaker: 'John Glover',
          text:
            'Rags on every oarlock and not a word spoken on the water, sir. My men have crossed '
            + 'this river nine times tonight and they will cross it nine more.',
        },
        {
          speaker: 'John Glover',
          text:
            'The ebb is against us until near four and after that we shall want the wind. If it '
            + 'comes round before the last of them are off, the rest are taken. That is the whole '
            + 'of it, sir, and there is nothing either of us can do about it.',
          mood: 'hard',
        },
      ],
      after: [
        {
          speaker: 'John Glover',
          text: 'Get in the boat when I tell you, sir. Not before, and not after.',
        },
      ],
    },
    {
      id: 'marblehead',
      name: 'A Marbleheader',
      spec: MARBLEHEADER,
      x: 26, z: SHORE + 4, facing: 3,
      hearFlag: 'heard.a3.marblehead',
      lines: [
        {
          speaker: 'A Marbleheader',
          text:
            'Been at the oar since eight, sir, and I shall be at it at eight in the morning. It '
            + 'is a mile over and a mile back and the tide is doing what it likes.',
        },
        {
          speaker: 'A Marbleheader',
          text:
            'You want to know can we do it. We can row all night. Whether there is enough night '
            + 'is somebody else&rsquo;s question.',
        },
      ],
    },
    {
      /*
       * WITNESS REGISTER. R5. §7.6 sign-off required; drafted, not approved.
       *
       * The 14th Continental was a documented mixed unit from a town whose
       * crews had always been mixed. He has no decision, no task, and grants
       * nothing but the flag that records he was met. §6.3 in full.
       */
      id: 'marbleheadB',
      name: 'A Marbleheader',
      spec: MARBLEHEADER_BLACK,
      x: 42, z: SHORE + 4, facing: 3,
      hearFlag: 'heard.a3.marblehead_b',
      sensitive: true,
      lines: [
        {
          speaker: 'A Marbleheader',
          text:
            'Marblehead, sir, same as him. On a fishing schooner nobody asks and nobody cares, '
            + 'and Colonel Glover has kept it that way in the regiment, which he did not have to.',
        },
        {
          speaker: 'A Marbleheader',
          text:
            'I am rowing an army that has been arguing all year about whether I should be in it '
            + 'across a river, in the dark, for nothing. Mind the gunwale as you come aboard, sir.',
          mood: 'hard',
        },
      ],
    },
    {
      id: 'ferrywoman-night',
      name: 'A woman at the ferry',
      spec: FERRY_WOMAN,
      x: 48, z: SHORE + 5, facing: 3,
      hearFlag: 'heard.a3.ferrywoman_night',
      lines: [
        {
          speaker: 'A woman at the ferry',
          text:
            'The sick went first and then us, by your own order, sir. I have been told to say '
            + 'nothing to anybody about it and I have said nothing to anybody about it.',
        },
      ],
    },
    {
      /*
       * Hamilton, at the boats, with the question that becomes the Culper
       * Ring. He is twenty-one and nobody has heard of him.
       */
      id: 'hamilton',
      name: 'Captain Hamilton',
      spec: HAMILTON,
      x: 54, z: SHORE + 6, facing: 3,
      hearFlag: 'heard.a3.hamilton',
      lines: [
        {
          speaker: 'Alexander Hamilton',
          text:
            'Two guns down to the water and neither of them in a boat yet, sir. New York '
            + 'provincial company. Hamilton.',
        },
        {
          speaker: 'Alexander Hamilton',
          text:
            'We were beaten on the twenty-seventh because we did not know where they were, sir. '
            + 'Not because we were outfought. Because we did not know.',
          mood: 'hard',
        },
      ],
      decision: A3_D3_HALE,
      after: [
        {
          speaker: 'Alexander Hamilton',
          text:
            'I shall remember how this was arranged, sir. One day somebody will do it properly, '
            + 'and it will want money, and a cipher, and people who are not soldiers.',
        },
      ],
    },
  ];
}

/*
 * NOTE ON THE IMPORT CYCLE, because it bit once and will bite again.
 *
 * `brooklyn.ts` imports this file and this file imports its constants back,
 * which is fine as long as every use of them is INSIDE a function. A
 * top-level `export const LINE_CAMP = { n: CAMP_N }` here evaluates while
 * `brooklyn.ts` is still initialising and throws "cannot access before
 * initialization" at boot — not at build, at boot, with a blank screen.
 *
 * So: constants from the map file may be read in function bodies and nowhere
 * else in this file.
 */
