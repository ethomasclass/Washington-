# The Three-Day Build
### *In Washington's Shoes* — scoping the game for a middle-school classroom, three 40-minute sessions
**Version 1.0 — 22 August 2026**
**Owner:** Creative Director / Narrative Lead. **Audience:** everyone.
**Status:** proposal. Nothing in this document is built yet.

---

## 0. What this document is for

Every act shipped so far was built to be *complete* — every decision written, every
object examinable, every contradiction sourced. That was the right first target. It is
also 174 minutes of reading (§2), and the actual unit is three 40-minute class periods.
Something has to give, and this document decides what, without deleting the work that
does not fit in the classroom — it goes in a second gear, not in the trash.

It owns:

| This document owns | Defers to |
|---|---|
| What is required vs. optional in each act, and why | `05` for the content of every decision |
| The reading-level rule and how it is enforced | `08` §8 for the register rules that already exist |
| The Return's on-screen form, and the new Findings counter | `08` §2 for the six rules (RT-1–RT-6), which this document does not relax |
| The tutorial | nothing — this is new ground |
| Where Loyalists and the war's last four years enter | `05` for everything already built |

Where this document and `08` disagree about the Return, `08` wins — see §5.

---

# 1. THE CONSTRAINT, STATED PLAINLY

Three 40-minute class periods. Realistically **25 minutes at the screen and 15 minutes
of discussion** per period — the decisions are written to start a conversation, and a
period with no room for one wastes the best material in the game. That is **75 minutes
of playtime** across the whole unit, for a game that currently contains 174 minutes of
reading alone, before a single footstep.

Two honest paths out of that gap: cut the game down to 75 minutes, or build two speeds
into it and let 75 minutes be the fast one. The second is what follows. Nothing gets
deleted. A required path — the **spine** — gets built through content that already
exists, and everything outside the spine becomes **Dig Deeper**: found the same way it
is now, examined the same way it is now, and worth something the first time a curious
kid goes looking for it instead of walking past it.

---

# 2. WHERE THE 174 MINUTES ACTUALLY ARE

Measured directly off the shipped content, not estimated:

| | words | share |
|---|---|---|
| examine text (188 objects, five acts) | 10,122 | 39% |
| NPC dialogue | 6,852 | 26% |
| decision results | 3,203 | 12% |
| documents (bodies + glosses) | 2,414 | 9% |
| council lines, option labels, prompts | 3,571 | 14% |
| **Total** | **26,162** | |

The number that matters: **decisions are a fifth of the text.** The bulk is a student
standing in front of an object reading a paragraph. That is exactly what the spine cut
targets — it can remove most of the reading load without touching a single decision,
because most of the reading load was never a decision to begin with.

Sentence length is the other half of the accessibility problem and it does not show up
in a word count. 27% of sentences run over 20 words; the longest is 49. Short words,
long sentences — Flesch-Kincaid says grade 5.7 and undersells the real difficulty, which
is period syntax, not vocabulary. §4 sets the rule this build enforces instead.

---

# 3. THE SPINE — every required beat, three days, one table

**Every spine is the sealed decision plus one more, and the map table if the act has
one.** Sealed decisions are the eight the game already treats as unforgettable — wax
seal, no revision, "this will not come again" — so they were always going to anchor the
required path; this makes it official. Map tables stay required because they are the
most hands-on five minutes in any given act and the best fit for this age group of
anything in the build.

| Day | Act | Required (spine) | Stays optional (Dig Deeper) | Est. minutes |
|---|---|---|---|---|
| **1** | Act 1 — Mount Vernon | `A1-D1` (Martha) · **`A1-D4`** sealed (the uniform) | `A1-D0`, `A1-D2`, `A1-D3`; all 23 objects; the Quarter | 10 |
| **1** | Act 2 — Cambridge | `A2-D1` (the powder) · **`A2-D2`** sealed (the council of war) · Knox's map table | `A2-D3`, `A2-D4`; all 38 objects; the surveyor's overlay | 15 |
| **2** | Act 3 — Brooklyn | **`A3-D1`** sealed (hold the city) · `A3-D2` (Mifflin) · the wind rose | `A3-D3`; all 38 objects; Four Chimneys' council of war in full | 12 |
| **2** | Act 4 — Trenton | `A4-D1` (the bounty) · **`A4-D2`** sealed (go on) | `A4-D3`; all 41 objects | 13 |
| **3** | Act 5 — Valley Forge | `A5-D1` (the pox) · **`A5-D2`** sealed (the Cabal) · the Northern Department table | `A5-D3`, `A5-D4`; all 48 objects | 15 |
| **3** | Epilogue — 1778–1783 | one new map table (§8) | — | 5 |
| **3** | The reckoning | read against the Return (§5) | — | 5 |

Total required playtime: **~75 minutes**, matching the target in §1 with the discussion
time built in rather than fought for.

**What a spine decision has to do that an optional one does not:** every spine result
already stands on its own — none of the eight requires a Dig Deeper find to make sense.
That was checked act by act while building this table and it holds; no rewriting is
needed to make the spine self-sufficient, only marking.

---

# 4. THE READING-LEVEL RULE

Not a vocabulary rule — the words are already short. A sentence-shape rule, enforced the
way every other content rule in this build is enforced: as an assertion `npm test` can
check, not as a style guide nobody rereads.

**Binding, for every string on the spine path** (§3's required beats — dialogue,
examine text, results, prompts):

> **RL-1.** No sentence over 22 words. Average under 14 across any one block of text.
> **RL-2.** At most one subordinate clause per sentence. Never two.
> **RL-3.** Contractions are not just allowed, they are the default — *"you haven't"*,
> not *"you have not."* Formality was never the goal; the register rules in `08` §8
> already say the voice is modern and direct. This just holds the line under load.
> **RL-4.** Every period-specific noun is glossed on first use in that scene — *commissary
> (a supply officer), redoubt (a small fort)* — inline, not in a footnote nobody opens.

**Not binding outside the spine.** Dig Deeper content keeps the voice already built —
same register, same directness, no length ceiling. It is optional precisely so a strong
reader can go further without the floor being raised for everyone else.

This is new work, not free: §3's required beats are ~8,000 words at current density and
most of them do not yet pass RL-1–RL-2 (§2's 27%-over-20-words figure was measured
across the whole game, spine included). The rewrite is scoped in §9 as its own phase.

---

# 5. THE RETURN — finishing what `08` already speced

`08` designed this in full — three lines, six governing rules (RT-1–RT-6), and the
central discipline: **it is a fact, never a judgement, and nobody ever names a target.**
None of that changes here. What changed is the engine underneath it: `08` was written
against the pre-rebuild scene architecture (`src/scenes/mv01.ts`), and the HD-2D rebuild
never carried the on-screen corner HUD forward — only the act-end reckoning survived,
which already satisfies RT-6 (`08` §2.2: *"the Return updates at act boundaries only"*).

So this is a port, not a redesign: a small panel, muted, in the same ink-on-paper voice
as every document in the game, showing the current act's Return — on the rolls, present
and fit, whose time is up — updated only at the act break, exactly as `08` specified.
**RT-1 through RT-6 apply unchanged.** No target is ever printed next to it. It goes
down more than it goes up, and the game says so before the first decision, not after.

## 5.1 The Findings counter — new, and deliberately smaller

Dig Deeper needs a reason to pull a finished-early student in rather than out the door,
and "the reckoning changes" is too far away to feel like anything during a 25-minute
period. A second, much quieter readout: **Findings — 4 of 31**, counting the optional
objects, contradictions and side conversations found this act. Three rules, lighter than
the Return's because the stakes are lighter:

> **FD-1.** It counts *finding*, never *choosing correctly.* There is no wrong object to
> examine, so there is nothing here to be praised or penalized for.
> **FD-2.** It is visible during play, not just at the act break — the whole point is to
> catch a browsing eye mid-session, which the Return by RT-6 cannot do.
> **FD-3.** It never touches the reckoning, the Return, or any of the four hidden stats.
> Findings is a map of curiosity, not a second scoreboard standing next to the first one.

---

# 6. THE TUTORIAL — no separate level

A tutorial level was on the table and is being cut in favor of teaching by need, inside
Act 1, where the game already stands:

- **First 90 seconds at Mount Vernon.** Three coach prompts — *move, examine, talk* —
  each triggered by the player needing that verb for the first time, dismissed
  automatically the moment it is used once. No level select, no "press any key to skip
  the tutorial."
- **`A1-D0`, which already exists,** is the Council's first appearance with nothing at
  stake — it teaches the four-voice panel before `A1-D4` makes it matter.
- **A How-to-Play card on Escape**, for the student who wants the reference rather than
  the coach marks, and for the touch layer's first-run pass (`engine/touch.ts` already
  has the hook points; this is content, not new code).

No new map, no new decision, no new act. This is the cheapest item in the whole
document and it should be built first for exactly that reason — see §9.

---

# 7. DOCUMENTS — period text stays the default

Discussed and settled: **every document ships twice**, period register and a plain-
English pass, with a toggle in the corner of the reader. The default matters more than
the toggle exists — **it opens in period text with a modern gloss sitting above the
body**, the same `gloss` field the documents already carry, just written to do more
work. A document that opens in plain English by default is a document nobody ever reads
in the original, and the primary-source encounter is the one thing this game does that
a textbook does not.

The toggle exists for the classroom that needs it, not for the default reader.

---

# 8. LOYALISTS, AND THE WAR'S LAST FOUR YEARS

Two related gaps, both left over from the acts as built:

**Loyalists are scenery, not people.** The word appears thirteen times across the
codebase and is an adjective in nearly every instance — a Loyalist house, a Loyalist
family that fled — never a character with a line or a stake in a decision. Honeyman
comes closest and he is coded contested, not Loyalist. The fix is one NPC, placed in Act
3: New York carried the largest Loyalist population of any colony, the map already
exists, and a person who believes the Patriots are the reckless ones — with a family
about to lose everything for guessing wrong — costs one character file against a map
that is already built.

**The game stops in May 1778 and the war runs six more years.** Acts 6–8 are unbuilt and
staying unbuilt for this scope — that is a much larger project than three class periods
can absorb. What is in scope is a single new map table closing Day 3: **1778–1783, one
sheet**, in the same shape as the Northern Department table Act 5 already has —
Washington two hundred miles from most of it, learning the outcome from a report rather
than living the scene. Three findings, not a fourth act:

1. **The war moves south**, and the fighting becomes irregular — militia against militia
   more often than army against army, which is the honest description of what
   "guerrilla warfare" names.
2. **Yorktown**, October 1781 — the last major battle, and why a French fleet at the
   mouth of the Chesapeake is the reason it was possible at all, the same way a wind
   direction was the reason Brooklyn worked in Act 3.
3. **The Treaty of Paris**, 1783 — independence recognized, and the land west of the
   Appalachians handed to the new United States by two governments neither of which
   asked anyone who was living on it.

No state-specific framing in any of the three — this serves every classroom the same
way, which is the point of cutting it loose from any one state's standards.

## 8.1 Two corrections to the plan discussed earlier

- **Common Sense belongs in Act 2, not Act 4.** Paine published it 10 January 1776;
  Act 2 already ends on the parapet on the first of January 1776. Act 4 is a full year
  later — placing it there would have been a documented error shipped on purpose. It
  goes into `CB-CAMP-W` / `HQ-WINTER`, at the New Year close, alongside `A2-D2`.
- **Princeton is already named.** The Act 4→5 bridge text, written in the last build
  session, already reads *"Then Princeton on the third of January…"* — nothing to add.

---

# 9. BUILD ORDER

1. **The tutorial** (§6) — smallest job, biggest first-five-minutes win, no dependencies.
2. **The Return panel + Findings counter** (§5) — mostly UI; `08`'s rules are already
   written, so this is implementation against a finished spec.
3. **Spine / Dig Deeper marking** (§3) — a data pass across five acts' decisions and
   objectives rail, not new writing.
4. **The reading-level rewrite** (§4) — the real work. ~8,000 words, scoped to the spine
   only. Budget this as its own pass; do not fold it into step 3.
5. **The document toggle** (§7) — one plain-English pass per document (7 × 5 acts so
   far = 35 documents) plus the reader UI control.
6. **Loyalist NPC + the 1778–1783 table** (§8) — new content, sized like one Dig Deeper
   NPC and one map table, both patterns the build already has twice over.
7. **A one-page teacher's guide** — the three lesson plans from §3's table, discussion
   prompts per spine decision, and where to find each day's save code.

---

# 10. WHAT THIS SCOPE DOES NOT COVER

Said once, plainly, so it does not need saying three more times in review:

- **No writing prompts.** Explicitly out of scope for this pass.
- **No state-specific standards content** — no state's individual framing of the war
  gets built in preference to another's. §8's epilogue table is written to be true
  everywhere, not aimed at one curriculum.
- **Acts 6–8 remain unbuilt.** The epilogue table in §8 is a map table, not a sixth act,
  and is not a substitute for one if a future scope calls for Yorktown as its own act.
- **Dig Deeper content is not rewritten for reading level.** §4 is explicit that RL-1–
  RL-4 bind the spine only.

---

# 11. OPEN QUESTIONS

- Does the Findings counter want a payoff beyond "a number went up" — a line in the
  epilogue that names what was found, the way the reckoning names what was lost? Cheap
  if yes; worth deciding before §9 step 2 rather than after.
- The Loyalist NPC in Act 3 (§8): a `sensitive` Witness Register entry, or an ordinary
  speaking character? Depends on whether the scene argues a position or just states one,
  which is a writing decision more than a scoping one — flagging it here so it is not
  decided by default when the file gets written.
- §9 step 4's word budget (~8,000 words) assumes the spine stays exactly as marked in
  §3. If playtesting moves the spine, the rewrite budget moves with it — re-run the §2
  measurement script after any change to the table in §3, do not re-estimate by eye.
