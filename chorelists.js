// Step-by-step lists for chores: each step brings one part of the room back to normal.
// Built-in lists are below; parents can change them on the Settings page (saved as config/choreSteps,
// only the lists that differ from these). A list is matched to a chore by its exact name (case and spaces
// at the ends don't matter). One step per line; "Vacuum: both rooms" shows "Vacuum" in bold.
// A chore with no list (or a blank one) stays a single box.
export const CHORE_LISTS = [
  { name: 'Living Room', steps: [
    'Pick up: take anything that doesn’t belong in here back where it goes.',
    'Blankets: fold every throw blanket and lay it over a couch arm.',
    'Couches: straighten the cushions, stand the pillows up and check between the cushions.',
    'Back in place: bean bag in its corner, desk chair pushed in, remotes by the TV.',
    'Tables: clear and straighten the little table and the table by the mirror.',
    'Dust: dust the shelves and mantel and set the pictures straight.',
    'Dry cloth: wipe the TV screen and the big mirror with a dry cloth.',
    'Vacuum: the whole carpet, along the walls and under the front of the couches.'
  ] },
  { name: 'Sunroom', steps: [
    'Pick up: take anything that doesn’t belong in here back where it goes. Trash and recycling out.',
    'Games: paddles, balls and puzzle pieces back where they’re kept. Leave a puzzle someone is still working on.',
    'Bar counter: clear it, then wipe the counter and the little sink with a disinfecting wipe.',
    'Scarlett’s corner: dog toys put away, crate cover straight, spills wiped up.',
    'Chairs: push in the table chairs and bar stools and straighten the cushions.',
    'Sweep: the whole tile floor, corners and under the table and stools too.'
  ] },
  { name: 'Kitchen', steps: [
    'Food away: leftovers into containers and the fridge; everything else back in the pantry.',
    'Unload: if the dishwasher is clean, empty it first.',
    'Load: rinse the dishes and load the dishwasher. Run it if it’s full.',
    'Hand-wash: wash, dry and put away pans, knives and cutting boards that don’t go in the dishwasher. Cast iron: no soaking, dry it right away.',
    'Counters: clear the counters and island, then wipe them and the stovetop once it’s cool.',
    'Sink: scrub the sink and faucet, shake out the drying mat, hang up the dish towels.',
    'Trash: empty the kitchen trash, put in a new bag, flatten boxes for recycling.',
    'Floor: sweep the whole floor, under the island and table too, and wipe up sticky spots.'
  ] },
  { name: 'Bathrooms', steps: [
    'Pick up: in all three bathrooms, clothes and dirty towels go to the laundry; anything else back where it goes.',
    'Counters: put things away, then wipe the counters and sinks.',
    'Mirrors: wipe all three mirrors.',
    'Toilets: scrub inside with the brush, then wipe the seat, lid and outside.',
    'Towels: hang clean towels straight on the bars and hooks.',
    'Toilet paper: a full roll on each holder and a spare nearby.',
    'Trash: empty all three trash cans and put in new bags.',
    'Floors: shake out the rugs and sweep or wipe each floor.'
  ] },
  { name: 'Dining/Front Room', steps: [
    'Pick up: anything that doesn’t belong in the dining room or front room goes back where it goes.',
    'Coats, shoes and bags: hung up or put where they’re kept.',
    'Dining table: cleared and wiped, chairs pushed in.',
    'Couch and games: pillows up, blanket folded, games back on the shelf.',
    'Desks: floor around them clear and chairs pushed in. Leave what’s on the desks alone.',
    'Vacuum: both rooms, under the table too.'
  ] }
];
export const MAX_STEPS = 15, MAX_STEP_LEN = 200;

export const norm = (s) => String(s || '').trim().toLowerCase();
// Firebase drops empty lists and turns lists into objects with number keys; put them back.
const arr = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.keys(v).sort((a, b) => a - b).map((k) => v[k]) : []);
// Clean step lines: trimmed, no blanks or repeats, capped.
export function cleanSteps(lines) {
  const seen = new Set();
  return arr(lines).map((s) => String(s == null ? '' : s).trim().slice(0, MAX_STEP_LEN))
    .filter((s) => s && !seen.has(norm(s)) && seen.add(norm(s))).slice(0, MAX_STEPS);
}

// The lists in use: the built-in ones, with any saved list (same name) taking its place.
// A saved list with no steps (saved as [''] since Firebase drops empty lists) turns that chore back into one box.
export function mergeLists(saved) {
  const out = CHORE_LISTS.map((l) => ({ name: l.name, steps: l.steps.slice() }));
  arr(saved).forEach((e) => {
    if (!e || !String(e.name || '').trim()) return;
    const name = String(e.name).trim().slice(0, 60), steps = cleanSteps(e.steps);
    const hit = out.find((l) => norm(l.name) === norm(name));
    if (hit) hit.steps = steps; else out.push({ name, steps });
  });
  return out;
}
// What to save: only the lists that differ from the built-in ones (so later built-in lists still show).
export function listsToSave(lists) {
  return lists.map((l) => ({ name: String(l.name).trim(), steps: cleanSteps(l.steps) })).filter((l) => {
    const d = CHORE_LISTS.find((x) => norm(x.name) === norm(l.name));
    return d ? d.steps.join('\n') !== l.steps.join('\n') : l.steps.length > 0;
  }).map((l) => ({ name: l.name, steps: l.steps.length ? l.steps : [''] }));
}

// A short id from the chore name and the step's words: reordering keeps the ticks, rewording a step
// starts that one step fresh.
function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); }
export const stepKey = (name, line) => 'st_' + hash(norm(name) + '|' + norm(line));

// The steps for a chore name, or null. Each step: { key (saved under the day), label, sub }.
export function choreSteps(lists, name) {
  const l = (lists || []).find((x) => norm(x.name) === norm(name));
  if (!l || !l.steps.length) return null;
  return l.steps.map((line) => {
    const i = line.indexOf(': '); // "Start by 4:30" has no bold part
    const lead = i > 0 && i <= 40 ? line.slice(0, i).trim() : line, text = i > 0 && i <= 40 ? line.slice(i + 1).trim() : '';
    return { key: stepKey(name, line), label: lead, sub: text ? text.charAt(0).toUpperCase() + text.slice(1) : '' };
  });
}
