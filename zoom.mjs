import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
const [x,y,w,h,s,src,out] = process.argv.slice(2);
await p.setContent('<canvas id=c></canvas>');
await p.evaluate(async ([x,y,w,h,s,src]) => {
  const img = new Image();
  await new Promise(r => { img.onload = r; img.src = src; });
  const c = document.getElementById('c');
  c.width = w*s; c.height = h*s;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.fillStyle='#1a1a1a'; g.fillRect(0,0,c.width,c.height);
  g.drawImage(img, x, y, w, h, 0, 0, w*s, h*s);
}, [ +x,+y,+w,+h,+s, 'data:image/png;base64,' + (await import('node:fs')).readFileSync(src,'base64') ]);
await p.locator('#c').screenshot({ path: out });
await b.close();
