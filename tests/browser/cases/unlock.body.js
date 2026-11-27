  // The Parents page needs the PIN every time it's opened (the parent's rule, Nov 27, 2026), even on a parent's
  // phone: covered until the PIN is right; Cancel or a wrong PIN keeps it covered; "Enter PIN" asks again; the
  // back button's cache doesn't skip it. Inside the page, parent buttons don't ask a second time.
  const PINHASH = '30fb85852fe669dfbf8e52b679886067b7ac636b8478c831607e50cade42329d'; // 2468
  await p.clock.install({ time: new Date(2026, 10, 18, 20, 0).getTime() });
  await p.clock.resume();
  await p.goto(B + 'index.html');
  await p.evaluate((h) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { settings: { pinHash: h }, routines: { days: {} } } })); }, PINHASH);
  const covered = () => p.evaluate(() => document.body.classList.contains('locked') && getComputedStyle(document.getElementById('tncard')).display === 'none');
  // 1. it asks on the way in; Cancel keeps the page covered
  await visit('parents.html', 'unlock-ask', true, { noPin: true });
  check(!!(await p.waitForSelector('.pindlg input', { timeout: 3000 }).catch(() => null)), 'asks for the PIN on the way in');
  check(!(await p.$('#pinkeep')), 'no "parent’s phone" box here: it asks every time');
  await p.click('.pindlg [data-pin="cancel"]'); await p.waitForTimeout(200);
  check(await covered(), 'Cancel: the page stays covered');
  await p.screenshot({ path: OUT + 'unlock-covered.png' });
  // 2. a wrong PIN keeps it covered; the right one opens it
  await p.click('#unlockbtn');
  await p.waitForSelector('.pindlg input', { timeout: 2000 });
  await p.fill('.pindlg input', '1111'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(300);
  check(/didn’t match/.test(await p.$eval('.pindlg', (e) => e.textContent)) && await covered(), 'a wrong PIN: still covered, asks again');
  await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(300);
  check(!(await covered()), 'the right PIN opens the page');
  // 3. inside, a parent button doesn't ask again
  await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-18/eli', null); });
  await p.waitForTimeout(150);
  if (await p.$('[data-allgood="2026-11-18|eli"]')) {
    await p.click('[data-allgood="2026-11-18|eli"]'); await p.waitForTimeout(300);
    check(!(await p.$('.pindlg')), 'inside the page: no second PIN');
  }
  // 4. even a parent's phone (stays unlocked elsewhere) is asked again on the next visit
  await p.evaluate(() => localStorage.setItem('rc:unlock', JSON.stringify({ always: true })));
  await visit('parents.html', 'unlock-again', true, { noPin: true });
  check(!!(await p.waitForSelector('.pindlg input', { timeout: 3000 }).catch(() => null)) && await covered(), 'next visit, even on a parent’s phone: asks again, covered');
  await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(300);
  check(!(await covered()) && await p.evaluate(() => JSON.parse(localStorage.getItem('rc:unlock') || '{}').always === true), 'opens; the phone stays a parent’s phone for the other pages');
  // 5. Lock this phone still clears the unlock
  await p.click('#lock'); await p.waitForTimeout(100);
  check(await p.evaluate(() => localStorage.getItem('rc:unlock') === null), 'Lock this phone clears the unlock');
  // 6. back from another page (the browser's page cache): covered and asking again
  await p.goto(B + 'index.html'); await p.waitForTimeout(300);
  await p.goBack(); await p.waitForTimeout(600);
  check(await covered() || !!(await p.$('.pindlg input')), 'back button: covered again');
