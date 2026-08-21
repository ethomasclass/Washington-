/**
 * The interface, as one stylesheet.
 *
 * THE OVERHAUL, STATED. The old chrome was a sheet of paper with the game
 * printed on it, and it read as a worksheet — which for a fifteen-year-old in
 * period four is a verdict, not a style. This reads as a game: framed panels
 * with a moulded edge and a brass line, a portrait in its own frame, a cursor
 * that moves, and text that arrives.
 *
 * What survives from the print direction is where it earns its keep: documents
 * are still a printed page in a period register, because that is the object
 * the pedagogy is about, and the letterbook is still a book. The world stopped
 * being an engraving. The archive did not.
 *
 * R17 is not negotiable and is obeyed here: all dialogue, Council and system
 * text is a plain humanist sans at 19px with a 58-66 character measure. The
 * period faces appear in documents and nowhere else.
 */

export const CSS = `
:root {
  --ink:        #12100c;
  --wood:       #2b1f16;
  --wood-hi:    #4a3626;
  --wood-lo:    #170f0a;
  --brass:      #c8a13f;
  --brass-dim:  #8a6c26;
  --parch:      #e9e0c9;
  --parch-dim:  #cdc0a3;
  --text:       #f2ecdd;
  --text-dim:   #b9ae97;
  --sealed:     #96382c;
  --ui:         system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  --serif:      "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --panel-pad:  18px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0; padding: 0; height: 100%;
  background: #07080a;
  overflow: hidden;
  font-family: var(--ui);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

#stage { position: fixed; inset: 0; }
#view  { position: absolute; inset: 0; width: 100%; height: 100%; display: block; image-rendering: pixelated; }

#ui {
  position: absolute; inset: 0;
  pointer-events: none;
  display: flex; flex-direction: column;
  font-size: 19px; line-height: 1.5;
}
#ui > * { pointer-events: auto; }

/* ---------- the frame language ------------------------------------- */

.panel {
  position: relative;
  background:
    linear-gradient(180deg, rgba(74,54,38,.55), rgba(23,15,10,.72)),
    radial-gradient(120% 140% at 20% 0%, rgba(200,161,63,.10), transparent 60%),
    var(--wood);
  border: 2px solid var(--wood-lo);
  border-radius: 3px;
  box-shadow:
    inset 0 0 0 1px rgba(200,161,63,.28),
    inset 0 1px 0 rgba(255,225,170,.10),
    0 10px 30px rgba(0,0,0,.55);
}
.panel::after {
  content: ""; position: absolute; inset: 4px;
  border: 1px solid rgba(200,161,63,.22);
  border-radius: 2px; pointer-events: none;
}

/* ---------- top banner --------------------------------------------- */

#banner {
  align-self: center;
  margin-top: 14px;
  padding: 7px 26px;
  display: flex; align-items: baseline; gap: 14px;
  background: linear-gradient(180deg, rgba(20,14,10,.82), rgba(12,9,6,.88));
  border: 1px solid rgba(200,161,63,.34);
  border-radius: 2px;
  box-shadow: 0 6px 22px rgba(0,0,0,.5);
  transition: opacity .4s;
}
#banner .place { font-size: 17px; letter-spacing: .10em; text-transform: uppercase; color: var(--brass); }
#banner .when  { font-size: 15px; color: var(--text-dim); letter-spacing: .04em; }
#banner.away { opacity: 0; }

/* ---------- objective rail ------------------------------------------ */

#rail {
  position: absolute; top: 66px; left: 20px;
  max-width: 330px;
  padding: 11px 15px 12px;
  font-size: 15px; line-height: 1.42;
  background: linear-gradient(180deg, rgba(20,14,10,.72), rgba(12,9,6,.80));
  border-left: 3px solid var(--brass-dim);
  border-radius: 2px;
  transition: opacity .35s;
}
#rail h4 {
  margin: 0 0 6px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase;
  color: var(--brass); font-weight: 600;
}
#rail ul { margin: 0; padding: 0; list-style: none; }
#rail li { color: var(--text-dim); padding-left: 15px; position: relative; margin-bottom: 3px; }
#rail li::before { content: "\\2013"; position: absolute; left: 0; color: var(--brass-dim); }
#rail li.done { color: #6f8f5c; text-decoration: line-through; text-decoration-thickness: 1px; }
#rail li.done::before { content: "\\2713"; color: #6f8f5c; }
#rail.hide { opacity: 0; pointer-events: none; }

/* ---------- reach prompt -------------------------------------------- */

#reach {
  position: absolute; left: 50%; transform: translateX(-50%);
  bottom: 116px;
  display: flex; align-items: center; gap: 10px;
  padding: 7px 15px;
  font-size: 16px;
  background: rgba(12,9,6,.84);
  border: 1px solid rgba(200,161,63,.36);
  border-radius: 2px;
  opacity: 0; transition: opacity .16s;
  white-space: nowrap;
}
#reach.on { opacity: 1; }
#reach .key {
  font-size: 12px; letter-spacing: .08em;
  padding: 2px 7px; border-radius: 2px;
  background: linear-gradient(180deg, #d9b862, #a37f26);
  color: #211607; font-weight: 700;
}
#reach .more { color: var(--text-dim); font-size: 13px; }

/* ---------- dialogue ------------------------------------------------- */

#dialogue {
  position: absolute; left: 50%; transform: translateX(-50%);
  bottom: 22px; width: min(980px, calc(100% - 44px));
  padding: var(--panel-pad);
  display: none; gap: 16px;
}
#dialogue.on { display: flex; }

#portrait {
  flex: 0 0 auto; width: 108px; height: 132px;
  position: relative;
  background: var(--wood-lo);
  border: 2px solid rgba(200,161,63,.42);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: inset 0 0 18px rgba(0,0,0,.6);
}
#portrait img { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
#portrait.empty { display: none; }

#say { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
/*
 * NOTHING INSIDE THE SPEECH COLUMN MAY SHRINK.
 *
 * #text carries a min-height of 3.1em so a one-line answer does not make the
 * panel jump, and a flex child's default flex-shrink of 1 reads that as
 * permission to squeeze it down TO 3.1em when the column is height-capped —
 * which it is on a phone. Four lines of prompt then render inside three
 * lines of box and overflow straight through the Council underneath, one
 * sentence written over another. It is a spectacular-looking bug for a
 * one-word cause.
 */
#say > * { flex: 0 0 auto; }
#speaker {
  font-size: 13px; letter-spacing: .15em; text-transform: uppercase;
  color: var(--brass); margin-bottom: 7px; font-weight: 600;
}
#text { max-width: 64ch; min-height: 3.1em; }
#text .cursor { color: var(--brass); animation: blink 1s steps(2) infinite; }
@keyframes blink { 50% { opacity: 0; } }

/*
 * The Council panel, tightened. Shorter lines (content rewrite, not CSS —
 * see estate-people.ts / mansion.ts / departure.ts) mean most voices now fit
 * one wrapped line instead of two or three, and this spacing is sized for
 * that: a lower gap between rows, a lower line-height within one, and the
 * voice's name folded onto the same line as what it says rather than reading
 * as its own row. Font size is untouched on purpose — the ask was to read
 * easier, and a smaller face fights that even while freeing up room.
 */
#council { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }
.voice {
  display: flex; gap: 9px; align-items: flex-start;
  font-size: 17px; line-height: 1.3;
  padding-left: 2px;
  animation: voiceIn .28s ease-out;
}
@keyframes voiceIn { from { opacity: 0; transform: translateY(5px); } }
.voice img { width: 16px; height: 16px; image-rendering: pixelated; flex: 0 0 auto; margin-top: 4px; filter: brightness(1.5); }
.voice .who { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; opacity: .9; margin-right: 2px; }
.voice .said { color: var(--text); opacity: .95; }

#choices { margin-top: 14px; display: flex; flex-direction: column; gap: 2px; }
.choice {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 7px 11px;
  border: 1px solid transparent; border-radius: 2px;
  color: var(--text-dim);
  cursor: pointer;
  transition: background .12s, color .12s;
}
.choice .bullet { color: transparent; width: 14px; flex: 0 0 auto; }
.choice.sel {
  background: linear-gradient(90deg, rgba(200,161,63,.20), rgba(200,161,63,.03));
  border-color: rgba(200,161,63,.40);
  color: var(--text);
}
.choice.sel .bullet { color: var(--brass); }
.choice .favoured { display: flex; gap: 3px; margin-left: auto; opacity: .8; }
.choice .favoured img { width: 15px; height: 15px; image-rendering: pixelated; filter: brightness(1.5); }
.choice.locked { color: #6b6255; cursor: not-allowed; }
.choice.locked .label { text-decoration: line-through; text-decoration-thickness: 1px; }
.choice .note { display: block; font-size: 14px; color: #7d7361; font-style: italic; margin-top: 2px; }
#hint { margin-top: 11px; font-size: 13px; color: #7d7263; letter-spacing: .04em; }

#sealed {
  display: none; align-items: center; gap: 10px;
  margin-bottom: 12px; padding-bottom: 10px;
  border-bottom: 1px solid rgba(150,56,44,.4);
}
#sealed.on { display: flex; }
#sealed img { width: 26px; height: 26px; image-rendering: pixelated; }
#sealed .words {
  font-size: 12px; letter-spacing: .17em; text-transform: uppercase; color: var(--sealed); font-weight: 700;
}

/* ---------- document reader ------------------------------------------ */

#reader {
  position: absolute; inset: 0;
  display: none; align-items: center; justify-content: center;
  background: rgba(6,5,4,.74);
  backdrop-filter: blur(2px);
}
#reader.on { display: flex; }
#sheet {
  width: min(760px, calc(100% - 60px)); max-height: calc(100% - 80px);
  overflow: auto;
  padding: 40px 52px 34px;
  color: #241c14;
  background:
    repeating-linear-gradient(0deg, rgba(0,0,0,.018) 0 1px, transparent 1px 3px),
    radial-gradient(120% 90% at 30% 0%, #f2ead4, #ddd2b4 70%, #cdc0a0);
  border: 1px solid #8a7c5c;
  box-shadow: 0 24px 60px rgba(0,0,0,.6);
}
#sheet h2 { margin: 0 0 3px; font-family: var(--serif); font-size: 25px; font-weight: 600; letter-spacing: .01em; }
#sheet .cite { font-size: 13px; color: #6a5c44; letter-spacing: .04em; margin-bottom: 4px; }
#sheet .gloss {
  font-size: 15px; color: #4a3c28; font-style: italic;
  border-left: 2px solid #a89468; padding-left: 12px; margin: 14px 0 20px;
}
#sheet .body { font-family: var(--serif); font-size: 19px; line-height: 1.62; max-width: 60ch; }
#sheet .body p { margin: 0 0 15px; }
#sheet.printed  .body { font-family: var(--serif); }
#sheet.secretary .body { font-family: var(--serif); font-style: italic; letter-spacing: .012em; }
#sheet.engrossed .body { font-family: var(--serif); letter-spacing: .05em; }
#sheet.rough     .body { font-family: var(--ui); font-size: 18px; letter-spacing: .01em; }
#sheet .close { margin-top: 22px; font-size: 13px; color: #6a5c44; letter-spacing: .06em; }

/* ---------- letterbook menu ------------------------------------------ */

#menu {
  position: absolute; inset: 0;
  display: none; align-items: center; justify-content: center;
  background: rgba(6,5,4,.72);
}
#menu.on { display: flex; }
#book {
  width: min(880px, calc(100% - 60px)); height: min(560px, calc(100% - 80px));
  display: flex; flex-direction: column;
  padding: 0;
}
#tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(200,161,63,.28); padding: 12px 14px 0; }
.tab {
  padding: 9px 18px; font-size: 14px; letter-spacing: .10em; text-transform: uppercase;
  color: var(--text-dim); cursor: pointer; border-bottom: 2px solid transparent;
}
.tab.sel { color: var(--brass); border-bottom-color: var(--brass); }
#pages { flex: 1 1 auto; overflow: auto; padding: 20px 26px 24px; }
#pages h3 { margin: 0 0 12px; font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: var(--brass); }
#pages .row {
  padding: 9px 12px; border-radius: 2px; color: var(--text-dim);
  display: flex; gap: 12px; align-items: baseline; cursor: pointer;
}
#pages .row.sel { background: rgba(200,161,63,.14); color: var(--text); }
#pages .row .sub { font-size: 14px; color: #8a8070; }
#pages .empty { color: #7d7263; font-style: italic; }
#pages .code {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 26px; letter-spacing: .22em; color: var(--brass);
  background: rgba(0,0,0,.35); padding: 16px 20px; border-radius: 2px;
  border: 1px solid rgba(200,161,63,.3); word-break: break-all;
}

/* ---------- the historical notice ------------------------------------- */
/*
 * Deliberately the only thing in this game that does not look like 1775.
 *
 * Every other panel is wood, brass and a period register. This one is a plain
 * modern card in a plain modern face, because it is not Washington thinking,
 * not a person speaking, and not a document out of the archive — it is us,
 * now, telling a student something true before they walk into it. The break
 * in register IS the content, and it must not be decorated back into the
 * game's own furniture.
 */
#notice {
  position: absolute; inset: 0;
  display: none; align-items: center; justify-content: center;
  background: rgba(6,5,4,.9);
  padding: 24px;
}
#notice.on { display: flex; }
/*
 * Header and footer are pinned; only the middle scrolls. On a 768px
 * Chromebook panel — the machine this has to be good on — the whole notice
 * does not fit, and the first build let it overflow a plain scrolling box:
 * the student saw four paragraphs, pressed SPACE, and never knew the last
 * paragraph or the source line existed. A claim of this weight cannot have
 * its citations below the fold.
 */
#notice .card {
  width: min(700px, 100%); max-height: calc(100% - 40px);
  display: flex; flex-direction: column;
  background: #14161a;
  border: 1px solid #394049;
  border-left: 3px solid var(--brass);
  border-radius: 2px;
  padding: 24px 30px 18px;
}
#notice h2 {
  flex: 0 0 auto;
  margin: 0 0 14px; font-size: 14px; letter-spacing: .15em;
  text-transform: uppercase; color: var(--brass); font-weight: 600;
}
#notice .body { flex: 1 1 auto; overflow-y: auto; min-height: 0; }
#notice p {
  margin: 0 0 12px; font-size: 17px; line-height: 1.5;
  color: #e9eaec; max-width: 64ch;
}
#notice .src {
  margin-top: 16px; padding-top: 12px; border-top: 1px solid #2a2f36;
  font-size: 13.5px; line-height: 1.5; color: #878d95; max-width: 64ch;
}
#notice .go {
  flex: 0 0 auto;
  margin-top: 14px; padding-top: 12px; border-top: 1px solid #2a2f36;
  font-size: 14px; color: #878d95; letter-spacing: .04em;
}
/* The reckoning uses the notice's card and its own rows. Losses and gains
 * are the same weight of type on purpose — see the note in ui.ts. */
#notice .reckon .row {
  display: flex; align-items: baseline; gap: 14px;
  padding: 5px 0; border-bottom: 1px solid #23272d;
  font-size: 15.5px; color: #d8dade; line-height: 1.4;
}
#notice .reckon .row > span:first-child { flex: 1 1 auto; }
#notice .reckon .row .n {
  flex: 0 0 auto; font-variant-numeric: tabular-nums; font-size: 15.5px; color: #e9eaec;
}
#notice .reckon .row .n.loss { color: #d99a8e; }
#notice .reckon .row .n.gain { color: #9ac9a4; }
#notice .reckon .row.head,
#notice .reckon .row.total {
  color: var(--brass); border-bottom-color: #3a4049;
  letter-spacing: .04em; text-transform: uppercase; font-size: 12.5px;
}
#notice .reckon .row.head .n,
#notice .reckon .row.total .n { color: var(--brass); font-size: 17px; }
#notice .reckon .row.total { border-bottom: none; border-top: 1px solid #3a4049; margin-top: 6px; }

#notice .go .key {
  font-size: 12px; padding: 2px 8px; border-radius: 2px; margin-right: 6px;
  background: linear-gradient(180deg, #d9b862, #a37f26); color: #211607; font-weight: 700;
}

/* ---------- the map tables ------------------------------------------- *
 *
 * TWO of them now — Knox's route and the East River — and they share every
 * rule of chrome: the same sheet, the same head, the same option rows, the
 * same dispatch card, the same footer. Only the drawing underneath and the
 * thing you move on it differ, which is as it should be, because they are
 * the same object in two rooms.
 *
 *
 * The one screen in the game that is a THING rather than a panel: a survey
 * sheet on a table, lit from one side, with the rest of the room dark. It is
 * the only place the interface pretends to be an object, and it earns that by
 * being the only place the player manipulates one.
 *
 * It is laid out to fit a 1024x600 Chromebook panel without scrolling: the
 * sheet takes what is left after a fixed head, ask, options and footer, and
 * the options collapse to a column under 900px.
 * ------------------------------------------------------------------- */

.sheetui {
  position: absolute; inset: 0;
  display: none; align-items: center; justify-content: center;
  background: radial-gradient(120% 100% at 30% 0%, #241a12 0%, #0a0806 70%);
  padding: 18px;
}
.sheetui.on { display: flex; }
.sheetui .frame {
  width: min(1040px, 100%); max-height: 100%;
  display: flex; flex-direction: column; gap: 10px;
}
/* A label near the right edge hangs its text back over the sheet instead of
 * off it. Four place names out of eight sit past two-thirds across. */
.sheetui .board .place.right { transform: translate(-9px, -15px); text-align: right; }
.sheetui .board .place.right::after { content: ''; }
.sheetui .head {
  display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap;
  border-bottom: 1px solid #3a2f22; padding-bottom: 7px;
}
.sheetui .head .ttl {
  font-family: var(--serif); font-size: 19px; color: var(--parch); letter-spacing: .02em;
}
.sheetui .head .sub {
  font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--brass-dim);
}

/* The sheet keeps the proportions it was drawn at.
 * Stretched to whatever height was left over it read as a strip of wallpaper;
 * a survey is a sheet of paper and it has to look like one. */
.sheetui .board {
  position: relative; flex: 0 1 auto;
  width: 100%; max-width: min(100%, 62vh * 1.6);
  aspect-ratio: 8 / 5; margin: 0 auto;
  background-size: 100% 100%; background-repeat: no-repeat;
  border: 1px solid #57452e;
  border-radius: 2px;
  box-shadow: 0 14px 40px rgba(0,0,0,.65), inset 0 0 60px rgba(90,60,20,.22);
  filter: saturate(.95);
  image-rendering: pixelated;
}
.sheetui .board .place {
  position: absolute; transform: translate(9px, -15px);
  font-family: var(--serif); font-size: 12.5px; font-style: italic;
  color: #2a2118; white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255,255,255,.5);
}
.sheetui .board .scale,
.sheetui .board .north {
  position: absolute; transform: translate(0, 10px);
  font-size: 10.5px; letter-spacing: .1em; color: #3b3025;
}
.sheetui .board .north {
  transform: translate(-4px, 0); font-family: var(--serif); font-size: 14px; color: #7a2f22;
}
/* The train, as a token you can watch move. Two pixels of brass on a sheet
 * of paper is the whole of the animation budget and it is enough. */
.sheetui .board .token {
  position: absolute; width: 15px; height: 15px; margin: -8px 0 0 -8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f0d68a, #a37f26 60%, #5c4412);
  box-shadow: 0 0 0 2px rgba(255,255,255,.55), 0 2px 5px rgba(0,0,0,.5);
  transition: left .55s cubic-bezier(.4,0,.2,1), top .55s cubic-bezier(.4,0,.2,1);
}

.sheetui .ask {
  font-family: var(--serif); font-size: 17px; line-height: 1.4; color: var(--parch);
}
.sheetui .ask .n {
  display: inline-block; margin-right: 10px;
  font-family: var(--ui); font-size: 10.5px; letter-spacing: .18em;
  text-transform: uppercase; color: var(--brass-dim);
}

.sheetui .opts { display: flex; gap: 10px; }
.sheetui .opt {
  flex: 1 1 0; min-width: 0; text-align: left;
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px 13px; border-radius: 2px; cursor: default;
  font: inherit; color: var(--text-dim);
  background: rgba(20,15,10,.72);
  border: 1px solid #3a2f22; border-left: 3px solid #3a2f22;
}
.sheetui .opt.on {
  color: var(--text); background: rgba(48,36,20,.9);
  border-color: var(--brass-dim); border-left-color: var(--brass);
}
.sheetui .opt.locked { opacity: .45; }
.sheetui .opt .lab { font-size: 14.5px; letter-spacing: .01em; }
.sheetui .opt .det { font-size: 12.5px; line-height: 1.45; color: var(--text-dim); }
.sheetui .opt .lock { font-size: 11.5px; font-style: italic; color: var(--sealed); }

/* The dispatches. Deliberately a different object from the sheet: a folded
 * paper that came in on a horse, not part of the drawing. */
.sheetui .wire {
  display: none;
  background: rgba(233,224,201,.94); color: #201a12;
  border-radius: 2px; padding: 12px 16px;
  box-shadow: 0 8px 26px rgba(0,0,0,.55);
  max-height: 34vh; overflow-y: auto;
}
.sheetui .wire.on { display: block; }
.sheetui .wire .hdr {
  display: block; margin-bottom: 6px;
  font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase; color: #7a5c1e;
}
.sheetui .wire p { margin: 0 0 8px; font-family: var(--serif); font-size: 15.5px; line-height: 1.5; }
.sheetui .wire p:last-child { margin-bottom: 0; }
.sheetui .wire .cite { font-size: 13px; font-style: italic; color: #5d5240; }

.sheetui .foot { font-size: 13px; color: var(--text-dim); letter-spacing: .04em; }
.sheetui .foot .key {
  font-size: 11px; padding: 2px 7px; border-radius: 2px; margin-right: 5px;
  background: linear-gradient(180deg, #d9b862, #a37f26); color: #211607; font-weight: 700;
}

@media (max-width: 900px) {
  .sheetui .opts { flex-direction: column; }
  .sheetui .opt .det { display: none; }
}
/* A short window (a 1024x600 Chromebook in landscape) gives the sheet less
 * room rather than squashing it: the options and the dispatch are the part
 * that must never scroll. */
@media (max-height: 700px) {
  .sheetui .board { max-width: min(100%, 44vh * 1.6); }
  .sheetui .head .sub { display: none; }
}

/* ---------- the wind rose and the fleet's reach ------------------------ *
 *
 * The one instrument in the game the player turns rather than chooses from,
 * and the whole readout is two elements: an arrow that rotates and a band
 * along the river that grows. No legend, no key, no numbers.
 * ------------------------------------------------------------------- */

#windtable .rose {
  position: absolute; left: 13%; top: 20%;
  width: 74px; height: 74px; margin: -37px 0 0 -37px;
  border-radius: 50%;
  border: 1px solid rgba(40,32,20,.55);
  box-shadow: inset 0 0 0 6px rgba(233,224,201,.55);
  background: rgba(233,224,201,.5);
}
#windtable .rose .pip {
  position: absolute; left: 50%; top: 2px; transform: translateX(-50%);
  font-family: var(--serif); font-size: 12px; color: #7a2f22;
}
/* The needle points FROM the quarter the wind blows from, which is how a
 * weather-vane works and is the opposite of an arrow showing where it goes. */
#windtable .rose .needle {
  position: absolute; inset: 0;
  transform: rotate(var(--deg, 45deg));
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
#windtable .rose .needle::before {
  content: ''; position: absolute; left: 50%; top: 8px;
  width: 0; height: 0; margin-left: -6px;
  border-left: 6px solid transparent; border-right: 6px solid transparent;
  border-bottom: 15px solid #7a2f22;
}
#windtable .rose .needle::after {
  content: ''; position: absolute; left: 50%; top: 22px;
  width: 2px; height: 30px; margin-left: -1px; background: #2a2118;
}

/* The reach: a band up the river, scaled by how far the fleet can work. */
#windtable .track {
  position: absolute; left: 27%; bottom: 6%;
  width: 42%; height: calc(var(--reach, 0) * 0.86%);
  max-height: 86%;
  transform: skewX(-13deg);
  background: linear-gradient(0deg, rgba(150,52,40,.52), rgba(150,52,40,.14));
  border-top: 2px solid rgba(150,52,40,.85);
  transition: height .3s cubic-bezier(.4,0,.2,1), background .3s linear;
  pointer-events: none;
}
#windtable .track.none { opacity: 0; }
#windtable .track.cuts {
  background: linear-gradient(0deg, rgba(180,44,30,.66), rgba(180,44,30,.24));
  border-top-color: rgba(210,60,42,.95);
}
#windtable .ask strong { color: var(--brass); font-weight: 600; }

/* ---------- the travel panel ------------------------------------------ *
 *
 * Deliberately the plainest thing in the game. Everything else here is
 * dressed as 1775 — brass, parchment, a serif with a bit of age on it — and
 * this is a list of places with a scrollbar, because it is not part of the
 * fiction and pretending otherwise would make it slower to read.
 * ------------------------------------------------------------------- */

#travel {
  position: absolute; inset: 0;
  display: none; align-items: center; justify-content: center;
  background: rgba(6,5,4,.88);
  padding: 22px;
}
#travel.on { display: flex; }
#travel .frame {
  width: min(760px, 100%); max-height: 100%;
  display: flex; flex-direction: column;
  background: #14161a;
  border: 1px solid #394049;
  border-left: 3px solid var(--brass);
  border-radius: 2px;
  padding: 16px 4px 12px 20px;
}
#travel .head {
  flex: 0 0 auto; display: flex; align-items: baseline; gap: 12px;
  flex-wrap: wrap; padding-right: 18px; padding-bottom: 10px;
  border-bottom: 1px solid #2a2f36;
}
#travel .head .ttl {
  font-size: 13px; letter-spacing: .16em; text-transform: uppercase;
  color: var(--brass); font-weight: 600;
}
#travel .head .sub { font-size: 12px; color: #6f767e; letter-spacing: .03em; }

#travel .list {
  flex: 1 1 auto; min-height: 0; overflow-y: auto;
  padding: 8px 16px 8px 0; margin-right: 2px;
}
#travel .grp {
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
  margin: 12px 0 5px;
}
#travel .grp:first-child { margin-top: 0; }
#travel .grp .h {
  font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase;
  color: var(--brass-dim); font-weight: 600;
}
#travel .grp .w { font-size: 11.5px; color: #5f666e; }

#travel .row {
  display: grid; grid-template-columns: 12.5rem 1fr auto;
  align-items: baseline; gap: 12px;
  padding: 5px 10px; border-radius: 2px;
  border-left: 2px solid transparent;
  color: #9aa1a9; font-size: 14px; line-height: 1.35;
}
#travel .row.on {
  background: rgba(58,44,22,.85);
  border-left-color: var(--brass);
  color: var(--text);
}
#travel .row .lab { color: inherit; }
#travel .row.on .lab { color: var(--text); }
#travel .row .note { font-size: 12.5px; color: #6b7178; }
#travel .row.on .note { color: #b3aa96; }
#travel .row .map {
  font-size: 10.5px; letter-spacing: .08em; color: #4e555c;
  font-variant-numeric: tabular-nums;
}
/* A dot against every destination on the map you are standing on. It is the
 * fastest way to answer "where am I", which is the question you actually
 * have when you open this. */
#travel .row.here .lab::before {
  content: '\\25CF'; color: var(--brass-dim);
  font-size: 8px; vertical-align: middle; margin-right: 7px;
}
#travel .row:not(.here) .lab::before {
  content: '\\25CF'; color: transparent;
  font-size: 8px; vertical-align: middle; margin-right: 7px;
}

#travel .foot {
  flex: 0 0 auto; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  margin-top: 10px; padding: 10px 18px 0 0; border-top: 1px solid #2a2f36;
  font-size: 12.5px; color: #878d95; letter-spacing: .03em;
}
#travel .foot .key {
  font-size: 11px; padding: 2px 7px; border-radius: 2px; margin-right: 4px;
  background: linear-gradient(180deg, #d9b862, #a37f26); color: #211607; font-weight: 700;
}
#travel .foot .key:not(:first-child) { margin-left: 10px; }

@media (max-width: 640px) {
  #travel .row { grid-template-columns: 1fr; gap: 2px; }
  #travel .row .map { display: none; }
}

/* ---------- the surveyor's overlay ------------------------------------ *
 *
 * Held, not toggled. It draws over the frame and it never takes the
 * keyboard: you can walk with it up, which is the entire point — a man who
 * has run a chain over ground reads the ground while he is crossing it.
 * ------------------------------------------------------------------- */

#survey-overlay {
  position: absolute; inset: 0; pointer-events: none;
  opacity: 0; transition: opacity .14s linear;
}
#survey-overlay.on { opacity: 1; }
#survey-overlay canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
#survey-overlay .legend {
  position: absolute; left: 20px; bottom: 20px;
  padding: 9px 13px; border-radius: 2px;
  background: rgba(10,14,12,.82); border-left: 3px solid #6fd3a6;
  font-size: 12px; letter-spacing: .05em; color: #cfe9dd; line-height: 1.6;
}
#survey-overlay .legend b { color: #8fe8bf; font-weight: 600; }

/* ---------- transitions ---------------------------------------------- */

#curtain {
  position: absolute; inset: 0; background: #07080a;
  opacity: 0; pointer-events: none; transition: opacity .28s linear;
}
#curtain.on { opacity: 1; }

#toast {
  position: absolute; right: 22px; bottom: 22px;
  max-width: 320px; padding: 11px 15px;
  font-size: 15px; color: var(--text);
  background: rgba(12,9,6,.9);
  border-left: 3px solid var(--brass);
  border-radius: 2px;
  opacity: 0; transform: translateY(8px);
  transition: opacity .3s, transform .3s;
}
#toast.on { opacity: 1; transform: none; }

#title {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; background: #07080a; text-align: center;
}
#title.off { display: none; }
#title h1 { margin: 0; font-size: 44px; letter-spacing: .12em; font-weight: 300; color: var(--parch); }
#title .sub { color: var(--brass); letter-spacing: .24em; text-transform: uppercase; font-size: 13px; }
#title .go { margin-top: 26px; color: var(--text-dim); font-size: 15px; }
#title .go .key {
  font-size: 12px; padding: 2px 8px; border-radius: 2px;
  background: linear-gradient(180deg, #d9b862, #a37f26); color: #211607; font-weight: 700;
}

/* ====================================================================== *
 * THE THUMB PAD
 *
 * Only ever built on a touch device — see \`engine/touch.ts\` — so none of
 * this costs a classroom Chromebook anything. It is mounted FIRST inside
 * \`#stage\`, which in a stylesheet with no z-index anywhere means every
 * panel in the game paints over it, which is exactly what is wanted: the
 * pad is the floor the interface stands on, not a thing that fights it.
 * ====================================================================== */

#pad {
  position: absolute; inset: 0;
  pointer-events: none;
  touch-action: none;
  opacity: 1; transition: opacity .18s linear;
  -webkit-user-select: none; user-select: none;
  -webkit-tap-highlight-color: transparent;
}
/* A panel has the input. Get out of the way — and stop taking taps, or the
 * dead pad under an open document eats the tap meant to dismiss it. */
#pad.away { opacity: 0; pointer-events: none !important; }
#pad.away * { pointer-events: none !important; }

/* The whole lower-left is live. The stick has no home until a thumb gives
 * it one, so the zone is large and completely invisible. */
#pad .stickzone {
  position: absolute; left: 0; bottom: 0;
  width: 52%; height: 62%;
  pointer-events: auto; touch-action: none;
}

#pad .stick {
  position: fixed; width: 0; height: 0;
  opacity: 0; transition: opacity .12s linear;
}
#pad .stick.on { opacity: 1; }
#pad .stick::before {
  content: ""; position: absolute; left: 50%; top: 50%;
  width: 132px; height: 132px; transform: translate(-50%,-50%);
  border-radius: 50%;
  border: 2px solid rgba(200,161,63,.30);
  background: radial-gradient(circle, rgba(20,14,10,.34), rgba(20,14,10,.10) 70%);
}
#pad .knob {
  position: absolute; left: 50%; top: 50%;
  width: 58px; height: 58px; transform: translate(-50%,-50%);
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, rgba(233,224,201,.80), rgba(138,108,38,.72));
  border: 2px solid rgba(233,224,201,.55);
  box-shadow: 0 2px 10px rgba(0,0,0,.45);
}

#pad .btns {
  position: absolute; right: 0; bottom: 0;
  padding: 0 calc(20px + env(safe-area-inset-right)) calc(22px + env(safe-area-inset-bottom)) 0;
  display: grid; gap: 12px;
  grid-template-columns: auto auto;
  grid-template-areas: "look cycle" "act act";
  align-items: end; justify-items: end;
  pointer-events: none;
}
#pad .b-look  { grid-area: look; }
#pad .b-cycle { grid-area: cycle; }
#pad .b-act   { grid-area: act; }

#pad .pills {
  position: absolute; right: 0; top: 0;
  padding: calc(12px + env(safe-area-inset-top)) calc(14px + env(safe-area-inset-right)) 0 0;
  display: flex; gap: 8px;
  pointer-events: none;
}

#pad .b {
  pointer-events: auto; touch-action: none;
  font-family: var(--ui); font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  color: var(--parch);
  background: linear-gradient(180deg, rgba(74,54,38,.86), rgba(23,15,10,.90));
  border: 2px solid rgba(200,161,63,.46);
  border-radius: 999px;
  box-shadow: 0 3px 12px rgba(0,0,0,.5);
  transition: transform .06s linear, background .06s linear;
}
#pad .b.down {
  transform: scale(.93);
  background: linear-gradient(180deg, rgba(217,184,98,.92), rgba(163,127,38,.92));
  color: #211607;
}
/* Greyed rather than removed: a control that comes and goes teaches the
 * player nothing about when it works. */
#pad .b.off { opacity: .30; }

/* Sized off a thumb, not off a mouse: 44pt is the floor everybody quotes,
 * and the primary is well over it because it is pressed a hundred times an
 * act and the other two are not. */
#pad .b-act   { width: 92px; height: 92px; font-size: 15px; }
#pad .b-cycle,
#pad .b-look  { width: 64px; height: 64px; font-size: 11px; }
#pad .b-pill  { padding: 7px 13px; font-size: 11px; }

/* ====================================================================== *
 * THE PHONE LAYOUT
 *
 * Every panel in this interface was sized for a 1280-wide frame and every
 * one of them had to be told what to do at 390. The rules are the same
 * three each time: give the measure back (a 64-character line at 19px does
 * not fit and must not be made to), let the panel scroll rather than
 * overflow, and keep the bottom of the screen clear of the thumb pad.
 * ====================================================================== */

@media (max-width: 780px), (max-height: 460px) {
  #ui { font-size: 17px; }

  /* The banner is a title card, not a fixture. Small and out of the way. */
  #banner { margin-top: calc(8px + env(safe-area-inset-top)); padding: 5px 14px; gap: 9px; }
  #banner .place { font-size: 13px; letter-spacing: .07em; }
  #banner .when  { font-size: 12px; }

  /*
   * The objective rail on a phone is a two-line strip, not a column.
   * At full size it took a third of the screen and the third it took was
   * the third you walk into.
   */
  #rail {
    top: calc(46px + env(safe-area-inset-top));
    left: calc(10px + env(safe-area-inset-left));
    right: calc(10px + env(safe-area-inset-right));
    max-width: none; padding: 7px 11px 8px;
    font-size: 13px; line-height: 1.34;
  }
  #rail h4 { font-size: 10px; margin-bottom: 3px; }
  #rail li { margin-bottom: 1px; }

  #reach { bottom: auto; top: calc(50% - 20px); font-size: 14px; padding: 6px 12px; }

  /* A conversation owns a phone screen entirely. Anything still showing
   * behind it is a clipped half-sentence, not information. */
  html.panel #rail, html.panel #banner, html.panel #reach,
  html.surveying #rail, html.surveying #banner { opacity: 0; }

  /* The legend moves to the top-left, into the space the hidden rail just
   * gave up. Bottom-left is where the thumb is and where the nearest marks
   * label themselves, and it was sitting on both. */
  #survey-overlay .legend {
    top: calc(10px + env(safe-area-inset-top));
    bottom: auto; left: calc(10px + env(safe-area-inset-left));
    font-size: 11px; line-height: 1.5; padding: 7px 10px;
  }

  /*
   * The dialogue panel. The portrait goes: at 108px it is a third of the
   * width of the phone and the text it leaves room for is four words wide.
   * The speaker's name still names them, which is what the portrait was
   * there to do.
   */
  #dialogue {
    bottom: calc(10px + env(safe-area-inset-bottom));
    width: calc(100% - 16px);
    padding: 13px 14px 12px;
    gap: 10px;
    max-height: 78vh; overflow-y: auto; overscroll-behavior: contain;
  }
  #portrait { display: none; }
  #speaker { font-size: 12px; margin-bottom: 5px; }
  #text { font-size: 15px; line-height: 1.38; min-height: 2em; max-width: none; }
  #council { margin-top: 8px; gap: 3px; }
  #council .voice { font-size: 13px; line-height: 1.26; gap: 7px; }
  #council .voice img { width: 19px; height: 19px; }
  #dialogue .choice { padding: 7px 7px; font-size: 14px; line-height: 1.3; }
  #dialogue .choice .note { display: block; margin-left: 0; font-size: 12px; }
  #dialogue .favoured img { width: 16px; height: 16px; }
  #dialogue .hint { font-size: 11px; }

  /* Documents, notices, the reckoning, the letterbook. */
  #sheet, #book, #notice .card {
    width: calc(100% - 20px) !important;
    height: auto !important; max-height: calc(100% - 24px) !important;
    padding: 18px 16px !important;
  }
  #sheet .body { font-size: 17px; line-height: 1.54; max-width: none; }
  #notice p { font-size: 15px; }
  /* The letterbook's own padding is on #tabs and #pages, not on #book, so
   * the shared override above has to be taken back off it or the page gets
   * padded twice and the tab strip loses a tab off the right edge. */
  #book { padding: 0 !important; height: min(560px, calc(100% - 24px)) !important; }
  #tabs { padding: 8px 8px 0; overflow-x: auto; overflow-y: hidden; flex: 0 0 auto; }
  #tabs::-webkit-scrollbar { display: none; }
  .tab { padding: 8px 11px; font-size: 12px; letter-spacing: .06em; white-space: nowrap; }
  #pages { padding: 14px 15px 18px; font-size: 15px; }
  #pages .row { padding: 8px 9px; }
  #pages .row .sub { font-size: 12px; }
  #pages .code { font-size: 19px; letter-spacing: .16em; padding: 12px 14px; }

  /* The map tables. They are drawings and they must stay 8:5 or the
   * survey is a lie; they simply get the width and no more. */
  .sheetui .plate { max-width: 100% !important; }

  #travel { width: calc(100% - 20px) !important; max-height: calc(100% - 24px) !important; }
  #travel .dest { padding: 9px 10px; font-size: 14px; }
  #travel .note { display: none; }

  #toast {
    right: calc(10px + env(safe-area-inset-right));
    bottom: auto; top: calc(50% + 30px);
    max-width: 220px; font-size: 13px; padding: 8px 11px;
  }

  #title h1 { font-size: 30px; }
  #title .sub { font-size: 11px; letter-spacing: .16em; }
  #title .go { font-size: 13px; }
}

/*
 * Landscape on a phone is short, not narrow, and the thing that breaks is
 * vertical: the dialogue panel and the rail meet in the middle.
 */
@media (max-height: 460px) and (orientation: landscape) {
  #rail { display: none; }
  #dialogue { max-height: 62vh; }
  #pad .b-act { width: 84px; height: 84px; font-size: 14px; }
  #pad .b-cycle, #pad .b-look { width: 60px; height: 60px; font-size: 11px; }
  #pad .stickzone { height: 78%; }
}

/*
 * A touch device gets no hover, and a stylesheet that paints selection with
 * hover paints nothing at all. Selection is painted by \`.sel\` from the
 * keyboard cursor as well, so this only has to stop the hover rules from
 * being the only thing that says which row is live.
 */
html.touch #dialogue .choice.sel { background: rgba(200,161,63,.14); }
html.touch #view { touch-action: none; }
html.touch body { overscroll-behavior: none; }
`;

export function installStyle(): void {
  const el = document.createElement('style');
  el.textContent = CSS;
  document.head.appendChild(el);
}
