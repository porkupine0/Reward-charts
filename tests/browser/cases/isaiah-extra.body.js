  // Isaiah's one-off extra chore, Wed Nov 25 only
  await p.clock.setFixedTime(new Date(2026, 10, 25, 9, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('checklist.html?kid=isaiah', 'x-isaiah');
  check(/Restock \+ organize the mini fridge and downstairs fridge/.test(await p.$eval('#day .checklist', (e) => e.textContent)), 'on today’s list');
  await tap('.ckbtn[data-key="xchore"]');
  check((await db()).charts.routines.days['2026-11-25'].isaiah.xchore === true, 'ticks like any chore');
  await visit('checklist.html?kid=isaiah&date=2026-11-26', 'x-isaiah-thu');
  check(!/mini fridge/.test(await p.$eval('#day .checklist', (e) => e.textContent)), 'not tomorrow');
