// scripts/backup.sh against a local stand-in for the database (never the real one):
// encrypted output that decrypts to the same data, nothing printed, and nothing done without a key.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFileSync, spawnSync, spawn } from 'node:child_process';
// Run the script without blocking this process (the stand-in server runs here too). Local addresses skip any proxy.
const run = (args, env) => new Promise((resolve) => {
  const c = spawn('bash', args, { env: { ...env, NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost' } });
  let out = '';
  c.stdout.on('data', (b) => { out += b; }); c.stderr.on('data', (b) => { out += b; });
  c.on('close', (status) => resolve({ status, out }));
});
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = new URL('../scripts/backup.sh', import.meta.url).pathname;
const DATA = { charts: { routines: { days: { '2026-11-18': { eli: { teeth: true, secretWord: 'ZEBRA-41' } } } } } };

// mode 'whole': charts/ can be read in one request; 'perchart': only each chart (as with rules that allow
// charts/$chart but not charts/). The top level (/.json) is always refused, like the live database (Nov 2026).
function stub(mode = 'whole') {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => {
      const one = req.url.match(/^\/charts\/([a-z-]+)\.json$/);
      const body = req.url === '/charts.json' && mode === 'whole' ? DATA.charts : one ? DATA.charts[one[1]] ?? null : undefined;
      if (body === undefined) { res.writeHead(401); res.end('{"error":"Permission denied"}'); return; }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

test('backup: encrypted, decrypts to the same data, prints none of it', async () => {
  const srv = await stub(), dir = mkdtempSync(join(tmpdir(), 'bk-')), out = join(dir, 'b.enc');
  try {
    const r = await run([SCRIPT, out], { ...process.env, BACKUP_KEY: 'test-key', DB_URL: 'http://127.0.0.1:' + srv.address().port });
    assert.equal(r.status, 0, r.out);
    assert.ok(!r.out.includes('ZEBRA-41'), 'no data in the log');
    assert.ok(!readFileSync(out).includes('ZEBRA-41'), 'the file is encrypted');
    const plain = execFileSync('bash', ['-c', 'openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_KEY -in "$0" | gunzip', out], { env: { ...process.env, BACKUP_KEY: 'test-key' } });
    assert.deepEqual(JSON.parse(plain), DATA.charts, 'the charts node (what the restore imports)');
  } finally { srv.close(); }
});

test('backup: if charts/ as a whole is refused, it reads each chart the app uses', async () => {
  const srv = await stub('perchart'), dir = mkdtempSync(join(tmpdir(), 'bk-')), out = join(dir, 'b.enc');
  try {
    const r = await run([SCRIPT, out], { ...process.env, BACKUP_KEY: 'test-key', DB_URL: 'http://127.0.0.1:' + srv.address().port });
    assert.equal(r.status, 0, r.out);
    assert.ok(!r.out.includes('ZEBRA-41'));
    const plain = JSON.parse(execFileSync('bash', ['-c', 'openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_KEY -in "$0" | gunzip', out], { env: { ...process.env, BACKUP_KEY: 'test-key' } }));
    assert.deepEqual(plain.routines, DATA.charts.routines);
    assert.ok(['config', 'settings', 'eli', 'eli-drive', 'isaiah'].every((c) => c in plain), 'every chart the app uses is in it');
  } finally { srv.close(); }
});

test('backup: does nothing without a key', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bk-')), out = join(dir, 'b.enc');
  const env = { ...process.env, DB_URL: 'http://127.0.0.1:9' }; delete env.BACKUP_KEY;
  const r = spawnSync('bash', [SCRIPT, out], { env, encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /No BACKUP_KEY/);
  assert.equal(existsSync(out), false);
});

test('backup: fails if the database can’t be read', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'bk-')), out = join(dir, 'b.enc');
  const r = await run([SCRIPT, out], { ...process.env, BACKUP_KEY: 'k', DB_URL: 'http://127.0.0.1:9' });
  assert.notEqual(r.status, 0);
});

test('backup: the address comes from config.js', () => {
  const url = execFileSync('bash', ['-c', `grep -o "databaseURL: *['\\"][^'\\"]*" config.js | sed "s/.*['\\"]//"`], { cwd: new URL('..', import.meta.url).pathname, encoding: 'utf8' }).trim();
  assert.match(url, /^https:\/\/[a-z0-9-]+.*firebase/);
});
