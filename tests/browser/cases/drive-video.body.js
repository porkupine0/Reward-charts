  // The lesson video keeps playing while others save: a brother's tick, a parent's approval or Eli's own answers
  // redraw the page, but the video player itself is left in place (not rebuilt, which would restart it).
  await p.goto(B + 'index.html');
  await p.evaluate(async () => { const T = await import('./driving-tests.js?v=' + window.__V), answers = {};
    T.FORMS.A.forEach((q) => { answers[q.id] = { base: { ok: true, pick: q.answer, on: '2026-11-17' } }; }); // baseline done the day before
    localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
      routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } }, '2026-11-18': { eli: { chore: true } } } },
      'eli-drive': { approved: { w1d1: '2026-11-17', w1d2: '2026-11-17' }, answers } } })); });
  await visit('drive.html', 'video-start');
  notes.push('today: ' + (await p.$eval('#today', (e) => e.textContent)).slice(0, 160));
  if (!(await p.$('#today iframe'))) throw new Error('no video; page says: ' + (await p.$eval('#today', (e) => e.textContent)).slice(0, 200));
  const mark = () => p.$eval('#today iframe', (f) => { f.dataset.mark = '1'; });
  const kept = () => p.$eval('#today iframe', (f) => f.dataset.mark === '1').catch(() => false);
  await mark();
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-18/rhett/chore', true); });
  await p.waitForTimeout(300);
  check(await kept(), 'a brother’s tick: the video player is not rebuilt');
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('eli-drive', 'approved/w1d3', '2026-11-18'); });
  await p.waitForTimeout(300);
  check(await kept(), 'a parent approves another lesson: the video player is not rebuilt');
  // he taps "I watched it": the questions show; the video stays (to rewatch) and still isn't rebuilt
  await p.click('#today [data-watched="w1d1"]'); await p.waitForTimeout(300);
  check(!!(await p.$('#today .dq')) && await kept(), 'questions show; the same video player stays');
  await p.click('#today .dq-choice'); await p.waitForTimeout(300);
  check(await kept(), 'after an answer: the same video player');
  check(!(await p.$('#today .dkey')) && !(await p.$('#today .dv-iowa')), 'key points and the Iowa note are hidden once the questions show');
