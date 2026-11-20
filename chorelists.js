// Step-by-step lists for chores: each step brings one part of the room back to normal.
// Matched to a chore by its exact name (case and spaces at the ends don't matter). A chore with no list
// stays a single box. Step ids are saved with each tick, so never change or reuse an id; edit the words freely.
const LISTS = {
  'living room': { id: 'living', steps: [
    ['pickup', 'Pick up', 'Take anything that doesn’t belong in here back where it goes.'],
    ['blankets', 'Blankets', 'Fold every throw blanket and lay it over a couch arm.'],
    ['couches', 'Couches', 'Straighten the cushions, stand the pillows up and check between the cushions.'],
    ['places', 'Back in place', 'Bean bag in its corner, desk chair pushed in, remotes by the TV.'],
    ['tables', 'Tables', 'Clear and straighten the little table and the table by the mirror.'],
    ['dust', 'Dust', 'Dust the shelves and mantel and set the pictures straight.'],
    ['glass', 'Dry cloth', 'Wipe the TV screen and the big mirror with a dry cloth.'],
    ['vacuum', 'Vacuum', 'The whole carpet, along the walls and under the front of the couches.']
  ] },
  'sunroom': { id: 'sun', steps: [
    ['pickup', 'Pick up', 'Take anything that doesn’t belong in here back where it goes. Trash and recycling out.'],
    ['games', 'Games', 'Paddles, balls and puzzle pieces back where they’re kept. Leave a puzzle someone is still working on.'],
    ['counter', 'Bar counter', 'Clear it, then wipe the counter and the little sink with a disinfecting wipe.'],
    ['scarlett', 'Scarlett’s corner', 'Dog toys put away, crate cover straight, water fountain filled, spills wiped up.'],
    ['chairs', 'Chairs', 'Push in the table chairs and bar stools and straighten the cushions.'],
    ['glass', 'Glass', 'Wipe nose and paw prints off the French doors and low windows.'],
    ['sweep', 'Sweep', 'The whole tile floor, corners and under the table and stools too.'],
    ['mop', 'Mop', 'Mop the floor, then put the mop and broom back by the door.']
  ] },
  'kitchen': { id: 'kitchen', steps: [
    ['food', 'Food away', 'Leftovers into containers and the fridge; everything else back in the pantry.'],
    ['unload', 'Unload', 'If the dishwasher is clean, empty it first.'],
    ['load', 'Load', 'Rinse the dishes and load the dishwasher. Run it if it’s full.'],
    ['handwash', 'Hand-wash', 'Wash, dry and put away pans and cutting boards that don’t go in the dishwasher. Cast iron: hot water and the brush, a drop of soap is okay, never soak it, dry it right away.'],
    ['counters', 'Counters', 'Clear the counters and island, then wipe them and the stovetop once it’s cool.'],
    ['fronts', 'Fronts', 'Wipe the microwave inside and out, and the fridge, dishwasher and oven doors.'],
    ['sink', 'Sink', 'Scrub the sink and faucet, shake out the drying mat, hang up the dish towels.'],
    ['trash', 'Trash', 'Empty the kitchen trash, put in a new bag, flatten boxes for recycling.'],
    ['floor', 'Floor', 'Sweep the whole floor, under the island and table too, and wipe up sticky spots.']
  ] }
};

const norm = (s) => String(s || '').trim().toLowerCase();

// The steps for a chore name, or null. Each step: { key (saved under the day), label, sub }.
export function choreSteps(label) {
  const l = LISTS[norm(label)];
  return l ? l.steps.map(([id, lead, text]) => ({ key: 'st_' + l.id + '_' + id, label: lead, sub: text })) : null;
}

// Is a chore with steps done? Its own box is the record; the steps only fill it.
export const stepsDone = (checks, steps) => steps.every((s) => checks[s.key]);
