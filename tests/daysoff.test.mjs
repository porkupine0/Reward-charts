// Days off (from Nov 26, 2026): no youth group, Awana or racquetball; a normal evening with the later bedtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import { bedtime, notes, afterSchool } from '../routines.js';
import { lists } from '../lists.js';
const d = (y, m, dd) => new Date(y, m - 1, dd);
const dow = (x) => (x.getDay() + 6) % 7;
const lo = (kid, x) => bedtime(kid, dow(x), x).filter((s) => !s.afterLights).slice(-1)[0];
test('tonight (Thanksgiving, Nov 26): normal evening, later bedtime, no racquetball', () => {
  assert.equal(lo('eli', d(2026, 11, 26)).min, 21 * 60, 'Eli 9:00 pm');
  assert.equal(lo('rhett', d(2026, 11, 26)).min, 21 * 60, 'Rhett 9:00 pm');
  assert.equal(lo('isaiah', d(2026, 11, 26)).min, 20 * 60 + 30, 'Isaiah 8:30 pm');
  assert.deepEqual(notes('rhett', 3, d(2026, 11, 26)).filter((n) => /Racquetball|Youth|Awana/.test(n)), []);
  const day = lists({ routines: {}, run: {}, isaiah: {} }, 'rhett', d(2026, 11, 26)).day;
  assert.ok(!day.some((i) => /Racquetball/.test(i.label)), 'no racquetball item');
  assert.ok(day.some((i) => i.key === 'activity' && /Move your body/.test(i.label)));
});
test('earlier days keep their youth group and racquetball; Wednesday night still shows home time', () => {
  assert.ok(notes('eli', 2, d(2026, 11, 25)).some((n) => /Youth group/.test(n)), 'Nov 25 kept as it was');
  assert.ok(notes('rhett', 3, d(2026, 11, 19)).some((n) => /Racquetball/.test(n)), 'a school Thursday');
  assert.ok(afterSchool('rhett', 3, null, false).some((i) => /Racquetball/.test(i.label)));
});
