# The Print Direction
### *In Washington's Shoes* — the medium, settled. Supersedes `09-painterly-direction.md` entirely.
**Version 1.0 — 16 August 2026**
**Owner:** Creative Director. **Audience:** everyone who draws, generates, writes or renders an image.

---

## 0. The decision

**The game is a print.** Line first, flat colour second, on paper. Not an oil
painting, not pen and wash, not an illuminated manuscript: a **printed image of
1775**, in the two media that actually carried images in that year — the
copperplate engraving and the stock woodcut — with the sheet itself always
visible under the ink.

This supersedes `09-painterly-direction.md`, which pivoted the project to alla
prima oil on 15 August, and it restores nothing: `02-art-direction.md` §1 and §4
stay dead. `02`'s palette structure (§2), mood controller (§3), composition and
camera (§5), type (§7), UI and chrome (§8) and anti-references (§9) all remain in
force. `historical-visual-reference.md` is untouched — it is about facts and has
no opinion on ink.

### 0.1 Why the oil direction fell

`09` argued oil because oil is generatable and line is not. Two things
falsified that inside a day.

The figures went to line-and-fill on 16 August, for legibility at eighty pixels,
and that left the plates as the odd thing in the frame — a drawn man standing in
a painting, which `09 §0.2` admitted candidly and could not resolve.

And the generatability argument turned out to be backwards. A procedural
engraver already existed in this repo and worked; a procedural *painter* of oil
never will. Line is the medium a machine can actually make, because a print is a
process with rules, and a painting is a person making decisions. `src/manuscript.ts`
draws a complete scene in a few hundred lines, and twenty-seven of them will
match each other exactly, which no generation run can promise.

### 0.2 What we give up, stated plainly

Atmosphere by tone. A flat drawn picture cannot do weather, distance, or a
sodden grey November morning the way a painted ground can — it has to do them by
palette, by drawn incident, and by what is left off the sheet. The mood
controller must be re-tuned for this: draining colour out of a flat drawn
picture reads as **fading**, not as gloom. That is real work and it is owed.

---

## 1. The grammar

Five rules. They are not style preferences; they are what a relief or intaglio
process physically does, and every one of them was arrived at by getting it
wrong first in `src/manuscript.ts`.

**1.1 The line is a cut, not a stroke.** A relief line is the wood left standing
after everything round it is removed, so it swells where the knife is deep and
tapers to nothing where it enters and leaves. Nib profile `sin(πt)^0.35` for a
woodcut; `^0.6` for the sharper taper of a graver. Width varies **0.7–1.4×
within a stroke** and **0.85–1.15× between strokes**. `ctx.stroke()` cannot do
this — a line is a filled polygon.

**1.2 The wander is low frequency.** A hand cutting a curve deviates over
**18–40 px**, not over 2. High-frequency jitter reads as a bad printer or as a
filter; slow deviation reads as a tool held by a person. This is the single most
commonly botched thing in procedural "hand-drawn" work and it was botched here
first.

**1.3 The contour closes visually, not topologically.** Blocks chip and ink runs
short. Segments **overshoot their junctions** by 1.5–4 px, and roughly one in ten
**breaks**. Never `lineJoin: 'miter'`.

**1.4 The colour misses the line.** A sheet was cut by one person and coloured
by another, working fast over the top: the flat overshoots the contour on one
side and falls short on the other by a millimetre or two. **This is the highest
value cue in the entire style relative to what it costs.** Perfect registration
between a fill and its contour is the loudest possible signal that a machine
made the picture, and it survives even when the line has been roughened.

**1.5 Two flat tones, and never a gradient.** Where a form needs a shaded side it
gets a second flat of the same hue, 12–18% darker, **with its own drawn edge**.
If a form needs a third value it needs hatching, not a third flat. `createLinearGradient`
is banned outside the plate bite.

### 1.6 Colour, and where it comes from

Not a colour wheel: a **materials list**. Pentiment's palette was read off a
facsimile of the Nuremberg Chronicle because that told the art director which
pigments were available *in that region at that time*. The mechanism transfers;
the Bavarian conclusion does not. Ours is the colonial pigment list — earth
reds and ochres, verdigris, indigo, lamp black, white lead — and the ground is
**laid rag paper**, lighter and cooler than parchment, with chain lines and a
wire mould in it.

**Nothing is pure black. Nothing is pure white.** The darkest value in a frame is
the ink of the line (`INK.SETTLED #3B2E22`, floor `INK.FLOOR #241C14`); the
lightest is the sheet. Both already exist in `src/palette.ts` and were arrived at
independently, which is a good sign.

### 1.7 Density is banded, not uniform

| Band | Line incident | Fill |
|---|---|---|
| Near | Full — courses, tile ranks, grass, foliage lobes, each drawn | Flat, one or two tones |
| Mid | Contour plus one coarse hatch pass | Flat |
| Far | Contour, or silhouette only | Flat, one tone |

**Texture is carried entirely by line. A fill is always flat.** If a wall reads as
stone it is because somebody cut the courses, not because a noise function
roughened the colour. A scene reads *rich* rather than *busy* because the
incident is concentrated in the near band, where the eye already is.

---

## 2. The registers — style is an attribute of the depicted

The most transferable idea in the reference, and it is a writing device as much
as an art one. Pentiment does not change style by chapter. It runs **simultaneous
registers keyed to who is being depicted and by what technology**, so a nun is
drawn in the old illuminated hand while the learned protagonist is drawn in the
new woodcut, and the difference *is* the characterisation.

Ours, substituted for 1775:

| Register | Medium | Who and what it carries |
|---|---|---|
| **A — the considered image** | Copperplate line engraving. Doolittle, Revere. | The default world. What has been looked at and thought about. |
| **B — the cheap image** | Stock newspaper woodcut: blunt, crude, reused. | Rumour, broadside, mob, the street. Note the inversion against Pentiment — here the hand-cut block is the *vulgar* medium, not the prestigious one. |
| **C — the mechanical image** | Caslon letterpress, perfectly regular. | Print, orders, Congress. Its perfection is the point. |
| **D — the private image** | Pen-and-wash officer's topographical sketch. Davies, Robertson. | The unfinished on-the-spot record. Interludes, the map table. |

**Amos Doolittle is our Nuremberg Chronicle.** Four plates, published December
1775, engraved after Ralph Earl — the only contemporary images of Lexington and
Concord, naive in perspective, hand-coloured in some impressions. He is already a
findable object in `CB-03`, which means the game can teach its own medium.

---

## 3. What is period-locked to 1500 and must NOT be copied

The hardest-won section of the research, and the one most likely to be got wrong
by someone working from the reference images alone.

| Do not copy | Why it is wrong for 1775 |
|---|---|
| **Naive, pre-perspective flat space** | Linear perspective is ~350 years old by 1775 and universally taught; a provincial silversmith attempts it. Flat medieval space reads as *the wrong century*, not as a style. |
| **Blackletter as a reading hand** | By 1775 textura survives only as display — mastheads, proclamations, fraktur. Body text is roman. |
| **Gold leaf, historiated initials, marginal drolleries** | Dead as living practice long before 1775. |
| **Parchment or vellum as the ground** | 1775 America is laid rag paper. Parchment is for engrossed legal instruments only. |
| **The scriptorium framing device** | There is no scriptorium in 1775 America. |

> **`STATE.md`'s perspective rule stands, and is now load-bearing.** "The
> perspective is exact. Scale is proportional to height below the horizon." Keep
> it. What we borrow instead is *amateur* perspective, not *absent* perspective:
> give each building its own vanishing point offset ±8–14% of frame width from
> the true one, with roof pitch jittered ±3°. Slightly-wrong perspective is what
> 1775 actually looks like, and it costs one number per building.

### 3.1 The luckiest finding

Colonial printers kept **"stock" woodcuts for repeated use** — the same cut of a
ship or a coffin ran beside unrelated stories for years, because cutting a new
one was slow and copperplate was rare before 1800 (NPS, *Printmaking in the
American Colonies*). A motif library reused with varied placement, scale and
mirroring is therefore **historically correct**, not a budget compromise. Vary
placement and orientation of authored shapes; never procedurally vary the shape
itself, which always looks like procedurally varied shape.

---

## 4. Where the code is

| Piece | File | State |
|---|---|---|
| The cut line, mis-registration, flat tones, drawn incident | `src/manuscript.ts` | Built. The camp is drawn. |
| Drawn plates in the engine's layer stack | `src/manuscript.ts` `DRAWN_PLATES` | Built. Layers drawn separately, so occlusion never arises. |
| The hatching engine, plate mark, foxing | `src/engraving.ts` | Built, in use for interstitials. Promote to shared. |
| Paper as a multiply pass | `src/manuscript.ts` `paper()` | Built for the bench. In-engine the post shader's grain does it. |
| Figure sheets, line-and-fill | `src/figures.ts` | Built. |
| Per-speaker type, wet-to-dry ink | — | **Owed.** `INK.FRESH` → `INK.SETTLED` is already the wet→dry pair. |
| Stepped 8 fps figure clock | — | **Owed.** Half an hour, and it is what keeps a moving figure reading as a print. |
| Mood controller re-tune for flat art | `src/renderer.ts` | **Owed.** See §0.2. |
| The other three scenes | `src/manuscript.ts` | **Owed.** Only `camp` is drawn. |

---

## 5. Acceptance

Replaces `09` §7 in full.

1. Does every contour swell and taper, and does it break somewhere?
2. Does the colour miss the line — overshooting one side, short on the other?
3. Two flat tones per form. Is there a gradient anywhere? If yes, reject.
4. Is the darkest value the ink, and the lightest value the sheet?
5. Is the near band carrying the incident, and the far band carrying almost none?
6. Could this be an illuminated manuscript? If yes, reject: wrong century.
7. Is the perspective *slightly wrong* rather than *absent*?
8. Squint until it is eighty pixels. Is the figure still findable against it?
