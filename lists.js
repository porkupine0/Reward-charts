// One place that decides what's on each kid's list for a day and whether each item is done.
// The checklist page, the home "Today" list and the parent page all use these.
import { ymd, addDays, mondayOf, parseYmd } from './store.js?v=1794452868';
import { WEEKLY, afterSchool, weekend, bedtime, morning, choreItems } from './routines.js?v=1794452868';
import { planFor, dayDone } from './plan.js?v=1794452868';

export const dowOf = (d) => (d.getDay() + 6) % 7; // Mon = 0
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
export function lists(ctx, kid, date) {
  const dow = dowOf(date);
  // Teeth was added Nov 11, 2026; leave it off earlier mornings so past candy isn't undone.
  const morn = morning(kid, dow).filter((i) => i.key !== 'mTeeth' || ymd(date) >= '2026-11-11');
  const raw = dow <= 4 ? afterSchool(kid, dow, kid === 'eli' ? planFor(date) : null) : weekend(kid, dow);
  const day = [];
  raw.forEach((i) => (i.weekly === true ? day.push(...weeklyItems(ctx, kid, date)) : day.push(i)));
  // Running (Eli) and 600 touches (Isaiah) are done on their own pages; the checklist shows their status.
  day.forEach((i) => {
    if (i.key === 'activity' && kid === 'eli') i.derived = 'run';
    if (i.key === 'activity' && kid === 'isaiah') i.derived = 'touches';
  });
  return { morning: morn, day, bed: bedtime(kid, dow) };
}

export function isOn(ctx, kid, date, it) {
  const checks = dayChecks(ctx, kid, date);
  if (it.weekly) return !!weeklyDoneOn(ctx, kid, weeklyDef(kid, it.weekly), date);
  if (it.derived === 'run') return eliRunDone(ctx.run, date);
  if (it.derived === 'touches') return touchedOn(ctx.isaiah, ymd(date));
  if (it.parts) return it.parts.every((p) => checks[partKey(it.key, p)]);
  return !!checks[it.key];
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
export function derivedCell(chartId, rowKey, i, monday, ctx) {
  const date = addDays(monday, i), k = ymd(date);
  const c = (kid) => dayChecks(ctx, kid, date);
  const allChores = (kid) => choreItems(kid, i).every((x) => c(kid)[x.key]);
  if (chartId === 'eli') {
    if (rowKey === 'running' && i <= 5) return eliRunDone(ctx.run, date);
    if (rowKey === 'chores') return allChores('eli');
    if (rowKey === 'school' && i <= 4) return !!c('eli').missing;
  }
  if (chartId === 'trombone') {
    if (rowKey === 'chores' && i <= 5) return allChores('rhett');
    if (rowKey === 'duolingo' && i <= 5) return !!c('rhett').duolingo;
    if (rowKey === 'move' && [0, 1, 2, 4, 5].includes(i)) return !!c('rhett').activity;
    if (rowKey === 'racquetball' && i === 3) return !!c('rhett').activity;
  }
  return undefined; // filled by hand only
}
export function cellOn(chartId, rowKey, i, monday, weekData, ctx) {
  const stored = (((weekData || {}).checks || {})[rowKey] || {})[i];
  if (stored === true) return true;
  if (stored === 'off') return false;
  return !!derivedCell(chartId, rowKey, i, monday, ctx);
}
// Same shape weekProgress expects: { checks: { row: { day: true } } }
export function effectiveWeek(chart, monday, weekData, ctx) {
  const checks = {};
  chart.rows.forEach((r) => r.cells.forEach((cell, i) => {
    if (cell === '-') return;
    if (cellOn(chart.id, r.key, i, monday, weekData, ctx)) (checks[r.key] = checks[r.key] || {})[i] = true;
  }));
  return Object.assign({}, weekData, { checks });
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
  if (min <= lo.min + 5) {
    const extra = d.left.length ? d.left.length + ' still left from ' + (school ? 'after school' : 'today') : '';
    return { phase: 'bed', title: 'Bedtime', left: left(b), done: !b.left.length, sub: 'Lights out ' + lo.time + (extra ? ' · ' + extra : '') };
  }
  if (!b.left.length) return { phase: 'night', title: 'In bed', left: [], done: true, sub: 'Good night!' };
  return { phase: 'late', title: 'After lights out', left: left(b), done: false, sub: 'Lights out was ' + lo.time };
}
