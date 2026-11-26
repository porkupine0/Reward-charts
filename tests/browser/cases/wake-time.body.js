  // Wake-up time: the field keeps its place while being changed (the page doesn't rebuild under it)
  await p.clock.setFixedTime(new Date(2026, 10, 26, 7, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('checklist.html?kid=isaiah', 'wake');
  await p.evaluate(() => { document.getElementById('wokeAt').__mark = 1; });
  await p.focus('#wokeAt');
  await p.fill('#wokeAt', '07:15');
  await p.dispatchEvent('#wokeAt', 'change');
  await p.waitForTimeout(400);
  check(await p.evaluate(() => document.getElementById('wokeAt').__mark === 1), 'same field after the change (not rebuilt)');
  check((await p.$eval('#wokeAt', (e) => e.value)) === '07:15', 'value kept while editing');
  await p.evaluate(() => document.getElementById('wokeAt').blur());
  await p.waitForTimeout(400);
  check((await db()).charts.routines.days['2026-11-26'].isaiah.wokeAt === '07:15', 'saved');
  check((await p.$eval('#wokeAt', (e) => e.value)) === '07:15' && !(await p.evaluate(() => document.getElementById('wokeAt').__mark)), 'page refreshed after leaving the field');
