  // New settings: reword one of Rhett's evening checks and change game minutes; the words show in End of
  // day, Tonight, his chart row and the game-time text; screenshots of the Settings section and the chart.
  await p.clock.setFixedTime(new Date(2026, 10, 18, 21, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); });
  await visit('settings.html', 'sn-settings');
  await p.click('#kidtabs [data-kid="rhett"]');
  const LONG = 'Told the truth all day, even when it was hard';
  await p.fill('#ck-noLies-label', LONG); await p.dispatchEvent('#ck-noLies-label', 'input');
  await p.fill('#gameMin', '20'); await p.dispatchEvent('#gameMin', 'input');
  await p.locator('.schecks').scrollIntoViewIfNeeded();
  await p.screenshot({ path: OUT + 'settings-new-375.png' });
  await p.click('#save'); await p.waitForTimeout(500);
  const cfg = (await db()).charts.config;
  check(cfg.game === 20 && cfg.checks.rhett.noLies.label === LONG, 'saved: ' + JSON.stringify({ game: cfg.game }));
  await visit('checklist.html?kid=rhett', 'sn-check');
  const bedText = await p.$eval('#bed', (e) => e.textContent);
  check(bedText.includes(LONG), 'End of day shows the new words');
  check(/For today’s 20 min of game time/.test(bedText) && bedText.includes(LONG + ' (Mom or Dad)'), 'game-time text uses the new words and 20 min');
  await visit('parents.html', 'sn-parents');
  check((await p.$eval('#tonight', (e) => e.textContent)).includes(LONG), 'Tonight shows the new words');
  await visit('trombone.html', 'sn-chart');
  const labels = await p.$$eval('.g-label strong', (els) => els.map((e) => e.textContent));
  check(labels.includes(LONG), 'chart row uses the new words');
  check(/= 20 minutes, to use on the weekend/.test(await p.$eval('#note', (e) => e.textContent)), 'chart note uses 20 minutes');
  await p.screenshot({ path: OUT + 'chart-long-label-375.png', fullPage: true });
