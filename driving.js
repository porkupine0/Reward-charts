// Eli's driving course: the rules, with no page and no content (content lives in driving-course.js later).
// A lesson is { id, title, review?, videos: [...], questions: [{ id, q, choices, answer, why, ref }] }.
// Progress (stored per lesson and question, never as lists):
//   approved: { lessonId: true | 'skip' }        set by a parent on the preview list
//   done:     { lessonId: 'YYYY-MM-DD' }          the day the lesson was finished
//   answers:  { questionId: { lessonId: { ok, on } } }   one answer per question per lesson; the first counts
// Everything here is deterministic: the same progress always gives the same lesson and the same quiz.

// The lesson for a day: the one finished that day, else the next one in order that a parent approved.
// Skipped lessons are passed over. { lesson, index, status }: 'done' (finished today), 'ready',
// 'waiting' (the next one isn't approved yet) or 'finished' (course over).
export function lessonFor(lessons, progress, dayKey) {
  const p = progress || {}, done = p.done || {}, approved = p.approved || {};
  const today = lessons.findIndex((l) => done[l.id] === dayKey);
  if (today >= 0) return { lesson: lessons[today], index: today, status: 'done' };
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    if (done[l.id] || approved[l.id] === 'skip') continue;
    return { lesson: l, index: i, status: approved[l.id] === true ? 'ready' : 'waiting' };
  }
  return { lesson: null, index: lessons.length, status: 'finished' };
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
// finished lessons). Earlier questions: wrong last time, then not yet right twice since a miss, then least
// recently asked (never asked first), then course order.
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
  pool.sort((a, b) => a.pr - b.pr || (a.last < b.last ? -1 : a.last > b.last ? 1 : 0) || a.li - b.li || a.qi - b.qi);
  const fromBefore = pool.slice(0, size - fromToday.length).map((x) => x.q);
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
  const out = [], seen = new Set();
  lessons.forEach((l, i) => {
    const shouldReview = (i + 1) % 5 === 0;
    if (shouldReview !== !!l.review) out.push(l.id + ': lesson ' + (i + 1) + (shouldReview ? ' should be a review' : ' should not be a review'));
    if (l.review && (l.questions || []).length) out.push(l.id + ': a review has no questions of its own');
    if (!l.review && (l.questions || []).length < 5) out.push(l.id + ': needs at least 5 questions');
    if (!l.review && !(l.videos || []).length) out.push(l.id + ': needs a video');
    (l.questions || []).forEach((q) => {
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
