> **PARTIALLY SUPERSEDED — `11-the-lit-diorama.md`, 19 August 2026.** §1 (the thesis) and
> §4 (line and wash) are dead and have been since 16 August. §3 (the mood system) is now
> light rather than nine shader uniforms — see `11 §2`. §5.7's canonical view is replaced
> by a following camera, `11 §3`. STILL IN FORCE: §2 the palette structure, §5.1-5.6
> composition, §6 the portrait system, §7 typography, §8 UI principles, §9 anti-references.

# Art Direction Bible
### *In Washington's Shoes* — the binding statement of the game's visual language
**Version 1.0 · 14 August 2026**
**Owner:** Art Lead. **Binding on:** every shipped image, every shader, every glyph, every pixel of chrome.

---

## 0. How to use this document

This is the **judgement layer**. Three documents sit under it and one sits beside it:

| Document | Authority over |
|---|---|
| `reference/historical-visual-reference.md` | What is *true*. Uniforms, buildings, dates, names, bans. **It outranks this document on every question of fact.** |
| `reference/ai-art-production-guide.md` | How an image gets *made*. Models, LoRAs, seeds, slicing, encoding, the ledger. |
| `reference/reference-game-analysis.md` | What the game *feels* like. Rules R1–R25 are binding and this document does not contradict them. |
| **This document** | What an image must *look like* to be accepted. |

Every asset is judged against §§1–6 at sign-off. An asset that is historically correct, technically clean, and fails §5 is rejected.

**The one-line law, from which everything below is derived:**

> **The line carries the structure. The wash carries the mood. The paper carries the truth. Saturation carries meaning. Nothing else carries anything.**

Four channels, four jobs, no overlap. Every rule in this document is that sentence, made specific enough to fail an asset against.

---

# 1. THE THESIS

> ### ⚠ SUPERSEDED — 15 August 2026
> **The medium described in this section is retired.** The project is made in alla prima
> oil, not pen and wash. See `09-painterly-direction.md`, which replaces the medium, §4 and
> both style anchors. Everything else in this document — §2 palette structure, §3 the mood
> controller, §5 composition and camera, §6 portraits except their medium clauses, §7 type,
> §8 UI, §9 anti-references as amended — remains in force. Read this section for its
> reasoning about registers and its historical argument, not for what to paint.

## 1.1 The visual argument, in one paragraph

*In Washington's Shoes* is drawn in the medium the war was actually drawn in: iron-gall ink laid down with a quill over faint graphite, tinted with transparent watercolour in three values, on warm laid rag paper left largely bare. This was not a style in the eighteenth century — it was a *competence*, taught to British and French officers at Woolwich and its equivalents so they could record ground they might have to fight over, and practised by the men who actually stood at Cambridge, on the Brooklyn line, and in the Yorktown trenches. Thomas Davies drew this war in it. Archibald Robertson drew it. Berthier mapped it. De Verger drew four American soldiers in it, from life, in 1781, and that single sheet is the reason we know what the Continental Army looked like at all. Choosing that medium is therefore not decoration and not nostalgia — it is an **epistemological claim**: *this is what could be seen and recorded by someone who was there.* The bare paper is the argument. A trained officer with a pen and a box of cakes has forty minutes and no reason to fill the sheet; he draws the fort, indicates the ground, tints the sky, and leaves the rest alone, because what he leaves alone is what he did not have time to look at, could not see, or did not think mattered. Our game's compositions are 35–55% untouched paper for exactly that reason. **The unpainted half of the frame is the part of the past we do not have.**

## 1.2 The historiographic move: the Gilt Frame

The game renders in period-accurate media. **Eight times — once per act — it does not.**

At the moment each act's events pass out of experience and into national myth, the game dissolves to a single, full-bleed, unwalkable **history-painting plate** in the register of Trumbull's Capitol Rotunda cycle, Leutze, and the Centennial print trade: opaque paint edge to edge, theatrical chiaroscuro, pyramidal composition, everyone looking at Washington, no bare paper anywhere, no ink line visible at all. It is held in a gilt frame. A caption in ENGROSSED type gives the real painting's title, artist, date, and the number of years between the event and the picture.

**The inversion is the whole point, and it is legible without a word of explanation:**

| | The honest register (R1) | The Gilt Frame (R6) |
|---|---|---|
| Structure carried by | a drawn line | painted mass |
| Paper visible | 35–55% of frame | **0–3%** |
| Ink line | the loudest element | **suppressed to zero** |
| Darkest value | `INK-FLOOR` `#241C14` | `#16110D` — **the only thing in the game allowed below the ink floor** |
| Motion | parallax dolly, ambient life | **dead flat. It does not breathe.** |
| Made by | someone who was there | someone who was not born yet |

A student who has spent four class periods inside a drawing where the paper shows through will feel the Gilt Frame arrive as a *pressure* — the frame fills up, the air goes out, the drawing disappears under paint. They will not have vocabulary for it. That is fine; the caption supplies the vocabulary, and the *feeling* precedes it, which is the correct order.

**Grammar rules for the Gilt Frame — all binding:**

1. **It always follows, never precedes.** You play the event, then you are shown how it will be remembered. Reversing this teaches the myth first and we would never get it back out.
2. **It is never interactive.** No walk-plane, no choices, no examine text. It is a picture on a wall.
3. **It always carries the caption**, and the caption always states the year gap. This is the payload.
4. **The student is never told the painting is wrong.** The caption states facts — title, painter, place, date. The gap does the work. (R-doc §6.5: *letting them draw the conclusion is the whole difference between teaching and telling.*)
5. **Exactly eight ship. There is no ninth.** Adding one is a Creative Director sign-off with a decision-log entry.
6. **Transition:** 1.4 s dissolve in (never a cut — a cut would read as the same world); hold minimum 6 s, skippable after 2 s; caption fades in at +0.8 s; exit is a 900 ms fade to `PAPER-BRIGHT`, which is the game's existing "time has passed" grammar (R7). Leaving a Gilt Frame therefore *feels like* leaving the past, which it is.

## 1.3 The eight Gilt Frame moments — locked

| Act | What the student just played | Gilt Frame plate | Caption names | The gap the caption exposes |
|---|---|---|---|---|
| **1** | Washington rides away from a house with a building site on its north end, 4 May 1775 | **The Cincinnatus** — a man in Roman dress leaning on a plough, sword laid aside, laurel offered | The Cincinnatus trope; Houdon's Virginia statue, commissioned 1785 | The plough is Roman; the statue is ten years later; the farm was worked by more than a hundred enslaved people |
| **2** | Washington choosing Knox's route on a map table in a confiscated Loyalist's parlour | **Washington Taking Command Under the Cambridge Elm** | Currier & Ives lithograph, 1876 | No contemporary source records the ceremony or the elm. He arrived on 2 July and started writing requisitions. |
| **3** | The Brooklyn ferry landing at night, boats loading in silence, fog as bare paper | **The Martyrdom of Nathan Hale** | MacMonnies bronze, 1890 | The famous last words reach us second-hand, through a British officer. Washington did not learn his name for weeks. |
| **4** | Durham boats, sleet, three hours late, an attack in daylight | **Washington Crossing the Delaware** | Emanuel Leutze, oil on canvas, **Düsseldorf, 1851** | Wrong boat, wrong flag, wrong hour, wrong ice, wrong continent. Painted 75 years later, in Germany, about 1848. |
| **5** | A regulated grid of huts, men without shoes, a drill field | **The Prayer at Valley Forge** | Weems, 1804 → Brueckner, 1866 → US postage, 1928 | There is no contemporary source for this event of any kind. The man who first wrote it down also invented the cherry tree. |
| **6** | Seven doors, one window, the spectacles | **Washington Addressing the Officers at Newburgh** | 19th-c. engraving tradition | The room was the New Building, miles from headquarters. And the address itself failed. It was the spectacles that worked. |
| **7** | The surrender road between the immaculate French line and the ragged American one | **The Surrender of Lord Cornwallis** | John Trumbull, 1820, US Capitol Rotunda | Cornwallis is not in the painting because he was not there. Trumbull put Washington at the centre; protocol had put him at the edge. |
| **8** | Twenty delegates in a half-empty chamber | **General George Washington Resigning His Commission** | John Trumbull, 1824, US Capitol Rotunda | Trumbull filled the room. Molly Ridout, who watched from the gallery, described a handful of people. |

Act 4's and Act 5's are the two that matter most: Leutze because it is the single most contaminating image in the model's prior and in the student's head, and the Valley Forge prayer because it depicts an event that **did not happen**, which is a lesson about evidence that no amount of correct painting can deliver.

## 1.4 Cost, and why this is affordable

Eight plates. One shader path (fill-to-edge grade + canvas-weave overlay swap + gilt frame border sprite + parallax disabled). No new LoRA — R6 is generated from `wash-v1` with the bare-paper suppressed at the blockout stage and the grade applied in post. This is the same move the Witness Register makes: **a register is a parameter set, not a second art style.** Any proposed register that cannot be expressed as a parameter set is rejected on sight.

## 1.5 The complete register table

Six registers. Every image in the game is in exactly one. The register is chosen by **what the image claims to know**.

| Reg | Name | Where | Line | Wash | Bare paper | Camera | Motion |
|---|---|---|---|---|---|---|---|
| **R1** | Topographical pen-and-wash | all exteriors, all interiors — the default | `INK-SETTLED`, full weight | 3 values, earth palette | **35–55%** ext / **25–40%** int | elevated ¾ ext, frontal int | full parallax + ambient |
| **R2** | Tinted survey map | map-table scenes (~6) | ruled, `INK-LIGHT`, hachure | flat tints, no modelling | **55–75%** | true 3D, top-down-ish, dollies | token motion only |
| **R3** | Painted portrait | all dialogue portraits (78) | `INK-SETTLED`, portrait-fine | modelled in 4 values on the face only | **20–35%** (the ground behind the head) | fixed, chest-up | none — stills |
| **R4** | Engraved print | UI, chapter cards, Council emblems, letterbook furniture | crosshatch only, `INK-SETTLED` | **none** | **60–80%** | n/a | none |
| **R5** | **Witness Register** | scenes with enslaved people | `INK-SETTLED`, full weight | **single grey wash**; colour only on personal possessions | 30–45% | **eye level**, closer framing | **none** |
| **R6** | **Gilt Frame** | 8 mythmaking plates | **suppressed to zero** | opaque, edge to edge | **0–3%** | flat, framed | **none** |

R5 is specified in full in `historical-visual-reference.md` §7.2 and is not restated here. Its five parameter changes (grey wash only, no atmosphere, eye-level camera, tighter framing, no ambient motion) are binding and **the sign-off gate in that document's §7.6 applies to every R5 asset without exception.**

---

# 2. THE PALETTE

Every colour in the game is in one of five groups. The group determines what the colour is *allowed to do*. This is the enforcement mechanism for "saturation reserved for meaning," and it is why the palette is a system rather than a swatch page.

| Group | Count | May be used as | May **never** be used as |
|---|---|---|---|
| **A — Grounds** | 5 | the untouched paper; the fill behind all UI | a wash; a fill inside a drawn form |
| **B — Inks** | 5 | line, hatching, strike-rules, body type | a fill of any area larger than 4 px wide |
| **C — Earth wash** | 7 | every wash in the world | anything a viewer is meant to *identify* |
| **D — Meaning** | 8 | only the specific thing the colour means | atmosphere, shadow, incidental objects |
| **E — Council inks** | 5 | the five voice **names** only | the voice's spoken line; anything in the world |

All contrast figures below are computed WCAG 2.x ratios; all separations are CIE ΔE76. Numbers were derived, not estimated.

## 2.1 Group A — Grounds

The paper. This is the game's base colour and the largest single area on screen at all times.

| Name | Hex | L\* | Where |
|---|---|---|---|
| `PAPER-WARM` | **`#EFE7D5`** | 92 | **The default ground of the whole game.** Acts 1, 2, 3, 7. The dialogue panel, always, in every act. |
| `PAPER-COOL` | **`#E5E3DB`** | 90 | Winter and night grounds — Acts 4 and 5. Same value, colder hue. |
| `PAPER-BRIGHT` | **`#F6F2E6`** | 96 | Act 8 (Annapolis) only, and the 900 ms act-break fade. |
| `PAPER-SMOKED` | **`#DCD2BC`** | 84 | Interiors that have lived near a fire — Acts 4 and 6 interiors. Documents that have been carried. |
| `PAPER-SHADOW` | **`#C6BCA6`** | 77 | The darkest the *untouched ground* is permitted to go before it counts as a wash. Deep interior corners, the underside of the letterbook's gutter. |

**Rules.**
- **The ground changes hue between acts. It never changes value by more than 6 L\*.** `PAPER-BRIGHT` at 96 and `PAPER-SMOKED` at 84 are the extremes; a wider spread makes the game's exposure appear to jump on every act break and destroys the sense of one continuous sheet.
- **The dialogue panel is `PAPER-WARM` in every act, without exception**, including Act 8. Text ground never varies with mood, act, or weather. This is an accessibility guarantee, not an aesthetic preference: the reader's contrast is never at the mercy of the drama.
- Grounds are never used as a wash. If you find yourself filling a form with `PAPER-WARM`, you want bare paper — leave it alone.

## 2.2 Group B — Inks

The line, and all body type. **Nothing in this game is `#000000`.** Surviving eighteenth-century documents are brown-black on cream. A pure-black line is the single fastest way to make the whole project read as a modern digital illustration wearing a costume.

| Name | Hex | Where | vs `PAPER-WARM` |
|---|---|---|---|
| `INK-FLOOR` | **`#241C14`** | The absolute darkest value permitted anywhere in R1–R5. A hard clamp in the grade shader. | 13.64 : 1 |
| `INK-FRESH` | **`#2B2B36`** | Iron gall on the day it was written — blue-black. Washington's hand in the letterbook in Acts 1–3; the darkest accent in an R1 plate. | 11.36 : 1 |
| `INK-SETTLED` | **`#3B2E22`** | **The primary line colour of the game**, and the colour of all body type. Layers L2–L4. | 10.66 : 1 |
| `INK-FADED` | **`#6B4F35`** | Oxidised iron gall — rusty brown. Documents from earlier acts seen in later acts; Washington's hand in the letterbook by Acts 7–8. | 6.10 : 1 |
| `INK-LIGHT` | **`#6E6152`** | Aerial perspective: layers L0–L1. Hatching. The strike-rule on locked options. The surveyor's overlay. | 4.88 : 1 |

**The ageing mechanic.** Iron gall goes on nearly colourless, oxidises to blue-black, and degrades to brown over decades. We compress that into eight acts and it costs nothing: **the letterbook's early pages are re-rendered progressively browner as the war proceeds.** Act 1's letter is `INK-FRESH` when written and `INK-FADED` when the student re-reads it in Act 8. The paper does not age — the ink does. That distinction is real, it is defensible, and it turns the letterbook into a physical record of elapsed time without a single date stamp.

**Aerial perspective is carried by ink value, not by fog alone.** Far layers get a lighter *pen*, exactly as a topographical draughtsman would have drawn them. Fog is a secondary effect over the top. If you have used fog to push a layer back and the line is still at full weight, the plate is wrong.

## 2.3 Group C — Earth wash

The ordinary world. Seven colours. Everything that is not a meaning-colour is washed from these, mixed, in three values.

| Name | Hex | L\* | Notes |
|---|---|---|---|
| `BISTRE` | **`#7A5C3E`** | 41 | The workhorse. Soot-brown. Mud, timber, leather, shadow in warm scenes. |
| `RAW-UMBER` | **`#6E5B45`** | 40 | Bistre's cooler partner. Earthworks, tent shadow, worn cloth. |
| `YELLOW-OCHRE` | **`#9E7B3D`** | 54 | Straw, new-cut pine, lamplight fall, autumn ground. Deliberately deeper than `BUFF` (ΔE 25.1) so Washington's facings never get lost in a field of ochre. |
| `TERRE-VERTE` | **`#7C8570`** | 54 | The **only** green in the game. Foliage, spring at Mount Vernon and Valley Forge. Grey-green, never a leaf green. |
| `SHADOW-SLATE` | **`#55627A`** | 41 | Cold shadow, distant hills, water. ΔE 18.8 from `CONTINENTAL-BLUE` — a blue coat still reads as a blue coat when it stands in blue shadow, which is the whole reason this value is where it is. |
| `WET-STONE` | **`#5C6673`** | 43 | Wet board, stone, sleet-light, the Brooklyn fog break. The winter grey of the palette spine. |
| `MADDER-LAKE` | **`#8F4A44`** | 40 | Brick, roof tile, rust, dried blood referenced but not depicted. The *only* warm red permitted outside Group D, and it is dull enough (ΔE 44.5 from `BRITISH-SCARLET`) never to be mistaken for a coat. |

`BISTRE` and `RAW-UMBER` sit only ΔE 6.9 apart. That is intentional: they are mixing partners, not semantic distinctions. Every other pair in this group separates by ≥ 15.

**The chroma cap.** No Group C colour may be laid at more than **62% of its stated chroma** in any single wash pass. Three passes of a 62% wash is how you get depth; one pass of a 100% wash is how you get a poster. This is enforced at generation by the style block's "transparent watercolour wash laid in three values only" and checked at review by eye against the palette plate.

## 2.4 Group D — Meaning

**These eight colours are semantic. If something on screen is saturated, it means something.** They are exempt from every mood transform in §3, they are exempt from the per-act LUT, and they appear only on the object they denote.

| Name | Hex | Means, and only means |
|---|---|---|
| `CONTINENTAL-BLUE` | **`#243B5E`** | Continental regimental coats. Washington's coat. |
| `BUFF` | **`#C9B489`** | Washington's own facings, waistcoat and breeches; NY/NJ facings; buff leather belts. **Washington's personal colour.** |
| `BRITISH-MADDER` | **`#9E3B32`** | British private soldiers' coats. Dull, warm, brick. |
| `BRITISH-SCARLET` | **`#C0392B`** | British **officers'** coats and Continental artillery facings. Cochineal-bright. The distinction between these two is a real class distinction and it is drawn in pigment. |
| `PRUSSIAN-BLUE` | **`#1F3048`** | Hessian coats. |
| `FRENCH-WHITE` | **`#E8E2D4`** | French infantry coats. |
| `SEAL-RED` | **`#8C2F2A`** | **Sealing wax, and nothing else in the entire game.** The sealed-decision glyph; the "this document unlocked something" dot in the letterbook; the copy-confirmation stamp on the passport screen. One colour, one meaning, game-wide. |
| `FLAME` | **`#D98C3C`** | Torch, hearth, lantern, muzzle flash. The only warm light source in the game. Acts 4 and 6 principally. |

**The separation guarantee, and its honest limits.** The palette guarantees ΔE ≥ 20 only for pairs that can *co-occur in one frame*:

| Co-occurring pair | ΔE | |
|---|---|---|
| `CONTINENTAL-BLUE` / `BRITISH-MADDER` | 64.7 | ✓ |
| `CONTINENTAL-BLUE` / `FRENCH-WHITE` | 72.4 | ✓ |
| `CONTINENTAL-BLUE` / `BUFF` | 69.1 | ✓ |
| `BRITISH-SCARLET` / `FRENCH-WHITE` | 76.8 | ✓ |
| `BUFF` / `FRENCH-WHITE` | 23.4 | ✓ (tightest guaranteed pair; both appear in Act 7) |
| `FLAME` / `BRITISH-MADDER` | 40.9 | ✓ |

Three pairs do **not** separate by chroma, and we are not fixing them, because fixing them would require falsifying the history:

- `CONTINENTAL-BLUE` / `PRUSSIAN-BLUE` — **ΔE 8.5.** Hessian blue genuinely was a darker, colder version of the same indigo family. These two co-occur in exactly one place, Trenton in Act 4, which is the darkest and most nearly monochrome act in the game, where colour is doing almost no work anyway. **The Hessians are read by the mitre cap, not by the coat.** Silhouette separates them; the palette does not have to.
- `BRITISH-MADDER` / `SEAL-RED` — **ΔE 6.1.** They never co-occur: `SEAL-RED` appears only as UI chrome on the dialogue panel and in the letterbook, never in a diorama.
- `BRITISH-MADDER` / `BRITISH-SCARLET` — **ΔE 18.2.** Deliberately close. They are two grades of the same dye, and the point is that you notice officers are *brighter*, not that they are a different colour.

**The two-colour rule.** No more than **two** Group D colours may occupy more than 5% of frame area in any single scene. Exactly one scene in the game is permitted three: **`YT-03 "The Surrender Road"`** — French white on one side, Continental blue on the other, British scarlet receding between them. The palette peaks, once, at the moment the alliance becomes visible, and it never does it again. That is the strongest single colour decision in the project and it costs nothing because the history staged it for us.

## 2.5 Group E — Council inks

The five interior voices. Constraints, all satisfied: every one is legible as body-weight text on `PAPER-WARM` (≥ 4.5 : 1); the luminance ladder runs **ochre lightest → indigo darkest** in even steps so the five separate in greyscale and for a red-green-deficient reader; and no pair is closer than ΔE 27.5.

| Voice | Emblem | Hex | L\* | ΔL\* to next | Contrast on `PAPER-WARM` |
|---|---|---|---|---|---|
| **VANITY** | a hand mirror | **`#875E0F`** | 43.1 | 6.6 | 4.69 : 1 |
| **AMBITION** | a spur | **`#9E2E12`** | 36.5 | 7.6 | 5.98 : 1 |
| **TEMPER** | a struck flint | **`#762C29`** | 28.9 | 6.9 | 7.89 : 1 |
| **RESTRAINT** | a bridle bit | **`#223746`** | 22.0 | 7.0 | 10.02 : 1 |
| **DUTY** | a folded commission | **`#1B1E5A`** | 15.0 | — | 12.36 : 1 |

**The binding rule that makes this work: the voice ink colours the voice's NAME. It never colours the voice's line.** The name is four to nine characters of small caps; the interjection beneath it is always `INK-SETTLED` at 10.66 : 1. So the coloured text is a label, the readable text is always maximum-contrast near-black, and colour is the third channel behind position and the emblem glyph — exactly as the reference analysis requires.

`VANITY` at 4.69 : 1 is the tightest value in the entire project. **It may not be lightened.** It is also the reason the dialogue panel ground is pinned to `PAPER-WARM` — on `PAPER-SMOKED` it would fall to 3.84 : 1 and fail.

## 2.6 Mood-shifted variants

The mood system (§3) does not swap the palette. It transforms Group C only. For eyeballing and for the palette plate, here is what the controller does to the earth wash at each end. **Groups A, B, D and E are untouched at every value of W.**

| Earth colour | `W = 1.0` (held, warm) | `W = 0.5` | `W = 0.0` (drained, sodden) |
|---|---|---|---|
| `BISTRE` | `#7C5F40` | `#6A5848` | `#55504C` |
| `RAW-UMBER` | `#715E46` | `#62574B` | `#514E4C` |
| `YELLOW-OCHRE` | `#9F7C52` | `#8B7461` | `#6E6A66` |
| `TERRE-VERTE` | `#82876F` | `#767C70` | `#676B6A` |
| `SHADOW-SLATE` | `#57647C` | `#525A6B` | `#4B4E56` |
| `WET-STONE` | `#626870` | `#596068` | `#50545A` |
| `MADDER-LAKE` | `#8E4E45` | `#744B49` | `#564849` |

Read the right-hand column top to bottom: seven distinct earth colours converging on a single blue-grey mud. **That convergence is the feeling.** At `W = 0.0` the world has one colour and it is the colour of a wet camp, and the only things that still have colour are the coats, the wax and the fire — because those are the only things that still *mean* anything.

Proof the exemption matters: if `CONTINENTAL-BLUE` were not exempt it would land on `#31363E` at `W = 0.0` — ΔE 18.3 from itself, and functionally indistinguishable from `SHADOW-SLATE`. The army would literally disappear into the weather at low morale. Tempting, poetic, and wrong: the coats are the one thing the student is meant to be able to find.

---

# 3. THE MOOD SYSTEM

## 3.1 The principle

**Stats drive the wash. They never touch the line.**

Structure never wavers, because Washington's competence never wavers — he loses, he is starved, he is nearly overthrown by his own officers, and he never once stops being the man who can read ground and write an order. What changes is the weather, the colour, and whether anyone has the strength to lay a clean edge.

The physical metaphor is a real watercolour distinction and it is the entire system:

> **High morale is wet-on-dry. Low morale is wet-into-wet.**

A wash laid on dry paper stops where you stop it, pools with a hard tideline, and keeps its colour. A wash laid into damp paper spreads past the line, greys out, blooms, and dries blotchy. One is a man with time and a steady hand. The other is a man drawing in a tent in the rain. Every parameter below is a consequence of that one sentence.

## 3.2 Deriving the controller value `W`

The whole system is driven by **one scalar, `W ∈ [0,1]`**, computed at scene load.

**Step 1 — the character term.** Each stat normalised to 0–1.

```
M = 0.45·Morale + 0.25·Character + 0.20·Legitimacy + 0.10·Judgment
```

Morale dominates because the wash is the army's felt condition. Personal Character is second because the paper is also Washington's interior. Judgment barely registers, deliberately: **a well-judged retreat still looks like a retreat.** A player cannot out-think the weather.

**Step 2 — the progress term.** `P ∈ [0,1]`, advancing monotonically with scene index inside an act. It cannot decrease. `P` is **time**; `M` is **character**.

**Step 3 — blend and clamp.**

```
W = clamp( (1 − kAct)·M + kAct·P , actFloor, actCeil )
```

| Act | `actFloor` | `actCeil` | `kAct` | `P` driven by |
|---|---|---|---|---|
| 1 Mount Vernon | 0.55 | 0.85 | 0.00 | — |
| 2 Cambridge | 0.30 | 0.62 | 0.35 | the guns arriving from Ticonderoga |
| 3 Long Island | 0.12 | 0.40 | 0.00 | — |
| 4 Delaware / Trenton | 0.05 | 0.55 | 0.20 | crossing → Trenton (jumps late and hard) |
| 5 **Valley Forge** | 0.03 | 0.58 | **0.60** | December → June, five scene steps |
| 6 Newburgh | 0.25 | 0.70 | 0.00 | — |
| 7 Yorktown | 0.45 | 0.90 | 0.15 | first parallel → second → redoubts |
| 8 Annapolis | **0.80** | **0.80** | 0.00 | — (fixed) |

Three things this table does that a prose rule could not:

- **`actFloor` enforces R20 at the shader level.** Act 3 cannot exceed 0.40 no matter how well the player has played. Long Island is lost. The renderer will not let the game look otherwise.
- **`actCeil` prevents triumphalism.** Act 5 cannot exceed 0.58. Valley Forge never looks like a good time.
- **Act 8 is clamped to a single value.** The resignation looks identical for every student in the room, because the act itself is the only thing that matters and the game has nothing left to grade. This is the only place in the project where mood is switched off, and switching it off is the statement.

**Valley Forge's intra-act improvement is `kAct = 0.60`.** Sixty per cent of what the paper shows at Valley Forge is *how far into the winter we are*; forty per cent is *what kind of leader you have been*. So the thaw happens for everyone — the huts get built, the drill field fills, the wash returns as ochre and then as green — and a high-stat Washington simply gets a warmer spring than a low-stat one. Same shader, same plate, two inputs. **The men die either way; that is `P`. Whether it feels survivable is `M`.**

Act 2 uses the same mechanism at `kAct = 0.35` for the army becoming an army. No other act uses `P` above 0.20.

**Band derivation** (for the systems that need discrete values — portraits, population counts, prop toggles, text variants):

```
band = LOW  if W < 0.34
       MID  if 0.34 ≤ W < 0.67
       HIGH if W ≥ 0.67
```

Hysteresis: a band change requires crossing its threshold by **0.04** and is committed **only at scene load**. Bands never change mid-scene. Nothing in this game shimmers.

## 3.3 Separating line from wash: the ink mask

The mood system is only honest if the line is genuinely untouched. On a flat painted plate, line and wash are the same pixels. This is the crux of the whole system and it is solved at bake time, not at runtime.

**Every diorama layer ships with a single-channel ink mask** — `1.0` where the ink line is, `0.0` on open wash and bare paper. Produced during the depth-slicing step (AI guide §2.6 step 10) by a luminance-threshold + chroma-threshold pass in Krita, then hand-corrected. Budget **8 minutes per layer**, on top of the existing 20–40 min/scene paint-in.

Where the mask lives:

- **L0, L1, L2** are full-frame opaque plates. Their ink mask is **packed into the texture's alpha channel — free.** UASTC is a fixed 8 bpp block format that carries alpha whether you use it or not, so this costs literally zero additional bytes or VRAM.
- **L3, L4** need real cutout alpha for foreground occluders, so alpha is spoken for. These are the *near* layers, drawn at the heaviest ink weight and highest contrast, so their mask is **derived in-shader**:

```glsl
float luma   = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
float chroma = max(max(c.r,c.g),c.b) - min(min(c.r,c.g),c.b);
float ink    = smoothstep(0.42, 0.22, luma) * (1.0 - clamp(chroma * 3.0, 0.0, 1.0));
```

Then, in every case:

```glsl
vec3 outColor = mix(gradedWash, inkColor, ink);
```

`inkColor` is sampled from the untouched source texture. **The line is never multiplied, never desaturated, never lifted, never fogged beyond its authored aerial value.** "Structure never wavers" is not a metaphor in this build; it is a `mix()`.

## 3.4 The nine controller uniforms

All values `lerp(LOW, HIGH, W)` unless noted.

**Per-layer (applied to the wash channel only, after the per-act LUT):**

| # | Uniform | `W=0.0` | `W=1.0` | What it does | What the player sees |
|---|---|---|---|---|---|
| 1 | `uWashChroma` | **0.34** | **1.00** | saturation multiplier | the colour drains out of the world |
| 2 | `uWashTemp` | **−0.22** | **+0.10** | hue shift toward `SHADOW-SLATE` / `YELLOW-OCHRE` | the day goes cold |
| 3 | `uWashLift` | **+0.10** | **0.00** | black lift on the wash | greys flatten; nothing is deep any more |
| 4 | `uWashGamma` | **1.28** | **0.96** | mid-tone gamma | the wash thins toward the paper in patches |

**Screen-space, after compositing (per R10 — these are single full-screen overlays at fixed device-pixel density, never baked):**

| # | Uniform | `W=0.0` | `W=1.0` | What it does |
|---|---|---|---|---|
| 5 | `uEdgeBleed` | **2.6 px** | **0.0 px** | dilates the wash past the ink boundary using the composited ink mask — **this is wet-into-wet, and it is the single most legible parameter in the set** |
| 6 | `uGranulation` | **0.75** | **0.22** | modulates the wash by the paper-tooth texture; pigment settles and blooms |
| 7 | `uFogDensity` | act value **× 1.55** | act value **× 0.80** | the per-act fog gets heavier as morale falls |
| 8 | `uVignette` | **0.42** | **0.16** | the sheet darkens at the edges |
| 9 | `uGrainOpacity` | **0.38** | **0.22** | the paper asserts itself; the image is losing its argument with the sheet |

**Exact composite order.** Deviating from this order produces subtly wrong results that are very hard to diagnose, so it is specified rather than left to the implementer:

```
per layer:   sample texture
           → split ink / wash via mask (§3.3)
           → per-act LUT        [wash only, fixed, never mood-driven]
           → uniforms 1–4       [wash only]
           → mix(wash, ink, mask)
           → aerial ink tint    [L0/L1 only, fixed]
composite:   layers back-to-front with per-layer parallax
           → uniform 7 (fog)
           → uniform 5 (edge bleed)      — needs the composited ink mask
           → uniform 6 (granulation)
           → uniform 8 (vignette)
           → uniform 9 (paper grain + chain lines, screen space, device px)
           → clamp darkest to INK-FLOOR  [R1–R5 only; R6 clamps to #16110D]
```

The per-act LUT is **fixed and never mood-driven**. It establishes the act's identity (Yorktown is dusty and hot; Newburgh is a cold interior). The mood controller then modulates within that identity. Binding these two together was the tempting shortcut and it is wrong: it would make a low-morale Yorktown look like Valley Forge, and the acts would stop being places.

## 3.5 Rate of change

- `W` is sampled at scene load and eased in over **1.2 s** (cubic ease-out), so returning from the letterbook never pops.
- Within a scene, `W` is **constant**, with exactly one exception: **one authored beat per act** may step `W` by up to **0.25** over 3 s at that act's emotional apex. This is the same rarity discipline as R8's one scripted camera move, and it is intended to be spent in the same moment.
- `W` is never displayed. There is no debug overlay in a shipping build. (Dev builds get one; it is stripped by the production define.)

## 3.6 The non-shader mood outputs

Specified in the reference analysis (R12, R13) and restated here only as the art-side contract:

| Channel | Bound to | Art cost |
|---|---|---|
| Population count | `2 + (band × 2)` figures, low band biased to seated/hunched poses | one 6-figure crowd sheet per exterior |
| Prop toggles | six props per scene from the act atlas | zero — atlas already exists |
| Portrait band | `band` selects among the 3 Washington portraits for the current war stage | zero at runtime |
| Text variants | `band` | zero |
| Second painted plate | **eight named apex scenes only, one per act** | 8 × 5 layers = 40 images, inside the ~200 envelope |

---

# 4. LINE AND WASH RULES

> ### ⚠ SUPERSEDED — 15 August 2026
> **The medium described in this section is retired.** The project is made in alla prima
> oil, not pen and wash. See `09-painterly-direction.md`, which replaces the medium, §4 and
> both style anchors. Everything else in this document — §2 palette structure, §3 the mood
> controller, §5 composition and camera, §6 portraits except their medium clauses, §7 type,
> §8 UI, §9 anti-references as amended — remains in force. Read this section for its
> reasoning about registers and its historical argument, not for what to paint.

## 4.1 Line weight

Measured at **ship resolution 2048 × 1152**. Scale proportionally for other outputs; never scale the line non-uniformly.

| Element | Weight | Colour |
|---|---|---|
| Primary contour (a building's edge, a figure's outline, the parapet) | **2.5–3.5 px** | `INK-SETTLED` |
| Secondary / interior line (window mullions, plank joints, folds) | **1.5–2.0 px** | `INK-SETTLED` |
| Layer L1 (far) | **1.0–1.5 px** | `INK-LIGHT` |
| Layer L0 (backdrop) | **0.8–1.0 px, or absent** | `INK-LIGHT` |
| Hatching | **1.0 px, spacing ≥ 3 px** | `INK-SETTLED` or `INK-LIGHT` |
| R4 engraved crosshatch (UI) | **1.0 px, spacing 2–4 px** | `INK-SETTLED` |
| R3 portrait line | **1.5–2.5 px** contour, **1.0 px** interior | `INK-SETTLED` |
| R6 Gilt Frame | **none** | — |

**Absolute prohibitions on the line, inherited from Obra Dinn's outline discipline (R-doc §4.1) and non-negotiable:** the ink line is never blurred, never non-uniformly scaled, never faded below full opacity, never given bloom or glow, never anti-aliased away at small sizes, and never rendered in a Group C, D or E colour. **Every DOM-layer UI element must also carry an ink line, or it will visibly not belong to the game.**

## 4.2 Line-to-wash ratio — the bare-paper gate

This is the most enforceable rule in the document and the one that most reliably catches a bad generation.

| Register | Bare paper, % of frame |
|---|---|
| R1 exterior | **35–55%** |
| R1 interior / near-frontal | **25–40%** |
| R2 map table | **55–75%** |
| R3 portrait | **20–35%** |
| R4 engraved | **60–80%** |
| R5 Witness | **30–45%** |
| R6 Gilt Frame | **0–3%** |

**Enforcement:** `scripts/bare-paper.mjs` counts pixels within ΔE 6 of the scene's declared ground tone and fails the asset outside its register's band. It runs in CI on `art/dist/`, and it runs at step 7 of the production workflow — *before* an hour is spent on depth slicing.

Under the floor, the plate reads as illustration and is rejected. Over the ceiling, it reads as unfinished and is rejected.

**The bare paper must be concentrated, not speckled.** Every R1 exterior must contain **one contiguous bare region of ≥ 12% of frame area** — sky, water, snow, fog, or a whitewashed wall. A plate whose bare paper is scattered as noise between painted objects fails even if the total is in band. Concentrated negative space is composition; scattered negative space is an unfinished job.

## 4.3 Edge quality

Three edge types, and only three:

| Edge | How it is made | Where it belongs |
|---|---|---|
| **Hard** | wash laid wet-on-dry, stopping with a visible tideline | the focal object; anything the student must identify |
| **Soft** | wash laid into damp paper; 8–20 px transition | ground planes, sky-to-hill, smoke, mid-distance |
| **Lost** | wash and paper meet with no boundary; the form is completed by the viewer | the frame edges; the far end of a receding street; the top of a figure crowd |

**Every plate contains all three, and at least one major form has a lost edge** — usually where the composition meets the frame. This is what separates a wash drawing from a line drawing that has been coloured in, and it is the most common failure in AI output, which loves to close every contour.

**The line never crosses a lost edge.** If the line goes there, the edge is not lost — it is a hard edge you forgot to paint up to. This is a two-second check at review and it catches the failure every time.

## 4.4 Paper texture — the decision

**Global screen-space overlay. Single. Locked. Never baked per asset.**

This is R10 and it is the load-bearing technical rule of the entire art direction. Baking grain into the L0–L4 textures gives you five grain scales at five parallax depths moving at five speeds; the illusion that the scene is one sheet of paper dies on the first camera dolly, which is within two seconds of the first scene loading.

**Specification:**

| Element | Value |
|---|---|
| Texture | `gl_xx_tx_paper-laid-warm_v02` — 512 × 512, seamless, greyscale, tinted in-shader by the act's ground tone |
| Density | **1:1 device pixels.** The overlay does not scale with the canvas, the DPR, or the letterbox. On a 1366 × 768 Chromebook it is the same physical size as on a 1920 × 1080 panel. |
| Blend | `overlay`, opacity from `uGrainOpacity` (0.22–0.38) |
| Chain lines | a **second** overlay: 1 px vertical `INK-LIGHT` lines at **96 px** spacing, 5% opacity, also screen-space and locked. Real laid paper's chain lines are about an inch apart. |
| Vignette | screen-space, `uVignette`, radial, `PAPER-SHADOW`-tinted multiply — never black |

The chain lines are the single detail that makes viewers say "that's paper" without being able to say why. They cost 4 KB and one draw call.

## 4.5 Deckles, foxing, stains, scrape-outs — decided, not offered

**Deckled edges: NO in the world, YES in the letterbook.** The screen is a window onto a sheet larger than the screen; there is no visible paper edge during play, because a deckle would frame the game as a picture *of* a picture and would fight the parallax dolly (the edge would move against the grain overlay, which is fixed). **Exception:** in the letterbook and the document viewer the paper *is* an object with edges, and there it gets a real deckle — on **two of four edges only**, because period sheets were guillotined on two and left deckled on two.

**Foxing: BANNED.** It is already in the style block's negative list and it stays there. Foxing is a conservation defect of a later century. **The game is not set in an archive. The paper is fresh, the ink is wet, the war is happening now.** A foxed world is a nostalgia world and it is exactly the register the Gilt Frame exists to quarantine.

**Ink ages; paper does not.** This is the precise distinction that lets us have the passage of time without antiquing the world. See §2.2.

**Water stains: TWICE, diegetically, never decoratively.** Exactly two objects in the game are water-stained, and in both cases the fiction says why: the **anonymous Newburgh Address** (found in a wet camp) and one **intelligence report in Act 3** (carried across the East River). Both stains are baked into that document's paper asset. A third proposal is rejected.

**Scraped-out white: TWICE, and it is a real period technique.** Scratching the surface of the paper with a knife to recover a highlight is what an eighteenth-century draughtsman actually did, and it is how Act 4's sleet is rendered — **fine scratched white lines through the wash**, never painted dots. Also used for the fog break in Act 3's `BK-02`. Baked into the plate as an authored layer element, never a shader.

---

# 5. COMPOSITION RULES

## 5.1 The frame and the grid

Logical grid **1600 × 900**. Ship **2048 × 1152** with **12.5% overscan** on every layer, which exists solely to feed the parallax dolly and nothing else.

Every exterior blockout is drawn on this grid, and the grid is printed on the blockout template:

```
y = 0.00 ─────────────────────────────  top of frame
y = 0.34 ═════════════════════════════  HORIZON  (all exteriors, no exceptions)
y = 0.56 ─────────────────────────────  walk-plane FAR edge   · Washington = 130 px
                  [ WALK-PLANE BAND ]
y = 0.78 ─────────────────────────────  walk-plane NEAR edge  · Washington = 220 px
              [ L4 FOREGROUND OCCLUDERS ]
y = 1.00 ─────────────────────────────  bottom of frame
```

- **The walk-plane band is the lower-middle 22% of the frame.** Above it is world; below it is foreground.
- **The horizon is at y = 0.34 in every exterior in the game.** A shared horizon is what makes forty hard cuts feel like one continuous place rather than forty photographs. This is worth more than any single plate.
- **Washington is 220 px tall at the near edge and 130 px at the far edge.** This implies the camera, and it is checkable: composite a flat grey Washington silhouette at three depths onto the candidate plate before accepting it (AI guide §5.6). A plate at 220/190 has too flat a camera and will feel wrong to walk in — reject and re-blockout, do not re-prompt.
- **L4 foreground occluders cover 15–25% of frame height** at the bottom, drawn at the heaviest ink weight and the *lowest* chroma. They are near, so they are dark and colourless. This band is what makes a diorama read as a diorama instead of as wallpaper, and it is the first thing to check when a plate feels flat.

## 5.2 The depth layers

| Layer | Content | Parallax coefficient | Ink | Ink mask |
|---|---|---|---|---|
| **L0** | sky, backdrop, distant water | 0.02 | absent or 0.8–1.0 px `INK-LIGHT` | packed in alpha |
| **L1** | far — hills, opposite bank, distant town | 0.10 | 1.0–1.5 px `INK-LIGHT` | packed in alpha |
| **L2** | **mid — the walk-plane's own layer.** Character billboards sit in this plane. | 0.28 | full weight `INK-SETTLED` | packed in alpha |
| **L3** | near — objects between the walk-plane and the camera | 0.55 | full weight, heavier | derived in-shader |
| **L4** | foreground occluders — a tent flap, a gun carriage, a branch, a doorframe | 0.90 | heaviest, lowest chroma | derived in-shader |

Coefficients multiply the maximum dolly of **4% of frame width** (R8). So L4 moves 3.6% and L0 moves 0.08%; the dolly is critically damped with a ~250 ms time constant and is driven off Washington's walk-plane position, never 1:1.

**Hard rule: no layer boundary may cross a character's walk path.** If the walk-plane passes behind a tent that lives on L3, and then in front of it, the character will pop between planes. Move the tent to L4 and cut a hole in the walk-plane, or move the walk-plane. This is caught at blockout, which is exactly why the blockout step is non-negotiable.

## 5.3 The two staging grammars

Only two. A composition that is neither is rejected.

**PROSCENIUM** — interiors, formal scenes, all of Act 8, `NB-01 "Seven Doors"`, `NW-01`, `AN-01`.
Near-frontal theatrical elevation. The back wall is parallel to the picture plane. The walk-plane is a shallow strip in front of it. L4 wings frame the shot left and right — a doorframe, a curtain, the edge of a table. **Push the perspective flatter than feels comfortable.** A *flat* interior reads as period draughtsmanship; a *nearly-correct* interior reads as a model that couldn't quite do perspective. The style must look chosen. Symmetry is permitted here and in Act 8 it is **mandatory** — the Annapolis chamber is symmetrical because power is being balanced, and that is the argument of the shot.

**SLIP-STAGE** — all exteriors.
Shallow elevated three-quarter, camera ~4–5 m above the walk-plane, looking down about 20°. A single receding element runs from lower-left to upper-right (or mirrored): a street of huts, a trench, an earthwork parapet, a river bank, a line of tents. Depth comes from that one recession plus aerial ink, never from a two-point perspective grid. **Never build a vanishing-point construction.** Topographical draughtsmen did not, models are bad at it, and it fights the flatness that holds the style together.

## 5.4 The eye path

Every plate has **exactly one focal object**, and it is placed on a third — never at centre, except in Act 8 where centre is the argument.

**The focal object is the only place in the frame where the darkest ink value and a Group D meaning colour coincide.** That is the entire attention system. It requires no rim light, no vignette trick, no depth-of-field, no glow — all four of which are banned anyway — and it costs nothing because it is a placement decision made at blockout.

Corollary for crowds: **Washington's head is above the crowd line, always.** He was 6′2″ in a period when that was half a head above almost everyone. The player finds their own character by silhouette, in one glance, with no marker, no arrow, and no outline shader. This is the single most valuable free staging tool the history handed us and it must never be given away by putting him on lower ground.

## 5.5 Figures, exits, and density

- **Maximum 9 background figures on screen** in any diorama: the 6-figure population set plus up to 3 scripted. Beyond that the plate reads as a crowd painting and R22's proper-naming discipline stops functioning — nobody names twenty people.
- **Character readability is silhouette plus costume value, never facial detail.** Render every cutout as pure black at ship scale and show it to someone who has read the script. If they cannot name the character, change the hat, the coat's skirt, the posture, or the prop. Ten-minute test; it is what stops the cast becoming interchangeable men in tricornes.
- **Never write a beat that requires reading a face on the walk-plane.** Facial performance happens exclusively in the portrait layer.
- **Exits are architectural, never UI.** A gate, a gap between tents, a doorway, a bend in the trench, the end of a bridge. Maximum 4 per scene. Every exit sits at the **vertical centre of the walk-plane band** so the affordance is learned once, in Act 1, and never taught again.
- **Maximum 8 seconds of walking** from a scene's entry point to its farthest interactable (R9), which on this grid is roughly two and a half screen widths of walk-plane. Enforced by an automated check on the walk-plane spline length at scene load in dev builds.

## 5.6 The three-second test

Every plate is shown for three seconds to someone who has not read the script. They must be able to answer four questions:

1. Indoors or outdoors?
2. What season, and what weather?
3. Where is the person meant to walk?
4. Which figure is Washington?

Four answers, three seconds, no exceptions. Failing (3) means the walk-plane is not reading — usually the L4 band is too thin or the walk-plane's value is too close to L3's. Failing (4) means the composition has buried him — check the crowd line.

## 5.7 The canonical view rule

**Every location is generated once, from one canonical angle, and never re-derived.** The canonical views are enumerated in `historical-visual-reference.md` §3 and that list is closed. Weather, season, night and mood variants come from img2img off the master plate at denoise 0.28–0.38, never from a re-prompt. If the script requires a second angle on a location, **that is a writing problem, and the scene is cut or rewritten.** This is the decision that turns the project's biggest AI weakness into a non-issue, and it only works if it is enforced without a single exception.

---

# 6. THE PORTRAIT SYSTEM

Register R3. Peale tradition — Charles Willson Peale painted Washington from life repeatedly across the war, was himself a soldier in that army, and is public domain. He is the anchor for the face; **Trumbull is staging reference only and never the face; Stuart's 1796 Athenaeum portrait is banned outright.**

## 6.1 Framing and technical spec

| Property | Value |
|---|---|
| Crop | **chest-up, cut at the second coat button.** No hands, ever. |
| Head size | 38–46% of frame height |
| Eyeline | 0.36 from top |
| Turn | three-quarter, sitter's left shoulder toward the viewer (the Peale convention) |
| Aspect | 3:4 portrait |
| Generate | 1024 × 1536 · Master 1536 × 2048 · **Ship 768 × 1024 WebP q82** |
| Rendering | **DOM `<img>` in the overlay layer, not a Three.js texture.** Zero GPU texture cost, browser-managed decode, and the dialogue UI stays plain accessible HTML. |
| Displayed at | 288 × 384 logical px, pinned left of the text column, 2× for high-DPI |
| Background | **bare paper, always.** No painted ground, no scenery, no vignette. |
| Ink | 1.5–2.5 px contour, 1.0 px interior |
| Bare paper | 20–35% |

**The only background variation permitted** is a single soft grey wash behind the head on the shadow side, whose density runs **0.0 at HIGH → 0.35 at LOW**. That is the *only* place the mood system touches the portrait layer.

**Portraits are exempt from `uWashChroma`, from all nine mood uniforms, and from the per-act LUT.** This is not an oversight — it is the most important rule in this section. The portrait is the game's primary consequence-feedback channel. If it were also graded by the world shader, the student could never tell whether Washington looks worse because of what they did or because it is raining. **One signal, one cause.**

## 6.2 Asset count

| Class | Count | Notes |
|---|---|---|
| Washington | **9** | 3 war stages × 3 stat bands. §6.3. |
| Washington, Gilt Frame | **1** | R6. The myth face. Shown once, in the epilogue, beside the student's own Stage III portrait. |
| NPC — speaking roles | 12 × 4 expressions = **48** | neutral / speaking / angry / downcast, all four from one 4-up sheet |
| NPC — secondary | 10 × 2 = **20** | neutral / speaking only |
| **Total** | **78** | ~22 generations plus the Washington matrix |

**Washington gets no expression variants.** The nine band/stage portraits are his entire expressive range in the whole game. Two reasons, and both are load-bearing: it removes the hardest and most identity-fragile assets in the project from the schedule, and it is *true* — he was a formally controlled, physically still, deliberately unreadable man, and a Washington who emotes on cue is a different character. **He is the one face in the game that does not react.** Everyone else does, and that contrast is characterisation.

**The NPC roster** (portrait subjects — names and biographies are owned by `historical-visual-reference.md`, not by this document): Martha Washington · William (Billy) Lee · a named enslaved person at Mount Vernon from the *Lives Bound Together* research · Lund Washington · Henry Knox · Nathanael Greene · Robert Morris · Horatio Gates · Thomas Conway · Baron von Steuben · the Marquis de Lafayette · the Comte de Rochambeau · Benedict Arnold · Alexander Hamilton · John Glover · Private Joseph Plumb Martin · Sarah Osborn Benjamin · Colonel Johann Rall · Nathan Hale · Charles O'Hara · Thomas Mifflin · a named soldier of the 1st Rhode Island.

Portraits are generated **in pairs or trios sharing one image** wherever the subjects share a scene, so their palettes match by construction (AI guide §2.5).

## 6.3 THE WASHINGTON AGING MATRIX

Nine portraits. **One locked face.** Bone structure per the Houdon life mask; grey-blue eyes; long straight nose; his own reddish-brown hair, never a wig; 6′2″ proportions carried into the shoulder line; no facial hair, ever.

**Three absolute prohibitions:**

1. **Ageing happens through hair, powder, linen and posture. Never through facial deformation.** The projecting lower lip of the later portraits is denture damage — a medical fact about a man's suffering. Encoding it as a low-stat outcome would be anachronistic *and* grotesque. **Hard ban, no exceptions, no discussion.**
2. **Stage III shows grey at the temples in all three bands.** Time passed for everyone. The band changes what the grey *reads as* — worn down, endured, or earned.
3. **The Newburgh spectacles belong to all three bands.** They are the act, not a stat outcome.

**The four channels a student reads.** These are the same four in all nine cells, so they become legible through repetition without ever being explained:

| Channel | Question it answers |
|---|---|
| **POWDER** — the state of his hair | *Is he still keeping up appearances?* |
| **LINEN** — stock, shirt frill, cuffs | *Is anyone looking after him?* |
| **CARRIAGE** — head and shoulder angle | *Does he still believe this?* |
| **LIGHT** — key direction and wash temperature | *Does the world still favour him?* |

### Stage I — 1775/76 · Acts 1–4 · *the light blue ribband across the breast*

| | **LOW** | **MID** | **HIGH** |
|---|---|---|---|
| **Powder** | Patchy, breaking loose at the temples; reddish-brown showing through at the roots | Neatly clubbed, evenly powdered, black silk ribbon tied clean | Immaculate, powder even to the hairline, not a strand out |
| **Linen** | Stock crooked; coat unbuttoned at the throat; frill limp | Correct and plain; nothing to remark on | Frill crisp; sash flat and unwrinkled across the breast |
| **Carriage** | Chin fractionally lowered, shoulders dropped, turned slightly away | Squared to the viewer, chin level, direct gaze | Three-quarter turn toward the viewer, chin fractionally raised |
| **Light** | From behind and to the right; the face is in half shadow; wash cooler, greyer | Flat even frontal light; neutral wash | From the front left and above; wash warmer, more ochre |
| **Read this** | *He is not sure they chose right.* | *A competent Virginia gentleman doing a job.* | *He believes he can do this.* |

### Stage II — 1777/78 · Act 5 · *the ribband still worn; a cloak indoors*

| | **LOW** | **MID** | **HIGH** |
|---|---|---|---|
| **Powder** | **None at all.** Hair its own reddish-brown, tied but not dressed. **This is the single clearest signal in the entire nine and it is the one to look at.** | Present but thin; unevenly applied; done, but done quickly | Fully powdered; the one thing he has not let go |
| **Linen** | Collar frayed; cloak worn over the coat *indoors*; stock loose | Serviceable; cuffs worn but clean | Worn cloth, immaculate condition — mended, not shabby |
| **Carriage** | Hollow beneath the cheekbone, shadow under the eye, shoulders forward | Fatigue visible but contained; upright | The face has **hardened rather than sagged**; jaw set, spine straight |
| **Light** | Cold, from behind right; the wash has drained toward indigo | Flat, cool, even | Warm key from the left; the only warmth in the act |
| **Read this** | *He has stopped keeping up appearances.* | *He is enduring it.* | *This is costing him and he is paying it.* |

### Stage III — 1781/83 · Acts 6–8 · *no ribband; grey at the temples in all three*

| | **LOW** | **MID** | **HIGH** |
|---|---|---|---|
| **Powder** | Grey through the temples and unpowdered; the powder has simply stopped | Grey at the temples, lightly powdered over | Grey at the temples, powdered evenly — the grey is *shown*, not hidden |
| **Linen** | Epaulettes **tarnished**; coat cuff rubbed through at the edge; stock plain | Epaulettes bright; coat well kept and old | Epaulettes bright; linen new; the whole uniform immaculate and clearly cared for |
| **Carriage** | Deep lines nose to mouth; the mouth set hard; the head slightly forward, as if braced | Steady, level, unremarkable — the posture of a man waiting | Calm. **The eyes are the only tired part of him.** |
| **Light** | Cold from the right, deep shadow across the jaw | Flat, even, cool-neutral | Even, slightly warm, from the front — the light of the Annapolis chamber |
| **Read this** | *He survived it and it took something.* | *He got here.* | *He is going to give it back, and he already knows it.* |

**What makes this readable.** In Stage I the variable is the **sash and the powder**. In Stage II it is the **powder alone** — its total absence at LOW is unmistakable. In Stage III it is the **epaulettes** — tarnished, bright, or bright-and-new. One dominant channel per stage means a student is never asked to compare four things at once; they notice one thing changed and the rest confirms it.

## 6.4 Making consequence comparable

Two mechanisms turn the portrait from a *felt* signal into a *readable* one, and both are free:

1. **The new portrait first appears in the interlude** — the writing-desk still between acts — not mid-argument. The change lands in the quiet moment, where there is nothing else on screen to compete with it.
2. **The letterbook's *Persons* ribbon keeps every past Washington portrait, in order, in one spread.** A student can scroll back to Act 1 and put May 1775 next to March 1783 side by side. The consequence channel becomes **comparable**, not merely felt. This is the single highest-value addition in this section and it costs one layout: the assets already exist.

## 6.5 Production

Per AI guide §3.4, restated as the acceptance gate: generate **one canonical master first — Stage II / Band MID, seed 20000** — sign it off, and derive the other eight from it as multi-reference calls, re-seated through `wash-v1` img2img at denoise 0.24. Then lay all nine out as a 3 × 3 contact sheet and look at it.

> **If any one of the nine reads as a different man, redo it. The entire consequence mechanic dies the moment a student cannot tell it is the same person.**

---

# 7. TYPOGRAPHY

## 7.1 The principle

**Decoration at the frame, legibility at the centre.** Period faces are for *documents* — things the fiction says are physical objects. All dialogue, all choices, all Council interjections, all system text are set in one plain, highly legible humanist sans, untreated, forever.

The reader we are designing for is a fifteen-year-old with dyslexia in period 4 on a 1366 × 768 Chromebook panel. They cannot parse jittered period type at speed and they should never be asked to.

## 7.2 The seven registers

All faces are SIL Open Font License. No commissioned type, no commercial licences, no webfont CDNs — everything is self-hosted and committed.

| Register | Face | Fallback chain | Used for | Treatment |
|---|---|---|---|---|
| **BODY / UI** | **Atkinson Hyperlegible** (400, 700) | Source Sans 3 → system-ui | **All** dialogue, choices, Council lines, glosses, system text, the epilogue | **None. Ever.** No jitter, no bleed, no multiply, no texture. |
| **PRINTED — fine** | **Libre Caslon Text** (400, 400i) | Libre Baskerville → Georgia | Congressional resolutions, official broadsides, the transcription layer of **every** document | Clean; justified; period-loose word spacing; +2% tracking below 18 px |
| **PRINTED — rough** | **IM Fell English** / **IM Fell English SC** | Libre Caslon Text | Paine's *American Crisis*, camp orders, ration returns, pay certificates, newspapers | Baseline ±0.4 px, alpha 0.82–1.0, multiply into the paper, slight ink spread |
| **SECRETARY** (Washington's hand) | **EB Garamond Italic** (400i) | Cormorant Garamond Italic → Georgia Italic | The letterbook; his General Orders; his marginalia; the interlude letters | Per-glyph rotation ±1.2°, baseline ±0.6 px, alpha 0.86–1.0, 4° additional slant, multiply, ragged right |
| **ROUGH HAND** | **EB Garamond Italic**, degraded | as above | Soldiers' journals, deserters' notes, **the anonymous Newburgh Address** | Rotation ±3.0°, baseline ±1.8 px, alpha 0.55–0.90, occasional doubled letterform; copy carries authentic period misspellings |
| **ENGROSSED** | **Petit Formal Script** (400) | Mrs Saint Delafield → Libre Caslon Text Italic | **Exactly four objects**: the commission (Act 1), the surrender articles (Act 7), the resignation address (Act 8), the Gilt Frame captions | Display only, ≥ 28 px. **Never body copy.** |
| **ENGRAVED** | **Cormorant SC** (400) | Libre Caslon Text small caps | The five Council voice **names**; chapter cards; the epilogue's three passes; the "this will not come again" margin note | Small caps, +8% tracking, **no jitter** — the Council is *printed*, not written |

### Two deliberate departures from the reference analysis, with reasons

**IM Fell English is reassigned from Washington's hand to rough printing.** IM Fell is a digitisation of a seventeenth-century English *printing* type, complete with the battered, inky, unevenly-inked impression of hand-pressed metal. That is exactly what a cheap 1776 broadside looked like and exactly wrong for a pen. Paine's *American Crisis* was mass propaganda printed on bad paper, and IM Fell makes it look like it.

**Washington's hand is EB Garamond Italic under treatment, not a script face.** Every free "period handwriting" font is either an ornate copperplate that is unreadable at body size or a modern casual script that is unreadable as period. But Pentiment's actual trick was never the letterforms alone — it was *treatment plus setting*. EB Garamond's italic descends from sixteenth-century chancery, which is precisely the ancestor of an educated eighteenth-century English hand; with per-glyph jitter, ink-bleed multiply, a slight extra slant and a ragged right margin on real paper, it reads unmistakably as handwriting and remains fully legible at 20 px.

**And this buys the best free effect in the game.** The anonymous Newburgh Address is set in **the same face as Washington's own hand**, differently degraded. A student who notices that the threatening anonymous letter has the same letterforms as the General's correspondence has performed an act of palaeography — has concluded, correctly, that it was written by someone of the same education, inside the same officer corps — without ever being told they were doing document analysis. That is Pentiment's exact move, and it costs one CSS class.

## 7.3 Metrics

**Type is rendered in the DOM at device pixels and does not scale with the canvas.** The scene canvas letterboxes and scales to fit; the type layer does not. 19 px is 19 px on a 1366 × 768 panel and on a 1920 × 1080 panel. The *measure* is maintained by adjusting the text column's width in `ch` units in CSS, never by scaling the glyphs. This is the single most important accessibility decision in the typography and it is an engineering decision, not a design one.

| Element | Size / leading | Measure |
|---|---|---|
| Dialogue body | **19 / 29 px** | 58–66 characters, ≤ 55 words per block |
| Choice option | 18 / 26 px, indented 24 px | 58–66 |
| Council voice name | 15 px ENGRAVED small caps, +8% tracking | — |
| Council interjection | 19 / 29 px BODY, `INK-SETTLED` | ≤ 28 words (R6) |
| In-line gloss | 16 / 24 px in a 260 px margin panel | 25–60 words |
| Document transcription | **20 / 32 px** Libre Caslon Text | 52–60 |
| Chapter card | 44 px ENGRAVED small caps | — |
| Letterbook body | 20 / 32 px SECRETARY | 54–62 |
| **Minimum size, anywhere** | **16 px** | nothing smaller ships |

Reveal at 45 characters/second; any input completes the block instantly; a global instant-text toggle lives in the letterbook endpapers and persists in the passport code (R18).

## 7.4 The long-s

Delightful on an artefact. Hostile in dialogue. The position is precise:

**The long ſ appears in exactly two places.**

1. **The artefact layer of a document** — the beautiful, deliberately unreadable paper. Here it is *drawn ink texture*, not real glyphs, and it reads at a glance as "old" without costing anyone a second of reading time.
2. **The first line only** of a *printed* primary source's transcription, as a one-line epigraph, followed immediately by the modernised text. That line carries a dotted underline; hovering or tapping opens the standard gloss: *"the long ſ — an eighteenth-century form of lower-case s, used everywhere except at the end of a word."*

**It appears nowhere else.** Not in dialogue, not in choices, not in Council lines, not in the letterbook's body, not in the UI, not in the transcription past line one. The long-s is a fact about printing that a student should meet once and then recognise forever. It is not a reading tax to be paid on every screen for four class periods.

**Implementation, and a warning.** Author the epigraph string **by hand**, containing literal U+017F. **Do not write an automatic s → ſ substitution pass.** The rules are subtle — never word-final, never before an apostrophe, interactions with the ﬀ and ﬁ ligatures, exceptions after certain letters — and an automatic pass will produce errors that a history teacher will spot in ten seconds. Twelve hand-authored epigraphs is an afternoon's work and it is right.

**Keep the voice; drop the glyph.** Period capitalisation, period spelling in ROUGH HAND copy, and abbreviations like `&c.` and `Honble` all **stay** in the transcription — they are the sound of the eighteenth century and they cost nothing to read. Only the letterform is modernised.

## 7.5 Payload

All faces subsetted to Latin-1 plus the specific archaic glyphs used, WOFF2, self-hosted, preloaded in the shell.

| Face | Weights | Budget |
|---|---|---|
| Atkinson Hyperlegible | 400, 700 | 68 KB |
| Libre Caslon Text | 400, 400i | 52 KB |
| IM Fell English + SC | 400, 400i | 44 KB |
| EB Garamond | 400i | 46 KB |
| Cormorant SC | 400, caps + digits + punctuation only | 14 KB |
| Petit Formal Script | 400, display alphabet only | 9 KB |
| **Total** | | **233 KB** ✓ (ceiling 240 KB) |

---

# 8. THE UI AND CHROME

## 8.1 The governing rule

> **A UI element is a physical object in the fiction, or it does not exist.**

No panels, no rounded rectangles, no drop shadows, no glass, no gradients, no glow, no blur, no bloom, no toast notifications, no progress bars, no icons that are not printers' ornaments. **Every UI element carries an ink line at full opacity** — this is Obra Dinn's outline discipline applied to the DOM layer, and without it the chrome will visibly not belong to the game.

**HUD: none.** Zero persistent interface during play except a **single 32 × 32 ribbon-end glyph in the lower right**, which opens the letterbook. Disco Elysium needs orbs because Disco Elysium can kill you. Nothing here earns a permanent place on screen.

## 8.2 The letterbook

One meta-object, four ribbons (R19). A bound quarto.

- **Opens as a two-page spread**, 1200 × 760 logical, centred, over a **62%-opacity `INK-SETTLED` scrim**. The scrim is flat. **There is no blur anywhere in this game** — blur is the fastest available signal that you are looking at a modern game engine.
- **Four cloth ribbon-ends** protrude from the fore-edge at fixed vertical positions, top to bottom: **Correspondence · Documents · Persons · Maps**. The four silks are four neutral drabs distinguished **by value, light to dark, top to bottom**; each carries a printed label in ENGRAVED small caps. Position and label carry the identification; colour only reinforces it. No Group D or E colour appears on a ribbon.
- **Correspondence** — Washington's own letters, in SECRETARY hand, on ruled paper, unnumbered (letters are not numbered). The ink of earlier entries browns toward `INK-FADED` as the war proceeds.
- **Documents** — each entry a catalogue line in PRINTED-fine with a small **`SEAL-RED` wax dot** when that source has unlocked something. One glyph, one meaning, tied directly to R2.
- **Persons** — a ruled album, portrait tipped in at the top-left of each entry, with what Washington currently knows and thinks. This is where relationship state becomes visible without a meter, and where the nine-portrait Washington ladder becomes comparable (§6.4).
- **Maps** — folded survey sheets that unfold; the entry point to map-table scenes.
- **The settings live in the endpapers.** There is no settings menu anywhere else in the game.

## 8.3 The document viewer

The two-layer object: **artefact, then transcription.**

- The **artefact** fills the spread — real paper, real fold marks, real wax, real illegible ink texture, **deckled on two of four edges**. It is beautiful and it is not readable.
- A **paper tab in the lower right, printed `TRANSCRIPT`,** flips to the typeset layer. **180 ms cross-dissolve.** No modal, no zoom, no page-turn animation.
- The transcription is set in PRINTED-fine at 20/32 px **on the same paper ground** — the student never leaves the object. Text is real, selectable, searchable, and screen-reader accessible.
- Every document in the game is evidence for something. There are no flavour documents (R2, and it is a content-review gate).

## 8.4 The passport code screen

The save system is a code the student carries between class periods. It is presented as **a pass, signed by Washington** — because that is a real period object and because it makes the most administrative screen in the game the most charming one.

- A small printed form in **PRINTED-rough**, with the blanks filled in **SECRETARY hand**: *"Permit the bearer, ————, to pass the guards…"*
- **The code itself** is set in **Libre Caslon Text at 26 px, +12% tracking, in groups of four characters**, on a ruled line. It is real selectable text with a screen-reader label.
- Below it, one line of plain instruction in PRINTED-fine explaining what the code does.
- **The copy button is a wax seal.** Pressing it stamps the seal in `SEAL-RED`, and the seal's presence on the page *is* the confirmation. No toast, no checkmark, no green tick, no animation beyond the stamp.

## 8.5 Choices, locks, and seals

**Locked options.** Struck through with a single **1 px `INK-LIGHT` rule at cap height**, prefixed with the responsible voice's emblem (voice-locked) or a small folded-letter glyph (knowledge-locked), with a margin note in ENGRAVED small caps.

> ~~"You will hang for this, sir, and I will watch."~~
> — TEMPER IS NOT LOUD ENOUGH TO SAY THIS.

**The accessibility position, stated so it is not quietly violated later: "locked" is communicated by the strike-rule, the glyph, and the margin note — never by low contrast.** Locked option text stays at **≥ 4.5 : 1** (the specified value is `#4A3B2C` on `PAPER-WARM` = 8.74 : 1). Greying text below threshold to indicate state is the most common accessibility failure in games and we are not committing it. Three redundant channels, none of them colour.

**Sealed decisions.** A **24 × 24 `SEAL-RED` wax seal glyph** to the left of the choice list, plus one margin line in ENGRAVED small caps: `THIS WILL NOT COME AGAIN.` Eight in the game, one per act, and no more.

**Council presentation.** Emblem (20 × 20, R4 engraved vignette, cut from a single 4 × 4 sheet) · voice name in ENGRAVED small caps in the voice ink · the line beneath in BODY at 19 px in `INK-SETTLED`. Two to four voices per decision point, never one, never five (R4).

## 8.6 Menus, transitions, loading

- **The title screen is a title page** — a period book title page, set entirely in type, centred, with a rule and an imprint line. No illustration. Setting the title in type rather than generating it is also the §5.1 never-generate-text rule applied to the one place everyone is tempted to break it.
- **Cut = space. Fade = time.** Hard cut (1 frame, with a 220 ms crossfade on the audio bed only) when walking to an exit. A **900 ms fade to `PAPER-BRIGHT`** exclusively for act breaks and time skips (R7).
- **The Gilt Frame has its own transition** (§1.2, rule 6) and it is the only one.
- **No visible loading.** Per-act chunks are prefetched during the preceding act's dialogue. If a chunk is not ready, the game holds on the interlude letter, which is already 60–90 seconds of authored reading. There is no spinner in this game.
- **Banned in the chrome, absolutely:** blur of any kind, depth-of-field, bloom, glow, lens flare, chromatic aberration, film grain (paper grain only), parallax on UI, easing curves with overshoot, and any animation longer than 400 ms that is not the Gilt Frame or an act break.

---

# 9. WHAT THIS STYLE IS NOT

An explicit anti-reference list. Every item here is something a well-meaning contributor, a stakeholder, or an image model will drift toward. The prompt-level ban list in `historical-visual-reference.md` §5.4 is the machine-readable subset of this; this is the human-readable whole.

**Dead pivots — do not resurrect:**

1. **Not pixel art.** Not "pixel art with a watercolour filter." Not a low-res palette. That decision is dead and nothing in the game references it.
2. **Not top-down, not isometric, not free-roaming.** No tile grid, no Zelda camera, no orbit, no player zoom.
3. ~~**Not oil impasto.**~~ **REVERSED 15 Aug 2026 — see `09-painterly-direction.md` §6.** The project is now made in alla prima oil. Note that §9.4 and §9.5 below are thereby made *more* dangerous, not less: nineteenth-century history painting and golden-age illustration are oil paintings of this subject, and the negative list is now the only defence against them.

**Wrong centuries:**

4. **Not nineteenth-century history painting** — except deliberately, in the Gilt Frame, captioned and quarantined. Leutze, Trumbull's Rotunda cycle, Willard's *Spirit of '76*, Currier & Ives. **These are the model's default and they must be actively fought in every negative prompt.**
5. **Not golden-age illustration.** No Howard Pyle, no N. C. Wyeth, no Norman Rockwell. Beautiful, wrong, and everywhere in the training data.
6. **Not Napoleonic, not Victorian, not Civil War.** No shakos, no tailcoats, no high stiff collars, no kepis, no sack coats, no percussion locks.

**Wrong registers:**

7. **Not storybook watercolour.** No wobbly charm, no Quentin Blake line, no children's-picture-book brightness, no cheerful loose brush. Ours is a **record made by a trained officer**, not a charming sketch. If a plate is *lovable*, it is wrong.
8. **Not sepia.** The palette is not monochrome brown and it is not a "history filter." It is a restrained ground with **reserved chroma that carries meaning**. Anything that looks like an Instagram preset fails.
9. **Not fantasy-map parchment.** No burnt edges, no torn corners, no rolled scroll, no wax-and-string, no Skyrim map, no D&D handout. Our paper is **fresh**, because the war is happening now.
10. **Not grimdark.** No viscera, no mud-and-blood war-film grade, no desaturate-everything-to-grey. A three-value wash over a confident line is constitutionally incapable of rendering gore and looks *wrong* when pushed toward it — use that.
11. **Not a museum interface.** No white cube, no wall labels, no didactic captions — except inside the Gilt Frame, where the caption is the entire point.
12. **Not patriotic iconography.** No bunting, no eagles, no fife-and-drum trio, no thirteen stars in a ring, no flag-as-backdrop composition. The Grand Union flag is a *teaching object*; the Betsy Ross flag is a nineteenth-century invention and it never appears.

**Wrong media:**

13. **Not anime, not cel-shaded, not flat vector, not Ghibli.** No hard-edged two-tone shadows, no outline-plus-flat-fill.
14. **Not a comic.** No panels, no speech balloons, no motion lines, no onomatopoeia, no gutters.
15. **Not photobashed and not 3D-rendered-then-filtered.** The 3D in this project is scaffolding for parallax and the map table; it is never visible as 3D. If a viewer can tell a scene is geometry, the grade has failed.
16. **Not modern UI.** No rounded corners, no drop shadows, no gradients, no glassmorphism, no blur, no glow, no material design, no dark-mode toggle, no hamburger menu.

**Wrong Washington:**

17. **Not the dollar bill.** Gilbert Stuart's 1796 Athenaeum portrait is banned outright — it is thirteen years after Annapolis and its distorted lower face is denture damage.
18. **Never wigged, never on a white horse, never bearded or stubbled, never with three stars, never with a hand in his waistcoat** (that is Napoleon), never smiling with an open mouth.

**And the one everybody reaches for:**

19. **Not *Assassin's Creed III*.** No hooded protagonist, no rooftop parkour framing, no tomahawk-and-wolf-pelt silhouette, no blue-white "eagle vision" grade. It is the single most likely visual reference a student, a stakeholder, or a search engine will supply for "American Revolution game," and it is wrong in style, register, protagonist and argument. **Naming it here is the point.**

---

# Appendix A — Asset sign-off checklist

A plate ships only when every line is checked. Run in this order; the cheap checks come first.

**Automated (CI, `scripts/`):**
- [ ] Bare-paper ratio within its register's band (§4.2)
- [ ] No pixel darker than `INK-FLOOR` `#241C14` (R6 exempt, clamps to `#16110D`)
- [ ] No pure `#000000` and no pure `#FFFFFF` anywhere
- [ ] Resolution, format, and per-act size budget (AI guide §6.5)
- [ ] Ledger record exists and its file exists

**Human, 60 seconds:**
- [ ] Register declared, and the plate obeys that register's line, wash, camera and motion rules (§1.5)
- [ ] Horizon at y = 0.34; walk-plane band 0.56–0.78; L4 occluders 15–25% of frame height (§5.1)
- [ ] Washington silhouette composited at 220 px near / 130 px far — reads correctly at both (§5.1)
- [ ] All three edge types present; at least one major form has a lost edge (§4.3)
- [ ] One contiguous bare region ≥ 12% of frame (§4.2)
- [ ] One focal object, on a third, where darkest ink meets a meaning colour (§5.4)
- [ ] ≤ 2 Group D colours above 5% of frame (`YT-03` excepted) (§2.4)
- [ ] ≤ 9 background figures (§5.5)
- [ ] Washington's head above the crowd line (§5.4)
- [ ] No legible text anywhere in the image (AI guide §5.1)
- [ ] Ink mask authored (L0–L2) or contrast sufficient for shader derivation (L3–L4) (§3.3)
- [ ] Three-second test passed by someone who has not read the script (§5.6)

**Gated:**
- [ ] `hist_check` verdict recorded in the ledger
- [ ] `sensitive: true` assets carry written sign-off per `historical-visual-reference.md` §7.6

---

# Appendix B — Complete palette, one table

```
GROUNDS      PAPER-WARM        #EFE7D5   default ground, and all UI/dialogue ground
             PAPER-COOL        #E5E3DB   Acts 4, 5
             PAPER-BRIGHT      #F6F2E6   Act 8; the act-break fade
             PAPER-SMOKED      #DCD2BC   fire-lit interiors; carried documents
             PAPER-SHADOW      #C6BCA6   deepest untouched ground

INKS         INK-FLOOR         #241C14   hard darkest clamp, R1–R5
             INK-FRESH         #2B2B36   newly written iron gall; darkest accent
             INK-SETTLED       #3B2E22   PRIMARY LINE + all body type
             INK-FADED         #6B4F35   oxidised ink; earlier acts' documents
             INK-LIGHT         #6E6152   L0/L1 aerial line; hatching; strike-rule

EARTH        BISTRE            #7A5C3E   mud, timber, leather, warm shadow
             RAW-UMBER         #6E5B45   earthworks, tent shadow, worn cloth
             YELLOW-OCHRE      #9E7B3D   straw, new pine, lamplight, autumn
             TERRE-VERTE       #7C8570   the only green in the game
             SHADOW-SLATE      #55627A   cold shadow, distant hills, water
             WET-STONE         #5C6673   wet board, stone, sleet-light
             MADDER-LAKE       #8F4A44   brick, tile, rust

MEANING      CONTINENTAL-BLUE  #243B5E   Continental coats; Washington's coat
             BUFF              #C9B489   Washington's facings — his personal colour
             BRITISH-MADDER    #9E3B32   British privates
             BRITISH-SCARLET   #C0392B   British officers; Continental artillery facings
             PRUSSIAN-BLUE     #1F3048   Hessian coats
             FRENCH-WHITE      #E8E2D4   French infantry
             SEAL-RED          #8C2F2A   sealing wax — and nothing else in the game
             FLAME             #D98C3C   torch, hearth, muzzle flash

COUNCIL      VANITY            #875E0F   hand mirror     L* 43.1   4.69:1
             AMBITION          #9E2E12   spur            L* 36.5   5.98:1
             TEMPER            #762C29   struck flint    L* 28.9   7.89:1
             RESTRAINT         #223746   bridle bit      L* 22.0  10.02:1
             DUTY              #1B1E5A   folded commission L* 15.0 12.36:1

R6 ONLY      GILT-FRAME-FLOOR  #16110D   the only value below INK-FLOOR in the game
```

Also locked, from `historical-visual-reference.md` §1.15 and used unchanged: `HUNTING-LINEN #CFC5AC`, `OSNABURG #9C8C74`, `BUTTERNUT #7A6247`, `PIPECLAY #DED8CB`.

---

# Appendix C — Additions to the file-naming convention

Extends the AI guide's `type` codes (§6.2) with the asset classes introduced by this document:

| Code | Class |
|---|---|
| `gf` | Gilt Frame plate (R6) — 8 total |
| `em` | Council emblem vignette (R4) — one 4×4 sheet |
| `ik` | authored ink mask, where shipped separately from a layer's alpha |
| `pl` | per-act palette plate (the LUT reference image) |

Example: `a04_xx_gf_leutze-crossing_v02.webp` · `gl_xx_em_council-sheet_v01.webp` · `a05_s01_ik_brigade-street_L3_v02.ktx2`

---

# Appendix D — Open items owned elsewhere

| Item | Owner | Note |
|---|---|---|
| Hessian facings at Trenton (V-1) | `historical-visual-reference.md` §8 | Blocks Act 4 crowd generation |
| Named soldier, 1st Rhode Island | History | Portrait roster §6.2 needs a documented name |
| Gilt Frame plate for Act 3 | Creative Director | The Hale plate is the least canonical of the eight; confirm at Act 3 sign-off or substitute |
| Atkinson Hyperlegible **Next** | Art Lead | Prefer the variable version if its OFL status is confirmed; ship classic Atkinson Hyperlegible otherwise |
| Per-act LUT plates (8) | Art Lead | Produced at each act's Phase C unification pass |
