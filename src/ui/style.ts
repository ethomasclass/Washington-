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

/* ---------- the map table -------------------------------------------- *
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

#survey {
  position: absolute; inset: 0;
  display: none; align-items: center; justify-content: center;
  background: radial-gradient(120% 100% at 30% 0%, #241a12 0%, #0a0806 70%);
  padding: 18px;
}
#survey.on { display: flex; }
#survey .frame {
  width: min(1040px, 100%); max-height: 100%;
  display: flex; flex-direction: column; gap: 10px;
}
/* A label near the right edge hangs its text back over the sheet instead of
 * off it. Four place names out of eight sit past two-thirds across. */
#survey .board .place.right { transform: translate(-9px, -15px); text-align: right; }
#survey .board .place.right::after { content: ''; }
#survey .head {
  display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap;
  border-bottom: 1px solid #3a2f22; padding-bottom: 7px;
}
#survey .head .ttl {
  font-family: var(--serif); font-size: 19px; color: var(--parch); letter-spacing: .02em;
}
#survey .head .sub {
  font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--brass-dim);
}

/* The sheet keeps the proportions it was drawn at.
 * Stretched to whatever height was left over it read as a strip of wallpaper;
 * a survey is a sheet of paper and it has to look like one. */
#survey .board {
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
#survey .board .place {
  position: absolute; transform: translate(9px, -15px);
  font-family: var(--serif); font-size: 12.5px; font-style: italic;
  color: #2a2118; white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255,255,255,.5);
}
#survey .board .scale,
#survey .board .north {
  position: absolute; transform: translate(0, 10px);
  font-size: 10.5px; letter-spacing: .1em; color: #3b3025;
}
#survey .board .north {
  transform: translate(-4px, 0); font-family: var(--serif); font-size: 14px; color: #7a2f22;
}
/* The train, as a token you can watch move. Two pixels of brass on a sheet
 * of paper is the whole of the animation budget and it is enough. */
#survey .board .token {
  position: absolute; width: 15px; height: 15px; margin: -8px 0 0 -8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f0d68a, #a37f26 60%, #5c4412);
  box-shadow: 0 0 0 2px rgba(255,255,255,.55), 0 2px 5px rgba(0,0,0,.5);
  transition: left .55s cubic-bezier(.4,0,.2,1), top .55s cubic-bezier(.4,0,.2,1);
}

#survey .ask {
  font-family: var(--serif); font-size: 17px; line-height: 1.4; color: var(--parch);
}
#survey .ask .n {
  display: inline-block; margin-right: 10px;
  font-family: var(--ui); font-size: 10.5px; letter-spacing: .18em;
  text-transform: uppercase; color: var(--brass-dim);
}

#survey .opts { display: flex; gap: 10px; }
#survey .opt {
  flex: 1 1 0; min-width: 0; text-align: left;
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px 13px; border-radius: 2px; cursor: default;
  font: inherit; color: var(--text-dim);
  background: rgba(20,15,10,.72);
  border: 1px solid #3a2f22; border-left: 3px solid #3a2f22;
}
#survey .opt.on {
  color: var(--text); background: rgba(48,36,20,.9);
  border-color: var(--brass-dim); border-left-color: var(--brass);
}
#survey .opt.locked { opacity: .45; }
#survey .opt .lab { font-size: 14.5px; letter-spacing: .01em; }
#survey .opt .det { font-size: 12.5px; line-height: 1.45; color: var(--text-dim); }
#survey .opt .lock { font-size: 11.5px; font-style: italic; color: var(--sealed); }

/* The dispatches. Deliberately a different object from the sheet: a folded
 * paper that came in on a horse, not part of the drawing. */
#survey .wire {
  display: none;
  background: rgba(233,224,201,.94); color: #201a12;
  border-radius: 2px; padding: 12px 16px;
  box-shadow: 0 8px 26px rgba(0,0,0,.55);
  max-height: 34vh; overflow-y: auto;
}
#survey .wire.on { display: block; }
#survey .wire .hdr {
  display: block; margin-bottom: 6px;
  font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase; color: #7a5c1e;
}
#survey .wire p { margin: 0 0 8px; font-family: var(--serif); font-size: 15.5px; line-height: 1.5; }
#survey .wire p:last-child { margin-bottom: 0; }
#survey .wire .cite { font-size: 13px; font-style: italic; color: #5d5240; }

#survey .foot { font-size: 13px; color: var(--text-dim); letter-spacing: .04em; }
#survey .foot .key {
  font-size: 11px; padding: 2px 7px; border-radius: 2px; margin-right: 5px;
  background: linear-gradient(180deg, #d9b862, #a37f26); color: #211607; font-weight: 700;
}

@media (max-width: 900px) {
  #survey .opts { flex-direction: column; }
  #survey .opt .det { display: none; }
}
/* A short window (a 1024x600 Chromebook in landscape) gives the sheet less
 * room rather than squashing it: the options and the dispatch are the part
 * that must never scroll. */
@media (max-height: 700px) {
  #survey .board { max-width: min(100%, 44vh * 1.6); }
  #survey .head .sub { display: none; }
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
`;

export function installStyle(): void {
  const el = document.createElement('style');
  el.textContent = CSS;
  document.head.appendChild(el);
}
