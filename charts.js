import { planFor, planEndYmd } from './plan.js?v=1795007993';
import { SETTINGS } from './settings.js?v=1795007993';
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
    // Weekend game time: minutes per full school day from Settings (see lists.js GAME)
    gameTime: true,
    gameOnly: true, // game time replaces the perfect-week reward
    kidId: 'eli',
    get weekly() { return SETTINGS.rewards[this.id].weekly; },
    get monthly() { return SETTINGS.rewards[this.id].monthly; },
    get note() { return '<b>Game time:</b> each school day with his whole checklist done (after school and bedtime) and both evening checks = ' + gameText() + ', to use on the weekend. <b>Run or swim</b>: swim Monday, Thursday and Friday, run Tuesday, Wednesday and Saturday; each box fills when that day’s Training page is done (or Mom or Dad excused it). <b>Kind to brothers</b> and <b>Listened</b> are marked by Mom or Dad at the end of the day. Every box comes from his checklist: tap one to open that day.'; }
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
    // From the week of Nov 16, 2026: every box comes from his checklist, plus the evening checks and game time.
    altFrom: '2026-11-16',
    altRows: [
      { key: 'move', label: 'Move Your Body', sub: '20 min · racquetball Thursday', cells: [m('20 min'), m('20 min'), m('20 min'), m('Racq'), m('20 min'), m('20 min'), O] },
      { key: 'chores', label: 'Chores', sub: 'All chores completed', cells: [X, X, X, X, X, X, X] },
      { key: 'typing', label: 'Typing', sub: 'Typing practice', cells: [X, X, X, X, X, X, X] },
      { key: 'trombone', label: 'Trombone', sub: 'Practice on the timer', cells: [O, O, O, O, m('20 min'), m('30 min'), m('30 min')] },
      { key: 'duolingo', label: 'Duolingo', sub: 'Optional · 10 min', cells: [opt('10 min'), opt('10 min'), opt('10 min'), opt('10 min'), opt('10 min'), opt('10 min'), O] },
      { key: 'noYell', label: 'No yelling', sub: 'At Mom and Dad', parent: true, cells: [X, X, X, X, X, X, X] },
      { key: 'firstTime', label: 'Listened', sub: 'The first time', parent: true, cells: [X, X, X, X, X, X, X] },
      { key: 'noLies', label: 'No lies', sub: 'All day', parent: true, cells: [X, X, X, X, X, X, X] }
    ],
    gameTime: true,
    kidId: 'rhett',
    get weekly() { return SETTINGS.rewards[this.id].weekly; },
    get monthly() { return SETTINGS.rewards[this.id].monthly; },
    get note() { return '<b>Game time:</b> each school day with his whole checklist done (after school and bedtime) and all three evening checks = ' + gameText() + ', to use on the weekend. <b>Move your body</b> = 20 minutes of anything active: bike ride, shooting hoops, jump rope, a walk, a workout video. <b>Saturday racquetball</b> is optional and doesn’t count against the reward. From Nov 16 every box comes from his checklist: tap one to open that day.'; }
  },
  zay: {
    id: 'zay',
    kid: 'Isaiah',
    kidId: 'isaiah',
    eyebrow: "Isaiah's weekly goals",
    accent: '#1d6b38',
    rows: [
      { key: 'soccer', label: 'Soccer', sub: '600 touches', cells: [m('600'), m('600'), m('600'), m('600'), m('600'), O, O] },
      { key: 'chores', label: 'Chores', sub: 'All chores completed', cells: [X, X, X, X, X, X, X] },
      { key: 'noYell', label: 'No yelling', sub: 'At Mom and Dad', parent: true, cells: [X, X, X, X, X, X, X] },
      { key: 'firstTime', label: 'Listened', sub: 'The first time', parent: true, cells: [X, X, X, X, X, X, X] },
      { key: 'noLies', label: 'No lies', sub: 'All day', parent: true, cells: [X, X, X, X, X, X, X] }
    ],
    gameTime: true,
    gameOnly: true,
    weekly: [],
    monthly: [],
    get note() { return '<b>Game time:</b> each school day with his whole checklist done (after school and bedtime) and all three evening checks = ' + gameText() + ', to use on the weekend. <b>Soccer</b> fills from Ball Master (or when Mom or Dad excused it). The three evening checks are marked by Mom or Dad. Every box comes from his checklist: tap one to open that day.'; }
  }
};
// "30 minutes" from the current setting (the week's total is on the game-time card, from that week's own days)
function gameText() { return SETTINGS.game + ' minutes'; }
// Every box on a chart from this week on comes from the checklist (no hand ticks).
export const TIED_FROM = '2026-11-16';

// Shared scoring so the home page and chart pages agree.
// The rows a chart uses for the week starting on this Monday (a chart can change from a date on).
const ymdOf = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
// Evening-check rows use the wording from Settings (the same words as the checklist and Tonight).
const worded = (chart, rows) => rows.map((r) => {
  const w = r.parent && ((SETTINGS.checks || {})[chart.kidId] || {})[r.key];
  return w ? Object.assign({}, r, { label: w.label, sub: '' }) : r; // the label only: chart rows stay short
});
export function rowsFor(chart, monday) { return worded(chart, baseRows(chart, monday)); }
function baseRows(chart, monday) {
  if (!chart.altFrom || !monday) return chart.rows;
  if (ymdOf(monday) < chart.altFrom) return chart.rows;
  if (chart.id !== 'eli') return chart.altRows;
  // Eli's run/swim boxes follow his plan, day by day: an optional plan day is an optional box,
  // and after the plan ends the box is off (there's nothing on his checklist behind it).
  const end = planEndYmd();
  return chart.altRows.map((r) => r.key !== 'running' ? r : Object.assign({}, r, {
    cells: r.cells.map((c, i) => {
      if (c === O) return c;
      const day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      if (ymdOf(day) >= end) return O;
      const p = planFor(day);
      if (!p) return c;
      const t = p.title === 'Off' ? 'Off' : p.swim ? 'Swim' : 'Run'; // the label follows the plan day
      return p.optional ? opt(t) : m(t);
    })
  }));
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
