# Progress, Setback, and the Return
### *In Washington's Shoes* — what the player is working toward, how they can tell, and how the first three levels prove it
**Version 1.0 — 15 August 2026**
**Owner:** Creative Director / Narrative Lead. **Audience:** everyone.
**Status:** proposal. Nothing here is built yet. §9 is the build order.

---

## 0. What this document is for

`07-stat-and-voice-system.md` is a masterclass in hiding things from the player: four
stats they never see, a fog that lags a class period behind the choice that caused it,
a Council whose silence is a readout. All of that is right and none of it is changing.

But a game that hides everything has a problem, and it is the problem the playtest
question exposes:

> **A fifteen-year-old sits down, plays for forty minutes, and stands up. What do they
> think they were trying to do?**

Right now the honest answer is *walk around and read stuff*. The scenes have objectives.
The objectives are good. But they are three unrelated errands per scene, and nothing
connects Tuesday's forty minutes to Thursday's. There is no answer to **"am I getting
anywhere?"** — and "you'll find out in the epilogue in six weeks" is not an answer a
classroom will accept.

This document proposes the answer: **one visible number, which is not a score.**

It owns:

| This document owns | Defers to |
|---|---|
| The Return: what it counts, where it shows, how it moves | `07` for everything about the four hidden stats |
| The act-end reckoning screen | `05` for which decisions exist and their deltas |
| The enlistment clock and where its beats land in Acts 1–3 | `historical-visual-reference.md` for every fact |
| The player-facing voice rule (§8) | `02` for every colour, type and emblem |

Where it conflicts with `07` on the hidden stats, `07` wins. Where it conflicts with
`historical-visual-reference.md` on a fact, that document wins and this one is wrong.

---

# 1. THE ONE-SENTENCE ANSWER

> **You are trying to still have an army at the end.**

That is it. That is the whole game, and it is already written down — it is in a comment
at the top of `src/scenes/mv01.ts` and it has never made it onto the screen:

> *"The goal of the game is that the army still exists at the end — not that it wins
> battles, which it mostly did not. Washington's achievement was that the Continental
> Army was continuously in being from 1775 to 1783, and the British could never finish
> it."*

This is the rare case where the historically true goal is also the mechanically best
one. It is a *survival* goal, not a *conquest* goal, which means:

- It survives the fact that the player loses most of the battles (Act 3 is a defeat by
  design, and the game says so).
- It cannot be maxed. There is no branch where the army gets big and stays big.
- It reframes every "boring" administrative act — powder, rations, latrines, paperwork —
  as the actual win condition, which is exactly what Act 2 is supposed to teach.
- **It is a headcount**, and a headcount is a number a fifteen-year-old can hold in their
  head for six weeks.

---

# 2. THE RETURN — the one number on screen

A *return* was the army's own word for its headcount: a form, filed weekly, saying how
many men each regiment had. Washington demanded them constantly, complained for eight
years that they were late and wrong, and once threatened to court-martial officers who
did not file them. **The game's HUD is one of his returns.** Not a health bar wearing a
tricorne — the actual document, in the actual format, with the actual date on it.

## 2.1 It has three lines, and the gaps between them are the game

`src/types.ts` already has two of the three. Add the third:

```ts
strength: {
  onRolls: number;    // what the paper says you have
  fit:     number;    // who can actually stand up
  expiring?: {        // whose contract runs out, and when
    count: number;
    date: string;     // "31 December"
  };
  dated: string;      // the date of the return itself
} | null;
```

Rendered, in the corner of the screen, always:

```
   RETURN OF 3 JULY 1775
   16,770  on the rolls
   13,743  present and fit for duty
```

and from November 1775 onward, the line that changes the game:

```
   RETURN OF 3 DECEMBER 1775
   14,600  on the rolls          [V — needs a sourced figure]
    9,650  present and fit for duty
   11,000  whose time is up on 31 DECEMBER
```

**Three numbers, three different lessons:**

| Line | What it teaches | How the player moves it |
|---|---|---|
| **On the rolls** | Institutions count what they wish they had | Barely. It is mostly other people's paperwork |
| **Present and fit** | The difference between an army and a list of names | Slowly, through supply, sickness, discipline, desertion |
| **Whose time is up** | This army is a stack of contracts with dates on them | **This is the one they act on** |

The **gap** between the top two numbers is the single best object in the game for
teaching what the Revolution was actually like to run. It is never explained in prose.
It is just two numbers that do not match, in the corner of the screen, for eight acts,
and every so often somebody in the world is angry about it.

## 2.2 Six rules that keep it from becoming a score

This is the dangerous part. The moment the Return reads as a score, `07`'s entire
anti-scoreboard architecture is defeated by a number in the corner of the screen. Six
binding rules:

> **RT-1. The Return is a fact, not a judgement.** It says what the army *is*, never how
> well the player is doing. No colour coding, no arrows, no "+340", no green and red.
> Ink on paper, in the same face as every other document in the game.

> **RT-2. The Return is never a function of the four stats.** Not partly, not weighted,
> not "loyalty nudges the desertion figure." It is computed from authored, named
> outcomes — *this decision sent 300 men home; that one kept 1,100 for six weeks* — and
> every single man in it is traceable to a line item on the reckoning screen (§3). If a
> student reverse-engineers the Return, all they can reverse-engineer is a list of things
> that actually happened.

> **RT-3. It goes down more than it goes up, and the biggest drops are unearned.** The
> December 1775 collapse happens on every branch. So does Long Island. So does the
> 31 December 1776 expiry, *after* Trenton, which is already authored as a fixed loss
> (R20). A number that only rewards is a score; a number that mostly reports weather is
> a fact.

> **RT-4. There is no target and nobody ever names one.** No NPC says "we need 15,000 by
> spring." No objective says "recruit X men." The player is never told what good looks
> like, because nobody in 1775 knew either.

> **RT-5. Bigger is not better, and Act 2 proves it.** The first return in the game —
> 16,770 on the rolls, July 1775 — is the largest number the player will see for years,
> and it is attached to the least functional army in the game. Nine rounds of powder per
> man. No bayonets. Men living in brush piles. **The biggest number in the game belongs
> to its worst army**, and the whole of Act 2 is spent finding that out.

> **RT-6. The Return updates at act boundaries only** — the same slow clock as the mood
> and the portrait, and for the same three reasons (`07` §1.3.1). Within an act you see
> the *causes* arrive, one face at a time. You see the number at the end. This is also
> exactly true to the thing being modelled: a commander in 1775 learned what a month cost
> him from a return, later, in someone else's handwriting.

## 2.3 What the player sees during an act

The number is frozen. The *causes* are not. Inside a scene, consequence arrives as:

- **A person.** Sergeant Starr is standing in front of you asking whether the paper he
  signed means what it says. He is 1 of the 11,000, and after the December decision he is
  either on the hill or he is not.
- **An empty place.** R13 already scales the on-screen crowd (`2 + band × 2` figures).
  Re-point it at the Return instead of the morale band, and a camp that lost a third of
  its men *looks* like a camp that lost a third of its men. Same code, honest signal.
- **A line in the journal.** The journal already lists what you have done. Add what it
  cost, in men, as it becomes known.

---

# 3. THE RECKONING — the act-end screen

Between acts there is already an interlude and a letter (`I1`–`I7`). Put one page in
front of it: **the Return, changed, with every change named.**

```
        RETURN OF THE ARMY BEFORE BOSTON

        On the rolls, 3 July           16,770
        On the rolls, 1 January         9,650  [V]
        ────────────────────────────────────────
        went home when their time ran out    −5,200
        sick, or gone and not written down   −1,900
        stayed because you asked them        +1,100
        marched in from the county militia   +1,800

        Present and fit for duty, 1 Jan 1776    8,212  [V]
```

Four design rules for this screen:

1. **Every line names its cause, in plain English, in the past tense.** Not "morale
   penalty." *"Went home when their time ran out."* This is `07`'s causal-naming rule,
   applied to arithmetic.
2. **At least one line is always something the player did**, phrased so they recognise
   their own decision in it. *"Stayed because you asked them"* is the direct output of
   `A2-D4`'s fourth option, and a student who chose it will know.
3. **At least one line is always something they could not have changed** (R20). The
   December expiry happens to everyone. Putting the fixed loss on the same page as the
   earned gain, in the same typeface, is the single most honest thing this game can do
   about command.
4. **No total, no comparison, no rank.** The screen does not say *"better than last act."*
   It does not say what the historical figure was. (The historical figure belongs in the
   teacher's artifact and the epilogue, where there is room to argue with it.)

The reckoning screen is also, conveniently, **the end of a class period**. A student
closes the laptop having just been shown, in eight lines, what their forty minutes cost
and bought. That is the thing that makes them want Thursday.

---

# 4. THE ENLISTMENT CLOCK — the metric that runs the whole story

Enlistment is the right spine for this game and it is worth saying exactly why, because
the reason is not "it's a convenient number."

**The Continental Army was not an army. It was a rolling series of short contracts.**
Men signed for eight months, or a year, and on the day their paper ran out they could
lawfully walk home — and did, in thousands, in front of the enemy, in winter. Washington
spent eight years fighting a war in which his own army legally dissolved and had to be
rebuilt roughly once a year. He said it himself, repeatedly, in writing: this is the
thing that nearly lost the war, and it never once stopped being true.

So the clock is not a gamification layer. It is the actual, documented, load-bearing
problem of the actual war, and it has three properties that make it perfect here:

- **It has a date on it.** Dates create dread. "31 December" on screen from November
  onward does work no prose can do.
- **It recurs.** December 1775, December 1776, the winters of 1777–78 and 1780, and
  Newburgh in 1783 — the same problem, five times, escalating, ending in a near-mutiny
  over pay. It is the through-line the game already has and has not been using.
- **It converts politics into headcount.** Congress can requisition and cannot tax →
  no money → no bounty → no re-enlistment → no army. The "Congress can't pay" thread
  (already tracked in `05` §14) becomes something the player can *count*, which is the
  only way that thread will ever land with a fifteen-year-old.

## 4.1 The clock's beats, all eight acts, one line each

| Act | The clock says | The player's move |
|---|---|---|
| **1** | *There is no army.* The counter reads a blank | None. This is the control sample |
| **2** | Every enlistment in the army ends 31 Dec 1775 | `A2-D4` — let them go, hold them, buy them, or ask them |
| **3** | The men who re-enlisted are the ones being evacuated | The manifest: what gets across the river |
| **4** | Expiry again, 31 Dec 1776 — six days after Trenton | `A4-D1` — the $10 bounty on his own credit |
| **5** | Nobody's contract expires; they leave anyway, or die | Inoculation, and von Steuben makes the survivors worth more |
| **6** | Yorktown is fought by men whose enlistments finally run *long* | The French alliance is what bought the long contracts |
| **7** | Newburgh: the contracts end and the pay never came | The one where the army's grievance is aimed at Congress |
| **8** | He hands back an army that still exists, then it goes home | The counter runs to zero, on purpose, and that is the win |

**Act 8's counter running to zero is the best ending this game could have.** The number
you protected for eight acts, you personally dissolve — and that is the victory, because
an army that will not go home is the thing the republic was most afraid of. The mechanic
teaches civilian control of the military without a single line of dialogue about civilian
control of the military.

---

# 5. LEVEL 1 — MOUNT VERNON: the number that isn't there

**Playable now:** `MV-01`, the west front. **Designed:** 4 scenes.

**What the player is working toward:** deciding what kind of man rides to Philadelphia.
No army, no counter, no clock.

**The Return reads:** blank. The current string is already right and should be kept
word for word — *"There is no army. That is the whole of the difficulty."*

This is the strongest possible use of an empty HUD element. Forty minutes with a counter
that has nothing in it, and then in Act 2 it fills with 16,770 and the player feels
something the prose could never make them feel: **that number is now yours, and you did
not ask for it.**

### What to change

| | Now | Proposed |
|---|---|---|
| Objectives | Three errands: answer Martha, answer the messenger, set the estate in order | Keep. They are correct and small on purpose |
| Missing | Nothing connects this act to the seven after it | **One line in the closing:** the sloop pushes off and the counter, empty all act, gets its first entry — *"Fifteen thousand men are waiting for you at Cambridge. Nobody has counted them."* |
| Missing | The clock is never seeded | Jenkins the express rider mentions, in passing, that the New England men signed on "till the end of the year." Nobody reacts. **Plant it in Act 1 and let it detonate in Act 2** |

That is the whole Act 1 change: one sentence of foreshadowing and one counter that
fills at the end. Act 1 is the control sample and it should stay slow.

---

# 6. LEVEL 2 — CAMBRIDGE: the number that means nothing, then everything

**Playable now:** `CB-01` (the camp street, July 1775) and `CB-03` (the lines above
Charlestown, November 1775). **Missing:** `CB-02`, the parlour, which is the act's hub.

This act is where the entire design either works or doesn't, because this is where the
player learns to read the Return. Its shape is a three-act structure inside one act:

### Beat 1 · `CB-01`, July — the number is huge and it is a lie

The counter fills for the first time: **16,770 on the rolls, 13,743 present and fit.**
A gap of three thousand men on day one, unexplained.

Everything findable in this scene attacks the number. The ration return says a different
figure. The men live in brush piles. There is one regiment in proper tents and nine
thousand men in shelters made of sailcloth and turf. There are muskets with no bayonets.
Greene says these are the best material in America and Washington's own letter, findable
ten feet away, calls them "an exceeding dirty & nasty people."

**Player's goal for the beat:** find out what you actually command. The objective already
says this. It is now a question the HUD is asking too.

**One addition:** examining the ration return should put its number *on the HUD*, beside
the official one, and leave both there. Two contradictory counts, side by side, for the
rest of the act. Neither marked true. This is the entire lesson of Act 2 delivered as a
UI element.

### Beat 2 · `CB-03`, November — the date appears

The counter grows a third line: **whose time is up on 31 December.**

`CB-03` is already built around this. Sergeant Starr is standing there with a date and a
wife who got the harvest in alone. The enlistment roll is an examinable object. The
Council argues about it five ways. The decision `A2-D4` is written and playable, with
four options and a knowledge lock on having read the roll.

**What is missing is the arithmetic.** Right now the four options move hidden stats and
print a paragraph. They should each also move a *named number*, shown on the reckoning
screen at act end:

| Option | Stats (unchanged) | Men, named on the reckoning screen |
|---|---|---|
| Their time is their own | char +6, legit +4, loyal −5 | *"went home when their time ran out"* — the big loss, and *"a few hundred who meant to go, did not"* |
| Hold them to the spring | loyal +3, legit −6, char −4 | Fewer walk in December; **more walk in January, quietly**, and the January line is the one that hurts |
| Offer a bounty | judg +5, legit −2, char −1 | The best headcount in Act 2 — and it is the line item that returns, more expensive, in Acts 4, 5 and 7 |
| Stand up and ask them | char +5, loyal +4, legit +2, judg −2 | The smallest gain, and the only line on the screen that says *because you asked* |

Note what that table does: **the option with the best number is not the option the game
respects most, and the game never says so.** The bounty works. It also teaches the army
that it can be bid for, and that bill arrives every December for eight years. A student
who takes it and then meets it again in Act 4 has learned something about incentives
that no worksheet will teach them.

**Verification debt:** every figure attached to these options must be sourced or marked
`[V]` before classroom use, exactly like the `V-A2.x` markers already at the head of
`src/scenes/cb03.ts`. Approximate real-world anchors: fewer than half the army remained
in service in January 1776, with strength falling under 10,500; Washington wrote on
10 January that he was "weaker than I had any Idea of." The commonly-cited 1 January
figure of 8,212 is **not** verified here and must not ship unsourced.

### Beat 3 · `CB-02`/`CB-03′`, 1 January — the army dissolves and re-forms in front of the enemy

This is the act's apex and it is currently unbuilt. It is also, in headcount terms, the
best scene in the first half of the game:

**On 1 January 1776 the old army's contracts ended and a new army's began, in the same
trenches, a mile from six thousand British regulars who did not know it was happening.**
The Grand Union flag goes up the pole the same day. Washington, in the same weeks, was
writing that a smaller number of men had never before been asked to do so much.

The player walks the same parapet they walked in November and it is *empty*. Same plate,
same camera, fewer figures — R13 doing the work it was built for. Then the reckoning
screen. Then Act 3.

### Act 2's fixed loss, restated

There is no powder and nothing produces any. Keep it exactly as authored. Its job in this
design is to be the thing the player *cannot* fix while they are learning that the thing
they *can* fix is people.

---

# 7. LEVEL 3 — BROOKLYN: the number becomes a manifest

**Nothing built.** Fully designed in `05` §3.

Act 3 is the defeat, and the design already answers what the player is working toward
during a defeat: **not "how many men die" but "how many men get across the river."**

That is the correct and humane inversion, and it is the payoff of everything Act 2 set up:

- The Return stops being a census and becomes a **manifest** — a list of what actually
  went in the boats. Guns. Horses. The women of the army, who are on the rolls and are
  therefore a decision. This is authored (`DOC-A3.4` "*is* the battle mechanic").
- The sealed decision `A3-D1` **does not change the outcome on any branch.** The army is
  driven off Long Island whatever the player does. What changes is what they knew when
  they chose, and how much of an army is left on the far shore.
- Casualties are delivered **in a letter the player writes**, to Hancock, on 2 September,
  with their own manifest's numbers in it. Not a defeat screen. A letter.

**The one thing to add:** the men lost here should include, by name, someone the player
met in Act 2 and chose to keep. If they took the bounty in December, the man who stayed
for ten dollars is on the Long Island casualty list in September. The game never
comments. That is the whole of the design philosophy in one line item.

---

# 8. WRITING IT SO A FIFTEEN-YEAR-OLD CAN READ IT

The prose in this project is very good and some of it is unusable at 14. `CB-03`'s
opening is 44 words, one sentence, with the verb four clauses in. That is a magazine
sentence, not a game sentence.

The answer is **not** to simplify the history. It is to split the game into three
registers and be strict about which is which:

## 8.1 The three registers

| Register | Where it lives | Rule |
|---|---|---|
| **THE WORLD** — period English | NPC dialogue, documents, examine text, the Council | **Do not touch.** Sergeant Starr says "the paper says the tenth of December" because that is how he talked. Difficulty here is the subject matter |
| **THE GAME** — plain modern English | Objectives, the journal, the Return, the reckoning screen, exit prompts, tooltips | **Grade 7–8. Short sentences. Concrete nouns. Second person. No inversion, no subordinate stacking, no period vocabulary** |
| **THE GLOSS** — on demand | Any period word, tap/hover | One sentence, modern, plain. `04` already specifies the mechanism |

The principle in one line: **the world can be hard; the interface may not be.** A student
struggling with "return" and "enlistment" and "commissary" is doing history. A student
struggling with *what am I supposed to do right now* is fighting the UI, and every minute
of that is a minute stolen from the subject.

## 8.2 Before and after — real strings from the build

**Objectives** (`src/scenes/cb03.ts`):

> ✗ *"Read the ground: sweep the glass across the water and name what is over there."*
> ✓ **"Use the spyglass. Name all seven British positions across the water."**

> ✗ *"Answer Sergeant Starr, and through him the eleven hundred men behind him."*
> ✓ **"Give Sergeant Starr an answer. 1,100 men are waiting on the same one."**

> ✗ *"Put the works in order before the weather closes in."*
> ✓ **"Get the trenches ready before winter."**

**Objectives** (`src/scenes/cb01.ts`):

> ✗ *"Get the general orders out — one army, one set of rules, starting today."*
> ✓ **"Issue your first general orders. One army, one set of rules, starting today."**

**Situation lines** (`src/scenes/cb03.ts`) — the model here is *one idea per sentence*:

> ✗ *"The siege has held since July. Nobody has broken out and nobody has broken in, and
> the fleet still feeds the town, so the noose is a fence."*
> ✓ **"The siege has held since July. Nobody has broken out and nobody has broken in.
> British ships still feed the town, so surrounding it has changed nothing."**

> ✗ *"And the enlistments run out in December. Not a mutiny and not desertion — the paper
> these men signed simply ends, and they may lawfully walk home."*
> ✓ **"And in December, the contracts end. These men signed up for eight months. When the
> eight months are up they can legally walk home, and it is not desertion. It is the deal."**

Note what the rewrite keeps: *enlistment*, *desertion*, *lawfully* — the words are the
content. What it cuts is the **syntax**: the em-dash aside, the fronted "And," the clause
that answers a question nobody asked yet.

## 8.3 The five mechanical rules, for the style guide

1. **One idea per sentence.** Average 14 words in the interface register, 22 max.
2. **Verb early.** No sentence in the interface register may put its main verb past word 8.
3. **Name the thing, then explain it.** *"A return is a headcount"* — never the reverse.
4. **Numbers as digits, always.** `1,100` not *eleven hundred*. The whole design depends on
   numbers being scannable.
5. **Second person, present tense, for anything the player must do.**

## 8.4 The two-line rule for the top of every scene

Before the atmosphere, before the situation, two lines that a student who missed Tuesday
can read in five seconds:

```
   NOVEMBER 1775 · THE LINES ABOVE BOSTON
   Your army's contracts run out in six weeks. Find out what you have.
```

`types.ts` already carries `where`, `when` and `purpose`. This is one string, assembled
from fields that exist.

---

# 9. BUILD ORDER

Ordered so that each step is playable on its own and nothing is wasted if the next step
is cut.

| # | Step | Files | Size |
|---|---|---|---|
| 1 | ~~**Rewrite the player-facing strings** to §8's register, across all three scenes~~ **DONE** | `scenes/*.ts` | half a day, zero risk |
| 2 | ~~**Return on the HUD.**~~ **DONE** — shipped as a top-level `Scene.expiring` rather than nested inside `strength`, because CB-03 has a documented date and no sourced headcount and the two must be independent | `types.ts`, `ui.ts`, `main.ts` | 1 day |
| 3 | ~~**Two-line scene header** per §8.4~~ **DONE** | `ui.ts` | 2 hours |
| 4 | **The ledger module.** `src/ledger.ts`: named line items with causes, written by decisions, recomputable from flags — **not** in the passport (`06` §7.2 already rules counters out of the code) | new file | 1 day |
| 5 | **The reckoning screen** at act end | `ui.ts`, new `interlude.ts` | 2 days |
| 6 | **Wire `A2-D4`'s four options to named line items** | `scenes/cb03.ts`, `ledger.ts` | half a day |
| 7 | **Re-point R13's crowd count at the Return** so the November parapet and the January parapet differ visibly | `renderer.ts`, `main.ts` | half a day |
| 8 | **Source every number.** `[V]` markers, per the `V-A2.x` convention already in `cb03.ts` | docs + scenes | ongoing, blocking for classroom |
| 9 | Then: `CB-02` (the interior plate system), then `CB-03′` (1 January) | — | the real work |

**Steps 1–3 alone answer the playtest question.** A student who sits down after step 3
sees a date, a job, and a headcount with a deadline on it, and can say what they were
trying to do. Everything after that makes it *land*; those three make it *legible*.

### What steps 1–3 actually shipped

The three-scene arc §1 argued for is now on the screen, and it is visible in one
glance per scene:

| Scene | The card reads |
|---|---|
| `MV-01` | **the return** — *There is no army. That is the whole of the difficulty.* |
| `CB-01` | **return of 3 July 1775** — 16,770 on the rolls · 13,743 present and fit for duty |
| `CB-03` | **the return** — *No return this week…* · **time up · 31 December** — most of this army |

The register rule is enforced by the content linter rather than by review: interface
strings are split into sentences and each one is measured (objectives ≤ 16 words,
situation ≤ 22, the job line ≤ 14). The world's registers — dialogue, examine text,
the Council, the intent line — are not measured and must not be.

**Known rendering artifact.** In headless Chromium screenshots a pale rectangle
appears at the bottom right: a vertical mirror of the return card, reflected about
the viewport's centre line. The DOM is correct in all three scenes (verified by full
element dump), it hit-tests to the canvas, and hiding the canvas removes it — so it
is a compositing artifact between the WebGL canvas and the DOM overlay, not a layout
bug. `translateZ(0)` and a fixed card height both failed to clear it. **It needs
eyeballing in a real browser on a real GPU before anyone spends more time on it.**

---

# 10. RISKS

1. **The Return becomes a score anyway.** Highest risk in the document. Mitigations are
   RT-1 through RT-6, and the specific tell to watch for in playtest is a student saying
   *"I got a good number"* rather than *"I lost a lot of men."* If that sentence is heard,
   the fix is to make more of the movement unearned, not to hide the number.
2. **Numbers ship unsourced.** The whole credibility of this project rests on its
   citations, and this design puts numbers in the most prominent element on the screen.
   Nothing ships without a source or a `[V]` marker. The January 1776 figures in §6 are
   marked and are **not** cleared.
3. **The reckoning screen reads as a report card.** Guard: no totals, no comparisons, no
   historical benchmark on that screen.
4. **Grade-7 register creeps into the world.** The world's difficulty is the point. The
   register rule is a wall, not a gradient — the review question is always *"which
   register is this string in?"*, and the answer is never "between."
5. **Scope.** Steps 4–7 are real engineering on a prototype that still has no interior
   plate system. If something must be cut, cut the reckoning screen (step 5) and let the
   journal carry the ledger as a list. The clock still works.

---

# 11. OPEN QUESTIONS FOR THE NEXT SESSION

1. **Does the Return show during Act 1's empty state?** Proposal: yes, blank, with the
   `noStrength` line under it. The empty box is doing work. Needs a playtest.
2. **Should the ration-return contradiction (§6, beat 1) really live on the HUD?** It is
   the boldest idea here and the one most likely to confuse. Alternative: it lives in the
   journal and the HUD stays single-sourced.
3. **Named-man carry-through** (§7) — is one recurring soldier per act enough, or does it
   want a small cast (Starr, Whitcomb, Osborn, Martin) tracked as individuals from Act 2?
   This has real content cost and real payoff.
4. **Where does the clock's "six weeks" phrasing come from** — is the deadline expressed
   as a date, a countdown, or both? A countdown is more legible and more gamey.
5. **Act 8's counter running to zero** — confirm this is the intended ending, because if
   it is, it should be planted from Act 2 onward.

---

## Sources consulted for §6's figures

- [Washington Papers — Supply Problems Plagued the Continental Army from the Start](https://washingtonpapers.org/resources/articles/supply-problems-plagued-the-continental-army-from-the-start/)
- [Mount Vernon — Continental Army](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/continental-army)
- [US Army — Washington Takes Command of Continental Army in 1775](https://www.army.mil/article/40819/washington_takes_command_of_continental_army_in_1775)

Neither the 8,212 figure nor the "we have never been so weak" wording was verified against
a primary source in this pass. Both are marked `[V]` and are blocking for classroom use.
