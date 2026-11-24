  // Leftover game time: on Mon Nov 23 the Parents page asks about Rhett's 20 min left from last week;
  // a parent adds it (real PIN box); this week's chart card shows it; not asked again.
  const PINHASH = '30fb85852fe669dfbf8e52b679886067b7ac636b8478c831607e50cade42329d'; // 2468
  const V = JSON.parse(require('fs').readFileSync('version.json', 'utf8')).v;
  const Lm = await import(require('url').pathToFileURL(process.cwd() + '/lists.js').href + '?v=' + V);
  const full = {}, ls = Lm.lists({ routines: {}, run: {}, isaiah: {} }, 'rhett', new Date(2026, 10, 16));
  [...ls.morning, ...ls.day, ...ls.bed].forEach((it) => { if (it.parts) it.parts.forEach((x) => { full[Lm.partKey(it.key, x)] = true; }); else full[it.key] = it.choices ? it.choices[0] : true; });
  Lm.CHECKS.rhett.forEach((x) => { full[x.key] = true; });
  await p.clock.setFixedTime(new Date(2026, 10, 23, 18, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(([h, f]) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { settings: { pinHash: h },
    routines: { days: { '2026-11-16': { rhett: f } }, game: { rhett: { '2026-11-16': { 1795000000000: 10 } } } } } })); }, [PINHASH, full]);
  await visit('parents.html', 'carry-ask');
  const text = await p.$eval('#carry', (e) => e.textContent);
  notes.push('prompt: ' + text.replace(/\s+/g, ' ').slice(0, 80));
  check(/Rhett/.test(text) && /20 min left from last week/.test(text), 'asks about Rhett\'s 20 min');
  await p.click('[data-carry^="rhett|yes"]');
  await p.waitForSelector('.pindlg input', { timeout: 2000 });
  await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(400);
  const saved = (await db()).charts.routines.carry;
  check(saved && saved.rhett && saved.rhett['2026-11-16'] && saved.rhett['2026-11-16'].minutes === 20 && saved.rhett['2026-11-16'].add === true, 'saved 20 for the week of Nov 16: ' + JSON.stringify(saved));
  check(await p.$eval('#carrycard', (e) => getComputedStyle(e).display === 'none'), 'not asked again');
  await visit('trombone.html', 'carry-chart');
  const card = await p.$eval('#gtbody', (e) => e.textContent.replace(/\s+/g, ' '));
  notes.push('this week: ' + card.match(/Earned.*?Left \S+ \S+/));
  check(/\+20 min carried over/.test(card) && /Left 20 min/.test(card), 'this week shows 20 carried over and 20 left');
  await visit('trombone.html?week=2026-11-16', 'carry-last');
  check(/20 min moved/.test(await p.$eval('#gtbody', (e) => e.textContent)), 'last week shows 20 moved');
