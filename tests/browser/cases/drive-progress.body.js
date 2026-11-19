  // Progress test 1 (Form B): hidden until the Unit 2 test is finished, then shown first (unfinished);
  // a sign draws in a test question; nothing moves at phone width after answering; Parents shows both scores.
  await p.goto(B + 'index.html');
  const seed = (unit2done) => p.evaluate(async (u2) => {
    const T = await import('./driving-tests.js?v=' + window.__V);
    const answers = {};
    T.FORMS.A.forEach((q, i) => { answers[q.id] = { base: { ok: i % 3 !== 0, pick: 0, on: '2026-11-17', n: i + 1 } }; });
    const ids = ['w1d1', 'w1d2', 'w1d3', 'w1d4', 'w1d5', 'w2d1', 'w2d2', 'w2d3', 'w2d4', 'w2d5'], done = {};
    ids.forEach((id, i) => { if (u2 || id !== 'w2d5') done[id] = '2026-11-' + String(3 + i).padStart(2, '0'); });
    localStorage.clear();
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
      routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } }, '2026-11-18': { eli: { chore: true } } } },
      'eli-drive': { done, answers } } }));
  }, unit2done);
  await seed(false);
  await visit('drive.html', 'progress-hidden');
  check(!/Progress test 1/.test(await p.$eval('#tests', (e) => e.textContent)), 'before the Unit 2 test: no progress test');
  await seed(true);
  await visit('drive.html', 'progress-open');
  const h2s = await p.$$eval('#tests h2', (els) => els.map((e) => e.textContent));
  check(h2s[0] === 'Progress test 1' && h2s.includes('Baseline knowledge test'), 'after the Unit 2 test: Progress test 1, shown first (' + h2s.join(', ') + ')');
  await p.click('[data-tstart="p1"]'); await p.waitForTimeout(200);
  check((await p.$$('#tests .dq')).length === 25 && !!(await p.$('#tests .dq svg.dsign')), '25 questions; a sign drawn in a test question');
  await p.setViewportSize({ width: 320, height: 800 }); await p.waitForTimeout(200);
  const tops = async () => p.$$eval('#tests .dq', (els) => els.map((e) => Math.round(e.getBoundingClientRect().top + window.scrollY)));
  const before = await tops();
  await p.$eval('#tests .dq:nth-of-type(1)', (q) => { const b = [...q.querySelectorAll('.dq-choice')].sort((x, y) => y.textContent.length - x.textContent.length)[0]; b.click(); });
  await p.waitForTimeout(250);
  check(JSON.stringify(before) === JSON.stringify(await tops()), 'phone width: nothing moves after answering the sign question');
  await p.setViewportSize({ width: 375, height: 812 });
  for (let k = 0; k < 24; k++) { await p.click('#tests .dq-choice:not([disabled])'); await p.waitForTimeout(60); }
  await p.waitForTimeout(300);
  await visit('parents.html', 'progress-parents');
  const t = await p.$eval('#testscores', (e) => e.textContent);
  check(/Baseline knowledge test: \d+ of 25/.test(t) && /Progress test 1: \d+ of 25/.test(t), 'Parents page shows both scores');
