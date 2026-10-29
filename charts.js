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
    weekly: [
      '30 minutes of extra screen time',
      '$5 toward something from the Hy-Vee checkout line',
      'Skip one chore next week (parent’s pick of which)'
    ],
    monthly: [
      'New running gear up to $20 (socks, gloves, headband)',
      'Lunch out with Dad',
      '1 hour of extra video game time'
    ],
    note: '<b>Bonus run</b> on Friday is optional and doesn’t count against the reward. <b>No missing assignments</b> = checked on the school portal that day.'
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
      { key: 'duolingo', label: 'Duolingo', sub: '10 minutes a day', cells: [m('10 min'), m('10 min'), m('10 min'), m('10 min'), m('10 min'), m('10 min'), O] }
    ],
    weekly: [
      '30 minutes of extra screen time',
      '$5 toward something from the Hy-Vee checkout line',
      'Skip one chore next week (parent’s pick of which)'
    ],
    monthly: [
      'New racquetball gear up to $20 (balls, goggles, grip)',
      'Lunch out with Dad',
      '1 hour of extra video game time'
    ],
    note: '<b>Move your body</b> = 20 minutes of anything active: bike ride, shooting hoops, jump rope, a walk, a workout video. <b>Saturday racquetball</b> is optional and doesn’t count against the reward.'
  }
};

// Shared scoring so the home page and chart pages agree.
export function weekProgress(chart, weekData) {
  const checks = (weekData && weekData.checks) || {};
  let done = 0, need = 0;
  chart.rows.forEach((r) => r.cells.forEach((c, i) => {
    if (c === '-' || (c && c.opt)) return;
    need++;
    if (checks[r.key] && checks[r.key][i]) done++;
  }));
  return { done, need, perfect: need > 0 && done === need };
}
