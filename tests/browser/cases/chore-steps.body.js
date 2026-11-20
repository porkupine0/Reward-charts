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
  check(os.length === 6 && os.every((s) => s.startsWith('2026-11-18|chore|st_')), 'owed steps save on Wednesday');
  for (const s of os) await tap('[data-step="' + s + '"]');
  check(!(await p.$('.owed')), 'Finish first gone once every step is ticked');
  // Eli's Thursday Kitchen has 8 steps; the last two tapped fast still tick the chore
  const kr = '[data-steps="2026-11-19|chore"]';
  check(/0 of 8 steps/.test(await p.$eval(kr, (e) => e.textContent)), 'Kitchen shows 0 of 8');
  await tap(kr);
  await p.screenshot({ path: OUT + 'steps-kitchen.png', fullPage: false });
  const ks = await p.$$eval('#day .stepbtn', (els) => els.map((e) => e.dataset.step));
  for (const s of ks.slice(0, 6)) await tap('[data-step="' + s + '"]');
  await p.click('[data-step="' + ks[6] + '"]'); await p.click('[data-step="' + ks[7] + '"]'); await p.waitForTimeout(300);
  check(await p.$eval(kr, (e) => e.closest('.ck').classList.contains('on')), 'fast last two taps tick the chore');
  // Waiting for an excuse: the owed chore keeps its steps (no one-tap tick)
  await p.evaluate(() => { const d = JSON.parse(sessionStorage.getItem('mockdb')); d.charts.routines.days['2026-11-18'] = { eli: {} }; sessionStorage.setItem('mockdb', JSON.stringify(d)); });
  await visit('checklist.html?kid=eli', 'steps-owed-wait');
  await tap('.owed [data-owedex^="mark|"]');
  check(!!(await p.$('.owed [data-steps="2026-11-18|chore"]')) && !(await p.$('.owed [data-owed]')), 'waiting chore keeps its steps');
  await tap('.owed [data-steps="2026-11-18|chore"]');
  await p.screenshot({ path: OUT + 'steps-owed-open.png', fullPage: false });
  await p.emulateMedia({ colorScheme: 'dark' });
  await p.screenshot({ path: OUT + 'steps-dark.png', fullPage: false });
  await p.emulateMedia({ colorScheme: 'light' });
  // A parent edits the lists on Settings: Living Room gets 2 steps, Sunroom is blanked (one box again)
  await visit('settings.html', 'steps-settings');
  const lr = '[data-list="Living Room"]', sr = '[data-list="Sunroom"]';
  check(!!(await p.$(lr)) && !!(await p.$('[data-list="Dining/Front Room"]')) && !!(await p.$('[data-list="Bathrooms"]')), 'a box for each chore name');
  await p.click('.slist:has(' + lr + ') summary');
  await p.fill(lr, 'Pick up: everything\nVacuum'); await p.dispatchEvent(lr, 'input');
  await p.click('.slist:has(' + sr + ') summary');
  await p.fill(sr, ''); await p.dispatchEvent(sr, 'input');
  await p.screenshot({ path: OUT + 'steps-settings.png', fullPage: false });
  await p.click('#save'); await p.waitForTimeout(500);
  const saved = (await db()).charts.config.choreSteps;
  notes.push('saved lists: ' + JSON.stringify(saved));
  check(Array.isArray(saved) && saved.length === 2, 'only the two changed lists are saved');
  await visit('checklist.html?kid=rhett', 'steps-edited');
  check(/2 steps/.test(await p.$eval('[data-steps="2026-11-19|chore"]', (e) => e.textContent)), 'Rhett sees the 2-step Living Room');
  await visit('checklist.html?kid=rhett&date=2026-11-16', 'steps-blanked');
  check(!(await p.$('[data-steps="2026-11-16|chore2"]')) && !!(await p.$('.ckbtn[data-key="chore2"]')), 'blanked Sunroom is a single box');
  // A step removed after the others were ticked: tapping the row ticks the chore
  await visit('checklist.html?kid=rhett', 'steps-stuck');
  await tap('[data-steps="2026-11-19|chore"]');
  await tap('.stepbtn');
  await visit('settings.html', 'steps-settings2');
  await p.click('.slist:has(' + lr + ') summary');
  await p.fill(lr, 'Pick up: everything'); await p.dispatchEvent(lr, 'input');
  await p.click('#save'); await p.waitForTimeout(500);
  check(/1 step\b/.test(await p.$eval('.slist:has(' + lr + ') summary', (e) => e.textContent)), 'step count redraws after Save');
  await visit('checklist.html?kid=rhett', 'steps-stuck2');
  await tap('[data-steps="2026-11-19|chore"]');
  check(await p.$eval('[data-steps="2026-11-19|chore"]', (e) => e.closest('.ck').classList.contains('on')), 'row tap ticks a chore whose steps are all ticked');
  // Isaiah's Tuesday closet chore opens to its list
  await visit('checklist.html?kid=isaiah&date=2026-11-17', 'steps-closet');
  check(!!(await p.$('[data-steps="2026-11-17|chore"]')), 'Isaiah’s closet chore has a steps row');
  // Isaiah's Thursday stairs chore opens to its list
  await visit('checklist.html?kid=isaiah&date=2026-11-19', 'steps-stairs');
  check(!!(await p.$('[data-steps="2026-11-19|chore"]')), 'Isaiah’s stairs chore has a steps row');
  // Isaiah's Monday trash chore (his second chore) opens to its 8 stops
  await visit('checklist.html?kid=isaiah&date=2026-11-16', 'steps-trash');
  check(/8 steps/.test(await p.$eval('[data-steps="2026-11-16|chore2"]', (e) => e.textContent).catch(() => '')), 'Isaiah’s trash chore has 8 steps');
  // Rhett's Saturday laundry + room chore opens to the shared bedroom list
  await visit('checklist.html?kid=rhett&date=2026-11-21', 'steps-room');
  check(/7 steps/.test(await p.$eval('[data-steps="2026-11-21|chore"]', (e) => e.textContent).catch(() => '')), 'Rhett’s room chore has 7 steps');
