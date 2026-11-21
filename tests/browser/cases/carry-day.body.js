  // From yesterday: Sunday's unfinished items show on Monday (saved on Sunday when ticked); an approved
  // "not able to do it" drops off; nothing carries from before Nov 22.
  await p.clock.setFixedTime(new Date(2026, 10, 23, 16, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-22': { rhett: { chore: true, chore2: true }, eli: { chore: true } } } } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('checklist.html?kid=rhett', 'carry-rhett');
  const rows = await p.$$eval('.owed.carry [data-owed]', (els) => els.map((e) => e.dataset.owed));
  notes.push('Rhett carried: ' + rows.join(', '));
  check(rows.includes('2026-11-22|typing') && rows.includes('2026-11-22|trombone'), 'Sunday typing and trombone carry to Monday');
  check(!rows.some((r) => /chore|snack|reading|lights/.test(r)), 'no chores, snacks or bedtime items');
  await p.screenshot({ path: OUT + 'carry-rhett.png' });
  await tap('[data-owed="2026-11-22|trombone"]');
  check((await db()).charts.routines.days['2026-11-22'].rhett.trombone === true, 'ticked from Monday, saved on Sunday');
  check(!(await p.$('[data-owed="2026-11-22|trombone"]')), 'trombone gone once done');
  await tap('[data-owedex="mark|2026-11-22|typing"]');
  await tap('[data-owedex="approve|2026-11-22|typing"]');
  await p.waitForTimeout(300);
  check(!(await p.$('.owed.carry')), 'approved "not able" drops off');
  // Eli: Sunday's Bible reading carries with its pickers; tick needs a pick
  await visit('checklist.html?kid=eli', 'carry-eli');
  check(!!(await p.$('.owed.carry [data-owed="2026-11-22|bibleRead"]')), 'Sunday reading carries');
  await tap('[data-owed="2026-11-22|bibleRead"]');
  check(!!(await p.$('.owed.carry .bneed')) && !((await db()).charts.routines.days['2026-11-22'].eli || {}).bibleRead, 'needs the picks first');
  for (const part of ['pp', 'gos']) {
    await p.selectOption('[data-bbook="2026-11-22|bibleRead_' + part + '"]', part === 'pp' ? 'Proverbs' : 'Luke'); await p.waitForTimeout(150);
    await p.selectOption('[data-bchap="2026-11-22|bibleRead_' + part + '"]', '3'); await p.waitForTimeout(250);
  }
  await tap('[data-owed="2026-11-22|bibleRead"]');
  const sun = (await db()).charts.routines.days['2026-11-22'].eli;
  check(sun.bibleRead === true && sun.bibleRead_pp === 'Proverbs 3' && sun.bibleRead_gos === 'Luke 3', 'saved on Sunday with its picks');
  // before Nov 22: nothing carries
  await visit('checklist.html?kid=rhett&date=2026-11-22', 'carry-before');
  check(!(await p.$('.owed.carry')), 'Saturday’s items don’t carry to Sunday (starts Nov 22)');
