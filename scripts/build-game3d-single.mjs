/**
 * One-file build of the wired 3D game (game3d.html).
 *
 * Produces `dist-single/washington-3d.html`: the complete game — content,
 * state, Council, passport, ledger, the whole DOM overlay — running on the
 * first-person environment engine, in a single HTML file with no assets
 * beside it and no host to fetch from. Double-click it and it runs.
 *
 * Same rationale and the same two gotchas as build-single.mjs: escape to pure
 * ASCII so a charset-less host doesn't mangle anything, and neutralise any
 * literal </script inside the bundle.
 *
 * Run: node scripts/build-game3d-single.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(root, 'dist-single'), { recursive: true });

execFileSync('npx', [
  'esbuild', 'src/game3d/main.ts',
  '--bundle', '--format=esm', '--minify',
  '--outfile=dist-single/washington-3d.js',
], { cwd: root, stdio: 'inherit' });

const bundle = readFileSync(join(root, 'dist-single/washington-3d.js'), 'utf8')
  .split('</script').join('<\\/script');

let ascii = '';
for (const ch of bundle) {
  if (ch.codePointAt(0) < 128) { ascii += ch; continue; }
  for (let i = 0; i < ch.length; i++) {
    ascii += '\\u' + ch.charCodeAt(i).toString(16).padStart(4, '0');
  }
}

// The page shell mirrors game3d.html — keep the two in step by hand; the DOM
// contract is three elements: #view, #overlay (inside #app), #hint.
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>In Washington's Shoes</title>
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #10141a; }
  #view { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }
  #app { position: fixed; inset: 0; pointer-events: none; }
  #overlay { position: absolute; inset: 0; }
  #dot {
    position: fixed; left: 50%; top: 50%; width: 5px; height: 5px;
    margin: -2.5px 0 0 -2.5px; border-radius: 50%;
    background: rgba(245, 240, 226, 0.85);
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.55);
    pointer-events: none; z-index: 30;
  }
  #hint {
    position: fixed; left: 50%; bottom: 7%; transform: translateX(-50%);
    padding: 9px 16px; border-radius: 3px;
    background: rgba(16, 14, 10, 0.62); color: #efe7d5;
    font: 14px/1.4 Georgia, "Times New Roman", serif;
    letter-spacing: 0.04em;
    opacity: 0; transition: opacity 0.35s; pointer-events: none; z-index: 30;
    text-align: center;
  }
  #hint b { font-weight: 600; }
</style>
</head>
<body>
<canvas id="view"></canvas>
<div id="dot"></div>
<div id="hint">
  <b>click</b> to look about &nbsp;&middot;&nbsp; <b>WASD</b> walk &nbsp;&middot;&nbsp;
  <b>E</b> use &nbsp;&middot;&nbsp; <b>Tab</b> next &nbsp;&middot;&nbsp; <b>J</b> journal
</div>
<div id="app"><div id="overlay"></div></div>
<script type="module">
${ascii}
</script>
</body>
</html>
`;

const out = join(root, 'dist-single/washington-3d.html');
writeFileSync(out, html);
console.log(`\nwashington-3d.html - ${(html.length / 1048576).toFixed(2)} MB, one file, no assets`);
