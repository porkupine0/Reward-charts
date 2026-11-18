  // The "next" ring follows the time of day: After school at 4:30 pm, Bedtime at 8:45 pm.
  const ringAt = async (h, m) => {
    await p.clock.setFixedTime(new Date(2026, 10, 18, h, m));
    await p.evaluate(() => sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: { '2026-11-18': { eli: {} } } } } })));
    await visit('checklist.html?kid=eli', 'ring-' + h);
    return p.$$eval('.ck.next', (els) => els.map((e) => e.closest('section,div[id]') && e.closest('[id]').id));
  };
  await p.goto(B + 'index.html');
  const four = await ringAt(16, 30);
  notes.push('4:30 pm ring in: ' + four.join(','));
  check(four.length === 1 && four[0] === 'day', 'ring in After school at 4:30');
  const nine = await ringAt(20, 45);
  notes.push('8:45 pm ring in: ' + nine.join(','));
  check(nine.length === 1 && nine[0] === 'bed', 'ring in Bedtime at 8:45');
  await visit('parents.html', 'parents-wed');
  const sum = await p.$eval('#summary', (e) => e.textContent);
  notes.push('parents summary: ' + sum.slice(0, 80));
  check(/\/3 full checklist days/.test(sum), 'This week counts 3 days on Wednesday');
