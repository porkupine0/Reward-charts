  // A slow server (the change shows at once, the confirmation takes 400 ms): Yes, then quickly
  // Not today on the same box must end on Not today, with no "another phone" banner.
  const SLOW = MOCK_DB.replace('export async function set(', 'async function set0(') +
    '\nexport async function set(p, v) { await set0(p, v); await new Promise((r) => setTimeout(r, 400)); }\n';
  const swap = (r) => r.fulfill({ contentType: 'text/javascript', body: SLOW });
  await ctx.route(/firebase-database\.js/, swap);
  await p.clock.setFixedTime(new Date(2026, 10, 18, 21, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); });
  await visit('checklist.html?kid=rhett', 'slow');
  await p.click('[data-daycheck="noLies|yes"]');
  await p.waitForTimeout(80);
  await p.click('[data-daycheck="noLies|no"]');
  await p.waitForTimeout(2000);
  const v = (((await db()).charts.routines.days || {})['2026-11-18'] || {}).rhett;
  const banner = await p.$eval('#netbanner', (e) => e.textContent).catch(() => '');
  notes.push('server: ' + JSON.stringify(v) + ' / banner: ' + (banner || 'none') + ' / queue: ' + await p.evaluate(() => localStorage.getItem('rc:queue')));
  check(v && v.noLies === 'no', 'the quick correction reached the server');
  check(!banner, 'no banner blaming another phone');
  await ctx.unroute(/firebase-database\.js/, swap);
