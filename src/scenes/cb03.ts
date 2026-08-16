/**
 * CB-03 — the lines above Charlestown, November 1775.
 *
 * A2-S3 in docs/05-act-scene-inventory.md. Exterior, so it uses the machinery
 * already built; the other exit from the camp street is CB-02, the Vassall
 * House parlour, which is an interior and wants a plate system that does not
 * exist yet.
 *
 * The scene is scouting and arithmetic. Washington spent that autumn looking at
 * Boston through a glass and looking at his own returns, and the two views were
 * the same problem from opposite ends: he could see exactly what he was facing
 * and could not count what he had to face it with.
 *
 * VERIFY BEFORE CLASSROOM USE
 * ---------------------------
 * V-A2.1 · Amos Doolittle. Documented: New Haven engraver, member of the
 *   Governor's Second Company of Guards, marched to Cambridge after Lexington in
 *   April 1775, visited the Lexington and Concord ground with Ralph Earl, and
 *   published four engravings advertised in December 1775 — the only
 *   contemporary images of the battles. NOT documented: that he was on the lines
 *   in November. He is written here as having come back up with proofs to show,
 *   which is a compression. Either date it, cut him, or find the evidence.
 *
 * V-A2.2 · The strength return is deliberately absent rather than invented.
 *   Every other scene shows a sourced return; no November 1775 figure is quoted
 *   here because none has been checked. The line in `noStrength` is doing the
 *   teaching instead, and it is true on its own terms: the returns genuinely did
 *   not agree, and Washington complained about it for eight years. If a sourced
 *   November return is found, it belongs here.
 *
 * V-A2.3 · Connecticut enlistments. The Connecticut regiments' terms ran out in
 *   early December 1775 and a large part of them went home, over the appeals of
 *   Washington and their own officers. Sergeant Starr is invented; the situation
 *   he is in is not.
 */

import type { Ambient, Business, Interactable, NpcThread, Scene, Task } from '../types';

const PRESCOTT = { portraitSeed: 707, coat: '#5A5A48' };
const DOOLITTLE = { portraitSeed: 818, coat: '#7C6B52' };
const STARR = { portraitSeed: 929, coat: '#8A7F66' };

export const CB03: Scene = {
  id: 'CB-03',
  act: 2,
  title: 'The lines above Charlestown',
  subtitle: 'November 1775',

  /**
   * Act 2's share of the whole: the army has to still be there in the spring.
   * On this parapet that is not a metaphor — most of the men standing on it
   * have a date in December after which they are legally at liberty to walk
   * home, and a great many of them did.
   */
  purpose: 'Hold the line with an army whose time runs out in December.',
  plates: 'lines',
  // Low November sun, well round to the south-west and weak with it.
  sun: [0.72, 0.20],
  exitTo: undefined,
  exitPrompt: 'Back down the trench?',
  /*
   * Walking out of here ends Act 2, and the reckoning is what an act break is
   * FOR: the world's unit of accounting, the save point, and the end of a class
   * period, all the same moment.
   *
   * A STAND-IN. `08` §6 Beat 3 puts the act's close at CB-03′, 1 January — the
   * same parapet walked again with most of the figures gone — and that is where
   * this flag belongs. CB-03′ is not built, so the act ends here, in November,
   * on a page dated the first of January. It reads as a page written later
   * about the winter, which is survivable; it is not what was designed. Move
   * the flag the day Beat 3 exists.
   */
  endsAct: 2,

  /** See V-A2.2 above. No number is quoted because none has been sourced. */
  strength: null as { fit: number; onRolls: number; dated: string } | null,
  noStrength: 'No return this week. Four regiments cannot say what they have.',

  /*
   * The earth bank is the back wall of this scene.
   *
   * linesMidground paints it as a solid mass across the entire width, with its
   * nearest point at z 0.618 — so anyone who walked past that was drawn behind
   * the whole plate and vanished. Washington disappeared entirely if you held
   * ArrowUp on the parapet, which is what the depth report was about.
   *
   * The ground the player has is the firing step in front of the bank. That is
   * also what the scene IS: you walk the works, you do not wander the forward
   * slope down to the water in November within sight of the British lines.
   */
  walkTo: 0.588,

  /*
   * The clock, with a date and no headcount.
   *
   * The date is documented and the count is not — see V-A2.3. So the counter
   * says what is true (the terms run out, and it is most of this army) and does
   * not invent the figure that would make it hit harder. If a sourced November
   * return is found, `count` goes here and nowhere else.
   */
  expiring: { date: '31 December', who: 'most of this army' },

  where: 'The works above Charlestown, before Boston',
  when: 'November 1775',

  /*
   * Four months on, and the problem has changed shape.
   *
   * The siege holds — nobody has broken it in either direction — but a siege is
   * only as long as the men holding it, and the paper they signed runs out in
   * December. Knox has gone to Ticonderoga for the guns and nobody knows
   * whether he will get them over the mountains. This scene is Washington doing
   * the two things he could do that autumn: look at the enemy, and count.
   */
  situation: [
    'The siege has held since July. Nobody has broken out and nobody has broken in. British ' +
      'ships still feed the town, so surrounding it has changed nothing.',
    'Henry Knox has gone west to Ticonderoga to fetch the captured guns — 300 miles over the ' +
      'mountains, in winter. Nobody knows whether he can do it.',
    'And in December the contracts end. These men signed up for eight months. When the eight ' +
      'months are up they can legally walk home, and it is not desertion. It is the deal.',
  ],
  objectives: [
    'Use the spyglass. Name all seven British positions across the water.',
    'Give Sergeant Starr an answer. 1,100 men are waiting on the same one.',
    'Get the trenches ready before winter.',
  ],

  arrival: [
    'A Prospect of Boston from the Lines above Charlestown, November 1775.',
    'Down from the parlour to the works, where the paperwork turns back into ground. ' +
      'Half a mile of earth thrown up by men who were not paid to dig, and beyond it a ' +
      'mile of water you cannot cross.',
    'On the far shore, the only thing in this country that already looks like an army.',
  ],

  opening: [
    'The works run along the crown of the hill for half a mile, and every yard of them was dug ' +
      'by men who were not paid to dig.',
    'Boston is a mile off across the water, close enough to count windows and far enough that ' +
      'you can do nothing whatever about them.',
  ],

  business: [
    { decision: 'A2-D4', pending: 'Sergeant Starr is waiting to hear whether his time is his own' },
  ] as Business[],

  exit: 'trench_back',
  settled: 'The glass is down and the works are as good as they will be this month.',

  ambient: [
    {
      id: 'amb.glass',
      x: 0.80, z: 0.24, r: 0.11, minLoudness: 0.30,
      variants: {
        duty: 'You can see everything they have. Seeing it and reaching it are different trades.',
        ambition: 'Seven positions, and the ice will carry men to four of them by January.',
        restraint: 'Count them again in a week. What you can see from here changes with the weather, and so does what it means.',
      },
    },
    {
      id: 'amb.graves',
      x: 0.14, z: 0.62, r: 0.11, minLoudness: 0.34,
      variants: {
        restraint: 'Not one of those men was shot. The camp did it, and the camp is yours to order.',
        duty: 'Their names are in a return you signed. That is the only place they are written down.',
        temper: 'Camp fever, and a commissary who has never once been asked to explain himself.',
      },
    },
    {
      id: 'amb.december',
      x: 0.48, z: 0.34, r: 0.11, minLoudness: 0.32,
      variants: {
        temper: 'They will go home in December because a piece of paper says they may. Paper.',
        duty: 'They signed for eight months and they have served eight months. The paper is the whole quarrel.',
        ambition: 'Six weeks. Whatever this army is going to do, it does it before the tenth or not at all.',
        restraint: 'Every man who goes tells a county what this was like. Mind what you send home with them.',
      },
    },
    {
      id: 'amb.charlestown',
      x: 0.63, z: 0.16, r: 0.10, minLoudness: 0.30,
      variants: {
        ambition: 'They burned a town to take a hill. Let the country see it and count the cost for you.',
        vanity: 'Every account of this war will begin with that hill. You were not on it.',
        temper: 'Howe watched it burn from a boat and called it a regrettable necessity.',
      },
    },
    {
      id: 'amb.works',
      x: 0.30, z: 0.30, r: 0.10, minLoudness: 0.36,
      variants: {
        vanity: 'Every officer who rides up here writes home about the works. Let them find them good.',
        duty: 'You have never spared the spade. It is the one thing you have always been able to give them.',
        restraint: 'Works are for holding ground you mean to leave. Do not fall in love with them.',
      },
    },
  ] as Ambient[],

  allTasksFlag: 'obs.a2.lines_in_order',

  tasks: [
    {
      id: 't3.walk',
      label: 'walk the parapet',
      x: 0.93, z: 0.60,
      done:
        'Half a mile of it, and you put your hand on the earth every dozen yards. It is well made ' +
        'where a man from a farm made it and badly made where a man from a counting-house did, and ' +
        'you can tell which is which without asking.',
      grants: 'task.a2.parapet',
      note: 'Walked the parapet end to end',
      prop: 'musket',
    },
    {
      id: 't3.gabions',
      label: 'set the gabions right',
      x: 0.37, z: 0.24,
      done:
        'They have been filling them with loose earth and no stones, which will stop nothing and ' +
        'settle by Friday. You show two men how it is done and they show the rest, which is how ' +
        'anything in this army has ever been taught.',
      grants: 'task.a2.gabions',
      note: 'Showed the working party how a gabion is filled',
      prop: 'barrel',
    },
    {
      id: 't3.passes',
      label: 'sign the furlough passes',
      x: 0.55, z: 0.15,
      done:
        'Nine men, nine reasons, and every one of them true. You sign all nine and think about the ' +
        'ones who will not come back, and then about the ones who will, and you cannot decide ' +
        'which thought is worse.',
      grants: 'task.a2.passes',
      note: 'Signed nine furlough passes',
      prop: 'table',
      requires: 'heard.a2.starr',
      requiresNote: 'you have not spoken to Sergeant Starr yet',
    },
  ] as Task[],

  interactables: [
    {
      /*
       * The instrument the scene is built around.
       *
       * Seven bearings, each named once. This is the only place in the game
       * where knowledge is gathered by looking rather than by reading a
       * document or being told by a person, which is exactly what scouting is —
       * and every one of the seven is a thing a student can be shown on a map
       * afterwards.
       */
      id: 'spyglass',
      label: 'the spyglass',
      x: 0.80,
      z: 0.24,
      examine: 'A good glass on a rest, pointed at a town you cannot enter.',
      survey: [
        {
          id: 'charlestown',
          at: 0.14,
          y: 0.35,
          bearing: 'directly across the water',
          name: 'the ground they hold at Charlestown',
          text:
            'What is left of the town they burned on the seventeenth of June to clear their way ' +
            'up the hill — and they hold every foot of it. Red coats posted where the streets ran, ' +
            'sentries where the houses stood. They took this ground once, at a price, and they ' +
            'mean to keep it.',
          grants: 'map.a2.charlestown',
        },
        {
          id: 'bunker',
          at: 0.11,
          y: 0.24,
          bearing: 'the high ground behind it',
          name: "the regiments on Bunker's Hill",
          text:
            'Theirs now, and dug in properly — whole regiments behind earth, drilled men who ' +
            'load and fire on the word and have already stood their ground once without breaking. ' +
            'They paid a thousand men for that hill in June and do not intend to pay for it twice.',
          grants: 'map.a2.bunker',
        },
        {
          id: 'copps',
          at: 0.52,
          y: 0.31,
          bearing: 'the north point of the town',
          name: "the battery on Copp's Hill",
          text:
            'The guns that fired on Charlestown while it burned, still laid and still manned. ' +
            'Count them: that is more artillery in one work than the whole of your line has the ' +
            'powder to answer — and it reaches this hill more easily than this hill reaches it.',
          grants: 'map.a2.copps',
        },
        {
          id: 'north_church',
          at: 0.44,
          y: 0.21,
          bearing: 'the tallest spire in the north end',
          name: 'their lookout in Christ Church',
          text:
            'Two lanterns hung in that steeple in April and the whole country turned out. There ' +
            'is a man at the top of it now with a glass of his own, watching you dig exactly as ' +
            'you are watching him — and the men who hung the lanterns are inside his lines.',
          grants: 'map.a2.north_church',
        },
        {
          id: 'beacon',
          at: 0.60,
          y: 0.27,
          bearing: 'the hill above the town',
          name: 'the height they hold at Beacon Hill',
          text:
            'The mast the town is named for, and the hill under it is theirs. From up there a man ' +
            'sees every work on this side at once — so take it that every spadeful you order dug ' +
            'was counted by someone before the earth was turned.',
          grants: 'map.a2.beacon',
        },
        {
          id: 'ferry',
          at: 0.26,
          y: 0.41,
          bearing: 'the near shore, below the ruins',
          name: 'the landing at the ferry ways',
          text:
            'A hundred yards of shingle where the boats came over in June — and where the next ' +
            'regiments come over the day the fleet decides to send them. This is the ground that ' +
            'decides whether you are besieging them or waiting on them.',
          grants: 'map.a2.ferry',
        },
        {
          id: 'shipping',
          at: 0.80,
          y: 0.43,
          bearing: 'the anchorage beyond',
          name: 'the fleet in the stream',
          text:
            'Ships of the line with their yards crossed, which is how a besieged town gets fed ' +
            'and how fresh regiments come ashore dry. Until someone can shut that water their army ' +
            'can be made larger any week they choose — while yours goes home in December.',
          grants: 'map.a2.shipping',
        },
      ],
    },
    {
      id: 'gabion',
      label: 'a gabion, half filled',
      x: 0.30, z: 0.34,
      examine:
        'A wicker basket the height of a man, stood on end and filled with earth. Twenty of them ' +
        'set side by side is a wall, and any farmer who has made a hurdle can make one.',
      grants: 'obs.a2.gabion',
      prop: 'barrel',
    },
    {
      id: 'fascine',
      label: 'a bundle of fascines',
      x: 0.42, z: 0.44,
      examine:
        'Brushwood bound in six-foot lengths, for lining a ditch or filling one. The whole science ' +
        'of a field work is sticks, baskets and dirt, and it has not changed in two hundred years.',
      prop: 'chest',
    },
    {
      id: 'graves',
      label: 'the graves on the reverse slope',
      x: 0.14, z: 0.62,
      examine:
        'Eleven of them, named on boards, and not one of them shot. Camp fever and the bloody flux ' +
        'have taken more of this army in five months than the King has, and both of them come from ' +
        'the state of the camp, which is your business and nobody else’s.',
      grants: 'obs.a2.graves',
    },
    {
      id: 'deserter_coat',
      label: "a deserter's coat",
      x: 0.66, z: 0.55,
      examine:
        'Regimental red with buff facings, taken off a man who swam the Charles at night and asked ' +
        'for bread. He says there are more who would come. He also says their bread is better than ' +
        'yours, which you believe.',
      grants: 'obs.a2.deserter',
      prop: 'uniform',
    },
    {
      id: 'rum',
      label: 'the day’s rum',
      x: 0.50, z: 0.60,
      examine:
        'A gill a man, measured out where everyone can see it measured. It is the only part of the ' +
        'ration nobody has ever complained was short, because it is the only part anybody watches ' +
        'being issued.',
      grants: 'obs.a2.rum',
      prop: 'bucket',
    },
    {
      id: 'letter_home',
      label: 'an unfinished letter',
      x: 0.24, z: 0.48,
      examine:
        '"Dear Mother, we are all in health except" — and there it stops, in the middle of the line, ' +
        'and the ink has been dry a fortnight. Somebody folded it and put it under a stone and did ' +
        'not come back for it.',
      grants: 'doc.a2.letter_home',
      prop: 'papers',
    },
    {
      /*
       * The four plates.
       *
       * The teaching payload of the scene, and it is about evidence rather than
       * about battle: these engravings are the only contemporary images of
       * Lexington and Concord that exist. Everything else a student has ever
       * seen of that morning was painted later by somebody who was not there.
       */
      id: 'doolittle_plates',
      label: 'four engraved plates',
      x: 0.58, z: 0.34,
      examine:
        'Lexington green, the North Bridge, and the retreat, in four sheets. They are stiff and the ' +
        'figures are wooden and they are the only pictures of that morning made by anyone who went ' +
        'and looked. Every other one you will ever see was painted afterwards by a man who was not ' +
        'there.',
      grants: 'doc.a2.doolittle',
      prop: 'papers',
      contradicts: {
        heard: 'heard.a2.prescott',
        line:
          'Prescott has just told you the country turned out of its own accord, needing no ' +
          'telling. The third plate shows the militia forming by companies with their officers in ' +
          'front of them. Somebody had told them, and somebody had drilled them, for years.',
        grants: 'obs.a2.plates_contradiction',
        note: 'Prescott says the country rose of itself — the plates show trained companies',
      },
    },
    {
      id: 'enlistment_roll',
      label: 'the enlistment roll',
      x: 0.48, z: 0.34,
      examine:
        'Every man on this hill, and against each name a date. Most of the dates are in December. ' +
        'It is not a mutiny and it is not desertion — it is the paper they signed, and it is going ' +
        'to take your army away from you legally and on schedule.',
      grants: 'obs.a2.enlistment_roll',
      prop: 'papers',
    },
    {
      id: 'parapet',
      label: 'the parapet',
      x: 0.22, z: 0.20,
      examine:
        'Six feet of earth against the sky and a firing step cut into the back of it. It was thrown ' +
        'up in a fortnight by men who had never seen a fortification, and it is better than it has ' +
        'any right to be.',
    },
    {
      id: 'abatis',
      label: 'the abatis',
      x: 0.88, z: 0.44,
      examine:
        'Felled trees laid with their sharpened branches outward, the whole length of the slope. ' +
        'Ugly, cheap, and worth more than any number of muskets to men who cannot be relied on to ' +
        'stand.',
    },
    {
      id: 'boston_across',
      label: 'the town across the water',
      x: 0.71, z: 0.14,
      examine:
        'Six thousand regulars and about that many townspeople who could not get out, all on a ' +
        'peninsula, all fed by sea. You have them shut in on the land side and the land side was ' +
        'never the question.',
    },
    {
      id: 'trench_back',
      label: 'the trench back to the camp',
      x: 0.08, z: 0.40,
      examine:
        'A covered way running down off the hill toward the huts, dug deep enough that a man can ' +
        'walk it without being seen from the water.',
    },
  ] as Interactable[],

  npcs: [
    {
      id: 'prescott',
      look: { coat: '#5A5A48', hat: 'tricorne', build: 1.04, tall: 1.02 },
      name: 'Colonel Prescott',
      hearFlag: 'heard.a2.prescott',
      x: 0.66, z: 0.30,
      lines: [
        {
          speaker: 'William Prescott',
          ...PRESCOTT,
          text:
            'I took a regiment onto that hill in June with entrenching tools and no orders worth ' +
            'the name, and we held it against three assaults on the powder we carried up.',
        },
        {
          speaker: 'William Prescott',
          ...PRESCOTT,
          text:
            'The country rose of itself, sir. Nobody sent for these men. They came because it was ' +
            'time to come, and that is a thing no King can put down.',
        },
      ],
    },
    {
      id: 'doolittle',
      look: { coat: '#7C6B52', hat: 'round', build: 0.94, tall: 0.96 },
      name: 'Private Doolittle',
      hearFlag: 'heard.a2.doolittle',
      x: 0.58, z: 0.46,
      lines: [
        {
          speaker: 'Amos Doolittle',
          ...DOOLITTLE,
          text:
            'I am an engraver in New Haven, sir, when I am not this. I went and stood on the ' +
            'ground at Lexington and drew what was there before anybody could tell me what to ' +
            'draw.',
        },
        {
          speaker: 'Amos Doolittle',
          ...DOOLITTLE,
          text:
            'They are poor plates. I know it. But they are the only ones, and in fifty years poor ' +
            'and only will beat handsome and invented.',
        },
      ],
    },
    {
      id: 'starr',
      look: { coat: '#8A7F66', hat: 'round', build: 1.0, tall: 0.99 },
      name: 'Sergeant Starr',
      hearFlag: 'heard.a2.starr',
      x: 0.34, z: 0.575,
      lines: [
        {
          speaker: 'Sergeant Starr',
          ...STARR,
          text:
            'Connecticut, sir. Eight months, and the paper says the tenth of December, and I have ' +
            'a wife who has got the harvest in alone and a boy I have not seen walk.',
        },
      ],
      decision: {
        id: 'A2-D4',
        prompt:
          'His time is up on the tenth of December, and it is up for eleven hundred others on the ' +
          'same page. He has not asked to desert. He has asked whether the paper he signed means ' +
          'what it says.',
        speaker: 'Sergeant Starr',
        ...STARR,
        voices: ['duty', 'temper', 'restraint', 'ambition', 'vanity'],
        interjections: {
          duty:
            'He signed for eight months and he has served eight months. A contract you keep only ' +
            'while it suits you is not a contract, and this whole quarrel is about contracts.',
          temper:
            'Eleven hundred men walking down that road in December, in front of the enemy, and ' +
            'we are to shake their hands for it.',
          restraint:
            'Hold one man past his term and you have told the other eleven hundred exactly what ' +
            'their paper is worth. They will not wait for December.',
          ambition:
            'Offer them money. Congress will find it, and a man who re-enlists for a bounty is ' +
            'still a man standing on this hill in January.',
          vanity:
            'It will be said of you either that you kept an army or that you let one walk home. ' +
            'Only one of those is said kindly.',
        },
        rejoinders: {
          duty: 'Eight months is what the paper says. You have read it.',
          restraint: 'Whatever you do on the tenth, you will do again next December.',
          temper: 'Starr is standing there. Say it to him, not to the roll.',
        },
        options: [
          {
            id: 'let_go',
            label: 'Their time is their own',
            full:
              'Say it plainly and in orders: every man goes on the day his paper says, with his ' +
              'pass signed and no word against him.',
            favoured: ['duty', 'restraint'],
            effects: { character: 6, legitimacy: 4, loyalty: -5 },
            // They go, and it is worse than feared and better than it might
            // have been. The gain is small and it is entirely his.
            ledger: [{ n: 900, cause: 'who meant to go, and did not' }],
            result:
              'They go, and it is worse than you feared and better than it might have been — the ' +
              'ones who go say where they are going, and a few hundred who meant to go do not. ' +
              'You have kept the thing the paper stood for, and paid for it in men.',
          },
          {
            id: 'hold_them',
            label: 'Hold them to the spring',
            full:
              'Nobody leaves this hill while the enemy is a mile off it, paper or no paper.',
            favoured: ['temper'],
            /*
             * The voice lock of Act 2, and it works the opposite way round to
             * Act 1's.
             *
             * This is the worst option on the page — it tells eleven hundred
             * men what their signature is worth and costs Legitimacy six and
             * Character four. It is available only to a Washington in whom the
             * fury is genuinely present: loyalty high enough that he speaks for
             * the ranks, self-government slipped enough that he speaks at all.
             *
             * So a player who has governed himself is quietly protected from
             * the blunder by the man he has become, and is never told that he
             * was. A player who has been trading character for the army's love
             * gets handed the option and has to refuse it himself. That
             * refusing-anyway is the actual lesson of the life, and it is only
             * available if the alternative is on the screen.
             *
             * 0.38 because the reachable band at this decision is 0.326–0.432:
             * roughly a third of paths open it, which is often enough to be a
             * real branch and rare enough to be a discovery.
             */
            voiceLock: { voice: 'temper', min: 0.38 },
            effects: { loyalty: 3, legitimacy: -6, character: -4 },
            /*
             * Holding them works in December and is paid for in January, which
             * is the shape of the decision and has to be the shape of the
             * arithmetic. Two lines, one of them a cost, both of them his.
             */
            ledger: [
              { n: 1400, cause: 'held past the date on their paper' },
              { n: -1100, cause: 'who left in January without asking anybody' },
            ],
            result:
              'The order goes out and by nightfall every man in camp knows what his enlistment is ' +
              'worth, which is nothing. Two companies go anyway. You cannot try them all, and not ' +
              'trying them is worse than the going.',
          },
          {
            id: 'bounty',
            label: 'Offer a bounty to stay',
            full:
              'Ask Congress for money and furloughs, and buy the winter one regiment at a time.',
            favoured: ['ambition', 'vanity'],
            effects: { judgment: 5, legitimacy: -2, character: -1 },
            // The best headcount in the act, and the bill arrives every
            // December for eight years.
            ledger: [{ n: 2600, cause: 're-enlisted for the bounty' }],
            result:
              'It works, at a price you will be paying for eight years: from now on the men know ' +
              'the army bids for them, and every December it will have to bid higher.',
          },
          {
            id: 'appeal',
            label: 'Stand up and ask them',
            full:
              'No order and no money. Go along the line, tell them exactly what December means, ' +
              'and ask.',
            requires: 'obs.a2.enlistment_roll',
            lockNote: 'you have not read the roll, and cannot ask for what you cannot count',
            favoured: ['duty', 'vanity', 'restraint'],
            effects: { character: 5, loyalty: 4, legitimacy: 2, judgment: -2 },
            // The smallest gain on the page, and the only line that says why.
            ledger: [{ n: 1100, cause: 'who stayed because you asked them to' }],
            result:
              'You are not a speaker and everybody knows it, which is most of why it lands. Some ' +
              'stay. Not enough. But the ones who stay have chosen it in front of the ones who ' +
              'did not, and that is a different army from the one you had this morning.',
          },
        ],
      },
    },
  ] as NpcThread[],

  extras: [
    { x: 0.10, z: 0.24, coat: '#7E7059', hat: 'round', seed: 611, build: 0.96, tall: 0.97 },
    { x: 0.16, z: 0.42, coat: '#6E6350', hat: 'none', seed: 622, build: 1.04, tall: 1.0 },
    { x: 0.92, z: 0.20, coat: '#847A61', hat: 'tricorne', seed: 633, build: 1.0, tall: 1.01 },
    { x: 0.92, z: 0.56, coat: '#726855', hat: 'round', seed: 644, build: 0.94, tall: 0.98 },
    { x: 0.07, z: 0.13, coat: '#7A6F58', hat: 'none', seed: 655, build: 1.02, tall: 0.99 },
  ],
};
