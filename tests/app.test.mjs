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
  // Eli: 30-minute showers, same lights out every night
  [[0, 20 * 60 + 30], [1, 20 * 60 + 30], [3, 20 * 60 + 40], [4, 21 * 60], [5, 21 * 60]].forEach(([dow, lo]) => {
    const b = bedtime('eli', dow), sh = b.findIndex((x) => x.key === 'shower');
    assert.equal(b[b.length - 1].min, lo, 'Eli lights out unchanged on day ' + dow);
    assert.equal(b[sh + 1].min - b[sh].min, 30, 'Eli shower is 30 min on day ' + dow);
  });
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

test('plan: swim Mon/Thu/Fri, run Tue/Wed/Sat, trials on Saturdays (re-set Nov 17)', () => {
  assert.equal(trialOn(d('2026-11-11')), '5k');   // first test (Week 3)
  assert.equal(trialOn(d('2026-11-19')), null);   // Thursday is a swim day now
  assert.equal(trialOn(d('2026-11-21')), 'mile'); // Week 4 diagnostic, Saturday
  assert.equal(trialOn(d('2026-11-26')), '5k');   // Turkey Trot (optional)
  assert.equal(trialOn(d('2026-12-12')), 'mile');
  assert.equal(trialOn(d('2027-01-02')), '5k');
  assert.equal(trialOn(d('2027-01-16')), 'mile');
  assert.equal(trialOn(d('2027-01-23')), '5k');   // final test
  assert.equal(planFor(d('2027-02-01')), null);
  const p = planFor(d('2026-11-11'));
  assert.equal(dayDone(p, {}), false);
  assert.equal(dayDone(p, Object.fromEntries(p.items.filter((i) => !i.opt).map((i) => [i.key, true]))), true);
  for (let i = 0; i < 69; i++) {
    const day = addDays(d('2026-11-17'), i), q = planFor(day), dow = (day.getDay() + 6) % 7;
    if (q.title === 'Rest' || q.title === 'Off') continue;
    if ([0, 3, 4].includes(dow) && /Turkey Trot/.test(q.detail)) continue; // Thanksgiving race, the one exception
    if ([0, 3, 4].includes(dow)) { assert.ok(q.swim, ymd(day) + ' should be swim'); continue; }
    assert.ok([1, 2, 5].includes(dow), ymd(day) + ' runs only Tue/Wed/Sat');
    assert.ok(q.indoor && q.outdoor, ymd(day) + ' needs inside and outside');
    assert.ok(!/10\.0|6\.5 mph|7\.8–7\.9|8\.7/.test(q.indoor), 'old pace left in ' + q.indoor);
  }
  // Thursday swim + Strength B, with Home Strength as the alternative
  const thu = planFor(d('2026-12-17')).items.find((i) => i.key === 'strB');
  assert.equal(thu.routine2, 'home');
});

test('reward chart: Run or swim row from Nov 16, old row before', () => {
  const ctx = { routines: {}, run: { days: { '2026-11-16': { items: { swim: true } } } } };
  assert.equal(L.effectiveWeek(CHARTS.eli, d('2026-11-16'), {}, ctx).checks.running[0], true); // Monday swim fills the box
  assert.equal(weekProgress(CHARTS.eli, L.effectiveWeek(CHARTS.eli, d('2026-11-16'), {}, ctx)).need, 32); // + 2 evening-check rows × 7
  assert.equal(weekProgress(CHARTS.eli, L.effectiveWeek(CHARTS.eli, d('2026-11-09'), {}, ctx)).need, 17);
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

test("Rhett: trombone Fri/Sat/Sun, typing every day, chores before any computer task", () => {
  const ctx = { routines: { days: {} }, run: {}, isaiah: {} };
  const week = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22']; // Mon..Sun
  week.forEach((day, dow) => {
    const list = L.lists(ctx, 'rhett', d(day)).day;
    const keys = list.map((i) => i.key);
    assert.equal(keys.includes('typing'), true, 'typing on day ' + dow);
    assert.equal(keys.includes('trombone'), dow >= 4, 'trombone only Fri/Sat/Sun (day ' + dow + ')');
    const typing = list.find((i) => i.key === 'typing');
    assert.equal(typing.opt, undefined, 'typing is required');
    assert.match(typing.label, /10 min/);
    if (dow >= 4) assert.match(list.find((i) => i.key === 'trombone').label, dow === 4 ? /20 min/ : /30 min/);
    // every chore comes before every computer task
    const lastChore = Math.max(...list.map((i, n) => (i.chore ? n : -1)));
    const firstComputer = list.findIndex((i) => i.computer);
    assert.ok(lastChore >= 0 && firstComputer > lastChore, 'chores come first on day ' + dow);
  });
  ['eli', 'isaiah'].forEach((kid) => week.forEach((day) => {
    const keys = L.lists(ctx, kid, d(day)).day.map((i) => i.key);
    assert.equal(keys.includes('typing') || keys.includes('trombone'), false, kid + ' is unchanged');
  }));
});

test("Rhett: computer tasks stay locked until every chore is ticked", () => {
  const fri = '2026-11-20';
  const make = (checks) => ({ routines: { days: { [fri]: { rhett: checks } } }, run: {}, isaiah: {} });
  const list = (ctx) => L.lists(ctx, 'rhett', d(fri)).day;
  const computer = (ctx) => list(ctx).filter((i) => i.computer);
  assert.ok(computer(make({})).length >= 5, 'typing, Duolingo, assignments, missing, homework');
  computer(make({})).forEach((i) => assert.equal(L.lockedBy(make({}), 'rhett', d(fri), i, list(make({}))), true, i.key + ' is locked'));
  // trombone is not a computer task
  assert.equal(L.lockedBy(make({}), 'rhett', d(fri), list(make({})).find((i) => i.key === 'trombone'), list(make({}))), false);
  const chores = choreItems('rhett', 4), all = Object.fromEntries(chores.map((c) => [c.key, true]));
  const some = { [chores[0].key]: true };
  if (chores.length > 1) computer(make(some)).forEach((i) => assert.equal(L.lockedBy(make(some), 'rhett', d(fri), i, list(make(some))), true, 'one chore is not enough'));
  computer(make(all)).forEach((i) => assert.equal(L.lockedBy(make(all), 'rhett', d(fri), i, list(make(all))), false, i.key + ' opens after chores'));
  // one already ticked can still be un-ticked even if a chore is un-ticked later
  const ticked = make({ typing: true });
  assert.equal(L.lockedBy(ticked, 'rhett', d(fri), list(ticked).find((i) => i.key === 'typing'), list(ticked)), false);
});

test("Rhett: trombone box on his chart fills from the checklist (Fri-Sun)", () => {
  const mon = d('2026-11-16'), ctx = { routines: { days: { '2026-11-21': { rhett: { trombone: true } } } }, run: {}, isaiah: {} };
  assert.equal(!!L.derivedCell('trombone', 'trombone', 5, mon, ctx), true);
  assert.equal(!!L.derivedCell('trombone', 'trombone', 4, mon, ctx), false);
});


test('not able to complete: pending does not count, excused counts, reading tracks it', () => {
  const R = { '2026-11-16': { eli: { reading: true } }, '2026-11-17': { eli: { reading: '~excused', homework: '~skip' } } };
  const ctx = { routines: { days: R }, run: {}, isaiah: {} };
  const tue = d('2026-11-17');
  const bed = L.lists(ctx, 'eli', tue).bed.find((i) => i.key === 'reading');
  const hw = L.lists(ctx, 'eli', tue).day.find((i) => i.key === 'homework');
  assert.equal(L.isOn(ctx, 'eli', tue, bed), true);   // excused counts for credit
  assert.equal(L.isOn(ctx, 'eli', tue, hw), false);   // waiting for a parent: not yet
  assert.deepEqual(L.readingWeek(ctx, 'eli', d('2026-11-16'), tue), { read: 1, excused: 1, nights: 2 });
});

test('Eli game time: 30 min per full school day with both evening checks', () => {
  const day = d('2026-11-17'), ctx = { routines: { days: {} }, run: { days: {} }, isaiah: {} };
  const ls = L.lists(ctx, 'eli', day);
  const all = {};
  [...ls.day, ...ls.bed].forEach((i) => { if (!i.opt && !i.derived && !i.weekly) all[i.key] = true; });
  ctx.routines.days['2026-11-17'] = { eli: Object.assign({}, all) };
  const plan = planFor(day);
  ctx.run.days['2026-11-17'] = { items: Object.fromEntries(plan.items.filter((i) => !i.opt).map((i) => [i.key, true])) };
  assert.equal(L.gameDay(ctx, 'eli', day).earned, false);           // checks not set yet
  ctx.routines.days['2026-11-17'].eli.kind = true;
  ctx.routines.days['2026-11-17'].eli.listen = 'no';
  assert.equal(L.gameDay(ctx, 'eli', day).earned, false);           // listened: not today
  ctx.routines.days['2026-11-17'].eli.listen = true;
  assert.equal(L.gameDay(ctx, 'eli', day).earned, true);
  const g = L.gameWeek(ctx, 'eli', d('2026-11-16'));
  assert.equal(g.minutes, 30);
  assert.equal(g.max, 150);
});

test('Isaiah: no Wake up on his morning list', () => {
  for (let i = 0; i < 7; i++) assert.ok(!L.lists({ routines: {}, run: {}, isaiah: {} }, 'isaiah', addDays(d('2026-11-16'), i)).morning.some((x) => x.key === 'mWake'));
});
