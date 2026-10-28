import { watch, save, ymd, parseYmd, mondayOf, addDays, esc, statusPill } from './store.js';
import { KIDS, WEEKLY, afterSchool, weekend, bedtime, notes } from './routines.js';
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
// AELP/Awana cycle runs Friday to Thursday.
const cycleOf = (d) => ymd(addDays(d, -((dowOf(d) + 3) % 7)));

function dayChecks() { return ((data.days || {})[ymd(date)] || {})[kid] || {}; }
function weeklyDone() { return (((data.weekly || {})[kid] || {})[cycleOf(date)]) || {}; }

function weeklyItems() {
  const list = WEEKLY[kid] || [];
  const done = weeklyDone();
  const dow = dowOf(date);
  const dueDays = dow >= 4; // Fri, Sat, Sun
  return list.filter((w) => dueDays || !done[w.key] || done[w.key] === ymd(date)).map((w) => ({
    key: 'w:' + w.key, weekly: w.key, label: w.label,
    sub: dueDays ? 'Do it Friday, Saturday or Sunday' : 'Not done yet this week. Finish it before Awana Wednesday.',
    late: !dueDays && !done[w.key]
  }));
}

function expand(items) {
  const out = [];
  items.forEach((i) => (i.weekly === true ? out.push(...weeklyItems()) : out.push(i)));
  return out;
}

function isOn(it, checks) {
  if (it.weekly) return !!weeklyDone()[it.weekly];
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
  $('bed').innerHTML = section('Bedtime', dow === 2 ? 'Short night: no reading on Wednesdays.' : '', bed, checks, true);
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
    const w = key.slice(2);
    const cur = weeklyDone()[w];
    save(ID, 'weekly/' + kid + '/' + cycleOf(date) + '/' + w, cur ? null : ymd(date));
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

render();
watch(ID, (d) => { data = d; render(); }, statusPill($('sync')));
