import { watch, save, ymd, parseYmd, mondayOf, addDays, shortDate, esc, statusPill } from './store.js';

const ID = 'isaiah';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const LEVELS = [
  ['5', ['Pick dessert tonight', 'Candy bar at checkout', 'Pick the cereal this week']],
  ['8', ['Pick the family movie', 'Stay up 15 min late', 'Extra 20 min game time']],
  ['10', ['Pick dinner one night', 'Donut run with Dad', 'Family game night, you pick the game']],
  ['12', ['Slushie trip', 'Skip one chore', 'Pick Saturday breakfast, Dad cooks']],
  ['15', ['Ice cream trip', '$5 to spend', 'Extra 30 min game time']],
  ['20', ['$10 to spend', 'Pick the restaurant', 'Breakfast date with Dad']],
  ['25', ['Milkshake date with Dad', 'Bowling or mini-golf', 'No chores for a weekend']],
  ['30', ['$15 to spend', 'Movie night: snacks + stay up late', 'Rec center swim with Dad']],
  ['40', ['New soccer warmup or jersey', '$25 to spend', 'Afternoon with Dad, you plan it']],
  ['50', ['FAMILY FUN DAY — you plan the whole day']]
];
const WEEKLY = ['Pick Friday night dinner', '$5 to spend', 'Stay up 30 min late Saturday', 'Skip one chore of your choice', '30 min extra weekend game time (if not lost)'];
const CHAMPION = ['Lunch out with Dad, your pick', 'New soccer warmup or jersey', '$20 to spend', 'Family game night, your rules + late bedtime'];

const $ = (id) => document.getElementById(id);
let data = {};

const ball = (on) => '<svg class="ball' + (on ? ' on' : '') + '" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="7.5"/><polygon points="9,5.5 12.3,8 11.1,11.8 6.9,11.8 5.7,8"/></svg>';
const star = (on) => '<svg class="star' + (on ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,2.5 14.9,8.6 21.5,9.4 16.6,13.9 17.9,20.5 12,17.2 6.1,20.5 7.4,13.9 2.5,9.4 9.1,8.6"/></svg>';

function weekDone(w) {
  const t = (data.touches && data.touches[w]) || {};
  for (let d = 0; d < 7; d++) if ((t[d] || 0) < 6) return false;
  return true;
}

function select(path, options, value, label) {
  return '<select data-path="' + path + '" aria-label="' + esc(label) + '"><option value="">Pick a prize…</option>' +
    options.map((o, i) => '<option value="' + i + '"' + (value === i ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
}

function render() {
  const start = data.start ? parseYmd(data.start) : mondayOf(new Date());
  $('start').value = ymd(start);
  const today = ymd(new Date());

  let h = '<div class="bm-row bm-headrow"><span></span>' + DAYS.map((d, i) => '<span>' + DAYS[(start.getDay() + 6 + i) % 7].toUpperCase() + '</span>').join('') + '<span class="pz">Prize</span></div>';
  for (let w = 0; w < 4; w++) {
    const t = (data.touches && data.touches[w]) || {};
    h += '<div class="bm-row"><span class="wk">WK ' + (w + 1) + '</span>';
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const n = t[d] || 0;
      h += '<button class="tday' + (n >= 6 ? ' full' : '') + (ymd(date) === today ? ' is-today' : '') + '" data-w="' + w + '" data-d="' + d + '" aria-label="' + shortDate(date) + ': ' + n * 100 + ' touches">' +
        '<small>' + date.getDate() + '</small><span class="balls">' + [0, 1, 2, 3, 4, 5].map((i) => ball(i < n)).join('') + '</span></button>';
    }
    h += '<span class="wkstar">' + star(weekDone(w)) + '</span></div>';
  }
  h += '<p class="hint">Tapped one too many? Tap the day until it wraps back to empty.</p>';
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
    const w = day.dataset.w, d = day.dataset.d;
    const n = ((data.touches && data.touches[w] && data.touches[w][d]) || 0);
    save(ID, 'touches/' + w + '/' + d, n >= 6 ? null : n + 1);
    return;
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
  if (!confirm('Start a new 4-week challenge? This clears the touch tracker and weekly prizes. Juggling levels stay.')) return;
  save(ID, 'touches', null); save(ID, 'weekPrize', null); save(ID, 'champion', null);
  save(ID, 'start', ymd(mondayOf(new Date())));
};

render();
watch(ID, (d) => { data = d; render(); }, statusPill($('sync')));
