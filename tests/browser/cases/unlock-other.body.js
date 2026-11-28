  // Parent PIN boxes on pages other than the Parents page (here: the Driving page's parent preview): Cancel
  // unlocks nothing; unticked = 15 minutes; ticked "This is a parent's phone" = stays unlocked a day later.
  const PINHASH = '30fb85852fe669dfbf8e52b679886067b7ac636b8478c831607e50cade42329d'; // 2468
  await p.clock.install({ time: new Date(2026, 10, 18, 16, 0).getTime() });
  await p.clock.resume();
  await p.goto(B + 'index.html');
  await p.evaluate((h) => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { settings: { pinHash: h }, routines: { days: {} } } })); }, PINHASH);
  const ask = async () => {
    await visit('drive.html', 'unlock-other');
    await p.click('#previewbtn');
    return !!(await p.waitForSelector('.pindlg input', { timeout: 1500 }).catch(() => null));
  };
  const unlocked = () => p.evaluate(() => !!localStorage.getItem('rc:unlock'));
  check(await ask(), 'the preview asks for the PIN');
  await p.click('.pindlg [data-pin="cancel"]'); await p.waitForTimeout(200);
  check(!(await unlocked()) && !(await p.$('.dprev')), 'Cancel: nothing unlocked, no answers shown');
  check(await ask(), 'asks again');
  await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(300);
  check(await unlocked(), 'the right PIN unlocks');
  check(!(await ask()), 'unticked: no ask within 15 minutes');
  await p.clock.fastForward('16:00');
  check(await ask(), 'unticked: asks again after 16 minutes');
  await p.check('#pinkeep'); await p.fill('.pindlg input', '2468'); await p.click('.pindlg [data-pin="ok"]'); await p.waitForTimeout(300);
  await p.clock.fastForward('24:00:00');
  check(!(await ask()), 'ticked "parent’s phone": no ask a day later');
