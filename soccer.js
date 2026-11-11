import { askParent } from './parent.js?v=1794440709';
import { watch, save, ymd, parseYmd, mondayOf, addDays, shortDate, esc, statusPill, isLive } from './store.js?v=1794440709';
import { touchedOn } from './lists.js?v=1794440709';

const ID = 'isaiah';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
import { LEVELS, WEEKLY, CHAMPION } from './bm.js?v=1794440709';
export { LEVELS };

const $ = (id) => document.getElementById(id);
let data = {};

const ball = (on) => '<svg class="ball' + (on ? ' on' : '') + '" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="7.5"/><polygon points="9,5.5 12.3,8 11.1,11.8 6.9,11.8 5.7,8"/></svg>';
const star = (on) => '<svg class="star' + (on ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,2.5 14.9,8.6 21.5,9.4 16.6,13.9 17.9,20.5 12,17.2 6.1,20.5 7.4,13.9 2.5,9.4 9.1,8.6"/></svg>';

// Touch days are stored by real date (touchDays/2026-11-11), shared with Isaiah's checklist.
const startDate = () => (data.start && parseYmd(data.start)) || mondayOf(new Date());
const dayOn = (w, d) => touchedOn(data, ymd(addDays(startDate(), w * 7 + d)));
function weekDone(w) {
  for (let d = 0; d < 7; d++) if (!dayOn(w, d)) return false;
  return true;
}
// One-time move of older week/day ticks to real dates, and freeze the start date.
let migrated = false;
function migrate() {
  if (migrated || !isLive(ID)) return;
  migrated = true;
  const start = startDate();
  if (!data.start) save(ID, 'start', ymd(start));
  if (!data.touches) return;
  for (let w = 0; w < 4; w++) for (let d = 0; d < 7; d++) {
    if ((((data.touches[w] || {})[d]) || 0) >= 6) save(ID, 'touchDays/' + ymd(addDays(start, w * 7 + d)), true);
  }
  save(ID, 'touches', null);
}

// "Cashed in" checkbox, shown once a prize is picked.
function cashBtn(path) {
  const key = path.replace(/\//g, '_');
  const when = (data.cashed || {})[key];
  return '<button class="cash' + (when ? ' on' : '') + '" data-cash="' + key + '" aria-pressed="' + !!when + '">' +
    '<span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
    (when ? 'Cashed in ' + shortDate(parseYmd(when)) : 'Cashed in?') + '</button>';
}
function select(path, options, value, label) {
  const picked = value !== undefined && value !== null && value !== '';
  return '<div class="pickcol">' + selectOnly(path, options, value, label) + (picked ? cashBtn(path) : '') + '</div>';
}
function selectOnly(path, options, value, label) {
  return '<select data-path="' + path + '" aria-label="' + esc(label) + '"><option value="">Pick a prize…</option>' +
    options.map((o, i) => '<option value="' + i + '"' + (value === i ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
}

function render() {
  migrate();
  const start = startDate();
  $('start').value = ymd(start);
  const last = addDays(start, 27), full = [0, 1, 2, 3].reduce((n, w) => n + [0, 1, 2, 3, 4, 5, 6].filter((d) => dayOn(w, d)).length, 0);
  $('ended').hidden = ymd(new Date()) <= ymd(last);
  $('ended').innerHTML = '<strong>This challenge ended ' + shortDate(last) + '.</strong> ' + full + ' of 28 days done. <button class="linkbtn" data-newchallenge="1">Start a new 4-week challenge</button>';
  const today = ymd(new Date());

  let h = '<div class="bm-row bm-headrow"><span></span>' + DAYS.map((d, i) => '<span>' + DAYS[(start.getDay() + 6 + i) % 7].toUpperCase() + '</span>').join('') + '<span class="pz">Prize</span></div>';
  for (let w = 0; w < 4; w++) {
    h += '<div class="bm-row"><span class="wk">WK ' + (w + 1) + '</span>';
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const n = dayOn(w, d) ? 6 : 0;
      h += '<button class="tday' + (n >= 6 ? ' full' : '') + (ymd(date) === today ? ' is-today' : '') + '" data-date="' + ymd(date) + '" aria-label="' + shortDate(date) + (n >= 6 ? ': 600 touches done' : ': not done') + '" aria-pressed="' + (n >= 6) + '">' +
        '<small>' + date.getDate() + '</small>' + ball(n >= 6) + '</button>';
    }
    h += '<span class="wkstar">' + star(weekDone(w)) + '</span></div>';
  }
  h += '<p class="hint">Tap a day by mistake? Tap it again to clear it.</p>';
  $('weeks').innerHTML = h;

  const jg = data.juggle || {};
  $('levels').innerHTML = LEVELS.map(([n]) => {
    const got = jg[n];
    return '<button class="level' + (got ? ' got' : '') + (n === '50' ? ' big' : '') + '" data-level="' + n + '" aria-pressed="' + !!got + '">' +
      '<span class="lvn">' + n + '</span><span class="lvl">' + (n === '50' ? 'Big prize' : 'In a row') + '</span>' +
      '<span class="lvd">' + (got ? shortDate(parseYmd(got.date)) : '—') + '</span></button>';
  }).join('');

  // prize menu: only what's been earned shows a picker
  let p = '';
  const stars = [0, 1, 2, 3].filter(weekDone);
  p += '<h3>Weekly prize <small>7 of 7 days</small></h3>';
  p += stars.length ? stars.map((w) => '<div class="prow"><span>Week ' + (w + 1) + '</span>' + select('weekPrize/' + w, WEEKLY, data.weekPrize && data.weekPrize[w], 'Week ' + (w + 1) + ' prize') + '</div>').join('')
    : '<p class="muted">Complete a full week to unlock: ' + WEEKLY.map(esc).join(' · ') + '</p>';
  p += '<h3>Champion prize <small>All 4 weeks</small></h3>';
  p += stars.length === 4 ? '<div class="prow"><span>Champion!</span>' + select('champion', CHAMPION, data.champion, 'Champion prize') + '</div>'
    : '<p class="muted">' + CHAMPION.map(esc).join(' · ') + '</p>';
  p += '<h3>Juggling prizes</h3>';
  LEVELS.forEach(([n, opts]) => {
    const got = jg[n];
    p += '<div class="prow' + (got ? '' : ' locked') + '"><span class="lvbadge">' + n + '</span>' +
      (got ? select('juggle/' + n + '/prize', opts, got.prize, 'Level ' + n + ' prize') : '<span class="muted">' + opts.map(esc).join(' · ') + '</span>') + '</div>';
  });
  $('prizelist').innerHTML = p;
}

document.addEventListener('click', (e) => {
  const day = e.target.closest('.tday');
  if (day) {
    const k = day.dataset.date;
    save(ID, 'touchDays/' + k, touchedOn(data, k) ? null : true);
    return;
  }
  if (e.target.closest('[data-newchallenge]')) { $('reset').click(); return;
  }
  const lv = e.target.closest('.level');
  if (lv) {
    const n = lv.dataset.level;
    const got = data.juggle && data.juggle[n];
    if (got) {
      if (confirm('Un-mark level ' + n + '?')) save(ID, 'juggle/' + n, null);
    } else {
      save(ID, 'juggle/' + n, { date: ymd(new Date()) });
    }
  }
});
document.addEventListener('change', (e) => {
  const s = e.target.closest('select[data-path]');
  if (s) save(ID, s.dataset.path, s.value === '' ? null : Number(s.value));
});
$('start').addEventListener('change', (e) => { if (e.target.value) save(ID, 'start', e.target.value); });
$('reset').onclick = () => {
  if (!confirm('Start a new 4-week challenge from this Monday? Weekly prizes reset. Juggling levels and past days stay.')) return;
  save(ID, 'weekPrize', null); save(ID, 'champion', null); save(ID, 'cashed', null);
  save(ID, 'start', ymd(mondayOf(new Date())));
};

document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-cash]');
  if (!c) return;
  const k = c.dataset.cash;
  askParent().then((ok) => { if (ok) save(ID, 'cashed/' + k, (data.cashed || {})[k] ? null : ymd(new Date())); });
});

render();
watch(ID, (d) => { data = d; render(); }, statusPill($('sync')));
