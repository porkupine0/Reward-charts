  // Changing a Tuesday chore on Settings (on Wed Nov 18): last Tuesday keeps its chore, chart box and
  // game time; next Tuesday shows the new chore.
  await p.clock.setFixedTime(new Date(2026, 10, 18, 19, 0));
  await p.goto(B + 'index.html');
  // Rhett: last Tuesday fully done (his old Tuesday chore is "Bathrooms")
  const lastTue = {};
  // last Tuesday fully done, built from the app's own lists (run from the repo folder)
  const V = JSON.parse(require('fs').readFileSync('version.json', 'utf8')).v;
  const Lm = await import(require('url').pathToFileURL(process.cwd() + '/lists.js').href + '?v=' + V);
  const tue = new Date(2026, 10, 17), done = {};
  const ls = Lm.lists({ routines: {}, run: {}, isaiah: {} }, 'rhett', tue);
  [...ls.morning, ...ls.day, ...ls.bed].forEach((it) => { if (it.parts) it.parts.forEach((x) => { done[Lm.partKey(it.key, x)] = true; }); else done[it.key] = it.choices ? it.choices[0] : true; });
  Lm.CHECKS.rhett.forEach((x) => { done[x.key] = true; });
  await p.evaluate((dn) => { localStorage.clear(); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-17': { rhett: dn } } } } })); }, done);
  await visit('checklist.html?kid=rhett&date=2026-11-17', 'sd-before');
  const tueBefore = await p.$$eval('#day .ckbtn[data-key^="chore"] strong', (els) => els.map((e) => e.textContent));
  await visit('trombone.html?week=2026-11-16', 'sd-chart-before');
  const boxBefore = await p.$eval('button.cell[data-row="chores"][data-day="1"]', (e) => e.getAttribute('aria-pressed'));
  const gtBefore = await p.$eval('#gtstatus', (e) => e.textContent);
  notes.push('before: Tuesday chores box ' + boxBefore + ' / ' + gtBefore);
  check(boxBefore === 'true', 'last Tuesday chores box was filled to start with');
  // change Rhett's Tuesday chore and save
  await visit('settings.html', 'sd-settings');
  await p.click('#kidtabs [data-kid="rhett"]');
  await p.fill('#ch1', 'Garage sweep');
  await p.dispatchEvent('#ch1', 'input');
  await p.click('#save'); await p.waitForTimeout(500);
  const hist = (await db()).charts.config.history;
  check(hist && hist['2026-11-18'], 'snapshot of the old settings saved for Nov 18');
  await visit('checklist.html?kid=rhett&date=2026-11-17', 'sd-after-last');
  const tueAfter = await p.$$eval('#day .ckbtn[data-key^="chore"] strong', (els) => els.map((e) => e.textContent));
  notes.push('last Tuesday chores: ' + tueBefore.join(',') + ' -> ' + tueAfter.join(','));
  check(JSON.stringify(tueBefore) === JSON.stringify(tueAfter), 'last Tuesday keeps its chore');
  await visit('trombone.html?week=2026-11-16', 'sd-chart-after');
  check(boxBefore === await p.$eval('button.cell[data-row="chores"][data-day="1"]', (e) => e.getAttribute('aria-pressed')), 'last Tuesday chart box unchanged (' + boxBefore + ')');
  check(gtBefore === await p.$eval('#gtstatus', (e) => e.textContent), 'game time unchanged: ' + gtBefore);
  await visit('checklist.html?kid=rhett&date=2026-11-24', 'sd-next');
  const next = await p.$$eval('#day .ckbtn[data-key^="chore"] strong', (els) => els.map((e) => e.textContent));
  notes.push('next Tuesday chores: ' + next.join(','));
  check(next.some((t) => /Garage sweep/.test(t)), 'next Tuesday shows the new chore');
