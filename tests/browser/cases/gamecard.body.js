  // Game card at 375: past days say "not earned" with the reason; today shows a count and the next three;
  // "Other…" reads "1:30" and says so when it can't read the input.
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { routines: { days: {}, game: { rhett: { '2026-11-16': {} } } } } })); });
  await visit('trombone.html', 'gc');
  const tiles = await p.$$eval('.gt-day span', (els) => els.map((e) => e.textContent));
  notes.push('tiles: ' + tiles.join(', '));
  check(tiles[0] === 'not earned' && tiles[2] === 'not yet' && tiles[3] === 'to come', 'tile words');
  const why = await p.$$eval('.gt-why', (els) => els.map((e) => [e.textContent, e.getBoundingClientRect().height > 0]));
  notes.push('why: ' + why.map((w) => w[0].slice(0, 70)).join(' | '));
  check(why.length === 2 && why.every((w) => w[1]) && /^Mon not earned:/.test(why[0][0]), 'reasons for Mon and Tue show on a phone');
  const today = await p.$eval('.gt-today', (e) => e.textContent);
  notes.push('today: ' + today.slice(0, 90));
  check(/^Today, \d+ still to do: [^·]+ · [^·]+ · [^·]+ · \+\d+ more$/.test(today), 'today: a count and the next three');
  // "Other…": nothing earned yet, so the buttons aren't shown; earn one day first
  // (checked here only through the parser messages: bad input)
  p.removeAllListeners('dialog'); p.once('dialog', (d) => d.accept('soon'));
  await p.evaluate(() => { const b = document.createElement('button'); b.className = 'chip'; b.dataset.gtuse = 'other'; b.id = 'fakeother'; document.getElementById('gtbody').appendChild(b); });
  await p.click('#fakeother'); await p.waitForTimeout(200);
  const msg = await p.$eval('.gt-msg', (e) => e.textContent).catch(() => '');
  notes.push('bad input message: ' + msg);
  check(/Couldn’t read “soon”/.test(msg), 'bad input says so');
  await p.screenshot({ path: OUT + 'gamecard-375.png', fullPage: true });
