import { watch, save, ymd, parseYmd, mondayOf, addDays, shortDate, esc, statusPill } from './store.js';
import { CHARTS, weekProgress } from './charts.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const chart = CHARTS[document.body.dataset.chart];
document.documentElement.style.setProperty('--accent', chart.accent);

const params = new URLSearchParams(location.search);
let week = mondayOf(params.get('week') ? parseYmd(params.get('week')) : new Date());
let data = {};

const $ = (id) => document.getElementById(id);
$('eyebrow').textContent = chart.eyebrow;
$('note').innerHTML = chart.note;

function monthWeeks(monday) {
  // Every week whose Monday falls in the same month as this one.
  const first = new Date(monday.getFullYear(), monday.getMonth(), 1);
  let d = mondayOf(first);
  if (d.getMonth() !== monday.getMonth()) d = addDays(d, 7);
  const out = [];
  while (d.getMonth() === monday.getMonth()) { out.push(new Date(d)); d = addDays(d, 7); }
  return out;
}

function render() {
  const wk = ymd(week);
  const wd = (data.weeks && data.weeks[wk]) || {};
  const checks = wd.checks || {};
  const today = ymd(new Date());

  $('weeklabel').textContent = 'Week of ' + shortDate(week);
  $('thisweek').hidden = ymd(mondayOf(new Date())) === wk;

  // grid
  let h = '<div class="g-corner"></div>';
  DAYS.forEach((d, i) => {
    const date = addDays(week, i);
    h += '<div class="g-day' + (ymd(date) === today ? ' is-today' : '') + '"><span>' + d + '</span><small>' + date.getDate() + '</small></div>';
  });
  chart.rows.forEach((r) => {
    h += '<div class="g-label"><strong>' + esc(r.label) + '</strong><small>' + esc(r.sub) + '</small></div>';
    r.cells.forEach((c, i) => {
      if (c === '-') { h += '<div class="cell off" aria-hidden="true">Off</div>'; return; }
      const on = !!(checks[r.key] && checks[r.key][i]);
      const text = c === 'x' ? '' : c.t;
      const cls = 'cell' + (c.opt ? ' opt' : '') + (on ? ' on' : '');
      const lbl = r.label + ', ' + DAYS[i] + (text ? ', ' + text : '') + (c.opt ? ', optional' : '');
      h += '<button class="' + cls + '" data-row="' + r.key + '" data-day="' + i + '" aria-pressed="' + on + '" aria-label="' + esc(lbl) + '">' +
        '<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' +
        (text ? '<span>' + esc(text) + '</span>' : '') + '</button>';
    });
  });
  $('grid').innerHTML = h;

  // progress + weekly reward
  const p = weekProgress(chart, wd);
  $('progress').textContent = p.done + ' of ' + p.need;
  $('bar').style.width = (p.need ? (100 * p.done / p.need) : 0) + '%';
  $('weeklycard').classList.toggle('unlocked', p.perfect);
  $('weeklystatus').textContent = p.perfect ? 'Reward earned! Pick one:' : 'Check every white box to unlock';
  $('weekly').innerHTML = chart.weekly.map((w, i) =>
    '<button class="pick' + (wd.reward === i ? ' chosen' : '') + '" data-reward="' + i + '"' + (p.perfect ? '' : ' disabled') + '>' +
    '<span class="dot"></span>' + esc(w) + '</button>').join('');
  $('given').checked = !!wd.given;
  $('given').disabled = !p.perfect;

  // monthly
  const weeks = monthWeeks(week);
  const mk = wk.slice(0, 7);
  const md = (data.months && data.months[mk]) || {};
  let allPerfect = true;
  $('monthname').textContent = week.toLocaleDateString('en-US', { month: 'long' }) + ' prize';
  $('circles').innerHTML = weeks.map((w, i) => {
    const pp = weekProgress(chart, data.weeks && data.weeks[ymd(w)]);
    if (!pp.perfect) allPerfect = false;
    return '<span class="circle' + (pp.perfect ? ' full' : '') + (ymd(w) === wk ? ' current' : '') + '" title="Week of ' + shortDate(w) + '">' + (i + 1) + '</span>';
  }).join('');
  $('monthlystatus').textContent = allPerfect ? 'Every week perfect! Pick one:' : 'Every week of the month perfect? Pick one:';
  $('monthly').innerHTML = chart.monthly.map((w, i) =>
    '<button class="pick' + (md.prize === i ? ' chosen' : '') + '" data-prize="' + i + '"' + (allPerfect ? '' : ' disabled') + '>' +
    '<span class="dot"></span>' + esc(w) + '</button>').join('');
  $('monthcard').classList.toggle('unlocked', allPerfect);
}

document.addEventListener('click', (e) => {
  const cell = e.target.closest('button.cell');
  const wk = ymd(week);
  if (cell) {
    const on = cell.getAttribute('aria-pressed') !== 'true';
    save(chart.id, 'weeks/' + wk + '/checks/' + cell.dataset.row + '/' + cell.dataset.day, on);
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
$('given').addEventListener('change', (e) => save(chart.id, 'weeks/' + ymd(week) + '/given', e.target.checked));
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
