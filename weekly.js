import { watch, save, ymd, parseYmd, mondayOf, addDays, shortDate, esc, statusPill, dateParam } from './store.js?v=1795043575';
import { askParent } from './parent.js?v=1795043575';
import { CHARTS, weekProgress, rowsFor, TIED_FROM } from './charts.js?v=1795043575';
import { applySettings, SETTINGS } from './settings.js?v=1795043575';
import { weekStreak, cheerIf } from './streaks.js?v=1795043575';
import { gameWeek } from './lists.js?v=1795043575';
import * as L from './lists.js?v=1795043575';
import { cellOn, derivedCell, effectiveWeek } from './lists.js?v=1795043575';

const fmtMin = (m) => (m >= 60 ? Math.floor(m / 60) + ' hr' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const chart = CHARTS[document.body.dataset.chart];
document.documentElement.style.setProperty('--accent', chart.accent);

const params = new URLSearchParams(location.search);
let week = mondayOf(dateParam('week'));
let data = {};
const ctx = { routines: {}, run: {}, isaiah: {} };
const kidId = chart.kidId;
const tied = () => ymd(week) >= TIED_FROM;
const eff = (monday) => effectiveWeek(chart, monday, (data.weeks || {})[ymd(monday)], ctx);

const $ = (id) => document.getElementById(id);
$('eyebrow').textContent = chart.eyebrow;
// Game-time card (all three boys), above the perfect-week reward
if (chart.gameTime) {
  $('weeklycard').insertAdjacentHTML('beforebegin', '<section id="gamecard" class="card reward"><h2>Weekend game time</h2><p id="gtstatus" class="status"></p><div id="gtbody"></div></section>');
  if (chart.gameOnly) $('weeklycard').style.display = 'none';
}
if (!chart.monthly.length) $('monthcard').style.display = 'none';

function monthWeeks(monday) {
  // Every week whose Monday falls in the same month as this one.
  const first = new Date(monday.getFullYear(), monday.getMonth(), 1);
  let d = mondayOf(first);
  if (d.getMonth() !== monday.getMonth()) d = addDays(d, 7);
  const out = [];
  while (d.getMonth() === monday.getMonth()) { out.push(new Date(d)); d = addDays(d, 7); }
  return out;
}

function renderGame() {
  // Earned on school days (minutes per day from Settings), used in pieces on the weekend
  const g = gameWeek(ctx, kidId, week), now = new Date(), today = ymd(now);
  const n = (L.CHECKS[kidId] || []).length;
  $('gamecard').classList.toggle('unlocked', g.minutes > 0);
  $('gtstatus').innerHTML = '<span class="gt-big">' + fmtMin(g.minutes) + '</span> of ' + fmtMin(g.max) + ' earned this week';
  const t = g.days.find((d) => ymd(d.date) === today);
  $('gtbody').innerHTML = '<div class="gt-days">' + g.days.map((d) => { const k = ymd(d.date); return '<div class="gt-day' + (d.earned ? ' on' : '') + '"><b>' + DAYS[(d.date.getDay() + 6) % 7] + '</b><span>' + (d.earned ? '+' + d.worth + ' min' : k > today ? 'to come' : k === today ? 'not yet' : 'not earned') + '</span></div>'; }).join('') + '</div>' +
    // past days that didn't earn: why (a late chore or a filled-in check can still earn them)
    g.days.filter((d) => !d.earned && ymd(d.date) < today).map((d) => '<p class="gt-why"><b>' + DAYS[(d.date.getDay() + 6) % 7] + ' not earned:</b> ' + esc(L.leftSummary(d.left).replace(/^\d+ still to do: /, '')) + '</p>').join('') +
    (t && !t.earned ? '<p class="gt-today"><b>Today, ' + esc(L.leftSummary(t.left)).replace(': ', ':</b> ') + '</p>' : t ? '<p class="gt-today"><b>Today: +' + t.worth + ' min earned ✓</b></p>' : '') +
    (g.carriedIn ? '<p class="gt-why"><b>+' + fmtMin(g.carriedIn) + ' carried over</b> from last week.</p>' : '') +
    (g.carriedOut ? '<p class="gt-why"><b>' + fmtMin(g.carriedOut) + ' moved</b> to the next week.</p>' : '') +
    (g.letGo ? '<p class="gt-why"><b>' + fmtMin(g.letGo) + ' let go</b> (not carried over).</p>' : '') +
    '<div class="gt-sum"><span>Earned <b>' + fmtMin(g.minutes) + '</b></span><span>Used <b>' + fmtMin(g.used) + '</b></span><span>Left <b>' + fmtMin(g.left) + '</b></span></div>' +
    (g.left > 0 ? '<div class="gt-use"><span>Played:</span>' + [15, 30, 60].filter((m) => m <= g.left).map((m) => '<button class="chip" data-gtuse="' + m + '">' + fmtMin(m) + '</button>').join('') +
      '<button class="chip" data-gtuse="other">Other…</button></div>' : '') +
    (g.uses.length ? '<ul class="gt-log">' + g.uses.map((u) => '<li><span>' + esc(new Date(u.at).toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + new Date(u.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })) + ' · <b>' + fmtMin(u.minutes) + '</b></span><button class="linkbtn" data-gtundo="' + u.at + '">Undo</button></li>').join('') + '</ul>' : '') +
    '<p class="note">Each school day with the whole checklist done and ' + (n === 3 ? 'all three' : 'both') + ' evening checks = ' + (t ? t.worth : SETTINGS.game) + ' minutes, to use Saturday and Sunday. Log each time you play so you know what’s left.</p>';
}

function render() {
  $('note').innerHTML = chart.note; // uses the current game-time setting
  const wk = ymd(week);
  const wd = (data.weeks && data.weeks[wk]) || {};
  const today = ymd(new Date());

  $('weeklabel').textContent = 'Week of ' + shortDate(week);
  $('thisweek').hidden = ymd(mondayOf(new Date())) === wk;

  // grid
  let h = '<div class="g-corner"></div>';
  DAYS.forEach((d, i) => {
    const date = addDays(week, i);
    h += '<div class="g-day' + (ymd(date) === today ? ' is-today' : '') + '"><span>' + d + '</span><small>' + date.getDate() + '</small></div>';
  });
  rowsFor(chart, week).forEach((r) => {
    h += '<div class="g-label"><strong>' + esc(r.label) + '</strong><small>' + esc(r.sub) + '</small></div>';
    r.cells.forEach((c, i) => {
      if (c === '-') { h += '<div class="cell off" aria-hidden="true">Off</div>'; return; }
      const on = cellOn(chart.id, r.key, i, week, wd, ctx);
      const auto = derivedCell(chart.id, r.key, i, week, ctx) !== undefined;
      const text = c === 'x' ? '' : c.t;
      const cls = 'cell' + (c.opt ? ' opt' : '') + (on ? ' on' : '') + (auto ? ' auto' : '') + (tied() ? ' tied' : '');
      const lbl = r.label + ', ' + DAYS[i] + (text ? ', ' + text : '') + (c.opt ? ', optional' : '');
      h += '<button class="' + cls + '" data-row="' + r.key + '" data-day="' + i + '" aria-pressed="' + on + '" aria-label="' + esc(lbl) + '">' +
        '<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' +
        (text ? '<span>' + esc(text) + '</span>' : '') + '</button>';
    });
  });
  $('grid').innerHTML = h;

  // progress + weekly reward
  const p = weekProgress(chart, eff(week));
  const ws = weekStreak(chart, data, ctx, new Date());
  $('progress').textContent = p.done + ' of ' + p.need + (ws >= 2 ? ' · ' + ws + ' perfect weeks in a row' : '');
  cheerIf('week' + wk, p.perfect, chart.weekly.length ? 'Perfect week! Pick your reward.' : 'Perfect week!');
  $('bar').style.width = (p.need ? (100 * p.done / p.need) : 0) + '%';
  if (chart.gameTime) renderGame();
  {
  $('weeklycard').classList.toggle('unlocked', p.perfect);
  $('weeklystatus').textContent = p.perfect ? 'Reward earned! Pick one:' : 'Check every white box to unlock';
  $('weekly').innerHTML = chart.weekly.map((w, i) =>
    '<button class="pick' + (wd.reward === i ? ' chosen' : '') + '" data-reward="' + i + '"' + (p.perfect ? '' : ' disabled') + '>' +
    '<span class="dot"></span>' + esc(w) + '</button>').join('');
  $('given').checked = !!wd.given;
  $('given').disabled = !p.perfect;
  }

  if (!chart.monthly.length) return;
  // monthly
  const weeks = monthWeeks(week);
  const mk = wk.slice(0, 7);
  const md = (data.months && data.months[mk]) || {};
  let allPerfect = true;
  $('monthname').textContent = week.toLocaleDateString('en-US', { month: 'long' }) + ' prize';
  $('circles').innerHTML = weeks.map((w, i) => {
    const pp = weekProgress(chart, eff(w));
    if (!pp.perfect) allPerfect = false;
    return '<span class="circle' + (pp.perfect ? ' full' : '') + (ymd(w) === wk ? ' current' : '') + '" title="Week of ' + shortDate(w) + '">' + (i + 1) + '</span>';
  }).join('');
  $('monthlystatus').textContent = allPerfect ? 'Every week perfect! Pick one:' : 'Every week of the month perfect? Pick one:';
  $('monthly').innerHTML = chart.monthly.map((w, i) =>
    '<button class="pick' + (md.prize === i ? ' chosen' : '') + '" data-prize="' + i + '"' + (allPerfect ? '' : ' disabled') + '>' +
    '<span class="dot"></span>' + esc(w) + '</button>').join('');
  $('monthcard').classList.toggle('unlocked', allPerfect);
  $('mgiven').checked = !!md.given;
  $('mgiven').disabled = !allPerfect;
}

document.addEventListener('click', (e) => {
  const cell = e.target.closest('button.cell');
  const wk = ymd(week);
  if (cell && rowsFor(chart, week).find((r) => r.key === cell.dataset.row && r.parent)) {
    // Evening checks (Eli): Mom or Dad marks them; stored with the day's checklist
    const date = addDays(week, Number(cell.dataset.day)), path = 'days/' + ymd(date) + '/' + kidId + '/' + cell.dataset.row;
    const want = cell.getAttribute('aria-pressed') !== 'true';
    askParent().then((ok) => { if (ok) save('routines', path, want ? true : 'no'); });
    return;
  }
  if (cell && tied()) {
    // Every box comes from the checklist: open the day it belongs to
    const date = ymd(addDays(week, Number(cell.dataset.day))), isToday = date === ymd(new Date()), row = cell.dataset.row;
    if (chart.id === 'eli' && row === 'running') location.href = 'run.html' + (isToday ? '' : '?date=' + date);
    else if (chart.id === 'zay' && row === 'soccer') location.href = 'isaiah.html';
    else location.href = 'checklist.html?kid=' + kidId + (isToday ? '' : '&date=' + date);
    return;
  }
  const gu = e.target.closest('[data-gtuse]');
  if (gu) {
    const g = gameWeek(ctx, kidId, week);
    let m;
    if (gu.dataset.gtuse === 'other') {
      const typed = prompt('How long did you play? (' + g.left + ' min left) For example 45, 1 hr or 1:30', '');
      if (typed === null) return;
      m = L.parseMinutes(typed);
      if (!m) { $('gtstatus').insertAdjacentHTML('afterend', '<p class="gt-msg" role="alert">Couldn’t read “' + esc(typed) + '”. Try 45, 1 hr or 1:30.</p>'); setTimeout(() => { const x = document.querySelector('.gt-msg'); if (x) x.remove(); }, 6000); return; }
    } else m = Number(gu.dataset.gtuse);
    m = Math.min(Math.round(m), g.left);
    let at = Date.now();
    while (g.uses.some((u) => u.at === at)) at++; // each entry its own key
    if (m > 0) save('routines', 'game/' + kidId + '/' + wk + '/' + at, m);
    return;
  }
  const gx = e.target.closest('[data-gtundo]');
  if (gx) { save('routines', 'game/' + kidId + '/' + wk + '/' + gx.dataset.gtundo, null); return; }
  if (cell) {
    // Boxes the checklist fills: a tap here is a hand override (stored as true or 'off');
    // tapping back to what the checklist says clears the override.
    const row = cell.dataset.row, i = Number(cell.dataset.day);
    const want = cell.getAttribute('aria-pressed') !== 'true';
    const auto = derivedCell(chart.id, row, i, week, ctx);
    const v = auto !== undefined && want === !!auto ? null : want ? true : (auto ? 'off' : null);
    save(chart.id, 'weeks/' + wk + '/checks/' + row + '/' + i, v);
    return;
  }
  const rw = e.target.closest('[data-reward]');
  if (rw) {
    const cur = data.weeks && data.weeks[wk] && data.weeks[wk].reward;
    const i = Number(rw.dataset.reward);
    save(chart.id, 'weeks/' + wk + '/reward', cur === i ? null : i);
    return;
  }
  const pz = e.target.closest('[data-prize]');
  if (pz) {
    const mk = wk.slice(0, 7);
    const cur = data.months && data.months[mk] && data.months[mk].prize;
    const i = Number(pz.dataset.prize);
    save(chart.id, 'months/' + mk + '/prize', cur === i ? null : i);
  }
});
// Parent boxes: undo the tap, then set it once the PIN check passes.
function parentBox(id, pathFn) {
  $(id).addEventListener('change', (e) => {
    const want = e.target.checked, path = pathFn();
    e.target.checked = !want;
    askParent().then((ok) => { if (ok) save(chart.id, path, want); });
  });
}
parentBox('given', () => 'weeks/' + ymd(week) + '/given');
parentBox('mgiven', () => 'months/' + ymd(week).slice(0, 7) + '/given');
function go(n) {
  week = addDays(week, 7 * n);
  history.replaceState(null, '', '?week=' + ymd(week));
  render();
}
$('prev').onclick = () => go(-1);
$('next').onclick = () => go(1);
$('thisweek').onclick = () => { week = mondayOf(new Date()); history.replaceState(null, '', location.pathname); render(); };

render();
watch(chart.id, (d) => { data = d; render(); }, statusPill($('sync')));
watch('routines', (d) => { ctx.routines = d; render(); });
watch('config', (d) => { applySettings(d); render(); });
if (chart.id === 'eli') watch('eli-run', (d) => { ctx.run = d; render(); });
if (chart.id === 'zay') watch('isaiah', (d) => { ctx.isaiah = d; render(); });
