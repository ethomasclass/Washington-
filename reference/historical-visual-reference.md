# Historical Visual Reference Pack
### *In Washington's Shoes* — the factual substrate for all generated art
**Version 1.0 · Supersedes nothing; everything downstream depends on it**

---

## 0. How to use this document

This is the **factual layer**. The AI art prompt guide is built on top of it. Nothing goes into a
generation prompt that isn't traceable to a claim here, and nothing here is a suggestion — where two
plausible options exist I have picked one and said why.

### 0.1 Confidence tags

Every load-bearing claim carries one of three tags. Teachers will challenge things; the tag tells you
how hard to defend.

| Tag | Meaning | How to treat it |
|---|---|---|
| **[DOC]** | Documented in a primary source or in a museum/park-service authority that cites one. | Assert freely. Cite if challenged. |
| **[RECON]** | Reconstructed by scholars from partial evidence (archaeology, later accounts, comparative uniform study). | Assert, but phrase in-game as "as reconstructed." |
| **[CONV]** | Conventional in the reenactment / uniform-plate literature but I could not run it to a primary source in the time available. | **Verify before art lock.** Do not put in student-facing text. |

### 0.2 The Rule of the Canonical View

Because the game is fixed-camera painted dioramas (design decision #3), each location is generated
**once, from one canonical angle, and never re-derived**. That means every location entry below ends
with a `CANONICAL VIEW` line specifying camera height, angle, and time of day. That line is the
contract. Once a location's canonical view is generated and approved, it becomes the reference image
for all subsequent passes on that location (weather variants, stat-mood variants, night variants).
**Never ask the model to "show the other side" of a location.** If the script needs another side, it
is a different location with its own canonical view and its own reference lock.

### 0.3 The period lock table

The single most common category of error in this project will be **anachronism inside the game's own
timeline** — Valley Forge blue-and-buff regularity showing up at Cambridge, a Mount Vernon piazza in
1775, a Stars and Stripes at Boston. Pin every asset to a year before prompting.

| Act | Location | Date lock | Army's visual state | Absolutely forbidden on screen |
|---|---|---|---|---|
| 1 | Mount Vernon | **May 1775** | n/a (civilian) | Piazza, cupola, Dove of Peace weathervane, finished New Room, any US flag |
| 2 | Cambridge / Boston lines | **Jul 1775 – Mar 1776** | Improvised: civilian clothes, hunting shirts, no standard | Blue-and-buff rank and file, Stars and Stripes, standardised anything |
| 3 | Brooklyn Heights / NY | **Aug 1776** | Improvised, worse | Stars and Stripes (pre-dates 14 Jun 1777 resolution), blue regimentals in quantity |
| 4 | Delaware / Trenton | **25–26 Dec 1776** | Rags; the nadir | Stars and Stripes, snow-white winter fantasy, blue regimentals in quantity |
| 5 | Valley Forge | **Dec 1777 – Jun 1778** | Rags → first "lottery coats" arrive late 1778 (i.e. *after* this act) | Regulation 1779 facings, tidy uniformity, log cabins with chinked round-log "frontier cabin" look |
| 6 | Newburgh / New Windsor | **Mar 1783** | Best-dressed the army ever was: 1779 regulation, patchy | Rags-and-bandages iconography; that's Act 5's register, not this one |
| 7 | Yorktown | **Sep–Oct 1781** | Transitional: some 1779 regulation, much hunting shirt and improvisation | Uniformity; French fleet visible from the siege lines (see §3.7) |
| 8 | Annapolis State House | **23 Dec 1783** | Civilian-formal; Washington in uniform one last time | Anything military beyond Washington himself and two aides |

---

# 1. Uniforms and dress, 1775–1783

## 1.1 The one fact that governs everything

**There is no such thing as "the Continental Army uniform." There are three successive visual regimes,
and the game spans all three.** An image model asked for "Continental Army soldier" will return a
single averaged blue-and-buff figure — which is correct for roughly the last quarter of the war and
wrong for the first three-quarters. This is the highest-frequency error the project will produce and
it must be designed against, not corrected after.

The three regimes:

| Regime | Dates | Game acts | One-line visual |
|---|---|---|---|
| **A — Improvised** | Apr 1775 – late 1777 | 2, 3, 4 | Civilian coats, homespun, hunting shirts. Colour is *accidental*. |
| **B — Lottery coats** | late 1778 – 1779 | (5's tail, 7's base) | Half the army in brown-faced-red, half in blue-faced-red, from one French contract. Colour is *arbitrary but uniform-in-blocks*. |
| **C — Regulation** | Oct 1779 – 1783 | 6, 7 (partly), 8 | Blue coats, facings by state grouping. Colour is *systematic*. |

---

## 1.2 Regime A — the improvised army, 1775 to late 1777

### What men actually wore
Whatever they owned. The Rev. William Emerson, writing from the Cambridge lines on 17 July 1775,
described the camp itself in terms that describe the army: *"'Tis very diverting to walk among the
camps… every tent is a portraiture of the temper and taste of the persons that encamp in it. Some are
made of boards, some of sailcloth, and some partly of one and partly of the other. Others… of stone,
and turf… others of birch and others brush."* **[DOC]** The clothing was the same: a patchwork of
civilian dress. ([Emerson, quoted widely; see Revolutionary War Journal](https://revolutionarywarjournal.com/a-drunken-canting-lying-hypocritical-rabble/))

Concretely, on screen at Cambridge and Brooklyn:
- **Civilian coats** in undyed, walnut-dyed, madder-dyed, or indigo homespun — brown, drab, russet,
  butternut, dull blue, dull green. No two men matching.
- **Waistcoats** worn as outer garments in warm weather — very common, and visually distinctive
  (sleeveless, thigh-length, buttoned to the throat).
- **Shirtsleeves** — extremely common in summer camp. Shirts are full-cut, gathered at neck and wrist,
  in unbleached linen (oatmeal/greyish), or checked blue-and-white linen.
- **Breeches** to the knee with a fall front, or (increasingly, and by 1777 dominantly) **overalls** —
  full-length trousers with an integral foot strap or attached gaiter, in linen, canvas, or wool.
- **Round hats and cut-down cocked hats.** A militiaman's hat is a civilian felt hat, often with the
  brim let down on one or two sides.

### The hunting shirt
The single most visually useful garment in Regime A, and a genuine teaching object.

- A loose, long-sleeved pullover or wrap frock of **linen or homespun**, thigh- to knee-length, with a
  **shoulder cape** and **fringe** on cape, cuffs and hem, closed with a belt or wrapped and tied. **[DOC]**
- It was **not** New England dress at Lexington, Concord, or Bunker Hill. It arrived at Cambridge in
  July–August 1775 with the rifle companies from Virginia, Maryland and Pennsylvania. **[DOC]**
- Washington pushed it as a cheap universal garment. General Orders, 24 July 1776: *"No dress can be
  cheaper, nor more convenient… it is a dress justly supposed to carry no small terror to the enemy,
  who think every such person (so dressed) is a complete marksman."* **[DOC]**
  ([HISTORY](https://www.history.com/articles/american-revolution-uniforms))
- Colours: undyed linen (oatmeal, greyish-white), butternut brown, or dyed dull green, dull blue, or
  brick. Fringe is usually the same cloth, sometimes contrasting.

> **Production note.** The hunting shirt is the project's best friend. It is (a) genuinely period,
> (b) instantly readable as "not a redcoat, not a modern soldier," (c) tolerant of AI variation
> because it was *supposed* to vary, and (d) survives into 1781 — a de Verger figure at Yorktown wears
> one. Lean on it hard for Acts 2, 3, 4 and for the militia in Act 7.

### Rifles vs muskets — do not get this wrong
The riflemen who brought the hunting shirt carried **rifled longarms** (the American/Pennsylvania
longrifle: long, slim, browned octagonal barrel, curly-maple stock, brass patchbox, **no bayonet lug**).
Everyone else — the overwhelming majority of both armies — carried **smoothbore flintlock muskets with
bayonets**. Riflemen were a small specialist minority. See §4.3 and §6 failure mode F-07.

---

## 1.3 Regime B — the "lottery coats," late 1778

In late autumn 1778 the army received roughly **10,000 suits of French-contract uniform**: regimental
coats, white wool breeches, waistcoats, and lead-grey stockings. **Half the coats were brown faced with
red; half were blue faced with red.** Which state line got which colour was decided by **drawing
lots** — hence "lottery coats." **[DOC]**
([Wm. Booth, Draper](https://wmboothdraper.com/product/1778-french-contractor-coat-for-continental-army-aka-lottery-coat-size-38/);
[Kochan, *The French-made Lottery Uniforms of the Continental Army 1777–1779*](https://www.scribd.com/document/272894004/))

This is a genuinely strange and memorable fact — an army whose coat colour was decided by lottery —
and it is a good collectible-document hook. Visually it gives you **two-tone crowds**: blocks of brown
and blocks of blue, both with red cuffs and lapels, in the same formation.

**Timing warning for Act 5.** These arrived *after* the Valley Forge winter (Dec 1777 – Jun 1778).
Valley Forge itself is Regime A at its worst. Washington reported on 23 December 1777 that nearly
**3,000 men were "barefoot and otherwise naked."** **[DOC]**

---

## 1.4 Regime C — the regulation of 2 October 1779

Washington's General Orders of **2 October 1779** fixed blue as the coat colour for the whole line and
assigned facings by state grouping. This was possible only because the French alliance had finally
made cloth available. **[DOC]**

### The facing table — memorise this

| Group | Coat | Facings (collar, cuffs, lapels) | Lining | Buttons | Notes |
|---|---|---|---|---|---|
| New Hampshire, Massachusetts, Rhode Island, Connecticut | Blue | **White** | White | White (pewter) | The largest bloc; the "default" Continental look |
| New York, New Jersey | Blue | **Buff** | White | White | Buff = pale yellowish-tan leather colour, *not* yellow |
| Pennsylvania, Delaware, Maryland, Virginia | Blue | **Red** | White | White | Virginia's inclusion is standard in the uniform literature **[CONV]** |
| North Carolina, South Carolina, Georgia | Blue | **Blue** | White | White | Buttonholes edged with **narrow white lace/tape** — this is the only way to read them |
| **Artillery & Artillery Artificers** | Blue | **Scarlet** | Scarlet | **Yellow (brass)** | Hat bound yellow; coat edged narrow **yellow** worsted lace, buttonholes the same |
| **Light Dragoons** | Blue | **White** | White | White | |
| **Generals & staff** | Blue | **Buff** | Buff | Yellow | Washington's own; see §2.3 |

([History of Massachusetts Blog](https://historyofmassachusetts.org/uniforms-revolutionary-war-soldiers/);
[Google Arts & Culture / US National Archives](https://artsandculture.google.com/story/threads-of-independence-the-evolution-of-the-iconic-blue-uniform-u-s-national-archives/WQUBpsvTZriEbQ))

### The essential caveat
**The regulation was aspirational.** Standardisation lagged for years; many units never conformed.
Lee's Legion went south in October 1780 in **short green jackets**. **[DOC]** A subsequent 1782 order
is often cited as changing all facings to red except generals and staff **[CONV]**.

> **Decision:** the game uses the **1779 scheme through to Annapolis in December 1783**, and ignores
> the 1782 order. Reason: implementation of the 1782 order in the field is poorly evidenced, the 1779
> scheme is what the surviving imagery of 1781–83 shows, and a single consistent scheme across Acts
> 6–8 is worth far more to asset consistency than a marginal accuracy gain.

> **Decision:** even in Acts 6 and 7, **one figure in four is out of regulation.** A perfectly uniform
> Continental line is a historical error *and* an aesthetic one — it reads as a toy-soldier set. Bake
> the ratio into the crowd-composition prompt.

---

## 1.5 Headgear — the highest-risk single object in the game

### The cocked hat
- A **black felt hat**, brim cocked (turned up and fastened) on **three sides** for the "tricorne"
  silhouette, or on **two sides** ("bicorne"/military cock) which became more common late.
- **The brim is a flat plane that has been folded up against the crown.** It is not a stiff triangular
  shell, not a pirate hat, not a Napoleonic bicorne worn fore-and-aft.
- The **crown is low** — roughly 4–5 inches — and the folded brim sits close against it.
- Trimmed with worsted or metallic **binding tape** on the brim edge; a **black cockade** (a rosette of
  folded ribbon, roughly 3–4 in across) on the left side, held by a button and loop.
- After 1778, American troops often wore a **black cockade with a white centre** as a compliment to the
  French alliance **[CONV]**; the French wore a **white cockade** (Bourbon).
- On campaign the cock was frequently let down or the hat cut down into a **round hat** with a low crown
  and a narrow brim, sometimes with one side pinned up.

### British light infantry caps
Light companies discarded the cocked hat entirely. They wore **short leather or cloth caps** with a
front plate or a fabric turban and often a crest or feather — a huge variety, essentially regimental.
**[DOC]** These are visually much closer to a modern jockey's or a dragoon's cap than to a tricorne.

### British grenadier caps
By the 1768 Clothing Warrant, grenadiers and Foot Guards wore **black bearskin caps**, up to ~18 inches
high, with a black metal front plate bearing the royal crest, "G R," and the motto **NEC ASPERA
TERRENT**. **[DOC]** ([Redcoats & Revs, Clothing Warrant 1768](https://www.redsandrevs.co.uk/clothing-warrant-1768))

### Hessian grenadier mitre caps — the money object
The single most photogenic hat in the war, and the one the game most needs to get right for Act 4.

- A **tall, rigid, pointed mitre** — cloth body over a stiffened frame, with a **large embossed brass
  front plate** stamped with the **Hessian lion**, brass supports, and a **brass finial** at the tip.
  **[DOC]** ([Museum of the American Revolution](https://www.amrevmuseum.org/collection/hessian-cap-plates);
  [NMAH](https://americanhistory.si.edu/collections/object/nmah_433169))
- Prussian in derivation, because the Hesse-Kassel army was modelled on Prussia's. **[DOC]**
- The heavy brass plates were often **removed before combat** **[DOC]** — a lovely, specific detail if
  you want a "these men were ready, not drunk" beat at Trenton.
- **Fusilier caps** are the same idea but **shorter**, with a **smaller** plate. Fusilier regiments (e.g.
  Alt von Lossberg, von Knyphausen) are distinguished from grenadiers (von Rall) primarily by cap
  height. **[DOC]**
- **Musketeer** regiments wore ordinary cocked hats.

---

## 1.6 Accoutrements — what hangs on a soldier

This is where AI models default to Napoleonic or Civil War kit. Be explicit.

| Item | Description | Worn how |
|---|---|---|
| **Cartridge box / pouch** | Black leather flap over a **drilled wooden block**. British and (from 1778) better Continental pattern held **29 rounds**. **[DOC]** Earlier/poorer Continental issue was a smaller pouch or a **tin canister** holding ~36 cartridges. **[DOC]** | On a **broad buff or whitened leather shoulder belt over the LEFT shoulder**, box riding on the **right hip**. |
| **Bayonet & scabbard** | Triangular-section socket bayonet, ~15–17 in blade, in a black leather scabbard with brass or white-metal throat. | Second shoulder belt over the **right** shoulder, scabbard on the **left** hip. Two belts crossing on the chest is the correct silhouette. |
| **Waist belt** | Alternative to the bayonet shoulder belt, especially for Continentals and militia. | Buff/white leather, plain rectangular buckle. |
| **Knapsack** | Coarse **linen or painted canvas**, sometimes **plaid**, envelope-shaped, often **painted** with a regimental device. Not a leather backpack. **[DOC]** | Two straps over the shoulders, or a single strap; a **tumpline** (single broad strap) also used. |
| **Haversack** | Off-white linen bag for food, roughly 12×14 in. | Single strap, opposite side from the cartridge box. |
| **Canteen** | **Wooden** — a small kegged "cheesebox" drum with a wooden or tin spout, iron hoops — or **tin**, a flattened kidney or drum shape. Never a modern round felt-covered canteen. **[DOC]** | Single narrow strap or cord. |
| **Gaiters / half-gaiters / overalls** | Buttoned linen or wool leggings from shoe to knee (black, white, or brown), OR full-length overalls covering the leg entirely. Both correct; overalls increasingly dominant after 1777. | |
| **Shoes** | Blunt, square-toed, buckled or latched **straight lasts** (no left/right distinction). Black or russet leather. | |

---

## 1.7 Rank and command — how Washington is identified in a crowd

- **General Orders, 14 July 1775:** *"The Commander in Chief… is to be distinguished by a light blue
  Ribband, wore across his breast, between his Coat and Waistcoat. The Majors and Brigadiers General,
  by a Pink Ribband wore in the like manner."* **[DOC]**
  ([Library of Congress, GW Papers](https://www.loc.gov/resource/mgw3g.001?sp=20&st=text))
- **General Orders, 18 June 1780:** rank moves to **stars on epaulettes** — major general two stars per
  epaulette, brigadier one. **[DOC]**
- Washington wore **two gold bullion epaulettes**, one on each shoulder, throughout. **[DOC]**
  ([Mount Vernon, General Washington's Military Equipment](https://www.mountvernon.org/preservation/collections/general-washingtons-military-equipment))
- **Washington did not wear three stars during the Revolution.** He first wore three stars as Lieutenant
  General in **1798**. Putting three stars on him at Yorktown is a real, catchable error. **[DOC]**

> **Decision for the game:** Washington wears the **light blue ribband across the breast in Acts 1–5
> (1775–1778)** and **no ribband in Acts 6–8 (1781–1783)**, with two plain gold epaulettes throughout.
> Reason: Peale's 1779 Princeton portrait still shows the sash; the 1780 order shifts the system to
> epaulettes; and dropping the sash gives the late-war portrait ladder a free, silent signal that time
> has passed. The exact date Washington personally stopped wearing it is **[RECON]** — do not put a
> date in student-facing text.

---

## 1.8 British regulars

Governed by the **Royal Clothing Warrant of 1768**. **[DOC]**

- **Coat:** brick-to-madder **red** (the private soldier's red is a warm brick/madder, *not* the deep
  scarlet of officers — officers' coats were dyed with cochineal and are visibly brighter and richer).
  Close-fitting, **turned-down collar**, **lapels 3 in wide running to the waist**, short skirts.
- **Facings:** regimental. Collar, cuffs and lapels in the regiment's colour. The ones you need:
  - 4th, 23rd (Royal Welch Fusiliers), 7th (Royal Fusiliers), 8th, 60th — **royal blue** ("Royal" regiments)
  - 5th — **gosling green**; 10th — **bright yellow**; 17th — **greyish white**; 33rd — **red**;
    38th — **yellow**; 40th, 43rd — **white**; 44th — **yellow**; 49th — **green**; 52nd — **buff**;
    64th — **black**; 71st (Fraser's Highlanders) — **white**. **[CONV]** — verify per regiment before
    naming any unit on screen.
- **Lace:** worsted **button lace** looping the buttonholes, **white ground with coloured stripes**
  unique to each regiment. **[DOC]** This is a fine detail — at diorama scale it reads as a rhythm of
  pale bars down the chest, which is exactly what you want and exactly what AI will smear.
- **Small clothes:** white waistcoat and breeches; **black half-gaiters** or full gaiters.
- **Belts:** two **whitened buff leather** crossbelts. Pipeclayed white, not modern bleached-white.
- **Campaign reality:** by 1777–81 coats were shortened, hats cut down, lace stripped, and officers
  dressed down to avoid riflemen. **[DOC]** For Yorktown, the British should look **worn, faded, and
  simplified** compared to a 1775 parade impression.
- **Flank companies:** grenadiers (bearskin caps, **wings** on the shoulders) and light infantry
  (leather caps, wings) flank each battalion. Wings — small crescent-shaped shoulder pieces edged in
  lace — are the tell.

---

## 1.9 German auxiliaries ("Hessians")

Hesse-Kassel supplied line infantry (musketeer, fusilier, grenadier regiments), **Jäger** rifle
companies, hussars and artillery. **[DOC]**
([American Battlefield Trust](https://www.battlefields.org/learn/articles/hessians-auxiliaries))

- **Coats: dark Prussian blue**, cut in the Prussian manner, with regimental facings, worsted lace, and
  **straw-yellow or white** waistcoat and breeches; **black gaiters**.
- **Jägers wore GREEN**, with crimson or red facings, and carried **short rifled carbines** — this is
  the one German unit that legitimately carries a rifle.
- **Headgear** as §1.5: grenadier mitres, shorter fusilier mitres, musketeer cocked hats.
- **Moustaches.** German grenadiers and Jäger wore moustaches; British and American soldiers were
  **clean-shaven** (Continental practice was to shave every three days unless in the field). **[DOC]**
  ([Kabinettskriege](http://kabinettskriege.blogspot.com/2019/08/soldiers-and-facial-hair-in.html);
  [7th Virginia](https://www.7vr.org/single-post/2018/07/12/18th-century-facial-hair-shaved-close))
  This is enormously useful: **facial hair becomes a faction marker**, and it gives the art prompt a
  hard, checkable rule that fights the model's default toward stubble on everyone.

### The three regiments at Trenton
The Trenton garrison was ~1,400 men in three regiments under Col. Johann Rall: **Rall (grenadier)**,
**Alt von Lossberg (fusilier)**, and **von Knyphausen (fusilier)**, each with an attached artillery
company. Rall and Lossberg were posted on lower King Street, Knyphausen on Queen Street. **[DOC]**
([Order of battle, Battle of Trenton](https://en.wikipedia.org/wiki/Order_of_battle_of_the_Battle_of_Trenton))

**Their specific facing colours are [CONV] and I did not confirm them.** Before generating Act 4
crowds, pull the **Charles M. Lefferts uniform plates at the New-York Historical Society**
([eMuseum, Regiment von Rall](https://emuseum.nyhistory.org/objects/16207/);
[Alt von Lossberg](https://emuseum.nyhistory.org/objects/37771/)) and read the facings off the plates.
Lefferts is early-20th-century reconstruction, not primary, but it is the standard the uniform world
uses and it is what a teacher checking your work will find first.

### Kill the "drunk Hessians" myth
The Rall brigade was **not** sleeping off a Christmas debauch. It had received warnings of an attack and
had made defensive preparations. **[DOC]**
([Washington Crossing Park Association](https://www.wcpa-nj.com/ten3))
Visual consequence: the Hessians at Trenton are **turning out under arms in a sleet storm**, not
sprawled over bottles. This is a better scene *and* it is the correct one, and it makes Washington's
achievement larger, not smaller.

---

## 1.10 French troops, 1780–1783 (Act 7)

Rochambeau's expeditionary force: five infantry regiments — **Bourbonnais, Soissonnais, Saintonge,
Gâtinais** (renamed Royal Auvergne after Yorktown), **Royal Deux-Ponts** — plus **Lauzun's Legion**.
**[DOC]** ([AmericanRevolution.org, ch. 16](https://www.americanrevolution.org/france-in-the-revolution-chapter-16/))

| Unit | Coat | Facings | Notes |
|---|---|---|---|
| Bourbonnais | **White** | **Black** collar/cuffs with **crimson** lapels **[CONV]** | |
| Soissonnais | **White** | **Rose** | Grenadiers kept **bearskin caps** with **white and rose plumes** when the rest of the French army had abandoned them — American eyewitnesses singled them out as the most striking troops at Yorktown. **[DOC]** |
| Saintonge | **White** | **Green** | |
| Gâtinais / Royal Auvergne | **White** | **Violet** **[CONV]** | Stormed Redoubt 9 with the Deux-Ponts |
| **Royal Deux-Ponts** | **LIGHT BLUE — not white** | **Yellow** collar, cuffs, lapels; yellow buttons | A German regiment on the French establishment; German regiments in French service wore blue. Black tricorne, **white Bourbon cockade**. Ordinance of 21 Feb 1779. **[DOC]** ([Royal Deux-Ponts Regiment](https://en.wikipedia.org/wiki/Royal_Deux-Ponts_Regiment)) |
| French artillery | **Blue** | **Red** | **[DOC]** |
| Lauzun's Legion hussars | Sky blue / yellow **[CONV]** | | Fur-trimmed pelisse, mirliton cap — visually exotic |

- All French infantry wore **cocked hats** and **hair carefully clubbed or queued**. **[DOC]**
- **The white cockade** is the fastest French identifier at diorama scale. Americans: black (with white
  centre after 1778). British: black. French: white.

### The visual contrast at Yorktown is the point
Every eyewitness account of 19 October 1781 makes the same observation: **the Americans were ragged and
the French were immaculate.** **[DOC]** The surrender ceremony had the British marching *between* the
two allied lines — French on one side, Americans on the other — which puts the contrast literally in
one composed shot. **That is your Act 7 climax framing.** It requires no invention, it is documented,
and it teaches something (what the alliance actually meant, materially) without a word of exposition.

---

## 1.11 Militia

Militia are **civilians in civilian clothes carrying whatever gun they own**. Their visual grammar:

- Civilian coat or waistcoat, or a hunting shirt; round hat or cut-down cocked hat.
- **Powder horn and shot bag** on cords instead of a leather cartridge box. This is the single fastest
  militia tell — swap the black leather box for a curved cow horn and a leather pouch.
- Frequently **no bayonet**, which had real tactical consequences and is worth encoding visually.
- Age range visibly wider than the Continental line: boys and greybeards in the same file.

The de Verger watercolour (§5.3) includes a **New England militiaman** and gives you a documented,
period-eyewitness figure to work from rather than an invention.

---

## 1.12 Women of the army (camp followers)

Not decoration; a standing part of the army's establishment, drawing rations.

- **Ratio:** a December 1777 return at Valley Forge shows **400 women present — roughly one woman per
  44 enlisted men.** **[DOC]** ([Rees, "Female Camp Followers with the Continental Army"](https://www.revwar75.com/library/rees/proportion.htm))
  Use that ratio literally in crowd composition. In a 40-figure camp scene, one woman is right;
  three is wrong in one direction and zero is wrong in the other.
- **Rations:** dependent women typically drew **one ration a day**; they were unpaid unless specifically
  employed as laundresses, nurses or cooks. **[DOC]**
- **Dress:** their own clothes, worn hard. **Short gown** (a hip-length fitted jacket) over a
  **petticoat** (i.e. a skirt), **stays**, **neckerchief** at the throat, **linen cap** on the head,
  flat shoes, occasionally a large white wool cloak. Striped linsey petticoats and linen jackets are
  documented. **[DOC]**
  ([Rees, "'Some in rags and some in jags'"](https://revwar75.com/library/rees/wcloth.htm))
- **Never bare-headed.** An adult woman of this class in this period wears a cap outdoors and indoors.
  AI models will produce loose flowing hair every time. Hard rule.
- Washington's own view was unsentimental — General Orders of 4 August 1777 complained that the women
  were *"a clog upon every movement."* **[DOC]** That's a usable line.

---

## 1.13 Black soldiers, free and enslaved

This thread is required by the design (agreed thread #12) and it is also the best-documented
counterweight to the "great man" frame. Do it accurately and it does the work by itself.

### The documented sequence
1. **12 November 1775** — Washington issues orders **forbidding** the enlistment of Black men. **[DOC]**
2. **7 November 1775** — Lord Dunmore's Proclamation offers freedom to enslaved men owned by Patriots
   who reach British lines and bear arms. Hundreds do. **[DOC]**
   ([Encyclopedia Virginia](https://encyclopediavirginia.org/entries/lord-dunmores-ethiopian-regiment/))
3. **30 December 1775** — Washington **reverses**: *"As the General is informed that numbers of free
   Negroes are desirous of enlisting, he gives leave to the recruiting officers to entertain them, and
   promises to lay the matter before the Congress, who, he doubts not, will approve of it."* **[DOC]**
   He wrote to Hancock that refusing them risked driving them to the British. **[DOC]**
   ([Revolutionary War Journal](https://revolutionarywarjournal.com/enlist-no-stroller/))

**This is the reversal the design brief asks for, and it is a decision made for reasons of manpower and
competitive advantage, not conscience.** Write it that way. It is more interesting and it is true.

### Dunmore's Ethiopian Regiment — a caution
The famous detail is that its men wore sashes reading **"LIBERTY TO SLAVES."** This rests on a
**December 1775 newspaper report**, and there is real scholarly doubt: some authorities hold the
regiment had no uniforms at all. **[RECON]**
**Decision:** the game may show the sash **once**, in a single composed shot, and the accompanying
collectible document must be the newspaper report itself, framed as a report — not as fact. That
converts a shaky claim into a lesson about evidence, which is exactly the Pentiment-style
style-as-epistemology move the client asked for.

### The 1st Rhode Island Regiment
Reorganised in 1778 to recruit Black and Native men; roughly **197 Black soldiers under white
officers**. Nicknamed the "Black Regiment." **[DOC]** Most Black soldiers in the Continental Army served
in **integrated** regiments; the 1st Rhode Island was the exception, not the rule. **[DOC]**
([HISTORY](https://www.history.com/articles/first-black-regiment-american-revolution-first-rhode-island))
Encode both facts — an integrated file in the Act 7 line *and* the 1st Rhode Island figure.

### The single best reference image in this entire pack
**Jean Baptiste Antoine de Verger, "Soldiers in Uniform" (watercolour in his campaign journal,
c. 1781)** — four Continental soldiers at Yorktown, drawn by a French officer who was there.
Left to right: **a Black light infantryman of the 1st Rhode Island; a New England militiaman; a frontier
rifleman in a fringed linen Virginia hunting shirt; a French officer in blue faced red.** Three carry
shoulder belts for cartridge box and bayonet. **[DOC]** Held at the **Anne S. K. Brown Military
Collection, Brown University Library**.
([American Revolution Institute](https://www.americanrevolutioninstitute.org/four-soldiers-diversity-in-the-continental-army/);
[Library of Congress](https://www.loc.gov/item/2021669876/))

It is one of the earliest known renderings of a Black American soldier, it is by an eyewitness, and it
shows in a single sheet exactly how *unlike* each other four American soldiers looked in 1781.
**Make this the master reference for all Continental crowd composition.** If a generated crowd doesn't
look like it could contain all four of de Verger's figures, regenerate.

### William "Billy" Lee
Washington's enslaved valet, at Mount Vernon from 1768, who **followed Washington to every encampment
and battle for eight years** — dressing him, managing his kit, riding beside him, handing him his glass
and his sword. He was the only enslaved person freed **immediately** in Washington's will. **[DOC]**
([Mount Vernon](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/william-billy-lee))

**Design recommendation, strongly held:** Billy Lee is the mechanism that carries the enslaved-people
thread past Act 1 without contrivance. He is legitimately present in Acts 2 through 8. He is in the
frame at Cambridge, at Valley Forge, at Yorktown, and he is in the room at Newburgh. He does not need a
quest. He needs to be *there*, visible, named, in every act — because he was.

**One warning on his depiction.** John Trumbull's 1780 double portrait shows Lee in a **red turban**.
That turban is a European **Orientalist convention** for Black figures, not a record of what Lee wore.
**[DOC]** ([Met Museum](https://www.metmuseum.org/art/collection/search/12822)) **Do not reproduce it.**
Depict Lee in a servant's or aide's practical dress: a plain coat, a waistcoat, a round hat or a
cocked hat, riding kit. This is a case where the period image is *evidence about the painter*, not
evidence about the man — and that distinction is itself teachable.

---

## 1.14 Enslaved people at Mount Vernon — dress

Washington bought large quantities of **osnaburg**: a coarse, unbleached linen or hemp cloth, brownish,
sometimes called "slave cloth" or "negro cloth." **[DOC]**
([Mount Vernon, Clothing for the Enslaved](https://www.mountvernon.org/george-washington/slavery/clothing))

- **Allotment:** a field labourer received roughly **one suit of clothes and one pair of shoes per
  year**, plus one or two seasonal items. **[DOC]** Garments were mass-made, coarse, plain, and
  frequently ill-fitting.
- **Men:** osnaburg shirt, breeches or trousers, woollen or plaid hose, locally made shoes, a wool or
  cotton coat.
- **Women:** osnaburg shift, petticoat, short gown or jacket, neckerchief, head wrap or cap.
- **Palette:** undyed brown-grey linen, walnut and indigo where people dyed their own, russet leather.
  **[DOC]**

See §7 for how this must and must not be rendered.

---

## 1.15 Canonical palette

Lock these as named swatches in the art bible so prompts can reference them by name rather than by
adjective. Hex values are targets for the wash, not for flat fill.

| Name | Hex | Used for |
|---|---|---|
| `CONTINENTAL-BLUE` | `#243B5E` | Continental regimental coats. Indigo-based: greyed, slightly purple, never navy-bright. |
| `BUFF` | `#C9B489` | Washington's facings, NY/NJ facings, leather belts. Pale yellowish-tan. **Not yellow.** |
| `MADDER-RED` | `#9E3B32` | British private soldiers' coats. Brick, warm, dull. |
| `SCARLET` | `#C0392B` | British officers' coats, Continental artillery facings. Brighter, cochineal. |
| `PRUSSIAN-BLUE` | `#1F3048` | Hessian coats. Darker and colder than `CONTINENTAL-BLUE`. |
| `FRENCH-WHITE` | `#E8E2D4` | French infantry coats. Warm, unbleached-wool white, never paper white. |
| `HUNTING-LINEN` | `#CFC5AC` | Hunting shirts, shirts, tentage. Oatmeal. |
| `OSNABURG` | `#9C8C74` | Enslaved people's clothing, knapsacks, haversacks. Brown-grey. |
| `BUTTERNUT` | `#7A6247` | Homespun civilian coats. |
| `PIPECLAY` | `#DED8CB` | Crossbelts. Off-white with a chalky, slightly blue cast. |
| `PAPER` | `#EFE7D5` | The ground of the whole game. Laid rag paper. |
| `IRON-GALL` | `#3B2E22` | All linework. Brown-black. **Never pure black — see §4.1.** |

---

# 2. Washington — the locked character descriptor

## 2.1 Body

- **Height: 6 ft 2 in.** Houdon measured him for the life mask and full-length statue and recorded
  6'2". **[DOC]** ([Mount Vernon, Houdon's Life Mask](https://www.mountvernon.org/george-washington/artwork/houdons-life-mask-of-george-washington))
  Some contemporaries said 6'3". Use **6'2"** and stop arguing.
- **Weight** roughly **175 lb** in 1759; heavier, ~200–210 lb, by the 1780s. **[RECON]**
- Very tall for the period — **half a head above almost everyone in any scene.** This is a free,
  enormously valuable staging tool for a fixed-camera game: the player character is findable in a crowd
  by silhouette alone. Encode it as a hard rule: **Washington's head is above the crowd line.**
- **Build:** long-limbed, broad-shouldered, notably **large hands and feet**, narrow through the hips.
  The often-quoted 1760 George Mercer description gives *"straight as an Indian,"* head *"well shaped,
  though not large… gracefully poised on a superb neck,"* nose *"large and straight rather than
  prominent,"* frame *"padded with well developed muscles."* **[RECON]** — the letter's authenticity is
  disputed; use it for shape guidance, never quote it in student text.
- **Bearing:** he was a superb horseman and a formal, reserved, physically controlled man. He is
  **still**. He does not gesture broadly. In a scene full of motion he is the one figure at rest.

## 2.2 Face

- **Eyes: grey-blue.** **[DOC]**
- **Skin: fair, weathered, and pitted with smallpox scars** from his 1751 Barbados illness. Peale and
  others deliberately **retouched the pockmarks out.** **[DOC]**
- **Jaw and mouth:** teeth failing from his twenties; by 1789 he had **one natural tooth left**. **[DOC]**
  His dentures were hippopotamus ivory, human teeth and metal — **not wood.** **[DOC]**
  George Washington Parke Custis recorded *"a marked change… more especially in the projection of the
  under lip."* **[DOC]**
  ([Mount Vernon, Washington's Teeth](https://www.mountvernon.org/george-washington/health/washingtons-teeth))
- **Hair: naturally a sandy reddish-brown.** He **did not wear a wig.** He wore his own hair long,
  clubbed or queued at the nape, tied with a black silk ribbon, and **powdered white** with pomatum for
  formality. **[DOC]**
  ([Smithsonian](https://www.smithsonianmag.com/smart-news/how-george-washington-did-his-hair-180955547/))
  This matters: at the edges — the temples, the nape, the roots after a hard ride — the **reddish-brown
  shows through the powder.** That single detail defeats the "white-wigged founding father" default.

## 2.3 Dress — the locked uniform

**Blue coat with buff facings, buff waistcoat, buff breeches** — the uniform of the **Fairfax County
Independent Company**, the militia company he had commanded, which he wore to the Second Continental
Congress in May 1775 and then made the pattern for Continental general officers. **[DOC]**
([Arlington Historical](https://arlingtonhistorical.com/items/show/350))

Locked component list:
- **Coat:** `CONTINENTAL-BLUE`, buff collar/cuffs/lapels, **yellow (gilt) buttons**, buff lining showing
  at the turned-back skirts.
- **Waistcoat & breeches:** `BUFF`.
- **Two gold bullion epaulettes.**
- **Light blue ribband across the breast** — Acts 1–5 only (§1.7).
- **Black cocked hat** with black cockade and gold binding; **or** bare-headed indoors.
- **Boots:** black leather riding boots to just below the knee for field scenes; **buckled shoes and
  white stockings** for interiors and Annapolis.
- **Sword:** a straight-bladed small-sword or a slightly curved hanger, in a green shagreen or black
  leather scabbard, on a **buff waist belt**. Not a cavalry sabre.
- **Black neck stock** at the throat.
- **Cloak:** a heavy dark blue or drab wool cloak for Acts 4, 5 and 6.

**Horses:** **Nelson**, a **chestnut/sorrel, ~16 hands, with a white face and white legs** — the horse
Washington actually preferred in action because he was steadier under artillery fire, and the horse he
rode to the Yorktown surrender. **Blueskin**, a **grey/white half-Arabian**, is the horse most often
*painted* because he is more dramatic. **[DOC]**
([Mount Vernon, Nelson](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/nelson-horse))
**Decision: the game uses Nelson.** The chestnut is more distinctive against a paper-and-wash palette
than a white horse, it is the historically correct choice for the battle scenes, and correcting the
"white horse" cliché is exactly the kind of quiet accuracy that earns a teacher's trust.

## 2.4 How the painters differ, and which one to anchor on

| Painter | Works | What it gives you | Verdict |
|---|---|---|---|
| **Charles Willson Peale** | 1772 (Virginia colonel, earliest known portrait); **1779 "Washington at Princeton"** with the blue sash, captured British and Hessian colours at his feet, Nassau Hall behind; many replicas | The **wartime** Washington, from life, repeatedly, by a man who served in the army himself. Rembrandt Peale criticised his father's Washingtons for a **short neck and broad sloping shoulders** and *"noses & eyes defectively small."* **[DOC]** | **PRIMARY ANCHOR.** The design brief already commits to the Peale tradition; the history supports it. |
| **John Trumbull** | 1780 Washington with William Lee (painted in London, **neither man sat**); later history paintings incl. *Resignation of General Washington* | Staging, composition, crowd arrangement — Trumbull is where the *scene* comes from, not the face. Peale thought Trumbull's Washington had *"graceful elegance"* but lacked *"the peculiar dignity of Washington."* **[DOC]** | **STAGING REFERENCE ONLY.** Never use for the face. |
| **Gilbert Stuart** | **Athenaeum portrait, 1796** — the dollar bill | Washington at **64**, three years before death, with the lower face distorted by dentures | **BANNED for in-game Washington.** It is 13 years after Annapolis and it is the model's default. See §6, F-02. |
| **Jean-Antoine Houdon** | Life mask and measurements, 1785 | The only **physical** record of the face and body. | **MEASUREMENT AUTHORITY.** Use for proportions when Peale and Trumbull disagree. |

## 2.5 The portrait ladder — 3 war stages × 3 stat bands

The design calls for Washington's dialogue portrait to change with accumulated stats. Here is the
concrete spec. Nine images, one locked face, three axes of change.

**Locked across all nine:** bone structure per Houdon; grey-blue eyes; long nose; reddish-brown hair
under powder; 6'2" proportions carried into the shoulder line; no facial hair, ever.

| | **Band LOW** | **Band MID** | **Band HIGH** |
|---|---|---|---|
| **Stage I — 1775/76**<br>Acts 1–4 | Hair powder patchy, coming loose at the temples; stock crooked; coat unbuttoned at the top; jaw set, eyes narrowed | Correct but plain; hair neatly clubbed; sash across the breast; direct level gaze | Immaculate; powder even; sash crisp; the chin fractionally raised |
| **Stage II — 1777/78**<br>Acts 5 | Hollow under the cheekbone; shadow under the eye; collar frayed; cloak over the coat indoors; **no powder at all** — hair its own reddish-brown, which reads instantly as *he has stopped keeping up appearances* | Fatigue visible but contained; powder present but thin; the sash still worn | Weathered but composed; the face has hardened rather than sagged |
| **Stage III — 1781/83**<br>Acts 6–8 | Grey through the temples; deep lines from nose to mouth; the mouth set hard; sash gone, epaulettes tarnished | Grey at the temples; steady; sash gone; epaulettes bright | Grey at the temples; the face is calm and the eyes are the only tired part of it; uniform immaculate |

**Three rules for the ladder:**
1. **Ageing happens through hair, skin condition, linen condition and posture — never through facial
   deformation.** The lower-lip projection caused by dentures is a **medical fact about a man's
   suffering**, not a punishment for bad play. Encoding it as a low-stat outcome would be both
   anachronistic (it is a mid-1780s-onward change) and grotesque. **Hard ban.**
2. **The Newburgh spectacles are the one exception, and they belong to everyone.** At Act 6, in all
   three bands, Washington puts on spectacles: *"I have already grown gray in the service of my
   country. I am now going blind."* The glasses are not a stat outcome. They are the act.
3. **Stage III always shows grey at the temples in every band.** Time passed for everyone. The bands
   change what the grey *reads as* — worn down, endured, or earned.

## 2.6 What Washington must never be

- Never white-wigged. Never in a powdered wig with rolls over the ears.
- Never on a white horse.
- Never with a beard, moustache, or stubble.
- Never with three stars.
- Never with a Stars and Stripes behind him before **14 June 1777**, and never with a 13-star ring flag
  at all (§4.6).
- Never with a hand tucked into his waistcoat. That is Napoleon.
- Never smiling with the mouth open.

---

# 3. Locations

Each entry: what it actually looked like on the date the game visits it, what the model will get wrong,
and the canonical view.

## 3.1 Mount Vernon — **May 1775** (Act 1)

### This is the highest-risk asset in the entire project.

Every reference photograph of Mount Vernon, and therefore every prior an image model holds, shows the
**finished** house: two-storey piazza, cupola, Dove of Peace weathervane, symmetrical wings. **In May
1775 none of those existed.**

**Construction state, May 1775:** **[DOC]**
([Mount Vernon, Expansion of the Mansion](https://www.mountvernon.org/the-estate-gardens/the-mansion/expansion-of-mount-vernons-mansion);
[Exterior Architectural Details](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/exterior-architectural-details))

| Feature | Status in May 1775 | Date it actually appears |
|---|---|---|
| Core house, raised to **2½ storeys** | ✅ present (raised late 1750s from the original 1½-storey house) | c. 1758 |
| **South addition** (Washington's study below, bedchamber above) | ✅ **just completed 1775** — the newest thing on the estate | 1774–75 |
| **North addition** (the New Room) | ❌ **not built.** Exterior finished 1776 under Lund Washington; interior not finished until c. 1787 | 1776 / c. 1787 |
| **Piazza** | ❌ **does not exist** | erected 1777; stone flagging not laid until 1786 |
| **Cupola** | ❌ **does not exist** | 1778 |
| **Dove of Peace weathervane** | ❌ **does not exist** | ordered from Joseph Rakestraw, 1787 |
| **Rusticated sand-painted siding** | ✅ present — yellow pine boards bevelled and notched to imitate stone blocks, painted and sanded so the surface is gritty and stone-like | |

So the May 1775 house is **asymmetrical**: a 2½-storey block with a brand-new wing on the south end and
a **raw building site on the north end**. No porch. No cupola. Flat roofline.

> **Decision: build the 1775 house, correctly, and make the asymmetry a story beat.** Washington rides
> away on **4 May 1775** to the Second Continental Congress and does not live at home again for more
> than eight years — returning only briefly in 1781 en route to Yorktown, and on Christmas Eve 1783.
> **[DOC]** The unfinished north end and the scaffolding are the visual statement of that. Put a
> collectible in Act 1 — one of **Lund Washington's wartime building accounts** — that lets a student
> discover the house kept being built while its owner was away. That is the brief's "required learning
> discoverable through play" rule, satisfied by an architectural fact.

**Also on the estate, May 1775:** the **House for Families** — the main dwelling for enslaved people at
the Mansion House Farm, in existence by the 1760s and used until **1792**, when it was demolished and
its occupants moved to quarters in wings flanking the greenhouse. **[DOC]** Excavated 1984/85–1990/91;
a brick-lined root cellar beneath it yielded **over 60,000 artefacts**, including **25,000 animal
bones**, colonoware, a white salt-glazed stoneware teabowl, a pewter spoon, a bone-handled knife,
Chinese export porcelain, tobacco pipes. **[DOC]**
([Mount Vernon, The House for Families](https://www.mountvernon.org/preservation/archaeology/the-house-for-families))
**The greenhouse quarters do not exist in 1775.** Do not build them.

**Palette:** river haze, spring green, `PAPER` sky. Washed-out and gentle — this act is the quiet the
rest of the game is measured against.

> **CANONICAL VIEW — MV-01 "The Approach":** shallow elevated three-quarter from the west (land) side,
> camera ~4 m above the walk-plane, mid-morning, long shadows to the right. The unfinished north end is
> stage left, in frame, with a lime pit and stacked boards. Walk-plane runs left-to-right across the
> forecourt.
>
> **CANONICAL VIEW — MV-02 "The Study":** near-frontal theatrical elevation, single interior, window
> stage left throwing a hard trapezoid of light across the floor. This is where the Congress messenger
> scene plays.
>
> **CANONICAL VIEW — MV-03 "The Quarter":** shallow elevated three-quarter, the House for Families and
> its work yard, late afternoon, camera **level with the doorway, not looking down on it**. See §7.

---

## 3.2 Cambridge and the Boston lines — **July 1775 to March 1776** (Act 2)

**Washington's headquarters:** the **Vassall (later Craigie/Longfellow) House**, Cambridge, July 1775 –
April 1776. **[DOC]** A large Georgian frame mansion, pale yellow with white trim — a confiscated
Loyalist's house, which is itself a fact worth a line of dialogue.

**The camp:** the whole point is that it is **not a camp**, it is a shanty-town. Emerson's July 1775
description (quoted in full in §1.2) gives you the asset list directly: **shelters of boards, of
sailcloth, of board-and-sailcloth mixed, of stone and turf, of birch, of brush.** **[DOC]** Nathanael
Greene's Rhode Islanders were the conspicuous exception — proper tents in ordered rows, *"everything in
the most exact English taste."* **[DOC]**

**This contrast is the entire visual thesis of Act 2** and it is documented by an eyewitness: one
regiment that looks like an army, surrounded by thousands of men living in brush piles. Compose for it.

**Also present:** siege lines and redoubts on the hills (Prospect Hill, Winter Hill, Roxbury);
Boston visible across the water with the British-held peninsula and shipping; **no Continental blue
anywhere**; the **Grand Union flag** (see §4.6) raised on Prospect Hill on 1 January 1776.

**Palette:** mud, unbleached linen, weathered board, wet turf. Very low chroma. The only saturated
colour in Act 2 should be the distant red of the British lines through a spyglass.

> **CANONICAL VIEW — CB-01 "The Camp Street":** shallow elevated three-quarter looking down a rough
> lane between shelters, Boston and the water as a pale wash on the far horizon. Camera ~5 m.
> **CANONICAL VIEW — CB-02 "Headquarters Parlour":** near-frontal interior, Vassall House, map on the
> table. **CANONICAL VIEW — CB-03 "The Lines":** shallow elevated three-quarter along an earthwork
> parapet with gabions, spyglass position at frame right.

---

## 3.3 Brooklyn Heights — **August 1776** (Act 3)

The fortified line ran **about a mile and a half across the Brooklyn peninsula, from Gowanus Creek in
the south to Wallabout Bay in the north.** **[DOC]**
([Journal of the American Revolution](https://allthingsliberty.com/2021/10/what-were-the-brooklyn-line-of-forts-in-1776/))

- **Fort Stirling** (also "Fort Half Moon") on Brooklyn Heights proper, guns commanding the East River.
- **Fort Putnam** — star-shaped, five guns, on the salient; the main British objective.
- **Fort Greene** — star-shaped, six guns, the largest, in the centre.
- **Fort Box** — on the right.
- Between them: **trenches and abatis**. Abatis are **felled trees with the branch ends sharpened and
  turned outward toward the enemy** — not pointed stakes in neat rows, but a tangled wooden thicket.
  Each work had a wide ditch, sides lined with pointed stakes, and sally ports. **[DOC]**

**The evacuation, night of 29–30 August:** boats assembled at **Brooklyn Ferry** (present-day Fulton
Ferry), beginning about 8 p.m., in silence; a **heavy fog** in the morning concealed the last boats.
**[DOC]** Glover's Marblehead mariners crewed the boats — the same men who will crew the Delaware
four months later.

**Palette:** Act 3 is where the paper starts to get wet. Rain-blurred wash, fog as *unpainted paper*
rather than white paint, ink lines dissolving at the edges of the frame.

> **CANONICAL VIEW — BK-01 "The Parapet":** shallow elevated three-quarter along the earthwork, abatis
> in the middle ground, the East River and Manhattan as pale wash beyond.
> **CANONICAL VIEW — BK-02 "The Ferry Landing, Night":** near-frontal, low camera at the waterline,
> lantern-lit, fog as bare paper. This is the act's showpiece.

---

## 3.4 The Delaware and Trenton — **25–26 December 1776** (Act 4)

**The boats.** **Durham boats** — cargo craft built to move iron ore down the Delaware, **40 to 60 feet
long**, with **high sides**, shallow draught, poled and rowed, robust enough for ice. **[DOC]**
([Washington Crossing Historic Park](https://www.washingtoncrossingpark.org/park/the-village-lower-park/))
They are **long, black, open, and low** — nothing like the small rowboat of the Leutze painting.

**The crossing sites.** **McConkey's Ferry** (Pennsylvania side) and **Johnson's Ferry** (New Jersey
side), about **10 miles north of Trenton**, ~2,400 men plus horses and artillery. **[DOC]** The
**Johnson Ferry House** is a c.1740 **gambrel-roofed** farmhouse. **[DOC]**

**The crossing was crewed by Glover's Marblehead regiment** — sailors and fishermen, a notably diverse
unit. **[DOC]**

**The weather and the timing — correct these.** **[DOC]**
([American History Central](https://www.americanhistorycentral.com/entries/battle-of-trenton/);
[Arcfield Weather analysis](https://arcfieldweather.com/blog/2025/12/25/weather-and-the-pivotal-battle-of-trenton-on-december-25-26-1776))
- A **nor'easter**: snow, **sleet and freezing rain**, not picturesque dry snowfall.
- The crossing ran **three hours behind schedule**.
- Washington intended to strike at **5 a.m.**; first contact was about **8 a.m. — an hour after
  sunrise.** **The Battle of Trenton was fought in daylight, in a sleet storm.**
- The army marched to Trenton in **two columns** (Greene and Sullivan).

**Trenton itself:** a small town on **King Street** and **Queen Street**, converging at the north end.
Rall and Lossberg were quartered on lower King, Knyphausen on Queen. **[DOC]** The **Old Barracks**,
built by the colony of New Jersey in **1758**, is the one surviving structure — a long two-storey stone
building with a continuous arcade of doorways. **Anchor the Trenton composed shot on it.**

**Duration warning for the design.** Washington did **not** occupy Trenton. The army recrossed the
Delaware with its prisoners the same day. The brief's "brief post-battle exploration" must be framed as
**hours, in the sleet, while prisoners are marched past** — not as a captured town to wander.

**Palette:** the darkest act. `IRON-GALL` line at maximum weight, wash almost monochrome, the only
warmth from torch and musket flash. Sleet rendered as **scratched-out white lines through the wash**
(a real period technique — scraping the paper) rather than as painted dots.

> **CANONICAL VIEW — DL-01 "The Embarkation":** near-frontal theatrical, low camera at the ferry
> landing, Durham boat broadside across the frame, torchlight.
> **CANONICAL VIEW — DL-02 "The Ice":** shallow elevated three-quarter from mid-river.
> **CANONICAL VIEW — TR-01 "King Street":** shallow elevated three-quarter down King Street toward the
> Old Barracks, sleet, Hessians turning out under arms.

---

## 3.5 Valley Forge — **December 1777 to June 1778** (Act 5)

**The huts were regulated, and this is a genuinely great fact.** Washington issued hutting
specifications on **18 December 1777**: each hut **14 feet by 16 feet, 6½ feet high**, with a **door
facing the street** and a **fireplace at the rear**, walls of logs with the gaps **sealed with clay
(about 18 inches of clay for insulation)**. Squads that deviated were **ordered to tear the hut down and
start again.** **[DOC]**
([American Battlefield Trust](https://www.battlefields.org/learn/articles/valley-forge-encampment))

**Visual consequence, and it is a big one:** Valley Forge is **not a scatter of frontier cabins**. It is
a **grid** — a regulated town of ~2,000 identical log huts in **brigade streets**, built to a
specification, by an army that was starving. The order and the misery in the same frame is the whole
tonal argument of Act 5, and it is documented. This also happens to be the single most AI-friendly
location in the game, because a repeating module at a fixed size is exactly what generation is good at.

**Conditions:** ~11,000 soldiers plus ~500 women and children. **[DOC]** Washington reported nearly
**3,000 men "barefoot and otherwise naked"** on 23 December 1777. **[DOC]**

**Washington's headquarters:** the **Isaac Potts House**, a two-storey stone dwelling — small, plain,
and *deliberately* not a mansion. He lived in his marquee until the huts were built.

**Von Steuben** arrived **23 February 1778**, formed a **model company of 100 men**, and had them train
the rest. **[DOC]** His *Regulations for the Order and Discipline of the Troops of the United States* —
the **"Blue Book"** — was approved by Congress in March 1779. **[DOC]**
([American Revolution Institute](https://www.americanrevolutioninstitute.org/steubens-blue-book-manual/))
**The visual improvement over the course of the act is the drill ground**: an empty muddy field in
December becomes a field with 100 men moving as one unit in April. That is the "map improves as
training takes hold" mechanic, and it costs one asset variant.

**Palette:** snow rendered as **bare paper**, ink line at its coldest and thinnest, wash reserved for
smoke and mud. Then, across the act, wash returns — first the ochre of new-cut logs, then green.

> **CANONICAL VIEW — VF-01 "Brigade Street":** shallow elevated three-quarter down a street of huts,
> receding, smoke from every chimney. Winter and spring variants of the same view.
> **CANONICAL VIEW — VF-02 "Potts House, Interior":** near-frontal theatrical.
> **CANONICAL VIEW — VF-03 "The Grand Parade":** shallow elevated three-quarter across the drill field.
> Three variants: empty/mud, model company, whole brigades.

---

## 3.6 Newburgh and New Windsor — **March 1783** (Act 6)

### Correct the brief here: this is two places, several miles apart.

- **Washington's headquarters** was the **Jonathan Hasbrouck House** in **Newburgh**, occupied **April
  1782 – August 1783**. **[DOC]** A **one-storey Dutch vernacular stone farmhouse**, completed 1770,
  eight rooms, with **Dutch jambless fireplaces** (open hearths with no side jambs and a broad hood —
  visually very distinctive and completely unlike an English fireplace). **[DOC]**
  ([Washington's Headquarters State Historic Site](https://en.wikipedia.org/wiki/Washington's_Headquarters_State_Historic_Site))
  Its principal room — the converted parlour Washington used as a dining room — is the famous **"Room
  with Seven Doors,"** described by the **Marquis de Chastellux**, a guest on 6 December 1782, as
  *"tolerably spacious"* but having **"seven doors and only one window."** **[DOC]**
  **That is a gift.** A theatrical near-frontal interior with seven doors and one window is a
  ready-made stage set for a scene about pressure closing in from every direction, and it is *literally
  true*.

- **The army's cantonment** and the **"Temple of Virtue"** (contemporary name: **the New Building** or
  the Public Building) were at **New Windsor**, erected in the first months of 1783 with a large work
  party employed from 1 January to early March. Sources give its size as **about 80 ft × 40 ft**;
  another gives 100 × 30. **[RECON]** — use **80 × 40**. It served as chapel, meeting hall, and
  courts-martial room. **[DOC]**
  ([Mount Vernon, New Windsor Cantonment](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/new-windsor-cantonment))

**The event:** Washington learned on **10 March 1783** of a planned officers' meeting; on **15 March**
he appeared unannounced at the Temple and delivered a nine-page address; then, taking out spectacles to
read a letter from a congressman, he said words remembered as *"I have already grown gray in the
service of my country; I am now going blind."* **[DOC]**

**Palette:** Act 6 is the game's most claustrophobic and its cleanest. The army is the best-dressed it
has ever been (Regime C). Interior light only: one window, candles, a fire. High contrast, tight
values, almost no wash outside skin and coat.

> **CANONICAL VIEW — NB-01 "Seven Doors":** near-frontal theatrical elevation, dead-on, the single
> window stage right, the seven doors ranged across the wall. **This is the most important composed
> shot in Act 6 and possibly in the game.**
> **CANONICAL VIEW — NW-01 "The Temple, Interior":** near-frontal, a long plain hall of new pine,
> benches, officers standing. Camera at the far end from the dais.
> **CANONICAL VIEW — NW-02 "The Cantonment":** shallow elevated three-quarter, huts in the Valley Forge
> grid but better built, mud, early spring.

---

## 3.7 Yorktown — **September–October 1781** (Act 7)

**Siege engineering vocabulary — get these four objects right and the whole act reads as period.**
**[DOC]** ([Hatch, *Yorktown and the Siege of 1781*, Project Gutenberg](https://www.gutenberg.org/cache/epub/54080/pg54080-images.html);
[American Battlefield Trust](https://www.battlefields.org/learn/articles/i-have-never-spared-spade-and-pick-ax-fortifications-american-revolution))

| Object | What it is | How it looks |
|---|---|---|
| **Gabion** | Bottomless **wicker basket, 1–3 ft high**, set at the base of a parapet and **filled with earth** | A row of woven cylinders, earth spilling over the rims. The most photogenic siege object there is. |
| **Fascine** | **Bundle of tree branches** bound together, laid against the parapet and staked | Long faggots, rough ends, stacked |
| **Saucisson** | A large fascine | |
| **Fraise** | **Pointed stakes** driven into the embankment, angled outward | |
| **Abatis** | **Felled trees, branch-points toward the enemy**, laid before the ditch | A tangled thorn-hedge of raw timber |

**The parallels.** The **first parallel** was opened on the night of **6 October 1781** (a stormy
night). The **second parallel**, 400 yards closer, was begun **11 October** under the covering fire of
**76 allied guns**. **Redoubts 9 and 10** blocked it from reaching the river and were stormed on the
**moonless night of 14 October** — **muskets unloaded and unprimed** so no accidental shot would give
warning; the French assault on Redoubt 9 took casualties while the **abatis** was cleared. Redoubt 10
went to the Americans under Hamilton, Redoubt 9 to the Royal Deux-Ponts and Gâtinais. **[DOC]**
**Chief engineer: Louis Duportail**, who was largely responsible for the siege works. **[DOC]**

**Correct the brief's "French fleet visible offshore."** De Grasse's fleet was in the **Chesapeake**,
not visible as a line of battle from the allied siege lines. What you *would* see from the lines is the
**York River** and British shipping in it — including the **HMS Charon, burned by allied hot shot on
10 October**. **[DOC]**

> **Decision:** the fleet belongs in the **map-table scene**, not the diorama. This is precisely what
> design decision #5's genuine-3D survey table is for — the naval blockade is a *strategic* fact the
> player learns from the map, and the siege line is a *sensory* fact the player learns from the ground.
> Splitting them is both historically correct and mechanically clean.

**The surrender, 19 October, 2 p.m.:** British and German troops marched out **with colours cased**,
**between** a French line and an American line. Cornwallis pleaded illness; **Brigadier General Charles
O'Hara** led the troops out and offered the sword — first to **Rochambeau**, who declined and pointed to
Washington; Washington, refusing to receive it from a subordinate, directed it to **Major General
Benjamin Lincoln**. **[DOC]** The tune "The World Turned Upside Down" is **apocryphal**. **[DOC]**
([Gilder Lehrman](https://www.gilderlehrman.org/history-resources/spotlight-primary-source/surrender-british-general-cornwallis-americans-october))

**Palette:** dust, chalk, red clay, hot autumn light. The most saturated act in the game — earned by
contrast with Acts 4, 5 and 6.

> **CANONICAL VIEW — YT-01 "The Second Parallel":** shallow elevated three-quarter along the trench,
> gabions in the foreground, fascine stacks, the town beyond as pale wash.
> **CANONICAL VIEW — YT-02 "Redoubt 10, Night":** near-frontal, low, abatis silhouetted.
> **CANONICAL VIEW — YT-03 "The Surrender Road":** near-frontal theatrical elevation looking **down the
> corridor between the two allied lines** — immaculate French to one side, ragged Americans to the
> other, British column receding to the vanishing point. This is the shot the whole act builds to.
> **MAP TABLE — YT-MT:** the Chesapeake, de Grasse's blockade, Cornwallis's position, in animated
> survey-map register.

---

## 3.8 Annapolis, Maryland State House — **23 December 1783** (Act 8)

Washington resigned his commission in the **Old Senate Chamber** of the Maryland State House. **[DOC]**
The room was restored between **2007 and 2015** to its documented **1783** appearance following
extensive archival and physical investigation — including reinstating the **visitors' gallery**,
cornice, and **unfinished flooring** that a 1905 restoration had removed. **[DOC]**
([Maryland State Archives](https://msa.maryland.gov/msa/mdstatehouse/html/old_chamber.html);
[Maryland DGS](https://news.maryland.gov/dgs/2015/12/09/old-senate-chamber-restored-to-its-original-appearance/))

**This means you have a photographable, professionally researched 1783 room.** Use the restoration
photography as the direct reference. Do not invent this interior.

Key features: the **ladies' gallery above** — from which **Molly Ridout** wrote one of the few
eyewitness accounts of the resignation **[DOC]**; **unfinished (unpainted, unvarnished) floorboards**;
a shallow apsidal end; plain classical woodwork; large windows.

**Staging fact worth encoding:** only about **twenty delegates** from seven states were present. The
most consequential act of the war happened in a **half-empty room**. Do not fill it. The brief already
wants Act 8 to be *"bright, still, quiet, museum-like"* — the history gives you the emptiness for free.

**Palette:** the inverse of the whole game. `PAPER` at full brightness, ink line at its finest and most
even, wash almost absent, no smoke, no weather. **Whitewash, unfinished pine, cold December window
light.**

> **CANONICAL VIEW — AN-01 "The Chamber":** dead-on near-frontal theatrical elevation, perfectly
> symmetrical, gallery above, the President of Congress seated centre, Washington standing at the bar.
> Symmetry is the argument: the room is balanced because power is being balanced.

---

# 4. Material culture

## 4.1 Paper, ink, and writing — the game's own material

Because the whole art direction is ink-and-wash on paper, the game's *props* and the game's *medium*
are the same substance. Lean on that. The letterbook, the documents, and the world are made of the same
stuff.

- **Paper:** handmade **laid rag paper** — chain lines about 1 inch apart and fine laid lines
  perpendicular to them, visible against light; a **watermark**; deckle edges on uncut sheets; colour
  a warm cream to buff, never white. Paper was **expensive and reused**; letters were **crossed**
  (written, then turned 90° and written over) to save it.
- **Ink: iron gall.** Made from tannin (oak galls), iron sulphate (green vitriol), gum arabic and
  water. It goes on **nearly colourless**, darkens on oxidation to **purple-black or blue-black**, and
  **degrades to rusty brown** with age. **[DOC]**
  ([Conservation Wiki](https://conservation-wiki.com/wiki/BPG_Iron_Gall_Ink);
  [SAA Dictionary](https://dictionary.archivists.org/entry/iron-gall-ink.html))

> **This is the single most important art-direction fact in this section.** Surviving 18th-century
> documents are **brown-black on cream**, not black on white. The game's entire line layer should be
> `IRON-GALL` `#3B2E22`, never `#000000`. A pure-black line is the fastest way to make the whole game
> look like a modern digital illustration wearing a period costume. It also gives you a free, honest
> ageing mechanic: **as the war goes on, let the ink in the letterbook get browner.**

- **Quill:** goose or swan primary feather, cut and recut with a penknife. The barbs were usually
  **stripped**, not left as a fluffy plume. A period writing desk shows a **stripped shaft**, not a
  cartoon feather.
- **Drying:** **pounce** or fine sand shaken from a **sand shaker** (a perforated caster) over wet ink,
  then tipped off. **[CONV]** No blotting paper.
- **Sealing:** letters were **folded into their own covers** (no envelopes), tucked, and closed with
  **sealing wax** — usually **red**, sometimes black for mourning — impressed with a **seal matrix**
  or signet ring. Small paper **wafers** were the cheap alternative. **[CONV]**
- **Address panel:** the outside of the folded letter carries the address in a large formal hand,
  often with the bearer's name ("Favoured by Colonel ——").

## 4.2 What a document *looks* like on screen

For readable collectibles, the design must resolve a genuine conflict: **period handwriting is
illegible to a 15-year-old.** Do not make students decode secretary hand.

> **Decision:** every document collectible is rendered as a **two-layer object**. Layer 1 is the
> **artefact** — the real paper, the real folded cover, the wax, the ink, the crossing, rendered
> beautifully and *not readable*. Layer 2, on interaction, is a **clean typeset transcription** set in
> a period-appropriate face (a Caslon-family serif — Caslon was the actual type of the era, including
> the Declaration's first printings) on the same paper ground, with the long-s **modernised**.
> Reason: this preserves the material truth of the object *and* the readability of the text, it teaches
> the difference between an artefact and a transcription, and it means the AI never has to generate
> legible period text — which it cannot do.

**Never ask an image model to render readable words.** All text on all documents is generated as
**abstract ink texture** and the real words are overlaid as live HTML/canvas text at runtime. This is
also a payload win: one paper texture serves fifty documents.

## 4.3 Small arms

| Weapon | Who | Specs | Visual tells |
|---|---|---|---|
| **Brown Bess, Long Land Pattern** | British (earlier), Continental (captured/colonial) | **46 in barrel**, ~**62 in** overall, **.75 cal bore** firing a ~.69 ball | Long. Brass furniture, walnut stock, **wooden ramrod on early / steel later** |
| **Brown Bess, Short Land Pattern** | British standard in the Revolution | **42 in barrel**, **58.5 in** overall, .75 cal | The standard redcoat musket **[DOC]** ([NRA Museum](https://www.nramuseum.org/guns/the-galleries/road-to-american-liberty-1700-to-1780/case-4-shot-heard-round-the-world/brown-bess-model-1762-short-land-pattern-flintlock-musket.aspx)) |
| **Charleville M1763/1766** | French, and issued in quantity to Continentals after the alliance | **~44.75 in barrel**, **~59 in** overall, **.69 cal** | **Iron/steel furniture and barrel bands** rather than brass pipes — that is the fastest way to tell it from a Bess at a glance **[DOC]** |
| **American longrifle** | Rifle companies only | 42–48 in **octagonal browned** barrel, .45–.55 cal | Slim, **curly maple stock**, **brass patchbox** in the buttstock, **no bayonet**, dropped comb |

**All of these are flintlocks.** The lock has a **cock holding a flint in a leather-wrapped jaw**, a
**frizzen**, and a **pan**. There is no percussion cap, no hammer nipple, no ramrod under a barrel band
with a modern profile. Bayonets are **triangular in section**, not knife-shaped.

## 4.4 Artillery

- Field pieces: **3-pounders and 6-pounders**, plus **5.5-inch howitzers**. **[DOC]** Siege work at
  Yorktown used heavier 18- and 24-pounders and mortars.
- The gun is a **bronze or iron tube on a two-wheeled wooden field carriage** with **large spoked
  wheels** and a long trail. It is **hauled by horses or by men on drag ropes**, hitched to a
  **limber**.
- Carriage colour: I could not confirm a Continental standard. **[CONV]** **Decision: paint all
  Continental and French carriages a dull grey-blue-green and all British carriages the same, and
  never make carriage colour load-bearing.** Reason: it is genuinely uncertain, no teacher will
  challenge a muted carriage, and it keeps the palette calm.
- **Knox's train from Ticonderoga (Dec 1775 – Jan 1776)** — 59 pieces hauled ~300 miles by ox and horse
  sled. **Design note:** Washington was not present. The Act 2 logistics puzzle must be framed as
  Washington **directing and deciding from Cambridge** — reading dispatches, allocating teams,
  choosing routes on the map table — not as Washington on the trail. This preserves the brief's
  "always Washington, no perspective breaks" rule *and* the history, and it is another natural use of
  the map-table 3D scene.

## 4.5 Camp equipment

- **Common tent (soldiers'):** a small wedge/A-frame **ridge tent** of **linen and hemp** canvas,
  roughly 6–7 ft square, sleeping five or six. **[DOC]** Off-white to grey-brown, stained.
- **Marquee (officers'):** a large pavilion with a ridge and **rounded ("oval") ends**, walls, and a
  fly.
- **Washington's own sleeping-and-office marquee survives** at the Museum of the American Revolution.
  It is an **oval measuring 14 ft × 23 ft**, **12 ft at its highest point**, guy-lines fanning to a
  footprint of about **45 × 36 ft**. **[DOC]**
  ([Museum of the American Revolution](https://www.amrevmuseum.org/collection/washington-s-war-tent))
  **Use these exact dimensions.** It is a surviving object; get it right and it becomes a set piece the
  student may one day stand in front of in Philadelphia.
- Camp kit: iron **camp kettles**, wooden **mess bowls and trenchers**, **horn spoons**, **tin cups**,
  **wooden canteens**, **axes and billhooks**, **fascine knives**, **spades and pickaxes** (the most
  common object in the army by far — Washington's own line: *"I have never spared the Spade and Pick
  Ax"*).

## 4.6 Flags — the most dangerous object in the game

**The Betsy Ross flag is the trap.** The 13-stars-in-a-circle flag associated with Betsy Ross is
**rejected by modern scholars and vexillologists**; the story originates with her **grandson, around
1870.** **[DOC]** ([Betsy Ross flag](https://en.wikipedia.org/wiki/Betsy_Ross_flag))
It will nonetheless be the *first* thing an image model produces for "American Revolution."

**What was actually flown, by date:**

| Period | Flag | Look |
|---|---|---|
| 1775 – Jun 1777 | **Grand Union / Continental Colors** | **13 red-and-white stripes with the full British Union in the canton.** First flown Jan 1776. **[DOC]** |
| From **14 June 1777** | **Stars and Stripes**, per the Flag Resolution: *"13 stripes alternate red and white… the Union be 13 stars white in a blue field representing a new constellation"* **[DOC]** | **The resolution does not specify the arrangement.** Surviving and depicted examples show stars in **rows, in a 3-2-3-2-3 grid, staggered** — many arrangements, none official |
| Throughout | **Regimental colours** | What units actually carried: large silk standards, regiment-specific devices and mottoes, **not national flags** |

> **Decision, and enforce it hard:** Acts 1–3 (1775–Aug 1776) show the **Grand Union**. Acts 5–8 show
> the **Stars and Stripes with stars in staggered rows, never a ring**. Act 4 (Dec 1776) shows **no
> national flag at all** — the crossing was a night march, not a parade. And the most common flag on
> screen in any army scene is a **regimental colour**, not a national one.
>
> The Grand Union is a genuinely great teaching object: students see the **British Union in the corner
> of the American flag** and ask why. The answer — that in 1775 they were still arguing for their
> rights as Englishmen — is one of the hardest ideas in the unit and here it arrives as a picture.

## 4.7 Collectible props, by act

| Act | Objects | Note |
|---|---|---|
| 1 | Virginia Regiment gorget and sash (F&IW memorabilia); a surveyor's **circumferenter and Gunter's chain**; Congress's commission; a Boston newspaper; **Lund Washington's building account** | The surveying instruments seed the map-table motif |
| 2 | Requisition returns; a **powder return** (the famous shortage); Knox's dispatch; a spyglass | |
| 3 | British troop-movement report; evacuation manifest; a boat list | |
| 4 | **Thomas Paine, *The American Crisis*, No. I** (Dec 1776) as a readable pamphlet — cheap coarse paper, wide-set type; a Hessian cap plate; a soldier's re-enlistment paper | The Paine pamphlet must look **cheap**: this was mass propaganda, not a fine book |
| 5 | Ration returns; a **Blue Book** drill manual; a soldier's journal; a shoe with no sole | |
| 6 | The anonymous **Newburgh Address**; Washington's **spectacles**; a pay certificate Congress cannot honour | Congress's inability to pay is the through-line into the Articles' weakness |
| 7 | A siege journal; a French officer's card; a gabion-work order; a cased regimental colour | |
| 8 | The resignation address, in his own hand | The only object in Act 8 |

---

# 5. The period's own visual record

## 5.1 Why this section is not decoration

The client's stated model is **Pentiment: style-as-epistemology** — the way an image is made tells you
who made it and what they could know. This war has a real, specific, *limited* visual record, and its
limits are legible. Building the game's registers out of the actual surviving image-types means the
game's look **is an argument about evidence**, not a costume.

## 5.2 The four registers actually available in 1775–1783

Everything the game draws should sit in one of these four, and the register should be **chosen by what
the scene claims to know**.

| Register | Period source | Where the game uses it | Technique |
|---|---|---|---|
| **R1 — Military topographical pen-and-wash** | British and French army draughtsmen trained to record ground | **All exteriors.** The default register of the game. | Pen or graphite outline, restricted washes, near-monochrome with selective colour |
| **R2 — Tinted survey map** | Berthier/Rochambeau corpus | **All map-table scenes** | Pen-and-ink with watercolour, hachures, contour, camp plans, cartouche |
| **R3 — Painted portrait** | Peale, Trumbull, Earl | **All dialogue portraits** | Oil-portrait conventions rendered *in wash*: three-quarter turn, single light source, plain ground |
| **R4 — Engraved print** | Doolittle, Revere, Darly | **UI, chapter cards, internal-council voices, the letterbook** | Line engraving: crosshatch, no wash, hard black-on-cream |

> **Strong recommendation for the internal council.** The chorus of interior voices (Ambition,
> Restraint, Temper, Duty, Vanity) should be rendered in **R4 — engraved print** as small **emblem
> vignettes in the manner of 18th-century emblem books and printers' ornaments**: a hand, a serpent, a
> laurel, a broken column, a mirror. **Not faces. Not portraits.**
>
> Three reasons, all decisive. (1) It is period — the emblem tradition is exactly how the 18th century
> visualised abstract virtues and vices, so the mechanic becomes historically literate rather than
> imported from Disco Elysium. (2) It removes five additional consistent human faces from the AI
> generation problem, which is the project's central risk. (3) It puts the interior voices in a
> *different material register* from the world — they are printed, the world is painted — which is the
> Pentiment move, and it makes them instantly readable as *inside his head* with no UI chrome at all.

## 5.3 Named artists and works — the reference corpus

### The eyewitness record (highest authority)

| Work | Artist | Date | Why it matters | Where |
|---|---|---|---|---|
| **"Soldiers in Uniform" (Four Soldiers)** | **Jean Baptiste Antoine de Verger** | c. 1781 | **The single most important reference in this pack.** Eyewitness watercolour of four Continental soldiers at Yorktown, incl. a Black light infantryman of the 1st Rhode Island. **[DOC]** | Anne S. K. Brown Military Collection, Brown University; [LoC copy](https://www.loc.gov/item/2021669876/) |
| **The four Lexington & Concord engravings** | **Amos Doolittle** after paintings by **Ralph Earl** | Dec 1775 | The **only known contemporary illustrations of the battles.** Doolittle and Earl walked the ground in May 1775 and interviewed eyewitnesses. Deliberately flat, diagrammatic, naive — and *accurate about the ground*. **[DOC]** | [Concord Free Public Library](https://concordlibrary.org/uploads/scollect/BuildingHistories/MiddlesexHotel/storyPages/amosDoolitleEngraving.html) |
| **Rochambeau Map Collection** incl. the **Berthier atlas "Amérique, Campagne 1782"** | **Louis-Alexandre and Charles-Louis Berthier** | 1781–82 | 40 manuscript maps, 26 printed maps and a manuscript atlas of the French army's encampments, **pen-and-ink and watercolour**, drawn by the man who later became Napoleon's chief of staff. **[DOC]** | [Library of Congress, Rochambeau Map Collection](https://www.loc.gov/collections/rochambeau-maps/about-this-collection/) |
| **Views of North America** | **Thomas Davies**, Royal Artillery | 1760s–80s | A serving officer trained in watercolour at the **Royal Military Academy, Woolwich**. Illustrated the British fleet in the harbour after Long Island, 1776. Distinctive: **simplified, near-abstract contours, bold colour, stylised pattern.** **[DOC]** | [Dictionary of Canadian Biography](https://www.biographi.ca/en/bio/davies_thomas_5E.html) |
| **Diary sketches, New York 1776** | **Archibald Robertson**, British engineer officer | 1776 | Eyewitness to British preparations in summer 1776; diary with technically skilled sketches. **[DOC]** | |
| **Battle of Paoli / Battle of Germantown** | **Xavier della Gatta** | 1782 | Painted in **Naples** by a man who never set foot in America, from the eyewitness testimony of **Capt. Richard Mansergh St. George**, who fought there. Considered since 1957 **among the best representations of Revolutionary battle in existence.** **[DOC]** | [Museum of the American Revolution](https://www.amrevmuseum.org/collection/battle-of-paoli) |
| **British satirical prints** | **Matthew and Mary Darly**, 39 The Strand | 1770–78 | Etched caricature; the Darlys dominated the London print trade and gave much of their window to **pro-American** satire. **[DOC]** | [LoC, British Cartoon Prints](https://www.loc.gov/collections/british-cartoon-prints/) |

### The portrait record

| Work | Artist | Date | Use |
|---|---|---|---|
| Washington as Virginia colonel | **C. W. Peale** | 1772 | Act 1 base. Earliest known portrait. |
| **Washington at Princeton** | **C. W. Peale** | 1779 | **The wartime anchor.** Blue sash, captured colours at his feet, Nassau Hall behind. |
| Washington with William Lee | **John Trumbull** | 1780 | Staging only. Neither man sat. Turban is an Orientalist convention (§1.13). |
| Life mask & measurements | **Jean-Antoine Houdon** | 1785 | Proportion authority. |
| Athenaeum portrait | **Gilbert Stuart** | 1796 | **BANNED.** |
| Portraits of Connecticut sitters | **Ralph Earl** | 1780s–90s | Reference for the *provincial American* portrait register — stiffer, flatter, more linear than London portraiture. Useful for **non-Washington** NPC portraits: it makes the supporting cast look American rather than European. |

### The technical tradition behind R1

**Paul Sandby** (bapt. 1731–1809) — draughtsman on the **Military Survey of the Highlands**, then
**chief drawing master at the Royal Military Academy, Woolwich, from 1768**; called *"the father of
modern landscape painting in watercolours."* **[DOC]**
([Met Museum, Watercolor Painting in Britain 1750–1850](https://www.metmuseum.org/essays/watercolor-painting-in-britain-1750-1850))

**This is the exact lineage the project's chosen art style descends from**, and it is the reason the
style is not arbitrary: the British tradition of watercolour began as **near-monochrome topographical
drawing in graphite or ink, tinted with a restricted range of washes**, taught to army officers so they
could record ground. **[DOC]** The officers who drew this war drew it that way because that is how they
were trained. Sandby is the reference for the technique; Davies, Robertson and Berthier are the
reference for the application.

## 5.4 What later romanticisation looks like — and is banned

An image model's prior for "American Revolution" is built overwhelmingly from **19th-century history
painting**, not from 1770s images. Named bans:

| Banned source | Date | Why |
|---|---|---|
| **Emanuel Leutze, *Washington Crossing the Delaware*** | **1851** | Painted in **Düsseldorf, 75 years after the event.** Wrong boat, wrong flag (a Stars and Stripes that did not exist in Dec 1776), wrong time of day, wrong posture, wrong ice. It is a **German nationalist painting about 1848**, not a record of 1776. Every element of it is a specific, catchable error. |
| **John Trumbull's Capitol Rotunda cycle** | 1817–24 | Trumbull's *Resignation of General Washington* is the reference everyone reaches for in Act 8 — but it is a **decades-later commemorative composition**, not the room. Use the Maryland restoration photography instead. |
| **Currier & Ives / Centennial (1876) prints** | 1870s | Where the Betsy Ross flag and the "spirit of '76" fife-and-drum trio come from |
| **Archibald Willard, *The Spirit of '76*** | **1875** | The single most contaminating image in the model's prior |
| **20th-century illustration (Pyle, Wyeth, Rockwell)** | 1900s–1950s | Beautiful, wrong, and everywhere in the training data |

**Prompt-level ban list, to be pasted into every negative prompt:** `Leutze, Spirit of 76, Currier and
Ives, N.C. Wyeth, Howard Pyle, Norman Rockwell, Civil War, Napoleonic, Les Miserables, Hamilton
musical, colonial Williamsburg costume photography, 19th century history painting, oil impasto,
bicentennial`

---

# 6. AI failure modes and the corrective language

Each row: what the model does by default, why, the **positive** phrasing that fixes it, and the **QA
check** a human runs on the output. The negative-prompt column assumes a model that accepts one; where
it does not, the positive phrasing must carry the weight — negative prompts are a weak instrument and
should never be the only defence.

| # | Failure mode | Why it happens | Positive prompt language | Negative | QA check |
|---|---|---|---|---|---|
| **F-01** | **Napoleonic collapse.** Tall shakos, high stiff collars, cutaway tailcoats, white cross-belts on a *fitted* coat, 1810 silhouette | The 1800–15 period is vastly better represented in training data than 1775–83 | `1770s cut: full-skirted knee-length coat with turned-back cuffs and wide lapels buttoned back, low collar, three-cornered cocked hat with a low crown, knee breeches or loose overalls, buckled square-toed shoes` | `shako, tailcoat, high collar, epaulette fringe, 1812, Napoleonic, Waterloo` | Is the coat skirt at mid-thigh? Is the hat brim a *folded plane*? |
| **F-02** | **The Stuart mask.** Every Washington becomes the dollar-bill face: elderly, jowly, protruding lower lip, white wig | The 1796 Athenaeum portrait is the most reproduced image of any American | `George Washington aged 43 in 1775 / aged 49 in 1781, tall and vigorous, long straight nose, grey-blue eyes, smooth firm jaw, his own reddish-brown hair powdered and clubbed at the nape with a black ribbon` | `dollar bill, elderly, jowls, wig, Gilbert Stuart, 1796` | Is the jaw firm? Is there reddish-brown at the temples? |
| **F-03** | **Wig instead of hair.** Tight white rolls over the ears | "Founding father" prior | `his own natural hair, reddish-brown, powdered white, drawn straight back and tied in a queue at the nape with black silk ribbon; no wig; hair visibly reddish at the roots and temples` | `periwig, powdered wig, side rolls, barrister wig` | Can you see where the hair *grows*? |
| **F-04** | **Tricorne misshape.** A rigid triangular hat-shell, a pirate hat, or a bicorne | Costume-shop tricornes dominate the data | `a black felt hat whose flat circular brim is folded up and fastened against a low crown on three sides, brim edge bound with tape, black cockade at the left side` | `pirate hat, bicorne, stiff triangle hat, foam costume hat` | Trace the brim — does it read as one continuous folded plane? |
| **F-05** | **Facial hair.** Stubble, moustaches and beards on everyone | Modern "gritty soldier" prior | `clean-shaven, every face freshly shaved` — and for Germans only: `Hessian grenadiers with waxed moustaches, all other troops clean-shaven` | `beard, stubble, moustache, five o'clock shadow` | Zoom every face. Zero tolerance except German grenadiers/Jäger. |
| **F-06** | **Civil War drift.** Kepis, sack coats, forage caps, 1860s trousers, Springfield rifle-muskets | American-war prior is dominated by 1861–65 | `War of American Independence, 1776, flintlock era` | `kepi, forage cap, sack coat, Civil War, 1863, Gettysburg, percussion cap` | Any soft-crowned cap = reject |
| **F-07** | **Rifles everywhere.** Long slim rifles with no bayonets given to line infantry | "Frontier American" prior | `smoothbore flintlock musket with a brass-mounted walnut stock and a fixed triangular socket bayonet` — restrict `longrifle with browned octagonal barrel, curly maple stock, brass patchbox, no bayonet` to explicitly-labelled rifle companies | `scope, bolt action, rifled barrel, lever action` | Does every line-infantry musket have a bayonet lug? |
| **F-08** | **Wrong flag.** 13 stars in a ring, or a modern 50-star field | Betsy Ross myth saturates the data | For 1775–Jun 1777: `Grand Union flag: thirteen red and white stripes with the full British Union Jack in the canton`. For 1777+: `thirteen stripes, thirteen white stars in staggered rows on a blue canton`. Default: `regimental colour: a large silk standard with a regimental device, not a national flag` | `Betsy Ross, circle of stars, 50 stars, modern American flag` | Count the stars; check they are **not** in a ring |
| **F-09** | **Mount Vernon anachronism.** Piazza, cupola, weathervane in 1775 | Every photograph shows the finished house | `Mount Vernon as it stood in May 1775: a two-and-a-half storey house of rusticated sand-painted wooden siding, NO columned porch, NO cupola, NO weathervane, flat roofline, the north end an unfinished building site with scaffolding and stacked lumber` | `porch, colonnade, cupola, weathervane, piazza, veranda` | Roofline flat? North end raw? |
| **F-10** | **Modern military bearing.** Soldiers standing at a 20th-century "attention," rifles at modern shoulder-arms, squared-away posture | Modern military photography | `18th century posture: heels together and toes turned out, weight back, chin level, musket held vertically at the shoulder with the lock outward and the left hand at the small of the butt` | `at attention, modern soldier, tactical stance, military parade 20th century` | Are the toes turned out? |
| **F-11** | **Uniformity.** A perfectly matched line of identical soldiers | Models regularise crowds | `no two men dressed alike; one in four out of regulation; mixed coats, hunting shirts, waistcoats worn as outer garments and shirtsleeves in the same file; different hats; visible patching and mismatched buttons` | `uniform ranks, identical soldiers, toy soldiers, matching` | Could de Verger's four figures all fit in this crowd? |
| **F-12** | **Clean.** New-looking, laundered, pressed, un-mended clothing | Product-photography prior | `worn, weathered, mud to the knee, patched at the elbows, mended with mismatched cloth, powder-stained, sun-faded, sweat-marked linen` | `pristine, new, clean, pressed, reenactor, museum display` | Any garment that looks newly issued in Acts 2–5 = reject |
| **F-13** | **Wrong red.** British privates in bright fire-engine scarlet | Scarlet is the cliché | `British private soldiers in madder-red coats, a dull warm brick red; officers only in bright cochineal scarlet` | `fire engine red, bright scarlet, crimson` | Are privates duller than officers? |
| **F-14** | **Buff read as yellow.** Washington's facings come out canary | "Buff" is an unfamiliar colour word | `buff facings: a pale greyish yellow-tan, the colour of undyed chamois leather` + hex reference | `yellow, gold, canary, mustard` | Compare to `#C9B489` |
| **F-15** | **Pure black ink.** Line layer renders `#000000` on white | Digital-illustration prior | `iron gall ink, brown-black, on warm cream laid rag paper with visible chain lines; nothing in the image is pure black and nothing is pure white` | `pure black, white background, digital vector, crisp black outline` | Sample the darkest pixel — is it warm? |
| **F-16** | **Hessian caps become bishop's mitres or busbies** | Rare object, few references | `Prussian-pattern grenadier cap: a tall stiff pointed cloth mitre with a large embossed brass front plate bearing a rampant lion, brass side supports and a brass finial at the tip` | `bishop mitre, busby, bearskin, fez` | Is there a **flat brass plate on the front**, not fur? |
| **F-17** | **Durham boats become rowboats.** The Leutze boat | Leutze is the only crossing image most models know | `a Durham boat: a long black open cargo boat forty to sixty feet long with high straight sides and a shallow draught, poled and rowed, men standing along the gunwales` | `rowboat, dinghy, Leutze, Washington Crossing the Delaware painting` | Is the boat longer than 8 men standing shoulder to shoulder? |
| **F-18** | **Valley Forge as frontier cabins.** Round-log Lincoln-cabins scattered in woods | "Log cabin" prior | `a regulated grid of identical log huts, each fourteen by sixteen feet and six and a half feet high, doors all facing the same street, chimneys at the rear, gaps sealed with clay, arranged in ordered brigade streets` | `Lincoln log cabin, frontier cabin, scattered, rustic homestead` | Are they the **same size**, in **rows**, with doors on **one side**? |
| **F-19** | **Women bare-headed with loose hair** | Romantic-period-drama prior | `women in short gown, petticoat, stays, neckerchief at the throat and a white linen cap covering the hair; hair never loose` | `long flowing hair, bare head, corset, ball gown` | Every adult woman capped? |
| **F-20** | **Everyone is white.** Continental crowds render as uniformly white | Underrepresentation in training data | `an integrated Continental file including Black soldiers serving alongside white soldiers in the same rank, as recorded by the French officer de Verger at Yorktown in 1781` | | Does every crowd of 20+ Continentals include Black soldiers? Required for Acts 5, 7. |
| **F-21** | **Oil impasto.** Thick visible brushstrokes, Disco Elysium surface | The named reference bleeds through | `pen and wash on paper: a confident brown-black ink line drawn first, then transparent watercolour washes laid over it; visible paper grain; no opaque paint, no visible brush impasto, no canvas weave` | `oil painting, impasto, thick paint, canvas texture, palette knife` | Can you see paper, or canvas? |
| **F-22** | **Modern faces.** Contemporary orthodontia, gym physiques, modern grooming, symmetrical beauty | Portrait-model prior | `weathered 18th century faces, uneven teeth, smallpox scarring, wind-burned skin, asymmetrical features, working bodies` | `model, beautiful, perfect teeth, symmetrical, glamour, airbrushed` | Would this face be out of place in a Ralph Earl portrait? |
| **F-23** | **Free-orbit drift.** Regenerating a known location at a new angle produces a different building | Models cannot hold a location across viewpoints | *Prevented structurally, not by prompt.* Every location has exactly one canonical view (§0.2). | | Is this a locked canonical view, or a new angle on an existing one? If the latter, stop. |
| **F-24** | **Legible gibberish text** on documents, signs, maps | Text rendering is unreliable | `the writing on the paper is illegible: fine ink strokes suggesting cursive, not readable letterforms` — real text overlaid at runtime (§4.2) | `readable text, legible words, lettering, typography` | Zoom every document. Any near-word = reject. |

---

# 7. Historical sensitivity: depicting slavery in a painterly game

## 7.1 The problem, stated plainly

The concern the client and producer already flagged is correct and it is not hypothetical. **A
beautiful ink-and-wash treatment of the Mount Vernon quarter will aestheticise it.** Watercolour is a
charming medium. It softens. It makes weathered board look picturesque and poverty look pastoral. The
entire 19th-century plantation-nostalgia visual tradition — moonlight, cabins, contented figures — was
built in exactly this medium, for exactly that purpose. If Act 1 renders the quarter in the same warm,
gentle, hazy register as the mansion lawn, **the game will have made an argument it did not intend to
make**, and it will have made it in the first ten minutes.

There is a second, subtler failure available: making the quarter **grim and ugly** in contrast to a
beautiful mansion. That reads as a moral gesture but it does the same damage in reverse — it renders
enslaved people as objects of pity rather than as people, and it makes their lives *legible only as
suffering*. The archaeology says otherwise: the House for Families root cellar produced Chinese export
porcelain, a white salt-glazed stoneware teabowl, a bone-handled knife, colonoware — a **household**,
with taste, negotiation, craft, and a food economy of its own. **[DOC]**

## 7.2 The recommendation: the Witness Register

**Recommendation, stated as a decision, not a hedge: the enslaved-people scenes are drawn in a distinct
visual register — R5, the Witness Register — that removes the aestheticising apparatus rather than
adding grimness.**

**R5 differs from the game's default R1 in exactly five ways, and in no others:**

| Parameter | Default (R1) | Witness Register (R5) |
|---|---|---|
| **Wash** | Full chromatic wash over ink | **Ink line and a single grey wash only.** Near-monochrome. No colour except in what people actually own — a dyed neckerchief, a blue bead, a copper ring. Colour is reserved for **personal possession**. |
| **Atmosphere** | Aerial perspective, haze, fog, bloom, golden light | **None.** No haze, no lens bloom, no golden hour, no sun flare, no romantic weather. Clear, even, unflattering north light. |
| **Camera height** | Elevated three-quarter, ~4–5 m — looking *down* on the world | **Eye level with the standing figure.** The camera is level with a person's face, never above it. |
| **Framing** | Wide establishing composition; people are elements in a landscape | **Closer.** The figure occupies more of the frame than the building does. The architecture is background; the person is subject. |
| **Motion** | Ambient idle animation, birds, laundry, drifting smoke | **Stillness.** No decorative ambient motion in this register. Figures move when they act, and stop. |

**Why this works and a "grim palette" does not.** Every one of those five changes removes a device that
*flatters*. None of them adds suffering. The result is not uglier — it is **more attentive**. It is
also, precisely, the difference between a picturesque topographical view and a portrait, which is a
distinction the 18th century itself understood and which the game elsewhere trades on (§5.2). The
register change is therefore *diegetically motivated*: the game is telling you that this is a
different kind of looking.

And critically: **it is achievable by an AI pipeline.** It is a set of five mechanical parameter
changes to an existing style, not a second art style. That is the difference between a principle that
survives production and one that gets cut in week nine.

## 7.3 Concrete rules for the art

1. **No enslaved person is ever depicted mid-labour as scenery.** If a figure is working, that work is
   the subject of the shot and the person is named. Field hands in the middle distance of a pretty
   landscape is the exact 19th-century composition this project must not reproduce.
2. **No shackles, no whipping, no violence on screen.** Not because it did not happen, but because a
   painterly depiction of violence against Black bodies in a classroom product is both gratuitous and
   too easy — it lets the student feel the horror without understanding the system. The system is what
   is being taught. **Violence appears only in text**, in documented primary sources, at the student's
   election.
3. **No smiling, singing, or contented-servant imagery.** Ever. This is the other 19th-century
   composition.
4. **Faces are individuated and frontal.** No silhouettes, no faceless figures, no figures seen only
   from behind. The Mount Vernon "Lives Bound Together" exhibition uses **conjectural silhouettes** to
   mark presence where no likeness survives **[DOC]** — that is an appropriate choice for a museum
   handling an evidentiary void, and the wrong choice for a game, where a faceless figure reads as an
   NPC placeholder rather than as a documented absence.
5. **Interiors are as carefully furnished as the mansion's.** Use the archaeology: the root cellar, the
   colonoware, the teabowl, the pewter spoon, the bone-handled knife, the tobacco pipe, the oyster
   shells. **[DOC]** A quarter rendered as bare boards and straw is a failure of research, not a
   statement about hardship.
6. **The House for Families, not "slave cabins."** One substantial building at the Mansion House Farm
   in 1775, not a row of picturesque cabins. **The greenhouse quarters do not exist yet** (built 1792).
   Getting this right is also getting the *scale* of the operation right.

## 7.4 The people

Mount Vernon's own research names individuals; the game should too. **Named, with biographies, not
"an enslaved worker."** The brief's Act 1 cast list currently reads *"an enslaved worker"* — that
phrasing should not survive into production. Two who must appear:

- **William (Billy) Lee**, valet, at Washington's side for the entire war (§1.13). He is the thread.
- At least one named person at Mount Vernon in 1775 with a documented life, drawn from the *Lives Bound
  Together* research, which provides brief biographies of nineteen individuals. **[DOC]**
  ([Mount Vernon, Lives Bound Together](https://www.mountvernon.org/plan-your-visit/calendar/exhibitions/lives-bound-together-slavery-at-george-washington-s-mount-vernon))

## 7.5 The Dunmore reversal is the spine of this thread

The design already commits to carrying the enslaved-people thread past Act 1, including "the real,
documented reversal on Black enlistment after Dunmore's Proclamation." Here is why that is the right
call and how to stage it.

The sequence in §1.13 — Washington bars Black enlistment on **12 Nov 1775**; Dunmore offers freedom on
**7 Nov 1775**; Washington reverses on **30 Dec 1775** and writes to Hancock that refusing them risks
driving them to the British — is a decision made on grounds of **manpower and competitive advantage**.
**[DOC]** Staged honestly, it does three things no lecture can:

1. It shows the student that **the British were, in this narrow and self-interested respect, offering
   more** — which is the hardest and most necessary complication in the whole unit.
2. It shows **Washington changing a policy for a reason that is not moral**, which is the single most
   useful thing a "great man" game can do to its own premise.
3. It is a **decision point**, which means it belongs to the player, and it moves stats — Military
   Judgment up, Personal Character not at all. That asymmetry *is* the lesson, and the internal council
   is the instrument: **Ambition** and **Duty** argue for it; **Restraint** and **Vanity** do not; and
   the voice that would argue on moral grounds **is not in the chorus**, because it was not in the
   room. That silence is the most eloquent thing the mechanic can do all game.

## 7.6 Review gate

**No asset in the Witness Register ships without human sign-off from someone who has read Mount Vernon's
own interpretive guidance.** This is the one place in the pipeline where AI generation must not be
approved by the person who prompted it. Budget for it.

---

# 8. Open verification queue

Items tagged **[CONV]** or **[RECON]** that must be resolved before art lock. Assign each an owner.

| # | Item | Where to resolve it |
|---|---|---|
| V-1 | Facing colours of the three Hessian regiments at Trenton (Rall, Alt von Lossberg, Knyphausen) | Lefferts plates, [N-YHS eMuseum](https://emuseum.nyhistory.org/); Anne S. K. Brown Military Collection |
| V-2 | Whether Virginia belongs in the red-facing group of the 2 Oct 1779 order | Full text of the General Orders, *Papers of George Washington* (Founders Online) |
| V-3 | Bourbonnais and Gâtinais facing colours | Anne S. K. Brown; Lienhart & Humbert, *Les Uniformes de l'Armée Française* |
| V-4 | The date Washington personally ceased wearing the light blue ribband | Peale and Trumbull portrait chronology; *Papers of GW* |
| V-5 | British regimental facings for any regiment the script names on screen | Royal Clothing Warrant 1768; [redsandrevs.co.uk](https://www.redsandrevs.co.uk/clothing-warrant-1768) |
| V-6 | Continental gun-carriage colour | Currently ruled irrelevant by decision (§4.4). Revisit only if a scene makes it load-bearing. |
| V-7 | Temple of Virtue dimensions: 80×40 vs 100×30 | New Windsor Cantonment State Historic Site |
| V-8 | Whether the "LIBERTY TO SLAVES" sash is defensible in a classroom product | Already resolved by decision (§1.13): show once, cite the newspaper report as a report. |
| V-9 | Period-correct sealing and pounce practice for the letterbook props | Colonial Williamsburg research reports |

---

# 9. Primary sources cited

**Uniforms and equipment**
- [History of Massachusetts Blog — Revolutionary War soldiers' uniforms](https://historyofmassachusetts.org/uniforms-revolutionary-war-soldiers/)
- [HISTORY — What Uniforms Did the Continental Army Wear?](https://www.history.com/articles/american-revolution-uniforms)
- [Google Arts & Culture / US National Archives — Threads of Independence](https://artsandculture.google.com/story/threads-of-independence-the-evolution-of-the-iconic-blue-uniform-u-s-national-archives/WQUBpsvTZriEbQ)
- [Redcoats & Revs — Colours and Clothing Warrant, 1768](https://www.redsandrevs.co.uk/clothing-warrant-1768)
- [Kochan — The French-made "Lottery" Uniforms of the Continental Army, 1777–1779](https://www.scribd.com/document/272894004/)
- [Journal of the American Revolution — Continental Cartridge Canisters](https://allthingsliberty.com/2015/03/tin-canisters/)
- [Kabinettskriege — Soldiers and Facial Hair](http://kabinettskriege.blogspot.com/2019/08/soldiers-and-facial-hair-in.html)
- [Royal Deux-Ponts Regiment](https://en.wikipedia.org/wiki/Royal_Deux-Ponts_Regiment)
- [AmericanRevolution.org — The Arrival of Rochambeau](https://www.americanrevolution.org/france-in-the-revolution-chapter-16/)

**Washington**
- [Library of Congress — GW Papers, General Orders 14 July 1775](https://www.loc.gov/resource/mgw3g.001?sp=20&st=text)
- [Mount Vernon — General Washington's Military Equipment](https://www.mountvernon.org/preservation/collections/general-washingtons-military-equipment)
- [Mount Vernon — Houdon's Life Mask](https://www.mountvernon.org/george-washington/artwork/houdons-life-mask-of-george-washington)
- [Mount Vernon — Washington's Teeth](https://www.mountvernon.org/george-washington/health/washingtons-teeth)
- [Mount Vernon — Life Portraits of George Washington](https://www.mountvernon.org/george-washington/artwork/life-portraits-of-george-washington)
- [Mount Vernon — Nelson (Horse)](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/nelson-horse)
- [Smithsonian — How George Washington Did His Hair](https://www.smithsonianmag.com/smart-news/how-george-washington-did-his-hair-180955547/)
- [Arlington Historical — Blue and Buff: the Fairfax uniform](https://arlingtonhistorical.com/items/show/350)

**Locations**
- [Mount Vernon — Expansion of the Mansion](https://www.mountvernon.org/the-estate-gardens/the-mansion/expansion-of-mount-vernons-mansion)
- [Mount Vernon — Exterior Architectural Details](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/exterior-architectural-details)
- [Mount Vernon — The House for Families](https://www.mountvernon.org/preservation/archaeology/the-house-for-families)
- [American Battlefield Trust — Valley Forge Encampment](https://www.battlefields.org/learn/articles/valley-forge-encampment)
- [Journal of the American Revolution — What Were the Brooklyn Line of Forts in 1776?](https://allthingsliberty.com/2021/10/what-were-the-brooklyn-line-of-forts-in-1776/)
- [Washington Crossing Historic Park — The Historic Village](https://www.washingtoncrossingpark.org/park/the-village-lower-park/)
- [Washington Crossing Park Association — Were the Hessians Drunk at Trenton?](https://www.wcpa-nj.com/ten3)
- [Old Barracks Museum — Building Legacy](https://barracks.org/about/history/building-legacy/)
- [Mount Vernon — New Windsor Cantonment](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/new-windsor-cantonment)
- [Washington's Headquarters State Historic Site (Hasbrouck House)](https://en.wikipedia.org/wiki/Washington's_Headquarters_State_Historic_Site)
- [Hatch, *Yorktown and the Siege of 1781* (NPS), Project Gutenberg](https://www.gutenberg.org/cache/epub/54080/pg54080-images.html)
- [American Battlefield Trust — Fortifications in the American Revolution](https://www.battlefields.org/learn/articles/i-have-never-spared-spade-and-pick-ax-fortifications-american-revolution)
- [Maryland State Archives — The Old Senate Chamber](https://msa.maryland.gov/msa/mdstatehouse/html/old_chamber.html)
- [Maryland DGS — Old Senate Chamber Restored to its Original Appearance](https://news.maryland.gov/dgs/2015/12/09/old-senate-chamber-restored-to-its-original-appearance/)

**Material culture**
- [Museum of the American Revolution — Washington's Headquarters Tent](https://www.amrevmuseum.org/collection/washington-s-war-tent)
- [Museum of the American Revolution — Hessian Cap Plates](https://www.amrevmuseum.org/collection/hessian-cap-plates)
- [NRA Museum — Short Land Pattern Brown Bess](https://www.nramuseum.org/guns/the-galleries/road-to-american-liberty-1700-to-1780/case-4-shot-heard-round-the-world/brown-bess-model-1762-short-land-pattern-flintlock-musket.aspx)
- [Army Historical Foundation — Charleville Musket](https://armyhistory.org/charleville-musket/)
- [Conservation Wiki — Iron Gall Ink](https://conservation-wiki.com/wiki/BPG_Iron_Gall_Ink)
- [Betsy Ross flag — historiography](https://en.wikipedia.org/wiki/Betsy_Ross_flag)

**The visual record**
- [American Revolution Institute — Verger's Four Soldiers](https://www.americanrevolutioninstitute.org/four-soldiers-diversity-in-the-continental-army/)
- [Library of Congress — "Soldiers in Uniform" (de Verger)](https://www.loc.gov/item/2021669876/)
- [Library of Congress — Rochambeau Map Collection](https://www.loc.gov/collections/rochambeau-maps/about-this-collection/)
- [Princeton — Berthier's Manuscript Maps of America, 1781–82](https://blogs.princeton.edu/manuscripts/2013/11/27/berthiers-manuscript-maps-of-america-1781-82/)
- [Concord Free Public Library — Amos Doolittle's 1775 engraving](https://concordlibrary.org/uploads/scollect/BuildingHistories/MiddlesexHotel/storyPages/amosDoolitleEngraving.html)
- [Dictionary of Canadian Biography — Thomas Davies](https://www.biographi.ca/en/bio/davies_thomas_5E.html)
- [Museum of the American Revolution — Breaking Down della Gatta's Battle of Paoli](https://www.amrevmuseum.org/learn-and-explore/collection/breaking-down-xavier-della-gatta-s-battle-of-paoli-painting)
- [Met Museum — Watercolor Painting in Britain, 1750–1850](https://www.metmuseum.org/essays/watercolor-painting-in-britain-1750-1850)
- [Library of Congress — British Cartoon Prints](https://www.loc.gov/collections/british-cartoon-prints/)

**Slavery, Black soldiers, and camp followers**
- [Mount Vernon — Clothing for the Enslaved](https://www.mountvernon.org/george-washington/slavery/clothing)
- [Mount Vernon — Lives Bound Together](https://www.mountvernon.org/plan-your-visit/calendar/exhibitions/lives-bound-together-slavery-at-george-washington-s-mount-vernon)
- [Mount Vernon — William (Billy) Lee](https://www.mountvernon.org/library/digitalhistory/digital-encyclopedia/article/william-billy-lee)
- [Met Museum — Trumbull, George Washington and William Lee](https://www.metmuseum.org/art/collection/search/12822)
- [Encyclopedia Virginia — Lord Dunmore's Ethiopian Regiment](https://encyclopediavirginia.org/entries/lord-dunmores-ethiopian-regiment/)
- [Revolutionary War Journal — Washington and the Enlistment of Black Soldiers](https://revolutionarywarjournal.com/enlist-no-stroller/)
- [HISTORY — America's First Black Regiment](https://www.history.com/articles/first-black-regiment-american-revolution-first-rhode-island)
- [Rees — Female Camp Followers with the Continental Army](https://www.revwar75.com/library/rees/proportion.htm)
- [Rees — "Some in rags and some in jags"](https://revwar75.com/library/rees/wcloth.htm)
