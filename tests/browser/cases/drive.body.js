  // Driving page with a fixture course (the real course ships empty): parent approves with the real PIN;
  // locked until chores (row has no Open link); Watched; quiz; reload mid-quiz; finishing; the checklist row
  // fills; a finished lesson shows its stored answers; skip.
  const PINHASH = '30fb85852fe669dfbf8e52b679886067b7ac636b8478c831607e50cade42329d'; // 2468
  const FIX = `const q = (l, k, ans) => ({ id: l + 'q' + k, q: 'Fixture question ' + l + '-' + k + '?', choices: ['Alpha', 'Bravo', 'Charlie'], answer: ans, why: 'Because ' + k + '.', ref: "Iowa Driver's Manual p.1" });
export const LESSONS = [
  { id: 'F1', title: 'Fixture lesson one', videos: [{ yt: 'AAAAAAAAAAA', title: 'Fixture video', channel: 'Fixture channel', len: '5:00', iowa: 'Iowa note.' }], questions: [1, 2, 3, 4, 5].map((k) => q('F1', k, 0)) },
  { id: 'F2', title: 'Fixture lesson two', videos: [{ yt: 'BBBBBBBBBBB', title: 'Fixture video 2', channel: 'Fixture channel', len: '6:00' }], questions: [1, 2, 3, 4, 5].map((k) => q('F2', k, 1)) },
  { id: 'F3', title: 'Fixture lesson three', key: [{ t: 'Fixture point one.', ref: "Iowa Driver's Manual p.1", quote: 'x' }, { t: 'Fixture family rule.', family: true }], videos: [{ yt: 'CCCCCCCCCCC', title: 'Fixture video 3', channel: 'Fixture channel', len: '7:00' }], questions: [1, 2, 3, 4, 5].map((k) => q('F3', k, 2)) }
];`;
  const course = (r) => r.fulfill({ contentType: 'text/javascript', body: FIX });
  await ctx.route(/driving-course\.js/, course);
  // no knowledge tests in this case (the baseline would hold the lessons; drive-test covers it)
  const noTests = (r) => r.fulfill({ contentType: 'text/javascript', body: "export const FORMS = {}; export const SITTINGS = []; export const PASS = 0.8; export const TOPICS = []; export const BLUEPRINT = {};" });
  await ctx.route(/driving-tests\.js/, noTests);
  await p.goto(B + 'index.html');
  await p.evaluate((h) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { settings: { pinHash: h },
    routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } } } } } })); }, PINHASH);
  // nothing approved yet: Eli sees "waiting"; Parents page says so
  await visit('drive.html', 'drive-waiting');
  check(/Waiting for Mom or Dad/.test(await p.$eval('#today', (e) => e.textContent)), 'waiting for approval');
  await visit('parents.html', 'drive-parents');
  check(/Driving: 0 of the next 2 lessons approved\. Next to preview: Fixture lesson one/.test(await p.$eval('#excuses', (e) => e.textContent)), 'Parents page: ahead-of-time line');
  // parent preview: answers only after the PIN; approve F1 with the real PIN box
  await visit('drive.html', 'drive-preview');
  check(!(await p.$('.dprev')), 'no answers before the PIN');
  await p.click('#previewbtn');
  await p.waitForSelector('.pindlg input', { timeout: 2000 });
  await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(300);
  check((await p.$$('.dprev')).length === 3, 'preview lists the lessons');
  await p.click('[data-approve="F1|yes"]'); await p.waitForTimeout(300);
  check((await db()).charts['eli-drive'].approved.F1 === '2026-11-18', 'F1 approved (stored as the day)');
  // Wednesday's chore not done: locked, on the page and on the checklist
  await visit('drive.html', 'drive-locked');
  check(/Do today’s chores first/.test(await p.$eval('#today', (e) => e.textContent)), 'page locked until chores');
  await visit('checklist.html?kid=eli', 'drive-row-locked');
  const rowLocked = await p.$('.ck.locked .ckbtn[data-key="drive"]');
  check(!!rowLocked, 'checklist row shows, locked');
  check(!(await p.$('.ck.locked:has(.ckbtn[data-key="drive"]) .cklink')), 'no Open link on the locked row');
  await rowLocked.click({ force: true }); await p.waitForTimeout(300);
  check(/checklist\.html/.test(p.url()), 'tapping the locked row goes nowhere');
  // chores done: the lesson opens
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-18/eli/chore', true); });
  await visit('drive.html', 'drive-open');
  check(!!(await p.$('[data-watched="F1"]')) && !(await p.$('.dq')), 'video and Watched; questions after watching');
  check(/In Iowa:/.test(await p.$eval('#today', (e) => e.textContent)), 'the Iowa note shows');
  await p.click('[data-watched="F1"]'); await p.waitForTimeout(200);
  const qs = await p.$$eval('.dq-q', (els) => els.map((e) => e.textContent));
  check(qs.length === 5, '5 questions');
  await p.click('.dq:nth-of-type(1) [data-pick$="|0"]'); await p.waitForTimeout(150);   // right
  await p.click('.dq:nth-of-type(2) [data-pick$="|1"]'); await p.waitForTimeout(150);   // wrong
  check(/Right answer: Alpha/.test(await p.$eval('.dq:nth-of-type(2)', (e) => e.textContent)), 'a wrong answer shows the right one and why');
  check(await p.$eval('.dq:nth-of-type(2)', (e) => e.querySelectorAll('.dq-choice[disabled]').length === 3 && !!e.querySelector('.dq-choice.picked') && !!e.querySelector('.dq-choice.right') && e.querySelector('.dq-choices').compareDocumentPosition(e.querySelector('.dq-result')) === 4), 'answered: the choices stay (disabled, his pick and the right one marked), result below them');
  await visit('drive.html', 'drive-reload');
  check(JSON.stringify(await p.$$eval('.dq-q', (els) => els.map((e) => e.textContent))) === JSON.stringify(qs), 'same questions after a reload');
  for (let k = 0; k < 3; k++) { await p.click('.dq-choice:not([disabled])'); await p.waitForTimeout(150); }
  check(/Lesson done for today/.test(await p.$eval('#today', (e) => e.textContent)), 'finished after 5 answers (no pass mark)');
  check((await db()).charts['eli-drive'].done.F1 === '2026-11-18', 'done stored for today');
  await visit('checklist.html?kid=eli', 'drive-row-done');
  check(await p.$eval('.ckbtn[data-key="drive"]', (e) => e.getAttribute('aria-pressed')) === 'true', 'checklist row filled');
  // the next day: the stored answers for Nov 18
  await visit('drive.html?date=2026-11-18', 'drive-past');
  check((await p.$$('.dq.answered')).length === 5 && !(await p.$('.dq-choice:not([disabled])')), 'past lesson shows the stored answers');
  // approve F2 and skip F3; then Thursday: 3 questions from F2 and 2 from F1, including the one he missed
  await visit('drive.html', 'drive-approve2');
  await p.click('#previewbtn'); await p.waitForTimeout(300);
  await p.click('[data-approve="F2|yes"]'); await p.waitForTimeout(300);
  await p.click('[data-approve="F3|skip"]'); await p.waitForTimeout(300);
  check((await db()).charts['eli-drive'].approved.F3 === 'skip:2026-11-18', 'F3 video skipped (with the day)');
  check(/Video skipped/.test(await p.$eval('#preview', (e) => e.textContent)) && /Skip the video/.test(await p.$eval('#preview', (e) => e.textContent)), 'preview says the video was skipped');
  // switching keeps the first date: F2 approved on Nov 10; today a parent skips its video, then approves again
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('eli-drive', 'approved/F2', '2026-11-10'); });
  await p.waitForTimeout(300);
  await p.click('[data-approve="F2|skip"]'); await p.waitForTimeout(300);
  check((await db()).charts['eli-drive'].approved.F2 === 'skip:2026-11-10', 'Approve then Skip: keeps the first date (' + (await db()).charts['eli-drive'].approved.F2 + ')');
  await p.click('[data-approve="F2|yes"]'); await p.waitForTimeout(300);
  check((await db()).charts['eli-drive'].approved.F2 === '2026-11-10', 'Skip then Approve: keeps the first date');
  await p.clock.setFixedTime(new Date(2026, 10, 19, 16, 0));
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-19/eli/chore', true); });
  await visit('drive.html', 'drive-thu');
  await p.click('[data-watched="F2"]'); await p.waitForTimeout(200);
  const thu = await p.$$eval('.dq-q', (els) => els.map((e) => e.textContent));
  notes.push('Thursday quiz: ' + thu.join(' | '));
  check(thu.length === 5 && thu.slice(0, 3).every((t) => /F2-/.test(t)) && thu.slice(3).every((t) => /F1-/.test(t)), '3 from F2, 2 from F1');
  check(thu.slice(3).some((t) => /F1-2\?/.test(t)), 'the missed F1 question comes back');
  // Friday: F3 (video skipped) still runs: no video, straight to its 5 questions
  for (let k = 0; k < 5; k++) { await p.click('.dq-choice:not([disabled])'); await p.waitForTimeout(150); }
  await p.clock.setFixedTime(new Date(2026, 10, 20, 16, 0));
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-20/eli/chore', true); });
  await visit('drive.html', 'drive-fri-novideo');
  const fri = await p.$eval('#today', (e) => e.textContent);
  check(/Fixture lesson three/.test(fri) && /No video for this one/.test(fri) && !(await p.$('#today iframe')) && !!(await p.$('#today .dkey li')) && !(await p.$('#today .dq')), 'F3 runs without its video: the key points first');
  await p.click('[data-watched="F3"]'); await p.waitForTimeout(200);
  check((await p.$$('#today .dq')).length === 5 && !(await p.$('#today .dkey')), 'after "I\'ve read these": 5 questions, key points hidden');
  for (let k = 0; k < 5; k++) { await p.click('.dq-choice:not([disabled])'); await p.waitForTimeout(150); }
  check(((await db()).charts['eli-drive'].done || {}).F3 === '2026-11-20', 'F3 finishes without a video');
  await ctx.unroute(/driving-course\.js/, course);
  await ctx.unroute(/driving-tests\.js/, noTests);
