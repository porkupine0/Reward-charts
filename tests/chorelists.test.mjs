// Chore step lists: built-ins, saved lists from Firebase (odd shapes included), ids and what gets saved.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS } from '../settings.js';
import { CHORE_LISTS, mergeLists, listsToSave, choreSteps, stepKey, cleanSteps, stepShows } from '../chorelists.js';

test('built-in lists are used when nothing is saved', () => {
  const l = mergeLists(undefined);
  assert.equal(l.length, CHORE_LISTS.length);
  const s = choreSteps(l, '  living room ');
  assert.equal(s.length, 8);
  assert.equal(s[0].label, 'Pick up');
  assert.match(s[0].sub, /^Take anything/);
  assert.equal(choreSteps(l, 'Kitchen helper'), null, 'no substring match');
  assert.ok(choreSteps(l, 'Dining/Front Room'), 'a name with / works');
});

test('saved lists from Firebase: number-keyed objects, blank lists and new names', () => {
  const saved = { 0: { name: 'Kitchen', steps: { 0: 'Wipe: counters', 1: '', 2: 'Wipe: counters', 3: 'Sweep' } }, 1: { name: 'Sunroom', steps: [''] }, 2: { name: 'Bathrooms', steps: ['Toilet: scrub it'] } };
  const l = mergeLists(saved);
  assert.deepEqual(choreSteps(l, 'kitchen').map((s) => s.label), ['Wipe', 'Sweep'], 'blanks and repeats dropped');
  assert.equal(choreSteps(l, 'Sweep') , null);
  assert.equal(choreSteps(l, 'Sunroom'), null, 'a blanked list is a single box');
  assert.equal(choreSteps(l, 'Bathrooms').length, 1);
  assert.equal(choreSteps(l, 'Kitchen')[1].sub, '', 'no colon: no detail line');
  assert.equal(choreSteps([{ name: 'X', steps: ['Start by 4:30'] }], 'X')[0].label, 'Start by 4:30', 'a time is not a bold part');
});

test('step ids follow the words, not the position', () => {
  const a = choreSteps([{ name: 'Kitchen', steps: ['Load: x', 'Sweep: y'] }], 'Kitchen');
  const b = choreSteps([{ name: 'kitchen', steps: ['Sweep: y', 'Load: x'] }], 'Kitchen');
  assert.equal(a[0].key, b[1].key);
  assert.notEqual(stepKey('Kitchen', 'Load: x'), stepKey('Sunroom', 'Load: x'));
  assert.match(a[0].key, /^st_[0-9a-z]+$/);
});

test('only lists that differ from the built-in ones are saved', () => {
  const l = mergeLists(undefined);
  assert.deepEqual(listsToSave(l), []);
  l.find((x) => x.name === 'Sunroom').steps = [];
  l.push({ name: 'Bathrooms', steps: ['Sink'] }, { name: 'Laundry', steps: [] });
  assert.deepEqual(listsToSave(l), [{ name: 'Sunroom', steps: [''] }, { name: 'Bathrooms', steps: ['Sink'] }]);
  assert.equal(cleanSteps(Array(30).fill(0).map((_, i) => 'step ' + i)).length, 15);
});

test('every built-in list matches a chore name exactly', () => {
  const names = new Set(Object.values(DEFAULTS.chores).flat(2).map((n) => n.trim().toLowerCase()));
  CHORE_LISTS.forEach((l) => assert.ok(names.has(l.name.trim().toLowerCase()), 'no chore named ' + l.name));
});

test('how-often tags: every other time and monthly', () => {
  const st = choreSteps([{ name: 'X', steps: ['[every other time] Mop: the floor', '[Monthly] Tub: scrub it', '[weekly] Odd: stays text', 'Sweep'] }], 'X');
  assert.equal(st[0].label, 'Mop'); assert.equal(st[0].when, 'other');
  assert.equal(st[1].label, 'Tub'); assert.equal(st[1].when, 'monthly');
  assert.equal(st[2].label, '[weekly] Odd', 'an unknown tag stays as text'); assert.equal(st[2].when, undefined);
  // Sunroom: Mon (Rhett), Wed (Eli), Fri (Isaiah) from Nov 16: the mop alternates across the boys
  const sun = ['2026-11-16', '2026-11-18', '2026-11-20', '2026-11-23'];
  assert.deepEqual(sun.map((d, i) => stepShows(st[0], d, sun.slice(0, i + 1))), [true, false, true, false]);
  // Bathrooms on Tuesdays: the first Tuesday of the month only
  const tue = ['2026-11-17', '2026-11-24', '2026-12-01', '2026-12-08'];
  assert.deepEqual(tue.map((d, i) => stepShows(st[1], d, tue.slice(0, i + 1))), [true, false, true, false]);
  assert.equal(stepShows(st[3], '2026-12-08', []), true);
});
