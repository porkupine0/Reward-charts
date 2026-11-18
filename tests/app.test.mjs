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
const { CHARTS, weekProgress, rowsFor } = await load('charts.js');
const L = await load('lists.js');
const { applySettings, SETTINGS, DEFAULTS, snapshotToSave, atDate } = await load('settings.js');

const d = (s) => parseYmd(s);
// Monday's and Tuesday's chores (week of Nov 16) done, for tests about later days that week
const monTue = (kid) => ({ '2026-11-16': { [kid]: { chore: true, chore2: true } }, '2026-11-17': { [kid]: { chore: true } } });

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
  assert.equal(trialOn(d('2027-01-23')), '5k');   // 5K (the final one is now Feb 27)
  assert.equal(planFor(d('2027-03-01')), null);
  const p = planFor(d('2026-11-11'));
  assert.equal(dayDone(p, {}), false);
  assert.equal(dayDone(p, Object.fromEntries(p.items.filter((i) => !i.opt).map((i) => [i.key, true]))), true);
  for (let i = 0; i < 104; i++) { // through Feb 28
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
  // Wed and Thu chores are done, so only today's chores matter here
  const make = (checks) => ({ routines: { days: { [fri]: { rhett: checks }, '2026-11-16': { rhett: { chore: true, chore2: true } }, '2026-11-17': { rhett: { chore: true } }, '2026-11-18': { rhett: { chore: true } }, '2026-11-19': { rhett: { chore: true } } } }, run: {}, isaiah: {} });
  const list = (ctx) => L.lists(ctx, 'rhett', d(fri)).day;
  const computer = (ctx) => list(ctx).filter((i) => i.computer);
  assert.ok(computer(make({})).length >= 5, 'typing, Duolingo, assignments, missing, homework');
  computer(make({})).forEach((i) => assert.equal(L.lockedBy(make({}), 'rhett', d(fri), i, list(make({}))), 'chores', i.key + ' is locked'));
  // trombone is not a computer task
  assert.equal(L.lockedBy(make({}), 'rhett', d(fri), list(make({})).find((i) => i.key === 'trombone'), list(make({}))), false);
  const chores = choreItems('rhett', 4), all = Object.fromEntries(chores.map((c) => [c.key, true]));
  const some = { [chores[0].key]: true };
  if (chores.length > 1) computer(make(some)).forEach((i) => assert.equal(L.lockedBy(make(some), 'rhett', d(fri), i, list(make(some))), 'chores', 'one chore is not enough'));
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
  const day = d('2026-11-17'), ctx = { routines: { days: { '2026-11-16': { eli: { chore: true, chore2: true } } } }, run: { days: {} }, isaiah: {} };
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

test("charts: from Nov 16 every box on every chart comes from the checklist", () => {
  const mon = d('2026-11-16'), ctx = { routines: {}, run: {}, isaiah: {} };
  Object.values(CHARTS).forEach((ch) => rowsFor(ch, mon).forEach((r) => r.cells.forEach((c, i) => {
    if (c === '-') return;
    assert.notEqual(L.derivedCell(ch.id, r.key, i, mon, ctx), undefined, ch.id + ' ' + r.key + ' day ' + i + ' is tied to the checklist');
  })));
  // a stored hand tick no longer counts from that week on, but still does before it
  const wd = { checks: { chores: { 0: true } } };
  assert.equal(L.cellOn('trombone', 'chores', 0, mon, wd, ctx), false);
  assert.equal(L.cellOn('trombone', 'chores', 0, d('2026-11-09'), wd, ctx), true);
});

test("Rhett & Isaiah: three evening checks, game time, and their chart boxes", () => {
  const mon = d('2026-11-16'), wed = '2026-11-18';
  assert.deepEqual(L.CHECKS.rhett.map((k) => k.key), ['noYell', 'firstTime', 'noLies']);
  assert.deepEqual(L.CHECKS.isaiah.map((k) => k.key), ['noYell', 'firstTime', 'noLies']);
  const ctx = { routines: { days: { [wed]: { rhett: { noYell: true, firstTime: true, noLies: 'no' } } } }, run: {}, isaiah: {} };
  const g = L.gameDay(ctx, 'rhett', d(wed));
  assert.equal(g.earned, false);
  assert.ok(g.left.some((x) => /No lies today: not today/.test(x)));
  assert.equal(!!L.derivedCell('trombone', 'noYell', 2, mon, ctx), true);
  assert.equal(!!L.derivedCell('trombone', 'noLies', 2, mon, ctx), false);
  assert.equal(L.gameWeek(ctx, 'isaiah', mon).max, 150);
  // Rhett's Saturday move is on his checklist now
  assert.ok(L.lists(ctx, 'rhett', d('2026-11-21')).day.some((i) => i.key === 'activity'));
});

test("game time used is logged in pieces: earned, used, left", () => {
  const mon = d('2026-11-16'), ctx = { routines: { game: { eli: { '2026-11-16': { 1000: 30, 2000: 15, 3000: null } } } }, run: {}, isaiah: {} };
  const g = L.gameWeek(ctx, 'eli', mon);
  assert.equal(g.used, 45);
  assert.equal(g.uses.length, 2);
  assert.equal(g.left, 0); // nothing earned in this test, so nothing left
});

test("not able to: Eli's run/swim and Isaiah's soccer can be excused by a parent", () => {
  const tue = '2026-11-17', mon = d('2026-11-16');
  const ctx = (v) => ({ routines: { days: { [tue]: { eli: { activity: v }, isaiah: { activity: v } } } }, run: {}, isaiah: {} });
  const act = (c, kid) => L.lists(c, kid, d(tue)).day.find((i) => i.key === 'activity');
  assert.equal(L.isOn(ctx('~skip'), 'eli', d(tue), act(ctx('~skip'), 'eli')), false, 'asking is not enough');
  assert.equal(L.isOn(ctx('~excused'), 'eli', d(tue), act(ctx('~excused'), 'eli')), true);
  assert.equal(L.isOn(ctx('~excused'), 'isaiah', d(tue), act(ctx('~excused'), 'isaiah')), true);
  assert.equal(!!L.derivedCell('eli', 'running', 1, mon, ctx('~excused')), true);
  assert.equal(!!L.derivedCell('zay', 'soccer', 1, mon, ctx('~excused')), true);
});

test("a chore missed earlier this week: locks screen/school tasks, stops today's game time, can be excused", () => {
  const thu = '2026-11-19', wed = '2026-11-18';
  const make = (kid, wedChore) => ({ routines: { days: Object.assign(monTue(kid), { [wed]: { [kid]: { chore: wedChore } } }) }, run: {}, isaiah: {} });
  // Isaiah: nothing on his list locks, but no game time today until it's done or excused
  const iz = make('isaiah', null), day = L.lists(iz, 'isaiah', d(thu)).day, bed = L.lists(iz, 'isaiah', d(thu)).bed;
  const owed = L.choresOwed(iz, 'isaiah', d(thu));
  assert.equal(owed.length, 1);
  assert.equal(ymd(owed[0].date), wed);
  assert.equal(L.lockedBy(iz, 'isaiah', d(thu), day.find((i) => i.key === 'afterSnack'), day), false, 'snack stays open');
  day.forEach((i) => assert.equal(L.lockedBy(iz, 'isaiah', d(thu), i, day), false, i.key + ' open for Isaiah'));
  bed.forEach((i) => assert.equal(L.lockedBy(iz, 'isaiah', d(thu), i, bed), false, 'bedtime untouched'));
  assert.ok(L.gameDay(iz, 'isaiah', d(thu)).left.some((x) => /Wednesday’s chore first/.test(x)));
  assert.ok(L.gameDay(make('isaiah', '~skip'), 'isaiah', d(thu)).left.some((x) => /chore first/.test(x)), 'waiting for OK still owes it');
  assert.equal(L.choresOwed(make('isaiah', '~excused'), 'isaiah', d(thu)).length, 0, 'approved excuse clears it');
  assert.equal(L.choresOwed(make('isaiah', true), 'isaiah', d(thu)).length, 0);
  // Rhett: computer tasks lock, run/move/snack don't
  const rh = make('rhett', null), rday = L.lists(rh, 'rhett', d(thu)).day;
  assert.equal(L.lockedBy(rh, 'rhett', d(thu), rday.find((i) => i.key === 'homework'), rday), 'owed');
  assert.equal(L.lockedBy(rh, 'rhett', d(thu), rday.find((i) => i.key === 'afterSnack'), rday), false);
  assert.equal(L.lockedBy(rh, 'rhett', d(thu), rday.find((i) => i.key === 'activity'), rday), false);
  // Eli: homework locks, his run never does
  const el = make('eli', null), eday = L.lists(el, 'eli', d(thu)).day;
  assert.equal(L.lockedBy(el, 'eli', d(thu), eday.find((i) => i.key === 'homework'), eday), 'owed');
  assert.equal(L.lockedBy(el, 'eli', d(thu), eday.find((i) => i.key === 'activity'), eday), false);
  // Monday and Tuesday of that week count too; the week before doesn't
  assert.equal(L.choresOwed({ routines: {}, run: {}, isaiah: {} }, 'isaiah', d('2026-11-18')).length, 3); // Monday's two and Tuesday's one
  assert.equal(L.choresOwed({ routines: {}, run: {}, isaiah: {} }, 'isaiah', d('2026-11-16')).length, 0);
});

test("style.css: no colour variable is defined as itself (it would render as nothing)", () => {
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const self = [...css.matchAll(/(--[\w-]+)\s*:\s*var\(\s*(--[\w-]+)\s*\)/g)].filter((m) => m[1] === m[2]).map((m) => m[1]);
  assert.deepEqual(self, []);
});

// Every chart box must have a checklist item behind it: when a kid does everything on that day's
// checklist (and Training / Ball Master), every required box fills; and a required box must
// match a required checklist item (an optional or missing item can't back a required box).
test("charts: every required box is backed by a required checklist item, Nov 16 to Mar 14", () => {
  const SOURCE = { running: ['activity'], school: ['missing'], move: ['activity'], racquetball: ['activity'], typing: ['typing'], trombone: ['trombone'], duolingo: ['duolingo'], soccer: ['activity'] };
  const bad = [], routines = { days: {} }, run = { days: {} }, isaiah = { touchDays: {} };
  for (let day = d('2026-11-16'); ymd(day) <= '2027-03-14'; day = addDays(day, 1)) {
    const k = ymd(day), mon = mondayOf(day), i = L.dowOf(day);
    routines.days[k] = {}; isaiah.touchDays[k] = true; // earlier days stay done too
    for (const kid of ['eli', 'rhett', 'isaiah']) {
      const c = routines.days[k][kid] = {};
      const ls = L.lists({ routines: {}, run: {}, isaiah: {} }, kid, day);
      [...ls.morning, ...ls.day, ...ls.bed].forEach((it) => { if (it.parts) it.parts.forEach((p) => { c[L.partKey(it.key, p)] = true; }); else c[it.key] = it.choices ? it.choices[0] : true; });
      (L.CHECKS[kid] || []).forEach((x) => { c[x.key] = true; });
    }
    const p = planFor(day);
    if (p) run.days[k] = { items: Object.fromEntries(p.items.map((x) => [x.key, true])) };
    const ctx = { routines, run, isaiah };
    for (const ch of Object.values(CHARTS)) {
      const kid = ch.kidId, ls = L.lists({ routines: {}, run: {}, isaiah: {} }, kid, day), all = [...ls.day, ...ls.bed];
      rowsFor(ch, mon).forEach((r) => {
        const cell = r.cells[i];
        if (cell === '-' || (cell && cell.opt) || ymd(mon) < '2026-11-16') return;
        const where = ch.id + ' ' + r.key + ' ' + k;
        if (!L.derivedCell(ch.id, r.key, i, mon, ctx)) bad.push(where + ' (does not fill)');
        const keys = SOURCE[r.key];
        if (keys) keys.forEach((key) => { const it = all.find((x) => x.key === key); if (!it || it.opt) bad.push(where + ' (checklist item ' + (it ? 'optional' : 'missing') + ')'); });
      });
    }
    // with everything ticked (weekly items too), a school day earns its game time
    for (const kid of ['eli', 'rhett', 'isaiah']) {
      if (!L.GAME.days.includes(i)) continue;
      const w = (ctx.routines.weekly = ctx.routines.weekly || {})[kid] = ctx.routines.weekly[kid] || {};
      L.lists({ routines: {}, run: {}, isaiah: {} }, kid, day).day.filter((x) => x.weekly).forEach((x) => { (w[x.weekly] = w[x.weekly] || {})[L.cycleOf(day, L.weeklyDef(kid, x.weekly).start)] = k; });
      const g = L.gameDay(ctx, kid, day);
      if (g.left.length) bad.push(kid + ' game time ' + k + ' (left: ' + g.left.join(', ') + ')');
    }
  }
  assert.deepEqual(bad, []);
});

test("Parents 'This week' counts Monday through today, whatever the time", () => {
  assert.equal(L.daysSoFar(new Date(2026, 10, 18, 15, 0)), 3); // Wed 3 pm
  assert.equal(L.daysSoFar(new Date(2026, 10, 18, 23, 59)), 3);
  assert.equal(L.daysSoFar(new Date(2026, 10, 16, 0, 1)), 1); // Monday
  assert.equal(L.daysSoFar(new Date(2026, 10, 22, 12, 0)), 7); // Sunday
});

test("Eli's run/swim box labels follow the plan day", () => {
  const rows = rowsFor(CHARTS.eli, d('2026-11-23')), r = rows.find((x) => x.key === 'running');
  assert.equal(r.cells[3].t, 'Run'); // Thanksgiving: Turkey Trot
  assert.equal(r.cells[3].opt, true);
  assert.equal(r.cells[4].t, 'Swim');
  const xmas = rowsFor(CHARTS.eli, d('2026-12-21')).find((x) => x.key === 'running');
  assert.equal(xmas.cells[4].t, 'Off'); // Christmas Day: planned day off, fills itself
});

test("game time a missed chore holds back: school days only", () => {
  const ctx = { routines: { days: monTue('isaiah') }, run: {}, isaiah: {} };
  // Wednesday's chore missed, seen Thursday: Wednesday's and Thursday's 30 min
  assert.equal(L.owedHeld(ctx, 'isaiah', d('2026-11-19')), 60);
  // Saturday, Wed-Fri chores missed: those three school days, nothing for Saturday itself
  assert.equal(L.owedHeld(ctx, 'isaiah', d('2026-11-21')), 90);
  // Saturday, only Friday's chore missed
  const fri = { routines: { days: { ...monTue('isaiah'), '2026-11-18': { isaiah: { chore: true } }, '2026-11-19': { isaiah: { chore: true } } } }, run: {}, isaiah: {} };
  assert.equal(L.owedHeld(fri, 'isaiah', d('2026-11-21')), 30);
  // Sunday, only Saturday's chore missed: no game time is at stake
  const sat = { routines: { days: { ...monTue('isaiah'), '2026-11-18': { isaiah: { chore: true } }, '2026-11-19': { isaiah: { chore: true } }, '2026-11-20': { isaiah: { chore: true } } } }, run: {}, isaiah: {} };
  assert.equal(L.choresOwed(sat, 'isaiah', d('2026-11-22')).length, 1);
  assert.equal(L.owedHeld(sat, 'isaiah', d('2026-11-22')), 0);
});

test("Tonight card: which evening, the checks, and All good never overrides Not today", () => {
  assert.equal(ymd(L.tonightDate(new Date(2026, 10, 19, 2, 30))), '2026-11-18', 'before 5 am is still last night');
  assert.equal(ymd(L.tonightDate(new Date(2026, 10, 18, 21, 0))), '2026-11-18');
  const wed = '2026-11-18', ctx = { routines: { days: { [wed]: { rhett: { noYell: true, noLies: 'no', homework: '~skip' } } } }, run: {}, isaiah: {} };
  const t = L.tonight(ctx, d(wed));
  assert.deepEqual(t.map((x) => x.kid), ['eli', 'rhett', 'isaiah']);
  const r = t.find((x) => x.kid === 'rhett');
  assert.deepEqual(r.checks.map((x) => x.value), ['yes', null, 'no']);
  assert.equal(r.open, 1);
  assert.deepEqual(r.excuses.map((x) => x.key), ['homework']);
  assert.deepEqual(L.allGoodKeys(ctx, 'rhett', d(wed)), ['firstTime'], 'only the unanswered one');
  assert.deepEqual(L.allGoodKeys(ctx, 'isaiah', d(wed)), ['noYell', 'firstTime', 'noLies']);
  assert.equal(L.tonight(ctx, d('2026-11-21')).find((x) => x.kid === 'isaiah').checks.length, 3, 'weekends too');
});

test("clearing old logs: only checklist days past the 2-year look-back; nothing that shows changes", async () => {
  const P = await load('prune.js'), S = await load('streaks.js'), O = await load('owed.js');
  const today = new Date(2028, 10, 22, 12); // two years on
  const routines = { days: {} }, run = { days: {} };
  const tick = (k, kid) => { const c = routines.days[k] = routines.days[k] || {}; const ls = L.lists({ routines: {}, run: {}, isaiah: {} }, kid, d(k)); c[kid] = {}; [...ls.morning, ...ls.day, ...ls.bed].forEach((it) => { if (it.parts) it.parts.forEach((p) => { c[kid][L.partKey(it.key, p)] = true; }); else c[kid][it.key] = it.choices ? it.choices[0] : true; }); };
  ['2026-10-05', '2026-10-06', '2026-11-02'].forEach((k) => { tick(k, 'rhett'); run.days[k] = { items: { run: true } }; });
  for (let i = 1; i <= 20; i++) { const k = ymd(addDays(today, -i)); tick(k, 'rhett'); tick(k, 'isaiah'); }
  const D = { routines, 'eli-run': run, isaiah: {}, eli: {}, trombone: {}, zay: {}, 'eli-trials': {}, config: {} };
  // the boundary: a day on the cutoff stays, the day before goes; the cutoff is no later than the
  // earliest week the perfect-week streak can reach (this Monday minus 104 weeks)
  const cut = P.pruneCutoff(today);
  assert.ok(cut <= ymd(addDays(mondayOf(today), -7 * 104)));
  const edge = { routines: { days: { [cut]: {}, [ymd(addDays(d(cut), -1))]: {} } } };
  assert.deepEqual(P.pruneList(edge, today), [['routines', 'days/' + ymd(addDays(d(cut), -1))]]);
  const list = P.pruneList(D, today);
  assert.ok(list.length >= 1, 'old days are listed');
  assert.ok(list.every(([id, path]) => id === 'routines' && path.slice(5) < P.pruneCutoff(today)), 'only older checklist days');
  assert.ok(!list.some(([id]) => id === 'eli-run'), 'never Eli’s Training log');
  const view = (DD) => {
    const ctx = { routines: DD.routines, run: DD['eli-run'], isaiah: DD.isaiah };
    return JSON.stringify({
      streaks: ['eli', 'rhett', 'isaiah'].map((k) => S.dayStreak(ctx, k, today)),
      weeks: Object.values(CHARTS).map((ch) => S.weekStreak(ch, DD[ch.id], ctx, today)),
      progress: Object.values(CHARTS).map((ch) => weekProgress(ch, L.effectiveWeek(ch, mondayOf(today), {}, ctx))),
      owed: O.owedItems(DD, ctx, (...a) => a.join('|'), (...a) => a.join('|'))
    });
  };
  const before = view(D);
  assert.ok(JSON.parse(before).streaks[1] > 0, 'Rhett has a streak, so the comparison means something');
  const after = JSON.parse(JSON.stringify(D));
  list.forEach(([, path]) => { delete after.routines.days[path.slice(5)]; });
  assert.equal(view(after), before);
  assert.equal(Object.keys(after['eli-run'].days).length, 3);
});

test("settings changes apply from the day they're saved; earlier days keep what they had", () => {
  const before = JSON.parse(JSON.stringify(SETTINGS));
  // seeded data: every other day fully done, a bedtime timer every night
  const routines = { days: {} };
  for (let day = d('2026-11-16'); ymd(day) <= '2026-12-31'; day = addDays(day, 1)) {
    const k = ymd(day), c = routines.days[k] = {};
    for (const kid of ['eli', 'rhett', 'isaiah']) {
      c[kid] = { bedTimer: { start: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 19, 30).getTime(), end: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 20, 20).getTime() } };
      if (day.getDate() % 2) {
        const ls = L.lists({ routines: {}, run: {}, isaiah: {} }, kid, day);
        [...ls.morning, ...ls.day, ...ls.bed].forEach((it) => { if (it.parts) it.parts.forEach((p) => { c[kid][L.partKey(it.key, p)] = true; }); else c[kid][it.key] = it.choices ? it.choices[0] : true; });
        (L.CHECKS[kid] || []).forEach((x) => { c[kid][x.key] = true; });
      }
    }
  }
  const ctx = { routines, run: {}, isaiah: {} };
  const record = () => {
    const out = {};
    for (let day = d('2026-11-16'); ymd(day) <= '2026-12-31'; day = addDays(day, 1)) {
      const k = ymd(day), mon = mondayOf(day), i = L.dowOf(day);
      out[k] = JSON.stringify(['eli', 'rhett', 'isaiah'].map((kid) => {
        const ls = L.lists(ctx, kid, day), c = L.dayChecks(ctx, kid, day);
        return { ls: [ls.day, ls.bed].map((l) => l.map((x) => x.key + (x.time || ''))), full: L.progress(ctx, kid, day, ls.day).left.length,
          game: L.gameDay(ctx, kid, day).earned, bed: timerResult(kid, day, c.bedTimer, c) };
      }).concat(Object.values(CHARTS).map((ch) => rowsFor(ch, mon).map((r) => r.cells[i] === '-' ? '-' : !!L.derivedCell(ch.id, r.key, i, mon, ctx)))));
    }
    return out;
  };
  const was = record();
  // a change saved Dec 1: Rhett gets a second Tuesday chore, Isaiah's Monday shower moves to Tuesday, Eli's lights out moves
  const cfg = { chores: { rhett: SETTINGS.chores.rhett.map((x, i) => (i === 1 ? x.concat('Wipe the bathroom mirrors') : x)) },
    showers: { isaiah: [1, 3, 5] }, lights: { eli: '20:00' } };
  const snap = (applySettings({}), { chores: SETTINGS.chores, showers: SETTINGS.showers, lights: SETTINGS.lights });
  applySettings(Object.assign({}, cfg, { history: { '2026-12-01': JSON.parse(JSON.stringify(snap)) } }));
  const now = record();
  const changed = Object.keys(was).filter((k) => was[k] !== now[k]);
  assert.ok(changed.length > 0, 'the change shows from Dec 1');
  assert.deepEqual(changed.filter((k) => k < '2026-12-01'), [], 'no day before Dec 1 changed');
  assert.ok(changed.includes('2026-12-01') && changed.includes('2026-12-08'), 'Tuesdays from Dec 1 have the new chore');
  // two saves on one day keep the first snapshot
  const SM = SETTINGS; // the Settings page asks before writing
  assert.equal(snapshotToSave({ history: { '2026-12-01': {} } }, new Date(2026, 11, 1, 18)), null);
  assert.equal(snapshotToSave({}, new Date(2026, 11, 1, 18)).key, '2026-12-01');
  assert.ok(SM);
  applySettings({}); // back to the defaults for the other tests
  assert.deepEqual(JSON.parse(JSON.stringify(SETTINGS)), before);
});

test("settings by date: nested lookups and empty lists in a snapshot", () => {
  const snap = (applySettings({}), JSON.parse(JSON.stringify({ chores: SETTINGS.chores, showers: SETTINGS.showers, lights: SETTINGS.lights })));
  const cfg = { chores: { rhett: SETTINGS.chores.rhett.map((x, i) => (i === 1 ? ['Garage sweep'] : x)) }, history: { '2026-12-01': snap } };
  applySettings(cfg);
  // the checklist page for Nov 20 works out a streak from today (Dec 8): Dec 8 uses the current settings
  const inner = atDate(d('2026-11-20'), () => L.lists({ routines: {}, run: {}, isaiah: {} }, 'rhett', d('2026-12-08')).day.filter((i) => i.chore).map((i) => i.label));
  assert.deepEqual(inner, ['Chore: Garage sweep']);
  // empty lists survive a snapshot (Firebase drops them; they're encoded and read back as empty)
  applySettings({ showers: { isaiah: [-1] }, chores: { isaiah: [[''], ['Kitchen'], [], [], [], [], []] } });
  const s2 = snapshotToSave({}, new Date(2026, 11, 10)).value;
  const viaFirebase = JSON.parse(JSON.stringify(s2)); // what comes back
  applySettings({ history: { '2026-12-10': viaFirebase } });
  atDate(d('2026-12-09'), () => {
    assert.deepEqual(SETTINGS.showers.isaiah, [], 'no shower nights stays empty');
    assert.deepEqual(SETTINGS.chores.isaiah[0], [], 'an empty chore day stays empty');
    assert.deepEqual(SETTINGS.chores.isaiah[1], ['Kitchen']);
  });
  applySettings({});
});

test("game-time minutes and bedtime grace are settings, by date", () => {
  applySettings({});
  const snap = snapshotToSave({}, new Date(2026, 11, 1)).value; // what applied before Dec 1 (30, 5)
  applySettings({ game: 20, grace: 10, history: { '2026-12-01': JSON.parse(JSON.stringify(snap)) } });
  const ctx = { routines: {}, run: {}, isaiah: {} };
  assert.equal(L.gameWeek(ctx, 'eli', d('2026-11-23')).max, 150, 'earlier weeks keep 30 a day');
  assert.equal(L.gameWeek(ctx, 'eli', d('2026-11-30')).max, 30 + 20 * 4, 'the week of the change mixes (Mon 30, Tue-Fri 20)');
  assert.equal(L.gameWeek(ctx, 'eli', d('2026-12-07')).max, 100);
  // a snapshot saved before these settings existed means the defaults (30, 5), not today's values
  applySettings({ game: 20, grace: 10, history: { '2026-12-01': { lights: { eli: '20:30' } } } });
  assert.equal(L.gameMinOn(d('2026-11-30')), 30);
  assert.equal(atDate(d('2026-11-30'), () => SETTINGS.grace), 5);
  assert.equal(L.gameMinOn(d('2026-12-01')), 20);
  // 7 minutes late: late before the grace change, inside the grace after it (Rhett, lights out 8:00 on Mon/Tue)
  const night = (k) => { const x = d(k); return { start: new Date(x.getFullYear(), x.getMonth(), x.getDate(), 19, 30).getTime(), end: new Date(x.getFullYear(), x.getMonth(), x.getDate(), 20, 7).getTime() }; };
  assert.equal(timerResult('rhett', d('2026-11-24'), night('2026-11-24'), {}).status, 'late');
  assert.equal(timerResult('rhett', d('2026-12-01'), night('2026-12-01'), {}).status, 'grace');
  // bad values fall back to the defaults
  applySettings({ game: 999, grace: -3 });
  assert.equal(SETTINGS.game, 30); assert.equal(SETTINGS.grace, 5);
  applySettings({});
});

test("evening check wording comes from Settings; the checks themselves stay fixed", () => {
  applySettings({ checks: { rhett: { noLies: { label: 'Told the truth all day', sub: 'Even when it was hard' } } } });
  assert.deepEqual(L.CHECKS.rhett.map((k) => k.key), ['noYell', 'firstTime', 'noLies']);
  assert.equal(L.CHECKS.rhett[2].label, 'Told the truth all day');
  assert.equal(L.CHECKS.isaiah[2].label, 'No lies today', 'Isaiah has his own list');
  assert.equal(rowsFor(CHARTS.trombone, d('2026-11-16')).find((r) => r.key === 'noLies').label, 'Told the truth all day', 'the chart row uses the same words');
  applySettings({});
  assert.equal(L.CHECKS.rhett[2].label, 'No lies today');
});

test("Eli's plan runs through Feb 28; trial days match the trial schedule on every plan day", () => {
  const T = { planned: null };
  assert.notEqual(planFor(d('2027-02-28')), null);
  assert.equal(planFor(d('2027-03-01')), null);
  assert.equal(trialOn(d('2027-02-13')), 'mile');
  assert.equal(trialOn(d('2027-02-27')), '5k');
  // every plan day: trialOn says a trial exactly where the schedule has one (Thanksgiving's 5K may be Thu or Sat)
  const start = d('2026-10-26'), sched = planned(score({})).map((x) => [x.k, ymd(x.date)]);
  for (let day = start; ymd(day) <= '2027-02-28'; day = addDays(day, 1)) {
    const k = trialOn(day);
    if (!k) continue;
    const wk = ymd(mondayOf(day));
    assert.ok(sched.some(([kind, date]) => kind === k && ymd(mondayOf(d(date))) === wk), 'trial ' + k + ' on ' + ymd(day) + ' is in the schedule');
  }
  sched.forEach(([kind, date]) => assert.equal(trialOn(d(date)), kind, kind + ' scheduled ' + date));
  assert.ok(T);
});
