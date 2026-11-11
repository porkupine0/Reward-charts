// History: each kid's month at a glance, and Eli's time-trial trend.
import { watch, ymd, addDays, mondayOf, esc, statusPill } from './store.js?v=1794440709';
import { KIDS, timerResult, applyConfig } from './routines.js?v=1794440709';
import * as L from './lists.js?v=1794440709';
import { dayFull } from './streaks.js?v=1794440709';
import { score, fmt } from './trials.js?v=1794440709';

const $ = (id) => document.getElementById(id);
const ctx = { routines: {}, run: {}, isaiah: {} };
let trials = {};
let kid = (() => { try { return localStorage.getItem('rc:lastKid') || 'eli'; } catch (e) { return 'eli'; } })();
if (!KIDS[kid]) kid = 'eli';
let month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function render() {
  const k = KIDS[kid], today = ymd(new Date());
  document.body.style.setProperty('--accent', k.accent);
  $('kidtabs').innerHTML = Object.entries(KIDS).map(([id, x]) => '<button role="tab" data-kid="' + id + '" aria-selected="' + (id === kid) + '" style="--accent:' + x.accent + '">' + esc(x.name) + '</button>').join('');
  $('monthlabel').textContent = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  let h = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => '<span class="calh">' + d + '</span>').join('');
  let d = mondayOf(month), full = 0, onTime = 0, past = 0;
  while (d.getMonth() === month.getMonth() || d < month) {
    const key = ymd(d), inMonth = d.getMonth() === month.getMonth();
    if (!inMonth || key > today) { h += '<span class="calday' + (inMonth ? ' future' : ' out') + '">' + (inMonth ? d.getDate() : '') + '</span>'; d = addDays(d, 1); continue; }
    past++;
    const ls = L.lists(ctx, kid, d);
    const all = [...ls.day, ...ls.bed].filter((i) => !i.opt);
    const n = all.filter((i) => L.isOn(ctx, kid, d, i)).length;
    const isFull = dayFull(ctx, kid, d);
    const c = L.dayChecks(ctx, kid, d), r = timerResult(kid, d, c.bedTimer, c);
    if (isFull) full++;
    if (r && r.onTime) onTime++;
    h += '<a class="calday' + (isFull ? ' full' : n ? ' part' : '') + (key === today ? ' today' : '') + '" href="checklist.html?kid=' + kid + '&date=' + key + '" aria-label="' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ': ' + n + ' of ' + all.length + ' done' + (r && r.onTime ? ', in bed on time' : '') + '">' +
      d.getDate() + (r && r.onTime ? '<i class="bdot" aria-hidden="true"></i>' : '') + '</a>';
    d = addDays(d, 1);
    if (d.getMonth() !== month.getMonth() && (d.getDay() + 6) % 7 === 0) break;
  }
  $('cal').innerHTML = h;
  $('monthsum').innerHTML = past ? '<b>' + full + '</b> of ' + past + ' days with the whole checklist done · <b>' + onTime + '</b> on-time bedtimes. Tap a day to open it.' : '';
  $('next').disabled = ymd(addDays(month, 32)).slice(0, 7) > today.slice(0, 7);
  $('trendcard').hidden = kid !== 'eli';
  if (kid === 'eli') $('trend').innerHTML = trend();
}

// Pace per mile for each trial, mile and 5K as two lines.
function trend() {
  const sc = score(trials);
  if (!sc.trials.length) return '<p class="muted">No trials yet. Each one shows up here.</p>';
  const pts = sc.trials.map((t) => ({ t: new Date(t.date + 'T12:00').getTime(), pace: t.kind === 'mile' ? t.secs : t.secs / 3.10686, kind: t.kind, label: fmt(t.secs) }));
  const W = 360, H = 220, P = { l: 44, r: 14, t: 14, b: 30 };
  const t0 = Math.min(...pts.map((p) => p.t)), t1 = Math.max(...pts.map((p) => p.t)) || t0 + 1;
  const lo = Math.floor(Math.min(...pts.map((p) => p.pace)) / 15) * 15 - 15, hi = Math.ceil(Math.max(...pts.map((p) => p.pace)) / 15) * 15 + 15;
  const x = (t) => P.l + (t1 === t0 ? (W - P.l - P.r) / 2 : (t - t0) / (t1 - t0) * (W - P.l - P.r));
  const y = (v) => P.t + (v - lo) / (hi - lo) * (H - P.t - P.b);
  let g = '';
  for (let v = lo; v <= hi; v += 15) g += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="grid"/><text x="' + (P.l - 6) + '" y="' + (y(v) + 4) + '" class="ax" text-anchor="end">' + fmt(v) + '</text>';
  const series = (kind, cls) => {
    const s = pts.filter((p) => p.kind === kind);
    if (!s.length) return '';
    return '<polyline class="' + cls + '" fill="none" points="' + s.map((p) => x(p.t) + ',' + y(p.pace)).join(' ') + '"/>' +
      s.map((p) => '<circle class="' + cls + '" cx="' + x(p.t) + '" cy="' + y(p.pace) + '" r="4.5"><title>' + (kind === 'mile' ? 'Mile ' : '5K ') + p.label + '</title></circle>').join('');
  };
  const dates = [t0, t1].filter((v, i, a) => a.indexOf(v) === i).map((t) => '<text x="' + x(t) + '" y="' + (H - 10) + '" class="ax" text-anchor="middle">' + new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</text>').join('');
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Time-trial pace per mile over time">' + g + series('5k', 's5k') + series('mile', 'smile') + dates + '</svg>' +
    '<div class="calkey"><span><i class="k smile"></i>Mile</span><span><i class="k s5k"></i>5K (per mile)</span></div>';
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-kid]');
  if (t) { kid = t.dataset.kid; try { localStorage.setItem('rc:lastKid', kid); } catch (err) {} render(); }
});
$('prev').onclick = () => { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); render(); };
$('next').onclick = () => { month = new Date(month.getFullYear(), month.getMonth() + 1, 1); render(); };

render();
watch('routines', (d) => { ctx.routines = d; render(); }, statusPill($('sync')));
watch('eli-run', (d) => { ctx.run = d; render(); });
watch('isaiah', (d) => { ctx.isaiah = d; render(); });
watch('eli-trials', (d) => { trials = d; render(); });
watch('config', (d) => { applyConfig(d); render(); });
