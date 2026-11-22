  // The baseline knowledge test on the Driving page: locked until chores; Start; answers show only his pick
  // (no right/wrong) while he takes it; a reload keeps his place; the score and topics at the end; stored
  // under the sitting (not as a lesson, so the checklist row and streak don't change); Parents page score.
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
    routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } } } },
    'eli-drive': { approved: { w1d1: '2026-11-17', w1d2: '2026-11-17' } } } })); });
  await visit('kid.html?kid=eli', 'test-hub');
  check(/Baseline test first/.test(await p.$eval('body', (e) => e.textContent)), 'Eli hub card: baseline test first');
  await visit('parents.html', 'test-parents-none');
  check(/Baseline knowledge test: not started \(best taken before his first lesson\)/.test(await p.$eval('#testscores', (e) => e.textContent)), 'Parents page: not started yet');
  await visit('drive.html', 'test-locked');
  check(await p.$eval('#tests', (e) => e.nextElementSibling.id === 'today'), 'an unfinished test comes before the lesson');
  check(/Baseline knowledge test/.test(await p.$eval('#tests', (e) => e.textContent)), 'the baseline shows');
  check(/Do today’s chores first/.test(await p.$eval('#tests', (e) => e.textContent)) && !(await p.$('[data-tstart]')), 'locked until chores');
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-18/eli/chore', true); });
  await visit('drive.html', 'test-start');
  check(!(await p.$('#tests .dq')), 'questions only after Start');
  check(/First, take the baseline knowledge test above/.test(await p.$eval('#today', (e) => e.textContent)) && !(await p.$('[data-watched]')), 'an approved lesson waits for the baseline');
  await p.click('[data-tstart="base"]'); await p.waitForTimeout(200);
  check((await p.$$('#tests .dq')).length === 25, '25 questions');
  // at phone width, answering (the longest choice) must not move anything below it
  await p.setViewportSize({ width: 320, height: 800 });
  await p.waitForTimeout(200);
  const tops = async () => p.$$eval('#tests .dq', (els) => els.map((e) => Math.round(e.getBoundingClientRect().top + window.scrollY)));
  const before = await tops();
  await p.$eval('#tests .dq:nth-of-type(1)', (q) => { const b = [...q.querySelectorAll('.dq-choice')].sort((x, y) => y.textContent.length - x.textContent.length)[0]; b.click(); });
  await p.waitForTimeout(250);
  const after = await tops();
  check(JSON.stringify(before) === JSON.stringify(after), 'phone width: nothing moves after an answer (' + before.slice(0, 3) + ' / ' + after.slice(0, 3) + ')');
  await p.setViewportSize({ width: 375, height: 812 });
  const first = await p.$eval('#tests .dq:nth-of-type(1)', (e) => e.textContent);
  check(!/Right|✓|✗|Iowa Driver/.test(first) && /^Your answer: /.test(await p.$eval('#tests .dq:nth-of-type(1) .picked', (e) => e.getAttribute('aria-label'))), 'answered: his pick only (marked, labelled for screen readers), no right/wrong or explanation');
  check((await p.$$('#tests .dq:nth-of-type(1) .dq-choice')).length === 4 && (await p.$$('#tests .dq:nth-of-type(1) .dq-choice.picked')).length === 1, 'answered: the 4 choices stay, his pick marked');
  // a slip: he taps a different choice, and that becomes his answer (still no right/wrong shown)
  const q1 = await p.$eval('#tests .dq:nth-of-type(1) .picked', (e) => e.dataset.tpick);
  const other = await p.$eval('#tests .dq:nth-of-type(1)', (q) => { const b = q.querySelector('.dq-choice:not(.picked)'); b.click(); return b.dataset.tpick; });
  await p.waitForTimeout(250);
  const [qid1, , pick2] = other.split('|');
  check((await db()).charts['eli-drive'].answers[qid1].base.pick === Number(pick2) && (await p.$eval('#tests .dq:nth-of-type(1) .picked', (e) => e.dataset.tpick)) === other && q1 !== other, 'a different tap changes his answer (stored), no right/wrong shown');
  check(!/Right|✓|✗/.test(await p.$eval('#tests .dq:nth-of-type(1)', (e) => e.textContent)), 'still no right/wrong after a change');
  await visit('drive.html', 'test-reload');
  check((await p.$$('#tests .dq')).length === 25 && /1 of 25 answered/.test(await p.$eval('#tests', (e) => e.textContent)), 'a reload keeps his place');
  check((await p.$eval('#tests .dq:nth-of-type(1) .picked', (e) => e.dataset.tpick)) === other, 'a reload keeps his changed answer');
  for (let k = 0; k < 24; k++) { await p.click('#tests .dq:not(.answered) .dq-choice'); await p.waitForTimeout(60); }
  await p.waitForTimeout(300);
  // all 25 answered: not finished until he taps Finish (he can still change answers; no score yet)
  check(!!(await p.$('[data-tfinish="base"]')) && !/pass mark/.test(await p.$eval('#tests', (e) => e.textContent)) && !(await p.$('#today [data-watched="w1d1"]')), 'all answered: Finish shows; no score yet; the lesson still waits');
  await p.click('[data-tfinish="base"]'); await p.waitForTimeout(300);
  const t = await p.$eval('#tests', (e) => e.textContent);
  check(/of 25/.test(t) && /pass mark/.test(t) && (await p.$$('#tests .dt-topics tr')).length === 8, 'score and 8 topics at the end');
  check(!(await p.$('#tests .dq')), 'no questions or answers shown after finishing (until he asks)');
  await p.click('[data-ans="base|1"]'); await p.waitForTimeout(200);
  const ansT = await p.$eval('#tests', (e) => e.textContent);
  check((await p.$$('#tests .dq')).length === 25 && (await p.$$('#tests .dq.ok, #tests .dq.miss')).length === 25 && /Right/.test(ansT) && /Iowa Driver.s Manual p\.\d+/.test(ansT) && /Every answer · \d+ missed/.test(ansT), 'See every answer: all 25 with his pick, the right answer, why and the page');
  await p.click('[data-ans="base|0"]'); await p.waitForTimeout(200);
  check(!(await p.$('#tests .dq')), 'Hide the answers');
  check(await p.$eval('#tests', (e) => e.previousElementSibling.id === 'today'), 'a finished test moves below the lesson');
  check(!!(await p.$('#today [data-watched="w1d1"]')), 'baseline done: lesson 1 opens');
  check((await p.$$('#today .dkey li')).length === 3 && await p.$eval('#today .dkey', (e) => !!(e.compareDocumentPosition(document.querySelector('#today .dv')) & 4)) && /\(Manual p\.47\)/.test(await p.$eval('#today .dkey', (e) => e.textContent)), 'lesson 1: 3 key points with manual pages, above the video');
  await p.click('#today [data-watched="w1d1"]'); await p.waitForTimeout(200);
  check(!!(await p.$('#today .dq')) && !(await p.$('#today .dkey')), 'once the questions show, the key points are hidden');
  check(!(await p.$('#today .dv-iowa')), 'once the questions show, the In Iowa note is hidden too');
  const dv = (await db()).charts['eli-drive'];
  check(Object.values(dv.answers).filter((a) => a.base).length === 25, 'answers stored under the sitting');
  check(!dv.done && (dv.watched || {}).base === '2026-11-18', 'not stored as a finished lesson; Finish stored as the day');
  await visit('checklist.html?kid=eli', 'test-checklist');
  check(!(await p.$('.ckbtn[data-key="drive"][aria-pressed="true"]')), 'checklist driving row not filled by the test');
  await visit('parents.html', 'test-parents');
  check(/Baseline knowledge test: \d+ of 25 \(\d+%\)/.test(await p.$eval('#testscores', (e) => e.textContent)) && !(await p.$eval('#testcard', (e) => e.hidden)), 'Parents page shows the score');
  check(await p.$eval('#testscores a[href="drive.html#ans-base"]', (a) => /His answers/.test(a.textContent)).catch(() => false), 'Parents page links to his answers');
  await p.click('#testscores a[href="drive.html#ans-base"]'); await p.waitForTimeout(800);
  check((await p.$$('#tests .dq')).length === 25, 'the link opens the Driving page with every answer shown');
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
