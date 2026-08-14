# Act-by-Act Scene Inventory
### *In Washington's Shoes* — the complete blocked-out content structure
**Version 1.0 — 14 August 2026**
**Owner:** Creative Director / Narrative Lead. **Audience:** everyone. §0.1, §0.4 and §13 are binding on the whole team.

---

## 0. How to use this document

This is the **content spine**. It converts the brief's sprawling maps into the fixed-camera scene sets the architecture actually supports, and it is the document that the ink script, the art schedule and the build manifest are all generated from. Where it conflicts with the brief, it wins. Where it conflicts with `historical-visual-reference.md` on a matter of fact, that document wins and this one is wrong. Where it conflicts with `02-art-direction.md` on a matter of look, that document wins.

It answers exactly eight questions per act: what the act is for, what the scenes are, what is decided, how the action plays, what is findable, which threads pass through, what the fixed loss is, and what it costs to build.

### 0.1 THE ACT-ORDER CORRECTION — read this first

**The brief's act order is chronologically inverted and must be fixed before any asset is generated.**

The brief lists Act 6 as Newburgh and Act 7 as Yorktown. Newburgh is **March 1783**. Yorktown is **September–October 1781**. Shipping the brief's order teaches a US History class that the Newburgh Conspiracy preceded Yorktown, which is false, catchable by any teacher in the room, and fatal to the project's credibility on the one axis it cannot afford to lose.

> **DECISION: Yorktown is Act 6. Newburgh is Act 7. Annapolis remains Act 8.**

Three arguments beyond the obvious one:

1. **It is the better structure.** The corrected rhythm alternates — spectacle (4), quiet (5), spectacle (6), quiet (7), quiet (8) — instead of the brief's quiet-quiet-spectacle-quiet. And it produces the game's real climax: the army offers Washington a crown-shaped opportunity in Act 7 and he refuses it, then hands the commission back in Act 8. **Newburgh → Annapolis is one two-act movement about power, and it only works in that order.** Yorktown as the penultimate act would make the resignation an epilogue to a battle; Yorktown as Act 6 makes the battle an epilogue to nothing, which is what victory in 1781 actually was — the shooting stopped and the crisis did not.
2. **It costs almost nothing now and enormously later.** No asset has been generated. The change is a find-and-replace across three tables.
3. **It fixes a second, quieter problem:** the brief's Act 6 ("Congress messengers with bad news about pay") and Act 7 ("French naval support gated by earlier alliance-building") are causally backwards. The alliance is built at Yorktown; the unpaid army is what the alliance's victory leaves behind.

**Required downstream edits to `02-art-direction.md` — mechanical, do them in one pass:**

| Table | Edit |
|---|---|
| §1.3 Gilt Frame moments | Swap rows 6 and 7. Act 6 = *The Surrender of Lord Cornwallis* (Trumbull, 1820). Act 7 = *Washington Addressing the Officers at Newburgh*. |
| §3.2 `W` controller | Act 6 becomes `floor 0.45 / ceil 0.90 / kAct 0.15`, `P` driven by the parallels. Act 7 becomes `floor 0.25 / ceil 0.70 / kAct 0.00`. |
| AI guide §5.5 light laws | Act 6 = "High hazy sun near-overhead, dust-warm, minimal shadow." Act 7 = "Interior. Single window, frame-left, cold north light." |
| File naming | `a06_*` = Yorktown, `a07_*` = Newburgh. The guide's example `a07_s03_mp_yorktown-siege` becomes `a06_s02_mp_chesapeake`. |

Everything below uses the corrected order without further comment.

### 0.2 Vocabulary and IDs

| Thing | Form | Example |
|---|---|---|
| Scene | `A{act}-S{n}` | `A4-S3` |
| Canonical view (the painted plate) | two letters + number, owned by `historical-visual-reference.md` §3 | `TR-01` |
| Map-table scene | `MT-{nn}` | `MT-05` |
| Decision point | `A{act}-D{n}` | `A6-D1` |
| Document | `DOC-A{act}.{n}` | `DOC-A2.3` |
| Interlude | `I{n}`, sits *after* act *n* | `I5` |
| Asset prefix | per AI guide §6.2 | `a04_s03_bg_the-ice_L2_v01` |

**Nine new canonical views are introduced here.** `02-art-direction.md` §5.7 declares the canonical-view list closed; that declaration was made before a scene inventory existed. This document formally extends the list by nine and then closes it again. The new views are `MV-04`, `CB-04`*, `BK-03`, `DL-03`, `TR-02`*, `VF-04`, `YT-04`, `AN-02`, and `NW-02` (already named in the history doc but previously unassigned to a scene). Views marked * were subsequently folded back into an existing plate as a state variant — see §13. **Net new plates: seven.** Any further addition is a Creative Director sign-off with a decision-log entry.

### 0.3 The scene contract

Every scene in this document ships against this contract. It is checked at content review, not at ship. A scene that fails any line is not a scene yet.

| # | Requirement | Source |
|---|---|---|
| C1 | One canonical view, one walk-plane, 1–4 architectural exits | art dir §5.5 |
| C2 | ≥ 12 interactables on the walk-plane | ref-games §1.3 |
| C3 | ≥ 8 of those carry unique examine text ≥ 40 words | ref-games §1.3 |
| C4 | ≥ 1 examinable object contradicts an NPC in the same scene, neither marked true | **R3** |
| C5 | ≥ 3 interactables carry stat-band or progression variant text | ref-games §1.3 |
| C6 | ≥ 1 primary source that opens a knowledge-locked option elsewhere in the act | **R2** |
| C7 | Every interactable has a proper name, not a category | **R22** |
| C8 | ≤ 8 seconds walk from entry to farthest interactable | **R9** |
| C9 | 2,600–3,400 authored words; ≤ 45% consumable in one pass | ref-games §1.3 |
| C10 | Authorable and testable in isolation from the global state object only | **R24** |

### 0.4 The eight sealed decisions — the whole game in one table

These are the eight moments that carry the red wax seal and the margin line `THIS WILL NOT COME AGAIN.` There are no others. Every student in the room encounters all eight, which is what makes them teachable (**R11**).

| Act | ID | The question | What Washington actually did |
|---|---|---|---|
| 1 | `A1-D3` | What do you wear to Philadelphia? | Wore the blue-and-buff of the Fairfax Independent Company to a deliberative body, and let the room draw the conclusion |
| 2 | `A2-D2` | Assault Boston across the ice, or wait for Knox's guns? | Proposed the assault three times; was voted down by his council of war each time; deferred |
| 3 | `A3-D1` | Hold New York, abandon it, or divide the army to hold Brooklyn? | Divided the army across a tidal river in the face of a superior fleet. His worst decision of the war |
| 4 | `A4-D2` | Three hours late, surprise gone — go on or turn back? | Went on. Attacked in daylight, in sleet, an hour after sunrise |
| 5 | `A5-D2` | How do you answer Conway and Gates? | Sent Conway a one-sentence note quoting his own words back, forwarded everything to Congress, and said nothing in public |
| 6 | `A6-D1` | New York or the Chesapeake? | Wanted New York. Was talked out of it by Rochambeau and de Grasse's letter. Went south |
| 7 | `A7-D2` | How do you answer the Newburgh Address? | Forbade the irregular meeting, called a regular one himself, and then appeared at it unannounced |
| 8 | `A8-D1` | What do you say when you give it back? | Gave it back plainly, in under four hundred words, and asked nothing for himself |

---

## 1. The stat model, stated numerically

The four hidden stats run **0–100**, integer, never displayed. The starting vector is characterful and is itself a teaching object:

```
Military Judgment   48    // Fort Necessity, 1754, is on his record and he knows it
Political Legitimacy 55   // unanimously chosen — by a body with no power to tax
Troop Loyalty        40   // they have never met him and he is a Virginian
Personal Character   60   // the reputation is real and it is his only working capital
```

**Movement magnitudes — enforced, no exceptions:**

| Class | Delta | Count in game |
|---|---|---|
| Characterization-only choice | 0 | ~80 (**R11**: ≥ 40% of all choices) |
| Flavour nudge | ±1 to ±2 | ~40 |
| Standard decision | ±3 to ±5 | ~24 |
| **Sealed decision** | ±5 to ±8 | **8** |
| Document found | **0, always** | 51 (**R2**) |

Bands, for the systems that need discrete values: `LOW < 34 · MID 34–66 · HIGH ≥ 67`, with the 0.04 hysteresis and scene-load-only commitment specified in `02-art-direction.md` §3.2.

**Council loudness.** At each decision point, the engine scores all five voices and speaks the top 2–4 (**R4**). Loudness formulas per `reference-game-analysis.md` §1.1, with Vanity inverted against Political Legitimacy (**R5**). Where this document specifies which voices speak, that specification is the *authored* set and overrides the formula — the formulas govern the ambient interjections between decisions.

---

# ACT 1 — MOUNT VERNON
### 4 May 1775 · 25–30 minutes · quiet

## 1.1 Function and tone

Act 1 is the control sample. Everything after it is measured against how this looked and how slowly it moved. It has one job the brief already names — establish the contrast — and three the brief does not:

1. **Establish the four-channel reading grammar** (portrait, Council, examine text, mood) while the stakes are near zero, so the student learns the interface without a tutorial.
2. **Establish that Washington has already failed.** Fort Necessity, 1754. He surrendered a fort and signed a French capitulation he could not read, admitting to *l'assassinat* of a French officer. The document is findable in this act. A student who reads it in the first fifteen minutes will never again read this character as a marble statue.
3. **Establish the Witness Register**, so that when it returns in Act 6 the grammar is already learned.

**Tone:** river haze, spring green, an unfinished building site. Nothing is urgent and everything is ending. The act's controlling image is a house being enlarged by a man who is about to stop living in it for eight years.

**Fixed loss (R20):** *The house is not finished and he will not see it finished.* No player choice alters this. The north end is scaffolding when he rides out and it will still be under construction when he comes back in Act 8. Lund's building account is the receipt.

**Sourced humour (R23):** Washington's own diary for the first days of May 1775, which records the weather and the state of the wheat in exacting detail while the empire comes apart. Present the diary as an examinable object with three consecutive entries. The joke tells itself and it is entirely in his own hand.

## 1.2 Scene graph

```
                 ┌──────────────────┐
                 │  A1-S1  MV-01    │
   [START] ─────▶│  The Approach    │◀────────┐
                 └───┬──────┬───────┘         │
                     │      │                 │
        ┌────────────┘      └──────────┐      │
        ▼                              ▼      │
┌───────────────┐              ┌──────────────┴──┐
│ A1-S2  MV-02  │              │  A1-S3  MV-03   │
│  The Study    │              │  The Quarter    │
└───────┬───────┘              └─────────────────┘   (R5 — Witness Register)
        │
        ▼
┌───────────────┐
│ A1-S4  MV-04  │──────▶ [A1-D3 · SEALED] ──▶ Gilt Frame 1 ──▶ Interlude I1
│  The Dock     │
└───────────────┘
```

Four scenes, four plates, one of which (`MV-04`) is shared with Act 8. `A1-S3` is a leaf — you go in, and you come back out the way you came. That is deliberate: the Witness Register is not a corridor to somewhere.

## 1.3 Scene list

### A1-S1 · `MV-01` "The Approach" — exterior, R1, EXT-5

**Composed view.** Shallow elevated three-quarter from the west, camera 4 m, mid-morning. The 1775 house: two-and-a-half storeys, rusticated sand-painted siding, **flat roofline, no piazza, no cupola, no weathervane**. The new south wing is stage right, one year old. The north end is stage left and it is a building site — lime pit, stacked yellow pine, a scaffold, a wheelbarrow. Walk-plane runs left-to-right across the forecourt.

**What the player does.** Learns to walk. Meets Lund. Reads the newest thing in the frame (the south wing) and the rawest (the north end). Receives the Boston broadside from the express rider. Chooses how to answer Lund about the estate (`A1-D2`).

**NPCs.** Lund Washington (estate manager, cousin) · an express rider from Alexandria, unnamed but proper-named in examine text as *the rider Tobias Lear's predecessor hired* — no: **name him. "Jenkins, of the Alexandria post."** (R22) · Billy Lee, at the stable end, holding Nelson. He does not speak in this scene. He is simply present, and he will be present in every act.

**Findable.** `DOC-A1.2` the Fairfax Resolves · `DOC-A1.3` the *Bloody Butchery* broadside · `DOC-A1.4` Lund's building account · the surveyor's circumferenter and Gunter's chain (object — seeds the map table) · the Virginia Regiment gorget and crimson sash (object) · the diary, three entries (R23) · the lime pit · the scaffold · Nelson · a survey of the Dogue Run farm in his own hand · the ha-ha wall · the kitchen chimney.

**Exits.** Front door → `A1-S2`. Path past the north scaffold → `A1-S3`. The river path stage right → `A1-S4` (locked until `A1-S2` is complete).

**Contradiction (C4).** Lund says the north addition will be finished by the autumn. The building account, examined, shows the same promise made in writing twice already.

---

### A1-S2 · `MV-02` "The Study" — interior, R1, INT-3

**Composed view.** Near-frontal theatrical elevation, pushed flat. One window stage left throwing a hard trapezoid of light across the floorboards. Desk, chair, globe, a wall of shelves, the fowling piece over the mantel. Walk-plane is a shallow strip three metres wide. This is the smallest scene in Act 1 and the densest.

**What the player does.** Talks to Martha. This is the act's principal conversation and it carries the majority of Act 1's word budget. Opens the locked drawer if he has cause to. Reads Fort Necessity.

**NPCs.** Martha Washington (portrait, 4 expressions).

**Findable.** `DOC-A1.1` **the Articles of Capitulation, Fort Necessity, 3 July 1754** — in the drawer, in French, with the word *assassinat* in a hand that is not his above a signature that is · `DOC-A1.6` the letter to Bryan Fairfax, 24 August 1774 · the 1772 Peale portrait of himself as a Virginia colonel, hanging, which the player can compare to their own current portrait · his commission as colonel of the Virginia Regiment · a book of Cato · Martha's account book · the ledger of the Dismal Swamp Company · a pair of spectacles, unworn, in a drawer (**planted here, paid off in Act 7 — do not remark on it**).

**Exits.** Door → `A1-S1`.

**Contradiction (C4).** Martha says he has been asked before and refused. The Fairfax Resolves, examined, show him chairing the meeting that made the ask inevitable.

---

### A1-S3 · `MV-03` "The Quarter" — exterior, **R5 Witness Register**, INT-3 layer budget

**Composed view.** The House for Families and its work yard. **Eye level with a standing figure, never above it.** Closer framing than any other exterior in the game — the people occupy more of the frame than the building does. Ink line and a single grey wash. No haze, no golden light, no ambient motion. Colour appears only in what people own: a dyed neckerchief, a copper ring, a blue glass bead.

**What the player does.** Walks, at eye level, and talks to two named people. **There is no task here.** No fetch, no favour, no stat. The only mechanical thing that happens is that examine text and one epilogue line are written by whether the player looked.

**NPCs.** **Frank Lee**, household butler, Billy Lee's brother, purchased with him from the Mary Lee estate in 1768 — one brother goes to the war and one does not, and neither chose · **Doll**, cook at the Mansion House, at Mount Vernon since 1759 · **Harry**, stable hand, purchased 1763, worked the Dismal Swamp Company survey. *Harry is the most important NPC in the game and the player will not know that until the epilogue.* All three are marked `sensitive: true` and require the §7.6 sign-off gate.

**Findable.** `DOC-A1.5` the invoice to Robert Cary & Co., osnaburg by the yard, with the annual allotment legible · the root cellar (colonoware, a white salt-glazed stoneware teabowl, a pewter spoon, a bone-handled knife, a tobacco pipe, oyster shells — the archaeology, furnished exactly, per §7.3 rule 5) · a fiddle · a garden plot worked outside the working day · a cooking pot that is not estate issue.

**Exits.** The path → `A1-S1`.

**Contradiction (C4).** The Bryan Fairfax letter (found in S2) has Washington writing that submission to Parliament would make Virginians *"as tame and abject slaves as the blacks we rule over with such arrogant power."* Frank Lee, in this scene, says nothing about liberty at all. Neither is marked true. The student does that work.

> **Production note.** This scene ships nothing that resembles a quest marker, a reward, or an approval sound. **`A1-S3` is the scene that decides whether a district adopts this game.** Budget the review time in §7.6 before you budget the art.

---

### A1-S4 · `MV-04` "The Dock" — exterior, R1, EXT-5. **Shared asset — reused as `A8-S3`.**

**Composed view.** The Potomac landing below the house. Shallow elevated three-quarter. A sloop at the wharf, the fish house, the river as a pale wash to a high horizon. The house is visible up the slope, small, with its scaffold. Late afternoon.

**What the player does.** The departure. Makes `A1-D3` — the sealed decision. Then walks to the sloop, and the act ends.

**NPCs.** Billy Lee, with the horses, going too · Lund, staying · a boatman named **Simms**.

**Findable.** The commission of the Fairfax Independent Company · the blue-and-buff coat itself, folded, on a chest — this is the object the sealed decision is about, and it must be examinable *before* the decision, not after · the shad nets · a herring barrel · a bill of lading for flour to the West Indies.

**Exits.** The sloop → act end.

## 1.4 Decisions

### `A1-D1` — What do you tell Martha? · characterization-only · 0 stats
Three answers, all documented in kind if not in word: that he does not expect to be chosen; that he expects to be chosen and dreads it; that he has already decided. Alters six later text strings, the tone of Martha's Persons entry, and one clause of the epilogue. **Moves nothing.** This is the game's first demonstration of R11 and it should be the first choice the player makes.

### `A1-D2` — Lund's instructions · standard
> *If the British come up the river, what does the estate do?*

| Option | Historically | Stats |
|---|---|---|
| Resist. Burn the stores rather than supply them. | Not what happened. In April 1781 Lund supplied HMS *Savage* to save the house, and Washington wrote him a furious letter saying he would rather they had burned it. | Character **+4**, Legitimacy **+2** |
| Save the house. Give them what they ask. | What Lund did. | Character **−3**, Judgment **+1** |
| Say nothing. Leave it to his judgement. | Also true — Washington gave no such instruction in 1775. | Character **−1**, Legitimacy **0** |

**Council (3 speak).** RESTRAINT: *"You are not there. A rule made at this distance is a rule made for a room you cannot see."* — DUTY: *"Whatever you tell him, he will do. That is not his conscience you are spending."* — VANITY: *"They will ask, afterwards, what you said. Say something you would like read aloud."*

**Payoff.** Whatever is chosen here is quoted back verbatim in Act 6, `DOC-A6.4`, alongside what Lund actually did.

### `A1-D3` — **SEALED** — The uniform
> *You are riding to a deliberative assembly. What do you wear?*

| Option | Historically | Stats |
|---|---|---|
| The blue-and-buff of the Fairfax Independent Company | **What he did.** Sixty-five men in civilian dress and one in regimentals. | Judgment **+3**, Legitimacy **+6**, Loyalty **+2**, Character **−5** |
| Civilian dress, plainly | Available and defensible; several Virginia delegates so travelled | Legitimacy **−4**, Character **+5** |
| The uniform, packed but not worn | A hedge nobody took | Legitimacy **+1**, Character **0**, Judgment **−2** |

**Council (4 speak — this is the only decision in Act 1 where all four of the arguing voices are loud).**
- **VANITY** *(hand mirror)*: *"You will be the only man in that room wearing a coat that means something. They will not have to be told what you are offering."*
- **AMBITION** *(spur)*: *"Sixty-five delegates and one soldier. The arithmetic asks for you. You need not."*
- **RESTRAINT** *(bridle bit)*: *"A man who wants a thing should not dress as though he already has it."*
- **DUTY** *(folded commission)*: *"Virginia sent you to deliberate, not to audition."*

**Knowledge lock.** A fourth option — *wear it, and tell them plainly that you do not think yourself equal to the command* — is knowledge-locked behind `DOC-A1.1` (Fort Necessity). Margin note: *"— you have not read what you signed at the Great Meadows."* If opened, it produces the historically documented posture: he wore the uniform **and** told Congress he did not think himself equal to it, and both were true. Judgment **+3**, Legitimacy **+6**, Loyalty **+2**, Character **+2**. **This is the single best demonstration in the game of R2**: the archive does not give you points, it gives you a sentence you could not otherwise say.

## 1.5 Documents

| ID | Source | Register | Unlocks |
|---|---|---|---|
| `DOC-A1.1` | Articles of Capitulation, Fort Necessity, 3 July 1754 | PRINTED (French) + transcription | The fourth option at `A1-D3`; two Martha options |
| `DOC-A1.2` | The Fairfax Resolves, 18 July 1774 | PRINTED | The political-credential option with Jenkins; contradicts Martha |
| `DOC-A1.3` | *Bloody Butchery by the British Troops*, Salem broadside, April 1775 | PRINTED, coffin cuts | The option to interrogate the casualty figures — which are propaganda and wrong |
| `DOC-A1.4` | Lund Washington's building account | ROUGH | The "the house kept being built" beat; reappears in Act 8 |
| `DOC-A1.5` | Invoice to Robert Cary & Co., osnaburg | PRINTED | The `MV-03` option in which Washington is told the size of the annual allotment |
| `DOC-A1.6` | GW to Bryan Fairfax, 24 August 1774 | SECRETARY | The `MV-03` contradiction; quoted in the epilogue |

## 1.6 Threads

- **Enslaved people:** the thread opens. Three named people, the Witness Register, the archaeology, and Washington's own sentence about "slaves as the blacks we rule over." No stat may move.
- **Congress-can't-pay:** seeded, not stated. The bill of lading at the dock shows what Virginia's economy is made of and who it is owed to.
- **Letterbook (I1):** *To Martha Washington, 18 June 1775.* The real letter, one of the few she did not burn, assembled from what the player did. If the player told her he expected to be chosen, the letter's *"far from seeking this appointment, I have used every endeavour in my power to avoid it"* lands as a lie the student watches him write.
- **Gilt Frame 1:** *The Cincinnatus.* Roman dress, plough, sword laid aside. Caption names Houdon's Virginia statue, commissioned 1785. The gap: the plough is Roman, the statue is ten years later, and the farm was worked by more than a hundred enslaved people.

## 1.7 Apex and camera

**Apex scene:** `A1-S4`. **The one scripted camera move (R8):** a 5-second slow lateral drift as the sloop pushes off, so the house passes out of frame stage right, scaffold last. It is the only time in Act 1 the camera does anything.

---

# ACT 2 — CAMBRIDGE AND THE BOSTON LINES
### July 1775 – March 1776 · 40–45 minutes · administrative, exasperated

## 2.1 Function and tone

Act 2 teaches the thing the standards ask for and the movies never show: **command is administration.** There is no battle. There is a powder shortage, an army whose enlistments all expire on the same day, a shanty-town that is not a camp, and a twenty-five-year-old bookseller who thinks he can drag fifty-nine guns three hundred miles in winter.

It also carries the **Dunmore reversal**, which is the spine of the enslaved-people thread and which happened here, at Cambridge, in November and December 1775. Putting it anywhere else is a chronological error.

**Tone:** flat overcast, no directional key, cool grey. Mud, unbleached linen, weathered board. The only saturated colour in the whole act is the distant red of the British lines seen through a spyglass — which is the act's thesis in one shot: the enemy is the only thing here that looks like an army.

**Fixed loss (R20):** *There is no powder and nothing the player does produces any.* The August 1775 discovery — that the army had roughly nine thousand pounds of powder, not the three hundred barrels its returns claimed, i.e. about nine rounds a man — is unfixable in this act by any route. Every option that seems to address it addresses only who knows about it.

**Sourced humour (R23):** the General Orders. Washington's actual orders from Cambridge include prohibitions on "the foolish and wicked practice of profane cursing and swearing," instructions about where men may and may not relieve themselves, and an order against firing muskets to see whether they still work. Present three, consecutively, as an examinable object. A commander-in-chief legislating latrines is funny and it is the act's argument.

## 2.2 Scene graph

```
                       ┌──────────────────┐
       [START] ───────▶│  A2-S1  CB-01    │
                       │  The Camp Street │
                       └──┬────────────┬──┘
                          │            │
              ┌───────────┘            └───────────┐
              ▼                                    ▼
   ┌──────────────────┐                 ┌────────────────────┐
   │  A2-S2  CB-02    │◀───────────────▶│  A2-S3   CB-03     │
   │  HQ Parlour      │                 │  The Lines         │
   └────────┬─────────┘                 │  (+ New Year state)│
            │                           └────────────────────┘
            │  [map-table lift]
            ▼
   ┌──────────────────┐
   │  A2-S4   MT-01   │   Knox's route — LOGISTICS PUZZLE
   │  The Survey Sheet│
   └────────┬─────────┘
            │  (resolves across 5 dispatch beats in CB-02)
            ▼
   ┌──────────────────┐
   │  A2-S5   CB-03′  │  Prospect Hill, 1 January 1776 — state variant of CB-03
   │  The Grand Union │──▶ [A2-D2 · SEALED] ──▶ Gilt Frame 2 ──▶ I2
   └──────────────────┘
```

Five scenes, **three plates**. `CB-03` carries two states — the siege line in autumn and the same parapet on New Year's Day with the Grand Union raised — and the second state re-ships `L2` only.

## 2.3 Scene list

### A2-S1 · `CB-01` "The Camp Street" — exterior, R1, EXT-5

**Composed view.** Shallow elevated three-quarter down a rough lane between shelters. Emerson's camp, literally: shelters of boards, of sailcloth, of board and sailcloth mixed, of stone and turf, of birch, of brush. Stage right, in the middle distance, **Greene's Rhode Islanders in proper tents in ordered rows** — one regiment that looks like an army surrounded by thousands of men living in brush piles. Boston and the water as a pale wash on the far horizon. No Continental blue anywhere.

**What the player does.** Walks the lane. Meets the army. Learns, by examining, that there is no army. Takes the first of the act's stat readings from how the men speak to him.

**NPCs.** **Nathanael Greene** · **Private Joseph Plumb Martin** (Connecticut line — 15 years old in 1776; at Cambridge he is a document, not yet a man, so use **Private Ezekiel Whitcomb, Massachusetts**, and hold Martin for Act 5) · a Virginia rifleman in a fringed hunting shirt, **Sergeant Absalom Bragg** · **Sarah Osborn**, laundress, drawing one ration a day · Billy Lee.

**Findable.** `DOC-A2.1` Emerson's letter · `DOC-A2.6` GW to Joseph Reed · the ration return · a brush shelter interior · Greene's tent line · a cooking kettle shared by eight men · a musket with no bayonet · a powder horn (militia tell) · a hunting shirt on a line · a canteen made from a cheesebox · the necessary, and the order about it · a printed enlistment paper expiring 31 December.

**Exits.** Up the lane → `A2-S2`. Out along the trench → `A2-S3`.

**Contradiction (C4).** Greene says the New England men are the best material in America. `DOC-A2.6` — Washington's own letter to Joseph Reed calling them "an exceeding dirty & nasty people" — says otherwise, in Washington's hand, about men who are standing in frame.

---

### A2-S2 · `CB-02` "Headquarters Parlour" — interior, R1, INT-4

**Composed view.** Near-frontal, pushed flat. The Vassall House parlour: a confiscated Loyalist's fine room, Georgian panelling, a good carpet, and a map table in the middle of it covered in returns. Two windows stage left. The contrast between the furniture and the paperwork is the shot.

**What the player does.** Reads dispatches. Runs the war. This is the act's hub and its densest writing. All five of the logistics puzzle's dispatch beats resolve here. The Dunmore decision (`A2-D3`) happens here. The council of war (`A2-D2`) happens here.

**NPCs.** **Henry Knox** (until he leaves for Ticonderoga, then by letter) · **Horatio Gates**, adjutant general — introduce him now, warm and competent, so that Act 5 hurts · **Joseph Reed**, secretary · a Congress delegate, **Benjamin Harrison of Virginia** · Billy Lee, who is the only person in this room who is not paid.

**Findable.** `DOC-A2.2` the powder return · `DOC-A2.3` **Dunmore's Proclamation** (arrives with the Virginia post in late November) · `DOC-A2.5` Knox's letter of 17 December, "a noble train of artillery" · `DOC-A2.7` General Orders, 4 July 1775 · the returns of the whole army, which do not add up · a Loyalist family's portrait, still on the wall, turned to face it · a bill for firewood · the commissary's ledger · a letter from Congress that answers a question he did not ask.

**Exits.** Door → `A2-S1`. The map on the table → **map-table lift** → `A2-S4`.

**Contradiction (C4).** The army's returns say one strength. The commissary's ration issue says another, four thousand lower. Neither is marked true. (Both were real; Washington complained about it for eight years.)

---

### A2-S3 · `CB-03` "The Lines" — exterior, R1, EXT-5

**Composed view.** Shallow elevated three-quarter along an earthwork parapet with gabions, spyglass position at frame right, Boston across the water. The one saturated colour in Act 2 lives at the end of the spyglass.

**What the player does.** Scouts. The spyglass is a **look-and-name** interaction, not a puzzle: pointing it at seven positions across the water names them and writes seven Persons/Maps entries. Getting all seven opens a knowledge-locked option at the council of war about the state of Boston's defences.

**NPCs.** **Colonel William Prescott** · a sentry, **Private Amos Doolittle** — the engraver, who really did serve, and whose four Lexington-and-Concord plates are the only contemporary images of the battles. He is in this game because his existence is a lesson about the visual record. His plates are findable.

**Findable.** Doolittle's four engravings (object, R4 register) · the spyglass · a gabion under construction · a fascine bundle · the graves on the reverse slope, named · a British deserter's coat · the ration of rum · a letter home, unfinished, that the writer will not finish.

**Exits.** Back along the trench → `A2-S1`. Up to the parlour → `A2-S2`. After the Ticonderoga guns arrive: forward → `A2-S5`.

---

### A2-S4 · `MT-01` "The Survey Sheet: Knox's Route" — map table, R2

The first map-table lift in the game, and therefore the one that teaches the grammar. See §10.1 for the full logistics-puzzle specification.

---

### A2-S5 · `CB-03′` "Prospect Hill, 1 January 1776" — exterior, R1, `L2` state variant

**Composed view.** The same parapet. Winter. The **Grand Union flag** — thirteen red and white stripes with the full British Union in the canton — going up on the pole. Behind it, on sleds, the first of Knox's guns.

**What the player does.** The act's apex. Makes `A2-D2`, the sealed decision, in front of the council of war assembled on the hill. Then the act ends.

**Teaching payload.** The Grand Union is the best object in Act 2. A student sees the British Union in the corner of the American flag and asks why. The answer — that on 1 January 1776 they were still arguing for their rights as Englishmen — is one of the hardest ideas in the unit and here it arrives as a picture, with no exposition at all.

## 2.4 Decisions

### `A2-D1` — The powder · standard
> *Nine rounds a man. Who is told?*

Options: tell the council of war and Congress both (Legitimacy **+3**, Loyalty **−4**, Judgment **+2**); tell the council only (Judgment **+3**, Legitimacy **0**); tell no one and keep the returns as written (Judgment **+1**, Legitimacy **−2**, Character **−4**, and three NPCs' opening lines change for the rest of the act).

**Council (2).** RESTRAINT: *"A secret kept from your own council is a secret you will be keeping alone in six weeks."* — TEMPER: *"Tell Congress and it is in a Philadelphia coffee-house by Friday and in Howe's hands by the next."*

### `A2-D2` — **SEALED** — The council of war
> *The ice on the Back Bay will bear men. Do you go over it?*

| Option | Historically | Stats |
|---|---|---|
| Press the assault over the council's objection | He proposed it three times and was voted down three times. He never overrode them. | Judgment **−6**, Loyalty **+3**, Legitimacy **−5**, Character **−2** |
| Put it to the vote and abide by it | **What he did.** | Judgment **+2**, Legitimacy **+6**, Character **+5**, Loyalty **−2** |
| Withdraw the proposal before the vote | Available; he did not | Judgment **+1**, Legitimacy **+2**, Character **−1**, Vanity's later lines change |

**Council (4).**
- **AMBITION**: *"The ice will bear men in February. It will not bear them in April. There is one week in this whole war shaped like a door."*
- **RESTRAINT**: *"Greene, Ward, Putnam and Gates have all said no. You have never yet been right against four men at once."*
- **TEMPER**: *"They think you are a Virginian playing at soldiers. Prove it in front of them, or stop resenting it."*
- **DUTY**: *"You asked for a council. A council you overrule is a court you flatter."*

**Knowledge lock.** A fourth option — *press the assault, and put your reasons in writing to Congress in advance so the record shows who chose* — is locked behind having named all seven positions through the spyglass in `A2-S3`. Margin note: *"— you have not looked at Boston."*

> **This is the game's best argument for its own thesis.** Washington wanted to attack. His subordinates stopped him. He was wrong and the institution corrected him, and he let it. A student who chooses the assault is not punished — the council simply votes it down and the record shows what he wanted, and that record is quoted in the epilogue. **There is no fail state and there is a consequence.**

### `A2-D3` — Black enlistment · standard · **the thread's hinge**
> *Dunmore has offered freedom to any enslaved man of a Patriot owner who reaches his lines and bears arms. Hundreds have gone. Free Black men are asking to enlist here.*

| Option | Historically | Stats |
|---|---|---|
| Maintain the bar | His General Orders of 12 November 1775 | Judgment **−4**, Legitimacy **+2**, Character **0** |
| Permit free Black men to re-enlist, quietly, without informing Congress | Partly what happened in practice | Judgment **+3**, Legitimacy **−2**, Character **0** |
| Permit it, and write to Hancock to make it policy | **What he did, 30 December 1775.** Knowledge-locked behind `DOC-A2.3`. | Judgment **+5**, Legitimacy **+3**, Character **0** |

**Council (3 speak — and the fourth voice's absence is the design).**
- **AMBITION**: *"Dunmore is recruiting your labour force. Every man he takes is a musket you do not have and one that he does."*
- **DUTY**: *"Congress forbade it. Congress also cannot count. Write to Hancock afterwards, not before."*
- **TEMPER**: *"He offered them freedom to spite you personally. Answer it, or concede he found the better weapon."*

> **PRODUCTION NOTE — BINDING.** **No voice argues this on moral grounds, because no voice in that room did.** Do not add a fifth. Do not soften the three. **Personal Character does not move on any branch of this decision**, and that immobility is the lesson: a man can make the better choice for none of the better reasons. The epilogue names this explicitly and does not launder it.

### `A2-D4` — The enlistments · standard
Every enlistment in the army expires 31 December 1775. Options: personal appeal to the regiments (Loyalty **+4**, Character **+2**); furlough men home to persuade them to return (Judgment **+3**, Loyalty **+2**, and 30% do not come back — authored, not random); apply to Congress for bounties Congress does not have (Legitimacy **−3**, Judgment **−1**, and the first explicit **Congress-can't-pay** beat).

## 2.5 The battle: LOGISTICS PUZZLE

Fully specified at §10.1.

## 2.6 Documents

| ID | Source | Register | Unlocks |
|---|---|---|---|
| `DOC-A2.1` | Rev. William Emerson, 17 July 1775 | SECRETARY | The order to Greene to standardise the camp |
| `DOC-A2.2` | The powder return, August 1775 | ROUGH | `A2-D1`'s third option |
| `DOC-A2.3` | **Lord Dunmore's Proclamation, 7 Nov 1775** | PRINTED | **`A2-D3`'s third option — the knowledge lock that matters most in the game** |
| `DOC-A2.4` | General Orders, 30 December 1775 | SECRETARY | Appears only *after* `A2-D3`; goes to the letterbook |
| `DOC-A2.5` | Knox to GW, 17 December 1775 | SECRETARY | Two `MT-01` route options |
| `DOC-A2.6` | GW to Joseph Reed, 1775 | SECRETARY | A Temper-voiced option; the `CB-01` contradiction |
| `DOC-A2.7` | General Orders, 4 July 1775 | PRINTED | The "one army" option with Harrison |

## 2.7 Threads

- **Enslaved people:** `A2-D3`. Billy Lee present in all three scenes, unremarked. Examine text on Billy Lee's bedroll in `CB-02` notes that he sleeps in the room where the maps are, which is true and is not commented on.
- **Congress-can't-pay:** `A2-D4`. First statement of the structural problem: Congress may requisition and may not tax.
- **Arnold:** not yet.
- **Intelligence:** seeded. Washington's first intelligence expenditure and the fact that he paid for it out of a fund he had to account for personally.
- **Letterbook (I2):** *To Joseph Reed, winter 1775–76.* Powder, enlistments, the men, and — if the player kept the powder secret — a sentence about what it costs to be the only man who knows a thing.
- **Gilt Frame 2:** *Washington Taking Command Under the Cambridge Elm*, Currier & Ives, 1876. The gap: no contemporary source records the ceremony or the elm. He arrived on 2 July and started writing requisitions.

**Apex scene:** `A2-S5`. **Camera move:** a 6-second slow push as the Grand Union goes up, ending with the flag filling the upper third.

---

# ACT 3 — BROOKLYN
### August – September 1776 · 35–40 minutes · dread, then extraction

## 3.1 Function and tone

Act 3 is the defeat. It is also the act where the game proves it means what it says about no fail state: the player is going to lose, they are going to lose because of a decision they make at the top of the act, and the *quality* of the loss is entirely theirs.

**Tone:** the paper gets wet. Rain-blurred wash, ink lines dissolving at the frame edges, fog rendered as **unpainted paper** rather than white paint. Low sun from frame-right dropping into fog; the night variant is moonlight from frame-right.

**Fixed loss (R20):** *Long Island is lost, the army is driven off it, and the New York campaign is a catastrophe.* `actFloor 0.12 / actCeil 0.40` enforces it at the shader level — the act cannot look like a good day no matter what the player does. What the player controls is the manifest: how much of an army is left on the other side of the river.

**Sourced humour (R23):** the Mrs. Murray story. Dr. James Thacher's journal records the tale that Mary Lindley Murray delayed Howe's senior officers for two hours with cake and wine at Inclenberg while Putnam's division escaped up the west side of Manhattan. It is probably apocryphal. **Present it as what it is** — a story told by a contemporary about an event he did not witness — as a findable document with the date of the telling on it. It is funny, it is warm, and it is a free lesson in evidence in an act that badly needs one.

## 3.2 Scene graph

```
   ┌──────────────────┐       [map-table lift]      ┌────────────────────┐
   │  A3-S1   BK-01   │◀──────────────────────────▶│  A3-S2    MT-02    │
   │  The Parapet     │                             │ The East River     │
   └────────┬─────────┘                             │ (wind, fleet, tide)│
            │                                        └────────────────────┘
            │  [A3-D1 · SEALED — before the battle]
            ▼
   ┌──────────────────┐
   │  A3-S3   BK-03   │   Four Chimneys — the council of war, 29 Aug
   │  Four Chimneys   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  A3-S4   BK-02   │   THE FERRY LANDING, NIGHT
   │  The Ferry       │   DECISION-BATTLE HYBRID (§10.2)
   └────────┬─────────┘
            │
            ▼   Gilt Frame 3 ──▶ Interlude I3
```

Four scenes, **three plates** plus one map table.

## 3.3 Scene list

### A3-S1 · `BK-01` "The Parapet" — exterior, R1, EXT-5

**Composed view.** Shallow elevated three-quarter along the Brooklyn earthwork. **Abatis** in the middle ground — felled trees, branch-points turned outward, a tangled thicket, not neat stakes. Fort Putnam's star salient stage left. The East River and Manhattan as pale wash beyond. Gowanus marsh out to the right.

**What the player does.** Makes `A3-D1` — the sealed decision — *before* anything has gone wrong, which is the whole point. Walks the line. Meets the officers who will shortly be captured.

**NPCs.** **Major General John Sullivan** (captured 27 August) · **Brigadier General William Alexander, Lord Stirling** (captured 27 August) · a militia officer of the Jamaica Pass patrol, **Lieutenant Nathaniel Ford**, five men and a road · Billy Lee.

**Findable.** `DOC-A3.1` Congress's resolution to hold New York · `DOC-A3.2` a British troop-movement report **that is wrong** · `DOC-A3.3` the Jamaica Pass patrol order · the abatis · a spade (Washington's line: *"I have never spared the Spade and Pick Ax"*) · the Gowanus tide table · a Maryland regimental colour · a barrel of salt beef condemned by the commissary · a letter from a Kings County Loyalist farmer, intercepted.

**Exits.** Down the line → `A3-S3`. The map on the drum head → **lift** → `A3-S2`.

**Contradiction (C4).** Stirling says the Jamaica Pass is watched. `DOC-A3.3`, examined, shows the watch is five militia officers on horseback with no relief and no orders about what to do if they see anything.

---

### A3-S2 · `MT-02` "The East River" — map table, R2

The survey sheet of the Narrows, the East River, the Brooklyn line and the British fleet. The tokens that matter: **the wind arrow.** The player can rotate the wind and watch the fleet's reachable positions change. A northeast wind — which is what blew — prevents Howe's ships beating up the East River to cut the ferry. **That is why the army got away, and no student has ever been told it.**

The map table is also where `DOC-A3.2`'s inaccuracy becomes legible: the report places Howe's main body where the player can see, from the ground truth of subsequent scenes, that it was not. Acting on it costs the player two entries on the Act 3 manifest and teaches, permanently, that intelligence in 1776 was mostly wrong.

---

### A3-S3 · `BK-03` "Four Chimneys" — interior, R1, INT-4 · **NEW canonical view**

**Composed view.** The parlour of Philip Livingston's house on Brooklyn Heights, 29 August 1776, rain on the windows. Near-frontal, pushed very flat. Nine officers standing round a table because there are not enough chairs. One candle group, one window, water coming in under the door. The flattest, most claustrophobic composition before Act 7.

**What the player does.** The council of war that decided the evacuation. Six speaking officers, each with a position, each with a reason, and the player closes the discussion. This is the act's densest dialogue scene and it carries the majority of Act 3's word budget.

**NPCs.** **Nathanael Greene** (ill, and arguing anyway) · **Israel Putnam** · **Thomas Mifflin** (who will command the rearguard, and whose premature withdrawal order nearly destroys the evacuation — plant him here) · **Colonel John Glover**, Marblehead · **Alexander Hamilton**, a twenty-one-year-old captain of artillery, one line, remembered later.

**Findable.** The council's minutes, in Reed's hand · the boat return · `DOC-A3.5` the Mrs. Murray story (dated, told later) · a chart of the ferry crossing · Livingston's own books, abandoned · a child's shoe.

**Exits.** Door → `A3-S4` (one-way; the act does not come back).

---

### A3-S4 · `BK-02` "The Ferry Landing, Night" — exterior, R1, EXT-5. **Act 3's showpiece.**

**Composed view.** Near-frontal, camera low at the waterline. Lantern-lit. Boats broadside across the frame. Fog is **bare paper**. The far shore is not drawn at all.

**What the player does.** The evacuation. See §10.2.

**NPCs.** Glover and the Marbleheaders, crewing · Mifflin's rearguard, arriving early and wrongly · Billy Lee, holding Nelson's head in the boat · **Sarah Osborn** and the women of the army, who are on the manifest and are therefore a decision.

**Findable.** `DOC-A3.4` the manifest itself (the battle mechanic) · `DOC-A3.6` Benedict Arnold's dispatch from Lake Champlain · `DOC-A3.7` GW to Hancock, 2 September 1776 (available only after) · the muffled oarlocks · a gun spiked because it will not fit · the tide.

## 3.4 Decisions

### `A3-D1` — **SEALED** — New York
> *Congress has ordered the city held. Greene says burn it and go. The army is on two islands separated by a tidal river and the enemy has three hundred ships.*

| Option | Historically | Stats |
|---|---|---|
| Concentrate the whole army on Manhattan; leave Brooklyn Heights | Militarily sound; politically impossible | Judgment **+6**, Legitimacy **−7**, Loyalty **−2** |
| Divide, and hold Brooklyn Heights | **What he did. The worst decision of his war.** | Judgment **−6**, Legitimacy **+4**, Loyalty **+1** |
| Abandon the city and burn it, per Greene | He asked Congress for permission and was refused; the city burned anyway on 21 September | Judgment **+4**, Legitimacy **−6**, Character **−3** |

**Council (3).** DUTY: *"Congress ordered the city held. You may tell them it cannot be done. You may not decide that it need not."* — AMBITION: *"Lose New York without a fight and you are a man who has lost two forts in twenty-two years."* — RESTRAINT: *"A river you cannot control is not a flank. It is a hole."*

**Note on honesty.** All three options end with the army driven off Long Island. **The choice does not change the outcome; it changes what the outcome means and what the player knew when they made it.** This is stated nowhere in the game and is the single most important thing Act 3 teaches.

### `A3-D2` — Mifflin's rearguard · standard
The real incident: a mistaken order pulled the rearguard off the line hours early and the whole covering force nearly marched to the ferry while the British were still in front of them. Options: send the order in writing (Judgment **+3**, and the incident does not occur); send it verbally by aide (Judgment **−2**, the incident occurs, three named men are lost); go yourself (Judgment **+1**, Loyalty **+4**, Character **+2**, and the player is off the ferry landing for two of the six loading beats — a real cost paid in the manifest).

### `A3-D3` — Nathan Hale · characterization-only · 0 stats
Whether to authorise Knowlton to send a volunteer behind the lines without a cover story, without a contact, and without training. Hale goes on every branch and is hanged on every branch. What changes: whether Washington knew his name before or after. **This is the seed of the intelligence thread and the reason the Culper Ring, when it comes, is professional.**

## 3.5 The battle: DECISION-BATTLE HYBRID

Fully specified at §10.2.

## 3.6 Documents

| ID | Source | Register | Unlocks |
|---|---|---|---|
| `DOC-A3.1` | Congress's resolution to hold New York | PRINTED | The "I was ordered" option at the council; the epilogue's Congress line |
| `DOC-A3.2` | A British troop-movement report — **inaccurate** | ROUGH | An `MT-02` disposition that turns out badly. The document is *wrong*, and nothing marks it wrong |
| `DOC-A3.3` | The Jamaica Pass patrol order | SECRETARY | The `BK-01` contradiction; one council option |
| `DOC-A3.4` | The evacuation manifest | ROUGH | *Is* the battle mechanic; read back in I3 |
| `DOC-A3.5` | Thacher's journal on Mrs. Murray | SECRETARY, dated later | R23's humour beat; a lesson in hearsay |
| `DOC-A3.6` | Arnold's dispatch, Lake Champlain, autumn 1776 | SECRETARY | **Seeds Arnold.** Opens his Persons entry and one Act 5 option |
| `DOC-A3.7` | GW to Hancock, 2 September 1776 | SECRETARY | Post-battle; goes to the letterbook |

## 3.7 Threads

- **Arnold seeded.** `DOC-A3.6`. He is a name on paper who built a fleet out of nothing on Lake Champlain and fought a superior force to a standstill. Washington's Persons entry on him at the end of Act 3 reads, in substance, *this is the most enterprising officer in the service.* The student will remember that.
- **Intelligence.** Hale fails. The failure is total and it is instructive.
- **Enslaved people.** Billy Lee crosses in the boat. Glover's Marbleheaders are a documented mixed-race unit and the crowd composition must show it (F-20).
- **Congress-can't-pay:** the order to hold New York is Congress deciding strategy it cannot fund.
- **Letterbook (I3):** *To John Hancock, 2 September 1776.* The real letter — *"Our situation is truly distressing"* — with the manifest's losses written into it in Washington's own hand. **This is where casualties are delivered in this game: as numbers you are writing yourself.**
- **Gilt Frame 3:** *The Martyrdom of Nathan Hale*, MacMonnies bronze, 1890. The gap: the famous last words reach us second-hand, through a British officer, and Washington did not learn his name for weeks.

**Apex scene:** `A3-S4`. **Camera move:** none. Act 3 spends its one move on a **hold** — at the last boat, the camera does not move for eleven seconds while the fog comes in and the ink line at the frame edge dissolves into bare paper. Stillness is the move.

---

# ACT 4 — THE DELAWARE AND TRENTON
### 25–26 December 1776 · 45–50 minutes · the nadir and the gamble · **the showpiece**

## 4.1 Function and tone

Act 4 is the biggest act and it must earn that by contrast, not by volume. Its argument is that the most famous night in the war was an act of desperation by an army that was about to cease to exist on 31 December, in weather that was worse than the paintings, three hours behind schedule, in daylight, against men who had been warned.

**Tone:** the darkest act. `IRON-GALL` at maximum weight, wash almost monochrome, the only warmth from torch and musket flash. Sleet rendered as **scratched-out white lines through the wash** — scraping the paper, a real period technique — never as painted dots.

**Fixed loss (R20):** *The army's enlistments still expire on 31 December, and Trenton does not fix it.* Even after the victory, most of the army walks. What the player's Trenton buys is a six-week extension bought with a ten-dollar bounty Washington pledged on his own credit — not a solution. Also fixed: **the crossing runs three hours late on every branch.**

**Sourced humour (R23):** the Knox anecdote — Washington, in the boat, telling the enormously fat Knox to shift himself or swamp them all. It survives in a Marblehead soldier's later account, which makes it a story about a story. **Frame it as one:** the line appears in the crossing sequence, and the document that carries it is dated fifty years after the night. That framing is the joke *and* the lesson, and it keeps a beloved anecdote in the game without asserting it.

## 4.2 Scene graph

```
   ┌────────────────────┐
   │  A4-S1    DL-03    │  McConkey's Ferry Camp        [NEW plate]
   │  The Ferry Camp    │  Paine · re-enlistment · Morris's specie
   └─────────┬──────────┘
             │  [map-table lift]
             ▼
   ┌────────────────────┐
   │  A4-S2    MT-03    │  Two columns · Greene & Sullivan · the timetable
   │  The Order of March│
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │  A4-S3    DL-01    │  THE EMBARKATION      ─┐
   │  The Embarkation   │                        │  SCRIPTED STAT-WEIGHTED
   └─────────┬──────────┘                        │  SEQUENCE (§10.3)
             ▼                                   │  9 beats
   ┌────────────────────┐                        │
   │  A4-S4    DL-02    │  THE ICE              ─┘
   │  The Ice           │  [A4-D2 · SEALED at beat 6]
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │  A4-S5    TR-01    │  KING STREET — 7 beats
   │  King Street       │
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │  A4-S6    TR-01′   │  The same street, after. Prisoners. Recross.
   │  After             │  [L2+L3 state variant]
   └─────────┬──────────┘
             ▼   Gilt Frame 4 (Leutze) ──▶ Interlude I4
```

Six scenes, **four plates** plus one map table and one state variant.

## 4.3 Scene list

### A4-S1 · `DL-03` "McConkey's Ferry Camp" — exterior, R1, EXT-5 · **NEW canonical view**

**Composed view.** The Pennsylvania bank above the ferry, 25 December, late afternoon. Shelters, not tents. Fires that are too small. The Durham boats hauled up on the bank, black, long, empty — establish them here so the student has seen the correct boat before the crossing. The river beyond, running ice.

**What the player does.** Walks the worst camp in the game. Talks to men whose enlistments expire in six days. Makes the bounty decision. Hears the *American Crisis* read aloud, or doesn't.

**NPCs.** **Private Joseph Plumb Martin**, Connecticut, sixteen years old, whose 1830 memoir is the best enlisted-man's account of this war — introduce him here and carry him to Act 5 and Act 7 · **Colonel John Glover** again · **Colonel Henry Knox** · **Sergeant William Young**, Pennsylvania, whose diary records the sleet · an informant from Trenton, **John Honeyman** (a genuinely contested figure — see §15) · Billy Lee.

**Findable.** `DOC-A4.1` **Thomas Paine, *The American Crisis* No. I** — cheap coarse paper, wide-set type, badly inked; it must look like what it was, mass propaganda printed in a hurry · `DOC-A4.2` a re-enlistment paper · `DOC-A4.3` Robert Morris's note advancing hard money · `DOC-A4.4` the password order, *"Victory or Death"* · a man's feet, wrapped in rag, examined and named · a Durham boat, examined (forty to sixty feet, high sides, poled — the F-17 corrective delivered as an examine string) · a musket that will not fire because the priming is wet · a Christmas ration.

**Exits.** The map on the drum → **lift** → `A4-S2`. Down the bank → `A4-S3` (locked until `A4-D1` resolves).

**Contradiction (C4).** Honeyman says the Trenton garrison is at ease and unprepared. The intercepted Hessian picket order, examined, shows Rall doubled his guards on the 24th. **Neither is marked true.** (Rall had been warned. The "drunk Hessians" story is a myth and this scene is where the game kills it.)

---

### A4-S2 · `MT-03` "The Order of March" — map table, R2

Trenton, King Street and Queen Street converging, the Old Barracks, the two river roads. The player sets the plan: **two columns (Greene by the Pennington road, Sullivan by the River road)**, the hour of attack, and whether Ewing and Cadwalader's supporting crossings are ordered or cancelled. Historically Ewing never got across and Cadwalader got men over but not guns; the player can order it either way and it fails either way — a small, honest R20 inside the puzzle.

The timetable token is the important object: it shows the plan requires being across by midnight. The player will watch it slip.

---

### A4-S3 · `DL-01` "The Embarkation" — exterior, R1, EXT-5
### A4-S4 · `DL-02` "The Ice" — exterior, R1, EXT-5

These two plates carry the nine-beat crossing sequence. See §10.3. `DL-01` is near-frontal, low at the landing, a Durham boat broadside across the frame, torchlight. `DL-02` is shallow elevated three-quarter from mid-river: black water, ice plates, the far bank barely indicated, sleet scratched through the wash.

**The sealed decision `A4-D2` fires at beat 6, on `DL-02`.**

---

### A4-S5 · `TR-01` "King Street" — exterior, R1, EXT-5

**Composed view.** Shallow elevated three-quarter down King Street toward the Old Barracks — the 1758 two-storey stone building with its continuous arcade of doorways. Sleet. **Hessians turning out under arms**, forming in the street, not sprawled over bottles. Daylight, an hour after sunrise, thin and grey.

Seven beats. See §10.3.

---

### A4-S6 · `TR-01′` "After" — `L2`+`L3` state variant

The same street. The fight is over in forty-five minutes. Nine hundred prisoners forming up in the sleet. The army is going straight back across the river tonight with them — **Washington did not occupy Trenton**, and the scene's writing must make the student feel that this is hours, in the weather, not a captured town to wander.

**What the player does.** Names the dead. The casualty list is examinable and every name on it carries one biographical fact (**R22**). Two Continental soldiers froze to death on the march. They are named. Colonel Rall is dying in the Methodist church and the player may go in or not (characterization-only).

**Findable.** `DOC-A4.5` the story of Rall's unread note · `DOC-A4.6` a Hessian grenadier cap plate, brass, the Hessian lion — the money object · `DOC-A4.7` GW's report to Congress, 27 December.

## 4.4 Decisions

### `A4-D1` — The bounty · standard
Ten dollars, in hard money, to every man who stays six weeks. Washington pledged it personally and Robert Morris found the specie. Options: pledge it on his own credit (Loyalty **+6**, Character **+4**, Legitimacy **−2**); ask Congress and wait (Loyalty **−5**, Legitimacy **+1**, and 40% fewer men re-enlist, authored); appeal without money, on the regiments' honour (Loyalty **+2** if `Loyalty ≥ 55`, **−4** if below — the first time the game silently reads a stat back at the player as a different outcome to the same words).

**Council (2).** DUTY: *"You are promising money that does not exist, out of a treasury that does not exist, in your own name."* — TEMPER: *"They have been paid in paper for eighteen months. Try paper again and see what the drum sounds like."*

### `A4-D2` — **SEALED** — Go on
> *It is four in the morning. You are three hours behind. Sunrise is at seven and Trenton is nine miles away.*

| Option | Historically | Stats |
|---|---|---|
| Go on. Accept a daylight attack. | **What he did.** | Judgment **+5**, Loyalty **+8**, Legitimacy **+6**, Character **+2** |
| Turn back and recross while it is dark | Genuinely defensible; several officers urged it | Judgment **−2**, Loyalty **−8**, Legitimacy **−6**, Character **0** |
| Send only the column already across | Not proposed; militarily awful; available | Judgment **−5**, Loyalty **−3**, Legitimacy **−3** |

**Council (4).**
- **RESTRAINT**: *"Three hours late. Sunrise at seven. You will be marching in daylight toward men who have been warned."*
- **AMBITION**: *"Two thousand four hundred men are on the wrong bank. There is no version of this where you take them back and keep them."*
- **DUTY**: *"The enlistments expire on the thirty-first. After that you do not command an army. You command a rumour."*
- **TEMPER**: *"*Victory or Death.* You gave them that for a password. Say the second half out loud in front of them and see what it costs."*

**Note.** Turning back is not a fail state. The act continues; there is a smaller, later, uglier action at Trenton on 2 January instead; the war goes on; and the game never says the player was wrong. What it does is show a different Interlude I4 in which Washington writes a letter to Congress that he does not want to write. **That is the whole of the punishment and it is enough.**

### `A4-D3` — The prisoners · standard
Nine hundred Hessians. Options: march them through Philadelphia as a spectacle (Legitimacy **+4**, Character **−3** — this happened); treat them as prisoners of war and quarter them in Pennsylvania German farming country (Character **+5**, Judgment **+3** — this also happened, and a substantial number never went home); allow the men to plunder the Hessian baggage (Loyalty **+3**, Character **−6**, Judgment **−2**).

## 4.5 The battle: SCRIPTED STAT-WEIGHTED SEQUENCE

Fully specified at §10.3.

## 4.6 Documents

| ID | Source | Register | Unlocks |
|---|---|---|---|
| `DOC-A4.1` | Paine, *The American Crisis* No. I, 19 Dec 1776 | PRINTED, cheap | The order to have it read to the assembled regiments; changes 3 examine strings and crossing beat 2 |
| `DOC-A4.2` | A re-enlistment paper | ROUGH | `A4-D1`'s third option |
| `DOC-A4.3` | Robert Morris's note advancing specie | SECRETARY | `A4-D1`'s first option; **Congress-can't-pay** |
| `DOC-A4.4` | The password order, *Victory or Death* | SECRETARY | Temper's line at `A4-D2` |
| `DOC-A4.5` | The story of Rall's unread note | PRINTED, dated later | A lesson in provenance; contradicts the "drunk Hessians" myth by dating its own telling |
| `DOC-A4.6` | Hessian grenadier cap plate | object | Persons entry on Rall |
| `DOC-A4.7` | GW to Congress, 27 December 1776 | SECRETARY | Letterbook |

## 4.7 Threads

- **Congress-can't-pay:** at its sharpest. The commander pledges his own credit because the government has none.
- **Enslaved people:** Glover's crews again; Billy Lee in the boat and on the road. The Hessian baggage decision touches property, which is not remarked on.
- **Intelligence:** Honeyman, and the fact that his story rests on family tradition recorded long afterwards. The game presents him and dates the evidence.
- **Letterbook (I4):** *To Congress, 27 December 1776.* Or, on the turn-back branch, a different letter entirely — shorter, and worse.
- **Gilt Frame 4:** **Leutze, 1851, Düsseldorf.** The most important of the eight. The caption names the wrong boat, the wrong flag, the wrong hour, the wrong ice, the wrong continent, and the seventy-five-year gap. The student has just spent forty minutes in the correct version. **Do not add a single word of commentary.**

**Apex scene:** `A4-S4` (The Ice). **Camera move:** 4 seconds, a slow push into the ice at beat 7, ending on nothing in particular.

---

# ACT 5 — VALLEY FORGE
### December 1777 – June 1778 · 45–50 minutes · endurance, and rivals

## 5.1 Function and tone

Act 5 has no battle and it is the longest-written act in the game (16,000–17,000 words). It carries four things: the winter, the making of an army, the Conway Cabal, and Saratoga's consequence — the French alliance — delivered without a new map, exactly as the brief's Option C requires.

**The visual argument is order and misery in the same frame.** The huts were regulated: fourteen feet by sixteen, six and a half feet high, doors to the street, fireplace at the rear, gaps sealed with eighteen inches of clay, and squads that deviated were made to tear them down and start again. Valley Forge is a **grid**, built to a specification, by an army that was starving.

**Tone:** snow as bare paper, ink at its coldest and thinnest, wash reserved for smoke and mud. Then, across the act, wash returns — first the ochre of new-cut logs, then green. `kAct = 0.60`: sixty per cent of what the paper shows is how far into the winter we are, forty per cent is what kind of leader you have been. **The thaw happens for everyone.**

**Fixed loss (R20):** *Roughly two thousand men die, mostly of disease, on every branch.* Nothing improves it. The ration returns get better and men keep dying, because they were already sick. Every death that the game names is a real name from the record.

**Sourced humour (R23):** von Steuben, who spoke almost no English, exhausting his French and German profanity on a Virginia regiment and calling across the parade to his translator: *"Viens, mon ami Walker — I can curse them no more. Come and swear for me!"* It is documented, it is genuinely funny, and it is also the moment the army starts working.

## 5.2 Scene graph

```
  ┌──────────────────┐
  │ A5-S1   VF-01    │ Brigade Street, December — mud, no huts yet
  │ Brigade St · Dec │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐        ┌────────────────────┐
  │ A5-S2   VF-02    │◀──────▶│ A5-S3    VF-04     │  [NEW plate]
  │ Potts House      │        │ The Hospital Hut   │
  └────┬────────┬────┘        └────────────────────┘
       │        │  [map-table lift]
       │        └──────────────▶┌────────────────────┐
       │                        │ A5-S4    MT-04     │
       │                        │ The Northern Dept. │  Saratoga → the alliance
       │                        └────────────────────┘
       ▼
  ┌──────────────────┐
  │ A5-S5   VF-03    │ The Grand Parade — mud. Von Steuben arrives.
  │ Grand Parade · I │
  └────────┬─────────┘
           ▼
  ┌──────────────────┐
  │ A5-S6   VF-03′   │ The Grand Parade — the model company.  [L2 variant]
  │ Grand Parade · II│ [A5-D2 · SEALED — the Cabal, resolved here]
  └────────┬─────────┘
           ▼
  ┌──────────────────┐
  │ A5-S7   VF-01′   │ Brigade Street, May. Same plate. Green.
  │ Brigade St · May │ The Treaty of Alliance. The feu de joie.
  └────────┬─────────┘
           ▼   Gilt Frame 5 ──▶ Interlude I5
```

Seven scenes, **four plates**, one map table, three state variants. The Pentiment revisit is doing enormous work here: `VF-01` and `VF-03` each carry the passage of a winter for the cost of an `L2` re-ship.

## 5.3 Scene list

### A5-S1 · `VF-01` "Brigade Street, December" — exterior, R1, EXT-5

**Composed view.** Shallow elevated three-quarter down a brigade street, receding. **In this state the huts are half-built** — foundations pegged out to the specification, walls to three courses, men working with green timber and no nails. Smoke from a few chimneys. Snow as bare paper.

**What the player does.** Arrives. Learns the specification (the hutting order is an examinable object and it is the most surprising thing in the act). Meets the army at its worst.

**NPCs.** **Private Joseph Plumb Martin** (returning from Act 4) · **Sarah Osborn** · **a soldier of the 1st Rhode Island** — the regiment is reorganised to recruit Black and Native men in February 1778, in this act, so the man is here before the order and after it, and the difference is a line of dialogue · Billy Lee · **Dr. Albigence Waldo**, surgeon, whose diary is the source everyone quotes.

**Findable.** The hutting order, 18 December 1777 · `DOC-A5.1` GW to Congress, 23 December 1777 (the "barefoot and otherwise naked" return) · `DOC-A5.7` a ration return reading *fire cake and water* · Waldo's diary · a shoe with no sole · a hut, entered and measured · a clay-sealed wall · a woman's ration ticket · a burial detail's list · an axe with a broken helve · a green-timber wall that will not close.

**Exits.** Up the street → `A5-S2`. Out to the field → `A5-S5` (locked until `A5-S4`).

**Contradiction (C4).** Waldo's diary says the men bear it with cheerfulness. The desertion return in the same scene shows what a portion of them actually did.

---

### A5-S2 · `VF-02` "Potts House, Interior" — interior, R1, INT-3

**Composed view.** The Isaac Potts house — a small, plain, two-storey stone dwelling, deliberately not a mansion. Near-frontal, pushed flat. A table, three chairs, a fire, a great many papers. He lived in his marquee until the huts were built, and this room is where he moved when they were.

**What the player does.** The Conway Cabal. The Committee at Camp. Saratoga's news. The act's political engine.

**NPCs.** **Horatio Gates** (by letter only — he is at York with Congress, and his absence is the point) · **Thomas Conway**, inspector general, in person, once · **Alexander Hamilton**, aide-de-camp · **Baron von Steuben**, arriving 23 February · a **Congress inspector** of the Committee at Camp, **Francis Dana** · Billy Lee.

**Findable.** `DOC-A5.3` the Conway letter, as reported by Wilkinson — a document that exists only in someone else's account of it · `DOC-A5.6` the **Treaty of Alliance, 6 February 1778**, arriving 30 April · Washington's marquee, folded in the corner (fourteen by twenty-three feet, twelve feet at the peak — the surviving object) · the Committee at Camp's report · the returns of men fit for duty · a letter from Lafayette · a pay abstract Congress has not honoured.

**Exits.** Down the street → `A5-S1`. Across the yard → `A5-S3`. The map on the table → **lift** → `A5-S4`.

**Contradiction (C4).** Conway, to his face, professes complete loyalty. `DOC-A5.3`, examined, reports him writing that heaven has determined to save America or a weak general and bad counsellors would have ruined it. **Neither is marked true**, because the letter survives only in Wilkinson's report of what he read, and that is exactly the epistemological problem Washington actually had.

---

### A5-S3 · `VF-04` "The Hospital Hut" — interior, **R1 with the Witness Register's restraint**, INT-3 · **NEW canonical view**

**Composed view.** One hut, interior, fourteen by sixteen, six and a half feet to the ridge. Twelve men in it. One window-hole. Camera at eye level, not above. This scene borrows R5's camera and framing rules without borrowing its grey wash — it is not a Witness Register scene, but it is not a picturesque one either. Marked `sensitive: true`.

**What the player does.** The **smallpox inoculation decision** (`A5-D1`). Names men.

**NPCs.** **Dr. John Cochran**, physician-general · four named soldiers, three of whom die in this act regardless of anything.

**Findable.** `DOC-A5.5` the inoculation order · the mortality return · a man's discharge, written for a man who will not use it · a letter home that the surgeon will have to finish.

**Exits.** Yard → `A5-S2`.

---

### A5-S4 · `MT-04` "The Northern Department" — map table, R2

**Saratoga, folded in, exactly as the brief's Option C requires — and better, because it is a map.** The player sees the northern theatre: Burgoyne's line of advance from Canada, St. Leger's from the west, the force that was supposed to come up the Hudson from New York and did not, and Gates's position at Bemis Heights. Tokens for Arnold's two attacks — the second made without orders, on a battlefield he had been relieved from, where he was shot in the leg he had already broken at Quebec.

**The teaching move.** The map shows what Gates's despatch to Congress does not: **who did the fighting.** `DOC-A5.4` (Arnold's own account) and the Gates despatch are both readable at this table and they disagree about the same battle. The student watches a man win a victory and watches another man report it.

Then the second sheet: **the alliance.** France recognised the United States on 6 February 1778 because of Saratoga. The map shows what that means materially — a fleet, a loan, a supply of cloth, and the reason the Continental Army will have coats in eighteen months.

---

### A5-S5 · `VF-03` "The Grand Parade" — exterior, R1, EXT-5

Empty, muddy, February. Von Steuben walks onto it with one hundred men and a manual he is writing at night in French, which Duponceau translates into English, which Walker translates into orders.

**The drill is not a minigame.** The brief proposes one; it is cut. What replaces it: **the player watches, and chooses what to do about rank.** Von Steuben's method — that officers drill their own men, personally, rather than delegating to sergeants — was a direct affront to how gentlemen understood their commissions. `A5-D3` is about that.

---

### A5-S6 · `VF-03′` "The Grand Parade, April" — `L2` state variant

The same field. One hundred men move as one unit. The whole army is watching them do it. **The sealed decision `A5-D2` fires here**, on the edge of the parade, because the Cabal's answer had to be given while the army was becoming an army — that timing is what made it possible to give.

---

### A5-S7 · `VF-01′` "Brigade Street, May" — `L2`+`L3` state variant

The same street. Green. Huts finished, doors to the street, ordered, unmistakably a town. The *feu de joie* for the French alliance — a running fire of musketry down the line, which is a documented event and the single loveliest thing that happens in this game. The act ends walking down a street the player first saw as mud.

## 5.4 Decisions

### `A5-D1` — Inoculation · standard · **the best "beyond the standards" item in the first half of the game**
> *Variolation. Cut the smallpox into a healthy man's arm on purpose. He will be ill for three weeks and a small number will die. The alternative is what the disease does on its own.*

| Option | Historically | Stats |
|---|---|---|
| Inoculate the whole army, in secret, by regiment | **What he did** (ordered early 1777, continued through Valley Forge) | Judgment **+6**, Loyalty **−4** then **+6** at act end, Character **+3** |
| Inoculate only new recruits | A real compromise | Judgment **+2**, Loyalty **−1** |
| Do not; rely on quarantine | The pre-1777 policy | Judgment **−5**, Loyalty **+2**, and the act's death toll examine strings change |

**Council (3).** DUTY: *"You will make three thousand men unfit for duty on purpose, in front of an enemy, and you cannot tell anyone why."* — AMBITION: *"Howe is thirty miles away with a healthy army. This is the only weapon in the camp you can actually use."* — RESTRAINT: *"Some of them will die of it and you will have signed the order."*

### `A5-D2` — **SEALED** — The Cabal
> *Conway. Gates. Mifflin. A letter you have seen only in someone else's summary. Congress has made your critic Inspector General over your head.*

| Option | Historically | Stats |
|---|---|---|
| Send Conway his own reported words, one sentence, no comment; forward everything to Congress; say nothing publicly | **What he did**, and it was lethal | Judgment **+4**, Legitimacy **+7**, Character **+5**, Loyalty **+2** |
| Say nothing at all; let it burn out | Available; the risk was real | Legitimacy **−3**, Character **+2**, Judgment **−2** |
| Offer to resign and force Congress to choose | Threatened obliquely; never done | Legitimacy **+2**, Character **−4**, Loyalty **+5**, Judgment **−3** |
| Answer publicly, in general orders, and name them | Not done; would have been ruinous | Legitimacy **−8**, Loyalty **+6**, Character **−6**, Temper's lines dominate for the rest of the game |

**Council (4).**
- **TEMPER**: *"Gates has never yet written to you directly about anything. He writes to Congress about you. Answer the man, not the committee."*
- **VANITY**: *"They are saying, in York, that Saratoga was won by a better general. Let that sentence stand one more month and it will be true."*
- **RESTRAINT**: *"You have one letter, at second hand, from a man who read it once. Build nothing on it that you would not build on rumour."*
- **DUTY**: *"Congress appointed him. If you fight Congress's appointment you are fighting Congress, and you will lose that whoever wins this."*

**Knowledge lock.** The first option — the one-sentence note — requires `DOC-A5.3`. Margin note: *"— you have not read what Conway is reported to have written."*

### `A5-D3` — Von Steuben's method · standard
Officers drill their own men. Options: order it and enforce it (Judgment **+5**, Loyalty **+6**, Legitimacy **−2** — the officer corps resents it, and several resign); permit it in the model company only (Judgment **+2**); refuse it as beneath the commissions (Judgment **−4**, Loyalty **−3**, Legitimacy **+2**).

### `A5-D4` — The Committee at Camp · standard
Honest or diplomatic. Options: show them the naked men (Legitimacy **+5**, Character **+4**, and the supply improves marginally and late); give them a written return and a good dinner (Legitimacy **+2**, Character **−2**); tell them the army will dissolve and let them infer a threat (Legitimacy **−4**, Loyalty **+3**, Judgment **+2**).

## 5.5 Documents

| ID | Source | Register | Unlocks |
|---|---|---|---|
| `DOC-A5.1` | GW to Congress, 23 December 1777 | SECRETARY | The Committee at Camp's honest option |
| `DOC-A5.2` | Von Steuben's drill, in draft (the "Blue Book" before it was a book) | PRINTED, French with English interlineation | `A5-D3`'s first option |
| `DOC-A5.3` | The Conway letter, **as reported by Wilkinson** | SECRETARY, quoted inside another hand | **`A5-D2`'s first option.** The whole document is hearsay and the typography says so |
| `DOC-A5.4` | Arnold's account of Bemis Heights, and Gates's despatch | SECRETARY / PRINTED | Two Persons entries; the Act 6 Arnold beat |
| `DOC-A5.5` | The inoculation order | SECRETARY | `A5-D1` |
| `DOC-A5.6` | Treaty of Alliance, 6 February 1778 | ENGROSSED | The *feu de joie*; the Act 6 alliance dialogue |
| `DOC-A5.7` | A ration return: *fire cake and water* | ROUGH | The `VF-01` contradiction |

## 5.6 Threads

- **Conway Cabal:** the act's spine. Gates is warm and competent in Act 2 and a rival here, and the player met him first.
- **Arnold:** paid forward. At `MT-04` the student watches Arnold win Saratoga and watches Gates report it. **When Arnold turns in 1780, the student will have a reason.** The game never excuses him and it does not have to.
- **Enslaved people:** the 1st Rhode Island's reorganisation, February 1778 — roughly 197 Black soldiers under white officers, and the fact that most Black soldiers in this army served in **integrated** regiments and the 1st Rhode Island was the exception. Both facts encoded: an integrated file in the crowd, and one named man of the 1st.
- **Congress-can't-pay:** the pay abstract in `VF-02`, unhonoured, and the Committee at Camp's inability to fix supply because the states will not requisition.
- **Intelligence:** the Culper Ring is formed in 1778 and is mentioned once, in a single line, at the tail of this act. That is all the setup Act 6 needs.
- **Letterbook (I5):** *To Henry Laurens, President of Congress, and to Landon Carter.* The Cabal, the winter, the dead. On the "answer publicly" branch, a very different and much worse letter.
- **Gilt Frame 5:** *The Prayer at Valley Forge.* Weems 1804 → Brueckner 1866 → US postage 1928. The gap: **there is no contemporary source for this event of any kind, and the man who first wrote it down also invented the cherry tree.** Second in importance only to the Leutze.

**Apex scene:** `A5-S7`. **Camera move:** the game's slowest — a 7-second lateral drift down the finished brigade street, so slow the student is not certain it is happening.

---

# ACT 6 — YORKTOWN
### September – October 1781 · 45 minutes · the payoff · *(was Act 7 in the brief — see §0.1)*

## 6.1 Function and tone

Act 6 is where the alliance becomes material and the intelligence thread pays. It is also the act where the enslaved-people thread arrives at its worst and truest moment.

**Tone:** the most saturated act in the game, and it is earned by contrast with Acts 4, 5 and 7. Dust, chalk, red clay, hot autumn light. High hazy sun near overhead, minimal shadow.

**Fixed loss (R20):** *The people who fled to the British lines are returned to slavery.* During the siege, enslaved people who had reached the British were driven out of Yorktown into the ravines between the lines, where they died of smallpox and starvation. After the surrender, Article 10 of Cornwallis's proposed terms — protection for those who had come over — **was refused**, and Washington personally had agents looking for people who had escaped from Mount Vernon aboard HMS *Savage* in April 1781. The player cannot alter any of this. It is not presented as a choice, because it was not offered as one.

**Sourced humour (R23):** Washington, standing exposed on the parapet watching the redoubts, is warned by Colonel Cobb that the position is dangerous. He replies, without turning: *"Colonel Cobb, if you are afraid, you have liberty to step back."* Dry, documented, and completely in character.

## 6.2 Scene graph

```
   ┌────────────────────┐
   │  A6-S1    YT-04    │  The Marquee — Rochambeau, Lafayette,   [NEW plate]
   │  The Marquee       │  the deception, the money
   └─────────┬──────────┘
             │  [map-table lift]
             ▼
   ┌────────────────────┐
   │  A6-S2    MT-05    │  The Chesapeake — de Grasse, the blockade,
   │  The Chesapeake    │  the clock  [A6-D1 · SEALED]
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │  A6-S3    YT-01    │  The Second Parallel — the siege clock
   │  Second Parallel   │  SCRIPTED SEQUENCE, 6 beats
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │  A6-S4    YT-02    │  Redoubt 10, Night — 5 beats
   │  Redoubt 10        │
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │  A6-S5    YT-03    │  The Surrender Road
   │  The Surrender Road│  [A6-D3 — the terms — resolved before this scene]
   └─────────┬──────────┘
             ▼   Gilt Frame 6 (Trumbull 1820) ──▶ Interlude I6
```

Five scenes, **four plates**, one map table.

## 6.3 Scene list

### A6-S1 · `YT-04` "The Marquee" — interior, R1, INT-4 · **NEW canonical view**

**Composed view.** Washington's own sleeping-and-office marquee, interior: an oval fourteen feet by twenty-three, twelve feet at the peak, guy lines fanning out beyond the frame. Near-frontal. Camp furniture, a folding table, the maps. Warm canvas light. **This is a surviving object** — it is in the Museum of the American Revolution — and its dimensions are exact.

**What the player does.** The diplomacy scene, and the game's best NPC writing. Rochambeau and Lafayette; the state of the alliance depends on choices made in Acts 3 and 5 and is expressed entirely as **tone**, never as a meter.

**NPCs.** **Comte de Rochambeau** · **Marquis de Lafayette** · **Alexander Hamilton**, now a lieutenant colonel who wants a field command and has said so in writing repeatedly · **Benjamin Tallmadge**, running the Culper network · Billy Lee, who by 1781 has damaged both knees and rides with difficulty — documented, unremarked, and visible in the cutout's posture.

**Findable.** `DOC-A6.1` de Grasse's letter — 28 ships, 3,000 troops, and **he must leave by the middle of October** · `DOC-A6.2` the deception papers: the Chatham bake-ovens order, and letters written to be intercepted · Rochambeau's chest of coin, from which he lent Washington half his war chest so the Continentals could be paid enough hard money to march · a French engineer's plan by Duportail · Lafayette's letters from Virginia about Arnold · the Culper cipher.

**Exits.** Tent flap → `A6-S3` (after `A6-S2`). The map on the table → **lift** → `A6-S2`.

**Contradiction (C4).** Rochambeau says the fleet will hold the Chesapeake as long as necessary. `DOC-A6.1`, examined, has de Grasse writing that he must be gone by mid-October. Neither is marked true; the general is being encouraging and the admiral is being accurate.

---

### A6-S2 · `MT-05` "The Chesapeake" — map table, R2

**This is where the brief's "French fleet visible offshore" goes**, and the reason it goes here is the whole justification for the map-table mechanic: the fleet is a **strategic** fact and the siege line is a **sensory** one. From the allied trenches you could see the York River and British shipping in it — including the *Charon*, burned by allied hot shot on 10 October — but not a line of battle in the Chesapeake.

The sheet shows: de Grasse's position, the Capes, Cornwallis's peninsula, Clinton's fleet at New York, and the distances. The tokens the player moves are armies. **`A6-D1` is decided at this table.**

The clock starts here: **de Grasse leaves mid-October.** It is the honest kind of timer — a real deadline set by an ally's obligations elsewhere, not a game mechanic.

---

### A6-S3 · `YT-01` "The Second Parallel" — exterior, R1, EXT-5

**Composed view.** Shallow elevated three-quarter along the trench. **Gabions** in the foreground — bottomless wicker baskets one to three feet high, filled with earth, earth spilling over the rims — with **fascine** stacks behind them. The town beyond as pale wash. Dust and chalk.

**The siege is the game's first diegetic clock (Citizen Sleeper transfer).** The first parallel opened 6 October; the second, four hundred yards closer, on 11 October under the fire of seventy-six allied guns. The progress meter is the trench itself, drawn on the ground, advancing. **There is no UI bar.**

**What the player does.** Six beats (§10.3). Chooses whether to fire the first gun himself (documented; characterization-only). Walks a trench in which men he has known since Act 2 are digging.

**NPCs.** **Brigadier General Louis Duportail**, chief engineer · **Private Joseph Plumb Martin**, in the sapper company, digging — this is his third act and his examine text should read as a man who has stopped expecting anything · a **soldier of the 1st Rhode Island** · **an integrated Continental file**, per de Verger.

**Findable.** `DOC-A6.5` the siege journal and the order for unloaded muskets · a gabion, examined and explained · a fascine · the *Charon* burning, as an object in the middle distance · a French officer's calling card · a spade, and the same Washington line as Act 3, now meaning something else.

---

### A6-S4 · `YT-02` "Redoubt 10, Night" — exterior, R1, EXT-5

**Composed view.** Near-frontal, low camera, abatis silhouetted against nothing. Moonless. The only light is what men carry and they are carrying almost none.

**Five beats.** Muskets unloaded and unprimed so no accidental shot gives warning. The French take Redoubt 9 and lose men clearing the abatis; the Americans take Redoubt 10. `A6-D2` — who commands the American assault — is decided before this scene.

---

### A6-S5 · `YT-03` "The Surrender Road" — exterior, R1, EXT-5. **The shot the act builds to.**

**Composed view.** Near-frontal theatrical elevation looking **down the corridor between the two allied lines** — immaculate French one side, ragged Americans the other, the British and German column receding to the vanishing point with their colours cased. This composition requires no invention. It is what happened, and it teaches what the alliance materially meant without a word.

**What the player does.** Stands still. Washington's cutout does not walk in this scene; the player moves the camera's attention by examining, and the walk-plane is four metres long. O'Hara offers the sword to Rochambeau, who declines and points; Washington, refusing to receive it from a subordinate, directs it to Benjamin Lincoln — who was denied the honours of war at Charleston in 1780 by these same men.

**NPCs.** **Brigadier General Charles O'Hara** · **Major General Benjamin Lincoln** · Rochambeau · Lafayette · the ragged American line, in which the player can find, by name, four men they met in earlier acts.

**Findable.** `DOC-A6.3` the **Articles of Capitulation**, with Article 10 and its refusal · `DOC-A6.6` the Charleston precedent · `DOC-A6.4` the HMS *Savage* list · a cased regimental colour · the tune the bands played, which was **not** "The World Turned Upside Down" — that attribution is apocryphal and the examine string says so with its source.

## 6.4 Decisions

### `A6-D1` — **SEALED** — New York or the Chesapeake
> *You have wanted New York for five years. Rochambeau wants the Chesapeake. De Grasse's letter has just arrived.*

| Option | Historically | Stats |
|---|---|---|
| Insist on New York | What he wanted, argued for, and was talked out of | Judgment **−7**, Legitimacy **−3**, Character **−2**; the act still ends at Yorktown, six weeks later and worse |
| Accept the Chesapeake | **What he did**, and he recorded the change of mind in his own diary | Judgment **+8**, Legitimacy **+4**, Character **+4** |
| Split the force: mask New York, march the rest | Close to what actually happened operationally, but as a *decision* it is a hedge | Judgment **+3**, Legitimacy **+1** |

**Council (4).**
- **AMBITION**: *"New York is where Howe humiliated you. Cornwallis is only where the fleet happens to be."*
- **RESTRAINT**: *"You have been wrong about New York since 1776. Consider that the pattern is the argument."*
- **DUTY**: *"Rochambeau's orders place him under your command. He has never once behaved as though that were a favour. Do not make it one."*
- **VANITY**: *"Whichever town falls, the letters will say you chose it. Choose the one that falls."*

**Knowledge lock.** The second option requires `DOC-A6.1`. Margin note: *"— you have not read de Grasse's terms."* Without it the player can only guess at the deadline, and the siege clock in `A6-S3` runs three beats shorter.

### `A6-D2` — Redoubt 10 · standard
Hamilton has asked, in writing, repeatedly, for a field command. Lafayette's choice for the assault is Gimat. Options: give it to Hamilton (Loyalty **+3**, Legitimacy **+2**, Character **+3** — what he did); give it to Gimat (Judgment **+1**, and Hamilton's Persons entry changes permanently); lead it himself (Judgment **−6**, Loyalty **+7**, Character **−3**, and the Council's Vanity gets a full paragraph in the epilogue).

### `A6-D3` — The terms · standard · **a Personal Character decision that looks like a Military Judgment one**
Cornwallis requests the honours of war. At Charleston in May 1780 the British denied them to Lincoln.

| Option | Historically | Stats |
|---|---|---|
| Refuse, on the Charleston precedent, and have Lincoln receive the sword | **What he did.** Deliberate, reciprocal, and cold | Judgment **+2**, Loyalty **+6**, Legitimacy **+3**, Character **−3** |
| Grant them | Magnanimous; not what happened | Character **+6**, Loyalty **−5**, Legitimacy **−2** |
| Refuse, and say nothing about why | Available | Character **0**, Loyalty **+3** |

**Council (3).** TEMPER: *"They marched Lincoln's men out with their colours cased and their drums silent. Give them exactly what they gave."* — VANITY: *"There is a version of this that gets written about for two hundred years, and it is the generous one."* — DUTY: *"You are not settling a personal account. You are establishing what this country's word is worth in a capitulation."*

### `A6-D4` — Article 10 · **not a decision** · 0 stats, no options
The player is shown the article, shown the refusal, and given exactly one interaction: read it, or walk away. There is no branch. This is the game's most deliberate use of R20 and the absence of a choice is the content.

## 6.5 The battle: SCRIPTED STAT-WEIGHTED SEQUENCE, COMBINED-ARMS VARIANT

Specified at §10.3; Act 6's variant adds the siege clock and the allied-contribution weighting described there.

## 6.6 Documents

| ID | Source | Register | Unlocks |
|---|---|---|---|
| `DOC-A6.1` | De Grasse to Washington — 28 ships, 3,000 troops, **gone by mid-October** | SECRETARY (French, transcribed) | **`A6-D1`'s second option.** Sets the siege clock |
| `DOC-A6.2` | The deception papers: Chatham bake-ovens; letters written to be intercepted | SECRETARY + PRINTED | The intelligence payoff dialogue with Tallmadge; two examine variants |
| `DOC-A6.3` | Articles of Capitulation, 19 October 1781, **Article 10 and its refusal** | ENGROSSED | `A6-D4`. Nothing else. It does not need to |
| `DOC-A6.4` | The HMS *Savage* list — the people who left Mount Vernon in April 1781 | ROUGH | The Act 8 corridor scene and the epilogue's third pass |
| `DOC-A6.5` | The siege journal; the unloaded-muskets order | SECRETARY | Redoubt beats 2 and 4 |
| `DOC-A6.6` | The Charleston terms, May 1780 | PRINTED | `A6-D3`'s first option |
| `DOC-A6.7` | GW to Thomas McKean, 19 October 1781 | SECRETARY | Letterbook |

## 6.7 Threads

- **Intelligence pays off.** Chatham's ovens, the intercepted letters, Clinton sitting in New York waiting for an attack that was never coming. **The payoff is that nothing happens** — no ambush, no reveal, just a British army in the wrong place. Tallmadge's one line explains it and the player realises they built this in Act 3 by failing.
- **Arnold.** He burned Richmond in January 1781 and New London in September 1781 while this army marched south. Lafayette was sent to catch him. Washington's standing order about what to do if he was taken is a findable object. **Arnold never appears on screen in this game.** He is a portrait, three documents, and an absence, which is a more accurate account of what he became.
- **Enslaved people.** The act's fixed loss. Named: the *Savage* list. Harry, from Act 1, is not on it — he left in 1776 — and the game does not say so yet.
- **Congress-can't-pay:** Rochambeau lends Washington the coin to march his own army. A foreign general pays the United States Army. That fact needs no commentary.
- **Letterbook (I6):** *To Thomas McKean, President of Congress, 19 October 1781.* The real despatch. Then seventeen months in which nothing happens and no one is paid.
- **Gilt Frame 6:** Trumbull, *The Surrender of Lord Cornwallis*, 1820, Capitol Rotunda. The gap: Cornwallis is not in the painting because he was not there, and Trumbull put Washington at the centre when protocol had put him at the edge.

**Apex scene:** `A6-S3`. **Camera move:** the game's one expensive moment — a 6-second pull-back from the second parallel that discloses the York River, the burning *Charon*, and the peninsula, and resolves directly into the `MT-05` map-table view. This is the only camera move anyone will remember and it should be the only one they do.

---

# ACT 7 — NEWBURGH
### March 1783 · 35–40 minutes · claustrophobic · *(was Act 6 in the brief — see §0.1)*

## 7.1 Function and tone

Act 7 is the closest the American republic came to a military coup, and almost no student has heard of it. It is the game's best "beyond the standards" act and its most important one.

**Tone:** the cleanest and most claustrophobic act. The army is the best-dressed it has ever been — 1779 regulation, blue with state facings, one figure in four still out of regulation. Interior light only: one window, candles, a fire. High contrast, tight values, almost no wash outside skin and coat.

**Fixed loss (R20):** *Congress never pays.* The commutation — five years' full pay in place of the half-pay-for-life promised in 1780 — was voted on 22 March 1783 and not funded. The army was furloughed in June, largely unpaid. In the same month, Continental troops surrounded Congress in Philadelphia and drove it out of the city. Nothing the player does alters any of it.

**Sourced humour (R23):** Chastellux's own description of the Hasbrouck House's principal room as *"tolerably spacious"* but having **"seven doors and only one window."* Deliver it as an examine string on the room itself, attributed and dated. It is dry, it is true, and it is the set.

## 7.2 Scene graph

```
   ┌────────────────────┐
   │  A7-S1    NB-01    │  Seven Doors — the anonymous address arrives
   │  Seven Doors       │
   └─────────┬──────────┘
             │
     ┌───────┴────────┐
     ▼                ▼  [map-table lift]
┌──────────────┐  ┌────────────────────┐
│ A7-S2 NW-02  │  │  A7-S3    MT-06    │
│ The Cantonment│  │  The Bounty Lands  │  pay that is land
└──────┬───────┘  └────────────────────┘
       │  [A7-D2 · SEALED]
       ▼
┌──────────────┐
│ A7-S4 NW-01  │  THE TEMPLE — the address and the spectacles
│ The Temple   │
└──────┬───────┘
       ▼
┌──────────────┐
│ A7-S5 NB-01′ │  Seven Doors, after. [prop toggle only — 0 new layers]
│ After        │
└──────┬───────┘
       ▼   Gilt Frame 7 ──▶ Interlude I7
```

Five scenes, **three plates**, one map table, one prop-toggle revisit.

## 7.3 Scene list

### A7-S1 · `NB-01` "Seven Doors" — interior, R1, INT-4. **The most important composed shot in Act 7 and possibly in the game.**

**Composed view.** Dead-on near-frontal theatrical elevation, perfectly flat. The Hasbrouck House's converted parlour: a **one-storey Dutch vernacular stone farmhouse** room with a **Dutch jambless fireplace** (open hearth, no side jambs, a broad hood — utterly unlike an English fireplace and worth getting right). The single window stage right. **Seven doors ranged across the wall.** A room about pressure closing in from every direction, and it is literally true.

**What the player does.** The anonymous address arrives. The player reads it — and the typography does the analysis. Talks to officers who come in through several of those doors.

**NPCs.** **Major General Horatio Gates**, second in command at Newburgh, and the last time the player saw him he was taking credit for Saratoga · **Colonel Alexander McDougall**, who took the officers' memorial to Congress in December · **Jonathan Trumbull Jr.**, secretary · **Billy Lee**, who by now cannot ride and is in the room because he lives there.

**Findable.** `DOC-A7.1` **the anonymous Newburgh Address** — set in the ROUGH register, a *disguised* hand, neither Washington's secretary hand nor a printed broadside. **A student who notices that has performed document analysis without being told they were doing one.** · `DOC-A7.2` the officers' memorial, December 1782 · `DOC-A7.3` Washington to Joseph Jones — the army as "a dangerous instrument to play with" · the spectacles, in a case, on the table — **the same spectacles that were in the drawer at Mount Vernon in Act 1, and the examine text does not say so** · the seven doors, examinable individually, each naming who comes through it · Chastellux's description · an officer's pay account, six years in arrears.

**Exits.** Four of the seven doors are live: to `A7-S2`; to the map table (`A7-S3`); to Trumbull's writing room (a two-metre alcove that is not a scene); and out to the road, which is locked all act.

**Contradiction (C4).** Gates says the officers only want what Congress promised. `DOC-A7.1`, examined, proposes that if Congress does not act the army should refuse to disband at the peace, or refuse to fight if the war resumes — either of which is a threat to the civil power. Neither is marked true, and the address is anonymous, so nobody can be held to it. **That anonymity is the whole political problem and it is legible in the typeface.**

---

### A7-S2 · `NW-02` "The Cantonment" — exterior, R1, EXT-5

**Composed view.** New Windsor. Huts in the Valley Forge grid but better built — the army has learned to build. Mud, early spring, thin sun. Six hundred huts. Men who have been soldiers for eight years and have no trade to go home to.

**What the player does.** Walks among the men who are going to be at the meeting. The **second diegetic clock** lives here: **the number of signatures on the officers' petition**, drawn as names on a sheet nailed by the commissary's door. It rises across the act. It is never a UI element.

**NPCs.** **Private Joseph Plumb Martin**, fourth appearance, about to be furloughed without pay and knowing it · **Captain John Armstrong Jr.**, Gates's aide — *who wrote the anonymous address*, which the game does not reveal until the epilogue · **Sarah Osborn**, last appearance · a **soldier of the 1st Rhode Island**, whose regiment is about to be disbanded and whose freedom depends on paperwork.

**Findable.** `DOC-A7.4` the commutation resolution, 22 March 1783 — voted, unfunded · the signature sheet · a furlough form with the pay line blank · a soldier's discharge · a hut, entered, with eight years of a man's life in it · an officer's sword, for sale.

---

### A7-S3 · `MT-06` "The Bounty Lands" — map table, R2

**Congress-can't-pay, made geographic.** The sheet is the Ohio country. Congress cannot pay the army in money, so it proposes to pay it in land — land that is not Congress's to give, that is occupied by nations who are not party to the treaty, and that will require another war to deliver.

The player moves tokens: warrants, acres, the Proclamation Line of 1763, the Six Nations, the Shawnee, the Miami. **This is where the Articles of Confederation's fiscal impotence and the westward expansion of the next twenty years are shown to be the same fact**, and it takes four minutes and no exposition. It is the strongest single argument this game makes for existing.

---

### A7-S4 · `NW-01` "The Temple, Interior" — interior, R1, INT-4

**Composed view.** The New Building — the "Temple of Virtue" — about eighty feet by forty, new pine, benches, a dais. Near-frontal, camera at the far end from the dais. Officers standing. This is a hall built by an army for its own use in the first months of 1783 and it smells of resin.

**What the player does.** The set piece. Washington appears unannounced. He delivers a nine-page address that **fails** — the officers are unmoved. Then he takes out a letter from a congressman, and the spectacles, and says the line.

**The glasses are not a stat outcome.** They appear in all three portrait bands, in every playthrough. They are the act. What varies by stat band is only how the room is described afterwards.

**NPCs.** Gates, presiding over a meeting he did not expect Washington to attend · Armstrong · McDougall · roughly five hundred officers, of whom nine are named.

**Findable.** `DOC-A7.6` the address itself, in his hand, with corrections · the congressman's letter, which is genuinely dull · the spectacles, now worn.

---

### A7-S5 · `NB-01′` "After" — prop toggle only

The same room, that night. The seven doors are closed. He writes to Congress. The signature sheet is gone.

## 7.4 Decisions

### `A7-D1` — The memorial · standard
When McDougall's memorial comes back from Congress with nothing, options: endorse the officers' claims to Congress in his own name (Legitimacy **−3**, Loyalty **+6**, Character **+3** — and it is what he did, repeatedly, for years); stay out of it (Legitimacy **+2**, Loyalty **−5**); tell the officers plainly that Congress cannot pay and will not be able to (Legitimacy **+1**, Loyalty **−2**, Character **+5**).

### `A7-D2` — **SEALED** — The Newburgh Address
> *An anonymous paper is circulating calling an unauthorised meeting of the officers tomorrow.*

| Option | Historically | Stats |
|---|---|---|
| Forbid the meeting and order the officers to their quarters | A direct confrontation with an armed body that outnumbers your authority | Legitimacy **−5**, Loyalty **−7**, Judgment **−4**, Character **+2** |
| Let it happen and stay away | What Gates wanted | Legitimacy **−8**, Loyalty **+2**, Judgment **−6** |
| Forbid the irregular meeting; call a regular one yourself for the 15th; and then attend it unannounced | **What he did.** | Legitimacy **+8**, Loyalty **+5**, Judgment **+7**, Character **+6** |
| Address the officers in writing only | Available and weak | Legitimacy **0**, Loyalty **−3** |

**Council (4).**
- **DUTY**: *"An army that meets without its commander's leave has already decided something. Do not let the first thing it decides be that it can."*
- **TEMPER**: *"Gates sits in that room. He has wanted your chair since Saratoga and now he has a grievance to ride."*
- **RESTRAINT**: *"Do not argue with them. Argue with the letter."*
- **VANITY**: *"They will write this down. Whatever you say next is the sentence."*

**Knowledge lock.** The third option requires `DOC-A7.1` **read in full** — not merely picked up. Margin note: *"— you have not read the anonymous address."* The design intent is exact: the manoeuvre that saved the republic depended on Washington having actually read the thing he was answering.

### `A7-D3` — The spectacles line · characterization-only · 0 stats
Three phrasings, all documented as variants of what witnesses reported. The player chooses which one Washington says. **No stat moves. No branch changes.** What changes is the sentence in the epilogue and the sentence in Act 8's letterbook. It is the purest expression of R11 in the game and it is placed at the emotional summit on purpose.

## 7.5 Documents

| ID | Source | Register | Unlocks |
|---|---|---|---|
| `DOC-A7.1` | **The anonymous Newburgh Address, 10 & 12 March 1783** | **ROUGH — a disguised hand** | `A7-D2`'s third option. **The typography is the lesson** |
| `DOC-A7.2` | The officers' memorial to Congress, December 1782 | ENGROSSED | `A7-D1` |
| `DOC-A7.3` | GW to Joseph Jones — "a dangerous instrument to play with" | SECRETARY | One `A7-D2` council variant |
| `DOC-A7.4` | The commutation resolution, 22 March 1783 | PRINTED | Nothing. **It is the fixed loss** |
| `DOC-A7.5` | Bounty-land warrants | ENGROSSED | `MT-06` |
| `DOC-A7.6` | Washington's address and speech notes | SECRETARY, corrected | `A7-S4` |
| `DOC-A7.7` | The Circular Letter to the States, 8 June 1783 | PRINTED | Letterbook I7 |

## 7.6 Threads

- **Congress-can't-pay** reaches its terminus and becomes the Articles' obituary. The player has been watching this since Act 2.
- **Arnold** is the unspoken argument in the room: the last general who decided the country had failed him.
- **Enslaved people:** Billy Lee is in `NB-01` in every scene and cannot ride. The 1st Rhode Island's disbandment and the paperwork that freedom depended on.
- **Intelligence:** none. Act 7 has no enemy.
- **Letterbook (I7):** *The Circular Letter to the States, June 1783* — his own summary of what the republic must do or fail. The most important thing he wrote that nobody reads.
- **Gilt Frame 7:** *Washington Addressing the Officers at Newburgh*, 19th-c. engraving tradition. The gap: the room was the New Building, miles from headquarters; **and the address itself failed. It was the spectacles that worked.**

**Apex scene:** `A7-S4`. **Camera move:** a 4-second push, ending at the moment he reaches for the case. Then it stops and does not move again for the rest of the act.

---

# ACT 8 — ANNAPOLIS
### 23 December 1783 · 20–25 minutes + 10-minute epilogue · bright, still, museum-like

## 8.1 Function and tone

Three scenes, one of which is a corridor with one person in it. Act 8 is short on purpose and it is the whole point of the game.

**Tone:** the inverse of everything before. `PAPER` at full brightness, ink line at its finest and most even, wash almost absent, no smoke, no weather. Whitewash, unfinished pine, cold December window light. Bright, even, near-shadowless — light from everywhere. `W` is clamped to a single value, 0.80, for every student in the room: **the resignation looks identical no matter how you played, because the act is the only thing that matters and the game has nothing left to grade.**

**Silence (R15):** Act 8 carries **no score at all** until its final beat.

**Fixed loss (R20):** *He goes home to a plantation worked by more than a hundred enslaved people and he does not free them.* Stated in the epilogue, plainly, once.

**Sourced humour (R23):** the ball on 22 December, the night before, at which — by a contemporary account — every lady in the room got "a touch of him," Washington dancing every set. It is warm, it is documented, and it is the last human thing before the coldest room in the game.

## 8.2 Scene graph

```
   ┌────────────────────┐
   │  A8-S1    AN-02    │  The Corridor. One person.        [NEW plate]
   │  The Corridor      │
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │  A8-S2    AN-01    │  The Old Senate Chamber. Twenty delegates.
   │  The Chamber       │  [A8-D1 · SEALED]
   └─────────┬──────────┘
             ▼  Gilt Frame 8 (Trumbull 1824)
   ┌────────────────────┐
   │  A8-S3    MV-04    │  The Dock. Christmas Eve. Same plate as A1-S4.
   │  Home              │
   └─────────┬──────────┘
             ▼   THE EPILOGUE — three passes (§12)
```

Three scenes, **one new plate** (`AN-02`), one existing plate (`AN-01`), one reused (`MV-04`).

## 8.3 Scene list

### A8-S1 · `AN-02` "The Corridor" — interior, R1, INT-3 · **NEW canonical view**

**Composed view.** A whitewashed passage outside the Old Senate Chamber. One window. Two doors. Four metres of walk-plane. The smallest scene in the game.

**What the player does.** Talks to Billy Lee. **This is the payoff of eight acts of unremarked presence and it is the only scene in the game where the UI does not offer a single choice that changes anything.** Billy Lee has been in every act. He is not going into the chamber. He has damaged both knees. He will go back to Mount Vernon and he will not be free for sixteen more years, and he will be the only person Washington's will frees immediately.

The scene runs about four minutes. It has three exchanges and none of them are about liberty, because that conversation did not happen and inventing it would be the single worst thing this game could do.

**NPCs.** **William (Billy) Lee.** One. Marked `sensitive: true`.

**Findable.** `DOC-A8.1` the resignation address, in draft, in his coat · Washington's hat, held · the door.

**Exits.** The chamber door → `A8-S2`. One-way.

---

### A8-S2 · `AN-01` "The Chamber" — interior, R1, INT-4. **Symmetry is mandatory.**

**Composed view.** Dead-on near-frontal theatrical elevation, **perfectly symmetrical**. The Old Senate Chamber of the Maryland State House, restored 2007–2015 to its documented 1783 appearance: the **ladies' gallery above**, the **unfinished, unpainted, unvarnished floorboards**, a shallow apsidal end, plain classical woodwork, large windows. The President of Congress, **Thomas Mifflin** — who commanded the rearguard at Brooklyn in Act 3 and was in the Conway Cabal in Act 5 — seated centre. Washington standing at the bar.

**The room is half empty.** About twenty delegates from seven states were present. **Do not fill it.** The most consequential act of the war happened in a room that could not raise a quorum of states, and the emptiness is free and it is the argument.

**What the player does.** Makes `A8-D1`. Speaks. Hands over the commission. Walks out.

**NPCs.** **Thomas Mifflin**, President of Congress · **James McHenry**, aide, whose letter to Margaret Caldwell is the best eyewitness account of the event · **Molly Ridout**, in the gallery, who wrote one of the few other accounts · twenty delegates, of whom six are named · two aides.

**Findable.** `DOC-A8.1` the address · the commission itself, the physical paper from June 1775, which the player last saw in Act 1 · the unfinished floor · the gallery · the seat where a state's delegation is absent.

---

### A8-S3 · `MV-04′` "Home" — exterior, R1. **Same plate as `A1-S4`, prop and figure toggles only.**

Christmas Eve, 1783. The Potomac landing. The house up the slope with — **and this is the payoff of the first shot in the game** — the north end finished, a piazza that was not there in 1775, and a cupola. **It was built while he was away, and the student watched him leave before any of it existed.**

Lund is there. Billy Lee is there. Martha is at the house. Nothing is decided. The player walks up the slope and the epilogue begins.

## 8.4 Decisions

### `A8-D1` — **SEALED** — The words
> *Under four hundred of them. Choose three clauses.*

Three slots, three options each, assembled into the address the player then delivers. Every combination is drawn from what he actually said or what he demonstrably considered.

| Slot | Options | Effect |
|---|---|---|
| **The army** | "the Army I have so long had the honor to Command" / "the Armies of the United States" / "the men who have borne it" | Loyalty ±3; sets the epilogue's first pass |
| **The officers** | ask Congress to remember them by name / commend "the interests of our dearest Country" generally / ask nothing | Legitimacy ±4, Character ±3 |
| **Himself** | "retiring from the great theatre of Action" / "I here offer my Commission, and take my leave of all the employments of public life" / a single sentence and no flourish | Character ±5; **sets which of the three epilogue foils is named first** |

**Council (3).**
- **RESTRAINT**: *"Give it back plainly. Any flourish at all and you are keeping a piece of it."*
- **VANITY**: *"Trumbull will paint this. Stand where the light is."*
- **DUTY**: *"You are handing a commission back to twenty men in a half-empty room. That is the whole republic. Address it as though it were."*

**There is no fourth option and there is no branch that keeps the commission.** The game will not offer a fantasy of a Washington who does not resign, because the whole point of the eight acts is that this man, with this temper and this vanity, both of which the player has heard argue all game, chose otherwise. **Offering the alternative would make it a choice instead of a character.**

## 8.5 Documents

| ID | Source | Register | Unlocks |
|---|---|---|---|
| `DOC-A8.1` | The resignation address, 23 December 1783 | ENGROSSED | The letterbook's final entry. The only document in Act 8 |
| `DOC-EP.1` | **The Book of Negroes, 1783** | ROUGH, ledger-ruled | Epilogue, third pass. Not findable during play |

## 8.6 Threads — all of them close

- **Enslaved people:** the corridor. Then the epilogue's third pass.
- **Congress-can't-pay:** Congress cannot raise a quorum to receive its own army's commander.
- **Gilt Frame 8:** Trumbull, *General George Washington Resigning His Commission*, 1824, Capitol Rotunda. The gap: **Trumbull filled the room. Molly Ridout, who watched from the gallery, described a handful of people.**

**Apex scene:** `A8-S2`. **Camera move:** none. Act 8 spends its move on `A8-S3`: an 6-second slow push up the slope toward a house that has finished being built without him. Score enters here, for the first time in the act, on that push.

---

# 10. THE FOUR ACTION FORMATS, RE-SPECIFIED

The brief specifies three battle formats designed for a top-down pixel game with real-time animated combat. None of them survive the pivot intact. Here is what each becomes under fixed-camera dioramas plus a genuine-3D map table. **No new engine subsystem is required for any of them: all four read and write the same global state object, and all four are authored in ink.**

## 10.1 Format 1 — THE LOGISTICS PUZZLE (Act 2: Knox's train)

**What it is now.** A four-variable allocation made once at the map table `MT-01`, resolved deterministically over **five dispatch beats** read at `CB-02` across the rest of Act 2. It is not a separate mode. The player never leaves the game's normal grammar.

**Framing, non-negotiable.** Washington was not on the trail. He is in Cambridge, reading dispatches and moving tokens on a survey sheet. This preserves "always Washington" **and** the history, and it is the reason the map table exists.

**The four variables.**

| Variable | Options | Real basis |
|---|---|---|
| `route` | Lake George → Albany → **Berkshires** (what Knox did) · Lake George → Albany → **down the Hudson to Kingsboro** · **wait for hard ice** on the Hudson before crossing | Knox crossed the Hudson four times and hauled over the Berkshires |
| `teams` | 42 ox-and-horse sleds · 80 sleds · take whatever the countryside gives | Knox hired teams locally as he went |
| `garrison` | strip Ticonderoga's remaining guns · leave a defensible battery | Ticonderoga still faced Canada |
| `escort` | none (speed) · a company (security) | He travelled essentially unescorted |

**Resolution.** Two outputs, both deterministic, both authored:

```
guns_arrived ∈ {23, 38, 51, 59}       days_late ∈ {0, 9, 17, 26}
```

The historical result — **59 pieces, arriving late January 1776** — is reachable and is not the only good outcome. `guns_arrived` gates how `A2-D2`'s consequences read, how `CB-03′` is composed (prop toggles: how many guns are on the hill), and one line in Interlude I2. `days_late` is the act's `P` progression driver.

**No fail branch.** The lowest outcome still brings 23 guns. The train never fails, because it did not. What varies is whether Howe is looking at a battery or at an army with artillery.

**Cost.** One map sheet, one token sheet, five text beats, zero new plates.

## 10.2 Format 2 — THE DECISION-BATTLE HYBRID (Act 3: the evacuation)

**What it is now.** One composed plate (`BK-02`) that **never cuts**, one diegetic clock, and a manifest.

**The clock.** The tide and the dawn. It is drawn on the ground — the waterline on the pilings, and the sky's value in `L0` — never as UI. It advances on a real timer of **9 minutes 30 seconds** of wall-clock time. That is the only real-time element in the entire game and it exists so that the student feels a deadline they cannot argue with.

**The mechanic.** Six boats leave. Before each, the player chooses what goes in it. The choices are always drawn from a live manifest of what is standing on the beach, and **everything not loaded when the fog lifts is lost and named.**

| Boat | The competing claims |
|---|---|
| 1 | the wounded · the field guns |
| 2 | Smallwood's Marylanders · the Pennsylvania riflemen |
| 3 | the horses · the entrenching tools |
| 4 | the baggage and papers · the women and children of the army |
| 5 | the powder · the sick |
| 6 | the rearguard · Washington |

**Rules.**
- **The army always gets across.** It did. The manifest is not survival, it is composition.
- Every item on the manifest has a **proper name and one biographical fact** (R22). Not "the wounded" but *"Sergeant Ezra Coffin, Marblehead, who has been shot through the hand and cannot pull an oar."*
- Anything left is **spiked, burned or abandoned on screen**, in the plate, as a prop toggle.
- The final boat is not a choice: Washington crossed in the last boat, and the game shows that as a fact rather than offering it as a virtue.
- The manifest is written directly into **Interlude I3**, in Washington's own hand, as numbers. That is where this act delivers its casualties.

**Stats.** Each boat's choice moves one stat by ±2. Total swing across the sequence: up to ±12 across four stats. No single choice is worth more than any other, and there is no optimal manifest — every version loses something the player will regret, which is the design.

**Cost.** One plate, six choice nodes, ~1,400 words, a prop-toggle table, and a nine-and-a-half-minute timer.

## 10.3 Format 3 — THE SCRIPTED STAT-WEIGHTED SEQUENCE (Act 4; Act 6)

**What it is now.** The diorama holds. **Washington's cutout stops walking.** The sequence advances as a list of **beats**, and a beat is exactly three things:

```
beat = { text_block, prop_and_figure_toggles, one audio one-shot }
```

Each beat has **three authored variants** — `LOW`, `MID`, `HIGH` — selected by a beat-specific stat expression evaluated once, at beat entry. Nothing is random. Two students at neighbouring desks with the same stats see the same thing, which is a hard classroom requirement.

**Act 4 — the crossing (9 beats across `DL-01` and `DL-02`).**

| # | Plate | Beat | Selector |
|---|---|---|---|
| 1 | DL-01 | The boats are brought down | Loyalty |
| 2 | DL-01 | Paine read aloud, or not | `DOC-A4.1` found |
| 3 | DL-01 | The first boat loads; the horses will not go | Loyalty |
| 4 | DL-02 | Ice against the hull | — (fixed) |
| 5 | DL-02 | Knox, and the boat | Character |
| 6 | DL-02 | **`A4-D2` fires** | — |
| 7 | DL-02 | The far bank; two men will freeze on the road | — (fixed, R20) |
| 8 | DL-02 | The columns divide | Judgment |
| 9 | DL-02 | The march begins, three hours late | — (fixed) |

**Act 4 — Trenton (7 beats on `TR-01`).** The Hessians turn out under arms; the guns come down King Street; Rall falls; the fight lasts forty-five minutes. **Selector on beats 2, 4 and 6 only**; the rest are fixed. Violence is off-frame, in the aftermath, and in the ledger.

**Act 6 — the siege (6 beats on `YT-01`) and the redoubts (5 beats on `YT-02`).** Same machinery, plus two Act-6-only weights:

- `allied_warmth` — derived from Act 3 and Act 5 choices — selects whether the French appear in the beat text as allies, as colleagues, or as creditors.
- `siege_clock` — the parallels' advance — is the `P` term and it is drawn as trench on the ground.

**What this format explicitly is not.** No combat, no aiming, no timing, no input skill, no health, no death. The student's contribution to a battle in this game is everything they did in the six weeks before it, which is both the honest account of command and the only version that fits the architecture.

**Cost per sequence.** Zero new plates. One prop atlas row. 27 beats × 3 variants × ~90 words = ~7,300 words across Acts 4 and 6 combined, which is inside those acts' budgets.

## 10.4 Format 4 — THE MAP-TABLE LIFT (six times, all acts that have one)

**The game's only non-literal transition, and there is no second one.** Washington looks at the map; the painted diorama recedes and desaturates over 1.1 s; the survey sheet rises into frame and becomes a genuine-3D scene in the `wshmap` register — ruled lines, stipple, hachure, contour, flat tints, 55–75% bare paper.

**Justification, which is why it reads as characterisation and not as a special effect:** Washington was a surveyor. He was surveying at seventeen. The instruments are findable in Act 1, before the mechanic exists. **The game teaches the player who this man is by how he looks at ground.**

**The six tables.** `MT-01` Knox's route · `MT-02` the East River · `MT-03` the order of march · `MT-04` the Northern Department · `MT-05` the Chesapeake · `MT-06` the bounty lands.

**Interaction grammar, identical at all six:** move tokens, rotate one environmental variable (wind, ice, season, tide), read two documents laid on the sheet, and commit. Camera dollies only — never orbits.

**The surveyor's overlay** (the DE zoom-as-reward transfer): after `MT-01`, holding a key on any exterior draws contour hachures, sightlines and distances over the diorama in the `wshmap` style. Scoped to **12 exteriors**, one overlay layer each.

---

# 11. THE RECURRING THREADS — one matrix

| Thread | A1 | A2 | A3 | A4 | A5 | A6 Yorktown | A7 Newburgh | A8 |
|---|---|---|---|---|---|---|---|---|
| **Enslaved people** | `MV-03` Witness Register; Frank Lee, Doll, **Harry**; the Bryan Fairfax letter | **`A2-D3` — the Dunmore reversal.** Character does not move | Billy Lee in the last boat; Glover's mixed crews | Billy Lee on the road; Hessian baggage as property, unremarked | 1st Rhode Island reorganised; integrated file per de Verger | **Article 10 refused; the *Savage* list; the fixed loss** | Billy Lee cannot ride; the 1st RI disbanded; freedom on paperwork | **The corridor.** Then the Book of Negroes |
| **Congress can't pay** | the bill of lading | no powder, no money, enlistments expiring | Congress orders strategy it cannot fund | Morris's specie; the $10 bounty on GW's own credit | pay abstracts unhonoured; the Committee at Camp | **Rochambeau lends the US Army its own march money** | **the terminus: commutation voted, unfunded; Congress driven from Philadelphia** | Congress cannot raise a quorum to receive him |
| **Arnold** | — | — | **seeded:** the Lake Champlain dispatch | — | **Saratoga: he wins it, Gates reports it** | absent antagonist: Richmond, New London, the standing order | the unspoken argument in the room | named in the epilogue |
| **Conway Cabal** | — | Gates introduced warm | — | Mifflin introduced | **`A5-D2`, sealed** | — | Gates and Mifflin both return | Mifflin receives the resignation |
| **Intelligence / deception** | — | the first secret-service account | **Hale fails, totally** | Honeyman, and the dating of his evidence | the Culper Ring, one line | **the payoff: Chatham's ovens, and nothing happens** | — | — |
| **Letterbook** | I1 to Martha, 18 Jun 1775 | I2 to Joseph Reed | I3 to Hancock, 2 Sep 1776 | I4 to Congress, 27 Dec 1776 | I5 to Laurens / Landon Carter | I6 to McKean, 19 Oct 1781 | I7 the Circular Letter, Jun 1783 | `DOC-A8.1` the address |
| **Fixed loss (R20)** | the house is unfinished and he will not see it finished | there is no powder | Long Island is lost | the enlistments still expire | ~2,000 men die | **the people are returned to slavery** | **Congress never pays** | he goes home and frees no one |

---

# 12. THE EPILOGUE

Revealed in **three passes** (the Obra Dinn grouping), never as one screen. No score, no grade, no percentage. Each pass is one still — the writing desk, `AN-01` empty, `MV-04` at dusk — with type composing over it.

**Pass 1 — What kind of commander.** Assembled from Military Judgment and Troop Loyalty, and from the eight sealed decisions by name. It states **at least one thing the historical Washington did that the student's Washington did not**, and at least one the student's did that he did not. Neither is scored.

**Pass 2 — What kind of citizen.** Political Legitimacy and Personal Character. Names Newburgh and Annapolis. Then the foils, with what each of them did with victory:

> **Caesar** took it. **Cromwell** became it. **Napoleon** — who was fourteen years old on the day the commission went back — crowned himself.
> This man rode home.

**The student is never told this is admirable.** The list does that work and letting them draw the conclusion is the entire difference between teaching and telling.

**Pass 3 — The other biography.** The one the game has been building since minute nine of Act 1 and has never mentioned.

> **Harry** — the man at the stable end of the Mount Vernon quarter in Act 1 — left in 1776 for Dunmore's lines and did not come back. He served as a corporal in the Black Pioneers. In 1783 his name was written into the British ledger of the three thousand Black people evacuated from New York, and he sailed for Nova Scotia. In 1792 he sailed again, for Sierra Leone. In 1800 he took up arms against the company that governed it, and was exiled.
> He was, by every definition the student has been given for eight acts, a man who fought for his liberty and went home.
> `DOC-EP.1` — the Book of Negroes — is shown. His line in it is legible.

Then the last frame: the 1799 will freed Billy Lee immediately and the rest on Martha's death, and Washington did not free anyone during the war, and the game says so once and stops.

**Then, and only then**, the Washington Gilt Frame portrait appears beside the student's own Stage III portrait, side by side, and the game ends without a word.

---

# 13. TOTAL ASSET COUNT AND THE FEASIBILITY VERDICT

## 13.1 What the game actually contains

| | Count |
|---|---|
| Acts | 8 |
| **Scenes** | **39** |
| Diorama plates (masters) | **27** |
| State/progression variants (img2img + reslice) | 5 |
| Stat-mood apex plates (R12, one per act, `L2` only) | 8 |
| Map-table scenes | 6 |
| Interludes | 7 |
| Gilt Frame plates | 8 |
| Decision points | 41, of which **8 sealed** |
| Documents | **51** + 1 epilogue |
| Speaking characters | 34 |
| Authored words | 110,000 – 140,000 |

## 13.2 Distinct generations required

This is the **schedule driver**. It is the number that determines whether the art is makeable.

| Class | Generations | Yields |
|---|---|---|
| Diorama masters | 27 | 27 plates → 135 shipped layers |
| Diorama state variants (img2img) | 5 | 9 shipped layers |
| Apex mood variants (img2img, `L2` only) | 8 | 8 shipped layers |
| Map-table sheets | 6 | 6 |
| Map token sheet | 1 | ~20 tokens |
| Surveyor's overlays | 12 | 12 |
| Washington portrait matrix | 9 | 9 (1 master + 8 multi-ref) |
| Washington Gilt Frame portrait | 1 | 1 |
| NPC portrait masters (generated in pairs/trios) | 10 | 22 subjects |
| NPC expression sheets (4-up / 2-up) | 12 | 68 portrait states |
| Character stance sheets (3 facings each) | 26 | 26 rigged atlases |
| Crowd sheets (6 figures each) | 9 | 54 background billboards |
| Prop sheets (9 objects each) | 24 | ~216 props |
| Blank document papers | 12 | 51 documents, typeset in-engine |
| Gilt Frame plates | 8 | 8 |
| Tiling textures | 10 | 10 |
| Interlude stills (1 plate + relights) | 7 | 7 |
| Council emblem sheet (4×4) | 1 | 5 emblems + spares |
| UI elements | 3 | ~18 |
| Per-act palette plates | 8 | 8 LUTs |
| **TOTAL DISTINCT GENERATIONS** | **199** | |

**This lands almost exactly on the AI guide's ~200-asset envelope**, and at the guide's 15:1 candidate ratio it implies **~3,000 generations**, inside the guide's 2,500–4,000 expectation. **The generation load is feasible as designed.**

The human labour is the real cost and it is not in prompting:
- **27 blockouts** × ~30 min = 14 hours
- **27 depth-slices with hand-painted reveals** × 20–40 min = 13–18 hours
- **26 character segmentations** × 45 min = 20 hours
- **13 img2img variants** re-sliced × 25 min = 5 hours
- **Sensitive-asset review gates** (§7.6): 6 assets, external sign-off, ~2 weeks calendar

Roughly **55–60 hours of skilled hand work** on top of generation. That is a real number and it is survivable by one Art Lead over the production window.

## 13.3 Payload — and this is where the design does **not** fit

| Bucket | Shipped bytes |
|---|---|
| Diorama layers (135 master + 9 variant + 8 mood) | **102 MB** |
| Map sheets, tokens, overlays | 12 MB |
| Portraits (80, WebP q82) | 4.4 MB |
| Character atlases (3 Washington + 11 paired) | 12 MB |
| Crowd atlases (5) | 4.5 MB |
| Prop atlases (4 × 1024²) | 4.8 MB |
| Document papers (30 files) | 2.4 MB |
| Gilt Frames (8) | 3.6 MB |
| Tiling (10) | 3.5 MB |
| Interludes (7) | 3.2 MB |
| UI + emblems | 1.0 MB |
| **TOTAL SHIPPED ART** | **≈ 153 MB** |
| Audio (per ref-games §1.5) | 12 MB |
| **TOTAL MEDIA** | **≈ 165 MB** |

**The AI guide's budget is ≤ 85 MB of total shipped art. This design is 1.8× over it.**

### The verdict, stated plainly

**The 85 MB total is the wrong constraint and it should be raised to 155 MB. The constraints that actually govern the classroom experience are all comfortably met.**

Three arguments:

1. **The total is never downloaded at once.** The game is eight lazy-loaded act chunks. A student in period 3 downloads Act 5's chunk, not the game. The number that matters is the **per-act chunk**, and the number that matters most is the **initial** one.
2. **The initial download still fits.** Defining "initial" correctly — the shell plus **Act 1 Scene 1**, not the whole act — gives 3.3 MB of `MV-01` layers + 2.1 MB of engine, fonts, UI and Washington's Stage I atlas = **5.4 MB, interactive in under 15 s on 5 Mbps.** The rest of Act 1 prefetches during the first conversation, which runs four minutes.
3. **Per-act chunks land at 9–17 MB, which needs the cap raised from 12 MB to 18 MB — and that cap was never the binding one.** Each chunk is prefetched during the *previous* act's 40 minutes of play. 18 MB over 40 minutes is 60 kbps. **The prefetch window is three orders of magnitude larger than the requirement.** The 12 MB figure was a guess made before a scene inventory existed.

| Act | Plates | Chunk |
|---|---|---|
| 1 | 4 (incl. shared `MV-04`) | 13.9 MB |
| 2 | 3 + 1 variant + map | 14.6 MB |
| 3 | 3 + map | 13.8 MB |
| 4 | 4 + 1 variant + map | **17.4 MB** ← the peak |
| 5 | 4 + 3 variants + map | **17.1 MB** |
| 6 | 4 + map | 15.9 MB |
| 7 | 3 + map | 13.2 MB |
| 8 | 2 (`MV-04` already resident) | 9.1 MB |
| Global (Washington, letterbook, tiling, UI, portraits, emblems) | | 21 MB |

**And the good news the guide did not have:** peak GPU texture memory per scene is **~9 MB**, not the ~49 MB the guide estimated, because trimmed layers replace five full-frame ones. `L0` is 1024×576, `L1`/`L3`/`L4` are horizontal bands, and only `L2` is full frame. **Against a 120 MB ceiling, two resident scenes during a transition cost ~18 MB.** The memory constraint — the one that would actually crash a 4 GB Chromebook — has 6× headroom.

**Revised budget, recommended for adoption:**

| Bucket | Old | New | Status |
|---|---|---|---|
| Initial download (shell + A1-S1) | ≤ 8 MB | ≤ 8 MB | **unchanged, met at 5.4 MB** |
| Per-act lazy chunk | ≤ 12 MB | **≤ 18 MB** | raise |
| Total shipped art | ≤ 85 MB | **≤ 155 MB** | raise |
| Peak GPU texture, one scene | ≤ 120 MB | ≤ 120 MB | **unchanged, met at ~9 MB** |
| Peak JS heap | ≤ 180 MB | ≤ 180 MB | unchanged |

## 13.4 If the 85 MB total is immovable — the cut

Stated so it can be taken as a decision rather than discovered in month five. To reach 85 MB you must lose **seven plates and eight scenes**, in this order:

| # | Cut | Cost to the game |
|---|---|---|
| 1 | `YT-04` The Marquee | The alliance dialogue moves to `YT-01`. Lose the surviving-object set piece and the best NPC writing in Act 6 |
| 2 | `VF-04` The Hospital Hut | The inoculation decision moves to `VF-02`. Lose the game's most restrained scene and one `sensitive` asset |
| 3 | `BK-03` Four Chimneys | The council of war moves to `BK-01`. Lose Act 3's densest dialogue scene and its claustrophobia |
| 4 | `DL-03` The Ferry Camp | Paine and the bounty move to `DL-01`. Lose the establishing shot of the Durham boats |
| 5 | `CB-03` The Lines | The spyglass moves to `CB-01`. Lose the Grand Union flag beat entirely — **the best teaching object in Act 2** |
| 6 | `MV-04` The Dock | Act 1 ends at `MV-01`; Act 8 ends in the chamber. **Lose the game's only revisited composition and the finished-house reveal** |
| 7 | The 8 apex mood plates | Mood becomes LUT, fog, props and text only |

**Recommendation: do not take this cut.** Items 5 and 6 remove two of the six best pedagogical moments in the game to save 24 MB that no student ever waits for. **Raise the budget.** If exactly one plate must go for schedule rather than payload reasons, cut **`YT-04`** and nothing else.

---

# 14. THE PEDAGOGICAL MAP

Mapped to **APUSH Period 3 (1754–1800)** key concepts, the **NCSS C3 Framework** dimensions, and **CCSS Literacy in History/Social Studies (RH)**. State frameworks in the target districts derive from these three.

| Act | Standards content delivered | Framework anchors | **Beyond the standards** |
|---|---|---|---|
| **1** Mount Vernon | Colonial Virginia's plantation economy; the escalation from Lexington & Concord; the Second Continental Congress; slavery as the foundation of the founders' economy, not a footnote | KC 3.1.II · KC 3.2.III · D2.His.1, D2.His.4 · RH.1, RH.6 | **Washington's 1754 failure at Fort Necessity.** The Witness Register as a claim about how images argue. The architectural evidence of an absent owner |
| **2** Cambridge | The Continental Army's creation; Congress's requisition-not-tax problem; the Siege of Boston; the Grand Union flag and the "rights of Englishmen" argument | KC 3.1.III · KC 3.2.II · D2.Civ.4, D2.His.14 · RH.2, RH.8 | **The Dunmore Proclamation and Washington's reversal on Black enlistment, staged as a manpower decision.** Command as administration. A commander overruled by his own council of war |
| **3** Brooklyn | The New York campaign; British strategic advantages; the near-destruction of the army; why the Revolution nearly ended in 1776 | KC 3.1.III · D2.His.14, D2.His.16 · RH.1, RH.9 | **Intelligence was mostly wrong.** Nathan Hale as a professional failure, and the difference between a martyr and an operation. The wind as a cause |
| **4** Trenton | Trenton and the turn of the war; Paine's *American Crisis*; the role of Hessian auxiliaries; morale and enlistment as strategic factors | KC 3.1.III · D2.His.3, D2.His.15 · RH.2, RH.6 | **The commander pledging his personal credit because the government has none.** The Hessians were awake and warned. Dating an anecdote as a method |
| **5** Valley Forge | Valley Forge; von Steuben and professionalisation; **Saratoga and the French alliance**; supply, disease, and the limits of Congress | KC 3.1.III · KC 3.2.II · D2.His.14, D2.Eco.1 · RH.3, RH.9 | **The Conway Cabal and civil–military politics.** Mass inoculation as a command decision with a body count. Reading a letter that survives only in someone else's summary |
| **6** Yorktown | Yorktown; the French alliance made material; siege warfare; the war's end in America | KC 3.1.III · D2.His.14, D2.Geo.2 · RH.7, RH.9 | **Strategic deception as an instrument of policy.** **Article 10 and the re-enslavement of people who had reached the British lines.** An ally lending the United States the money to move its own army |
| **7** Newburgh | The Articles of Confederation's fiscal impotence; the debt owed to the army; the transition from war to republic | KC 3.2.II · D2.Civ.4, D2.Civ.13 · RH.5, RH.8 | **The Newburgh Conspiracy and civilian control of the military — the single best "beyond the standards" moment in the game.** Bounty lands: paying an army with territory that belongs to sovereign nations. Document analysis by typeface |
| **8** Annapolis | The resignation of the commission; the peacetime settlement; the precedent of civilian supremacy | KC 3.2.I, KC 3.2.II · D2.Civ.1, D2.His.17 · RH.6 | **Caesar, Cromwell, Napoleon — power surrendered rather than kept.** **The Book of Negroes and a parallel biography of freedom.** That he did not free anyone during the war |

**Two cross-cutting strands that are not attached to any single act and are the reason the game is better than a textbook:**

- **Historiography as content.** The eight Gilt Frames deliver, without a word of instruction, that the images in the student's own textbook were painted by people who were not there, decades later, for reasons of their own. By Act 4 the student is doing this analysis unprompted. This maps directly to **RH.6 (author's point of view), RH.8 (evaluate claims), RH.9 (compare sources)** and to **D2.His.9–13** more completely than any worksheet.
- **Artefact versus transcription.** Every document in the game is shown twice — as an object, unreadable, and as a clean typeset transcription. Students learn the distinction as an interface convention before they ever learn it as a concept.

**Assessment hooks for the teacher, free from the design:**
1. **The letterbook is eight writing samples**, authored by the game from the student's own decisions, in Washington's voice. It exports as text.
2. **The eight sealed decisions are the same for every student in the room** (R11), so the teacher can stop the class and discuss any of them knowing everyone reached it.
3. **The Documents ribbon is a checklist** of which of the 51 primary sources a student actually found and read.
4. **The epilogue's three passes are a comparison exercise**, not a score, and the "one thing he did that you did not" line is a discussion prompt written by the machine.

---

# 15. OPEN VERIFICATION QUEUE

Items this document asserts that must be run to a source before content lock. Owner in brackets.

| # | Item | Where to resolve |
|---|---|---|
| S-1 | **Frank Lee and Doll** at Mount Vernon in May 1775 — dates, roles, and whether both are documented as present [History] | Mount Vernon *Lives Bound Together* research; the 1799 slave census read backwards; Frank Lee's 1768 purchase record |
| S-2 | **Harry Washington's biography** — 1763 purchase, Dismal Swamp work, 1776 escape to Dunmore, Black Pioneers service, Book of Negroes entry, Nova Scotia, Sierra Leone 1792, the 1800 rising [History — **blocks the epilogue**] | Pybus, *Epic Journeys of Freedom*; Schama, *Rough Crossings*; the Book of Negroes (Nova Scotia Archives, digitised) |
| S-3 | The **HMS *Savage* seventeen** — names, and whether any were recovered at or after Yorktown [History] | Mount Vernon; Lund Washington's correspondence, April 1781 |
| S-4 | **GW to Bryan Fairfax, 24 August 1774** — exact wording of the "tame and abject slaves" passage [Narrative — it is quoted verbatim in the epilogue] | *Papers of George Washington*, Founders Online |
| S-5 | **John Honeyman** — the entire account rests on family tradition published in 1873. Confirm the game presents it dated and attributed, not as fact [Narrative] | Journal of the American Revolution's treatment of the Honeyman literature |
| S-6 | The **Knox-in-the-boat anecdote** — earliest attestation and date, since the game frames it as a story about a story [Narrative] | The Marblehead accounts; Drake's *Life of Knox* |
| S-7 | **Sarah Osborn Benjamin** was at Yorktown, documented via her 1837 pension deposition — but her presence at **Cambridge in 1775** is an invention of this document. Either find a documented laundress for Act 2 or move her first appearance to Act 5 [Narrative — **fix before writing Act 2**] | Revolutionary War pension files, W.4558 |
| S-8 | **Amos Doolittle's** service at Cambridge — he was in the New Haven militia company that marched in April 1775; confirm he was on the Boston lines [History] | Concord Free Public Library; New Haven militia rolls |
| S-9 | Whether the **Continental Army's own returns and commissary issues** differ by ~4,000 as claimed in `CB-02`'s contradiction; substitute the real figures [History] | *Papers of GW*, returns of 1775 |
| S-10 | **Molly Ridout's** account of the resignation, and **McHenry's** letter to Margaret Caldwell — get both texts before writing `AN-01` [Narrative] | Maryland State Archives; McHenry papers |
| S-11 | Inherited from `historical-visual-reference.md` §8: **V-1 Hessian facings at Trenton** still blocks Act 4 crowd generation |  |

---

*End of document. Scene IDs, decision IDs and document IDs in this file are canonical and are the keys used by the ink source, the asset ledger and the build manifest. Do not renumber.*
