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

// Shower nights. Eli every night; Rhett and Isaiah alternate.
const SHOWER = { eli: [0, 1, 2, 3, 4, 5, 6], rhett: [6, 1, 3], isaiah: [0, 2, 5] };

export const AFTER_SNACKS = ['Banana', 'Yogurt', 'Cheese stick', 'Fruit'];
export const BED_SNACKS = ['Fruit', 'Cheese stick', 'Yogurt', 'Cottage cheese', 'Protein shake', 'Peanut butter'];

// Bedtime times by kid and night type. Each row: [key, time, label]
const t = (h, m) => h * 60 + m;
const BED = {
  young: [['snack', t(19, 5)], ['shower', t(19, 15)], ['teeth', t(19, 30)], ['vitamins', t(19, 40)], ['reading', t(19, 45)], ['lights', t(20, 0)]],
  eli:   [['snack', t(19, 20)], ['shower', t(19, 30)], ['vitamins', t(19, 45)], ['teeth', t(19, 55)], ['reading', t(20, 0)], ['alarm', t(20, 25)], ['lights', t(20, 30)]],
  // Wednesday: youth group / Awana, no reading
  wedIsaiah: [['snack', t(20, 15)], ['shower', t(20, 25)], ['teeth', t(20, 40)], ['vitamins', t(20, 45)], ['lights', t(20, 50)]],
  wedRhett:  [['snack', t(20, 45)], ['shower', t(20, 55)], ['teeth', t(21, 0)], ['vitamins', t(21, 5)], ['lights', t(21, 10)]],
  wedEli:    [['snack', t(20, 45)], ['shower', t(20, 55)], ['vitamins', t(21, 10)], ['teeth', t(21, 15)], ['lights', t(21, 20)]],
  // Thursday: Rhett home from racquetball by 8
  thuRhett:  [['snack', t(20, 0)], ['shower', t(20, 10)], ['teeth', t(20, 25)], ['vitamins', t(20, 30)], ['reading', t(20, 35)], ['lights', t(20, 45)]]
};

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
  let rows;
  if (dow === 2) rows = BED[{ eli: 'wedEli', rhett: 'wedRhett', isaiah: 'wedIsaiah' }[kid]];
  else if (dow === 3 && kid === 'rhett') rows = BED.thuRhett;
  else rows = kid === 'eli' ? BED.eli : BED.young;
  // show choir alarm: Monday and Thursday nights only
  rows = rows.filter(([k]) => k !== 'alarm' || dow === 0 || dow === 3);
  const late = dow === 4 || dow === 5 ? 30 : 0; // Fri/Sat
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
  if (dow === 4 || dow === 5) n.push('No school tomorrow · bedtime 30 min later');
  return n;
}

// Isaiah's weekly AELP + Awana: due Fri–Sun, carries into the week until done.
export const WEEKLY = { isaiah: [{ key: 'aelp', label: 'AELP (once this week)' }, { key: 'awana', label: 'Awana (once this week)' }] };

export function afterSchool(kid, dow, runPlan) {
  if (dow > 4) return [];
  const items = [
    { key: 'putaway', label: 'Backpack, shoes + jacket put away' },
    { key: 'snack', label: 'After-school snack', choices: AFTER_SNACKS },
    { key: 'organize', label: 'Organize backpack', sub: 'Take out papers you don’t need' },
    { key: 'due', label: 'Check assignments due' },
    { key: 'missing', label: 'Check missing assignments' }
  ];
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
