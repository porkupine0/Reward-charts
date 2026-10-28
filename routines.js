// After-school + bedtime routines for each kid. dow: 0 = Mon … 6 = Sun.
export const KIDS = {
  eli: { name: 'Eli', accent: '#C2501C', chart: 'eli' },
  rhett: { name: 'Rhett', accent: '#1D6FB8', chart: 'trombone' },
  isaiah: { name: 'Isaiah', accent: '#1d6b38', chart: null }
};

// Chore rotation, Mon–Sat. Sunroom and bathrooms land every other day; Rhett and Isaiah share laundry Saturday.
export const CHORES = {
  eli:    ['Dining/Front Room', 'Living Room', 'Sunroom', 'Laundry', 'Kitchen', 'Bathrooms'],
  rhett:  ['Kitchen', 'Bathrooms', 'Living Room', 'Dining/Front Room', 'Sunroom', 'Laundry'],
  isaiah: ['Sunroom', 'Dining/Front Room', 'Kitchen', 'Bathrooms', 'Living Room', 'Laundry']
};

// Shower nights (never Wednesday, it's already a late night). Eli 5 nights (not Wed or Sun); Rhett and Isaiah 3x a week.
const SHOWER = { eli: [0, 1, 3, 4, 5], rhett: [6, 1, 3], isaiah: [0, 3, 5] };

export const AFTER_SNACKS = ['Banana', 'Yogurt', 'Cheese stick', 'Fruit'];
export const BED_SNACKS = ['Fruit', 'Cheese stick', 'Yogurt', 'Cottage cheese', 'Protein shake', 'Peanut butter'];

// Bedtime: steps in order with how many minutes each takes.
// Normal nights count backward from lights out; Wednesday (and Rhett's Thursday) count forward from getting home.
const t = (h, m) => h * 60 + m;
const MIN = { snack: 10, shower: 15, pjs: 5, teeth: 5 };
const ORDER = {
  young: ['snack', 'shower', 'teeth', 'vitamins', 'reading'],
  eli: ['snack', 'shower', 'vitamins', 'teeth', 'reading']
};
const LIGHTS = { eli: t(20, 30), rhett: t(20, 0), isaiah: t(20, 0) };
const HOME = { 2: { eli: t(20, 45), rhett: t(20, 45), isaiah: t(20, 15) }, 3: { rhett: t(20, 0) } };

function duration(key, kid, showers, short) {
  if (key === 'shower') return showers ? MIN.shower : MIN.pjs;
  if (key === 'vitamins') return kid === 'eli' && !short ? 10 : 5;
  if (key === 'reading') return short ? 10 : kid === 'eli' ? 30 : 15;
  return MIN[key];
}

function schedule(kid, dow) {
  const showers = SHOWER[kid].includes(dow);
  const home = HOME[dow] && HOME[dow][kid];
  let steps = ORDER[kid === 'eli' ? 'eli' : 'young'].slice();
  const rows = [];
  if (home != null) {
    let at = home;
    steps.forEach((k) => { rows.push([k, at]); at += duration(k, kid, showers, dow === 2); });
    rows.push(['lights', at]);
  } else {
    let at = LIGHTS[kid];
    rows.unshift(['lights', at]);
    steps.slice().reverse().forEach((k) => { at -= duration(k, kid, showers, false); rows.unshift([k, at]); });
  }
  // Show choir alarm: Monday and Thursday nights, 5 min before lights out.
  if (kid === 'eli' && (dow === 0 || dow === 3)) rows.splice(rows.length - 1, 0, ['alarm', rows[rows.length - 1][1] - 5]);
  return rows;
}

export function fmtTime(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return ((h + 11) % 12 + 1) + ':' + String(m).padStart(2, '0');
}

function bedLabel(key, kid, dow) {
  const showers = SHOWER[kid].includes(dow);
  return {
    snack: 'Bedtime snack',
    shower: showers ? 'Shower + pajamas' : 'Pajamas on',
    teeth: 'Brush teeth + mouthwash',
    vitamins: kid === 'eli' ? 'Get water + take vitamins' : 'Vitamins',
    reading: 'Reading',
    alarm: 'Set alarm for 6:25 am (show choir)',
    lights: 'Lights out'
  }[key];
}

export function bedtime(kid, dow) {
  const rows = schedule(kid, dow);
  // Fri/Sat: 30 min later; Rhett gets another 30 on top of Isaiah's
  const late = dow === 4 || dow === 5 ? (kid === 'rhett' ? 60 : 30) : 0;
  return rows.map(([key, min]) => ({
    key, time: fmtTime(min + late), label: bedLabel(key, kid, dow),
    choices: key === 'snack' ? BED_SNACKS : null,
    hot: key === 'shower' && kid !== 'eli' && SHOWER[kid].includes(dow)
  }));
}

export function notes(kid, dow) {
  const n = [];
  if (dow === 6 || dow === 0) n.push('Family dinner tonight');
  if (dow === 2) n.push(kid === 'isaiah' ? 'Awana tonight · home about 8:15' : 'Youth group tonight · home about 8:45');
  if (dow === 3 && kid === 'rhett') n.push('Racquetball tonight · home by 8');
  if (kid === 'eli' && (dow === 0 || dow === 3)) n.push('Show choir in the morning · alarm 6:25');
  if (dow === 4 || dow === 5) n.push('No school tomorrow · bedtime ' + (kid === 'rhett' ? '1 hour' : '30 min') + ' later');
  return n;
}

// Isaiah's weekly AELP + Awana. Each runs on its own week (AELP Thu–Wed, Awana Wed–Tue),
// shows from the day after he gets it, is meant for Fri–Sun, and stays on as "late" until done.
export const WEEKLY = {
  isaiah: [
    { key: 'aelp', label: 'AELP (once this week)', start: 3, show: [3, 4, 5, 6], late: [0, 1, 2], lateNote: 'Not done yet. Finish it by Wednesday.' },
    { key: 'awana', label: 'Awana (once this week)', start: 2, show: [3, 4, 5, 6], late: [0, 1], lateNote: 'Not done yet. Finish it before Awana Wednesday.' }
  ]
};

export function afterSchool(kid, dow, runPlan) {
  if (dow > 4) return [];
  const items = [
    { key: 'putaway', label: 'Backpack, shoes + jacket put away' },
    { key: 'snack', label: 'After-school snack', choices: AFTER_SNACKS },
    { key: 'organize', label: 'Organize backpack', sub: 'Take out papers you don’t need' },
    kid === 'isaiah' ? { key: 'due', label: 'Check for homework' } : { key: 'due', label: 'Check assignments due', sub: 'Check your email too' }
  ];
  if (kid !== 'isaiah') items.push({ key: 'missing', label: 'Check missing assignments' });
  if (kid !== 'isaiah') items.push({ key: 'homework', label: 'Do homework' });
  items.push({ weekly: true });
  items.push({ key: 'chore', label: 'Chore: ' + CHORES[kid][dow] });
  if (kid === 'eli') {
    items.push({ key: 'activity', label: 'Running' + (runPlan ? ': ' + runPlan.title : ''), sub: dow === 4 ? 'Optional bonus run today' : 'Check it off on your Training page', link: 'run.html', opt: dow === 4 });
  } else if (kid === 'rhett') {
    items.push(dow === 3
      ? { key: 'activity', label: 'Racquetball tonight' }
      : { key: 'activity', label: 'Move your body · 20 min', sub: 'Bike, hoops, jump rope, a walk, a workout video', link: 'trombone.html' });
  } else {
    items.push({ key: 'activity', label: 'Soccer: 600 touches', sub: 'Tap your balls on Ball Master', link: 'isaiah.html' });
  }
  items.push({ key: 'clothes', label: 'Lay out clothes for tomorrow' });
  return items;
}

// Weekend daytime list (Sat chore; Isaiah's weekly work).
export function weekend(kid, dow) {
  const items = [];
  if (dow === 5) items.push({ key: 'chore', label: 'Chore: ' + CHORES[kid][5] });
  items.push({ weekly: true });
  return items;
}
