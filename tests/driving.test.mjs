// Driving course rules (driving.js), with made-up fixture lessons (no real content here).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const V = JSON.parse(readFileSync(new URL('../version.json', import.meta.url))).v;
const D = await import('../driving.js?v=' + V);

const q = (id) => ({ id, q: 'Q ' + id, choices: ['a', 'b', 'c'], answer: Number(id.slice(-1)) % 3, why: 'because', ref: "Iowa Driver's Manual p.1" });
const vid = { yt: 'AAAAAAAAAAA', title: 'T', channel: 'C', len: '5:00' };
// every 5th lesson is a review (no questions of its own)
const course = (n) => Array.from({ length: n }, (_, i) => {
  const review = (i + 1) % 5 === 0, id = 'L' + (i + 1);
  return { id, title: 'Lesson ' + (i + 1), review, videos: review ? [] : [vid], questions: review ? [] : [1, 2, 3, 4, 5].map((k) => q(id + 'q' + k)) };
});
const LESSONS = course(6);
const day = (n) => '2026-12-' + String(n).padStart(2, '0');
// record one answer (the first answer for a question in a lesson counts)
const answer = (p, qid, lid, ok, on) => { const a = (p.answers[qid] = p.answers[qid] || {}); if (!a[lid]) a[lid] = { ok, on }; };

test('driving: lessons go in order, one new a day, only once a parent approves', () => {
  const p = { approved: { L1: true, L2: true }, done: {}, answers: {} };
  assert.equal(D.lessonFor(LESSONS, p, day(1)).lesson.id, 'L1');
  assert.equal(D.lessonFor(LESSONS, p, day(1)).status, 'ready');
  p.done.L1 = day(1);
  assert.equal(D.lessonFor(LESSONS, p, day(1)).lesson.id, 'L1', 'one a day: today stays on L1');
  assert.equal(D.lessonFor(LESSONS, p, day(1)).status, 'done');
  assert.equal(D.lessonFor(LESSONS, p, day(2)).lesson.id, 'L2');
  p.done.L2 = day(2);
  assert.equal(D.lessonFor(LESSONS, p, day(3)).status, 'waiting', 'L3 not approved yet');
  p.approved.L3 = 'skip'; p.approved.L4 = true;
  assert.equal(D.lessonFor(LESSONS, p, day(3)).lesson.id, 'L4', 'a skipped lesson is passed over');
  const all = { approved: {}, done: Object.fromEntries(LESSONS.map((l, i) => [l.id, day(i + 1)])) };
  assert.equal(D.lessonFor(LESSONS, all, day(20)).status, 'finished');
});

test('driving: a review needs no approval; it is passed over when nothing before it is finished', () => {
  const L = course(6), all = Object.fromEntries(L.map((l) => [l.id, true]));
  const p = { approved: { L1: true, L2: true, L3: true, L4: true }, done: { L1: day(1), L2: day(2), L3: day(3), L4: day(4) } };
  assert.deepEqual([D.lessonFor(L, p, day(5)).lesson.id, D.lessonFor(L, p, day(5)).status], ['L5', 'ready'], 'review ready without approval');
  const skipped = { approved: { L1: 'skip', L2: 'skip', L3: 'skip', L4: 'skip', L6: true }, done: {} };
  assert.equal(D.lessonFor(L, skipped, day(5)).lesson.id, 'L6', 'nothing finished before it: the review is passed over');
  assert.ok(all);
});

test('driving: the quiz does not change while he takes it', () => {
  const p = { done: { L1: day(1), L2: day(2) }, answers: {} };
  ['L1q1', 'L1q2', 'L1q3', 'L2q1', 'L2q2', 'L2q3'].forEach((id, i) => answer(p, id, id.slice(0, 2), true, day(id[1] === '1' ? 1 : 2)));
  const before = D.quizFor(LESSONS, 2, p).map((x) => x.id);
  assert.deepEqual(before.slice(0, 3), ['L3q1', 'L3q2', 'L3q3']);
  before.forEach((id) => { answer(p, id, 'L3', id === before[3] ? false : true, day(3)); assert.deepEqual(D.quizFor(LESSONS, 2, p).map((x) => x.id), before, 'same after answering ' + id); });
});

test('driving: earlier questions come only from finished lessons (not skipped ones)', () => {
  const p = { done: { L1: day(1) }, approved: { L1: true, L2: 'skip', L3: true }, answers: {} };
  const quiz = D.quizFor(LESSONS, 2, p).map((x) => x.id);
  assert.ok(!quiz.some((id) => id.startsWith('L2')), 'nothing from the skipped lesson: ' + quiz);
  assert.ok(quiz.slice(3).every((id) => id.startsWith('L1')));
});

test('driving: a missed question comes back twice, then rotates out; review slots rotate', () => {
  const L = course(15), p = { done: {}, answers: {} };
  const asked = [], ever = new Set(), early = [];
  let missedOnce = false, missedId = null;
  L.forEach((lesson, i) => {
    const quiz = D.quizFor(L, i, p).map((x) => x.id), date = day(i + 1);
    const review = quiz.filter((id) => !id.startsWith(lesson.id + 'q'));
    review.forEach((id) => asked.push([i, id]));
    // a review question already asked before, while a finished lesson still has a never-asked one, is too early
    // (the "two or more lessons back" slot may repeat, but only once that older range has all been asked)
    const older = L.filter((l, k) => p.done[l.id] && k <= i - 2).flatMap((l) => l.questions.map((x) => x.id));
    review.forEach((id) => { if (ever.has(id) && id !== missedId && older.some((x) => !ever.has(x) && !review.includes(x))) early.push(lesson.id + ':' + id); });
    quiz.forEach((id) => ever.add(id));
    quiz.forEach((id) => {
      // one early miss: the first review question asked, the first time
      const wrong = !missedOnce && review.length && id === review[0];
      if (wrong) { missedOnce = true; missedId = id; }
      answer(p, id, lesson.id, !wrong, date);
    });
    p.done[lesson.id] = date;
  });
  assert.ok(missedId, 'a question was missed');
  const times = asked.filter(([, id]) => id === missedId).map(([i]) => i);
  assert.ok(times.length >= 3, 'the missed one came back: asked on lessons ' + times.map((i) => i + 1));
  const firstMiss = times[0];
  assert.deepEqual(times.slice(1, 3), [firstMiss + 1, firstMiss + 2], 'right away, twice');
  // apart from those two returns, nothing repeats while a finished lesson still has a question never asked
  assert.deepEqual(early, []);
  // spacing: from lesson 4 on, every regular day reaches two or more lessons back
  L.forEach((lesson, i) => {
    if (i < 3 || lesson.review) return;
    const old = asked.filter(([k, id]) => k === i && Number(id.slice(1, id.indexOf('q'))) <= i - 1);
    assert.ok(old.length >= 1, lesson.id + ' reaches back: ' + asked.filter(([k]) => k === i).map(([, id]) => id));
  });
  assert.ok(asked.length > 20);
});

test('driving: a review lesson is all earlier questions', () => {
  const p = { done: { L1: day(1), L2: day(2), L3: day(3), L4: day(4) }, answers: {} };
  const quiz = D.quizFor(LESSONS, 4, p);
  assert.equal(quiz.length, 5);
  assert.ok(quiz.every((x) => /^L[1-4]q/.test(x.id)));
});

test('driving: grading', () => {
  const quiz = D.quizFor(LESSONS, 1, { done: { L1: day(1) }, answers: {} });
  const picks = Object.fromEntries(quiz.map((x, i) => [x.id, i === 1 || i === 4 ? (x.answer + 1) % 3 : x.answer]));
  const g = D.grade(quiz, picks);
  assert.equal(g.total, 5); assert.equal(g.right, 3); assert.deepEqual(g.missed, [quiz[1].id, quiz[4].id]);
});

test('driving: the content checker catches bad lessons and questions', () => {
  assert.deepEqual(D.checkCourse(course(10)), []);
  const bad = course(6);
  bad[0].questions[1].id = bad[0].questions[0].id;        // duplicate id
  bad[1].questions.pop();                                   // only 4 questions
  bad[2].questions[0].answer = 7;                           // answer not a choice
  bad[2].questions[1].why = '';                             // no explanation
  bad[2].questions[2].ref = 'the video';                    // no manual page
  bad[3].review = true;                                     // review in the wrong place
  const problems = D.checkCourse(bad).join('\n');
  ['L1q1: id used twice', 'L2: needs at least 5 questions', 'not one of the choices', 'needs an explanation', 'needs a manual page', 'L4: lesson 4 should not be a review'].forEach((t) => assert.ok(problems.includes(t), t + '\n' + problems));
  const more = course(10);
  more[4].review = false; more[4].questions = [1, 2, 3, 4, 5].map((k) => q('L5q' + k)); more[4].videos = [vid]; // no review at position five
  more[5].videos = [];                  // a lesson with no video
  more[6].id = 'L6';                    // a repeated lesson id
  const p2 = D.checkCourse(more).join('\n');
  ['L5: lesson 5 should be a review', 'L6: needs a video', 'L6: lesson id used twice'].forEach((t) => assert.ok(p2.includes(t), t + '\n' + p2));
  const shape = course(5);
  shape[0].videos = [{ id: 'AAAAAAAAAAA', title: 'T', channel: 'C', len: '5:00' }];   // wrong key
  shape[1].videos = [{ yt: 'AAAAAAAAAAA', title: 'T', len: '5 min' }];              // no channel, bad length
  shape[2].id = 'L|3';                                                               // a | in an id
  shape[3].questions.forEach((x) => { x.answer = 1; });                              // same position every time
  const p3 = D.checkCourse(shape).join('\n');
  ['L1: video 1 needs an 11-character YouTube id', 'L2: video 1 needs a title, channel and length', 'L|3: lesson id must be letters and digits', 'L4: the right answer is in the same position'].forEach((t) => assert.ok(p3.includes(t), t + '\n' + p3));
});

test('driving: when a lesson is due (for the streak): approved the day before or earlier', () => {
  const L5 = course(6), dow = (k) => (new Date(k + 'T12:00').getDay() + 6) % 7, due = (p, k) => { const r = D.dueOn(L5, p, k, dow(k)); return r ? r.lesson.id + ':' + r.due : null; };
  const p = { approved: { L1: '2026-11-16' }, done: {} };              // approved Monday
  assert.equal(due(p, '2026-11-16'), 'L1:optional', 'optional the day it is approved');
  assert.equal(due(p, '2026-11-17'), 'L1:required', 'required from the next day');
  assert.equal(due(p, '2026-11-21'), null, 'nothing on a Saturday');
  p.done.L1 = '2026-11-18';
  assert.equal(due(p, '2026-11-18'), 'L1:required', 'the day it was finished');
  assert.equal(due(p, '2026-11-19'), null, 'L2 not approved: nothing due (waiting)');
  assert.equal(due({ approved: {}, done: {} }, '2026-11-18'), null, 'nothing approved: nothing due');
  assert.equal(due({ approved: { L1: true }, done: {} }, '2026-11-18'), 'L1:required', 'older approvals (true) count as before');
  assert.equal(due({ approved: { L1: 'skip', L2: '2026-11-01' }, done: {} }, '2026-11-18'), 'L2:required', 'a skipped lesson is passed over');
  const r = { approved: { L1: '2026-11-01', L2: '2026-11-01', L3: '2026-11-01', L4: '2026-11-01' }, done: { L1: '2026-11-16', L2: '2026-11-17', L3: '2026-11-18', L4: '2026-11-19' } };
  assert.equal(due(r, '2026-11-20'), 'L5:required', 'a review is due once an earlier lesson is finished');
  assert.ok(D.isApproved('2026-11-16') && D.isApproved(true) && !D.isApproved('skip') && !D.isApproved(undefined));
});

test('driving: a later skip does not rewrite the days he was waiting', () => {
  const L6 = course(6), dow = (k) => (new Date(k + 'T12:00').getDay() + 6) % 7, due = (p, k) => { const r = D.dueOn(L6, p, k, dow(k)); return r ? r.lesson.id + ':' + r.due : null; };
  // L1 done Mon; L3 approved early; L2 not reviewed until Thursday, when a parent skips it
  const p = { approved: { L1: '2026-11-01', L3: '2026-11-01', L2: 'skip:2026-11-19' }, done: { L1: '2026-11-16' } };
  assert.equal(due(p, '2026-11-17'), null, 'Tue: waiting on L2, nothing due');
  assert.equal(due(p, '2026-11-18'), null, 'Wed: still waiting');
  assert.equal(due(p, '2026-11-19'), 'L3:optional', 'Thu: skipped today, so L3 is only optional');
  assert.equal(due(p, '2026-11-20'), 'L3:required', 'Fri: L3 required');
  // older skips without a date are passed over as before
  assert.equal(due({ approved: { L1: 'skip', L2: '2026-11-01' }, done: {} }, '2026-11-18'), 'L2:required');
});

test('driving course content: passes the checker, and every quote is on its cited page of the Iowa manual', async () => {
  const { LESSONS } = await import('../driving-course.js?v=' + V);
  assert.deepEqual(D.checkCourse(LESSONS), []);
  const manual = readFileSync(new URL('../docs/iowa/drivers-manual.txt', import.meta.url), 'utf8');
  const pages = {};
  manual.split(/\n===== PDF page (\d+) =====\n/).forEach((t, i, arr) => { if (i % 2) pages[arr[i]] = arr[i + 1]; });
  const norm = (x) => x.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
  const missing = [];
  LESSONS.forEach((l) => (l.questions || []).forEach((q) => {
    const page = q.ref.match(/p\.\s?(\d+)/)[1];
    if (!q.quote || !norm(pages[page] || '').includes(norm(q.quote))) missing.push(q.id + ' (p.' + page + '): ' + q.quote);
  }));
  assert.deepEqual(missing, []);
});
