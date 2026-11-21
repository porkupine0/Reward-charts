  // Late nights: Deny keeps the night late, takes it off Late nights' buttons and Tonight, and Undo brings it back
  await p.clock.setFixedTime(new Date(2026, 10, 21, 18, 46));
  await p.goto(B + 'index.html');
  await p.evaluate(() => {
    const end = new Date(2026, 10, 18, 20, 57).getTime(), start = new Date(2026, 10, 18, 20, 20).getTime();
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-18': { isaiah: { bedTimer: { start, end } } } } } } }));
    localStorage.setItem('rc:unlock', JSON.stringify({ always: true }));
  });
  await visit('parents.html', 'late-deny');
  const before = await p.$eval('#late', (e) => e.textContent);
  notes.push('late row: ' + before.replace(/\s+/g, ' ').slice(0, 90));
  check(!!(await p.$('#late [data-bedok="2026-11-18|isaiah|no"]')), 'Deny button on the late night');
  await p.locator('#late').scrollIntoViewIfNeeded();
  await p.screenshot({ path: OUT + 'late-deny-375.png' });
  await tap('#late [data-bedok="2026-11-18|isaiah|no"]');
  await p.waitForTimeout(300);
  check((await db()).charts.routines.days['2026-11-18'].isaiah.bedOk === 'no', 'saved as denied');
  check(/denied/.test(await p.$eval('#late', (e) => e.textContent)) && !(await p.$('#late [data-bedok="2026-11-18|isaiah"]')), 'row says denied, no OK button');
  await tap('#late [data-bedok="2026-11-18|isaiah|undo"]');
  await p.waitForTimeout(300);
  check(!!(await p.$('#late [data-bedok="2026-11-18|isaiah"]')), 'Undo brings the buttons back');
