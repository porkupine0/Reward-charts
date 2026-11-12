import { watch, save, ymd, parseYmd, addDays, mondayOf, shortDate, esc, statusPill } from './store.js?v=1794442095';
import { askParent } from './parent.js?v=1794442095';
import { celebrate } from './streaks.js?v=1794442095';
import { PLAN_START, trialOn } from './plan.js?v=1794442095';

const ID = 'eli-trials';

// Prize levels, smallest to biggest. The lists can be changed on the Settings page.
import { SETTINGS, applySettings } from './settings.js?v=1794442095';
export const LEVELS = ['Small', 'Medium', 'Big', 'Huge', 'Grand'];
const T1 = 'Small', T2 = 'Medium', T3 = 'Big', T4 = 'Huge', T5 = 'Grand';
const tierName = (lvl) => lvl;
const tierOpts = (lvl) => SETTINGS.prizeLevels[lvl] || [];

// [seconds to break, prize tier, label]
export const MILE = [[440, T1], [430, T1], [420, T1], [405, T2], [390, T2], [380, T3], [370, T3], [360, T4, 'Big one'], [350, T4], [340, T5], [330, T5, 'Stretch goal']];
// Each 5K rung matches the mile rung beside it: the Daniels VDOT 5K equivalent of that mile
// (about mile × 3.4, which allows for slowing over the longer race), made 2% faster, to the nearest 5 sec.
export const FIVE = [[1460, T1], [1425, T1], [1395, T1], [1350, T2], [1300, T2], [1270, T3, 'Season goal'], [1235, T3], [1205, T4], [1175, T4], [1140, T5], [1110, T5, 'Stretch goal']];
// Treadmill speed (mph, 1% incline) that beats a time: the next 0.1 mph above the exact pace
// (a 6:00 mile is exactly 10.0 mph, which only ties it, so the goal is 10.1).
export const mphFor = (kind, secs) => (Math.floor(((kind === 'mile' ? 1 : 3.10686) * 3600 / secs) * 10 + 1e-9) + 1) / 10;

// Plan week → [distance, day index (0 = Mon), note]
export const SCHED = { 3: ['5k', 2, 'First test'], 4: ['mile', 2], 5: ['5k', 3, 'Turkey Trot'], 6: ['mile', 3], 7: ['5k', 2], 8: ['mile', 2], 9: ['5k', 2], 10: ['mile', 2], 11: ['5k', 2], 12: ['mile', 2], 13: ['5k', 3, 'Final test'] };

// Save a trial. On a planned test day of the same distance it uses one id per day (re-saving
// replaces it) and checks off that day's time trial on Training (his reward chart follows Training).
export function saveTrial(t) {
  const planned = trialOn(parseYmd(t.date)) === t.kind;
  save(ID, 'trials/' + (planned ? 'p' + t.date : Date.now().toString(36)), t);
  if (planned) save('eli-run', 'days/' + t.date + '/items/run', true);
}

export const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
const name = (k) => (k === 'mile' ? '1 mile' : '5K');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const $ = (id) => document.getElementById(id);

// Milestones, bests and trial prizes from the logged times (oldest first).
export function score(d) {
  const trials = Object.entries(d.trials || {}).map(([id, t]) => ({ id, ...t }))
    .sort((a, b) => (a.date + a.id).localeCompare(b.date + b.id));
  const best = { mile: null, '5k': null }, hit = { mile: {}, '5k': {} }, prs = {};
  trials.forEach((t) => {
    const b = best[t.kind];
    if (b !== null && t.secs < b) prs[t.id] = b - t.secs;
    if (b === null || t.secs < b) best[t.kind] = t.secs;
    (t.kind === 'mile' ? MILE : FIVE).forEach(([s]) => { if (!hit[t.kind][s] && t.secs < s) hit[t.kind][s] = t.date; });
  });
  return { trials, best, hit, prs };
}
export function nextMilestone(kind, sc) {
  return (kind === 'mile' ? MILE : FIVE).find(([s]) => !sc.hit[kind][s]);
}

// Planned trials with their dates and any logged time.
export function planned(sc) {
  const start = parseYmd(PLAN_START);
  return Object.entries(SCHED).map(([n, [k, day, note]]) => {
    const ws = addDays(start, (n - 1) * 7), date = addDays(ws, day);
    const t = sc.trials.find((x) => x.kind === k && x.date >= ymd(ws) && x.date <= ymd(addDays(ws, 6)));
    return { n: +n, k, note, date, ws, t };
  });
}

// Milestone prizes earned and not handed over yet (picked or still to pick).
// Running a trial or setting a best is not rewarded by itself; only breaking a milestone is.
export function owed(d) {
  const sc = score(d || {}), paid = (d || {}).paid || {}, pick = (d || {}).pick || {};
  const out = [];
  [['mile', MILE], ['5k', FIVE]].forEach(([k, list]) => list.forEach(([s, lvl]) => {
    const got = sc.hit[k][s], key = k + '_' + s;
    if (!got || paid[key]) return;
    const v = pick[key];
    out.push({ key, date: got, needsPick: v == null, what: v == null ? 'Pick a ' + lvl + ' prize for breaking ' + fmt(s) + ' (' + name(k) + ')' : tierOpts(lvl)[v] + ' (' + name(k) + ' under ' + fmt(s) + ')' });
  }));
  return out;
}

if (typeof document !== 'undefined' && $('form')) {
  let data = {}, kind = trialOn(new Date()) || 'mile', formTouched = false;

  const paidBtn = (key) => {
    const when = (data.paid || {})[key];
    return '<button class="cash' + (when ? ' on' : '') + '" data-paid="' + key + '" aria-pressed="' + !!when + '">' +
      '<span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      (when ? 'Paid ' + shortDate(parseYmd(when)) : 'Paid?') + '</button>';
  };
  const picker = (key, options, label) => {
    const v = (data.pick || {})[key];
    const picked = v !== undefined && v !== null;
    return '<div class="pickcol"><select data-pick="' + key + '" aria-label="' + esc(label) + '"><option value="">Pick a prize…</option>' +
      options.map((o, i) => '<option value="' + i + '"' + (v === i ? ' selected' : '') + '>' + esc(o) + '</option>').join('') +
      '</select>' + (picked ? paidBtn(key) : '') + '</div>';
  };

  function ladder(k, list, sc) {
    const next = nextMilestone(k, sc);
    return list.map(([s, opts, tag], i) => {
      const got = sc.hit[k][s], isNext = next && next[0] === s;
      opts = tierName(opts);
      const gap = isNext && sc.best[k] ? (sc.best[k] - s + 1) + ' sec to go' : '';
      return '<div class="rung' + (got ? ' got' : isNext ? ' next' : '') + '"><span class="rt">' + fmt(s) + '</span>' +
        '<span class="rl">' + (got ? 'Broke it ' + shortDate(parseYmd(got)) : isNext ? 'Next up' + (gap ? ' · ' + gap : '') : 'Locked') + '<b class="tier">' + tierName(opts) + '</b>' + (tag ? '<b>' + tag + '</b>' : '') + '</span>' +
        '<span class="rp"><b>' + mphFor(k, s).toFixed(1) + ' mph</b>' + (k === 'mile' ? 'Matches ' + fmt(FIVE[i][0]) + ' 5K' : fmt(s / 3.10686) + '/mi') + '</span></div>';
    }).join('');
  }

  let hitCount = null, savedAt = 0;
  function render() {
    const sc = score(data);
    const hits = Object.keys(sc.hit.mile).length + Object.keys(sc.hit['5k']).length;
    if (hitCount !== null && hits > hitCount && Date.now() - savedAt < 5000) celebrate('New milestone! Pick your prize below.');
    hitCount = hits;
    const today = ymd(new Date()), wk = mondayOf(new Date());
    const pw = Math.round((wk - parseYmd(PLAN_START)) / 6048e5) + 1;

    // Last trial, any trial still needing a time, and the next one
    const pl = planned(sc);
    const last = [...pl].reverse().find((x) => x.t && ymd(x.date) <= today);
    const missing = [...pl].reverse().find((x) => !x.t && ymd(x.date) <= today && ymd(x.date) >= ymd(addDays(new Date(), -7)));
    const upcoming = pl.find((x) => !x.t && ymd(x.date) > today);
    const when = (x) => (ymd(x.date) === today ? 'Today' : DAYS[(x.date.getDay() + 6) % 7] + ' ' + shortDate(x.date));
    const bests = ['mile', '5k'].map((k) => {
      const nx = nextMilestone(k, sc);
      return '<div><small>' + (k === 'mile' ? 'Mile' : '5K') + ' best</small><strong' + (sc.best[k] ? '>' + fmt(sc.best[k]) : ' class="none">No time yet') + '</strong><small>' + (nx ? 'Next: under ' + fmt(nx[0]) + ' · ' + mphFor(k, nx[0]).toFixed(1) + ' mph' : 'All done!') + '</small></div>';
    }).join('');
    $('next').innerHTML = '<div class="tt-bests">' + bests + '</div>' +
      (missing ? '<p class="tt-up"><b>' + when(missing) + ':</b> ' + name(missing.k) + ' time trial' + (missing.note ? ' · ' + missing.note : '') + ' · <b>needs a time</b></p>' : '') +
      (last && !missing ? '<p class="tt-up"><b>Last:</b> ' + name(last.k) + ' ' + fmt(last.t.secs) + ' ✓ (' + when(last) + ')</p>' : '') +
      (upcoming ? '<p class="tt-up"><b>Next · ' + when(upcoming) + ':</b> ' + name(upcoming.k) + ' time trial' + (upcoming.note ? ' · ' + upcoming.note : '') + ' (Week ' + upcoming.n + ')</p>' : '');
    // The form starts on the trial that still needs a time
    if (missing && !formTouched) { kind = missing.k; $('tdate').value = ymd(missing.date); }

    $('ladMile').innerHTML = ladder('mile', MILE, sc);
    $('lad5k').innerHTML = ladder('5k', FIVE, sc);

    // Prize menu: only what's been earned. Locked milestones show their level on the ladders above.
    let p = '';
    [['mile', MILE, 'Mile'], ['5k', FIVE, '5K']].forEach(([k, list, label]) => {
      p += '<h3>' + label + ' milestones <small>Pick one per milestone</small></h3>';
      const earned = list.filter(([s]) => sc.hit[k][s]);
      if (!earned.length) p += '<p class="muted">Break your first ' + (k === 'mile' ? 'mile' : '5K') + ' milestone to pick a prize.</p>';
      earned.forEach(([s, lvl]) => {
        p += '<div class="prow"><span class="ttag">' + fmt(s) + '</span>' + picker(k + '_' + s, tierOpts(lvl), label + ' ' + fmt(s) + ' prize') + '</div>';
      });
    });
    p += '<h3>Prize levels <small>What you can pick</small></h3>' + LEVELS.map((n) => '<div class="prow"><span class="ttag">' + n + '</span><span class="muted">' + tierOpts(n).map(esc).join(' · ') + '</span></div>').join('');
    $('prizelist').innerHTML = p;

    // Schedule with results
    $('sched').innerHTML = pl.map(({ n, k, note, date, t }) => {
      const day = (date.getDay() + 6) % 7, isNow = n === pw;
      const tag = t ? '<span class="tt-res">' + fmt(t.secs) + '</span>' : isNow ? '<span class="tt-now">This week</span>' : ymd(date) < today ? '<span class="tt-miss">No time</span>' : '';
      return '<div class="tt-row' + (isNow ? ' now' : '') + '"><span class="wk">WK ' + n + '</span><span class="grow"><b>' + name(k) + '</b>' + (note ? ' · ' + note : '') + '<small>' + DAYS[day] + ' ' + shortDate(date) + '</small></span>' + tag + '</div>';
    }).join('') +
      (sc.trials.length ? '<h3 class="tt-h">All times</h3>' + [...sc.trials].reverse().map((t) =>
        '<div class="tt-row"><span class="grow"><b>' + name(t.kind) + ' · ' + fmt(t.secs) + '</b><small>' + shortDate(parseYmd(t.date)) + ' · ' + ({ track: 'Track', treadmill: 'Treadmill', race: 'Race' }[t.where] || '') + '</small></span>' +
        '<button class="linkbtn danger" data-del="' + t.id + '">Delete</button></div>').join('') : '');

    document.querySelectorAll('.tt-kind button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.kind === kind));
  }

  document.addEventListener('click', (e) => {
    const kb = e.target.closest('.tt-kind button');
    if (kb) { kind = kb.dataset.kind; formTouched = true; render(); return; }
    const pb = e.target.closest('[data-paid]');
    if (pb) { const k = pb.dataset.paid; askParent().then((ok) => { if (ok) save(ID, 'paid/' + k, (data.paid || {})[k] ? null : ymd(new Date())); }); return; }
    const db = e.target.closest('[data-del]');
    if (db && confirm('Delete this time?')) save(ID, 'trials/' + db.dataset.del, null);
  });
  document.addEventListener('change', (e) => {
    const s = e.target.closest('select[data-pick]');
    if (s) {
      save(ID, 'pick/' + s.dataset.pick, s.value === '' ? null : Number(s.value));
      if (s.value === '') save(ID, 'paid/' + s.dataset.pick, null);
    }
  });
  $('tdate').value = ymd(new Date());
  $('tdate').addEventListener('change', () => { formTouched = true; const k = $('tdate').value && trialOn(parseYmd($('tdate').value)); if (k) { kind = k; render(); } });
  $('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const m = parseInt($('tmin').value, 10), s = parseInt($('tsec').value || '0', 10), secs = m * 60 + s;
    const ok = kind === 'mile' ? secs >= 240 && secs <= 900 : secs >= 840 && secs <= 2700;
    if (!(m >= 0) || !(s >= 0 && s < 60) || !ok) { $('msg').textContent = 'Check the time: minutes and seconds, like 6 and 42' + (kind === '5k' ? ' (or 22 and 10 for a 5K).' : '.'); return; }
    savedAt = Date.now();
    saveTrial({ kind, secs, date: $('tdate').value || ymd(new Date()), where: $('twhere').value });
    $('tmin').value = ''; $('tsec').value = '';
    $('msg').textContent = name(kind) + ' in ' + fmt(secs) + ' saved. Check the prize menu!';
    formTouched = false;
  });

  render();
  watch(ID, (d) => { data = d; render(); }, statusPill($('sync')));
  watch('config', (d) => { applySettings(d); render(); });
}
