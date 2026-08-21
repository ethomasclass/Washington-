/**
 * Who is standing where at Valley Forge.
 *
 * THE IMPORT-CYCLE RULE, WHICH IS LOAD-BEARING AND WAS LEARNED THE HARD WAY.
 *
 * `valleyforge.ts` imports this file to build its maps, and this file wants
 * `valleyforge.ts`'s layout constants to place people against. That is a
 * cycle, and JavaScript resolves it by giving whichever module evaluates
 * second a set of `undefined` bindings — but only for anything READ AT
 * MODULE SCOPE. Reading the same constant inside a function body is fine,
 * because by the time anybody calls the function both modules have
 * finished evaluating.
 *
 * So: **map constants may be read in function bodies and nowhere else.**
 * The first draft of the Brooklyn version of this file had
 * `export const LINE_CAMP = { n: CAMP_N }` at the top and the whole game
 * threw `ReferenceError: Cannot access 'CAMP_N' before initialization` on
 * boot, with no stack trace worth reading.
 *
 * WITNESS REGISTER. Two people in this act carry `sensitive: true` — the
 * soldier of the 1st Rhode Island, and William Lee. R5 material; §7.6
 * sign-off required; drafted and NOT approved.
 */

import type { NpcDef } from '../types';
import type { Forge } from './valleyforge';
import {
  V_HUT_Z0, V_PARADE_N, V_RANK_E, V_RANK_W, V_STREET_E, V_STREET_W,
} from './valleyforge';
import {
  COCHRAN, CONWAY, DANA, HAMILTON_VF, HUTTING_PRIVATE, LAUNDRESS, MARTIN_VF,
  RHODE_ISLANDER, SICK_MAN, STEUBEN, WALDO, WALKER, BILLY_VF,
} from './act5-people';
import { GREENE } from './act2-people';
import { A5_D1_POX, A5_D2_CABAL, A5_D3_DRILL, A5_D4_COMMITTEE } from './act5-decisions';

/* ---------------------------------------------------------------------- *
 * The brigade street
 * ---------------------------------------------------------------------- */

export function campNpcs(state: Forge): NpcDef[] {
  const out: NpcDef[] = [];

  /* --- everywhere, in every state ------------------------------------- */

  out.push({
    id: 'greene-vf',
    name: 'General Greene',
    spec: GREENE,
    x: V_STREET_W + 2, z: 18, facing: 3,
    hearFlag: 'heard.a5.greene',
    lines: state === 'december'
      ? [
        {
          speaker: 'Nathanael Greene',
          text:
            'Twelve dollars to the first party in each regiment that finishes one to the '
            + 'specification. I thought it was a gimmick when you proposed it. Fourth Pennsylvania '
            + 'had theirs roofed in four days and there has been a fight over the second prize.',
        },
        {
          speaker: 'Nathanael Greene',
          text:
            'A man builds himself a house to a measure he was given, and it is his, and he will '
            + 'keep the rain out of it. That is worth more this winter than a wagon of blankets '
            + 'and it costs you nothing.',
        },
        {
          speaker: 'Nathanael Greene',
          text:
            'There is a squad of the Ninth who built theirs eighteen feet long because two of '
            + 'them are very tall. They pulled it down yesterday and started again and nobody '
            + 'made them &mdash; they did it because the rest of the rank was laughing.',
        },
      ]
      : state === 'march'
        ? [
          {
            speaker: 'Nathanael Greene',
            text:
              'Congress has made me Quartermaster General. I did not want it and I said so, at '
              + 'length, in writing, and I have taken it, because the alternative was watching '
              + 'this happen again next winter.',
          },
          {
            speaker: 'Nathanael Greene',
            text:
              'Nobody ever heard of a quartermaster in history. I know that. I have made my peace '
              + 'with it in about the way you would expect.',
          },
        ]
        : [
          {
            speaker: 'Nathanael Greene',
            text:
              'Two thousand of them died on this hill and most of them are in the ground behind '
              + 'you rather than in front of it, because it was the fever and the flux and they '
              + 'went in April when the weather turned.',
          },
          {
            speaker: 'Nathanael Greene',
            text:
              'And the same army will fire a running volley down eleven thousand men this '
              + 'afternoon without the line coming apart anywhere. Both of those are true. I have '
              + 'given up trying to hold them in my head at the same time.',
          },
        ],
  });

  out.push({
    id: 'billy-vf',
    name: 'William Lee',
    spec: BILLY_VF,
    x: V_STREET_E - 2, z: 22, facing: 3,
    hearFlag: 'heard.a5.billy',
    sensitive: true,
    lines: [
      {
        speaker: 'William Lee',
        text:
          'The house is ready when you are. Mrs. Potts&rsquo;s girl has aired the room and the '
          + 'chimney draws, which is more than the marquee ever did.',
      },
      {
        speaker: 'William Lee',
        text:
          'Six hundred huts and every man in this camp built his own. I have watched them do it '
          + 'from December. There is a thing I could say about that and I am not going to say it '
          + 'to you.',
      },
    ],
  });

  /* --- December: the hutting --------------------------------------------- */

  if (state === 'december') {
    out.push({
      id: 'waldo',
      name: 'Dr. Waldo',
      spec: WALDO,
      x: V_RANK_W + 9, z: V_HUT_Z0 + 6, facing: 3,
      hearFlag: 'heard.a5.waldo',
      lines: [
        {
          speaker: 'Dr. Waldo',
          text:
            'I am sick. Discontented, and out of humour. Poor food, hard lodging, cold weather, '
            + 'fatigue, nasty clothes, nasty cookery, and a pox on my bad luck. I write that down '
            + 'most evenings and it does not appear to help.',
        },
        {
          speaker: 'Dr. Waldo',
          text:
            'And then I go along the line in the morning and they bear it &mdash; with a patience '
            + 'I would call heroic if I were writing for anybody but myself, and I am not, so I '
            + 'shall call it heroic anyway.',
        },
        {
          speaker: 'Dr. Waldo',
          text:
            'It is not the cold that will do it, sir. It is that there is no drain in eight acres '
            + 'and eleven thousand men on it. Ask me again in April and I shall tell you how many.',
        },
      ],
      decision: A5_D4_COMMITTEE,
    });

    out.push({
      id: 'hutting-party',
      name: 'A hutting party',
      spec: HUTTING_PRIVATE,
      x: V_RANK_E + 2, z: V_HUT_Z0 + 10, facing: 1,
      hearFlag: 'heard.a5.hutting',
      lines: [
        {
          speaker: 'A man of the hutting party',
          text:
            'Fourteen by sixteen, and we have no nails and one saw between the company. It is done '
            + 'with axes and it is done wrong three times before it is done right.',
        },
        {
          speaker: 'A man of the hutting party',
          text:
            'The wood is green off the hill this morning. It will shrink as it dries and open a '
            + 'gap you can put your hand through, which is what the clay is for, and we shall be '
            + 'daubing that hut again in February and again in March.',
        },
        {
          speaker: 'A man of the hutting party',
          text:
            'Four of us have no shoes. I have rag, which is better than what Willett has, which '
            + 'is nothing. We are not saying it to you as a complaint, sir. It is a fact about the '
            + 'work and you asked.',
        },
      ],
    });

    out.push({
      id: 'martin-vf',
      name: 'Joseph Plumb Martin',
      spec: MARTIN_VF,
      x: V_STREET_W + 3, z: 30, facing: 3,
      hearFlag: 'heard.a5.martin',
      lines: [
        {
          speaker: 'Joseph Plumb Martin',
          text:
            'You will not remember me, sir. Connecticut. I was at Kip&rsquo;s Bay in the corn and '
            + 'I have been at everything since, and I am seventeen now, which I mention because '
            + 'nobody ever believes it.',
        },
        {
          speaker: 'Joseph Plumb Martin',
          text:
            'Fire cake and water. You mix the flour with water on a flat stone and you put the '
            + 'stone in the fire. That is all it is. There is a great deal of talk in the huts '
            + 'about what else a man might do with flour and it comes to nothing, because there '
            + 'is nothing else to put in it.',
        },
        {
          speaker: 'Joseph Plumb Martin',
          text:
            'I intend to write all this down one day, when I am old and it is safe to be funny '
            + 'about it. Not the way the newspapers will. The way it was.',
        },
      ],
    });

    out.push({
      id: 'laundress-vf',
      name: 'A laundress',
      spec: LAUNDRESS,
      x: 28, z: 40, facing: 3,
      hearFlag: 'heard.a5.laundress',
      lines: [
        {
          speaker: 'A laundress',
          text:
            'Half a ration, sir, and a quarter for the child, and I am on the return the same as '
            + 'any man of the Pennsylvania line, which people forget when they are counting who is '
            + 'in this camp.',
        },
        {
          speaker: 'A laundress',
          text:
            'There is no soap on the return this month. There has been no soap on the return since '
            + 'November. I am washing eleven thousand men&rsquo;s shirts in cold water with ashes '
            + 'and it does what you would expect, and then the surgeon wonders at the fever.',
        },
      ],
    });

    out.push({
      id: 'rhode-island',
      name: 'A soldier of the 1st Rhode Island',
      spec: RHODE_ISLANDER,
      x: V_RANK_W + 4, z: V_HUT_Z0 + 19, facing: 3,
      hearFlag: 'heard.a5.rhodeisland',
      sensitive: true,
      lines: [
        {
          speaker: 'A soldier of the 1st Rhode Island',
          text:
            'Second Rhode Island, sir. Has been since &rsquo;76. There are four of us in this '
            + 'company and there have been four of us in this company the whole time, and nobody '
            + 'has ever remarked on it in my hearing.',
        },
        {
          speaker: 'A soldier of the 1st Rhode Island',
          text:
            'There is talk out of Providence that the Assembly will raise a regiment of Black men '
            + 'and Indian men and buy their freedom to do it. In February, they say. I have heard '
            + 'February for a while.',
        },
        {
          speaker: 'A soldier of the 1st Rhode Island',
          text:
            'It will be one regiment. I want that understood, sir, because of how it will be told '
            + 'afterwards. Most of us are where I am standing &mdash; in the company, in the line, '
            + 'four to a company across this whole army. The regiment will be the thing anybody '
            + 'remembers and it will not be where most of us were.',
        },
      ],
    });
  }

  /* --- March: the parade -------------------------------------------------- */

  if (state === 'march') {
    out.push({
      id: 'steuben',
      name: 'Baron von Steuben',
      spec: STEUBEN,
      x: 38, z: V_PARADE_N + 1, facing: 1,
      hearFlag: 'heard.a5.steuben',
      lines: [
        {
          speaker: 'Baron von Steuben',
          text:
            'One hundred men. Not the best hundred &mdash; I asked for a hundred and they sent me '
            + 'a hundred, and that is better, because when it works nobody can say I chose them.',
        },
        {
          speaker: 'Baron von Steuben',
          text:
            'In Prussia I say to the soldier, do this, and he does it. Here I am obliged to say, '
            + 'this is the reason why you ought to do that &mdash; and then he does it. And then, '
            + 'General, he does it BETTER, because he knows what it is for. I did not expect that '
            + 'and it has cost me a great deal of paper.',
        },
        {
          speaker: 'Baron von Steuben',
          text:
            'They come to me with the bayonet used as a spit for roasting. Every one of them. It '
            + 'is a fine spit. It is also the only thing on that musket that works in the rain, '
            + 'and no one has ever told them so.',
        },
      ],
      decision: A5_D3_DRILL,
    });

    out.push({
      id: 'walker',
      name: 'Captain Walker',
      spec: WALKER,
      x: 42, z: V_PARADE_N + 2, facing: 3,
      hearFlag: 'heard.a5.walker',
      lines: [
        {
          speaker: 'Captain Walker',
          text:
            'This morning he ran out of French and German at the Virginians, both at once, and '
            + 'called across the field: come, my friend Walker, and swear for me in English &mdash; '
            + 'these fellows won&rsquo;t do what I bid them.',
        },
        {
          speaker: 'Captain Walker',
          text:
            'So I did, sir. At some length. And they dressed the line, and they have dressed it '
            + 'every morning since, and I am not certain any of us could say precisely which part '
            + 'of that was the instruction.',
        },
      ],
    });

    out.push({
      id: 'hamilton-vf',
      name: 'Alexander Hamilton',
      spec: HAMILTON_VF,
      x: 34, z: V_PARADE_N - 3, facing: 1,
      hearFlag: 'heard.a5.hamilton',
      lines: [
        {
          speaker: 'Alexander Hamilton',
          text:
            'Conway has resigned, sir. In writing, expecting to be asked to reconsider. Congress '
            + 'has accepted it by return of post and I do not believe anyone in York has mentioned '
            + 'it since.',
        },
        {
          speaker: 'Alexander Hamilton',
          text:
            'And there is still not one line of that letter in anybody&rsquo;s hand. Gates has '
            + 'given three accounts of where it went. I have written them out side by side and '
            + 'they do not agree with each other, let alone with him.',
        },
      ],
      decision: A5_D2_CABAL,
    });

    out.push({
      id: 'martin-march',
      name: 'Joseph Plumb Martin',
      spec: MARTIN_VF,
      x: 30, z: V_PARADE_N + 6, facing: 0,
      hearFlag: 'heard.a5.martin_march',
      lines: [
        {
          speaker: 'Joseph Plumb Martin',
          text:
            'He swears at us in three languages and none of them is English, and we are all of us '
            + 'perfectly clear on what he means. It is the funniest thing that has happened on '
            + 'this hill and it is the only thing anybody looks forward to.',
        },
        {
          speaker: 'Joseph Plumb Martin',
          text:
            'And I can load in twelve motions now without thinking about any of them, which I '
            + 'could not do in September, and I have been in this army two years.',
        },
      ],
    });
  }

  /* --- May: the feu de joie ---------------------------------------------- */

  if (state === 'may') {
    out.push({
      id: 'steuben-may',
      name: 'Baron von Steuben',
      spec: STEUBEN,
      x: 36, z: V_PARADE_N - 2, facing: 1,
      hearFlag: 'heard.a5.steuben_may',
      lines: [
        {
          speaker: 'Baron von Steuben',
          text:
            'A running fire, General, from the right of the front line to the left, and back along '
            + 'the second. Eleven thousand men, one after another, and no gaps.',
        },
        {
          speaker: 'Baron von Steuben',
          text:
            'If one man fires early the whole thing is a noise. If nobody fires early it is the '
            + 'finest sound in the world. In December this army could not have done it and I do '
            + 'not say that to praise myself. I say it because you should stand where you can hear '
            + 'the whole of it.',
        },
      ],
    });

    out.push({
      id: 'rhode-island-may',
      name: 'A soldier of the 1st Rhode Island',
      spec: RHODE_ISLANDER,
      x: 46, z: V_PARADE_N + 5, facing: 0,
      hearFlag: 'heard.a5.rhodeisland_may',
      sensitive: true,
      lines: [
        {
          speaker: 'A soldier of the 1st Rhode Island',
          text:
            'The Assembly did it in February, sir. The first regiment is forming at Providence and '
            + 'they are buying men out of slavery to fill it, and paying the owners for it, which '
            + 'is the part nobody will put on the monument.',
        },
        {
          speaker: 'A soldier of the 1st Rhode Island',
          text:
            'I am staying where I am. Second Rhode Island, four to a company, same as before. I '
            + 'have thought about it a good deal and I would rather be counted in the line than in '
            + 'a regiment they can point at.',
        },
      ],
    });

    out.push({
      id: 'laundress-may',
      name: 'A laundress',
      spec: LAUNDRESS,
      x: 26, z: 42, facing: 3,
      hearFlag: 'heard.a5.laundress_may',
      lines: [
        {
          speaker: 'A laundress',
          text:
            'There is soap on the return this month. First time since November. I had begun to '
            + 'think it was a word somebody had made up.',
        },
      ],
    });
  }

  return out;
}

/* ---------------------------------------------------------------------- *
 * Potts's house
 * ---------------------------------------------------------------------- */

export function pottsNpcs(state: Forge): NpcDef[] {
  if (state === 'december') {
    return [
      {
        id: 'hamilton-potts',
        name: 'Alexander Hamilton',
        spec: HAMILTON_VF,
        x: 25, z: 9, facing: 3,
        hearFlag: 'heard.a5.hamilton_potts',
        lines: [
          {
            speaker: 'Alexander Hamilton',
            text:
              'Lord Stirling&rsquo;s letter is on the table, sir, and I have copied it fair. I '
              + 'would ask you to read the citation on it before you read the sentence, and I am '
              + 'aware of how that sounds.',
          },
          {
            speaker: 'Alexander Hamilton',
            text:
              'Wilkinson told McWilliams, over wine, what he says he read in a letter. McWilliams '
              + 'told Stirling. Stirling has told you. Nobody in that chain has the letter and '
              + 'nobody has seen it since.',
          },
          {
            speaker: 'Alexander Hamilton',
            text:
              'I do not say it is false, sir. I say we cannot establish it, and that we are going '
              + 'to have to do something about it anyway, and that those two facts are going to '
              + 'have to sit in the same room together for some months.',
          },
        ],
      },
      {
        id: 'dana',
        name: 'Francis Dana',
        spec: DANA,
        x: 16, z: 8, facing: 1,
        hearFlag: 'heard.a5.dana',
        lines: [
          {
            speaker: 'Francis Dana',
            text:
              'Five of us, sir, appointed by Congress to inquire into the state of this army. We '
              + 'are to stay until we have something to report and I am told that may be some '
              + 'weeks.',
          },
          {
            speaker: 'Francis Dana',
            text:
              'I will be plain with you. There is an opinion at York that the returns from this '
              + 'camp have been drawn up to make a point. I do not hold it. I am obliged to tell '
              + 'you it is held.',
          },
        ],
      },
    ];
  }

  return [
    {
      id: 'conway',
      name: 'General Conway',
      spec: CONWAY,
      x: 16, z: 12, facing: 0,
      hearFlag: 'heard.a5.conway',
      lines: [
        {
          speaker: 'General Conway',
          text:
            'General. I have come as soon as the roads allowed. I wished to present myself in '
            + 'person and to say, before anybody says it for me, that I am entirely and warmly '
            + 'attached to your person and to your command.',
        },
        {
          speaker: 'General Conway',
          text:
            'Whatever has been reported of me &mdash; and I understand something has been '
            + 'reported &mdash; has been reported by men who were not present at the writing of it '
            + 'and who cannot produce it. I say that with perfect confidence.',
        },
        {
          speaker: 'General Conway',
          text:
            'I am, as you know, appointed Inspector General by the Congress. I did not seek it. I '
            + 'shall of course exercise it entirely under your direction, and I am obliged to '
            + 'observe that the commission does not in terms require me to.',
        },
      ],
    },
    {
      id: 'hamilton-potts-m',
      name: 'Alexander Hamilton',
      spec: HAMILTON_VF,
      x: 25, z: 9, facing: 3,
      hearFlag: 'heard.a5.hamilton_potts_m',
      lines: [
        {
          speaker: 'Alexander Hamilton',
          text:
            'He was warm, sir, and he was fluent, and every word of it was consistent with having '
            + 'written the sentence and consistent with not having written it. That is the '
            + 'difficulty and it is going to remain the difficulty.',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * The hospital hut
 * ---------------------------------------------------------------------- */

export function hospitalNpcs(): NpcDef[] {
  return [
    {
      id: 'cochran',
      name: 'Dr. Cochran',
      spec: COCHRAN,
      x: 11, z: 7, facing: 1,
      hearFlag: 'heard.a5.cochran',
      lines: [
        {
          speaker: 'Dr. Cochran',
          text:
            'Twelve in this one, sir. Four with the camp fever, five with the flux, two I cannot '
            + 'name, and Harrow in the top berth has the smallpox and came in yesterday.',
        },
        {
          speaker: 'Dr. Cochran',
          text:
            'That is the one that ends this camp if it gets out of this hut. The fever and the '
            + 'flux will kill more men than the pox will &mdash; I want you clear on that, because '
            + 'what I am about to ask you for does nothing at all about either of them.',
        },
        {
          speaker: 'Dr. Cochran',
          text:
            'Taken naturally it kills between one man in five and one in three. Given on purpose, '
            + 'into a cut in the arm, in a man who is otherwise well and rested: about one in '
            + 'seventy. Those are the numbers. They are not mine, they are Boston&rsquo;s, and '
            + 'they have been public for fifty years.',
        },
      ],
      decision: A5_D1_POX,
    },
    {
      id: 'sick-harrow',
      name: 'Private Harrow',
      spec: SICK_MAN,
      x: 6, z: 12, facing: 1,
      hearFlag: 'heard.a5.harrow',
      sensitive: true,
      lines: [
        {
          speaker: 'A sick man',
          text:
            'Harrow, sir. Second New Jersey. They have put me at the top because the doctor says '
            + 'the air is better up there and I think he says it to be kind.',
        },
        {
          speaker: 'A sick man',
          text:
            'There is a letter under the straw for my mother at Elizabethtown. I have got as far '
            + 'as the second line of it twice. The surgeon has said he will finish it and I have '
            + 'told him he need not and we have both let that stand.',
        },
      ],
    },
  ];
}
