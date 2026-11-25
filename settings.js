// Things parents can change on the Settings page without a code change.
// Defaults live here; anything saved in Firebase (chart "config") replaces them on every phone.
import { CHORE_LISTS, mergeLists } from './chorelists.js?v=1795568370';
const FAMILY_KITCHEN = 'Kitchen + dining room with the family';
const LAUNDRY = 'Laundry + clean your room (30 min)';

export const DEFAULTS = {
  // Step-by-step chore lists (chorelists.js); parents can change them on Settings
  choreSteps: CHORE_LISTS,
  // Chores by day, Mon (0) … Sun (6); each day can have several.
  chores: {
    eli: [[FAMILY_KITCHEN, LAUNDRY], ['Living Room'], ['Sunroom'], ['Kitchen'], ['Dining/Front Room'], ['Vacuum/brush Scarlett'], ['Kitchen + dining room (all hands)']],
    rhett: [[FAMILY_KITCHEN, 'Sunroom'], ['Bathrooms'], ['Dining/Front Room'], ['Living Room'], ['Kitchen'], [LAUNDRY], ['Kitchen + dining room (all hands)', 'Fold + put away clothes']],
    isaiah: [[FAMILY_KITCHEN, 'Trash: empty every trash can in the house'], ['Front closet + shoe organizing'], ['Kitchen'], ['Stairs, landing + upstairs hallway'], ['Sunroom'], [LAUNDRY], ['Kitchen + dining room (all hands)', 'Fold + put away clothes']]
  },
  // Shower nights, Mon (0) … Sun (6)
  showers: { eli: [0, 1, 3, 4, 5], rhett: [6, 1, 3], isaiah: [0, 3, 5] },
  // School-night lights out (Fri/Sat are later automatically)
  lights: { eli: '20:30', rhett: '20:00', isaiah: '20:00' },
  // Weekend game time earned for each full school day (minutes), and minutes after lights out that still count
  game: 30,
  grace: 5,
  // Evening checks, marked by Mom or Dad: the wording can change; the checks themselves are fixed
  checks: {
    eli: {
      kind: { label: 'Kind to his brothers', sub: 'No hurting them, physically or with words' },
      listen: { label: 'Listened to Mom and Dad', sub: 'Without arguing' }
    },
    rhett: {
      noYell: { label: 'No yelling', sub: 'Didn’t yell or raise his voice with Mom and Dad' },
      firstTime: { label: 'Listened the first time', sub: 'To Mom and Dad, the first time they asked' },
      noLies: { label: 'No lies today', sub: '' }
    },
    isaiah: {
      noYell: { label: 'No yelling', sub: 'Didn’t yell or raise his voice with Mom and Dad' },
      firstTime: { label: 'Listened the first time', sub: 'To Mom and Dad, the first time they asked' },
      noLies: { label: 'No lies today', sub: '' }
    }
  },
  // Weekly and monthly reward choices on Eli's and Rhett's charts
  rewards: {
    eli: {
      weekly: ['30 minutes of extra screen time', 'Pick something from the Hy-Vee checkout line', 'Skip one chore next week (parent’s pick of which)'],
      monthly: ['Arcade at B&B Theatres or the Operating Room', 'Lunch out with Dad', '1 hour of extra video game time']
    },
    trombone: {
      weekly: ['30 minutes of extra screen time', 'Pick something from the Hy-Vee checkout line', 'Skip one chore next week (parent’s pick of which)'],
      monthly: ['New racquetball gear (balls, goggles or a grip)', 'Lunch out with Dad', '1 hour of extra video game time']
    }
  },
  // Eli's time-trial prize levels
  prizeLevels: {
    Small: ['Pick something from the Hy-Vee checkout line', 'New running socks', '15 min extra video game time'],
    Medium: ['Breakfast out with Dad', 'Starbucks run', 'Smoothie or shake after a run', 'Skip one chore (parent’s pick)', 'Family movie night: you pick the movie and dessert', '1 hour extra video game time'],
    Big: ['Special lunch out with Dad', 'Friday night pizza: you pick where and what', 'Chore-free day', 'Ice cream for the family', '1.5 hours extra video game time'],
    Huge: ['Arcade at B&B Theatres or the Operating Room', 'Sit-down family dinner at a nice restaurant'],
    Grand: ['Plan 2 family activities for a Saturday', 'Arcade at B&B Theatres or the Operating Room + a Starbucks run', 'Sit-down family dinner at a nice restaurant + lunch out with Dad']
  }
};

const copy = (x) => JSON.parse(JSON.stringify(x));
// The live settings object. Modules read from it; applySettings changes it in place.
export const SETTINGS = copy(DEFAULTS);
const listeners = [];
export function onSettings(fn) { listeners.push(fn); }

// Firebase drops empty arrays and turns arrays into objects with number keys; put them back.
const arr = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.keys(v).sort((a, b) => a - b).map((k) => v[k]) : []);
const clean = (list) => arr(list).map(String).map((s) => s.trim()).filter(Boolean);

// The day-to-day schedule (chores, shower nights, lights out), read from saved settings over the defaults.
export const DATED = ['chores', 'showers', 'lights', 'game', 'grace'];
export const LIMITS = { game: [5, 120], grace: [0, 30] };
const inRange = (v, [lo, hi], d) => { const n = Number(v); return Number.isInteger(n) && n >= lo && n <= hi ? n : d; };
function schedule(c) {
  const fresh = copy({ chores: DEFAULTS.chores, showers: DEFAULTS.showers, lights: DEFAULTS.lights, game: DEFAULTS.game, grace: DEFAULTS.grace });
  if (c.game !== undefined) fresh.game = inRange(c.game, LIMITS.game, DEFAULTS.game);
  if (c.grace !== undefined) fresh.grace = inRange(c.grace, LIMITS.grace, DEFAULTS.grace);
  ['eli', 'rhett', 'isaiah'].forEach((kid) => {
    const days = c.chores && c.chores[kid];
    if (days) fresh.chores[kid] = [0, 1, 2, 3, 4, 5, 6].map((d) => clean(arr(days)[d]));
    if (c.showers && c.showers[kid] !== undefined) fresh.showers[kid] = arr(c.showers[kid]).map(Number).filter((d) => d >= 0 && d <= 6);
    if (c.lights && /^\d{1,2}:\d{2}$/.test(c.lights[kid] || '')) fresh.lights[kid] = c.lights[kid];
  });
  return fresh;
}

// ---- Changes apply from the day they're saved ----
// config/history/<YYYY-MM-DD> holds the schedule that applied BEFORE that date (written by the first save
// that day). A day uses the earliest snapshot dated after it, else the current settings. No snapshots =
// everything uses the current settings, exactly as before.
let HISTORY = []; // [[date, schedule]] sorted by date
let CURRENT = null; // the schedule saved now (set by applySettings)
const ymdOf = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export function scheduleFor(date) {
  const k = typeof date === 'string' ? date : ymdOf(date);
  const hit = HISTORY.find(([at]) => k < at);
  return hit ? hit[1] : null;
}
// Run fn with the schedule that applied on this date (synchronous callers only).
// Always swaps to that day's snapshot or to the current schedule, so a lookup nested inside another
// date's (a streak counted from today on a past day's page) still gets the right one.
export function atDate(date, fn) {
  if (!date) return fn();
  const use = scheduleFor(date) || CURRENT;
  if (!use) return fn();
  const saved = {};
  DATED.forEach((k) => { saved[k] = SETTINGS[k]; SETTINGS[k] = use[k]; });
  try { return fn(); } finally { DATED.forEach((k) => { SETTINGS[k] = saved[k]; }); }
}
// What to save before changing the schedule today: the current schedule, unless today already has one.
export function snapshotToSave(cfg, today) {
  const k = ymdOf(today);
  if (cfg && cfg.history && cfg.history[k]) return null;
  const cur = CURRENT || SETTINGS;
  const value = copy(Object.fromEntries(DATED.map((key) => [key, cur[key]])));
  // Firebase drops empty lists: save them the way the Settings page does (cleaned up on load)
  Object.values(value.chores).forEach((days) => days.forEach((d, i) => { if (!d.length) days[i] = ['']; }));
  Object.keys(value.showers).forEach((kid) => { if (!value.showers[kid].length) value.showers[kid] = [-1]; });
  return { key: k, value };
}

export function applySettings(cfg) {
  const c = cfg || {};
  const fresh = copy(DEFAULTS);
  CURRENT = schedule(c);
  Object.assign(fresh, copy(CURRENT));
  // evening check wording (keys are fixed; blank wording keeps the default)
  Object.keys(fresh.checks).forEach((kid) => Object.keys(fresh.checks[kid]).forEach((key) => {
    const w = c.checks && c.checks[kid] && c.checks[kid][key];
    if (!w) return;
    const label = String(w.label || '').trim().slice(0, 60), sub = String(w.sub == null ? fresh.checks[kid][key].sub : w.sub).trim().slice(0, 100);
    if (label) fresh.checks[kid][key] = { label, sub };
  }));
  HISTORY = Object.entries(c.history || {}).filter(([k]) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [k, schedule(v || {})]);
  ['eli', 'trombone'].forEach((id) => ['weekly', 'monthly'].forEach((w) => {
    const v = c.rewards && c.rewards[id] && clean(c.rewards[id][w]);
    if (v && v.length) fresh.rewards[id][w] = v;
  }));
  Object.keys(fresh.prizeLevels).forEach((lvl) => {
    const v = c.prizeLevels && clean(c.prizeLevels[lvl]);
    if (v && v.length) fresh.prizeLevels[lvl] = v;
  });
  fresh.choreSteps = mergeLists(c.choreSteps);
  Object.keys(SETTINGS).forEach((k) => delete SETTINGS[k]);
  Object.assign(SETTINGS, fresh);
  listeners.forEach((fn) => fn(SETTINGS));
}

// "20:30" -> minutes after midnight
export const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
