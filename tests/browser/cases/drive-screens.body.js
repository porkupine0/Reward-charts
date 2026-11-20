  // Day one with the REAL course and tests (lessons 1-2 approved Nov 18, nothing done): the states Eli sees,
  // measured for text contrast in light and dark, and screenshots at 320 and 375 px for a person to look at.
  await p.goto(B + 'index.html');
  const seed = (state) => p.evaluate(async (st) => {
    const T = await import('./driving-tests.js?v=' + window.__V), C = await import('./driving-course.js?v=' + window.__V);
    const base = {}; T.FORMS.A.forEach((q, i) => { base[q.id] = { base: { ok: i % 4 !== 1, pick: i % 4 !== 1 ? q.answer : (q.answer + 1) % 4, on: '2026-11-18', n: i + 1 } }; });
    const answers = {}, drive = { approved: { w1d1: '2026-11-18', w1d2: '2026-11-18' } };
    const addBase = (k) => { Object.entries(base).slice(0, k).forEach(([id, a]) => { answers[id] = a; }); };
    if (st === 'midtest') addBase(10);
    if (['score', 'key', 'lesson', 'done'].includes(st)) addBase(25);
    const l1 = C.LESSONS.find((l) => l.id === 'w1d1');
    if (['lesson', 'done'].includes(st)) drive.watched = { w1d1: '2026-11-18' };
    if (st === 'lesson') { answers[l1.questions[0].id] = { w1d1: { ok: true, pick: l1.questions[0].answer, on: '2026-11-18', n: 1 } }; answers[l1.questions[1].id] = { w1d1: { ok: false, pick: (l1.questions[1].answer + 1) % 4, on: '2026-11-18', n: 2 } }; }
    if (st === 'done') { l1.questions.slice(0, 5).forEach((q, i) => { answers[q.id] = { w1d1: { ok: i !== 1, pick: i !== 1 ? q.answer : (q.answer + 1) % 4, on: '2026-11-18', n: i + 1 } }; }); drive.done = { w1d1: '2026-11-18' }; }
    drive.answers = answers;
    localStorage.clear();
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } }, '2026-11-18': { eli: { chore: true } } } }, 'eli-drive': drive } }));
  }, state);
  const contrast = () => p.evaluate(() => {
    const parse = (c) => { let m = c.match(/rgba?\(([^)]+)\)/); if (m) { const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] === undefined ? 1 : v[3]]; }
      m = c.match(/color\(srgb ([^)]+)\)/); if (m) { const v = m[1].split(/[ /]+/).filter(Boolean).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] === undefined ? 1 : v[3]]; } return null; };
    const lum = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const mix = (a, b, t) => [0, 1, 2].map((i) => a[i] * t + b[i] * (1 - t));
    const bgOf = (el) => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } }
      let out = parse(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1]; for (let i = layers.length - 1; i >= 0; i--) out = [...mix(layers[i], out, layers[i][3]), 1]; return out; };
    const bad = [];
    document.querySelectorAll('#today *, #tests *').forEach((el) => {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return;
      let op = 1; for (let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
      const bg = bgOf(el), fg0 = parse(cs.color); const fg = mix(fg0, bg, fg0[3] * op);
      const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x), r = (a + 0.05) / (b + 0.05);
      const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      if (r < (big ? 3 : 4.5)) bad.push(el.textContent.trim().slice(0, 30) + ' ' + r.toFixed(2));
    });
    return bad;
  });
  for (const st of ['start', 'midtest', 'score', 'key', 'lesson', 'done']) {
    for (const scheme of ['light', 'dark']) {
      await p.emulateMedia({ colorScheme: scheme });
      await seed(st);
      await visit('drive.html', 'scr-' + st + '-' + scheme);
      if (st === 'start' && await p.$('[data-tstart="base"]')) { await p.click('[data-tstart="base"]'); await p.waitForTimeout(200); }
      if (st === 'midtest') { await p.click('[data-tstart="base"]').catch(() => {}); await p.waitForTimeout(200); }
      const bad = await contrast();
      notes.push(st + ' ' + scheme + ': ' + (bad.length ? 'below contrast: ' + bad.join(' | ') : 'ok'));
      check(!bad.length, st + ' ' + scheme + ' text below contrast: ' + bad.join(' | '));
      for (const w of [320, 375]) { await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(150); await p.screenshot({ path: OUT + 'scr-' + st + '-' + scheme + '-' + w + '.png', fullPage: true }); }
      await p.setViewportSize({ width: 375, height: 812 });
    }
  }
  await p.emulateMedia({ colorScheme: 'light' });
  // what each state shows
  await seed('key'); await visit('drive.html', 'scr-key-check');
  check(!!(await p.$('#today .dkey li')) && /Look ahead/.test(await p.$eval('#today', (e) => e.textContent)), 'key: lesson 1 open with its key points after the baseline');
  await seed('done'); await visit('drive.html', 'scr-done-check');
  check(/Lesson done for today/.test(await p.$eval('#today', (e) => e.textContent)), 'done: lesson 1 finished');
