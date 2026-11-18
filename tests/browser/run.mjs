// Runs every browser test: the full suite and each case in tests/browser/cases/, against a local copy
// of the site with a stand-in for Firebase (never the real database). Used here and in CI.
// Usage (from the repo folder): node tests/browser/run.mjs [case-name ...]
// Exits non-zero if the server can't start or any check fails.
import { spawn, execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;
const PORT = process.env.PORT || '8765';
const OUT = join(ROOT, 'tests/browser/.out'); // generated scripts (git-ignored); inside the repo so `playwright` resolves
mkdirSync(OUT, { recursive: true });
const env = { ...process.env, PORT, TZ: process.env.TZ || 'UTC', SHOTS: process.env.SHOTS || OUT };

// 1. the web server
const server = spawn('python3', ['-m', 'http.server', PORT, '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
const stop = () => { try { server.kill(); } catch (e) {} };
process.on('exit', stop);
async function up() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/index.html'); if (r.ok) return true; } catch (e) {}
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}
if (!(await up())) { console.error('The local web server did not start on port ' + PORT + '.'); process.exit(2); }

// 2. the scripts: full.js, then each case built from full.js's setup
const only = process.argv.slice(2);
const runs = [['full', join(ROOT, 'tests/browser/full.js')]];
for (const f of readdirSync(join(ROOT, 'tests/browser/cases')).filter((f) => f.endsWith('.body.js')).sort()) {
  const name = f.replace('.body.js', ''), file = join(OUT, name + '.js');
  writeFileSync(file, execFileSync('python3', [join(ROOT, 'tests/browser/mkcase.py'), join(ROOT, 'tests/browser/cases', f)], { encoding: 'utf8' }));
  runs.push([name, file]);
}
const run = (file) => new Promise((resolve) => {
  const c = spawn(process.execPath, [file], { cwd: ROOT, env });
  let out = '';
  c.stdout.on('data', (b) => { out += b; }); c.stderr.on('data', (b) => { out += b; });
  const t = setTimeout(() => { c.kill(); out += '\nTIMED OUT'; }, 300000);
  c.on('close', (code) => { clearTimeout(t); resolve({ code, out }); });
});

let failed = 0;
for (const [name, file] of runs.filter(([n]) => !only.length || only.includes(n))) {
  const { code, out } = await run(file);
  const ok = code === 0 && /NO ISSUES\s*$/.test(out);
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) { failed++; console.log(out.split('\n').map((l) => '     ' + l).join('\n')); }
}
console.log(failed ? failed + ' failed' : 'all browser tests passed');
stop();
process.exit(failed ? 1 : 0);
