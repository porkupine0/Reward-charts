// The offline save queue's rules (queue.js), and store.js using them with phone storage but no network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const V = JSON.parse(readFileSync(new URL('../version.json', import.meta.url))).v;
const Q = await import('../queue.js?v=' + V);

test('queue: clearing a path drops queued writes beneath it (timer reset while offline)', () => {
  const t = 'routines/days/2026-11-18/eli/bedTimer';
  let q = [];
  q = Q.enqueue(q, t, { start: 1 });
  q = Q.enqueue(q, t + '/end', 2);
  q = Q.enqueue(q, t, null);
  assert.deepEqual(q.map((e) => [e.path, e.v]), [[t, null]]);
});

test('queue: a path queued again moves to the end and keeps its first base', () => {
  let q = [];
  q = Q.enqueue(q, 'r/a', 1, 'server-a');
  q = Q.enqueue(q, 'r/b', 2, 'server-b');
  q = Q.enqueue(q, 'r/a', 3, 'something-later');
  assert.deepEqual(q, [{ path: 'r/b', v: 2, base: 'server-b' }, { path: 'r/a', v: 3, base: 'server-a' }]);
});

test("queue: a child written after its parent stays (it's applied after)", () => {
  let q = [];
  q = Q.enqueue(q, 'r/t', { start: 1 });
  q = Q.enqueue(q, 'r/t/end', 2);
  assert.deepEqual(q.map((e) => e.path), ['r/t', 'r/t/end']);
});

test('queue: on reconnect, send only if the server still has what we last saw', () => {
  assert.equal(Q.decide({ path: 'r/x', v: true, base: null }, null), 'send');
  assert.equal(Q.decide({ path: 'r/x', v: true, base: null }, 'no'), 'conflict', 'another phone said Not today');
  assert.equal(Q.decide({ path: 'r/x', v: true, base: null }, true), 'done', 'already there');
  assert.equal(Q.decide({ path: 'r/x', v: true }, 'no'), 'send', 'older entries without a base are sent as before');
});

test('queue: older stored format is still read; confirm removes the matching entry', () => {
  const q = Q.fromStored({ 'routines/a': 1, 'routines/b': null });
  assert.deepEqual(q, [{ path: 'routines/a', v: 1 }, { path: 'routines/b', v: null }]);
  assert.deepEqual(Q.confirm(q, 'routines/a', 1), [{ path: 'routines/b', v: null }]);
  assert.deepEqual(Q.confirm(q, 'routines/a', 2), q, 'a different value is not confirmed');
  assert.equal(Q.getAt({ a: { b: 3 } }, 'a/b'), 3);
});

test('store: the timer reset case end to end (phone storage, no network)', async () => {
  const m = new Map();
  globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  const s = await import('../store.js?v=' + V + '&t=reset');
  let last; s.watch('routines', (d) => { last = d; });
  const t = 'days/2026-11-18/eli/bedTimer';
  await s.save('routines', t, { start: 1 });
  await s.save('routines', t + '/end', 2);
  await s.save('routines', t, null);
  assert.equal(Q.getAt(last, t), undefined, 'the cleared timer stays cleared on this phone');
  const stored = Q.fromStored(JSON.parse(m.get('rc:queue') || m.get('rc:pending') || '[]'));
  assert.deepEqual(stored.map((e) => [e.path, e.v]), [['routines/' + t, null]], 'and in what will be replayed');
});

test('queue: a quick correction (Yes, then Not today before Yes is confirmed) is sent, not dropped', () => {
  const k = 'routines/days/2026-11-18/rhett/noLies';
  let q = Q.enqueue([], k, true, null);   // Yes (server had nothing)
  q = Q.enqueue(q, k, 'no', 'ignored');   // Not today, before Yes is confirmed: keeps base null
  q = Q.acked(q, k, true);                // the server confirms Yes
  assert.deepEqual(q, [{ path: k, v: 'no', base: true }]);
  assert.equal(Q.decide(q[0], true), 'send', 'the server has Yes, which is what this phone last sent');
  q = Q.acked(q, k, 'no');
  assert.deepEqual(q, []);
});

test('queue: an entry dropped during a pass is not sent', () => {
  const t = 'r/t';
  let q = Q.enqueue([], t + '/end', 2);
  const snapshot = q.slice();
  q = Q.enqueue(q, t, null); // the parent was cleared while the pass was running
  assert.equal(Q.has(q, snapshot[0]), false);
});

test('store: two pages on one phone keep each other’s queued taps', async () => {
  const m = new Map();
  globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  const A = await import('../store.js?v=' + V + '&t=pageA');
  const B = await import('../store.js?v=' + V + '&t=pageB');
  A.watch('routines', () => {}); B.watch('eli-run', () => {});
  await B.save('eli-run', 'days/2026-11-18/items/swim', true);   // Training page, offline
  await A.save('routines', 'days/2026-11-18/eli/reading', true); // back on the checklist
  const stored = Q.fromStored(JSON.parse(m.get('rc:queue'))).map((e) => e.path);
  assert.deepEqual(stored, ['eli-run/days/2026-11-18/items/swim', 'routines/days/2026-11-18/eli/reading']);
});

test('store: the old rc:pending is moved over before it is removed', async () => {
  const m = new Map([['rc:pending', JSON.stringify({ 'routines/days/2026-11-18/eli/teeth': true })]]);
  globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  const s = await import('../store.js?v=' + V + '&t=migrate');
  let last; s.watch('routines', (d) => { last = d; });
  assert.equal(Q.getAt(last, 'days/2026-11-18/eli/teeth'), true);
  assert.equal(m.has('rc:pending'), false);
  assert.deepEqual(Q.fromStored(JSON.parse(m.get('rc:queue'))).map((e) => e.path), ['routines/days/2026-11-18/eli/teeth']);
});

test('store: a save to a chart this page has no copy of carries no base (sent as before)', async () => {
  const m = new Map();
  globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  const s = await import('../store.js?v=' + V + '&t=unwatched');
  await s.save('trombone', 'weeks/2026-11-16/given', true);
  const e = Q.fromStored(JSON.parse(m.get('rc:queue')))[0];
  assert.equal(e.path, 'trombone/weeks/2026-11-16/given');
  assert.equal('base' in e, false);
});

test('store: phone storage full: the tap still shows, and the problem is reported', async () => {
  const m = new Map();
  globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { if (k === 'rc:queue') throw new Error('QuotaExceededError'); m.set(k, String(v)); }, removeItem: (k) => m.delete(k) };
  const s = await import('../store.js?v=' + V + '&t=full');
  let last; s.watch('routines', (d) => { last = d; });
  await s.save('routines', 'days/2026-11-18/eli/teeth', true);
  assert.equal(Q.getAt(last, 'days/2026-11-18/eli/teeth'), true, 'shows on this phone');
  assert.equal(s.syncProblems().storage, true);
  assert.equal(s.syncProblems().queued, 1, 'kept in memory to send');
});
