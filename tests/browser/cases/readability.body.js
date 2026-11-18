  // Readability and touch: text contrast (light and dark, fades on parent elements blended in),
  // tap targets on the kids' pages, and chart cell labels that fit.
  const STRICT = true;
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('rc:unlock', JSON.stringify({ always: true }));
    // a busy Wednesday for Rhett: ticked items, a chip on, candy given, a pending excuse, a late bedtime
    const late = { start: new Date(2026, 10, 18, 20, 0).getTime(), end: new Date(2026, 10, 18, 21, 30).getTime() };
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-17': { rhett: { chore: true } },
      '2026-11-18': { rhett: { putaway: true, afterSnack: 'Banana', clothes: true, mCandyGiven: true, homework: '~skip', reading: '~excused', bedTimer: late, noYell: true, firstTime: true, noLies: 'no' } } },
      game: { rhett: { '2026-11-16': { 1795000000000: 15 } } } },
      // Isaiah: in bed on time Tuesday, candy given Wednesday (the "Candy enjoyed" card); an old Ball Master challenge (the "ended" banner)
      isaiah: { start: '2026-10-05' } } }));
    const db = JSON.parse(sessionStorage.getItem('mockdb'));
    db.charts.routines.days['2026-11-17'].isaiah = { bedTimer: { start: new Date(2026, 10, 17, 19, 30).getTime(), end: new Date(2026, 10, 17, 19, 50).getTime() } };
    db.charts.routines.days['2026-11-18'].isaiah = { mCandyGiven: true };
    sessionStorage.setItem('mockdb', JSON.stringify(db)); });
  const measure = () => p.evaluate(() => {
    const parse = (c) => {
      let m = c.match(/rgba?\(([^)]+)\)/);
      if (m) { const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] === undefined ? 1 : v[3]]; }
      m = c.match(/color\(srgb ([^)]+)\)/); // what color-mix() computes to
      if (m) { const v = m[1].split(/[ /]+/).filter(Boolean).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] === undefined ? 1 : v[3]]; }
      return null;
    };
    const lum = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const mix = (a, b, t) => [0, 1, 2].map((i) => a[i] * t + b[i] * (1 - t));
    const bgOf = (el) => {
      const layers = [];
      for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } }
      let out = parse(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1];
      for (let i = layers.length - 1; i >= 0; i--) out = [...mix(layers[i], out, layers[i][3]), 1];
      return out;
    };
    const fade = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };
    const bad = []; let worst = 99, n = 0;
    document.querySelectorAll('body *').forEach((el) => {
      if (!el.childNodes.length || ![...el.childNodes].some((t) => t.nodeType === 3 && t.textContent.trim())) return;
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.visibility === 'hidden' || el.closest('[hidden],dialog:not([open]),:disabled,.treat-icon')) return; // disabled controls and emoji are exempt
      const bg = bgOf(el), fg0 = parse(cs.color); if (!fg0) return;
      const fg = mix(fg0, bg, fg0[3] * fade(el));
      const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize), boldish = Number(cs.fontWeight) >= 700, large = size >= 24 || (boldish && size >= 18.66);
      const need = large ? 3 : 4.5; n++;
      worst = Math.min(worst, ratio);
      if (ratio < need) bad.push((el.className || el.tagName).toString().slice(0, 30) + ' "' + el.textContent.trim().slice(0, 18) + '" ' + ratio.toFixed(2));
    });
    return { n, worst: +worst.toFixed(2), bad: [...new Set(bad)].slice(0, 12) };
  });
  const pages = ['checklist.html?kid=rhett&date=2026-11-19', 'checklist.html?kid=rhett&date=2026-11-18', 'checklist.html?kid=eli&date=2026-11-19', 'checklist.html?kid=isaiah', 'checklist.html?kid=isaiah&date=2026-11-18', 'zay.html', 'trombone.html', 'eli.html?week=2026-11-23',
    'kid.html?kid=isaiah', 'index.html', 'parents.html', 'run.html', 'trials.html', 'isaiah.html', 'history.html?kid=rhett', 'stats.html', 'settings.html'];
  for (const scheme of ['light', 'dark']) {
    await p.emulateMedia({ colorScheme: scheme });
    for (const u of pages) {
      await visit(u, 'rd-' + scheme + '-' + u.split(/[.?]/)[0]);
      const m = await measure();
      if (/isaiah&date=2026-11-18/.test(u)) check(!!(await p.$('.treat.given')), 'the candy-given card is on the page being measured');
      if (/^isaiah\.html/.test(u)) check(!!(await p.$('#ended strong')), 'the challenge-ended banner is on the page being measured');
      notes.push(scheme + ' ' + u + ': worst ' + m.worst + (m.bad.length ? ' · below: ' + m.bad.join(' | ') : ''));
      if (STRICT) check(!m.bad.length, scheme + ' ' + u + ' text below contrast: ' + m.bad.join(' | '));
    }
  }
  await p.emulateMedia({ colorScheme: 'dark' });
  await visit('checklist.html?kid=rhett&date=2026-11-19', 'rd-dark-rhett-locked');
  await p.emulateMedia({ colorScheme: 'light' });

  // tap targets: the hit area (what a finger lands on) of small links and buttons on the kids' pages
  const hits = async (sel) => p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().height).slice(0, 6).map((e) => {
    e.scrollIntoView({ block: 'center' });
    const r = e.getBoundingClientRect(), x = r.left + r.width / 2, cy = r.top + r.height / 2;
    let up = 0, down = 0;
    while (up < 40 && (() => { const t = document.elementFromPoint(x, cy - up - 1); return t && (t === e || e.contains(t)); })()) up++;
    while (down < 40 && (() => { const t = document.elementFromPoint(x, cy + down + 1); return t && (t === e || e.contains(t)); })()) down++;
    const center = document.elementFromPoint(x, cy);
    return { h: up + down + 1, ownCenter: !!center && (center === e || e.contains(center)) };
  }), sel);
  const targets = [['checklist.html?kid=rhett&date=2026-11-19', '#day .excuse-ask'], ['checklist.html?kid=isaiah', '.cklink'], ['trombone.html', '[data-gtundo]'], ['trombone.html', 'label.given'], ['checklist.html?kid=isaiah', '[data-excuse="mark"]']];
  for (const [u, sel] of targets) {
    await visit(u, 'tap');
    await p.evaluate(() => window.scrollTo(0, 0));
    const hs = await hits(sel);
    const min = hs.length ? Math.min(...hs.map((h) => h.h)) : null;
    notes.push('tap ' + sel + ' on ' + u.split('?')[0] + ': ' + (min === null ? 'none shown' : min + 'px'));
    if (STRICT && min !== null) check(min >= 44 && hs.every((h) => h.ownCenter), sel + ' hit area ' + min + 'px');
  }
  await visit('checklist.html?kid=isaiah', 'height');
  notes.push('Isaiah checklist page height: ' + await p.evaluate(() => document.documentElement.scrollHeight));

  // chart cell labels fit at 375 and 320, all three charts, Thanksgiving week too
  // under this machine's font and under DejaVu Sans (the wider fallback CI machines use)
  // Strict check in Liberation Sans (Arial's widths, like a phone's own font; installed on every test machine).
  // DejaVu Sans is wider than anything a phone shows: there only the page must fit.
  for (const [w, font] of [[375, 'Liberation Sans'], [320, 'Liberation Sans'], [375, 'DejaVu Sans'], [320, 'DejaVu Sans']]) {
    await p.setViewportSize({ width: w, height: 800 });
    for (const u of ['eli.html?week=2026-11-23', 'eli.html', 'trombone.html', 'zay.html']) {
      await visit(u, 'cells');
      if (font) { await p.addStyleTag({ content: '* { font-family: "' + font + '" !important; }' }); await p.waitForTimeout(100); }
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(ov <= 1, (font || 'default font') + ' ' + w + ' ' + u + ' page wider than the screen by ' + ov + 'px');
      // the real fonts: labels fit at 8px or more; the wider CI font: only that the page fits (checked above)
      const over = font === 'DejaVu Sans' ? [] : await p.$$eval('.cell span', (els) => els.filter((s) => s.scrollWidth > s.parentElement.clientWidth + 0.5 || parseFloat(getComputedStyle(s).fontSize) < 8).map((s) => s.textContent + ' ' + getComputedStyle(s).fontSize));
      notes.push('cells ' + w + (font ? ' ' + font : '') + ' ' + u + ': ' + (over.length ? 'too wide: ' + over.join(',') : 'fit'));
      if (STRICT) check(!over.length, 'cell labels too wide at ' + w + ' on ' + u + ': ' + over.join(','));
    }
  }
  await p.setViewportSize({ width: 375, height: 812 });
