  // Eli's Bible reading: pick before ticking; the next day shows what he read; prayer after lights out
  // doesn't stop the bedtime timer; Rhett's screens open once his laundry's Dry step is ticked.
  await p.clock.setFixedTime(new Date(2026, 10, 23, 7, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-22': { eli: { mBible_ch: 'John 3', bibleRead_pp: 'Psalms 23', bibleRead_gos: 'Mark 1' } } } } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  await visit('checklist.html?kid=eli', 'bible-am');
  check(!!(await p.$('#morning .ckbtn[data-key="mBible"]')), 'Eli has a morning Bible box');
  check(/Last time \(Sun\): John 3/.test(await p.$eval('#morning', (e) => e.textContent)), 'shows yesterday’s chapter');
  await tap('#morning .ckbtn[data-key="mBible"]');
  check(!!(await p.$('.bneed')), 'asks him to pick first');
  check((await p.$eval('#morning .ckbtn[data-key="mBible"]', (e) => e.getAttribute('aria-pressed'))) === 'false', 'not ticked without a pick');
  await tap('[data-bnext="mBible_ch|John 4"]');
  check((await db()).charts.routines.days['2026-11-23'].eli.mBible_ch === 'John 4', 'next-chapter chip saves John 4');
  await p.selectOption('[data-bbook="mBible_ch"]', 'Romans'); await p.waitForTimeout(150);
  await p.selectOption('[data-bchap="mBible_ch"]', '8'); await p.waitForTimeout(300);
  check((await db()).charts.routines.days['2026-11-23'].eli.mBible_ch === 'Romans 8', 'wheels save Romans 8');
  await tap('#morning .ckbtn[data-key="mBible"]');
  check((await p.$eval('#morning .ckbtn[data-key="mBible"]', (e) => e.getAttribute('aria-pressed'))) === 'true', 'ticks once picked');
  await p.screenshot({ path: OUT + 'bible-am.png' });
  // afternoon: two pickers, limited books
  const pp = await p.$$eval('[data-bbook="bibleRead_pp"] option', (o) => o.map((x) => x.value).filter(Boolean));
  const gos = await p.$$eval('[data-bbook="bibleRead_gos"] option', (o) => o.map((x) => x.value).filter(Boolean));
  check(pp.join() === 'Psalms,Proverbs' && gos.join() === 'Matthew,Mark,Luke,John', 'afternoon pickers: psalm/proverb and Gospels');
  await p.locator('[data-bbook="bibleRead_pp"]').scrollIntoViewIfNeeded();
  await p.screenshot({ path: OUT + 'bible-pm.png' });
  // not on days before Nov 22
  await visit('checklist.html?kid=eli&date=2026-11-20', 'bible-before');
  check(!(await p.$('[data-key="mBible"]')) && !(await p.$('[data-key="bibleRead"]')) && !(await p.$('[data-key="pray"]')), 'nothing new on earlier days');
  // bedtime: prayer after lights out; ticking the rest stops the timer at lights out
  await visit('checklist.html?kid=eli', 'bible-bed');
  const bed = await p.$$eval('#bed .ckbtn', (els) => els.map((e) => e.dataset.key));
  check(bed[bed.length - 1] === 'pray' && bed[bed.length - 2] === 'lights', 'prayer is right after lights out');
  for (const k of bed.filter((k) => k !== 'pray' && k !== 'snack')) await tap('#bed .ckbtn[data-key="' + k + '"]');
  await tap('#bed .chip[data-key="snack"]');
  const t = (await db()).charts.routines.days['2026-11-23'].eli.bedTimer || {};
  check(!!t.end, 'timer stops without the prayer box');
  // Rhett: Saturday laundry with Dry ticked unlocks typing
  await p.evaluate(() => { const d = JSON.parse(sessionStorage.getItem('mockdb')); ['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27'].forEach((k) => { d.charts.routines.days[k] = Object.assign(d.charts.routines.days[k] || {}, { rhett: { chore: true, chore2: true } }); }); sessionStorage.setItem('mockdb', JSON.stringify(d)); });
  await visit('checklist.html?kid=rhett&date=2026-11-28', 'rhett-dry');
  check(!!(await p.$('#day .ck.locked .ckbtn[data-key="typing"]')), 'typing locked before laundry');
  await tap('[data-steps="2026-11-28|chore"]');
  const st = await p.$$eval('#day .stepbtn', (els) => els.map((e) => ({ k: e.dataset.step, t: e.textContent })));
  for (const s of st.filter((s) => /^(Collect|Wash|Dry)/.test(s.t))) await tap('[data-step="' + s.k + '"]');
  check(!(await p.$('#day .ck.locked .ckbtn[data-key="typing"]')), 'typing opens once Dry is ticked');
