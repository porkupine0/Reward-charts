  // Tonight, harder cases: a "Not today" saved by another phone while the PIN box is open survives
  // "All good"; a cancelled PIN saves nothing; the late-bedtime and excuse rows render and clear.
  const PINHASH = '30fb85852fe669dfbf8e52b679886067b7ac636b8478c831607e50cade42329d'; // 2468
  await p.clock.setFixedTime(new Date(2026, 10, 18, 23, 58));
  await p.goto(B + 'index.html');
  const lateStart = new Date(2026, 10, 18, 21, 0).getTime(), lateEnd = new Date(2026, 10, 18, 23, 40).getTime();
  await p.evaluate(([h, s, e]) => {
    localStorage.removeItem('rc:unlock');
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: { settings: { pinHash: h }, routines: { days: { '2026-11-18': {
      rhett: { bedTimer: { start: s, end: e } }, eli: { reading: '~skip' } } } } } }));
  }, [PINHASH, lateStart, lateEnd]);
  await visit('parents.html', 'tonight2');
  // cancelled PIN saves nothing
  await tap('[data-allgood="2026-11-18|rhett"]');
  await p.waitForSelector('.pindlg', { timeout: 2000 });
  await p.click('.pindlg [data-pin="cancel"]'); await p.waitForTimeout(200);
  let st = (await db()).charts.routines.days['2026-11-18'].rhett;
  check(st.noYell === undefined && st.firstTime === undefined && st.noLies === undefined, 'cancelled PIN saved nothing');
  // another phone says "Not today" while the PIN box is open
  await tap('[data-allgood="2026-11-18|rhett"]');
  await p.waitForSelector('.pindlg input', { timeout: 2000 });
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-18/rhett/noLies', 'no'); });
  await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(400);
  st = (await db()).charts.routines.days['2026-11-18'].rhett;
  notes.push('rhett after race: ' + JSON.stringify({ noYell: st.noYell, firstTime: st.firstTime, noLies: st.noLies }));
  check(st.noLies === 'no' && st.noYell === true && st.firstTime === true, 'Not today survived; the other two saved from one prompt');
  check((await p.$$('.pindlg')).length === 0, 'only one PIN prompt');
  // late bedtime and excuse rows
  const rows = await p.$eval('#tonight', (e) => e.textContent);
  check(/min late/.test(rows), 'late bedtime row shown');
  check(/Not able to: Reading/.test(rows), 'excuse row shown');
  await p.click('#tonight [data-bedok="2026-11-18|rhett"]'); await p.waitForTimeout(300);
  await p.click('#tonight [data-ex="2026-11-18|eli|reading|ok"]'); await p.waitForTimeout(300);
  const after = await p.$eval('#tonight', (e) => e.textContent);
  check(!/min late/.test(after) && !/Not able to: Reading/.test(after), 'Parent OK and Approve cleared both rows');
  const all = (await db()).charts.routines.days['2026-11-18'];
  check(all.rhett.bedOk === true && all.eli.reading === '~excused', 'saved bedOk and the excuse');
  // stepper: six nights back, then stops
  for (let i = 0; i < 6; i++) await tap('#tnprev');
  notes.push('six nights back: ' + await p.$eval('#tnhead', (e) => e.textContent));
  check(await p.$eval('#tnprev', (e) => e.disabled), 'stops after six nights');
