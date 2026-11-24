  // Eli's first unit test, with the REAL course: lessons 1-4 done Mon-Thu Nov 23-26; Friday Nov 27 the Unit 1
  // test shows 16 questions. He answers them all and changes one, but forgets Finish: nothing is scored and the
  // checklist row isn't filled. The next school day (Mon Nov 30) still offers Finish; tapping it fills that day's
  // row and the Parents page shows the score.
  const choresDone = (from, to) => p.evaluate(async ([a, z]) => {
    const L = await import('./lists.js?v=' + window.__V), m = await import('./store.js?v=' + window.__V);
    for (let d = new Date(a + 'T12:00:00'); d <= new Date(z + 'T12:00:00'); d.setDate(d.getDate() + 1)) {
      const k = d.toISOString().slice(0, 10);
      for (const i of L.lists({ routines: { days: {} }, run: {}, isaiah: {}, drive: {} }, 'eli', new Date(d)).day.filter((x) => x.chore)) await m.save('routines', 'days/' + k + '/eli/' + i.key, true);
    }
  }, [from, to]);
  await p.clock.setFixedTime(new Date(2026, 10, 27, 16, 0)); // Fri Nov 27
  await p.goto(B + 'index.html');
  await p.evaluate(async () => {
    const T = await import('./driving-tests.js?v=' + window.__V), answers = {};
    T.FORMS.A.forEach((q) => { answers[q.id] = { base: { ok: true, pick: q.answer, on: '2026-11-21' } }; });
    localStorage.clear();
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} }, 'eli-drive': {
      approved: { w1d1: '2026-11-21', w1d2: '2026-11-21', w1d3: '2026-11-23', w1d4: '2026-11-23' }, watched: { base: '2026-11-21' },
      done: { w1d1: '2026-11-23', w1d2: '2026-11-24', w1d3: '2026-11-25', w1d4: '2026-11-26' }, answers } } }));
  });
  await choresDone('2026-11-16', '2026-11-27');
  await visit('drive.html', 'unitreal-fri');
  const t0 = await p.$eval('#today', (e) => e.textContent), n0 = (await p.$$('#today .dq')).length;
  check(/Unit test/.test(t0) && n0 === 16, 'Friday: the Unit 1 test, 16 questions (' + n0 + ')');
  for (let k = 0; k < 16; k++) { await p.click('#today .dq:not(.answered) .dq-choice'); await p.waitForTimeout(80); }
  await p.waitForTimeout(300);
  check(!!(await p.$('[data-ufinish="w1d5"]')) && !/Right answer|✓ Right/.test(await p.$eval('#today', (e) => e.textContent)), 'all 16 answered: Finish shows, no right/wrong yet');
  const chg = await p.$eval('#today .dq', (q) => { const b = q.querySelector('.dq-choice:not(.picked)'); b.click(); return b.dataset.pick; });
  await p.waitForTimeout(250);
  const [cq, , cp] = chg.split('|');
  check((await db()).charts['eli-drive'].answers[cq].w1d5.pick === Number(cp), 'he changes one answer before Finish');
  await visit('checklist.html?kid=eli', 'unitreal-fri-list');
  check(await p.$eval('.ckbtn[data-key="drive"]', (e) => e.getAttribute('aria-pressed')) !== 'true' && !((await db()).charts['eli-drive'].done || {}).w1d5, 'no Finish: not done, the checklist row isn’t filled');
  // the next school day: Finish is still there; tapping it fills Monday's row
  await p.clock.setFixedTime(new Date(2026, 10, 30, 16, 0));
  await choresDone('2026-11-28', '2026-11-30');
  await visit('drive.html', 'unitreal-mon');
  check(!!(await p.$('[data-ufinish="w1d5"]')), 'Monday: the unit test still offers Finish');
  await p.click('[data-ufinish="w1d5"]'); await p.waitForTimeout(300);
  check(((await db()).charts['eli-drive'].done || {}).w1d5 === '2026-11-30' && /\d+ of 16/.test(await p.$eval('#today', (e) => e.textContent)), 'Finish: done Monday, score shown');
  await visit('checklist.html?kid=eli', 'unitreal-mon-list');
  check(await p.$eval('.ckbtn[data-key="drive"]', (e) => e.getAttribute('aria-pressed')) === 'true', 'Monday’s driving row is filled');
  await visit('parents.html', 'unitreal-parents');
  check(/Unit 1 test: \d+ of 16 right/.test(await p.$eval('#testscores', (e) => e.textContent)), 'Parents page shows the Unit 1 test score');
