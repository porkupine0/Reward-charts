  // The weekly hazard ride: a parent ticks it on the Driving page (PIN); no PIN, no save; it survives a
  // reload; Undo clears it; it changes nothing on the checklist (no row, nothing left to do, no streak).
  const PINHASH = '30fb85852fe669dfbf8e52b679886067b7ac636b8478c831607e50cade42329d'; // 2468
  await p.goto(B + 'index.html');
  await p.evaluate((h) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { settings: { pinHash: h },
    routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } } } } } })); }, PINHASH);
  const left = () => p.evaluate(async () => { const L = await import('./lists.js?v=' + window.__V), S = await import('./store.js?v=' + window.__V);
    const c = JSON.parse(sessionStorage.getItem('mockdb')).charts, ctx = { routines: c.routines || {}, run: c['eli-run'] || {}, isaiah: c.isaiah || {}, drive: c['eli-drive'] || {} }, d = new Date(2026, 10, 18);
    return JSON.stringify([L.lists(ctx, 'eli', d).day.map((i) => i.key), L.progress(ctx, 'eli', d, L.lists(ctx, 'eli', d).day).left.map((i) => i.key)]); });
  const before = await left();
  await visit('drive.html', 'ride-start');
  check(/Not yet this week/.test(await p.$eval('#ride', (e) => e.textContent)) && /Family activity/.test(await p.$eval('#ride', (e) => e.textContent)), 'the ride card: not yet, labelled a family activity');
  // no PIN: cancel the dialog, nothing saved
  await p.click('[data-ride="done"]');
  await p.waitForSelector('.pindlg', { timeout: 2000 });
  await p.click('.pindlg [data-pin="cancel"]').catch(() => p.keyboard.press('Escape'));
  await p.waitForTimeout(300);
  check(!((await db()).charts['eli-drive'] || {}).rides, 'no PIN: nothing saved');
  // with the PIN
  await p.click('[data-ride="done"]');
  await p.waitForSelector('.pindlg input', { timeout: 2000 });
  await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(400);
  check(((await db()).charts['eli-drive'].rides || {})['2026-11-16'] === '2026-11-18', 'ticked: stored for the week of Nov 16, dated today');
  await visit('drive.html', 'ride-reload');
  check(/Done this week/.test(await p.$eval('#ride', (e) => e.textContent)), 'survives a reload');
  check((await left()) === before, 'the checklist is unchanged (no row, nothing left to do)');
  await visit('parents.html', 'ride-parents');
  check(/Hazard ride: done this week/.test(await p.$eval('#testscores', (e) => e.textContent)), 'Parents page: done this week');
  await visit('drive.html', 'ride-undo');
  await p.click('[data-ride="undo"]'); await p.waitForTimeout(400);
  const pin = await p.$('.pindlg input');
  if (pin) { await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(400); }
  check(!(((await db()).charts['eli-drive'].rides || {})['2026-11-16']), 'Undo clears it');
  check(/Not yet this week/.test(await p.$eval('#ride', (e) => e.textContent)), 'card back to not yet');
