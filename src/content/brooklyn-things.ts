/**
 * What there is to look at at Brooklyn.
 *
 * R3: every place carries at least one examinable object whose text
 * contradicts something a person there says, with neither marked as true.
 * There are two on the line and they are the two halves of the campaign —
 * Stirling on the works against the works themselves, and Sullivan on the
 * Jamaica Pass against the order that put five men on it.
 *
 * And `DOC-A3.2` sits here doing something nothing else in the game does:
 * it is WRONG, it is not marked wrong, and a player who acts on it at the
 * map table pays for it on the manifest.
 */

import type { Interactable } from '../types';
import type { Ferry } from './brooklyn';
import { CAMP_N, HOUSE_Z, REVET, SHORE, STEP_N, WALK_N } from './brooklyn';

/* ---------------------------------------------------------------------- *
 * The line
 * ---------------------------------------------------------------------- */

export function lineThings(): Interactable[] {
  return [
    {
      id: 'the-works',
      label: 'the works',
      x: 38, z: WALK_N,
      examine:
        'A mile and a half of it, from the Gowanus creek to the Wallabout, with a ditch, a '
        + 'parapet, a firing step and abatis all along the front. It is the best thing this army '
        + 'has ever built and it took six weeks.',
      grants: 'obs.a3.works',
      contradicts: {
        heard: 'heard.a3.stirling',
        line:
          'Stirling has just told you the line is good line and that what he has not got is '
          + 'enough of it. Stand on the right-hand end of it and look east: the works stop, and '
          + 'the country goes on for four miles, and there is nothing in those four miles but a '
          + 'cart track and five men on horses.',
        grants: 'obs.a3.works_contradiction',
        note: 'Stirling says the line is good — the end of it is the problem, not the middle',
      },
    },
    {
      id: 'spade',
      label: 'a spade, left in the parapet',
      x: 30, z: STEP_N + 1,
      examine:
        'Driven into the bank with the handle out, where the last man to use it left it. You have '
        + 'written that you have never spared the spade and pick-axe, and it is true, and it is '
        + 'the one part of soldiering you learned as a boy running a chain over other people&rsquo;s '
        + 'land.',
      grants: 'obs.a3.spade',
    },
    {
      id: 'abatis-bk',
      label: 'the abatis',
      x: 46, z: REVET - 1,
      examine:
        'Felled trees the whole length of the front with the branch-points sharpened and turned '
        + 'outward, tangled together so that no man gets through it at a run. Behind it a ditch, '
        + 'and behind that six feet of earth.',
      grants: 'obs.a3.abatis',
    },
    {
      id: 'jamaica-road',
      label: 'the road going east',
      x: 62, z: STEP_N + 1,
      examine:
        'From the right-hand end of the works you can see it for two miles: a cart track through '
        + 'a wood, running away east past the end of everything you have built. It is called the '
        + 'Jamaica road and it is four miles beyond your last gun.',
      grants: 'obs.a3.jamaica',
      document: 'DOC-A3.3',
      contradicts: {
        heard: 'heard.a3.sullivan',
        line:
          'Sullivan has just told you all the passes are watched and covered. The order in your '
          + 'hand posts five officers of militia horse on that road, with no infantry, no relief '
          + 'through the night, and no instruction as to what they are to do if they see anything.',
        grants: 'obs.a3.jamaica_contradiction',
        note: 'Sullivan says every pass is covered — the order shows what "covered" means',
      },
    },
    {
      id: 'enemy-report',
      label: 'a report from the outposts',
      x: 40, z: STEP_N,
      examine:
        'Brought in this morning by an officer of the guard, from a countryman who came through '
        + 'the lines. It says where the enemy&rsquo;s main body is and what it means to do, and it '
        + 'is signed by nobody in particular.',
      document: 'DOC-A3.2',
    },
    {
      id: 'congress-ny',
      label: 'the resolution of Congress',
      x: 36, z: 13,
      examine:
        'Nailed to the drum-head with the day&rsquo;s orders. Congress has resolved that this '
        + 'city be by no means abandoned, which is a thing a resolution can say and an army cannot '
        + 'do without a fleet.',
      document: 'DOC-A3.1',
    },
    {
      id: 'tide-table',
      label: 'the Gowanus tide table',
      x: 34, z: 12,
      examine:
        'In a clerk&rsquo;s hand, for the fortnight. High water, low water, and the set of the '
        + 'ebb. Everything on this island that matters &mdash; the creek, the mill dam, the '
        + 'ferry &mdash; is a different problem twice a day, and it is written on this sheet.',
      grants: 'obs.a3.tide',
    },
    {
      id: 'fort-putnam',
      label: 'the star fort',
      x: 45, z: 16,
      examine:
        'Four points, a ditch, and a magazine dug into the middle of it, and the men who built it '
        + 'had no engineer worth the name. It is not sited badly. It is sited perfectly for an '
        + 'attack that is not coming.',
      grants: 'obs.a3.fort',
    },
    {
      id: 'salt-beef',
      label: 'a barrel of salt beef',
      x: 28, z: 18,
      examine:
        'Condemned by the commissary and marked, and still standing in the yard because there is '
        + 'nothing to put in its place. Half this army has been on bad meat for a fortnight and '
        + 'the hospital is fuller than the guardhouse.',
      grants: 'obs.a3.beef',
    },
    {
      id: 'maryland-colour',
      label: 'a regimental colour',
      x: 24, z: CAMP_N + 1,
      examine:
        'Smallwood&rsquo;s: scarlet, with the Maryland arms in the corner, and the silk is new '
        + 'because the colony bought it this spring. It is the only new thing on this island.',
      grants: 'obs.a3.colour',
    },
    {
      id: 'loyalist-letter',
      label: 'an intercepted letter',
      x: 58, z: CAMP_N + 2,
      examine:
        'From a Kings County farmer to his brother behind the British lines, taken off a boy on '
        + 'the Flatbush road. It is about hay, and about a cow, and about how much longer this '
        + 'will go on, and it names three of your outposts by their exact strength.',
      grants: 'obs.a3.loyalist',
    },
    {
      id: 'gowanus-mill',
      label: 'the mill dam',
      x: 12, z: 22,
      examine:
        'Eight feet wide, planked, over a creek that is forty yards of tidal mud at low water and '
        + 'over a man&rsquo;s head at high. It is the only dry way off the marsh, and at the far '
        + 'end of it there is a stone house with windows on all four sides.',
      grants: 'obs.a3.mill_dam',
    },
    {
      id: 'stone-house',
      label: 'the Old Stone House',
      x: 11, z: 25,
      examine:
        'Dutch, low, and built like a bank. Whoever holds it holds the mill dam and therefore '
        + 'holds the only road off the Gowanus marsh, and at this moment there is nobody in it at '
        + 'all.',
      grants: 'obs.a3.stone_house',
    },
    {
      id: 'cordgrass',
      label: 'the cordgrass',
      x: 6, z: 18,
      examine:
        'Waist high, standing in salt water, and it goes on for four hundred yards. A man in it '
        + 'cannot see, cannot be seen, cannot run and cannot hold a musket out of the wet. This '
        + 'is where the left of the line ends.',
      grants: 'obs.a3.cordgrass',
    },
    {
      id: 'shells',
      label: 'a heap of oyster shells',
      x: 11, z: 25,
      examine:
        'Waist high and forty feet long, and it was here before any Dutchman was. The Canarsee '
        + 'ate off this bank for a very long time and left the count of it, and now a war is '
        + 'being fought across the top.',
      grants: 'obs.a3.shells',
    },
    {
      id: 'drum-map',
      label: 'a map on a drum head',
      x: 38, z: 12,
      examine:
        'The Narrows, the East River, the line, and the fleet, drawn on a sheet weighted down on '
        + 'a drum with a stone. Everything anybody knows about this position is on it, which is '
        + 'not enough, and the wind arrow in the corner is the most important thing on the page.',
      grants: 'obs.a3.map',
      opens: 'wind',
    },
    {
      id: 'the-fleet',
      label: 'the fleet, out past the Narrows',
      x: 20, z: WALK_N,
      examine:
        'Four hundred sail at anchor off Staten Island, which is more ships than have ever been '
        + 'sent out of Britain at once. Thirty-two thousand men came off them at Gravesend in four '
        + 'hours, unopposed, and formed on the beach in the sunshine.',
      grants: 'obs.a3.fleet',
    },
    {
      id: 'walk-line',
      label: 'the end of the works',
      x: 74, z: STEP_N + 2,
      examine:
        'The last gabion, the last yard of ditch, and then a hedge, and then a field of standing '
        + 'corn going away east. Somebody has driven a stake in to mark where the line stops. It '
        + 'is the most honest object on this island.',
      grants: 'obs.a3.line_walked',
    },
  ];
}

/* ---------------------------------------------------------------------- *
 * The ferry
 * ---------------------------------------------------------------------- */

export function ferryThings(state: Ferry): Interactable[] {
  const night = state === 'night';
  const common: Interactable[] = [
    {
      id: 'the-river',
      label: 'the East River',
      x: 34, z: SHORE - 1,
      examine:
        'A mile across, tidal, and it runs like a millrace on the ebb. On the far side is the '
        + 'city you were ordered to hold. Between them, at this moment, there is nothing whatever '
        + 'of yours that floats.',
      grants: 'obs.a3.river',
    },
    {
      id: 'the-stage',
      label: 'the landing stage',
      x: 34, z: SHORE - 2,
      examine:
        'Plank on piles, out over the flat, because at low water the shore here is forty yards of '
        + 'mud. Two boats can lie against it at once. Two.',
      grants: 'obs.a3.stage',
    },
    {
      id: 'distillery',
      label: "Livingston's distillery",
      x: 58, z: SHORE + 18,
      examine:
        'Philip Livingston&rsquo;s, who signed the Declaration seven weeks ago and is in '
        + 'Philadelphia. The house on the bluff is his too. He will lose both of them inside two '
        + 'months and never get either back, and he will die at York in 1778 still sitting in '
        + 'Congress.',
      grants: 'obs.a3.livingston',
    },
    {
      id: 'the-flats',
      label: 'the flats',
      x: 44, z: SHORE - 1,
      examine:
        'At low water the shore here is forty yards of mud and a boat that grounds on it stays '
        + 'grounded until the tide makes again. High water is about eleven tonight, and after '
        + 'that the ebb runs until near four.',
      grants: 'obs.a3.flats',
    },
    {
      id: 'the-ropewalk',
      label: 'the ropewalk',
      x: 12, z: SHORE + 18,
      examine:
        'Three hundred feet of shed with a footway down the middle where men walk backwards '
        + 'spinning hemp. Every boat on this river is held together by something made in a shed '
        + 'like this one, and nobody has ever drawn a picture of it.',
      grants: 'obs.a3.ropewalk',
    },
    {
      id: 'ferry-house',
      label: 'the ferry house',
      x: 24, z: SHORE + 16,
      examine:
        'There has been a ferry off this beach since 1642 and a house on it nearly as long. The '
        + 'ferrymen know this water better than any officer in the army and nobody has asked them '
        + 'anything until this week.',
    },
  ];

  if (!night) {
    return [
      ...common,
      {
        id: 'the-rain',
        label: 'the weather',
        x: 30, z: 24,
        examine:
          'Three days of north-east wind and rain coming sideways off the water. Not a musket on '
          + 'that line will fire tonight. It is also the only reason their fleet has not come up '
          + 'this river and cut the whole army off the island.',
        grants: 'obs.a3.weather',
      },
      {
        id: 'boat-return',
        label: 'the return of boats',
        x: 28, z: SHORE + 6,
        examine:
          'Every craft on this side of the river, listed by kind and by what it will carry. '
          + 'Sloops, periaugers, flat-bottomed bateaux, whaleboats, and a good deal of guessing. '
          + 'Add the column up and it is not nine thousand.',
        document: 'DOC-A3.4',
      },
      {
        id: 'murray-story',
        label: 'a story going round the camp',
        x: 24, z: SHORE + 8,
        examine:
          'A tale somebody heard from somebody about a lady at Inclenberg, cake, wine, and two '
          + 'hours of General Howe&rsquo;s afternoon. It is a good story and it is being told '
          + 'well, which is not the same as it being true.',
        document: 'DOC-A3.5',
      },
      {
        id: 'arnold-dispatch',
        label: 'a dispatch from the north',
        x: 46, z: SHORE + 7,
        examine:
          'Four hundred miles away, on Lake Champlain, a man with no ships has built ships out of '
          + 'standing timber and taken a British fleet on with them. The name at the bottom is '
          + 'Arnold and this is the most enterprising officer in the service.',
        document: 'DOC-A3.6',
      },
      {
        id: 'the-bluff',
        label: 'the Heights, from below',
        x: 40, z: 26,
        examine:
          'A hundred feet of bluff with the guns on top of it, and every one of them reaches every '
          + 'street in New York. It is why this position is worth holding and it is why holding it '
          + 'has put the army on the wrong side of a river.',
        grants: 'obs.a3.bluff',
      },
      {
        id: 'four-chimneys',
        label: 'the house on the bluff',
        x: 46, z: HOUSE_Z + 8,
        examine:
          'Four chimneys, which is the name of it. Livingston built it looking at the river and '
          + 'nine general officers are in the parlour of it at this moment, waiting for the man '
          + 'who has to close the discussion.',
        grants: 'obs.a3.four_chimneys',
      },
    ];
  }

  return [
    ...common,
    {
      id: 'the-manifest',
      label: 'the manifest',
      x: 30, z: SHORE + 3,
      examine:
        'A sheet on a barrel head with a stone on it, and a man beside it with a pencil. What has '
        + 'gone, in what order, in which boat. Everything on this sheet is across the river. '
        + 'Everything not on it is still on this island.',
      document: 'DOC-A3.4',
      grants: 'obs.a3.manifest_read',
    },
    {
      id: 'muffled-oars',
      label: 'the oarlocks',
      x: 26, z: SHORE + 2,
      examine:
        'Every one of them wrapped in rag and every rag soaked so it will not creak. Somebody '
        + 'thought of that, and whoever it was is the reason six hundred yards away there is a '
        + 'British sentry who has heard nothing all night.',
      grants: 'obs.a3.oars',
    },
    {
      id: 'spiked-gun',
      label: 'a gun, spiked',
      x: 60, z: SHORE + 7,
      examine:
        'A nail driven into the vent and snapped off flush, which takes ten seconds and makes '
        + 'eight hundredweight of iron into eight hundredweight of iron. It will not fit in a '
        + 'boat. Four men carried it up that hill in July.',
      grants: 'obs.a3.spiked',
    },
    {
      id: 'the-wind',
      label: 'the wind',
      x: 34, z: SHORE - 4,
      examine:
        'North-east, and it has not shifted since Tuesday. While it holds, no ship of theirs can '
        + 'beat up this river, and the whole army is inside a door the weather is holding shut. '
        + 'Nobody in this game gets to take credit for it.',
      grants: 'obs.a3.wind',
    },
    {
      id: 'the-fog',
      label: 'the fog',
      x: 40, z: SHORE - 3,
      examine:
        'It came down at first light on the Long Island shore and did not come down on the New '
        + 'York shore, which is a thing fog does about once a decade. The last boats crossed in '
        + 'daylight and were not seen. There is no explanation and the game will not invent one.',
      grants: 'obs.a3.fog',
      contradicts: {
        heard: 'heard.a3.glover_night',
        line:
          'Glover told you an hour ago that if the wind came round before the last of them were '
          + 'off, the rest were taken. The wind did not come round. Then the fog came down on one '
          + 'shore and not the other. Neither of those was anybody&rsquo;s doing, and both of them '
          + 'are the reason there is still an army.',
        grants: 'obs.a3.luck',
        note: 'Glover said it turned on the wind — and then on the fog, and neither was yours',
      },
    },
    {
      id: 'the-kit',
      label: 'what was left on the shore',
      x: 44, z: SHORE + 6,
      examine:
        'Knapsacks, blankets, camp kettles and a good deal of somebody&rsquo;s bedding, in heaps '
        + 'where the regiments were told to drop them. A man carries a musket into a boat and '
        + 'nothing else, and everything else is a present to the enemy.',
      grants: 'obs.a3.left_behind',
    },
    {
      id: 'the-horses',
      label: 'the horses',
      x: 65, z: SHORE + 10,
      examine:
        'The general&rsquo;s and the field officers&rsquo; go. Every other horse on this island '
        + 'stays, and the men who have looked after them all summer are standing about not '
        + 'looking at them.',
    },
    {
      id: 'hancock-letter',
      label: 'a letter begun',
      x: 50, z: SHORE + 9,
      examine:
        'Started at two in the morning on a barrel head and not finished. It is to Hancock, it is '
        + 'in your own hand, and the first line of it says that our situation at this time is '
        + 'truly distressing.',
      document: 'DOC-A3.7',
    },
  ];
}
