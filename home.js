// Home page: "Today" for each kid, plus a one-line status on every card.
import { watch, ymd, mondayOf, addDays, statusPill, esc } from './store.js?v=1794428564';
import { CHARTS, weekProgress } from './charts.js?v=1794428564';
import { KIDS, timerResult, applyConfig } from './routines.js?v=1794428564';
import { planFor } from './plan.js?v=1794428564';
import * as L from './lists.js?v=1794428564';
import { owed } from './trials.js?v=1794428564';
import { isParent, setParent } from './parent.js?v=1794428564';
import { dayStreak } from './streaks.js?v=1794428564';

const $ = (id) => document.getElementById(id);
const ctx = { routines: {}, run: {}, isaiah: {} };
const charts = { eli: {}, trombone: {} };
let trialsData = {};

const short = (l) => l.replace(/^Chore: /, '').replace(/ \(.*\)$/, '');

function render() {
  const t = new Date(), mon = mondayOf(t);
  $('todaydate').textContent = t.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Today: the same lists and "done" rules as each kid's checklist
  $('todaylist').innerHTML = Object.entries(KIDS).map(([id, k]) => {
    const ls = L.lists(ctx, id, t);
    const m = L.progress(ctx, id, t, ls.morning), d = L.progress(ctx, id, t, ls.day), b = L.progress(ctx, id, t, ls.bed);
    let main;
    if (t.getHours() < 12 && m.left.length) main = '<b>Morning: ' + m.left.length + ' left</b>';
    else if (d.left.length) main = '<b>' + d.left.length + ' left</b> ' + d.left.slice(0, 2).map((i) => esc(short(i.label))).join(' · ') + (d.left.length > 2 ? ' · +' + (d.left.length - 2) + ' more' : '');
    else main = d.req.length ? '<b>' + (L.dowOf(t) <= 4 ? 'After school' : 'Today') + ' done ✓</b>' : 'Nothing on the list';
    const lo = ls.bed.length ? ls.bed[ls.bed.length - 1].time : '';
    const streak = dayStreak(ctx, id, t);
    return '<a class="todayrow" href="checklist.html?kid=' + id + '" style="--accent:' + k.accent + '"><strong>' + esc(k.name) + '</strong>' +
      '<span class="tr-main">' + main + (streak >= 2 ? ' <span class="streak">' + streak + '-day streak</span>' : '') + '</span>' +
      '<span class="tr-bed">' + (b.left.length ? 'Lights out ' + lo : 'Bedtime done ✓') + '</span><span class="tr-go" aria-hidden="true">&rsaquo;</span></a>';
  }).join('');

  // Weekly charts
  ['eli', 'trombone'].forEach((id) => {
    const p = weekProgress(CHARTS[id], L.effectiveWeek(CHARTS[id], mon, (charts[id].weeks || {})[ymd(mon)], ctx));
    $('p-' + id).textContent = p.perfect ? 'Perfect week!' : p.done + '/' + p.need + ' this week';
  });

  // Training
  const p = planFor(t);
  $('p-run').textContent = p ? 'Today: ' + p.title + (L.eliRunDone(ctx.run, t) ? ' · done!' : '') : 'Plan finished';
  const n = owed(trialsData).length;
  $('p-trials').textContent = n ? ' · ' + n + ' prize' + (n > 1 ? 's' : '') + ' to pay' : '';

  // Bedtime
  $('p-stats').textContent = 'On time this week: ' + Object.entries(KIDS).map(([id, k]) => {
    let on = 0;
    for (let i = 0; i < 7; i++) {
      const x = addDays(mon, i), day = L.dayChecks(ctx, id, x);
      const r = timerResult(id, x, day.bedTimer, day);
      if (r && r.onTime) on++;
    }
    return k.name + ' ' + on;
  }).join(' · ');

  // Ball Master
  const iz = ctx.isaiah, start = iz.start ? new Date(iz.start + 'T00:00') : mon;
  let full = 0;
  for (let i = 0; i < 28; i++) if (L.touchedOn(iz, ymd(addDays(start, i)))) full++;
  $('p-isaiah').textContent = full + '/28 days · ' + Object.keys(iz.juggle || {}).length + '/10 levels';

  // Parent line
  $('parentline').innerHTML = isParent()
    ? '<b>Parent phone.</b> Parent boxes are unlocked here. <button class="linkbtn" id="lockbtn">Lock this phone</button>'
    : 'Parent boxes (Reward given, Paid, Parent OK) ask for the parent PIN on this phone.';
  const lb = $('lockbtn'); if (lb) lb.onclick = () => { setParent(false); render(); };
}

render();
watch('routines', (d) => { ctx.routines = d; render(); }, statusPill($('sync')));
watch('eli-run', (d) => { ctx.run = d; render(); });
watch('isaiah', (d) => { ctx.isaiah = d; render(); });
watch('eli', (d) => { charts.eli = d; render(); });
watch('trombone', (d) => { charts.trombone = d; render(); });
watch('eli-trials', (d) => { trialsData = d; render(); });
watch('config', (d) => { applyConfig(d); render(); });
