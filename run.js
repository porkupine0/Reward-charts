import { watch, save, ymd, parseYmd, mondayOf, addDays, esc, statusPill, dateParam } from './store.js?v=1794490501';
import { planFor, ZONES, LAPS, TERMS, ROUTINES, dayDone, trialOn } from './plan.js?v=1794490501';
import { saveTrial, fmt as tfmt, score, nextMilestone, mphFor } from './trials.js?v=1794490501';

const ID = 'eli-run';
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
let date = dateParam('date');
date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
let data = {};
const open = new Set();

// ---------- helpers ----------
const fmt = (secs) => {
  if (!secs && secs !== 0) return '–:–';
  secs = Math.round(secs);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
};
const paceOf = (secs, miles) => (secs > 0 && miles > 0 ? secs / miles : null);
const dayData = (d) => (data.days && data.days[ymd(d)]) || {};
const longDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

function readLog() {
  const min = parseInt($('tmin').value, 10) || 0;
  const sec = parseInt($('tsec').value, 10) || 0;
  const miles = parseFloat($('miles').value);
  return { time: min * 60 + sec, miles: isNaN(miles) ? 0 : miles };
}

// ---------- run tab ----------
function render() {
  const key = ymd(date);
  const p = planFor(date);
  const dd = dayData(date);
  const checks = dd.items || {};
  $('date').value = key;
  $('today').hidden = key === ymd(new Date());
  history.replaceState(null, '', (key === ymd(new Date()) ? location.pathname : '?date=' + key) + location.hash);

  if (!p) {
    $('workout').innerHTML = '<div class="wo-card"><p class="wo-meta">' + esc(longDate(date)) + '</p><h2 class="wo-title">No plan for this day</h2><p class="wo-detail">The 13-week plan runs Oct 26, 2026 to Jan 24, 2027. You can still log a run below.</p></div>';
    $('checklist').innerHTML = '';
  } else {
    $('workout').innerHTML =
      '<div class="wo-card' + (p.optional ? ' is-opt' : '') + (p.dow === 6 ? ' is-rest' : '') + '">' +
      '<p class="wo-meta">' + esc(longDate(date)) + ' · Week ' + p.week + ' · ' + esc(p.focus) + '</p>' +
      '<h2 class="wo-title">' + esc(p.title) + (p.tag ? '<span class="wo-tag">' + esc(p.tag) + '</span>' : '') + '</h2>' +
      '<p class="wo-detail">' + esc(p.detail) + '</p>' +
      (p.indoor ? '<div class="wo-ways"><p><b>Inside</b>' + esc(p.indoor) + '</p><p><b>Outside</b>' + esc(p.outdoor) + '</p></div>' : '') +
      (p.note ? '<p class="wo-note">' + esc(p.note) + '</p>' : '') +
'</div>';

    $('checklist').innerHTML = p.items.map((it) => {
      const on = !!checks[it.key];
      const r = it.routine && ROUTINES[it.routine];
      let h = '<div class="ck' + (on ? ' on' : '') + '">' +
        '<button class="ckbtn" data-item="' + it.key + '" aria-pressed="' + on + '">' +
        '<span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
        '<span class="cktext"><strong>' + esc(it.label) + (it.opt ? ' <em>optional</em>' : '') + '</strong>' +
        (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</span></button>';
      [[r, ''], [it.routine2 && ROUTINES[it.routine2], '2']].forEach(([rt, n]) => {
        if (!rt) return;
        const k = it.key + n;
        h += '<details data-key="' + k + '"' + (open.has(k) ? ' open' : '') + '><summary>' + (n ? 'Or: ' + esc(rt.title) + ' (no gym)' : 'Show the exercises') + '</summary><ul>' +
          rt.list.map((x) => '<li><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></li>').join('') +
          '</ul><p class="note">' + esc(rt.note) + '</p></details>';
      });
      return h + '</div>';
    }).join('') || '<p class="note">Rest day. Nothing to check off. Fill in nothing and enjoy it.</p>';
  }

  // log fields: never overwrite the box he's typing in
  const focused = document.activeElement && document.activeElement.id;
  const t = dd.time || 0;
  if (!pending.log) {
    if (focused !== 'tmin') $('tmin').value = t ? Math.floor(t / 60) : '';
    if (focused !== 'tsec') $('tsec').value = t ? String(t % 60).padStart(2, '0') : '';
    if (focused !== 'miles') $('miles').value = dd.miles || '';
  }
  if (!pending.note && focused !== 'note') $('note').value = dd.note || '';
  showPace();
  $('effort').innerHTML = Array.from({ length: 10 }, (_, i) => i + 1).map((n) =>
    '<button class="eff' + (dd.effort === n ? ' on' : '') + '" data-effort="' + n + '" aria-pressed="' + (dd.effort === n) + '">' + n + '</button>').join('');
  $('logcard').hidden = !!(p && p.dow === 6);
  renderTrial();

  // week totals
  const mon = mondayOf(date);
  let miles = 0, time = 0, timedMiles = 0, daysDone = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i);
    const x = dayData(d);
    miles += x.miles || 0;
    time += x.time || 0;
    if (x.time && x.miles) timedMiles += x.miles;
    const pp = planFor(d);
    if (pp && pp.items.length && dayDone(pp, x.items || {})) daysDone++;
  }
  $('weektitle').textContent = p ? 'Week ' + p.week + ' totals · ' + p.weekLabel : 'This week';
  $('wmiles').textContent = miles.toFixed(1);
  $('wtime').textContent = fmt(time);
  const wp = paceOf(time, timedMiles);
  $('wpace').textContent = wp ? fmt(wp) : '–:–';
  $('wdays').textContent = daysDone;
  $('wgoal').textContent = p ? 'Plan for this week: about ' + p.miles + ' miles.' : '';
}

function showPace() {
  const { time, miles } = readLog();
  const pc = paceOf(time, miles);
  $('pace').textContent = pc ? fmt(pc) : '–:–';
}

// ---------- events ----------
document.addEventListener('click', (e) => {
  const ck = e.target.closest('.ckbtn');
  if (ck) {
    const key = ck.dataset.item;
    const dd = dayData(date);
    const checks = Object.assign({}, dd.items || {});
    checks[key] = !checks[key];
    save(ID, 'days/' + ymd(date) + '/items/' + key, checks[key]);
    return;
  }
  const ef = e.target.closest('[data-effort]');
  if (ef) {
    const n = Number(ef.dataset.effort);
    save(ID, 'days/' + ymd(date) + '/effort', dayData(date).effort === n ? null : n);
  }
});
document.addEventListener('toggle', (e) => {
  const d = e.target;
  if (d.tagName === 'DETAILS') d.open ? open.add(d.dataset.key) : open.delete(d.dataset.key);
}, true);

// Typed values wait half a second before saving; until then, incoming data
// must not overwrite the boxes.
const pending = { log: false, note: false };
let timer;
function flushLog(k) {
  clearTimeout(timer);
  if (!pending.log) return;
  const { time, miles } = readLog();
  pending.log = false;
  save(ID, 'days/' + k + '/time', time || null);
  save(ID, 'days/' + k + '/miles', miles || null);
}
function saveLog() {
  clearTimeout(timer);
  pending.log = true;
  const k = ymd(date);
  timer = setTimeout(() => flushLog(k), 500);
}
['tmin', 'tsec', 'miles'].forEach((id) => $(id).addEventListener('blur', () => flushLog(ymd(date))));
['tmin', 'tsec', 'miles'].forEach((id) => {
  $(id).addEventListener('input', () => { showPace(); saveLog(); });
});
$('tsec').addEventListener('blur', () => {
  // 75 seconds → 1:15
  const s = parseInt($('tsec').value, 10);
  if (s >= 60) {
    $('tmin').value = (parseInt($('tmin').value, 10) || 0) + Math.floor(s / 60);
    $('tsec').value = String(s % 60).padStart(2, '0');
    showPace(); saveLog();
  }
});
let ntimer;
$('note').addEventListener('input', () => {
  clearTimeout(ntimer);
  pending.note = true;
  const k = ymd(date);
  ntimer = setTimeout(() => { pending.note = false; save(ID, 'days/' + k + '/note', $('note').value.trim() || null); }, 600);
});

function go(n) { flushLog(ymd(date)); date = addDays(date, n); open.clear(); render(); }
$('prevday').onclick = () => go(-1);
$('nextday').onclick = () => go(1);
$('today').onclick = () => { const t = new Date(); date = new Date(t.getFullYear(), t.getMonth(), t.getDate()); render(); };
$('date').addEventListener('change', (e) => { if (e.target.value) { date = parseYmd(e.target.value); open.clear(); render(); } });

// ---------- tabs ----------
const TABS = { run: '', hist: '#history', def: '#definitions' };
function tab(which) {
  Object.keys(TABS).forEach((t) => { $('tab-' + t).setAttribute('aria-selected', t === which); $('panel-' + t).hidden = t !== which; });
  if (location.hash !== TABS[which]) history.replaceState(null, '', location.search + TABS[which]);
  if (which === 'hist') renderHistory();
}
Object.keys(TABS).forEach((t) => { $('tab-' + t).onclick = () => tab(t); });

// ---------- history tab ----------
const WHERE = { track: 'Track', treadmill: 'Treadmill', race: 'Race' };
function renderHistory() {
  if ($('panel-hist').hidden) return;
  const sc = score({ trials });
  const rows = [...sc.trials].reverse();
  $('trialtable').innerHTML = '<thead><tr><th>Date</th><th>Trial</th><th>Time</th><th>Pace /mi</th><th>Speed</th><th>Where</th></tr></thead><tbody>' +
    (rows.length ? rows.map((t) => {
      const dist = t.kind === 'mile' ? 1 : 3.10686, pace = t.secs / dist;
      return '<tr><td>' + esc(parseYmd(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) + '</td><td>' + (t.kind === 'mile' ? '1 mile' : '5K') + '</td>' +
        '<td><b>' + tfmt(t.secs) + '</b>' + (sc.prs[t.id] ? ' <span class="prtag">Best</span>' : '') + '</td><td>' + tfmt(pace) + '</td><td>' + (3600 / pace).toFixed(1) + ' mph</td><td>' + esc(WHERE[t.where] || '') + '</td></tr>';
    }).join('') : '<tr><td colspan="6" class="muted">No trials yet.</td></tr>') + '</tbody>';

  const days = Object.entries(data.days || {}).filter(([, x]) => x.time || x.miles || x.effort).sort((a, b) => b[0].localeCompare(a[0]));
  let miles = 0, secs = 0; days.forEach(([, x]) => { miles += x.miles || 0; if (x.time && x.miles) secs += x.time; });
  $('runsum').textContent = days.length ? days.length + ' runs logged · ' + miles.toFixed(1) + ' miles' + (secs ? ' · average pace ' + fmt(secs / days.reduce((m, [, x]) => m + (x.time && x.miles ? x.miles : 0), 0)) + ' /mi' : '') : 'Runs you log on the Today tab show up here.';
  $('runtable').innerHTML = '<thead><tr><th>Date</th><th>Workout</th><th>Miles</th><th>Time</th><th>Pace</th><th>Effort</th></tr></thead><tbody>' +
    days.slice(0, 120).map(([k, x]) => {
      const p = planFor(parseYmd(k));
      return '<tr><td>' + esc(parseYmd(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) + '</td><td>' + esc(p ? p.title : 'Run') + (x.note ? '<small>' + esc(x.note) + '</small>' : '') + '</td>' +
        '<td>' + (x.miles ? x.miles.toFixed(2) : '–') + '</td><td>' + (x.time ? fmt(x.time) : '–') + '</td><td>' + (x.time && x.miles ? fmt(x.time / x.miles) : '–') + '</td><td>' + (x.effort || '–') + '</td></tr>';
    }).join('') + (days.length ? '' : '<tr><td colspan="6" class="muted">No runs logged yet.</td></tr>') + '</tbody>';
}


// ---------- definitions ----------
$('defs').innerHTML =
  '<section class="card defcard"><h2>Pace zones</h2><p class="note">Set Nov 12 from a 24:30 5K. Treadmill at 1% incline, which matches outdoor effort. If a speed feels harder than described, trust the feeling and slow down 0.1–0.2 mph: the treadmill may read a little off. Re-set only after a 5K on the track that is 20+ seconds faster.</p>' +
  '<div class="zones">' + ZONES.map((z) => '<div class="zone"><strong>' + esc(z[0]) + '</strong><span>' + esc(z[1]) + '</span><b>' + esc(z[2]) + ' /mi</b><b>' + esc(z[3]) + ' mph</b></div>').join('') + '</div></section>' +
  '<section class="card defcard"><h2>Indoor track lap times</h2><p class="note">Check the track’s posted length first (a 200 m track is 25 laps per 5K; a 1/10-mile track is 10 laps per mile). Switch direction every 10–15 minutes if allowed.</p><div class="zones">' + LAPS.map((z) => '<div class="zone"><strong>' + esc(z[0]) + '</strong><span>' + esc(z[1]) + '</span></div>').join('') + '</div></section>' +
  '<section class="card defcard"><h2>Workout words</h2><dl class="terms">' +
  TERMS.map((t) => '<dt>' + esc(t[0]) + '</dt><dd>' + esc(t[1]) + '</dd>').join('') + '</dl></section>' +
  Object.values(ROUTINES).map((r) =>
    '<section class="card defcard"><h2>' + esc(r.title) + '</h2><p class="when">' + esc(r.when) + '</p><p class="note">' + esc(r.note) + '</p>' +
    '<div class="howto">' + r.list.map((x) => '<div><p><strong>' + esc(x[0]) + '</strong> <b>' + esc(x[1]) + '</b></p><p>' + esc(x[2]) + '</p></div>').join('') + '</div></section>').join('') +
  '<p class="note">Not sure about one? Look up the name on YouTube and watch a 30-second demo before trying it.</p>';

// ---------- time trial result (test days) ----------
let trials = {};
function renderTrial() {
  const kind = trialOn(date);
  $('trialbox').hidden = !kind;
  if (!kind) return;
  const t = trials['p' + ymd(date)];
  $('trialhead').textContent = (kind === 'mile' ? '1-mile' : '5K') + ' time trial result';
  // Goal: the next milestone, not counting today's own time, and the treadmill speed that beats it
  const before = {}; Object.entries(trials).forEach(([id, x]) => { if (id !== 'p' + ymd(date)) before[id] = x; });
  const sc = score({ trials: before }), nx = nextMilestone(kind, sc);
  $('trialgoal').innerHTML = nx
    ? 'Goal: under <b>' + tfmt(nx[0]) + '</b> (' + nx[1] + ' prize). On the treadmill at 1%, run <b>' + mphFor(kind, nx[0]).toFixed(1) + ' mph or faster</b>; on the track, ' + tfmt(nx[0] / (kind === 'mile' ? 4.0234 : 12.5) - 0.5) + ' or faster per 400.' + (sc.best[kind] ? ' Best so far ' + tfmt(sc.best[kind]) + '.' : '')
    : 'Every ' + (kind === 'mile' ? 'mile' : '5K') + ' milestone is done. Go for a new best!';
  $('trialsaved').innerHTML = t ? 'Saved: <b>' + tfmt(t.secs) + '</b>. <a href="trials.html">See your milestones and prizes &rarr;</a>' : 'Just the trial itself, not the warm-up. Saving checks off your time trial.';
  const f = document.activeElement && document.activeElement.id;
  if (f !== 'trmin' && f !== 'trsec') {
    $('trmin').value = t ? Math.floor(t.secs / 60) : '';
    $('trsec').value = t ? String(t.secs % 60).padStart(2, '0') : '';
  }
  if (t && t.where) $('trwhere').value = t.where;
}
$('trsave').onclick = () => {
  const kind = trialOn(date);
  const m = parseInt($('trmin').value, 10), s = parseInt($('trsec').value || '0', 10), secs = m * 60 + s;
  const ok = kind === 'mile' ? secs >= 240 && secs <= 900 : secs >= 840 && secs <= 2700;
  if (!kind || !(s >= 0 && s < 60) || !ok) { $('trialsaved').textContent = 'Check the time: minutes and seconds, like ' + (kind === 'mile' ? '6 and 42.' : '22 and 10.'); return; }
  saveTrial({ kind, secs, date: ymd(date), where: $('trwhere').value });
  document.activeElement && document.activeElement.blur();
};
watch('eli-trials', (d) => { trials = d.trials || {}; renderTrial(); renderHistory(); });

render();
watch(ID, (d) => { data = d; render(); renderHistory(); }, statusPill($('sync')));
// Open the tab named in the address (after everything above is set up)
if (location.hash === '#definitions') tab('def');
if (location.hash === '#history') tab('hist');
