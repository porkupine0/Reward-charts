  // Isaiah's one-off outside time, Fri Nov 27 only
  await p.clock.setFixedTime(new Date(2026, 10, 27, 14, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('checklist.html?kid=isaiah', 'outside');
  check(/Outside time · 30 min/.test(await p.$eval('#day .checklist', (e) => e.textContent)), 'on today’s afternoon list');
  await tap('.ckbtn[data-key="outside"]');
  check((await db()).charts.routines.days['2026-11-27'].isaiah.outside === true, 'ticks and saves');
  await visit('checklist.html?kid=isaiah&date=2026-11-28', 'outside-sat');
  check(!/Outside time/.test(await p.$eval('#day', (e) => e.textContent)), 'not on other days');
