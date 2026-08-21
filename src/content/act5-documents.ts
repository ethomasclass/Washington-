/**
 * The archive of Act 5.
 *
 * THE CENTRE OF THIS SET IS `DOC-A5.3`, AND IT IS A DOCUMENT THAT DOES NOT
 * EXIST.
 *
 * The Conway letter is the single best epistemological object in this game.
 * Everyone knows the sentence — *"Heaven has been determined to save your
 * country, or a weak General and bad Counsellors would have ruined it"* —
 * and it is quoted in every popular history of the war. It survives because
 * James Wilkinson, drunk in a tavern at Reading, repeated to a fellow
 * officer what he said he had read in a letter from Conway to Gates. That
 * officer told Lord Stirling. Stirling wrote to Washington. The original
 * letter was never produced by anybody, at any point, in the ensuing
 * fifty-year argument, and Gates's own account of what happened to it
 * changed twice.
 *
 * So the register on it is `secretary` and the whole body is set as one
 * hand quoting another hand quoting a third. The typography IS the
 * teaching. A student who reads this and then makes the Cabal decision has
 * had the exact problem Washington had: a devastating quotation, at third
 * hand, that he cannot verify and cannot ignore.
 *
 * The other one worth flagging is `DOC-A5.4`, which is two documents in one
 * sheet — Arnold's account of Bemis Heights and Gates's despatch to
 * Congress about the same battle — set one after the other and disagreeing
 * about who fought it. That is the whole of why Arnold turns, laid out in
 * 1777 and paid in 1780, and the game never has to excuse him.
 */

import type { DocumentDef } from '../types';

export const ACT5_DOCUMENTS: Record<string, DocumentDef> = {

  'DOC-A5.1': {
    id: 'DOC-A5.1',
    title: 'To the President of Congress, from the camp at the Valley Forge',
    cite: 'George Washington to Henry Laurens, 23 December 1777',
    register: 'secretary',
    grants: 'doc.a5.naked',
    gloss:
      'Written the day the hutting began, in a marquee, by a man who had been told by a Congress '
      + 'committee that his army was complaining too much. The phrase in the second paragraph is '
      + 'the one that got quoted for two hundred years, and it is a count, not a figure of speech.',
    body: [
      'SIR: Full as I was in my representation of matters in the Commissary&rsquo;s Department '
      + 'yesterday, fresh and more powerful reasons oblige me to add, that I am now convinced '
      + 'beyond a doubt, that unless some great and capital change suddenly takes place in that '
      + 'line, this Army must inevitably be reduced to one or other of these three things: starve, '
      + 'dissolve, or disperse in order to obtain subsistence in the best manner they can.',
      'We have, by a field return this day made, no less than two thousand eight hundred and '
      + 'ninety-eight men now in camp unfit for duty, because they are barefoot and otherwise naked.',
      'I can assure those Gentlemen, that it is a much easier and less distressing thing to draw '
      + 'remonstrances in a comfortable room by a good fire side, than to occupy a cold bleak hill '
      + 'and sleep under frost and snow without cloaths or blankets.',
      '&mdash;&mdash;',
      'Two thousand eight hundred and ninety-eight is a return, taken on a particular day, by men '
      + 'walking down the line and counting. It is not a rhetorical number and he does not round '
      + 'it. That is what makes the rest of the letter work.',
    ],
  },

  'DOC-A5.2': {
    id: 'DOC-A5.2',
    title: 'Regulations for the Order and Discipline of the Troops, in draft',
    cite:
      'Friedrich von Steuben, written at the Valley Forge, March&ndash;May 1778; '
      + 'printed at Philadelphia 1779 and known ever after as the Blue Book',
    register: 'printed',
    grants: 'doc.a5.drill',
    gloss:
      'He wrote it at night, in French, because he had almost no English. Duponceau turned the '
      + 'French into English, Walker turned the English into orders, and a clerk copied it out for '
      + 'each brigade by hand. It was being written the same week it was being taught.',
    body: [
      'CHAP. IV. &mdash; OF THE INSTRUCTION OF RECRUITS.',
      'The commanding officer of each company is charged with the instruction of his recruits; and '
      + 'as that is a service that requires not only experience, but a patience and temper not met '
      + 'with in every officer, he is to make choice of an officer, serjeant and one or two '
      + 'corporals, who, being approved of by the colonel, are to attend particularly to that duty.',
      'The recruit having acquired the habit of standing straight and steady, must be taught the '
      + 'facings&hellip; a firm position, without stiffness; the head turned to the right so far '
      + 'that the soldier can see the buttons on the breast of the second man from him.',
      'PRIME AND LOAD. Twelve motions. The soldier is not to hurry, and the officer is not to '
      + 'permit him to hurry.',
      '&mdash;&mdash;',
      'Note who is charged with the instruction: *the commanding officer of each company*. Not a '
      + 'serjeant. That single line is what the officers of this army objected to, because in every '
      + 'army they had read about, a gentleman held a commission and a serjeant drilled the men.',
      'His own explanation of why he did it that way, written afterwards to a Prussian friend: '
      + '&ldquo;You say to your soldier, &lsquo;Do this,&rsquo; and he does it. But I am obliged to '
      + 'say, &lsquo;This is the reason why you ought to do that,&rsquo; and then he does it.&rdquo;',
    ],
  },

  'DOC-A5.3': {
    id: 'DOC-A5.3',
    title: 'A sentence attributed to General Conway',
    cite:
      'Reported by Brigadier James Wilkinson, at Reading, to Major William McWilliams; '
      + 'by McWilliams to Lord Stirling; by Stirling to General Washington, 8 November 1777. '
      + 'The letter itself was never produced.',
    register: 'secretary',
    grants: 'doc.a5.conway',
    gloss:
      'This is the most-quoted sentence of the Conway Cabal and no one has ever seen the letter it '
      + 'is supposed to come from. Read the citation before you read the words. Then read the '
      + 'words. Then decide what you would do about them.',
    body: [
      'My Lord &mdash; In an hour of confidence and in the openness of a convivial evening, '
      + 'Brigadier Wilkinson did repeat to Major McWilliams a passage which he said he had read in '
      + 'a letter from General Conway to General Gates, being in these words, or to this effect:',
      '&ldquo;Heaven has been determined to save your Country; or a weak General and bad '
      + 'Counsellors would have ruined it.&rdquo;',
      'Such wicked duplicity of conduct I shall always think it my duty to detect.',
      '&mdash;&mdash;',
      'WHAT IS ACTUALLY ESTABLISHED, AND WHAT IS NOT.',
      'Established: Conway wrote to Gates, more than once, that autumn. Gates was in correspondence '
      + 'with members of Congress who thought the army should be commanded by somebody else. '
      + 'Congress made Conway Inspector General over the heads of twenty-three brigadiers senior to '
      + 'him, in December, without consulting the commander-in-chief.',
      'Not established: that the sentence above appears in any letter. It has come through three '
      + 'men, the last of whom heard it from a fourth who was, on his own account, drinking. When '
      + 'Washington later sent Gates the sentence and asked plainly about it, Gates first said the '
      + 'letter had been stolen from his files, then said the quotation was fabricated, then said '
      + 'the letter existed but had been misrepresented. The original has never been found.',
      'This is the ordinary condition of evidence, and it is what the whole of the rest of this act '
      + 'is decided on.',
    ],
  },

  'DOC-A5.4': {
    id: 'DOC-A5.4',
    title: 'Two accounts of the same battle',
    cite:
      'Major General Horatio Gates to the President of Congress, 20 October 1777; '
      + 'and Major General Benedict Arnold, of the second action at Bemis Heights, 7 October 1777',
    register: 'secretary',
    grants: 'doc.a5.saratoga',
    gloss:
      'Read the first one and count the names in it. Then read the second. The battle is the same '
      + 'battle and the war turns on it, because it is why France came in.',
    body: [
      'GATES, to Congress:',
      '&ldquo;I have the satisfaction to acquaint Congress that Lieutenant General Burgoyne has '
      + 'surrendered himself and his whole army into my hands&hellip; The Conduct of the Troops '
      + 'under my Command has been such as does them the highest Honour. I have the pleasure to '
      + 'inform Congress that the Success of this Army has been chiefly owing to their Spirit and '
      + 'Perseverance.&rdquo;',
      'ARNOLD, of the seventh of October:',
      '&ldquo;I was that morning without a command, having been relieved of it, and having been '
      + 'directed to remain in camp. I heard the firing on the left and rode to it. I found the '
      + 'Massachusetts and New Hampshire regiments engaged and unable to carry the works, and I put '
      + 'myself at their head. We carried the Breymann redoubt at the point of the bayonet. In the '
      + 'entrance of the sally-port I received a ball in the same leg that was broken at Quebec, '
      + 'and my horse was killed under me.&rdquo;',
      '&mdash;&mdash;',
      'Gates was two miles from the fighting, at his headquarters, for the whole of the seventh. '
      + 'His despatch names nobody. He also sent it directly to Congress rather than through his '
      + 'commander-in-chief, which is a breach of every convention of the service and was noticed.',
      'Arnold was, that day, an officer under arrest in all but name, who rode to the sound of the '
      + 'guns without orders, led troops who were not his, took the position that ended the battle, '
      + 'and was shot doing it. Three years from now he will sell West Point to the British for '
      + 'twenty thousand pounds, and none of this excuses that. It does explain why a man might '
      + 'come to believe the thing he had given his leg for did not intend to notice.',
    ],
  },

  'DOC-A5.5': {
    id: 'DOC-A5.5',
    title: 'Orders for the inoculation of the army',
    cite:
      'General Orders and correspondence with Dr. William Shippen, Morristown, February 1777; '
      + 'continued at the Valley Forge under Dr. John Cochran, winter 1777&ndash;78',
    register: 'secretary',
    grants: 'doc.a5.pox',
    gloss:
      'The largest deliberate medical intervention attempted anywhere in the eighteenth century, '
      + 'ordered by a general with no medical training, kept secret from his own army&rsquo;s '
      + 'correspondence, and it worked.',
    body: [
      'Finding the small pox to be spreading much and fearing that no precaution can prevent it '
      + 'from running thro&rsquo; the whole of our Army, I have determined that the Troops shall be '
      + 'inoculated. This Expedient may be attended with some inconveniences and some disadvantages, '
      + 'but yet I trust in its consequences will have the most happy effects.',
      'Necessity not only authorizes but seems to require the measure, for should the disorder '
      + 'infect the Army in the natural way and rage with its usual virulence, we should have more '
      + 'to dread from it than from the Sword of the Enemy.',
      'You will spare no pains to carry them thro&rsquo; the disorder with the utmost expedition, '
      + 'and to have them cleansed from the infection when recovered, that they may proceed to '
      + 'Camp with as little injury as possible to the Country through which they pass. The Matter '
      + 'is to be kept as secret as possible.',
      '&mdash;&mdash;',
      'What variolation is: a small quantity of matter taken from a smallpox pustule, introduced '
      + 'into a cut in a healthy person&rsquo;s arm. It produces a real but usually milder case. '
      + 'The person is contagious for about three weeks and can infect others in the ordinary way, '
      + 'which is why it had to be done by whole regiments in isolation, and why it had to be '
      + 'secret &mdash; an enemy who knew a third of this army was unfit for duty would only have '
      + 'to march.',
      'Somewhere between one and two in every hundred inoculated died of it. Smallpox taken '
      + 'naturally killed between fifteen and thirty. He signed the order knowing both numbers.',
    ],
  },

  'DOC-A5.6': {
    id: 'DOC-A5.6',
    title: 'Treaty of Alliance between the United States and His Most Christian Majesty',
    cite:
      'Concluded at Paris, 6 February 1778; ratified by Congress 4 May; '
      + 'announced in General Orders at the Valley Forge, 5 May 1778',
    register: 'engrossed',
    grants: 'doc.a5.alliance',
    gloss:
      'Signed because of Saratoga and for no other reason. Three months to cross the Atlantic. It '
      + 'is the only document in this game that is unambiguously good news and it arrives in the '
      + 'same week as the first grass.',
    body: [
      'ARTICLE II. The essential and direct End of the present defensive alliance is to maintain '
      + 'effectually the liberty, Sovereignty, and independance absolute and unlimited of the said '
      + 'united States, as well in Matters of Gouvernement as of commerce.',
      'ARTICLE VIII. Neither of the two Parties shall conclude either Truce or Peace with Great '
      + 'Britain, without the formal consent of the other first obtain&rsquo;d; and they mutually '
      + 'engage not to lay down their arms, until the Independence of the united states shall have '
      + 'been formally or tacitly assured by the Treaty or Treaties that shall terminate the War.',
      'GENERAL ORDERS, 5 May 1778. &ldquo;It having pleased the Almighty ruler of the Universe '
      + 'propitiously to defend the Cause of the United American-States and finally by raising us '
      + 'up a powerful Friend among the Princes of the Earth to establish our liberty and '
      + 'Independance upon lasting foundations, it becomes us to set apart a day for gratefully '
      + 'acknowledging the divine Goodness.&rdquo;',
      '&mdash;&mdash;',
      'The order goes on to specify the ceremony exactly: the brigades paraded, a signal cannon, a '
      + 'running fire of the musketry from right to left of the front line and left to right of the '
      + 'second &mdash; a *feu de joie* &mdash; then three cheers, then again, then again. Then an '
      + 'extra gill of rum to every man.',
      'Six months earlier they had no shoes and no huts. This is the same army, on the same ground, '
      + 'and it can now fire a running volley down a line of eleven thousand men without the line '
      + 'coming apart. That is what the winter was for.',
    ],
  },

  'DOC-A5.7': {
    id: 'DOC-A5.7',
    title: 'A return of provisions issued, Brigade of the Pennsylvania Line',
    cite: 'Commissary return, the Valley Forge, week ending 3 January 1778',
    register: 'rough',
    grants: 'doc.a5.firecake',
    gloss:
      'A working sheet, in a clerk&rsquo;s hand, on whatever paper was to hand. It is the least '
      + 'literary document in this game and the one that says the most.',
    body: [
      'Bread or flour &mdash;&mdash; issued.',
      'Beef or pork &mdash;&mdash; none.',
      'Peas or beans &mdash;&mdash; none.',
      'Rice or indian meal &mdash;&mdash; none.',
      'Vinegar &mdash;&mdash; none.',
      'Soap &mdash;&mdash; none.',
      'Candles &mdash;&mdash; none.',
      'Rum or whiskey &mdash;&mdash; none.',
      'Vegetables &mdash;&mdash; none.',
      '&mdash;&mdash;',
      'Flour and water, mixed on a stone and baked on the fire, is what the men called fire cake. '
      + 'Dr. Waldo&rsquo;s diary, this same week: &ldquo;What have you for your Dinner Boys? '
      + 'Nothing but Fire Cake &amp; Water, Sir.&rdquo; And two days later: &ldquo;Fire Cake &amp; '
      + 'Water for Breakfast! Fire Cake &amp; Water for Dinner! Fire Cake &amp; Water for Supper!'
      + '&rdquo;',
      'They were not always this short. There were weeks in this camp with beef in them. This week '
      + 'there was not, and there were several such weeks, and the men could not know in advance '
      + 'which kind of week was coming &mdash; which is a different and worse thing than steady '
      + 'hunger.',
    ],
  },
};
