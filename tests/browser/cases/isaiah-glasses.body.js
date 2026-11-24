  // Isaiah's glasses follow the school calendar: school glasses on school mornings (from Nov 25), home
  // glasses on days off and weekends; the after-school swap only on school days (from Nov 24); the case at
  // lights out after reading; the clothes tag names the pair for the day the clothes are for.
  await p.clock.setFixedTime(new Date(2026, 11, 1, 7, 30));
  await p.goto(B + 'index.html');
  await p.evaluate(() => { sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {} } } })); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); });
  const keys = (sel) => p.$$eval(sel + ' .ckbtn', (els) => els.map((e) => e.dataset.key));
  const label = (k) => p.$eval('.ckbtn[data-key="' + k + '"]', (e) => e.textContent);
  await visit('checklist.html?kid=isaiah&date=2026-12-01', 'gl-tue');
  const m = await keys('#morning');
  check(m[0] === 'mDress' && m[1] === 'mGlasses' && /school glasses/.test(await label('mGlasses')), 'school morning: school glasses after getting dressed');
  for (const k of m.filter((k) => k !== 'mGlasses' && k !== 'mBreakfast')) await tap('#morning .ckbtn[data-key="' + k + '"]');
  await tap('#morning .chip[data-key="mBreakfast"]');
  check(!(await p.$('#morning .treat.earned')), 'no candy without the glasses box');
  await tap('#morning .ckbtn[data-key="mGlasses"]');
  check(!!(await p.$('#morning .treat.earned')), 'candy once the glasses box is ticked');
  check((await keys('#day .checklist'))[1] === 'glassesHome', 'after school: home glasses right after putting things away');
  // a weekday off (Thanksgiving week) and a weekend: home glasses, no after-school swap
  await visit('checklist.html?kid=isaiah&date=2026-11-26', 'gl-off');
  check(/home glasses/.test(await label('mGlasses')) && !(await keys('#day .checklist')).includes('glassesHome'), 'day off: home glasses, no swap');
  await visit('checklist.html?kid=isaiah&date=2026-11-28', 'gl-sat');
  check(/home glasses/.test(await label('mGlasses')), 'Saturday: home glasses');
  await visit('checklist.html?kid=isaiah&date=2026-11-29', 'gl-sun');
  check(/home glasses/.test(await label('mGlasses')), 'Sunday: home glasses');
  // start dates
  await visit('checklist.html?kid=isaiah&date=2026-11-24', 'gl-start');
  check(!(await keys('#morning')).includes('mGlasses'), 'no morning glasses on Nov 24 (already past)');
  check((await keys('#day .checklist')).includes('glassesHome') && (await keys('#bed')).includes('glasses'), 'after school and bedtime from Nov 24');
  await visit('checklist.html?kid=isaiah&date=2026-11-23', 'gl-mon');
  check(!(await keys('#day .checklist')).includes('glassesHome') && !(await keys('#bed')).includes('glasses'), 'nothing on Nov 23');
  // bedtime: right after reading at lights out; other times unchanged (same weekday a week earlier)
  const times = (sel) => p.$$eval(sel, (els) => els.map((e) => e.dataset.key + '@' + (e.querySelector('.rtime') || {}).textContent));
  await visit('checklist.html?kid=isaiah&date=2026-11-24', 'gl-bed');
  const now = await times('#bed .ckbtn');
  await visit('checklist.html?kid=isaiah&date=2026-11-17', 'gl-bed-old');
  const old = await times('#bed .ckbtn');
  const li = now.findIndex((x) => x.startsWith('lights@'));
  check(now[li - 1].startsWith('glasses@') && now[li - 2].startsWith('reading@') && now[li - 1].split('@')[1] === now[li].split('@')[1], 'case after reading, at lights out');
  check(now.filter((x) => !x.startsWith('glasses@')).join() === old.join(), 'bedtime times unchanged');
  // clothes tag: the pair for the day the clothes are for
  const tag = async (date, key) => { await visit('checklist.html?kid=isaiah&date=' + date, 'gl-tag-' + date); return label(key); };
  check(/with your home glasses/.test(await tag('2026-11-24', 'clothes')), 'Tue Nov 24 (Wednesday off): home glasses');
  check(/with your school glasses/.test(await tag('2026-11-29', 'weather')), 'Sun Nov 29 (Monday school): school glasses');
  check(/with your school glasses/.test(await tag('2026-12-03', 'clothes')), 'Thu Dec 3: school glasses');
  check(/with your home glasses/.test(await tag('2026-12-04', 'clothes')), 'Fri Dec 4: home glasses');
  check(/pile downstairs/.test(await label('clothes')), 'downstairs wording');
