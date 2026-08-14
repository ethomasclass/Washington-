# Stat, Consequence & Internal Voice System
### *In Washington's Shoes* — the pedagogical engine: how a student perceives that their choices mattered without ever seeing a number
**Version 1.0 — 14 August 2026**
**Owner:** Creative Director / Narrative Lead. **Audience:** everyone. §2, §3.5, §4.2, §6.3 and §8 are binding on the whole team.

---

## 0. What this document owns, and what it defers to

This document owns the **arithmetic of consequence** and the **voice of the interior**. Concretely:

| This document owns | This document defers to |
|---|---|
| The four stats: definition, range, arithmetic, bands, hysteresis | `05-act-scene-inventory.md` for *which* decisions exist and their authored deltas |
| The document/knowledge lock model (R2, formalised) | `04-scene-architecture.md` §6.5 for how a council line is laid out on the page |
| The Internal Council: casting, rhetoric, loudness, selection, prohibitions | `02-art-direction.md` for every colour, emblem, type and portrait *look* |
| The ranked consequence channels and the causal-naming rule | `historical-visual-reference.md` for every matter of historical fact |
| The epilogue assembly system | `reference-game-analysis.md` §5 for R1–R25, which bind here as everywhere |
| The state object, the passport bit layout, and the teacher artifact | |

Where this document conflicts with the brief, it wins. Where it conflicts with `02-art-direction.md` on a matter of look, that document wins. Where it conflicts with `historical-visual-reference.md` on a matter of fact, that document wins and this one is wrong.

**Three errata this document issues against documents already written.** They are corrections, not proposals, and they are collected again in §9.

> **E-1.** The five Council ink hexes in `04-scene-architecture.md` §6.5 and `02-art-direction.md` §2.5 disagree. **`02` wins** — its values are contrast-validated against `PAPER-WARM` and luminance-laddered. `04` §6.5's table is to be replaced with `02` §2.5's. The canonical five are `VANITY #875E0F`, `AMBITION #9E2E12`, `TEMPER #762C29`, `RESTRAINT #223746`, `DUTY #1B1E5A`.
>
> **E-2.** `02-art-direction.md` §3.6 binds the **portrait band to the mood controller `W`**. This is wrong, and it contradicts `02` §6.1's own rule — *"One signal, one cause"* — because `W` contains a time term (`P`) and per-act floors and ceilings. As written, Washington's face would change because it is April at Valley Forge. The portrait is driven by a **separate scalar `C`, specified in §4.1 of this document**, which reads nothing but the player's four stats. Replace that table row.
>
> **E-3.** `02-art-direction.md` §3.2's act table is still in the brief's inverted act order. Apply the mechanical edits in `05-act-scene-inventory.md` §0.1. Act 6 is Yorktown; Act 7 is Newburgh. This document uses the corrected order throughout without further comment.

---

# 1. THE FOUR STATS

## 1.0 What a stat is in this game, and what it is not

A stat here is **not a resource, not a skill, and not a score.** It is an *authoring index*: a compact number that lets forty scenes' worth of text, portraits, props and voices agree with each other about who this Washington has become, without any human having to hold the whole state in their head.

The student never sees it, never spends it, never allocates it, and cannot infer its value from any single observation. They infer its *direction* from an accumulation of observations, which is the entire pedagogical design: **consequence in this game is perceived the way it is perceived in life — as a change in how the room treats you, arriving too late and too diffusely to A/B test.**

Three consequences of that framing, binding on everyone:

1. **No stat is ever named in player-facing text.** Not in dialogue, not in a Council line, not in the letterbook, not in the epilogue, not in a tooltip. The words *military judgment*, *legitimacy*, *loyalty*, *morale* and *character* may appear in the fiction only in their ordinary English senses, never as labels for the systems.
2. **No stat has a maximum the player can be seen to approach.** There is no "full bar" state and no content that only appears at 100.
3. **No file in the repository ranks a state as better or worse.** Fields are named for content, never for value. There is no `quality: 3`, no `ending_tier`, no `score`. See §6.4 — this is how a scoreboard smuggles itself into a game that forbade one.

## 1.1 The four, defined precisely

Each definition below has four parts: what it measures, **what it is not** (the adjacent thing it must never absorb), what raises it, what lowers it. The "what it is not" line is the one that keeps four stats from collapsing into one.

---

### `mj` — MILITARY JUDGMENT

**Measures:** the quality of Washington's reasoning about force, ground, time and risk — assessed against what was knowable at the moment of decision, not against the outcome.

**It is not:** courage, aggression, or victory. A brilliantly reasoned retreat raises Judgment. A reckless attack that happens to succeed does not. **This is the stat most at risk of being written as "did the bold thing," and every deviation makes the game teach that command is temperament.** It is not popularity with soldiers either; that is Loyalty.

**Raised by:** reading ground before committing to it; using the map table's affordances rather than skipping them; correctly discounting an intelligence report the game has shown to be doubtful; choosing the option whose reasoning survives contact even when its outcome does not; asking a subordinate who knows more; keeping a force in being rather than fighting for a place.

**Lowered by:** dividing a force across an obstacle the enemy controls; acting on single-source intelligence; fighting for terrain because it is politically valuable; ignoring a council of war's technical objection; failing to plan for the withdrawal.

**Read by:** locked options at map tables and battle decisions; the LOW/MID/HIGH selector on 11 of 27 scripted battle beats; Ambition's and Vanity's loudness; epilogue Pass 1.

---

### `pl` — POLITICAL LEGITIMACY

**Measures:** the standing of Washington's command in the eyes of the civil power — Congress, the state governments, the delegates, and, latterly, the French. It is the answer to *does the institution that appointed him still believe in the appointment?*

**It is not:** being liked. Legitimacy is not warmth, it is credit. It is also not honesty; a general can be scrupulously honest and destroy his own standing (`A2-D1`, telling Congress about the powder). **The stat that most tempts writers to conflate it with Personal Character. Keep them apart: Character is what he is, Legitimacy is what he is permitted to do.**

**Raised by:** deferring to a council of war and being seen to; putting a decision in writing to Congress before rather than after; abiding by an instruction he thinks is wrong; refusing an irregular power offered to him; treating an ally as a sovereign rather than a supplier.

**Lowered by:** overriding a council; presenting Congress with a fait accompli; public quarrels with rivals; letting the army speak to Congress in its own voice; anything a delegate could read as the army acting as an interest.

**Read by:** the epilogue book's *physical condition* (§5.1); Vanity's loudness, inverted (R5); Duty's and Restraint's loudness; NPC opening registers for all civil and French characters; epilogue Pass 2.

---

### `tl` — TROOP LOYALTY / MORALE

**Measures:** what the army believes about the man commanding it. A single stat covering two things that were, in this army, the same thing: whether the men trusted Washington personally, and whether they were willing to stay.

**It is not:** the army's material condition. The men are hungry, unpaid and barefoot at Valley Forge in every playthrough, at every value of this stat. Loyalty governs whether they are hungry *for him* or hungry *at* him. **Writers must never express Loyalty as supply.** Supply is fixed and is a fixed loss (R20).

**Raised by:** appearing where the risk is; pledging his own credit; accepting a cost personally rather than distributing it; letting the officers see him angry on their behalf; von Steuben's method; naming a dead man.

**Lowered by:** decisions whose cost the army pays and whose benefit it does not see (inoculation, initially and correctly); enforcing discipline through the officer corps; honesty to Congress at the army's expense; anything that looks from the ranks like Philadelphia winning.

**Read by:** population count (R13, `2 + band × 2` figures); Temper's loudness; the mood controller `M` at weight 0.45 — the heaviest single input to how the world looks; battle beat selectors; epilogue Pass 1.

---

### `pc` — PERSONAL CHARACTER

**Measures:** the state of Washington's lifelong project of self-mastery. Not virtue in the abstract: the specific, documented, effortful 18th-century project of a man who copied out 110 rules of conduct as a boy and spent fifty years enforcing them on a temper he knew was dangerous.

**It is not:** kindness, and it is not moral correctness by the standards of 2026. `A2-D3` — the Dunmore reversal — moves Personal Character **by zero on every branch**, because the right decision was made for none of the right reasons, and encoding it otherwise would be the single worst lie this game could tell. Character measures *whether he governed himself*, not *whether he was good*.

**Raised by:** restraint under provocation; refusing an advantage that is available; telling an uncomfortable truth at cost to himself; abiding a decision he lost; declining credit; saying less than he could.

**Lowered by:** answering a personal attack publicly; taking the flattering option; letting the record be shaped rather than made; spending someone else's conscience (`A1-D2`); any use of the army as a threat, even implicitly.

**Read by:** the portrait scalar `C` at weight 0.40 — the heaviest input to Washington's own face; four of the five voices' loudness; the great majority of locked options; the epilogue's second pass; the letterbook's register.

---

## 1.2 Range, starting vector, and the arithmetic

**Range:** integer, **0–100**, four stats, clamped. Inherited unchanged from `05-act-scene-inventory.md` §1, which is the authored source of every delta in the game.

**Starting vector** (unchanged, and it is itself a teaching object):

```
mj  Military Judgment    48    // Fort Necessity, 1754, is on his record and he knows it
pl  Political Legitimacy 55    // unanimously chosen — by a body with no power to tax
tl  Troop Loyalty        40    // they have never met him and he is a Virginian
pc  Personal Character   60    // the reputation is real and it is his only working capital
```

**No stat starts in a LOW or HIGH band.** All four open in MID, at different points within it. The student's Washington begins as the historical one did: unproven in every direction, with slightly better credit than performance.

**Movement magnitudes** (unchanged from `05` §1, restated because everything below depends on them):

| Class | Delta | Count in game |
|---|---|---|
| Characterization-only choice | **0** | ~80 (R11: ≥40% of all choices) |
| Flavour nudge | ±1 to ±2 | ~40 |
| Standard decision | ±3 to ±5 | ~24 |
| **Sealed decision** | **±5 to ±8** | **8** |
| Document found or read | **0, always** | 51 (R2) |

### 1.2.1 The shoulder — the only nonlinearity in the system

Do the arithmetic on the table above and a problem appears. A stat touched by roughly thirty non-zero choices averaging ±4 has a theoretical travel of ±120 against a 100-point range. Played consistently in one direction, a stat saturates somewhere in Act 4 and then stops carrying information for the remaining half of the game — which is exactly the half where the game's argument is made. Worse, a student who makes two poor early calls can be pinned in LOW from Act 3 to Act 8, seeing one register of the world for four class periods.

Both failures are unacceptable in a classroom product. The fix is a **soft shoulder** applied on every write:

```ts
// src/state/stats.ts — the ONLY function permitted to write a stat.
const SHOULDER = 0.60;   // maximum attenuation at the extremes
const KNEE     = 30;     // points from the bound at which attenuation begins

function applyDelta(s: number, d: number, sealed = false): number {
  if (d === 0) return s;
  if (sealed) return clamp(s + d, 0, 100);          // sealed deltas are never damped
  const room = d > 0 ? (100 - s) : s;               // distance to the bound we move toward
  const k    = 1 - SHOULDER * (1 - clamp(room / KNEE, 0, 1));
  return clamp(s + d * k, 0, 100);
}
```

In plain terms: **between 30 and 70 every delta lands at full value. Outside that range, deltas pushing further toward the bound are progressively worth as little as 40% of face value, while deltas pushing back toward the middle are always worth full value.** A stat at 88 gains 1.6 from a +4; it loses the whole 4 from a −4.

**Two rules govern the shoulder, and neither is negotiable:**

- **The eight sealed decisions are exempt.** They always land at full face value. This is what "sealed" means arithmetically: these are the only writes in the game that cannot be dampened, and it is why they are also the only ones that can move a stat clean across a band boundary in a single act. `A5-D2`'s worst branch — answer the Cabal publicly, Legitimacy **−8**, Character **−6** — must be able to do exactly what it says.
- **The shoulder is never announced, never displayed, and never referenced in content.** No writer may plan around it.

### 1.2.2 Everything else about the arithmetic, stated so it is not invented later

- **No decay.** Stats never drift back toward the mean between acts. What was done was done.
- **No regeneration, no rest, no healing.** There is no mechanism by which time improves a stat.
- **No cross-stat coupling.** Legitimacy does not feed Loyalty; Character does not gate Judgment. Trade-offs are expressed explicitly in the authored deltas of individual decisions, where a writer can see them and a reviewer can argue with them. Implicit coupling makes the system unauditable within a week and is forbidden.
- **No random component, anywhere.** Two students at neighbouring desks who make identical choices have identical vectors. This is a hard classroom requirement (`reference-game-analysis.md` §1.2) and it is checked by an automated determinism test in CI: run the eight-act script twice from a fixed decision list and diff the resulting state.
- **All writes go through `applyDelta`.** Direct assignment to `state.stats.*` is a lint error outside `stats.ts`. There is exactly one exception, and it is the debug entry point for teachers (§7.4).
- **Deferred deltas exist and are declared, not hidden.** `A5-D1` (inoculation) is authored as Loyalty **−4 immediately, +6 at act end**. The engine supports a `deferred: { on: "act_end", d: {...} }` clause. It is used **four times in the game** and each use is listed in `05`. It exists so that a decision can cost before it pays, which is the whole shape of command; it is capped at four so that it never becomes a way to hide arithmetic from the reviewer.

## 1.3 The band model

Three bands, uniform thresholds across all four stats, on the raw 0–100 value:

```
band(x) =  LOW   if x < 34
           MID   if 34 ≤ x < 67
           HIGH  if x ≥ 67
```

Uniform thresholds are a deliberate authoring decision. Per-stat thresholds would be defensible and are marginally more expressive; they would also mean that no writer can read a variant table without a reference card. **The writer must be able to reason about bands from memory, at 11 p.m., in a spreadsheet.** 34 and 67.

**Hysteresis: a band change requires the value to cross its threshold by ±3 points.** A stat rising out of LOW does not read as MID until it reaches 37; falling out of MID it does not read as LOW until it reaches 31. The band, once changed, is sticky at the new value until the opposite threshold plus 3 is crossed. This matches the mood controller's 0.04 hysteresis on the normalised `W` scale (`02` §3.2) at approximately the same magnitude, deliberately.

### 1.3.1 Two evaluation clocks, and why there are two

This is the central mechanical decision of the document, so it is stated as a rule before it is justified.

> **RULE. World mood, portrait and population read the ACT-ENTRY SNAPSHOT. Dialogue gating, locked options and Council loudness read the LIVE value.**

```ts
// Committed once, in the act-boundary transition, before the interlude renders.
state.snapshot = { ...state.stats };
state.bands    = computeBandsWithHysteresis(state.snapshot, state.bands);
```

| Consumer | Reads | Latency to the player |
|---|---|---|
| Mood controller `M` (→ `W`, → wash, fog, grain) | `snapshot` | an act |
| Portrait scalar `C` (→ which of the 9 Washingtons) | `snapshot` | an act |
| Population count (R13) | `bands` | an act |
| Prop toggles (R12) | `bands` | an act |
| Examine-text and NPC-opening variants | `bands` | an act |
| **Voice-locked dialogue options (R1)** | **live `stats`** | immediate |
| **Council loudness, order, drop and rejoinder** | **live `stats`** | immediate |
| **Battle beat selectors** | **live `stats`** | immediate |
| Epilogue | live `stats` at Act 8 exit | terminal |

**Why the world is on the slow clock.** Three reasons, in ascending order of importance.

1. **Anti-shimmer.** A stat resting near a threshold, re-evaluated at every one of five scene loads per act, would flip the fog and the crowd count back and forth. The student would correctly learn that the world is noisy rather than responsive. The signal must be rarer than its cause.
2. **Anti-optimisation.** If the wash responded to the decision the player just made, the wash becomes a readout, and a readout is a scoreboard with a four-second latency and a beautiful skin. Students will find it — a class of thirty will find it within one period — and from that moment they are playing the fog rather than the war. Freezing the world's read at act boundaries makes the correlation unrecoverable from inside a single session, because by the time the world changes, six decisions have intervened and a class period has ended.
3. **It is true.** A commander in 1777 does not learn on Tuesday what Tuesday's order cost. He learns it in the spring, from a return, in someone else's handwriting. The act boundary — which is also the interlude, also the save point, also the end of a class period — is the game's unit of reckoning, and putting the world's response there means the student experiences the consequence of Act 3 *throughout* Act 4. That is both the honest model of command and the structure a classroom already has.

**Why dialogue is on the fast clock.** Because the alternative is an inert act. If a decision made in scene 2 could not open or close a sentence in scene 4, then within an act nothing the player did would matter, and the act — 40 minutes, one class period, the whole of a student's session — would be a sealed box. Live gating gives an **immediate, private, textual** consequence; snapshot mood gives a **slow, public, visual** one. The two clocks are not a compromise between them; they are two different kinds of consequence, and the game needs both.

The student is never told any of this and will never articulate it. What they will experience is that the *room* changes between class periods and the *conversation* changes within them.

## 1.4 What each band means, in the fiction

Twelve cells. This table is the writer's reference for every band-variant string in the game. It is descriptive, not evaluative — note that none of the HIGH cells is unambiguously pleasant.

| | **LOW** | **MID** | **HIGH** |
|---|---|---|---|
| **Judgment** | He is guessing and knows it. Reports go unquestioned. Officers volunteer information he should have asked for. | Competent, unremarkable, occasionally late. The reasoning is sound and the ground is not always read. | He sees the shape of a thing before it happens and it makes people uneasy. Subordinates begin proposing what he was going to order. |
| **Legitimacy** | Delegates write about him rather than to him. Instructions arrive as instructions. Requests are answered in the third person. | Correspondence is correct. Nothing is refused and nothing is expedited. | Congress asks him what it should do. This is not a compliment and the game does not present it as one. |
| **Loyalty** | Sullen compliance. Cheering stops at the edge of the parade. Desertion numbers appear in examine text. | They will do what he orders and grumble in front of him, which is its own kind of trust. | They will do things for him that are against their interest, and by Act 7 that is a danger rather than an asset. |
| **Character** | He has stopped catching himself. The letters go out unrevised. Somebody else's name is on a fault that is his. | Held, with visible effort, most of the time. | The self-government is total and it costs visibly. People find him hard to be near. |

Note the deliberate asymmetry in the last column: **HIGH Legitimacy and HIGH Loyalty are both, by Act 7, hazards.** The Newburgh crisis is only dangerous to a Washington whose army loves him and whose Congress cannot pay him. A game where every stat monotonically improves the world teaches that leadership is accumulation. This game's best material is at the top of two of the bars.

## 1.5 The state object

```ts
// src/state/index.ts
type Band = "LOW" | "MID" | "HIGH";
type StatKey = "mj" | "pl" | "tl" | "pc";

interface WashingtonState {
  v: 1;                                   // schema version
  act: 1|2|3|4|5|6|7|8;
  scene: string;                          // "A5-S3"
  stats:    Record<StatKey, number>;      // live, 0–100, integer
  snapshot: Record<StatKey, number>;      // frozen at act entry
  bands:    Record<StatKey, Band>;        // hysteretic, derived from snapshot
  decisions: Record<string, string>;      // "A5-D2" -> "note"
  knowledge: string[];                    // "doc.A5.3", "obs.boston.seven"
  flags: string[];                        // narrative flags, no stat effect
  letters: Record<string, string[]>;      // "I5" -> chosen fragment ids
  deferred: { on: "act_end"; act: number; d: Partial<Record<StatKey, number>> }[];
  a11y: { scale: 0|1|2|3; font: 0|1; instantText: boolean;
          reduceMotion: boolean; glossAlways: boolean };
}
```

`stats.ts` exports exactly four functions: `applyDelta`, `commitSnapshot`, `band`, and `read` — where `read(key, clock)` takes an explicit `"live" | "snapshot"` argument with **no default**. Forcing the caller to name the clock at every call site is the cheapest possible defence against the single most likely bug in this system, which is a mood consumer accidentally reading live state and turning the fog into a scoreboard.

## 1.6 The passport code

Decision #10: no accounts, no backend, a URL-safe code the student carries between class periods, plus localStorage autosave. localStorage holds the full state object. **The code holds the resumable subset**, and here is its exact budget.

| Field | Bits | Notes |
|---|---|---|
| Schema version | 3 | 8 versions before the code format must break compatibility |
| Act | 3 | |
| Scene index within act | 3 | max 7 scenes/act |
| Stats (4 × 7) | 28 | 0–100 fits in 7 bits |
| Sealed decisions (8 × 2) | 16 | up to 4 options each |
| Persisted standard decisions (12 × 2) | 24 | writer marks `persist: true`; **hard cap of 12** |
| Persisted characterization choices (8 × 2) | 16 | one per act maximum; these are the ones the epilogue reads |
| Documents read (51 × 1) | 51 | the Documents ribbon checklist survives a device change |
| Observation flags (13 × 1) | 13 | the spyglass, map-table annotations |
| Accessibility settings | 6 | scale, font, instant text, reduced motion, gloss-always, spare |
| CRC-10 checksum | 10 | catches a mistyped character before it loads a corrupt run |
| **Total** | **173** | → 22 bytes → **36 characters** of Crockford base32 |

Printed on the pass (`02` §8.4) as **nine groups of four**, in Libre Caslon Text at 26 px with +12% tracking. Crockford base32 is chosen over base64url for one reason that matters at a keyboard: it excludes `I`, `L`, `O` and `U`, and decodes `1/I/l` and `0/O` interchangeably, so a fifteen-year-old copying 36 characters off a printout cannot make the two errors they are actually going to make.

The hard cap of 12 persisted standard decisions and 8 persisted characterization choices is a **content budget, enforced at content review.** When the thirteenth is proposed, one of the twelve is retired. This is not a technical limit — 200 more bits would cost eight characters — it is a discipline that keeps the epilogue's assembly comprehensible.

---

# 2. THE DOCUMENTS-UNLOCK-OPTIONS RULE

## 2.1 The rule, formally

> **R2 (binding, restated as mechanism).** Documents and observations write to `state.knowledge`. Decisions write to `state.stats`. **These two paths never cross.** No document, in any act, under any condition, moves any stat by any amount. No decision, in any act, sets a knowledge flag.

Two lock categories, two glyphs, two behaviours (`reference-game-analysis.md` §1.2, `04` §6.5):

| Lock | Keyed to | Glyph | Margin note | Openable now? |
|---|---|---|---|---|
| **Voice-locked** | live stat expression | the responsible voice's emblem | *"Temper is not loud enough to say this."* | **No.** Not in this act. This is DE's red check. |
| **Knowledge-locked** | `state.knowledge` | a folded-letter glyph | *"— you have not read Dunmore's Proclamation."* | **Always yes**, by going and finding the thing. This is DE's white check. |

### 2.1.1 Knowledge has two sources, and both are acts of looking

`05-act-scene-inventory.md` already authors a knowledge lock at `A2-D2` keyed not to a document but to *having named all seven British positions through the spyglass*. That is correct and it needs a formal home, so:

```
knowledge flags take exactly two prefixes:
  doc.A{act}.{n}     set when a primary source has been READ
  obs.{scene}.{name} set when an in-world act of observation is completed
```

Both are *going and looking*. Neither is a stat. An `obs.` flag is set by an interaction that requires the player to attend to the world — using the spyglass on all seven positions, opening all four annotations on a map table, examining the ration return and the commissary's ledger in the same scene. There are **13 observation flags in the game**, listed in the act docs, and the cap is enforced for the same reason as the passport cap: because a fourteenth is always easy to justify and the set stops being memorable at about ten.

### 2.1.2 "Read" is a state, and it is not the same as "found"

`A7-D2`'s knowledge lock requires `DOC-A7.1` **read in full**, not merely picked up. Formalise, for all 51 documents:

- `found` — the artefact is in the Documents ribbon. Set on pickup. **Unlocks nothing, ever.**
- `read` — set when the **TRANSCRIPT** tab has been opened *and* the transcript has been scrolled to its last line. If the transcript fits the spread without scrolling, `read` is set on tab open.

**No timer, anywhere.** `04-scene-architecture.md` §8.3 forbids timed reading and this is not an exception to it: the condition is *the last line was on screen*, not *the student dwelled for n seconds*. A fast reader is not penalised and a student who scrolls without reading has, at minimum, physically passed every line of a primary source under their own eyes, which is more than a worksheet guarantees.

### 2.1.3 The three unlock targets

A knowledge flag may open exactly three things. It may never do anything else.

| Target | Frequency | Example |
|---|---|---|
| **A dialogue option** | 8 in the game (one per act) | `A1-D3`'s fourth option, behind `DOC-A1.1` |
| **An examine-text variant** | ~40 | The Mount Vernon north-end scaffolding reads differently once `DOC-A1.4` is read |
| **A Council line variant** | ~15 | `DOC-A7.3` ("a dangerous instrument to play with") swaps one of Restraint's lines at `A7-D2` |

And the negative rules:

- **No knowledge flag may gate progress.** Not a scene, not an exit, not an act. Every knowledge lock gates a *sentence*. A student who reads nothing finishes the game (R11's mostly-linear scene graph guarantees it) and finishes it quieter.
- **No knowledge lock may reference a document not findable in the act where the lock appears.** Inherited verbatim from `reference-game-analysis.md` §1.2 and checked by the validator (§8, check 21).
- **A document that unlocks nothing is cut.** There are no flavour documents. This is a content-review gate, and it is the reason there are 51 documents rather than 130.

## 2.2 Why the separation matters pedagogically

Five arguments, in the order in which they will be needed when someone proposes "just a small stat bonus for finding things."

**1. A stat reward turns reading into farming.** The instant a document grants +2 to anything, the optimal play is to sweep every scene for collectibles and never read one, because the reward is delivered on pickup and the text is friction between the player and the next pickup. Every collectible system in games history has taught this. Under R2 the reward is *only* available through the content, because the reward *is* a sentence about the content.

**2. A stat reward is fungible; an option is specific.** +2 Judgment from Dunmore's Proclamation is identical to +2 Judgment from a ration return, so the archive becomes undifferentiated currency. Under R2 the reward for reading Dunmore's Proclamation is that you can *say a thing about Dunmore's Proclamation*, and it is available nowhere else and buys nothing else. The knowledge is not exchangeable, which is exactly the property real knowledge has.

**3. It makes the archive non-punitive.** Missing a document never makes your Washington worse. It makes him quieter. A student who finds nothing has a smaller vocabulary, not a lower score, and the game never tells them they missed anything. This is the "no fail state" principle extended down to the level of the collectible, where most educational games abandon it.

**4. It is directly assessable without any instrumentation.** The Documents ribbon is a list of which of 51 real, cited primary sources this student actually read to the last line. The letterbook is a record of what they said with them. A teacher can look at both in ninety seconds (§7).

**5. It models the discipline honestly.** Sources do not make a historian a better person or a more decisive one. They make their claims *sayable*. A student who has internalised, purely as a game convention, that *you cannot make that argument until you have read the thing* has learned the load-bearing habit of the entire field, and has learned it as a reflex rather than a rule.

## 2.3 The counter-rule: the archive is not an answer key

There is a failure mode built into the above and it must be blocked explicitly. Of the eight knowledge-locked options currently authored in `05`, four unlock the option that is *what Washington actually did* (`A1-D3`, `A2-D3`, `A5-D2`, `A7-D2`). If all eight worked that way, the student learns a much worse lesson than the intended one: **read the document to find out the right answer.**

> **RULE. At least three of the eight knowledge-locked options must be options that Washington did NOT take, or that are demonstrably worse than an unlocked option.**

`A2-D2` already satisfies one instance: the option opened by having actually looked at Boston through the spyglass is *press the assault, and put your reasons in writing to Congress in advance so the record shows who chose* — which is not what he did, is arguably his worse instinct made accountable, and is a genuinely defensible piece of generalship. Two more are owed and are assigned to Acts 3 and 6 at act sign-off.

The complementary rule, inherited from `reference-game-analysis.md` §2.5 and worth restating here because it is where it bites: **documents can be wrong.** The Act 3 intelligence reports are frequently inaccurate. `DOC-A5.3` — the Conway letter — is hearsay, quoted inside another man's hand, and the typography says so before the content does. A student who acts on a document and finds it false has learned more about 1776 than any accurate document could teach them.

## 2.4 Worked examples

### Example A — `A1-D3`, the uniform, and the fourth sentence

The sealed decision of Act 1 offers three options: wear the blue-and-buff of the Fairfax Independent Company; travel in civilian dress; pack the uniform but do not wear it. All three are available to every student.

A fourth appears **only** if `doc.A1.1` is set — the Articles of Capitulation signed at Fort Necessity on 3 July 1754, findable in the study in `A1-S2`, a document in French that Washington signed without being able to read the word *assassinat* in it.

Unread, the option renders:

```
  4  ̶W̶e̶a̶r̶ ̶i̶t̶,̶ ̶a̶n̶d̶ ̶t̶e̶l̶l̶ ̶t̶h̶e̶m̶ ̶p̶l̶a̶i̶n̶l̶y̶ ̶y̶o̶u̶ ̶d̶o̶ ̶n̶o̶t̶ ̶t̶h̶i̶n̶k̶ ̶y̶o̶u̶r̶s̶e̶l̶f̶ ̶e̶q̶u̶a̶l̶ ̶t̶o̶ ̶i̶t̶.̶   ✉
     — you have not read what you signed at the Great Meadows.
```

Read, it is selectable, and it produces the historically documented posture: he wore the uniform *and* told Congress he did not think himself equal to the command, and both were true simultaneously. **The document granted no points.** It granted a sentence in which two things are true at once, which is a sentence a student cannot construct without having seen the evidence that the humiliation was real.

Note what the margin note does not say. It does not say *find document 1 of 6*. It says *you have not read what you signed at the Great Meadows* — which is a fact about Washington, phrased in the second person, that arrives as an accusation. The student does not know there is a document called `DOC-A1.1`. They know there is something in his past they have not looked at.

### Example B — `A2-D2`, the ice, and an observation flag

The knowledge lock at the Act 2 sealed decision is keyed to `obs.boston.seven` — having used the spyglass in `A2-S3` to name all seven British positions across the water. The margin note is *"— you have not looked at Boston."*

This is the same mechanic with a different verb, and it is the one to point at when someone asks whether R2 makes the game a reading assignment. It does not: it makes the game a *looking* assignment, and reading is one of the two ways of looking it accepts. A student who spends four minutes with a spyglass naming Lechmere Point and Bunker Hill and the ferry ways has done reconnaissance, and the reward for reconnaissance is that the option to argue from ground now exists.

### Example C — `A7-D2`, and the manoeuvre that required reading

The option that saved the republic — *forbid the irregular meeting; call a regular one yourself for the 15th; attend it unannounced* — is locked behind `DOC-A7.1`, the anonymous Newburgh Address, **read in full.**

The design intent is exact and it should be stated to the writing team in these words: *the manoeuvre that preserved civilian control of the American military depended, in March 1783, on Washington having actually read the thing he was answering.* He did. He answered it point by point, in a room, with the paper in his hand. A student who picked the document up off a table and never opened the transcript is offered three other options, all of which are worse, none of which is a failure, and one of which — *let it happen and stay away* — is what Horatio Gates wanted.

The document is set in ROUGH, a **disguised hand**, and the typography is the lesson before the content is (R16). No prose in the game ever explains that the hand is disguised.

---

# 3. WASHINGTON'S INTERNAL COUNCIL

This is the spine. It is how four invisible numbers become a person the student can recognise, and it is the single largest writing commitment in the project after the scene text itself.

## 3.1 The historical argument: why these five, and why they are not RPG archetypes

The five voices are not Courage / Wisdom / Cunning. They are five documented forces in an unusually well-documented interior, and each one is anchored to a specific body of evidence. A historian should be able to look at this cast and recognise the man.

| Voice | The historical fact it dramatises | Primary evidentiary anchor | What it must never become |
|---|---|---|---|
| **AMBITION** | A provincial officer who spent the 1750s campaigning for a royal commission, rode to Boston in 1756 to argue for it in person, resigned twice in frustration at provincial rank, and in 1775 wore his regimentals to a deliberative assembly. | The Shirley journey, Feb 1756; the 1754 and 1758 resignations; the Fairfax Independent Company uniform at the Second Continental Congress. | A war-hawk. Ambition is about *position and opportunity*, not violence. |
| **RESTRAINT** | The Fabian commander — the man who adopted, against his own repeatedly-stated instinct, a strategy of preservation over engagement, and who was overruled by his own councils of war and abided it. | Three proposals to assault Boston, three votes against, three deferrals, winter 1775–76; the war of posts after 1776. | Timidity. Restraint is *strategic patience*, and it is never afraid. |
| **TEMPER** | Jefferson: *"His temper was naturally irritable and high toned; but reflection and resolution had obtained a firm and habitual ascendancy over it. If ever however it broke it's bonds he was most tremendous in his wrath."* **[DOC]** | Jefferson to Walter Jones, 2 Jan 1814. Monmouth, 28 June 1778, and the rebuke of Charles Lee **[ANEC — see §9]**. Gilbert Stuart on the features indicating ungovernable passions **[ANEC]**. | A berserker, or comic relief. Temper is *grievance*, sharp and personal and usually about someone by name. |
| **DUTY** | The commander who returned the commission; who wrote to Congress before acting rather than after; who treated a body that could not tax him as the authority he served. | The 1775 acceptance speech; eight years of correspondence with successive Presidents of Congress; 23 December 1783. | Patriotism. Duty is *institutional*, never inspirational. It never says "liberty." |
| **VANITY** | The twenty-two-year-old who wrote *"I heard Bulletts whistle and believe me there was something charming in the sound"* and spent the rest of his life managing the record. **[DOC]** The lifelong attention to *character* in the period sense: reputation as public property, held in trust. | GW to John Augustine Washington, 31 May 1754; the *Rules of Civility*, 110 maxims copied out as a schoolboy, of which the first governs conduct *in company* and the last governs conscience **[DOC]**; the assiduous curation of his own papers. | Simple narcissism. Vanity is *the audience of posterity*, and it is usually right about what the audience will think. |

**The through-line that makes the cast cohere:** Washington's life was a fifty-year project of self-government conducted by a man who knew his own material was dangerous. The *Rules of Civility* is a document about the management of self in the presence of others, copied out by a boy who would spend his adulthood being watched. That project is the game. **The Council is not a set of stats; it is the argument he is having with himself, and the player's Washington is defined by which side of it keeps winning.**

Which is why the two "bad" voices are load-bearing and may never be cut:

> **Marble Washington is prevented by Temper and Vanity.** The student must watch a great man be petty, furious and self-regarding, and then choose otherwise anyway. **That choosing-otherwise is the actual lesson of his life, and it is only visible if the alternative is audible.** (`reference-game-analysis.md` §6.3.)

## 3.2 No voice is right, and every voice is right somewhere

The most important mechanical claim in this section: **a voice being persuasive and wrong is the whole point.** If the Council is a hint system, the game has replaced a scoreboard with an oracle and taught that leadership is compliance with an inner expert.

> **RULE. Every voice is materially wrong at least twice in the game, in a place where following it produces a worse outcome, and the game never marks the line as wrong.**

The authored map, by decision ID:

| Voice | Right here | Wrong here |
|---|---|---|
| **AMBITION** | `A4-D2` — *go on.* Three hours late, surprise gone, and turning back ends the war. Ambition is the only voice arguing for the decision the entire Revolution turns on. | `A3-D1` — dividing the army across a tidal river the enemy's fleet controls. `A2-D2` — the assault over the ice, which four experienced officers correctly voted down. |
| **RESTRAINT** | `A2-D2` — *you have never yet been right against four men at once.* `A5-D2` — *build nothing on a letter you have seen at second hand.* | `A4-D2` — Restraint at McConkey's Ferry loses the war in one night. `A5-D1` — *some of them will die of it and you will have signed the order*, against the inoculation that made the army the only smallpox-free force in North America. |
| **TEMPER** | `A5-D4` — anger deployed as evidence in front of the Committee at Camp. `A7-D2` — the room at Newburgh needed to see that he was genuinely angry, and it is not clear the manoeuvre works without it. | `A5-D2` — *answer publicly, in general orders, and name them* is the branch that costs Legitimacy 8 and Character 6 and changes the rest of the game. `A6-D3` — the terms, where vengeance for Charleston is available and cheap. |
| **DUTY** | `A2-D2`, `A7-D2`, `A8-D1` — the three moments the republic exists because a soldier deferred. | **`A3-D1`.** Congress wanted New York held. Duty argues to hold it. Holding it produced the worst decision of his career and nearly ended the Revolution in six weeks. **This is the most valuable single line in the Council, because it is where deference to civil authority is catastrophic and the game still does not disown it.** |
| **VANITY** | `A8-D1` — *Trumbull will paint this.* Caring how the resignation would look is part of why the resignation had the form it had, and the form is the entire precedent. `A1-D3` — the uniform worked. | `A5-D2` — protecting the reputation by answering the Cabal in public is ruinous. `A6-D3` — humiliating Cornwallis reads well in the moment and badly for thirty years. |

**And the deeper rule about honesty:**

> **RULE. Voices misjudge. Voices never misinform.** No Council line may state a false fact about the world. A voice may be catastrophically wrong about what to do, may frame a fact tendentiously, may omit the fact that ruins its case — but if a voice says the ice will bear men in February, the ice bears men in February.

The reason is classroom-specific and absolute. If the interior text layer can lie about facts, the student cannot trust any text in the game, and a history game whose text cannot be trusted is worse than no game. The one permitted exception: **Vanity may make predictions that turn out false** — *"they will remember this"* — because a prediction is not a fact, and Vanity being wrong about posterity is one of the game's best quiet jokes.

## 3.3 The five voices, in full

Each entry is the writer's complete brief for that voice. `05-act-scene-inventory.md` already contains ~40 authored Council lines; the samples below are additional, and the two marked **[canon]** are lifted from `05` as the reference exemplars for that voice's register.

---

### AMBITION
**Ink** `#9E2E12` faded vermilion · **Emblem** a spur · **Luminance** L\* 36.5

**What it wants:** the decisive stroke, taken now, by him. Not glory in the abstract — *this* opportunity, which is closing.

**Rhetorical style:** **arithmetic and time windows.** Ambition counts things and names deadlines. Short declaratives, present tense, one number and one horizon per line. Its characteristic move is to **reframe a risk as an expiring asset**: the danger is not that the thing will fail, it is that the chance will be gone. It is the only voice that uses the future tense as a threat rather than a promise. It never gloats, never speaks about how a thing will look, and never insults a named person.

**When it speaks:** at every decision involving initiative, timing or concentration of force. At map tables, always. In the presence of a subordinate who has just been given something Washington wanted. It is silent in interiors where nothing can be decided.

**Loudness:** `0.60·mj + 0.40·(1 − pc)`. A Washington with good judgment and slipping self-government is the one who hears the spur loudest — which is a genuinely dangerous man, and correctly so.

**Sample lines** (≤28 words each):

> **[canon]** *"The ice will bear men in February. It will not bear them in April. There is one week in this whole war shaped like a door."*

> *"Nine thousand of them in that town and eleven hundred of us in these boats. That ratio is the best it will be all winter."*

> *"Howe has given you three days by doing nothing with them. He will not give you a fourth."*

> *"They are asking what you will do. That is the sound of an army waiting to be told, and it does not last."*

> *"You did not take this command to preserve it. Preserving it is what Congress does."*

> *"Rochambeau will sail in October whatever you decide in August. Decide in August."*

**Never:** speaks about reputation (that is Vanity) · attacks a person by name (that is Temper) · argues for a fight it cannot arithmetically justify.

---

### RESTRAINT
**Ink** `#223746` Prussian blue · **Emblem** a bridle bit · **Luminance** L\* 22.0

**What it wants:** the army in being tomorrow. Restraint's project is *preservation of the instrument*, and it is perfectly willing to lose ground, towns and reputation to keep it.

**Rhetorical style:** **conditionals and second-order effects.** The longest sentence structures in the Council — one main clause and one subordinate, almost always. It is the only voice that uses *if*, *until* and *and then*. Its characteristic move is to **name what happens after the thing the room is currently discussing**. It is not cautious and it is never comforting; it does not say *be careful*, it says *here is the week after next*.

**When it speaks:** at every decision where an irreversible commitment is available. Whenever a second option exists that keeps a first option open. Whenever someone in the room has proposed acting on a single source.

**Loudness:** `0.55·pc + 0.45·pl`. It gets quieter as the man frays and as his standing collapses — so the voice that would save him is the one that fades first, which is the cruellest and truest thing in the loudness table.

**Sample lines:**

> **[canon]** *"Greene, Ward, Putnam and Gates have all said no. You have never yet been right against four men at once."*

> *"If you put the army on that island and the wind turns, there is no second decision to make. Keep a decision in reserve."*

> *"You can lose New York and still have an army. You cannot lose an army and still have New York."*

> *"Answer him and you have made him your equal, and every man in Philadelphia will have watched you do it."*

> *"The men will forgive you a retreat. They will not forgive you a retreat you had to be forced into."*

> *"Do not argue with them. Argue with the letter."* **[canon]**

**Never:** moralises (that is Duty) · counsels inaction out of fear · uses the word *safe*.

---

### TEMPER
**Ink** `#762C29` burnt iron-gall red-brown · **Emblem** a struck flint · **Luminance** L\* 28.9

**What it wants:** for the specific person who has wronged him to know it. Temper is not a general appetite for violence; it is a ledger of slights, kept meticulously, in a man who has been condescended to by Englishmen since he was twenty-two.

**Rhetorical style:** **second person, accusatory, and short.** The shortest lines in the game — frequently fragments. Almost always about a *named* individual: Gates, Lee, Conway, Mifflin, Dunmore, Rall, Cornwallis. Its characteristic move is to **personalise an institutional problem** — Congress becomes a man who did not answer a letter. Profanity is limited to *damned* and *hell*, both period-accurate and mild (`reference-game-analysis.md` §6.4), and it is used perhaps six times in eight acts.

**When it speaks:** when Washington is condescended to; when a rival is named; when Congress does something the army will pay for; when someone treats him as a provincial. It speaks in the Witness Register scenes not at all (§3.6).

**Loudness:** `0.55·tl + 0.45·(1 − pc)`. The Troop Loyalty term is deliberate and it is the subtlest thing in the formula table: **the more the army trusts him, the more freely he is furious on its behalf.** Temper is not only his own grievance — it is the ranks' grievance, admitted into his mouth by the fact that they are his. This is why Newburgh works: at Act 7 a beloved commander is at maximum risk of speaking for his men, and speaking for his men is precisely what he must not do.

**Sample lines:**

> **[canon]** *"They think you are a Virginian playing at soldiers. Prove it in front of them, or stop resenting it."*

> *"Gates has not written to you once. He writes about you, to men who cannot spell your rank."*

> *"Twenty-two years old at the Great Meadows and they printed it in London, and there is not a room in Philadelphia where somebody has not read it."*

> *"He offered them their freedom to spite you. Not to free them. To spite you. Say the true thing about it at least once."*

> *"Lincoln walked out of Charleston with his colours cased. Let Cornwallis learn the tune."*

> *"You have written to that committee eleven times. Damn them. Make them come and look."*

**Never:** advocates harm to a person present on screen · speaks in the abstract · is funny on purpose · appears in an R5 Witness Register scene.

---

### DUTY
**Ink** `#1B1E5A` indigo · **Emblem** a folded commission · **Luminance** L\* 15.0

**What it wants:** that the instrument he is holding be handed back in the condition he received it. Duty's subject is always the *office*, never the country.

**Rhetorical style:** **the vocabulary of the documents themselves.** Commission. Orders. The civil power. The service. The cause. The men. It is permitted the longest lines in the Council (up to the full 28 words) and it is the only voice that ever addresses him in the third person as an officeholder. Its characteristic move is to **remind him whose authority he is holding and on what terms**. It never inspires, never mentions liberty or freedom as slogans, never comforts, and never appeals to history.

**When it speaks:** at every decision touching Congress, the states, the French alliance, or the relationship between the army and anyone who is not in it. At all eight sealed decisions without exception — **Duty is the only voice authored into all eight**, and its silence at any of them (via the drop rule, §3.5) is therefore the single most legible negative signal in the game.

**Loudness:** `0.50·pl + 0.50·pc`. The only voice with an even split and no inverted term — the plainest formula for the plainest voice.

**Sample lines:**

> **[canon]** *"You asked for a council. A council you overrule is a court you flatter."*

> *"Congress cannot pay them, cannot feed them, and cannot be disobeyed. All three are true at once and you will hold all three."*

> *"The commission is in your coat. It was written by men who are frightened of you and signed it anyway."*

> *"Whatever you tell him, he will do. That is not his conscience you are spending."* **[canon]**

> *"An army that meets without its commander's leave has already decided something. Do not let the first thing it decides be that it can."* **[canon]**

> *"You are not owed an answer. You are owed an order, and they have not sent one, and you will act as though they had."*

**Never:** says *liberty*, *freedom*, *tyranny* or *the nation* · comforts · invokes posterity (that is Vanity) · argues from the army's interest (that is Temper).

---

### VANITY
**Ink** `#875E0F` yellow ochre · **Emblem** a hand mirror · **Luminance** L\* 43.1 — the lightest, and at 4.69 : 1 the tightest contrast value in the project. It may not be lightened.

**What it wants:** the right picture. Vanity is the voice of a man who understood, correctly and early, that in a republic reputation *is* power, and who could never quite tell where the management of reputation stopped and the love of it began. Neither can the game. Neither could he.

**Rhetorical style:** **the future perfect, and the third person about himself.** Vanity is the only voice that talks about the historical record, about paintings, about what will be printed, about what they will say in twenty years. Its characteristic move is to **shift the audience from the room to posterity** mid-sentence. It is polished, it is never crude, and — this is the trap — **it is usually factually correct.** Its readings of how a thing will look are accurate. That accuracy is what makes it dangerous, and it is why Vanity must never be written as a fool.

**When it speaks:** whenever anyone is watching; whenever a thing will be written down; at every moment the game is about to become a Gilt Frame. Loudest, structurally, when the man is doing worst.

**Loudness:** `0.65·(1 − pl) + 0.35·mj` — **inverted against Political Legitimacy (R5).** As standing collapses, the mirror gets louder. The student sees no red number; they notice that a preening voice will not shut up. This is the best single example in the project of consequence rather than scoreboard, and it is the reason Vanity exists at all.

**Sample lines:**

> **[canon]** *"You will be the only man in that room wearing a coat that means something. They will not have to be told what you are offering."*

> **[canon]** *"Trumbull will paint this. Stand where the light is."*

> *"They are saying in York that Saratoga was won by a better general. Let that sentence stand a month and it becomes true."*

> *"There will be an account of tonight. There is always an account. The only question is whose hand it is in."*

> *"Take the spectacles out slowly. Half of them have never seen you need anything."*

> *"You will be sixty before anyone asks what you did in the winter of seventy-seven. Give them something to find."*

**Never:** flatters crudely · speaks about winning (that is Ambition) · is wrong about a fact of reputation · is comic.

---

## 3.4 The Attribution-Stripped Test

Five voices are only five voices if they are distinguishable by syntax with the names removed.

> **GATE.** At every act's content review, take one page of that act's Council lines, strip the names and emblems, and hand it to a team member who has read the bible but not that act. **≥ 80% correct attribution, or the act's Council lines are rewritten.** Below 80% the voices are one writer's voice wearing five hats, which is exactly what happened to *Where the Water Tastes Like Wine* and is exactly what R25 exists to prevent.

The diagnostic signatures, for the person running the test: Ambition has a number in it. Restraint has a subordinate clause and a *then*. Temper has a proper name and is under twelve words. Duty has a document-word in it. Vanity has a future tense and an audience.

## 3.5 Mechanics: how often, which ones, in what order

### 3.5.1 At decision points — the set is authored, the performance is computed

`05-act-scene-inventory.md` authors the *set* of voices at all 32 real decisions (8 sealed, 24 standard). That authored set is canonical. The engine then computes four things:

**(1) ORDER — always descending by loudness.** The first voice to speak is the loudest part of him right now. This is free, it is invisible as a mechanic, and it is the most-consumed loudness signal in the game because it happens 32 times. Voices appear sequentially, 320 ms apart, each fading in over 200 ms with a 4 px rise (`04` §6.5).

**(2) DROP — a voice below `L = 0.28` is removed from the authored set, while ≥2 voices remain.** This is how a student notices that Duty has gone quiet. R4's floor of two always wins: if dropping would leave one voice, nothing is dropped. The engine never drops more than one voice from a set of three.

**(3) INSISTENCE — a voice at `L ≥ 0.72` speaks a second time**, after all others have finished, as a rejoinder of **≤ 14 words**, following a 600 ms beat. Rejoinders are authored only for the voices plausibly loud at that decision — roughly 1.5 per decision, ~48 in the game. The rejoinder is the single most legible loudness signal available: a voice that will not let the argument end. It is also, deliberately, the mechanism by which a low-Legitimacy Washington experiences Vanity getting the last word at Newburgh.

**(4) SUBSTITUTION — never.** The engine will not add a voice the writer did not author for that decision. An unauthored voice has nothing to say about that specific question, and a generic bark is worse than silence. This rule is what protects `A2-D3` — where the absence of a moral voice *is the design* — from being helpfully repaired by a system.

### 3.5.2 Between decisions — the ambient interjection

The Council's presence must not be confined to 32 moments, or it becomes a decision UI rather than an interior.

Each scene declares **2–4 `council_slots`**, attached to specific interactables or dialogue nodes. A slot is not a voice; it is an *opportunity*, and it carries 2–3 authored voice-variants plus a firing threshold:

```ink
=== slot_vf01_shoes ===
// VF-01, the boots in the snow. Threshold 0.42.
{ council_slot("vf01_shoes", 0.42):
  - TEMPER:    Somebody in Lancaster is being paid for shoes. Somebody is being paid.
  - RESTRAINT: Count them. You will be asked how many, and you will want to have counted.
  - DUTY:      This is in the returns you signed. You have read this and let it pass.
}
```

The engine fires **the loudest eligible variant**, subject to:

| Constraint | Value |
|---|---|
| Global cooldown between any two interjections | **40 s** |
| Per-voice cooldown | **120 s** |
| Maximum interjections per scene | **4** |
| Never fires | during a decision block, during a Gilt Frame, in an R5 scene, during a map-table commit |

**Authoring budget.** ~3 slots per scene × ~2.5 variants × 40 scenes = **~300 ambient lines**. Plus ~102 decision lines and ~48 rejoinders. **Total ≈ 450 Council lines ≈ 12,600 words ≈ 9–10% of the 110,000–140,000 word game budget.** A student on one playthrough hears roughly 170 of them. That ratio — hearing under 40% of the interior — is deliberate and matches the global consumption target.

**One writer owns all 450 (R25).** NPC dialogue may be distributed across the team. Washington's interior may not.

### 3.5.3 Can the player act on a voice?

**Never directly.** There is no "listen to Ambition" button, no voice selection, no way to raise or spend a voice. The player never commands the Council; the Council is not a resource and the moment it becomes one, the game is teaching that leadership is loadout management.

Two indirect couplings do the work instead:

1. **Voice-locked options (R1).** The voice's loudness gates the option. *"Temper is not loud enough to say this."* The player acts *through* the voices, and can see precisely which part of himself is insufficient, and cannot fix it this act. This is the entire emotional payload of a Disco Elysium locked check delivered with no dice and no number.
2. **The interlude letter's register.** Each of the seven interlude letters (`I1`–`I7`) carries **one clause selected by whichever voice was loudest across the act just finished** — five variants per letter, 35 clauses in the game, ~900 words total. The student never learns the rule. What they experience is that the letters gradually acquire a personality, and that the personality is theirs.

## 3.6 Where the Council does not speak

Silence is a channel and it is spent in four places.

| Where | Behaviour | Why |
|---|---|---|
| **R5 Witness Register scenes** (`MV-03`, and the hospital hut's R5-restraint passages) | **Total silence. Zero interjections, zero decision lines.** | The Witness Register exists to strip out the aestheticising apparatus. Washington's interior chorus *is* apparatus. The game refuses to let his interior narrate these people, and the absence is the loudest thing in the scene. **This is subject to the sensitivity sign-off gate in `historical-visual-reference.md` §7.6 like every other R5 decision.** |
| **`A2-D3`, the Dunmore reversal** | Three voices, none of them moral. Do not add a fourth. | No voice in that room argued it on moral grounds. Personal Character does not move on any branch. A man can make the better choice for none of the better reasons, and the epilogue names it and does not launder it. |
| **Inside a Gilt Frame** | Silence, always, in all eight. | The Gilt Frame is not a place he is. It is how he will be remembered, and he is not in the room. |
| **After `A8-D1`** | The Council speaks its last three lines at the resignation and **is silent from that moment through all three epilogue passes.** | The interior argument ends when he gives it back. Nothing in the epilogue is his opinion. |

## 3.7 How this makes hidden stats legible — the argument, stated plainly

Four channels, none of which is a number, all of which are free:

1. **Presence and absence.** Which two-to-four of five speak is a direct function of the vector. Over eight acts a student builds a model of *who I have become* from a cast list, not from a bar.
2. **Order.** The first voice to speak is the loudest thing in his head, 32 times, at the moments that matter most.
3. **Insistence.** A voice at ≥ 0.72 gets the last word. A voice that keeps getting the last word is a diagnosis.
4. **Locked options naming the voice.** The one place the mechanism is made explicit — *and it names an axis, never a score.*

**The expected learning curve, which is what playtest must actually verify:**

- **By Act 3**, students notice the same five names recurring and can name them unprompted.
- **By Act 5**, students notice when a name is *missing*. This is the load-bearing moment and it is the one to instrument in playtest: ask three questions at the Act 5 interlude — *which of the voices have you heard most lately? Has any of them changed? Is there one you have not heard in a while?* If fewer than half of testers can answer the third, the drop rule's threshold is wrong and should be raised from 0.28 toward 0.35.
- **By Act 7**, students predict who will speak before the lines appear, and are right more often than chance.

None of those students will be able to say what their Political Legitimacy is, and every one of them will be able to tell you what kind of man they have been playing. That is the whole design.

---

# 4. THE CONSEQUENCE FEEDBACK CHANNELS, RANKED

Six channels, ranked by how reliably a fifteen-year-old actually perceives them. The ranking is not by fidelity or by cost — it is by **perceptibility**, because a channel nobody notices is not a channel.

| # | Channel | Distinguishable states | Latency | Perceptibility | Art cost | Owner |
|---|---|---|---|---|---|---|
| **1** | **The portrait** | 9 (3 stages × 3 bands) | act boundary | **Very high** — a face, changed, next to its predecessor | 9 images, already budgeted | `02` §6.3 |
| **2** | **NPC lines naming causal links** | ~24 authored | 1–3 acts | **Very high** — it is stated in words | zero | this document, §4.2 |
| **3** | **World wash and mood** | 3 bands, continuous within | act boundary | Medium — felt, rarely articulated | zero (shader) | `02` §3 |
| **4** | **Scene population** | 3 (2 / 4 / 6 figures) | act boundary | Medium-high — emptiness is legible | one crowd sheet per exterior | R13 |
| **5** | **The letterbook** | 7 letters × variant clauses | act boundary, cumulative | Medium — high for the students who open it | zero | R19 |
| **6** | **Council voice volume** | continuous | immediate | Low individually, **very high cumulatively** | zero | §3 |

And the channels this game deliberately does not have, listed so that nobody adds one in month five: no meter, no bar, no orb, no chime, no fanfare, no achievement, no level-up, no floating `+2`, no end-of-act summary screen, no stat comparison, no "you have unlocked", no percentage, and **no congratulation of any kind, ever** (R21).

## 4.1 Channel 1 — the portrait, and the scalar `C`

The portrait is the primary channel because it is the only one that is *a picture of the consequence*. Everything else is a picture of the world.

Per erratum **E-2**, the portrait band is **not** the mood band. It is derived from a dedicated scalar:

```
c_mj = mj/100 ; c_pl = pl/100 ; c_tl = tl/100 ; c_pc = pc/100

C = 0.40·c_pc + 0.25·c_pl + 0.25·c_tl + 0.10·c_mj

portraitBand = LOW  if C < 0.34
               MID  if 0.34 ≤ C < 0.67
               HIGH if C ≥ 0.67
```

Computed from `state.snapshot` at act entry. **No act floor. No act ceiling. No progress term. No fog. No LUT. No mood uniforms.** The portrait answers to the player and to nothing else, which is what `02` §6.1 always intended when it exempted the portrait layer from all nine mood uniforms: *one signal, one cause.*

The weights, justified in one line each:

- **Character at 0.40** — the portrait is his interior, and the four channels a student reads off the face (powder, linen, carriage, light) are all channels of self-government.
- **Legitimacy and Loyalty at 0.25 each** — *linen* answers "is anyone looking after him", and both his household and his army are the answer.
- **Judgment at 0.10** — because a very good general can look like hell, and encoding competence as beauty is the exact failure mode this project is trying to avoid.

**Two mechanisms make the portrait comparable rather than merely felt**, both already specified in `02` §6.4 and both binding here:

1. The new portrait first appears **in the interlude**, on the writing-desk still, where nothing competes with it.
2. The letterbook's **Persons** ribbon retains every past Washington portrait in order, in one spread, so a student can put May 1775 next to March 1783 side by side.

The second is the single highest-value feature in this section. A felt change is deniable; a side-by-side is evidence.

## 4.2 Channel 2 — THE RECKONING LINE

This is the mitigation for the largest identified risk in the project: **that invisible stats plus no fail state reads, to a fifteen-year-old, as "nothing I did mattered."**

Every other channel in this list is inferential. This one is not. It is the game saying, in an NPC's mouth, *here is a thing you did and here is what came of it.*

> **RULE (binding, validator-checked). Every act ships at least one RECKONING LINE: an NPC line that names, in plain language, a specific thing the player did in an earlier scene or act, and a specific consequence that followed from it. The build fails if any act has zero.**

**The specification:**

| Property | Value |
|---|---|
| Minimum per act | **1** |
| Target per act | **3** |
| Maximum per act | **6** — above this it is a lecture, and the student stops believing the world is observing and starts hearing the machine |
| Total in game | **~24** |
| Names | the **decision, by its content**. Never a stat name. Never a number that is a stat. |
| Speaker | an NPC who could **plausibly know**. Never omniscient. Never Washington. Never the Council. |
| Placement | **never at a decision point.** It arrives in ordinary conversation, ideally when the player is not braced for it. |
| Tag | `#reckoning` in the ink source, and `reckoning_for: "A2-D1"` in the knot metadata, so the validator can count them per act and the teacher artifact can quote them |

**The rule that stops it becoming a scoreboard with dialogue:**

> At least four reckoning lines in the game must name a **good consequence arising from a costly decision**, and at least four must name a **bad consequence arising from a decision the player will have felt good about.** If every reckoning line rewards the "right" choice, the channel has become a delayed score display and the student will learn to read it as one.

### 4.2.1 Eight exemplars, one per act

These are reference exemplars establishing register and shape. Final lines are owned by each act's writer; the *count* and the *tagging* are owned by this document.

**Act 1** — Lund Washington, at the dock. *(Reckons a pre-game fact, which is how the grammar gets established before the player has done anything.)*
> "They still print the Great Meadows articles in London, sir. You put your name to a paper in French saying you had assassinated a man, and there is not a coffee-house in England that has let it go since."

**Act 2** — Henry Knox, on the camp street, if `A1-D3` = wore the uniform.
> "They talked about the coat for a week in Philadelphia. Nobody talked about whether you could actually do it. That was the coat's work, and you should know it was the coat."

*If `A1-D3` = civilian dress:* "Half of them still say Colonel Washington, of the Virginia militia. You gave them nothing else to call you, and men will use the name they have."

**Act 3** — a New York officer, reckoning `A2-D1` (the powder).
> "You told the council there were nine rounds a man. It was in a New-York paper by the second week of October. Half my company knew what we had before I did."

**Act 4** — Private Joseph Plumb Martin, at McConkey's Ferry, reckoning `A2-D4` (furloughs).
> "You let us go home in December to talk our neighbours into it. Six of my mess went. Two came back. I don't say it was wrong. I say I counted."

**Act 5** — a soldier at the Grand Parade, reckoning `A4-D1` (the bounty pledged on Washington's own credit).
> "You promised ten dollars in your own name at Trenton. There's men in this camp still waiting on it who'd follow you into the river again tomorrow, because they think a man who promises his own money has some."

**Act 6** — a French officer at the siege lines, reckoning `A5-D1` (inoculation), **the flagship example of a costly decision paying off two acts later.**
> "Your army does not have the smallpox. Do you know what that is worth in a siege line? The Comte's fleet has it. We have it. You made three thousand men sick on purpose four years ago and now you are the only healthy army on this continent."

**Act 7** — an officer at Newburgh, reckoning `A6-D3` (the terms at Yorktown).
> "You denied Cornwallis the honours of war because Lincoln was denied them at Charleston. The officers remember that. They also remember you did not say a word about it afterward, and that is the half they tell their sons."

**Act 8** — James McHenry, in the corridor, reckoning `A7-D2` (Newburgh).
> "There were men in that room in March who had not signed anything yet. You read four sentences and put on a pair of spectacles and they went home. I have thought about it nearly every day since and I still do not know what would have happened."

Note that none names a stat, none names a number, none contains praise from the game, and three of the eight name a cost.

## 4.3 Channels 3–6, and what each is actually for

**Channel 3 — the world wash (`W`).** Fully specified in `02` §3. Its job here is *atmosphere with an alibi*: the student feels the world getting colder without being able to attribute it, because `W` blends morale with time and is floored and ceilinged per act. The alibi is the feature. **`M` is computed from `state.snapshot`, not from live stats** — this document formalises what `02` §3.2 left ambiguous, and it is why Valley Forge's `kAct = 0.60` thaw is dominated by time rather than by mid-act stat wobble.

**Channel 4 — population (R13).** `2 + (band × 2)` figures, low band biased to seated and hunched poses, from one 6-figure crowd sheet per exterior. Emptiness is the single most legible mood signal available for the price of one generation, and it reads instantly at 200 px.

**Channel 5 — the letterbook.** The slowest and deepest channel, and the only one that is also an assessment artifact. Seven interlude letters, each assembled from what the player actually did, in Washington's own SECRETARY hand, with one clause selected by the act's loudest voice. Its power is cumulative: nothing in `I1` lands, and `I7` — the Circular Letter to the States — lands very hard indeed, because by then the student has watched the handwriting get browner for four class periods.

**Channel 6 — voice volume.** Individually near-imperceptible; cumulatively the strongest channel in the game. See §3.7.

## 4.4 The two clocks, summarised for the whole team

> **Inside an act, consequence is private and textual: what he can say, who is arguing, which options are struck through.**
> **Between acts, consequence is public and visual: his face, the weather, how many people are standing in the square.**

If someone proposes a change and cannot say which of those two sentences it belongs to, the change is wrong.

---

# 5. THE EPILOGUE

## 5.1 The conceit: the historical record, as printed

The epilogue is not a summary screen and it is not a report card. It is **a book**.

Specifically: the letterbook closes, and a printed volume opens in its place — a *Life* of the kind that was actually manufactured about this man from the 1790s onward, set in PRINTED register (Libre Caslon Text), on paper, with running heads and chapter rules and, at the front, an engraved frontispiece.

**The book's physical condition is driven by Political Legitimacy alone**, on the act-8-exit value. This is the tightest and most defensible stat-to-object mapping in the game: in 1800, a reputation is *literally* what determined whether a book about you was printed well.

| `band(pl)` | The object | Concretely |
|---|---|---|
| **HIGH** | A subscription quarto | Wide margins, clean impression, even inking, sewn signatures, uncut fore-edge, one engraved frontispiece |
| **MID** | A plain octavo | Adequate impression, narrow margins, some showthrough from the verso, a printer's ornament instead of a rule |
| **LOW** | A cheap pirated octavo | Broken and battered type, over-inked in places and grey in others, heavy showthrough, foxing at the gutter, and a **crude relief-cut frontispiece that does not look much like him** |

**The frontispiece is the Gilt Frame Washington portrait** — the myth face, budgeted once in `02` §6.2 and shown exactly here. At LOW it is **the same plate**, run through a 4-level posterise plus a coarse hatching overlay in the existing R6 shader path. **Zero new assets**, and it produces the best silent joke in the game: at low standing, the myth image itself has degraded into a bad woodcut of a man the printer never saw.

Three rules on the object:

1. **The condition is a register, not a rating.** No student should be able to say "I got the good book." They should be able to say "my book felt cheap," which is a different and much better sentence.
2. **The text is where the content is.** Condition carries mood; the assembled prose carries the argument. Never encode content in condition.
3. **The third pass is not the book.** See §5.4.

## 5.2 Staging: three passes, three objects

`reference-game-analysis.md` §4.1 requires the Obra Dinn grouping — a judgement staged in three, never a single screen of summary. `05` §12 names the three stills. Reconciled:

| | Pass | Object | Still beneath | Score |
|---|---|---|---|---|
| **1** | **What kind of commander** | the book, Chapter XI, two-page spread | the writing desk | enters at +8 s |
| **2** | **What kind of citizen** | the book, Chapter XIV, two-page spread | `AN-01` empty | continues |
| **3** | **The other biography** | **a manuscript ledger, ruled** | `MV-04` at dusk | drops out entirely at the ledger; returns for the final frame |

Between passes: a page turn, 900 ms, and the still holds beneath for four seconds. The passes are **not skippable** — the only unskippable content in the game — and they total 6–8 minutes of reading. Pass 3 is the only one where the object changes, and the change is the argument: **Harry's life was recorded in a ledger, not in a book.** The register shift says that without a word.

## 5.3 The assembly system

The epilogue is **slots filled by authored fragments, selected by state.** No generated prose, no templating with substituted nouns, no mad-libs. Every fragment is written by a human and reads as a sentence a person wrote.

**Total authored: ~46 fragments, ~5,000 words. A student reads ~1,400.**

### Pass 1 — What kind of commander (6 slots)

| # | Slot | Selector | Variants |
|---|---|---|---|
| 1 | Opening — the commander's reputation as the record has it | `band(mj)` | 3 |
| 2 | **The eight sealed decisions, narrated as history** | `decisions[A1-D3 … A8-D1]` | 8 clauses × 3–4 = **27** |
| 3 | The army's account of him | `band(tl)` | 3 |
| 4 | **The recital of fixed losses** | none — **invariant** | 1 |
| 5 | Footnote A — *he did a thing you did not* | first sealed decision where the player diverged | 8 + 1 special |
| 6 | Footnote B — *you did a thing he did not* | first non-historical option taken | 8 + 1 special |

Slot 2 is the spine. **Every student's epilogue names all eight sealed decisions**, in order, as narrative history. The epilogue *is* a transcript of the eight moments the whole class encountered (R11), rewritten as a chapter — which is precisely why the teacher can run a discussion off it with thirty different books in the room.

Slot 4 is the paragraph that is **identical for every student in the room**: the powder that was never there, Long Island lost, the enlistments that expired anyway, the two thousand dead at Valley Forge, the people returned to slavery under Article 10, the pay Congress never voted the money for. It is the R20 recital and it is the teacher's single best whole-class asset.

### Pass 2 — What kind of citizen (5 slots)

| # | Slot | Selector | Variants |
|---|---|---|---|
| 1 | Opening — standing with the civil power | `band(pl)` | 3 |
| 2 | Newburgh | `decisions["A7-D2"]` | 4 |
| 3 | Annapolis, and the words chosen | `decisions["A8-D1"]` three slots | 3 |
| 4 | **The foils** | fixed text; **order** set by `A8-D1` slot 3 | 1 text, 3 orderings |
| 5 | The closing line of the book | `band(pc)` | 3 |

### Pass 3 — The other biography (3 slots)

| # | Slot | Selector | Variants |
|---|---|---|---|
| 1 | **Harry** | fixed, except one clause on whether the player examined him in `A1-S3` and read `DOC-A1.6` | 1 + 2 |
| 2 | The will, and Billy Lee | **fixed** | 1 |
| 3 | The final sentence | **fixed** | 1 |

### 5.3.1 The footnote device

> **RULE. The book speaks of "General Washington" in the third person throughout. The word "you" appears in the epilogue exactly twice, and both times it is in a footnote.**

The two divergence clauses — the thing he did that you did not, and the thing you did that he did not — are set as **footnotes in a smaller PRINTED face at the foot of the page, with a rule above them**, exactly as an annotated edition prints an editor's apparatus.

This is the best structural idea in the epilogue and it does three things at once. It is period-correct. It stages the student's divergence from the documented record as *scholarship* rather than as scoring. And it makes the two most personal sentences in the game arrive in the smallest type on the page, which is the opposite of how a game normally delivers its verdict and is why it lands.

Sample footnotes:

> ¹ *At the Great Meadows he had signed a paper he could not read. You read it. It did not change what he wore to Philadelphia, but it changed what he said when he got there.*

> ² *He proposed the assault on Boston three times and abided the vote three times. You put the men on the ice.*

### 5.3.2 The two special cases

- **Player matched the historical choice at all eight sealed decisions.** Footnote A cannot fire on a sealed decision, so it fires on something outside them: *"In the spring of 1780 he wrote that he had almost ceased to hope. You have no record of that; the game did not ask you, and he did not tell anyone for four months."*
- **Player took no non-historical option at any of the eight.** Footnote B fires the special: *"You did nothing he did not do. That is a stranger result than it sounds. It took him eight years and he was not sure of any of it at the time."*

Both are written to be slightly unsettling rather than congratulatory, because a student who matched the record perfectly has, in the game's own terms, done something a little uncanny, and the game should say so instead of applauding.

## 5.4 What never varies

Stated as a closed list, because every one of these will at some point be proposed as a variant.

1. **The war is won.** No branch, no state, no combination.
2. **The eight fixed losses** are recited in Pass 1, slot 4, identically for every player.
3. **He resigns.** There is no branch that keeps the commission (`05` §8.4, and it is right).
4. **The three foils are named**, all three, always. Only the order varies.
5. **Harry's biography** is fixed. It is not a reward, it is not unlocked, and it does not depend on how well the player played. It is what happened.
6. **He freed no one during the war**, and the 1799 will freed Billy Lee immediately and the rest on Martha's death. Stated once, plainly, and the game stops.
7. **The final sentence** is the same in every playthrough.
8. **The last image** is the Gilt Frame Washington beside the student's own Stage III portrait, side by side, with no text. Always.

## 5.5 The foils

The fixed text of Pass 2, slot 4. This is the payoff of decision #12 and it must not become a grade.

> **Caesar** was offered a crown in the forum, refused it three times before a crowd assembled to watch him refuse it, and was master of Rome until the day he was killed for it.
> **Cromwell** refused the crown and took the title Lord Protector, and named his son to follow him.
> **Napoleon Bonaparte**, who was fourteen years old on the day the commission went back, crowned himself in the presence of a Pope he had summoned for the purpose.
>
> This man rode home.

**The student is never told this is admirable.** The list does that work. Letting them draw the conclusion is the entire difference between teaching and telling.

**Ordering, set by `A8-D1`'s third slot — what he said about himself:**

| The player's Washington said | Named first | Because |
|---|---|---|
| *"retiring from the great theatre of Action"* | **Napoleon** | the man who made it a theatre |
| *"I here offer my Commission, and take my leave of all the employments of public life"* | **Cromwell** | the man who declined the crown and took the office |
| a single sentence and no flourish | **Caesar** | the man whose refusal was the performance |

The ordering is never explained, and roughly no student will notice it. It exists because the ones who replay will, and because the writers should be building a game that rewards the second look.

**The epilogue does not name Cincinnatus.** Gilt Frame 1 named him in Act 1, over an image of a Roman with a plough standing in for a Virginia planter who owned more than a hundred people. The student has had eight acts to notice that the frame was a costume, and saying so now would be the game explaining its own joke.

## 5.6 Sample epilogue text

Both samples are Pass 1, slots 1–2 and 5, plus the head of Pass 2 — roughly what a student reads in the first ninety seconds. They are written to demonstrate the register, the footnote device, and the crucial craft point: **the low-character version is not a scolding. It is a different, colder book, written by someone with less reason to be generous.**

---

### 5.6.1 HIGH character — `pc` 78, `pl` 71, `tl` 66, `mj` 62

> **CHAPTER XI.**
> **Of the Character of the Commander in Chief.**
>
> It is the misfortune of any historian of this war that he must describe an army which for eight years was never once the thing it was reported to be, under a commander who never once reported it otherwise. General Washington came to Cambridge in July of 1775 to find some fourteen thousand men possessed of nine rounds of powder apiece, and his first act upon learning it was to lay the figure before his council of war entire. He was advised, correctly, that the intelligence would be in Boston within the month. It was. He laid it before them notwithstanding.¹
>
> Of the assault upon Boston across the ice, which he proposed three times in one winter and saw voted down three times, it need only be said that he abided the vote. Of New York, that he divided his force across a tidal river in the face of a fleet, and that he got the greater part of it off Long Island in a fog and never afterwards claimed the fog. Of the Delaware, that he was three hours behind his hour, that the surprise was gone before the first boat grounded, and that he went on. Of the winter at Valley Forge, that he ordered three thousand men made deliberately ill with the smallpox, in secret, in front of an enemy thirty miles distant, and could explain it to nobody, and did it. Of Conway and Gates, that he sent Conway one sentence of his own words and said nothing whatever in public, and that this was found in the event to be sufficient.
>
> The men's account of him is not the account given here. Soldiers do not describe a commander; they describe what he cost them and what he did not. From the Connecticut line one hears that he was never once seen to eat better than the officers about him, and from the Pennsylvania line that he was seen, which in that winter was itself remarkable. It is not affection. It is something more durable, and it is why the army was still an army in the spring.
>
> ———
> ¹ *He proposed the assault on Boston three times and abided the vote three times. So did you.*
> ² *In March of 1780 he wrote privately that he had almost ceased to hope. You were not asked, and he told nobody for four months.*
>
> [page turn — `AN-01`, empty, four seconds]
>
> **CHAPTER XIV.**
> **Of his Conduct toward the Civil Power.**
>
> There is no instance in the whole of the war in which the Commander in Chief acted upon an authority he had not been given, and a very great number in which he acted upon an authority nobody had thought to give him, and reported it afterward, and asked to be corrected. Congress could not pay his army. Congress could not feed it, could not clothe it, and could not, at the last, raise the nine states required to vote it the money it had already been promised. He knew this by the winter of 1777 and he never once said it where a soldier could hear him.

---

### 5.6.2 LOW character — `pc` 24, `pl` 29, `tl` 58, `mj` 51

> **CHAPTER XI.**
> **Of the Character of the Commander in Chief.**
>
> Of General Washington's conduct in the field it is by now difficult to write without exciting the resentment of one party or the other, and the present writer, having no interest in either, will confine himself so far as he is able to the returns. At Cambridge, the state of the powder was known to the General in August, to his council in November, and to the Congress not at all; and the reader may judge for himself whether an army of fourteen thousand men with nine rounds apiece was better served by the silence than it would have been by the alarm.¹
>
> Of the assault upon Boston across the ice: he proposed it, his council of war refused it, and he pressed it notwithstanding. It is not the business of this account to say what would have followed had the ice held. Of New York, that he divided his force across a tidal river in the face of a fleet, which he had been advised against by officers who knew the ground better than he did. Of the Delaware, that he went on, and that this is the action upon which his reputation with the common soldier chiefly rests, and that it deserves to. Of Conway and Gates, that he answered them in general orders, by name, before the whole army; and that the business was thereby made public which had until then been merely true.
>
> The men's account of him is warmer than this one, and the reader should weigh it against this one. They will tell you he was at the ferry, and at the ford, and on the road at Trenton with the sleet coming sideways, and that no gentleman of Virginia was obliged to be at any of those places. They are not wrong. It is possible for a man to be worth following and not much worth imitating, and the army appears to have understood the distinction better than the Congress did.
>
> ———
> ¹ *He laid the powder figure before his council entire, and was told it would reach Boston within the month, and laid it before them anyway. You kept the returns as written.*
> ² *You answered Conway in general orders and named him. He sent one sentence and said nothing in public for the rest of his life.*
>
> [page turn — `AN-01`, empty, four seconds]
>
> **CHAPTER XIV.**
> **Of his Conduct toward the Civil Power.**
>
> It has been said of the General that he was jealous of his own dignity, and it must be admitted that he had a great deal of it to be jealous of. Congress could not pay his army; this is the fixed fact of the whole war and no conduct of his could have altered it. What was within his power was the manner of saying so, and the manner of saying so was, on more than one occasion, heard in Philadelphia as a thing said by an army rather than by a man.

---

**What the second sample is doing, and what the writing team must protect:** it is *cooler*, not crueller. It concedes what is true — Trenton is still Trenton, and the army still loves him. It is written by someone with less reason to be generous, and it says one or two things about him that the first book was too polite to say. **At no point does it tell the student they played badly.** A student reading the second book should finish it thinking *that is a harder book about a harder man*, not *I lost*.

---

# 6. NO FAIL STATE, HONESTLY

## 6.1 The problem, stated without euphemism

The brief says: no fail state, but outcome quality varies. The war is always won. Every student reaches Annapolis. The eight sealed decisions are the same eight for everyone and roughly ten choices in the entire game change which scenes are visited (R11).

So: **what, precisely, varies?** If the answer is only "the fog is greyer," the design is dishonest and a bright fifteen-year-old will work that out in Act 4 and disengage for four class periods.

## 6.2 The ten dimensions of variance

Enumerated so the team can point at them, and so a reviewer can check that an act actually delivers several.

**1. Who Washington is.** Nine portraits, and a Council whose composition, order and insistence differ. Two students finishing Act 8 have watched two different men. This is the primary variance and it is the one the game is actually about.

**2. What the army believes about him.** NPC opening registers, the population count in every exterior, and which reckoning lines fire. A low-Loyalty Act 5 is not a harder Act 5; it is a *lonelier* one.

**3. The cost in named men (R22).** Casualty figures written in Washington's own hand in the letterbook vary within authored bounds, and every death in the game has a name and one biographical fact. The variance the student perceives is not "I lost 12% more units," it is that the letter to Congress contains a name they had spoken to.

**4. How the same victory was paid for.** 27 battle beats across Acts 4 and 6, each with three authored LOW/MID/HIGH variants. Trenton is taken in every playthrough. Whether the Hessians turn out under arms before the guns are down King Street, whether the columns arrive together, whether the men who freeze on the road are two or five — all of that varies, none of it changes the outcome, and it is the difference between a victory and a near thing.

**5. What Washington was able to say.** The count of options actually available at the eight sealed decisions ranges from **24 to 32** across playthroughs, driven by knowledge flags and voice locks. **A poorly-read, badly-governed Washington has literally fewer sentences.** This is the most underrated variance dimension in the design and it is entirely free.

**6. What is in the letterbook.** Seven letters, each assembled from what the player did, each carrying a voice-selected clause. `I1` — the 18 June 1775 letter to Martha — contains the real line *"far from seeking this appointment, I have used every endeavour in my power to avoid it."* If the player told Martha in `A1-D1` that he expected to be chosen, the student watches him write a lie. Same letter, same words, completely different act.

**7. Which relationships exist.** The Persons ribbon, and `allied_warmth` at Yorktown determining whether the French appear in the beat text as allies, colleagues, or creditors.

**8. What the record says.** The epilogue book's condition, its ~46 fragments, and its two footnotes.

**9. What the student knows.** 51 documents, 13 observation flags. This is the variance the *teacher* cares about most and it is the one that is directly countable.

**10. Which foil is named first.** One line, no consequence, and the only variance in the game authored purely for the second playthrough.

## 6.3 What does not vary, and why that is the point

> **R20, restated as the load-bearing rule of this section: every act contains at least one outcome the player cannot improve.**

The eight, from `05` §11: the house is unfinished and he will not see it finished · there is no powder · Long Island is lost · the enlistments expire anyway · roughly two thousand men die · the people who reached the British lines are returned to slavery under Article 10 · Congress never pays · he goes home and frees no one.

The historiographic argument, which the team should be able to make to a sceptical teacher in two sentences: **the outcome of the war was substantially overdetermined** — French intervention, British strategic exhaustion, three thousand miles of ocean, and a war aim that required occupying a continent rather than defeating an army. **What was genuinely contingent was what kind of institution and what kind of precedent came out of it.** A game that let the student lose the war would be teaching a counterfactual; a game whose variance is entirely in *cost and character* is teaching the actual historical question. The no-fail-state constraint, which arrived in the brief as a pedagogical accommodation, turns out to be the historiographically correct design.

And the corollary, which is the reason R20 exists at all: **a game where good play produces good outcomes everywhere teaches that the Revolution was easy and inevitable, which is the exact misconception the unit exists to dismantle.**

## 6.4 Three anti-scoreboard rules for the build

The game forbids scoreboards. Scoreboards get in anyway, through the back door, in the source. Three rules:

1. **No field in any content or save file ranks a state.** No `quality`, no `tier`, no `score`, no `best`, no `optimal`, no `good_ending`. Epilogue fragments are keyed by content (`ep.p1.s2.a2d2.pressed`), never by valence. Enforced by a lint rule on a word list (§8, check 24).
2. **No debug overlay ships.** Dev builds get a stat readout; the production define strips it. A shipped debug key is a scoreboard with a shortcut.
3. **The game never congratulates the player (R21).** The reward for a good decision is that the next scene is marginally less awful and one NPC's tone warms by one register. No chime, no toast, no "well done", no fanfare on the Trenton victory, no music sting at Yorktown that is not already the act's score cue.

We accept that some students will replay to find "the good ending." **The design's answer is that the good ending is not withheld — it is a different book, not a better one.** A student who replays to compare two books has, without noticing, performed a comparison of two accounts of the same events, which is the skill the whole unit is for.

---

# 7. ASSESSMENT

## 7.1 What this system can honestly give a teacher

Stated first, because overselling it to a district is how the project loses the credibility it spends eight acts earning:

**This game does not measure learning.** It produces **evidence of engagement** and **a writing sample**, and it makes both legible without any backend, any account, or any student data leaving the device. That is a great deal more than most classroom software delivers and it is not the same as an assessment instrument. Say so in the teacher documentation, in those words.

What it produces:

| Artifact | What it evidences | Countable? |
|---|---|---|
| **The letterbook** — 7 letters + the resignation address | Voice, causal reasoning, use of period evidence | No — it is a writing sample |
| **The Documents ribbon** — 51 cited primary sources | Which sources this student actually read to the last line | **Yes** |
| **The eight sealed decisions** | What this student chose at the eight moments the whole class encountered | **Yes** |
| **The epilogue** — three passes | The comparison to the documented record, generated as a discussion prompt | No — it is a prompt |
| **The observation flags** — 13 | Whether this student looked at the world or walked through it | **Yes** |

## 7.2 The teacher-facing artifact: THE COMMISSION SHEET

A single printable page, **generated entirely client-side**, available from the letterbook's endpapers at any act boundary and automatically offered after the epilogue.

**Contents, in order:**

1. A **name field** the student types. It stays in localStorage. It is never transmitted.
2. **The passport code**, printed in nine groups of four — so the work is both verifiable and resumable, and so a lost Chromebook is not a lost unit.
3. **The eight sealed decisions**, each stated as one sentence of plain English naming the question and what *this* student chose. No stats, no evaluation, no marks. Example: *"Boston, February 1776 — the ice would bear men. You put it to your council of war and abided their vote."*
4. **The documents read**, as a **bibliography**: full title, author or issuing body, and date, in a standard citation form. Not "37/51 found" — a list of real sources with real dates, which is a bibliography a student can be asked to use in an essay. This is the highest-value item on the sheet.
5. **The seven letterbook letters**, full text.
6. **Three short-answer prompts**, generated from this student's own divergences from the record. These are not generated prose — each is an authored prompt attached to a specific decision-option pair, and there are 32 of them in `content/prompts.json`. Example, fired by `A2-D2` = *press the assault*: *"You pressed the assault on Boston after your council of war voted it down. Washington proposed it three times and deferred three times. Give one reason he might have deferred that has nothing to do with the ice."*
7. **The epilogue's two footnotes**, quoted.

**Delivery, with no backend and no download API:**

- **Print to PDF.** The sheet is a print-stylesheet-first HTML page; `Ctrl+P` → *Save as PDF* is the workflow every Chromebook in every district already has, and the resulting PDF goes into Google Classroom exactly like every other assignment.
- **Copy as text.** A single button places the entire sheet on the clipboard as plain text, formatted for pasting into a Doc. This is the fallback for locked-down print configurations and it takes four lines of code.
- **No network call is made at any point.** Verify this in the CSP and state it in the district-facing documentation: *the sheet is assembled in the browser from localStorage and contains no telemetry, no identifiers, and no transmission.*

## 7.3 The rubric

Four criteria, applied to the letterbook, mapped to the frameworks already named in `05` §14. Deliberately short — a rubric a teacher will not use is worse than none.

| Criterion | Looks like | Anchor |
|---|---|---|
| **Claim** | The letters take a position on what the army needed and why | RH.1 |
| **Evidence** | The letters reference specific documents the student actually read | RH.8 · the Documents ribbon corroborates |
| **Perspective** | The student can say why Washington's account of an event differs from a soldier's or a delegate's | RH.6 · D2.His.4 |
| **Consequence** | The student can trace one decision to one outcome across at least two acts | D2.His.16 · use a reckoning line as the prompt |

## 7.4 Two more things the teacher gets, free from the architecture

**The act-jump entry.** R24 guarantees every scene is authorable and testable in isolation from the global state object. That makes a teacher's *"jump to Act 5"* actually work, with a **plausible authored state vector per act** rather than the starting vector — so a class beginning at Valley Forge on day three of the unit gets a Washington who has already been somewhere. Eight authored vectors, in `content/entry-states.json`, each a defensible middle-of-the-road playthrough. This is the one place `applyDelta` is bypassed.

**The teacher's key.** A static page at `/teacher`, authored not generated: the eight sealed decisions, what Washington actually did at each, the two-to-four-line historical note, and two discussion questions apiece. Sixteen questions, one page, printable. It is the whole unit's discussion plan and it costs one afternoon of writing.

---

# 8. VALIDATOR ADDITIONS

Appended to `04-scene-architecture.md` §9's CI spec, continuing its numbering.

| # | Check | Fails on |
|---|---|---|
| 19 | **Reckoning lines** | Any act with 0 knots tagged `#reckoning`; any act with >6 |
| 20 | **Reckoning valence** | Fewer than 4 reckoning lines tagged `valence: good_from_costly` or fewer than 4 tagged `valence: bad_from_comfortable` |
| 21 | **Knowledge lock locality** | Any knowledge-locked option referencing a `doc.*` or `obs.*` flag not obtainable in the same act |
| 22 | **R2 separation** | Any document node with a nonzero stat delta; any decision node writing to `state.knowledge` |
| 23 | **Answer-key guard** | Fewer than 3 of the 8 knowledge-locked options tagged `historical: false` |
| 24 | **Scoreboard lint** | Any content or save key matching `/score|tier|quality|rank|optimal|best_|good_ending/i` |
| 25 | **Direct stat write** | Any assignment to `state.stats.*` outside `stats.ts` or `entry-states.json` |
| 26 | **Determinism** | Two runs of the eight-act script from a fixed decision list producing different final vectors |
| 27 | **Council drop floor** | Any decision whose authored set, after the drop rule, could resolve to fewer than 2 voices |
| 28 | **Duty coverage** | Any of the 8 sealed decisions without an authored Duty line |
| 29 | **Rejoinder length** | Any rejoinder >14 words |
| 30 | **Council silence** | Any council slot or decision council block inside an R5 scene, a Gilt Frame, or after `A8-D1` |
| 31 | **Epilogue coverage** | Any sealed-decision option without a Pass 1 slot-2 fragment; any epilogue fragment unreachable from every state |
| 32 | **Persistence caps** | >12 standard decisions or >8 characterization choices marked `persist: true` |
| 33 | **Passport round-trip** | Encode → decode of 10,000 random valid states not producing identity |

Checks 22, 24, 25 and 27 should exist in week one, before there is any content to fail them. Check 31's second clause — *any epilogue fragment unreachable from every state* — is the one that will actually find bugs, because it catches the fragment whose selector nobody updated after a decision's options changed.

---

# 9. ERRATA, OPEN ITEMS, AND THE VERIFICATION QUEUE

## 9.1 Errata issued against existing documents

| # | Document | Edit |
|---|---|---|
| **E-1** | `04-scene-architecture.md` §6.5 | Replace the five Council ink hexes with `02-art-direction.md` §2.5's contrast-validated values. |
| **E-2** | `02-art-direction.md` §3.6 | Replace the "Portrait band" row. The portrait is driven by `C` (§4.1 of this document), not by `W`. |
| **E-3** | `02-art-direction.md` §3.2 | Apply `05-act-scene-inventory.md` §0.1's act-order edits. |
| **E-4** | `02-art-direction.md` §3.2 | State explicitly that `M` is computed from `state.snapshot`, not from live stats. |

## 9.2 Open items owned elsewhere

1. **The three additional reckoning lines per act** beyond the minimum are owned by each act's writer and nominated at act sign-off.
2. **Two more `historical: false` knowledge-locked options** are owed, assigned to Acts 3 and 6 (§2.3).
3. **The 13 observation flags** need naming; 2 exist (`obs.boston.seven`, and one at `MT-04`).
4. **The 32 short-answer prompts** in `content/prompts.json` are a writing task of roughly 1,200 words and are owed before any classroom pilot.
5. **The eight act-entry state vectors** in `content/entry-states.json` are owed before the teacher build.
6. **The R5 Council-silence rule** (§3.6) requires the sensitivity sign-off gate in `historical-visual-reference.md` §7.6, like every other R5 decision.

## 9.3 Verification queue — historical claims this document makes

Run to source before content lock. These are the claims on which the Council's historical defensibility rests, and a teacher will check at least two of them.

| # | Item | Where to resolve |
|---|---|---|
| **V-7** | Jefferson to Walter Jones, 2 January 1814 — exact wording of the "naturally irritable and high toned" passage, including the original spelling of *ascendency* and *it's* | Founders Online, *Papers of Thomas Jefferson* |
| **V-8** | GW to John Augustine Washington, 31 May 1754 — exact wording of "I heard Bulletts whistle"; and the attribution of George II's reported riposte, which reaches us through Horace Walpole and should be presented as such or not at all | *Papers of George Washington*, Colonial Series; Walpole, *Memoirs* |
| **V-9** | *Rules of Civility* — the count of 110, the c.1744–48 copying date, the 1595 French Jesuit source and its English transmission, and the exact text of Rules 1 and 110 | Mount Vernon; the Founders Online transcription of the schoolboy manuscript |
| **V-10** | Gilbert Stuart's remark on Washington's features indicating ungovernable passions — earliest attestation and whether it is Stuart's or his daughter's. **[ANEC]** If it cannot be firmly sourced, it is removed from the Temper brief and no Council line depends on it | Dunlap, *History of the Rise and Progress of the Arts of Design*; Mount Vernon's treatment |
| **V-11** | Monmouth, 28 June 1778 — what is actually attested about the rebuke of Charles Lee, versus the late-attested swearing anecdote. **Present dated and attributed or not at all**, per the standing rule on the Honeyman literature | Lee's court-martial record; Lafayette's account; the 1830s recollections and their dates |
| **V-12** | The Shirley journey, February 1756, and the sequence of GW's attempts at a royal commission — dates and outcomes | *Papers of George Washington*, Colonial Series |
| **V-13** | The 3 June 1776 congressional pressure to hold New York — exact form, so that Duty's `A3-D1` line is defensible as institutional rather than invented | *Journals of the Continental Congress*; Washington's correspondence with Hancock, June–August 1776 |

Item **V-13** blocks the single most important Council line in the game (§3.2, Duty wrong at `A3-D1`). It should be resolved first.

---

## Appendix A — The complete loudness table, for implementation

All terms normalised to 0–1 from the **live** stat values. Evaluated at every decision point and at every council slot.

```ts
const loudness = (s: Stats) => {
  const mj = s.mj/100, pl = s.pl/100, tl = s.tl/100, pc = s.pc/100;
  return {
    AMBITION:  0.60*mj + 0.40*(1 - pc),
    RESTRAINT: 0.55*pc + 0.45*pl,
    TEMPER:    0.55*tl + 0.45*(1 - pc),
    DUTY:      0.50*pl + 0.50*pc,
    VANITY:    0.65*(1 - pl) + 0.35*mj,
  };
};
```

| Threshold | Effect |
|---|---|
| `L < 0.28` | **Dropped** from an authored decision set, while ≥2 voices remain |
| `L ≥ 0.42` | Typical ambient council-slot firing threshold (slot-authored, range 0.30–0.75) |
| `L ≥ 0.72` | **Rejoinder** — a second line of ≤14 words after all others have spoken |

At the starting vector (`48/55/40/60`): Ambition 0.45, Restraint 0.58, Temper 0.40, Duty 0.58, Vanity 0.46. **Duty and Restraint open the game as the loudest voices, and Temper opens as the quietest.** That is the correct Washington to hand a student in May 1775, and every subsequent shape of the chorus is something they did.

---

## Appendix B — Authoring word budget owned by this document

| Item | Count | Words |
|---|---|---|
| Council lines — ambient slot variants | ~300 | ~8,400 |
| Council lines — decision sets | ~102 | ~2,850 |
| Council lines — rejoinders | ~48 | ~650 |
| Interlude letter voice-clauses | 35 | ~900 |
| Reckoning lines | ~24 | ~1,000 |
| Epilogue fragments | ~46 | ~5,000 |
| Short-answer prompts (teacher artifact) | 32 | ~1,200 |
| **Total** | | **~20,000** |

Approximately **15% of the 110,000–140,000-word game budget**, spent on the systems that make the other 85% legible. That ratio is correct and should be defended when the schedule bites.
