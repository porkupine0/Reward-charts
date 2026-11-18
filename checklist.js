import { watch, save, ymd, parseYmd, mondayOf, addDays, esc, statusPill, dateParam } from './store.js?v=1795010089';
import { atDate, applyConfig, KIDS, WEEKLY, afterSchool, weekend, bedtime, notes, fmtTime, timerResult, choreItems, morning, MORNING_REWARD, rewardWhen, isDone, SKIP, EXCUSED, EXCUSABLE } from './routines.js?v=1795010089';
import { SETTINGS } from './settings.js?v=1795010089';
import { askParent } from './parent.js?v=1795010089';
import * as L from './lists.js?v=1795010089';
import { dayStreak, cheerIf } from './streaks.js?v=1795010089';

const ID = 'routines';
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
let kid = KIDS[params.get('kid')] ? params.get('kid') : (() => { try { return localStorage.getItem('rc:lastKid') || 'eli'; } catch (e) { return 'eli'; } })();
if (!KIDS[kid]) kid = 'eli';
let date = dateParam('date');
date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
let data = {};

const longDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
// Lists and "is it done?" come from lists.js, shared with the home page.
const ctx = { routines: {}, run: {}, isaiah: {} };
const dayChecks = () => L.dayChecks(ctx, kid, date);
const weeklyDef = (key) => L.weeklyDef(kid, key);
const weeklyDoneOn = (w) => L.weeklyDoneOn(ctx, kid, w, date);
const { dowOf, cycleOf, partKey } = L;
function isOn(it) {
  if (it.choices) return dayChecks()[it.key];
  return L.isOn(ctx, kid, date, it);
}

function itemHtml(it, checks, extra) {
  const v = isOn(it);
  const on = !!v;
  const locked = !!(extra && extra.locked);
  const lockMsg = extra && extra.locked === 'owed' ? 'Locked · see Finish first' : 'Do your chores first';
  // "Not able to complete": regular items only (not ones filled from other pages, weekly or multi-part ones)
  const raw = checks[it.key];
  const canExcuse = EXCUSABLE.includes(it.key) && (!it.derived || it.key === 'activity') && !locked;
  const excused = raw === EXCUSED, pending = raw === SKIP;
  let h = '<div class="ck' + (on ? ' on' : '') + (excused ? ' excused' : '') + (pending ? ' pending' : '') + (locked ? ' locked' : '') + (it.late ? ' late' : '') + (extra && extra.next ? ' next' : '') + '">';
  h += '<button class="ckbtn" data-key="' + it.key + '" aria-pressed="' + on + '"' + (locked ? ' aria-disabled="true"' : '') + '>' +
    (extra && extra.time ? '<span class="rtime">' + esc(extra.time) + '</span>' : '') +
    '<span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
    '<span class="cktext"><strong>' + esc(it.label) + (it.opt ? ' <em>optional</em>' : '') + (it.hot ? ' <em class="hot">shower night</em>' : '') + '</strong>' +
    (locked ? '<small>' + esc(lockMsg) + '</small>' : it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</span></button>';
  if (it.choices) {
    h += '<div class="chips">' + it.choices.map((c) =>
      '<button class="chip' + (v === c ? ' on' : '') + '" data-key="' + it.key + '" data-choice="' + esc(c) + '" aria-pressed="' + (v === c) + '">' + esc(c) + '</button>').join('') + '</div>';
  }
  if (it.parts) {
    h += '<div class="chips parts">' + it.parts.map((p) => {
      const pOn = !!checks[partKey(it.key, p)];
      return '<button class="chip part' + (pOn ? ' on' : '') + '" data-key="' + it.key + '" data-part="' + esc(p) + '" data-parts="' + esc(it.parts.join('|')) + '" aria-pressed="' + pOn + '">' + (pOn ? '✓ ' : '') + esc(p) + '</button>';
    }).join('') + '</div>';
  }
  if (it.link && !locked) h += '<a class="cklink" href="' + it.link + '">Open &rarr;</a>';
  if (canExcuse) {
    if (pending) h += '<div class="excuse"><span>Not able to do it · waiting for Mom or Dad</span><button class="tbtn approve" data-excuse="approve" data-key="' + it.key + '">Approve</button><button class="linkbtn" data-excuse="undo" data-key="' + it.key + '">Undo</button></div>';
    else if (excused) h += '<div class="excuse"><span>Excused tonight · counts, but not done</span><button class="linkbtn" data-excuse="undo" data-key="' + it.key + '">Undo</button></div>';
    else if (!on) h += '<button class="linkbtn excuse-ask" data-excuse="mark" data-key="' + it.key + '">Not able to do it?</button>';
  }
  return h + '</div>';
}

// The "next" ring goes in the section for the time of day (same phase as Home's "next"), today only.
function nextSection() {
  if (ymd(date) !== ymd(new Date())) return '';
  const ph = L.nowStatus(ctx, kid, new Date()).phase;
  return ph === 'late' ? 'bed' : ph;
}
function section(title, sub, items, checks, timed, phase) {
  if (!items.length) return '';
  const done = items.filter((i) => isOn(i) || i.opt || i.unscored).length;
  const req = items.filter((i) => !i.opt && !i.unscored);
  const doneReq = req.filter((i) => isOn(i)).length;
  const isToday = ymd(date) === ymd(new Date());
  let nextMarked = false;
  const body = items.map((it) => {
    let extra = timed ? { time: it.time } : {};
    const lk = L.lockedBy(ctx, kid, date, it, items);
    if (lk) extra.locked = lk;
    if (phase && phase === nextSection() && isToday && !nextMarked && !isOn(it) && !extra.locked && !it.opt) { extra.next = true; nextMarked = true; }
    return itemHtml(it, checks, extra);
  }).join('');
  const all = req.length && doneReq === req.length;
  return '<div class="rhead"><h2>' + esc(title) + '</h2><span class="rcount' + (all ? ' all' : '') + '">' + (all ? 'All done!' : doneReq + ' of ' + req.length) + '</span></div>' +
    (sub ? '<p class="note">' + esc(sub) + '</p>' : '') +
    '<div class="checklist">' + body + '</div>';
}

// The page shows the chores, showers and lights out that applied on its date.
function render() { return atDate(date, renderOn); }
function renderOn() {
  const k = KIDS[kid];
  const dow = dowOf(date);
  const key = ymd(date);
  document.body.style.setProperty('--accent', k.accent);
  $('eyebrow').textContent = k.name + "'s checklist";
  $('back').href = 'kid.html?kid=' + kid; $('back').innerHTML = '&larr; ' + esc(k.name);
  $('kidtabs').innerHTML = Object.entries(KIDS).map(([id, x]) =>
    '<button role="tab" data-kid="' + id + '" aria-selected="' + (id === kid) + '" style="--accent:' + x.accent + '">' + esc(x.name) + '</button>').join('');
  $('date').value = key;
  $('today').hidden = key === ymd(new Date());
  history.replaceState(null, '', '?kid=' + kid + (key === ymd(new Date()) ? '' : '&date=' + key));

  const checks = dayChecks();
  const streak = dayStreak(ctx, kid, new Date());
  $('notes').innerHTML = '<p class="rdate">' + esc(longDate(date)) + '</p>' + (streak >= 2 ? '<span class="rnote streak">' + streak + '-day streak</span>' : '') + notes(kid, dow).map((n) => '<span class="rnote">' + esc(n) + '</span>').join('');

  // Teeth was added Nov 11, 2026; leave it off earlier mornings so past candy isn't undone.
  const lst = L.lists(ctx, kid, date);
  const morn = lst.morning;
  morn.forEach((i) => {
    if (i.key === 'mHigh5' && checks.readyAt) i.sub = 'All ready at ' + fmtTime(+checks.readyAt.slice(0, 2) * 60 + +checks.readyAt.slice(3)) + (+checks.readyAt.slice(0, 2) < 12 ? ' am' : ' pm');
  });
  $('morning').hidden = !morn.length;
  const when = rewardWhen(dow);
  const prize = when && MORNING_REWARD[kid];
  const mornDone = morn.filter((i) => isOn(i)).length;
  const earned = morn.length > 0 && mornDone === morn.length;
  if (morn.length) {
    $('morning').innerHTML = section(dow === 6 ? 'Church morning' : 'Morning', prize ? '' : dow === 5 ? 'Optional on Saturdays. No rush!' : 'Optional. Time yourself if you want!', morn, checks, false, 'morning');
    $('morning').querySelector('.rhead').insertAdjacentHTML('afterend', mornTimerHtml());
    if (prize) $('morning').querySelector('.rhead').insertAdjacentHTML('afterend', treatHtml(prize, when, mornDone, morn.length));
    const woke = checks.wokeAt || '';
    $('morning').querySelector('.btimer').insertAdjacentHTML('afterend',
      '<div class="wokeat"><label for="wokeAt">What time did you get out of bed?</label>' +
      '<div class="wokerow"><input type="time" id="wokeAt" value="' + woke + '"><button class="chip" data-wokenow="1">Now</button></div></div>');
    const mnote = $('morning').querySelector('.note');
    if (mnote) $('morning').querySelector('.rhead').after(mnote);
  }

  const school = dow <= 4;
  const items = lst.day;
  $('day').innerHTML = school
    ? section('After school', 'Monday–Friday, as soon as you get home.', items, checks, false, 'day')
    : section('Today', '', items, checks, false, 'day');
  $('day').hidden = !items.length;
  const owed = L.choresOwed(ctx, kid, date);
  if (owed.length && items.length) {
    const locks = items.some((i) => L.lockable(kid, i)), held = L.owedHeld(ctx, kid, date);
    $('day').querySelector('.rhead').insertAdjacentHTML('afterend', '<div class="owed"><strong>Finish first: a chore from earlier this week</strong>' +
      '<small>' + (locks ? 'Homework and screen time unlock once it’s done. ' : '') + (held ? 'It’s holding up to ' + held + ' min of game time until it’s done (or Mom or Dad excuses it).' : 'Get it done (or ask Mom or Dad to excuse it).') + '</small>' +
      owed.map((o) => {
        const v = L.dayChecks(ctx, kid, o.date)[o.item.key], ref = ymd(o.date) + '|' + o.item.key;
        return '<button class="ckbtn owedbtn" data-owed="' + ref + '"><span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
          '<span class="cktext"><strong>' + esc(o.item.label) + '</strong><small>From ' + esc(o.date.toLocaleDateString('en-US', { weekday: 'long' })) + '</small></span></button>' +
          (v === SKIP
            ? '<div class="excuse"><span>Not able to do it · waiting for Mom or Dad</span><button class="tbtn approve" data-owedex="approve|' + ref + '">Approve</button><button class="linkbtn" data-owedex="undo|' + ref + '">Undo</button></div>'
            : '<button class="linkbtn excuse-ask" data-owedex="mark|' + ref + '">Not able to do it?</button>');
      }).join('') + '</div>');
  }
  // Candy handed out this afternoon: this morning's checklist + last night's bedtime.
  const candy = MORNING_REWARD[kid];
  if (candy && items.length) {
    const yd = addDays(date, -1);
    const sources = [];
    if (prize && morn.length) sources.push({ earned, yes: 'Finished your whole morning', no: 'Morning checklist not finished yet' });
    sources.push({ earned: bedOnTime(yd, ((data.days || {})[ymd(yd)] || {})[kid] || {}), yes: 'In bed on time last night', no: 'Not in bed on time last night' });
    $('day').querySelector('.rhead').insertAdjacentHTML('afterend', afternoonTreatHtml(sources, checks.mCandyGiven));
  }

  const bed = lst.bed;
  $('bed').innerHTML = section('Bedtime', dow === 2 ? 'Short night: 10 minutes of reading.' : '', bed, checks, true, 'bed');
  $('bed').querySelector('.rhead').insertAdjacentHTML('afterend', timerHtml(checks));
  if (candy) $('bed').querySelector('.rhead').insertAdjacentHTML('afterend', bedTreatHtml(candy, bed, checks, dow));
  // End-of-day checks by Mom or Dad, and today's game time
  const dchecks = L.CHECKS[kid] || [];
  if (dchecks.length) {
    const yn = (k) => '<div class="dchk"><div><strong>' + esc(k.label) + '</strong>' + (k.sub ? '<small>' + esc(k.sub) + '</small>' : '') + '</div>' +
      '<span class="dchk-btns"><button class="chip' + (checks[k.key] === true ? ' on' : '') + '" data-daycheck="' + k.key + '|yes" aria-pressed="' + (checks[k.key] === true) + '">Yes</button>' +
      '<button class="chip' + (checks[k.key] === 'no' ? ' on no' : '') + '" data-daycheck="' + k.key + '|no" aria-pressed="' + (checks[k.key] === 'no') + '">Not today</button></span></div>';
    const g = L.gameDay(ctx, kid, date), school = L.GAME.days.includes(dow);
    $('bed').insertAdjacentHTML('beforeend', '<div class="rhead dchk-head"><h2>End of day</h2><span class="rcount">Mom or Dad</span></div>' +
      dchecks.map(yn).join('') +
      (school ? '<p class="gt-today">' + (g.earned ? '<b>+' + g.worth + ' min of weekend game time earned today ✓</b>' : '<b>For today’s ' + g.worth + ' min of game time, ' + esc(L.leftSummary(g.left)).replace(': ', ':</b> ')) + '</p>' : ''));
  }
  // Celebrate finishing a whole list (only right after a tap on this phone)
  const k0 = kid + ymd(date);
  const dp = L.progress(ctx, kid, date, lst.day), bp = L.progress(ctx, kid, date, lst.bed), mp = L.progress(ctx, kid, date, lst.morning);
  if (lst.morning.length) cheerIf(k0 + 'm', !mp.left.length, 'Morning done! Nice work, ' + KIDS[kid].name + '.');
  if (dp.req.length) cheerIf(k0 + 'd', !dp.left.length, (dow <= 4 ? 'After school' : 'Today’s list') + ' done!');
  cheerIf(k0 + 'b', !bp.left.length, 'Bedtime done. Good night, ' + KIDS[kid].name + '!');
  tick();
}

// ---------- morning treat ----------
// Morning: shows the goal and progress; turns gold when every box is checked.
function treatHtml(prize, when, done, total) {
  const left = total - done;
  if (!left) {
    return '<div class="treat earned"><span class="treat-icon" aria-hidden="true">🍬</span><div><strong>Candy earned!</strong>' +
      '<small>You finished your whole morning. Enjoy ' + esc(prize) + ' ' + when + '.</small></div></div>';
  }
  return '<div class="treat"><span class="treat-icon" aria-hidden="true">🍬</span><div><strong>Check every box to earn ' + esc(prize) + '!</strong>' +
    '<small>' + left + ' more to go · you get it ' + when + '</small>' +
    '<div class="track"><div class="fill" style="width:' + Math.round(done / total * 100) + '%"></div></div></div></div>';
}
// After school: reminds whoever is home whether the candy was earned, with a button to mark it given.
function afternoonTreatHtml(sources, given) {
  const n = sources.filter((x) => x.earned).length;
  const list = '<ul class="treat-list">' + sources.map((x) =>
    '<li class="' + (x.earned ? 'yes' : 'no') + '">' + (x.earned ? '✓ ' + esc(x.yes) : '○ ' + esc(x.no)) + '</li>').join('') + '</ul>';
  if (!n) {
    return '<div class="treat missed"><span class="treat-icon" aria-hidden="true">🍬</span><div><strong>No candy yet</strong>' + list + '</div></div>';
  }
  const pieces = n === 1 ? '1 piece of candy' : n + ' pieces of candy';
  if (given) {
    return '<div class="treat given"><span class="treat-icon" aria-hidden="true">✅</span><div><strong>Candy enjoyed!</strong>' +
      '<small>You had ' + pieces + '. Nice work!</small></div><button class="linkbtn" data-candy="0">Undo</button></div>';
  }
  return '<div class="treat earned"><span class="treat-icon" aria-hidden="true">🍬</span><div><strong>Candy time! ' + (n === 1 ? '1 piece' : n + ' pieces') + '</strong>' + list +
    '</div><button class="tbtn start" data-candy="1">Got it!</button></div>';
}

// ---------- bedtime treat ----------
// On time = the bedtime timer stopped by lights out, or the Lights out box checked by lights out.
function bedOnTime(dateObj, c) {
  const r = c.bedTimer && timerResult(kid, dateObj, c.bedTimer, c);
  if (r && r.onTime) return true;
  if (c.lights && c.lightsAt) { const x = timerResult(kid, dateObj, { start: c.lightsAt, end: c.lightsAt }, c); return !!(x && x.onTime); }
  return false;
}
function bedTreatHtml(prize, bed, checks, dow) {
  const lo = bed[bed.length - 1].time;
  const when = dow === 4 || dow === 5 ? 'tomorrow afternoon' : 'after school tomorrow';
  const timed = (checks.bedTimer && checks.bedTimer.end) || (checks.lights && checks.lightsAt);
  if (bedOnTime(date, checks)) {
    return '<div class="treat earned"><span class="treat-icon" aria-hidden="true">🍬</span><div><strong>Candy earned!</strong>' +
      '<small>' + (checks.bedOk ? 'Parent OK’d tonight' : 'In bed on time') + '. Enjoy ' + esc(prize) + ' ' + when + '.</small></div>' + (checks.bedOk ? approveBtn('approved') : '') + '</div>';
  }
  if (timed) {
    return '<div class="treat missed"><span class="treat-icon" aria-hidden="true">🍬</span><div><strong>No bedtime candy tonight</strong>' +
      '<small>Lights out was ' + lo + ' (' + SETTINGS.grace + '-minute grace). Try again tomorrow night!</small></div>' + approveBtn('late') + '</div>';
  }
  return '<div class="treat"><span class="treat-icon" aria-hidden="true">🍬</span><div><strong>In bed by ' + lo + ' = ' + esc(prize) + '!</strong>' +
    '<small>Check off Lights out (or stop the timer) by ' + lo + ' (' + SETTINGS.grace + ' minutes grace). You get it ' + when + '.</small></div></div>';
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-candy]');
  if (!b) return;
  e.stopPropagation();
  save(ID, 'days/' + ymd(date) + '/' + kid + '/mCandyGiven', b.dataset.candy === '1' ? true : null);
}, true);

document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-kid]');
  if (tab) { kid = tab.dataset.kid; try { localStorage.setItem('rc:lastKid', kid); } catch (err) {} render(); return; }
  const chip = e.target.closest('.chip');
  const btn = chip || e.target.closest('.ckbtn');
  if (!btn) return;
  const key = btn.dataset.key;
  // computer tasks wait for chores (the button looks locked; ignore the tap)
  if (btn.closest('.ck.locked')) return;
  const base = 'days/' + ymd(date) + '/' + kid + '/';
  const partsBtn = btn.dataset.parts ? btn : document.querySelector('.chip.part[data-key="' + key + '"]');
  if (partsBtn) {
    const parts = partsBtn.dataset.parts.split('|');
    const c = dayChecks();
    if (chip) { const pk = partKey(key, chip.dataset.part); save(ID, base + pk, c[pk] ? null : true); return; }
    const all = parts.every((p) => c[partKey(key, p)]);
    parts.forEach((p) => save(ID, base + partKey(key, p), all ? null : true));
    return;
  }
  // Eli's Running is done on Training; Isaiah's 600 touches is shared with Ball Master.
  const item = L.lists(ctx, kid, date).day.find((i) => i.key === key);
  if (item && item.derived === 'drive') { location.href = 'drive.html' + (ymd(date) === ymd(new Date()) ? '' : '?date=' + ymd(date)); return; }
  if (item && item.derived === 'run') { location.href = 'run.html' + (ymd(date) === ymd(new Date()) ? '' : '?date=' + ymd(date)); return; }
  if (item && item.derived === 'touches') { save('isaiah', 'touchDays/' + ymd(date), isOn(item) ? null : true); return; }
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
  // Checking a bedtime step starts the bedtime timer if nobody has (today only).
  if (next && ymd(date) === ymd(new Date()) && !(dayChecks().bedTimer || {}).start &&
      atDate(date, () => bedtime(kid, dowOf(date))).some((b) => b.key === key)) {
    save(ID, base + 'bedTimer', { start: Date.now(), auto: true });
  }
  if (key === 'lights') save(ID, base + 'lightsAt', next ? Date.now() : null);
  // Last box in Morning or Bedtime checked while that timer is running: stop and log it.
  if (next) {
    const after = Object.assign({}, dayChecks(), { [key]: next });
    const lst = L.lists(ctx, kid, date);
    [['morning', 'mornTimer'], ['bed', 'bedTimer']].forEach(([sec, timer]) => {
      const list = lst[sec] || [];
      if (!list.some((i) => i.key === key)) return;
      const t = after[timer] || {};
      if (t.start && !t.end && list.filter((i) => !i.opt).every((i) => isDone(after[i.key]))) save(ID, base + timer + '/end', Date.now());
    });
  }
  if (key === 'mHigh5') {
    const n = new Date();
    save(ID, base + 'readyAt', next ? String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0') : null);
  }
});

function go(n) { date = addDays(date, n); render(); }
$('prevday').onclick = () => go(-1);
$('nextday').onclick = () => go(1);
$('today').onclick = () => { const t = new Date(); date = new Date(t.getFullYear(), t.getMonth(), t.getDate()); render(); };
$('date').addEventListener('change', (e) => { if (e.target.value) { date = parseYmd(e.target.value); render(); } });

// ---------- bedtime timer ----------
const clock = (secs) => Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
function timerRec() { return dayChecks().bedTimer || {}; }
// Parent override for a late night beyond the grace minutes (Settings).
function approveBtn(status) {
  if (status === 'late') return '<button class="tbtn approve" data-bedok="1">Parent OK</button>';
  if (status === 'approved') return '<button class="linkbtn" data-bedok="0">Undo OK</button>';
  return '';
}
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
  const word = { ontime: 'On time!', grace: 'On time (' + res.lateBy + ' min grace)', approved: 'Late ' + res.lateBy + ' min · parent OK’d', late: 'Late by ' + res.lateBy + ' min' }[res.status];
  return '<div class="btimer done' + (res.onTime ? ' ontime' : ' late') + '"><div><strong>' + clock(res.secs) + ' total</strong>' +
    '<small>Finished ' + new Date(r.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' · lights out ' + fmtTime(res.lo) + ' · ' +
    word + ' · ' + res.done + '/' + res.total + ' steps</small></div>' + approveBtn(res.status) +
    '<button class="linkbtn" data-timer="reset">Redo</button></div>';
}
function mornTimerHtml() {
  const r = dayChecks().mornTimer || {};
  const hm = (t) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (!r.start) return '<div class="btimer"><div><strong>Morning timer</strong><small>Want to race the clock? Tap Start.</small></div><button class="tbtn start" data-timer="start" data-which="mornTimer">Start</button></div>';
  if (!r.end) return '<div class="btimer running"><div><strong>Timer running</strong><small>Started at ' + hm(r.start) + '</small></div><span class="tclock" id="mclock">0:00</span><button class="tbtn stop" data-timer="stop" data-which="mornTimer">Stop</button></div>';
  // best time this week, to beat
  let best = null;
  const mon = mondayOf(date);
  for (let i = 0; i < 5; i++) {
    const x = (((data.days || {})[ymd(addDays(mon, i))] || {})[kid] || {}).mornTimer;
    if (x && x.start && x.end) { const t = Math.round((x.end - x.start) / 1000); if (best == null || t < best) best = t; }
  }
  const secs = Math.round((r.end - r.start) / 1000);
  return '<div class="btimer done ontime"><div><strong>' + clock(secs) + ' total' + (best === secs ? ' · best this week!' : '') + '</strong><small>Done at ' + hm(r.end) +
    (best != null && best !== secs ? ' · this week\'s best ' + clock(best) : '') + '</small></div><button class="linkbtn" data-timer="reset" data-which="mornTimer">Redo</button></div>';
}
function tick() {
  const el = document.getElementById('tclock');
  const r = timerRec();
  if (el && r.start && !r.end) el.textContent = clock(Math.max(0, Math.round((Date.now() - r.start) / 1000)));
  const m = document.getElementById('mclock');
  const mr = dayChecks().mornTimer || {};
  if (m && mr.start && !mr.end) m.textContent = clock(Math.max(0, Math.round((Date.now() - mr.start) / 1000)));
}
setInterval(tick, 1000);
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-timer]');
  if (!b) return;
  e.stopPropagation();
  const which = b.dataset.which || 'bedTimer';
  const base = 'days/' + ymd(date) + '/' + kid + '/' + which;
  const a = b.dataset.timer;
  if (a === 'start') save(ID, base, { start: Date.now() });
  if (a === 'stop') save(ID, base + '/end', Date.now());
  if (a === 'reset' && confirm('Clear this ' + (which === 'mornTimer' ? 'morning' : 'bedtime') + ' time for ' + KIDS[kid].name + '?')) save(ID, base, null);
}, true);

document.addEventListener('change', (e) => {
  if (e.target.id === 'wokeAt') save(ID, 'days/' + ymd(date) + '/' + kid + '/wokeAt', e.target.value || null);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-wokenow]')) return;
  e.stopPropagation();
  const n = new Date();
  save(ID, 'days/' + ymd(date) + '/' + kid + '/wokeAt', String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'));
}, true);

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-bedok]');
  if (!b) return;
  e.stopPropagation();
  const path = 'days/' + ymd(date) + '/' + kid + '/bedOk', v = b.dataset.bedok === '1' ? true : null;
  askParent().then((ok) => { if (ok) save(ID, path, v); });
}, true);

// A chore missed earlier this week: done now, saved on the day it was for.
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-owed]');
  if (!b) return;
  e.stopPropagation();
  const [d, k] = b.dataset.owed.split('|');
  save(ID, 'days/' + d + '/' + kid + '/' + k, true);
}, true);

// Excusing a missed chore: saved on the day it was for. Waiting doesn't unlock; approved does.
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-owedex]');
  if (!b) return;
  e.stopPropagation();
  const [a, d, k] = b.dataset.owedex.split('|'), path = 'days/' + d + '/' + kid + '/' + k;
  if (a === 'mark') save(ID, path, SKIP);
  if (a === 'undo') save(ID, path, null);
  if (a === 'approve') askParent().then((ok) => { if (ok) save(ID, path, EXCUSED); });
}, true);

// End-of-day checks: parents only
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-daycheck]');
  if (!b) return;
  e.stopPropagation();
  const [k, a] = b.dataset.daycheck.split('|'), path = 'days/' + ymd(date) + '/' + kid + '/' + k;
  const cur = dayChecks()[k], v = a === 'yes' ? (cur === true ? null : true) : (cur === 'no' ? null : 'no');
  askParent().then((ok) => { if (ok) save(ID, path, v); });
}, true);

// Not able to complete: the kid marks it, a parent approves (PIN) or the kid undoes it.
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-excuse]');
  if (!b) return;
  e.stopPropagation();
  const path = 'days/' + ymd(date) + '/' + kid + '/' + b.dataset.key, a = b.dataset.excuse;
  if (a === 'mark') save(ID, path, SKIP);
  if (a === 'undo') save(ID, path, null);
  if (a === 'approve') askParent().then((ok) => { if (ok) save(ID, path, EXCUSED); });
}, true);

render();
watch(ID, (d) => { data = d; ctx.routines = d; render(); }, statusPill($('sync')));
watch('config', (d) => { applyConfig(d); render(); });
watch('eli-run', (d) => { ctx.run = d; render(); });
watch('isaiah', (d) => { ctx.isaiah = d; render(); });
watch('eli-drive', (d) => { ctx.drive = d; render(); });
