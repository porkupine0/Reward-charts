  // Offline saves: a change made on another phone while this one is offline survives the reconnect,
  // and a save the server refuses shows on the pill instead of "Synced".
  await p.clock.setFixedTime(new Date(2026, 10, 18, 16, 30));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); });
  await visit('checklist.html?kid=rhett', 'off-1'); // online once, so this phone has a copy
  offline = true;
  await visit('checklist.html?kid=rhett', 'off-2', false);
  await tap('[data-key="afterSnack"][data-choice="Banana"]');
  check(await p.evaluate(() => (JSON.parse(localStorage.getItem('rc:queue') || '[]')).some((e) => /afterSnack/.test(e.path))), 'queued on this phone');
  // meanwhile another phone picks Yogurt
  await p.evaluate(() => { const db = JSON.parse(sessionStorage.getItem('mockdb')); db.charts.routines.days = { '2026-11-18': { rhett: { afterSnack: 'Yogurt' } } }; sessionStorage.setItem('mockdb', JSON.stringify(db)); });
  offline = false;
  await visit('checklist.html?kid=rhett', 'off-reopen', false); // the app opened again, back online
  await p.waitForTimeout(600);
  notes.push('pill after reconnect: ' + await p.$eval('#sync', (e) => e.textContent) + ' / queue: ' + await p.evaluate(() => localStorage.getItem('rc:queue')));
  const v = (await db()).charts.routines.days['2026-11-18'].rhett.afterSnack;
  notes.push('after reconnect: ' + v + ' / banner: ' + (await p.$eval('#netbanner', (e) => e.textContent).catch(() => 'none')));
  check(v === 'Yogurt', "the other phone's newer change survived");
  check(/wasn’t sent/.test(await p.$eval('#netbanner', (e) => e.textContent).catch(() => '')), 'banner says one change was not sent');
  check(await p.evaluate(() => (JSON.parse(localStorage.getItem('rc:queue') || '[]')).length === 0), 'queue empty');

  // a server that refuses one path
  const REJECT = MOCK_DB.replace('export async function set(p, v) {', "export async function set(p, v) { if (/putaway/.test(p)) throw new Error('PERMISSION_DENIED');");
  const swap = (r) => r.fulfill({ contentType: 'text/javascript', body: REJECT });
  await ctx.route(/firebase-database\.js/, swap);
  await visit('checklist.html?kid=rhett', 'off-3');
  await tap('.ckbtn[data-key="putaway"]');
  await p.waitForTimeout(400);
  const pill = await p.$eval('#sync', (e) => e.textContent);
  notes.push('pill after refused save: ' + pill);
  check(pill === 'Not saved, retrying', 'pill shows the refused save');
  check(await p.evaluate(() => (JSON.parse(localStorage.getItem('rc:queue') || '[]')).some((e) => /putaway/.test(e.path))), 'refused change stays queued');
  await ctx.unroute(/firebase-database\.js/, swap);
