# Reference Game Analysis — "Feel, Not Surface"
### What we are actually stealing from Disco Elysium, Pentiment and Kentucky Route Zero, stated as buildable rules
**Version 1.0 — 14 August 2026**
**Owner:** Creative Director / Narrative Lead. **Audience:** everyone. §5 is binding on the whole team.

---

## 0. The thesis

The client asked for Disco Elysium's *feel* without its *surface*. That sentence is only useful if we can say what the feel is made of. Here is the finding of this document, up front:

**Disco Elysium's feel is not produced by its painting. It is produced by four structural facts, none of which are visual:**

1. **The protagonist's interior is a cast of characters, not a narrator.** Thought is dramatised as argument between named parties. The player watches themselves think.
2. **Density is measured in words per square metre, not in square metres.** Martinaise is a few city blocks. The script is over a million words. The world feels vast because you cannot exhaust it, not because you cannot cross it.
3. **The world's response to your internal state is continuous and unannounced.** Nothing says "your Empathy is high." Instead, more things speak to you, and the things that speak say different things.
4. **Failure is content, not punishment.** A lost check produces a different, often better, scene. The game is never withholding the good version.

All four transfer to an ink-and-wash, fixed-camera, AI-art-constrained, no-fail-state history game. **None of them cost art.** That is the whole reason this document exists: every element of DE's feel that we want is cheap in exactly the dimension where we are poor (image assets) and expensive in exactly the dimension where we are rich (writing, structure, in-engine logic).

Conversely, the elements of DE we cannot afford — 24 skills, dice, a levelling economy, twelve game-over states, an open district — are precisely the ones that would fight the brief's retained principles (no fail state, no scoreboard, always Washington). The pivot away from DE's surface is therefore not a compromise. The parts we're dropping are the parts we shouldn't have wanted.

Three secondary findings that shape everything below:

- **Pentiment proves you do not need voice acting** to make a text game feel performed, provided the *typography itself* carries character. It also proves that a small team can hold a period style across a 25-year story by making the style a hard constraint rather than a target.
- **Kentucky Route Zero is our closest structural relative** — fixed tableaux, a walkable figure inside a composed shot, cuts rather than traversal, and a tiny art budget carried by composition and light. Its most valuable single idea is that most choices should define *the past*, not branch *the future*.
- **Where the Water Tastes Like Wine is the cautionary tale**, and the client has already made the correct call by shrinking the maps (decision #8). Its fatal flaw was distance between content. We must codify that as a number, not a sentiment.

---

# 1. Disco Elysium, deconstructed

## 1.1 The interior-voice system

**What it actually is.** Twenty-four skills across four attributes (Intellect, Psyche, Physique, Motorics). Each skill is a *character* with a name, a voice, a portrait and an agenda. They are not stats that gate options — they are speakers that interrupt the transcript.

**How they interrupt.** Two modes, and the distinction matters enormously:

- **Passive checks** fire silently against the dialogue's difficulty. On success, the skill *speaks into the conversation transcript* as a new line, attributed by name, in the skill's colour. It provides a fact, an instinct, a suspicion, or an argument. Higher skill = more interruptions = a busier, more crowded head. Passive successes frequently *open new dialogue options* that would not otherwise exist.
- **Active checks** are a visible, deliberate dialogue option that the player selects, resolved by 2d6 + skill + modifiers against a stated difficulty. **White checks** can be retried after the relevant skill rises or the world state changes; **red checks** are one-shot and permanent.

**Why it works.** The player is not told they are impulsive; they *experience* Electrochemistry shouting. Stats become legible as personality without ever surfacing as numbers in the fiction. And because voices disagree with each other, every scene contains a genuine argument even when there is only one NPC in the room. It is the cheapest possible way to make a small place feel populated.

**The presentation details that do the work.** The skill's name is set in its own colour and paired with an identifying portrait, so the reader parses *who is speaking* before they parse *what is said*. Interjections are short — a sentence or two — so they read as intrusions, not essays. The transcript is a scrolling log, so the argument accumulates and can be re-read.

### TRANSFER: YES — this is the project's spine.

Decision #12 already commits to **Washington's Internal Council**. This section specifies it.

**Five voices, not twenty-four.** Twenty-four is a levelling economy; five is a chorus. Five is also the maximum number of distinct ink colours that remain distinguishable in a three-value wash palette.

| Voice | Ink colour | Emblem | Speaks about | Loudness formula |
|---|---|---|---|---|
| **AMBITION** | faded vermilion | a spur | the decisive stroke, opportunity, glory, the risk worth taking | `+Military Judgment, −Personal Character` |
| **RESTRAINT** | Prussian blue | a bridle bit | waiting, the Fabian option, what is not yours to take | `+Personal Character, +Political Legitimacy` |
| **TEMPER** | burnt iron-gall red-brown | a struck flint | contempt, fury, the thing he must not say | `+Troop Loyalty, −Personal Character` |
| **DUTY** | indigo | a folded commission | Congress, the civil power, the oath, the men | `+Political Legitimacy, +Personal Character` |
| **VANITY** | yellow ochre | a hand mirror | reputation, posterity, how this will look | `−Political Legitimacy, +Military Judgment` |

Two non-obvious specifications:

**(a) Vanity gets louder when Washington is doing badly.** Its loudness is *inversely* proportional to Political Legitimacy. This is psychologically true of the historical man, and it is a legibility engine: a player whose standing has collapsed does not see a red number, they notice that a preening voice will not shut up. That is the single best example in the project of "consequence, not scoreboard."

**(b) The *set* of voices that speaks is the readout, not what they say.** At a decision point, exactly **two to four** voices speak. Never one — that is not a chorus. Never all five — if everyone speaks, the composition carries no information and the screen is noise. Which two-to-four appear is a direct, unannounced function of the four hidden stats. A student who has played three acts will start to notice that Duty has gone quiet. They will not be able to say why, and that is correct.

**Accessibility constraint on colour.** The five ink colours must be distinguishable in greyscale and to the ~8% of male students with a red-green deficiency. Vermilion and burnt red-brown are the collision risk. Mitigation: every voice name is *always* accompanied by its emblem glyph (a 16×16 wash-drawn mark from a single 4×4 sheet — see the art guide's prop-sheet method), and the five colours are assigned distinct luminance values, ochre lightest through indigo darkest. Colour is a reinforcement, never the sole channel.

**Length.** Every Council interjection is **≤ 28 words**. Longer than that and it stops reading as an intrusive thought and starts reading as narration. Washington's Council is a heckler's gallery, not a seminar.

**Voice does not equal choice.** Council lines never present a choice of their own. They colour the choices the *scene* already offers. This is a hard scope-control rule: without it, five voices × every decision point produces a combinatorial authoring load we will not survive.

## 1.2 Skill checks — and the fact that we are not having any

DE's checks are dice. Ours cannot be, for two reasons. First, the brief's "no fail state, but outcome quality varies" is incompatible with randomness: a student who gets a bad roll learns *the game is unfair*, not *leadership under uncertainty is hard*. Second, in a classroom, two students at neighbouring desks making the same decision and getting different outcomes is a pedagogical liability, not a feature.

### TRANSFER: RESTRUCTURED. Keep the *frisson* of a hidden number; remove the dice.

**The locked-option display.** When a dialogue option exists but the stat state does not support it, it appears **greyed, struck through with a single fine rule, prefixed with the responsible voice's emblem**, and carries a margin line:

> ~~"You will hang for this, sir, and I will watch."~~
> *— Temper is not loud enough to say this.*

This is the exact emotional payload of a DE locked check: you can see the road you cannot take, and you can see *which part of yourself* is insufficient. No number appears. No dice are rolled. The student learns the axis, not the score.

**The retry loop, and why it is the best mechanic in the project.** DE's white checks reopen when you level up. Ours reopen when you **find and read a primary source**. Decision #12 already establishes that documents unlock dialogue options rather than granting stats; combine it with the locked-option display and you get a loop where *the way to have more to say is to go read the archive*. A greyed option that reads *"— you have not read Dunmore's Proclamation"* is a history assignment disguised as an RPG mechanic, and it is the single strongest argument this game has for existing.

Two categories of lock, therefore, and they display differently:

- **Voice-locked** (stat-driven): greyed with a voice emblem. Cannot be forced open in the current act. This is DE's red check.
- **Knowledge-locked** (document-driven): greyed with a small folded-letter glyph. *Always* openable by going and finding the thing. This is DE's white check. Never lock a knowledge-gate behind a document that is not findable in the current act.

**Sealed vs open decisions.** DE hides the red/white distinction until you are inside the check. We surface it, deliberately. Any decision that permanently forecloses a branch displays a **red wax seal glyph** next to the choice list *before* commitment, plus a one-line margin note: *"This will not come again."* Two justifications: dread is a better teacher than regret in a 45-minute class period, and a teacher needs the moment to be visible so they can stop the room and discuss it. There are **eight sealed decisions in the game, one per act**, and no more.

## 1.3 Text density

Over one million words across a district you can walk across in ninety seconds. The Whirling-in-Rags ground floor alone contains more prose than most games contain in total. The feeling of vastness is entirely manufactured by the impossibility of exhausting a small space.

### TRANSFER: YES, scaled to a classroom budget.

We cannot write a million words and we do not need to. But the *ratio* is the thing to preserve, and it must be stated as numbers or it will not happen.

**Authored word budget:**

| Unit | Target | Notes |
|---|---|---|
| Whole game | **110,000 – 140,000 words** | ~⅛ of DE against ~1/10 the scope. Comparable to a short novel. |
| Per act | **13,000 – 17,000** | Acts 5 (Valley Forge) and 8 (Annapolis) skew high — they have no battle to carry them. |
| Per scene (~5 scenes/act, ~40 total) | **2,600 – 3,400** | This is the number that matters. |
| Consumed on a single playthrough | **35 – 45%** | If a student can read everything, the scene is too thin. |
| Council interjection | ≤ 28 words | |
| Examine text, single object | 40 – 120 words | |

**Density floor, per scene, enforced at content review:**

- **≥ 12 interactables** on the walk-plane (objects, people, doors, distances).
- **≥ 8** of those carry unique examine text of ≥ 40 words.
- **≥ 1** carries text that **contradicts** something an NPC in that same scene says, with neither marked as true.
- **≥ 3** carry text that changes depending on stat band or act progression (write the variant, don't write the excuse).
- **≥ 1** is a primary source that unlocks a knowledge-locked dialogue option elsewhere in the act.

That last-but-one item is where the project will be tempted to cheat. Don't. Variant examine text is the cheapest possible way to make the world feel like it is watching you, and it costs zero art.

## 1.4 Camera

Fixed isometric. No rotation, ever. Mouse-wheel zoom within a clamped range. The camera follows Harry with a soft lag rather than locking to him. A late-game Thought ("White Mourning") grants an additional 20% zoom-out — a *perceptual* upgrade as a reward, which is a lovely and underused idea.

### TRANSFER: PARTIAL. We are more constrained than DE, on purpose.

Decision #3 nails the camera to a composed view. Specification:

- **No rotation. Ever.** Not a slider, not a debug key that ships.
- **No player-controlled zoom.** DE can afford it because its world is modelled geometry; ours is painted layers that will reveal their seams under scrutiny.
- **Ambient motion:** a parallax dolly of **≤ 4% of frame width**, driven off Washington's position on the walk-plane, critically damped with a ~250 ms time constant, never 1:1. The composition breathes; it does not pan. The art guide's 12.5% overscan on shipped layers exists to feed this and nothing else.
- **One scripted camera move per act, maximum**, reserved for that act's emotional apex — a slow push or a slow lateral reveal, 4–7 seconds, ease-in-out. This is Kentucky Route Zero's discipline (§3.2). The rarity is the entire effect. Acts 5 and 8 may spend theirs on a move so slow the student is not sure it is happening.
- **DE's zoom-as-reward, transferred:** after the map table is introduced in Act 2, holding a key on any exterior brings up the **surveyor's overlay** — contour hachures, sightlines and distances drawn over the diorama in the `wshmap` style. It is a perception upgrade, it is thematically Washington-the-surveyor, and it reuses the second LoRA. Scope it to **12 exteriors**, one overlay layer each, not all 40.

## 1.5 Ambient audio and score

Sea Power's soundtrack was written to be ambient, free-form and mood-setting rather than structured, and explicitly not to overpower the dialogue. It won a BAFTA. It is doing an enormous share of the melancholy. Beneath it, DE's location ambience is dense and specific — wind through a hole in a wall, a generator, gulls, the sea.

### TRANSFER: YES. In a game with no voice acting, the score does the work VO would do.

We are not funding VO (Pentiment demonstrates this is fine — see §2.5). That makes audio the *only* non-visual affective channel, and it must be treated as a primary discipline rather than a garnish.

**Instrumentation law.** Solo viola da gamba and cello, low clarinet-family woodwind, tuned percussion, sustained drone, fortepiano. Restrained, unresolved, small ensemble — the audio equivalent of a three-value wash over a confident line.

**The fife-and-drum rule.** Fife and drum are **diegetic only** — a drummer visible in the camp, a signal heard across a valley, always positioned in the scene's ambience mix. **Never in the score.** The instant fife-and-drum appears non-diegetically, the game acquires the register of a patriotic documentary montage and every ounce of melancholy evaporates. This one rule is worth more than the rest of the audio spec combined.

**Deliverables and budget:**

- **10 score cues**: 8 act themes + title + epilogue. 90–150 s each, seamless loop, no cold ending.
- **1 ambient bed per scene** (~40 cues), 30–60 s, seamless, mono.
- **3–6 spot one-shots per scene** on randomised 10–40 s timers, panned to their source object on the walk-plane.
- Encode: OGG Vorbis, mono, 64 kbps for beds and spots; stereo 96 kbps for score. **Total audio payload ≤ 12 MB** across the whole game, lazily loaded per act alongside the art chunk.

**The silence rule.** At least one scene per act carries **no music bed at all** — ambience only. Act 8 (Annapolis) carries no score whatsoever until its final beat. Silence is a colour you can only use if you have established the palette, and this is the mechanism by which the resignation lands.

## 1.6 The UI's framing

DE's interface is a case file: a dialogue panel, a scrolling transcript, health and morale orbs, a character sheet, and the Thought Cabinet as a grid of slotted cards that *internalise over time*. The body type is a plain, comfortable reading face; the decorative art-nouveau lettering is reserved for the logo and chapter cards. That split is deliberate and correct — decoration at the frame, legibility at the centre.

### TRANSFER: YES, restructured around a single object.

**The game has exactly one meta-UI object: the LETTERBOOK.** A bound quarto volume, four ribbons:

| Ribbon | Contents |
|---|---|
| **Correspondence** | Washington's own authored letters, accumulating across acts (decision #12). Written *by the game* in response to what the player did. |
| **Documents** | Every primary source found. Marked when a document has unlocked something. |
| **Persons** | Portrait roster. Each entry shows what Washington currently knows and thinks about that person — this is where relationship state becomes visible without a meter. |
| **Maps** | The survey sheets. Entry point to the map-table scenes. |

No inventory. No journal. No quest log. No settings menu that is not inside the book's endpapers. **One object, four ribbons.** The Thought Cabinet's job — making internal state into a browsable artefact — is done by *Correspondence*, and it is done better, because the artefact is a real historical form and every entry is also a writing sample the teacher can assess.

**HUD:** none. Zero persistent on-screen interface during play except a **single ribbon-end glyph in the lower-right corner**, 32×32, that opens the letterbook. DE needs orbs because DE can kill you. We cannot. Nothing else earns a permanent place on screen.

**Type split, following DE's logic:** decoration at the frame, legibility at the centre. Full spec in §2.2.

## 1.7 How the world responds to internal state

DE's world does not have a "mood setting." It has a thousand small conditionals: which objects speak, what the ambient descriptions notice, whether an NPC opens with warmth or wariness, whether Harry's hands shake. Nothing is announced.

### TRANSFER: YES — but achieved with shaders and counting, not with paintings.

The brief asked for maps that change with stats. The art guide (§5.3) prices a second painted plate at a full generate-slice-encode cycle. Here is the affordable version, in descending order of cost-effectiveness:

1. **Population count (free).** Every exterior ships **one 6-figure population set** — six background billboards cut from a single crowd sheet, per the art guide's sheet method. The number instantiated at runtime is `2 + (morale_band × 2)`, so 2 / 4 / 6 figures, and the low-morale set is biased toward the seated and hunched poses. Zero additional art. This is the single most legible mood signal in the game and it costs one generation.
2. **Grade (near-free).** Per-act LUT, fog colour and fog density are already in the pipeline. Bind fog density and LUT mix to the derived mood value. A three-value wash under heavier cool fog reads as a genuinely different day.
3. **Prop presence (cheap).** Six togglable props per scene drawn from the act's prop atlas — a fallen tent, an empty ration barrel, a burning brazier, a stack of muskets. Toggled by mood band.
4. **Text variants (free, and the best of the four).** Examine text and NPC opening lines vary by band. Words are the cheapest art in the project. Spend here first.
5. **A second painted plate (expensive).** Reserved for **eight named apex scenes**, one per act, and nowhere else. 8 scenes × 5 layers = 40 additional images, which is affordable inside the art guide's ~200-asset envelope. Nominate them at act sign-off and never expand the list.

## 1.8 Failure

DE has twelve game-over screens and they are *funny*. Failing a check routinely produces better writing than passing it. The game is never withholding the good version behind a success.

### TRANSFER: YES — this is the mechanic that makes "no fail state" honest.

"No fail state" degrades into "no consequence" unless failure is *authored content*. The rule that prevents this:

**Every act contains at least one outcome the player cannot improve.** Long Island is lost. Men die at Valley Forge no matter how well you played Act 4. Congress does not pay the army, ever, in any run. These fixed losses are the structural guarantee against triumphalism, and they are what makes the wins mean anything. A game where good play produces good outcomes everywhere is a game that teaches that the Revolution was easy and inevitable, which is the exact misconception the unit exists to dismantle.

**And the game never congratulates the player.** No "Well done." No fanfare, no chime, no achievement toast. The reward for a good decision is that the next scene is marginally less awful and one NPC's tone warms by one register. That is precisely DE's mechanism, it is free, and it is the difference between a game about leadership and a game about points.

---

# 2. Pentiment, deconstructed

## 2.1 Staged framing and scene composition

Pentiment is a 2D game whose scenes are composed as flat, near-frontal illuminated-manuscript pages — architecture presented in cutaway, characters moving laterally across a shallow stage. Limited-frame animation is used deliberately: it preserves the illustrated look and makes characters read as figures *living inside a page* rather than as animated sprites laid over one. The art draws on late-medieval manuscripts, early print and woodcut — Dürer, Bosch, Bruegel, the Nuremberg Chronicle, the Getty's manuscript holdings.

### TRANSFER: YES — this is decision #4's justification, and decision #6's.

Two specific lessons:

**(a) Limited animation is an aesthetic position, not a budget excuse.** Pentiment's characters do not move smoothly, and that is *why* they look like manuscript figures. Our segmented paper-puppet rig (decision #6) is the same bet. Codify it: the puppet rig animates on **12 fps, stepped**, not on the render framerate. Smooth interpolation on a painted cutout reads as Flash animation; stepped motion reads as a mechanical paper puppet, which is a real historical object and a coherent aesthetic claim. This also drops per-frame CPU on Chromebooks, which is a pure win.

**(b) Frontality is a style, not a limitation.** Pentiment refuses perspective wherever the manuscript tradition refused it. Our near-frontal theatrical elevation for interiors (decision #4) should be similarly unapologetic — a *flatter* interior reads as period draughtsmanship, whereas a nearly-correct perspective reads as an AI model that couldn't quite do perspective. Push interiors flatter than feels comfortable. The style must look chosen.

## 2.2 Typography as characterization

The headline achievement. Six custom typefaces — Peasant, Cursive, Humanist, Printed, Textura, Thread Puller — commissioned from Lettermatic, with a very high proportion of individually hand-drawn glyphs and positional alternates so that letterforms differ by their place in a word. Each face encodes the speaker's class and education. Uneducated speakers write slowly and make spelling errors *visible on screen*, sometimes struck out and corrected. Text appears letter by letter, entering as shimmering wet black and settling to a duller ink that bleeds slightly into the parchment. These are clues: typography is evidence in a murder mystery.

### TRANSFER: YES, and it is the highest-value idea in this document after the Council.

We cannot commission six faces. We do not need to. The characterisation is carried by *difference between registers*, not by bespoke drawing. **Four registers, all OFL-licensed and free:**

| Register | Face | Used for | Treatment |
|---|---|---|---|
| **PRINTED** | Libre Caslon Text | Broadsides, newspapers, Congressional resolutions, Paine's *Common Sense* | Clean. Slight ink-spread. Justified, period-loose word spacing. Long ſ in reproduced source text only, with a glossary gloss. |
| **SECRETARY** | IM Fell English | Washington's own hand — the letterbook, his orders, his marginalia | Per-glyph rotation ±1.2°, baseline jitter ±0.6 px, alpha 0.86–1.0, multiply blend into the paper texture. |
| **ENGROSSED** | Petit Formal Script | The commission, the surrender articles, the resignation address | Display sizes only, never body copy. Used exactly four times in the game. |
| **ROUGH** | IM Fell English, degraded | Soldiers' journals, ration logs, the anonymous Newburgh Address | Rotation ±3°, baseline jitter ±1.8 px, alpha 0.55–0.9, occasional doubled letterform. Copy contains authentic period misspellings. |

**The rule that makes this work: the register is never explained in prose.** The game does not say "this was written by an uneducated soldier." The ROUGH hand says it. A student who notices that the anonymous Newburgh Address is set in a *disguised* hand — neither Washington's secretary hand nor a printed broadside — has performed an act of document analysis without being told they were doing one. That is Pentiment's exact trick and it is entirely free to us.

**Body UI type is a separate question and gets a separate answer.** Following DE's split: decoration at the frame, legibility at the centre. Council interjections, dialogue options and system text are set in a **plain, high-legibility humanist sans at 19 px** on the 1600×900 logical grid. The period faces are for *documents and authored letters* — things the fiction says are physical objects. Never set a dialogue option in IM Fell English. A 15-year-old with dyslexia in period 4 on a 1366×768 Chromebook panel is the reader we are designing for, and they cannot parse jittered blackletter-adjacent type at speed.

All four period faces ship subsetted to Latin-1 + the specific archaic glyphs we use, WOFF2, **≤ 240 KB total**.

## 2.3 Chapter breaks and the passage of time

Pentiment's three acts sit in 1518, 1525 and 1543–44 — seven years, then eighteen. Sawyer's stated intent was to stay in one community long enough that generations turn over and seeds planted in Act 1 become trees. The mechanism is: same place, same camera framings, different people in them, different state. Recurring "meal" scenes structure the social life of Acts 1 and 2 and are dropped in Act 3, partly because Act 3's time scale is compressed and partly because the meals were *expensive art*.

### TRANSFER: YES. Two lessons, one of them a warning.

**(a) The same composition, revisited, is the cheapest and most powerful time-passage device that exists.** Our war runs 1775–1783 and the brief already returns to places. Formalise it: **at least four scenes in the game are revisited in a later act using the identical plate**, with changes carried entirely by figures, props, grade and text. Valley Forge's parade ground in December vs. May is the obvious one, and it's already in the brief. Add: the Mount Vernon dock in Act 1 and again in the epilogue. The emotional payload of a returned-to composition is enormous and the marginal art cost is a prop toggle.

**(b) The warning: Sawyer dropped the meals because the art was expensive.** A recurring set-piece that requires bespoke art per instance will get cut in Act 6 when the schedule bites. Design every recurring device to be *cheaper each time it recurs*, not equally expensive. Our recurring devices — the letterbook interlude, the map table, the Council — all satisfy this: each new instance is text and data, not images.

**The interlude structure.** Kentucky Route Zero puts short, formally-different interludes between its acts; Pentiment uses time skips. We take both, cheaply: **seven interludes, one between each pair of acts.** Each is a single still — Washington's writing desk, one composition, one plate, lit differently each time — over which a letter he is writing composes itself in SECRETARY hand, its content assembled from what the player actually did in the act just finished. No walking, no choices, 60–90 seconds, skippable after 5.

Seven interludes cost **seven images total** and they carry all of the passage-of-time work, all of the letterbook thread, and all of the "what did I just do" reflection that a classroom needs between sessions. This is the highest value-per-asset item in the project. It is also the natural save point and the natural end of a class period.

## 2.4 Dialogue UI

Text appears letter by letter, at a readable pace, in the speaker's own hand, positioned as if written on the page. There is an in-line glossary for unfamiliar historical terms, widely praised as an accessibility feature.

### TRANSFER: YES, with a hard classroom modification.

**Reveal:** 45 characters/second, and **any input instantly completes the current block**. A global "instant text" toggle lives in the letterbook's endpapers and persists in the passport code. Pentiment's reveal is charming across 40 hours of adult play; across 45 minutes with thirty teenagers it becomes an obstacle within four minutes. Keep the effect, make it free to skip, never make a student wait for the machine.

**In-line glossary — adopt wholesale.** Any historical term, office, unit or person is underlined with a faint dotted rule; hovering or tapping opens a **25–60 word margin gloss** in the same style as an annotated edition. This is differentiated instruction for free: the strong reader ignores it, the struggling reader gets scaffolding, and the required vocabulary of the unit becomes discoverable rather than lectured — which is the brief's §7 principle, satisfied by a UI affordance.

**Chunking:** no text block exceeds **55 words on screen at once**; measure held to **58–66 characters** per line. DE's wall-of-text paragraphs are for adults reading a novel on a couch. Break ours.

## 2.5 Making reading feel like an activity

Pentiment has no voice acting. Reading does not feel like a chore because the text is *diegetic* — it is a manuscript, and you are looking at it — and because the reading is *evidential*: hands, errors, corrections and letterforms are clues in a mystery. The player is not consuming text, they are examining a document.

### TRANSFER: YES. This is the load-bearing pedagogical insight of the whole reference set.

The move is to convert *reading* into *examining*. Concretely, in our game:

- Every primary source in the game is a **physical object with a physical presentation** — blank aged paper generated by the pipeline, type composited in-engine at runtime (art guide §5.1). It is never a pop-up box of white text.
- Documents are **evidence for something**, always. A document that does not unlock a dialogue option, contradict an NPC, or change an examine string is cut. There are no "flavour" documents. This is a content-review gate, not an aspiration.
- Documents can be **wrong**. Intelligence reports in Act 3 are frequently inaccurate; that is what intelligence was. A student who acts on a report and finds it false has learned more about 1776 than any correct document could teach.
- Selectable, searchable, screen-reader-accessible text falls out of the in-engine-type decision for free, and it is a genuine US school accessibility requirement.

---

# 3. Kentucky Route Zero — the structural model

This is the closest existing thing to what we are building, and the section the team should read twice.

## 3.1 Scene architecture

Five acts and five interludes, by a team of three (Jake Elliott, Tamas Kemenczy, Ben Babbitt). Kemenczy's GDC 2014 talk frames the whole design as **scenography** — the theatre discipline of building stage pictures — citing Pamela Howard's *What is Scenography?* and set designers like Boris Aronson. Certain environments are staged so that the scenery itself forms a **proscenium arch** around the action.

The architecture, stated plainly:

- The unit of the game is the **scene**, not the level. A scene is one composed view with a defined set.
- The player character walks within that composed view. Traversal is *within* the tableau, not between tableaux.
- Transitions between scenes are achieved by **cuts, lighting changes, and sets physically sliding on and off** — the game is explicit about being a stage. There is no loading corridor, no walking down a road to the next place.
- Scenes are often **short**. Some are a single conversation in a single room. Some are a single image with three lines of text. The game does not feel obliged to make every location a "level."

### TRANSFER: YES — this is our scene model, verbatim.

Specification, matching the art guide's ~40-diorama envelope:

- **~5 scenes per act, ~40 total.** Some acts are 3 (Act 8), some are 7 (Act 4, which is the showpiece).
- A scene is **one plate, sliced into 5 depth layers (L0–L4)**, one walk-plane, 1–4 exits.
- **A scene may be as small as one room and one conversation.** Resist the instinct to make every scene "worth" its plate. KRZ's confidence in the short scene is what lets it have variety on a tiny budget. Our Act 8 (Annapolis) should be three scenes, one of which is a corridor with one NPC in it.
- **Cut = space. Fade = time.** Hard cut (1 frame, with a 220 ms crossfade on the *audio bed only*) when walking to an exit. A 900 ms fade to paper-white **exclusively** for act breaks and time skips. Never a fade between two adjacent rooms; never a cut across a time skip. Once the player learns this grammar — and they will learn it inside one act, without being told — every fade acquires weight.

## 3.2 Camera cuts and the rare slow move

KRZ's camera is fixed per tableau and moves rarely. When it does move, it moves slowly and it *reveals* — pulling back to disclose that the room you are in is inside something larger, or drifting laterally so the scene unfolds as a single unbroken take. The scarcity is the effect.

### TRANSFER: YES — see §1.4. One scripted move per act, maximum, at the apex.

The reveal-pullback in particular is worth one deliberate use: **Act 7, Yorktown.** The siege lines diorama pulls back over six seconds to disclose the French fleet on the horizon, and the shot resolves into the map-table view. That is the game's single most expensive camera moment and it should be the only one anyone remembers.

## 3.3 Choices that define the past, not the future

KRZ's most-copied idea and its least-understood. A large proportion of KRZ's dialogue choices do not branch the plot at all. They decide **what a character remembers**, what an object *meant*, what happened before the game started, what a room smells like. The state they alter is tone and backstory, surfacing later as changed text — not as changed events.

### TRANSFER: YES. This is how we get DE's sense of consequence on a school budget.

**Binding production rule: at least 40% of all dialogue choices in the game are characterization-only.** They alter stats and they alter later *text*, but they do not branch the scene graph. **No more than ten choices in the entire game change which scenes are visited.**

The arithmetic is the argument. A game with 200 branching choices is unshippable by this team. A game with 200 choices of which 80 are characterization-only, 110 are stat-and-text, and 10 are structural is shippable, and it will feel *more* authored than the branching version, because the writing budget goes into density rather than into redundant coverage of branches most students will never see.

This also solves a pedagogical problem the brief creates. "No fail state" plus heavy branching means most students see a minority of the content and the teacher cannot predict what any given class has encountered. A mostly-linear scene graph with dense, highly variable text means every student sees the same *eight decisions* — which the teacher can then discuss with the whole room — while each student's Washington is genuinely different.

## 3.4 Magical-realist transitions

KRZ's most striking transitions are impossible ones: a room turns into another room; a lift descends past floors that should not exist; the camera pulls back and the set is revealed as a stage. They work because the game establishes early that its reality is negotiable.

### TRANSFER: SEVERELY LIMITED — and this is a discipline call.

We are a history game. Our reality is *not* negotiable; that is the entire pedagogical contract. An impossible transition in a history game reads as a bug or as fantasy, and either one costs us the teacher's trust.

**The game contains exactly one class of non-literal transition, and it is the MAP-TABLE LIFT.** Washington looks at the map; the painted diorama recedes and desaturates; the survey sheet rises into frame and becomes the genuine-3D map-table scene (decision #5). It is our one impossible move, it happens perhaps six times across the game, and it is justified by the fact that Washington was a surveyor and *did* think about terrain this way. That justification is why it reads as characterisation rather than as a special effect.

No other non-literal transition ships. If a scene seems to want one, it wants better writing.

## 3.5 Economical art

KRZ's art is flat-shaded, low-polygon, heavily silhouetted, with a tightly limited palette per scene and characters rendered as small dark shapes with almost no facial detail. It is one of the best-looking games of its decade and its art was made by essentially one person. The economy comes from **composition, silhouette and light** carrying everything that detail would otherwise carry.

### TRANSFER: YES, and it validates a decision the art guide has already made.

Our characters sit at ~200 px in a 900 px frame — they are silhouettes with a wash on them, exactly like KRZ's. Consequences:

- **Character readability is silhouette plus costume value, never facial detail.** Every character's silhouette must be identifiable at 200 px in solid black. Test it: render the cutout as a pure black shape at ship scale and show it to someone who has read the script. If they can't name them, the design is wrong — change the hat, the coat's skirt, the posture, the prop. This is a 10-minute test and it will save the project from a cast of interchangeable men in tricorns.
- **Never write a beat that requires reading a face on the walk-plane.** Facial performance happens exclusively in the portrait layer. If a scene needs a flicker of expression, it needs a portrait cut-in.
- **Palette per scene, not per game.** KRZ's scenes each commit hard to 3–5 colours. The art guide's per-act palette plates should be pushed further: each *scene* nominates a dominant, a recessive and one accent from the earth palette, and the in-engine LUT enforces it. This buys unity across AI-generated plates for free, and it is the difference between "a set" and "a pile."

---

# 4. Secondary references

## 4.1 Return of the Obra Dinn — constraint as identity

Lucas Pope built a 3D game rendered in 1-bit black and white at 800×450, chasing the look of a Macintosh Plus. Two decisions carried it: **outline everything** (black outline against white, white outline against black, so geometry is always readable), and **lock the dither pattern to the 3D camera** so patterns don't crawl and flicker as the view moves. He states the motive plainly: working alone, he could not compete on fidelity, so he picked a constraint that was nobody else's.

**Structural lesson:** a hard visual constraint becomes an identity *if it is enforced without exception*. The moment Obra Dinn allowed one anti-aliased element, the whole claim would have collapsed. Our equivalent: **the ink line is our outline**, and it is non-negotiable. The ink line must never be blurred, never non-uniformly scaled, never faded below full opacity, never rendered with bloom or glow. Every DOM-layer UI element must also carry an ink line or it will visibly not belong.

**And the load-bearing technical lesson, which we would otherwise discover in month five:**

> **Paper grain is a single full-screen, screen-space overlay applied AFTER compositing, at a fixed pixel density. It is never baked into layer textures.**

This is Pope's dither-locking problem exactly. If paper grain lives on the L0–L4 layer textures, then five layers at five parallax depths will show grain at five different apparent scales, moving at five different speeds, during every dolly. The illusion that the whole scene is one sheet of paper — which is the entire premise of the art direction — dies the first time the camera breathes. One overlay, screen space, locked. Same for the vignette and any wash-edge treatment.

**Second structural lesson:** Obra Dinn gates its deductions in groups of three to prevent brute-force guessing, and reveals confirmation only when three are correct together. Transfer: **the epilogue's reckoning is revealed in three passes, not one dump** — first what kind of commander, then what kind of citizen, then the comparison to the documented Washington. A single screen of summary text is a report card. Three staged reveals is a judgement.

## 4.2 Norco — static screens, and a warning about second systems

Each Norco location is a largely static pixel-art scene containing people, doors, objects and interaction points; players examine, converse, collect and travel by clicking those points. It also ships a "Mindmap" — a journal where the player connects memories, NPCs and plot points to unlock dialogue.

**Transfers:** the static-scene-with-interaction-points model is ours, minus the point-and-click (we walk). Norco's real achievement is that a tiny team produced a world that reads as coherent because the chosen style has a **low fidelity ceiling that hides drift between assets**. That is precisely the argument for ink-and-wash over oil impasto in decision #1, and it generalises into a rule: *prefer any art decision that lowers the fidelity ceiling, because it raises the floor.*

**Does not transfer — and this is the warning.** Do not build the Mindmap. A second UI system for connecting ideas is a large build, it duplicates what the letterbook already does, and in Norco it is largely optional and largely ignored. **The letterbook is the only meta-system.** If a connection between two documents matters, the game should make it in prose, in Washington's own hand, in the interlude letter.

## 4.3 Citizen Sleeper — clocks, and the economics of naming

Gareth Damian Martin's game, art by Guillaume Singelin, paper-prototyped with index cards and dice. Actions are tied to locations on a static station map; each cycle grants dice whose faces determine what you can attempt; progress and threat are tracked by **clocks** — circular segmented meters borrowed from *Blades in the Dark* — representing reputation, relationships, pursuit, decay.

**Transfers:**

- **Clocks: yes, twice, and only diegetically.** A siege *is* a clock, and the second parallel at Yorktown advancing toward the British works is the most honest progress meter in military history. The other is Newburgh: the number of signatures on the officers' petition. Both are drawn objects inside the fiction — hachures on the map table, names on a sheet — never a UI bar. **Two clocks in the whole game.** Any third proposal is a scoreboard wearing a hat, and the brief forbids scoreboards.
- **Dice: no.** See §1.2.
- **Node-map traversal instead of walking: no.** The embodiment of walking is what makes "in Washington's shoes" a true statement rather than a title.
- **The real lesson: naming is the cheapest density there is.** Citizen Sleeper has almost no art — one station map and a few dozen portraits — and reads as a rich world because every location has a name and every name has a voice. Our version: **every interactable in the game has a proper name, not a category.** Not "a soldier" but "Private Joseph Plumb Martin, Connecticut line." Not "a cannon" but "the eighteen-pounder they call *Old Sow*." Zero art cost, enormous density gain, and it forces the writer to do the research.

## 4.4 80 Days — authoring architecture

Roughly 750,000 words, structured as episodic, order-agnostic content hung off a route system, authored by Meg Jayanth and Jon Ingold in inkle's **ink** scripting language (later open-sourced). The postmortem's key structural claim: the episodic design meant scenes could be written out of order, the team could scale content in any direction, and writers did not step on each other.

**Transfers:**

- **Use ink.** Author all dialogue, examine text and Council logic in ink; compile to JSON; run **inkjs** (~50 KB gzipped) in the browser. Decisive reasons: it is a mature, battle-tested weave-based narrative language designed for exactly this content shape; it gives us variables, conditionals and includes without inventing a JSON dialect; it has a good authoring tool (Inky) that a writer or the teaching client can use without touching TypeScript; and it decouples content iteration from engine builds entirely, which is the brief's §5 requirement. The alternative — a bespoke JSON dialogue schema — costs three weeks of engine time to reach a worse place.
- **The structural rule that made 80 Days possible:** every scene must be authorable and testable in isolation, reading **only** from the global state object, never from "what scene came before." No scene may assume its predecessor. This is what allows parallel authoring, per-scene QA, and — critically for a classroom product — a teacher's "jump to Act 5" debug entry that actually works.
- **Does not transfer:** route choice. 80 Days' spine is a branching map. Ours is eight fixed acts in fixed order. Do not add route selection; the war did not have one and the curriculum does not want one.

## 4.5 Where the Water Tastes Like Wine — the cautionary tale

An anthology of American folklore with an all-star writing cast, strong press, awards, and a commercial disaster documented in Johnnemann Nordhagen's postmortem — it sold fewer copies than he had Twitter followers. Two design causes matter to us:

**(a) Distance between content.** The game placed excellent short stories across a continent-scale map and made the player traverse it. The writing was very good; the walking between the writing was very long. This is the exact failure mode that decision #8 exists to prevent, and it needs to be a number, not a value.

> **Maximum 8 seconds of walking at normal speed from a scene's entry point to its farthest interactable.** If a scene exceeds it, the scene is too big — cut it in half or move the walk-plane, do not speed up the walk.

At our walk speed on a 1600×900 frame, 8 seconds is roughly two-and-a-half screen widths of walk-plane, which is generous for a composed tableau and tight enough that no student ever crosses empty ground. Enforce it with an automated check on the walk-plane spline length at scene load in dev builds.

**(b) No consistent voice.** An anthology of great writers produced a game with no single interiority. Our counter-rule:

> **One writer owns every Council line in all eight acts.** NPC dialogue may be distributed; Washington's interior may not. The Council is the player's continuous experience of being one specific person, and the moment Restraint sounds different in Act 6 than in Act 2, the character dissolves.

---

# 5. SYNTHESIS — the binding design rules

These are binding. Deviations require sign-off from the Creative Director and a note in the decision log.

**R1 — Locked dialogue options name the voice, never a number.** Greyed, struck, prefixed with the voice's emblem, with a margin line: *"Restraint is not loud enough to say this."*
> *Rationale:* delivers Disco Elysium's locked-check frisson while satisfying the brief's absolute ban on visible scores.

**R2 — The only way to open a knowledge-locked option is to find and read a primary source. Documents never grant stats.**
> *Rationale:* converts the archive into the game's progression system; a history assignment wearing an RPG's clothes.

**R3 — Every scene contains at least one examinable object whose text contradicts something an NPC in that scene says, with neither marked as true.**
> *Rationale:* source conflict is the core skill of the discipline, and it makes the world feel observed rather than authored.

**R4 — At every decision point, exactly two to four of the five Council voices speak. Never one. Never all five.**
> *Rationale:* the *set* of voices is the stat readout; a full chorus carries no information and a single voice is not a chorus.

**R5 — Vanity's loudness is inversely proportional to Political Legitimacy.**
> *Rationale:* it is psychologically true of the man, and it makes a collapsing reputation audible without a meter.

**R6 — Council interjections are ≤ 28 words and never present a choice of their own.**
> *Rationale:* longer reads as narration, not intrusive thought; and voice-generated choices are a combinatorial authoring load we will not survive.

**R7 — Cut means space; fade means time. Never fade between two rooms; never cut across a time skip.**
> *Rationale:* a grammar the player learns in one act without being taught, which then makes every fade land as loss.

**R8 — One scripted camera move per act, maximum, at that act's emotional apex. All other camera motion is a damped parallax dolly of ≤ 4% frame width.**
> *Rationale:* Kentucky Route Zero's discipline — the rarity is the entire effect, and a nailed camera is what makes the AI art hold up.

**R9 — Maximum 8 seconds of walking from a scene's entry point to its farthest interactable.**
> *Rationale:* Where the Water Tastes Like Wine died of distance between content; this is that lesson as a number an automated check can enforce.

**R10 — Paper grain, vignette and wash-edge treatments are single full-screen, screen-space overlays applied after compositing. Never baked into layer textures.**
> *Rationale:* Obra Dinn's dither-locking problem — five parallax layers with baked grain produce five crawling grain scales and destroy the one-sheet-of-paper illusion on the first dolly.

**R11 — At least 40% of dialogue choices are characterization-only and do not branch the scene graph. No more than ten choices in the whole game change which scenes are visited.**
> *Rationale:* Kentucky Route Zero's economy; it also guarantees every student in the room encounters the same eight decisions the teacher wants to discuss.

**R12 — Mood is a LUT, a fog value, a prop list and a text variant — not a second painting — except in eight named apex scenes, one per act.**
> *Rationale:* the brief's stat-driven mood shift, priced to fit the ~200-asset art envelope.

**R13 — Every exterior ships one 6-figure population set; the count instantiated is `2 + (morale_band × 2)`, biased toward seated poses when low.**
> *Rationale:* presence is the most legible mood signal available and this version costs one generation for the whole game.

**R14 — Fife and drum are diegetic only, never score.**
> *Rationale:* non-diegetic fife-and-drum instantly converts the game into a patriotic documentary montage and vaporises the melancholy we are buying.

**R15 — At least one scene per act carries no music bed. Act 8 carries no score at all until its final beat.**
> *Rationale:* silence is a colour you can only spend if you have established the palette; it is how the resignation lands.

**R16 — Four typographic registers — Printed, Secretary, Engrossed, Rough — and a document's register is never explained in prose.**
> *Rationale:* Pentiment's central achievement, obtained free from four OFL faces; the type performs the document analysis the student is meant to learn.

**R17 — Period faces are for documents only. All dialogue, Council and system text is set in a plain humanist sans at 19 px, ≤ 55 words per block, 58–66 character measure.**
> *Rationale:* the reader is a fifteen-year-old on a 1366×768 panel in period 4, not an adult with a couch and forty hours.

**R18 — Text reveals at 45 chars/sec; any input completes the block instantly; a global instant-text toggle persists in the passport code.**
> *Rationale:* keep Pentiment's effect, remove its cost — no student ever waits for the machine.

**R19 — One meta-UI object: the letterbook, four ribbons. No inventory, no journal, no quest log, no second connection system. Zero persistent HUD except a 32 px ribbon glyph.**
> *Rationale:* Disco Elysium's dossier framing plus Norco's Mindmap warning; the Thought Cabinet's job is done better by Washington's own correspondence.

**R20 — Every act contains at least one outcome the player cannot improve.**
> *Rationale:* the structural guarantee against triumphalism; without fixed losses "no fail state" degrades into "the Revolution was easy."

**R21 — The game never congratulates the player. The reward for a good decision is that the next scene is marginally less awful and one NPC warms by one register.**
> *Rationale:* Disco Elysium's exact mechanism, free to build, and the line between a game about leadership and a game about points.

**R22 — Every interactable has a proper name, not a category, and every death has a name and one biographical fact.**
> *Rationale:* naming is the cheapest density available (Citizen Sleeper), and anonymous suffering is set dressing while named suffering is history.

**R23 — At least one genuinely funny beat per act, always sourced to a documented anecdote. No anachronistic quips.**
> *Rationale:* an unremittingly solemn classroom game is a disengaged classroom; sourcing the humour kills the Marvel-quip failure mode dead.

**R24 — Every scene is authorable and testable in isolation, reading only from the global state object. No scene may read "what scene came before."**
> *Rationale:* 80 Days' architecture; it is what permits parallel authoring, per-scene QA, and a working "jump to Act 5" for teachers.

**R25 — One writer owns every Council line across all eight acts.**
> *Rationale:* Where the Water Tastes Like Wine's anthology problem; Washington's interior is the one thing that must never change hands.

---

# 6. Melancholy without grimdark; honesty without a textbook

## 6.1 What Disco Elysium's moral weight is actually made of

It is not made of suffering. DE is full of suffering but the suffering is not the mechanism. The mechanism is:

- **A world that has already lost.** The revolution failed fifty years before the game starts. Everyone is living in the aftermath of a defeat they did not personally cause.
- **A protagonist who has already failed** before frame one, and who cannot un-fail.
- **Small kindnesses that do not fix anything** and are worth doing anyway.
- **Political seriousness.** DE takes ideologies seriously enough to satirise them, which is a form of respect. It never flattens anyone into a lesson.
- **Beauty admitted in the ruin.** Shivers, the skill that lets the city itself speak, exists solely so the game can be lovely about a place that is falling apart.

Grim-for-grim's-sake is what happens when you keep the suffering and drop the other four. A game with corpses as set dressing, no agency, and nothing worth doing is not Disco Elysium; it is the aesthetic of Disco Elysium with the soul removed.

## 6.2 Our version, and why the Revolution is a good fit

The American Revolution supplies all five without invention:

- **The war is being lost for most of its duration.** 1776 and 1777 are catastrophes. Act 3 is a defeat, Act 5 is starvation, Act 6 is the army nearly turning on the republic it made. The showpiece — Trenton — is 2,400 men attacking a garrison because there was nothing left to try.
- **Washington has already failed.** Fort Necessity, 1754. He surrendered, and he signed a French document he could not read admitting to assassination. The game can open Act 1 with a man who has been publicly humiliated and is being offered command anyway.
- **Small kindnesses that fix nothing.** The inoculation order. Getting one letter to one soldier's family. Neither wins the war; both are the whole of what a commander can actually do on a given Tuesday.
- **Seriousness about the politics.** Congress is not a comedy of incompetence; it is a body with no power to tax, doing its best inside a constitutional design that does not work. The Articles' weakness is a recurring beat (decision #12) and it is a *tragedy of institutions*, not a joke.
- **Beauty in the ruin.** The style is already this. Ink and wash on bare paper is a melancholy medium; the art direction is doing half the tonal work before a word is written.

## 6.3 The anti-textbook rules

**On slavery.** This is the hardest call in the project and it must be made explicitly rather than drifted into. The relevant scholarship — Learning for Justice's *Teaching Hard History* framework is the operative standard for US secondary classrooms — is unambiguous that treating slavery as a footnote to the founding is itself the failure mode. The rules:

1. **Enslaved people are never quest-givers, never fetch-quest targets, and never a source of stat gain for Washington.** No interaction with an enslaved person may improve any of the four stats. The brief's instinct is right; make it mechanical, because a stat reward would teach that decency toward enslaved people is instrumental.
2. **They have documented names.** William (Billy) Lee, Ona Judge, Hercules Posey, Christopher Sheels, Caroline Branham. Using real, sourced individuals from the Mount Vernon record is the anti-sanitisation move, and it is verifiable by any teacher who checks.
3. **Billy Lee is present in every act.** Historically he was — he was with Washington for the entire war. The UI never remarks on it. That silence is the point, and the epilogue is where it is named.
4. **The player can never free anyone during the war**, because Washington did not. The game must not offer a fantasy of absolution; an educational game that lets a student "fix" slavery through play has taught them something false about how history works and something worse about how change happens.
5. **The Dunmore reversal is a decision Washington actually made, presented with his actual reasoning.** After Dunmore's Proclamation, Washington reversed his opposition to Black enlistment — for military reasons. The Council argues it honestly: Ambition and Duty for, Vanity against, Restraint uneasy. And the epilogue states plainly that the reversal was pragmatic, not moral. Refusing to launder it is what buys the game its credibility.
6. **The only truthful lever is discomfort.** Washington's recorded unease grows across the war and surfaces in the letterbook, never as a stat, never as redemption.

**On violence.** The style is an asset here: a three-value wash over a confident line is constitutionally incapable of rendering viscera, and looks *wrong* if pushed toward it. Use that.

- Violence happens **off-frame, in the aftermath, and in the ledger.** The Delaware crossing and Trenton are the showpiece, and the showpiece is the *crossing* — ice, dark, cold — not the bayoneting.
- Casualties are delivered as **numbers written in Washington's own hand in the letterbook**. Reading *"we have lost three hundred"* in your own handwriting, in a letter you are composing to Congress, is heavier than any depiction and is trivially defensible to a school board.
- No gore, no on-screen executions, no depicted violence against enslaved people, no sexual violence. Desertion and the hanging of deserters are *referenced in dialogue* — Washington did order executions, and omitting it would be a lie — but never staged.

**On tone.** Two failure modes to guard against by name:

- *Marble Washington.* Prevented by the Council: Temper and Vanity exist specifically so the student watches a great man be petty, furious and self-regarding, and then choose otherwise anyway. That choosing-otherwise is the actual lesson of his life, and it is only visible if the alternative is audible.
- *Misery tourism.* Prevented by R20 and R23 together: fixed losses keep it honest, and one sourced piece of dry humour per act keeps it human. Von Steuben's documented "I can curse them no more; come and swear for me," Knox's bulk, Washington's own flatly cutting letters. Period-sourced, never anachronistic.

## 6.4 Where the line is, concretely

**IN:** the words *slavery* and *enslaved*; named enslaved individuals from the documented record; whipping referenced in dialogue; smallpox inoculation and its real mortality risk; desertion and executions referenced; starvation, amputation and disease referenced; Washington's temper, ambition, vanity, and errors; Congress's failure to pay the army; the Newburgh conspiracy as a genuine threat to the republic; profanity limited to *damned* and *hell*, both period-accurate and mild.

**OUT:** any depicted violence against an enslaved person; sexual violence; on-screen executions; gore; any sequence positioning the student as the perpetrator of an atrocity for gameplay purposes; anachronistic profanity; any implication that the student's choices could have ended slavery.

**The test, and it is a good one:** *Could a teacher project this on a classroom wall and defend it to a parent in one sentence?* If the sentence is "because that is what happened, and here is the source," it ships. If the sentence needs a paragraph, it does not.

## 6.5 The epilogue

The comparison to Caesar, Cromwell and Napoleon (decision #12) is the payoff, and it must not be a grade. Rules:

- Revealed in **three passes** (Obra Dinn's grouping): what kind of commander, what kind of citizen, then the comparison to the documented record.
- It must state **at least one thing the historical Washington did that the student's Washington did not**, and at least one the student's did that he did not. Neither is scored. The comparison is the content.
- The foils are named with what each of them *did* with victory — Caesar took it, Cromwell became it, Napoleon crowned himself — against a man who rode home. The student is not told this is admirable. The list does that work on its own, and letting them draw the conclusion is the whole difference between teaching and telling.

---

## Sources

- [Skills — Disco Elysium Wiki](https://discoelysium.wiki.gg/wiki/Skills)
- [Disco Elysium: Skill checks — gamepressure](https://www.gamepressure.com/disco-elysium/skill-tests/zfe3e2)
- [Disco Elysium RPG System Analysis — Gabriel Chauri](https://www.gabrielchauri.com/disco-elysium-rpg-system-analysis/)
- [Disco Elysium's Script Is Over A Million Words Long — GamingBolt](https://gamingbolt.com/disco-elysiums-script-is-over-a-million-words-long)
- [Disco Elysium (soundtrack) — Wikipedia](https://en.wikipedia.org/wiki/Disco_Elysium_(soundtrack))
- [Disco Elysium: User Interface — gamepressure](https://www.gamepressure.com/disco-elysium/user-interface/z5e3e8)
- [Thought Cabinet — Disco Elysium Wiki](https://discoelysium.fandom.com/wiki/Thought_Cabinet)
- [It's okay to fail in Disco Elysium — Destructoid](https://www.destructoid.com/its-okay-to-fail-in-disco-elysium/)
- [Map of Martinaise — Disco Elysium Wiki](https://discoelysium.wiki.gg/wiki/Map_of_Martinaise)
- [Pentiment — Lettermatic](https://lettermatic.com/custom/pentiment)
- [How Pentiment's hand-crafted fonts give pen and ink a voice — PC Gamer](https://www.pcgamer.com/how-pentiments-hand-crafted-fonts-give-pen-and-ink-a-voice/)
- [Pentiment director explains how going all-in on fonts helped elevate the medieval detective RPG — Game Developer](https://www.gamedeveloper.com/design/pentiment-director-explains-how-going-all-in-on-fonts-helped-elevate-the-medieval-detective-rpg-)
- [Deep Dive: Behind the evocative medieval manuscript art of Pentiment — Game Developer](https://www.gamedeveloper.com/art/deep-dive-the-art-of-pentiment)
- [Pentiment: An Interview with Josh Sawyer — SHARP News](https://sharpweb.org/sharpnews/2022/12/07/pentiment-an-interview-with-josh-sawyer/)
- [Pentiment's Accessibility Features Make History Fun — GameRant](https://gamerant.com/pentiment-accessibility-features-good-fonts-glossary/)
- [GDC Vault — Scenography of Kentucky Route Zero (Tamas Kemenczy)](https://www.gdcvault.com/play/1020596/Scenography-of-Kentucky-Route)
- [Video: How theater influenced the design of Kentucky Route Zero — Game Developer](https://www.gamedeveloper.com/design/video-how-theater-influenced-the-design-of-i-kentucky-route-zero-i-)
- [Kentucky Route Zero — Critical Distance](https://www.critical-distance.com/2019/09/26/kentucky-route-zero/)
- [Kentucky Route Zero — Wikipedia](https://en.wikipedia.org/wiki/Kentucky_Route_Zero)
- [How Lucas Pope created the unique 1-bit art style of Return of the Obra Dinn — PlayStation.Blog](https://blog.playstation.com/archive/2019/10/17/lucas-pope-on-return-of-the-obra-dinns-art-style/)
- [Lucas Pope and the rise of the 1-bit 'dither-punk' aesthetic — Game Developer](https://www.gamedeveloper.com/design/lucas-pope-and-the-rise-of-the-1-bit-dither-punk-aesthetic)
- [NORCO on Steam](https://store.steampowered.com/app/1221250/NORCO/)
- [NORCO and capturing the spirit of Louisiana through sci-fi storytelling — Game Developer](https://www.gamedeveloper.com/business/-i-norco-i-and-capturing-the-spirit-of-louisiana-through-sci-fi-storytelling)
- [How Citizen Sleeper was inspired by tabletop RPGs and gig work — Game Developer](https://www.gamedeveloper.com/business/how-citizen-sleeper-was-inspired-by-tabletop-rpgs-and-gig-work)
- [Case study: Citizen Sleeper — howtomakeanrpg.com](https://howtomakeanrpg.com/r/a/case-study-citizen-sleeper.html)
- [Open sourcing 80 Days' narrative scripting language: ink — Game Developer](https://www.gamedeveloper.com/design/open-sourcing-80-days-narrative-scripting-language-ink)
- [Postmortem: Inkle's 80 Days — Game Developer](https://www.gamedeveloper.com/business/postmortem-inkle-s-i-80-days-i-)
- [80 Days (2014 video game) — Wikipedia](https://en.wikipedia.org/wiki/80_Days_(2014_video_game))
- [Where the Water Tastes Like Wine Postmortem — Johnnemann Nordhagen](https://johnnemann.medium.com/where-the-water-tastes-like-wine-postmortem-211a1f9d791a)
- [Where the Water Tastes Like Wine Postmortem Paints a Bleak Picture of Indie Development — CGMagazine](https://www.cgmagonline.com/news/where-the-water-tastes-like-wine-postmortem-paints-a-bleak-picture-of-indie-development/)
- [Teaching Hard History: Grades 6–12 — Learning for Justice](https://www.learningforjustice.org/frameworks/teaching-hard-history/american-slavery/6-12-framework)
- [Teaching Hard History From the Beginning — Learning for Justice](https://www.learningforjustice.org/magazine/fall-2019/teaching-hard-history-from-the-beginning)
