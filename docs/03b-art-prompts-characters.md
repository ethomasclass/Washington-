# AI Art Prompt Guide — Part 2: Characters, Portraits & Cutouts
### *In Washington's Shoes* — the binding prompt substrate for every human figure in the game
**Version 1.0 · 14 August 2026**
**Owner:** Art Lead. **Binding on:** every portrait, every cutout, every crowd figure, every Council emblem.

---

## 0. What this document owns

`03a` owns places. **This document owns people.** The split is not arbitrary: environments are a *composition* problem and characters are an *identity* problem, and the two are solved by completely different machinery. A location is held consistent by never showing it twice from a different angle (`02` §5.7). A person is held consistent by never generating them twice from scratch.

| Document | Authority |
|---|---|
| `reference/historical-visual-reference.md` | What is **true** — Washington's documented appearance, uniforms, the Witness Register, the ban lists. Outranks this document on every question of fact. |
| `docs/02-art-direction.md` | What an image must **look like** — registers R1–R6, the palette, the portrait spec §6, the nine-cell matrix §6.3. |
| `docs/05-act-scene-inventory.md` | **Who exists** — the 34 speaking characters, act by act, and which scenes they stand in. |
| `docs/07-stat-and-voice-system.md` | **What the portrait means** — the scalar `C`, the two clocks, the Council. |
| `reference/ai-art-production-guide.md` | **How an image gets made** — models, LoRAs, seeds, keying, the ledger. |
| **This document** | The exact text that goes into the box, for every human being in the game. |

**The one-line law of this document, from which everything below is derived:**

> **A face is never described into existence. It is generated once, signed off, and thereafter only ever edited.**

Every rule here is that sentence made mechanical. The descriptor blocks in §1 and §2 are not there to *produce* a likeness — two hundred words of facial description produce two hundred different men (`ai-art-production-guide.md` §3.1) — they are there to stop a likeness that already exists from drifting when the prompt around it changes.

### 0.1 The eleven locked files this document creates

Nobody retypes these. The pipeline script concatenates them. Editing one in place without a version bump is the single fastest way to desynchronise the cast.

```
art/prompts/char-style-block.txt          §1.1   the character style anchor
art/prompts/char-framing.txt              §1.2   four framing lines, one per asset class
art/prompts/char-negative.txt             §1.4   the character negative block
art/prompts/char-negative-german.txt      §1.5   the one permitted variant
art/prompts/char-washington.txt      v2   §2.1   THE WASHINGTON DESCRIPTOR LOCK
art/prompts/char-washington-stage.txt     §2.3   three war-stage modifiers
art/prompts/char-washington-band.txt      §2.4   three stat-band modifiers
art/prompts/npc/<subject>.txt             §4     36 subject files
art/blockout/char-sheet-template.png      §5.2   the scale template (ControlNet input)
art/refs/ref_deverger_four-soldiers.png   §4.0   mandatory ref on all Continental figures
art/refs/ref_costume_*.png                §4.0   five costume plates, mandatory refs
```

### 0.2 Assembly order — the concatenation is fixed

```
[SUBJECT LINE]                     per-asset, this document §3/§4
[CHARACTER LOCK]                   char-washington.txt, Washington only
[STAGE MODIFIER]                   Washington only
[BAND MODIFIER]                    Washington only
[char-style-block.txt]             every character generation
[char-framing.txt : one line]      by asset class
[style-block.txt]                  the shared world style block, unchanged
[char-negative.txt]                or char-negative-german.txt
```

**Subject first, style last** (`ai-art-production-guide.md` §2.1), with one addition this document makes and enforces: **the identity sentence is always the first sentence of the whole prompt.** Early tokens carry more weight in every model in the pipeline, and identity is the thing we cannot afford to lose. `gwface` is token one of every Washington generation in the project.

### 0.3 The rule that prevents the most expensive class of failure

> **A per-asset subject line may add STATE. It may never re-describe ANATOMY.**

If the lock says the nose is straight and of good size, the subject line does not mention the nose. Two descriptions of the same feature in one prompt do not reinforce each other — they average, and the average is a third nose. Subject lines describe age, dress, condition, light, expression and pose. Bone is owned exclusively by the lock.

---

# 1. THE CHARACTER STYLE ANCHOR

## 1.1 `char-style-block.txt` — v1, locked

The environment anchor in `03a` describes a **topographical draughtsman recording ground**. This one describes a **provincial American portrait painter recording a person**. Same paper, same ink, same three-value discipline, different job — which is exactly the relationship `02` §1.5 sets up between R1 and R3, and it is why the two anchors must be different text and must not be merged.

Three things this block does that the environment block must not: it declares four wash values rather than three (a face needs a half-tone the ground does not); it forbids scenery behind the head absolutely; and it imports the *stiffness* of American provincial portraiture, which is the single cheapest way to stop the model reaching for the London-society register it defaults to.

```
CHARACTER STYLE: a portrait study in the provincial American manner of the
1770s. The head is drawn first in warm brown-black iron-gall ink with a quill —
a confident contour line about twice the weight of the interior lines — and the
line carries the whole structure of the skull, the brow, the nose and the jaw.
The face is then modelled in transparent watercolour wash in four values only:
the bare paper standing for the light, one pale wash for the half-tone, one mid
wash for the shadow, and a single dark accent in the eye socket and beneath the
jaw. The cloth is stated in two values and a line and is never rendered in
detail — the coat is described, not painted. Stiffer, flatter and more linear
than fashionable London portraiture: the sitter is set down plainly and is not
flattered. One light source only, hard-edged where it crosses the cheek, with no
reflected fill, no second key and no rim light. The ground behind the head is
bare warm cream laid rag paper with faint vertical chain lines, left untouched —
no scenery, no drapery, no column, no sky, no painted backdrop, no vignette, no
frame. Nothing in the image is pure black and nothing is pure white.
```

**Why "provincial" and not "colonial."** *Colonial* pulls the model toward Williamsburg costume photography and reproduction furniture; *provincial* pulls it toward the flatter, more linear, more literal painting that Americans actually produced in the 1770s. One word, measurably different output. The QA question that goes with it is in §7, C-04.

## 1.2 `char-framing.txt` — four lines, one per asset class

Exactly four. A fifth would mean a fifth kind of character asset, and there isn't one.

**`FRAMING-PORTRAIT`** — R3. All 96 chromatic portraits.
```
FRAMING: chest-up, the body cut across at the second coat button. No hands, no
forearms, no held objects, nothing below the chest. The head fills about
two-fifths of the picture height and the eyes sit about one-third down from the
top edge. A three-quarter turn with the sitter's left shoulder toward the
viewer, the face turned a little further toward the viewer than the shoulders.
```

**`FRAMING-WITNESS`** — R3 ∩ R5. The five Witness Register portraits. §4.2.
```
FRAMING: chest-up, the body cut at the collarbone. No hands, no held objects.
The sitter faces the viewer squarely and looks directly out of the picture. The
eye line is exactly level with the viewer's — the picture is made from a
standing person's own height and never from above.
```

**`FRAMING-CUTOUT`** — the stance sheets. §5.
```
FIGURE AND GROUND: full figure, head to feet, isolated and complete, standing
alone against a completely flat, even, featureless warm grey background of one
uniform tone. No cast shadow, no ground line, no horizon, no scenery, no
vignette, no frame; clear empty margin on all four sides. Even diffuse frontal
light with no strong directional shadow. Arms hanging relaxed and slightly away
from the body, hands open and clear of the coat.
```

**`FRAMING-EMBLEM`** — R4 engraved. §6.
```
FRAMING: a single small object drawn as a copperplate engraved vignette,
centred, isolated on bare cream paper, no ground, no shadow, no setting. Built
entirely from ruled and crosshatched ink lines of even weight with no wash and
no solid fill; the paper does the lighting. The object occupies the middle half
of the cell with clear paper all round it.
```

## 1.3 The one framing rule that saves the project a week

**No hands, ever, in any portrait.** This is `ai-art-production-guide.md` §5.2 route 1 and it is worth restating because it will be argued with. A chest-up crop at the second coat button removes the single most reliable AI tell from 96 of the project's most-viewed images, for free, and it is *also* the correct period convention for a small portrait. There is no version of this game in which a character's hands appear in the dialogue layer.

## 1.4 `char-negative.txt` — v1, locked

Appended after the shared `style-block.txt` NEGATIVE, never instead of it. **Not editable per asset.** If an asset needs something on this list, the asset is wrong.

```
NEGATIVE (CHARACTER):
photograph, studio portrait, glamour, beauty retouching, airbrushed skin,
symmetrical face, perfect teeth, orthodontia, veneers, open mouth, smiling with
teeth showing, gym physique, modern haircut, modern grooming, stubble, five
o'clock shadow, beard, moustache, sideburns, goatee,
periwig, powdered wig with rolls of curl over the ears, barrister wig, bob wig,
tie wig, hair ribbon bow at the crown,
elderly jowls, projecting lower lip, sunken mouth, collapsed lower face, dollar
bill, banknote engraving,
hand tucked into the waistcoat, arms folded, hands in frame, held objects,
pointing,
shako, busby, bicorne worn front to back, stiff triangular hat shell, pirate
hat, feathered cavalier hat,
tailcoat, cutaway coat, high stiff standing collar, frogging, bullion fringe on
a fitted coat, kepi, forage cap, sack coat, greatcoat with a shoulder cape and
brass buttons,
corset, front-laced bodice, bare shoulders, decolletage, ball gown, empire
waist, bare head on an adult woman, loose flowing hair on an adult woman,
Napoleonic, Waterloo, Regency, Victorian, Civil War, Gettysburg, 19th century
history painting, rotunda mural, Currier and Ives, Spirit of 76, bicentennial,
reenactor photograph, costume photography, living history museum, theatrical
costume, wax museum,
oil painting, impasto, thick paint, visible brush loading, palette knife, canvas
weave, gouache opacity, cel shading, anime, manga, comic ink, flat vector, 3d
render, cgi, photoreal, hdr, oversaturated,
glow, bloom, rim light, lens flare, depth of field, bokeh, drop shadow,
painted backdrop, drapery, curtain, column, balustrade, landscape behind the
sitter, sky behind the sitter, oval frame, gilt frame, cartouche, nameplate,
signature, lettering, text
INHERITED BAN LIST (historical-visual-reference.md §5.4, verbatim):
Leutze, Spirit of 76, Currier and Ives, N.C. Wyeth, Howard Pyle, Norman
Rockwell, Civil War, Napoleonic, Les Miserables, Hamilton musical, colonial
Williamsburg costume photography, 19th century history painting, oil impasto,
bicentennial
```

The inherited list is pasted in full at the foot rather than referenced, so that one file is the whole defence and nobody has to remember to add a second one.

## 1.5 `char-negative-german.txt` — the one permitted variant

Facial hair is a **faction marker** in this game (`historical-visual-reference.md` §1.9): German grenadiers and Jäger wore moustaches, British and American soldiers were clean-shaven. That makes an absolute facial-hair ban wrong for exactly one class of asset, and a per-asset negative edit is forbidden. The resolution is a second locked file, identical to `char-negative.txt` **minus** the five tokens `stubble, five o'clock shadow, beard, moustache, sideburns, goatee` — and nothing else changes.

Only two negative files exist in the project. A third is a decision-log entry.

Assets that use it: the Trenton Hessian crowd sheet, the Jäger figures in the Act 4 and Act 7 crowd sheets, and nothing else. **Colonel Rall is generated with the standard negative and is clean-shaven** — officers' facial hair is `[CONV]` and unresolved (V-C4, §9), and the faction marker survives perfectly well carried by the rank and file, where it is documented.

The positive language that goes with the German file, appended to those subject lines verbatim:
```
a short waxed moustache with the ends stiffened and turned up, the chin and
cheeks shaved clean beneath it
```

---

# 2. THE WASHINGTON DESCRIPTOR LOCK

## 2.1 `art/prompts/char-washington.txt` — v2. This is the anchor for 16 portraits and 3 cutout sheets.

Reused **verbatim, byte for byte, in every generation in the project that contains Washington** — the nine matrix portraits, the three Act 1 no-sash variants, the three Newburgh spectacles variants, the three stance sheets, and every diorama plate in which he is painted in. It contains no act-dependent element, which is why the sash is not in it.

```
gwface wshwash, GEORGE WASHINGTON.
BUILD: a very tall, large-framed man — six feet two inches, half a head above
every other figure in any scene — long-limbed, broad through the shoulder,
narrow through the hip, with notably large hands and feet. The head is well
shaped and not large for the body, set on a long neck; the shoulders are broad
and level, not sloping.
FACE: a long oval face, wide across the cheekbones, with a heavy but clean
jawline and a firm chin. A straight nose of good size, neither small nor beaked.
Deep-set, wide-apart grey-blue eyes under a heavy brow ridge. A high forehead. A
wide thin mouth, held closed, set firm. Fair skin weathered out of doors,
faintly pitted across the cheeks from smallpox — a texture, not a blemish.
Clean-shaven: no beard, no moustache, no stubble, ever.
HAIR: his own natural hair, sandy reddish-brown, worn long, drawn straight back
off the forehead without a parting, clubbed and tied at the nape with a black
silk ribbon, and powdered greyish-white for formality so that the reddish-brown
shows through at the roots, at the temples and behind the ear. Never a wig,
never rolls of curl over the ears, never loose.
DRESS: the uniform of a general officer of the Continental Army as he himself
fixed it. A full-skirted, knee-length coat of dark indigo blue — greyed, very
slightly purple, never navy-bright — with the collar, the deep turned-back cuffs
and the wide lapels in buff, a pale greyish yellow-tan the colour of undyed
chamois leather and not yellow; gilt buttons; buff lining showing at the
turned-back skirts. Beneath it a buff waistcoat and buff breeches, a black neck
stock at the throat, plain white linen at the wrist. One plain gold bullion
epaulette on each shoulder, with no stars on them.
BEARING: he is still. He stands very straight, weight even, heels together and
toes turned a little out. He does not gesture. Reserved, unsmiling, watchful; in
any scene full of movement he is the one figure at rest.
```

## 2.2 Every clause in that block, and where it comes from

| Clause | Source | Why it is in the *lock* and not in a subject line |
|---|---|---|
| six feet two inches; half a head above everyone | Houdon's measurement, `hist-ref` §2.1 **[DOC]** | It is the game's free findability affordance (`02` §5.4) and it must never vary |
| head not large, long neck, shoulders level not sloping | **Rembrandt Peale's own criticism of his father's Washingtons** — short neck, broad sloping shoulders, *"noses & eyes defectively small"* **[DOC]** | This is the single most useful sentence in the pack: it tells us exactly the three ways our primary anchor is wrong, so we anchor on Peale and correct him by Houdon on precisely those three points and nothing else |
| straight nose of good size, neither small nor beaked; wide-apart eyes | same criticism, inverted | Prevents the LoRA inheriting Peale's two known distortions |
| grey-blue eyes | `hist-ref` §2.2 **[DOC]** | |
| faintly pitted across the cheeks | 1751 Barbados smallpox, **[DOC]**. Peale and the others deliberately retouched the pocks out | **A decision, stated as one:** we do not retouch. The entire game is about the difference between the record and the retouch, and the Gilt Frame exists to quarantine flattery. Putting the flattery back into the face we play would be the project contradicting itself in its most-viewed asset. Phrased as *texture, not blemish* so the model does not produce acne |
| own hair, sandy reddish-brown, showing at roots and temples | `hist-ref` §2.2 **[DOC]** | The single detail that defeats the white-wigged-founder default. It is also the Stage II LOW signal's precondition — you cannot show powder *absent* unless the hair beneath it was established |
| blue coat, buff facings, gilt buttons, buff waistcoat and breeches | Fairfax County Independent Company pattern, `hist-ref` §2.3 **[DOC]** | |
| two plain gold epaulettes, **no stars** | `hist-ref` §1.7 **[DOC]** — three stars is 1798 | A real, catchable error a teacher will find in ten seconds |
| still, does not gesture, one figure at rest | `hist-ref` §2.1 | It is characterisation, it is documented, and it is why he needs no expression sheet (§3.1) |

## 2.3 `char-washington-stage.txt` — three war-stage modifiers

**ERRATUM E-C1, against `ai-art-production-guide.md` §3.3.** The guide's per-stage additions give Stage 2 as *"early fifties"* and Stage 3 as *"early fifties, harder."* Washington was born 22 February 1732. He is **43** at Mount Vernon, **45–46** at Valley Forge, **49** at Yorktown and **51** at Annapolis. "Early fifties" in a prompt is worth about six years of face, and it is applied to the stage where the game most needs him to still look like a man who can ride eighteen hours. The corrected text is below and supersedes the guide.

> **The rule that generalises from this: every character prompt in this project states an integer age in words. No decade words, ever.** *"Early fifties"* drifts. *"Aged forty-five"* does not.

```
STAGE I — Acts 1–4, May 1775 to December 1776. Aged forty-three.
Full in the face and unlined, with upright colour and no hollow anywhere. The
coat is new: the blue deep and even, the buff clean, the cloth unrubbed at the
cuff. [ACTS 2–4 ONLY: a wide watered-silk ribband of pale sky blue worn across
the breast from the right shoulder down to the left hip, between the coat and
the waistcoat.]

STAGE II — Act 5, December 1777 to June 1778. Aged forty-five.
Thinner in the face; the cheek beginning to fall in below the bone; one clear
line from the nostril to the corner of the mouth; shadow beneath the eye. The
coat's blue has faded toward slate across the shoulders where the weather
reaches it and the buff has gone grey at the cuff. The pale blue ribband is
still worn across the breast.

STAGE III — Acts 6–8, October 1781 to December 1783. Aged fifty.
Harder rather than older: the flesh gone from under the cheekbone, the jaw set,
the eyes narrower and the lids heavier. Grey through the hair at the temples.
No ribband of any kind. The coat is old and well kept — the cloth soft, rubbed
pale at the cuff edge and around the button-holes, the blue gone quiet.
```

## 2.4 `char-washington-band.txt` — three stat-band modifiers

Per `02` §6.3 and `ai-art-production-guide.md` §3.3: **the band is a pose, light, powder and linen change. It is never a face change.** The moment a band alters bone, the identity breaks and the consequence mechanic dies with it.

```
BAND LOW.  The powder is patchy and breaking loose at the temples, with the
reddish-brown showing through at the roots in an untidy way and a few strands
adrift. The black neck stock sits crooked, the coat is unbuttoned at the throat
and the shirt frill is limp. He is turned slightly away from the viewer, the
chin fractionally lowered, the shoulders dropped. The one light comes from
behind him and to his right, so the near side of the face is in half shadow.
The wash is cooler and greyer than neutral.

BAND MID.  The hair is neatly clubbed and evenly powdered, the black silk ribbon
tied clean. The stock and frill are correct and plain and there is nothing about
the linen to remark on. He is squared to the viewer, chin level, the gaze direct
and unhurried. Flat, even, frontal light. The wash is neutral.

BAND HIGH. The powder is immaculate and even to the hairline with not a strand
out. The frill is crisp and the linen is fresh. He is turned three-quarters
toward the viewer with the chin fractionally raised. The one light comes from
the front left and a little above. The wash is warmer, with more yellow ochre in
it.
```

## 2.5 The three prohibitions, restated because they will be tested

1. **No denture face, in any band, at any stage.** The projecting lower lip is documented medical damage from a man's suffering and it belongs to the mid-1780s onward. Encoding it as a low-stat outcome would be anachronistic *and* grotesque. It is in the negative block as `projecting lower lip, sunken mouth, collapsed lower face`. Hard ban, no discussion. (`02` §6.3.)
2. **Stage III shows grey at the temples in all three bands.** Time passed for everyone. The band changes what the grey *reads as*.
3. **The Newburgh spectacles belong to all three bands.** They are the act, not the outcome. §3.7.

---

# 3. THE WASHINGTON AGING MATRIX

## 3.1 Why there are nine and not thirty-six

Washington gets **no expression variants**. The nine band/stage portraits are his entire expressive range in the whole game (`02` §6.2). Two reasons, both load-bearing: it removes the most identity-fragile assets in the project from the schedule, and it is *true* — he was a formally controlled, physically still, deliberately unreadable man. **He is the one face in the game that does not react.** Everyone else does, and that contrast is characterisation, delivered for free by an asset we decided not to make.

## 3.2 The generation strategy — and it is the whole section

> **Generate ONE portrait. Sign it off. Derive the other eight from it. Never re-roll the master.**

The temptation is to generate nine good portraits. Nine independently good portraits are nine different men, and nine different men kill the mechanic in `07` §4.1 stone dead. The correct object of production is not nine images; it is **one image and eight edits.**

**Step 1 — the canonical master.** `gl_xx_pt_washington_st2_band-mid_v01`. **Stage II / Band MID, seed 20000.**

Stage II MID is the master for three reasons, and choosing the middle cell is not an aesthetic preference: it is the arithmetic centre of the matrix, so every derivation is at most one stage and one band away rather than two; it is the only cell with flat even light, so it carries the most usable identity information in the reference call; and it is the portrait the largest number of students will see, because Valley Forge is the act with the most portrait-bearing dialogue.

Iterate this one image as long as it takes. Twenty candidates is normal and cheap. **This is the only Washington image in the project that is allowed to be generated freely**, and once the Art Lead signs it, it is frozen forever. If it later needs a change, it is *edited*, never regenerated (`ai-art-production-guide.md` §3.5).

```
ENGINE  FLUX.2 klein-4B + wash-v1 @ 0.70 + gw-face-v1 @ 0.80
        euler / simple / 28 steps / guidance 3.2 / denoise 1.0
SIZE    1024 × 1536   →  master 1536 × 2048  →  ship 768 × 1024 WebP q82
SEED    20000
REFS    Peale, Washington at Princeton, 1779 (PD)
        Peale, Washington as a Virginia colonel, 1772 (PD)
        Houdon life mask, three photographed angles (PD, Mount Vernon)
```

Seed 20000 is a deliberate exception to the seed-family scheme in `ai-art-production-guide.md` §2.4 (which would give it 20202). It is the one image in the project that everything else points at, and it should be findable in a 3,000-line ledger by a number a person can hold in their head. Every other Washington portrait takes `20000 + stage×100 + band×10`.

**Step 2 — derive the other eight as multi-reference calls on Nano Banana Pro** (`gemini-3-pro-image`, paid API tier only — never a consumer tier, per `ai-art-production-guide.md` §7.2). Each call passes:

- the **signed master** (identity),
- **two Peale paintings** at or near the target age (1772 for Stage I, 1779 for Stage II/III),
- the target's **subject line + stage modifier + band modifier** as text,
- and nothing else. No new descriptive prose. The lock is already in the master's face.

**Step 3 — re-seat every output** through `wash-v1` img2img at **denoise 0.24**. NBP will have partly overwritten the house style; 0.24 restores paper, line weight and wash discipline without moving a feature. Above 0.30 the face starts to travel; that is the ceiling and it is not negotiable.

**Step 4 — head-only inpaint at denoise 0.30** if the eyes have drifted. Mask the orbits and nothing else.

**Step 5 — the 3×3 contact sheet.** Print all nine at ship size, in the grid, on one sheet, and look at it.

> **If any one of the nine reads as a different man, redo it. The entire consequence mechanic dies the moment a student cannot tell it is the same person.** (`02` §6.5.)

## 3.3 The identity metric gate — because "reads as a different man" is not a check

"Look at it and see" is the right final authority and a terrible first filter. Four ratios, measured with a ruler on the printed contact sheet in about five minutes, catch drift before anyone's taste is involved.

| # | Ratio | Tolerance vs. master |
|---|---|---|
| **M1** | inter-pupillary distance ÷ head width at the cheekbones | **±3%** |
| **M2** | head width at cheekbones ÷ head height, hairline to chin | **±3%** |
| **M3** | eye line to nose base ÷ nose base to chin | **±5%** |
| **M4** | ear top height relative to the eye line, as a fraction of head height | **±5%** |

Horizontals are tighter than verticals because the verticals are *authored* to move — chin raised at HIGH, lowered at LOW — while nothing in the band or stage modifiers is permitted to change the width of a skull. **M1 or M2 out of band means the derivation failed and the image is discarded, not adjusted.** M3 or M4 out of band means check the head tilt first.

On a 1536 px master the head is roughly 600 px wide, so 3% is 18 px — comfortably measurable by hand. An automated landmark pass is welcome as a pre-filter and is not the gate; landmarkers are unreliable on painted faces in half shadow, which is precisely Band LOW.

## 3.4 The nine prompts

Assembly for all nine, exactly:

```
[SUBJECT LINE below]
+ char-washington.txt          (§2.1, verbatim, unedited)
+ the STAGE block              (§2.3, verbatim)
+ the BAND block               (§2.4, verbatim)
+ char-style-block.txt         (§1.1)
+ FRAMING-PORTRAIT             (§1.2)
+ style-block.txt              (shared, unchanged)
+ char-negative.txt            (§1.4)
```

The lock, stage and band blocks are **not reprinted under each prompt below, and that is deliberate**: printing them nine times invites nine small improvements, which is exactly the failure this whole document exists to prevent. What varies is the subject line, the seed, and the derivation. Everything else is a file.

Aspect **3:4** for all nine. Generate 1024×1536 · master 1536×2048 · ship 768×1024 WebP q82.

---

### W1 · Stage I / LOW — `gl_xx_pt_washington_st1_band-lo_v01`
`seed 20110` · derived from master via NBP multi-ref + 0.24 re-seat

```
SUBJECT: A portrait study of General George Washington in the first year of the
war, made quickly and not on a good day.
```

**What the student reads off it.** The powder is coming apart at the temples and there is reddish-brown showing where there should be white; the stock is crooked and the throat of the coat is open; he is turned away and the light is behind him so half the face is in shadow. **Dominant channel: the powder and the sash together.** The sash is flat but the man under it is not tidy.

> *He is not sure they chose right.*

---

### W2 · Stage I / MID — `gl_xx_pt_washington_st1_band-mid_v01`
`seed 20120` · derived

```
SUBJECT: A plain, correct portrait study of General George Washington in the
first year of the war.
```

**What the student reads.** Nothing to remark on, and that is the reading. Squared to the viewer, level, evenly lit, correctly dressed. This is the baseline against which the other eight are legible, and it should be the least interesting image in the set.

> *A competent Virginia gentleman doing a job.*

---

### W3 · Stage I / HIGH — `gl_xx_pt_washington_st1_band-hi_v01`
`seed 20130` · derived

```
SUBJECT: A portrait study of General George Washington in the first year of the
war, sat for deliberately and at leisure.
```

**What the student reads.** Powder even to the hairline, frill crisp, the sash flat and unwrinkled across the breast, the chin fractionally up, warm light from the front left. Every one of the four channels is saying the same thing at once, which is what HIGH means.

> *He believes he can do this.*

---

### W4 · Stage II / LOW — `gl_xx_pt_washington_st2_band-lo_v01`
`seed 20210` · derived

```
SUBJECT: A portrait study of General George Washington at Valley Forge, wearing
a heavy dark drab wool cloak over his coat indoors.
```

**What the student reads.** **The powder is gone.** Not thin — gone. The hair is its own sandy reddish-brown, tied but not dressed, and it is the first time in the game the student sees the colour of his actual hair. There is a hollow beneath the cheekbone, a shadow under the eye, the collar is frayed and the stock is loose, and he is wearing a cloak indoors. **Dominant channel: powder, alone and unmistakable.** This is the single clearest signal in the entire nine and it is the one to look at when checking whether the matrix works.

> *He has stopped keeping up appearances.*

---

### W5 · Stage II / MID — `gl_xx_pt_washington_st2_band-mid_v01` — **THE CANONICAL MASTER**
`seed 20000` · **generated first, freely, and signed off before any other Washington image exists**

```
SUBJECT: A portrait study of General George Washington at Valley Forge, made
from life in a cold room, by a painter with an hour.
```

**What the student reads.** Powder present but thin and unevenly applied — done, but done quickly. Cuffs worn and clean. The fatigue is visible and it is contained. Upright. Flat cool light.

> *He is enduring it.*

**Production note.** This image is the project's second-most-important asset after the Act 1 Scene 1 plate. Budget three times the iteration you would give anything else (`ai-art-production-guide.md` §3.5) and do not start the other eight until the Art Lead has signed it in the ledger with `hist_check.verdict: pass`.

---

### W6 · Stage II / HIGH — `gl_xx_pt_washington_st2_band-hi_v01`
`seed 20230` · derived

```
SUBJECT: A portrait study of General George Washington at Valley Forge, in worn
cloth kept in immaculate condition — mended, not shabby.
```

**What the student reads.** Fully powdered: the one thing he has not let go. The cloth is old and the mending is visible and it is *neat*. The face has hardened rather than sagged — jaw set, spine straight. One warm key from the left, and it is the only warmth anywhere in Act 5.

> *This is costing him and he is paying it.*

---

### W7 · Stage III / LOW — `gl_xx_pt_washington_st3_band-lo_v01`
`seed 20310` · derived

```
SUBJECT: A portrait study of General George Washington in the last years of the
war, with tarnished epaulettes and a coat cuff rubbed through at the edge.
```

**What the student reads.** Grey through the temples and no powder over it — the powder has simply stopped. **The epaulettes are tarnished**, dull where they should be bright, and the cuff has gone through at the edge. Deep lines nose to mouth, mouth set hard, the head carried slightly forward as if braced against something. **Dominant channel: the epaulettes.**

> *He survived it and it took something.*

---

### W8 · Stage III / MID — `gl_xx_pt_washington_st3_band-mid_v01`
`seed 20320` · derived

```
SUBJECT: A portrait study of General George Washington in the last years of the
war, in a uniform that is well kept and old.
```

**What the student reads.** Grey at the temples with powder laid lightly over it. Epaulettes bright. Coat well kept and plainly old. Steady, level, unremarkable — the posture of a man waiting.

> *He got here.*

---

### W9 · Stage III / HIGH — `gl_xx_pt_washington_st3_band-hi_v01`
`seed 20330` · derived

```
SUBJECT: A portrait study of General George Washington at the close of the war,
the whole uniform immaculate and clearly cared for, the grey at the temples
shown rather than hidden.
```

**What the student reads.** Epaulettes bright, linen new, everything looked after. The grey is powdered *evenly*, so the powder does not conceal it — it is displayed. The face is calm and **the eyes are the only tired part of him.** Even, slightly warm frontal light: the light of the Annapolis chamber.

> *He is going to give it back, and he already knows it.*

---

## 3.5 What makes the nine readable, and the check that proves it

**One dominant channel per stage.** Stage I is read on the **sash and powder together**; Stage II on the **powder alone**; Stage III on the **epaulettes**. A student is never asked to compare four things at once — they notice one thing has changed and the other three confirm it. That structure is why the matrix is legible after two class periods without a single word of explanation.

**The comparison test.** Print W1, W5 and W9 in a row and show them to someone who has not read this document. Three questions, thirty seconds:

1. Is this the same man? *(If no, the matrix has failed and nothing else in this section matters.)*
2. Which one is earliest?
3. In which one is he doing worst?

Three correct answers or the derivation chain is re-run. Question 2 is the one that most often fails, and when it does the cause is almost always that Stage I's coat was not painted new enough.

## 3.6 The Act 1 problem, and the three extra files that fix it

`02` §6.3 assigns the light blue ribband to Stage I, which spans Acts 1–4. **But the ribband was ordered in General Orders of 14 July 1775, and Act 1 is 4 May 1775.** On the day the game opens, Washington is not a general, there is no Continental Army, and the sash does not exist. Shipping a sash in Act 1 is a real, catchable anachronism in the game's most-viewed asset, and a history teacher will find it in the first ten minutes.

**ERRATUM E-C2, against `02` §6.2 and §6.3.** Stage I ships **six** files, not three: three without the ribband for Act 1, three with it for Acts 2–4.

Cost: **zero generations.** The three no-sash files are produced by masked inpaint off the three signed Stage I portraits — mask the diagonal band across the breast only, face and hair excluded, denoise 0.45, 15 minutes total for all three. Payload +0.16 MB.

```
gl_xx_pt_washington_st1_band-lo_sash0_v01.webp     Act 1 only
gl_xx_pt_washington_st1_band-mid_sash0_v01.webp
gl_xx_pt_washington_st1_band-hi_sash0_v01.webp
```

The epaulettes stay in all six. `hist-ref` §2.3 lists two gold epaulettes as part of the locked uniform without an act restriction, and the pack's own decisions are not overridden by this document. Logged as **V-C1** in §9.

**The free dividend.** Because Act 1's portrait has no rank device of any kind and Act 2's does, the *first thing that changes about Washington's face in this game is that he acquires a sash* — which happens between the sealed decision at the dock and the camp street at Cambridge, and which is exactly the transition Act 1's sealed decision is about. That is a consequence signal the design did not know it had, and it cost fifteen minutes.

## 3.7 The Newburgh spectacles — three more files, still zero generations

`02` §6.3 rule 3: the spectacles belong to all three bands. They are the act, not a stat outcome. Act 7's climactic beat needs Washington's portrait to be wearing them, in every band.

Produced by masked inpaint off the three signed Stage III portraits: mask the bridge of the nose, the orbits and the temples, denoise 0.40. **Not a DOM overlay** — the lens distorts what is behind it, and a pasted PNG of spectacles floating over an unaltered eye is the single most obvious composite artefact available.

```
SUBJECT (inpaint, masked to the eye region only):
small oval reading spectacles with fine steel wire frames and straight temple
arms that run back to the temples rather than curling behind the ear, the plain
glass lenses catching one flat highlight and the eyes visible and slightly
altered behind them.
```

Straight temple arms matter: curved wrap-around earpieces are a nineteenth-century development, and the negative block's `eyeglasses with wire frames` token in the inherited world negative must be *omitted from this one masked pass only* — which is legal, because a masked inpaint carries its own negative and is not a fresh generation. This is the single exception in the project and it is written down here so it does not become a precedent.

```
gl_xx_pt_washington_st3_band-lo_spec_v01.webp
gl_xx_pt_washington_st3_band-mid_spec_v01.webp
gl_xx_pt_washington_st3_band-hi_spec_v01.webp
```

**And the rhyme worth staging.** Horatio Gates presides over the meeting in the New Building wearing his own spectacles (V-C5, `[CONV]`, §9). If that verifies, Gates's portrait wears them from Act 2 onward and Washington's from Act 7 — and the room in which Washington takes his out to read is a room where the man across from him has been wearing his for eight years. The game says nothing. It does not have to.

## 3.8 The tenth Washington — the Gilt Frame myth face

`gl_xx_gf_washington-myth_v01` · R6 · aspect 3:4 · ship 768×1024 WebP q82 · **1 generation**

Shown once, in the epilogue, beside the student's own Stage III portrait, side by side, with no text, always (`07` §5.4 item 8).

**The decision.** `02` §9 bans Gilbert Stuart's 1796 Athenaeum portrait outright — *for in-game Washington*. The Gilt Frame is not in-game Washington. It is how he will be remembered, and the Athenaeum face **is** how he is remembered: it is on the money in the student's pocket. So the tenth Washington is deliberately that face — a sixty-four-year-old man with a collapsed lower jaw and a cloud of white hair, painted thirteen years after the last scene the student played, set beside the fifty-one-year-old they have just spent four class periods inside.

Everything the ban protects is protected precisely by putting it here, once, quarantined, in a gilt frame, at the end. It converts the project's most contaminating reference into its last teaching object.

**No caption.** `07` §5.4 requires the last image to carry no text, which appears to conflict with Gilt Frame grammar rule 3 (`02` §1.2). It does not: rule 3 binds **the eight plates**, and there is no ninth. This is a Gilt-Frame-*register* portrait, not a Gilt Frame plate. By the epilogue the student has read eight captions and been taught the grammar, and the recognition — *that is the one on the dollar* — is the caption.

```
SUBJECT: A commemorative portrait of George Washington as an old man, painted
long after the events, in the manner of a national icon rather than a record. He
is aged sixty-four, heavy through the lower face, the mouth drawn in and the
chin foreshortened, the hair a soft white cloud with no visible hairline, the
skin smooth and even, the expression remote and unreadable. A dark neutral
painted ground fills the whole picture behind him with no bare paper anywhere.

RENDERING (R6 — supersedes char-style-block.txt entirely for this one asset):
opaque paint edge to edge with no visible drawn line of any kind and no paper
showing through at any point. Theatrical single-source chiaroscuro; the darks
go deeper than anywhere else in the project. Soft blended transitions, no hard
wash edges, no chain lines, no granulation. It does not look drawn. It looks
painted, expensive and finished.

REFS: Gilbert Stuart, Athenaeum portrait, 1796 (public domain) — passed as an
image reference. Do NOT name the artist in the prompt text; the reference does
the work and the house discipline on artist names holds (hist-ref §7.4).

NEGATIVE: bare paper, visible paper grain, chain lines, ink line, pen line,
crosshatching, watercolour, wash, sketch, unfinished, deckle, [+ char-negative.txt
minus its tokens for `elderly jowls, projecting lower lip, sunken mouth,
collapsed lower face, dollar bill, banknote engraving`]
```

That negative subtraction is the second and last of the two exceptions in this document, and it exists because the asset's entire purpose is to *be* the thing the rest of the project bans. Ledger it with `register: R6` and `supersedes_negative: true` so it can never be confused with a production portrait.

Darkest value clamps to `GILT-FRAME-FLOOR #16110D` (`02` Appendix B), the only value in the game below the ink floor. The gilt border is a separate sprite composited in post, not generated.

---

# 4. THE NPC PORTRAIT ROSTER

## 4.0 The roster, the budget, and the reallocation that pays for it

`02` §6.2 budgets 22 subjects and 78 portrait states from ~22 generations. The act inventory names **34 speaking characters** plus several who appear only in the letterbook's *Persons* ribbon. Twenty-two subjects does not cover the cast, and a Persons entry with an empty portrait tip-in looks like a bug.

**This document ships 37 subjects and 99 portrait files for exactly the same number of generations**, by making one change to the method.

> **Expression variants are produced by masked img2img off the signed master, not by 4-up expression sheets.**

`ai-art-production-guide.md` §2.5 and §3.4 recommend the 4-up sheet, and the reason it recommends it is sound: one image guarantees identical palette and lighting across all four states. But palette is *already* guaranteed when all four derive from one master, and the thing that actually breaks in a 4-up sheet is the thing the sheet cannot promise — **identity between cells.** Four heads generated side by side are four samples; they drift, and at the sizes we ship (288×384 in the portrait well) a 4% drift in eye spacing is visible as a different person.

A masked pass freezes the skull contour, the hairline, the ear, the neck stock, the coat and the ground **byte-identically**, and moves only the brow, the eyes, the mouth and the jaw. It is strictly better on the axis that matters and it costs a 40-second pass instead of a generation.

**Mask spec for all expression variants:** brow ridge, both orbits, nose base to chin, and the jaw line to the ear lobe. 12 px feather. Denoise **0.38** inside the mask, 0.0 outside. Anything above 0.45 starts moving the skull and is rejected on M1/M2 (§3.3).

| | `02` §6.2 budget | This document | Δ |
|---|---|---|---|
| Portrait subjects | 22 | **37** | +15 |
| Portrait files shipped | 78 | **99** | +21 |
| Portrait payload | 4.4 MB | **5.4 MB** | +1.0 MB |
| **Generations** | **33** | **33** | **0** |
| Masked passes (no generation) | 0 | 47 | +47 |

Generation arithmetic, both columns to the same scope: `02` allocates 9 Washington matrix + 1 Gilt Frame + 10 NPC masters + 12 expression sheets + 1 Council emblem sheet = **33**. This document spends 9 Washington matrix + 1 Gilt Frame + 18 NPC master sheets + 3 age-pair second ages + 1 Council emblem sheet + 1 attribute-well sheet = **33**. The twelve expression-sheet generations pay for eight extra master sheets, the three second ages, and the attribute-well sheet, with nothing left over and nothing borrowed.

**Mandatory reference images on every NPC generation.** Never trust a prompt to specify a uniform (`ai-art-production-guide.md` §5.4).

| Ref | Passed on |
|---|---|
| `ref_deverger_four-soldiers.png` | **every** Continental figure in the game, without exception |
| `ref_costume_continental_regular.png` | Continental officers and regulars, Acts 5–8 |
| `ref_costume_continental_militia.png` | militia, Acts 2–4 |
| `ref_costume_british_regular.png` | O'Hara, British crowd sheets |
| `ref_costume_hessian.png` | Rall, Trenton crowd sheet |
| `ref_costume_french_regular.png` | Rochambeau, Duportail, French crowd sheet |

## 4.1 The three tiers

| Tier | States | Produced how | Who |
|---|---|---|---|
| **A** | 4 — neutral / speaking / angry / downcast | master + 3 masked passes | carries a decision or a scene's emotional turn |
| **B** | 2 — neutral / speaking | master + 1 masked pass | real dialogue in one register |
| **C** | 1 — neutral | master only | single-scene figures and *Persons*-ribbon faces |

Three subjects use their four Tier A states differently: **two ages × two expressions.** These are the **age pairs**, and they are chosen deliberately.

> **Four people visibly age across this game, and they are a private soldier, an enslaved man, a politician, and the commander.** Joseph Plumb Martin is fifteen at Cambridge and twenty-two at Newburgh. Billy Lee walks beside the horse in 1775 and cannot ride by 1783. Thomas Mifflin is a thirty-two-year-old quartermaster at Brooklyn and the thirty-nine-year-old President of Congress who takes the commission back. Washington ages through three stages. Four social positions, one war, and the student can see it happen on four faces. This is the highest-value use of four expression slots available anywhere in the roster.

An age pair's second age is a **generation**, not a mask — hair, weight and line structure all move — derived from the first age by NBP multi-ref exactly as the Washington matrix is, and re-seated at 0.24.

## 4.2 The Witness Register portrait — R3 ∩ R5, defined

Five subjects are drawn in the Witness Register: **Billy Lee, Frank Lee, Doll, Harry**, and Billy Lee's 1783 second age. `historical-visual-reference.md` §7.2 specifies R5 for scenes; this section specifies what it means for a portrait, because §7.2's five parameters are written for a diorama and two of them (camera height, ambient motion) do not obviously translate.

**R3 owns the framing. R5 owns the wash, the light and the gaze.**

| Parameter | R3 portrait | **R3 ∩ R5 Witness portrait** |
|---|---|---|
| Crop | chest-up at the second coat button | chest-up **at the collarbone** — closer |
| Turn | three-quarter, sitter's left shoulder forward | **square to the viewer, facing out** |
| Gaze | level, at the viewer or past them | **directly at the viewer** |
| Implied camera | conventional portrait height, fractionally above the eye | **exactly level with the sitter's eyes** |
| Wash | four values, chromatic earth palette | **a single grey wash in three values.** No chroma anywhere |
| Colour | earth palette, meaning colours where they belong | **exactly one object carries colour, and the sitter owns it** |
| Light | one source, act light law | **clear, even, unflattering north light.** No warmth, no haze, no golden fall |
| Bare paper | 20–35% | 30–45% |

**The frontal gaze is the register, and it is visible in one glance.** Every other portrait in the game is a three-quarter turn — the Peale convention, and the convention of a picture made *about* someone. These five look straight out. It is the difference between a topographical view and a portrait, which is a distinction the eighteenth century itself understood, and it means the register change is diegetically motivated rather than decorative. The student will not have vocabulary for it in Act 1. They will have it by Act 8.

**The rule that resolves every edge case: R5 follows the person, not the scene.** Billy Lee's portrait is R5 in all eight acts, including at Yorktown, including in the marquee, including in the room at Newburgh. He does not stop being an enslaved man because the scene around him is chromatic. This also resolves `VF-04`, which `05` correctly describes as *"R1 with the Witness Register's restraint"* — that is a scene-level restraint on a chromatic plate, and it is a different thing.

**And the boundary, stated plainly because it will otherwise be got wrong: R5 is about the condition of enslavement, not about race.** The soldier of the 1st Rhode Island is a free man in the uniform of the Continental line and he is drawn in **R3, in full colour, exactly like Knox.** Drawing a Black soldier in the register reserved for enslaved people because he is Black would be a category error and a bad one. The de Verger sheet is the reference precisely because it shows four American soldiers, one of them Black, all drawn the same way by the same hand on the same afternoon.

**The one colour.** Each of the four Mount Vernon subjects carries exactly one coloured object, and each is chosen from a documented category with the specific instance authored and logged:

| Subject | The one colour | Category source |
|---|---|---|
| **Billy Lee** | a blue-and-white checked linen neckcloth | checked blue-and-white linen is documented shirt cloth, `hist-ref` §1.2 **[DOC]** |
| **Frank Lee** | one brass coat button at the throat that does not match the others | household dress, better cloth than field allotment |
| **Doll** | an indigo-dyed head wrap | *"walnut and indigo where people dyed their own,"* `hist-ref` §1.14 **[DOC]** |
| **Harry** | a blue glass bead on a cord at the throat | the pack's own named example, `hist-ref` §7.2 **[DOC]**; blue glass beads are a recurring Chesapeake quarter-site find |

`sensitive: true` in the ledger, and **no R5 asset ships without written sign-off from someone who has read Mount Vernon's own interpretive guidance** (`hist-ref` §7.6). The person who prompted it may not approve it. Budget two weeks of calendar for the gate, not two hours (`05` §13.2).

## 4.3 The eighteen master sheets

Portraits are generated **two to a sheet**, paired by shared scene wherever possible, so their palette, paper tone, ink weight and light match by construction (`ai-art-production-guide.md` §2.5). Two and not three: a 2-up at 2048×1536 gives each cell exactly 1024×1536, which is the locked portrait generation size; a 3-up would either shrink the cells below spec or push the canvas to 3072 px, which is off-distribution for klein-4B and produces mush.

**Sheet prompt shell** — identical for all eighteen:

```
wshwash, a sheet of two portrait studies side by side on one piece of plain
cream laid paper, at identical scale and under identical light, each a chest-up
study with clear empty space around it and no overlap between them.
LEFT: [SUBJECT A]
RIGHT: [SUBJECT B]
[char-style-block.txt] [FRAMING-PORTRAIT] [style-block.txt] [char-negative.txt]
```
`2048 × 1536` · seed `21000 + sheet_index` · cut into two 1024×1536 cells in post, each then upscaled 1.5× and returned to 768×1024 per the standard chain.

| # | Sheet | A | B | Notes |
|---|---|---|---|---|
| 1 | `a01_sheet1` | Martha Washington | Lund Washington | |
| 2 | `a01_sheet2` | Frank Lee | Doll | **R5, sensitive** — uses `FRAMING-WITNESS` |
| 3 | `a01_sheet3` | Harry | William (Billy) Lee, 1775 | **R5, sensitive** |
| 4 | `a02_sheet1` | Henry Knox | Nathanael Greene | |
| 5 | `a02_sheet2` | Horatio Gates | Benjamin Harrison | |
| 6 | `a02_sheet3` | Sarah Osborn | Joseph Plumb Martin, 1776 | |
| 7 | `a03_sheet1` | John Sullivan | Lord Stirling | |
| 8 | `a03_sheet2` | Israel Putnam | John Glover | |
| 9 | `a03_sheet3` | Thomas Mifflin, 1776 | Alexander Hamilton | |
| 10 | `a03_sheet4` | Nathan Hale | Benedict Arnold | both *Persons*-ribbon only |
| 11 | `a04_sheet1` | Johann Rall | Robert Morris | |
| 12 | `a05_sheet1` | Baron von Steuben | Thomas Conway | |
| 13 | `a05_sheet2` | Albigence Waldo | Francis Dana | |
| 14 | `a05_sheet3` | a soldier of the 1st Rhode Island | Benjamin Tallmadge | **sensitive**, R3 chromatic |
| 15 | `a06_sheet1` | Marquis de Lafayette | Comte de Rochambeau | |
| 16 | `a06_sheet2` | Louis Duportail | Benjamin Lincoln | |
| 17 | `a06_sheet3` | Charles O'Hara | James McHenry | |
| 18 | `a07_sheet1` | Alexander McDougall | John Armstrong Jr. | |

Sheets 2 and 3 are generated with `FRAMING-WITNESS` and the R5 wash override (§4.2), and are the only two sheets in the set that are not chromatic.

## 4.4 The subject lines — all 36, plus 3 second ages

Aspect for every one: **3:4** in its cell. Negative: `char-negative.txt`. Register R3 unless marked.

### Sheet 1 — Mount Vernon, May 1775

**MARTHA WASHINGTON** — Tier A (4 states) · `gl_xx_pt_martha_*`
```
SUBJECT: Martha Washington, aged forty-three, a small, round-faced,
plainly-handsome Virginia gentlewoman with brown hair and hazel eyes, a
short-necked and comfortably built woman who has been rich her whole adult life
and dresses like it only in the quality of the cloth. She wears a plain gown of
good brown silk with elbow-length sleeves and fine white ruffles at the elbow, a
white linen neckerchief crossed at the breast and pinned high at the throat, and
a white linen cap with a ruffled edge covering her hair completely and tied
under the chin. Her hair is dressed back beneath the cap and none of it is
loose. Her expression is direct, intelligent and entirely unsentimental.
```
*Silhouette note:* the cap. She is the only capped adult in Act 1's interiors and it reads at any size.
*Expression states:* neutral · speaking · **angry** (the mouth compressed, the brow level and low — Martha's anger is cold, never loud) · **downcast** (the eyes lowered, the head unmoved; she does not slump).

**LUND WASHINGTON** — Tier B (2 states) · `gl_xx_pt_lund_*`
```
SUBJECT: Lund Washington, aged thirty-eight, estate manager and cousin, a lean,
weathered, sandy-haired Virginia planter's son in working dress: a plain
russet-brown broadcloth coat with no lace and horn buttons, a drab waistcoat, a
plain linen stock, and his own unpowdered hair tied at the nape with a black
ribbon. Sunburn to the line of his collar and pale above it. A careful, patient,
slightly evasive face — a man who is used to writing letters explaining why
something has not been finished.
```
*Note:* the brief's Act 1 cast lists *"an overseer."* In production **there is no separate overseer character** — Lund is the estate's authority and carries that function (`05` §1.3). Do not generate an overseer.

### Sheet 2 — the Quarter, R5 Witness Register, `sensitive: true`

Both of these use `FRAMING-WITNESS`, the R5 wash override, and the sign-off gate. Read `hist-ref` §7.3's six rules before generating: no labour-as-scenery, no shackles or violence, no smiling or contented-servant imagery, faces individuated and frontal, interiors as carefully furnished as the mansion's, and the House for Families rather than "slave cabins."

**FRANK LEE** — Tier B (2 states) · `gl_xx_pt_frank-lee_r5_*`
```
SUBJECT: Frank Lee, aged about thirty, household butler at Mount Vernon,
purchased with his brother from the Mary Lee estate in 1768. A composed,
watchful Black man with a lean face and steady eyes, looking directly out of the
picture at the viewer's own eye level. He is dressed for work that is meant to
be seen: a well-cut plain dark coat of decent cloth, a clean white linen
neckcloth wound and tied at the throat, a waistcoat buttoned high. His clothes
fit him, are clean, and are in good repair. His expression is neither
deferential nor defiant; he is a man doing skilled work in a house where he is
owned, and the picture does not resolve that for you.
WASH (R5): a single grey wash in three values only. No colour anywhere on the
figure or the ground except one brass button at the throat which does not match
the others. Clear, even, unflattering north light. No haze, no warmth, no golden
light, no atmosphere.
NEGATIVE (adds): caricature, exaggerated features, minstrel, contented servant,
smiling, singing, deference, bowing, golden hour, warm light, picturesque,
ragged comic clothing, red silk turban, oriental turban, seen from behind,
faceless, silhouette, background labourer, unfocused, blurred face
```

**DOLL** — Tier B (2 states) · `gl_xx_pt_doll_r5_*`
```
SUBJECT: Doll, a woman in her forties, cook at the Mansion House at Mount Vernon
since 1759, looking directly out of the picture at the viewer's own eye level. A
broad, strong, level face with fine lines at the eyes and mouth. She wears the
clothing of her allotment, worn but clean and carefully kept: a shift of coarse
undyed brownish linen, a short gown — a hip-length fitted jacket — over a
petticoat, a plain linen neckerchief filling the neckline to the throat, and a
head wrap covering her hair completely. Her expression is patient, appraising,
and entirely present; she is looking at you as carefully as you are looking at
her.
WASH (R5): a single grey wash in three values only. No colour anywhere on the
figure or the ground except the head wrap, which is dyed a deep indigo blue.
Clear, even, unflattering north light. No haze, no warmth, no atmosphere.
NEGATIVE (adds): [as Frank Lee, plus] bandana, kerchief tied at the back like a
1940s worker, mammy, apron, cooking, holding food, kitchen
```

### Sheet 3 — the Quarter and the valet, R5, `sensitive: true`

**HARRY** — Tier B (2 states) · `gl_xx_pt_harry_r5_*`
```
SUBJECT: Harry, a man in his thirties, stable hand at Mount Vernon, purchased in
1763, who worked the Dismal Swamp Company survey. Looking directly out of the
picture at the viewer's own eye level. A spare, wiry, deeply weathered face and
a steady, entirely unreadable expression. He wears the clothing of his
allotment, worn hard and mended by someone who took trouble over it: an osnaburg
shirt of coarse undyed brown-grey linen open at the throat, a plain waistcoat
over it, no coat. A cord at his neck.
WASH (R5): a single grey wash in three values only. No colour anywhere on the
figure or the ground except a single small blue glass bead threaded on the cord
at his throat. Clear, even, unflattering north light. No haze, no warmth, no
atmosphere.
NEGATIVE (adds): [as Frank Lee]
```
> **The most important art-direction note in this document.** `05` §1.3 marks Harry as the most important NPC in the game and says the player will not know it until the epilogue. **Do not paint him as though he knows either.** No significant look, no gaze toward the horizon, no foreshadowing of any kind. He is a stable hand at the end of a working day in May 1775, looking at the man who owns him, and the picture must be legible as nothing more than that on first viewing and as something else entirely on the second. Any attempt to signal the epilogue in this face destroys the epilogue.

**WILLIAM (BILLY) LEE, 1775** — Tier A (4 states = 2 ages × 2 expressions) · `gl_xx_pt_billy-lee_y1775_r5_*`
```
SUBJECT: William Lee, called Billy, aged about twenty-five, Washington's
enslaved valet, who will follow him to every encampment and every battle for
eight years. Looking directly out of the picture at the viewer's own eye level.
A young man of mixed ancestry with a fine-boned, alert, notably self-possessed
face; short hair, clean-shaven. He is dressed as a gentleman's body servant and
horseman in practical riding kit: a plain dark coat cut short for the saddle, a
buttoned waistcoat, and a neckcloth wound high at the throat. His clothes are
good and they fit. He looks like the most competent person in any room he is in,
which by every surviving account he generally was.
WASH (R5): a single grey wash in three values only. No colour anywhere on the
figure or the ground except the neckcloth, which is blue-and-white checked
linen. Clear, even, unflattering north light. No haze, no warmth, no atmosphere.
NEGATIVE (adds): [as Frank Lee, and emphatically] red turban, silk turban,
oriental turban, head wrap of any kind, livery, gold braid, sash, exotic dress
```
> **The turban.** John Trumbull's 1780 double portrait shows Lee in a red turban. Neither man sat for it, it was painted in London, and the turban is a European Orientalist convention for Black figures — evidence about the painter, not about the man (`hist-ref` §1.13 **[DOC]**). **Do not reproduce it.** It is in the negative twice, in two phrasings, because it is the single most likely thing the model will produce for this subject.

**WILLIAM (BILLY) LEE, 1783** — second age, 1 generation, NBP multi-ref off the 1775 master · `gl_xx_pt_billy-lee_y1783_r5_*`
```
SUBJECT: The same man, William Lee, eight years later, aged about thirty-three,
at the New Windsor cantonment in the last winter of the war. The face is harder
and thinner and the eyes are tired; there is grey coming at the temple. He is
dressed the same way and the clothes are older. He is sitting rather than
standing, and the picture is made level with him sitting, so the eye line is
still exactly the viewer's — because by 1783 both his knees are damaged and he
does not stand for long.
```
> `05` §7.3: *"Billy Lee, who by now cannot ride and is in the room because he lives there."* The 1783 portrait is the game's quietest reckoning line and it is delivered entirely by the fact that the camera came down to meet him again. **Documented, unremarked, and never mentioned in dialogue.**

### Sheets 4–6 — Cambridge, 1775–76

**HENRY KNOX** — Tier A · `gl_xx_pt_knox_*`
```
SUBJECT: Henry Knox, aged twenty-five, a Boston bookseller now colonel of
artillery. A very large man, tall and heavily built, with a broad open
high-coloured face, a round chin, dark brown hair clubbed and lightly powdered,
and an expression of irrepressible, slightly exhausting energy. He wears a plain
dark blue regimental coat with no lace and no artillery facings yet, a buff
waistcoat, and a plain linen stock. His neckcloth is always slightly wrong. He
looks like a man who has read every book about artillery and fired a gun four
times.
```
*Silhouette note:* bulk. Knox is the widest figure in the game and that is the whole tell.
*States:* neutral · speaking · **angry** (florid, loud, and over in ten seconds) · **downcast** (Act 6, after the guns have done what they were for).
*Re-coat pass:* Knox appears again in Act 6 in the 1779 regulation artillery uniform. **One masked inpaint, coat only, face frozen:** `a dark blue regimental coat with scarlet collar, cuffs and lapels, scarlet lining, yellow brass buttons and narrow yellow worsted lace edging the coat and looping the buttonholes.` `gl_xx_pt_knox_x-neu_a06_v01`. **Do not regenerate him at Yorktown.**

**NATHANAEL GREENE** — Tier A · `gl_xx_pt_greene_*`
```
SUBJECT: Nathanael Greene, aged thirty-three, a Rhode Island forge-owner and
disowned Quaker, now a general. A square, plain, strong-jawed face with a broad
forehead, dark hair tied back and unpowdered, and a small pale scar-mark near
the right eye left by a smallpox inoculation. He wears a plain dark blue
regimental coat, correct and unornamented, and a plain stock. He is asthmatic
and it shows very slightly at the mouth. His expression is analytical and a
little impatient — the best organiser in the army, aware of it, and trying not
to be.
```
*Re-coat pass:* Act 3's Greene wears the same coat; no second state needed.

**HORATIO GATES** — Tier A · `gl_xx_pt_gates_*`
```
SUBJECT: Horatio Gates, aged forty-eight, English-born, a former British regular
officer now the Continental Army's adjutant general. A thin, stooped man with a
long face, a pointed chin, thin greying hair drawn back and lightly powdered,
and small oval spectacles with fine steel wire frames and straight temple arms.
He wears a plain dark blue regimental coat and a correct stock. He is precise,
courteous, mildly weary and very slightly condescending, and the troops call him
Granny Gates for exactly the reasons that are visible in his face.
```
*States:* neutral · speaking · **angry** (Act 7 — thin-lipped, formal, dangerous) · **downcast** (Act 5, by letter — used for his *Persons* entry after Saratoga is claimed).
*Spectacles:* `[CONV]`, V-C5. If unverified at art lock, drop them and Washington's Act 7 rhyme with them.

**BENJAMIN HARRISON** — Tier C · `gl_xx_pt_harrison_x-neu`
```
SUBJECT: Benjamin Harrison of Virginia, aged forty-nine, a very large, heavy,
genial Tidewater planter and delegate to the Continental Congress. A broad
red-cheeked face, a full jaw, small shrewd amused eyes, his own hair powdered
and clubbed. He wears fine civilian dress: a plum-coloured broadcloth coat with
covered buttons, a long embroidered-edge waistcoat, and a full white linen stock
and frill. He looks like the wealthiest man in any room and like he finds most
of the room funny.
```
*This is the brief's "visiting Congress delegate" for Act 2.*

**SARAH OSBORN** — Tier B · `gl_xx_pt_osborn_*`
```
SUBJECT: Sarah Osborn, a woman of about thirty, a laundress with the army
drawing one ration a day. A weathered, wind-reddened, wholly unsentimental face
with pale eyes and a set mouth. She wears her own clothes worn hard: a short
gown — a hip-length fitted jacket of checked linen — over a striped linsey
petticoat, worn over stays that carry the torso in a smooth flattened cone, a
plain linen neckerchief filling the neckline to the throat, and a white linen
cap covering her hair completely. Nothing about her is picturesque and nothing
about her is pitiable.
NEGATIVE (adds): corset, front lacing, bare shoulders, ball gown, bare head,
loose hair, romantic, waif
```

**JOSEPH PLUMB MARTIN, 1776** — Tier A (2 ages × 2 expressions) · `gl_xx_pt_jpmartin_y1776_*`
```
SUBJECT: Joseph Plumb Martin, aged fifteen, a private of the Connecticut line. A
boy: a thin, unfinished, hollow-cheeked face, no whiskers at all, a long neck and
a shirt collar too big for it, straight brown hair tied back badly. He wears a
civilian coat that belonged to a bigger man, a waistcoat worn as an outer
garment, and an unbleached linen shirt gathered at the neck. He is looking at the
viewer with an expression of exhausted, slightly insolent alertness. He is
fifteen and he already knows more about the war than most of the officers.
```

**JOSEPH PLUMB MARTIN, 1783** — second age, 1 generation, NBP multi-ref
```
SUBJECT: The same man, Joseph Plumb Martin, seven years later, aged twenty-two,
at the New Windsor cantonment, about to be furloughed without pay and knowing it.
The face has filled out and hardened and the boy is gone from it; there is a
permanent weathering across the nose and cheekbones and a line between the brows.
He wears the 1779 regulation blue coat faced white, well worn, mended at the
elbow. The alertness is still there. The insolence has become something quieter
and much less forgiving.
```
> Put these two side by side in the *Persons* ribbon and a fifteen-year-old student is looking at eight years happening to somebody their own age. It is the second-best consequence channel in the game after Washington's own ladder, it is entirely free of stats, and it happens to every player identically — which is exactly why it works.

### Sheets 7–10 — Brooklyn, August 1776

**JOHN SULLIVAN** — Tier C · `gl_xx_pt_sullivan_x-neu`
```
SUBJECT: John Sullivan, aged thirty-six, a New Hampshire lawyer now a major
general, captured on 27 August. A dark, vigorous, rather handsome square face
with heavy black brows, dark hair tied and unpowdered, and a confident set to the
jaw that the next fortnight will not survive. He wears a plain dark blue
regimental coat, correct, and a clean stock.
```

**LORD STIRLING (WILLIAM ALEXANDER)** — Tier C · `gl_xx_pt_stirling_x-neu`
```
SUBJECT: William Alexander, called Lord Stirling, aged fifty, a wealthy New
Jersey landowner and brigadier general who claims a Scottish earldom and dresses
like it. A florid, full, high-coloured face with a fleshy nose, heavy-lidded
eyes and grey hair very carefully powdered and clubbed. He wears a well-cut blue
regimental coat with buff facings, a fine white linen frill at the breast, and
the best stock in the Continental Army. He looks expensive, brave and slightly
unwell.
```

**ISRAEL PUTNAM** — Tier C · `gl_xx_pt_putnam_x-neu`
```
SUBJECT: Israel Putnam, aged fifty-eight, a Connecticut farmer and old
provincial soldier now a major general. A thickset, weather-beaten, blunt old
man with a wide short neck, a heavy grey stubbled-white eyebrow line, coarse
grey hair unpowdered and tied anyhow, and a broad plain face that has never once
been to Philadelphia. He wears a plain blue coat that does not fit well over a
countryman's frame and a stock tied without ceremony.
```
*Clean-shaven per the standard negative; "stubbled-white eyebrow line" refers to the brows only.*

**JOHN GLOVER** — Tier B · `gl_xx_pt_glover_*`
```
SUBJECT: John Glover, aged forty-four, a Marblehead shipowner now colonel of a
regiment of Massachusetts fishermen and sailors. A short, compact, sandy-red
haired man with a hard weathered seaman's face, pale eyes narrowed from a
lifetime of looking at water, and freckling across the nose. He wears a short
blue seaman's jacket rather than a regimental coat — cut at the hip, not
skirted — a plain waistcoat, and a knotted neckcloth. He does not look like an
officer and he is the reason the army gets off Long Island.
```
*Silhouette note:* the **short jacket** is the tell. Glover is the only figure in the game in a hip-length coat, and it separates him from twenty men in full skirts at any size.

**THOMAS MIFFLIN, 1776** — Tier A (2 ages × 2 expressions) · `gl_xx_pt_mifflin_y1776_*`
```
SUBJECT: Thomas Mifflin, aged thirty-two, a Philadelphia Quaker merchant now
quartermaster general, a famously fluent and persuasive speaker. A sharp,
handsome, quick face with dark alert eyes, a mobile mouth, and dark hair neatly
clubbed and powdered. He wears a well-kept blue regimental coat and a good
stock. His expression is engaged, agreeable and entirely plausible.
```

**THOMAS MIFFLIN, 1783** — second age, 1 generation, NBP multi-ref
```
SUBJECT: The same man, Thomas Mifflin, seven years later, aged thirty-nine,
President of the Continental Congress at Annapolis in December 1783. Heavier in
the face and the jaw, the hair thinner at the temple and fully powdered, the
mouth set into something more careful. He wears fine dark civilian dress with a
white linen frill — no uniform of any kind. The fluency is still there and it
has become a politician's rather than a soldier's.
```
> He is the man Washington hands the commission back to, and the student met him at Brooklyn Heights in a coat. Nothing in the game says so. The *Persons* ribbon puts the two portraits one above the other and lets them do it.

**ALEXANDER HAMILTON** — Tier A · `gl_xx_pt_hamilton_*`
```
SUBJECT: Alexander Hamilton, aged twenty-one, a captain of New York artillery. A
small, slight, very upright young man with a narrow bony face, a long straight
nose, a high forehead, fair freckled skin and reddish-brown hair tied back and
lightly powdered. Deep-set light eyes, violet-blue, with an unsettling
directness. He wears a plain blue artillery coat, correct to the last button and
plainly cared for by a man with no money. He looks twenty-one and he looks like
he is about to interrupt.
```
*Re-coat pass, Act 5/6:* one masked inpaint, coat only — `an aide-de-camp's blue coat with buff facings and a green ribband worn across the breast` — **conditional on V-C6** (`[CONV]`: the 14 July 1775 General Orders assign a green ribband to aides-de-camp; `hist-ref` §1.7 quotes only the light blue and pink clauses). If V-C6 fails, drop the ribband and keep the coat.

**NATHAN HALE** — Tier C · `gl_xx_pt_hale_x-neu` · **special rendering**
```
SUBJECT: Nathan Hale, aged twenty-one, a Connecticut schoolmaster now a captain
of infantry. A tall, fair, athletic young man with light blue eyes, blond hair
tied back, a straight nose and a fresh open face, with a faint powder-burn scar
across one cheek. He wears a plain blue regimental coat and a clean stock.
RENDERING (special, this asset only): the ink line is complete and confident
throughout — the whole head fully drawn — but the face is modelled in ONE wash
value only instead of four, so that the portrait reads as finished in line and
unfinished in paint. The cloth is washed normally. This is the least-modelled
face in the game and it is deliberate.
```
> **There is no authenticated likeness of Nathan Hale.** Every image of him ever made — including the 1890 bronze the student is about to see in the Act 3 Gilt Frame — is conjectural, built from written descriptions. So his portrait is the one face in the game the game admits it does not have: fully drawn, barely painted. His *Persons* entry says so in one sentence, without comment.
>
> The Act 3 Gilt Frame is MacMonnies's bronze — a confident, muscular, entirely invented certainty in metal — arriving forty seconds after the student has looked at a face that is mostly bare paper. **That is the best single art decision available anywhere in the NPC roster and it costs one wash pass.**

**BENEDICT ARNOLD** — Tier C · `gl_xx_pt_arnold_x-neu`
```
SUBJECT: Benedict Arnold, aged thirty-five, in the autumn of 1776, the most
enterprising officer in the Continental service. A powerfully built,
broad-shouldered, dark-complexioned man with black hair, a prominent hooked
nose, a strong chin and light grey eyes of unusual brightness. He wears a plain
blue regimental coat, worn hard on campaign. His expression is direct,
impatient, physically confident and entirely without doubt.
```
> **Paint him as the best officer in the army, because in 1776 that is exactly what he is.** No shadow across the eyes, no sidelong look, no ambiguity, no foreshadowing of any kind. `05` §3.7 plants him as a name on paper who built a fleet out of nothing on Lake Champlain, and Washington's *Persons* entry at the end of Act 3 reads, in substance, *this is the most enterprising officer in the service.* A student who has admired this portrait for four acts and then learns what happened in 1780 has been taught something about treason that a villainous portrait would have destroyed. **This is a sign-off gate: if the face looks shifty, reject it.**

### Sheet 11 — Trenton, December 1776

**COLONEL JOHANN RALL** — Tier B · `gl_xx_pt_rall_*`
```
SUBJECT: Colonel Johann Rall, aged about fifty, commanding a Hessian grenadier
regiment, a professional soldier of thirty-six years' service. A florid,
thick-necked, heavy-featured man with pale eyes, close-cropped greying hair
under a queue, and a hard, courteous, entirely unimpressed expression. He wears
the dark Prussian blue coat of a Hessian field officer, cut close in the
Prussian manner, with gold lace at the buttonholes, a straw-yellow waistcoat,
and a gilt crescent gorget at the throat. Clean-shaven.
```
*States:* neutral · **dying** — `the head fallen back, the eyes open and unfocused, the stock loosened, the face bloodless and calm. No blood, no wound visible, no distress.` For the Methodist church, Act 4, characterisation-only. `sensitive: true`.
*Facing colours are **V-1**, unresolved (`hist-ref` §8). Generate the coat plain blue with gold lace; add facings only after the Lefferts plates are read.*
*Clean-shaven per §1.5.*

**ROBERT MORRIS** — Tier B · `gl_xx_pt_morris_*`
```
SUBJECT: Robert Morris, aged forty-two, a Philadelphia merchant and the man who
finds hard money when there is none. A large, heavy, high-coloured Englishman's
face with a broad forehead, a wide firm mouth and shrewd untroubled eyes; his
own hair powdered and clubbed. He wears plain, expensive, entirely
unostentatious civilian dress: a dark grey-brown broadcloth coat, a long plain
waistcoat, a full white stock. He looks like a man who has never once been
surprised by a number.
```

### Sheets 12–14 — Valley Forge, winter 1777–78

**BARON VON STEUBEN** — Tier A · `gl_xx_pt_steuben_*`
```
SUBJECT: Friedrich Wilhelm von Steuben, aged forty-seven, a Prussian officer
newly arrived at Valley Forge. A heavy, thick-set man with a broad face, a large
prominent nose, a firm wide mouth and small bright shrewd eyes under strong
brows; grey hair dressed and powdered in the Prussian manner. He wears a
handsome dark blue coat with red facings, better cut and better kept than
anything else in the camp, and on the left breast a large glittering
eight-pointed star of an order of chivalry, in silver, which is the single most
astonishing object in this army. Clean-shaven. His bearing is unmistakably
Prussian: absolutely upright, chin level, shoulders back.
```
*Silhouette note:* **the star.** It is a documented object, it is the only jewel in the game, and against the ragged camp it does more characterisation than a page of dialogue.
*States:* neutral · speaking · **angry** (he swore magnificently, in German and French, and the whole army loved him for it) · downcast.

**THOMAS CONWAY** — Tier B · `gl_xx_pt_conway_*`
```
SUBJECT: Thomas Conway, aged forty-two, Irish-born, a career officer of the
French army now a Continental major general and inspector general. A narrow,
long-nosed, sharp-featured face with high colour, thin lips and quick pale eyes;
dark hair carefully clubbed and powdered. He wears a well-cut blue coat with
buff facings, correct in every particular and worn with a Continental
officer's carelessness that he plainly does not share. His expression is
courteous, exact, and faintly amused at something you have not said yet.
```

**DR. ALBIGENCE WALDO** — Tier C · `gl_xx_pt_waldo_x-neu`
```
SUBJECT: Albigence Waldo, aged twenty-seven, a Connecticut surgeon at Valley
Forge, himself ill. A thin, young, hollow-eyed face with a long jaw, chapped
lips and lank dark hair tied back without powder. He wears a plain dark civilian
coat with the cuffs turned back and pinned, a waistcoat buttoned to the throat
against the cold, and a wool scarf wound at the neck. He looks like a man who
has been writing things down at night because there is nothing else he can do
about them.
```

**FRANCIS DANA** — Tier C · `gl_xx_pt_dana_x-neu`
```
SUBJECT: Francis Dana, aged thirty-four, a Massachusetts lawyer and member of
the Committee at Camp. A neat, cool, close-shaven face with a small firm mouth,
level brows and light watchful eyes; hair powdered and clubbed precisely. He
wears sober dark civilian dress of good cloth, a plain white stock, and an
expression of scrupulous, faintly appalled attention. He has been in this camp
for four days and he has stopped being able to eat.
```

**A SOLDIER OF THE 1ST RHODE ISLAND** — Tier C · `gl_xx_pt_1stri_x-neu` · `sensitive: true` · **R3, chromatic**
```
SUBJECT: A Black soldier of the 1st Rhode Island Regiment, aged about
twenty-five, a light infantryman. A calm, strong-boned, direct face, clean-shaven,
short hair. He wears the uniform of the Continental line and it fits him and it
is complete: a blue regimental coat with white collar, cuffs and lapels, a white
waistcoat, a plain linen stock, and a black leather shoulder belt crossing the
chest. He looks straight at the viewer with the settled competence of a soldier
in his third year of service.
REFS: ref_deverger_four-soldiers.png (MANDATORY — de Verger's leftmost figure is
the eyewitness record for exactly this man)
```
> **He is drawn in R3, in full colour, exactly as Knox is.** He is a free man in the uniform of the Continental line, and drawing him in the Witness Register because he is Black would be a category error of precisely the kind this project exists to correct. `sensitive: true` is set for the review gate, not for the register.
>
> **His name is blocked, not his portrait.** `02` Appendix D flags that the roster needs a documented name from the regiment's muster rolls. Generate the image now; ship the name when History supplies it. The prompt carries no name and the asset ships with `subject_name: null` in the ledger. **Do not invent one.**

**BENJAMIN TALLMADGE** — Tier B · `gl_xx_pt_tallmadge_*`
```
SUBJECT: Benjamin Tallmadge, aged twenty-seven, a major of light dragoons
running an intelligence network on Long Island. A composed, handsome,
close-featured young man with dark hair cropped short, a level mouth and steady
dark eyes that give away nothing at all. He wears a dragoon officer's short blue
coat with white facings and a plain stock. His expression is pleasant, attentive
and completely opaque — the exact opposite of Nathan Hale's, which is the point.
```

### Sheets 15–17 — Yorktown, September–October 1781

**MARQUIS DE LAFAYETTE** — Tier A · `gl_xx_pt_lafayette_*`
```
SUBJECT: Gilbert du Motier, Marquis de Lafayette, aged twenty-four, a French
nobleman and Continental major general. A tall, narrow-shouldered young man with
a long face, a high sloping forehead already receding at the temples, a long
straight nose, a small mouth and warm quick eyes. His hair is red — a clear
reddish-auburn — clubbed and only lightly powdered so the colour shows plainly.
He wears a Continental major general's blue coat with buff facings, beautifully
cut and expensively made, with a white linen frill at the breast. His expression
is eager, affectionate and slightly too young for the epaulettes.
```
*Silhouette note:* the receding hairline at twenty-four is documented and is the fastest way to separate him from every other young officer in the game.

**COMTE DE ROCHAMBEAU** — Tier B · `gl_xx_pt_rochambeau_*`
```
SUBJECT: Jean-Baptiste Donatien de Vimeur, Comte de Rochambeau, aged fifty-six,
lieutenant general commanding the French expeditionary force. A short, solid,
weather-beaten professional soldier with a broad blunt face, a heavy jaw, a
downturned mouth and small direct eyes under grey brows; grey hair carefully
clubbed and powdered. He wears the blue coat of a French general officer with
red facings and gold lace at the collar and cuffs, and at the buttonhole the
cross of a French order on a red ribbon. His expression is patient, exact and
entirely without vanity — a man who has besieged fourteen towns and expects to
be listened to about the fifteenth.
REFS: ref_costume_french_regular.png (MANDATORY)
```

**LOUIS DUPORTAIL** — Tier C · `gl_xx_pt_duportail_x-neu`
```
SUBJECT: Louis Lebègue Duportail, aged thirty-eight, a French military engineer
and Continental brigadier general, chief engineer of the army. A dry, precise,
narrow face with a long nose, thin mouth and hooded intelligent eyes; brown hair
clubbed and powdered. He wears a Continental blue coat with buff facings, worn
plainly and without ornament, and a stock tied without interest. He looks like a
man who has measured something you have not thought about.
```

**BENJAMIN LINCOLN** — Tier C · `gl_xx_pt_lincoln_x-neu`
```
SUBJECT: Benjamin Lincoln, aged forty-eight, a Massachusetts farmer now a major
general, lame from a leg shattered at Saratoga. A very heavy, round, mild-faced
man with a broad chin, small kind eyes and thin grey hair lightly powdered. He
wears a blue regimental coat with buff facings, well kept. His expression is
gentle, tired and entirely steady; he was made to surrender at Charleston with
his colours cased and he is about to receive a surrender himself.
```

**CHARLES O'HARA** — Tier B · `gl_xx_pt_ohara_*`
```
SUBJECT: Brigadier General Charles O'Hara, aged forty-one, of the Coldstream
Guards, second in command to Cornwallis. A weathered, handsome, sharply
intelligent face with a long nose, a wry mouth and heavy-lidded grey eyes; hair
powdered and clubbed correctly. He wears the coat of a British officer in bright
cochineal scarlet — visibly richer and brighter than a private soldier's dull
brick red — with dark blue facings, gold lace, and a gilt gorget at the throat.
The coat has been on campaign and it shows: the lace tarnished, the cloth faded
across the shoulders. His expression is courteous, worn and privately furious.
REFS: ref_costume_british_regular.png (MANDATORY)
```
*The scarlet/madder distinction is a real class distinction drawn in pigment (`02` §2.4). O'Hara is `BRITISH-SCARLET #C0392B`; every private in the Yorktown crowd sheet is `BRITISH-MADDER #9E3B32`. If they look like the same red, the sheet is wrong.*

**JAMES McHENRY** — Tier C · `gl_xx_pt_mchenry_x-neu`
```
SUBJECT: James McHenry, aged thirty, Irish-born, a physician turned staff
officer and secretary. A neat, small-featured, alert face with a wide mouth, fine
dark brows and warm observant eyes; dark hair clubbed and powdered. He wears
plain dark civilian dress with a clean white stock. He looks like a man who is
already composing the letter he will write about this evening, which he is: his
account of the resignation is the best eyewitness record of it that exists.
```

### Sheet 18 — Newburgh, March 1783

**ALEXANDER McDOUGALL** — Tier B · `gl_xx_pt_mcdougall_*`
```
SUBJECT: Alexander McDougall, aged fifty-one, Scottish-born, a New York merchant
and agitator now a major general, who carried the officers' memorial to Congress.
A weathered, hard-boned face with a jutting chin, deep lines from nose to mouth,
grizzled hair tied back and unpowdered, and pale unblinking eyes. He wears a blue
regimental coat with buff facings, old and correct, and a plain stock. He has
been in a British gaol for sedition and he does not look like a man who found it
formative.
```

**CAPTAIN JOHN ARMSTRONG JR.** — Tier B · `gl_xx_pt_armstrong_*`
```
SUBJECT: John Armstrong Junior, aged twenty-five, aide-de-camp to General Gates.
A slender, elegant, very young officer with a fine-boned face, a straight nose, a
narrow mouth and clear intelligent eyes; light brown hair clubbed and neatly
powdered. He wears a well-kept blue regimental coat and an immaculate stock. His
expression is pleasant, cultivated and perfectly composed.
```
> **He wrote the anonymous address and the game does not reveal it until the epilogue** (`05` §7.3). **Do not paint a conspirator.** No shadow, no sidelong glance, no cold light, nothing withheld in the face. He is a clever, well-liked, well-dressed twenty-five-year-old staff officer, and the whole point is that the student cannot tell — because nobody in the room could either. Same sign-off gate as Arnold: **if he looks like the villain, reject it.**

## 4.5 The voice-only cast, and the Attribute Well

Twelve named speaking characters ship **without a portrait**: Jenkins the express rider, Simms the boatman, Joseph Reed, Ezekiel Whitcomb, Absalom Bragg, William Prescott, Amos Doolittle, Nathaniel Ford, William Young, John Cochran, Jonathan Trumbull Jr., and Molly Ridout. Plus one deliberate omission, below.

An empty 300×400 portrait well beside their dialogue would read as a missing asset. Moving the transcript to fill it would break the fixed reading origin at x 436, which `04` §6.2 correctly refuses to give up. So the well is filled with **the thing they are**, not a face.

> **The Attribute Well.** A speaker with no portrait shows a small R4 engraved vignette of their defining object, centred in the well on bare paper: the express rider's leather post-bag, the boatman's oar, the secretary's pen and sand-caster, the sentry's musket lock, the engraver's burin, the surgeon's lancet case, the drummer's snare. It is period, it is a physical object in the fiction (`02` §8.1's governing rule), it costs one generation, and it makes the roster's budget line look like a design decision — which it is.

`gl_xx_em_attribute-sheet_v01` · 1536×1536 · 4×4 grid · **1 generation, 16 cells** · R4 · `FRAMING-EMBLEM`

```
wshwash, a page of sixteen small copperplate engraved vignettes of single
objects, arranged in a neat four by four grid on bare cream laid paper, each
object isolated and centred in its cell with clear space around it and no
overlap: a leather post-rider's satchel with a buckled flap; a single boat oar
laid diagonally; a quill pen crossed with a sand-caster; the lock of a flintlock
musket seen from the side; an engraver's burin; a surgeon's folding lancet case;
a side drum with its snares and cords; a folded and docketed letter tied with
tape; a pair of dividers; a carpenter's rule folded; a brass spyglass closed; a
tin ration canister; a wooden cheesebox canteen; a butcher's steel; a woman's
linen cap on a stand; a farrier's rasp.
Every vignette is built entirely from ruled and crosshatched ink lines of even
weight with no wash and no solid fill; the bare paper does the lighting.
[FRAMING-EMBLEM] [style-block.txt] [char-negative.txt]
```
Ship each cell at 128×128 WebP, displayed centred at 96×96 in the 300×400 well.

**The deliberate omission: John Honeyman.** The Trenton informant is a genuinely contested figure — the story rests on a family account published long afterwards and historians do not agree that he existed as described (`05` §15). **He gets no portrait, ever.** He gets the butcher's steel in the Attribute Well and a *Persons* entry that states the evidentiary problem in three sentences. A game that draws a face for a man whose existence is disputed has quietly asserted that he existed. The absence is the argument, it is free, and it is the same move the Nathan Hale portrait makes from the other direction.

## 4.6 Portrait state naming

```
gl_xx_pt_{subject}[_{age}][_{register}]_{state}[_{act}]_v{NN}.webp

state:     x-neu  x-spk  x-ang  x-dow
age:       y1775 y1776 y1783            (age pairs only)
register:  r5                            (Witness Register only)
act:       a06                           (re-coat variants only)
Washington: st1|st2|st3 · band-lo|band-mid|band-hi · sash0 · spec
```

Examples:
```
gl_xx_pt_washington_st2_band-mid_v01.webp
gl_xx_pt_washington_st1_band-hi_sash0_v01.webp
gl_xx_pt_washington_st3_band-lo_spec_v01.webp
gl_xx_pt_billy-lee_y1783_r5_x-spk_v01.webp
gl_xx_pt_knox_x-neu_a06_v01.webp
gl_xx_gf_washington-myth_v01.webp
```

## 4.7 The portrait well, resolved

`02` §6.1 ships portraits at 768×1024 and displays them at **288×384**. `04` §6.2 gives the portrait well as **300×400** at x 96. These are not in conflict and neither needs to lose: **the well is 300×400 and the image is 288×384, centred, leaving 6 px of the paper panel to left and right and 8 px top and bottom.** An image butted flush to the edge of its well reads as a layout bug; a small consistent margin reads as a picture tipped into an album, which is exactly what the *Persons* ribbon already is.

---

# 5. THE CUTOUT CHARACTER SHEETS

## 5.1 Three classes of in-scene figure — and most characters are the cheapest one

The act inventory allocates 26 stance sheets yielding 26 rigged atlases, and budgets 26 × 45 minutes = 20 hours of hand segmentation. **Fourteen of those characters never move.** A character who stands still and talks does not need an eleven-piece puppet; the portrait layer is doing all the performing (`02` §5.5: *never write a beat that requires reading a face on the walk-plane*).

| Class | What it is | Cost | Used for |
|---|---|---|---|
| **PAINTED-IN** | the figure is painted into the `L2` plate at blockout | **zero** | anyone always present in that scene, in that pose. **Most named NPCs.** |
| **BILLBOARD** | a keyed static cutout on a quad, two facings, no rig | keying only, ~8 min | anyone whose presence is conditional on state, act or whether they were met |
| **RIGGED PUPPET** | a twelve-piece segmented paper puppet | 45 min segmentation | Washington, Billy Lee, and seven motion archetypes |

**The blockout constraint that makes PAINTED-IN safe: a painted-in NPC stands behind the walk-plane, always.** The player's cutout billboards at `L3`'s Z (`04` §4.3), so he passes in front of everything on `L2` — correct for anyone standing back from the path. Any character the player must pass both in front of *and* behind is a billboard, not paint. This is checked at blockout, which is where every layer-boundary decision in this project gets made.

A painted-in NPC is still a **target**: an interaction hotspot with a position on the walk-plane and no sprite of its own (`04` §4.4). Conversation range, `gesture_listen` and the examine system all work unchanged.

**The reallocation.** 26 sheets still ship. They yield **12 rigged atlases and 14 static-billboard sets**, and segmentation labour drops from 20 hours to **9**. Eleven hours returned to the schedule for no loss of anything anyone sees.

| Rigged (12) | |
|---|---|
| Washington × 3 | `st1` `st2` `st3` |
| Billy Lee × 2 | `y1775` standing · `y1783` seated and rising |
| Archetypes × 7 | `sold-march` · `sold-dig` · `sold-haul` · `offr-stand` · `woman-work` · `drummer` · `sentry` |

The seven archetypes are re-skinned per act by swapping the atlas, not the rig — one `rig.json` schema, seven skeletons, eight acts.

## 5.2 The scale template — how scale stays consistent across 26 sheets

Models do not hold a camera spec and they do not hold a figure height. Across 26 independently generated sheets you will get 26 different scales, and the walk-plane's scale curve will then multiply the error rather than fix it.

**Fix: every stance sheet is generated against the same ControlNet template.** `art/blockout/char-sheet-template.png`, 1536×1024, a flat grey image containing three vertical bounding rectangles at fixed x positions and a single horizontal ground rule at fixed y. Passed as **lineart at weight 0.45 and depth at weight 0.25.** The figure is born at the right height because the box told it where its head and feet go.

Character height is then set by **editing the template's box height**, from a locked five-band table, before generating. Never by prompting a height.

| Band | Height | Box height on the 1024 px sheet | Assigned to |
|---|---|---|---|
| **TALL** | 74 in | **900 px** | Washington, and nobody else in the game |
| **ABOVE** | 70 in | 851 px | Knox, Lafayette, Greene, Stirling, O'Hara |
| **MEDIAN** | 67 in | 815 px | the default — every soldier, every officer not named above |
| **SHORT** | 63 in | 766 px | Hamilton, Martha, Sarah Osborn, Doll, Glover, Rochambeau |
| **BOY** | 61 in | 742 px | Joseph Plumb Martin 1776, drummers, the youngest militia |

Scale is **12.16 px per inch** at the sheet's near-plane, derived from Washington's documented 6'2" at 900 px.

**And the check that this table was right.** `04` §4.3 requires NPC billboards at the same walk-plane `t` to be authored **8–12% shorter** than Washington, so his head clears the crowd line. MEDIAN at 815 px against TALL at 900 px is **9.4% shorter** — inside the band, derived independently from period muster-roll stature rather than chosen to fit. The two documents agree because the history made them agree, which is the best kind of confirmation available.

> **Band assignment is a staging decision, not a claim about a man's height.** Washington's 74 inches is documented (`hist-ref` §2.1). Nobody else's is, and this document does not invent thirty-six heights. A band is assigned for silhouette separation and for what the writing needs, and the ledger records it as a staging value.

## 5.3 The stance sheet prompt

Three facings is all a fixed-camera game needs (design decision #6). Front, three-quarter-left, profile-left; mirrored horizontally in-engine for right.

`1536 × 1024` · seed `30000 + character_index × 10` · ControlNet: template lineart 0.45 + depth 0.25

```
wshwash, a costume study sheet: the same man drawn three times in a row on one
sheet of plain paper, at identical scale and under identical light, against a
completely flat, even, featureless warm grey ground of one uniform tone.
FIRST: standing squarely facing the viewer, arms hanging relaxed and slightly
away from the body, legs straight and a little apart, hands open and clear of
the coat.
SECOND: the same man in three-quarter view turned to his left, the same relaxed
stance.
THIRD: the same man in profile facing left, the same relaxed stance.
Clear space between the three figures, no overlap, no cast shadow, no ground
line, no horizon, no scenery.
[SUBJECT LINE — the same one used for that character's portrait, plus footwear
and headgear, which the chest-up portrait never showed]
[char-style-block.txt] [FRAMING-CUTOUT] [style-block.txt] [char-negative.txt]
```

**Why a relaxed A-stance and never a T-pose.** A literal T-pose fights the style badly — eighteenth-century figure drawing has no such convention and the model produces a scarecrow. *"Arms hanging relaxed and slightly away from the body, hands open and clear of the coat"* is doing real work: it produces limbs that are separable without reconstructing what is underneath them (`ai-art-production-guide.md` §4.2).

**Washington's three sheets** append `char-washington.txt` and the relevant stage modifier, and add the footwear line the portraits never needed:
```
st1 / st2:  black leather riding boots to just below the knee.
st3 (Act 8): white stockings and black buckled shoes with plain square buckles,
             and a black cocked hat carried under the left arm.
```
Band does **not** vary the cutout. Nine walking Washingtons would be nine identity risks for a signal nobody can read at 220 px. The band lives in the portrait, where it is 288 px tall and unmissable. **This is the correct place to spend the identity budget and the correct place not to.**

## 5.4 Keying

Generate on a **flat warm grey plate, `#8C8578`** — not green (contaminates the earth palette and fringes the ink line), not white (the style has bare white paper *inside* the figure and you would key holes through him), not black (kills the ink line).

```bash
rembg i -m birefnet-general -a -ae 12 \
  art/raw/gl_xx_ch_washington_st2_sheet_v01.png \
  art/cut/gl_xx_ch_washington_st2_sheet_v01.png
```

BiRefNet (MIT) handles soft wash edges and stray ink strokes far better than U2Net. Escalate to **BEN v2** for the six or seven figures where hats defeat it.

**The failure to watch for:** an over-tight matte eats the 8–20 px soft wash edge that makes the style work, and the figure acquires a hard cut line that reads as a sticker. If the alpha ramp at the coat's shoulder is under 4 px, re-run with `-ae 20` or matte by hand. This is C-13 in §7.6.

## 5.5 The rig — twelve pieces, and the period costume is a gift

`ai-art-production-guide.md` §4.3 specifies an eleven-piece rig. **This document ships twelve, and the extra piece is free money.**

The 1770s coat is full-skirted to mid-thigh. That means **the hip joint is permanently concealed by cloth** — the single hardest joint in any cutout rig, the one that produces every paper-doll gap, is hidden by the costume in every scene of this game. So:

- the **torso** piece carries the coat from shoulder to skirt hem;
- the **leg** pieces begin **below the knee** — breeches, stocking, shoe — and are short, simple, and never expose a joint;
- and the coat's skirt becomes its own piece, **`coat_skirt`**, pivoting at the waist and animated with a **two-frame delay** behind the torso.

That last piece costs one cut and buys the most legible period motion in the game: a full-skirted coat swinging a sixth of a second behind the man wearing it. At 12 fps stepped, two frames is 167 ms, which is exactly the lag of heavy wool.

```
head          (hatted)
head_bare     (alternate atlas rect — indoors, and Act 8)
torso
coat_skirt
pelvis
upper_arm_L   lower_arm_L   hand_L
upper_arm_R   lower_arm_R   hand_R
leg_L         leg_R
```
Thirteen atlas rects, twelve animated pieces. One 1024×1024 KTX2 atlas per character, trimmed, 4 px padding, plus `rig.json` holding each piece's rect, pivot, parent and default rotation. Same schema for every character so one runtime component drives them all.

**Cut with 8 px of overlap at every joint** so rotation never opens a seam, and hand-paint the occluded shoulder and hip continuation — five minutes per character, and it removes every paper-doll gap artefact.

## 5.6 The hands library

**Never let the model generate hands** (`ai-art-production-guide.md` §5.2). One sheet, eight shapes, hand-cleaned once, reused across every character in the game. At the scale characters appear on screen a hand is about 12 px; nobody will ever know, and you will never again lose an hour to a six-fingered general.

`gl_xx_ch_hands-library_v01` · 1024×1024 · 4×2 grid · **1 generation**

```
wshwash, a study sheet of eight separate drawings of a single man's right hand
in different attitudes, arranged in a neat four by two grid on bare cream paper,
each hand isolated with clear space around it and no overlap, all at identical
scale and under identical even light: open and relaxed with the fingers slightly
curled; pointing with the index finger; gripping a vertical staff; gripping a
horizontal edge; laid flat palm down; holding a folded sheet of paper by one
corner; holding the brim of a hat; resting on the pommel of a sword hilt.
The hands are working hands — square, weathered, unmanicured, with visible
knuckles and short nails.
[char-style-block.txt] [style-block.txt] [char-negative.txt minus `hands in
frame, held objects, pointing`]
```

Eight shapes replace the guide's `fist` and `behind_back_stub` with `holding_hat_brim` and `on_sword_hilt`, because those two are what this cast actually does with its hands. Hands-clasped-behind-the-back — a documented Washington habit and a hand-free silhouette — is achieved at the *arm* level, not the hand level, and needs no piece.

**Gloves.** For Acts 4, 5 and 6, a second four-cell sheet of the same shapes in plain buff leather gloves. A glove is a mitten-shaped mass with no fingers to miscount, it is period-correct, and it is the cheapest hand in the project.

## 5.7 The silhouette test, and the authored differentiator table

> Render every cutout as pure black at ship scale and show it to someone who has read the script. If they cannot name the character, change the hat, the coat's skirt, the posture, or the prop. (`02` §5.5.)

Ten minutes, and it is what stops the cast becoming interchangeable men in tricornes. But the test only works if a differentiator was *authored* rather than hoped for. Every rigged and billboarded figure carries one, and it is decided at the stance-sheet prompt, not discovered at review:

| Figure | Authored silhouette differentiator |
|---|---|
| **Washington** | height — 9.4% above the crowd line, always, in every scene |
| **Billy Lee, 1775** | short riding coat, standing at a horse's head |
| **Billy Lee, 1783** | **seated**, the only seated named figure in Act 7 |
| **Knox** | width. The broadest mass in the game |
| **Glover** | hip-length seaman's jacket — the only unskirted coat |
| **von Steuben** | absolute Prussian verticality, and the star catching light |
| **Lafayette** | narrow shoulders, tall, the youngest posture in any officer group |
| **Rochambeau** | short and square beside Washington's height, in the surrender-road shot |
| **Sarah Osborn** | cap and petticoat — the only skirted silhouette in most camp scenes |
| **Joseph Plumb Martin, 1776** | boy's height and a coat too big at the shoulder |
| **Martha** | cap, and the only interior skirt in Act 1 |
| **Hessian grenadier** | the mitre cap. It does all the work and it does it alone |
| **British grenadier** | bearskin cap plus shoulder wings |
| **French grenadier, Soissonnais** | bearskin with plume — the only plume in the game |
| **militiaman** | powder horn on a cord instead of a black leather cartridge box |
| **rifleman** | fringed hunting shirt with a shoulder cape, and no bayonet |

The last four are crowd-sheet types and are the reason crowd composition needs no colour to be read.

## 5.8 The nine crowd sheets

`2048 × 1024` · six figures in a row, each ~340 × 950 · **9 generations, 54 billboards** · seed `31000 + act × 10`

At 130–180 px on screen a background billboard is displaying about a fifth of its source resolution, which is exactly the headroom needed for the walk-plane's scale curve.

```
wshwash, a study sheet of six separate standing figures in a row on one sheet of
plain paper, at identical scale and under identical even light, against a
completely flat featureless warm grey ground. Clear space between the figures,
no overlap, no cast shadow, no ground line. Each figure stands in a different
relaxed attitude — one squarely to the viewer, one turned three-quarters away,
one in profile, one leaning on a musket, one seated on a barrel, one crouched
over a task.
[GROUP LINE below] [char-style-block.txt] [FRAMING-CUTOUT] [style-block.txt]
[char-negative.txt]
```

Two lines are appended to **every** crowd sheet without exception, because they fix the two failures that make a crowd unusable (`hist-ref` F-11, F-12):

```
No two men are dressed alike. One man in four is out of regulation. Mixed coats,
hunting shirts, waistcoats worn as outer garments and men in shirtsleeves in the
same file; different hats; visible patching and mismatched buttons.
Everything is worn: mud to the knee, patched at the elbow, mended with
mismatched cloth, powder-stained, sun-faded, sweat-marked linen. Nothing looks
newly issued.
```

| # | Sheet | Group line |
|---|---|---|
| 1 | `a02_cambridge` | Six men of the improvised army at Cambridge in 1775: civilian coats in undyed, walnut-dyed and dull indigo homespun; waistcoats worn as outer garments; shirtsleeves; round hats and cut-down cocked hats; two in fringed linen hunting shirts with shoulder capes; powder horns and shot bags on cords instead of cartridge boxes; one man with no bayonet. |
| 2 | `a03_brooklyn` | Six men on the Brooklyn earthwork in August 1776: the same improvised dress, worse; two men working with spades; one Maryland soldier in a good coat among five who have none; a mixed-race Marblehead boat crew in short blue jackets. |
| 3 | `a04_delaware` | Six Continental soldiers at the nadir, December 1776: rags, blanket coats, feet wrapped in cloth and hide, hats let down against sleet, hunched into the wind. Nothing matches. |
| 4 | `a04_trenton-hessian` | Six Hessian soldiers turning out under arms in a sleet storm: dark Prussian blue coats cut close in the Prussian manner, straw-yellow waistcoats and breeches, black gaiters; two grenadiers in tall stiff pointed cloth mitre caps with large embossed brass front plates and brass finials; two fusiliers in the same cap but shorter with a smaller plate; two musketeers in cocked hats. They are alert, formed and armed. **Uses `char-negative-german.txt` and the waxed-moustache line.** |
| 5 | `a05_valley-forge` | Six men at Valley Forge: rags, one man barefoot in snow with his feet bound in rag, one in a blanket cut and sewn into a coat, one woman of the army in short gown, petticoat and linen cap carrying a bucket, an integrated file including Black soldiers serving alongside white soldiers in the same rank. |
| 6 | `a06_yorktown-continental` | Six Continental soldiers in the trenches in 1781: transitional dress — two in the 1779 regulation blue coat faced white, two in fringed linen hunting shirts, one in a brown coat faced red from the French contract, one in a mixture; an integrated file including Black soldiers, as recorded by the French officer de Verger. **Ref `ref_deverger_four-soldiers.png` mandatory.** |
| 7 | `a06_yorktown-french` | Six French infantrymen of the expeditionary force: coats of warm unbleached-wool white with regimental facings in rose, green and crimson; black cocked hats with white cockades; hair carefully clubbed and queued; two grenadiers of Soissonnais in bearskin caps with white and rose plumes. Immaculate, complete, and visibly better supplied than anything else in the frame. |
| 8 | `a06_yorktown-british` | Six British soldiers marching out to surrender: coats of dull warm brick-red madder — not bright scarlet — with regimental facings, worsted button lace in pale bars down the chest, white waistcoats, black half-gaiters, two whitened buff leather crossbelts. The coats are shortened, the hats cut down, the lace stripped and faded. They have been on campaign for six years and they look it. |
| 9 | `a07_newburgh-officers` | Six Continental officers in March 1783, the best-dressed this army ever was and still patchy: 1779 regulation blue coats with white, buff and red facings by state, well kept and old, epaulettes bright or tarnished; one man in four out of regulation; cloaks; no rags and no bandages anywhere. |

Sheet 9's final clause is a hard rule: **rags-and-bandages iconography is Act 5's register and it is forbidden at Newburgh** (`hist-ref` §0.3). Newburgh's claustrophobia comes from the room, not from the clothing.

## 5.9 What the population count actually swaps

`02` §3.6 and `07` §4.3: `2 + (band × 2)` figures per exterior, low band biased to seated and hunched poses. This is why each crowd sheet contains one seated and one crouched figure — **the low-band variant is not a different sheet, it is a different subset of the same six**, chosen at scene load. Two figures at LOW, four at MID, six at HIGH, and at LOW the two chosen are the seated one and the crouched one. Emptiness plus posture, from one generation, at zero runtime cost.

---

# 6. THE INTERNAL VOICE VISUALS

## 6.1 The decision: objects, not figures

`historical-visual-reference.md` §5.2 recommends emblem vignettes in the manner of eighteenth-century emblem books rather than faces, and `02` §2.5 has already locked the five: **a hand mirror, a spur, a struck flint, a bridle bit, a folded commission.** This document confirms that and narrows it by one degree, because "emblem book" still permits allegorical *figures* — a winged Fame, a blindfolded Justice — and those are the wrong answer.

> **The five Council emblems are objects, and every one of them is a thing Washington himself owned.**

Three reasons, all decisive:

1. **Five allegorical figures would put five more consistent human faces into the project**, which is the exact risk the whole design is built to remove. Objects have no identity to drift.
2. **At 20 × 20 px a figure is mud and an object is a silhouette.** The emblem appears inline in the Council band at 16–20 px and again as the prefix glyph on locked options, where it must be readable at a glance beside 18 px italic text. A spur and a bridle bit separate instantly at that size; a winged Fame and a winged Victory do not.
3. **It is a better argument.** A Latin emblem book furnishes his interior with somebody else's abstractions. A spur, a bit, a flint, a mirror and a folded commission furnish it with **his own kit** — the things in his saddlebag, his dressing case and his coat. The interior is built out of the man's own possessions, which is both more period and more personal, and it costs nothing to say so.

They are also, usefully, four verbs and a noun: the spur *drives*, the bit *checks*, the flint *strikes*, the mirror *shows*, and the commission simply *is* — an object that exists to be given back.

## 6.2 The emblem sheet

`gl_xx_em_council-sheet_v01` · 1536×1536 · 4×4 grid · **1 generation, 16 cells** · R4 engraved · `FRAMING-EMBLEM`

Sixteen cells: **five emblems, five alternate cuts of the same five** (so the Art Lead can choose per-emblem without regenerating anything), and **six utility ornaments** the UI needs anyway.

```
wshwash, a page of sixteen small copperplate engraved vignettes arranged in a
neat four by four grid on bare cream laid paper, each object isolated and
centred in its cell with clear space around it and no overlap.

ROW 1 — a horseman's spur with a long curved neck and a spoked rowel, lying on
its side; a curb bit with straight cheekpieces and a curb chain, hanging; a
gunflint held in a spring cock at the moment of striking, with three short
sparks; a small oval hand mirror with a turned handle, face toward the viewer
and blank; a folded parchment commission, docketed on the outside, tied with a
narrow tape.

ROW 2 — the same five objects again, each drawn from a different angle: the spur
seen from above; the bit seen straight on; the flint and cock seen from the
opposite side; the mirror seen at a three-quarter angle; the commission unfolded
one fold.

ROWS 3 AND 4 — six printers' ornaments and small devices, and two blank cells: a
pointing hand with a lace cuff, the index finger extended to the right; a folded
letter sealed with a plain wafer; an open palm; a small typographic flower of
curved leaves; a short horizontal rule with a diamond at its centre; a cloth
ribbon-end with a cut fishtail edge.

Every vignette is built entirely from ruled and crosshatched ink lines of even
weight, with no wash, no solid black fill and no colour; the bare paper does all
the lighting. Line spacing wide enough that the hatching reads as separate lines
and never as a grey tone.
[FRAMING-EMBLEM] [style-block.txt] [char-negative.txt]
```

**Ship as single-channel ink alpha, tinted at runtime.** One sheet serves all five voices, and colour stays a *label* applied by the engine rather than a property baked into an image. It also guarantees the five emblems are identical in weight and construction, which is what makes them read as one set.

```
gl_xx_em_council_{vanity|ambition|temper|restraint|duty}_v01.webp   64 × 64
gl_xx_em_ui_{manicule|folded-letter|open-palm|fleuron|rule|ribbon}_v01.webp
```

Runtime tints, from `02` §2.5 — which wins over `04` §6.5 per erratum E-3 in `07` §9.1:

| Voice | Emblem | Ink | L\* |
|---|---|---|---|
| **VANITY** | hand mirror | `#875E0F` | 43.1 |
| **AMBITION** | spur | `#9E2E12` | 36.5 |
| **TEMPER** | struck flint | `#762C29` | 28.9 |
| **RESTRAINT** | bridle bit | `#223746` | 22.0 |
| **DUTY** | folded commission | `#1B1E5A` | 15.0 |

**Two constraints on the drawing that come from accessibility, not taste.** The five must separate in greyscale — the L\* ladder is even, but only if the *shapes* also differ, so the sheet must produce five distinct outlines: a spike, a hanging loop, a struck spark, a filled oval on a stick, and a rectangle. And **the emblem is always present** wherever a voice speaks, because colour is the third channel behind position and glyph and is never load-bearing (`04` §6.5). Never ship a build where colour is the only difference between two voices.

**The Duty commission carries no wax seal.** `SEAL-RED #8C2F2A` means sealing wax and nothing else in the entire game (`02` §2.4), and the emblem ships as a tintable single channel, so a red seal is not available to it. Draw the commission **folded and docketed**, seal side down — which is what a commission looks like when it is being carried rather than being read, and is therefore also the better image.

**The manicule** — the pointing hand with a lace cuff — is the period printer's ornament for *look here*, and it is the game's exit glyph (`04` §4.5). It is worth the cell.

## 6.3 The watermark — the one addition this section makes

Each of the seven interlude letters carries one clause selected by whichever voice was loudest across the act just finished (`07` §3.5.3). The clause is in Washington's own secretary hand, on paper, and the student never learns the rule — what they experience is that the letters gradually acquire a personality, and that the personality is theirs.

> **Put that act's loudest voice into the letter as a watermark in the paper.**

Not printed on it — *in* it. Real laid paper carries a watermark, visible only as a slightly thinner place in the sheet when it is held up. Composite the voice's emblem into the interlude letter's paper at **5% opacity, aligned to the chain lines, centred in the upper third**, using the alternate cut from row 2 of the emblem sheet at 1.8× scale.

Cost: **zero generations.** The five images already exist in the sheet, and it is a CSS composite on an asset that already ships.

It is the correct register in a way a printed ornament could not be — the letter is manuscript, so an engraved device on its face would be wrong, but a watermark is a property of the *paper*, which is to say of the thing he is writing on rather than the thing he is writing. **The voice is in the paper, not on it.** A student who notices, in Act 6, that there has been a spur in the corner of every letter since Trenton has learned something about themselves that the game will never state.

---

# 7. TROUBLESHOOTING — THE TEN CHARACTER FAILURES

Numbered `C-01`–`C-10` so they never collide with the historical pack's `F-01`–`F-24`, which remain in force. Each row: what you see, why it happens, the **positive** language that fixes it, the negative addition, and the QA check. Negative prompts are a weak instrument; the positive phrasing carries the weight.

## C-01 · Identity drift across a matrix — **the project-ending one**

**Symptom.** The nine Washingtons look like four different men. An NPC's angry state has a different jaw from their neutral. A character's Act 6 appearance is somebody's cousin.

**Why.** A text descriptor narrows a distribution; it does not specify a face. Every independent generation is a fresh sample from the narrowed distribution, and identity is not a property text can pin.

**Fix — structural, not textual.** This is the one failure you cannot prompt your way out of and the reason §3.2 and §4.0 exist:
- Generate **one** master per identity. Sign it. Never re-roll it — edit it (`ai-art-production-guide.md` §3.5).
- Derive everything else: **multi-ref** for stage/age changes, **masked img2img at 0.38** for expression, **0.24** for style re-seating. Never above 0.45.
- Put the identity token first in the prompt. `gwface` is token one, always.
- **Obey §0.3: the per-asset line adds state, never anatomy.** Two descriptions of one nose average into a third nose.

**QA.** The four-ratio metric gate (§3.3) before anyone looks at it with taste. Then the 3×3 contact sheet, printed, at ship size.

**Escalation.** If a derivation fails M1/M2 twice, the master is the problem, not the derivation — go back and check whether the master's head is at an unusual angle. A master at more than about 30° of turn makes every derivation harder.

## C-02 · The Stuart mask

**Symptom.** Every Washington ages into the dollar bill: elderly, jowly, the mouth drawn in, the lower face collapsed, the hair a white cloud with no visible hairline.

**Why.** The 1796 Athenaeum portrait is the most reproduced image of any American and it dominates the token "Washington" in every model's prior.

**Fix.**
```
POSITIVE: aged forty-three in 1775 / aged forty-five in 1777 / aged fifty in
1781 — tall, vigorous and physically formidable; the jaw firm and clean along
its whole length; the mouth wide and thin and full-lipped, held closed, with the
teeth supported behind it and no drawing-in at the corners; the chin projecting
and square.
```
State the age **twice** — once in the subject line and once in the stage modifier. Never let the word "Washington" carry the identity alone; `gwface` does that.

**Negative adds.** `dollar bill, banknote engraving, 1796, elderly, jowls, sunken mouth, projecting lower lip, collapsed lower face, dentures`

**QA — measurable.** Lower-face height, nose base to chin, as a fraction of total head height, hairline to chin. **Ours is 0.32–0.34.** The denture face shortens it below 0.30. One measurement, five seconds, no argument.

## C-03 · Wig instead of hair

**Symptom.** Tight white rolls over the ears; no hairline; a hard edge across the forehead.

**Why.** The "founding father" prior is a periwig prior.

**Fix — describe where the hair *grows*.**
```
POSITIVE: his own natural hair, sandy reddish-brown, drawn straight back off the
forehead without a parting so the hairline is visible and slightly irregular,
clubbed and tied at the nape with a black silk ribbon, powdered greyish-white so
that the reddish-brown shows through at the roots, at the temples and behind the
ear. The ears are fully exposed.
```

**Negative adds.** `periwig, powdered wig, side rolls, curls over the ears, barrister wig, bob wig, hard hairline edge`

**QA.** Can you see the hairline, and can you see the ear? A wig covers both. Second check: is there any reddish-brown at the temples? If the head is uniformly white, it is a wig regardless of what the prompt said.

## C-04 · The modern face

**Symptom.** Contemporary orthodontia, symmetrical beauty, gym jaw, smooth skin, glamour lighting, a face that has been to a dentist.

**Why.** The portrait-model prior. Every model's "portrait" training is overwhelmingly contemporary photography.

**Fix.**
```
POSITIVE: a weathered eighteenth-century face — asymmetrical, with one eye
sitting fractionally higher than the other, the nose not quite straight, skin
that is wind-burned and uneven, a working body and a face that has been out of
doors in every weather for thirty years. The mouth is closed and no teeth are
visible.
```

**Negative adds.** `model, beautiful, handsome, symmetrical, perfect teeth, orthodontia, veneers, smooth skin, airbrushed, glamour, beauty lighting, headshot`

**QA — the question to ask out loud.** *Would this face be out of place in a Ralph Earl portrait?* Earl's Connecticut sitters are the register: stiffer, flatter, more literal, unmistakably American, and nobody in them is pretty. **Do not put the artist's name in the prompt** — the house discipline on artist names holds (`hist-ref` §7.4). It is a review question, not prompt text.

## C-05 · Wrong-century silhouette collapse

**Symptom.** Tall shakos, high stiff standing collars, cutaway tailcoats, a waist seam above the natural waist, cross-belts on a *fitted* coat. Or kepis and sack coats.

**Why.** 1800–1815 and 1861–1865 are both vastly better represented in training data than 1775–1783, and both are "American war" and "soldier."

**Fix.**
```
POSITIVE: 1770s cut — a full-skirted knee-length coat with the skirts reaching
mid-thigh, deep turned-back cuffs, wide lapels buttoned back to show the lining,
a low turned-down collar no higher than an inch, no waist seam and no shaping at
the waist. Knee breeches or loose full-length overalls. Blunt square-toed
buckled shoes. A three-cornered cocked hat with a low crown.
```

**Negative adds.** `shako, tailcoat, cutaway, high collar, standing collar, waist seam, 1812, Napoleonic, Waterloo, kepi, forage cap, sack coat, Civil War, 1863, Gettysburg`

**QA.** Two questions, both binary. **Is the coat skirt at mid-thigh?** **Is the collar lower than the ear lobe?** Either failing is a reject; neither is repairable by inpaint because the whole garment is wrong.

## C-06 · Tricorne misshape

**Symptom.** A rigid triangular hat-shell like a piece of moulded foam; a pirate hat; a Napoleonic bicorne worn fore-and-aft.

**Why.** Costume-shop tricornes dominate the data and none of them are hats.

**Fix — describe the *fold*, not the shape.**
```
POSITIVE: a black felt hat whose flat circular brim has been folded up and
fastened against a low crown on three sides, the crown only four or five inches
high and the folded brim sitting close against it; the brim edge bound with
worsted tape; a black cockade of folded ribbon about three inches across on the
left side, held by a button and loop.
```

**Negative adds.** `pirate hat, bicorne, stiff triangle, moulded hat shell, foam costume hat, wide-brimmed hat, cavalier hat`

**QA.** Trace the brim with a finger. **Does it read as one continuous folded plane returning to itself?** If there are three separate flat panels meeting at corners, it is a shell and it is wrong. Second check: the crown must be visible *above* the fold and it must be low.

## C-07 · Age drift

**Symptom.** Stage III Washington looks sixty-five. Lafayette looks forty. Joseph Plumb Martin looks the same at fifteen and twenty-two. An NPC ages three years between Act 5 and Act 6 and eleven between Act 6 and Act 7.

**Why.** Decade words. *"Early fifties," "middle-aged," "young"* — each drifts by five or six years in either direction, and the drift is different every generation. Compounded by C-02's pull toward old age for Washington specifically.

**Fix.**
```
POSITIVE: aged [INTEGER] — [one age-specific anatomical marker].
```
Every character prompt in this project states an **integer age in words**, and pairs it with exactly one marker that carries the age physically rather than adjectivally:

| Age | Marker to use |
|---|---|
| 15–22 | *no whiskers at all; the neck still thin inside the collar* |
| 23–35 | *the flesh still full under the jaw; no line from nostril to mouth* |
| 36–48 | *one clear line from the nostril to the corner of the mouth; the jaw line beginning to show* |
| 49–58 | *the flesh gone from under the cheekbone; the lids heavier; grey at the temples* |
| 58+ | *deep lines nose to mouth; the neck loosening; the hair thin at the crown* |

**Negative adds.** `elderly, ancient, youthful, teenage, boyish` — all of them, in both directions, because a decade word in the negative is as unhelpful as one in the positive.

**QA.** Print the character's states side by side and read the *year* off each, not the age. If two states of the same person are supposed to be seven years apart and read as twenty, the marker was doing too much work. See also **E-C1** (§2.3): the AI guide's own stage text was wrong by six years and it is corrected here.

## C-08 · Facial hair, in both directions

**Symptom A.** Stubble, moustaches and beards on Continentals and British — the modern "gritty soldier" prior. **Symptom B.** Clean-shaven German grenadiers, which loses the game's cheapest faction marker.

**Why.** Both are defaults: the model's default is stubble on everyone, and an absolute negative ban then over-corrects the one group that should have it.

**Fix.** Two locked negative files and nothing else (§1.5).
```
DEFAULT (char-negative.txt):        stubble, five o'clock shadow, beard,
                                    moustache, sideburns, goatee
POSITIVE on every face:             clean-shaven, freshly shaved this morning
GERMAN (char-negative-german.txt):  those six tokens removed, and nothing else
POSITIVE for German grenadiers
and Jäger only:                     a short waxed moustache with the ends
                                    stiffened and turned up, the chin and cheeks
                                    shaved clean beneath it
```

**QA.** Zoom every face on every sheet. **Zero tolerance except German grenadiers and Jäger.** Continental practice was to shave every three days unless in the field (`hist-ref` §1.9 **[DOC]**), so even the Valley Forge sheet is clean-shaven — the men are starving, not unshaven, and that distinction is the difference between a research-led image and a mood.

**Officers are a separate question and it is open.** Rall is generated clean-shaven pending **V-C4**.

## C-09 · Women mis-costumed

**Symptom.** Bare heads, loose flowing hair, a laced corset worn as outerwear, a ball gown, a bodice with visible cleavage, a "peasant girl" register.

**Why.** The romantic period-drama prior, which is overwhelmingly nineteenth-century and overwhelmingly about aristocrats.

**Fix.**
```
POSITIVE: a short gown — a hip-length fitted linen jacket — worn over a
petticoat, over stays that carry the torso in a smooth flattened cone with no
waist definition and no bust separation; a plain linen neckerchief filling the
neckline right up to the throat and tucked in; a white linen cap covering the
hair completely, tied or pinned, worn indoors and out. The hair is never loose
and never visible below the cap.
```

**Negative adds.** `corset, front lacing, visible lacing, cleavage, bust, bare shoulders, ball gown, empire waist, bonnet, bare head, loose hair, flowing hair, braid down the back, peasant blouse`

**QA.** Three binary checks. **Is she capped?** **Is the neckline filled to the throat?** **Is the torso a smooth cone with no waist?** Any failure is a reject. The ratio check runs alongside it: a December 1777 return at Valley Forge shows roughly one woman per forty-four enlisted men (`hist-ref` §1.12 **[DOC]**), so **one woman in a six-figure camp crowd sheet is right; three is wrong in one direction and zero is wrong in the other.**

## C-10 · The two failures in depicting enslaved people

This is the highest-reputational-risk art in the project and it has **two** failure modes that look like opposites and do the same damage. You cannot prompt your way out of either; the process in §4.2 and `hist-ref` §7.6 is the actual defence, and the prompt language below is the last line of it, not the first.

**Symptom A — caricature.** Exaggerated features, comic ragged dress, a deferential or servile posture, a face constructed from nineteenth-century illustration.

**Symptom B — the pastoral.** Warm golden light, a contented expression, picturesque poverty, the figure placed in the middle distance of a pretty landscape as an element of scenery. This is the register the entire plantation-nostalgia tradition was built in, in this exact medium, for this exact purpose. **It is the more likely of the two and it is the one that will get past a reviewer**, because it looks like a nice picture.

**Symptom C — the turban.** Trumbull's 1780 red turban on Billy Lee: an Orientalist convention, evidence about the painter and not about the man.

**Symptom D — the void.** A faceless figure, a silhouette, a figure seen only from behind. Appropriate for a museum marking an evidentiary absence; wrong in a game, where a faceless figure reads as an NPC placeholder rather than as a documented gap (`hist-ref` §7.3 rule 4).

**Fix.**
```
POSITIVE: a particular named person, individuated, looking directly out of the
picture at the viewer's own eye level, in clean, well-fitting, carefully kept
working clothes of coarse undyed linen. Calm, unsmiling, entirely present;
neither deferential nor defiant. Clear, even, unflattering north light with no
warmth in it. The person is the subject of the picture and the building behind
them is not.
```
Plus the R5 wash override (§4.2): a single grey wash in three values, one owned object carrying colour, and no atmosphere of any kind.

**Negative adds.** `caricature, exaggerated features, minstrel, contented servant, smiling, singing, deference, bowing, kneeling, golden hour, warm light, sunset, hazy, picturesque, pastoral, romantic, ragged comic clothing, red silk turban, oriental turban, seen from behind, faceless, silhouette, blurred face, background labourer, field worker in the middle distance`

Note the precision required: `red silk turban, oriental turban` and **not** `head wrap` — Doll wears an indigo-dyed head wrap and it is her one colour. A careless negative token deletes a documented garment.

**QA — and this one is not a checkbox.**
- Every asset `sensitive: true` in the ledger.
- **The person who prompted it may not approve it** (`hist-ref` §7.6). Sign-off comes from someone who has read Mount Vernon's own interpretive guidance.
- Ask the reviewer one question, and it is the whole gate: **is this picture *attentive*, or is it *flattering*?** Every one of R5's five parameter changes removes a device that flatters and none of them adds suffering. If the image has become uglier, it is as wrong as if it had become prettier.
- Check `hist-ref` §7.3's six rules line by line, including rule 5: **the interiors are as carefully furnished as the mansion's.** A quarter rendered as bare boards and straw is a failure of research, not a statement about hardship. The archaeology gives you colonoware, a white salt-glazed stoneware teabowl, a pewter spoon, a bone-handled knife, a tobacco pipe and oyster shells. Use them.

## 7.6 Five more, cheap to check

| # | Failure | One-line fix | QA |
|---|---|---|---|
| **C-11** | **Buff reads as canary yellow.** Washington's facings come out mustard | `buff: a pale greyish yellow-tan, the colour of undyed chamois leather, not yellow` + hex `#C9B489` as a reference swatch | Sample the pixel. If it is more saturated than the ochre in the same frame, reject |
| **C-12** | **Scenery invades the portrait ground.** A column, a curtain, a landscape appears behind the head | The word *untouched* in `char-style-block.txt` is doing this work; if it fails, add `the background is a blank sheet of paper and nothing else` | Bare-paper ratio 20–35%, run by `scripts/bare-paper.mjs` before anything else |
| **C-13** | **The key eats the wash edge.** The cutout acquires a hard sticker outline | `rembg -a -ae 20`, or matte by hand | Measure the alpha ramp at the shoulder. Under 4 px is a fail |
| **C-14** | **Epaulette stars.** Washington acquires three stars | Already in the lock: *with no stars on them*. Three stars is 1798 | Count. Zero, always |
| **C-15** | **Legible gibberish** on a gorget, a commission, a document in frame | `the writing is illegible: fine ink strokes suggesting cursive, not readable letterforms` — all real text is set in-engine | Zoom every paper and every metal object. Any near-word is a reject |

---

# 8. PRODUCTION LEDGER AND SIGN-OFF

## 8.1 Character-specific ledger fields

Every character asset carries the standard record (`ai-art-production-guide.md` §6.6) plus four fields this document requires:

```json
{
  "asset_id": "gl_xx_pt_washington_st3_band-hi_v01",
  "identity_master": "gl_xx_pt_washington_st2_band-mid_v01",
  "derivation": "nbp-multiref -> wash-v1 img2img denoise 0.24",
  "refs": [
    "gl_xx_pt_washington_st2_band-mid_v01.png",
    "art/refs/peale_princeton_1779.jpg",
    "art/refs/houdon_lifemask_frontal.jpg"
  ],
  "metrics": {"M1": 0.997, "M2": 1.012, "M3": 0.981, "M4": 1.028},
  "register": "R3",
  "sensitive": false,
  "hist_check": {"by": "client", "date": "2026-09-30", "verdict": "pass"}
}
```

- **`identity_master`** — every character asset except the eleven masters points at one. A record with a null master and a non-master asset_id fails CI.
- **`metrics`** — the four ratios from §3.3, as fractions of the master's. Out of tolerance blocks the record.
- **`register`** — `R3`, `R3∩R5`, `R4` or `R6`. Drives which sign-off gate applies.
- **`sensitive`** — true for all R5 assets, the 1st Rhode Island soldier, the dying Rall state, and the Valley Forge hospital figures.

`scripts/verify-ledger.mjs` gains three assertions: every non-master character asset has a resolvable `identity_master`; every `sensitive: true` asset has a `hist_check` from someone other than its `operator`; and every asset whose `register` is `R3∩R5` has a `bare_paper` value in 30–45%.

## 8.2 The character sign-off checklist

Run in order; cheap checks first.

**Automated:**
- [ ] Bare-paper ratio in band for the declared register (R3 20–35%, R3∩R5 30–45%, R4 60–80%, R6 0–3%)
- [ ] No pixel darker than `INK-FLOOR #241C14` (R6 exempt, clamps `#16110D`)
- [ ] No pure `#000000`, no pure `#FFFFFF`
- [ ] Resolution and format per class; ledger record exists and its file exists
- [ ] `identity_master` resolves; `metrics` M1–M4 in tolerance

**Human, 60 seconds:**
- [ ] Clean-shaven, unless German grenadier or Jäger (C-08)
- [ ] Own hair, hairline visible, ears exposed, no wig (C-03)
- [ ] Coat skirt at mid-thigh; collar below the ear lobe (C-05)
- [ ] Hat brim reads as one folded plane, low crown (C-06)
- [ ] Integer age stated in the prompt and legible in the face (C-07)
- [ ] No hands in frame on any portrait (§1.3)
- [ ] No scenery, drapery, column or sky behind the head (C-12)
- [ ] No legible text anywhere in the image (C-15)
- [ ] Women capped, neckline filled, torso a smooth cone (C-09)
- [ ] Buff is not yellow (C-11); British privates duller than officers
- [ ] Reads as the same person as the `identity_master`, printed side by side

**Gated — cannot be waived:**
- [ ] `sensitive: true` assets carry written sign-off per `hist-ref` §7.6, **from someone other than the operator**
- [ ] Arnold and Armstrong: **does the face telegraph what is coming?** If yes, reject (§4.4)
- [ ] Harry: **does the face telegraph the epilogue?** If yes, reject (§4.4)
- [ ] The nine-portrait contact sheet has been printed and looked at by the Art Lead

## 8.3 Order of production

Sequence matters more here than anywhere else in the art pipeline, because every downstream asset references an upstream one.

1. **`gw-face-v1`** character LoRA — 30 images from the Peale corpus and the Houdon mask, 1200 steps, dim 16, trigger `gwface`, on the same klein-4B base so it composes with `wash-v1`.
2. **W5, the canonical master.** Nothing else with Washington in it is generated until it is signed.
3. **The three Washington stance sheets**, from W5 as reference — because Act 1 Scene 1 cannot be built without `st1`.
4. **The hands library** — every stance sheet after the first repairs its hands from it.
5. **The eight Washington derivations**, then the sash and spectacles inpaints.
6. **Sheets 2 and 3** (the R5 subjects) — **started early, because the sign-off gate is two weeks of calendar and it is the only art in the project that cannot be accelerated by working harder.**
7. Remaining master sheets in act order; expression masks follow each master immediately, while the file is still open.
8. Crowd sheets in act order, gated behind that act's costume-plate reference being confirmed.
9. Council emblem sheet and attribute-well sheet — any time; they block only the UI.

---

# 9. ERRATA, OPEN ITEMS, AND THE VERIFICATION QUEUE

## 9.1 Errata issued by this document

| # | Against | Issue | Resolution |
|---|---|---|---|
| **E-C1** | `ai-art-production-guide.md` §3.3 | Stage 2 and Stage 3 both given as *"early fifties."* Washington is **45** at Valley Forge and **49–51** in Acts 6–8. Six years of face | Corrected text in §2.3. General rule: **integer ages in words, never decade words** |
| **E-C2** | `02` §6.2, §6.3 | Stage I spans Acts 1–4 and carries the light blue ribband, but Act 1 is 4 May 1775 and the ribband was ordered 14 July 1775 | Stage I ships **six** files, three without the sash for Act 1. Zero generations; three masked inpaints (§3.6) |
| **E-C3** | `02` §6.2 | Washington's portrait count given as 9 + 1. The Newburgh spectacles (§6.3 rule 3) require a spectacled variant in all three Stage III bands | **16 Washington files.** Zero generations; three masked inpaints (§3.7) |
| **E-C4** | `ai-art-production-guide.md` §2.5, §3.4 | 4-up expression sheets guarantee palette but not identity, which is the axis that actually fails | **Expression variants are masked img2img off the signed master.** Saves 12 generations, which pay for the roster expansion (§4.0) |
| **E-C5** | `02` §6.1 vs `04` §6.2 | Portrait displayed at 288×384; portrait well 300×400 | Both stand. Image centred in the well with 6 px horizontal and 8 px vertical margin (§4.7) |
| **E-C6** | `05` §13.2 | 26 stance sheets → 26 rigged atlases, 20 h segmentation | 26 sheets → **12 rigged atlases and 14 static billboard sets**; 9 h segmentation. 14 of the 26 never move (§5.1) |
| **E-C7** | `ai-art-production-guide.md` §4.3 | 11-piece rig | **12 pieces + 1 alternate head rect.** The full-skirted coat hides the hip joint and earns `coat_skirt` as a separate swinging piece (§5.5) |

## 9.2 Roster changes against `02` §6.2

| Change | Reason |
|---|---|
| 22 subjects → **37** | The act inventory names 34 speaking characters; 22 leaves empty *Persons* tip-ins |
| Added: Harrison, Sullivan, Stirling, Putnam, Glover, Waldo, Dana, Duportail, Lincoln, McDougall, Armstrong, McHenry, Tallmadge, Frank Lee, Doll, Harry | All named, all with dialogue or a *Persons* entry |
| Removed: **John Honeyman** | Contested figure. Attribute Well and a *Persons* entry stating the evidentiary problem (§4.5) |
| Three **age pairs** — Billy Lee, Mifflin, Joseph Plumb Martin | Four people age across this game and they are a private soldier, an enslaved man, a politician and the commander |
| **Generations unchanged at 33** | E-C4 pays for all of it |

## 9.3 Verification queue

| # | Item | Owner | Blocks |
|---|---|---|---|
| **V-C1** | Whether Washington wore two gold epaulettes in **May 1775**, before appointment, in the Fairfax Independent Company uniform | History | The three Act 1 no-sash portraits (§3.6) |
| **V-C2** | A documented name from the 1st Rhode Island muster rolls | History | The soldier's *name only*. The portrait is not blocked (§4.4) |
| **V-C3** | Hessian facing colours at Trenton — **V-1** in `hist-ref` §8, still open | History | Rall's coat and the Trenton crowd sheet |
| **V-C4** | Whether Hessian field **officers** wore moustaches | History | Rall. Generated clean-shaven pending resolution |
| **V-C5** | Whether Horatio Gates habitually wore spectacles | History | Gates's portrait, and the Act 7 spectacles rhyme (§3.7) |
| **V-C6** | The green ribband for aides-de-camp, General Orders 14 July 1775 | History | Hamilton's Act 5/6 re-coat pass (§4.4) |
| **V-C7** | Whether Peale's retouching of Washington's smallpox pitting is well enough evidenced to defend showing it | Art Lead + History | Nothing — the decision is made (§2.2). This is a defence brief, not a gate |

---

# Appendix A — The complete character asset manifest

| Class | Generations | Masked passes | Files shipped | Payload |
|---|---|---|---|---|
| Washington portrait matrix | 9 | 6 | 15 | 0.82 MB |
| Washington Gilt Frame myth face | 1 | — | 1 | 0.06 MB |
| NPC portrait master sheets (2-up × 18) | 18 | — | 36 | 1.98 MB |
| Age-pair second ages | 3 | — | 3 | 0.17 MB |
| Expression variants | — | 41 | 41 | 2.26 MB |
| Re-coat variants (Knox, Hamilton, Greene) | — | 3 | 3 | 0.17 MB |
| Council emblem sheet | 1 | — | 11 cells | 0.04 MB |
| Attribute well sheet | 1 | — | 16 cells | 0.06 MB |
| **Portrait + emblem subtotal** | **33** | **50** | **126** | **5.56 MB** |
| Character stance sheets | 26 | — | 12 rigged atlases + 14 billboard sets | 12.0 MB |
| Crowd sheets | 9 | — | 54 billboards | 4.5 MB |
| Hands library (+ gloved) | 1 | — | 12 cells | 0.05 MB |
| **TOTAL** | **69** | **50** | | **22.1 MB** |

Against `05` §13.2's allocation for the same scope — 33 portrait/emblem generations, 26 stance sheets, 9 crowd sheets, 1 hands sheet from the prop budget = **69**. **Identical.** The roster grows from 22 subjects to 37 and from 78 portrait states to 96 for no additional generation, paid for entirely by E-C4, and the hand-segmentation schedule drops eleven hours by E-C6.

# Appendix B — Every locked prompt file, in assembly order

```
1  [SUBJECT LINE]                      per-asset, §3.4 / §4.4 / §5 / §6
2  art/prompts/char-washington.txt     §2.1  — Washington only, verbatim
3  art/prompts/char-washington-stage.txt §2.3 — Washington only
4  art/prompts/char-washington-band.txt  §2.4 — Washington portraits only
5  art/prompts/char-style-block.txt    §1.1  — every character generation
6  art/prompts/char-framing.txt        §1.2  — one of four lines by class
7  art/prompts/style-block.txt         shared, unchanged, appended last
8  art/prompts/char-negative.txt       §1.4  — or char-negative-german.txt §1.5
```

**Subject first. Identity token first of all. Style last. Negative last of all. Nobody retypes any of it.**
