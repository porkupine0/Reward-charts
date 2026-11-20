// Parents page: what's owed, late nights, this week, Calendar reminders, backup and cleanup.
import { watch, save, isLive, ymd, parseYmd, mondayOf, addDays, shortDate, esc, statusPill } from './store.js?v=1795213978';
import { CHARTS, weekProgress } from './charts.js?v=1795213978';
import { KIDS, timerResult, bedtime, applyConfig, SKIP, EXCUSED, atDate } from './routines.js?v=1795213978';
import * as L from './lists.js?v=1795213978';
import { owed, score, planned, fmt } from './trials.js?v=1795213978';
import { LEVELS, WEEKLY, CHAMPION } from './bm.js?v=1795213978';
import { askParent, setParent, changePin } from './parent.js?v=1795213978';
import { dayFull } from './streaks.js?v=1795213978';
import { owedItems } from './owed.js?v=1795213978';
import { pruneList, pruneCutoff } from './prune.js?v=1795213978';
import { testScore, testDoneOn, openSittings } from './driving.js?v=1795213978';
import { FORMS, SITTINGS, PASS } from './driving-tests.js?v=1795213978';
import { nowHtml } from './nowview.js?v=1795213978';

const $ = (id) => document.getElementById(id);
const IDS = ['routines', 'eli-run', 'eli-drive', 'isaiah', 'eli', 'trombone', 'zay', 'eli-trials', 'config'];
const D = Object.fromEntries(IDS.map((id) => [id, {}]));
const ctx = { get routines() { return D.routines; }, get run() { return D['eli-run']; }, get isaiah() { return D.isaiah; }, get drive() { return D['eli-drive']; } };
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const tick = (chart, path, label) => '<button class="cash" data-chart="' + chart + '" data-path="' + esc(path) + '"><span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' + esc(label) + '</button>';
const row = (who, accent, what, when, action) => '<div class="prow2" style="--accent:' + accent + '"><span class="pwho">' + esc(who) + '</span><span class="pwhat">' + what + (when ? '<small>' + esc(when) + '</small>' : '') + '</span>' + (action || '') + '</div>';

const owedList = () => owedItems(D, ctx, row, tick);

const PAGES = { eli: [['Checklist', 'checklist.html?kid=eli'], ['Chart', 'eli.html'], ['Training', 'run.html']],
  rhett: [['Checklist', 'checklist.html?kid=rhett'], ['Chart', 'trombone.html']],
  isaiah: [['Checklist', 'checklist.html?kid=isaiah'], ['Chart', 'zay.html'], ['Ball Master', 'isaiah.html']] };

// Tonight: which evening (0 = tonight, back to Monday of this week)
let tnBack = 0;
const exBtns = (d, id, key) => '<span class="exbtns"><button class="tbtn approve" data-ex="' + d + '|' + id + '|' + key + '|ok">Approve</button><button class="linkbtn" data-ex="' + d + '|' + id + '|' + key + '|no">Not OK</button></span>';
function renderTonight(today) {
  const base = L.tonightDate(today);
  tnBack = Math.max(0, Math.min(tnBack, 6)); // back up to six nights (a Monday can still reach Sunday)
  const date = addDays(base, -tnBack), dk = ymd(date);
  $('tnhead').textContent = tnBack ? DAYS[(date.getDay() + 6) % 7] + ' ' + shortDate(date) : 'Tonight · ' + DAYS[(date.getDay() + 6) % 7];
  $('tnprev').disabled = tnBack >= 6;
  $('tnnext').disabled = tnBack === 0;
  $('tonight').innerHTML = L.tonight(ctx, date).map((t) => {
    const k = KIDS[t.kid];
    const chip = (c, v, txt) => '<button class="chip' + (c.value === v ? ' on' + (v === 'no' ? ' no' : '') : '') + '" data-tn="' + dk + '|' + t.kid + '|' + c.key + '|' + v + '" aria-pressed="' + (c.value === v) + '">' + txt + '</button>';
    return '<div class="tnkid" style="--accent:' + k.accent + '"><div class="tnkid-top"><strong>' + esc(k.name) + '</strong>' +
      (t.open && isLive('routines') ? '<button class="tbtn approve" data-allgood="' + dk + '|' + t.kid + '">All good</button>' : '<span class="rcount all">Done</span>') + '</div>' +
      t.checks.map((c) => '<div class="tnrow"><span>' + esc(c.label) + '</span><span class="dchk-btns">' + chip(c, 'yes', 'Yes') + chip(c, 'no', 'Not today') + '</span></div>').join('') +
      t.excuses.map((x) => '<div class="tnrow"><span>Not able to: ' + esc(x.label) + '</span>' + exBtns(dk, t.kid, x.key) + '</div>').join('') +
      (t.late ? '<div class="tnrow"><span>In bed ' + t.late + ' min late</span><button class="tbtn approve" data-bedok="' + dk + '|' + t.kid + '">Parent OK</button></div>' : '') +
      '</div>';
  }).join('');
}

function render() {
  const today = new Date(), mon = mondayOf(today);
  renderTonight(today);
  // Leftover game time from last week: add it to this week, or not (asked once per boy)
  const carry = allLive() ? L.carryPrompts(ctx, today, Object.keys(KIDS).filter((id) => CHARTS[KIDS[id].chart] && CHARTS[KIDS[id].chart].gameTime)) : [];
  $('carrycard').hidden = !carry.length;
  $('carry').innerHTML = carry.map((c) => row(KIDS[c.kid].name, KIDS[c.kid].accent, c.minutes + ' min left from last week', 'Add to this week?',
    '<span class="exbtns"><button class="tbtn approve" data-carry="' + c.kid + '|yes">Add ' + c.minutes + ' min</button><button class="linkbtn" data-carry="' + c.kid + '|no">No</button></span>')).join('');
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
      if (r && r.status === 'late') late.push(row(k.name, k.accent, 'Late by ' + r.lateBy + ' min', DAYS[(d.getDay() + 6) % 7] + ' ' + shortDate(d) + ' · lights out ' + atDate(d, () => bedtime(id, (d.getDay() + 6) % 7)).slice(-1)[0].time, '<button class="tbtn approve" data-bedok="' + ymd(d) + '|' + id + '">Parent OK</button>'));
    });
  }
  $('late').innerHTML = late.join('') || '<p class="muted">No late nights in the last week.</p>';

  // Not able to complete: waiting for approval (last 7 days)
  const ex = [];
  for (let i = 0; i <= 7; i++) {
    const d = addDays(today, -i);
    Object.entries(KIDS).forEach(([id, k]) => {
      const c = L.dayChecks(ctx, id, d), ls = L.lists(ctx, id, d);
      [...ls.morning, ...ls.day, ...ls.bed].forEach((it) => {
        if (c[it.key] !== SKIP) return;
        if (it.derived && L.isOn(ctx, id, d, it)) return; // done anyway (e.g. the driving lesson): nothing to approve
        ex.push(row(k.name, k.accent, esc(it.label.replace(/^Chore: /, '')), DAYS[(d.getDay() + 6) % 7] + ' ' + shortDate(d),
          exBtns(ymd(d), id, it.key)));
      });
    });
  }
  // Eli's next driving lesson needs a parent's preview
  // ahead of time: fewer than two upcoming lessons approved
  const dv = D['eli-drive'] || {}, upcoming = L.course().filter((l) => !l.review && !(dv.done || {})[l.id] && !/^skip/.test(String((dv.approved || {})[l.id])));
  const okOf = (l) => { const v = (dv.approved || {})[l.id]; return v === true || /^\d{4}-/.test(String(v)); };
  const okd = upcoming.slice(0, 2).filter(okOf).length;
  if (upcoming.length && okd < Math.min(2, upcoming.length)) ex.unshift(row('Eli', KIDS.eli.accent, 'Driving: ' + okd + ' of the next ' + Math.min(2, upcoming.length) + ' lessons approved. Next to preview: ' + esc(upcoming.find((l) => !okOf(l)).title), '', '<a class="tbtn approve" href="drive.html#preview">Preview</a>'));
  $('excuses').innerHTML = ex.join('') || '<p class="muted">Nothing waiting.</p>';

  // Eli's permit test practice: each finished sitting's score, weakest topics first
  const sat = openSittings(SITTINGS, dv, ymd(today)).map((st) => ({ st, sc: testScore(FORMS[st.form] || [], dv, st.id, PASS), on: testDoneOn(FORMS[st.form] || [], dv, st.id) }));
  // finished unit tests: his score from the answers stored under the test
  const units = L.course().filter((l) => l.review && (dv.done || {})[l.id]).map((l) => {
    const mine = Object.values(dv.answers || {}).map((a) => a[l.id]).filter(Boolean);
    return row('Eli', KIDS.eli.accent, '<b>' + esc(l.title) + '</b>: ' + mine.filter((a) => a.ok).length + ' of ' + mine.length + ' right', shortDate(parseYmd(dv.done[l.id])));
  });
  const rideOn = ((dv.rides || {})[ymd(mon)]);
  units.unshift(row('Eli', KIDS.eli.accent, '<b>Hazard ride</b>: ' + (rideOn ? 'done this week' : 'not yet this week'), rideOn ? shortDate(parseYmd(rideOn)) : '', rideOn ? '' : '<a class="tbtn approve" href="drive.html#ride">Open</a>'));
  $('testcard').hidden = !sat.length && !units.length;
  $('testscores').innerHTML = sat.map(({ st, sc, on }) => row('Eli', KIDS.eli.accent, '<b>' + esc(st.title) + '</b>: ' + (sc.done ? sc.right + ' of ' + sc.total + ' (' + sc.pct + '%), ' + (sc.passed ? 'passing' : 'below the ' + Math.round(PASS * 100) + '% pass mark') +
    '<br>Weakest: ' + esc(sc.byTopic.filter((t) => t.total > 1 && t.right < t.total).sort((a, b) => (b.total - b.right) - (a.total - a.right)).slice(0, 3).map((t) => t.topic + ' ' + t.right + '/' + t.total).join(', ') || 'none') : sc.answered ? 'in progress, ' + sc.answered + ' of ' + sc.total + ' answered' : 'not started' + (st.id === 'base' ? ' (best taken before his first lesson)' : '')),
    on ? shortDate(parseYmd(on)) : '')).join('') + units.join('');

  // Reading: this week and the 3 before, per kid
  const weeks = [0, 1, 2, 3].map((w) => addDays(mon, -7 * w));
  $('reading').innerHTML = '<thead><tr><th></th>' + weeks.map((w, i) => '<th>' + (i ? 'Wk of ' + shortDate(w) : 'This week') + '</th>').join('') + '</tr></thead><tbody>' +
    Object.entries(KIDS).map(([id, k]) => '<tr><td><b class="kidname" style="--accent:' + k.accent + '">' + esc(k.name) + '</b></td>' + weeks.map((w, i) => {
      const r = L.readingWeek(ctx, id, w, i ? null : today);
      return '<td><b>' + r.read + '</b>/' + r.nights + (r.excused ? ' <small>+' + r.excused + ' excused</small>' : '') + '</td>';
    }).join('') + '</tr>').join('') + '</tbody>';

  // This week
  $('weekhead').textContent = 'This week · ' + shortDate(mon) + '–' + shortDate(addDays(mon, 6));
  const days = L.daysSoFar(today); // Monday through today
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
      if (CHARTS[k.chart].gameTime) { const g = L.gameWeek(ctx, id, mon); bits.push('game time <b>' + g.minutes + ' of ' + g.max + ' min</b>' + (g.used ? ' (' + g.used + ' used)' : '')); }
    }
    { const r = L.readingWeek(ctx, id, mon, today); bits.push('read <b>' + r.read + '/' + r.nights + '</b> nights'); }
    if (id === 'eli') { const sc = score(D['eli-trials']); bits.push('best mile <b>' + (sc.best.mile ? fmt(sc.best.mile) : '–') + '</b>, 5K <b>' + (sc.best['5k'] ? fmt(sc.best['5k']) : '–') + '</b>'); }
    if (id === 'isaiah') { let t = 0; for (let i = 0; i < days; i++) if (L.touchedOn(D.isaiah, ymd(addDays(mon, i)))) t++; bits.push('600 touches <b>' + t + '/' + days + '</b>'); }
    return '<div class="psum" style="--accent:' + k.accent + '"><strong>' + esc(k.name) + '</strong><span>' + bits.join(' · ') + '</span></div>';
  }).join('');
}

// ---- actions ----
document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-path]');
  if (t) { if (await askParent()) save(t.dataset.chart, t.dataset.path, t.dataset.chart === 'eli' || t.dataset.chart === 'trombone' ? true : ymd(new Date())); return; }
  const xb = e.target.closest('[data-ex]');
  if (xb) { const [d, kid, key, a] = xb.dataset.ex.split('|'); if (await askParent()) save('routines', 'days/' + d + '/' + kid + '/' + key, a === 'ok' ? EXCUSED : null); return; }
  const cb = e.target.closest('[data-carry]');
  if (cb) {
    // the amount is worked out after the PIN, from the latest data, and fixed when saved
    const [kid, a] = cb.dataset.carry.split('|');
    if (!allLive() || !(await askParent())) return;
    const c = allLive() && L.carryPrompts(ctx, new Date(), [kid])[0];
    if (c) save('routines', 'carry/' + kid + '/' + ymd(c.from), { minutes: c.minutes, add: a === 'yes' });
    return;
  }
  const tn = e.target.closest('[data-tn]');
  if (tn) {
    // Same storage and meaning as the checklist's End of day: true = yes, 'no' = not today; tap again to clear
    const [d, kid, key, v] = tn.dataset.tn.split('|'), cur = L.dayChecks(ctx, kid, parseYmd(d))[key];
    const next = v === 'yes' ? (cur === true ? null : true) : (cur === 'no' ? null : 'no');
    if (await askParent()) save('routines', 'days/' + d + '/' + kid + '/' + key, next);
    return;
  }
  const ag = e.target.closest('[data-allgood]');
  if (ag) {
    // Decide what to fill only after the PIN, from the latest data, so a "Not today" saved meanwhile survives
    const [d, kid] = ag.dataset.allgood.split('|');
    if (!isLive('routines') || !(await askParent())) return;
    L.allGoodKeys(ctx, kid, parseYmd(d)).forEach((k) => save('routines', 'days/' + d + '/' + kid + '/' + k, true));
    return;
  }
  const b = e.target.closest('[data-bedok]');
  if (b) { const [d, kid] = b.dataset.bedok.split('|'); if (await askParent()) save('routines', 'days/' + d + '/' + kid + '/bedOk', true); return; }
  const ic = e.target.closest('[data-ics]');
  if (ic) download(ic.dataset.ics + '.ics', 'text/calendar', ics(ic.dataset.ics));
});
$('lock').onclick = () => { setParent(false); $('datamsg').textContent = 'This phone is locked. Parent boxes will ask for the PIN.'; };
$('pin').onclick = async () => { if (await changePin()) $('datamsg').textContent = 'PIN changed.'; };
// Backup and cleanup only from fresh data: a phone that hasn't synced could save an old copy.
const allLive = () => IDS.every((id) => isLive(id));
const notLive = () => { $('datamsg').textContent = 'Still connecting. Backup and cleanup wait until this phone has the latest data from every chart.'; };
$('backup').onclick = () => (allLive() ? backup() : notLive());
$('prune').onclick = async () => {
  if (!allLive()) return notLive();
  if (!(await askParent())) return;
  const old = pruneList(D, new Date()), cut = pruneCutoff(new Date());
  if (!old.length) { $('datamsg').textContent = 'Nothing to clear: checklist days are kept for two years (streaks look back that far), and Eli’s Training log is always kept.'; return; }
  if (!confirm('Clear ' + old.length + ' checklist days from before ' + cut + '? Streaks and Eli’s Training log are kept. History and the weekly charts for those older months will be blank. A backup downloads first.')) return;
  backup();
  old.forEach(([id, path]) => save(id, path, null));
  $('datamsg').textContent = 'Cleared ' + old.length + ' old checklist day' + (old.length > 1 ? 's' : '') + '.';
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
$('tnprev').onclick = () => { tnBack++; render(); };
$('tnnext').onclick = () => { tnBack--; render(); };
$('ics').innerHTML = Object.entries(KIDS).map(([id, k]) => '<button class="pillbtn" style="--accent:' + k.accent + '" data-ics="' + id + '">' + esc(k.name) + '’s lights out</button>').join('') +
  '<button class="pillbtn" style="--accent:#C2501C" data-ics="trials">Eli’s time trials</button>';

render();
setInterval(render, 60000);
IDS.forEach((id, i) => watch(id, (d) => { D[id] = d; if (id === 'config') applyConfig(d); render(); }, i === 0 ? statusPill($('sync')) : null));
