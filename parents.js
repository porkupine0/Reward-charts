// Parents page: what's owed, late nights, this week, Calendar reminders, backup and cleanup.
import { watch, save, ymd, parseYmd, mondayOf, addDays, shortDate, esc, statusPill } from './store.js?v=1794511205';
import { CHARTS, weekProgress } from './charts.js?v=1794511205';
import { KIDS, timerResult, bedtime, applyConfig } from './routines.js?v=1794511205';
import * as L from './lists.js?v=1794511205';
import { owed, score, planned, fmt } from './trials.js?v=1794511205';
import { LEVELS, WEEKLY, CHAMPION } from './bm.js?v=1794511205';
import { askParent, setParent, changePin } from './parent.js?v=1794511205';
import { dayFull } from './streaks.js?v=1794511205';
import { owedItems } from './owed.js?v=1794511205';
import { nowHtml } from './nowview.js?v=1794511205';

const $ = (id) => document.getElementById(id);
const IDS = ['routines', 'eli-run', 'isaiah', 'eli', 'trombone', 'eli-trials', 'config'];
const D = Object.fromEntries(IDS.map((id) => [id, {}]));
const ctx = { get routines() { return D.routines; }, get run() { return D['eli-run']; }, get isaiah() { return D.isaiah; } };
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const tick = (chart, path, label) => '<button class="cash" data-chart="' + chart + '" data-path="' + esc(path) + '"><span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' + esc(label) + '</button>';
const row = (who, accent, what, when, action) => '<div class="prow2" style="--accent:' + accent + '"><span class="pwho">' + esc(who) + '</span><span class="pwhat">' + what + (when ? '<small>' + esc(when) + '</small>' : '') + '</span>' + (action || '') + '</div>';

const owedList = () => owedItems(D, ctx, row, tick);

const PAGES = { eli: [['Checklist', 'checklist.html?kid=eli'], ['Chart', 'eli.html'], ['Training', 'run.html']],
  rhett: [['Checklist', 'checklist.html?kid=rhett'], ['Chart', 'trombone.html']],
  isaiah: [['Checklist', 'checklist.html?kid=isaiah'], ['Ball Master', 'isaiah.html']] };

function render() {
  const today = new Date(), mon = mondayOf(today);
  // Right now: where each kid is, given the time of day
  $('nowhead').textContent = 'Right now · ' + today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  $('nowall').innerHTML = Object.entries(KIDS).map(([id, k]) => '<div class="nowkid" style="--accent:' + k.accent + '"><div class="nowkid-top"><a class="nowname" href="kid.html?kid=' + id + '">' + esc(k.name) + '</a>' +
    '<span class="nowlinks">' + PAGES[id].map(([t, h]) => '<a href="' + h + '">' + t + '</a>').join('') + '</span></div>' + nowHtml(L.nowStatus(ctx, id, today), 5) + '</div>').join('');
  const o = owedList();
  $('owedcount').textContent = o.length ? o.length + ' to go' : 'All caught up';
  $('owed').innerHTML = o.join('') || '<p class="muted">Nothing owed right now.</p>';

  // Late nights
  const late = [];
  for (let i = 1; i <= 7; i++) {
    const d = addDays(today, -i);
    Object.entries(KIDS).forEach(([id, k]) => {
      const c = L.dayChecks(ctx, id, d), r = timerResult(id, d, c.bedTimer, c);
      if (r && r.status === 'late') late.push(row(k.name, k.accent, 'Late by ' + r.lateBy + ' min', DAYS[(d.getDay() + 6) % 7] + ' ' + shortDate(d) + ' · lights out ' + bedtime(id, (d.getDay() + 6) % 7).slice(-1)[0].time, '<button class="tbtn approve" data-bedok="' + ymd(d) + '|' + id + '">Parent OK</button>'));
    });
  }
  $('late').innerHTML = late.join('') || '<p class="muted">No late nights in the last week.</p>';

  // This week
  $('weekhead').textContent = 'This week · ' + shortDate(mon) + '–' + shortDate(addDays(mon, 6));
  const days = Math.min(7, Math.round((today - mon) / 864e5) + 1);
  $('summary').innerHTML = Object.entries(KIDS).map(([id, k]) => {
    let full = 0, onTime = 0;
    for (let i = 0; i < days; i++) {
      const d = addDays(mon, i);
      if (dayFull(ctx, id, d)) full++;
      const c = L.dayChecks(ctx, id, d), r = timerResult(id, d, c.bedTimer, c);
      if (r && r.onTime) onTime++;
    }
    const bits = ['<b>' + full + '/' + days + '</b> full checklist days', '<b>' + onTime + '/' + days + '</b> on-time bedtimes'];
    if (k.chart) {
      const p = weekProgress(CHARTS[k.chart], L.effectiveWeek(CHARTS[k.chart], mon, (D[k.chart].weeks || {})[ymd(mon)], ctx));
      bits.push('chart <b>' + p.done + '/' + p.need + '</b>');
    }
    if (id === 'eli') { const sc = score(D['eli-trials']); bits.push('best mile <b>' + (sc.best.mile ? fmt(sc.best.mile) : '–') + '</b>, 5K <b>' + (sc.best['5k'] ? fmt(sc.best['5k']) : '–') + '</b>'); }
    if (id === 'isaiah') { let t = 0; for (let i = 0; i < days; i++) if (L.touchedOn(D.isaiah, ymd(addDays(mon, i)))) t++; bits.push('600 touches <b>' + t + '/' + days + '</b>'); }
    return '<div class="psum" style="--accent:' + k.accent + '"><strong>' + esc(k.name) + '</strong><span>' + bits.join(' · ') + '</span></div>';
  }).join('');
}

// ---- actions ----
document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-path]');
  if (t) { if (await askParent()) save(t.dataset.chart, t.dataset.path, t.dataset.chart === 'eli' || t.dataset.chart === 'trombone' ? true : ymd(new Date())); return; }
  const b = e.target.closest('[data-bedok]');
  if (b) { const [d, kid] = b.dataset.bedok.split('|'); if (await askParent()) save('routines', 'days/' + d + '/' + kid + '/bedOk', true); return; }
  const ic = e.target.closest('[data-ics]');
  if (ic) download(ic.dataset.ics + '.ics', 'text/calendar', ics(ic.dataset.ics));
});
$('lock').onclick = () => { setParent(false); $('datamsg').textContent = 'This phone is locked. Parent boxes will ask for the PIN.'; };
$('pin').onclick = async () => { if (await changePin()) $('datamsg').textContent = 'PIN changed.'; };
$('backup').onclick = () => backup();
$('prune').onclick = async () => {
  if (!(await askParent())) return;
  const cut = ymd(addDays(new Date(), -180));
  const old = [['routines', D.routines], ['eli-run', D['eli-run']]].flatMap(([id, d]) => Object.keys(d.days || {}).filter((k) => k < cut).map((k) => [id, k]));
  if (!old.length) { $('datamsg').textContent = 'Nothing older than 6 months to clear.'; return; }
  if (!confirm('Clear ' + old.length + ' daily logs older than 6 months? A backup downloads first.')) return;
  backup();
  old.forEach(([id, k]) => save(id, 'days/' + k, null));
  $('datamsg').textContent = 'Cleared ' + old.length + ' old daily logs.';
};

function download(name, type, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function backup() {
  const out = { exported: new Date().toISOString(), charts: Object.fromEntries(IDS.map((id) => [id, D[id]])) };
  download('reward-charts-backup-' + ymd(new Date()) + '.json', 'application/json', JSON.stringify(out, null, 2));
  $('datamsg').textContent = 'Backup downloaded.';
}

// ---- Calendar reminders (.ics) ----
const pad = (n) => String(n).padStart(2, '0');
const stamp = (d, min) => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(Math.floor(min / 60) % 24) + pad(min % 60) + '00';
const BYDAY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
function vevent(uid, title, date, min, rrule) {
  return ['BEGIN:VEVENT', 'UID:' + uid + '@reward-charts', 'DTSTAMP:' + stamp(new Date(), 0), 'DTSTART:' + stamp(date, min), 'DTEND:' + stamp(date, min + 5),
    'SUMMARY:' + title, rrule ? 'RRULE:' + rrule : '', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + title, 'TRIGGER:-PT15M', 'END:VALARM', 'END:VEVENT'].filter(Boolean).join('\r\n');
}
function ics(which) {
  const ev = [], mon = mondayOf(new Date());
  if (which === 'trials') {
    planned(score(D['eli-trials'])).filter((x) => ymd(x.date) >= ymd(new Date())).forEach((x) =>
      ev.push(vevent('trial-' + ymd(x.date), 'Eli: ' + (x.k === 'mile' ? '1-mile' : '5K') + ' time trial', x.date, 15 * 60 + 30)));
  } else {
    const k = KIDS[which];
    for (let dow = 0; dow < 7; dow++) {
      const lo = bedtime(which, dow).slice(-1)[0].min;
      ev.push(vevent('bed-' + which + '-' + dow, k.name + ': lights out', addDays(mon, dow), lo, 'FREQ=WEEKLY;BYDAY=' + BYDAY[dow]));
    }
  }
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Reward Charts//EN', ...ev, 'END:VCALENDAR'].join('\r\n');
}
$('ics').innerHTML = Object.entries(KIDS).map(([id, k]) => '<button class="pillbtn" style="--accent:' + k.accent + '" data-ics="' + id + '">' + esc(k.name) + '’s lights out</button>').join('') +
  '<button class="pillbtn" style="--accent:#C2501C" data-ics="trials">Eli’s time trials</button>';

render();
setInterval(render, 60000);
IDS.forEach((id, i) => watch(id, (d) => { D[id] = d; if (id === 'config') applyConfig(d); render(); }, i === 0 ? statusPill($('sync')) : null));
