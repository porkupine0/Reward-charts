import { watch, save, ymd, parseYmd, mondayOf, addDays, esc, statusPill } from './store.js';
import { KIDS, WEEKLY, afterSchool, weekend, bedtime, notes, fmtTime, timerResult } from './routines.js';
import { planFor } from './plan.js';

const ID = 'routines';
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
let kid = KIDS[params.get('kid')] ? params.get('kid') : (() => { try { return localStorage.getItem('rc:lastKid') || 'eli'; } catch (e) { return 'eli'; } })();
if (!KIDS[kid]) kid = 'eli';
let date = params.get('date') ? parseYmd(params.get('date')) : new Date();
date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
let data = {};

const dowOf = (d) => (d.getDay() + 6) % 7; // Mon = 0
const longDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
// Each weekly item has its own week: AELP Thu–Wed, Awana Wed–Tue.
const cycleOf = (d, start) => ymd(addDays(d, -((dowOf(d) - start + 7) % 7)));
const weeklyDef = (key) => (WEEKLY[kid] || []).find((w) => w.key === key);

function dayChecks() { return ((data.days || {})[ymd(date)] || {})[kid] || {}; }
function weeklyDoneOn(w) { return ((((data.weekly || {})[kid] || {})[w.key] || {})[cycleOf(date, w.start)]) || null; }

function weeklyItems() {
  const dow = dowOf(date);
  return (WEEKLY[kid] || []).filter((w) => {
    const done = weeklyDoneOn(w);
    if (done) return done === ymd(date) || dow >= 4; // stays visible (checked) Fri–Sun
    return w.show.includes(dow) || w.late.includes(dow);
  }).map((w) => {
    const late = w.late.includes(dow) && !weeklyDoneOn(w);
    return { key: 'w:' + w.key, weekly: w.key, label: w.label, late,
      sub: late ? w.lateNote : 'Do it Friday, Saturday or Sunday' };
  });
}

function expand(items) {
  const out = [];
  items.forEach((i) => (i.weekly === true ? out.push(...weeklyItems()) : out.push(i)));
  return out;
}

function isOn(it, checks) {
  if (it.weekly) return !!weeklyDoneOn(weeklyDef(it.weekly));
  return checks[it.key];
}

function itemHtml(it, checks, extra) {
  const v = isOn(it, checks);
  const on = !!v;
  let h = '<div class="ck' + (on ? ' on' : '') + (it.late ? ' late' : '') + (extra && extra.next ? ' next' : '') + '">';
  h += '<button class="ckbtn" data-key="' + it.key + '" aria-pressed="' + on + '">' +
    (extra && extra.time ? '<span class="rtime">' + esc(extra.time) + '</span>' : '') +
    '<span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
    '<span class="cktext"><strong>' + esc(it.label) + (it.opt ? ' <em>optional</em>' : '') + (it.hot ? ' <em class="hot">shower night</em>' : '') + '</strong>' +
    (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</span></button>';
  if (it.choices) {
    h += '<div class="chips">' + it.choices.map((c) =>
      '<button class="chip' + (v === c ? ' on' : '') + '" data-key="' + it.key + '" data-choice="' + esc(c) + '" aria-pressed="' + (v === c) + '">' + esc(c) + '</button>').join('') + '</div>';
  }
  if (it.link) h += '<a class="cklink" href="' + it.link + '">Open &rarr;</a>';
  return h + '</div>';
}

function section(title, sub, items, checks, timed) {
  if (!items.length) return '';
  const done = items.filter((i) => isOn(i, checks) || i.opt).length;
  const req = items.filter((i) => !i.opt);
  const doneReq = req.filter((i) => isOn(i, checks)).length;
  const isToday = ymd(date) === ymd(new Date());
  let nextMarked = false;
  const body = items.map((it) => {
    let extra = timed ? { time: it.time } : {};
    if (timed && isToday && !nextMarked && !isOn(it, checks)) { extra.next = true; nextMarked = true; }
    return itemHtml(it, checks, extra);
  }).join('');
  const all = req.length && doneReq === req.length;
  return '<div class="rhead"><h2>' + esc(title) + '</h2><span class="rcount' + (all ? ' all' : '') + '">' + (all ? 'All done!' : doneReq + ' of ' + req.length) + '</span></div>' +
    (sub ? '<p class="note">' + esc(sub) + '</p>' : '') +
    '<div class="checklist">' + body + '</div>';
}

function render() {
  const k = KIDS[kid];
  const dow = dowOf(date);
  const key = ymd(date);
  document.body.style.setProperty('--accent', k.accent);
  $('eyebrow').textContent = k.name + "'s checklist";
  $('kidtabs').innerHTML = Object.entries(KIDS).map(([id, x]) =>
    '<button role="tab" data-kid="' + id + '" aria-selected="' + (id === kid) + '" style="--accent:' + x.accent + '">' + esc(x.name) + '</button>').join('');
  $('date').value = key;
  $('today').hidden = key === ymd(new Date());
  history.replaceState(null, '', '?kid=' + kid + (key === ymd(new Date()) ? '' : '&date=' + key));

  const checks = dayChecks();
  $('notes').innerHTML = '<p class="rdate">' + esc(longDate(date)) + '</p>' + notes(kid, dow).map((n) => '<span class="rnote">' + esc(n) + '</span>').join('');

  const school = dow <= 4;
  const items = expand(school ? afterSchool(kid, dow, kid === 'eli' ? planFor(date) : null) : weekend(kid, dow));
  $('day').innerHTML = school
    ? section('After school', 'Monday–Friday, as soon as you get home.', items, checks, false)
    : section('Today', '', items, checks, false);
  $('day').hidden = !items.length;

  const bed = bedtime(kid, dow);
  $('bed').innerHTML = section('Bedtime', dow === 2 ? 'Short night: 10 minutes of reading.' : '', bed, checks, true);
  $('bed').querySelector('.rhead').insertAdjacentHTML('afterend', timerHtml(checks));
  tick();
}

// Mirror into the reward charts.
function mirror(itemKey, on) {
  const dow = dowOf(date);
  const wk = ymd(mondayOf(date));
  const chart = KIDS[kid].chart;
  if (!chart) return;
  if (itemKey === 'chore' && dow <= 5) save(chart, 'weeks/' + wk + '/checks/chores/' + dow, on);
  if (kid === 'eli' && itemKey === 'missing' && dow <= 4) save('eli', 'weeks/' + wk + '/checks/school/' + dow, on);
  if (kid === 'rhett' && itemKey === 'activity') {
    if (dow === 3) save('trombone', 'weeks/' + wk + '/checks/racquetball/3', on);
    else if ([0, 1, 2, 4, 5].includes(dow)) save('trombone', 'weeks/' + wk + '/checks/move/' + dow, on);
  }
}

document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-kid]');
  if (tab) { kid = tab.dataset.kid; try { localStorage.setItem('rc:lastKid', kid); } catch (err) {} render(); return; }
  const chip = e.target.closest('.chip');
  const btn = chip || e.target.closest('.ckbtn');
  if (!btn) return;
  const key = btn.dataset.key;
  const base = 'days/' + ymd(date) + '/' + kid + '/';
  if (key.startsWith('w:')) {
    const w = weeklyDef(key.slice(2));
    const cur = weeklyDoneOn(w);
    save(ID, 'weekly/' + kid + '/' + w.key + '/' + cycleOf(date, w.start), cur ? null : ymd(date));
    return;
  }
  const cur = dayChecks()[key];
  let next;
  if (chip) next = cur === btn.dataset.choice ? null : btn.dataset.choice;
  else next = cur ? null : true;
  save(ID, base + key, next);
  mirror(key, !!next);
});

function go(n) { date = addDays(date, n); render(); }
$('prevday').onclick = () => go(-1);
$('nextday').onclick = () => go(1);
$('today').onclick = () => { const t = new Date(); date = new Date(t.getFullYear(), t.getMonth(), t.getDate()); render(); };
$('date').addEventListener('change', (e) => { if (e.target.value) { date = parseYmd(e.target.value); render(); } });

// ---------- bedtime timer ----------
const clock = (secs) => Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
function timerRec() { return dayChecks().bedTimer || {}; }
function timerHtml(checks) {
  const r = timerRec();
  if (!r.start) {
    return '<div class="btimer"><div><strong>Bedtime timer</strong><small>Tap Start when you begin your bedtime checklist.</small></div>' +
      '<button class="tbtn start" data-timer="start">Start</button></div>';
  }
  if (!r.end) {
    return '<div class="btimer running"><div><strong>Timer running</strong><small>Started at ' + new Date(r.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + '</small></div>' +
      '<span class="tclock" id="tclock">0:00</span><button class="tbtn stop" data-timer="stop">Stop</button></div>';
  }
  const res = timerResult(kid, date, r, checks);
  return '<div class="btimer done' + (res.onTime ? ' ontime' : ' late') + '"><div><strong>' + clock(res.secs) + ' total</strong>' +
    '<small>Finished ' + new Date(r.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' · lights out ' + fmtTime(res.lo) + ' · ' +
    (res.onTime ? 'On time!' : 'Late') + ' · ' + res.done + '/' + res.total + ' steps</small></div>' +
    '<button class="linkbtn" data-timer="reset">Redo</button></div>';
}
function tick() {
  const el = document.getElementById('tclock');
  const r = timerRec();
  if (el && r.start && !r.end) el.textContent = clock(Math.max(0, Math.round((Date.now() - r.start) / 1000)));
}
setInterval(tick, 1000);
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-timer]');
  if (!b) return;
  e.stopPropagation();
  const base = 'days/' + ymd(date) + '/' + kid + '/bedTimer';
  const a = b.dataset.timer;
  if (a === 'start') save(ID, base, { start: Date.now() });
  if (a === 'stop') save(ID, base + '/end', Date.now());
  if (a === 'reset' && confirm('Clear tonight\'s bedtime time for ' + KIDS[kid].name + '?')) save(ID, base, null);
}, true);

render();
watch(ID, (d) => { data = d; render(); }, statusPill($('sync')));
