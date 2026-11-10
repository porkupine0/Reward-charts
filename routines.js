// After-school + bedtime routines for each kid. dow: 0 = Mon … 6 = Sun.
export const KIDS = {
  eli: { name: 'Eli', accent: '#C2501C', chart: 'eli' },
  rhett: { name: 'Rhett', accent: '#1D6FB8', chart: 'trombone' },
  isaiah: { name: 'Isaiah', accent: '#1d6b38', chart: null }
};

// Chore rotation, Mon–Sun (0 = Mon). Each day is a list; every item gets its own checkbox.
// No room is done two days in a row; Tuesday jobs are fixed; Rhett & Isaiah do laundry Saturday.
const FAMILY_KITCHEN = 'Kitchen + dining room with the family';
const LAUNDRY = 'Laundry + clean your room (30 min)';
export const CHORES = {
  eli: [
    [FAMILY_KITCHEN, LAUNDRY], ['Living Room'], ['Sunroom'], ['Kitchen'], ['Dining/Front Room'], ['Vacuum/brush Scarlett'],
    ['Kitchen + dining room (all hands)']
  ],
  rhett: [
    [FAMILY_KITCHEN, 'Sunroom'], ['Bathrooms'], ['Dining/Front Room'], ['Living Room'], ['Kitchen'], [LAUNDRY],
    ['Kitchen + dining room (all hands)', 'Fold + put away clothes']
  ],
  isaiah: [
    [FAMILY_KITCHEN, 'Trash: empty every trash can in the house'], ['Front closet + shoe organizing'], ['Kitchen'], ['Stairs, landing + upstairs hallway'], ['Sunroom'], [LAUNDRY],
    ['Kitchen + dining room (all hands)', 'Fold + put away clothes']
  ]
};

export function choreItems(kid, dow) {
  return CHORES[kid][dow].map((label, i) => ({ key: i ? 'chore' + (i + 1) : 'chore', label: 'Chore: ' + label, chore: true }));
}

// Shower nights (never Wednesday, it's already a late night). Eli 5 nights (not Wed or Sun); Rhett and Isaiah 3x a week.
const SHOWER = { eli: [0, 1, 3, 4, 5], rhett: [6, 1, 3], isaiah: [0, 3, 5] };

export const AFTER_SNACKS = ['Banana', 'Yogurt', 'Cheese stick', 'Fruit'];
export const BED_SNACKS = ['Fruit', 'Cheese stick', 'Yogurt', 'Cottage cheese', 'Protein shake', 'Peanut butter'];

// Bedtime: steps in order with how many minutes each takes.
// Normal nights count backward from lights out; Wednesday (and Rhett's Thursday) count forward from getting home.
const t = (h, m) => h * 60 + m;
const MIN = { snack: 10, teeth: 5 };
// Shower length: Isaiah 35 min, Eli and Rhett 25. (OLD_SHOWER = the old 15 min, used to keep Thursday's start time.)
const SHOWER_MIN = { eli: 25, rhett: 25, isaiah: 35 };
const OLD_SHOWER = 15;
const ORDER = {
  young: ['snack', 'shower', 'teeth', 'vitamins', 'reading'],
  eli: ['snack', 'shower', 'vitamins', 'teeth', 'reading']
};
const LIGHTS = { eli: t(20, 30), rhett: t(20, 0), isaiah: t(20, 0) };
const HOME = { 2: { eli: t(20, 45), rhett: t(20, 45), isaiah: t(20, 15) }, 3: { rhett: t(20, 0) } };

function duration(key, kid, showers, short) {
  if (key === 'shower') return SHOWER_MIN[kid];
  if (key === 'vitamins') return kid === 'eli' && !short ? 10 : 5;
  if (key === 'reading') return short ? 10 : kid === 'eli' ? 30 : 15;
  return MIN[key];
}

function schedule(kid, dow) {
  const showers = SHOWER[kid].includes(dow);
  const home = HOME[dow] && HOME[dow][kid];
  let steps = ORDER[kid === 'eli' ? 'eli' : 'young'].filter((k) => k !== 'shower' || showers);
  // Isaiah showers first, before his snack.
  if (kid === 'isaiah' && showers) steps = ['shower'].concat(steps.filter((k) => k !== 'shower'));
  const rows = [];
  if (home == null && dow === 3 && showers) {
    // Thursday: keep the old start time (old 15-min shower, snack first) and push lights out later instead.
    const old = ORDER[kid === 'eli' ? 'eli' : 'young'];
    let at = LIGHTS[kid] - old.reduce((sum, k) => sum + (k === 'shower' ? OLD_SHOWER : duration(k, kid, showers, false)), 0);
    steps.forEach((k) => { rows.push([k, at]); at += duration(k, kid, showers, false); });
    rows.push(['lights', at]);
  } else if (home != null) {
    let at = home;
    steps.forEach((k) => { rows.push([k, at]); at += duration(k, kid, showers, dow === 2); });
    rows.push(['lights', at]);
  } else {
    let at = LIGHTS[kid];
    rows.unshift(['lights', at]);
    steps.slice().reverse().forEach((k) => { at -= duration(k, kid, showers, false); rows.unshift([k, at]); });
  }
  // Eli charges his watch every night, right before reading.
  if (kid === 'eli') { const r = rows.findIndex(([k]) => k === 'reading'); rows.splice(r, 0, ['watch', rows[r][1]]); }
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
    shower: 'Shower',
    teeth: 'Brush teeth + mouthwash',
    vitamins: kid === 'eli' ? 'Get water + take ALL vitamins' : 'Vitamins',
    reading: 'Reading',
    alarm: 'Set alarm for 6:25 am (show choir)',
    watch: 'Charge your watch',
    lights: 'Lights out'
  }[key];
}

export function bedtime(kid, dow) {
  const rows = schedule(kid, dow);
  // Fri/Sat: 30 min later; Rhett gets another 30 on top of Isaiah's
  const late = dow === 4 || dow === 5 ? (kid === 'rhett' ? 60 : 30) : 0;
  return rows.map(([key, min]) => ({
    key, time: fmtTime(min + late), min: min + late, label: bedLabel(key, kid, dow),
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

// Rhett's Duolingo: 10 min, Mon–Sat.
const DUO = { key: 'duolingo', label: 'Duolingo · 10 min', opt: true };

export function afterSchool(kid, dow, runPlan) {
  if (dow > 4) return [];
  const items = [
    kid === 'isaiah'
      ? { key: 'putaway', label: 'Shoes, backpack + jacket laid out together', sub: 'All in one spot, ready for the morning' }
      : { key: 'putaway', label: 'Backpack, shoes + jacket put away' },
    { key: 'afterSnack', label: 'After-school snack', choices: AFTER_SNACKS },
    kid === 'isaiah' ? CLOTHES : { key: 'clothes', label: 'Lay out clothes for tomorrow' },
    ...choreItems(kid, dow),
    { key: 'organize', label: 'Organize backpack', sub: 'Take out papers you don’t need' }
  ];
  if (kid !== 'isaiah') items.push({ key: 'due', label: 'Check assignments due', sub: 'Check your email too' });
  if (kid !== 'isaiah') items.push({ key: 'missing', label: 'Check missing assignments' });
  if (kid !== 'isaiah') items.push({ key: 'homework', label: 'Do homework' });
  if (kid === 'rhett') items.push(DUO);
  items.push({ weekly: true });
  if (kid === 'eli') {
    items.push({ key: 'activity', label: 'Running' + (runPlan ? ': ' + runPlan.title : ''), sub: dow === 4 ? 'Optional bonus run today' : 'Check it off on your Training page', link: 'run.html', opt: dow === 4 });
  } else if (kid === 'rhett') {
    items.push(dow === 3
      ? { key: 'activity', label: 'Racquetball tonight' }
      : { key: 'activity', label: 'Move your body · 20 min', sub: 'Bike, hoops, jump rope, a walk, a workout video', link: 'trombone.html' });
  } else {
    items.push({ key: 'activity', label: 'Soccer: 600 touches', sub: 'Tap your balls on Ball Master', link: 'isaiah.html' });
  }
  return items;
}

// Isaiah lays out each piece of tomorrow's clothes by his bed; the box checks itself when all four are out.
const CLOTHES = { key: 'clothes', label: 'Lay out clothes by your bed', sub: 'Tap each one as it goes by your bed', parts: ['Shirt', 'Pants', 'Underwear', 'Socks'] };

// Weekend daytime list (Sat chore; Isaiah's weekly work).
export function weekend(kid, dow) {
  const items = [];
  if (dow === 6) items.push(kid === 'isaiah'
    ? Object.assign({}, CLOTHES, { key: 'weather', sub: 'Check the weather first · tap each one as it goes by your bed' })
    : { key: 'weather', label: 'Check weather & lay out appropriate clothes', sub: 'For school tomorrow' });
  items.push(...choreItems(kid, dow));
  if (dow === 5 && kid === 'rhett') items.push(DUO);
  items.push({ weekly: true });
  return items;
}

// Scheduled lights-out (minutes after midnight) for a kid on a night.
export function lightsOut(kid, dow) {
  const b = bedtime(kid, dow);
  return b[b.length - 1].min;
}

// Bedtime timer result for one night: { secs, onTime, steps } or null.
export const GRACE_MIN = 5;
export const STATUS_LABEL = { ontime: 'On time', grace: 'Grace', approved: 'Parent OK', late: 'Late' };

export function timerResult(kid, dateObj, rec, checks) {
  if (!rec || !rec.start || !rec.end) return null;
  const dow = (dateObj.getDay() + 6) % 7;
  const lo = lightsOut(kid, dow);
  const end = new Date(rec.end);
  // minutes after midnight of the checklist date (past midnight counts as late)
  // by the clock, so daylight-saving nights work; each day past the checklist date adds 24h
  const dayGap = Math.round((new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12) - new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 12)) / 86400000);
  const endMin = dayGap * 1440 + end.getHours() * 60 + end.getMinutes();
  const steps = bedtime(kid, dow);
  const done = steps.filter((s) => checks && checks[s.key]).length;
  // Up to 5 minutes past lights out still counts (grace); beyond that only with a parent's OK.
  const lateBy = endMin - lo;
  const status = lateBy <= 0 ? 'ontime' : lateBy <= GRACE_MIN ? 'grace' : checks && checks.bedOk ? 'approved' : 'late';
  return { secs: Math.max(0, Math.round((rec.end - rec.start) / 1000)), onTime: status !== 'late', status, lateBy, endMin, lo, done, total: steps.length };
}

// Daily treat for finishing the whole morning checklist, handed out later that day.
export const MORNING_REWARD = { isaiah: 'a piece of candy' };
// When the treat is handed out, by day (Mon = 0). Saturday's morning is optional, so no treat.
export function rewardWhen(dow) {
  if (dow <= 4) return 'after school';
  if (dow === 6) return 'after church';
  return null;
}

// Isaiah's morning checklists: school days (Mon–Fri), an optional Saturday, and Sunday church mornings.
export function morning(kid, dow) {
  if (kid !== 'isaiah') return [];
  const breakfast = { key: 'mBreakfast', label: 'Eat breakfast', choices: ['Cereal', 'English muffin'] };
  if (dow === 5) {
    return [
      { key: 'mWake', label: 'Wake up' },
      { key: 'mDress', label: 'Get dressed' },
      { key: 'mScarlett', label: 'Let Scarlett out' },
      breakfast
    ];
  }
  const church = dow === 6;
  return [
    { key: 'mWake', label: 'Wake up' },
    { key: 'mDress', label: church ? 'Get dressed for church' : 'Get dressed' },
    { key: 'mScarlett', label: 'Let Scarlett out' },
    breakfast,
    { key: 'mShoes', label: church ? 'Put on shoes + jacket' : 'Put on shoes, jacket + backpack' },
    { key: 'mDoor', label: 'Out the door on time with no meltdown', sub: 'Stayed calm even when we were in a hurry' },
    { key: 'mHigh5', label: 'High five Mom', sub: 'Records the time you’re all ready' }
  ];
}
