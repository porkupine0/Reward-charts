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
  // the page took the PIN on the way in, so All good saves at once; it doesn't undo a "Not today" another
  // phone set first
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-18/rhett/noLies', 'no'); });
  await p.waitForTimeout(150);
  await tap('[data-allgood="2026-11-18|rhett"]'); await p.waitForTimeout(300);
  const st = (await db()).charts.routines.days['2026-11-18'].rhett;
  notes.push('rhett: ' + JSON.stringify({ noYell: st.noYell, firstTime: st.firstTime, noLies: st.noLies }));
  check(st.noLies === 'no' && st.noYell === true && st.firstTime === true, 'Not today kept; the other two saved, no second PIN');
  check((await p.$$('.pindlg')).length === 0, 'no PIN prompt inside the page');
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
