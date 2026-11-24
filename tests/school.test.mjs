// The school calendar: weekdays off from the Ankeny 2026-27 table.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isSchoolDay } from '../routines.js';
const d = (s) => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };
test('days off and school days', () => {
  ['2026-11-25', '2026-11-26', '2026-11-27', '2026-12-25', '2027-01-01', '2027-01-15', '2027-01-18', '2027-02-15', '2027-03-12', '2027-03-19', '2027-04-26'].forEach((k) => assert.equal(isSchoolDay(d(k)), false, k));
  ['2026-11-24', '2026-11-30', '2027-01-04', '2027-01-14', '2027-02-26', '2027-03-22', '2027-05-28'].forEach((k) => assert.equal(isSchoolDay(d(k)), true, k));
  assert.equal(isSchoolDay(d('2026-11-28')), false, 'Saturday');
});
