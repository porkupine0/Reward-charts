// One place that decides what's on each kid's list for a day and whether each item is done.
// The checklist page, the home "Today" list and the parent page all use these.
import { ymd, addDays, mondayOf, parseYmd } from './store.js?v=1795004044';
import { WEEKLY, afterSchool, weekend, bedtime, morning, choreItems, isDone, SKIP, EXCUSED, timerResult, atDate } from './routines.js?v=1795004044';
import { SETTINGS, onSettings } from './settings.js?v=1795004044';
import { rowsFor, TIED_FROM } from './charts.js?v=1795004044';
import { planFor, dayDone, planEndYmd } from './plan.js?v=1795004044';

export const dowOf = (d) => (d.getDay() + 6) % 7; // Mon = 0
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
export function lists(ctx, kid, date) { return atDate(date, () => listsOn(ctx, kid, date)); }
function listsOn(ctx, kid, date) {
  const dow = dowOf(date);
  // Teeth was added Nov 11, 2026; leave it off earlier mornings so past candy isn't undone.
  const morn = morning(kid, dow).filter((i) => i.key !== 'mTeeth' || ymd(date) >= '2026-11-11');
  const raw = dow <= 4 ? afterSchool(kid, dow, kid === 'eli' ? planFor(date) : null) : weekend(kid, dow);
  const day = [];
  raw.forEach((i) => (i.weekly === true ? day.push(...weeklyItems(ctx, kid, date)) : day.push(i)));
  if (kid === 'eli') {
    // Saturday run (on his chart from Nov 21, 2026): shown on the weekend list too
    const p = planFor(date);
    if (dow === 5 && p && ymd(date) >= '2026-11-21') {
      day.push({ key: 'activity', label: p.swim ? 'Swim practice' : 'Running: ' + p.title, sub: (p.optional ? 'Optional today. ' : '') + 'Checks itself off when today’s Training is done. Tap to open it.', link: 'run.html', opt: !!p.optional });
    }
    // After the training plan ends there's nothing to check off, so no Running item
    if (!p && ymd(date) >= planEndYmd()) { const at = day.findIndex((i) => i.key === 'activity'); if (at >= 0) day.splice(at, 1); }
  }
  // Running (Eli) and 600 touches (Isaiah) are done on their own pages; the checklist shows their status.
  day.forEach((i) => {
    if (i.key === 'activity' && kid === 'eli') i.derived = 'run';
    if (i.key === 'activity' && kid === 'isaiah') i.derived = 'touches';
  });
  return { morning: morn, day, bed: bedtime(kid, dow) };
}

// A computer task (typing, Duolingo, checking assignments, homework) can't be ticked until every chore in the day's list is done.
// One that is already ticked can still be un-ticked.
// Screen and school tasks: Rhett's computer items, Eli's assignments and homework. Run, swim, soccer,
// snack, put-away, clothes and today's chores never lock.
export const lockable = (kid, it) => !it.derived && it.key !== 'activity' && (!!it.computer || (kid === 'eli' && ['due', 'missing', 'homework'].includes(it.key)));
export function lockedBy(ctx, kid, date, it, list) {
  if (isOn(ctx, kid, date, it)) return false;
  if (lockable(kid, it) && lists(ctx, kid, date).day.some((i) => i.key === it.key) && choresOwed(ctx, kid, date).length) return 'owed'; // an earlier day's chore comes first
  if (!it.computer) return false;
  return (list || []).filter((i) => i.chore).some((c) => !isOn(ctx, kid, date, c)) ? 'chores' : false;
}

// Chores left undone on an earlier day this week (from Nov 16, 2026). Until they're done (or excused
// by Mom or Dad), screen and school tasks are locked and today earns no game time. [{ date, item }]
export const OWED_FROM = '2026-11-16';
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
  const dow = dowOf(date), school = dow <= 4, min = now.getHours() * 60 + now.getMinutes();
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
    if (!atDate(d, () => bedtime(kid, dowOf(d))).some((s) => s.key === 'reading')) continue;
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
  const left = [...progress(ctx, kid, date, ls.day).left, ...progress(ctx, kid, date, ls.bed).left].map((i) => i.label.replace(/^Chore: /, ''));
  const c = dayChecks(ctx, kid, date);
  [...new Set(choresOwed(ctx, kid, date).map((o) => o.date.toLocaleDateString('en-US', { weekday: 'long' })))].forEach((day) => left.push('Finish ' + day + '’s chore first'));
  (CHECKS[kid] || []).forEach((k) => { if (c[k.key] !== true) left.push(c[k.key] === 'no' ? k.label + ': not today' : k.label + ' (Mom or Dad)'); });
  const worth = GAME.days.includes(dowOf(date)) ? gameMinOn(date) : 0;
  return { earned: !left.length, left, worth, minutes: left.length ? 0 : worth };
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
  const days = new Set(owed.filter((o) => GAME.days.includes(dowOf(o.date))).map((o) => ymd(o.date)));
  if (GAME.days.includes(dowOf(date))) days.add(ymd(date));
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
export function gameWeek(ctx, kid, monday) {
  const days = GAME.days.map((i) => { const date = addDays(monday, i); return Object.assign({ date }, gameDay(ctx, kid, date)); });
  const minutes = days.reduce((a, d) => a + d.minutes, 0);
  const uses = gameUses(ctx, kid, monday), used = uses.reduce((a, u) => a + u.minutes, 0);
  return { days, minutes, max: days.reduce((a, d) => a + d.worth, 0), uses, used, left: Math.max(0, minutes - used) };
}

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
    return { kid, checks, excuses, late: r && r.status === 'late' ? r.lateBy : 0, open: checks.filter((x) => !x.value).length };
  });
}
// "All good": fill only the checks nobody has answered; never change a "Not today".
export function allGoodKeys(ctx, kid, date) {
  const c = dayChecks(ctx, kid, date);
  return (CHECKS[kid] || []).filter((k) => c[k.key] !== true && c[k.key] !== 'no').map((k) => k.key);
}
