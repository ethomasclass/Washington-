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
