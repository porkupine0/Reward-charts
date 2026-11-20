  // Chore step lists: Rhett's Thursday Living Room opens from its row, the list stays open while he ticks,
  // the last step ticks the chore and closes the list, and unticking a step un-ticks the chore.
  // Eli missed Wednesday's Sunroom: its steps show in Finish first and save on Wednesday.
  await p.clock.setFixedTime(new Date(2026, 10, 19, 16, 30));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } } } } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('checklist.html?kid=rhett', 'steps-closed');
  const row = '[data-steps="2026-11-19|chore"]';
  check(!!(await p.$(row)), 'Living Room has a steps row');
  check((await p.$$('.stepbtn')).length === 0, 'steps start closed');
  check(/0 of 8 steps/.test(await p.$eval(row, (e) => e.textContent)), 'shows 0 of 8');
  await tap(row);
  check((await p.$eval(row, (e) => e.getAttribute('aria-expanded'))) === 'true', 'row says expanded');
  const steps = await p.$$eval('.stepbtn', (els) => els.map((e) => e.dataset.step));
  check(steps.length === 8, '8 steps shown');
  for (const s of steps.slice(0, 7)) await tap('[data-step="' + s + '"]');
  check((await p.$$('.stepbtn')).length === 8, 'list stays open while ticking');
  check(/7 of 8 steps/.test(await p.$eval(row, (e) => e.textContent)), 'shows 7 of 8');
  check(!(await p.$eval(row, (e) => e.closest('.ck').classList.contains('on'))), 'chore not done at 7 of 8');
  await p.screenshot({ path: OUT + 'steps-open.png', fullPage: false });
  await tap('[data-step="' + steps[7] + '"]');
  check(await p.$eval(row, (e) => e.closest('.ck').classList.contains('on')), 'last step ticks the chore');
  check((await p.$$('.stepbtn')).length === 0, 'list closes on the last step');
  await tap(row);
  await tap('[data-step="' + steps[2] + '"]');
  check(!(await p.$eval(row, (e) => e.closest('.ck').classList.contains('on'))), 'unticking a step un-ticks the chore');
  check(/7 of 8 steps/.test(await p.$eval(row, (e) => e.textContent)), 'other steps stay ticked');
  // Eli: Wednesday's Sunroom is owed; its steps save on Wednesday
  await visit('checklist.html?kid=eli', 'steps-owed');
  const owed = '.owed [data-steps="2026-11-18|chore"]';
  check(!!(await p.$(owed)), 'owed Sunroom has a steps row');
  await tap(owed);
  const os = await p.$$eval('.owed .stepbtn', (els) => els.map((e) => e.dataset.step));
  check(os.length === 8 && os.every((s) => s.startsWith('2026-11-18|chore|st_sun_')), 'owed steps save on Wednesday');
  for (const s of os) await tap('[data-step="' + s + '"]');
  check(!(await p.$('.owed')), 'Finish first gone once every step is ticked');
  // Eli's Thursday Kitchen has 9 steps
  check(/0 of 9 steps/.test(await p.$eval('[data-steps="2026-11-19|chore"]', (e) => e.textContent)), 'Kitchen shows 0 of 9');
