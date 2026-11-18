  // Rhett missed Wednesday's chore: on Thursday his screen tasks lock; he asks to be excused from the
  // Finish-first box; it shows on the Parents page dated Wednesday; Approve clears the lock.
  await p.clock.setFixedTime(new Date(2026, 10, 19, 16, 30));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-16': { rhett: { chore: true, chore2: true } }, '2026-11-17': { rhett: { chore: true } } } } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('checklist.html?kid=rhett', 'owed-rhett');
  const locked = await p.$$eval('#day .ck.locked .ckbtn', (els) => els.map((e) => e.dataset.key));
  notes.push('locked: ' + locked.join(','));
  check(locked.includes('homework') && !locked.includes('afterSnack') && !locked.includes('activity'), 'only screen/school tasks lock');
  await tap('[data-owedex^="mark|2026-11-18"]');
  check(!!(await p.$('[data-owedex^="approve|2026-11-18"]')), 'waiting shown in Finish-first');
  await p.screenshot({ path: OUT + 'owed-rhett-waiting.png', fullPage: false });
  check((await p.$$('#day .ck.locked')).length > 0, 'still locked while waiting');
  await visit('parents.html', 'owed-parents');
  const wait = await p.$eval('#excuses', (e) => e.textContent);
  notes.push('waiting row: ' + wait.replace(/\s+/g, ' ').slice(0, 80));
  check(/Rhett/.test(wait) && /Wed Nov 18/.test(wait), 'waiting row for Rhett dated Wednesday');
  await tap('[data-ex$="|chore|ok"]');
  await visit('checklist.html?kid=rhett', 'owed-rhett-after');
  check(!(await p.$('.owed')), 'Finish-first gone after approval');
  // today's chores still come first for computer tasks (the older rule); the missed-chore lock is gone
  const msgs = await p.$$eval('#day .ck.locked small', (els) => els.map((e) => e.textContent));
  notes.push('after approval, lock messages: ' + [...new Set(msgs)].join(' / '));
  check(!msgs.some((m) => /Finish first/.test(m)), 'missed-chore lock cleared');
