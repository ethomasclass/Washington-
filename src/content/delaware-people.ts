/**
 * Who is on the Pennsylvania bank, and who is in King Street.
 *
 * The whole cast of Act 4 is arranged around one contrast the sprites make
 * without a word of help: on this side of the river, men in whatever they
 * own with rag on their feet; on the other, matching blue coats, brass mitre
 * caps and a bayonet on every barrel.
 *
 * WITNESS REGISTER. One person here carries `sensitive: true` — a Black
 * soldier of the Continental line, and by December 1776 the bar of the
 * previous winter has been quietly abandoned because the army needs men.
 * R5 material; §7.6 sign-off required; drafted and NOT approved.
 */

import type { NpcDef } from '../types';
import type { Bank, Street } from './delaware';
import { D_CAMP_N, D_CAMP_S, D_SHORE } from './delaware';
import {
  CONTINENTAL_BLACK, HESSIAN_PRISONER, HONEYMAN, MARTIN, RAGGED_PRIVATE,
  RALL, VIRGINIA_REMNANT, YOUNG,
} from './act4-people';
import { GLOVER } from './act3-people';
import { KNOX } from './act2-people';
import { BILLY_FIELD } from './act2-people';
import { A4_D1_BOUNTY, A4_D2_GO_ON, A4_D3_PRISONERS } from './act4-decisions';

/* ---------------------------------------------------------------------- *
 * The bank
 * ---------------------------------------------------------------------- */

export function ferryCampNpcs(state: Bank): NpcDef[] {
  if (state === 'night') {
    return [
      {
        id: 'glover-dl',
        name: 'Colonel Glover',
        spec: GLOVER,
        x: 34, z: D_SHORE + 3, facing: 3,
        hearFlag: 'heard.a4.glover',
        lines: [
          {
            speaker: 'John Glover',
            text:
              'Same men, sir. Same oars. Four months ago it was a mile of tide in the dark and '
              + 'tonight it is three hundred yards of running ice, and I could not tell you which '
              + 'is worse until we are over.',
          },
          {
            speaker: 'John Glover',
            text:
              'I shall have your two thousand four hundred and your eighteen guns on that bank. I '
              + 'shall not have them there by midnight and nobody alive could. Decide now what you '
              + 'mean to do about that, sir, because I have to keep loading either way.',
            mood: 'hard',
          },
        ],
        decision: A4_D2_GO_ON,
        after: [
          {
            speaker: 'John Glover',
            text:
              'Then get off the bank, sir, and let me finish. The last gun is coming over now and '
              + 'the road is that way.',
          },
        ],
      },
      {
        id: 'knox-dl',
        name: 'Henry Knox',
        spec: KNOX,
        x: 26, z: D_SHORE + 5, facing: 3,
        hearFlag: 'heard.a4.knox',
        lines: [
          {
            speaker: 'Henry Knox',
            text:
              'Eighteen guns over three hundred yards of ice in the dark, sir, and every one of '
              + 'them came three hundred miles on a sledge to get here. I am not losing one in a '
              + 'river.',
          },
          {
            speaker: 'Henry Knox',
            text:
              'I have the embarkation and I am shouting at people, which everybody has noticed. '
              + 'It is a very loud voice and tonight it is the only useful thing about me.',
            mood: 'warm',
          },
        ],
        after: [
          {
            speaker: 'Henry Knox',
            text:
              'Sit down in the boat, sir, and mind where you put your feet. There will be a story '
              + 'about me and a boat and it will be told for two hundred years, and I shall never '
              + 'once be asked whether it happened.',
          },
        ],
      },
      {
        id: 'martin-night',
        name: 'Joseph Plumb Martin',
        spec: MARTIN,
        x: 42, z: D_SHORE + 6, facing: 3,
        hearFlag: 'heard.a4.martin_night',
        lines: [
          {
            speaker: 'Joseph Plumb Martin',
            text:
              'They have told us nothing, sir, which is usual. We are stood in the sleet by a '
              + 'river at eleven at night on Christmas and nobody has said a word about why.',
          },
          {
            speaker: 'Joseph Plumb Martin',
            text:
              'I shall write it all down one day, sir, and I shall be honest about the food and '
              + 'the feet, and nobody will believe the half of it.',
          },
        ],
      },
      {
        id: 'billy-dl',
        name: 'William Lee',
        spec: BILLY_FIELD,
        x: 38, z: D_SHORE + 8, facing: 2,
        hearFlag: 'heard.a4.billy',
        sensitive: true,
        lines: [
          {
            speaker: 'William Lee',
            text:
              'The horses go in the last boats, sir, and I go with them. I have crossed two rivers '
              + 'in the dark with you this year and both times I have been holding a head.',
          },
          {
            speaker: 'William Lee',
            text:
              'The password is <em>Victory or Death</em>. I have had to say it four times tonight '
              + 'to men who did not know me, and every one of them pointed a musket at me first.',
            mood: 'hard',
          },
        ],
      },
    ];
  }

  return [
    {
      id: 'young',
      name: 'Sergeant Young',
      spec: YOUNG,
      x: 32, z: D_CAMP_N + 3, facing: 3,
      hearFlag: 'heard.a4.young',
      lines: [
        {
          speaker: 'Sergeant Young',
          text:
            'I keep a diary, sir. It is mostly weather and what we ate. Today it says: cold, and '
            + 'nothing.',
        },
        {
          speaker: 'Sergeant Young',
          text:
            'My company signed for a year on the first of January and there are six days in it. I '
            + 'have not been told what to say to them and they have stopped asking, which is worse '
            + 'than the asking was.',
          mood: 'hard',
        },
      ],
      decision: A4_D1_BOUNTY,
      after: [
        {
          speaker: 'Sergeant Young',
          text:
            'I shall put that in the book tonight, sir, word for word, and in fifty years somebody '
            + 'will read it and know exactly what was said on a cold day by a river.',
        },
      ],
    },
    {
      id: 'martin',
      name: 'Joseph Plumb Martin',
      spec: MARTIN,
      x: 20, z: D_CAMP_N + 4, facing: 3,
      hearFlag: 'heard.a4.martin',
      lines: [
        {
          speaker: 'Joseph Plumb Martin',
          text:
            'Sixteen, sir. Connecticut. I enlisted at fifteen because I wanted to see it, which '
            + 'everybody said was foolish and everybody was right.',
        },
        {
          speaker: 'Joseph Plumb Martin',
          text:
            'We had a Christmas dinner today. It was the same as yesterday&rsquo;s dinner. I have '
            + 'been hungry since October and I have got used to it, which I am told you are not '
            + 'supposed to be able to do.',
        },
      ],
    },
    {
      id: 'ragged',
      name: 'A Pennsylvania private',
      spec: RAGGED_PRIVATE,
      x: 46, z: D_CAMP_N + 5, facing: 3,
      hearFlag: 'heard.a4.ragged',
      lines: [
        {
          speaker: 'A Pennsylvania private',
          text:
            'No shoes since Hackensack, sir. Rag and a bit of hide off a dead ox, tied on with '
            + 'twine, and I am not the worst of it in this company by a distance.',
        },
        {
          speaker: 'A Pennsylvania private',
          text:
            'You can follow this army by the blood on the road. Somebody said that where I could '
            + 'hear it and thought it was fine talking. It is not talking. It is what the road '
            + 'looks like.',
          mood: 'hard',
        },
      ],
    },
    {
      /*
       * WITNESS REGISTER. R5. §7.6 sign-off required; drafted, not approved.
       *
       * No decision, no task, no stat. §6.3 in full.
       */
      id: 'continentalB',
      name: 'A soldier of the line',
      spec: CONTINENTAL_BLACK,
      x: 26, z: D_CAMP_S - 3, facing: 3,
      hearFlag: 'heard.a4.continental_b',
      sensitive: true,
      lines: [
        {
          speaker: 'A soldier of the line',
          text:
            'A year ago there was an order saying I was not to be enlisted, sir. Then there was '
            + 'another one saying I might be, if I had already served. Nobody has read either of '
            + 'them out here since August.',
        },
        {
          speaker: 'A soldier of the line',
          text:
            'What happens now is that the sergeant counts, and if the number is short he does not '
            + 'ask any questions about anybody. That is the whole of my situation and it will hold '
            + 'exactly as long as the number is short.',
          mood: 'hard',
        },
      ],
    },
    {
      id: 'virginia',
      name: 'A Virginia man',
      spec: VIRGINIA_REMNANT,
      x: 52, z: D_CAMP_N + 8, facing: 3,
      hearFlag: 'heard.a4.virginia',
      lines: [
        {
          speaker: 'A Virginia man',
          text:
            'Come up with the riflemen in &rsquo;seventy-five, sir. There were four hundred of us '
            + 'then and I could name you the ones that are left on one hand.',
        },
      ],
    },
    {
      /*
       * Honeyman, and the game's honesty about him.
       *
       * He says what the story says he said. The document that carries the
       * story is dated 1873 on its face, and the Hessian picket order
       * contradicts him. Neither is marked true.
       */
      id: 'honeyman',
      name: 'John Honeyman',
      spec: HONEYMAN,
      x: 40, z: D_SHORE + 10, facing: 3,
      hearFlag: 'heard.a4.honeyman',
      lines: [
        {
          speaker: 'John Honeyman',
          text:
            'A weaver and a cattle dealer, sir, out of Griggstown, and I sell beef to the Hessians '
            + 'because a man who sells beef to the Hessians may walk about Trenton all day and '
            + 'nobody asks him anything.',
        },
        {
          speaker: 'John Honeyman',
          text:
            'They are at their ease over there. It is Christmas, the officers are dining, and I '
            + 'have not seen a patrol on the Pennington road in two days. You would not have an '
            + 'easier morning of it if you waited a month.',
        },
      ],
      after: [
        {
          speaker: 'John Honeyman',
          text:
            'You will want me arrested again on the way out, sir, and the door left off the latch '
            + 'as before. I have a wife at Griggstown who has had the windows broken twice for '
            + 'being married to a Tory.',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * King Street
 * ---------------------------------------------------------------------- */

export function trentonNpcs(state: Street): NpcDef[] {
  if (state === 'after') {
    return [
      {
        id: 'hessian-prisoner',
        name: 'A Hessian',
        spec: HESSIAN_PRISONER,
        x: 30, z: 22, facing: 3,
        hearFlag: 'heard.a4.hessian',
        lines: [
          {
            speaker: 'A Hessian',
            text:
              'Regiment von Rall. I am from Hersfeld and I have been a soldier since I was '
              + 'nineteen, which was not a thing I decided.',
          },
          {
            speaker: 'A Hessian',
            text:
              'The Landgrave was paid for me. Seven pounds and some, I am told, and I have never '
              + 'seen any of it. I do not know what you mean to do with us and I would rather be '
              + 'told a hard thing than nothing at all.',
            mood: 'hard',
          },
        ],
        decision: A4_D3_PRISONERS,
        after: [
          {
            speaker: 'A Hessian',
            text:
              'Then I shall tell the others. Half of them think they are to be hanged, because '
              + 'that is what they were told about you before they came.',
          },
        ],
      },
      {
        id: 'rall',
        name: 'Colonel Rall',
        spec: RALL,
        x: 47, z: 18, facing: 0,
        hearFlag: 'heard.a4.rall',
        lines: [
          {
            speaker: 'Colonel Rall',
            text:
              'Thirty years, sir. I stormed a redoubt at White Plains in November and my brigade '
              + 'has been under arms for a week. I doubled the guard on the twenty-fourth.',
          },
          {
            speaker: 'Colonel Rall',
            text:
              'I asked twice to be allowed to build a work at the head of this town and was told '
              + 'it was not necessary against such an enemy. I should like that written down '
              + 'somewhere, since I shall not be writing it myself.',
            mood: 'hard',
          },
        ],
        after: [
          {
            speaker: 'Colonel Rall',
            text:
              'My men, sir. That is all. They did not ask to be here either and they stood in your '
              + 'street for forty minutes.',
          },
        ],
      },
      {
        id: 'martin-after',
        name: 'Joseph Plumb Martin',
        spec: MARTIN,
        x: 26, z: 30, facing: 3,
        hearFlag: 'heard.a4.martin_after',
        lines: [
          {
            speaker: 'Joseph Plumb Martin',
            text:
              'We are going straight back over the river tonight, sir, with all of them. I have '
              + 'been awake since Tuesday and I have worked out that I do not mind.',
          },
        ],
      },
      {
        id: 'knox-after',
        name: 'Henry Knox',
        spec: KNOX,
        x: 33, z: 13, facing: 3,
        hearFlag: 'heard.a4.knox_after',
        lines: [
          {
            speaker: 'Henry Knox',
            text:
              'Two guns at the head of the street firing straight down it, sir, and they never got '
              + 'their own into action properly. That is the whole of the tactical account and it '
              + 'took forty-five minutes.',
          },
          {
            speaker: 'Henry Knox',
            text:
              'Six brass three-pounders taken, and forty waggons, and a thousand stand of arms '
              + 'with bayonets on them. Bayonets, sir. We have wanted those since Cambridge.',
            mood: 'warm',
          },
        ],
      },
    ];
  }

  return [
    {
      id: 'knox-fight',
      name: 'Henry Knox',
      spec: KNOX,
      x: 31, z: 15, facing: 3,
      hearFlag: 'heard.a4.knox_fight',
      lines: [
        {
          speaker: 'Henry Knox',
          text:
            'Guns at the head of the street, sir, both of them, firing straight down it. They '
            + 'cannot form in a street with round shot coming up it and they know they cannot.',
        },
        {
          speaker: 'Henry Knox',
          text:
            'Sullivan is at the head of Queen Street and coming down. If they get out to the south '
            + 'over the Assunpink bridge we shall be doing this again in the spring with twice as '
            + 'many of them.',
          mood: 'hard',
        },
      ],
    },
    {
      id: 'martin-fight',
      name: 'Joseph Plumb Martin',
      spec: MARTIN,
      x: 27, z: 27, facing: 3,
      hearFlag: 'heard.a4.martin_fight',
      lines: [
        {
          speaker: 'Joseph Plumb Martin',
          text:
            'My priming is wet, sir, and so is every man&rsquo;s in this company, and the word '
            + 'came down the column an hour ago to use the bayonet. Half of us have not got one.',
        },
      ],
    },
    {
      id: 'virginia-fight',
      name: 'A Virginia man',
      spec: VIRGINIA_REMNANT,
      x: 36, z: 32, facing: 3,
      hearFlag: 'heard.a4.virginia_fight',
      lines: [
        {
          speaker: 'A Virginia man',
          text:
            'There is a lieutenant of ours up there with both hands shot through, sir, holding the '
            + 'reins in his teeth. Monroe. He will do or he will not, and he is twenty.',
        },
      ],
    },
  ];
}

/*
 * NO TOP-LEVEL USE OF THE MAP FILE'S CONSTANTS IN THIS FILE.
 *
 * `delaware.ts` imports this module and this module imports its constants
 * back. That is fine while every use of them sits inside a function body,
 * and it throws "cannot access before initialization" at BOOT — not at
 * build, at boot, with a blank screen — the moment one of them is read at
 * module scope. Brooklyn found this out the hard way.
 */
