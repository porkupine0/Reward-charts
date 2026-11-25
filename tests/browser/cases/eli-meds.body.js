  // Eli's Ritalin on weekends: the morning box records the time; the second dose shows when it's due.
  await p.clock.setFixedTime(new Date(2026, 10, 22, 8, 15));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('checklist.html?kid=eli', 'meds');
  const morn = await p.$$eval('#morning .ckbtn', (els) => els.map((e) => e.dataset.key));
  check(morn[0] === 'mMeds', 'Ritalin is first on Sunday morning');
  check(/4 hours after your morning dose/.test(await p.$eval('[data-key="meds2"]', (e) => e.textContent)), 'second dose on the Today list');
  await tap('[data-key="mMeds"]');
  const at = (await db()).charts.routines.days['2026-11-22'].eli.mMedsAt;
  check(!!at, 'time recorded');
  check(/Due at 12:15 PM/.test(await p.$eval('[data-key="meds2"]', (e) => e.textContent)), 'second dose due 4 hours later');
  await p.screenshot({ path: OUT + 'meds.png' });
  await visit('checklist.html?kid=eli&date=2026-11-23', 'meds-mon');
  check(!(await p.$('[data-key="mMeds"]')) && !(await p.$('[data-key="meds2"]')), 'not on school days');
  await visit('checklist.html?kid=eli&date=2026-11-14', 'meds-before');
  check(!(await p.$('[data-key="mMeds"]')), 'not before Nov 21');
  // teeth, then deodorant, every morning from Nov 25 (school day, day off, weekend); not before
  for (const day of ['2026-11-25', '2026-11-28', '2026-11-30']) {
    await visit('checklist.html?kid=eli&date=' + day, 'care-' + day);
    const m = await p.$$eval('#morning .ckbtn', (els) => els.map((e) => e.dataset.key));
    check(m.slice(-2).join() === 'mBrush,mDeo', day + ': teeth then deodorant at the end of the morning (' + m.join() + ')');
  }
  await visit('checklist.html?kid=eli&date=2026-11-24', 'care-before');
  check(!(await p.$('[data-key="mBrush"]')) && !(await p.$('[data-key="mDeo"]')), 'not before Nov 25');
