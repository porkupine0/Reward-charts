// Tests for the app's date, schedule and scoring rules. Run: node --test tests/
// (No browser or Firebase needed; these are the pure functions the pages use.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Load modules exactly as the pages do (with the ?v= version), so every test shares one copy of each.
const V = JSON.parse(readFileSync(new URL('../version.json', import.meta.url))).v;
const load = (f) => import('../' + f + '?v=' + V);
const { ymd, parseYmd, mondayOf, addDays } = await load('store.js');
const { bedtime, timerResult, choreItems, lightsOut, afterSchool } = await load('routines.js');
const { planFor, trialOn, dayDone } = await load('plan.js');
const { score, nextMilestone, owed, planned, MILE, FIVE, mphFor } = await load('trials.js');
const { CHARTS, weekProgress } = await load('charts.js');
const L = await load('lists.js');
const { applySettings, SETTINGS, DEFAULTS } = await load('settings.js');

const d = (s) => parseYmd(s);

test('dates: Monday, adding days, bad input', () => {
  assert.equal(ymd(mondayOf(d('2026-11-15'))), '2026-11-09'); // Sunday belongs to the week before
  assert.equal(ymd(mondayOf(d('2026-11-09'))), '2026-11-09');
  assert.equal(ymd(addDays(d('2026-10-31'), 1)), '2026-11-01');
  assert.equal(ymd(addDays(d('2026-11-01'), 1)), '2026-11-02'); // DST ends Nov 1 in the US
  assert.equal(parseYmd('2026-99-99') && ymd(parseYmd('2026-99-99')) === '2026-99-99', false);
  assert.equal(parseYmd('nope'), null);
});

test('bedtime: lights out by kid and night', () => {
  assert.equal(lightsOut('eli', 0), 20 * 60 + 30);      // Monday 8:30
  assert.equal(lightsOut('rhett', 4), 21 * 60);         // Friday: Rhett gets an extra hour
  assert.equal(lightsOut('isaiah', 4), 20 * 60 + 30);   // Friday: 30 min later
  assert.equal(lightsOut('isaiah', 3), 20 * 60);        // Thursday: done by 8:00 (shower moves earlier)
  const wed = bedtime('eli', 2);
  assert.ok(wed[0].min >= 20 * 60 + 45, 'Wednesday counts forward from getting home');
  for (const kid of ['eli', 'rhett', 'isaiah']) for (let dow = 0; dow < 7; dow++) {
    const b = bedtime(kid, dow);
    assert.equal(b[b.length - 1].key, 'lights');
    for (let i = 1; i < b.length; i++) assert.ok(b[i].min >= b[i - 1].min, kid + ' ' + dow + ' steps in order');
  }
});

test('bedtime timer: on time, grace, late, parent OK, past midnight, DST night', () => {
  const night = d('2026-11-09'); // Monday, Eli lights out 8:30
  const at = (h, m, day = night) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).getTime();
  const r = (end, extra) => timerResult('eli', night, { start: at(19, 30), end }, extra || {});
  assert.equal(r(at(20, 30)).status, 'ontime');
  assert.equal(r(at(20, 34)).status, 'grace');
  assert.equal(r(at(20, 40)).status, 'late');
  assert.equal(r(at(20, 40), { bedOk: true }).status, 'approved');
  assert.equal(r(at(0, 10, addDays(night, 1))).lateBy, 3 * 60 + 40); // 12:10 am next day
  const dst = d('2026-10-31'); // Saturday night before DST ends
  const res = timerResult('eli', dst, { start: new Date(2026, 9, 31, 20, 0).getTime(), end: new Date(2026, 9, 31, 21, 0).getTime() }, {});
  assert.equal(res.status, 'ontime'); // Sat lights out 9:00
});

test('plan: trials open Thursday workouts (re-set Nov 12)', () => {
  assert.equal(trialOn(d('2026-11-11')), '5k');   // first test (Week 3)
  assert.equal(trialOn(d('2026-11-18')), null);
  assert.equal(trialOn(d('2026-11-19')), 'mile'); // Week 4 diagnostic
  assert.equal(trialOn(d('2026-11-26')), '5k');   // Turkey Trot
  assert.equal(trialOn(d('2026-12-03')), null);   // down week
  assert.equal(trialOn(d('2026-12-10')), 'mile');
  assert.equal(trialOn(d('2026-12-31')), '5k');
  assert.equal(trialOn(d('2027-01-14')), 'mile');
  assert.equal(trialOn(d('2027-01-21')), '5k');   // final test
  assert.equal(planFor(d('2027-02-01')), null);
  const p = planFor(d('2026-11-11'));
  assert.equal(dayDone(p, {}), false);
  assert.equal(dayDone(p, Object.fromEntries(p.items.filter((i) => !i.opt).map((i) => [i.key, true]))), true);
  // every new-plan run day has an inside and an outside version; paces are the 24:30 zones
  for (let i = 0; i < 70; i++) {
    const q = planFor(addDays(d('2026-11-16'), i));
    if (q.dow > 4 || q.title === 'Off') continue;
    assert.ok(q.indoor && q.outdoor, ymd(addDays(d('2026-11-16'), i)) + ' needs inside and outside');
    assert.ok(!/10\.0|6\.5 mph|7\.8–7\.9|8\.7/.test(q.indoor), 'old pace left in ' + q.indoor);
  }
  // Strength B on Thursday always offers Home Strength
  const thu = planFor(d('2026-12-17')).items.find((i) => i.key === 'strB');
  assert.equal(thu.routine2, 'home');
});

test('trials: milestones, bests, paired ladders, owed prizes', () => {
  assert.equal(MILE.length, FIVE.length);
  for (let i = 1; i < MILE.length; i++) { assert.ok(MILE[i][0] < MILE[i - 1][0]); assert.ok(FIVE[i][0] < FIVE[i - 1][0]); }
  MILE.forEach(([s, lvl], i) => assert.equal(FIVE[i][1], lvl, 'same prize level at rung ' + i));
  const data = { trials: { a: { kind: 'mile', secs: 425, date: '2026-11-18' }, b: { kind: 'mile', secs: 404, date: '2026-12-10' } }, pick: { mile_440: 0 }, paid: { t_a: '2026-11-19' } };
  const sc = score(data);
  assert.equal(sc.best.mile, 404);
  assert.deepEqual(Object.keys(sc.hit.mile).map(Number).sort((a, b) => b - a), [440, 430, 420, 405]);
  assert.equal(sc.prs.b, 21);
  assert.equal(nextMilestone('mile', sc)[0], 390);
  const o = owed(data).map((x) => x.key);
  assert.ok(!o.some((k) => /^(t|pr)_/.test(k)), 'running a trial or a new best is not rewarded');
  assert.ok(o.includes('mile_440') && o.includes('mile_405') && o.length === 4);
  assert.equal(mphFor('mile', 420), 8.6);    // 7:00 mile -> 8.6 mph beats it (6:58.6)
  assert.equal(mphFor('5k', 1395), 8.1);     // 23:15 5K
  MILE.forEach(([s]) => assert.ok(3600 / mphFor('mile', s) < s, 'speed beats ' + s));
  // a deleted trial no longer owes anything
  assert.equal(owed({ pick: { mile_440: 0 } }).length, 0);
  const pl = planned(sc);
  assert.equal(pl[0].n, 3);
  assert.equal(pl.find((x) => x.n === 7).t.id, 'b');
});

test('lists: same items and counts the checklist uses', () => {
  const ctx = { routines: { days: { '2026-11-11': { isaiah: { clothes_shirt: true, clothes_pants: true, clothes_underwear: true, clothes_socks: true } } } }, run: {}, isaiah: { touchDays: { '2026-11-11': true } } };
  const ls = L.lists(ctx, 'isaiah', d('2026-11-11'));
  const clothes = ls.day.find((i) => i.key === 'clothes');
  assert.equal(L.isOn(ctx, 'isaiah', d('2026-11-11'), clothes), true);
  const touches = ls.day.find((i) => i.key === 'activity');
  assert.equal(touches.derived, 'touches');
  assert.equal(L.isOn(ctx, 'isaiah', d('2026-11-11'), touches), true);
  // Isaiah's weekly AELP shows Thu–Sun and counts toward the list
  const thu = L.lists(ctx, 'isaiah', d('2026-11-12')).day;
  assert.ok(thu.some((i) => i.weekly === 'aelp'));
});

test('Ball Master: old week/day ticks still read by date', () => {
  const old = { start: '2026-11-02', touches: { 1: { 2: 6 } } }; // week 2, Wednesday
  assert.equal(L.touchedOn(old, '2026-11-11'), true);
  assert.equal(L.touchedOn(old, '2026-11-12'), false);
});

test('reward charts: boxes come from the checklist, parent overrides win', () => {
  const mon = d('2026-11-09');
  const chores = Object.fromEntries(choreItems('eli', 2).map((i) => [i.key, true]));
  const ctx = { routines: { days: { '2026-11-11': { eli: { ...chores, missing: true } } } }, run: {} };
  assert.equal(L.cellOn('eli', 'chores', 2, mon, {}, ctx), true);
  assert.equal(L.cellOn('eli', 'school', 2, mon, {}, ctx), true);
  assert.equal(L.cellOn('eli', 'running', 2, mon, {}, ctx), false);
  assert.equal(L.cellOn('eli', 'chores', 2, mon, { checks: { chores: { 2: 'off' } } }, ctx), false);
  assert.equal(L.cellOn('eli', 'running', 2, mon, { checks: { running: { 2: true } } }, ctx), true);
  const items = planFor(d('2026-11-11')).items.filter((i) => !i.opt).map((i) => [i.key, true]);
  ctx.run = { days: { '2026-11-11': { items: Object.fromEntries(items) } } };
  assert.equal(L.cellOn('eli', 'running', 2, mon, {}, ctx), true);
  const p = weekProgress(CHARTS.eli, L.effectiveWeek(CHARTS.eli, mon, {}, ctx));
  assert.equal(p.done, 3);
  assert.equal(p.need, 17);
});

test('settings: parents can change chores, showers, lights and prizes', () => {
  applySettings({ lights: { eli: '21:00' }, chores: { eli: { 0: ['Dishes', ' '], 1: [''] } }, showers: { eli: [-1] }, prizeLevels: { Small: ['Gum'] } });
  assert.equal(lightsOut('eli', 0), 21 * 60);
  assert.deepEqual(choreItems('eli', 0).map((i) => i.label), ['Chore: Dishes']);
  assert.equal(choreItems('eli', 1).length, 0);
  assert.deepEqual(SETTINGS.showers.eli, []);
  assert.deepEqual(SETTINGS.prizeLevels.Small, ['Gum']);
  assert.equal(CHARTS.eli.weekly.length, DEFAULTS.rewards.eli.weekly.length);
  applySettings(null);
  assert.equal(lightsOut('eli', 0), 20 * 60 + 30);
  assert.ok(afterSchool('eli', 0, null).some((i) => i.key === 'chore'));
});

test('right now: what shows depends on the time of day', () => {
  const ctx = { routines: {}, run: {}, isaiah: {} };
  const at = (h, m) => new Date(2026, 10, 11, h, m); // a Wednesday
  assert.equal(L.nowStatus(ctx, 'isaiah', at(7, 0)).phase, 'morning');
  assert.equal(L.nowStatus(ctx, 'eli', at(7, 0)).title, 'Before school');
  assert.equal(L.nowStatus(ctx, 'eli', at(11, 0)).title, 'At school');
  const after = L.nowStatus(ctx, 'eli', at(16, 0));
  assert.equal(after.phase, 'day');
  assert.ok(after.left.length > 3);
  const bed = L.nowStatus(ctx, 'isaiah', at(20, 30));
  assert.equal(bed.phase, 'bed');
  assert.match(bed.sub, /still left from after school/);
  assert.equal(L.nowStatus(ctx, 'eli', at(23, 0)).phase, 'late');
  const allBed = Object.fromEntries(L.lists(ctx, 'eli', at(0, 0)).bed.map((i) => [i.key, true]));
  assert.equal(L.nowStatus({ routines: { days: { '2026-11-11': { eli: allBed } } }, run: {}, isaiah: {} }, 'eli', at(23, 0)).title, 'In bed');
  // Saturday: no school, the day list shows from the morning
  assert.equal(L.nowStatus(ctx, 'rhett', new Date(2026, 10, 14, 11, 0)).title, 'Today');
});
