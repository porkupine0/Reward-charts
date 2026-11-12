// Everything the kids have earned and not received yet (Parents page and the home Parents button).
// row(who, accent, whatHtml, when, actionHtml) and tick(chart, path, label) decide how each item looks.
import { ymd, parseYmd, mondayOf, addDays, shortDate, esc } from './store.js?v=1794511357';
import { CHARTS, weekProgress } from './charts.js?v=1794511357';
import { KIDS } from './routines.js?v=1794511357';
import * as L from './lists.js?v=1794511357';
import { owed } from './trials.js?v=1794511357';
import { LEVELS, WEEKLY, CHAMPION } from './bm.js?v=1794511357';

export function owedItems(D, ctx, row, tick) {
  const out = [];
  const today = new Date(), thisMon = mondayOf(today);
  // Eli's and Rhett's perfect weeks and months (last 10 weeks)
  ['eli', 'trombone'].forEach((id) => {
    const ch = CHARTS[id], data = D[id], kid = id === 'eli' ? KIDS.eli : KIDS.rhett;
    const perfect = (mon) => weekProgress(ch, L.effectiveWeek(ch, mon, (data.weeks || {})[ymd(mon)], ctx)).perfect;
    for (let w = 0; w < 10; w++) {
      const mon = addDays(thisMon, -7 * w), wd = (data.weeks || {})[ymd(mon)] || {};
      if (!perfect(mon) || wd.given) continue;
      const pick = wd.reward != null ? ch.weekly[wd.reward] : null;
      out.push(row(kid.name, kid.accent, pick ? esc(pick) : '<em>Perfect week, needs a pick</em>', 'Week of ' + shortDate(mon), tick(id, 'weeks/' + ymd(mon) + '/given', 'Given')));
    }
    for (let m = 0; m < 3; m++) {
      const first = new Date(today.getFullYear(), today.getMonth() - m, 1), key = ymd(first).slice(0, 7);
      const mons = []; let d = mondayOf(first); if (d < first) d = addDays(d, 7);
      while (d.getMonth() === first.getMonth()) { mons.push(d); d = addDays(d, 7); }
      const md = (data.months || {})[key] || {};
      if (!mons.every(perfect) || md.given) continue;
      const pick = md.prize != null ? ch.monthly[md.prize] : null;
      out.push(row(kid.name, kid.accent, (pick ? esc(pick) : '<em>Perfect month, needs a pick</em>'), first.toLocaleDateString('en-US', { month: 'long' }) + ' prize', tick(id, 'months/' + key + '/given', 'Given')));
    }
  });
  // Eli's time-trial prizes
  owed(D['eli-trials']).forEach((o) => out.push(row('Eli', KIDS.eli.accent, o.needsPick ? '<em>' + esc(o.what) + '</em>' : esc(o.what), 'Earned ' + shortDate(parseYmd(o.date)), tick('eli-trials', 'paid/' + o.key, 'Paid'))));
  // Isaiah's Ball Master prizes
  const iz = D.isaiah, cashed = iz.cashed || {}, start = (iz.start && parseYmd(iz.start)) || thisMon;
  for (let w = 0; w < 4; w++) {
    const full = [0, 1, 2, 3, 4, 5, 6].every((d) => L.touchedOn(iz, ymd(addDays(start, w * 7 + d))));
    const v = (iz.weekPrize || {})[w];
    if (full && !cashed['weekPrize_' + w]) out.push(row('Isaiah', KIDS.isaiah.accent, v != null ? esc(WEEKLY[v]) : '<em>Full week, needs a pick</em>', 'Ball Master week ' + (w + 1), tick('isaiah', 'cashed/weekPrize_' + w, 'Cashed in')));
  }
  if (iz.champion != null && !cashed.champion) out.push(row('Isaiah', KIDS.isaiah.accent, esc(CHAMPION[iz.champion]), 'Ball Master champion', tick('isaiah', 'cashed/champion', 'Cashed in')));
  LEVELS.forEach(([n, opts]) => {
    const got = (iz.juggle || {})[n];
    if (!got || cashed['juggle_' + n + '_prize']) return;
    out.push(row('Isaiah', KIDS.isaiah.accent, got.prize != null ? esc(opts[got.prize]) : '<em>Juggling level ' + n + ', needs a pick</em>', 'Juggled ' + n + ' in a row', got.prize != null ? tick('isaiah', 'cashed/juggle_' + n + '_prize', 'Cashed in') : ''));
  });
  return out;
}

