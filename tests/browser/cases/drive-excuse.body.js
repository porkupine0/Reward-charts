  // Thanksgiving: the driving lesson can be excused (Eli asks on the checklist, even while the row is locked
  // for chores; a parent approves on the Parents page). The excused day counts; the same lesson is due Friday.
  await p.clock.setFixedTime(new Date(2026, 10, 26, 10, 0)); // Thu Nov 26
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
    routines: { days: { '2026-11-23': { eli: { chore: true } }, '2026-11-24': { eli: { chore: true } }, '2026-11-25': { eli: { chore: true } } } },
    'eli-drive': { approved: { w1d1: '2026-11-17', w1d2: '2026-11-17' } } } })); });
  await visit('checklist.html?kid=eli', 'excuse-thu');
  check(!!(await p.$('.ck.locked .ckbtn[data-key="drive"]')), 'Thursday: the driving row is there, locked (chores not done)');
  check(!!(await p.$('[data-excuse="mark"][data-key="drive"]')), 'the locked driving row still offers "Not able to do it?"');
  await tap('[data-excuse="mark"][data-key="drive"]');
  check((await db()).charts.routines.days['2026-11-26'].eli.drive === '~skip', 'asked: waiting for a parent');
  await p.evaluate(() => localStorage.setItem('rc:unlock', JSON.stringify({ always: true }))); // a parent's phone
  await visit('parents.html', 'excuse-parents');
  check(/Driving lesson/.test(await p.$eval('#excuses', (e) => e.textContent)), 'Parents page: the request is waiting');
  await tap('[data-ex="2026-11-26|eli|drive|ok"]');
  await p.waitForTimeout(300);
  check((await db()).charts.routines.days['2026-11-26'].eli.drive === '~excused', 'approved: excused');
  await p.evaluate(() => localStorage.removeItem('rc:unlock'));
  await visit('checklist.html?kid=eli', 'excuse-thu-after');
  check(await p.$eval('.ckbtn[data-key="drive"]', (e) => e.getAttribute('aria-pressed')) === 'true' && /Excused/.test(await p.$eval('#day', (e) => e.textContent)), 'the excused lesson counts on the checklist');
  // Friday: the same lesson is due
  await p.clock.setFixedTime(new Date(2026, 10, 27, 10, 0));
  await visit('checklist.html?kid=eli', 'excuse-fri');
  check(!!(await p.$('.ckbtn[data-key="drive"]')), 'Friday: the driving lesson is due again');
  const due = await p.evaluate(async () => { const D = await import('./driving.js?v=' + window.__V), C = await import('./driving-course.js?v=' + window.__V);
    const r = D.dueOn(C.LESSONS, { approved: { w1d1: '2026-11-17', w1d2: '2026-11-17' } }, '2026-11-27', 4); return r && r.lesson.id + ':' + r.due; });
  check(due === 'w1d1:required', 'Friday: lesson 1 is due (' + due + ')');
