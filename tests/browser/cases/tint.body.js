  // Light mode: highlight colours really paint (the "Finish first" box and earned tiles use --tint / --tint-good).
  await p.emulateMedia({ colorScheme: 'light' });
  await visit('index.html', 'tint');
  const v = await p.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    const el = document.createElement('div'); el.className = 'owed'; document.body.appendChild(el);
    return { tint: s.getPropertyValue('--tint').trim(), good: s.getPropertyValue('--tint-good').trim(), owedBg: getComputedStyle(el).backgroundColor };
  });
  notes.push('light tints: ' + JSON.stringify(v));
  check(v.tint && v.good && v.owedBg !== 'rgba(0, 0, 0, 0)', 'light-mode highlight colours paint');
