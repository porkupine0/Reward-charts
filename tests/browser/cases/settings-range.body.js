  // Out-of-range game minutes: Save refuses and names the range; nothing is written. Default-wording charts.
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); });
  await visit('settings.html', 'sr-settings');
  await p.fill('#gameMin', '200'); await p.dispatchEvent('#gameMin', 'input');
  await p.click('#save'); await p.waitForTimeout(400);
  const msg = await p.$eval('#msg', (e) => e.textContent);
  notes.push('save with 200: ' + msg);
  check(/from 5 to 120 minutes/.test(msg) && /Nothing was saved/.test(msg), 'refused with the range');
  check(!((await db()).charts.config || {}).game, 'nothing written');
  await p.evaluate(() => { const el = document.getElementById('gameMin').closest('section'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 10); });
  await p.screenshot({ path: OUT + 'settings-game-375.png' });
  await visit('trombone.html', 'sr-rhett-chart');
  await p.screenshot({ path: OUT + 'chart-rhett-default-375.png', fullPage: true });
  await visit('eli.html', 'sr-eli-chart');
  await p.screenshot({ path: OUT + 'chart-eli-default-375.png', fullPage: true });
