import { watch, save, ymd, parseYmd, mondayOf, addDays, esc, statusPill } from './store.js';
import { planFor, ZONES, TERMS, ROUTINES } from './plan.js';

const ID = 'eli-run';
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
let date = params.get('date') ? parseYmd(params.get('date')) : new Date();
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
      '<p class="wo-detail">' + esc(p.detail) + '</p></div>';

    $('checklist').innerHTML = p.items.map((it) => {
      const on = !!checks[it.key];
      const r = it.routine && ROUTINES[it.routine];
      let h = '<div class="ck' + (on ? ' on' : '') + '">' +
        '<button class="ckbtn" data-item="' + it.key + '" aria-pressed="' + on + '">' +
        '<span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
        '<span class="cktext"><strong>' + esc(it.label) + (it.opt ? ' <em>optional</em>' : '') + '</strong>' +
        (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</span></button>';
      if (r) {
        h += '<details data-key="' + it.key + '"' + (open.has(it.key) ? ' open' : '') + '><summary>Show the exercises</summary><ul>' +
          r.list.map((x) => '<li><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></li>').join('') +
          '</ul><p class="note">' + esc(r.note) + '</p></details>';
      }
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

// Required items done? Optional-only days count once the run is checked.
function dayDone(p, checks) {
  const req = p.items.filter((i) => !i.opt);
  if (req.length) return req.every((i) => checks[i.key]);
  return !!(checks.run || checks.cross);
}

// Keep the Running row on Eli's reward chart in step with this page.
function syncReward(p, checks) {
  if (!p || p.dow === 6) return;
  const done = dayDone(p, checks);
  save('eli', 'weeks/' + ymd(mondayOf(date)) + '/checks/running/' + p.dow, done);
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
    syncReward(planFor(date), checks);
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
function tab(which) {
  const run = which === 'run';
  $('tab-run').setAttribute('aria-selected', run);
  $('tab-def').setAttribute('aria-selected', !run);
  $('panel-run').hidden = !run;
  $('panel-def').hidden = run;
  if (location.hash !== (run ? '' : '#definitions')) history.replaceState(null, '', location.search + (run ? '' : '#definitions'));
}
$('tab-run').onclick = () => tab('run');
$('tab-def').onclick = () => tab('def');
if (location.hash === '#definitions') tab('def');

// ---------- definitions ----------
$('defs').innerHTML =
  '<section class="card defcard"><h2>Pace zones</h2><p class="note">Treadmill at 1% incline, which matches outdoor effort. Re-set speeds after the Week 6 time trial.</p>' +
  '<div class="zones">' + ZONES.map((z) => '<div class="zone"><strong>' + esc(z[0]) + '</strong><span>' + esc(z[1]) + '</span><b>' + esc(z[2]) + ' /mi</b><b>' + esc(z[3]) + ' mph</b></div>').join('') + '</div></section>' +
  '<section class="card defcard"><h2>Workout words</h2><dl class="terms">' +
  TERMS.map((t) => '<dt>' + esc(t[0]) + '</dt><dd>' + esc(t[1]) + '</dd>').join('') + '</dl></section>' +
  Object.values(ROUTINES).map((r) =>
    '<section class="card defcard"><h2>' + esc(r.title) + '</h2><p class="when">' + esc(r.when) + '</p><p class="note">' + esc(r.note) + '</p>' +
    '<div class="howto">' + r.list.map((x) => '<div><p><strong>' + esc(x[0]) + '</strong> <b>' + esc(x[1]) + '</b></p><p>' + esc(x[2]) + '</p></div>').join('') + '</div></section>').join('') +
  '<p class="note">Not sure about one? Look up the name on YouTube and watch a 30-second demo before trying it.</p>';

render();
watch(ID, (d) => { data = d; render(); }, statusPill($('sync')));
