// Eli's 13-week off-season plan (starts Mon Oct 26, 2026). Text is straight from the plan.
export const PLAN_START = '2026-10-26';

const SAT = 'Cross-training: class with Mom, or 25 min easy + 4 strides + Core B (optional)';
const SUN = 'Rest';

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
  ['Nov 9–15', 'Build', 18,
    'Tempo: 10 easy, 3 × 6 min at 7.8 mph with 2 min easy, 10 easy + Core A',
    '30 min easy + 6 strides + Plyometrics (2 sets) + Strength A + Core B',
    'Intervals: 10 easy, 6 × 2 min at 8.7 mph / 2 min easy, 10 easy + Core A',
    'Gym: 50 min easy run + Strength B + Core B',
    'Optional: 25 min easy + Core A'],
  ['Nov 16–22', 'Build', 20,
    'Tempo: 10 easy, 2 × 10 min at 7.8 mph with 3 min easy, 10 easy + Core A',
    '35 min easy + 6 strides + Plyometrics (2 sets) + Strength A + Core B',
    'Intervals: 10 easy, 10 × 1 min at 9.0 mph / 1 min easy, 10 easy + Core A',
    'Gym: 55 min easy run + Strength B + Core B',
    'Optional: 25 min easy + Core A'],
  ['Nov 23–29', 'Build (Thanksgiving)', 19,
    'Cruise intervals: 10 easy, 4 × 5 min at 7.9 mph with 1 min easy, 10 easy + Core A',
    '35 min easy + 6 strides + Plyometrics (2 sets) + Strength A + Core B',
    'Gym: 55 min easy run + Strength B + Core B',
    'Thanksgiving: Turkey Trot 5K at a hard-but-controlled effort, or on the treadmill: 10 easy, 5 × 3 min at 8.7 mph / 2 min easy, 10 easy + Core A',
    'Optional: 20 min easy + Core A'],
  ['Nov 30–Dec 6', 'Down week + 1-mile time trial', 12,
    '30 min easy + 6 strides + Core A',
    '30 min easy + Strength A + Core B (no plyometrics)',
    '25 min easy + 4 strides + Core A',
    'Gym: 1-mile time trial on the indoor track: warm-up, one all-out mile, cool-down + Core B (no strength)',
    'Optional: 20 min easy + Core A'],
  ['Dec 7–13', 'Build', 21,
    'Tempo: 10 easy, 3 × 8 min at 7.9 mph with 2 min easy, 10 easy + Core A',
    '35 min easy + 6 strides + Plyometrics (2 sets) + Strength A + Core B',
    'Intervals: 10 easy, 5 × 3 min at 8.8 mph / 2 min easy, 10 easy + Core A',
    'Gym: 60 min easy run + Strength B + Core B',
    'Optional: 25 min easy + Core A'],
  ['Dec 14–20', 'Build', 22,
    'Tempo: 10 easy, 20 min continuous at 7.9 mph, 10 easy + Core A',
    '35 min easy + 6 strides + Plyometrics (2 sets) + Strength A + Core B',
    'Intervals: 10 easy, 12 × 1 min at 9.2 mph / 1 min easy, 10 easy + Core A',
    'Gym: Progression long run: 50 min easy, then 10 min at steady (7.4 mph) + Strength B + Core B',
    'Optional: 25 min easy + Core A'],
  ['Dec 21–27', 'Down week (Christmas)', 13,
    '30 min easy + 6 strides + Core A',
    '30 min easy + Strength A + Core B (no plyometrics)',
    'Light tempo: 10 easy, 2 × 8 min at 7.8 mph with 2 min easy, 10 easy + Core A',
    'Christmas Eve: 40 min easy at the gym or on the treadmill + Core B (no strength)',
    'Christmas: Off'],
  ['Dec 28–Jan 3', 'Sharpen', 22,
    'Cruise intervals: 10 easy, 4 × 6 min at 7.9 mph with 1 min easy, 10 easy + Core A',
    '35 min easy + 6 strides + Plyometrics (3 sets) + Strength A + Core B',
    'Intervals: 10 easy, 4 × 4 min at 8.8–9.0 mph / 2 min easy, 10 easy + Core A',
    'Gym: 65 min easy run + Strength B + Core B',
    'Optional (New Year’s Day): 25 min easy + Core A'],
  ['Jan 4–10', 'Sharpen', 23,
    'Tempo: 10 easy, 25 min continuous at 7.9 mph, 10 easy + Core A',
    '35 min easy + 6 strides + Plyometrics (3 sets) + Strength A + Core B',
    'Intervals: 10 easy, 6 × 3 min at 8.8–9.0 mph / 90 sec easy, 10 easy + Core A',
    'Gym: Progression long run: 50 min easy, then 15 min at steady (7.4 mph) + Strength B + Core B',
    'Optional: 25 min easy + Core A'],
  ['Jan 11–17', 'Peak week', 24,
    'Tempo: 10 easy, 2 × 12 min at 7.9 mph with 3 min easy, 10 easy + Core A',
    '40 min easy + 6 strides + Plyometrics (3 sets) + Strength A + Core B',
    'Intervals: 10 easy, 5 × 4 min at 8.8–9.0 mph / 2 min easy, 10 easy + Core A',
    'Gym: 70 min easy run + Strength B + Core B',
    'Optional: 25 min easy + Core A'],
  ['Jan 18–24', 'Down week + 2-mile time trial', 12,
    '30 min easy + 6 strides + Core A',
    '25 min easy + 4 strides + Strength A + Core B (no plyometrics)',
    '20 min easy + 4 × 30 sec at 9.0 mph / 90 sec easy + Core A',
    'Gym: 2-mile time trial on the indoor track: warm-up, all-out 2 miles, cool-down + Core B (no strength)',
    'Optional: Off, or 20 min easy']
];

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

function parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }

// Returns the plan for a date, or null if it's outside the 13 weeks.
export function planFor(date) {
  const start = parse(PLAN_START);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((d - start) / 86400000);
  if (diff < 0 || diff >= W.length * 7) return null;
  const wi = Math.floor(diff / 7), dow = diff % 7;
  const w = W[wi];
  const text = dow < 5 ? w[3 + dow] : dow === 5 ? SAT : SUN;
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
export const ZONES = [
  ['Easy', 'Full sentences', '8:45–9:45', '6.2–6.9'],
  ['Steady', 'Short sentences', '8:00–8:15', '7.3–7.5'],
  ['Tempo', '“Comfortably hard,” a few words', '7:35–7:45', '7.8–7.9'],
  ['5K goal', 'Hard, controlled, can’t talk', '6:55 → 6:40', '8.7 → 9.0'],
  ['Fast (strides)', 'Quick and relaxed, not a sprint', '5:45–6:00', '10.0–10.5']
];

export const TERMS = [
  ['Easy run', 'Relaxed running you could hold a full conversation during, around 6.5 mph. About 75% of your running is easy on purpose: it builds the aerobic engine a 5K runs on.'],
  ['Tempo', 'Running at a “comfortably hard” pace (7.8–7.9 mph) where you can only say a few words. It raises the pace you can hold before you redline, and it’s the most important workout for a 5K.'],
  ['Cruise intervals', 'Tempo pace broken into chunks with short 1-minute easy breaks, so you get more time at tempo.'],
  ['Intervals', 'Short repeats at 5K goal pace (8.7–9.2 mph) with easy jogging between. They teach your body race speed in doses short enough to keep good form.'],
  ['Fartlek', 'Swedish for “speed play.” Easy running with short faster bursts mixed in. A gentle first taste of speed.'],
  ['Strides', 'About 30 seconds of quick, relaxed running at 10.0–10.5 mph once the belt reaches speed, then 60 seconds walking or easy jogging. Fast but not a sprint. Use the speed buttons, not the rails.'],
  ['Progression long run', 'A long easy run where the last 10–15 minutes speed up to steady pace (7.4 mph).'],
  ['Warm-up / cool-down', 'Every quality day starts with 10 minutes easy (6.5 mph) and ends with 10 minutes easy. “10 easy” in a workout means exactly that.'],
  ['Time trial', 'An all-out test on the indoor track. Week 6 is 1 mile (× 3.33 = your 5K fitness); Week 13 is 2 miles (compare to your 14:08, × 1.59 = your 5K fitness).'],
  ['Down week', 'A lighter week (Weeks 6, 9, 13) so your body absorbs the training. Skip plyometrics in down weeks.'],
  ['Plyometrics (plyos)', 'Quick jumping exercises with soft, quiet landings. They make you more efficient and faster at top speed. Stop a set when jumps get sloppy.'],
  ['Pace', 'Minutes per mile: total time ÷ total miles. The Run tab works it out for you.'],
  ['Effort (1–10)', '1 = super easy, 10 = all-out. Easy runs 3–4, tempo 6–7, intervals 7–8.']
];

export const ROUTINES = {
  plyo: {
    title: 'Plyometrics', when: 'Tuesday · at home · about 8 min',
    note: 'After your warm-up, before the easy run. 1 set in Weeks 1–2, 2 sets in Weeks 3–8, 3 sets in Weeks 10–12. Soft, quiet landings; skip in down weeks.',
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
      ['Single-leg Romanian deadlift', '8 each leg', 'Stand on one leg, hinge at the hips and reach toward the floor as the other leg goes straight back. Flat back, slight knee bend.']
    ]
  },
  strB: {
    title: 'Strength B', when: 'Thursday · at the gym · about 20 min',
    note: 'After the long run. Pick a weight you could lift about 12 times and do 8. Do the lift, then the jump right away. Rest 60–90 sec between pairs. Skip in Weeks 6 and 13.',
    list: [
      ['Goblet squat, 3 × 8 → 5 squat jumps', 'Pair 1', 'Hold a dumbbell at your chest, elbows down, and squat. Then 5 squat jumps right away.'],
      ['Dumbbell RDL, 3 × 8 → 5 broad jumps', 'Pair 2', 'Dumbbells in front of thighs, push hips back and slide them down to mid-shin, flat back. Then 5 broad jumps forward, landing softly.'],
      ['Dumbbell step-ups, 3 × 8 each leg → 10 pogo hops', 'Pair 3', 'Dumbbells at your sides, step onto a knee-high box, drive through the top foot, don’t push off the bottom one.'],
      ['Lat pulldown, 3 × 10', 'Pair 4', 'Hands a bit wider than shoulders, pull the bar to your upper chest, squeeze shoulder blades down. Control it back up.'],
      ['Calf raises on a step, 3 × 12 each leg', 'Pair 5', 'One foot on a step, dumbbell in the same-side hand, other hand on a rail. Full rise, slow lower.']
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
      ['Flutter kicks on back', '30 sec', 'On your back, legs straight and a few inches off the floor, small fast kicks. Low back stays down.']
    ]
  },
  coreB: {
    title: 'Core B', when: 'Tue, Thu (+ optional Sat) · 10 min',
    note: '2 rounds, minimal rest. Add 5–10 seconds or 2 reps once a round feels easy.',
    list: [
      ['Hollow-body hold', '30 sec', 'On your back, lift shoulders and straight legs off the floor into a shallow banana shape. Low back pressed down.'],
      ['Russian twists', '20 total', 'Sit, lean back slightly, rotate side to side touching the floor. Turn the shoulders, not just the arms.'],
      ['Side plank with hip dips', '10 each side', 'In a side plank, lower the hip toward the floor and lift back up. Slow and controlled.'],
      ['Superman hold', '30 sec', 'Face down, lift arms, chest and legs a few inches off the floor and hold. Look at the floor, not forward.'],
      ['Mountain climbers', '30 sec', 'High plank, drive knees toward chest one at a time, quick feet, hips stay level.'],
      ['Reverse crunches', '12', 'On your back, knees bent, curl the knees toward your chest so the hips lift off the floor. Lower slowly.']
    ]
  }
};
