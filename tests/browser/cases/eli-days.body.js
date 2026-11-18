  // Eli's run/swim boxes follow his plan; his Saturday run is on his weekend checklist.
  await visit('eli.html?week=2026-11-23', 'eli-nov23');
  const nov23 = await p.$$eval('button.cell[data-row="running"]', (els) => els.map((e) => e.dataset.day + (e.classList.contains('opt') ? 'opt' : '')));
  notes.push('Nov 23 run/swim boxes: ' + nov23.join(','));
  check(nov23.includes('3opt') && nov23.includes('4opt') && nov23.includes('5'), 'Thanksgiving Thu/Fri optional, Sat required');
  await visit('eli.html?week=2027-03-01', 'eli-mar1');
  const jan25 = await p.$$('button.cell[data-row="running"]'); // (Mar 1: after the plan)
  notes.push('Mar 1 run/swim boxes: ' + jan25.length);
  check(jan25.length === 0, 'after the plan, run/swim boxes are off');
  // Wed-Fri chores are still owed here: his run must stay open anyway
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
  await visit('eli.html?week=2027-02-22', 'eli-feb22');
  const feb22 = await p.$$eval('button.cell[data-row="running"]', (els) => els.map((e) => e.dataset.day + ':' + e.textContent.trim() + (e.classList.contains('opt') ? '(opt)' : '')));
  notes.push('Feb 22 run/swim boxes: ' + feb22.join(', '));
  check(feb22.length === 6, 'Feb 22 week has six run/swim boxes');
