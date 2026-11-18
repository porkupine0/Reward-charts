  // Eli's run/swim boxes follow his plan; his Saturday run is on his weekend checklist.
  await visit('eli.html?week=2026-11-23', 'eli-nov23');
  const nov23 = await p.$$eval('button.cell[data-row="running"]', (els) => els.map((e) => e.dataset.day + (e.classList.contains('opt') ? 'opt' : '')));
  notes.push('Nov 23 run/swim boxes: ' + nov23.join(','));
  check(nov23.includes('3opt') && nov23.includes('4opt') && nov23.includes('5'), 'Thanksgiving Thu/Fri optional, Sat required');
  await visit('eli.html?week=2027-01-25', 'eli-jan25');
  const jan25 = await p.$$('button.cell[data-row="running"]');
  notes.push('Jan 25 run/swim boxes: ' + jan25.length);
  check(jan25.length === 0, 'after the plan, run/swim boxes are off');
  // chores Wed-Fri done, so the Saturday list isn't locked by the missed-chore rule
  await p.evaluate(() => sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-18': { eli: { chore: true } }, '2026-11-19': { eli: { chore: true } }, '2026-11-20': { eli: { chore: true } } } } } })));
  await visit('checklist.html?kid=eli&date=2026-11-21', 'eli-sat21');
  const sat = await p.$('#day .ckbtn[data-key="activity"]');
  check(!!sat, 'Sat Nov 21 has the run item');
  notes.push('Sat Nov 21 item: ' + (sat ? await sat.innerText() : 'none').replace(/\s+/g, ' '));
  check(!!(await p.$('#day [data-excuse="mark"][data-key="activity"]')), 'Sat Nov 21 has the excuse link');
  await p.click('#day .ckbtn[data-key="activity"]'); await p.waitForTimeout(400);
  notes.push('tap opened: ' + p.url());
  check(/run\.html/.test(p.url()), 'tap opens Training');
  await visit('checklist.html?kid=eli&date=2026-11-14', 'eli-sat14');
  check(!(await p.$('#day .ckbtn[data-key="activity"]')), 'Sat Nov 14 has no run item');
