  // Parent unlock: unticked = 15 minutes, ticked "parent's phone" = stays unlocked, old flag asks again.
  const PINHASH = '30fb85852fe669dfbf8e52b679886067b7ac636b8478c831607e50cade42329d'; // 2468
  const t0 = new Date(2026, 10, 18, 20, 0).getTime();
  await p.clock.install({ time: t0 });
  await p.clock.resume(); // let timers run; jump ahead with fastForward
  await p.goto(B + 'index.html');
  await p.evaluate((h) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { settings: { pinHash: h }, routines: { days: {} } } })); }, PINHASH);
  const asks = async (dk = '2026-11-18') => {
    await visit('parents.html', 'unlock');
    await p.evaluate(async () => { const m = await import('./store.js?v=' + window.__V); await m.save('routines', 'days/2026-11-18/eli', null); await m.save('routines', 'days/2026-11-19/eli', null); });
    await p.waitForTimeout(150);
    if (!(await p.$('[data-allgood="' + dk + '|eli"]'))) {
      errors.push('no All good button: ' + (await p.$eval('#tnhead', (e) => e.textContent)) + ' / ' + (await p.$eval('#tonight', (e) => e.textContent)).slice(0, 100) + ' / ' + (await p.$eval('#sync', (e) => e.textContent)));
      return null;
    }
    await p.click('[data-allgood="' + dk + '|eli"]');
    const shown = await p.waitForSelector('.pindlg input', { timeout: 1500 }).then(() => true).catch(() => false);
    return shown;
  };
  const enter = async (keep) => { if (!(await p.$('.pindlg input'))) { errors.push('no PIN box to fill'); return; } if (keep) await p.check('#pinkeep'); await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(300); };
  // 1. unticked: unlocked now, asks again after 16 minutes
  check(await asks(), 'first time asks');
  await enter(false);
  check(!(await asks()), 'unticked: no ask within 15 min');
  await p.clock.fastForward('16:00');
  check(await asks(), 'unticked: asks again after 16 min');
  await enter(true); // 2. ticked: still unlocked a day later
  await p.clock.fastForward('24:00:00'); // the evening of Nov 19
  check(!(await asks('2026-11-19')), 'ticked: no ask a day later');
  // 3. Lock this phone clears it
  await visit('parents.html', 'unlock-lock');
  await p.click('#lock'); await p.waitForTimeout(100);
  check(await p.evaluate(() => localStorage.getItem('rc:unlock') === null), 'Lock this phone clears the unlock');
  // 4. a phone with the old forever flag is asked
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('rc:parent', '1'); });
  check(await asks('2026-11-19'), 'old forever flag: asks');
  check(await p.evaluate(() => localStorage.getItem('rc:parent') === null), 'old flag removed');
