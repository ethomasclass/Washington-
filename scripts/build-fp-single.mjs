/**
 * One-file build of the first-person camp (fp.html).
 *
 * Produces `dist-single/camp-fp.html`: the whole walkable scene — three.js, the
 * prop kit, the engraving pass, the controller — in a single HTML file with no
 * assets beside it and no host to fetch from. Double-click it and it runs.
 *
 * Same rationale and the same two gotchas as build-single.mjs: escape to pure
 * ASCII so a charset-less host doesn't mangle anything, and neutralise any
 * literal </script inside the bundle.
 *
 * Run: node scripts/build-fp-single.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(root, 'dist-single'), { recursive: true });

execFileSync('npx', [
  'esbuild', 'src/fp/main.ts',
  '--bundle', '--format=esm', '--minify',
  '--outfile=dist-single/camp-fp.js',
], { cwd: root, stdio: 'inherit' });

const bundle = readFileSync(join(root, 'dist-single/camp-fp.js'), 'utf8')
  .split('</script').join('<\\/script');

let ascii = '';
for (const ch of bundle) {
  if (ch.codePointAt(0) < 128) { ascii += ch; continue; }
  for (let i = 0; i < ch.length; i++) {
    ascii += '\\u' + ch.charCodeAt(i).toString(16).padStart(4, '0');
  }
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>In Washington's Shoes - the camp at Cambridge</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; overflow: hidden; background: #a8cbdd; }
  #view { display: block; width: 100vw; height: 100vh; }
  #crosshair { position: fixed; left: 50%; top: 50%; width: 6px; height: 6px;
    margin: -3px 0 0 -3px; border: 1px solid rgba(30,22,14,.6); border-radius: 50%;
    pointer-events: none; }
  #prompt { position: fixed; left: 50%; bottom: 12%; transform: translateX(-50%);
    font: 600 15px/1.3 ui-monospace, Menlo, monospace; letter-spacing: .08em;
    color: #241c14; background: rgba(231,220,194,.82); padding: 8px 16px;
    border: 1px solid rgba(36,28,20,.35); border-radius: 3px; pointer-events: none;
    opacity: 0; transition: opacity .18s; white-space: nowrap; }
  #hud { position: fixed; inset: 0; display: flex; align-items: center;
    justify-content: center; pointer-events: none; transition: opacity .3s; }
  #hud .card { background: rgba(231,220,194,.92); color: #241c14;
    border: 1px solid rgba(36,28,20,.4); border-radius: 6px; padding: 20px 26px;
    text-align: center; max-width: 460px; font: 15px/1.5 ui-monospace, Menlo, monospace; }
  #hud .card b { display: block; font-size: 17px; margin-bottom: 8px; letter-spacing: .04em; }
  #hud .card span { color: #5a4a30; }
  kbd { background: #241c14; color: #e7dcc2; border-radius: 3px; padding: 1px 6px; font-size: 13px; }
</style>
</head>
<body>
<canvas id="view"></canvas>
<div id="crosshair"></div>
<div id="prompt"></div>
<div id="hud"><div class="card">
  <b>THE CAMP AT CAMBRIDGE &middot; JULY 1775</b>
  <span>Click to look around.<br />
  <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to walk &middot;
  <kbd>Shift</kbd> to hurry &middot; <kbd>Esc</kbd> to release the mouse</span>
</div></div>
<script type="module">
${ascii}
</script>
</body>
</html>
`;

const out = join(root, 'dist-single/camp-fp.html');
writeFileSync(out, html);
console.log(`\ncamp-fp.html - ${(html.length / 1048576).toFixed(2)} MB, one file, no assets`);
