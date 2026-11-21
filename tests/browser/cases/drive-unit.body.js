  // The unit test (every 5th lesson) with a fixture course: no answers shown while he takes it; it is NOT
  // finished after 5 answers (the daily-lesson rule); a reload keeps the same questions; at the end the
  // score and every right answer; stored as done; the Parents page shows the score.
  const FIX = `const q = (l, k) => ({ id: l + 'q' + k, q: 'Fixture ' + l + '-' + k + '?', choices: ['Alpha', 'Bravo', 'Charlie'], answer: k % 3, why: 'Why ' + k + '.', ref: "Iowa Driver's Manual p.1" });
const L = (id) => ({ id, title: 'Lesson ' + id, videos: [{ yt: 'AAAAAAAAAAA', title: 'V', channel: 'C', len: '5:00' }], questions: [1, 2, 3, 4, 5, 6, 7].map((k) => q(id, k)) });
export const PLANNED = 10;
export const LESSONS = [L('U1'), L('U2'), L('U3'), L('U4'), { id: 'U5', title: 'Unit 1 test', review: true, videos: [], questions: [] }];`;
  const course = (r) => r.fulfill({ contentType: 'text/javascript', body: FIX });
  const noTests = (r) => r.fulfill({ contentType: 'text/javascript', body: 'export const FORMS = {}; export const SITTINGS = []; export const PASS = 0.8; export const TOPICS = []; export const BLUEPRINT = {};' });
  await ctx.route(/driving-course\.js/, course);
  await ctx.route(/driving-tests\.js/, noTests);
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
    routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } }, '2026-11-18': { eli: { chore: true } } } },
    'eli-drive': { approved: { U1: '2026-11-01', U2: '2026-11-01', U3: '2026-11-01', U4: '2026-11-01' },
      done: { U1: '2026-11-11', U2: '2026-11-12', U3: '2026-11-13', U4: '2026-11-16' } } } })); });
  await visit('drive.html', 'unit-start');
  const t0 = await p.$eval('#today', (e) => e.textContent);
  check(/Unit test/.test(t0) && /16 questions/.test(t0) && (await p.$$('#today .dq')).length === 16, 'unit test: 16 questions, 4 from each lesson');
  for (let k = 0; k < 5; k++) { await p.click('#today .dq:not(.answered) .dq-choice'); await p.waitForTimeout(150); }
  const t5 = await p.$eval('#today', (e) => e.textContent);
  check(/5 of 16 answered/.test(t5) && !/Right answer|✓ Right|Why 1\./.test(t5), 'while taking it: no right/wrong, no explanations');
  check(!((await db()).charts['eli-drive'].done || {}).U5, 'not finished after 5 answers');
  const ids = await p.$$eval('#today [data-pick]', (els) => [...new Set(els.map((e) => e.dataset.pick.split('|')[0]))]);
  await visit('drive.html', 'unit-reload');
  check(JSON.stringify(await p.$$eval('#today [data-pick]', (els) => [...new Set(els.map((e) => e.dataset.pick.split('|')[0]))])) === JSON.stringify(ids) && /5 of 16 answered/.test(await p.$eval('#today', (e) => e.textContent)), 'a reload keeps the same questions and his answers');
  for (let k = 0; k < 11; k++) { await p.click('#today .dq:not(.answered) .dq-choice'); await p.waitForTimeout(120); }
  await p.waitForTimeout(300);
  // all 16 answered: no score yet; he can still change an answer; Finish shows the score
  check(!((await db()).charts['eli-drive'].done || {}).U5 && !!(await p.$('[data-ufinish="U5"]')) && !/Right answer|✓ Right/.test(await p.$eval('#today', (e) => e.textContent)), 'all answered: not done until Finish; no right/wrong yet');
  const chg = await p.$eval('#today .dq', (q) => { const b = q.querySelector('.dq-choice:not(.picked)'); b.click(); return b.dataset.pick; });
  await p.waitForTimeout(250);
  const [cq, cl, cp] = chg.split('|');
  check((await db()).charts['eli-drive'].answers[cq][cl].pick === Number(cp), 'a unit test answer can be changed before Finish');
  await p.click('[data-ufinish="U5"]'); await p.waitForTimeout(300);
  const locked = await p.$eval('#today .dq', (q) => q.querySelectorAll('.dq-choice[disabled]').length);
  check(locked > 0, 'after Finish: the answers are locked');
  await p.waitForTimeout(400);
  const t16 = await p.$eval('#today', (e) => e.textContent);
  check(/\d+ of 16<\/b>|\d+ of 16 right/.test(await p.$eval('#today', (e) => e.innerHTML)) && /Right answer|✓ Right/.test(t16) && /Unit test done/.test(t16), 'at the end: score, the right answers, done');
  check(((await db()).charts['eli-drive'].done || {}).U5 === '2026-11-18', 'stored as done today');
  await visit('parents.html', 'unit-parents');
  check(/Unit 1 test: \d+ of 16 right/.test(await p.$eval('#testscores', (e) => e.textContent)) && !(await p.$eval('#testcard', (e) => e.hidden)), 'Parents page shows the unit test score');
  // the next day: every written lesson done, more planned -> "More lessons coming", and no driving row
  await p.clock.setFixedTime(new Date(2026, 10, 19, 16, 0));
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-19/eli/chore', true); });
  await visit('drive.html', 'unit-more');
  check(/More lessons coming/.test(await p.$eval('#today', (e) => e.textContent)), 'caught up: More lessons coming');
  await visit('checklist.html?kid=eli', 'unit-more-checklist');
  check(!(await p.$('.ckbtn[data-key="drive"]')), 'caught up: no driving row (nothing is due)');
  await p.clock.setFixedTime(new Date(2026, 10, 18, 16, 0));
  await ctx.unroute(/driving-tests\.js/, noTests);
  await ctx.unroute(/driving-course\.js/, course);
