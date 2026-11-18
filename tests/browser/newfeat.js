// Full browser test of the Reward Charts app against an in-memory stand-in for Firebase.
const { chromium } = require('playwright');
const OUT = (process.env.SHOTS || require('os').tmpdir()) + '/'; // screenshots go here
// Run: python3 -m http.server 8765 (from the repo), then node tests/browser/full.js
const MOCK_DB = `
const store = JSON.parse(sessionStorage.getItem('mockdb') || '{}');
const subs = [];
const get = (p) => p.split('/').reduce((o, k) => (o == null ? undefined : o[k]), store);
function setPath(p, v) {
  const parts = p.split('/'); let o = store;
  for (let i = 0; i < parts.length - 1; i++) { if (typeof o[parts[i]] !== 'object' || o[parts[i]] === null) o[parts[i]] = {}; o = o[parts[i]]; }
  if (v === null || v === undefined) delete o[parts[parts.length - 1]]; else o[parts[parts.length - 1]] = JSON.parse(JSON.stringify(v));
  sessionStorage.setItem('mockdb', JSON.stringify(store));
}
export function getDatabase() { return {}; }
export function ref(db, p) { return p; }
export function onValue(p, fn) {
  if (p === '.info/connected') { setTimeout(() => fn({ val: () => true }), 10); return; }
  if (p === 'charts/settings' && window.__slowSettings) return;
  subs.push([p, fn]); setTimeout(() => fn({ val: () => JSON.parse(JSON.stringify(get(p) ?? null)) }), 10);
}
export async function set(p, v) { setPath(p, v); subs.forEach(([sp, fn]) => { if (p.startsWith(sp)) fn({ val: () => JSON.parse(JSON.stringify(get(sp) ?? null)) }); }); }
`;
const errors = [], notes = [];
const _t = new Date(); const TODAY = _t.getFullYear() + '-' + String(_t.getMonth() + 1).padStart(2, '0') + '-' + String(_t.getDate()).padStart(2, '0');
const check = (ok, msg) => { if (!ok) errors.push(msg); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  await ctx.addInitScript({ content: 'window.confirm = () => true;' });
  let offline = false;
  await ctx.route(/firebase-app\.js/, r => offline ? r.abort() : r.fulfill({ contentType: 'text/javascript', body: 'export function initializeApp(){return {}}' }));
  await ctx.route(/firebase-database\.js/, r => offline ? r.abort() : r.fulfill({ contentType: 'text/javascript', body: MOCK_DB }));
  await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const p = await ctx.newPage();
  let cur = '';
  p.on('pageerror', e => errors.push(cur + ' PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_FAILED|firebase/.test(m.text())) errors.push(cur + ' CONSOLE ' + m.text()); });
  p.on('dialog', d => d.accept());
  const B = 'http://localhost:8765/';
  async function visit(u, shot, expectSync = true) {
    cur = u; await p.goto(B + u); await p.waitForTimeout(450);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(ov <= 1, u + ' OVERFLOW ' + ov + 'px');
    const sync = await p.$eval('#sync', e => e.textContent).catch(() => 'n/a');
    if (expectSync) check(sync === 'Synced' || sync === 'n/a', u + ' SYNC ' + sync);
    if (shot) await p.screenshot({ path: OUT + shot + '.png', fullPage: true });
  }
  const tap = async (sel, n = 0) => { const els = await p.$$(sel); if (!els[n]) { errors.push(cur + ' MISSING ' + sel); return; } await els[n].click(); await p.waitForTimeout(150); };
  const enterPin = async (v) => { await p.waitForSelector('.pindlg input', { timeout: 2000 }); await p.fill('.pindlg input', v); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(250); };
  const db = () => p.evaluate(() => JSON.parse(sessionStorage.getItem('mockdb') || '{}'));

  await p.goto(B + 'index.html'); await p.waitForTimeout(300);
  await p.evaluate(() => sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-17': { isaiah: { chore: true } } } } } })));
  await visit('checklist.html?kid=isaiah&date=2026-11-19', 'n-owed');
  const owedTxt = await p.$eval('.owed', e => e.textContent).catch(() => '');
  check(/Finish first/.test(owedTxt), 'owed block missing: ' + owedTxt);
  check((await p.$$('#day .ck.locked')).length > 3, 'day list not locked');
  check((await p.$$('#bed .ck.locked')).length === 0, 'bed locked');
  check((await p.$$('[data-daycheck]')).length === 6, 'isaiah 3 checks');
  await tap('[data-owed]');
  await p.waitForTimeout(200);
  check(!(await p.$('.owed')), 'owed block still there');
  const st = await db(); notes.push('owed saved: ' + JSON.stringify(((((st.charts||{}).routines||{}).days||{})['2026-11-18']||{}).isaiah));
  notes.push('excusable on isaiah day: ' + (await p.$$('#day [data-excuse="mark"]')).length);
  await visit('zay.html', 'n-zay');
  check(!!(await p.$('#gamecard')), 'zay game card');
  check(await p.$eval('#weeklycard', e => getComputedStyle(e).display === 'none'), 'zay weekly hidden'); check(await p.$eval('#monthcard', e => getComputedStyle(e).display === 'none'), 'zay month hidden');
  await visit('trombone.html', 'n-rhett');
  const rows = await p.$$eval('.g-label strong', els => els.map(e => e.textContent)); notes.push('rhett rows: ' + rows.join(','));
  check(!!(await p.$('#gamecard')) && (await p.$eval('#weeklycard', e => getComputedStyle(e).display !== 'none')), 'rhett has both cards');
  await p.click('button.cell[data-row="chores"][data-day="0"]'); await p.waitForTimeout(400);
  notes.push('tap went to: ' + p.url());
  await visit('eli.html', 'n-eli');
  await visit('kid.html?kid=isaiah', 'n-kid');
  await visit('parents.html', 'n-parents');
  await visit('checklist.html?kid=rhett', 'n-rcheck');
  await visit('checklist.html?kid=eli', 'n-echeck');
  notes.push('eli excuse on activity: ' + (await p.$$('#day [data-excuse="mark"][data-key="activity"]')).length);
  console.log(notes.join('\n')); console.log(errors.length ? errors.join('\n') : 'NO ISSUES');
  await b.close();
})();
