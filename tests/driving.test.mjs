// Driving course rules (driving.js), with made-up fixture lessons (no real content here).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const V = JSON.parse(readFileSync(new URL('../version.json', import.meta.url))).v;
const D = await import('../driving.js?v=' + V);

const q = (id) => ({ id, q: 'Q ' + id, choices: ['a', 'b', 'c'], answer: 0, why: 'because', ref: 'Manual p.1' });
const lesson = (n, review) => ({ id: 'L' + n, title: 'Lesson ' + n, review: !!review, videos: [], questions: review ? [] : [1, 2, 3, 4].map((k) => q('L' + n + 'q' + k)) });
const LESSONS = [lesson(1), lesson(2), lesson(3), lesson(4), lesson(5, true), lesson(6)];

test('driving: lessons go in order, one new a day, only once a parent approves', () => {
  const p = { approved: { L1: true, L2: true }, done: {}, answers: {} };
  assert.equal(D.lessonFor(LESSONS, p, '2026-11-23').lesson.id, 'L1');
  assert.equal(D.lessonFor(LESSONS, p, '2026-11-23').status, 'ready');
  p.done.L1 = '2026-11-23';
  assert.equal(D.lessonFor(LESSONS, p, '2026-11-23').lesson.id, 'L1', 'one a day: today stays on L1');
  assert.equal(D.lessonFor(LESSONS, p, '2026-11-23').status, 'done');
  assert.equal(D.lessonFor(LESSONS, p, '2026-11-24').lesson.id, 'L2', 'next day: L2');
  p.done.L2 = '2026-11-24';
  assert.equal(D.lessonFor(LESSONS, p, '2026-11-25').status, 'waiting', 'L3 not approved yet');
  p.approved.L3 = 'skip'; p.approved.L4 = true;
  assert.equal(D.lessonFor(LESSONS, p, '2026-11-25').lesson.id, 'L4', 'a skipped lesson is passed over');
  const all = { approved: Object.fromEntries(LESSONS.map((l) => [l.id, true])), done: Object.fromEntries(LESSONS.map((l, i) => [l.id, '2026-12-0' + (i + 1)])) };
  assert.equal(D.lessonFor(LESSONS, all, '2026-12-20').status, 'finished');
});

test('driving: quiz is 3 from today and 2 from earlier, missed first, the same on reload', () => {
  const none = { answers: {} };
  assert.deepEqual(D.quizFor(LESSONS, 0, none).map((x) => x.id), ['L1q1', 'L1q2', 'L1q3', 'L1q4'], 'day 1: only its own questions');
  assert.deepEqual(D.quizFor(LESSONS, 2, none).map((x) => x.id), ['L3q1', 'L3q2', 'L3q3', 'L1q1', 'L1q2'], 'earlier: in course order when nothing answered');
  const p = { answers: { L1q1: [{ on: '2026-11-23', ok: true }], L1q2: [{ on: '2026-11-23', ok: true }], L2q4: [{ on: '2026-11-24', ok: false }], L1q3: [{ on: '2026-11-23', ok: false }, { on: '2026-11-25', ok: true }] } };
  const quiz = D.quizFor(LESSONS, 2, p).map((x) => x.id);
  assert.deepEqual(quiz.slice(0, 3), ['L3q1', 'L3q2', 'L3q3']);
  assert.equal(quiz[3], 'L2q4', 'the one last answered wrong comes first');
  assert.equal(quiz[4], 'L1q3', 'then the one missed before');
  assert.deepEqual(D.quizFor(LESSONS, 2, p).map((x) => x.id), quiz, 'same quiz on reload');
});

test('driving: a review lesson is all earlier questions', () => {
  const quiz = D.quizFor(LESSONS, 4, { answers: {} });
  assert.equal(quiz.length, 5);
  assert.ok(quiz.every((x) => /^L[1-4]q/.test(x.id)));
});

test('driving: grading', () => {
  const quiz = D.quizFor(LESSONS, 1, { answers: {} });
  const g = D.grade(quiz, { L2q1: 0, L2q2: 1, L2q3: 0, L1q1: 0 });
  assert.equal(g.total, 5); assert.equal(g.right, 3); assert.deepEqual(g.missed, ['L2q2', 'L1q2']);
});
