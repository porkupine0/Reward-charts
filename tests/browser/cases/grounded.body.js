  // Parents page: ground Isaiah for 2 days, then take one off; his game card shows the hold and no Played buttons.
  await p.clock.setFixedTime(new Date(2026, 11, 5, 10, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {}, game: {} } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('parents.html', 'gr-parents');
  check(/Not grounded/.test(await p.$eval('#grounded', (e) => e.textContent)), 'starts not grounded');
  await tap('[data-ground="isaiah|add"]'); await p.waitForTimeout(250);
  await tap('[data-ground="isaiah|add"]'); await p.waitForTimeout(250);
  const g = (await db()).charts.routines.grounded.isaiah;
  check(g['2026-12-05'] === true && g['2026-12-06'] === true, 'today and tomorrow saved');
  const txt = await p.$eval('#grounded', (e) => e.textContent);
  check(/2 days left/.test(txt) && /Through Sun, Dec 6/.test(txt), 'countdown and last day: ' + txt.replace(/\s+/g, ' ').slice(0, 80));
  await p.locator('#grounded').scrollIntoViewIfNeeded();
  await p.screenshot({ path: OUT + 'grounded-parents.png' });
  await tap('[data-ground="isaiah|remove"]'); await p.waitForTimeout(250);
  check(/1 day left/.test(await p.$eval('#grounded', (e) => e.textContent)) && !(await db()).charts.routines.grounded.isaiah['2026-12-06'], 'minus one day');
  // his game card: on hold, no Played buttons (with minutes left from the week)
  await p.evaluate(() => { const d = JSON.parse(sessionStorage.getItem('mockdb')); d.charts.routines.carry = { isaiah: { '2026-11-23': { minutes: 30, add: true } } }; sessionStorage.setItem('mockdb', JSON.stringify(d)); });
  await visit('zay.html', 'gr-card');
  const card = await p.$eval('#gamecard', (e) => e.textContent);
  check(/Grounded from electronics: 1 day left/.test(card) && /on hold/.test(card), 'game card shows the hold');
  check(!(await p.$('[data-gtuse]')), 'no Played buttons while grounded');
