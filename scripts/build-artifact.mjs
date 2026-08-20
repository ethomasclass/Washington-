/**
 * The Artifact build.
 *
 * `build:single` emits a complete HTML document, which is exactly what a USB
 * stick wants and exactly what the Artifact host does not: it wraps whatever
 * it is given in its own `<!doctype html><head></head><body>` skeleton, so a
 * second `<html>` and `<head>` arrive nested inside a body.
 *
 * This strips the outer document and keeps everything that was inside it —
 * the title, the boot stylesheet, the stage, and the one inlined script. The
 * game injects its own full-page stylesheet at boot (`ui/style.ts`) and owns
 * html, body, #stage and #ui, so there is nothing here for a host theme to
 * fight with: the page paints its own ground in its own palette, deliberately,
 * in one visual world, which is what a game is.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = readFileSync('dist-single/washington.html', 'utf8');

const head = src.slice(src.indexOf('<head>') + 6, src.indexOf('</head>'));
const body = src.slice(src.indexOf('<body>') + 6, src.lastIndexOf('</body>'));

mkdirSync('dist-single', { recursive: true });
const out = `${head.trim()}\n${body.trim()}\n`;
writeFileSync('dist-single/artifact.html', out);

const kb = (out.length / 1024).toFixed(0);
console.log(`dist-single/artifact.html — ${kb} kB, body-only, ready to publish`);
