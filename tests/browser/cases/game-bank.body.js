  // Game time bank (Parents page): Rhett has 25 min (carried in); cash in 15 with the PIN; Undo; Other… 
  const PINHASH = '30fb85852fe669dfbf8e52b679886067b7ac636b8478c831607e50cade42329d'; // 2468
  await p.clock.setFixedTime(new Date(2026, 11, 5, 14, 0));
  await p.goto(B + 'index.html');
  await p.evaluate((h) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { settings: { pinHash: h }, routines: { days: {}, game: {}, carry: { rhett: { '2026-11-23': { minutes: 25, add: true } } } } } })); }, PINHASH);
  await visit('parents.html', 'bank');
  const txt = await p.$eval('#bank', (e) => e.textContent);
  check(/25 min left/.test(txt) && /25 carried over/.test(txt), 'Rhett 25 min left: ' + txt.replace(/\s+/g, ' ').slice(0, 120));
  check(!!(await p.$('[data-bank="rhett|15"]')) && !(await p.$('[data-bank="rhett|30"]')), 'only amounts he has');
  await p.click('[data-bank="rhett|15"]');
  // (the Parents page itself took the PIN on the way in; a second prompt only if that unlock has lapsed)
  if (await p.waitForSelector('.pindlg input', { timeout: 800 }).catch(() => null)) { await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(400); }
  const g = (await db()).charts.routines.game.rhett['2026-11-30'];
  check(g && Object.values(g).includes(15), 'cashed in 15 min this week');
  check(/10 min left/.test(await p.$eval('#bank', (e) => e.textContent)), 'now 10 left');
  await p.locator('#bank').scrollIntoViewIfNeeded();
  await p.screenshot({ path: OUT + 'bank.png' });
  await p.click('[data-bankundo^="rhett|"]'); await p.waitForTimeout(400);
  check(/25 min left/.test(await p.$eval('#bank', (e) => e.textContent)), 'Undo puts it back (parent unlocked for a few minutes)');
  // the chart page also asks for the PIN (locked phone)
  await p.evaluate(() => { localStorage.removeItem('rc:unlock'); sessionStorage.removeItem('rc:unlock'); });
