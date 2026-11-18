// Eli's driving course: the rules, with no page and no content (content lives in driving-course.js later).
// A lesson is { id, title, review?, videos: [...], questions: [{ id, q, choices, answer, why, ref }] }.
// Progress (stored per lesson and question, never as lists):
//   approved: { lessonId: 'YYYY-MM-DD' | 'skip:YYYY-MM-DD' } the day a parent approved or skipped it
//             (older entries: true / 'skip')
//   done:     { lessonId: 'YYYY-MM-DD' }          the day the lesson was finished
//   answers:  { questionId: { lessonId: { ok, on } } }   one answer per question per lesson; the first counts
// Everything here is deterministic: the same progress always gives the same lesson and the same quiz.

// The lesson for a day: the one finished that day, else the next one in order that a parent approved.
// Skipped lessons are passed over. { lesson, index, status }: 'done' (finished today), 'ready',
// 'waiting' (the next one isn't approved yet) or 'finished' (course over).
export const isApproved = (v) => v === true || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v));
export const isSkipped = (v) => v === 'skip' || (typeof v === 'string' && v.startsWith('skip:'));
const skipDay = (v) => (typeof v === 'string' && v.startsWith('skip:') ? v.slice(5) : '');
export function lessonFor(lessons, progress, dayKey) {
  const p = progress || {}, done = p.done || {}, approved = p.approved || {};
  const today = lessons.findIndex((l) => done[l.id] === dayKey);
  if (today >= 0) return { lesson: lessons[today], index: today, status: 'done' };
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    if (done[l.id] || isSkipped(approved[l.id])) continue;
    // a review has no video to approve: it's ready once any lesson before it is finished (else passed over)
    if (l.review) { if (lessons.slice(0, i).some((x) => done[x.id])) return { lesson: l, index: i, status: 'ready' }; continue; }
    return { lesson: l, index: i, status: isApproved(approved[l.id]) ? 'ready' : 'waiting' };
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
  let soft = false; // a lesson was skipped that same day: the next one is only optional that day
  const due = (l, how) => ({ lesson: l, due: soft ? 'optional' : how });
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i], a = approved[l.id];
    if (done[l.id] && done[l.id] < dayKey) continue;
    if (isSkipped(a)) {
      const sd = skipDay(a);
      if (sd && dayKey < sd) return null; // before it was skipped, it still blocked (waiting)
      if (sd === dayKey) soft = true;
      continue;
    }
    if (done[l.id] === dayKey) return { lesson: l, due: 'required' };
    if (l.review) {
      if (lessons.slice(0, i).some((x) => done[x.id] && done[x.id] < dayKey)) return due(l, 'required');
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

// Grade answers { questionId: choiceIndex }: { right, total, missed: [questionId] }.
export function grade(quiz, picks) {
  const missed = quiz.filter((q) => (picks || {})[q.id] !== q.answer).map((q) => q.id);
  return { right: quiz.length - missed.length, total: quiz.length, missed };
}

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
    (l.videos || []).forEach((v, vi) => {
      if (!/^[A-Za-z0-9_-]{11}$/.test(v.yt || '')) out.push(l.id + ': video ' + (vi + 1) + ' needs an 11-character YouTube id (yt)');
      if (!v.title || !v.channel || !/^\d{1,2}:\d{2}$/.test(v.len || '')) out.push(l.id + ': video ' + (vi + 1) + ' needs a title, channel and length (m:ss)');
    });
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
    });
  });
  return out;
}
