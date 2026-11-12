// Eli's 13-week off-season plan (starts Mon Oct 26, 2026). Text is straight from the plan.
export const PLAN_START = '2026-10-26';

const SAT = 'Cross-training: class with Mom, or 25 min easy + 4 strides + Core B (optional)';
const SUN = 'Rest';

// ---- Weeks 4–13: re-set Nov 12, 2026 to a 24:30 5K (VDOT 39.2) after an independent coach review ----
// Each day: { title, s (what to do), in (indoor), out (outdoor), strides, plyo, strA, strB, core, opt, trial, tag }
const EZ = (m) => ({ in: 'Treadmill ' + m + "' at 5.7–6.0 mph", out: m + "' easy, conversational" });
const easy = (m, extra = {}) => Object.assign({ title: 'Easy run', s: m + "' easy" + (extra.strides ? ' + ' + extra.strides + ' strides' : '') }, EZ(m),
  extra.strides ? { in: 'Treadmill ' + m + "' at 5.7–6.0 mph, then " + extra.strides + ' strides at 9.0–9.5', out: m + "' easy + " + extra.strides + '×15 sec strides on dry, flat pavement (skip the strides if icy)' } : {}, extra);
const longRun = (m, extra = {}) => Object.assign({ title: 'Long run', s: m + "' easy" }, EZ(m), extra);
const longSteady = (m, extra = {}) => Object.assign({ title: 'Long run', s: (m - 10) + "' easy, then 10' steady",
  in: 'Treadmill ' + (m - 10) + "' at 5.7–6.0 mph, then 10' steady at 6.5–6.7", out: (m - 10) + "' easy, then 10' steady (short sentences)" }, extra);
const thr = (reps, rest, extra = {}) => Object.assign({ title: 'Threshold', s: "10' easy, " + reps + ' threshold' + (rest ? ' (' + rest + ' jog)' : '') + ", 10' easy",
  in: "Treadmill 10' at 5.8, " + reps + ' at 7.1–7.2 mph' + (rest ? ' with ' + rest + ' at 5.6' : '') + ", 10' at 5.8",
  out: "10' easy, " + reps + ' comfortably hard (8:20–8:30/mile on a flat route, or by effort: a few words)' + (rest ? ' with ' + rest + ' jog' : '') + ", 10' easy" }, extra);
const mileTrial = (block, extra = {}) => Object.assign({ title: '1-mile time trial', trial: 'mile',
  s: "15' easy + drills + 4 strides, 1 mile all-out, 8–10' easy jog/walk, then " + block + " threshold, 10' easy",
  in: 'Gym track: even pace, start at 7:10 pace (1:47–1:48 per 400, 54 per 200), race the last 400. Threshold reps at 2:04–2:06 per 400. Treadmill backup: mile from 8.4 mph, up 0.1–0.2 each quarter if you can; reps at 7.1–7.2 (log it as treadmill).',
  out: 'Only on a clear, dry 400 m track or a measured flat path; threshold by effort. Snow, ice or wind chill under about 15°F: go inside.',
  strB: 'jumps optional', core: 'B' }, extra);
const fiveTrial = (extra = {}) => Object.assign({ title: '5K time trial', trial: '5k',
  s: "15' easy + drills + 4 strides, 5K all-out with lap splits, 5' walk/jog, 4 relaxed strides (optional), 10' easy",
  in: 'Gym track: first 2 km at 24:15 pace (1:56–1:57 per 400), then push. Treadmill backup: start 7.6 mph, from 3 km up 0.1 each km if you can (log it as treadmill).',
  out: 'A road race or a clear track. Warm up 20 minutes in the cold; layers, gloves and a hat.',
  strB: '2 sets of lifts, no jumps (or Home Strength on Friday)', core: 'B' }, extra);
const rFart = (extra = {}) => Object.assign({ title: 'Fast reps', s: "12' easy, 6×30 sec fast and relaxed, 10' easy",
  in: "Gym track: 6×200 in 53 sec, 200 m walk/jog. Treadmill: 6×30 sec at 8.4–8.5 mph with 90 sec walking at 3.5–4.0.",
  out: '6×30 sec fast and relaxed on a dry, flat path, 90 sec walk (skip the fast parts if icy)' }, extra);
const iWork = (spec, extra = {}) => Object.assign({ title: 'Intervals', s: "15' easy + 4 strides, " + spec.s + ", 10' easy", in: spec.in, out: spec.out }, extra);
const bonus = (m) => Object.assign({ title: 'Bonus run', opt: true, core: 'A', s: m + "' easy" }, EZ(m));

const NEW_WEEKS = [
  ['Nov 16–22', 'Build + mile time trial', 17, [
    thr("3×6'", "1'", { core: 'A' }),
    longRun(45, { plyo: 2, strA: true, core: 'B' }),
    easy(25, { strides: 4, core: 'A' }),
    mileTrial("2×5' (2' jog)", { tag: 'Gym', note: 'Diagnostic' }),
    bonus(25)]],
  ['Nov 23–29', 'Build + 5K time trial (Thanksgiving)', 18, [
    thr("4×5'", "1'", { core: 'A' }),
    longRun(50, { plyo: 2, strA: true, core: 'B' }),
    easy(25, { strides: 4, core: 'A' }),
    fiveTrial({ tag: 'Thanksgiving', strB: false, in: 'Backup: treadmill 5K from 7.6 mph, up 0.1 each km from 3 km (log it as treadmill). Gym closed and no race? Run 30–40 minutes easy and move the 5K to Week 10.', out: 'Turkey Trot: 15–20 min easy warm-up, race it, 10 min easy cool-down. Layers, gloves and a hat.' }),
    Object.assign(bonus(20), { home: 'in place of Strength B this week' })]],
  ['Nov 30–Dec 6', 'Down week', 14, [
    easy(30, { strides: 6, core: 'A' }),
    easy(30, { strA: '2 sets', core: 'B' }),
    longRun(40, { core: 'A' }),
    rFart({ tag: 'Gym', strB: '2 sets of lifts, no jumps', core: 'B' }),
    bonus(20)]],
  ['Dec 7–13', 'Build + mile time trial', 19, [
    thr("3×7'", "90 sec", { core: 'A' }),
    longRun(55, { plyo: 2, strA: true, core: 'B' }),
    easy(30, { strides: 4, core: 'A' }),
    mileTrial("2×6' (2' jog)", { tag: 'Gym' }),
    bonus(25)]],
  ['Dec 14–20', 'Build', 19, [
    thr("2×10'", "2'", { core: 'A' }),
    easy(35, { strides: 6, plyo: 2, strA: true, core: 'B' }),
    longSteady(60, { core: 'A' }),
    iWork({ s: '6×400 at interval pace', in: 'Gym track: 6×400 in 1:52–1:54, 200 m jog (about 90 sec). Treadmill: 6×2 min at 7.9–8.0 mph with 90 sec at 5.5.', out: '6×2 min hard (effort 8 of 10) with 90 sec jog on a flat, clear route' }, { tag: 'Gym', strB: true, core: 'B' }),
    bonus(25)]],
  ['Dec 21–27', 'Down week (Christmas)', 14, [
    easy(30, { strides: 6, core: 'A' }),
    easy(30, { strA: '2 sets', core: 'B' }),
    rFart({ s: "15' easy, 6×30 sec fast and relaxed, 10' easy", core: 'A' }),
    Object.assign(longRun(40, { core: 'B' }), { title: 'Easy run', tag: 'Christmas Eve' }),
    { title: 'Off', tag: 'Christmas', off: true, s: 'Merry Christmas!' }]],
  ['Dec 28–Jan 3', 'Build + 5K time trial', 20, [
    thr("3×8'", "90 sec", { core: 'A' }),
    longRun(60, { plyo: 2, strA: true, core: 'B' }),
    easy(30, { strides: 4, core: 'A' }),
    fiveTrial({ tag: 'Gym', note: 'New Year’s Eve: if the gym is closed, swap with Wednesday or run it on the treadmill' }),
    Object.assign(bonus(25), { tag: 'New Year’s Day', home: 'if you skipped Strength B Thursday' })]],
  ['Jan 4–10', 'Peak build', 20.5, [
    thr("20' continuous", '', { core: 'A' }),
    easy(40, { strides: 6, plyo: 3, strA: true, core: 'B' }),
    longSteady(65, { core: 'A' }),
    iWork({ s: '4×800 at interval pace', in: 'Gym track: 4×800 in 3:44–3:49, 400 m jog (about 3 min). Treadmill: 4×3:45 at 7.9–8.0 mph with 3 min at 5.5.', out: '4×4 min hard (effort 8 of 10) with 3 min jog' }, { tag: 'Gym', strB: true, core: 'B' }),
    bonus(25)]],
  ['Jan 11–17', 'Peak + mile time trial', 21, [
    thr("2×12'", "2'", { core: 'A' }),
    longRun(65, { plyo: 2, strA: true, core: 'B' }),
    easy(30, { strides: 4, core: 'A' }),
    mileTrial("3×5' (90 sec jog)", { tag: 'Gym' }),
    bonus(25)]],
  ['Jan 18–24', 'Down week + final 5K time trial', 15, [
    easy(30, { strides: 6, core: 'A' }),
    easy(25, { strides: 4, strA: '2 sets, light', core: 'B' }),
    { title: 'Sharpener', s: "20' easy with 4×30 sec at interval pace", in: "Treadmill: 20' easy with 4×30 sec at 7.9–8.0 mph, 90 sec easy between. Gym track: 4×200 in 56–57 sec.", out: '20 min easy with 4×30 sec quick (by effort)', core: 'A' },
    fiveTrial({ tag: 'Gym', note: 'Final test: take a split at 2 miles and compare it with his 14:08', strB: false }),
    Object.assign(bonus(20), { title: 'Off, or easy run' })]]
];

// Each week: [label, focus, miles, Mon, Tue, Wed, Thu, Fri, (Sat), (Sun)]
const W = [
  ['Oct 26–Nov 1', 'Re-entry', 12,
    '25 min easy + 4 strides + Core A',
    '30 min easy + 4 strides + Plyometrics (1 set) + Strength A + Core B',
    'Fartlek: 10 min easy, 6 × 30 sec at 9.0 mph / 90 sec easy, 10 min easy + Core A',
    'Gym: 40 min easy run + Strength B (light, learning the moves) + Core B',
    'Optional: 20 min easy + Core A'],
  ['Nov 2–8', 'Build', 16,
    'Tempo: 10 easy, 3 × 5 min at 7.8 mph with 2 min easy, 10 easy + Core A',
    '30 min easy + 6 strides + Plyometrics (1 set) + Strength A + Core B',
    'Intervals: 10 easy, 8 × 1 min at 8.7 mph / 1 min easy, 10 easy + Core A',
    'Gym: 45 min easy run + Strength B + Core B',
    'Optional: 20 min easy + Core A'],
  ['Nov 9–15', 'Build + first 5K time trial', 18,
    'Tempo: 10 easy, 3 × 6 min at 7.8 mph with 2 min easy, 10 easy + Core A',
    '30 min easy + 6 strides + Plyometrics (2 sets) + Strength A + Core B',
    '5K time trial: 15 min easy + 4 strides, an all-out 5K, 10 min easy + Core A',
    'Gym: 40 min easy run (shorter after the trial) + Strength B + Core B',
    'Optional: 25 min easy + Core A']
];
NEW_WEEKS.forEach(([label, focus, miles, days]) => W.push([label, focus, miles, ...days]));

function title(text, dow) {
  const t = text.replace(/^(Gym|Optional[^:]*|Thanksgiving|Christmas Eve|Christmas): /, '');
  const m = t.match(/^(Tempo|Light tempo|Intervals|Cruise intervals|Fartlek|Progression long run)/);
  if (/time trial/.test(t)) return t.match(/^\S+ time trial/)[0].replace(/^./, (c) => c.toUpperCase());
  if (/Turkey Trot/.test(t)) return 'Turkey Trot 5K';
  if (m) return m[1];
  if (/^Off/.test(t) && dow !== 4) return 'Off';
  if (dow === 4) return /^Off$/.test(t) ? 'Off' : 'Bonus run';
  if (dow === 3 || /^Gym/.test(text)) return 'Long run';
  if (/Plyometrics|Strength A/.test(t)) return 'Easy run + power';
  return 'Easy run';
}

// Turns a day's text into the checklist.
function items(text, dow) {
  const out = [];
  const optionalDay = dow >= 4;
  const t = text;
  if (dow === 6 || /^Christmas: Off/.test(t)) return out;
  if (dow === 5) {
    out.push({ key: 'cross', label: 'Class with Mom, or 25 min easy + 4 strides' });
    out.push({ key: 'coreB', label: 'Core B', opt: true, routine: 'coreB' });
    return out;
  }
  const run = t.replace(/^(Gym|Optional[^:]*|Thanksgiving|Christmas Eve): /, '').replace(/ \+ (Core|Strength|Plyometrics).*$/, '');
  out.push({ key: 'run', label: /time trial/.test(t) ? 'Time trial' : 'Run', sub: run.replace(/ \+ \d+ strides$/, '').replace(/ \+ 4 strides$/, ''), opt: optionalDay, log: true });
  const st = t.match(/(\d+) strides/);
  if (st) out.push({ key: 'strides', label: st[1] + ' strides at 10.0 mph', sub: '30 sec on once the belt is up to speed, 60 sec walk', opt: optionalDay });
  const pl = t.match(/Plyometrics \((\d) sets?\)/);
  if (pl) out.push({ key: 'plyo', label: 'Plyometrics · ' + pl[1] + (pl[1] === '1' ? ' set' : ' sets'), sub: 'Do these after your warm-up, before the run', routine: 'plyo' });
  if (/Strength A/.test(t)) out.push({ key: 'strA', label: 'Strength A · at home', routine: 'strA' });
  if (/Strength B/.test(t)) out.push({ key: 'strB', label: 'Strength B · at the gym' + (/light/.test(t) ? ' (light, learning the moves)' : ''), routine: 'strB' });
  if (/Core A/.test(t)) out.push({ key: 'coreA', label: 'Core A · 2 rounds', routine: 'coreA', opt: optionalDay });
  if (/Core B/.test(t)) out.push({ key: 'coreB', label: 'Core B · 2 rounds', routine: 'coreB', opt: optionalDay });
  return out;
}

// Checklist for a Weeks 4–13 day.
function objItems(t) {
  if (t.off) return [];
  const opt = !!t.opt, out = [];
  out.push({ key: 'run', label: t.trial ? 'Time trial' : 'Run', sub: t.s, opt, log: true });
  if (t.strides) out.push({ key: 'strides', label: t.strides + ' strides at 9.0–9.5 mph', sub: '15–20 sec once the belt is up to speed, 60 sec walk. Outside: only on dry pavement.', opt });
  if (t.plyo) out.push({ key: 'plyo', label: 'Plyometrics · ' + t.plyo + ' sets', sub: 'After your warm-up, before the run, while fresh', routine: 'plyo' });
  if (t.strA) out.push({ key: 'strA', label: 'Strength A · at home' + (t.strA === true ? '' : ' (' + t.strA + ')'), routine: 'strA' });
  if (t.strB) out.push({ key: 'strB', label: 'Strength B · at the gym' + (t.strB === true ? '' : ' (' + t.strB + ')'), sub: 'Not at the gym? Home Strength counts instead.', routine: 'strB', routine2: 'home', opt: t.trial === '5k' });
  if (t.home) out.push({ key: 'home', label: 'Home Strength', sub: typeof t.home === 'string' && t.home !== 'friday' ? 'Optional, ' + t.home : 'Optional, about 15–20 min, no gym', routine: 'home', opt: true });
  if (t.core) out.push({ key: 'core' + t.core, label: 'Core ' + t.core + ' · 2 rounds', routine: 'core' + t.core, opt });
  return out;
}

function parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }

// Required items done? Optional-only days count once the run is checked.
export function dayDone(p, checks) {
  const req = p.items.filter((i) => !i.opt);
  if (req.length) return req.every((i) => checks[i.key]);
  return !!(checks.run || checks.cross);
}

// 'mile' or '5k' when the plan has a time trial on this date, else null.
export function trialOn(date) {
  const p = planFor(date);
  if (!p || !/time trial/i.test(p.title)) return null;
  return /mile/i.test(p.title) ? 'mile' : '5k';
}

// Returns the plan for a date, or null if it's outside the 13 weeks.
export function planFor(date) {
  const start = parse(PLAN_START);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((d - start) / 86400000);
  if (diff < 0 || diff >= W.length * 7) return null;
  const wi = Math.floor(diff / 7), dow = diff % 7;
  const w = W[wi];
  const text = dow < 5 ? w[3 + dow] : dow === 5 ? SAT : SUN;
  if (dow < 5 && typeof text === 'object') {
    const t = text;
    return {
      week: wi + 1, weekLabel: w[0], focus: w[1], miles: w[2], dow,
      title: t.title, optional: !!t.opt, detail: t.s, indoor: t.off ? '' : t.in, outdoor: t.off ? '' : t.out, note: t.note || '',
      tag: t.tag || (t.opt ? 'Optional' : ''), items: objItems(t), strengthNote: ''
    };
  }
  const strengthNote = (wi === 0 || wi === 1) ? 'Strength A: 2 sets in Weeks 1–2.' : '';
  return {
    week: wi + 1, weekLabel: w[0], focus: w[1], miles: w[2], dow,
    title: dow === 5 ? 'Cross-training' : dow === 6 ? 'Rest' : title(text, dow),
    optional: dow === 4 || dow === 5,
    detail: text.replace(/^(Gym|Optional[^:]*|Thanksgiving|Christmas Eve|Christmas): /, ''),
    tag: (text.match(/^(Gym|Thanksgiving|Christmas Eve|Christmas|Optional[^:]*)/) || [])[1] || (dow === 6 ? 'Rest day' : ''),
    items: items(text, dow),
    strengthNote
  };
}

// ---- Definitions ----
// Re-set Nov 12, 2026 from a 24:30 5K (VDOT 39.2). Treadmill at 1% incline.
export const ZONES = [
  ['Easy', 'Full sentences', '10:00–10:30 (9:40–10:45)', '5.7–6.0'],
  ['Steady', 'Short sentences', '8:55–9:15', '6.5–6.7'],
  ['Threshold', '“Comfortably hard,” a few words', '8:20–8:30', '7.1–7.2'],
  ['Interval', 'Hard, breathing heavily', '7:30–7:40', '7.8–8.0'],
  ['Fast reps', 'Fast but relaxed', '7:05', '8.4–8.5'],
  ['Strides', 'Quick, never a sprint', '6:20–6:40', '9.0–9.5']
];
// Indoor-track lap times for the same zones
export const LAPS = [
  ['Easy', '400 in 2:23–2:38'],
  ['Threshold', '400 in 2:04–2:06 · 200 in 62–63 sec'],
  ['Interval', '400 in 1:52–1:54 · 800 in 3:44–3:49 · 200 in 56–57 sec'],
  ['Fast reps', '400 in 1:46 · 200 in 53 sec'],
  ['Mile trial pacing', '7:10 = 1:47.5 per 400 · 7:00 = 1:45'],
  ['5K trial pacing', '24:30 = 1:57.5 per 400 · 24:00 = 1:55 · 23:30 = 1:53']
];

export const TERMS = [
  ['Easy run', 'Relaxed running you could hold a full conversation during: 5.7–6.0 mph on the treadmill (10:00–10:30 a mile). Warm-ups, cool-downs and jogs between reps are easy too. About three-quarters of your running is easy on purpose: it builds the aerobic engine a 5K runs on.'],
  ['Threshold', 'A “comfortably hard” pace (7.1–7.2 mph, 8:20–8:30 a mile) where you can only say a few words. It raises the pace you can hold before you redline, and it’s the most important workout for a 5K. If 7.1 feels harder than that, slow down 0.1–0.2.'],
  ['Intervals', 'Repeats of 2–4 minutes at 7.8–8.0 mph (7:30–7:40 a mile) with easy jogging between. Hard, breathing heavily. They raise your VO2 max.'],
  ['Fast reps', '30–60 seconds at 8.4–8.5 mph (about 7:05 a mile) with a full walk between. Fast, relaxed, good form.'],
  ['Strides', '15–20 seconds of quick, relaxed running at 9.0–9.5 mph once the belt reaches speed, then 60 seconds walking. Fast but not a sprint. Change speed with the buttons, not the rails. Outside, only on dry pavement.'],
  ['Long run', 'Your longest easy run of the week (45–65 minutes). Some weeks finish with 10 minutes steady (6.5–6.7 mph, short sentences).'],
  ['Warm-up / cool-down', 'Quality days start with 10–15 minutes easy (5.7–6.0 mph) and end with 10 minutes easy. “10 easy” means exactly that.'],
  ['Time trial', 'An all-out mile or 5K that opens a Thursday workout at the gym track (Weeks 4, 5, 7, 10, 12 and 13). Run even laps and race only the last 400. After a mile, jog 8–10 minutes, then a short threshold block. After a 5K, only a few relaxed strides. Stop if pain changes your stride. Log every time on the Trials tab.'],
  ['Inside or outside', 'Every run has a treadmill/track version and an outside version. Outside: layers, gloves and a hat, a light after dark. Ice, or wind chill below about 0–10°F: go inside. Never run fast on snow or ice.'],
  ['Down week', 'A lighter week (Weeks 6, 9, 13) so your body absorbs the training. No plyometrics.'],
  ['Plyometrics (plyos)', 'Quick jumping exercises with soft, quiet landings, done fresh before the run. They make you more efficient and faster at top speed. Stop a set when jumps get sloppy.'],
  ['Pace', 'Minutes per mile: total time ÷ total miles. The Today tab works it out for you.'],
  ['Effort (1–10)', '1 = super easy, 10 = all-out. Easy runs 3–4, threshold 6–7, intervals 8, time trials 10.']
];

export const ROUTINES = {
  plyo: {
    title: 'Plyometrics', when: 'Tuesday · at home · about 8 min',
    note: 'After your warm-up, before the run, while fresh. 2 sets in Weeks 4–8 and trial weeks, 3 sets in Weeks 11–12. Soft, quiet landings; none in down weeks (6, 9, 13).',
    list: [
      ['Pogo hops', '20', 'Bounce on the balls of your feet with stiff ankles and almost-straight knees. Short, fast contacts, like the floor is hot.'],
      ['Squat jumps', '8', 'Feet shoulder-width, squat to thighs about parallel, jump straight up. Land softly and reset for a second between reps.'],
      ['Split-squat jumps', '6 each leg', 'Start in a lunge, jump up and switch legs in the air, land back in a lunge. Front knee stays over the toes.'],
      ['Single-leg hops in place', '10 each leg', 'Stand on one foot, hop in place, quick and light. Keep the knee from caving inward.'],
      ['Lateral bounds', '6 each side', 'Jump sideways off one leg, land on the other, hold the landing for 1 second, then bound back.']
    ]
  },
  strA: {
    title: 'Strength A', when: 'Tuesday · at home · about 15 min',
    note: 'After the run. 2 sets in Weeks 1–2, then 3 sets.',
    list: [
      ['Bodyweight or backpack squats', '15', 'Sit back like into a chair, chest up, heels down, thighs to parallel. Add a loaded backpack when 15 gets easy.'],
      ['Walking lunges', '10 each leg', 'Long step, back knee drops toward the floor, front knee over the ankle. Push through the front heel to step forward.'],
      ['Push-ups', '8–15', 'Hands under shoulders, body in a straight line from head to heels. Chest to about a fist from the floor.'],
      ['Single-leg calf raises, slow', '15 each leg', 'Stand on one foot on a step, rise all the way up, lower slowly for 3 seconds. Hold a wall for balance.'],
      ['Single-leg Romanian deadlift', '8 each leg', 'Stand on one leg, hinge at the hips and reach toward the floor as the other leg goes straight back. Flat back, slight knee bend.'],
      ['Tibialis raises', '15', 'Back against a wall, heels a foot out. Lift your toes toward your shins, lower slowly.'],
      ['Bent-knee calf raise', '12 each leg', 'Like the calf raise, but with the knee bent. Works the lower calf (soleus).']
    ]
  },
  strB: {
    title: 'Strength B', when: 'Thursday · at the gym · about 20 min',
    note: 'Thursday at the gym. Pick a weight you could lift about 12 times and do 8. The jumps after each lift are only for interval Thursdays; after a mile trial they’re optional, after a 5K trial or in a down week skip them. Have a coach or gym staff check your squat and deadlift form before adding weight. Can’t make the gym? Do Home Strength instead.',
    list: [
      ['Goblet squat, 3 × 8 → 5 squat jumps', 'Pair 1', 'Hold a dumbbell at your chest, elbows down, and squat. Then 5 squat jumps right away.'],
      ['Dumbbell RDL, 3 × 8 → 5 broad jumps', 'Pair 2', 'Dumbbells in front of thighs, push hips back and slide them down to mid-shin, flat back. Then 5 broad jumps forward, landing softly.'],
      ['Dumbbell step-ups, 3 × 8 each leg → 10 pogo hops', 'Pair 3', 'Dumbbells at your sides, step onto a knee-high box, drive through the top foot, don’t push off the bottom one.'],
      ['Lat pulldown, 3 × 10', 'Pair 4', 'Hands a bit wider than shoulders, pull the bar to your upper chest, squeeze shoulder blades down. Control it back up.'],
      ['Calf raises on a step, 3 × 12 each leg', 'Pair 5', 'One foot on a step, dumbbell in the same-side hand, other hand on a rail. Full rise, slow lower.'],
      ['Nordic lowers, 2 × 4', 'Hamstrings', 'Kneel with feet held or anchored, lower your body forward as slowly as you can, catch with your hands. Or a hamstring curl machine 2 × 10, slow on the way down.'],
      ['Copenhagen short plank, 2 × 15 sec each side', 'Hips', 'Side plank with your top knee on a bench, hips lifted in a straight line.']
    ]
  },
  home: {
    title: 'Home Strength', when: 'Instead of Strength B · at home · 15–20 min',
    note: '3 circuits, 2–3 rounds each, 60 sec rest between rounds. A backpack adds weight once the reps are easy with perfect form. No jumps. Stop a set if form breaks; muscle soreness is fine, joint, shin or heel pain is not.',
    list: [
      ['Rear-foot-elevated split squat', '3 × 8 each leg', 'Back foot on a couch or chair. Tall torso, front knee over your 2nd–3rd toe. Down for 2 sec, drive up through the front heel.'],
      ['Step-ups onto a stair or sturdy chair', '3 × 8 each leg', 'Knee-high step. Push only through the top foot, stand fully tall, lower slowly.'],
      ['Single-leg glute bridge, shoulders on the couch', '2–3 × 10 each leg', 'Ribs down, squeeze at the top for 1 sec. Don’t arch your low back.'],
      ['Towel leg curls (or Nordic lowers 2 × 4)', '3 × 8', 'On your back, heels on a towel, hips up. Slide your heels in and out slowly.'],
      ['Slow single-leg calf raise off a step', '3 × 12 each leg', '3 sec down. Then 1 × 12 with the knee bent.'],
      ['Side-lying leg raise (or Copenhagen plank 2 × 15–20 sec)', '2 × 15 each side', 'Toes forward, leg slightly behind you, lower slowly.'],
      ['Tibialis raises', '2 × 15', 'Back against a wall, heels a foot out. Toes up toward your shins, lower slowly.']
    ]
  },
  coreA: {
    title: 'Core A', when: 'Mon, Wed (+ optional Fri) · 10 min',
    note: '2 rounds, minimal rest. Add 5–10 seconds or 2 reps once a round feels easy.',
    list: [
      ['Front plank', '45 sec', 'Forearms down, straight line head to heels, squeeze glutes. No sagging hips.'],
      ['Dead bugs', '10 each side', 'On your back, arms up, knees bent at 90°. Lower opposite arm and leg slowly, low back stays pressed down.'],
      ['Side plank', '30 sec each side', 'Forearm under shoulder, feet stacked, hips lifted in a straight line.'],
      ['Single-leg glute bridge', '10 each leg', 'On your back, one foot planted, other leg straight. Push hips up and squeeze; don’t arch the back.'],
      ['Bird dogs', '10 each side', 'On hands and knees, reach opposite arm and leg straight out, hold 2 seconds, keep hips level.'],
      ['Side-lying leg raise', '15 each side', 'On your side, toes pointing forward, lift the top leg slightly behind you and lower slowly. Strong hips keep your knees tracking straight.']
    ]
  },
  coreB: {
    title: 'Core B', when: 'Tue, Thu (+ optional Sat) · 10 min',
    note: '2 rounds, minimal rest. Add 5–10 seconds or 2 reps once a round feels easy.',
    list: [
      ['Hollow-body hold', '30 sec', 'On your back, lift shoulders and straight legs off the floor into a shallow banana shape. Low back pressed down.'],
      ['Copenhagen short plank', '15–20 sec each side', 'Side plank with your top knee on a couch or bench, hips lifted in a straight line.'],
      ['Side plank with hip dips', '10 each side', 'In a side plank, lower the hip toward the floor and lift back up. Slow and controlled.'],
      ['Superman hold', '30 sec', 'Face down, lift arms, chest and legs a few inches off the floor and hold. Look at the floor, not forward.'],
      ['Mountain climbers', '30 sec', 'High plank, drive knees toward chest one at a time, quick feet, hips stay level.'],
      ['Reverse crunches', '12', 'On your back, knees bent, curl the knees toward your chest so the hips lift off the floor. Lower slowly.']
    ]
  }
};
