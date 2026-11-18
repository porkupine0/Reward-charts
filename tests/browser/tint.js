// Light mode: highlight colours really paint (the "Finish first" box and earned tiles use --tint / --tint-good).
// Run: python3 -m http.server 8765 (from the repo), then node tests/browser/tint.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ colorScheme: 'light' });
  await p.route(/firebase|fonts\./, (r) => r.abort());
  await p.goto('http://localhost:8765/index.html');
  const v = await p.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    const el = document.createElement('div'); el.className = 'owed'; document.body.appendChild(el);
    return { tint: s.getPropertyValue('--tint').trim(), good: s.getPropertyValue('--tint-good').trim(), owedBg: getComputedStyle(el).backgroundColor };
  });
  console.log(JSON.stringify(v));
  const ok = v.tint && v.good && v.owedBg !== 'rgba(0, 0, 0, 0)';
  console.log(ok ? 'NO ISSUES' : 'FAIL');
  await b.close();
  process.exit(ok ? 0 : 1);
})();
