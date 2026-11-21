  // The Driving page left open overnight (or suspended as an app): shown again on a new day, it redraws for that
  // day; shown again on the same day, it doesn't redraw (nothing moves under him mid-test).
  await p.clock.setFixedTime(new Date(2026, 10, 21, 20, 0)); // Sat Nov 21, evening
  await p.goto(B + 'index.html');
  await p.evaluate(async () => { const T = await import('./driving-tests.js?v=' + window.__V), answers = {};
    T.FORMS.A.forEach((q) => { answers[q.id] = { base: { ok: true, pick: q.answer, on: '2026-11-20' } }; }); // baseline done Nov 20
    localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
      routines: { days: { '2026-11-23': { eli: { chore: true } } } },
      'eli-drive': { approved: { w1d1: '2026-11-17', w1d2: '2026-11-17' }, answers, watched: { base: '2026-11-20' } } } })); });
  await visit('drive.html', 'wake-sat');
  const sat = await p.$eval('#today', (e) => e.textContent);
  await p.$eval('#today', (e) => e.insertAdjacentHTML('beforeend', '<i id="mark"></i>'));
  await p.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); document.dispatchEvent(new Event('visibilitychange')); });
  await p.waitForTimeout(200);
  check(!!(await p.$('#today #mark')), 'same day: shown again, nothing redrawn');
  await p.clock.setFixedTime(new Date(2026, 10, 23, 16, 0)); // Mon Nov 23, after school
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await p.waitForTimeout(300);
  const mon = await p.$eval('#today', (e) => e.textContent);
  notes.push('Sat: ' + sat.slice(0, 90) + ' / Mon: ' + mon.slice(0, 90));
  check(!(await p.$('#today #mark')) && /Look ahead: scanning the road/.test(mon) && !/See you Monday/.test(mon), 'a new day: the page redraws with Monday’s lesson');
  // Parents page "Weakest" agrees with the Driving page: a missed one-question topic (Right of way) is named.
  await p.goto(B + 'index.html');
  await p.evaluate(async () => { const T = await import('./driving-tests.js?v=' + window.__V), answers = {};
    T.FORMS.A.forEach((q) => { const ok = q.topic !== 'Right of way'; answers[q.id] = { base: { ok, pick: ok ? q.answer : (q.answer + 1) % 4, on: '2026-11-20' } }; });
    localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { 'eli-drive': { approved: { w1d1: '2026-11-17' }, answers, watched: { base: '2026-11-20' } } } })); });
  await visit('parents.html', 'wake-parents-weakest');
  const ts = await p.$eval('#testscores', (e) => e.textContent);
  notes.push('Parents: ' + ts.slice(0, 160));
  check(/Weakest: Right of way 0\/1/.test(ts), 'Parents page names a missed one-question topic as weakest, like the Driving page');
