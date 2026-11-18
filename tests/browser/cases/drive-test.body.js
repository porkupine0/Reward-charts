  // The baseline knowledge test on the Driving page: locked until chores; Start; answers show only his pick
  // (no right/wrong) while he takes it; a reload keeps his place; the score and topics at the end; stored
  // under the sitting (not as a lesson, so the checklist row and streak don't change); Parents page score.
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
    routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } } } } } })); });
  await visit('parents.html', 'test-parents-none');
  check(/Baseline knowledge test: not started \(best taken before his first lesson\)/.test(await p.$eval('#testscores', (e) => e.textContent)), 'Parents page: not started yet');
  await visit('drive.html', 'test-locked');
  check(await p.$eval('#tests', (e) => e.nextElementSibling.id === 'today'), 'an unfinished test comes before the lesson');
  check(/Baseline knowledge test/.test(await p.$eval('#tests', (e) => e.textContent)), 'the baseline shows');
  check(/Do today’s chores first/.test(await p.$eval('#tests', (e) => e.textContent)) && !(await p.$('[data-tstart]')), 'locked until chores');
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-18/eli/chore', true); });
  await visit('drive.html', 'test-start');
  check(!(await p.$('#tests .dq')), 'questions only after Start');
  await p.click('[data-tstart="base"]'); await p.waitForTimeout(200);
  check((await p.$$('#tests .dq')).length === 25, '25 questions');
  await p.click('#tests .dq:nth-of-type(1) .dq-choice'); await p.waitForTimeout(200);
  const first = await p.$eval('#tests .dq:nth-of-type(1)', (e) => e.textContent);
  check(/Your answer:/.test(first) && !/Right|✓|✗|Iowa Driver/.test(first), 'answered: his pick only, no right/wrong or explanation');
  await visit('drive.html', 'test-reload');
  check((await p.$$('#tests .dq')).length === 25 && /1 of 25 answered/.test(await p.$eval('#tests', (e) => e.textContent)), 'a reload keeps his place');
  for (let k = 0; k < 24; k++) { await p.click('#tests .dq-choice'); await p.waitForTimeout(60); }
  await p.waitForTimeout(300);
  const t = await p.$eval('#tests', (e) => e.textContent);
  check(/of 25/.test(t) && /pass mark/.test(t) && (await p.$$('#tests .dt-topics tr')).length === 8, 'score and 8 topics at the end');
  check(!(await p.$('#tests .dq')), 'no questions or answers shown after finishing');
  check(await p.$eval('#tests', (e) => e.previousElementSibling.id === 'today'), 'a finished test moves below the lesson');
  const dv = (await db()).charts['eli-drive'];
  check(Object.values(dv.answers).every((a) => a.base) && Object.keys(dv.answers).length === 25, 'answers stored under the sitting');
  check(!dv.done, 'not stored as a finished lesson');
  await visit('checklist.html?kid=eli', 'test-checklist');
  check(!(await p.$('.ckbtn[data-key="drive"][aria-pressed="true"]')), 'checklist driving row not filled by the test');
  await visit('parents.html', 'test-parents');
  check(/Baseline knowledge test: \d+ of 25 \(\d+%\)/.test(await p.$eval('#testscores', (e) => e.textContent)) && !(await p.$eval('#testcard', (e) => e.hidden)), 'Parents page shows the score');
  // the weekend: lessons wait for Monday, but the baseline can be taken once the day's chore is done
  for (const [d, name] of [[21, 'Saturday'], [22, 'Sunday']]) {
    await p.clock.setFixedTime(new Date(2026, 10, d, 11, 0));
    await p.goto(B + 'index.html');
    await p.evaluate((today) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
      routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } }, '2026-11-18': { eli: { chore: true } }, '2026-11-19': { eli: { chore: true } }, '2026-11-20': { eli: { chore: true } } } } } })); }, null);
    await visit('drive.html', 'test-' + name + '-locked');
    let wk = await p.$eval('#tests', (e) => (e.hidden ? '' : e.textContent));
    check(/Baseline knowledge test/.test(wk) && /chores first|chore you missed/.test(wk) && !(await p.$('[data-tstart="base"]')), name + ': shown, locked until chores');
    await p.evaluate(async (k) => { const m = await import('./store.js?v=' + window.__V);
      for (const day of ['2026-11-21', k]) await m.save('routines', 'days/' + day + '/eli/chore', true); }, '2026-11-' + d);
    await visit('drive.html', 'test-' + name);
    wk = await p.$eval('#tests', (e) => (e.hidden ? '' : e.textContent));
    notes.push(name + ': ' + wk.slice(0, 120));
    check(!!(await p.$('[data-tstart="base"]')), name + ': chores done, Start shows');
  }
