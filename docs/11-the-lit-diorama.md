# The Lit Diorama
### *In Washington's Shoes* — the medium, and the interface, rebuilt
**Version 1.0 — 19 August 2026**
**Owner:** Creative Director. **Audience:** everyone who draws, writes, or renders.

---

## 0. The decision

**The world is a lit diorama: pixel figures standing in a small three-dimensional
place, under one raking light, seen through a long lens at a fixed angle.** The
archive — documents, the letterbook, the type — stays print.

This supersedes `10-the-print-direction.md` entirely and `09-painterly-direction.md`
with it. `02-art-direction.md` §1 and §4 stay dead. What survives from `02` is
its palette *structure* (§2), its composition thinking (§5), its typography
(§7) and its anti-references (§9). `04-scene-architecture.md`'s camera numbers
are superseded by §3 below. `reference/historical-visual-reference.md` is
untouched: it is about facts and has no opinion on how anything is drawn.

### 0.1 Why the print direction fell, stated plainly

It did not fail on taste. It failed on two things it could not fix.

**It had no acceptance test.** `10 §5` is eight questions the project wrote for
itself, judged against a standard that existed only in one head. Every plate
re-litigated the medium. Four art directions in four days is the symptom;
the absence of an external target is the disease. A lit diorama has an
external target — you can hold the frame up against *Octopath Traveler* or
*Dragon Quest III HD-2D* and say yes or no — and that alone ends the churn.

**It had an admitted hole where the brief's spine goes.** `10 §0.2` conceded
that a flat drawn picture cannot do weather, distance or gloom, and that
draining colour out of one reads as *fading* rather than as *grief*. The
brief's central mechanic is that the world's mood answers the player's hidden
state. The print direction could not carry it and said so. This one carries it
in light, which is what light is for.

### 0.2 What we give up, stated plainly

The historiographic argument that the world itself was making. An engraved
1775 says *this is an image made in 1775*; a lit diorama says *this is a game*.
That is a real loss and it is why the archive stays print: the register survives
where the pedagogy actually lives, in the documents the student reads.

We also give up any claim to being the only game that looks like this. It is a
popular style. In exchange the player — fifteen years old, on a school
Chromebook, in period four — opens it and recognises something they would
choose to play, and that is worth more to this project than singularity.

---

## 1. The three layers, and which does the work

**1.1 Pixel figures.** 32×48, four directions, four frames, stepped at 8 fps and
never interpolated. Generated from one spec object per person by
`engine/actors.ts`, which also draws that person's dialogue portrait, so the man
you spoke to and the face in the panel can never disagree.

Why 32×48 and not Salem's 16×24: 1775 is a costume argument. The whole of Act 1
turns on a coat. A lapel is four pixels at this size and zero at the last one,
and a student has to be able to tell blue-faced-buff from a plain brown coat
from a livery of white faced scarlet from osnaburg at a glance.

**1.2 A real place.** Ground is a tile mesh with elevation and cut-bank risers.
Buildings are boxes with a generated texture per face and a pitched roof.
Everything else is a billboard tilted to exactly the camera's pitch, so it
stands up and its feet are on the ground.

**1.3 The post stack, which *is* the art direction.** Tilt-shift, bloom,
vignette, grade. Strip these four passes and what is left is a competent tile
game. The sprites are not doing the work; the light is.

> **The trick, named.** The figures read as the subject because everything
> around them is soft. That is the whole of it. Sharp pixels inside a blurred,
> bloomed, graded world.

---

## 2. Light is the mood system

`02 §3`'s nine shader uniforms are gone. A mood is now a `Light`: three colours,
a sun azimuth, and three scalars — contrast, bloom, saturation. `palette.ts`
holds them and `post.ts` turns one into a grade.

Two consequences worth stating:

**Light is baked into vertex colours.** There is not a single real light in the
scene and no shadow map. Sun times normal, plus ambient, plus the shadow a
building throws, computed once at map build. On the reference Chromebook this
is the difference between a scene and a slideshow.

**Shadows fall down-screen and to the right, always, whatever the sun is doing.**
This is a lie and it is the same lie every game in this genre tells. The sun
azimuth is chosen to light the walls the camera can see, which puts it behind
the viewer, which would throw every shadow where none of them can be seen.
Decoupling the two costs nothing and contact shadows are the largest single
thing separating a lit diorama from a board with pictures on it.

### 2.1 The Witness Register, re-expressed

`MV-03` used to be a separate scene with its own art rules. The world is
continuous now, so it is a **zone**: a rectangle of the estate that carries its
own `Light`. Walk north past the timber and, over about eight paces, the bloom
goes to zero, the saturation falls to a sixth, the warmth comes out of the key,
and the camera comes in from thirty units to twenty-two — as near to standing at
eye level as a fixed pitch can get.

The only colour the grade lets through is what people own: a dyed neckerchief,
a copper ring, a blue glass bead. Nothing announces the change. A student who
walks in and out again feels the prettiness stop and cannot immediately say why.

**The prettiness of this style stops at that gate, and the fact that it stops is
the argument.** Do not make that scene beautiful.

---

## 3. The camera

**Fixed pitch 0.63 rad (36°). Long lens, 26° vertical field. Thirty units back
outside, seventeen inside. It follows with a soft lag and it never rotates.**

This supersedes `04 §3.1`'s 20° and `§3.2`'s frontal interior. Two reasons:
36° is where a walkable floor plan is legible, which a free-roaming estate now
needs; and a long lens at a fixed angle is exactly the tilt-shift setup the
reference uses to flatten the view while keeping the depth.

**R8 survives and is load-bearing.** No rotation, ever, and no player zoom. The
Octopath II team's own note is the warning: adding camera angles forced them to
detail every space that became visible. A nailed camera means we build only what
is in frame — and it is what lets the north wing be drawn open and stay open.

**The camera aims past him, not at him.** The aim point sits a man's height up
and about three tiles further into the scene, scaled by the camera distance, so
the figure drops into the lower third and the world ahead of him gets the rest
of the frame.

---

## 4. What is generated, and what that buys

**Nothing ships as an image.** Every sprite, tile, facade, roof and portrait is
drawn procedurally into an offscreen canvas at boot and handed to WebGL as a
texture. No `.png`, nothing fetched, no CORS, nothing for a district filter to
block, and `npm run build:single` stays one file a teacher can put on a USB
stick.

This is Salem's pipeline (`salem-witch-experience-/src/engine/pixels.js`),
inherited and scaled up, and it is the answer to the only question that could
have sunk this direction: who draws four hundred sprites. Nobody does. They
cost lines, not megabytes.

Two rules from that file are load-bearing and are repeated here because
breaking either one is invisible until it is catastrophic:

1. **Never `Math.random()` for anything drawn.** Use `hash()`. A texture that
   reseeds between frames shimmers; one that reseeds between runs means two
   students see different houses.
2. **Integer coordinates only.** A pixel drawn at x=4.5 is two grey pixels, and
   the whole style dies of it.

---

## 5. The interface

The old chrome was a sheet of paper with the game printed on it, and it read as
a worksheet. Rebuilt in `ui/`:

- A **framed panel** language — moulded edge, brass line, wood ground.
- A **portrait** in its own frame beside every speaker.
- **Council voices** arriving one at a time, each with its emblem and its ink,
  each with its own note in the audio.
- A **choice list with a cursor**, favoured voices shown as emblems on the right,
  locked options struck through with the reason in the margin.
- The **sealed decisions** carry wax and the line THIS WILL NOT COME AGAIN.
- A **letterbook** with four tabs — Documents, People, Decided, Save code.
- **Sound**, synthesised: footfalls by surface, a type blip, a voice tone per
  Council member, and one heavy sound reserved for a sealed decision committing.

R17 is not negotiable and is obeyed: all dialogue, Council and system text is a
plain humanist sans at 19px on a 58–66 character measure. Period faces appear in
documents and nowhere else. R18 is obeyed: 45 characters a second, any input
completes the block.

**The archive stays print.** The document reader is a laid-paper sheet with the
four registers — Printed, Secretary, Engrossed, Rough — set in a serif over
blank ground. That is where the period argument still lives and it is the object
the pedagogy is actually about.

---

## 6. Acceptance

Replaces `10 §5` in full.

1. Squint. Is the figure the sharpest thing in the frame, and is everything
   around him softer than he is?
2. Is there one raking light, and does every building have a lit flank and a
   shaded one?
3. Does something on the ground carry a shadow toward the viewer?
4. Are the sprite's feet on the ground, or is it floating?
5. Is the darkest value in frame a colour, not black?
6. Hold it beside a frame of the reference. Is it obviously trying to be the
   same thing, and obviously failing? Then fix it. Obviously succeeding? Ship it.
7. Walk it. `npm test` floods every map from its spawn and will tell you if a
   building has been put across a lane; it will not tell you if the walk is dull.
8. In the Quarter: is there any bloom, any warmth, any saturated colour that is
   not something a person there owns? If yes, reject.

---

## 7. What this cost, in files

Deleted: `art.ts` (4,717 lines of procedural placeholder), `manuscript.ts`
(1,328), `renderer.ts`, `ground.ts`, `scenery.ts`, `figures.ts`, `theatre.ts`,
`transition.ts`, `emblems.ts`, `portraits.ts`, `content.ts`, `ui.ts`,
`variants.ts`, `bakeoff*.ts`, and the four old scene files.

Untouched: `state.ts`, `council.ts`, `passport.ts`, `ledger.ts`,
`scene-order.ts`. The story, the four stats, the five voices, the save codes and
the eight sealed decisions never depended on how anything was drawn, which is
the best thing that can be said about the design underneath all this.
