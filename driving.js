import { checkSign } from './signs.js?v=1795185533';
// Eli's driving course: the rules, with no page and no content (content lives in driving-course.js later).
// A lesson is { id, title, review?, videos: [...], questions: [{ id, q, choices, answer, why, ref }] }.
// Progress (stored per lesson and question, never as lists):
//   approved: { lessonId: 'YYYY-MM-DD' | 'skip:YYYY-MM-DD' } the day a parent approved or skipped it
//             (older entries: true / 'skip')
//   done:     { lessonId: 'YYYY-MM-DD' }          the day the lesson was finished
//   answers:  { questionId: { lessonId: { ok, on } } }   one answer per question per lesson; the first counts
// Everything here is deterministic: the same progress always gives the same lesson and the same quiz.

// The lesson for a day: the one finished that day, else the next one in order that a parent approved.
// A skip only skips the VIDEO: the lesson still runs (its quiz, and its questions come back later), so a
// skip counts like an approval given that day. { lesson, index, status }: 'done' (finished today), 'ready',
// 'waiting' (the next one isn't approved yet) or 'finished' (course over).
export const isApproved = (v) => v === true || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v));
export const isSkipped = (v) => v === 'skip' || (typeof v === 'string' && v.startsWith('skip:'));
const skipDay = (v) => (typeof v === 'string' && v.startsWith('skip:') ? v.slice(5) : '');
// The first lesson of the unit that lesson i belongs to (the lesson after the previous unit test).
const unitStart = (lessons, i) => { let s = i; while (s > 0 && !lessons[s - 1].review) s--; return s; };

export function lessonFor(lessons, progress, dayKey) {
  const p = progress || {}, done = p.done || {}, approved = p.approved || {};
  const today = lessons.findIndex((l) => done[l.id] === dayKey);
  if (today >= 0) return { lesson: lessons[today], index: today, status: 'done' };
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    if (done[l.id]) continue;
    // a unit test has no video to approve: it's ready once a lesson of its own unit is finished (else, e.g.
    // every lesson of the unit skipped, it's passed over: it would have no questions)
    if (l.review) { if (lessons.slice(unitStart(lessons, i), i).some((x) => done[x.id])) return { lesson: l, index: i, status: 'ready' }; continue; }
    return { lesson: l, index: i, status: isApproved(approved[l.id]) || isSkipped(approved[l.id]) ? 'ready' : 'waiting' };
  }
  return { lesson: null, index: lessons.length, status: 'finished' };
}

// Was a lesson due on this day (Mon–Fri)? Rebuilt from the course order, the finish dates and the approval
// dates, so past days can be judged too. { lesson, due: 'required' | 'optional' } or null.
// - The lesson is the first one not finished before that day and not skipped.
// - Approved before that day: required. Approved that same day: optional (a late approval can't break a
//   streak). A review is required once an earlier lesson was finished before that day.
export function dueOn(lessons, progress, dayKey, dow) {
  if (dow > 4) return null;
  const p = progress || {}, done = p.done || {}, approved = p.approved || {};
  const due = (l, how) => ({ lesson: l, due: how });
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    // a skip (the video only) counts like an approval on its day; an old undated skip like an old approval
    const a = isSkipped(approved[l.id]) ? (skipDay(approved[l.id]) || true) : approved[l.id];
    if (done[l.id] && done[l.id] < dayKey) continue;
    if (done[l.id] === dayKey) return { lesson: l, due: 'required' };
    if (l.review) {
      if (lessons.slice(unitStart(lessons, i), i).some((x) => done[x.id] && done[x.id] < dayKey)) return due(l, 'required');
      continue;
    }
    if (a === true || (typeof a === 'string' && isApproved(a) && a < dayKey)) return due(l, 'required');
    if (a === dayKey) return { lesson: l, due: 'optional' };
    return null;
  }
  return null;
}

// A question's history, oldest first, leaving out answers given in `notLesson` (today's lesson), so the
// quiz doesn't change while he's taking it.
function history(progress, qid, notLesson) {
  const per = (((progress || {}).answers || {})[qid]) || {};
  return Object.entries(per).filter(([lid]) => lid !== notLesson).map(([, a]) => a).sort((a, b) => (a.on < b.on ? -1 : a.on > b.on ? 1 : 0));
}
// Review priority: 0 = wrong last time; 1 = not yet right twice in a row since a miss; 2 = otherwise.
function priority(h) {
  if (!h.length) return 2;
  if (!h[h.length - 1].ok) return 0;
  const lastMiss = h.map((a) => a.ok).lastIndexOf(false);
  return lastMiss >= 0 && h.length - 1 - lastMiss < 2 ? 1 : 2;
}

// Today's 5 questions: 3 from this lesson and 2 from lessons already finished (a review lesson: all 5 from
// finished lessons). Earlier questions, in this order: missed ones (wrong last time, then not yet right twice
// since a miss); the newest never-asked question; the least recently asked from two or more lessons back;
// then the rest by least recently asked and course order.
export function quizFor(lessons, index, progress, size = 5) {
  const lesson = lessons[index];
  if (!lesson) return [];
  if (lesson.review) return unitTestFor(lessons, index, progress);
  const done = (progress || {}).done || {};
  const fromToday = lesson.review ? [] : (lesson.questions || []).slice(0, 3);
  const pool = [];
  lessons.forEach((l, li) => {
    if (l.id === lesson.id || !done[l.id]) return;
    (l.questions || []).forEach((q, qi) => { const h = history(progress, q.id, lesson.id); pool.push({ q, li, qi, pr: priority(h), last: h.length ? h[h.length - 1].on : '' }); });
  });
  const byAge = (a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : 0) || a.li - b.li || a.qi - b.qi;
  const room = size - fromToday.length, picked = [];
  const take = (x) => { if (x && picked.length < room && !picked.includes(x)) picked.push(x); };
  pool.filter((x) => x.pr < 2).sort((a, b) => a.pr - b.pr || byAge(a, b)).forEach(take);
  take(pool.filter((x) => !x.last && !picked.includes(x)).sort((a, b) => b.li - a.li || a.qi - b.qi)[0]);
  take(pool.filter((x) => x.li <= index - 2 && !picked.includes(x)).sort(byAge)[0]);
  pool.slice().sort(byAge).forEach(take);
  const fromBefore = picked.map((x) => x.q);
  // too few finished lessons (the first days): fill from this lesson
  const more = (lesson.questions || []).slice(fromToday.length);
  return [...fromToday, ...fromBefore, ...more].slice(0, size);
}

// The unit test (every 5th lesson): PER_LESSON questions from each finished lesson of its unit (the lessons
// since the previous test): never-asked first, then missed ones, then the least recently asked, then course
// order. Answers given in the test itself are left out, so the test stays the same while he takes it.
export const PER_LESSON = 4;
export function unitTestFor(lessons, index, progress) {
  const lesson = lessons[index], done = (progress || {}).done || {};
  if (!lesson) return [];
  const start = unitStart(lessons, index), out = [];
  lessons.slice(start, index).forEach((l) => {
    if (!done[l.id]) return;
    const ranked = (l.questions || []).map((q, qi) => {
      const h = history(progress, q.id, lesson.id);
      return { q, qi, rank: !h.length ? 0 : priority(h) < 2 ? 1 : 2, last: h.length ? h[h.length - 1].on : '' };
    }).sort((a, b) => a.rank - b.rank || (a.last < b.last ? -1 : a.last > b.last ? 1 : 0) || a.qi - b.qi);
    ranked.slice(0, PER_LESSON).sort((a, b) => a.qi - b.qi).forEach((x) => out.push(x.q));
  });
  return out;
}

// Grade answers { questionId: choiceIndex }: { right, total, missed: [questionId] }.
export function grade(quiz, picks) {
  const missed = quiz.filter((q) => (picks || {})[q.id] !== q.answer).map((q) => q.id);
  return { right: quiz.length - missed.length, total: quiz.length, missed };
}

const LIVE_BEFORE_RULE = []; // lessons that went live before this rule (none: Eli hadn't started when it was tightened)
// Check course content before it ships: a list of problems (empty = fine).
export function checkCourse(lessons) {
  const out = [], seen = new Set(), lessonIds = new Set();
  lessons.forEach((l, i) => {
    if (lessonIds.has(l.id)) out.push(l.id + ': lesson id used twice');
    lessonIds.add(l.id);
    const shouldReview = (i + 1) % 5 === 0;
    if (shouldReview !== !!l.review) out.push(l.id + ': lesson ' + (i + 1) + (shouldReview ? ' should be a review' : ' should not be a review'));
    if (l.review && (l.questions || []).length) out.push(l.id + ': a review has no questions of its own');
    if (!l.review && (l.questions || []).length < 5) out.push(l.id + ': needs at least 5 questions');
    if (!/^[A-Za-z0-9]+$/.test(l.id || '')) out.push((l.id || '?') + ': lesson id must be letters and digits');
    if (!l.review && !(l.videos || []).length) out.push(l.id + ': needs a video');
    if (!l.review && (l.key || []).length < 2) out.push(l.id + ': needs at least 2 key points');
    (l.key || []).forEach((x, ki) => {
      if (!x.t) out.push(l.id + ': key point ' + (ki + 1) + ' needs text');
      if (!x.family && !(/^Iowa Driver.s Manual p\.\s?\d+/.test(x.ref || '') && x.quote)) out.push(l.id + ': key point ' + (ki + 1) + ' needs a manual page and quote (or to be marked a family rule)');
    });
    (l.videos || []).forEach((v, vi) => {
      if (!/^[A-Za-z0-9_-]{11}$/.test(v.yt || '')) out.push(l.id + ': video ' + (vi + 1) + ' needs an 11-character YouTube id (yt)');
      if (!v.title || !v.channel || !/^\d{1,2}:\d{2}$/.test(v.len || '')) out.push(l.id + ': video ' + (vi + 1) + ' needs a title, channel and length (m:ss)');
    });
    // answers must not be guessable: spread over the positions, and the right one not usually the longest.
    const qs = l.questions || [];
    if (qs.length >= 5) {
      const per = [0, 1, 2, 3].map((i) => qs.filter((q) => q.answer === i).length);
      if (Math.max(...per) > Math.ceil(qs.length / 2) || (!LIVE_BEFORE_RULE.includes(l.id) && per.filter(Boolean).length < 3)) out.push(l.id + ': right answers bunched in a few positions (' + per.join('/') + ')');
      const longest = qs.filter((q) => (q.choices || []).length > 1 && (q.choices[q.answer] || '').length > Math.max(...q.choices.filter((_, i) => i !== q.answer).map((c) => c.length))).length;
      if (longest > Math.ceil(qs.length / 3)) out.push(l.id + ': the right answer is the longest choice in ' + longest + ' of ' + qs.length + ' questions');
      // nor usually the same length rank (e.g. always the second-longest)
      const ranks = [0, 0, 0, 0];
      qs.forEach((q) => { if ((q.choices || []).length === 4) ranks[q.choices.filter((c) => c.length > (q.choices[q.answer] || '').length).length]++; });
      if (Math.max(...ranks) > Math.ceil(qs.length * 0.6)) out.push(l.id + ': the right answer is usually the same length rank (' + ranks.join('/') + ', longest to shortest)');
    }
    const spots = new Set((l.questions || []).map((q) => q.answer));
    if ((l.questions || []).length >= 3 && spots.size < 2) out.push(l.id + ': the right answer is in the same position every time');
    (l.questions || []).forEach((q) => {
      if (!/^[A-Za-z0-9]+$/.test(q.id || '')) out.push((q.id || '?') + ': question id must be letters and digits');
      if (seen.has(q.id)) out.push(q.id + ': id used twice');
      seen.add(q.id);
      if (!Array.isArray(q.choices) || q.choices.length < 2) out.push(q.id + ': needs choices');
      else if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length)) out.push(q.id + ': answer is not one of the choices');
      if (!q.why) out.push(q.id + ': needs an explanation');
      if (!/^Iowa Driver.s Manual p\.\s?\d+/.test(q.ref || '')) out.push(q.id + ': needs a manual page (Iowa Driver\'s Manual p.N)');
      out.push(...checkSign(q.id, q.sign));
    });
  });
  return out;
}

// ---- knowledge tests (driving-tests.js): fixed forms, scored overall and per topic ----
// A sitting's score, from answers/<question>/<sitting>: { answered, right, total, done, pct, passed, byTopic }.
// byTopic: [{ topic, right, total }] in the form's topic order.
export function testScore(form, progress, sittingId, pass = 0.8) {
  const ans = (progress || {}).answers || {};
  const got = (form || []).map((x) => (ans[x.id] || {})[sittingId]).filter(Boolean);
  const right = (form || []).filter((x) => ((ans[x.id] || {})[sittingId] || {}).ok).length;
  const total = (form || []).length, done = total > 0 && got.length === total;
  const byTopic = [];
  (form || []).forEach((x) => {
    let t = byTopic.find((b) => b.topic === x.topic);
    if (!t) byTopic.push((t = { topic: x.topic, right: 0, total: 0 }));
    t.total++;
    if (((ans[x.id] || {})[sittingId] || {}).ok) t.right++;
  });
  const pct = total ? Math.round((100 * right) / total) : 0;
  return { answered: got.length, right, total, done, pct, passed: done && right / total >= pass, byTopic };
}
// The day a sitting was finished: its last answer's day (null while unfinished).
export function testDoneOn(form, progress, sittingId) {
  const ans = (progress || {}).answers || {};
  const got = (form || []).map((x) => (ans[x.id] || {})[sittingId]).filter(Boolean);
  return got.length && got.length === (form || []).length ? got.map((a) => a.on).sort().pop() : null;
}
// Sittings open on this day: from its date, and (if it names one) once that lesson is finished.
export function openSittings(sittings, progress, dayKey) {
  const done = (progress || {}).done || {};
  return (sittings || []).filter((s) => (!s.from || s.from <= dayKey) && (!s.after || (done[s.after] && done[s.after] <= dayKey)));
}
// Check the test bank: ids unique (also against the lessons), topics known, answers valid, a page per question.
// Each form: the blueprint's count per topic, 4 choices per question, right answers spread evenly over the
// four positions (never more than 3 in a row), and the right answer not often the longest choice.
export function checkTests(forms, sittings, topics, lessons, blueprint) {
  const out = [], seen = new Set((lessons || []).flatMap((l) => (l.questions || []).map((x) => x.id)));
  const stem = (x) => String(x.q || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const stems = new Map((lessons || []).flatMap((l) => (l.questions || []).map((x) => [stem(x), x.id])));
  Object.entries(forms || {}).forEach(([name, form]) => {
    form.forEach((x) => { const k = stem(x); if (stems.has(k)) out.push(x.id + ': same question as ' + stems.get(k)); stems.set(k, x.id); });
    if (name !== 'A' && Math.abs(form.filter((x) => x.num).length - 9) > 1) out.push('form ' + name + ': ' + form.filter((x) => x.num).length + ' number questions (Form A has 9)');
    if (form.length !== 25) out.push('form ' + name + ': ' + form.length + ' questions (should be 25)');
    if (blueprint) Object.entries(blueprint).forEach(([t, n]) => { const c = form.filter((x) => x.topic === t).length; if (c !== n) out.push('form ' + name + ': ' + c + ' ' + t + ' questions (blueprint says ' + n + ')'); });
    if (form.some((x) => (x.choices || []).length !== 4)) out.push('form ' + name + ': every question needs 4 choices');
    const per = [0, 1, 2, 3].map((i) => form.filter((x) => x.answer === i).length), even = form.length / 4;
    if (per.some((c) => c < Math.floor(even) - 1 || c > Math.ceil(even) + 1)) out.push('form ' + name + ': right answers not spread evenly (' + per.join('/') + ')');
    let run = 1;
    form.forEach((x, i) => { run = i && x.answer === form[i - 1].answer ? run + 1 : 1; if (run === 4) out.push('form ' + name + ': 4 right answers in a row in the same position (' + x.id + ')'); });
    const longest = form.filter((x) => (x.choices || []).length && (x.choices[x.answer] || '').length > Math.max(...x.choices.filter((_, i) => i !== x.answer).map((c) => c.length))).length;
    if (longest > Math.ceil(form.length / 4)) out.push('form ' + name + ': the right answer is the longest choice ' + longest + ' times');
    const ranks = [0, 0, 0, 0];
    form.forEach((x) => { if ((x.choices || []).length === 4) ranks[x.choices.filter((c) => c.length > (x.choices[x.answer] || '').length).length]++; });
    if (Math.max(...ranks) > Math.ceil(form.length * 0.6)) out.push('form ' + name + ': the right answer is usually the same length rank (' + ranks.join('/') + ')');
    form.forEach((x) => {
      if (!/^[A-Za-z0-9]+$/.test(x.id || '')) out.push((x.id || '?') + ': question id must be letters and digits');
      if (seen.has(x.id)) out.push(x.id + ': id used twice');
      seen.add(x.id);
      if (!(topics || []).includes(x.topic)) out.push(x.id + ': unknown topic ' + x.topic);
      if (!Array.isArray(x.choices) || x.choices.length < 2) out.push(x.id + ': needs choices');
      else if (!(Number.isInteger(x.answer) && x.answer >= 0 && x.answer < x.choices.length)) out.push(x.id + ': answer is not one of the choices');
      if (!x.why) out.push(x.id + ': needs an explanation');
      if (!/^Iowa Driver.s Manual p\.\s?\d+/.test(x.ref || '')) out.push(x.id + ': needs a manual page');
      out.push(...checkSign(x.id, x.sign));
    });
  });
  const ids = new Set((lessons || []).map((l) => l.id));
  (sittings || []).forEach((s) => {
    if (!/^[A-Za-z0-9]+$/.test(s.id || '')) out.push((s.id || '?') + ': sitting id must be letters and digits');
    if (ids.has(s.id)) out.push(s.id + ': sitting id is also a lesson id');
    ids.add(s.id);
    if (!(forms || {})[s.form]) out.push(s.id + ': unknown form ' + s.form);
    if (s.after && !(lessons || []).some((l) => l.id === s.after)) out.push(s.id + ': after names no lesson');
  });
  return out;
}
