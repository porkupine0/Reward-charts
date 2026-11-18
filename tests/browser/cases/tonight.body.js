  // Parents' Tonight card: one "All good" per boy, never overrides "Not today", stepper back to Monday.
  await p.clock.setFixedTime(new Date(2026, 10, 18, 21, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => {
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-18': { isaiah: { noLies: 'no' } } } } } }));
    localStorage.setItem('rc:unlock', JSON.stringify({ always: true }));
  });
  await visit('parents.html', 'tonight');
  check(/Tonight/.test(await p.$eval('#tnhead', (e) => e.textContent)), 'Tonight heading');
  await tap('[data-allgood="2026-11-18|rhett"]');
  await tap('[data-allgood="2026-11-18|isaiah"]');
  const st = (await db()).charts.routines.days['2026-11-18'];
  notes.push('saved: ' + JSON.stringify(st));
  check(st.rhett.noYell === true && st.rhett.firstTime === true && st.rhett.noLies === true, 'Rhett: All good saved all three');
  check(st.isaiah.noLies === 'no' && st.isaiah.noYell === true, 'Isaiah: Not today survived All good');
  await p.screenshot({ path: OUT + 'tonight-375.png', fullPage: false });
  await visit('trombone.html', 'tonight-rhett-chart');
  const wedOn = await p.$$eval('button.cell[data-day="2"]', (els) => els.filter((e) => ['noYell', 'firstTime', 'noLies'].includes(e.dataset.row)).map((e) => e.getAttribute('aria-pressed')));
  check(wedOn.length === 3 && wedOn.every((x) => x === 'true'), "Rhett's chart: Wednesday's three check boxes filled " + wedOn);
  await visit('checklist.html?kid=rhett', 'tonight-rhett-check');
  const yes = await p.$$eval('[data-daycheck$="|yes"]', (els) => els.map((e) => e.getAttribute('aria-pressed')));
  check(yes.length === 3 && yes.every((x) => x === 'true'), 'checklist End of day agrees ' + yes);
  // stepper: back past Monday
  await visit('parents.html', 'tonight-step');
  await tap('#tnprev'); await tap('#tnprev');
  notes.push('after two steps back: ' + await p.$eval('#tnhead', (e) => e.textContent));
  check(!(await p.$eval('#tnprev', (e) => e.disabled)), 'can keep going back past Monday (to Sunday)');
  check(!!(await p.$('[data-allgood^="2026-11-16|"]')), 'Monday can be filled in from here');
