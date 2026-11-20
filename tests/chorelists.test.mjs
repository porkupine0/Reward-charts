// Chore step lists: built-ins, saved lists from Firebase (odd shapes included), ids and what gets saved.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CHORE_LISTS, mergeLists, listsToSave, choreSteps, stepKey, cleanSteps } from '../chorelists.js';

test('built-in lists are used when nothing is saved', () => {
  const l = mergeLists(undefined);
  assert.equal(l.length, CHORE_LISTS.length);
  const s = choreSteps(l, '  living room ');
  assert.equal(s.length, 8);
  assert.equal(s[0].label, 'Pick up');
  assert.match(s[0].sub, /^Take anything/);
  assert.equal(choreSteps(l, 'Kitchen + dining room with the family'), null, 'no substring match');
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
