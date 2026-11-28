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
  return { id, title: 'Lesson ' + (i + 1), review, videos: review ? [] : [vid], key: review ? [] : [{ t: 'A', ref: "Iowa Driver's Manual p.1", quote: 'x' }, { t: 'B', family: true }], questions: review ? [] : [1, 2, 3, 4, 5].map((k) => q(id + 'q' + k)) };
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
  assert.deepEqual([D.lessonFor(LESSONS, p, day(3)).lesson.id, D.lessonFor(LESSONS, p, day(3)).status], ['L3', 'ready'], 'a skip skips only the video: the lesson still runs');
  const all = { approved: {}, done: Object.fromEntries(LESSONS.map((l, i) => [l.id, day(i + 1)])) };
  assert.equal(D.lessonFor(LESSONS, all, day(20)).status, 'finished');
});

test('driving: a review needs no approval; it is passed over when nothing before it is finished', () => {
  const L = course(6), all = Object.fromEntries(L.map((l) => [l.id, true]));
  const p = { approved: { L1: true, L2: true, L3: true, L4: true }, done: { L1: day(1), L2: day(2), L3: day(3), L4: day(4) } };
  assert.deepEqual([D.lessonFor(L, p, day(5)).lesson.id, D.lessonFor(L, p, day(5)).status], ['L5', 'ready'], 'review ready without approval');
  const skipped = { approved: { L1: 'skip', L2: 'skip', L3: 'skip', L4: 'skip', L6: true }, done: {} };
  assert.equal(D.lessonFor(L, skipped, day(5)).lesson.id, 'L1', 'videos skipped: the lessons still run, in order');
  assert.ok(all);
});

test('driving: the quiz does not change while he takes it', () => {
  const p = { done: { L1: day(1), L2: day(2) }, answers: {} };
  ['L1q1', 'L1q2', 'L1q3', 'L2q1', 'L2q2', 'L2q3'].forEach((id, i) => answer(p, id, id.slice(0, 2), true, day(id[1] === '1' ? 1 : 2)));
  const before = D.quizFor(LESSONS, 2, p).map((x) => x.id);
  assert.deepEqual(before.slice(0, 3), ['L3q1', 'L3q2', 'L3q3']);
  before.forEach((id) => { answer(p, id, 'L3', id === before[3] ? false : true, day(3)); assert.deepEqual(D.quizFor(LESSONS, 2, p).map((x) => x.id), before, 'same after answering ' + id); });
});

test('driving: earlier questions come only from finished lessons (a lesson whose video was skipped counts once he finishes its quiz)', () => {
  const p = { done: { L1: day(1) }, approved: { L1: true, L2: 'skip', L3: true }, answers: {} };
  const quiz = D.quizFor(LESSONS, 2, p).map((x) => x.id);
  assert.ok(!quiz.some((id) => id.startsWith('L2')), 'nothing from L2 before he has done it: ' + quiz);
  p.done.L2 = day(2);
  assert.ok(D.quizFor(LESSONS, 2, p).some((x) => x.id.startsWith('L2')), 'once its quiz is done, the skipped-video lesson\'s questions come back');
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

test('driving: the unit test is 4 questions from each finished lesson of its unit, never-asked first', () => {
  const p = { done: { L1: day(1), L2: day(2), L3: day(3), L4: day(4) }, answers: {} };
  // asked in daily quizzes: L1q1-q4 (right); L3q1 (missed), L3q2-q3 (right)
  ['L1q1', 'L1q2', 'L1q3', 'L1q4'].forEach((id) => answer(p, id, 'L1', true, day(1)));
  answer(p, 'L3q1', 'L3', false, day(3)); answer(p, 'L3q2', 'L3', true, day(3)); answer(p, 'L3q3', 'L3', true, day(3));
  const quiz = D.quizFor(LESSONS, 4, p);
  assert.equal(quiz.length, 16);
  assert.ok(quiz.every((x) => /^L[1-4]q/.test(x.id)));
  const l1 = quiz.filter((x) => x.id.startsWith('L1')).map((x) => x.id);
  assert.deepEqual(l1, ['L1q1', 'L1q2', 'L1q3', 'L1q5'], 'L1: its never-asked question first, then the least recently asked');
  assert.deepEqual(quiz.filter((x) => x.id.startsWith('L3')).map((x) => x.id), ['L3q1', 'L3q2', 'L3q4', 'L3q5'], 'L3: never-asked, then the missed one, then the least recent');
  // only finished lessons count
  assert.equal(D.quizFor(LESSONS, 4, { done: { L1: day(1), L2: day(2) }, answers: {} }).length, 8);
  // the next unit's test only uses its own unit (L6-L9)
  const ten = course(10), p2 = { done: Object.fromEntries(ten.map((l, i) => [l.id, day(i + 1)])), answers: {} };
  const t2 = D.quizFor(ten, 9, p2);
  assert.ok(t2.slice(0, 16).every((x) => /^L[6-9]q/.test(x.id)) && t2.slice(16).every((x) => /^L[1-4]q/.test(x.id)) && t2.length === 20, 'its own unit (L6-L9), plus up to 4 never-asked from unit 1');
});

test('driving: a unit test looks only at its own unit (an empty one would be passed over)', () => {
  // every video of unit 2 skipped: the lessons still run, so its test has their questions
  const ten = course(11), p = { approved: { L1: '2026-11-01', L2: '2026-11-01', L3: '2026-11-01', L4: '2026-11-01', L6: 'skip:2026-12-01', L7: 'skip:2026-12-01', L8: 'skip:2026-12-01', L9: 'skip:2026-12-01', L11: '2026-12-01' },
    done: { L1: day(1), L2: day(2), L3: day(3), L4: day(4), L5: day(5) }, answers: {} };
  assert.equal(D.lessonFor(ten, p, day(8)).lesson.id, 'L6', 'videos skipped: the unit 2 lessons still run');
  Object.assign(p.done, { L6: day(6), L7: day(7), L8: day(8), L9: '2026-12-09' });
  assert.equal(D.lessonFor(ten, p, '2026-12-10').lesson.id, 'L10');
  assert.equal(D.quizFor(ten, 9, p).filter((x) => /^L[6-9]q/.test(x.id)).length, 16, 'its test has all four lessons');
  // the guard: a unit test with nothing finished in its own unit is passed over (unit 1's lessons don't count)
  const odd = [...ten.slice(0, 5), { ...ten[9], id: 'T2' }, ...ten.slice(10)];
  assert.equal(D.lessonFor(odd, { approved: { L11: '2026-12-01' }, done: { L1: day(1), L2: day(2), L3: day(3), L4: day(4), L5: day(5) } }, day(8)).lesson.id, 'L11');
});

test('driving: the unit test stays the same while he takes it, and its misses come back afterwards', () => {
  const p = { done: { L1: day(1), L2: day(2), L3: day(3), L4: day(4) }, answers: {} };
  const before = D.quizFor(LESSONS, 4, p).map((x) => x.id);
  before.slice(0, 6).forEach((id, i) => answer(p, id, 'L5', i !== 2, day(5)));
  assert.deepEqual(D.quizFor(LESSONS, 4, p).map((x) => x.id), before, 'same questions after some answers');
  // finish the test (L5 done); the one he missed is first in line for the next lesson's review slots
  before.slice(6).forEach((id) => answer(p, id, 'L5', true, day(5)));
  p.done.L5 = day(5);
  const next = D.quizFor(LESSONS, 5, p).map((x) => x.id);
  assert.ok(next.slice(3).includes(before[2]), 'the missed question comes back: ' + next);
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
  const signed = course(2); signed[0].questions[0].sign = { shape: 'octagon', color: 'red' }; signed[0].questions[1].sign = { shape: 'hexagon', color: 'red' }; signed[1].questions[0].sign = { shape: 'diamond', color: 'purple' };
  assert.match(D.checkCourse(signed).join(' | '), /L1q2: unknown sign shape hexagon.*L2q1: unknown sign color purple/);
  assert.ok(!D.checkCourse(signed).join(' ').includes('L1q1'), 'a good sign passes');
  // guessable answers: bunched in one position, usually the longest choice, usually the same length rank
  const four = (id, ans, long) => ({ id, q: 'Q', choices: [0, 1, 2, 3].map((i) => (i === ans ? (long ? 'a much longer right answer' : 'ok') : 'wrong ' + i)), answer: ans, why: 'w', ref: "Iowa Driver's Manual p.1" });
  const g = course(2);
  g[0].questions = [1, 2, 3, 4, 5, 6].map((k) => four('L1q' + k, 1, true));
  g[1].questions = [0, 1, 2, 3, 0, 1].map((a, k) => four('L2q' + k, a, false));
  const gout = D.checkCourse(g).join(' | ');
  assert.match(gout, /L1: right answers bunched/); assert.match(gout, /L1: the right answer is the longest choice in 6 of 6/);
  assert.match(gout, /L2: the right answer is usually the same length rank/); assert.ok(!/L2: right answers bunched|L2: the right answer is the longest/.test(gout));
  const nokey = course(2); nokey[0].key = [nokey[0].key[0]]; nokey[1].key[0] = { t: 'C' };
  assert.match(D.checkCourse(nokey).join(' | '), /L1: needs at least 2 key points.*L2: key point 1 needs a manual page and quote/);
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
  assert.equal(due({ approved: { L1: 'skip', L2: '2026-11-01' }, done: {} }, '2026-11-18'), 'L1:required', 'an old undated skip counts like an old approval (the lesson runs, without its video)');
  const r = { approved: { L1: '2026-11-01', L2: '2026-11-01', L3: '2026-11-01', L4: '2026-11-01' }, done: { L1: '2026-11-16', L2: '2026-11-17', L3: '2026-11-18', L4: '2026-11-19' } };
  assert.equal(due(r, '2026-11-20'), 'L5:required', 'a review is due once an earlier lesson is finished');
  assert.ok(D.isApproved('2026-11-16') && D.isApproved(true) && !D.isApproved('skip') && !D.isApproved(undefined));
});

test('driving: a later skip does not rewrite the days he was waiting', () => {
  const L6 = course(6), dow = (k) => (new Date(k + 'T12:00').getDay() + 6) % 7, due = (p, k) => { const r = D.dueOn(L6, p, k, dow(k)); return r ? r.lesson.id + ':' + r.due : null; };
  // L1 done Mon; L3 approved early; L2 not reviewed until Thursday, when a parent skips its video
  const p = { approved: { L1: '2026-11-01', L3: '2026-11-01', L2: 'skip:2026-11-19' }, done: { L1: '2026-11-16' } };
  assert.equal(due(p, '2026-11-17'), null, 'Tue: waiting on L2, nothing due');
  assert.equal(due(p, '2026-11-18'), null, 'Wed: still waiting');
  assert.equal(due(p, '2026-11-19'), 'L2:optional', 'Thu: skipped (video) today, so L2 is only optional today, like an approval');
  assert.equal(due(p, '2026-11-20'), 'L2:required', 'Fri: L2 (its video skipped) is required');
  // older skips without a date count like an old approval
  assert.equal(due({ approved: { L1: 'skip', L2: '2026-11-01' }, done: {} }, '2026-11-18'), 'L1:required');
});

test('driving course and knowledge tests: pass the checkers, and every quote is on its cited page of the Iowa manual', async () => {
  const { LESSONS } = await import('../driving-course.js?v=' + V);
  assert.deepEqual(D.checkCourse(LESSONS), []);
  const manual = readFileSync(new URL('../docs/iowa/drivers-manual.txt', import.meta.url), 'utf8');
  const pages = {};
  manual.split(/\n===== PDF page (\d+) =====\n/).forEach((t, i, arr) => { if (i % 2) pages[arr[i]] = arr[i + 1]; });
  const norm = (x) => x.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/-/g, '').replace(/\s+/g, ' ').trim(); // (ignores hyphens and line breaks)
  const missing = [];
  const { FORMS, SITTINGS, TOPICS, BLUEPRINT } = await import('../driving-tests.js?v=' + V);
  assert.deepEqual(D.checkTests(FORMS, SITTINGS, TOPICS, LESSONS, BLUEPRINT), []);
  assert.deepEqual(Object.keys(BLUEPRINT), TOPICS);
  [...LESSONS.flatMap((l) => [...(l.questions || []), ...(l.key || []).filter((x) => !x.family).map((x, i) => ({ ...x, id: l.id + ' key ' + (i + 1) }))]), ...Object.values(FORMS).flat()].forEach((q) => {
    const dot = Object.values(D.SOURCES).find((s) => s.ref === q.ref);
    const page = dot ? dot.file : q.ref.match(/p\.\s?(\d+)/)[1];
    const text = dot ? readFileSync(new URL('../docs/iowa/' + dot.file, import.meta.url), 'utf8').split('\n').slice(2).join('\n') : pages[page] || ''; // (skips the Source/Saved lines)
    if (!q.quote || !norm(text).includes(norm(q.quote))) missing.push(q.id + ' (' + (dot ? '' : 'p.') + page + '): ' + q.quote);
  });
  assert.deepEqual(missing, []);
});

test('knowledge tests: score overall and per topic; done only when every question is answered and he tapped Finish', () => {
  const form = [['a1', 'Signs'], ['a2', 'Signs'], ['a3', 'Right of way']].map(([id, topic]) => ({ id, topic, answer: 0 }));
  const p = { answers: { a1: { base: { ok: true, on: day(1) } }, a3: { base: { ok: false, on: day(2) } }, a2: { L1: { ok: true, on: day(1) } } } };
  let s = D.testScore(form, p, 'base');
  assert.deepEqual([s.answered, s.right, s.done, s.passed], [2, 1, false, false], 'an answer from a lesson does not count for the test');
  assert.equal(D.testDoneOn(form, p, 'base'), null);
  p.answers.a2.base = { ok: true, on: day(3) };
  s = D.testScore(form, p, 'base');
  assert.deepEqual([s.answered, s.allIn, s.done], [3, true, false], 'all answered: not done until he taps Finish');
  assert.equal(D.testDoneOn(form, p, 'base'), null);
  p.watched = { base: day(4) };
  s = D.testScore(form, p, 'base');
  assert.deepEqual([s.answered, s.right, s.done, s.pct, s.passed], [3, 2, true, 67, false]);
  assert.deepEqual(s.byTopic, [{ topic: 'Signs', right: 2, total: 2 }, { topic: 'Right of way', right: 0, total: 1 }]);
  assert.equal(D.testDoneOn(form, p, 'base'), day(4), 'done on the day he tapped Finish');
  p.answers.a3.base.ok = true;
  assert.equal(D.testScore(form, p, 'base').passed, true);
  assert.equal(D.testScore(form, p, 'p1').answered, 0, 'each sitting is scored on its own');
});

test('knowledge tests: a sitting opens on its date, and after its lesson is finished', () => {
  const S = [{ id: 'base', form: 'A', from: day(1) }, { id: 'p1', form: 'A', from: day(1), after: 'L4' }];
  assert.deepEqual(D.openSittings(S, {}, '2026-11-30').map((s) => s.id), []);
  assert.deepEqual(D.openSittings(S, {}, day(1)).map((s) => s.id), ['base']);
  assert.deepEqual(D.openSittings(S, { done: { L4: day(5) } }, day(5)).map((s) => s.id), ['base', 'p1']);
});

test('knowledge tests: the checker catches bad forms and sittings', () => {
  const good = Array.from({ length: 25 }, (_, i) => ({ id: 't' + i, topic: 'Signs', q: 'Question ' + i, choices: ['a', 'bb', 'ccc', 'dddd'], answer: i % 4, why: 'w', ref: "Iowa Driver's Manual p.6" }));
  assert.deepEqual(D.checkTests({ A: good }, [{ id: 'base', form: 'A' }], ['Signs'], LESSONS), []);
  const bad = good.slice(0, 24).concat([{ ...good[0], id: 'L1q1', topic: 'Nope', answer: 9, why: '' }]);
  const out = D.checkTests({ A: bad }, [{ id: 'L1', form: 'B', after: 'nope' }], ['Signs'], LESSONS, { Signs: 25 }).join(' | ');
  for (const m of ['L1q1: id used twice', 'unknown topic', 'answer is not one of the choices', 'needs an explanation', 'sitting id is also a lesson id', 'unknown form B', 'after names no lesson', '24 Signs questions (blueprint says 25)']) assert.ok(out.includes(m), m + ' in ' + out);
  // a new form: no question the same as a lesson's or another form's; number questions within one of 9
  const formB = good.map((x, i) => ({ ...x, id: 'b' + i, q: i === 0 ? 'Q ' + LESSONS[0].questions[0].id : i === 1 ? 'Question 2' : 'Other ' + i, num: i < 3 }));
  const bout = D.checkTests({ A: good, B: formB }, [], ['Signs'], LESSONS).join(' | ');
  assert.match(bout, /b0: same question as L1q1/); assert.match(bout, /b1: same question as t2/); assert.match(bout, /form B: 3 number questions \(Form A has 9\)/);
  // answers bunched in one position, a run of four, the right answer always the longest, 3 choices
  const bunched = good.map((x, i) => ({ ...x, answer: i < 12 ? 1 : i % 4 }));
  assert.match(D.checkTests({ A: bunched }, [], ['Signs'], []).join(' | '), /not spread evenly.*4 right answers in a row/);
  const longest = good.map((x) => ({ ...x, choices: x.choices.map((c, i) => (i === x.answer ? 'a much longer right answer' : c)) }));
  assert.match(D.checkTests({ A: longest }, [], ['Signs'], []).join(' | '), /the right answer is the longest choice 25 times/);
  assert.match(D.checkTests({ A: good.map((x) => ({ ...x, choices: ['a', 'b', 'c'], answer: x.answer % 3 })) }, [], ['Signs'], []).join(' | '), /every question needs 4 choices/);
});

const FORM_A_SHA = '0a697406d3a9a637ef0476a89921e3f8ef3101252bc307e0d205c0f93d1d9312'; // Form A as of bc148bc (Nov 20)
// Form A is the baseline Eli took (Sat Nov 21, 2026, evening, Iowa time; 80%): it must never change
// (later scores compare against it).
// If this fails, put Form A back; a new or changed question belongs in a new form.
test('Form A (the baseline he has taken) is unchanged', async () => {
  const { createHash } = await import('node:crypto');
  const { FORMS } = await import('../driving-tests.js?v=' + V);
  assert.equal(createHash('sha256').update(JSON.stringify(FORMS.A)).digest('hex'), FORM_A_SHA);
});

test('sources: a manual page or a saved Iowa DOT page; the key points card shows a short label', () => {
  assert.ok(D.isSourced("Iowa Driver's Manual p.12") && D.isSourced('Iowa DOT: Instruction Permit page') && D.isSourced('Iowa DOT: Intermediate License page'));
  assert.ok(!D.isSourced('Iowa DOT') && !D.isSourced('') && !D.isSourced(undefined));
  assert.equal(D.refLabel("Iowa Driver's Manual p.12"), 'Manual p.12');
  assert.equal(D.refLabel('Iowa DOT: Instruction Permit page'), 'Iowa DOT: Instruction Permit page');
  const dotQ = { id: 'x1', q: 'Q?', choices: ['a', 'b'], answer: 0, why: 'w', ref: D.SOURCES.permit.ref, quote: 'z' };
  const L = [{ id: 'L1', title: 'L', videos: [{ yt: 'abcdefghijk', title: 't', min: 3 }], key: [{ t: 'A', ref: D.SOURCES.license.ref, quote: 'q' }, { t: 'B', family: true }], questions: [dotQ] }];
  assert.ok(!D.checkCourse(L).some((e) => /needs a manual page/.test(e)), 'DOT refs pass the course checker');
  assert.ok(D.checkCourse([{ ...L[0], questions: [{ ...dotQ, ref: 'Iowa DOT' }] }]).some((e) => /x1: needs a manual page/.test(e)), 'an unknown source does not');
  const f = (ref) => D.checkTests({ C: [{ id: 'c1', topic: 'Signs', q: 'Q?', choices: ['a', 'b', 'c', 'd'], answer: 0, why: 'w', ref, quote: 'z' }] }, [], ['Signs'], []).some((e) => /c1: needs a manual page/.test(e));
  assert.ok(f(D.SOURCES.permit.ref) && !f("Iowa Driver's Manual p.3"), 'the knowledge-test forms quote the manual only');
});

test('shared-quote report: the same or overlapping quote on one page, across forms and lessons (a report, never a rule)', async () => {
  const r = "Iowa Driver's Manual p.5";
  const forms = { A: [{ id: 'a1', ref: r, quote: 'Always come to a complete stop at a stop sign' }, { id: 'a2', ref: r, quote: 'yield to pedestrians' }],
    B: [{ id: 'b1', ref: r, quote: 'Always come to a complete stop at a stop sign' }, { id: 'b2', ref: "Iowa Driver's Manual p.6", quote: 'yield to pedestrians' }, { id: 'b3', ref: r, quote: 'You must come to a complete stop at a stop sign and look' }]
  };
  const lessons = [{ id: 'L1', key: [{ t: 'k', ref: r, quote: 'yield to pedestrians' }, { t: 'f', family: true }], questions: [{ id: 'L1q1', ref: r, quote: 'yield to pedestrians' }] }];
  const rows = D.quoteReport(forms, lessons).map((x) => x.a + '|' + x.b + '|' + x.kind);
  assert.ok(rows.includes('a1 (form A)|b1 (form B)|same'));
  assert.ok(rows.includes('a1 (form A)|b3 (form B)|overlap'), 'overlapping words count, not just exact quotes');
  assert.ok(rows.includes('a2 (form A)|L1q1 (L1)|same') && rows.includes('a2 (form A)|L1 key 1 (L1)|same'), 'form against lesson');
  assert.ok(!rows.some((x) => /b2/.test(x)), 'a different page is a different fact');
  assert.ok(!rows.includes('L1 key 1 (L1)|L1q1 (L1)|same'), 'a lesson repeating its own key point is not reported');
  const { FORMS } = await import('../driving-tests.js?v=' + V), { LESSONS } = await import('../driving-course.js?v=' + V);
  assert.ok(Array.isArray(D.quoteReport(FORMS, LESSONS)), 'runs on the real course (its rows are in docs/driving-quote-report.md)');
});


test('skill levels: every planned lesson day is beginner, intermediate or advanced (scripts/build-video-plan.py --levels)', async () => {
  const { execFileSync } = await import('node:child_process');
  const out = execFileSync('python3', ['scripts/build-video-plan.py', '--levels'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  assert.match(out, /every lesson day has a level/);
});

// Guessing tells (see guessReport): a hard rule for units 5+ and Forms C+; units 1-4 and Form B are reported until
// reworked (scripts print them); Form A is frozen and exempt by name.
const REPORT_ONLY = [];
test('guessing tells: no length-rank tell, stock filler or padded wrong choice in new units and forms', async () => {
  const { LESSONS } = await import('../driving-course.js?v=' + V), { FORMS } = await import('../driving-tests.js?v=' + V);
  const units = {};
  LESSONS.forEach((l) => { const u = 'unit ' + l.id.match(/^w(\d+)/)[1]; (units[u] = units[u] || []).push(...(l.questions || [])); });
  const groups = [...Object.entries(units), ...Object.entries(FORMS).filter(([f]) => f !== 'A').map(([f, qs]) => ['form ' + f, qs])];
  const hard = groups.filter(([g]) => !REPORT_ONLY.includes(g)).flatMap(([g, qs]) => D.guessReport(g, qs).issues);
  assert.deepEqual(hard, []);
});

test('guessReport finds a rank tell, a filler and a padded choice', () => {
  const mk = (i) => ({ id: 'g' + i, choices: ['Honk at them', 'Right answer here', 'Short', 'x'], answer: 1 });
  const r = D.guessReport('t', [1, 2, 3, 4, 5, 6, 7, 8].map(mk));
  assert.match(r.issues.join(' | '), /same length rank in 100%/);
  assert.match(r.issues.join(' | '), /"honk" opens 8 wrong choices/);
  const pad = D.guessReport('t', [{ id: 'p1', choices: ['Stop', 'Only where two highways cross each other out in the country', 'Go', 'Wait'], answer: 0 }]);
  assert.match(pad.issues.join(' | '), /p1 has a padded wrong choice/);
});

// Lessons 1-2 (w1d1, w1d2) are frozen as of Nov 21, 2026; w1d3-w1d4 and w2d1-w2d2 reworked, checked and pinned Nov 22-23 (last rewords before Eli starts). Like Form A: if this
// fails, put them back; new questions are appended in a later lesson. Pin each later lesson once it is approved.
const PINNED_LESSONS = { 'w1d1,w1d2': 'f9c22886d497ccf2353a2cba75213ba351cb48e33d86d07ffb47c926c9569ad6', 'w1d3,w1d4': '96ad6a9e592a75dcc0b3a7ae21aedbc726bb4c4b3c8f28086382b0fd61904f9d', 'w2d1,w2d2': '613200dc19121b691c4b21185572a183f102b370979112d923320a8b98e90603', 'w2d3,w2d4': '5e1d9e00ac2a489283326f159e23cc0d905fe044d3c94203906b453555f4173a', 'w3d1,w3d2,w3d3,w3d4': 'fa15229b8785d0e705fea8ec77e832593b2c3b8004c17181ee37b2268ca61930', 'w4d1,w4d2,w4d3,w4d4': 'd7f1a38e01a9ba96b431dac3d7903719457801949d5ed6b02e676a2a7d29a1ee' };
test('frozen lessons are unchanged', async () => {
  const { createHash } = await import('node:crypto');
  const { LESSONS } = await import('../driving-course.js?v=' + V);
  Object.entries(PINNED_LESSONS).forEach(([ids, sha]) => {
    const ls = ids.split(',').map((id) => LESSONS.find((l) => l.id === id));
    assert.equal(createHash('sha256').update(JSON.stringify(ls)).digest('hex'), sha, ids);
  });
});

test('driving: a unit test also takes up to 4 never-asked questions from earlier units (oldest first)', () => {
  const C = course(10).map((l) => (l.review ? l : { ...l, questions: [1, 2, 3, 4, 5, 6, 7, 8].map((k) => q(l.id + 'q' + k)) }));
  const p = { approved: {}, done: {}, answers: {} };
  // unit 1: each lesson's q1-q3 asked in its daily quiz; the unit test asks q4-q7 (never asked); q8 is left over
  ['L1', 'L2', 'L3', 'L4'].forEach((id, i) => { [1, 2, 3].forEach((k) => answer(p, id + 'q' + k, id, true, day(i + 1))); p.done[id] = day(i + 1); });
  const u1 = D.unitTestFor(C, 4, p).map((x) => x.id);
  assert.equal(u1.length, 16);
  assert.ok(!u1.some((id) => /q8$/.test(id)), 'unit 1: q8 not asked (only 4 per lesson)');
  u1.forEach((id) => answer(p, id, 'L5', true, day(5))); p.done.L5 = day(5);
  ['L6', 'L7', 'L8', 'L9'].forEach((id, i) => { [1, 2, 3].forEach((k) => answer(p, id + 'q' + k, id, true, day(i + 8))); p.done[id] = day(i + 8); });
  const u2 = D.unitTestFor(C, 9, p).map((x) => x.id);
  assert.equal(u2.length, 20, '16 from unit 2 + 4 never-asked from unit 1');
  assert.deepEqual(u2.slice(16), ['L1q8', 'L2q8', 'L3q8', 'L4q8']);
  // it stays the same while he takes it (his answers in it don't count as "asked" for its own selection)
  u2.slice(0, 18).forEach((id) => answer(p, id, 'L10', true, day(12)));
  assert.deepEqual(D.unitTestFor(C, 9, p).map((x) => x.id), u2);
});

test('lessons in units 5+ have at most 7 questions (3 in the daily quiz + 4 in the unit test), so none go unasked', async () => {
  const { LESSONS } = await import('../driving-course.js?v=' + V);
  const over = LESSONS.filter((l) => Number(l.id.match(/^w(\d+)/)[1]) >= 5 && (l.questions || []).length > 7).map((l) => l.id + ' (' + l.questions.length + ')');
  assert.deepEqual(over, []);
});

// Consecutive forms test different facts: Eli can read every explanation of a finished test ("See every answer"),
// so a later form's answer must not be stated in the form before it (same number on the same page, or its
// explanation saying the answer), and no two consecutive forms quote the same manual words.
test('consecutive knowledge-test forms never repeat a fact or give away the next form’s answers', async () => {
  const { FORMS } = await import('../driving-tests.js?v=' + V);
  const names = Object.keys(FORMS).sort(), page = (q) => q.ref.match(/p\.\s?(\d+)/)[1];
  const nums = (t) => (String(t).match(/\d+(?:\.\d+)?|\.\d+/g) || []).map(Number);
  const bad = [];
  names.slice(1).forEach((f, i) => {
    const prev = FORMS[names[i]], cur = FORMS[f];
    cur.forEach((q) => {
      const ans = q.choices[q.answer], an = nums(ans);
      prev.forEach((p) => {
        if (an.length && page(p) === page(q) && an.some((n) => nums(p.choices[p.answer]).includes(n) || nums(p.why).includes(n))) bad.push(q.id + ' (' + ans + ') repeats ' + p.id);
        if (p.why.toLowerCase().includes(ans.toLowerCase()) && ans.length > 12) bad.push(q.id + ': ' + p.id + '’s explanation states its answer');
      });
    });
    D.quoteReport({ [names[i]]: prev, [f]: cur }, []).filter((r) => /form/.test(r.a) && /form/.test(r.b)).forEach((r) => bad.push(r.a + ' and ' + r.b + ' quote the same words'));
  });
  assert.deepEqual(bad, []);
});

// Form B (progress test 1, opens after unit 2) is final as of Nov 25, 2026: rebuilt, blind-checked, pinned.
test('Form B (progress test 1) is unchanged', async () => {
  const { createHash } = await import('node:crypto');
  const { FORMS } = await import('../driving-tests.js?v=' + V);
  assert.equal(createHash('sha256').update(JSON.stringify(FORMS.B)).digest('hex'), '06dfdc61326cd32f019ed9ab9a57b95b7c05aaeae83dc5bc7a8d3f5798e6779e');
});


// Lone-answer tells (guessReport().lone): a hard rule for units 5+ and Forms C+; pinned units 1-4 and Forms A-B
// are reported only (scripts/guess-report.mjs), since they can't change.
test('no lone-answer tells in new units and forms', async () => {
  const { LESSONS } = await import('../driving-course.js?v=' + V), { FORMS } = await import('../driving-tests.js?v=' + V);
  const isNew = (g) => (/^unit (\d+)/.test(g) && Number(g.split(' ')[1]) >= 5) || (/^form [C-Z]$/.test(g));
  const units = {};
  LESSONS.forEach((l) => { const u = 'unit ' + l.id.match(/^w(\d+)/)[1]; (units[u] = units[u] || []).push(...(l.questions || [])); });
  const groups = [...Object.entries(units), ...Object.entries(FORMS).map(([f, qs]) => ['form ' + f, qs])].filter(([g]) => isNew(g));
  assert.deepEqual(groups.flatMap(([g, qs]) => D.guessReport(g, qs).lone), []);
  const t = D.guessReport('t', [{ id: 'a', choices: ['Yes, if x', 'Yes, if y', 'No', 'Yes, always'], answer: 2 }, { id: 'b', choices: ['Go: now', 'Wait', 'Stop', 'Turn'], answer: 0 }]);
  assert.equal(t.lone.length, 2, 'the check catches a lone "No" and a lone colon');
});
