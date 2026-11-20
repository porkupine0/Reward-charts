  // With Isaiah's new schedule (trash Saturday, room Monday, no Sunday fold), an unfinished Saturday chore
  // shows on Sunday under Finish first, with its steps.
  await p.clock.setFixedTime(new Date(2026, 10, 22, 15, 0));
  await p.goto(B + 'index.html');
  await p.evaluate(() => {
    const K = 'Kitchen + dining room with the family', L = 'Laundry + clean your room (30 min)', T = 'Trash: empty every trash can in the house';
    sessionStorage.setItem('mockdb', JSON.stringify({ charts: {
      config: { chores: { isaiah: [[K, L], ['Front closet + shoe organizing'], ['Kitchen'], ['Stairs, landing + upstairs hallway'], ['Sunroom'], [T], ['Kitchen + dining room (all hands)']] } },
      routines: { days: { '2026-11-16': { isaiah: { chore: true, chore2: true } }, '2026-11-17': { isaiah: { chore: true } }, '2026-11-18': { isaiah: { chore: true } }, '2026-11-19': { isaiah: { chore: true } }, '2026-11-20': { isaiah: { chore: true } } } }
    } }));
    localStorage.setItem('rc:unlock', JSON.stringify({ always: true }));
  });
  await visit('checklist.html?kid=isaiah', 'sat-sun');
  check(!!(await p.$('.owed [data-steps="2026-11-21|chore"]')), 'Saturday’s trash shows on Sunday with its steps');
  const sun = await p.$$eval('#day [data-steps]', (els) => els.map((e) => e.textContent));
  check(sun.some((t) => /all hands/.test(t)) && !sun.some((t) => /Fold/.test(t)), 'Sunday has the kitchen chore and no fold chore');
  check(/10 steps/.test(await p.$eval('#day [data-steps="2026-11-22|chore"]', (e) => e.textContent)), 'all-hands kitchen has 10 steps');
