  // Settings: Save and Reset wait for the latest settings (charts/config held back here); nothing is written.
  const HOLD = MOCK_DB.replace("if (p === 'charts/settings' && window.__slowSettings) return;", "if (p === 'charts/settings' && window.__slowSettings) return; if (p === 'charts/config') return;");
  const swap = (r) => r.fulfill({ contentType: 'text/javascript', body: HOLD });
  await ctx.route(/firebase-database\.js/, swap);
  await p.goto(B + 'index.html');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('rc:unlock', JSON.stringify({ always: true })); sessionStorage.setItem('mockdb', JSON.stringify({ charts: { config: { lights: { eli: '20:45' } } } })); });
  await visit('settings.html', 'settings-hold', false);
  await p.fill('#lights', '21:00'); await p.dispatchEvent('#lights', 'input');
  await p.click('#save'); await p.waitForTimeout(400);
  const msg = await p.$eval('#msg', (e) => e.textContent);
  notes.push('save while loading: ' + msg);
  check(/Still connecting/.test(msg), 'save refused while settings load');
  await p.click('#reset'); await p.waitForTimeout(400);
  const cfg = (await db()).charts.config;
  check(cfg.lights.eli === '20:45' && !cfg.history, 'nothing written (no snapshot, no change)');
  await ctx.unroute(/firebase-database\.js/, swap);
