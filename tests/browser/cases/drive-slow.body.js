  // A slow server, and the page reloaded right after the fifth answer (before the server confirmed it):
  // the lesson must still end up done.
  const FIX = `const q = (l, k) => ({ id: l + 'q' + k, q: 'Fixture ' + l + '-' + k + '?', choices: ['Alpha', 'Bravo'], answer: 0, why: 'Why.', ref: "Iowa Driver's Manual p.1" });
export const LESSONS = [{ id: 'F1', title: 'Fixture lesson one', videos: [{ yt: 'AAAAAAAAAAA', title: 'V', channel: 'C', len: '5:00' }], questions: [1, 2, 3, 4, 5].map((k) => q('F1', k)) }];`;
  const course = (r) => r.fulfill({ contentType: 'text/javascript', body: FIX });
  const SLOW = MOCK_DB.replace('export async function set(', 'async function set0(') +
    '\nexport async function set(p, v) { await set0(p, v); await new Promise((r) => setTimeout(r, 400)); }\n';
  const slow = (r) => r.fulfill({ contentType: 'text/javascript', body: SLOW });
  await ctx.route(/driving-course\.js/, course);
  await ctx.route(/firebase-database\.js/, slow);
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
    routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } }, '2026-11-17': { eli: { chore: true } }, '2026-11-18': { eli: { chore: true } } } },
    'eli-drive': { approved: { F1: true }, watched: { F1: '2026-11-18' } } } })); });
  await visit('drive.html', 'slow-quiz');
  for (let k = 0; k < 4; k++) { await p.click('.dq-choice:not([disabled])'); await p.waitForTimeout(500); }
  await p.click('.dq-choice:not([disabled])'); // the fifth answer, then reload at once (inside the 400 ms gap)
  await p.reload(); await p.waitForTimeout(2500);
  const done = ((await db()).charts['eli-drive'].done || {}).F1;
  notes.push('done after reload: ' + done);
  check(done === '2026-11-18', 'the lesson ended up done');
  check(/Lesson done for today/.test(await p.$eval('#today', (e) => e.textContent)), 'the page says done');
  await ctx.unroute(/firebase-database\.js/, slow);
  await ctx.unroute(/driving-course\.js/, course);
