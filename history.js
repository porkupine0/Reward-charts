// History: each kid's month at a glance.
import { watch, ymd, addDays, mondayOf, esc, statusPill } from './store.js?v=1794441590';
import { KIDS, timerResult, applyConfig } from './routines.js?v=1794441590';
import * as L from './lists.js?v=1794441590';
import { dayFull } from './streaks.js?v=1794441590';

const $ = (id) => document.getElementById(id);
const ctx = { routines: {}, run: {}, isaiah: {} };
let kid = new URLSearchParams(location.search).get('kid') || (() => { try { return localStorage.getItem('rc:lastKid') || 'eli'; } catch (e) { return 'eli'; } })();
if (!KIDS[kid]) kid = 'eli';
let month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function render() {
  const k = KIDS[kid], today = ymd(new Date());
  document.body.style.setProperty('--accent', k.accent);
  $('kidtabs').innerHTML = Object.entries(KIDS).map(([id, x]) => '<button role="tab" data-kid="' + id + '" aria-selected="' + (id === kid) + '" style="--accent:' + x.accent + '">' + esc(x.name) + '</button>').join('');
  $('back').href = 'kid.html?kid=' + kid; $('back').innerHTML = '&larr; ' + esc(k.name);
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
watch('config', (d) => { applyConfig(d); render(); });
