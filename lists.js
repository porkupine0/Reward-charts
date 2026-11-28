// One place that decides what's on each kid's list for a day and whether each item is done.
// The checklist page, the home "Today" list and the parent page all use these.
import { ymd, addDays, mondayOf, parseYmd } from './store.js?v=1795848677';
import { WEEKLY, afterSchool, weekend, bedtime, morning, choreItems, isDone, SKIP, EXCUSED, timerResult, atDate, STARTS, isSchoolDay, MEDS2, noSchoolTomorrow, trombone } from './routines.js?v=1795848677';
import { SETTINGS, onSettings } from './settings.js?v=1795848677';
import { stepShows, CADENCE_START, norm, choreSteps } from './chorelists.js?v=1795848677';
import { rowsFor, TIED_FROM } from './charts.js?v=1795848677';
import { LESSONS } from './driving-course.js?v=1795848677';
import { dueOn, testDoneOn, openSittings } from './driving.js?v=1795848677';
import * as TESTS from './driving-tests.js?v=1795848677';
import { planFor, dayDone, planEndYmd } from './plan.js?v=1795848677';

export const dowOf = (d) => (d.getDay() + 6) % 7; // Mon = 0
// The baseline knowledge test on a day: 'open' (not finished by the end of that day), 'today' (finished that
// day, so the lesson after it is optional), or 'done' (finished on an earlier day, or there is no baseline).
export function baselineBy(drive, dayKey) {
  const s = (TESTS.SITTINGS || []).find((x) => x.id === 'base');
  if (!s || !(TESTS.FORMS || {})[s.form] || !openSittings([s], drive, dayKey).length) return 'done';
  const on = testDoneOn(TESTS.FORMS[s.form], drive, s.id);
  return !on || on > dayKey ? 'open' : on === dayKey ? 'today' : 'done';
}
// Days of this week so far, Monday through today (Mon = 1 ... Sun = 7), whatever the time of day.
export const daysSoFar = (now) => dowOf(now) + 1;
// Each weekly item has its own week: AELP Thu–Wed, Awana Wed–Tue.
export const cycleOf = (d, start) => ymd(addDays(d, -((dowOf(d) - start + 7) % 7)));
export const partKey = (key, part) => key + '_' + part.toLowerCase();

// ctx = { routines, run, isaiah } (each a chart's data tree)
export function dayChecks(ctx, kid, date) { return (((ctx.routines || {}).days || {})[ymd(date)] || {})[kid] || {}; }
export function weeklyDef(kid, key) { return (WEEKLY[kid] || []).find((w) => w.key === key); }
export function weeklyDoneOn(ctx, kid, w, date) {
  return ((((ctx.routines || {}).weekly || {})[kid] || {})[w.key] || {})[cycleOf(date, w.start)] || null;
}

// Isaiah's 600 touches, stored by date (older data was stored by week/day of a challenge).
export function touchedOn(isaiah, dateStr) {
  const d = isaiah || {};
  if ((d.touchDays || {})[dateStr]) return true;
  if (!d.touches || !d.start) return false;
  const start = parseYmd(d.start), date = parseYmd(dateStr);
  if (!start || !date) return false;
  const off = Math.round((date - start) / 86400000);
  if (off < 0 || off > 27) return false;
  return (((d.touches[Math.floor(off / 7)] || {})[off % 7]) || 0) >= 6;
}
// Eli's running for a day is done when Training's required items are done.
export function eliRunDone(run, date) {
  const p = planFor(date);
  if (p && p.title === 'Off') return true; // a planned day off (e.g. Christmas) counts
  if (!p || !p.items.length) return false;
  return dayDone(p, (((run || {}).days || {})[ymd(date)] || {}).items || {});
}

function weeklyItems(ctx, kid, date) {
  const dow = dowOf(date);
  return (WEEKLY[kid] || []).filter((w) => {
    const done = weeklyDoneOn(ctx, kid, w, date);
    if (done) return done === ymd(date) || dow >= 4; // stays visible (checked) Fri–Sun
    return w.show.includes(dow) || w.late.includes(dow);
  }).map((w) => {
    const late = w.late.includes(dow) && !weeklyDoneOn(ctx, kid, w, date);
    return { key: 'w:' + w.key, weekly: w.key, label: w.label, late, sub: late ? w.lateNote : 'Do it Friday, Saturday or Sunday' };
  });
}

// The day's lists for one kid: { morning, day, bed }.
// (each day uses the chores, showers and lights out that applied that day)
// The days a chore is on anyone's schedule (each day's own schedule), from CADENCE_START through date.
const cadenceCache = new Map();
onSettings(() => cadenceCache.clear());
function choreDays(name, date) {
  const today = ymd(date), k = norm(name) + '|' + today;
  if (cadenceCache.has(k)) return cadenceCache.get(k);
  const out = [];
  for (let d = parseYmd(CADENCE_START); ymd(d) <= today; d = addDays(d, 1)) {
    const dw = dowOf(d);
    if (atDate(d, () => Object.values(SETTINGS.chores).some((days) => (days[dw] || []).some((c) => norm(c) === norm(name))))) out.push(ymd(d));
  }
  cadenceCache.set(k, out);
  return out;
}
// One-off extra chores on given days (a second chore each day), on top of the usual schedule:
// { kid: { 'YYYY-MM-DD': chore name } }. Stored like any chore (days/<date>/<kid>/xchore), so a missed one carries.
// Eli, Nov 23-29, 2026: lost video games for the week; a second chore every day, rotating through the house
// (the parent: bathrooms one day; kitchen Tuesday and Saturday; basement Monday, Wednesday or Thursday).
// No extra is a chore someone else has that day (Isaiah does the stairs on Thursdays).
export const EXTRA_CHORES = { eli: { '2026-11-23': 'Bathrooms', '2026-11-24': 'Kitchen', '2026-11-25': 'Basement', '2026-11-26': 'Front closet + shoe organizing',
  '2026-11-27': 'Stairs, landing + upstairs hallway', '2026-11-28': 'Kitchen', '2026-11-29': 'Trash: empty every trash can in the house' },
  // Isaiah, Wed Nov 25, 2026 (the parent asked that morning)
  isaiah: { '2026-11-25': 'Restock + organize the mini fridge and downstairs fridge' } };
// One-off afternoon boxes on a single day: { kid: { 'YYYY-MM-DD': item } }. Counts toward game time like his other after-school items.
export const ONE_OFF = { isaiah: { '2026-11-27': { key: 'outside', label: 'Outside time · 30 min', sub: 'Get outside for 30 minutes today (parent’s request, Thanksgiving weekend)' } } };
// Weeks a boy earns no game time (a parent's decision): { kid: [{ from, to, why }] } (dates inclusive).
export const GAME_OFF = { eli: [{ from: '2026-11-23', to: '2026-11-29', why: 'No game time this week (video games lost)' }] };
export const gameOffOn = (kid, date) => (GAME_OFF[kid] || []).find((o) => ymd(date) >= o.from && ymd(date) <= o.to) || null;
// Grounded from electronics, set on the Parents page: routines grounded/<kid>/<YYYY-MM-DD> = true, one entry
// per day (past days stay grounded after it ends). A grounded day earns no game time, and while today is
// grounded the boy's game time is on hold (kept, not lost; it can't be used until the grounding ends).
// GAME_OFF weeks above count as grounded days too (they're set in code, so the page can't remove them).
const storedGrounded = (ctx, kid) => (((ctx.routines || {}).grounded || {})[kid]) || {};
export const groundedOn = (ctx, kid, date) => !!storedGrounded(ctx, kid)[ymd(date)] || !!gameOffOn(kid, date);
// Grounded days from today on (sorted), each { day, fixed } (fixed = set in code).
export function groundedAhead(ctx, kid, today) {
  const t = ymd(today), out = {};
  Object.keys(storedGrounded(ctx, kid)).filter((k) => storedGrounded(ctx, kid)[k] && k >= t).forEach((k) => { out[k] = { day: k, fixed: false }; });
  (GAME_OFF[kid] || []).forEach((o) => { for (let d = parseYmd(o.from); ymd(d) <= o.to; d = addDays(d, 1)) if (ymd(d) >= t) out[ymd(d)] = { day: ymd(d), fixed: true }; });
  return Object.values(out).sort((a, b) => (a.day < b.day ? -1 : 1));
}
// The day "+1 day" adds: the day after the last grounded day (or today when not grounded).
export function nextGroundDay(ctx, kid, today) {
  const ahead = groundedAhead(ctx, kid, today);
  return ahead.length ? ymd(addDays(parseYmd(ahead[ahead.length - 1].day), 1)) : ymd(today);
}
// School items: not on a weekday off (the school calendar in routines.js).
const SCHOOL_KEYS = ['putaway', 'organize', 'due', 'missing', 'homework'];
export function lists(ctx, kid, date) { return atDate(date, () => listsOn(ctx, kid, date)); }
function listsOn(ctx, kid, date) {
  const dow = dowOf(date);
  // Teeth was added Nov 11, 2026; leave it off earlier mornings so past candy isn't undone.
  // Eli's Bible reading and prayer start Nov 21, 2026 (earlier days keep the lists they had).
  const bibleOk = (i) => !STARTS[i.key] || ymd(date) >= STARTS[i.key];
  // A weekday off is a Saturday morning (Eli's Ritalin; Isaiah's Saturday list), and has no school items.
  const off = dow <= 4 && !isSchoolDay(date);
  const morn = morning(kid, off ? 5 : dow).filter((i) => (i.key !== 'mTeeth' || ymd(date) >= '2026-11-11') && bibleOk(i));
  const raw = dow <= 4 ? afterSchool(kid, dow, kid === 'eli' ? planFor(date) : null, off && ymd(date) >= '2026-11-26') : weekend(kid, dow);
  const day = [];
  raw.filter(bibleOk).forEach((i) => (i.weekly === true ? day.push(...weeklyItems(ctx, kid, date)) : day.push(i)));
  if (off) {
    for (let n = day.length - 1; n >= 0; n--) if (SCHOOL_KEYS.includes(day[n].key)) day.splice(n, 1);
    day.forEach((i, n) => { if (i.key === 'afterSnack') day[n] = Object.assign({}, i, { label: 'Afternoon snack' }); });
    if (kid === 'eli' && ymd(date) >= STARTS.meds2) { const b = day.findIndex((i) => i.key === 'bibleRead'); day.splice(b >= 0 ? b : day.length, 0, Object.assign({}, MEDS2)); }
  }
  // Rhett: 20 min of trombone on a weekday off and on a school day before a day off (like Friday), from Nov 24, 2026
  if (kid === 'rhett' && dow <= 3 && ymd(date) >= '2026-11-24' && (off || noSchoolTomorrow(dow, date)) && !day.some((i) => i.key === 'trombone')) {
    const t = day.findIndex((i) => i.key === 'typing');
    day.splice(t >= 0 ? t + 1 : day.length, 0, trombone(4));
  }
  // Isaiah's glasses follow the school calendar: school glasses on school mornings, home glasses otherwise;
  // no after-school swap on a weekday off; his clothes pile goes with the pair for the day they're for.
  if (kid === 'isaiah') {
    const school = isSchoolDay(date), tomorrow = isSchoolDay(addDays(date, 1));
    morn.forEach((i, n) => { if (i.key === 'mGlasses') morn[n] = Object.assign({}, i, { label: school ? 'Put on your school glasses' : 'Put on your home glasses' }); });
    for (let n = day.length - 1; n >= 0; n--) if (day[n].key === 'glassesHome' && !school) day.splice(n, 1);
    day.forEach((i, n) => { if ((i.key === 'clothes' || i.key === 'weather') && ymd(date) >= '2026-11-24') day[n] = Object.assign({}, i, { tag: tomorrow ? 'with your school glasses' : 'with your home glasses' }); });
  }
  const extra = (EXTRA_CHORES[kid] || {})[ymd(date)];
  if (extra) {
    const it = { key: 'xchore', label: 'Chore: ' + extra, name: extra, chore: true, sub: 'Extra chore today' };
    const steps = choreSteps(SETTINGS.choreSteps, extra);
    if (steps) it.steps = steps;
    let at = -1; day.forEach((x, n) => { if (x.chore) at = n; });
    day.splice(at + 1, 0, it); // right after his usual chore(s)
  }
  // One-off afternoon items (a single day, like an extra chore): { kid: { 'YYYY-MM-DD': item } }.
  const once = (ONE_OFF[kid] || {})[ymd(date)];
  if (once) { const w = day.findIndex((x) => x.weekly); day.splice(w >= 0 ? w : day.length, 0, Object.assign({}, once)); }
  // "every other time" and "monthly" chore steps: only on the days they're due
  day.forEach((it, n) => {
    if (!it.chore || !it.steps || !it.steps.some((s) => s.when)) return;
    const days = choreDays(it.name, date);
    const steps = it.steps.filter((s) => stepShows(s, ymd(date), days));
    day[n] = Object.assign({}, it, { steps: steps.length ? steps : undefined }); // nothing due today: a single box
  });
  if (kid === 'eli') {
    // Saturday run (on his chart from Nov 21, 2026): shown on the weekend list too
    const p = planFor(date);
    if (dow === 5 && p && ymd(date) >= '2026-11-21') {
      day.push({ key: 'activity', label: p.swim ? 'Swim practice' : 'Running: ' + p.title, sub: (p.optional ? 'Optional today. ' : '') + 'Checks itself off when today’s Training is done. Tap to open it.', link: 'run.html', opt: !!p.optional });
    }
    // Typing, 10 min, Monday to Saturday (from Nov 19, 2026). Computer work: waits until today's chores are done.
    if (dow <= 5 && ymd(date) >= '2026-11-19') {
      const typing = { key: 'typing', label: 'Typing practice · 10 min', computer: true };
      const at = day.findIndex((i) => i.key === 'activity');
      at >= 0 ? day.splice(at, 0, typing) : day.push(typing);
    }
    // Driving lesson (Mon–Fri) on days one was due (see dueOn): counts toward his full day and streak, not
    // game time. Approved that same day: optional. Computer work (waits for chores).
    if (dow <= 4) {
      const due = dueOn(driveCourse, ctx.drive || {}, ymd(date), dow);
      // The baseline knowledge test comes first (the Driving page holds lessons until it's done), so a lesson
      // isn't required on a day before the baseline was finished: it's optional that day.
      const base = baselineBy(ctx.drive || {}, ymd(date));
      if (due) day.push(base === 'open'
        ? { key: 'drive', label: 'Driving: baseline test first', sub: 'Take the 25-question baseline test, then today’s lesson. Tap to open it.', link: 'drive.html', derived: 'drive', computer: true, noGame: true, opt: true }
        : { key: 'drive', label: due.lesson.review ? 'Driving: unit test' : 'Driving lesson', sub: due.lesson.review ? 'Questions on this unit (and a few from earlier), then tap Finish. Tap to open it.' : 'A short video and 5 questions. Tap to open it.', link: 'drive.html', derived: 'drive', computer: true, noGame: true, opt: due.due === 'optional' || base === 'today' });
    }
    // After the training plan ends there's nothing to check off, so no Running item
    if (!p && ymd(date) >= planEndYmd()) { const at = day.findIndex((i) => i.key === 'activity'); if (at >= 0) day.splice(at, 1); }
  }
  // Running (Eli) and 600 touches (Isaiah) are done on their own pages; the checklist shows their status.
  day.forEach((i) => {
    if (i.key === 'activity' && kid === 'eli') i.derived = 'run';
    if (i.key === 'activity' && kid === 'isaiah') i.derived = 'touches';
  });
  return { morning: morn, day, bed: bedtime(kid, dow, date).filter(bibleOk) };
}

// A computer task (typing, Duolingo, checking assignments, homework) can't be ticked until every chore in the day's list is done.
// One that is already ticked can still be un-ticked.
// Screen and school tasks: Rhett's computer items, Eli's assignments and homework. Run, swim, soccer,
// snack, put-away, clothes and today's chores never lock.
export const lockable = (kid, it) => !it.derived && it.key !== 'activity' && (!!it.computer || (kid === 'eli' && ['due', 'missing', 'homework'].includes(it.key)));
// The driving course (tests can swap in a fixture course).
let driveCourse = LESSONS;
export function useCourse(lessons) { driveCourse = lessons; }
export const course = () => driveCourse;
// Computer work's lock for a day: 'owed' (a chore from earlier this week), 'chores' (today's chores not all
// done) or false. The checklist rows and the Driving page both use it.
// Screens can open once a laundry chore's Dry step is ticked: the rest waits on the dryer (and can carry to
// the next day). Any chore list with a step named "Dry" works this way.
function screenReady(ctx, kid, date, it) {
  if (isOn(ctx, kid, date, it)) return true;
  // every step up to and including Dry ticked (not just Dry)
  const steps = it.steps || [], i = steps.findIndex((s) => /^dry$/i.test(s.label)), c = dayChecks(ctx, kid, date);
  return i >= 0 && steps.slice(0, i + 1).every((s) => c[s.key]);
}
const owedForScreens = (ctx, kid, date) => choresOwed(ctx, kid, date).filter((o) => !screenReady(ctx, kid, o.date, o.item));
export function computerLock(ctx, kid, date) {
  if (owedForScreens(ctx, kid, date).length) return 'owed';
  return lists(ctx, kid, date).day.filter((i) => i.chore).some((c) => !screenReady(ctx, kid, date, c)) ? 'chores' : false;
}
export function lockedBy(ctx, kid, date, it, list) {
  if (isOn(ctx, kid, date, it)) return false;
  // computer work (typing, Duolingo, the driving lesson, Rhett's school checks): one rule for all of it
  if (it.computer) return computerLock(ctx, kid, date);
  // Eli's assignments and homework: only an earlier day's missed chore locks them
  if (lockable(kid, it) && lists(ctx, kid, date).day.some((i) => i.key === it.key) && owedForScreens(ctx, kid, date).length) return 'owed';
  return false;
}

// Chores left undone on an earlier day this week (from Nov 16, 2026). Until they're done (or excused
// by Mom or Dad), screen and school tasks are locked and today earns no game time. [{ date, item }]
export const OWED_FROM = '2026-11-16';
// Yesterday's unfinished items (from Nov 22, 2026) show on today's checklist under "From yesterday", unless
// a parent approved "not able to do it". Ticked there, they save on the day they were for. Only items that
// can still be done a day late: schoolwork, practice, screen tasks and Bible reading. Not optional items,
// times of day (morning, snacks, bedtime), things done on another page, or chores (those have Finish first).
export const CARRY_FROM = '2026-11-22';
export const CARRY = ['organize', 'due', 'missing', 'homework', 'duolingo', 'typing', 'trombone', 'bibleRead'];
export function carried(ctx, kid, date) {
  const d = addDays(date, -1);
  if (ymd(d) < CARRY_FROM) return [];
  return lists(ctx, kid, d).day.filter((i) => CARRY.includes(i.key) && !i.opt && !i.derived && !isOn(ctx, kid, d, i)).map((item) => ({ date: d, item }));
}
export function choresOwed(ctx, kid, date) {
  const out = [], mon = mondayOf(date);
  for (let d = mon; ymd(d) < ymd(date); d = addDays(d, 1)) {
    if (ymd(d) < OWED_FROM) continue;
    lists(ctx, kid, d).day.filter((i) => i.chore && !isOn(ctx, kid, d, i)).forEach((item) => out.push({ date: new Date(d), item }));
  }
  return out;
}

export function isOn(ctx, kid, date, it) {
  const checks = dayChecks(ctx, kid, date);
  if (it.weekly) return !!weeklyDoneOn(ctx, kid, weeklyDef(kid, it.weekly), date);
  if (it.derived && checks[it.key] === EXCUSED) return true; // a parent excused the run, swim or soccer
  if (it.derived === 'run') return eliRunDone(ctx.run, date);
  if (it.derived === 'drive') return Object.values(((ctx.drive || {}).done) || {}).includes(ymd(date));
  if (it.derived === 'touches') return touchedOn(ctx.isaiah, ymd(date));
  if (it.parts) return it.parts.every((p) => checks[partKey(it.key, p)]);
  return isDone(checks[it.key]);
}

// Required (not optional) items and how many are done.
export function progress(ctx, kid, date, list) {
  const req = list.filter((i) => !i.opt);
  const left = req.filter((i) => !isOn(ctx, kid, date, i));
  return { req, left, done: req.length - left.length };
}

// ---- weekly reward charts: boxes come from the checklists and Training ----
// A box the checklist can fill is "derived". A parent can still tick or un-tick it by hand:
// that's stored on the chart as true (on) or 'off', and wins over the derived value.
export function derivedCell(chartId, rowKey, i, monday, ctx) { return atDate(addDays(monday, i), () => derivedCellOn(chartId, rowKey, i, monday, ctx)); }
function derivedCellOn(chartId, rowKey, i, monday, ctx) {
  const date = addDays(monday, i);
  const c = (kid) => dayChecks(ctx, kid, date);
  const allChores = (kid) => choreItems(kid, i).every((x) => isDone(c(kid)[x.key]));
  const yes = (kid) => c(kid)[rowKey] === true; // evening checks by Mom or Dad
  const tied = ymd(monday) >= TIED_FROM;
  if (chartId === 'eli') {
    if (rowKey === 'running' && i <= 5) return eliRunDone(ctx.run, date) || c('eli').activity === EXCUSED;
    if (rowKey === 'chores') return allChores('eli');
    if (rowKey === 'school' && i <= 4) return isDone(c('eli').missing);
    if (rowKey === 'kind' || rowKey === 'listen') return yes('eli');
  }
  if (chartId === 'trombone') {
    if (rowKey === 'trombone' && i >= 4) return isDone(c('rhett').trombone); // Fri, Sat, Sun: ticked on his checklist
    if (rowKey === 'chores' && (i <= 5 || tied)) return allChores('rhett');
    if (rowKey === 'duolingo' && i <= 5) return isDone(c('rhett').duolingo);
    if (rowKey === 'typing') return isDone(c('rhett').typing);
    if (rowKey === 'move' && (tied ? i <= 5 : [0, 1, 2, 4, 5].includes(i))) return isDone(c('rhett').activity);
    if (rowKey === 'racquetball' && i === 3) return isDone(c('rhett').activity);
    if (CHECKS.rhett.some((k) => k.key === rowKey)) return yes('rhett');
  }
  if (chartId === 'zay') {
    if (rowKey === 'soccer' && i <= 4) return touchedOn(ctx.isaiah, ymd(date)) || c('isaiah').activity === EXCUSED;
    if (rowKey === 'chores') return allChores('isaiah');
    if (CHECKS.isaiah.some((k) => k.key === rowKey)) return yes('isaiah');
  }
  return undefined; // filled by hand only (older weeks)
}
// From TIED_FROM on, every box is the checklist's answer. Before that a parent's hand tick
// (stored as true or 'off') wins over the derived value.
export function cellOn(chartId, rowKey, i, monday, weekData, ctx) {
  const stored = (((weekData || {}).checks || {})[rowKey] || {})[i];
  if (ymd(monday) < TIED_FROM) {
    if (stored === true) return true;
    if (stored === 'off') return false;
  }
  return !!derivedCell(chartId, rowKey, i, monday, ctx);
}
// Same shape weekProgress expects: { checks: { row: { day: true } } }
export function effectiveWeek(chart, monday, weekData, ctx) {
  const checks = {};
  rowsFor(chart, monday).forEach((r) => r.cells.forEach((cell, i) => {
    if (cell === '-') return;
    if (cellOn(chart.id, r.key, i, monday, weekData, ctx)) (checks[r.key] = checks[r.key] || {})[i] = true;
  }));
  return Object.assign({}, weekData, { checks, monday });
}
export { mondayOf };

// ---- "Right now": what's left for a kid at this time of day ----
// Morning (Isaiah's list, until 8:30 on school days / 10:00 weekends) → at school (until 3:00)
// → after school or the weekend list → bedtime (15 min before the first step, through lights out + grace)
// → after lights out. Anything left from earlier in the day is mentioned too.
export function nowStatus(ctx, kid, now) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = dowOf(date), school = isSchoolDay(date), min = now.getHours() * 60 + now.getMinutes();
  const ls = lists(ctx, kid, date);
  const m = progress(ctx, kid, date, ls.morning), d = progress(ctx, kid, date, ls.day), b = progress(ctx, kid, date, ls.bed);
  const bedStart = ls.bed[0].min - 15, lo = ls.bed[ls.bed.length - 1];
  const dayName = school ? 'After school' : 'Today';
  const left = (p) => p.left.map((i) => ({ label: i.label.replace(/^Chore: /, ''), time: i.time || '', key: i.key }));
  if (min < 5 * 60) return { phase: 'night', title: 'Sleeping', left: [], done: true, sub: '' };
  if (ls.morning.length && m.left.length && min < (school ? 8 * 60 + 30 : 10 * 60)) {
    return { phase: 'morning', title: 'Morning', left: left(m), done: false, sub: school ? 'Out the door by 8:30' : '' };
  }
  if (school && min < 15 * 60) {
    return { phase: 'school', title: min < 8 * 60 + 30 ? 'Before school' : 'At school', left: [], done: true, sub: d.req.length ? 'After school: ' + d.req.length + ' things to do' : '' };
  }
  if (min < bedStart) {
    return { phase: 'day', title: dayName, left: left(d), done: !d.left.length, sub: 'Bedtime starts ' + ls.bed[0].time };
  }
  if (min <= lo.min + atDate(date, () => SETTINGS.grace)) {
    const extra = d.left.length ? d.left.length + ' still left from ' + (school ? 'after school' : 'today') : '';
    return { phase: 'bed', title: 'Bedtime', left: left(b), done: !b.left.length, sub: 'Lights out ' + lo.time + (extra ? ' · ' + extra : '') };
  }
  if (!b.left.length) return { phase: 'night', title: 'In bed', left: [], done: true, sub: 'Good night!' };
  return { phase: 'late', title: 'After lights out', left: left(b), done: false, sub: 'Lights out was ' + lo.time };
}

// ---- Reading tracker: nights read, excused nights, and nights with reading on the list ----
export function readingWeek(ctx, kid, monday, upTo) {
  let read = 0, excused = 0, nights = 0;
  const last = upTo || addDays(monday, 6);
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    if (ymd(d) > ymd(last)) break;
    if (!atDate(d, () => bedtime(kid, dowOf(d), d)).some((s) => s.key === 'reading')) continue;
    nights++;
    const v = dayChecks(ctx, kid, d).reading;
    if (v === EXCUSED) excused++;
    else if (isDone(v)) read++;
  }
  return { read, excused, nights };
}

// ---- Weekend game time (all three boys) ----
// End-of-day checks, set by a parent: true = yes, 'no' = not today.
// The checks are fixed (they're chart rows); their wording comes from Settings. Rebuilt in place on changes.
const CHECK_KEYS = { eli: ['kind', 'listen'], rhett: ['noYell', 'firstTime', 'noLies'], isaiah: ['noYell', 'firstTime', 'noLies'] };
export const CHECKS = { eli: [], rhett: [], isaiah: [] };
function wordChecks() {
  Object.entries(CHECK_KEYS).forEach(([kid, keys]) => {
    const w = (SETTINGS.checks || {})[kid] || {};
    CHECKS[kid].splice(0, CHECKS[kid].length, ...keys.map((key) => ({ key, label: (w[key] || {}).label || key, sub: (w[key] || {}).sub || '' })));
  });
}
wordChecks();
onSettings(wordChecks);
export const DAY_CHECKS = CHECKS.eli; // (kept for older callers)
export const GAME = { days: [0, 1, 2, 3, 4] }; // school days earn game time (minutes per day from Settings)
// Minutes a school day is worth: that day's setting (a change applies from the day it's saved).
export const gameMinOn = (date) => atDate(date, () => SETTINGS.game);
// A school day earns its minutes (Settings) when the whole checklist (after school + bedtime, excused items count)
// is done and both end-of-day checks are yes.
export function gameDay(ctx, kid, date) {
  const ls = lists(ctx, kid, date);
  // (the driving lesson counts toward his full day and streak, not game time)
  const left = [...progress(ctx, kid, date, ls.day).left, ...progress(ctx, kid, date, ls.bed).left].filter((i) => !i.noGame).map((i) => i.label.replace(/^Chore: /, ''));
  const c = dayChecks(ctx, kid, date);
  [...new Set(choresOwed(ctx, kid, date).map((o) => o.date.toLocaleDateString('en-US', { weekday: 'long' })))].forEach((day) => left.push('Finish ' + day + '’s chore first'));
  (CHECKS[kid] || []).forEach((k) => { if (c[k.key] !== true) left.push(c[k.key] === 'no' ? k.label + ': not today' : k.label + ' (Mom or Dad)'); });
  const off = gameOffOn(kid, date), grounded = !off && groundedOn(ctx, kid, date);
  const worth = GAME.days.includes(dowOf(date)) && !off && !grounded ? gameMinOn(date) : 0;
  return { earned: !left.length, left, worth, minutes: left.length ? 0 : worth, off: off ? off.why : '', grounded };
}
// Game time used is logged in pieces: routines game/<kid>/<monday>/<timestamp> = minutes.
export function gameUses(ctx, kid, monday) {
  const log = ((((ctx.routines || {}).game || {})[kid] || {})[ymd(monday)]) || {};
  return Object.entries(log).filter(([, m]) => Number(m) > 0).map(([at, m]) => ({ at: Number(at), minutes: Number(m) })).sort((a, b) => a.at - b.at);
}
// Game time a missed chore is holding back right now: the missed school days (they earn back when
// it's done, since a late chore counts) plus today if today is a school day.
export function owedHeld(ctx, kid, date) {
  const owed = choresOwed(ctx, kid, date);
  if (!owed.length) return 0;
  const days = new Set(owed.filter((o) => GAME.days.includes(dowOf(o.date)) && !groundedOn(ctx, kid, o.date)).map((o) => ymd(o.date)));
  if (GAME.days.includes(dowOf(date)) && !groundedOn(ctx, kid, date)) days.add(ymd(date)); // (none on a no-game-time day)
  return [...days].reduce((a, k) => a + gameMinOn(parseYmd(k)), 0);
}
// Minutes typed into "Other…": "90", "45 min", "1 hr", "1:30", "1.5 hours". Anything else (or 0) is null.
export function parseMinutes(text) {
  const t = String(text == null ? '' : text).trim().toLowerCase();
  let m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m) return +m[2] < 60 && (+m[1] * 60 + +m[2]) > 0 ? +m[1] * 60 + +m[2] : null;
  m = t.match(/^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)$/);
  if (m) { const v = Math.round(parseFloat(m[1]) * 60); return v > 0 ? v : null; }
  m = t.match(/^(\d+)\s*(m|min|mins|minute|minutes)?$/);
  if (m) { const v = +m[1]; return v > 0 ? v : null; }
  return null;
}
// "9 still to do: A · B · C · +6 more"
export function leftSummary(left, n = 3) {
  if (!left.length) return '';
  return left.length + ' still to do: ' + left.slice(0, n).join(' · ') + (left.length > n ? ' · +' + (left.length - n) + ' more' : '');
}
// Leftover game time, answered by a parent once per boy per week:
// routines carry/<kid>/<from monday> = { minutes, add }. Either way those minutes leave that week
// ("No" lets them go); "Add" puts them into the next week. The amount is fixed when answered;
// later changes to that week stay on that week.
export function carryFrom(ctx, kid, monday) { return ((((ctx.routines || {}).carry || {})[kid] || {})[ymd(monday)]); }
const leaves = (v) => (v && typeof v.minutes === 'number' && v.minutes > 0 ? v.minutes : 0);
const arrives = (v) => (v && v.add === true ? leaves(v) : 0);
export function gameWeek(ctx, kid, monday, now = new Date()) {
  const days = GAME.days.map((i) => { const date = addDays(monday, i); return Object.assign({ date }, gameDay(ctx, kid, date)); });
  const minutes = days.reduce((a, d) => a + d.minutes, 0);
  const uses = gameUses(ctx, kid, monday), used = uses.reduce((a, u) => a + u.minutes, 0);
  const out = carryFrom(ctx, kid, monday);
  const carriedIn = carriedInto(ctx, kid, monday), carriedOut = arrives(out), letGo = out && !out.add ? leaves(out) : 0;
  // a no-game-time week (GAME_OFF): nothing earned, and minutes carried in from before can't be used either
  const off = days.some((d) => d.off);
  // On hold (kept, not usable now): grounded today, or a no-game-time week (minutes carried into it stay
  // and can be carried out at the end of the week).
  const hold = off || groundedOn(ctx, kid, now);
  return { days, minutes, max: days.reduce((a, d) => a + d.worth, 0), uses, used, carriedIn, carriedOut, letGo, off, hold, left: Math.max(0, minutes + carriedIn - used - leaves(out)) };
}
// Parents page: boys with game time left from last week and no answer yet. [{ kid, from, minutes }]
// Every finished week (from Nov 16, 2026) not answered yet stays on the list, oldest first, until a parent
// answers it. A late answer ("to" = the Monday it was answered) adds the minutes to that week instead.
export const CARRY_WEEKS_FROM = '2026-11-16';
export function carryPrompts(ctx, today, kids) {
  const thisMon = mondayOf(today), out = [];
  kids.forEach((kid) => {
    for (let from = parseYmd(CARRY_WEEKS_FROM); addDays(from, 7) <= thisMon; from = addDays(from, 7)) {
      if (carryFrom(ctx, kid, from) !== undefined) continue;
      const minutes = gameWeek(ctx, kid, from).left;
      if (minutes > 0) out.push({ kid, from, minutes, late: ymd(addDays(from, 7)) < ymd(thisMon) });
    }
  });
  return out;
}
// Minutes moved into a week: answers for the week before ("Add"), plus late answers aimed at this week.
function carriedInto(ctx, kid, monday) {
  const all = (((ctx.routines || {}).carry || {})[kid]) || {}, w = ymd(monday);
  return Object.entries(all).reduce((a, [from, v]) => a + ((v && v.to ? v.to : ymd(addDays(parseYmd(from), 7))) === w ? arrives(v) : 0), 0);
}
// Where an answer's minutes go: the next week, or this week when answered late.
export const carryTarget = (from, today) => { const next = addDays(from, 7), mon = mondayOf(today); return ymd(next) < ymd(mon) ? ymd(mon) : null; };

// ---- Parents' "Tonight" card: everything a parent signs off on for one evening ----
// The evening a parent is closing out: before 5 am it's still last night (same as nowStatus).
export function tonightDate(now) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return now.getHours() < 5 ? addDays(d, -1) : d;
}
// Per boy: the evening checks (value 'yes' | 'no' | null), items waiting for an OK that night,
// and whether that night's bedtime was late (and not yet OK'd).
export function tonight(ctx, date) {
  return Object.keys(CHECKS).map((kid) => {
    const c = dayChecks(ctx, kid, date), ls = lists(ctx, kid, date);
    const checks = CHECKS[kid].map((k) => ({ key: k.key, label: k.label, sub: k.sub, value: c[k.key] === true ? 'yes' : c[k.key] === 'no' ? 'no' : null }));
    const excuses = [...ls.morning, ...ls.day, ...ls.bed].filter((it) => c[it.key] === SKIP).map((it) => ({ key: it.key, label: it.label.replace(/^Chore: /, '') }));
    const r = timerResult(kid, date, c.bedTimer, c);
    return { kid, checks, excuses, late: r && r.status === 'late' && !r.denied ? r.lateBy : 0, open: checks.filter((x) => !x.value).length };
  });
}
// "All good": fill only the checks nobody has answered; never change a "Not today".
export function allGoodKeys(ctx, kid, date) {
  const c = dayChecks(ctx, kid, date);
  return (CHECKS[kid] || []).filter((k) => c[k.key] !== true && c[k.key] !== 'no').map((k) => k.key);
}
