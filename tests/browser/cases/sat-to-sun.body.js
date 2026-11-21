  // With Isaiah's new schedule (trash Saturday, room Monday, no Sunday fold), an unfinished Saturday chore
  // shows on Sunday under Finish first, with its steps.
  await p.clock.setFixedTime(new Date(2026, 10, 22, 15, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => {
    const K = 'Kitchen + dining room with the family', R = 'Clean your room (30 min)', T = 'Trash: empty every trash can in the house';
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
      config: { chores: { isaiah: [[K, R], ['Front closet + shoe organizing'], ['Kitchen'], ['Stairs, landing + upstairs hallway'], ['Sunroom'], ['Laundry', T], ['Kitchen + dining room (all hands)']] } },
      routines: { days: { '2026-11-16': { isaiah: { chore: true, chore2: true } }, '2026-11-17': { isaiah: { chore: true } }, '2026-11-18': { isaiah: { chore: true } }, '2026-11-19': { isaiah: { chore: true } }, '2026-11-20': { isaiah: { chore: true } } } }
    } }));
    localStorage.setItem('rc:unlock', JSON.stringify({ always: true }));
  });
  await visit('checklist.html?kid=isaiah', 'sat-sun');
  check(!!(await p.$('.owed [data-steps="2026-11-21|chore"]')) && !!(await p.$('.owed [data-steps="2026-11-21|chore2"]')), 'Saturday’s laundry and trash show on Sunday with their steps');
  check(/6 steps/.test(await p.$eval('.owed [data-steps="2026-11-21|chore"]', (e) => e.textContent)), 'Isaiah’s laundry-only list has 6 steps');
  const sun = await p.$$eval('#day [data-steps]', (els) => els.map((e) => e.textContent));
  check(sun.some((t) => /all hands/.test(t)) && !sun.some((t) => /Fold/.test(t)), 'Sunday has the kitchen chore and no fold chore');
  check(/10 steps/.test(await p.$eval('#day [data-steps="2026-11-22|chore"]', (e) => e.textContent)), 'all-hands kitchen has 10 steps');
  // Partly done Saturday (collect, wash, dry ticked): Sunday shows 3 of 6 and finishing there clears it
  await p.evaluate(() => {
    const d = JSON.parse(sessionStorage.getItem('mockdb'));
    d.charts.routines.days['2026-11-21'] = { isaiah: { chore2: true } };
    sessionStorage.setItem('mockdb', JSON.stringify(d));
  });
  await visit('checklist.html?kid=isaiah&date=2026-11-21', 'sat-partial');
  await tap('[data-steps="2026-11-21|chore"]');
  const sat = await p.$$eval('#day .stepbtn', (els) => els.map((e) => e.dataset.step));
  for (const i of [0, 1, 2]) await tap('[data-step="' + sat[i] + '"]');
  await visit('checklist.html?kid=isaiah', 'sun-partial');
  const owedRow = '.owed [data-steps="2026-11-21|chore"]';
  check(/3 of 6 steps/.test(await p.$eval(owedRow, (e) => e.textContent)), 'Sunday shows 3 of 6 from Saturday');
  await tap(owedRow);
  await p.screenshot({ path: OUT + 'sun-carryover.png' });
  const left = await p.$$eval('.owed .stepbtn[aria-pressed="false"]', (els) => els.map((e) => e.dataset.step));
  for (const s of left) await tap('[data-step="' + s + '"]');
  check(!(await p.$('.owed')), 'finishing on Sunday clears Finish first');
  check((await db()).charts.routines.days['2026-11-21'].isaiah.chore === true, 'Saturday’s laundry counts done');
  // Laundry and trash at the same time: both lists open, ticks alternate
  await p.evaluate(() => { const d = JSON.parse(sessionStorage.getItem('mockdb')); d.charts.routines.days['2026-11-21'] = { isaiah: {} }; sessionStorage.setItem('mockdb', JSON.stringify(d)); });
  await visit('checklist.html?kid=isaiah&date=2026-11-21', 'sat-both');
  await tap('[data-steps="2026-11-21|chore"]'); await tap('[data-steps="2026-11-21|chore2"]');
  const la = await p.$$eval('.stepbtn[data-step^="2026-11-21|chore|"]', (els) => els.map((e) => e.dataset.step));
  const tr = await p.$$eval('.stepbtn[data-step^="2026-11-21|chore2|"]', (els) => els.map((e) => e.dataset.step));
  check(la.length === 6 && tr.length === 8, 'both lists open at once');
  for (let i = 0; i < 3; i++) { await tap('[data-step="' + la[i] + '"]'); await tap('[data-step="' + tr[i] + '"]'); }
  check(/3 of 6/.test(await p.$eval('[data-steps="2026-11-21|chore"]', (e) => e.textContent)) && /3 of 8/.test(await p.$eval('[data-steps="2026-11-21|chore2"]', (e) => e.textContent)), 'ticks alternate between laundry and trash');
