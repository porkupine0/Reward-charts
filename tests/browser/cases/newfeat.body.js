  // Game time for all three, Isaiah's chart, Rhett's chart rows, the missed-chore box (moved from newfeat.js)

  await p.goto(B + 'index.html'); await p.waitForTimeout(300);
  await p.evaluate(() => sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-16': { isaiah: { chore: true, chore2: true } }, '2026-11-17': { isaiah: { chore: true } } } } } })));
  await visit('checklist.html?kid=isaiah&date=2026-11-19', 'n-owed');
  const owedTxt = await p.$eval('.owed', e => e.textContent).catch(() => '');
  check(/Finish first/.test(owedTxt), 'owed block missing: ' + owedTxt);
  check((await p.$$('#day .ck.locked')).length === 0, 'Isaiah: nothing on his list locks (no screen tasks)');
  check((await p.$$('#bed .ck.locked')).length === 0, 'bed locked');
  check((await p.$$('[data-daycheck]')).length === 6, 'isaiah 3 checks');
  // Wednesday's chore has a step list now (Kitchen): open it and tick every step
  await tap('.owed [data-steps]');
  for (let j = 0; j < 20; j++) { const s = await p.$('.owed .stepbtn[aria-pressed="false"]'); if (!s) break; await s.click(); await p.waitForTimeout(60); }
  await p.waitForTimeout(200);
  check(!(await p.$('.owed')), 'owed block still there');
  const st = await db(); notes.push('owed saved: ' + JSON.stringify(((((st.charts||{}).routines||{}).days||{})['2026-11-18']||{}).isaiah));
  notes.push('excusable on isaiah day: ' + (await p.$$('#day [data-excuse="mark"]')).length);
  await visit('zay.html', 'n-zay');
  check(!!(await p.$('#gamecard')), 'zay game card');
  check(await p.$eval('#weeklycard', e => getComputedStyle(e).display === 'none'), 'zay weekly hidden'); check(await p.$eval('#monthcard', e => getComputedStyle(e).display === 'none'), 'zay month hidden');
  await visit('trombone.html', 'n-rhett');
  const rows = await p.$$eval('.g-label strong', els => els.map(e => e.textContent)); notes.push('rhett rows: ' + rows.join(','));
  check(!!(await p.$('#gamecard')) && (await p.$eval('#weeklycard', e => getComputedStyle(e).display !== 'none')), 'rhett has both cards');
  await p.click('button.cell[data-row="chores"][data-day="0"]'); await p.waitForTimeout(400);
  notes.push('tap went to: ' + p.url());
  await visit('eli.html', 'n-eli');
  await visit('kid.html?kid=isaiah', 'n-kid');
  await visit('parents.html', 'n-parents');
  await visit('checklist.html?kid=rhett', 'n-rcheck');
  await visit('checklist.html?kid=eli', 'n-echeck');
  notes.push('eli excuse on activity: ' + (await p.$$('#day [data-excuse="mark"][data-key="activity"]')).length);
