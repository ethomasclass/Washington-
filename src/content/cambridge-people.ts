/**
 * Who is in the camp, and where they stand.
 *
 * The staging rule from the estate carries over: nobody is placed where the
 * player has to hunt for them, and nobody is placed on the direct line
 * between two things the player has to do. Every person on this map is
 * standing where somebody doing their job would actually stand — Greene at
 * the head of his own brigade's street, the sentry at the door he is guarding,
 * Prescott on the parapet he is responsible for.
 *
 * WITNESS REGISTER. Two people here carry `sensitive: true`: William Lee, who
 * came north from Mount Vernon, and Salem Poor, who bought his own freedom
 * and fought at Bunker Hill. Neither has a decision, neither grants a stat,
 * and neither asks the player for anything — §6.3, in full. Both require the
 * §7.6 pedagogical sign-off before classroom use. Drafted; NOT approved.
 */

import type { NpcDef } from '../types';
import type { Season } from './cambridge';
import { STREET_N, STREET_S } from './cambridge';
import {
  BILLY_FIELD, BRAGG, CAMP_WOMAN, DOOLITTLE, DRUMMER, GREENE, PRESCOTT,
  SALEM_POOR, SENTRY, STARR, WHITCOMB,
} from './act2-people';
import { A2_D1_POWDER, A2_D4_ENLISTMENTS } from './act2-decisions';

/* ---------------------------------------------------------------------- *
 * Summer: the camp street, July to November
 * ---------------------------------------------------------------------- */

function summerPeople(): NpcDef[] {
  return [
    {
      id: 'greene',
      name: 'General Greene',
      spec: GREENE,
      x: 24, z: STREET_N + 1, facing: 0,
      hearFlag: 'heard.a2.greene',
      lines: [
        {
          speaker: 'Nathanael Greene',
          text:
            'Rhode Island sent me up with three regiments, sir, and I have been a soldier for '
            + 'eleven months of my life. I read about it. There was nothing else to do.',
        },
        {
          speaker: 'Nathanael Greene',
          text:
            'My men want for nothing the rest of this camp has not wanted for. What they want '
            + 'for is powder, and I am told there is a magazine full of it, and I am told that '
            + 'by men who have not been inside the magazine.',
          mood: 'hard',
        },
      ],
      decision: A2_D1_POWDER,
      after: [
        {
          speaker: 'Nathanael Greene',
          text:
            'Then I will go and count something, sir. It is what I am for. If a thing in this '
            + 'camp can be written down and added up, I will have it on your table by Friday.',
        },
      ],
    },
    {
      id: 'bragg',
      name: 'Bragg, of the riflemen',
      spec: BRAGG,
      x: 52, z: STREET_N + 2, facing: 0,
      hearFlag: 'heard.a2.bragg',
      lines: [
        {
          speaker: 'Bragg',
          text:
            'Six hundred miles from Winchester in three weeks, General, and not a man fell out. '
            + 'We can put a ball in a plate at two hundred yards. Ask anybody.',
        },
        {
          speaker: 'Bragg',
          text:
            'What we do not do is dig, and we do not stand a guard we were not asked politely '
            + 'about, and there is a New England colonel down the street who has learned that '
            + 'twice this week.',
          mood: 'hard',
        },
      ],
      after: [
        {
          speaker: 'Bragg',
          text: 'You are the only officer in this camp who talks like home, sir. It is noted.',
        },
      ],
    },
    {
      id: 'whitcomb',
      name: 'Whitcomb, the scout',
      spec: WHITCOMB,
      x: 16, z: STREET_S - 1, facing: 2,
      hearFlag: 'heard.a2.whitcomb',
      lines: [
        {
          speaker: 'Whitcomb',
          text:
            'I go out at night and count what is over there, sir, and I will tell you what I '
            + 'count and not what anybody would like me to have counted.',
        },
        {
          speaker: 'Whitcomb',
          text:
            'Two nights ago I lay under a wall on the Neck for four hours. They are not short of '
            + 'anything a ship can carry. They are short of hay and short of temper, and that is '
            + 'the whole of the good news.',
        },
      ],
    },
    {
      id: 'campwoman',
      name: 'A woman of the camp',
      spec: CAMP_WOMAN,
      x: 21, z: STREET_S - 2, facing: 3,
      hearFlag: 'heard.a2.campwoman',
      lines: [
        {
          speaker: 'A woman of the camp',
          text:
            'Half a ration, sir, same as the other women, and for that this regiment has clean '
            + 'shirts and I have dressed nine wounds this month that the surgeon never saw.',
        },
        {
          speaker: 'A woman of the camp',
          text:
            'There is talk of putting us off the rolls to save the flour. You may do it. You will '
            + 'have the hospital full inside a fortnight and nobody will write down why.',
          mood: 'hard',
        },
      ],
    },
    {
      id: 'drummer',
      name: 'A drummer',
      spec: DRUMMER,
      x: 33, z: STREET_S - 2, facing: 1,
      hearFlag: 'heard.a2.drummer',
      lines: [
        {
          speaker: 'A drummer',
          text:
            'Reveille, troop, retreat, tattoo, and the general when you want everyone at once, '
            + 'sir. Fourteen, sir. My brother is in the Sixth and my mother does not know.',
        },
      ],
    },
    {
      id: 'sentry',
      name: 'The sentry',
      spec: SENTRY,
      x: 46, z: 43, facing: 0,
      hearFlag: 'heard.a2.sentry',
      lines: [
        {
          speaker: 'The sentry',
          text:
            'Countersign and a written pass, sir, from anybody, without exception. Those are the '
            + 'orders and I have read them. I asked you for both on the second day.',
        },
        {
          speaker: 'The sentry',
          text:
            'You had me commended in orders for it that evening. My father has the page. He '
            + 'cannot read it, so he has somebody read it to him about once a week.',
        },
      ],
    },
    {
      id: 'prescott',
      name: 'Colonel Prescott',
      spec: PRESCOTT,
      x: 36, z: 17, facing: 3,
      hearFlag: 'heard.a2.prescott',
      lines: [
        {
          speaker: 'William Prescott',
          text:
            'I took a regiment onto that hill in June with entrenching tools and no orders worth '
            + 'the name, and we held it against three assaults on the powder we carried up.',
        },
        {
          speaker: 'William Prescott',
          text:
            'The country rose of itself, sir. Nobody sent for these men. They came because it was '
            + 'time to come, and that is a thing no King can put down.',
        },
      ],
    },
    {
      id: 'doolittle',
      name: 'Private Doolittle',
      spec: DOOLITTLE,
      x: 62, z: 18, facing: 1,
      hearFlag: 'heard.a2.doolittle',
      lines: [
        {
          speaker: 'Amos Doolittle',
          text:
            'I am an engraver in New Haven, sir, when I am not this. I went and stood on the '
            + 'ground at Lexington and drew what was there before anybody could tell me what to '
            + 'draw.',
        },
        {
          speaker: 'Amos Doolittle',
          text:
            'They are poor plates. I know it. But they are the only ones, and in fifty years poor '
            + 'and only will beat handsome and invented.',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * Winter: the same street, December
 * ---------------------------------------------------------------------- */

function winterPeople(): NpcDef[] {
  return [
    {
      id: 'starr',
      name: 'Sergeant Starr',
      spec: STARR,
      x: 30, z: 18, facing: 0,
      hearFlag: 'heard.a2.starr',
      lines: [
        {
          speaker: 'Sergeant Starr',
          text:
            'Connecticut, sir. Eight months, and the paper says the tenth of December, and I have '
            + 'a wife who has got the harvest in alone and a boy I have not seen walk.',
        },
      ],
      decision: A2_D4_ENLISTMENTS,
      after: [
        {
          speaker: 'Sergeant Starr',
          text:
            'I will tell them what you said, sir. Word for word, and not one word of it improved. '
            + 'They will want to know I did not improve it.',
        },
      ],
    },
    {
      id: 'greene-w',
      name: 'General Greene',
      spec: GREENE,
      x: 24, z: STREET_N + 1, facing: 0,
      hearFlag: 'heard.a2.greene_w',
      lines: [
        {
          speaker: 'Nathanael Greene',
          text:
            'I have the returns properly kept now, sir, which means I can tell you exactly how '
            + 'bad this is instead of approximately. I am not sure that is an improvement.',
        },
        {
          speaker: 'Nathanael Greene',
          text:
            'On the thirty-first this army ceases to exist as a matter of law, and on the first '
            + 'of January a different army with the same name is supposed to be standing in these '
            + 'same lines. Nobody has ever done that. Nobody has ever tried.',
          mood: 'hard',
        },
      ],
    },
    {
      id: 'whitcomb-w',
      name: 'Whitcomb, the scout',
      spec: WHITCOMB,
      x: 16, z: STREET_S - 1, facing: 2,
      hearFlag: 'heard.a2.whitcomb_w',
      lines: [
        {
          speaker: 'Whitcomb',
          text:
            'The ice is making, sir. Another fortnight of this and a man walks to Boston. So can '
            + 'a column, and so can theirs, and there is no way of having the one without the other.',
        },
      ],
    },
    {
      id: 'campwoman-w',
      name: 'A woman of the camp',
      spec: CAMP_WOMAN,
      x: 21, z: STREET_S - 2, facing: 3,
      hearFlag: 'heard.a2.campwoman_w',
      lines: [
        {
          speaker: 'A woman of the camp',
          text:
            'The huts are warmer than the tents and they are full of smoke and full of lice, and '
            + 'the men in them are not going anywhere on the tenth, because they have nowhere '
            + 'nearer than Rhode Island to go.',
        },
      ],
    },
    {
      id: 'drummer-w',
      name: 'A drummer',
      spec: DRUMMER,
      x: 33, z: STREET_S - 2, facing: 1,
      hearFlag: 'heard.a2.drummer_w',
      lines: [
        {
          speaker: 'A drummer',
          text:
            'They have me beat the general at noon on the first of January, sir, and the whole '
            + 'camp is to turn out for a flag. Nobody will tell me what is on it.',
        },
      ],
    },
    {
      id: 'sentry-w',
      name: 'The sentry',
      spec: SENTRY,
      x: 46, z: 43, facing: 0,
      hearFlag: 'heard.a2.sentry_w',
      lines: [
        {
          speaker: 'The sentry',
          text:
            'My time is up on the thirty-first, sir, same as everybody&rsquo;s. I have not decided. '
            + 'I would like to hear what is decided about the rest of them first.',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * The Witness Register, in the field
 * ---------------------------------------------------------------------- */

/**
 * The two people on this map the game will not let you transact with.
 *
 * They are on both seasonal maps, at the same positions, for the same reason
 * the rest of the map does not move: the student should be able to come back
 * in December and find them where they were in July.
 *
 * Neither carries a decision, a task, a warmup or a stat. Neither grants
 * anything except the flag that records that they were met, which exists so
 * the letterbook can list them and for no other purpose. The interface has
 * nothing to offer here and that is the design speaking, not an omission.
 */
function witnesses(season: Season): NpcDef[] {
  const w = season === 'winter';
  return [
    {
      id: 'billy',
      name: 'William Lee',
      spec: BILLY_FIELD,
      x: 28, z: 43, facing: 2,
      hearFlag: 'heard.a2.billy',
      sensitive: true,
      lines: w
        ? [
          {
            speaker: 'William Lee',
            text:
              'Six months, sir. I have been in this camp as long as you have and I know the road '
              + 'to Watertown better than any express rider in it.',
          },
          {
            speaker: 'William Lee',
            text:
              'The Connecticut men are counting the days to the tenth. I have not got a day to '
              + 'count to. That is the difference between them and me, and it is the only one '
              + 'anybody here would notice.',
            mood: 'hard',
          },
        ]
        : [
          {
            speaker: 'William Lee',
            text:
              'I rode up with you from Philadelphia, sir, and I have your horses, your papers and '
              + 'your dispatches. Nobody in this camp has asked me a single question about myself.',
          },
          {
            speaker: 'William Lee',
            text:
              'They call me your man. That is the word they use here. In Virginia they used a '
              + 'different one and meant the same thing by it.',
            mood: 'hard',
          },
        ],
    },
    {
      id: 'salem',
      name: 'Salem Poor',
      spec: SALEM_POOR,
      x: 58, z: STREET_S - 1, facing: 3,
      hearFlag: 'heard.a2.salem',
      sensitive: true,
      lines: w
        ? [
          {
            speaker: 'Salem Poor',
            text:
              'I was on that hill in June, sir, in the redoubt, and I am on the roll of it. In '
              + 'November your order said I was not to be enlisted. I was already enlisted. '
              + 'Nobody could tell me what that meant.',
          },
          {
            speaker: 'Salem Poor',
            text:
              'Fourteen officers signed a paper to the General Court about me. Colonel Prescott '
              + 'signed it. It asked that I be rewarded. I have not heard anything since, and I '
              + 'did not expect to, and I am still here.',
            mood: 'hard',
          },
        ]
        : [
          {
            speaker: 'Salem Poor',
            text:
              'Bought myself in &rsquo;sixty-nine, sir. Twenty-seven pounds, which was a year of a '
              + 'working man&rsquo;s wages, and I paid every shilling of it. Then I enlisted, '
              + 'which nobody made me do either.',
          },
          {
            speaker: 'Salem Poor',
            text:
              'I was in the redoubt on the seventeenth of June. So were a good many others you '
              + 'would not be able to pick out of this street now. We were there before the '
              + 'question of whether we ought to be was ever asked.',
            mood: 'hard',
          },
        ],
    },
  ];
}

export function campNpcs(season: Season): NpcDef[] {
  return [
    ...(season === 'winter' ? winterPeople() : summerPeople()),
    ...witnesses(season),
  ];
}
