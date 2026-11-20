  // The driving lesson counts on every page that shows Eli's full days: approved earlier, due Tuesday,
  // viewed Wednesday. Undone: Tuesday isn't a full day on History or Parents. Done: both count it.
  // A lesson due today shows under "Right now" on Home and Parents.
  const FIX = `const q = (l, k) => ({ id: l + 'q' + k, q: 'Q?', choices: ['A', 'B'], answer: k % 2, why: 'W.', ref: "Iowa Driver's Manual p.1" });
export const LESSONS = [1, 2, 3].map((n) => ({ id: 'F' + n, title: 'Fixture lesson ' + n, videos: [{ yt: 'AAAAAAAAAAA', title: 'V', channel: 'C', len: '5:00' }], questions: [1, 2, 3, 4, 5].map((k) => q('F' + n, k)) }));`;
  const course = (r) => r.fulfill({ contentType: 'text/javascript', body: FIX });
  await ctx.route(/driving-course\.js/, course);
  const noTests = (r) => r.fulfill({ contentType: 'text/javascript', body: 'export const FORMS = {}; export const SITTINGS = []; export const PASS = 0.8; export const TOPICS = []; export const BLUEPRINT = {};' });
  await ctx.route(/driving-tests\.js/, noTests);
  const V = JSON.parse(require('fs').readFileSync('version.json', 'utf8')).v;
  const Lm = await import(require('url').pathToFileURL(process.cwd() + '/lists.js').href + '?v=' + V);
  // Eli's Tuesday fully done except the driving lesson (built from the app's own list, without the lesson)
  const tue = {}, ls = Lm.lists({ routines: {}, run: {}, isaiah: {} }, 'eli', new Date(2026, 10, 17));
  [...ls.morning, ...ls.day, ...ls.bed].forEach((it) => { if (it.parts) it.parts.forEach((x) => { tue[Lm.partKey(it.key, x)] = true; }); else tue[it.key] = it.choices ? it.choices[0] : true; });
  Lm.CHECKS.eli.forEach((x) => { tue[x.key] = true; });
  const run = { days: { '2026-11-17': { items: { run: true, strA: true } } } };
  const seed = (drive) => p.evaluate(([t, r, dv]) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-17': { eli: t } } }, 'eli-run': r, 'eli-drive': dv } })); }, [tue, run, drive]);
  const tueFull = async () => { await visit('history.html?kid=eli', 'dp-history'); return p.$eval('a.calday[href$="date=2026-11-17"]', (e) => e.className); };
  const parentsFull = async () => { await visit('parents.html', 'dp-parents'); return (await p.$eval('#summary', (e) => e.textContent)).match(/Eli(\d+)\/3 full checklist days/); };
  await p.goto(B + 'index.html');
  // undone
  await seed({ approved: { F1: '2026-11-10', F2: '2026-11-10' } });
  const hUndone = await tueFull(), pUndone = await parentsFull();
  // done on Tuesday
  await seed({ approved: { F1: '2026-11-10', F2: '2026-11-10' }, done: { F1: '2026-11-17' }, watched: { F1: '2026-11-17' } });
  const hDone = await tueFull(), pDone = await parentsFull();
  notes.push('History Tue: undone "' + hUndone + '" / done "' + hDone + '"; Parents Eli full days: undone ' + (pUndone && pUndone[1]) + ' / done ' + (pDone && pDone[1]));
  check(!/\bfull\b/.test(hUndone) && /\bfull\b/.test(hDone), 'History: Tuesday is a full day only with the lesson done');
  check(pUndone && pDone && Number(pDone[1]) === Number(pUndone[1]) + 1, 'Parents: the lesson decides whether Tuesday counts');
  // due today (Wednesday): "Right now" on Home and Parents mentions it
  await p.clock.setFixedTime(new Date(2026, 10, 18, 16, 30));
  // Wednesday: everything on his after-school list done except the lesson, so it's what's left
  const wed = {}, lw = Lm.lists({ routines: {}, run: {}, isaiah: {} }, 'eli', new Date(2026, 10, 18));
  [...lw.morning, ...lw.day].forEach((it) => { if (it.parts) it.parts.forEach((x) => { wed[Lm.partKey(it.key, x)] = true; }); else wed[it.key] = it.choices ? it.choices[0] : true; });
  await p.evaluate(([t, w]) => { const db = JSON.parse(sessionStorage.getItem('mockdb')); db.charts.routines.days['2026-11-18'] = { eli: w }; db.charts['eli-run'].days['2026-11-18'] = { items: { run: true, coreA: true, plyo: true, strides: true } }; sessionStorage.setItem('mockdb', JSON.stringify(db)); }, [tue, wed]);
  await visit('index.html', 'dp-home');
  check(/Driving lesson/.test(await p.$eval('#n-eli', (e) => e.textContent)), 'Home "Right now" shows the lesson due today');
  await visit('parents.html', 'dp-parents-now');
  check(/Driving lesson/.test(await p.$eval('#nowall', (e) => e.textContent)), 'Parents "Right now" shows the lesson due today');
  await ctx.unroute(/driving-course\.js/, course);
  await ctx.unroute(/driving-tests\.js/, noTests);
