  // Isaiah's glasses: morning (school days from Wed Nov 25), after school and bedtime (from Tue Nov 24);
  // the clothes tag names the pair for the day the clothes are for; bedtime times unchanged.
  await p.clock.setFixedTime(new Date(2026, 10, 25, 7, 30));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  const keys = (sel) => p.$$eval(sel + ' .ckbtn', (els) => els.map((e) => e.dataset.key));
  await visit('checklist.html?kid=isaiah&date=2026-11-25', 'gl-wed');
  const m = await keys('#morning');
  check(m[0] === 'mDress' && m[1] === 'mGlasses', 'school glasses right after getting dressed');
  // candy needs the new box too
  for (const k of m.filter((k) => k !== 'mGlasses' && k !== 'mBreakfast')) await tap('#morning .ckbtn[data-key="' + k + '"]');
  await tap('#morning .chip[data-key="mBreakfast"]');
  check(!(await p.$('#morning .treat.earned')), 'no candy without the glasses box');
  await tap('#morning .ckbtn[data-key="mGlasses"]');
  check(!!(await p.$('#morning .treat.earned')), 'candy once the glasses box is ticked');
  const d = await keys('#day .checklist');
  check(d[1] === 'glassesHome', 'after school: home glasses right after putting things away');
  await visit('checklist.html?kid=isaiah&date=2026-11-24', 'gl-tue');
  check(!(await keys('#morning')).includes('mGlasses'), 'no morning glasses on Tuesday (already past)');
  check((await keys('#day')).includes('glassesHome') && (await keys('#bed')).includes('glasses'), 'after school and bedtime from Tuesday');
  await visit('checklist.html?kid=isaiah&date=2026-11-23', 'gl-mon');
  check(!(await keys('#day')).includes('glassesHome') && !(await keys('#bed')).includes('glasses'), 'nothing on Monday');
  // bedtime: right after the snack, other times unchanged (same weekday a week earlier)
  const times = (sel) => p.$$eval(sel, (els) => els.map((e) => e.dataset.key + '@' + (e.querySelector('.rtime') || {}).textContent));
  await visit('checklist.html?kid=isaiah&date=2026-11-24', 'gl-bed');
  const now = await times('#bed .ckbtn');
  await visit('checklist.html?kid=isaiah&date=2026-11-17', 'gl-bed-old');
  const old = await times('#bed .ckbtn');
  const sn = now.findIndex((x) => x.startsWith('snack@'));
  check(now[sn + 1].startsWith('glasses@'), 'glasses right after the snack');
  check(now.filter((x) => !x.startsWith('glasses@')).join() === old.join(), 'bedtime times unchanged');
  // clothes tag
  const tag = async (date, key) => { await visit('checklist.html?kid=isaiah&date=' + date, 'gl-tag-' + date); return p.$eval('.ckbtn[data-key="' + key + '"]', (e) => e.textContent); };
  check(/with your school glasses/.test(await tag('2026-11-26', 'clothes')), 'Thursday: school glasses');
  check(/with your home glasses/.test(await tag('2026-11-27', 'clothes')), 'Friday: home glasses');
  check(/with your school glasses/.test(await tag('2026-11-29', 'weather')), 'Sunday: school glasses');
  check(/pile downstairs/.test(await p.$eval('.ckbtn[data-key="weather"]', (e) => e.textContent)), 'downstairs wording');
  await p.screenshot({ path: OUT + 'glasses-sun.png' });
