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
    'Glass: wipe the big mirror with the blue glass cleaner; dust the TV screen with a dry cloth only.',
    'Vacuum: the whole carpet, along the walls and under the front of the couches.'
  ] },
  { name: 'Sunroom', steps: [
    'Pick up: take anything that doesn’t belong in here back where it goes. Trash and recycling out.',
    'Games: paddles, balls and puzzle pieces back where they’re kept. Leave a puzzle someone is still working on.',
    'Bar counter: clear it, then wipe the counter and the little sink with a disinfectant wipe.',
    'Scarlett’s corner: dog toys put away, crate cover straight, spills wiped up.',
    'Chairs: push in the table chairs and bar stools and straighten the cushions.',
    'Sweep: the whole tile floor, corners and under the table and stools too.'
  ] },
  { name: 'Kitchen', steps: [
    'Food away: leftovers into containers and the fridge; everything else back in the pantry.',
    'Unload: if the dishwasher is clean, empty it first.',
    'Load: rinse the dishes and load the dishwasher. Run it if it’s full.',
    'Hand-wash: wash, dry and put away pans, knives and cutting boards that don’t go in the dishwasher. Cast iron: no soaking, dry it right away.',
    'Counters: clear the counters and island, then wipe them with the kitchen sanitizer, and the stovetop once it’s cool.',
    'Sink: scrub the sink and faucet, shake out the drying mat, hang up the dish towels.',
    'Trash: empty the kitchen trash, put in a new bag, flatten boxes for recycling.',
    'Floor: sweep the whole floor, under the island and table too, and wipe up sticky spots.'
  ] },
  { name: 'Bathrooms', steps: [
    'Pick up: in all three bathrooms, clothes and towels on the floor or counter go to the laundry; anything else back where it goes.',
    'Counters: in all three, things back in their spots, then wipe the counters and sinks with a disinfectant wipe.',
    'Mirrors: clean all three mirrors with the blue glass cleaner.',
    'Toilets: in all three, squirt toilet bowl cleaner inside and scrub with the brush; wipe the seat, lid and outside with a fresh disinfectant wipe. Wipes go in the trash, not the toilet.',
    'Towels: in all three, hang the towels straight on the bars and hooks.',
    'Toilet paper: in all three, a roll on each holder and a spare within reach.',
    'Trash: empty all three trash cans and put in new bags.',
    'Floors: in all three, shake out any rugs and sweep or wipe the floor.'
  ] },
  { name: 'Front closet + shoe organizing', steps: [
    'Entry: anything that doesn’t belong by the front door goes back where it goes. Ask before recycling a box.',
    'Shoes: every shoe in the entry and on the closet floor goes in pairs on the shoe rack.',
    'Coats: every coat on a hanger; pick up any that fell.',
    'Hats, gloves and scarves: matched up and put where they’re kept.',
    'Closet floor: clear except the shoe rack; anything stored here standing up neatly.',
    'Rug and floor: shake out the rug and sweep the entry floor.',
    'Doors: close the closet doors all the way.'
  ] },
  { name: 'Stairs, landing + upstairs hallway', steps: [
    'Landing: everything left on the landing goes back to its owner’s room or where it’s kept.',
    'Stairs: nothing left on any step, top to bottom.',
    'Railings: nothing hanging on the railings or posts.',
    'Hallway: anything on the hallway floor goes where it belongs.',
    'Laundry baskets: clothes inside, none on the floor around them.',
    'Vacuum: every stair, the landing and the whole hallway.'
  ] },
  { name: 'Trash: empty every trash can in the house', steps: [
    'Kitchen: empty the trash and put in a new bag.',
    'Main floor bathroom: empty the trash and put in a new bag.',
    'Basement bathroom: empty the trash and put in a new bag.',
    'Basement office: empty the trash and put in a new bag.',
    'Kids’ bathroom: empty the trash and put in a new bag.',
    'Master bathroom: empty the trash and put in a new bag.',
    'Red Monster: tie every bag closed and put them all in the Red Monster.',
    'Curb: take the Red Monster to the curb.'
  ] },
  { name: 'Laundry + clean your room (30 min)', steps: [
    'Collect: dirty clothes from your room’s laundry basket, your floor and the bathroom.',
    'Wash: start the washer.',
    'Dishes and trash: cups, bottles, plates and wrappers out of your room.',
    'Closet: clothes on hangers or folded in bins; closet floor clear.',
    'Bed: make your bed. Sheet straight, blankets pulled up, pillows and stuffed animals at the top.',
    'Tops: dresser, nightstand, shelves and window seat neat; things you keep where they belong.',
    'Floor: clear, including under the beds. Sharing a room? Clear the whole floor together.',
    'Dry: move the wet clothes to the dryer and start it.',
    'Fold: fold everything once it’s dry.',
    'Put away: in drawers, bins or on hangers; drawers shut.',
    'Baskets: empty laundry baskets back in your room and the bathroom.'
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
