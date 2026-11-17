import { SETTINGS } from './settings.js?v=1794956282';
// The weekly charts. Cell codes: 'x' = required box, '-' = off day,
// {t:'20 min'} = required box with a label, {t:'Bonus', opt:true} = optional.
const X = 'x', O = '-';
const m = (t) => ({ t });
const opt = (t) => ({ t, opt: true });

export const CHARTS = {
  eli: {
    id: 'eli',
    kid: 'Eli',
    eyebrow: "Eli's weekly goals",
    accent: '#C2501C',
    rows: [
      { key: 'running', label: 'Running', sub: 'Plan workout + core', cells: [X, X, X, X, opt('Bonus'), X, O] },
      { key: 'chores', label: 'Chores', sub: 'All chores completed', cells: [X, X, X, X, X, X, X] },
      { key: 'school', label: 'School', sub: 'No missing assignments', cells: [X, X, X, X, X, O, O] }
    ],
    // From the week of Nov 16, 2026: swim practice Mon/Thu/Fri and runs Tue/Wed/Sat share one row.
    altFrom: '2026-11-16',
    altRows: [
      { key: 'running', label: 'Run or swim', sub: 'Swim Mon, Thu, Fri · Run Tue, Wed, Sat', cells: [m('Swim'), m('Run'), m('Run'), m('Swim'), m('Swim'), m('Run'), O] },
      { key: 'chores', label: 'Chores', sub: 'All chores completed', cells: [X, X, X, X, X, X, X] },
      { key: 'school', label: 'School', sub: 'No missing assignments', cells: [X, X, X, X, X, O, O] },
      { key: 'kind', label: 'Kind to brothers', sub: 'No hurting, in actions or words', parent: true, cells: [X, X, X, X, X, X, X] },
      { key: 'listen', label: 'Listened', sub: 'To Mom and Dad, no arguing', parent: true, cells: [X, X, X, X, X, X, X] }
    ],
    // Weekend game time: 30 min for each full school day (see lists.js GAME), up to 2.5 hours
    gameTime: true,
    get weekly() { return SETTINGS.rewards[this.id].weekly; },
    get monthly() { return SETTINGS.rewards[this.id].monthly; },
    note: '<b>Game time:</b> each school day with his whole checklist done (after school and bedtime) and both evening checks = 30 minutes, up to 2.5 hours for the weekend. <b>Run or swim</b>: swim Monday, Thursday and Friday, run Tuesday, Wednesday and Saturday; each box fills when that day’s Training page is done. <b>Kind to brothers</b> and <b>Listened</b> are marked by Mom or Dad at the end of the day.'
  },
  trombone: {
    id: 'trombone',
    kid: 'Rhett',
    eyebrow: "Rhett's weekly goals",
    accent: '#1D6FB8',
    rows: [
      { key: 'move', label: 'Move Your Body', sub: '20 minutes active', cells: [m('20 min'), m('20 min'), m('20 min'), O, m('20 min'), m('20 min'), O] },
      { key: 'racquetball', label: 'Racquetball', sub: 'Thursday night + optional Sat', cells: [O, O, O, m('Night'), O, opt('Opt.'), O] },
      { key: 'chores', label: 'Chores', sub: 'Checklist done', cells: [X, X, X, X, X, X, O] },
      { key: 'trombone', label: 'Trombone', sub: 'Practice on the timer', cells: [O, O, O, O, m('20 min'), m('30 min'), m('30 min')] },
      { key: 'duolingo', label: 'Duolingo', sub: 'Optional · 10 min', cells: [opt('10 min'), opt('10 min'), opt('10 min'), opt('10 min'), opt('10 min'), opt('10 min'), O] }
    ],
    get weekly() { return SETTINGS.rewards[this.id].weekly; },
    get monthly() { return SETTINGS.rewards[this.id].monthly; },
    note: '<b>Move your body</b> = 20 minutes of anything active: bike ride, shooting hoops, jump rope, a walk, a workout video. <b>Saturday racquetball</b> is optional and doesn’t count against the reward.'
  }
};

// Shared scoring so the home page and chart pages agree.
// The rows a chart uses for the week starting on this Monday (a chart can change from a date on).
export function rowsFor(chart, monday) {
  if (!chart.altFrom || !monday) return chart.rows;
  const p = (n) => String(n).padStart(2, '0');
  const k = monday.getFullYear() + '-' + p(monday.getMonth() + 1) + '-' + p(monday.getDate());
  return k >= chart.altFrom ? chart.altRows : chart.rows;
}

export function weekProgress(chart, weekData) {
  const checks = (weekData && weekData.checks) || {};
  let done = 0, need = 0;
  rowsFor(chart, weekData && weekData.monday).forEach((r) => r.cells.forEach((c, i) => {
    if (c === '-' || (c && c.opt)) return;
    need++;
    if (checks[r.key] && checks[r.key][i]) done++;
  }));
  return { done, need, perfect: need > 0 && done === need };
}
