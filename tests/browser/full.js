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

  // 1. Every page, every kid, a few dates
  for (const u of ['index.html', 'kid.html?kid=eli', 'kid.html?kid=rhett', 'kid.html?kid=isaiah', 'stats.html', 'eli.html', 'trombone.html', 'isaiah.html', 'run.html', 'run.html#history', 'trials.html', 'parents.html', 'settings.html', 'history.html?kid=rhett']) await visit(u);
  await visit('index.html');
  check((await p.$$('.person')).length === 4, 'home should have 4 people');
  check((await p.$eval('#n-eli', e => e.textContent)).length > 3, 'home Eli status empty');
  await p.click('.person[href="kid.html?kid=rhett"]'); await p.waitForTimeout(400);
  check(/kid=rhett/.test(p.url()), 'Rhett button did not open his page');
  check((await p.$$('#kidtabs a')).length === 3, 'brother tabs missing');
  await p.click('#kidtabs a[data-kid="isaiah"]'); await p.waitForTimeout(400);
  check(/kid=isaiah/.test(p.url()) && (await p.$eval('#name', e => e.textContent)) === 'Isaiah', 'brother tab did not switch');
  check((await p.$eval('#now', e => e.textContent)).length > 5, 'right-now card empty');
  for (const kid of ['eli', 'rhett', 'isaiah']) for (const d of ['2026-11-11', '2026-11-14', '2026-11-15']) {
    await visit(`checklist.html?kid=${kid}&date=${d}`);
    check((await p.$$('.ckbtn')).length > 0, cur + ' NO ITEMS');
  }
  await visit('checklist.html?date=not-a-date'); await visit('eli.html?week=2026-99-99');

  // 2. No more copying: Eli's Running opens Training; the chart follows Training
  await visit('checklist.html?kid=eli&date=2026-11-11');
  for (let i = 0; i < 30; i++) { const btn = await p.$('.ckbtn[aria-pressed="false"]:not([data-key="activity"])'); if (!btn) break; await btn.click(); await p.waitForTimeout(60); }
  await p.click('.ckbtn[data-key="activity"]'); await p.waitForTimeout(400);
  check(/run\.html/.test(p.url()), 'Running did not open Training: ' + p.url());
  await visit('eli.html?week=2026-11-09');
  const cellOn = (row, d) => p.$eval(`button.cell[data-row="${row}"][data-day="${d}"]`, e => e.getAttribute('aria-pressed'));
  check(await cellOn('chores', 2) === 'true', 'chart Chores Wed not filled from checklist');
  check(await cellOn('school', 2) === 'true', 'chart School Wed not filled from checklist');
  check(await cellOn('running', 2) === 'false', 'chart Running Wed on before training done');
  await visit('run.html?date=2026-11-11');
  check(/mph or faster/.test(await p.$eval('#trialgoal', e => e.textContent)), 'trial goal speed missing on Training');
  for (let i = 0; i < 10; i++) { const btn = await p.$('.ckbtn[aria-pressed="false"]'); if (!btn) break; await btn.click(); await p.waitForTimeout(60); }
  await visit('eli.html?week=2026-11-09');
  check(await cellOn('running', 2) === 'true', 'chart Running Wed not filled after training done');
  const stored = (await db()).charts?.eli?.weeks;
  check(!stored || !JSON.stringify(stored).includes('running'), 'chart Running was copied into storage: ' + JSON.stringify(stored));
  // Parent override on a filled box sticks, and a checklist tap doesn't wipe it
  await p.click('button.cell[data-row="chores"][data-day="2"]'); await p.waitForTimeout(150);
  check(await cellOn('chores', 2) === 'false', 'override off did not stick');
  await p.click('button.cell[data-row="chores"][data-day="2"]'); await p.waitForTimeout(150);
  check(await cellOn('chores', 2) === 'true', 'override back on failed');
  check(!JSON.stringify((await db()).charts?.eli?.weeks || {}).match(/true|off/), 'override back to checklist value should clear storage');
  await visit('checklist.html?kid=eli&date=2026-11-11');
  check((await p.$eval('.ckbtn[data-key="activity"]', e => e.getAttribute('aria-pressed'))) === 'true', 'checklist Running not ticked from Training');

  // 3. Isaiah: 600 touches is one box, shared with Ball Master, stored by date
  await visit('checklist.html?kid=isaiah&date=' + TODAY + '');
  await p.click('.ckbtn[data-key="activity"]'); await p.waitForTimeout(150);
  check((await db()).charts?.isaiah?.touchDays?.[TODAY] === true, 'touches not stored by date');
  await visit('isaiah.html');
  check(await p.$eval('.tday[data-date="' + TODAY + '"]', e => e.getAttribute('aria-pressed')) === 'true', 'Ball Master did not show checklist touches');
  await tap('.level'); await p.selectOption('select[data-path]', '0'); await p.waitForTimeout(120);

  // 4. Parent PIN: never created before settings load; set, wrong, right
  await p.evaluate(() => { localStorage.removeItem('rc:parent'); });
  await ctx.addInitScript({ content: 'window.__slowSettings = !!sessionStorage.getItem("slow");' });
  await p.evaluate(() => sessionStorage.setItem('slow', '1'));
  await visit('isaiah.html');
  await tap('[data-cash]');
  const slowDlg = await p.$eval('.pindlg', e => e.textContent).catch(() => '');
  check(/Still connecting/.test(slowDlg), 'slow settings should refuse, got: ' + slowDlg);
  check(!(await db()).charts?.settings, 'PIN created while settings were loading');
  await p.evaluate(() => sessionStorage.removeItem('slow'));
  await visit('isaiah.html');
  await tap('[data-cash]'); await enterPin('2468');
  const st = (await db()).charts?.settings || {};
  check(st.pinHash && st.pinHash.length === 64 && !st.pin, 'PIN not stored as hash: ' + JSON.stringify(st));
  check(Object.keys((await db()).charts?.isaiah?.cashed || {}).length === 1, 'cash-in after PIN failed');
  await p.evaluate(() => localStorage.removeItem('rc:parent'));
  await visit('trials.html');
  await p.click('.tt-kind [data-kind="mile"]'); await p.fill('#tmin', '6'); await p.fill('#tsec', '52'); await p.fill('#tdate', '2026-11-18'); await p.click('.tt-save'); await p.waitForTimeout(200);
  check(!(await p.$('[data-paid^="t_"]')), 'trial-finish reward still shown');
  await p.selectOption('select[data-pick="mile_440"]', '0'); await p.waitForTimeout(150);
  await tap('[data-paid="mile_440"]'); await enterPin('1111');
  check(await p.$eval('.pindlg .note', e => /didn’t match/.test(e.textContent)), 'wrong PIN not refused');
  await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(250);
  check(await p.$eval('[data-paid="mile_440"]', e => /Paid \w/.test(e.textContent)), 'paid not set after right PIN');
  check(/8\.9 mph/.test(await p.$eval('#next', e => e.textContent)), 'next-goal speed missing');

  // 5. Time Trials: last/next, defaults, no locked prize rows, owed list
  await p.click('.tt-kind [data-kind="5k"]'); await p.fill('#tmin', '22'); await p.fill('#tsec', '40'); await p.fill('#tdate', '2026-11-11'); await p.click('.tt-save'); await p.waitForTimeout(250);
  check(await p.$$eval('.prow .muted', els => !els.some(e => /locked/i.test(e.textContent))), 'locked prize rows still listed');
  const up = await p.$eval('#next', e => e.innerText); notes.push('trials banner: ' + up.replace(/\n/g, ' / '));
  await visit('trials.html', 'trials');

  // 6. Parents page lists owed prizes and late nights; ticking marks paid
  await visit('parents.html', 'parents');
  const owedN = await p.$$eval('#owed .prow2', e => e.length);
  check(owedN >= 2, 'parents owed list short: ' + owedN);
  await tap('#owed [data-path]');
  check((await p.$$eval('#owed .prow2', e => e.length)) === owedN - 1, 'ticking an owed prize did not remove it');

  // 7. Settings: change Eli's lights out, checklist follows
  await visit('settings.html');
  await p.fill('#lights', '21:00'); await p.dispatchEvent('#lights', 'input');
  await p.click('#save'); await p.waitForTimeout(400);
  check((await db()).charts?.config?.lights?.eli === '21:00', 'settings not saved');
  await visit('checklist.html?kid=eli&date=2026-11-10');
  const lo = await p.$$eval('#bed .rtime', e => e[e.length - 1].textContent);
  check(lo === '9:00', 'lights out did not follow settings: ' + lo);
  await visit('settings.html'); await p.click('#reset'); await p.waitForTimeout(300);

  // 8. History
  await visit('history.html?kid=eli', 'history');
  check((await p.$$('.calday')).length >= 28, 'calendar missing days');
  await visit('run.html#history', 'runhist');
  check(!(await p.$eval('#panel-hist', e => e.hidden)), 'history tab not open');
  check((await p.$$('#trialtable tbody tr')).length >= 2, 'trial table empty');
  check((await p.$$('#runtable tbody tr')).length >= 1, 'run table empty');
  await visit('parents.html', 'parents2');
  check((await p.$$('.nowkid')).length === 3, 'parents right-now missing');

  // 9. Offline: page opens from the phone's copy, taps are queued, banner shows
  offline = true;
  await visit('checklist.html?kid=rhett&date=2026-11-11', 'offline', false);
  check((await p.$$('.ckbtn')).length > 0, 'offline: checklist did not open');
  await tap('.ckbtn[aria-pressed="false"]');
  check(await p.$eval('.ckbtn[aria-pressed="true"]', () => true).catch(() => false), 'offline tap not shown');
  await p.waitForTimeout(3000);
  check(await p.$('#netbanner') !== null, 'offline banner missing');
  const queued = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('rc:pending') || '{}')).length);
  check(queued >= 1, 'offline tap not queued');
  offline = false;
  await visit('checklist.html?kid=rhett&date=2026-11-11');
  await p.waitForTimeout(800);
  const left = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('rc:pending') || '{}')).length);
  check(left === 0, 'queued tap not sent after reconnect: ' + left);
  check((await db()).charts?.routines?.days?.['2026-11-11']?.rhett, 'queued tap not in database');

  // 10. Screens, light and dark
  await visit('index.html', 'home');
  await visit('kid.html?kid=eli', 'kid-eli');
  await p.emulateMedia({ colorScheme: 'dark' });
  for (const u of ['index.html', 'checklist.html?kid=eli&date=2026-11-11', 'eli.html', 'trials.html', 'parents.html', 'history.html', 'run.html', 'isaiah.html']) await visit(u, 'dark-' + u.split(/[.?]/)[0]);
  await p.emulateMedia({ colorScheme: 'light' });
  await p.setViewportSize({ width: 1024, height: 800 });
  for (const u of ['index.html', 'parents.html', 'settings.html', 'history.html', 'trials.html']) await visit(u);

  console.log(notes.join('\n'));
  console.log(errors.length ? 'ISSUES:\n' + errors.join('\n') : 'NO ISSUES');
  await b.close();
})();
