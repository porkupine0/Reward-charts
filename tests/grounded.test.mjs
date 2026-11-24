// Grounded from electronics: grounded days earn nothing, the countdown, the next day to add, and the hold.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../lists.js';
const d = (s) => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };

test('a grounded day earns nothing; the day before still does', () => {
  const ctx = { routines: { grounded: { rhett: { '2026-12-08': true } } }, run: {}, isaiah: {} };
  assert.equal(L.gameDay(ctx, 'rhett', d('2026-12-08')).worth, 0);
  assert.equal(L.gameDay(ctx, 'rhett', d('2026-12-08')).grounded, true);
  assert.equal(L.gameDay(ctx, 'rhett', d('2026-12-07')).worth, 30);
});
test('countdown, adding after the last day, and the hold', () => {
  const ctx = { routines: { grounded: { isaiah: { '2026-12-01': true, '2026-12-02': true, '2026-11-20': true } } }, run: {}, isaiah: {} };
  assert.deepEqual(L.groundedAhead(ctx, 'isaiah', d('2026-12-01')).map((x) => x.day), ['2026-12-01', '2026-12-02'], 'today counts; past days drop off');
  assert.equal(L.nextGroundDay(ctx, 'isaiah', d('2026-12-01')), '2026-12-03');
  assert.equal(L.nextGroundDay(ctx, 'isaiah', d('2026-12-05')), '2026-12-05', 'after it ended: starts today');
  assert.equal(L.gameWeek(ctx, 'isaiah', d('2026-11-30'), d('2026-12-01')).hold, true);
  assert.equal(L.gameWeek(ctx, 'isaiah', d('2026-11-30'), d('2026-12-03')).hold, false);
});
test('a week set in code counts, and added days stack after it', () => {
  const ctx = { routines: {}, run: {}, isaiah: {} };
  const ahead = L.groundedAhead(ctx, 'eli', d('2026-11-27'));
  assert.deepEqual(ahead.map((x) => x.day), ['2026-11-27', '2026-11-28', '2026-11-29']);
  assert.ok(ahead.every((x) => x.fixed));
  assert.equal(L.nextGroundDay(ctx, 'eli', d('2026-11-27')), '2026-11-30');
});
