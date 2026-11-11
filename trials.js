import { watch, save, ymd, parseYmd, addDays, mondayOf, shortDate, esc, statusPill } from './store.js?v=1794424576';
import { PLAN_START } from './plan.js?v=1794424576';

const ID = 'eli-trials';

// Prize tiers, smallest to biggest.
const T1 = ['Pick something from the Hy-Vee checkout line', 'Special doughnut for breakfast', 'Stay up 30 min later on a Friday or Saturday', '30 min extra video game time'];
const T2 = ['Starbucks run', 'Smoothie or shake after a run', 'Skip one chore (parent’s pick)', 'Family movie night: you pick the movie and snacks', '1 hour extra video game time'];
const T3 = ['Special lunch out with Dad', 'Friday night pizza: you pick where and what', 'Chore-free day', 'New running socks'];
const T4 = ['Arcade at B&B Theatres or the Operating Room', 'Sit-down family dinner at a nice restaurant'];
const T5 = ['Plan 2 family activities for a Saturday', 'Arcade at B&B Theatres or the Operating Room + a Starbucks run', 'Sit-down family dinner at a nice restaurant + lunch out with Dad'];
const TIERS = [[T1, 'Small'], [T2, 'Medium'], [T3, 'Big'], [T4, 'Huge'], [T5, 'Grand']];
const tierName = (opts) => TIERS.find(([t]) => t === opts)[1];

// [seconds to break, prize tier, label]
export const MILE = [[420, T1], [405, T2], [390, T2], [380, T3], [370, T3], [360, T4, 'Big one'], [350, T4], [340, T5], [330, T5, 'Stretch goal']];
export const FIVE = [[1380, T1], [1350, T2], [1320, T3], [1290, T4, 'Season goal'], [1260, T4], [1245, T4], [1230, T5], [1215, T5], [1200, T5], [1185, T5], [1170, T5], [1155, T5], [1140, T5, 'Stretch goal']];
const TRIAL_PRIZE = '15 min extra video game time';

// Plan week → [distance, day index (0 = Mon), note]
export const SCHED = { 4: ['mile', 2], 5: ['5k', 3, 'Turkey Trot'], 6: ['mile', 3], 7: ['5k', 2], 8: ['mile', 2], 9: ['5k', 2], 10: ['mile', 2], 11: ['5k', 2], 12: ['mile', 2], 13: ['5k', 3, 'Final test'] };

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

if (typeof document !== 'undefined' && $('form')) {
  let data = {}, kind = 'mile';

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
    return list.map(([s, opts, tag]) => {
      const got = sc.hit[k][s], isNext = next && next[0] === s;
      const gap = isNext && sc.best[k] ? (sc.best[k] - s + 1) + ' sec to go' : '';
      return '<div class="rung' + (got ? ' got' : isNext ? ' next' : '') + '"><span class="rt">' + fmt(s) + '</span>' +
        '<span class="rl">' + (got ? 'Broke it ' + shortDate(parseYmd(got)) : isNext ? 'Next up' + (gap ? ' · ' + gap : '') : 'Locked') + (tag ? '<b>' + tag + '</b>' : '<b class="tier">' + tierName(opts) + '</b>') + '</span>' +
        '<span class="rp">' + (k === 'mile' ? '≈ ' + fmt(s * 3.33) + ' 5K' : fmt(s / 3.10686) + '/mi') + '</span></div>';
    }).join('');
  }

  function render() {
    const sc = score(data);
    const today = ymd(new Date()), wk = mondayOf(new Date());
    const pw = Math.round((wk - parseYmd(PLAN_START)) / 6048e5) + 1;

    // Next trial + bests
    const upcoming = Object.entries(SCHED).map(([n, [k, day, note]]) => ({ n: +n, k, note, date: addDays(addDays(parseYmd(PLAN_START), (n - 1) * 7), day) }))
      .find((x) => ymd(x.date) >= today || x.n === pw);
    const bests = ['mile', '5k'].map((k) => {
      const nx = nextMilestone(k, sc);
      return '<div><small>' + (k === 'mile' ? 'Mile' : '5K') + ' best</small><strong>' + (sc.best[k] ? fmt(sc.best[k]) : '–:––') + '</strong><small>' + (nx ? 'Next: under ' + fmt(nx[0]) : 'All done!') + '</small></div>';
    }).join('');
    $('next').innerHTML = '<div class="tt-bests">' + bests + '</div>' +
      (upcoming ? '<p class="tt-up"><b>' + (ymd(upcoming.date) === today ? 'Today' : DAYS[(upcoming.date.getDay() + 6) % 7] + ' ' + shortDate(upcoming.date)) + ':</b> ' + name(upcoming.k) + ' time trial' + (upcoming.note ? ' · ' + upcoming.note : '') + ' (Week ' + upcoming.n + ')</p>' : '');

    $('ladMile').innerHTML = ladder('mile', MILE, sc);
    $('lad5k').innerHTML = ladder('5k', FIVE, sc);

    // Prize menu: earned milestones get a picker + Paid box; locked ones list their choices
    let p = '<h3>Every time trial <small>Finish one</small></h3>';
    const newest = [...sc.trials].reverse();
    p += newest.length ? newest.map((t) => {
      let row = '<div class="prow"><span class="ttag">' + shortDate(parseYmd(t.date)) + '</span><div class="pickcol"><span class="fixed">' + TRIAL_PRIZE + ' · ' + name(t.kind) + ' ' + fmt(t.secs) + '</span>' + paidBtn('t_' + t.id) + '</div></div>';
      if (sc.prs[t.id]) row += '<div class="prow"><span class="ttag pr">Best</span><div class="pickcol"><span class="fixed">' + TRIAL_PRIZE + ' · new best by ' + sc.prs[t.id] + ' sec</span>' + paidBtn('pr_' + t.id) + '</div></div>';
      return row;
    }).join('') : '<p class="muted">Finish a trial: ' + TRIAL_PRIZE + '. Beat your best: another 15 minutes.</p>';
    [['mile', MILE, 'Mile'], ['5k', FIVE, '5K']].forEach(([k, list, label]) => {
      p += '<h3>' + label + ' milestones <small>Pick one per milestone</small></h3>';
      list.forEach(([s, opts]) => {
        const got = sc.hit[k][s], key = k + '_' + s;
        p += '<div class="prow' + (got ? '' : ' locked') + '"><span class="ttag">' + fmt(s) + '</span>' +
          (got ? picker(key, opts, label + ' ' + fmt(s) + ' prize') : '<span class="muted">' + tierName(opts) + ' prize · locked</span>') + '</div>';
      });
    });
    p += '<h3>Prize levels <small>What you can pick</small></h3>' + TIERS.map(([opts, n]) => '<div class="prow"><span class="ttag">' + n + '</span><span class="muted">' + opts.map(esc).join(' · ') + '</span></div>').join('');
    $('prizelist').innerHTML = p;

    // Schedule with results
    $('sched').innerHTML = Object.entries(SCHED).map(([n, [k, day, note]]) => {
      const ws = addDays(parseYmd(PLAN_START), (n - 1) * 7), date = addDays(ws, day);
      const t = sc.trials.find((x) => x.kind === k && x.date >= ymd(ws) && x.date <= ymd(addDays(ws, 6)));
      const isNow = +n === pw;
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
    if (kb) { kind = kb.dataset.kind; render(); return; }
    const pb = e.target.closest('[data-paid]');
    if (pb) { const k = pb.dataset.paid; save(ID, 'paid/' + k, (data.paid || {})[k] ? null : ymd(new Date())); return; }
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
  $('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const m = parseInt($('tmin').value, 10), s = parseInt($('tsec').value || '0', 10), secs = m * 60 + s;
    const ok = kind === 'mile' ? secs >= 240 && secs <= 900 : secs >= 840 && secs <= 2700;
    if (!(m >= 0) || !(s >= 0 && s < 60) || !ok) { $('msg').textContent = 'Check the time: minutes and seconds, like 6 and 42' + (kind === '5k' ? ' (or 22 and 10 for a 5K).' : '.'); return; }
    const id = Date.now().toString(36);
    save(ID, 'trials/' + id, { kind, secs, date: $('tdate').value || ymd(new Date()), where: $('twhere').value });
    $('tmin').value = ''; $('tsec').value = '';
    $('msg').textContent = name(kind) + ' in ' + fmt(secs) + ' saved. Check the prize menu!';
  });

  render();
  watch(ID, (d) => { data = d; render(); }, statusPill($('sync')));
}
