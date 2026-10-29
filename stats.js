import { watch, ymd, parseYmd, mondayOf, addDays, shortDate, esc, statusPill } from './store.js';
import { KIDS, fmtTime, timerResult } from './routines.js';

const $ = (id) => document.getElementById(id);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const params = new URLSearchParams(location.search);
let week = mondayOf(params.get('week') ? parseYmd(params.get('week')) : new Date());
let data = {};

const clock = (s) => (s == null ? '–' : Math.floor(s / 60) + ':' + String(Math.round(s) % 60).padStart(2, '0'));
const hm = (ms) => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/ [AP]M$/, '');

function kidWeek(kid) {
  const nights = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(week, i);
    const day = ((data.days || {})[ymd(d)] || {})[kid] || {};
    const rec = day.bedTimer;
    nights.push({ d, i, rec, res: timerResult(kid, d, rec, day) });
  }
  const done = nights.filter((n) => n.res);
  const secs = done.map((n) => n.res.secs);
  return {
    nights,
    timed: done.length,
    onTime: done.filter((n) => n.res.onTime).length,
    allSteps: done.filter((n) => n.res.done === n.res.total).length,
    avg: secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : null,
    best: secs.length ? Math.min(...secs) : null
  };
}

function render() {
  const wk = ymd(week);
  $('weeklabel').textContent = 'Week of ' + shortDate(week) + ' – ' + shortDate(addDays(week, 6));
  $('thisweek').hidden = ymd(mondayOf(new Date())) === wk;
  history.replaceState(null, '', ymd(mondayOf(new Date())) === wk ? location.pathname : '?week=' + wk);

  const all = Object.entries(KIDS).map(([id, k]) => ({ id, k, s: kidWeek(id) }));

  $('summary').innerHTML = all.map(({ k, s }) =>
    '<div class="sumcard" style="--accent:' + k.accent + '"><strong>' + esc(k.name) + '</strong>' +
    '<span class="big">' + s.onTime + '<small>/7</small></span><span class="lbl">on time</span>' +
    '<span class="sm">avg ' + clock(s.avg) + '</span></div>').join('');

  $('kids').innerHTML = all.map(({ id, k, s }) => {
    const rows = s.nights.map((n) => {
      const today = ymd(n.d) === ymd(new Date());
      if (!n.rec || !n.rec.start) return '<tr class="none"><td>' + DAYS[n.i] + ' <small>' + n.d.getDate() + '</small></td><td colspan="3">' + (n.d > new Date() ? '' : 'Not timed') + '</td></tr>';
      if (!n.res) return '<tr><td>' + DAYS[n.i] + ' <small>' + n.d.getDate() + '</small></td><td>' + hm(n.rec.start) + ' →</td><td colspan="2">' + (today ? 'Running…' : 'Never stopped') + '</td></tr>';
      const r = n.res;
      return '<tr><td>' + DAYS[n.i] + ' <small>' + n.d.getDate() + '</small></td><td>' + hm(n.rec.start) + '–' + hm(n.rec.end) +
        '<br><small>lights out ' + fmtTime(r.lo) + '</small></td><td><b>' + clock(r.secs) + '</b></td><td>' +
        '<span class="pill ' + (r.onTime ? 'ok' : 'bad') + '">' + (r.onTime ? 'On time' : 'Late') + '</span>' +
        (r.done < r.total ? ' <small>' + r.done + '/' + r.total + '</small>' : '') + '</td></tr>';
    }).join('');
    return '<section class="card kidstats" style="--accent:' + k.accent + '"><div class="rhead"><h2>' + esc(k.name) + '</h2>' +
      '<a class="cklink" href="checklist.html?kid=' + id + '">Checklist &rarr;</a></div>' +
      '<div class="weekstats">' +
      '<div><strong>' + s.onTime + '/' + s.timed + '</strong><small>on time</small></div>' +
      '<div><strong>' + clock(s.avg) + '</strong><small>avg time</small></div>' +
      '<div><strong>' + clock(s.best) + '</strong><small>fastest</small></div>' +
      '<div><strong>' + s.allSteps + '</strong><small>all steps</small></div></div>' +
      '<div class="tablewrap"><table class="nighttable"><thead><tr><th>Night</th><th>Start–stop</th><th>Time</th><th></th></tr></thead><tbody>' +
      rows + '</tbody></table></div></section>';
  }).join('');
}

function go(n) { week = addDays(week, 7 * n); render(); }
$('prev').onclick = () => go(-1);
$('next').onclick = () => go(1);
$('thisweek').onclick = () => { week = mondayOf(new Date()); render(); };

render();
watch('routines', (d) => { data = d; render(); }, statusPill($('sync')));
