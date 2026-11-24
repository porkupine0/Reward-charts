  // Days off (Thanksgiving week): like a Saturday for school things. No school items, Eli's Ritalin, Isaiah's
  // Saturday morning (no candy), later bedtime the night before (and on time at the later time), no show-choir
  // alarm, Eli's School row off. Game time still earned on a weekday off.
  await p.clock.setFixedTime(new Date(2026, 10, 25, 9, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => {
    const at = (h, m) => new Date(2026, 10, 24, h, m).getTime();
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-24': { eli: { bedTimer: { start: at(20, 0), end: at(20, 52) } } } } } } }));
    localStorage.setItem('rc:unlock', JSON.stringify({ always: true }));
  });
  const keys = (sel) => p.$$eval(sel + ' .ckbtn', (els) => els.map((e) => e.dataset.key));
  await visit('checklist.html?kid=eli&date=2026-11-25', 'off-eli');
  const ed = await keys('#day .checklist');
  check(!ed.some((k) => ['putaway', 'organize', 'due', 'missing', 'homework'].includes(k)), 'no school items on a day off');
  check(ed.includes('meds2') && (await keys('#morning')).includes('mMeds'), 'Eli’s Ritalin on a day off');
  check(/Today/.test(await p.$eval('#day h2', (e) => e.textContent)), 'heading is Today, not After school');
  check(/30 min of weekend game time|game time/.test(await p.$eval('#bed', (e) => e.textContent)), 'game time line still shows');
  await visit('checklist.html?kid=isaiah&date=2026-11-25', 'off-isaiah');
  const im = await keys('#morning');
  check(!im.includes('mHigh5') && !im.includes('mDoor') && !(await p.$('#morning .treat')), 'Isaiah: Saturday morning, no candy box');
  // the night before: later bedtime, on time at 8:52
  await visit('checklist.html?kid=eli&date=2026-11-24', 'off-night');
  check(/No school tomorrow/.test(await p.$eval('#notes', (e) => e.textContent)), 'note says no school tomorrow');
  const lights = await p.$eval('#bed .ckbtn[data-key="lights"] .rtime', (e) => e.textContent);
  check(lights === '9:00', 'Eli lights out 9:00 the night before a day off (was ' + lights + ')');
  await visit('parents.html', 'off-parents');
  check(!/Eli/.test(await p.$eval('#late', (e) => e.textContent)), 'in bed at 8:52 is not a late night');
  // Thursday night before Friday off: no show-choir alarm
  await visit('checklist.html?kid=eli&date=2026-11-26', 'off-thu');
  check(!(await keys('#bed')).includes('alarm') && !/Show choir/.test(await p.$eval('#notes', (e) => e.textContent)), 'no show-choir alarm before a day off');
  await visit('checklist.html?kid=eli&date=2026-11-30', 'off-mon');
  check((await keys('#bed')).includes('alarm'), 'alarm back on a school night');
  // chart: School row off Wed-Fri
  await visit('eli.html?week=2026-11-23', 'off-chart');
  const sc = await p.$$eval('.cell', (els) => els.length);
  notes.push('cells: ' + sc);
  check(!!(await p.$('button.cell[data-row="school"][data-day="1"]')) && !(await p.$('button.cell[data-row="school"][data-day="2"]')), 'School row: Tuesday a box, Wednesday off');
