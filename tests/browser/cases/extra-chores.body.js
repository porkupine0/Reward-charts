  // Eli's no-game-time week (Nov 23-29, 2026): an extra chore each day on his checklist, with its steps; it
  // saves like any chore; screen work waits for it; missed, it carries to the next day beside that day's extra;
  // no game minutes are promised anywhere that week.
  await p.clock.setFixedTime(new Date(2026, 10, 23, 16, 30)); // Mon Nov 23
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {
    '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } }, '2026-11-18': { eli: { chore: true } }, '2026-11-19': { eli: { chore: true } }, '2026-11-20': { eli: { chore: true } }, '2026-11-21': { eli: { chore: true } }, '2026-11-22': { eli: { chore: true } },
    '2026-11-23': { eli: { chore: true, chore2: true } } } } } })); });
  await visit('checklist.html?kid=eli', 'xchore-mon');
  const row = '[data-steps="2026-11-23|xchore"]';
  check(!!(await p.$(row)) && /Bathrooms/.test(await p.$eval(row, (e) => e.closest('.ck').textContent)) && /Extra chore today/.test(await p.$eval(row, (e) => e.closest('.ck').textContent)), 'Monday: Bathrooms shows as the extra chore, with its steps');
  check((await p.$$('.ck.locked')).length > 0, 'usual chores done, extra not: screen work still waits');
  await tap(row);
  for (const st of await p.$$eval('#day [data-step^="2026-11-23|xchore"]', (els) => els.map((e) => e.dataset.step))) await tap('[data-step="' + st + '"]');
  check((await p.$$('.ck.locked')).length === 0 && (await db()).charts.routines.days['2026-11-23'].eli.xchore === true, 'extra done (saved as xchore): screen work unlocks');
  // undo it for the next part (left undone on Monday)
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-23/eli/xchore', null); });
  const t = await p.$eval('#bed', (e) => e.textContent).catch(() => '');
  check(/No game time this week/.test(t), 'end of day: no game time this week');
  await p.setViewportSize({ width: 320, height: 800 }); await p.screenshot({ path: OUT + 'xchore-mon-320.png', fullPage: true }); await p.setViewportSize({ width: 375, height: 812 });
  // Tuesday: Monday's Bathrooms left undone carries over, beside Tuesday's Kitchen; no minutes are held
  await p.clock.setFixedTime(new Date(2026, 10, 24, 16, 30));
  await visit('checklist.html?kid=eli', 'xchore-tue');
  const owedT = await p.$eval('.owed', (e) => e.textContent).catch(() => '');
  check(/Bathrooms/.test(owedT) && !/min of game time/.test(owedT), 'Tuesday: Monday’s extra is owed (no game minutes held)');
  check(!!(await p.$('[data-steps="2026-11-24|xchore"]')) && /Kitchen/.test(await p.$eval('[data-steps="2026-11-24|xchore"]', (e) => e.closest('.ck').textContent)), 'Tuesday’s extra (Kitchen) is there too');
  await tap('.owed [data-steps="2026-11-23|xchore"]');
  const steps = await p.$$eval('.owed .stepbtn', (els) => els.map((e) => e.dataset.step));
  for (const s of steps) await tap('[data-step="' + s + '"]');
  const d = (await db()).charts.routines.days;
  check(d['2026-11-23'].eli.xchore === true && !((d['2026-11-24'] || {}).eli || {}).xchore, 'finishing Monday’s Bathrooms saves on Monday, not Tuesday’s Kitchen');
  await visit('eli.html', 'xchore-chart');
  check(/No game time this week/.test(await p.$eval('#gtstatus', (e) => e.textContent)), 'his chart: no game time this week');
