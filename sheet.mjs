import { chromium } from 'playwright';
const OUT = '/tmp/claude-0/-home-user-Washington-/efb8d31d-20f9-598b-9198-b3ab188dacbb/scratchpad';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
await p.goto('http://localhost:4173/sprites.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
// find the props section and shoot the new ones
const names = ['forgeHut','forgeHutRaw','hutFrame','stumpCut','greenTimber','continentalFile','bayonetPost','hospitalBunk'];
for (const n of names) {
  const el = p.locator(`text=${n}`).first();
  if (await el.count() === 0) { console.log('missing label', n); continue; }
  await el.scrollIntoViewIfNeeded();
}
await p.screenshot({ path: OUT + '/props-vf.png', fullPage: false });
console.log('ok');
await b.close();
