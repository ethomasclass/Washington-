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
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>In Washington's Shoes</title>
<meta name="description" content="An American history, played from inside one man's decisions." />
<style>
  /* The game injects its own full-page stylesheet at boot (ui/style.ts): it
     owns html, body, #stage and #ui. This only paints the ground beneath, so
     the frame is never a white flash before the first light bakes in. */
  html, body { margin: 0; height: 100%; background: #07080a; }
  #stage { position: fixed; inset: 0; background: #07080a; }
  #view { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  #boot {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; color: #cdc0a3; background: #07080a;
    font: italic 17px/1.5 Georgia, "Times New Roman", serif; letter-spacing: .02em;
  }
  /* Failure names itself rather than leaving a blank field. */
  #fault {
    position: fixed; inset: 0; z-index: 99999; display: flex;
    align-items: center; justify-content: center; padding: 24px;
    background: #07080a; font: 16px/1.55 Georgia, "Times New Roman", serif;
  }
  #fault .card {
    max-width: 640px; background: #e9e0c9; color: #12100c;
    border: 1px solid #2b1f16; padding: 22px 26px;
  }
  #fault h1 {
    margin: 0 0 10px; font-size: 21px; font-variant: small-caps;
    letter-spacing: .06em; font-weight: 600;
  }
  #fault pre {
    margin: 12px 0 0; padding: 10px 12px; overflow-x: auto;
    background: #cdc0a3; border: 1px solid #a89468;
    font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace; color: #12100c;
    white-space: pre-wrap; word-break: break-word;
  }
</style>
</head>
<body>
<div id="stage">
  <canvas id="view" aria-hidden="true"></canvas>
  <div id="boot">Laying the ground&hellip;</div>
</div>
<script>
(function () {
  var shown = false;
  function show(title, body, detail) {
    if (shown) return;
    shown = true;
    var boot = document.getElementById('boot');
    if (boot) boot.remove();
    var el = document.createElement('div');
    el.id = 'fault';
    var card = document.createElement('div');
    card.className = 'card';
    var h = document.createElement('h1');
    h.textContent = title;
    var p = document.createElement('p');
    p.textContent = body;
    card.appendChild(h);
    card.appendChild(p);
    if (detail) {
      var pre = document.createElement('pre');
      pre.textContent = detail;
      card.appendChild(pre);
    }
    el.appendChild(card);
    document.body.appendChild(el);
  }
  window.addEventListener('error', function (e) {
    show('The prototype could not start.',
      'Something threw before the first plate was painted.',
      (e.message || 'unknown error') + '\\n' + (e.filename || '') + (e.lineno ? ':' + e.lineno : ''));
  });
  window.addEventListener('unhandledrejection', function (e) {
    show('The prototype could not start.', 'Something failed while loading.',
      String((e && e.reason && (e.reason.stack || e.reason.message)) || e.reason));
  });
  try {
    var probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
      show('This browser cannot open WebGL.',
        'The game draws its scenery with WebGL, and this browser is refusing it. That is usually hardware acceleration switched off, or a locked-down school profile.');
    }
  } catch (err) { /* the probe may fail quietly */ }
})();
</script>
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
