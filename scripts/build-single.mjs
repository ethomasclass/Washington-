/**
 * The one-file build.
 *
 * Produces `dist-single/washington.html`: the whole game — engine, plates,
 * figures, every scene — in a single HTML file with no assets beside it and no
 * host to fetch anything from. Double-click it and it runs.
 *
 * This exists because of how this thing actually gets deployed. 06 §deployment
 * and the vite base comment both say the same thing: the target is a school, and
 * we do not get to pick the URL. A teacher can put this on a district web
 * server, a shared drive, a USB stick, or an LMS that only accepts one file —
 * none of which can be relied on to serve a directory of hashed chunks with the
 * right MIME types. It is also the fallback whenever Pages hosting is wedged.
 *
 * Two details matter and both were bugs first:
 *
 *   - The bundle is escaped to pure ASCII. A file served without a charset is
 *     read as Latin-1 by the browser, and every em dash and curly apostrophe in
 *     the writing arrives as mojibake — "the King<C3><A2>TMs troops". The
 *     bundle is minified, so all non-ASCII sits inside string literals where
 *     \uXXXX is exactly equivalent, and the page then renders identically no
 *     matter what charset the host claims.
 *   - Any literal `</script` inside the bundle would end the tag early.
 *
 * Run: npm run build:single
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

execFileSync('npx', ['vite', 'build', '--config', 'vite.single.config.ts'], {
  cwd: root,
  stdio: 'inherit',
});

const bundle = readFileSync(join(root, 'dist-single/game.js'), 'utf8')
  .split('</script')
  .join('<\\/script');

let ascii = '';
for (const ch of bundle) {
  if (ch.codePointAt(0) < 128) {
    ascii += ch;
    continue;
  }
  for (let i = 0; i < ch.length; i++) {
    ascii += '\\u' + ch.charCodeAt(i).toString(16).padStart(4, '0');
  }
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>In Washington's Shoes</title>
<style>
  /* The game injects its own full-page stylesheet at boot (ui.ts CSS): it owns
     html, body, #app, #stage and #overlay. This only paints the ground beneath,
     so the frame is never a white flash before the plates arrive. */
  html, body { margin: 0; height: 100%; background: #241C14; }
  #app { position: relative; width: 100vw; height: 100vh; background: #241C14; }
  #boot {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; color: #C0AE8D; background: #241C14;
    font: italic 17px/1.5 Georgia, "Times New Roman", serif; letter-spacing: .02em;
  }
</style>
</head>
<body>
<div id="app">
  <canvas id="stage" aria-hidden="true"></canvas>
  <div id="overlay"></div>
  <div id="boot">Laying the ground&hellip;</div>
</div>
<script type="module">
${ascii}
// The plates are painted; take the holding card away.
document.getElementById('boot')?.remove();
</script>
</body>
</html>
`;

const out = join(root, 'dist-single/washington.html');
writeFileSync(out, html);
console.log(`\nwashington.html — ${(html.length / 1048576).toFixed(2)} MB, one file, no assets`);
